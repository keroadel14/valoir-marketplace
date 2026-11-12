using Valoir.Domain.Common;
using Valoir.Domain.Enums;
using Valoir.Domain.Exceptions;

namespace Valoir.Domain.Entities;

/// <summary>
/// Append-only financial ledger per boutique. Every money movement is recorded.
/// </summary>
public class VendorLedgerEntry : BaseEntity
{
    public Guid BoutiqueId { get; private set; }
    public LedgerTransactionType TransactionType { get; private set; }
    public decimal Amount { get; private set; } // signed: positive = credit to vendor
    public Guid? VendorOrderId { get; private set; }
    public Guid? OrderId { get; private set; }
    public string? StripeTransferId { get; private set; }
    public string? StripeRefundId { get; private set; }
    public string? StripeTransferReversalId { get; private set; }
    public string? Notes { get; private set; }
    public string? IdempotencyKey { get; private set; }

    private VendorLedgerEntry() { }

    public static VendorLedgerEntry Create(
        Guid boutiqueId,
        LedgerTransactionType type,
        decimal amount,
        Guid? vendorOrderId = null,
        Guid? orderId = null,
        string? stripeTransferId = null,
        string? stripeRefundId = null,
        string? stripeReversalId = null,
        string? notes = null,
        string? idempotencyKey = null)
    {
        if (boutiqueId == Guid.Empty) throw new DomainException("BoutiqueId required.");
        return new VendorLedgerEntry
        {
            BoutiqueId = boutiqueId,
            TransactionType = type,
            Amount = amount,
            VendorOrderId = vendorOrderId,
            OrderId = orderId,
            StripeTransferId = stripeTransferId,
            StripeRefundId = stripeRefundId,
            StripeTransferReversalId = stripeReversalId,
            Notes = notes,
            IdempotencyKey = idempotencyKey
        };
    }
}

public class Dispute : BaseEntity
{
    public Guid VendorOrderId { get; private set; }
    public Guid? OrderItemId { get; private set; }
    public Guid BuyerId { get; private set; }
    public Guid BoutiqueId { get; private set; }
    public string Reason { get; private set; } = null!;
    public string? Details { get; private set; }
    public DisputeStatus Status { get; private set; } = DisputeStatus.Open;
    public string? AdminNote { get; private set; }
    public string? ResolutionReason { get; private set; }
    public Guid? ResolvedByAdminId { get; private set; }
    public DateTime? ResolvedAt { get; private set; }

    private Dispute() { }

    public static Dispute Open(Guid vendorOrderId, Guid boutiqueId, Guid buyerId, string reason, string? details = null, Guid? orderItemId = null)
    {
        if (string.IsNullOrWhiteSpace(reason)) throw new DomainException("Dispute reason is required.");
        return new Dispute
        {
            VendorOrderId = vendorOrderId,
            BoutiqueId = boutiqueId,
            BuyerId = buyerId,
            OrderItemId = orderItemId,
            Reason = reason.Trim(),
            Details = details,
            Status = DisputeStatus.Open
        };
    }

    public void EscalateToAdmin()
    {
        if (Status != DisputeStatus.Open && Status != DisputeStatus.VendorReview)
            throw new DomainException("Only open or vendor-review disputes can be escalated.");
        Status = DisputeStatus.EscalatedToAdmin;
        Touch();
    }

    public void ResolveApproved(Guid adminId, string? note = null)
    {
        if (Status != DisputeStatus.EscalatedToAdmin && Status != DisputeStatus.Open)
            throw new DomainException("Dispute is not in a resolvable state.");
        Status = DisputeStatus.ResolvedApproved;
        ResolvedByAdminId = adminId;
        ResolvedAt = DateTime.UtcNow;
        AdminNote = note;
        Touch();
    }

    public void ResolveRejected(Guid adminId, string reason)
    {
        if (string.IsNullOrWhiteSpace(reason)) throw new DomainException("Rejection reason is required.");
        if (Status != DisputeStatus.EscalatedToAdmin && Status != DisputeStatus.Open)
            throw new DomainException("Dispute is not in a resolvable state.");
        Status = DisputeStatus.ResolvedRejected;
        ResolvedByAdminId = adminId;
        ResolvedAt = DateTime.UtcNow;
        ResolutionReason = reason.Trim();
        Touch();
    }
}
