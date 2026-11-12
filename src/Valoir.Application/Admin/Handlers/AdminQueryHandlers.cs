using MediatR;
using Microsoft.EntityFrameworkCore;
using Valoir.Application.Admin.Queries;
using Valoir.Application.Common.Interfaces;
using Valoir.Domain.Enums;

namespace Valoir.Application.Admin.Handlers;

public class GetPlatformMetricsHandler : IRequestHandler<GetPlatformMetricsQuery, PlatformMetricsDto>
{
    private readonly IValoirDbContext _db;
    public GetPlatformMetricsHandler(IValoirDbContext db) => _db = db;

    public async Task<PlatformMetricsDto> Handle(GetPlatformMetricsQuery request, CancellationToken ct)
    {
        var paidOrders = _db.Orders.AsNoTracking().Where(o =>
            o.Status == OrderStatus.Paid || o.Status == OrderStatus.Processing ||
            o.Status == OrderStatus.Dispatched || o.Status == OrderStatus.InTransit ||
            o.Status == OrderStatus.Delivered || o.Status == OrderStatus.PartiallyRefunded);

        var gmv = await paidOrders.SumAsync(o => (decimal?)o.TotalAmount, ct) ?? 0m;
        var totalOrders = await paidOrders.CountAsync(ct);

        var refundTotal = await _db.VendorLedgerEntries.AsNoTracking()
            .Where(l => l.TransactionType == LedgerTransactionType.Refund)
            .SumAsync(l => (decimal?)Math.Abs(l.Amount), ct) ?? 0m;

        var netCommission = await _db.VendorOrders.AsNoTracking()
            .Where(v => v.Status == VendorOrderStatus.Paid || v.Status == VendorOrderStatus.Shipped || v.Status == VendorOrderStatus.Delivered)
            .SumAsync(v => (decimal?)v.CommissionAmount, ct) ?? 0m;

        var pendingVendorOrders = _db.VendorOrders.AsNoTracking()
            .Where(v => v.Status == VendorOrderStatus.Paid && v.StripeTransferId == null);
        var escrowCount = await pendingVendorOrders.CountAsync(ct);
        var escrowAmount = await pendingVendorOrders.SumAsync(v => (decimal?)v.VendorNetPayout, ct) ?? 0m;

        var boutiques = await _db.Boutiques.AsNoTracking()
            .GroupBy(b => b.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        var openDisputes = await _db.Disputes.AsNoTracking()
            .CountAsync(d => d.Status == DisputeStatus.Open || d.Status == DisputeStatus.EscalatedToAdmin, ct);

        var top = await _db.VendorOrders.AsNoTracking()
            .Where(v => v.Status != VendorOrderStatus.Cancelled && v.Status != VendorOrderStatus.Pending)
            .GroupBy(v => v.BoutiqueId)
            .Select(g => new { BoutiqueId = g.Key, Gmv = g.Sum(x => x.Subtotal), Orders = g.Count() })
            .OrderByDescending(x => x.Gmv)
            .Take(10)
            .ToListAsync(ct);

        var boutiqueNames = await _db.Boutiques.AsNoTracking()
            .Where(b => top.Select(t => t.BoutiqueId).Contains(b.Id))
            .ToDictionaryAsync(b => b.Id, b => b.StoreName, ct);

        return new PlatformMetricsDto
        {
            Gmv = gmv,
            RefundTotal = refundTotal,
            NetCommission = netCommission,
            TotalOrders = totalOrders,
            PendingPayoutEscrowCount = escrowCount,
            PendingPayoutEscrowAmount = escrowAmount,
            BoutiquesPending = boutiques.FirstOrDefault(x => x.Status == BoutiqueStatus.Pending)?.Count ?? 0,
            BoutiquesApproved = boutiques.FirstOrDefault(x => x.Status == BoutiqueStatus.Approved)?.Count ?? 0,
            BoutiquesSuspended = boutiques.FirstOrDefault(x => x.Status == BoutiqueStatus.Suspended)?.Count ?? 0,
            OpenDisputes = openDisputes,
            TopBoutiques = top.Select(t => new BoutiqueLeaderboardItem(
                t.BoutiqueId, boutiqueNames.GetValueOrDefault(t.BoutiqueId, "?"), t.Gmv, t.Orders)).ToList()
        };
    }
}

public class GetBoutiquesHandler : IRequestHandler<GetBoutiquesQuery, PagedResult<BoutiqueListItemDto>>
{
    private readonly IValoirDbContext _db;
    public GetBoutiquesHandler(IValoirDbContext db) => _db = db;

    public async Task<PagedResult<BoutiqueListItemDto>> Handle(GetBoutiquesQuery q, CancellationToken ct)
    {
        var query = _db.Boutiques.AsNoTracking().AsQueryable();
        if (q.Status.HasValue) query = query.Where(b => b.Status == q.Status);
        if (q.PayoutHold.HasValue) query = query.Where(b => b.PayoutHoldEnabled == q.PayoutHold);
        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var s = q.Search.Trim().ToLower();
            query = query.Where(b =>
                b.StoreName.ToLower().Contains(s) ||
                b.Slug.ToLower().Contains(s) ||
                (b.TradeLicenseOrVatId != null && b.TradeLicenseOrVatId.ToLower().Contains(s)));
        }

        var total = await query.CountAsync(ct);
        var page = Math.Max(1, q.Page);
        var size = Math.Clamp(q.PageSize, 1, 100);

        var items = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * size)
            .Take(size)
            .Select(b => new BoutiqueListItemDto(
                b.Id, b.StoreName, b.Slug, b.Status, b.CommissionRate,
                b.PayoutHoldEnabled, null, b.CreatedAt, b.ApprovedAt))
            .ToListAsync(ct);

        return new PagedResult<BoutiqueListItemDto>(items, page, size, total);
    }
}

public class GetBoutiqueDetailHandler : IRequestHandler<GetBoutiqueDetailQuery, BoutiqueDetailDto?>
{
    private readonly IValoirDbContext _db;
    public GetBoutiqueDetailHandler(IValoirDbContext db) => _db = db;

    public async Task<BoutiqueDetailDto?> Handle(GetBoutiqueDetailQuery q, CancellationToken ct)
    {
        var b = await _db.Boutiques.AsNoTracking().FirstOrDefaultAsync(x => x.Id == q.Id, ct);
        if (b is null) return null;
        return new BoutiqueDetailDto(
            b.Id, b.StoreName, b.Slug, b.Status, b.CommissionRate, b.PayoutHoldEnabled,
            b.PayoutsEnabled, b.StripeAccountId, b.TradeLicenseOrVatId, b.OwnerUserId,
            null, null, b.CreatedAt, b.ApprovedAt, b.SuspensionReason);
    }
}

public class GetOrdersHandler : IRequestHandler<GetOrdersQuery, PagedResult<OrderListItemDto>>
{
    private readonly IValoirDbContext _db;
    public GetOrdersHandler(IValoirDbContext db) => _db = db;

    public async Task<PagedResult<OrderListItemDto>> Handle(GetOrdersQuery q, CancellationToken ct)
    {
        var query = _db.Orders.AsNoTracking().AsQueryable();
        if (q.Status.HasValue) query = query.Where(o => o.Status == q.Status);
        if (q.BuyerId.HasValue) query = query.Where(o => o.BuyerId == q.BuyerId);
        if (q.From.HasValue) query = query.Where(o => o.CreatedAt >= q.From);
        if (q.To.HasValue) query = query.Where(o => o.CreatedAt <= q.To);
        if (q.BoutiqueId.HasValue)
        {
            var orderIds = _db.VendorOrders.AsNoTracking()
                .Where(v => v.BoutiqueId == q.BoutiqueId)
                .Select(v => v.OrderId);
            query = query.Where(o => orderIds.Contains(o.Id));
        }

        var total = await query.CountAsync(ct);
        var page = Math.Max(1, q.Page);
        var size = Math.Clamp(q.PageSize, 1, 100);

        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * size)
            .Take(size)
            .Select(o => new OrderListItemDto(
                o.Id, o.OrderNumber, o.BuyerId, o.TotalAmount, o.Status,
                o.CreatedAt, o.PaidAt, o.VendorOrders.Count))
            .ToListAsync(ct);

        return new PagedResult<OrderListItemDto>(items, page, size, total);
    }
}

public class GetOrderDetailHandler : IRequestHandler<GetOrderDetailQuery, OrderDetailDto?>
{
    private readonly IValoirDbContext _db;
    public GetOrderDetailHandler(IValoirDbContext db) => _db = db;

    public async Task<OrderDetailDto?> Handle(GetOrderDetailQuery q, CancellationToken ct)
    {
        var o = await _db.Orders.AsNoTracking()
            .Include(x => x.VendorOrders).ThenInclude(v => v.Items)
            .FirstOrDefaultAsync(x => x.Id == q.Id, ct);
        if (o is null) return null;

        return new OrderDetailDto(
            o.Id, o.OrderNumber, o.BuyerId, o.TotalAmount, o.ShippingAmount, o.Status,
            o.StripePaymentIntentId, o.CreatedAt, o.PaidAt,
            o.VendorOrders.Select(v => new VendorOrderDto(
                v.Id, v.BoutiqueId, v.Subtotal, v.CommissionAmount, v.VendorNetPayout,
                v.ShippingFee, v.Status, v.TrackingNumber, v.Carrier, v.StripeTransferId,
                v.Items.Select(i => new OrderItemDto(i.Id, i.VariantId, i.Quantity, i.UnitPriceSnapshot, i.ProductTitleSnapshot, i.SkuSnapshot)).ToList()
            )).ToList());
    }
}

public class GetDisputesHandler : IRequestHandler<GetDisputesQuery, PagedResult<DisputeListItemDto>>
{
    private readonly IValoirDbContext _db;
    public GetDisputesHandler(IValoirDbContext db) => _db = db;

    public async Task<PagedResult<DisputeListItemDto>> Handle(GetDisputesQuery q, CancellationToken ct)
    {
        var query = _db.Disputes.AsNoTracking().AsQueryable();
        if (q.Status.HasValue) query = query.Where(d => d.Status == q.Status);
        var total = await query.CountAsync(ct);
        var page = Math.Max(1, q.Page);
        var size = Math.Clamp(q.PageSize, 1, 100);
        var items = await query.OrderByDescending(d => d.CreatedAt)
            .Skip((page - 1) * size).Take(size)
            .Select(d => new DisputeListItemDto(d.Id, d.VendorOrderId, d.BoutiqueId, d.BuyerId, d.Reason, d.Status, d.CreatedAt))
            .ToListAsync(ct);
        return new PagedResult<DisputeListItemDto>(items, page, size, total);
    }
}

public class GetAuditLogsHandler : IRequestHandler<GetAuditLogsQuery, PagedResult<AuditLogDto>>
{
    private readonly IValoirDbContext _db;
    public GetAuditLogsHandler(IValoirDbContext db) => _db = db;

    public async Task<PagedResult<AuditLogDto>> Handle(GetAuditLogsQuery q, CancellationToken ct)
    {
        var query = _db.AdminAuditLogs.AsNoTracking().AsQueryable();
        if (q.AdminUserId.HasValue) query = query.Where(a => a.AdminUserId == q.AdminUserId);
        if (!string.IsNullOrWhiteSpace(q.Action)) query = query.Where(a => a.Action.Contains(q.Action));
        if (!string.IsNullOrWhiteSpace(q.TargetType)) query = query.Where(a => a.TargetType == q.TargetType);
        if (q.TargetId.HasValue) query = query.Where(a => a.TargetId == q.TargetId);
        if (q.From.HasValue) query = query.Where(a => a.OccurredAt >= q.From);
        if (q.To.HasValue) query = query.Where(a => a.OccurredAt <= q.To);

        var total = await query.CountAsync(ct);
        var page = Math.Max(1, q.Page);
        var size = Math.Clamp(q.PageSize, 1, 100);
        var items = await query.OrderByDescending(a => a.OccurredAt)
            .Skip((page - 1) * size).Take(size)
            .Select(a => new AuditLogDto(a.Id, a.AdminUserId, a.Action, a.TargetType, a.TargetId, a.Reason, a.IpAddress, a.OccurredAt))
            .ToListAsync(ct);
        return new PagedResult<AuditLogDto>(items, page, size, total);
    }
}
