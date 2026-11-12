using MediatR;
using Valoir.Domain.Enums;

namespace Valoir.Application.Admin.Queries;

public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount)
{
    public int TotalPages => PageSize <= 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
}

// ── Dashboard ──────────────────────────────────────────────────────────
public record GetPlatformMetricsQuery : IRequest<PlatformMetricsDto>;

public class PlatformMetricsDto
{
    public decimal Gmv { get; init; }
    public decimal RefundTotal { get; init; }
    public decimal NetCommission { get; init; }
    public int TotalOrders { get; init; }
    public int PendingPayoutEscrowCount { get; init; }
    public decimal PendingPayoutEscrowAmount { get; init; }
    public int BoutiquesPending { get; init; }
    public int BoutiquesApproved { get; init; }
    public int BoutiquesSuspended { get; init; }
    public int OpenDisputes { get; init; }
    public IReadOnlyList<BoutiqueLeaderboardItem> TopBoutiques { get; init; } = Array.Empty<BoutiqueLeaderboardItem>();
}

public record BoutiqueLeaderboardItem(Guid BoutiqueId, string StoreName, decimal Gmv, int OrderCount);

// ── Boutiques ──────────────────────────────────────────────────────────
public record GetBoutiquesQuery(
    BoutiqueStatus? Status = null,
    string? Search = null,
    bool? PayoutHold = null,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<BoutiqueListItemDto>>;

public record BoutiqueListItemDto(
    Guid Id, string StoreName, string Slug, BoutiqueStatus Status,
    decimal CommissionRate, bool PayoutHoldEnabled, string? OwnerEmail,
    DateTime CreatedAt, DateTime? ApprovedAt);

public record GetBoutiqueDetailQuery(Guid Id) : IRequest<BoutiqueDetailDto?>;

public record BoutiqueDetailDto(
    Guid Id, string StoreName, string Slug, BoutiqueStatus Status,
    decimal CommissionRate, bool PayoutHoldEnabled, bool PayoutsEnabled,
    string? StripeAccountId, string? TradeLicenseOrVatId,
    Guid OwnerUserId, string? OwnerEmail, string? OwnerName,
    DateTime CreatedAt, DateTime? ApprovedAt, string? SuspensionReason);

// ── Orders ─────────────────────────────────────────────────────────────
public record GetOrdersQuery(
    OrderStatus? Status = null,
    Guid? BuyerId = null,
    Guid? BoutiqueId = null,
    DateTime? From = null,
    DateTime? To = null,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<OrderListItemDto>>;

public record OrderListItemDto(
    Guid Id, string OrderNumber, Guid BuyerId, decimal TotalAmount,
    OrderStatus Status, DateTime CreatedAt, DateTime? PaidAt, int VendorOrderCount);

public record GetOrderDetailQuery(Guid Id) : IRequest<OrderDetailDto?>;

public record OrderDetailDto(
    Guid Id, string OrderNumber, Guid BuyerId, decimal TotalAmount, decimal ShippingAmount,
    OrderStatus Status, string? StripePaymentIntentId, DateTime CreatedAt, DateTime? PaidAt,
    IReadOnlyList<VendorOrderDto> VendorOrders);

public record VendorOrderDto(
    Guid Id, Guid BoutiqueId, decimal Subtotal, decimal CommissionAmount,
    decimal VendorNetPayout, decimal ShippingFee, VendorOrderStatus Status,
    string? TrackingNumber, string? Carrier, string? StripeTransferId,
    IReadOnlyList<OrderItemDto> Items);

public record OrderItemDto(Guid Id, Guid VariantId, int Quantity, decimal UnitPrice, string ProductTitle, string? Sku);

// ── Disputes ───────────────────────────────────────────────────────────
public record GetDisputesQuery(
    DisputeStatus? Status = null,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<DisputeListItemDto>>;

public record DisputeListItemDto(
    Guid Id, Guid VendorOrderId, Guid BoutiqueId, Guid BuyerId,
    string Reason, DisputeStatus Status, DateTime CreatedAt);

// ── Audit ──────────────────────────────────────────────────────────────
public record GetAuditLogsQuery(
    Guid? AdminUserId = null,
    string? Action = null,
    string? TargetType = null,
    Guid? TargetId = null,
    DateTime? From = null,
    DateTime? To = null,
    int Page = 1,
    int PageSize = 50) : IRequest<PagedResult<AuditLogDto>>;

public record AuditLogDto(
    Guid Id, Guid AdminUserId, string Action, string? TargetType, Guid? TargetId,
    string? Reason, string? IpAddress, DateTime OccurredAt);

// ── Users ──────────────────────────────────────────────────────────────
public record GetUsersQuery(
    string? Search = null,
    string? Role = null,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<UserListItemDto>>;

public record UserListItemDto(
    Guid Id, string Email, string? FullName, IReadOnlyList<string> Roles,
    string AccountStatus, DateTime CreatedAt);

// ── Products ───────────────────────────────────────────────────────────
public record GetProductsQuery(
    Guid? BoutiqueId = null,
    string? Search = null,
    bool? FeaturedOnly = null,
    bool IncludeDeleted = false,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<ProductListItemDto>>;

public record ProductListItemDto(
    Guid Id, Guid BoutiqueId, string Title, string Slug, decimal BasePrice,
    string Status, bool IsFeatured, DateTime CreatedAt);

public record GetProductDetailQuery(Guid Id) : IRequest<ProductDetailDto?>;

public record ProductDetailDto(
    Guid Id, Guid BoutiqueId, string Title, string Slug, string? Description,
    decimal BasePrice, string Status, bool IsFeatured, string? UnlistReason,
    IReadOnlyList<VariantDto> Variants);

public record VariantDto(Guid Id, string Sku, string? ColorName, string? Size, int Stock, int Reserved, decimal? PriceOverride);

// ── Users ──────────────────────────────────────────────────────────────
public record GetUserDetailQuery(Guid Id) : IRequest<UserDetailDto?>;

public record UserDetailDto(
    Guid Id, string Email, string? FullName, IReadOnlyList<string> Roles,
    string AccountStatus, DateTime CreatedAt, DateTime? SuspendedAt, string? SuspensionReason,
    bool HasAcceptedTerms, DateTime? AcceptedTermsAt);
