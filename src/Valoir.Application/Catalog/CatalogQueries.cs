using MediatR;
using Valoir.Application.Admin.Queries;

namespace Valoir.Application.Catalog;

public record GetPublicProductsQuery(
    string? Search = null,
    Guid? BoutiqueId = null,
    string? BoutiqueSlug = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    bool? FeaturedOnly = null,
    string Sort = "newest",
    int Page = 1,
    int PageSize = 12) : IRequest<PagedResult<PublicProductListItemDto>>;

public record PublicProductListItemDto(
    Guid Id,
    Guid BoutiqueId,
    string BoutiqueName,
    string BoutiqueSlug,
    string Title,
    string Slug,
    decimal BasePrice,
    bool IsFeatured,
    DateTime CreatedAt,
    int AvailableStock);

public record GetPublicProductBySlugQuery(string Slug) : IRequest<PublicProductDetailDto?>;

public record PublicProductDetailDto(
    Guid Id,
    Guid BoutiqueId,
    string BoutiqueName,
    string BoutiqueSlug,
    string Title,
    string Slug,
    string? Description,
    decimal BasePrice,
    bool IsFeatured,
    DateTime CreatedAt,
    IReadOnlyList<PublicVariantDto> Variants);

public record PublicVariantDto(
    Guid Id,
    string Sku,
    string? ColorName,
    string? Size,
    int AvailableQuantity,
    decimal? PriceOverride);

public record GetPublicBoutiqueQuery(string Slug) : IRequest<PublicBoutiqueDto?>;

public record PublicBoutiqueDto(
    Guid Id,
    string StoreName,
    string Slug,
    DateTime? ApprovedAt,
    int ProductCount);
