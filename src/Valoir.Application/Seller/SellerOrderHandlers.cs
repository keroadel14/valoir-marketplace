using MediatR;
using Microsoft.EntityFrameworkCore;
using Valoir.Application.Common.Interfaces;
using Valoir.Domain.Entities;
using Valoir.Domain.Enums;
using Valoir.Domain.Exceptions;

namespace Valoir.Application.Seller;

public record ListSellerOrdersQuery(string? Status = null, int Page = 1, int PageSize = 20)
    : IRequest<SellerOrdersResult>;

public record SellerOrdersResult(IReadOnlyList<SellerOrderListItem> Items, int Page, int PageSize, int TotalCount);

public record SellerOrderListItem(
    Guid VendorOrderId, Guid OrderId, string OrderNumber, decimal Subtotal, string Status,
    DateTime CreatedAt, string? TrackingNumber);

public record GetSellerOrderDetailQuery(Guid VendorOrderId) : IRequest<SellerOrderDetailDto?>;

public record SellerOrderDetailDto(
    Guid VendorOrderId, Guid OrderId, string OrderNumber, Guid BoutiqueId, decimal Subtotal,
    decimal CommissionAmount, decimal VendorNetPayout, string Status, string? TrackingNumber, string? Carrier,
    DateTime CreatedAt, IReadOnlyList<SellerOrderItemDto> Items);

public record SellerOrderItemDto(Guid Id, string ProductTitle, string? Sku, int Quantity, decimal UnitPrice);

public record ShipSellerOrderCommand(Guid VendorOrderId, string TrackingNumber, string Carrier) : IRequest;
public record ProcessSellerOrderCommand(Guid VendorOrderId) : IRequest;

public class ListSellerOrdersHandler : IRequestHandler<ListSellerOrdersQuery, SellerOrdersResult>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _user;
    public ListSellerOrdersHandler(IValoirDbContext db, ICurrentUserService user) { _db = db; _user = user; }

    public async Task<SellerOrdersResult> Handle(ListSellerOrdersQuery q, CancellationToken ct)
    {
        var uid = _user.UserId ?? throw new DomainException("Not authenticated.");
        var boutique = await _db.Boutiques.AsNoTracking().FirstOrDefaultAsync(b => b.OwnerUserId == uid, ct)
            ?? throw new DomainException("No boutique.");
        var query =
            from vo in _db.VendorOrders.AsNoTracking()
            join o in _db.Orders.AsNoTracking() on vo.OrderId equals o.Id
            where vo.BoutiqueId == boutique.Id
            select new { vo, o };
        if (!string.IsNullOrWhiteSpace(q.Status) && Enum.TryParse<VendorOrderStatus>(q.Status, true, out var st))
            query = query.Where(x => x.vo.Status == st);

        var total = await query.CountAsync(ct);
        var page = Math.Max(1, q.Page);
        var size = Math.Clamp(q.PageSize, 1, 50);
        var rows = await query.OrderByDescending(x => x.o.CreatedAt)
            .Skip((page - 1) * size).Take(size)
            .Select(x => new SellerOrderListItem(
                x.vo.Id, x.o.Id, x.o.OrderNumber, x.vo.Subtotal, x.vo.Status.ToString(),
                x.o.CreatedAt, x.vo.TrackingNumber))
            .ToListAsync(ct);
        return new SellerOrdersResult(rows, page, size, total);
    }
}

public class GetSellerOrderDetailHandler : IRequestHandler<GetSellerOrderDetailQuery, SellerOrderDetailDto?>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _user;
    public GetSellerOrderDetailHandler(IValoirDbContext db, ICurrentUserService user) { _db = db; _user = user; }

    public async Task<SellerOrderDetailDto?> Handle(GetSellerOrderDetailQuery q, CancellationToken ct)
    {
        var uid = _user.UserId ?? throw new DomainException("Not authenticated.");
        var boutique = await _db.Boutiques.AsNoTracking().FirstOrDefaultAsync(b => b.OwnerUserId == uid, ct);
        if (boutique is null) return null;
        var vo = await _db.VendorOrders.AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == q.VendorOrderId && v.BoutiqueId == boutique.Id, ct);
        if (vo is null) return null;
        var order = await _db.Orders.AsNoTracking().FirstAsync(o => o.Id == vo.OrderId, ct);
        var items = await _db.OrderItems.AsNoTracking().Where(i => i.VendorOrderId == vo.Id)
            .Select(i => new SellerOrderItemDto(i.Id, i.ProductTitleSnapshot, i.SkuSnapshot, i.Quantity, i.UnitPriceSnapshot))
            .ToListAsync(ct);
        return new SellerOrderDetailDto(
            vo.Id, order.Id, order.OrderNumber, vo.BoutiqueId, vo.Subtotal, vo.CommissionAmount, vo.VendorNetPayout,
            vo.Status.ToString(), vo.TrackingNumber, vo.Carrier, order.CreatedAt, items);
    }
}

public class ProcessSellerOrderHandler : IRequestHandler<ProcessSellerOrderCommand>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _user;
    public ProcessSellerOrderHandler(IValoirDbContext db, ICurrentUserService user) { _db = db; _user = user; }

    public async Task Handle(ProcessSellerOrderCommand request, CancellationToken ct)
    {
        var vo = await LoadOwnedVendorOrder(request.VendorOrderId, ct);
        vo.MarkProcessing();
        await _db.SaveChangesAsync(ct);
    }

    private async Task<VendorOrder> LoadOwnedVendorOrder(Guid id, CancellationToken ct)
    {
        var uid = _user.UserId ?? throw new DomainException("Not authenticated.");
        var boutique = await _db.Boutiques.FirstOrDefaultAsync(b => b.OwnerUserId == uid, ct)
            ?? throw new DomainException("No boutique.");
        return await _db.VendorOrders.FirstOrDefaultAsync(v => v.Id == id && v.BoutiqueId == boutique.Id, ct)
            ?? throw new DomainException("Order not found.");
    }
}

public class ShipSellerOrderHandler : IRequestHandler<ShipSellerOrderCommand>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _user;
    public ShipSellerOrderHandler(IValoirDbContext db, ICurrentUserService user) { _db = db; _user = user; }

    public async Task Handle(ShipSellerOrderCommand request, CancellationToken ct)
    {
        var uid = _user.UserId ?? throw new DomainException("Not authenticated.");
        var boutique = await _db.Boutiques.FirstOrDefaultAsync(b => b.OwnerUserId == uid, ct)
            ?? throw new DomainException("No boutique.");
        var vo = await _db.VendorOrders.FirstOrDefaultAsync(v => v.Id == request.VendorOrderId && v.BoutiqueId == boutique.Id, ct)
            ?? throw new DomainException("Order not found.");
        vo.MarkShipped(request.TrackingNumber, request.Carrier);

        var order = await _db.Orders.FirstAsync(o => o.Id == vo.OrderId, ct);
        var notif = UserNotification.Create(
            order.BuyerId, "order.shipped", "Order shipped",
            $"Your order {order.OrderNumber} was shipped. Tracking: {request.TrackingNumber}",
            $"/account/orders/{order.Id}");
        _db.UserNotifications.Add(notif);
        await _db.SaveChangesAsync(ct);
    }
}
