using MediatR;
using Microsoft.EntityFrameworkCore;
using Valoir.Application.Common.Interfaces;
using Valoir.Domain.Entities;
using Valoir.Domain.Enums;
using Valoir.Domain.Exceptions;

namespace Valoir.Application.Seller;

public class CreateSellerProductHandler : IRequestHandler<CreateSellerProductCommand, Guid>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _user;

    public CreateSellerProductHandler(IValoirDbContext db, ICurrentUserService user)
    {
        _db = db;
        _user = user;
    }

    public async Task<Guid> Handle(CreateSellerProductCommand request, CancellationToken ct)
    {
        var userId = _user.UserId ?? throw new DomainException("Not authenticated.");
        var boutique = await _db.Boutiques.FirstOrDefaultAsync(b => b.OwnerUserId == userId, ct)
            ?? throw new DomainException("No boutique found for this account.");
        if (boutique.Status != BoutiqueStatus.Approved)
            throw new DomainException("Boutique must be Approved before publishing products.");

        var slug = request.Slug.Trim().ToLowerInvariant();
        if (await _db.Products.AnyAsync(p => p.BoutiqueId == boutique.Id && p.Slug == slug, ct))
            throw new DomainException("A product with this slug already exists in your boutique.");

        var product = Product.Create(boutique.Id, request.Title, slug, request.BasePrice, request.Description);
        _db.Products.Add(product);
        await _db.SaveChangesAsync(ct);

        var variant = ProductVariant.Create(product.Id, request.Sku, request.StockQuantity, request.ColorName, size: request.Size);
        _db.ProductVariants.Add(variant);

        if (request.Publish)
            product.Publish();

        await _db.SaveChangesAsync(ct);
        return product.Id;
    }
}

public class ListSellerProductsHandler : IRequestHandler<ListSellerProductsQuery, SellerProductListResult>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _user;

    public ListSellerProductsHandler(IValoirDbContext db, ICurrentUserService user)
    {
        _db = db;
        _user = user;
    }

    public async Task<SellerProductListResult> Handle(ListSellerProductsQuery request, CancellationToken ct)
    {
        var userId = _user.UserId ?? throw new DomainException("Not authenticated.");
        var boutique = await _db.Boutiques.AsNoTracking().FirstOrDefaultAsync(b => b.OwnerUserId == userId, ct)
            ?? throw new DomainException("No boutique found.");

        var q = _db.Products.AsNoTracking().Where(p => p.BoutiqueId == boutique.Id);
        var total = await q.CountAsync(ct);
        var page = Math.Max(1, request.Page);
        var size = Math.Clamp(request.PageSize, 1, 100);
        var items = await q.OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * size).Take(size)
            .Select(p => new SellerProductListItem(p.Id, p.Title, p.Slug, p.BasePrice, p.Status.ToString(), p.IsFeatured, p.CreatedAt))
            .ToListAsync(ct);
        return new SellerProductListResult(items, page, size, total);
    }
}
