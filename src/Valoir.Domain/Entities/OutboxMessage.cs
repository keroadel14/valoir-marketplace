using Valoir.Domain.Common;

namespace Valoir.Domain.Entities;

public enum OutboxStatus
{
    Pending = 0,
    Processing = 1,
    Completed = 2,
    Failed = 3,
    DeadLetter = 4
}

/// <summary>
/// Transactional outbox message with lease-token fencing.
/// Claim assigns a unique LeaseToken; finalization must present the same token
/// so a stale worker cannot overwrite state after another worker reclaimed the row.
/// </summary>
public class OutboxMessage : BaseEntity
{
    /// <summary>
    /// Lease length before another worker may reclaim a Processing message.
    /// 10 minutes covers typical Stripe API latency + retries without holding DB locks.
    /// External side-effects still use Stripe idempotency keys (at-least-once delivery).
    /// </summary>
    public static readonly TimeSpan ProcessingLease = TimeSpan.FromMinutes(10);

    public string Type { get; private set; } = null!;
    public string PayloadJson { get; private set; } = null!;
    public string? IdempotencyKey { get; private set; }
    public OutboxStatus Status { get; private set; } = OutboxStatus.Pending;
    public int AttemptCount { get; private set; }
    public DateTime? ProcessedAt { get; private set; }
    public string? LastError { get; private set; }
    public DateTime? NextAttemptAt { get; private set; }
    public DateTime? ProcessingStartedAt { get; private set; }
    /// <summary>Fencing token issued on each successful claim. Required for finalize.</summary>
    public Guid? LeaseToken { get; private set; }

    private OutboxMessage() { }

    public static OutboxMessage Create(string type, string payloadJson, string? idempotencyKey = null)
    {
        return new OutboxMessage
        {
            Type = type,
            PayloadJson = payloadJson,
            IdempotencyKey = idempotencyKey,
            Status = OutboxStatus.Pending,
            NextAttemptAt = DateTime.UtcNow
        };
    }

    /// <summary>Claim ownership: new lease token, Processing status, attempt++.</summary>
    public Guid Claim()
    {
        var token = Guid.NewGuid();
        Status = OutboxStatus.Processing;
        AttemptCount++;
        ProcessingStartedAt = DateTime.UtcNow;
        LeaseToken = token;
        LastError = null;
        Touch();
        return token;
    }

    /// <summary>In-memory transition used only when caller already verified LeaseToken ownership in DB.</summary>
    public void ApplyCompleted()
    {
        Status = OutboxStatus.Completed;
        ProcessedAt = DateTime.UtcNow;
        LastError = null;
        ProcessingStartedAt = null;
        LeaseToken = null;
        Touch();
    }

    /// <summary>In-memory transition used only when caller already verified LeaseToken ownership in DB.</summary>
    public void ApplyFailed(string error, TimeSpan? retryDelay = null)
    {
        LastError = error.Length > 2000 ? error[..2000] : error;
        ProcessingStartedAt = null;
        LeaseToken = null;
        if (AttemptCount >= 8)
        {
            Status = OutboxStatus.DeadLetter;
        }
        else
        {
            Status = OutboxStatus.Pending;
            NextAttemptAt = DateTime.UtcNow.Add(retryDelay ?? TimeSpan.FromSeconds(Math.Pow(2, Math.Min(AttemptCount, 8))));
        }
        Touch();
    }

    public bool IsStaleProcessing(DateTime utcNow, TimeSpan? lease = null)
        => Status == OutboxStatus.Processing
           && ProcessingStartedAt.HasValue
           && utcNow - ProcessingStartedAt.Value >= (lease ?? ProcessingLease);

    // Legacy names kept for existing unit tests – map to Claim/Apply*
    public void MarkProcessing() => Claim();
    public void MarkCompleted() => ApplyCompleted();
    public void MarkFailed(string error, TimeSpan? retryDelay = null) => ApplyFailed(error, retryDelay);
}
