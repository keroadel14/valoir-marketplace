using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Valoir.Application.Common.Interfaces;
using Valoir.Domain.Entities;
using Valoir.Infrastructure.Persistence;

namespace Valoir.Infrastructure.Services;

/// <summary>
/// Outbox worker with PostgreSQL SKIP LOCKED claim + lease-token fencing on finalize.
/// Stale workers that lose the lease cannot mark Completed/Failed (conditional UPDATE).
/// </summary>
public class OutboxProcessor : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<OutboxProcessor> _logger;
    private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(3);
    private const int BatchSize = 20;

    public OutboxProcessor(IServiceScopeFactory scopeFactory, ILogger<OutboxProcessor> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("OutboxProcessor started (lease={Lease})", OutboxMessage.ProcessingLease);
        while (!stoppingToken.IsCancellationRequested)
        {
            try { await ProcessBatchAsync(stoppingToken); }
            catch (Exception ex) when (ex is not OperationCanceledException)
            { _logger.LogError(ex, "OutboxProcessor unhandled error"); }

            try { await Task.Delay(PollInterval, stoppingToken); }
            catch (OperationCanceledException) { break; }
        }
        _logger.LogInformation("OutboxProcessor stopped");
    }

    private async Task ProcessBatchAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ValoirDbContext>();
        var stripe = scope.ServiceProvider.GetRequiredService<IStripeConnectService>();
        var now = DateTime.UtcNow;
        var staleBefore = now - OutboxMessage.ProcessingLease;
        var isNpgsql = db.Database.ProviderName?.Contains("Npgsql", StringComparison.OrdinalIgnoreCase) == true;

        // (messageId, leaseToken)
        var claimed = new List<(Guid Id, Guid Token)>();

        await using (var tx = await db.Database.BeginTransactionAsync(ct))
        {
            List<OutboxMessage> candidates;
            if (isNpgsql)
            {
                candidates = await db.OutboxMessages
                    .FromSqlRaw(
                        """
                        SELECT "Id", "CreatedAt", "UpdatedAt", "RowVersion",
                               "Type", "PayloadJson", "IdempotencyKey", "Status",
                               "AttemptCount", "ProcessedAt", "LastError", "NextAttemptAt",
                               "ProcessingStartedAt", "LeaseToken"
                        FROM "OutboxMessages"
                        WHERE (
                                ("Status" = {0} AND ("NextAttemptAt" IS NULL OR "NextAttemptAt" <= {1}))
                             OR ("Status" = {2} AND "ProcessingStartedAt" IS NOT NULL AND "ProcessingStartedAt" <= {3})
                              )
                        ORDER BY "CreatedAt"
                        LIMIT {4}
                        FOR UPDATE SKIP LOCKED
                        """,
                        (int)OutboxStatus.Pending, now,
                        (int)OutboxStatus.Processing, staleBefore,
                        BatchSize)
                    .ToListAsync(ct);
            }
            else
            {
                candidates = await db.OutboxMessages
                    .Where(m =>
                        (m.Status == OutboxStatus.Pending && (m.NextAttemptAt == null || m.NextAttemptAt <= now))
                        || (m.Status == OutboxStatus.Processing && m.ProcessingStartedAt != null && m.ProcessingStartedAt <= staleBefore))
                    .OrderBy(m => m.CreatedAt)
                    .Take(BatchSize)
                    .ToListAsync(ct);
            }

            if (candidates.Count == 0)
            {
                await tx.CommitAsync(ct);
                return;
            }

            foreach (var msg in candidates)
            {
                var token = msg.Claim();
                claimed.Add((msg.Id, token));
            }

            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
        }

        foreach (var (id, token) in claimed)
        {
            var msg = await db.OutboxMessages.AsNoTracking().FirstOrDefaultAsync(m => m.Id == id, ct);
            if (msg is null) continue;

            try
            {
                // Work outside DB locks
                await DispatchAsync(msg, stripe, scope.ServiceProvider, ct);

                var finalized = await TryFinalizeAsync(db, id, token, completed: true, error: null, ct);
                if (!finalized)
                {
                    _logger.LogWarning(
                        "Outbox {Id} completed externally but lease lost (token={Token}); another worker owns it",
                        id, token);
                }
                else
                {
                    _logger.LogInformation("Outbox {Id} type={Type} completed attempts={Attempts}",
                        id, msg.Type, msg.AttemptCount);
                }
            }
            catch (Exception ex)
            {
                var finalized = await TryFinalizeAsync(db, id, token, completed: false, error: ex.Message, ct);
                if (!finalized)
                {
                    _logger.LogWarning(
                        "Outbox {Id} failed but lease lost (token={Token}); not updating retry state",
                        id, token);
                }
                else
                {
                    _logger.LogWarning(ex, "Outbox {Id} type={Type} failed attempt={Attempts}",
                        id, msg.Type, msg.AttemptCount);
                }
            }
        }
    }

    /// <summary>
    /// Conditional finalize: only updates if LeaseToken still matches (fencing).
    /// Returns false if ownership was lost (stale worker).
    /// </summary>
    public static async Task<bool> TryFinalizeAsync(
        ValoirDbContext db, Guid id, Guid leaseToken, bool completed, string? error, CancellationToken ct)
    {
        if (completed)
        {
            // Conditional UPDATE – zero rows means lost lease
            var rows = await db.Database.ExecuteSqlRawAsync(
                """
                UPDATE "OutboxMessages"
                SET "Status" = {0},
                    "ProcessedAt" = {1},
                    "LastError" = NULL,
                    "ProcessingStartedAt" = NULL,
                    "LeaseToken" = NULL,
                    "UpdatedAt" = {1}
                WHERE "Id" = {2}
                  AND "LeaseToken" = {3}
                  AND "Status" = {4}
                """,
                (int)OutboxStatus.Completed,
                DateTime.UtcNow,
                id,
                leaseToken,
                (int)OutboxStatus.Processing);
            return rows == 1;
        }

        // Failure path: need current AttemptCount to decide DeadLetter vs Pending
        var attempt = await db.OutboxMessages.AsNoTracking()
            .Where(m => m.Id == id && m.LeaseToken == leaseToken && m.Status == OutboxStatus.Processing)
            .Select(m => (int?)m.AttemptCount)
            .FirstOrDefaultAsync(ct);

        if (attempt is null)
            return false; // lost lease or already finalized

        var truncated = error is { Length: > 2000 } ? error[..2000] : error;
        if (attempt >= 8)
        {
            var rows = await db.Database.ExecuteSqlRawAsync(
                """
                UPDATE "OutboxMessages"
                SET "Status" = {0},
                    "LastError" = {1},
                    "ProcessingStartedAt" = NULL,
                    "LeaseToken" = NULL,
                    "UpdatedAt" = {2}
                WHERE "Id" = {3}
                  AND "LeaseToken" = {4}
                  AND "Status" = {5}
                """,
                (int)OutboxStatus.DeadLetter,
                truncated ?? string.Empty,
                DateTime.UtcNow,
                id,
                leaseToken,
                (int)OutboxStatus.Processing);
            return rows == 1;
        }

        var nextAttempt = DateTime.UtcNow.Add(TimeSpan.FromSeconds(Math.Pow(2, Math.Min(attempt.Value, 8))));
        var rowsPending = await db.Database.ExecuteSqlRawAsync(
            """
            UPDATE "OutboxMessages"
            SET "Status" = {0},
                "LastError" = {1},
                "NextAttemptAt" = {2},
                "ProcessingStartedAt" = NULL,
                "LeaseToken" = NULL,
                "UpdatedAt" = {3}
            WHERE "Id" = {4}
              AND "LeaseToken" = {5}
              AND "Status" = {6}
            """,
            (int)OutboxStatus.Pending,
            truncated ?? string.Empty,
            nextAttempt,
            DateTime.UtcNow,
            id,
            leaseToken,
            (int)OutboxStatus.Processing);
        return rowsPending == 1;
    }

    private static async Task DispatchAsync(
        OutboxMessage msg, IStripeConnectService stripe, IServiceProvider sp, CancellationToken ct)
    {
        switch (msg.Type)
        {
            case OutboxTypes.StripeTransfer:
            {
                var p = JsonSerializer.Deserialize<StripeTransferPayload>(msg.PayloadJson)
                    ?? throw new InvalidOperationException("Invalid StripeTransfer payload");
                var transferId = await stripe.CreateTransferAsync(
                    p.DestinationAccountId, p.AmountCents, p.Currency,
                    p.TransferGroup, msg.IdempotencyKey ?? p.IdempotencyKey, ct);
                if (p.VendorOrderId.HasValue)
                {
                    var db = sp.GetRequiredService<ValoirDbContext>();
                    var vo = await db.VendorOrders.FirstOrDefaultAsync(v => v.Id == p.VendorOrderId.Value, ct);
                    vo?.AttachTransfer(transferId);
                    await db.SaveChangesAsync(ct);
                }
                break;
            }
            case OutboxTypes.StripeRefund:
            {
                var p = JsonSerializer.Deserialize<StripeRefundPayload>(msg.PayloadJson)
                    ?? throw new InvalidOperationException("Invalid StripeRefund payload");
                _ = await stripe.CreateRefundAsync(
                    p.PaymentIntentId, p.AmountCents, p.Reason,
                    msg.IdempotencyKey ?? p.IdempotencyKey, ct);
                break;
            }
            case OutboxTypes.StripeTransferReversal:
            {
                var p = JsonSerializer.Deserialize<StripeReversalPayload>(msg.PayloadJson)
                    ?? throw new InvalidOperationException("Invalid StripeReversal payload");
                _ = await stripe.CreateTransferReversalAsync(
                    p.TransferId, p.AmountCents, msg.IdempotencyKey ?? p.IdempotencyKey, ct);
                break;
            }
            case OutboxTypes.SignalRNotify:
            {
                var p = JsonSerializer.Deserialize<SignalRNotifyPayload>(msg.PayloadJson)
                    ?? throw new InvalidOperationException("Invalid SignalR payload");
                var notifier = sp.GetService<IRealtimeNotifier>();
                if (notifier is not null)
                    await notifier.PublishAsync(p.EventName, p.Group, p.PayloadJson, ct);
                break;
            }
            default:
                throw new InvalidOperationException($"Unknown outbox type: {msg.Type}");
        }
    }
}

public static class OutboxTypes
{
    public const string StripeTransfer = "stripe.transfer";
    public const string StripeRefund = "stripe.refund";
    public const string StripeTransferReversal = "stripe.transfer_reversal";
    public const string SignalRNotify = "signalr.notify";
}

public record StripeTransferPayload(
    string DestinationAccountId, long AmountCents, string Currency,
    string? TransferGroup, string? IdempotencyKey, Guid? VendorOrderId);

public record StripeRefundPayload(
    string PaymentIntentId, long? AmountCents, string? Reason, string? IdempotencyKey);

public record StripeReversalPayload(
    string TransferId, long? AmountCents, string? IdempotencyKey);

public record SignalRNotifyPayload(string EventName, string Group, string PayloadJson);

public interface IRealtimeNotifier
{
    Task PublishAsync(string eventName, string group, string payloadJson, CancellationToken ct = default);
}
