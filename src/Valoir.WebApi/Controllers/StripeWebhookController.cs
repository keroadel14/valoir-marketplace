using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Valoir.Application.Common.Interfaces;
using Valoir.Domain.Entities;
using Valoir.Domain.Enums;
using Valoir.Infrastructure.Persistence;
using Valoir.Infrastructure.Services;

namespace Valoir.WebApi.Controllers;

[ApiController]
[Route("api/v1/webhooks/stripe")]
[AllowAnonymous]
public class StripeWebhookController : ControllerBase
{
    private readonly ValoirDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<StripeWebhookController> _logger;
    private readonly IInventoryReservationService _inventory;

    public StripeWebhookController(
        ValoirDbContext db,
        IConfiguration config,
        ILogger<StripeWebhookController> logger,
        IInventoryReservationService inventory)
    {
        _db = db;
        _config = config;
        _logger = logger;
        _inventory = inventory;
    }

    [HttpPost]
    public async Task<IActionResult> Handle(CancellationToken ct)
    {
        var json = await new StreamReader(Request.Body).ReadToEndAsync(ct);
        var signature = Request.Headers["Stripe-Signature"].ToString();
        var webhookSecret = _config["Stripe:WebhookSecret"]
            ?? Environment.GetEnvironmentVariable("STRIPE_WEBHOOK_SECRET");

        // Signature verification when secret configured; reject invalid
        if (!string.IsNullOrWhiteSpace(webhookSecret))
        {
            try
            {
                // Stripe.NET construct event validates signature
                var stripeEvent = Stripe.EventUtility.ConstructEvent(json, signature, webhookSecret);
                return await ProcessEventAsync(stripeEvent.Id, stripeEvent.Type, stripeEvent, ct);
            }
            catch (Stripe.StripeException ex)
            {
                _logger.LogWarning(ex, "Stripe webhook signature verification failed");
                return BadRequest(new { error = "Invalid signature" });
            }
        }

        // Dev/mock path: parse JSON without signature (no secret configured)
        _logger.LogWarning("Stripe webhook secret not configured – accepting unsigned payload (dev only)");
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;
        var eventId = root.TryGetProperty("id", out var idEl) ? idEl.GetString() ?? Guid.NewGuid().ToString("N") : Guid.NewGuid().ToString("N");
        var eventType = root.TryGetProperty("type", out var typeEl) ? typeEl.GetString() ?? "unknown" : "unknown";
        return await ProcessEventAsync(eventId, eventType, root, ct);
    }

    private async Task<IActionResult> ProcessEventAsync(string eventId, string eventType, object payload, CancellationToken ct)
    {
        // Single transaction: claim EventId (unique) + business effects commit together.
        // Concurrent duplicates: unique index rejects the second insert → no double side-effects.
        await using var tx = await _db.Database.BeginTransactionAsync(ct);
        try
        {
            _db.ProcessedStripeEvents.Add(ProcessedStripeEvent.Create(eventId, eventType, "ok"));
            await _db.SaveChangesAsync(ct); // fails immediately on duplicate EventId

            switch (eventType)
            {
                case "payment_intent.succeeded":
                    await OnPaymentSucceededAsync(payload, ct);
                    break;
                case "payment_intent.payment_failed":
                    await OnPaymentFailedAsync(payload, ct);
                    break;
                case "account.updated":
                    await OnAccountUpdatedAsync(payload, ct);
                    break;
                default:
                    _logger.LogInformation("Unhandled Stripe event type {Type}", eventType);
                    break;
            }

            await _db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
            return Ok(new { status = "processed" });
        }
        catch (DbUpdateException)
        {
            await tx.RollbackAsync(ct);
            // Unique EventId violation or other constraint – treat as already processed
            if (await _db.ProcessedStripeEvents.AsNoTracking().AnyAsync(e => e.EventId == eventId, ct))
            {
                _logger.LogInformation("Duplicate Stripe event {EventId} ignored (constraint)", eventId);
                return Ok(new { status = "duplicate" });
            }
            throw;
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync(ct);
            _logger.LogError(ex, "Error processing Stripe event {EventId} type={Type}", eventId, eventType);
            // Transient → 500 so Stripe retries. Do NOT mark processed.
            return StatusCode(500);
        }
    }

    private async Task OnPaymentSucceededAsync(object payload, CancellationToken ct)
    {
        var piId = ExtractPaymentIntentId(payload);
        if (string.IsNullOrEmpty(piId)) return;

        var order = await _db.Orders
            .Include(o => o.VendorOrders)
            .FirstOrDefaultAsync(o => o.StripePaymentIntentId == piId, ct);
        if (order is null)
        {
            _logger.LogWarning("No order for PaymentIntent {PiId}", piId);
            return;
        }

        if (order.Status == OrderStatus.Paid || order.Status == OrderStatus.Processing)
            return; // already handled

        order.MarkPaid();
        await _inventory.ReleaseByOrderAsync(order.Id, ct); // confirm path: release hold records after confirm sale ideally
        // Confirm inventory was already reserved; confirm each reservation
        var reservations = await _db.InventoryReservations
            .Where(r => r.OrderId == order.Id && !r.IsConfirmed && !r.IsReleased)
            .ToListAsync(ct);
        foreach (var r in reservations)
            await _inventory.ConfirmAsync(r.Id, ct);

        // Enqueue transfers per vendor order via Outbox
        foreach (var vo in order.VendorOrders)
        {
            var boutique = await _db.Boutiques.AsNoTracking().FirstOrDefaultAsync(b => b.Id == vo.BoutiqueId, ct);
            if (boutique?.StripeAccountId is null) continue;
            if (boutique.PayoutHoldEnabled) continue;

            var amountCents = (long)(vo.VendorNetPayout * 100);
            if (amountCents <= 0) continue;
            var key = $"xfer-{vo.Id:N}-{amountCents}";
            var payloadJson = JsonSerializer.Serialize(new StripeTransferPayload(
                boutique.StripeAccountId, amountCents, "usd", order.OrderNumber, key, vo.Id));
            _db.OutboxMessages.Add(OutboxMessage.Create(OutboxTypes.StripeTransfer, payloadJson, key));

            // Ledger sale entry
            _db.VendorLedgerEntries.Add(VendorLedgerEntry.Create(
                vo.BoutiqueId, LedgerTransactionType.Sale, vo.Subtotal, vo.Id, order.Id,
                notes: "Sale", idempotencyKey: $"ledger-sale-{vo.Id:N}"));
            _db.VendorLedgerEntries.Add(VendorLedgerEntry.Create(
                vo.BoutiqueId, LedgerTransactionType.Commission, -vo.CommissionAmount, vo.Id, order.Id,
                notes: "Platform commission", idempotencyKey: $"ledger-comm-{vo.Id:N}"));
        }

        // SaveChanges deferred to ProcessEventAsync transaction
    }

    private async Task OnPaymentFailedAsync(object payload, CancellationToken ct)
    {
        var piId = ExtractPaymentIntentId(payload);
        if (string.IsNullOrEmpty(piId)) return;

        var order = await _db.Orders.FirstOrDefaultAsync(o => o.StripePaymentIntentId == piId, ct);
        if (order is null) return;
        if (order.Status is OrderStatus.Paid or OrderStatus.Refunded) return;

        order.MarkFailedOrCancelled();
        await _inventory.ReleaseByOrderAsync(order.Id, ct);
        // SaveChanges deferred to ProcessEventAsync transaction
    }

    private async Task OnAccountUpdatedAsync(object payload, CancellationToken ct)
    {
        string? accountId = null;
        bool detailsSubmitted = false, chargesEnabled = false, payoutsEnabled = false;

        if (payload is Stripe.Event stripeEvent && stripeEvent.Data.Object is Stripe.Account acct)
        {
            accountId = acct.Id;
            detailsSubmitted = acct.DetailsSubmitted;
            chargesEnabled = acct.ChargesEnabled;
            payoutsEnabled = acct.PayoutsEnabled;
        }
        else if (payload is JsonElement el)
        {
            if (el.TryGetProperty("data", out var data) && data.TryGetProperty("object", out var obj))
            {
                accountId = obj.TryGetProperty("id", out var id) ? id.GetString() : null;
                detailsSubmitted = obj.TryGetProperty("details_submitted", out var ds) && ds.GetBoolean();
                chargesEnabled = obj.TryGetProperty("charges_enabled", out var ce) && ce.GetBoolean();
                payoutsEnabled = obj.TryGetProperty("payouts_enabled", out var pe) && pe.GetBoolean();
            }
        }

        if (string.IsNullOrEmpty(accountId)) return;

        var boutique = await _db.Boutiques.FirstOrDefaultAsync(b => b.StripeAccountId == accountId, ct);
        if (boutique is null) return;
        boutique.UpdateStripeStatus(accountId, detailsSubmitted, chargesEnabled, payoutsEnabled);
        // SaveChanges deferred to ProcessEventAsync transaction
    }

    private static string? ExtractPaymentIntentId(object payload)
    {
        if (payload is Stripe.Event ev && ev.Data.Object is Stripe.PaymentIntent pi)
            return pi.Id;
        if (payload is JsonElement el)
        {
            if (el.TryGetProperty("data", out var data) && data.TryGetProperty("object", out var obj)
                && obj.TryGetProperty("id", out var id))
                return id.GetString();
        }
        return null;
    }
}
