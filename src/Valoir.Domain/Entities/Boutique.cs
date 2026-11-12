using Valoir.Domain.Common;
using Valoir.Domain.Enums;
using Valoir.Domain.Exceptions;

namespace Valoir.Domain.Entities;

public class Boutique : BaseEntity, ISoftDelete
{
    public const decimal DefaultCommissionRate = 0.12m;
    public const decimal MinCommissionRate = 0.05m;
    public const decimal MaxCommissionRate = 0.30m;

    public Guid OwnerUserId { get; private set; }
    public string StoreName { get; private set; } = null!;
    public string Slug { get; private set; } = null!;
    public string? LogoUrl { get; private set; }
    public string? CoverUrl { get; private set; }
    public string? TradeLicenseOrVatId { get; private set; }
    public string? Description { get; private set; }
    public decimal CommissionRate { get; private set; } = DefaultCommissionRate;
    public BoutiqueStatus Status { get; private set; } = BoutiqueStatus.Pending;
    public string? StripeAccountId { get; private set; }
    public bool DetailsSubmitted { get; private set; }
    public bool PayoutsEnabled { get; private set; }
    public bool ChargesEnabled { get; private set; }
    public bool PayoutHoldEnabled { get; private set; }
    public string? SuspensionReason { get; private set; }
    public string? RejectionReason { get; private set; }
    public DateTime? ApprovedAt { get; private set; }
    public Guid? ApprovedByAdminId { get; private set; }
    public bool IsDeleted { get; private set; }
    public DateTime? DeletedAt { get; private set; }

    private Boutique() { }

    public static Boutique Create(Guid ownerUserId, string storeName, string slug, string? tradeLicense = null)
    {
        if (string.IsNullOrWhiteSpace(storeName)) throw new DomainException("Store name is required.");
        if (string.IsNullOrWhiteSpace(slug)) throw new DomainException("Slug is required.");

        return new Boutique
        {
            OwnerUserId = ownerUserId,
            StoreName = storeName.Trim(),
            Slug = slug.Trim().ToLowerInvariant(),
            TradeLicenseOrVatId = tradeLicense,
            Status = BoutiqueStatus.Pending,
            CommissionRate = DefaultCommissionRate
        };
    }

    public void Approve(Guid adminId)
    {
        if (Status == BoutiqueStatus.Approved) return;
        if (Status == BoutiqueStatus.Rejected)
            throw new DomainException("Cannot approve a rejected boutique. Create a new application.");

        Status = BoutiqueStatus.Approved;
        ApprovedAt = DateTime.UtcNow;
        ApprovedByAdminId = adminId;
        SuspensionReason = null;
        RejectionReason = null;
        Touch();
    }

    public void Reject(string reason, Guid adminId)
    {
        if (string.IsNullOrWhiteSpace(reason))
            throw new DomainException("Rejection reason is required.");
        Status = BoutiqueStatus.Rejected;
        RejectionReason = reason.Trim();
        ApprovedByAdminId = adminId;
        Touch();
    }

    public void Suspend(string reason, Guid adminId)
    {
        if (string.IsNullOrWhiteSpace(reason))
            throw new DomainException("Suspension reason is required.");
        if (Status != BoutiqueStatus.Approved)
            throw new DomainException("Only approved boutiques can be suspended.");

        Status = BoutiqueStatus.Suspended;
        SuspensionReason = reason.Trim();
        PayoutHoldEnabled = true;
        Touch();
    }

    public void Reinstate(Guid adminId)
    {
        if (Status != BoutiqueStatus.Suspended)
            throw new DomainException("Only suspended boutiques can be reinstated.");

        Status = BoutiqueStatus.Approved;
        SuspensionReason = null;
        PayoutHoldEnabled = false;
        Touch();
    }

    public void OverrideCommission(decimal rate)
    {
        if (rate < MinCommissionRate || rate > MaxCommissionRate)
            throw new DomainException($"Commission rate must be between {MinCommissionRate:P0} and {MaxCommissionRate:P0}.");
        CommissionRate = rate;
        Touch();
    }

    public void SetPayoutHold(bool hold)
    {
        PayoutHoldEnabled = hold;
        Touch();
    }

    public void UpdateStripeStatus(string? accountId, bool detailsSubmitted, bool chargesEnabled, bool payoutsEnabled)
    {
        StripeAccountId = accountId;
        DetailsSubmitted = detailsSubmitted;
        ChargesEnabled = chargesEnabled;
        PayoutsEnabled = payoutsEnabled;
        Touch();
    }

    public void SoftDelete()
    {
        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;
        Touch();
    }
}
