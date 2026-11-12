using Valoir.Domain.Common;
using Valoir.Domain.Exceptions;

namespace Valoir.Domain.Entities;

public enum ProductStatus
{
    Draft = 0,
    PendingReview = 1,
    Published = 2,
    Unlisted = 3,
    Rejected = 4
}

public class Product : BaseEntity, ISoftDelete
{
    public Guid BoutiqueId { get; private set; }
    public Guid? CategoryId { get; private set; }
    public string Title { get; private set; } = null!;
    public string Slug { get; private set; } = null!;
    public string? Description { get; private set; }
    public decimal BasePrice { get; private set; }
    public ProductStatus Status { get; private set; } = ProductStatus.Draft;
    public bool IsFeatured { get; private set; }
    public string? UnlistReason { get; private set; }
    public bool IsDeleted { get; private set; }
    public DateTime? DeletedAt { get; private set; }

    private readonly List<ProductVariant> _variants = new();
    public IReadOnlyCollection<ProductVariant> Variants => _variants.AsReadOnly();

    private Product() { }

    public static Product Create(Guid boutiqueId, string title, string slug, decimal basePrice, string? description = null)
    {
        if (string.IsNullOrWhiteSpace(title)) throw new DomainException("Product title is required.");
        if (string.IsNullOrWhiteSpace(slug)) throw new DomainException("Product slug is required.");
        if (basePrice < 0) throw new DomainException("Base price cannot be negative.");

        return new Product
        {
            BoutiqueId = boutiqueId,
            Title = title.Trim(),
            Slug = slug.Trim().ToLowerInvariant(),
            BasePrice = basePrice,
            Description = description,
            Status = ProductStatus.Draft
        };
    }

    public void Publish()
    {
        if (Status == ProductStatus.Unlisted || Status == ProductStatus.Rejected)
            throw new DomainException("Cannot publish an unlisted or rejected product without re-approval.");
        Status = ProductStatus.Published;
        Touch();
    }

    public void ForceUnlist(string reason)
    {
        if (string.IsNullOrWhiteSpace(reason)) throw new DomainException("Unlist reason is required.");
        Status = ProductStatus.Unlisted;
        UnlistReason = reason.Trim();
        IsFeatured = false;
        Touch();
    }

    public void SetFeatured(bool featured)
    {
        if (featured && Status != ProductStatus.Published)
            throw new DomainException("Only published products can be featured.");
        IsFeatured = featured;
        Touch();
    }

    public void SoftDelete()
    {
        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;
        Touch();
    }

    public void AddVariant(ProductVariant variant)
    {
        if (variant.ProductId != Id && variant.ProductId != Guid.Empty)
            throw new DomainException("Variant does not belong to this product.");
        _variants.Add(variant);
    }
}

public class ProductVariant : BaseEntity
{
    public Guid ProductId { get; private set; }
    public string Sku { get; private set; } = null!;
    public string? ColorName { get; private set; }
    public string? ColorHex { get; private set; }
    public string? Size { get; private set; }
    public int StockQuantity { get; private set; }
    public int ReservedQuantity { get; private set; }
    public decimal? PriceOverride { get; private set; }

    public int AvailableQuantity => Math.Max(0, StockQuantity - ReservedQuantity);

    private ProductVariant() { }

    public static ProductVariant Create(Guid productId, string sku, int stock, string? colorName = null, string? colorHex = null, string? size = null, decimal? priceOverride = null)
    {
        if (string.IsNullOrWhiteSpace(sku)) throw new DomainException("SKU is required.");
        if (stock < 0) throw new DomainException("Stock cannot be negative.");

        return new ProductVariant
        {
            ProductId = productId,
            Sku = sku.Trim().ToUpperInvariant(),
            StockQuantity = stock,
            ReservedQuantity = 0,
            ColorName = colorName,
            ColorHex = colorHex,
            Size = size,
            PriceOverride = priceOverride
        };
    }

    public void Reserve(int quantity)
    {
        if (quantity <= 0) throw new DomainException("Reserve quantity must be positive.");
        if (AvailableQuantity < quantity)
            throw new DomainException($"Insufficient stock for SKU {Sku}. Available: {AvailableQuantity}");
        ReservedQuantity += quantity;
        Touch();
    }

    public void ReleaseReservation(int quantity)
    {
        if (quantity <= 0) return;
        ReservedQuantity = Math.Max(0, ReservedQuantity - quantity);
        Touch();
    }

    public void ConfirmSale(int quantity)
    {
        if (quantity <= 0) return;
        if (ReservedQuantity < quantity)
            throw new DomainException("Cannot confirm more than reserved quantity.");
        ReservedQuantity -= quantity;
        StockQuantity -= quantity;
        if (StockQuantity < 0) StockQuantity = 0;
        Touch();
    }

    public void AdjustStock(int newQuantity)
    {
        if (newQuantity < 0) throw new DomainException("Stock cannot be negative.");
        if (newQuantity < ReservedQuantity)
            throw new DomainException("Cannot set stock below currently reserved quantity.");
        StockQuantity = newQuantity;
        Touch();
    }
}
