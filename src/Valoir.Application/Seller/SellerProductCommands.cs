using FluentValidation;
using MediatR;

namespace Valoir.Application.Seller;

public record CreateSellerProductCommand(
    string Title,
    string Slug,
    decimal BasePrice,
    string? Description,
    string Sku,
    int StockQuantity,
    string? ColorName,
    string? Size,
    bool Publish
) : IRequest<Guid>;

public class CreateSellerProductCommandValidator : AbstractValidator<CreateSellerProductCommand>
{
    public CreateSellerProductCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(200)
            .Matches("^[a-z0-9]+(?:-[a-z0-9]+)*$");
        RuleFor(x => x.BasePrice).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Sku).NotEmpty().MaximumLength(64);
        RuleFor(x => x.StockQuantity).GreaterThanOrEqualTo(0);
    }
}

public record ListSellerProductsQuery(int Page = 1, int PageSize = 20) : IRequest<SellerProductListResult>;

public record SellerProductListResult(IReadOnlyList<SellerProductListItem> Items, int Page, int PageSize, int TotalCount);

public record SellerProductListItem(
    Guid Id, string Title, string Slug, decimal BasePrice, string Status, bool IsFeatured, DateTime CreatedAt);
