using FluentValidation;
using MediatR;

namespace Valoir.Application.Buyer;

public record ShippingAddressDto(
    Guid Id, string Label, string FullName, string Phone, string Line1, string? Line2,
    string City, string? StateOrRegion, string PostalCode, string CountryCode, bool IsDefault);

public record CreateAddressCommand(
    string FullName, string Phone, string Line1, string City, string PostalCode, string CountryCode,
    string? Line2, string? StateOrRegion, string Label, bool IsDefault) : IRequest<Guid>;

public class CreateAddressCommandValidator : AbstractValidator<CreateAddressCommand>
{
    public CreateAddressCommandValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Phone).NotEmpty().MaximumLength(40);
        RuleFor(x => x.Line1).NotEmpty().MaximumLength(300);
        RuleFor(x => x.City).NotEmpty().MaximumLength(120);
        RuleFor(x => x.PostalCode).NotEmpty().MaximumLength(32);
        RuleFor(x => x.CountryCode).Length(2);
    }
}

public record UpdateAddressCommand(
    Guid AddressId, string FullName, string Phone, string Line1, string City, string PostalCode,
    string CountryCode, string? Line2, string? StateOrRegion, string Label, bool IsDefault) : IRequest;

public record DeleteAddressCommand(Guid AddressId) : IRequest;
public record ListAddressesQuery : IRequest<IReadOnlyList<ShippingAddressDto>>;
public record SetDefaultAddressCommand(Guid AddressId) : IRequest;

public record CheckoutLineDto(Guid VariantId, int Quantity);

public record CreateOrderCommand(
    Guid? ShippingAddressId,
    IReadOnlyList<CheckoutLineDto> Lines,
    decimal ShippingAmount) : IRequest<CreateOrderResult>;

public record CreateOrderResult(
    Guid OrderId, string OrderNumber, decimal TotalAmount, string? PaymentIntentId, string? ClientSecret, DateTime? ExpiresAt);

public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.Lines).NotEmpty();
        RuleForEach(x => x.Lines).ChildRules(l =>
        {
            l.RuleFor(x => x.VariantId).NotEmpty();
            l.RuleFor(x => x.Quantity).GreaterThan(0).LessThanOrEqualTo(20);
        });
        RuleFor(x => x.ShippingAmount).GreaterThanOrEqualTo(0);
    }
}

public record ListBuyerOrdersQuery(string? Status = null, int Page = 1, int PageSize = 20)
    : IRequest<BuyerOrdersResult>;

public record BuyerOrdersResult(IReadOnlyList<BuyerOrderListItem> Items, int Page, int PageSize, int TotalCount);

public record BuyerOrderListItem(
    Guid Id, string OrderNumber, decimal TotalAmount, string Status, DateTime CreatedAt, DateTime? PaidAt);

public record GetBuyerOrderDetailQuery(Guid OrderId) : IRequest<BuyerOrderDetailDto?>;

public record BuyerOrderDetailDto(
    Guid Id, string OrderNumber, decimal TotalAmount, decimal ShippingAmount, string Status,
    string? PaymentIntentId, DateTime CreatedAt, DateTime? PaidAt, DateTime? ExpiresAt,
    IReadOnlyList<BuyerVendorOrderDto> VendorOrders);

public record BuyerVendorOrderDto(
    Guid Id, Guid BoutiqueId, decimal Subtotal, string Status, string? TrackingNumber, string? Carrier,
    IReadOnlyList<BuyerOrderItemDto> Items);

public record BuyerOrderItemDto(Guid Id, Guid VariantId, int Quantity, decimal UnitPrice, string ProductTitle, string? Sku);
