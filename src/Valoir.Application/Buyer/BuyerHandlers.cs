using MediatR;
using Microsoft.EntityFrameworkCore;
using Valoir.Application.Common.Interfaces;
using Valoir.Domain.Entities;
using Valoir.Domain.Enums;
using Valoir.Domain.Exceptions;

namespace Valoir.Application.Buyer;

public class ListAddressesHandler : IRequestHandler<ListAddressesQuery, IReadOnlyList<ShippingAddressDto>>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _user;
    public ListAddressesHandler(IValoirDbContext db, ICurrentUserService user) { _db = db; _user = user; }

    public async Task<IReadOnlyList<ShippingAddressDto>> Handle(ListAddressesQuery request, CancellationToken ct)
    {
        var uid = _user.UserId ?? throw new DomainException("Not authenticated.");
        return await _db.ShippingAddresses.AsNoTracking()
            .Where(a => a.UserId == uid)
            .OrderByDescending(a => a.IsDefault).ThenBy(a => a.CreatedAt)
            .Select(a => new ShippingAddressDto(a.Id, a.Label, a.FullName, a.Phone, a.Line1, a.Line2,
                a.City, a.StateOrRegion, a.PostalCode, a.CountryCode, a.IsDefault))
            .ToListAsync(ct);
    }
}

public class CreateAddressHandler : IRequestHandler<CreateAddressCommand, Guid>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _user;
    public CreateAddressHandler(IValoirDbContext db, ICurrentUserService user) { _db = db; _user = user; }

    public async Task<Guid> Handle(CreateAddressCommand r, CancellationToken ct)
    {
        var uid = _user.UserId ?? throw new DomainException("Not authenticated.");
        if (r.IsDefault)
        {
            var existing = await _db.ShippingAddresses.Where(a => a.UserId == uid && a.IsDefault).ToListAsync(ct);
            foreach (var e in existing) e.SetDefault(false);
        }
        var addr = ShippingAddress.Create(uid, r.FullName, r.Phone, r.Line1, r.City, r.PostalCode, r.CountryCode,
            r.Line2, r.StateOrRegion, r.Label, r.IsDefault);
        _db.ShippingAddresses.Add(addr);
        await _db.SaveChangesAsync(ct);
        return addr.Id;
    }
}

public class UpdateAddressHandler : IRequestHandler<UpdateAddressCommand>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _user;
    public UpdateAddressHandler(IValoirDbContext db, ICurrentUserService user) { _db = db; _user = user; }

    public async Task Handle(UpdateAddressCommand r, CancellationToken ct)
    {
        var uid = _user.UserId ?? throw new DomainException("Not authenticated.");
        var addr = await _db.ShippingAddresses.FirstOrDefaultAsync(a => a.Id == r.AddressId && a.UserId == uid, ct)
            ?? throw new DomainException("Address not found.");
        if (r.IsDefault)
        {
            var others = await _db.ShippingAddresses.Where(a => a.UserId == uid && a.IsDefault && a.Id != addr.Id).ToListAsync(ct);
            foreach (var e in others) e.SetDefault(false);
        }
        addr.Update(r.FullName, r.Phone, r.Line1, r.City, r.PostalCode, r.CountryCode, r.Line2, r.StateOrRegion, r.Label);
        addr.SetDefault(r.IsDefault);
        await _db.SaveChangesAsync(ct);
    }
}

public class DeleteAddressHandler : IRequestHandler<DeleteAddressCommand>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _user;
    public DeleteAddressHandler(IValoirDbContext db, ICurrentUserService user) { _db = db; _user = user; }

    public async Task Handle(DeleteAddressCommand r, CancellationToken ct)
    {
        var uid = _user.UserId ?? throw new DomainException("Not authenticated.");
        var addr = await _db.ShippingAddresses.FirstOrDefaultAsync(a => a.Id == r.AddressId && a.UserId == uid, ct)
            ?? throw new DomainException("Address not found.");
        _db.ShippingAddresses.Remove(addr);
        await _db.SaveChangesAsync(ct);
    }
}

public class SetDefaultAddressHandler : IRequestHandler<SetDefaultAddressCommand>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _user;
    public SetDefaultAddressHandler(IValoirDbContext db, ICurrentUserService user) { _db = db; _user = user; }

    public async Task Handle(SetDefaultAddressCommand r, CancellationToken ct)
    {
        var uid = _user.UserId ?? throw new DomainException("Not authenticated.");
        var addr = await _db.ShippingAddresses.FirstOrDefaultAsync(a => a.Id == r.AddressId && a.UserId == uid, ct)
            ?? throw new DomainException("Address not found.");
        var others = await _db.ShippingAddresses.Where(a => a.UserId == uid && a.IsDefault).ToListAsync(ct);
        foreach (var e in others) e.SetDefault(false);
        addr.SetDefault(true);
        await _db.SaveChangesAsync(ct);
    }
}

public class CreateOrderHandler : IRequestHandler<CreateOrderCommand, CreateOrderResult>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _user;
    private readonly IInventoryReservationService _inventory;
    private readonly IStripeConnectService _stripe;

    public CreateOrderHandler(
        IValoirDbContext db, ICurrentUserService user,
        IInventoryReservationService inventory, IStripeConnectService stripe)
    {
        _db = db;
        _user = user;
        _inventory = inventory;
        _stripe = stripe;
    }

    public async Task<CreateOrderResult> Handle(CreateOrderCommand request, CancellationToken ct)
    {
        var buyerId = _user.UserId ?? throw new DomainException("Not authenticated.");
        if (request.ShippingAddressId.HasValue)
        {
            var ok = await _db.ShippingAddresses.AnyAsync(
                a => a.Id == request.ShippingAddressId && a.UserId == buyerId, ct);
            if (!ok) throw new DomainException("Shipping address not found.");
        }

        // Load variants + products + boutiques
        var variantIds = request.Lines.Select(l => l.VariantId).Distinct().ToList();
        var variants = await _db.ProductVariants.Where(v => variantIds.Contains(v.Id)).ToListAsync(ct);
        if (variants.Count != variantIds.Count)
            throw new DomainException("One or more variants were not found.");

        var productIds = variants.Select(v => v.ProductId).Distinct().ToList();
        var products = await _db.Products.Where(p => productIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id, ct);
        var boutiqueIds = products.Values.Select(p => p.BoutiqueId).Distinct().ToList();
        var boutiques = await _db.Boutiques.Where(b => boutiqueIds.Contains(b.Id)).ToDictionaryAsync(b => b.Id, ct);

        foreach (var line in request.Lines)
        {
            var v = variants.First(x => x.Id == line.VariantId);
            if (!products.TryGetValue(v.ProductId, out var product) || product.Status != ProductStatus.Published)
                throw new DomainException($"Product for variant {v.Sku} is not available.");
            if (!boutiques.TryGetValue(product.BoutiqueId, out var boutique) || boutique.Status != BoutiqueStatus.Approved)
                throw new DomainException("Seller boutique is not available.");
            if (v.AvailableQuantity < line.Quantity)
                throw new DomainException($"Insufficient stock for SKU {v.Sku}. Available: {v.AvailableQuantity}");
        }

        var hold = TimeSpan.FromMinutes(10);
        var order = Order.Create(buyerId, request.ShippingAmount, hold);
        _db.Orders.Add(order);
        await _db.SaveChangesAsync(ct);

        // Group lines by boutique
        var linesByBoutique = request.Lines
            .Select(l =>
            {
                var v = variants.First(x => x.Id == l.VariantId);
                var p = products[v.ProductId];
                return (Line: l, Variant: v, Product: p, Boutique: boutiques[p.BoutiqueId]);
            })
            .GroupBy(x => x.Boutique.Id);

        foreach (var group in linesByBoutique)
        {
            var boutique = group.First().Boutique;
            var vo = VendorOrder.Create(order.Id, boutique.Id, boutique.CommissionRate, shippingFee: 0m);
            _db.VendorOrders.Add(vo);
            await _db.SaveChangesAsync(ct);

            foreach (var row in group)
            {
                var unit = row.Variant.PriceOverride ?? row.Product.BasePrice;
                var item = OrderItem.Create(vo.Id, row.Variant.Id, row.Line.Quantity, unit, row.Product.Title, row.Variant.Sku);
                vo.AddItem(item);
                _db.OrderItems.Add(item);

                await _inventory.ReserveAsync(row.Variant.Id, order.Id, row.Line.Quantity, hold, ct);
            }
            await _db.SaveChangesAsync(ct);
        }

        // Recalculate parent total from vendor orders
        var vos = await _db.VendorOrders.Where(v => v.OrderId == order.Id).ToListAsync(ct);
        // TotalAmount is private set — domain Recalculate only via AddVendorOrder on tracked aggregate.
        // Reload order and use Attach path: compute amount for PaymentIntent from VO subtotals.
        var merchandise = vos.Sum(v => v.Subtotal + v.ShippingFee);
        var total = merchandise + request.ShippingAmount;
        order.SetComputedTotal(merchandise, request.ShippingAmount);
        await _db.SaveChangesAsync(ct);

        var amountCents = (long)Math.Round(total * 100m, MidpointRounding.AwayFromZero);
        if (amountCents < 1) throw new DomainException("Order total must be positive.");

        var (piId, clientSecret) = await _stripe.CreatePaymentIntentAsync(
            amountCents, "aed", $"order-{order.Id:N}",
            new Dictionary<string, string> { ["orderId"] = order.Id.ToString(), ["orderNumber"] = order.OrderNumber },
            ct);

        order.AttachPaymentIntent(piId);
        await _db.SaveChangesAsync(ct);

        return new CreateOrderResult(order.Id, order.OrderNumber, total, piId, clientSecret, order.ExpiresAt);
    }
}

public class ListBuyerOrdersHandler : IRequestHandler<ListBuyerOrdersQuery, BuyerOrdersResult>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _user;
    public ListBuyerOrdersHandler(IValoirDbContext db, ICurrentUserService user) { _db = db; _user = user; }

    public async Task<BuyerOrdersResult> Handle(ListBuyerOrdersQuery q, CancellationToken ct)
    {
        var uid = _user.UserId ?? throw new DomainException("Not authenticated.");
        var query = _db.Orders.AsNoTracking().Where(o => o.BuyerId == uid);
        if (!string.IsNullOrWhiteSpace(q.Status) && Enum.TryParse<OrderStatus>(q.Status, true, out var st))
            query = query.Where(o => o.Status == st);

        var total = await query.CountAsync(ct);
        var page = Math.Max(1, q.Page);
        var size = Math.Clamp(q.PageSize, 1, 50);
        var items = await query.OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * size).Take(size)
            .Select(o => new BuyerOrderListItem(o.Id, o.OrderNumber, o.TotalAmount, o.Status.ToString(), o.CreatedAt, o.PaidAt))
            .ToListAsync(ct);
        return new BuyerOrdersResult(items, page, size, total);
    }
}

public class GetBuyerOrderDetailHandler : IRequestHandler<GetBuyerOrderDetailQuery, BuyerOrderDetailDto?>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _user;
    public GetBuyerOrderDetailHandler(IValoirDbContext db, ICurrentUserService user) { _db = db; _user = user; }

    public async Task<BuyerOrderDetailDto?> Handle(GetBuyerOrderDetailQuery q, CancellationToken ct)
    {
        var uid = _user.UserId ?? throw new DomainException("Not authenticated.");
        var order = await _db.Orders.AsNoTracking().FirstOrDefaultAsync(o => o.Id == q.OrderId && o.BuyerId == uid, ct);
        if (order is null) return null;

        var vos = await _db.VendorOrders.AsNoTracking().Where(v => v.OrderId == order.Id).ToListAsync(ct);
        var voIds = vos.Select(v => v.Id).ToList();
        var items = await _db.OrderItems.AsNoTracking().Where(i => voIds.Contains(i.VendorOrderId)).ToListAsync(ct);

        return new BuyerOrderDetailDto(
            order.Id, order.OrderNumber, order.TotalAmount, order.ShippingAmount, order.Status.ToString(),
            order.StripePaymentIntentId, order.CreatedAt, order.PaidAt, order.ExpiresAt,
            vos.Select(v => new BuyerVendorOrderDto(
                v.Id, v.BoutiqueId, v.Subtotal, v.Status.ToString(), v.TrackingNumber, v.Carrier,
                items.Where(i => i.VendorOrderId == v.Id)
                    .Select(i => new BuyerOrderItemDto(i.Id, i.VariantId, i.Quantity, i.UnitPriceSnapshot, i.ProductTitleSnapshot, i.SkuSnapshot))
                    .ToList()
            )).ToList());
    }
}
