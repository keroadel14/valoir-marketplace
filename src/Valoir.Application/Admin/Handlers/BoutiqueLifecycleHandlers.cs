using MediatR;
using Microsoft.EntityFrameworkCore;
using Valoir.Application.Admin.Commands;
using Valoir.Application.Common.Interfaces;
using Valoir.Domain.Entities;
using Valoir.Domain.Enums;
using Valoir.Domain.Exceptions;
using Valoir.Application.Admin.Handlers;


namespace Valoir.Application.Admin.Handlers;

public class ApproveBoutiqueHandler : IRequestHandler<ApproveBoutiqueCommand>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAdminAuditService _audit;

    public ApproveBoutiqueHandler(IValoirDbContext db, ICurrentUserService currentUser, IAdminAuditService audit)
    {
        _db = db;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task Handle(ApproveBoutiqueCommand request, CancellationToken ct)
    {
        var adminId = _currentUser.UserId ?? throw new DomainException("Unauthenticated admin.");
        var boutique = await _db.Boutiques.FirstOrDefaultAsync(b => b.Id == request.BoutiqueId, ct)
            ?? throw new DomainException("Boutique not found.");

        var previous = new { boutique.Status, boutique.ApprovedAt };
        boutique.Approve(adminId);
        OutboxNotify.EnqueueAdminEvent(_db, "ReceiveBoutiqueStatusChanged",
            new { BoutiqueId = boutique.Id, Status = boutique.Status.ToString(), Action = "Approve" });
        await _db.SaveChangesAsync(ct);

        await _audit.LogAsync(
            action: "Boutique.Approve",
            targetType: nameof(Boutique),
            targetId: boutique.Id,
            previousValue: previous,
            newValue: new { boutique.Status, boutique.ApprovedAt },
            reason: request.Notes,
            ct: ct);
    }
}

public class SuspendBoutiqueHandler : IRequestHandler<SuspendBoutiqueCommand>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAdminAuditService _audit;

    public SuspendBoutiqueHandler(IValoirDbContext db, ICurrentUserService currentUser, IAdminAuditService audit)
    {
        _db = db;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task Handle(SuspendBoutiqueCommand request, CancellationToken ct)
    {
        var adminId = _currentUser.UserId ?? throw new DomainException("Unauthenticated admin.");
        var boutique = await _db.Boutiques.FirstOrDefaultAsync(b => b.Id == request.BoutiqueId, ct)
            ?? throw new DomainException("Boutique not found.");

        var previous = new { boutique.Status, boutique.SuspensionReason, boutique.PayoutHoldEnabled };
        boutique.Suspend(request.Reason, adminId);
        OutboxNotify.EnqueueAdminEvent(_db, "ReceiveBoutiqueStatusChanged",
            new { BoutiqueId = boutique.Id, Status = boutique.Status.ToString(), Action = "Suspend", Reason = request.Reason });
        await _db.SaveChangesAsync(ct);

        await _audit.LogAsync(
            action: "Boutique.Suspend",
            targetType: nameof(Boutique),
            targetId: boutique.Id,
            previousValue: previous,
            newValue: new { boutique.Status, boutique.SuspensionReason, boutique.PayoutHoldEnabled },
            reason: request.Reason,
            ct: ct);
    }
}

public class RejectBoutiqueHandler : IRequestHandler<RejectBoutiqueCommand>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAdminAuditService _audit;

    public RejectBoutiqueHandler(IValoirDbContext db, ICurrentUserService currentUser, IAdminAuditService audit)
    {
        _db = db;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task Handle(RejectBoutiqueCommand request, CancellationToken ct)
    {
        var adminId = _currentUser.UserId ?? throw new DomainException("Unauthenticated admin.");
        var boutique = await _db.Boutiques.FirstOrDefaultAsync(b => b.Id == request.BoutiqueId, ct)
            ?? throw new DomainException("Boutique not found.");

        var previous = new { boutique.Status, boutique.RejectionReason };
        boutique.Reject(request.Reason, adminId);
        await _db.SaveChangesAsync(ct);

        await _audit.LogAsync(
            action: "Boutique.Reject",
            targetType: nameof(Boutique),
            targetId: boutique.Id,
            previousValue: previous,
            newValue: new { boutique.Status, boutique.RejectionReason },
            reason: request.Reason,
            ct: ct);
    }
}

public class ReinstateBoutiqueHandler : IRequestHandler<ReinstateBoutiqueCommand>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAdminAuditService _audit;

    public ReinstateBoutiqueHandler(IValoirDbContext db, ICurrentUserService currentUser, IAdminAuditService audit)
    {
        _db = db;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task Handle(ReinstateBoutiqueCommand request, CancellationToken ct)
    {
        var adminId = _currentUser.UserId ?? throw new DomainException("Unauthenticated admin.");
        var boutique = await _db.Boutiques.FirstOrDefaultAsync(b => b.Id == request.BoutiqueId, ct)
            ?? throw new DomainException("Boutique not found.");

        var previous = new { boutique.Status, boutique.SuspensionReason, boutique.PayoutHoldEnabled };
        boutique.Reinstate(adminId);
        await _db.SaveChangesAsync(ct);

        await _audit.LogAsync(
            action: "Boutique.Reinstate",
            targetType: nameof(Boutique),
            targetId: boutique.Id,
            previousValue: previous,
            newValue: new { boutique.Status, boutique.SuspensionReason, boutique.PayoutHoldEnabled },
            ct: ct);
    }
}

public class OverrideCommissionHandler : IRequestHandler<OverrideCommissionCommand>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAdminAuditService _audit;

    public OverrideCommissionHandler(IValoirDbContext db, ICurrentUserService currentUser, IAdminAuditService audit)
    {
        _db = db;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task Handle(OverrideCommissionCommand request, CancellationToken ct)
    {
        // Commission override is SuperAdmin-sensitive; policy already gates the endpoint.
        var boutique = await _db.Boutiques.FirstOrDefaultAsync(b => b.Id == request.BoutiqueId, ct)
            ?? throw new DomainException("Boutique not found.");

        var previousRate = boutique.CommissionRate;
        boutique.OverrideCommission(request.NewRate);
        await _db.SaveChangesAsync(ct);

        await _audit.LogAsync(
            action: "Boutique.OverrideCommission",
            targetType: nameof(Boutique),
            targetId: boutique.Id,
            previousValue: new { CommissionRate = previousRate },
            newValue: new { CommissionRate = boutique.CommissionRate },
            reason: $"Rate changed from {previousRate:P2} to {request.NewRate:P2}",
            ct: ct);
    }
}

public class SetPayoutHoldHandler : IRequestHandler<SetPayoutHoldCommand>
{
    private readonly IValoirDbContext _db;
    private readonly IAdminAuditService _audit;

    public SetPayoutHoldHandler(IValoirDbContext db, IAdminAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    public async Task Handle(SetPayoutHoldCommand request, CancellationToken ct)
    {
        var boutique = await _db.Boutiques.FirstOrDefaultAsync(b => b.Id == request.BoutiqueId, ct)
            ?? throw new DomainException("Boutique not found.");

        var previous = boutique.PayoutHoldEnabled;
        boutique.SetPayoutHold(request.Hold);
        await _db.SaveChangesAsync(ct);

        await _audit.LogAsync(
            action: request.Hold ? "Boutique.PayoutHold.Enable" : "Boutique.PayoutHold.Release",
            targetType: nameof(Boutique),
            targetId: boutique.Id,
            previousValue: new { PayoutHoldEnabled = previous },
            newValue: new { PayoutHoldEnabled = boutique.PayoutHoldEnabled },
            ct: ct);
    }
}


/// <summary>
/// Targeted refund handler. Persists ledger + Outbox financial intents only.
/// Stripe refund/reversal are executed by OutboxProcessor (never inline).
/// </summary>
public class AdminRefundHandler : IRequestHandler<AdminRefundCommand, AdminRefundResult>
{
    private readonly IValoirDbContext _db;
    private readonly IAdminAuditService _audit;

    public AdminRefundHandler(IValoirDbContext db, IAdminAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    public async Task<AdminRefundResult> Handle(AdminRefundCommand request, CancellationToken ct)
    {
        var order = await _db.Orders
            .Include(o => o.VendorOrders)
            .ThenInclude(vo => vo.Items)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, ct)
            ?? throw new DomainException("Order not found.");

        if (string.IsNullOrEmpty(order.StripePaymentIntentId))
            throw new DomainException("Order has no PaymentIntent; cannot refund.");

        var targetVendorOrders = request.VendorOrderId.HasValue
            ? order.VendorOrders.Where(v => v.Id == request.VendorOrderId.Value).ToList()
            : order.VendorOrders.ToList();

        if (targetVendorOrders.Count == 0)
            throw new DomainException("No matching vendor orders to refund.");

        decimal totalRefund = 0m;
        var queuedReversals = new List<string>();
        var refundIdempotencyKeys = new List<string>();

        foreach (var vo in targetVendorOrders)
        {
            var items = request.OrderItemIds is { Count: > 0 }
                ? vo.Items.Where(i => request.OrderItemIds.Contains(i.Id)).ToList()
                : vo.Items.ToList();

            if (items.Count == 0) continue;

            var refundAmount = items.Sum(i => i.LineTotal);
            totalRefund += refundAmount;
            var amountCents = (long)(refundAmount * 100);
            var refundKey = $"refund-{order.Id:N}-{vo.Id:N}-{amountCents}";
            refundIdempotencyKeys.Add(refundKey);

            // Outbox: Stripe refund (executed later by worker)
            var refundPayload = System.Text.Json.JsonSerializer.Serialize(new
            {
                PaymentIntentId = order.StripePaymentIntentId,
                AmountCents = amountCents,
                Reason = request.Reason,
                IdempotencyKey = refundKey
            });
            _db.OutboxMessages.Add(OutboxMessage.Create(
                "stripe.refund", refundPayload, refundKey));

            if (request.ReverseTransfer && !string.IsNullOrEmpty(vo.StripeTransferId))
            {
                var revKey = $"rev-{vo.StripeTransferId}-{amountCents}";
                queuedReversals.Add(revKey);
                var revPayload = System.Text.Json.JsonSerializer.Serialize(new
                {
                    TransferId = vo.StripeTransferId,
                    AmountCents = amountCents,
                    IdempotencyKey = revKey
                });
                _db.OutboxMessages.Add(OutboxMessage.Create(
                    "stripe.transfer_reversal", revPayload, revKey));
            }

            // Ledger intent (refund amount negative). StripeRefundId filled by worker later if needed.
            _db.VendorLedgerEntries.Add(VendorLedgerEntry.Create(
                boutiqueId: vo.BoutiqueId,
                type: LedgerTransactionType.Refund,
                amount: -refundAmount,
                vendorOrderId: vo.Id,
                orderId: order.Id,
                notes: request.Reason,
                idempotencyKey: $"ledger-refund-{vo.Id:N}-{amountCents}"));

            var commissionClawback = Math.Round(refundAmount * vo.CommissionRateSnapshot, 2);
            if (commissionClawback > 0)
            {
                _db.VendorLedgerEntries.Add(VendorLedgerEntry.Create(
                    boutiqueId: vo.BoutiqueId,
                    type: LedgerTransactionType.Commission,
                    amount: commissionClawback,
                    vendorOrderId: vo.Id,
                    orderId: order.Id,
                    notes: "Commission clawback on refund",
                    idempotencyKey: $"ledger-comm-clawback-{vo.Id:N}-{amountCents}"));
            }

            vo.MarkRefunded();
        }

        if (order.VendorOrders.All(v => v.Status == VendorOrderStatus.Refunded))
            order.MarkRefunded();
        else
            order.MarkPartiallyRefunded();

        OutboxNotify.EnqueueAdminEvent(_db, "ReceiveRefundNotification",
            new { OrderId = order.Id, RefundedAmount = totalRefund, Queued = true });

        await _db.SaveChangesAsync(ct);

        await _audit.LogAsync(
            action: "Order.AdminRefund",
            targetType: nameof(Order),
            targetId: order.Id,
            previousValue: null,
            newValue: new { TotalRefund = totalRefund, RefundKeys = refundIdempotencyKeys, ReversalKeys = queuedReversals },
            reason: request.Reason,
            ct: ct);

        // Stripe IDs are assigned asynchronously by OutboxProcessor; return queued keys for correlation
        return new AdminRefundResult
        {
            StripeRefundId = refundIdempotencyKeys.FirstOrDefault() ?? string.Empty,
            ReversedTransferIds = queuedReversals,
            RefundedAmount = totalRefund
        };
    }
}
