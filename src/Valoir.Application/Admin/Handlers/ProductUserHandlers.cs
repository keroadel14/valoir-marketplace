using MediatR;
using Microsoft.EntityFrameworkCore;
using Valoir.Application.Admin.Commands;
using Valoir.Application.Admin.Queries;
using Valoir.Application.Common.Interfaces;
using Valoir.Domain.Entities;
using Valoir.Domain.Exceptions;
using System.Text.Json;
using Valoir.Domain.Enums;

namespace Valoir.Application.Admin.Handlers;

public class GetProductsHandler : IRequestHandler<GetProductsQuery, PagedResult<ProductListItemDto>>
{
    private readonly IValoirDbContext _db;
    public GetProductsHandler(IValoirDbContext db) => _db = db;

    public async Task<PagedResult<ProductListItemDto>> Handle(GetProductsQuery q, CancellationToken ct)
    {
        // Soft-delete filter is on entity; use IgnoreQueryFilters when IncludeDeleted
        IQueryable<Product> query = q.IncludeDeleted
            ? _db.Products.IgnoreQueryFilters().AsNoTracking()
            : _db.Products.AsNoTracking();

        if (q.BoutiqueId.HasValue) query = query.Where(p => p.BoutiqueId == q.BoutiqueId);
        if (q.FeaturedOnly == true) query = query.Where(p => p.IsFeatured);
        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var s = q.Search.Trim().ToLower();
            query = query.Where(p => p.Title.ToLower().Contains(s) || p.Slug.ToLower().Contains(s));
        }

        var total = await query.CountAsync(ct);
        var page = Math.Max(1, q.Page);
        var size = Math.Clamp(q.PageSize, 1, 100);
        var items = await query.OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * size).Take(size)
            .Select(p => new ProductListItemDto(p.Id, p.BoutiqueId, p.Title, p.Slug, p.BasePrice, p.Status.ToString(), p.IsFeatured, p.CreatedAt))
            .ToListAsync(ct);
        return new PagedResult<ProductListItemDto>(items, page, size, total);
    }
}

public class GetProductDetailHandler : IRequestHandler<GetProductDetailQuery, ProductDetailDto?>
{
    private readonly IValoirDbContext _db;
    public GetProductDetailHandler(IValoirDbContext db) => _db = db;

    public async Task<ProductDetailDto?> Handle(GetProductDetailQuery q, CancellationToken ct)
    {
        var p = await _db.Products.AsNoTracking().IgnoreQueryFilters()
            .Include(x => x.Variants)
            .FirstOrDefaultAsync(x => x.Id == q.Id, ct);
        if (p is null) return null;
        return new ProductDetailDto(
            p.Id, p.BoutiqueId, p.Title, p.Slug, p.Description, p.BasePrice,
            p.Status.ToString(), p.IsFeatured, p.UnlistReason,
            p.Variants.Select(v => new VariantDto(v.Id, v.Sku, v.ColorName, v.Size, v.StockQuantity, v.ReservedQuantity, v.PriceOverride)).ToList());
    }
}

public class ForceUnlistProductHandler : IRequestHandler<ForceUnlistProductCommand>
{
    private readonly IValoirDbContext _db;
    private readonly IAdminAuditService _audit;
    public ForceUnlistProductHandler(IValoirDbContext db, IAdminAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    public async Task Handle(ForceUnlistProductCommand request, CancellationToken ct)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == request.ProductId, ct)
            ?? throw new DomainException("Product not found.");
        var prev = product.Status;
        product.ForceUnlist(request.Reason);
        await _db.SaveChangesAsync(ct);
        await _audit.LogAsync("Product.ForceUnlist", nameof(Product), product.Id,
            previousValue: new { Status = prev }, newValue: new { product.Status },
            reason: request.Reason, ct: ct);
    }
}

public class FeatureProductHandler : IRequestHandler<FeatureProductCommand>
{
    private readonly IValoirDbContext _db;
    private readonly IAdminAuditService _audit;
    public FeatureProductHandler(IValoirDbContext db, IAdminAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    public async Task Handle(FeatureProductCommand request, CancellationToken ct)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == request.ProductId, ct)
            ?? throw new DomainException("Product not found.");
        var prev = product.IsFeatured;
        product.SetFeatured(request.Featured);
        await _db.SaveChangesAsync(ct);
        await _audit.LogAsync("Product.Feature", nameof(Product), product.Id,
            previousValue: new { IsFeatured = prev }, newValue: new { product.IsFeatured }, ct: ct);
    }
}

/// <summary>Helper to enqueue SignalR notifications via Outbox after DB commit.</summary>
public static class OutboxNotify
{
    public static void EnqueueAdminEvent(IValoirDbContext db, string eventName, object payload)
    {
        var json = JsonSerializer.Serialize(payload);
        var msg = OutboxMessage.Create(
            type: "signalr.notify",
            payloadJson: JsonSerializer.Serialize(new
            {
                EventName = eventName,
                Group = "admin",
                PayloadJson = json
            }),
            idempotencyKey: $"signalr-{eventName}-{Guid.NewGuid():N}"[..60]);
        db.OutboxMessages.Add(msg);
    }
}
