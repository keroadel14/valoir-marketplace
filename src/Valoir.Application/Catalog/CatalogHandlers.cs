using MediatR;
using Microsoft.EntityFrameworkCore;
using Valoir.Application.Admin.Queries;
using Valoir.Application.Common.Interfaces;
using Valoir.Domain.Entities;
using Valoir.Domain.Enums;

namespace Valoir.Application.Catalog;

public class GetPublicProductsHandler : IRequestHandler<GetPublicProductsQuery, PagedResult<PublicProductListItemDto>>
{
    private readonly IValoirDbContext _db;
    public GetPublicProductsHandler(IValoirDbContext db) => _db = db;

    public async Task<PagedResult<PublicProductListItemDto>> Handle(GetPublicProductsQuery q, CancellationToken ct)
    {
        // Published products only, from Approved boutiques
        var query =
            from p in _db.Products.AsNoTracking()
            join b in _db.Boutiques.AsNoTracking() on p.BoutiqueId equals b.Id
            where p.Status == ProductStatus.Published && b.Status == BoutiqueStatus.Approved
            select new { p, b };

        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var s = q.Search.Trim().ToLower();
            query = query.Where(x => x.p.Title.ToLower().Contains(s) || x.p.Slug.ToLower().Contains(s));
        }
        if (q.BoutiqueId.HasValue)
            query = query.Where(x => x.p.BoutiqueId == q.BoutiqueId);
        if (!string.IsNullOrWhiteSpace(q.BoutiqueSlug))
            query = query.Where(x => x.b.Slug == q.BoutiqueSlug.Trim().ToLower());
        if (q.MinPrice.HasValue)
            query = query.Where(x => x.p.BasePrice >= q.MinPrice);
        if (q.MaxPrice.HasValue)
            query = query.Where(x => x.p.BasePrice <= q.MaxPrice);
        if (q.FeaturedOnly == true)
            query = query.Where(x => x.p.IsFeatured);

        var total = await query.CountAsync(ct);
        var page = Math.Max(1, q.Page);
        var size = Math.Clamp(q.PageSize, 1, 48);

        query = q.Sort switch
        {
            "price_asc" => query.OrderBy(x => x.p.BasePrice),
            "price_desc" => query.OrderByDescending(x => x.p.BasePrice),
            "featured" => query.OrderByDescending(x => x.p.IsFeatured).ThenByDescending(x => x.p.CreatedAt),
            _ => query.OrderByDescending(x => x.p.CreatedAt)
        };

        var pageRows = await query.Skip((page - 1) * size).Take(size).ToListAsync(ct);
        var productIds = pageRows.Select(x => x.p.Id).ToList();

        var stockByProduct = await _db.ProductVariants.AsNoTracking()
            .Where(v => productIds.Contains(v.ProductId))
            .GroupBy(v => v.ProductId)
            .Select(g => new { ProductId = g.Key, Available = g.Sum(v => v.StockQuantity - v.ReservedQuantity) })
            .ToDictionaryAsync(x => x.ProductId, x => Math.Max(0, x.Available), ct);

        var items = pageRows.Select(x => new PublicProductListItemDto(
            x.p.Id, x.p.BoutiqueId, x.b.StoreName, x.b.Slug,
            x.p.Title, x.p.Slug, x.p.BasePrice, x.p.IsFeatured, x.p.CreatedAt,
            stockByProduct.GetValueOrDefault(x.p.Id, 0)
        )).ToList();

        return new PagedResult<PublicProductListItemDto>(items, page, size, total);
    }
}

public class GetPublicProductBySlugHandler : IRequestHandler<GetPublicProductBySlugQuery, PublicProductDetailDto?>
{
    private readonly IValoirDbContext _db;
    public GetPublicProductBySlugHandler(IValoirDbContext db) => _db = db;

    public async Task<PublicProductDetailDto?> Handle(GetPublicProductBySlugQuery q, CancellationToken ct)
    {
        var slug = q.Slug.Trim().ToLowerInvariant();
        var row = await (
            from p in _db.Products.AsNoTracking().Include(x => x.Variants)
            join b in _db.Boutiques.AsNoTracking() on p.BoutiqueId equals b.Id
            where p.Slug == slug && p.Status == ProductStatus.Published && b.Status == BoutiqueStatus.Approved
            select new { p, b }
        ).FirstOrDefaultAsync(ct);

        if (row is null) return null;

        return new PublicProductDetailDto(
            row.p.Id, row.p.BoutiqueId, row.b.StoreName, row.b.Slug,
            row.p.Title, row.p.Slug, row.p.Description, row.p.BasePrice, row.p.IsFeatured, row.p.CreatedAt,
            row.p.Variants.Select(v => new PublicVariantDto(
                v.Id, v.Sku, v.ColorName, v.Size, v.AvailableQuantity, v.PriceOverride)).ToList());
    }
}

public class GetPublicBoutiqueHandler : IRequestHandler<GetPublicBoutiqueQuery, PublicBoutiqueDto?>
{
    private readonly IValoirDbContext _db;
    public GetPublicBoutiqueHandler(IValoirDbContext db) => _db = db;

    public async Task<PublicBoutiqueDto?> Handle(GetPublicBoutiqueQuery q, CancellationToken ct)
    {
        var slug = q.Slug.Trim().ToLowerInvariant();
        var b = await _db.Boutiques.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Slug == slug && x.Status == BoutiqueStatus.Approved, ct);
        if (b is null) return null;
        var count = await _db.Products.AsNoTracking()
            .CountAsync(p => p.BoutiqueId == b.Id && p.Status == ProductStatus.Published, ct);
        return new PublicBoutiqueDto(b.Id, b.StoreName, b.Slug, b.ApprovedAt, count);
    }
}
