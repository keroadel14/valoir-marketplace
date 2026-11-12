using Valoir.Domain.Common;
using Valoir.Domain.Exceptions;

namespace Valoir.Domain.Entities;

public class ProductReview : BaseEntity
{
    public Guid ProductId { get; private set; }
    public Guid BuyerId { get; private set; }
    public Guid OrderId { get; private set; }
    public int Rating { get; private set; }
    public string? Title { get; private set; }
    public string Body { get; private set; } = null!;
    public bool IsVisible { get; private set; } = true;

    private ProductReview() { }

    public static ProductReview Create(Guid productId, Guid buyerId, Guid orderId, int rating, string body, string? title = null)
    {
        if (rating < 1 || rating > 5) throw new DomainException("Rating must be 1–5.");
        if (string.IsNullOrWhiteSpace(body) || body.Trim().Length < 5)
            throw new DomainException("Review text must be at least 5 characters.");
        return new ProductReview
        {
            ProductId = productId,
            BuyerId = buyerId,
            OrderId = orderId,
            Rating = rating,
            Body = body.Trim(),
            Title = title?.Trim(),
            IsVisible = true
        };
    }

    public void Hide() { IsVisible = false; Touch(); }
    public void Show() { IsVisible = true; Touch(); }
}
