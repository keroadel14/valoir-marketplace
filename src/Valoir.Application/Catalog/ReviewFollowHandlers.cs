using MediatR;
using Microsoft.EntityFrameworkCore;
using Valoir.Application.Common.Interfaces;
using Valoir.Domain.Entities;
using Valoir.Domain.Enums;
using Valoir.Domain.Exceptions;

namespace Valoir.Application.Catalog;

public record CreateReviewCommand(Guid ProductId, Guid OrderId, int Rating, string Body, string? Title) : IRequest<Guid>;
public record ListProductReviewsQuery(Guid ProductId, int Page = 1, int PageSize = 20) : IRequest<ReviewListResult>;
public record ReviewListResult(IReadOnlyList<ReviewDto> Items, double AverageRating, int TotalCount, int Page, int PageSize);
public record ReviewDto(Guid Id, Guid BuyerId, int Rating, string? Title, string Body, DateTime CreatedAt);

public record FollowBoutiqueCommand(Guid BoutiqueId) : IRequest;
public record UnfollowBoutiqueCommand(Guid BoutiqueId) : IRequest;
public record ListFollowedBoutiquesQuery : IRequest<IReadOnlyList<FollowedBoutiqueDto>>;
public record FollowedBoutiqueDto(Guid BoutiqueId, string StoreName, string Slug);

public record ListNotificationsQuery(int Page = 1, int PageSize = 30) : IRequest<NotificationListResult>;
public record NotificationListResult(IReadOnlyList<NotificationDto> Items, int UnreadCount, int Page, int PageSize, int TotalCount);
public record NotificationDto(Guid Id, string Type, string Title, string Message, string? LinkUrl, bool IsRead, DateTime CreatedAt);
public record MarkNotificationReadCommand(Guid NotificationId) : IRequest;
public record MarkAllNotificationsReadCommand : IRequest;

public class CreateReviewHandler : IRequestHandler<CreateReviewCommand, Guid>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _user;
    public CreateReviewHandler(IValoirDbContext db, ICurrentUserService user) { _db = db; _user = user; }

    public async Task<Guid> Handle(CreateReviewCommand r, CancellationToken ct)
    {
        var buyerId = _user.UserId ?? throw new DomainException("Not authenticated.");

        // Verified purchase: order belongs to buyer, is Paid+, and contains the product
        var order = await _db.Orders.AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == r.OrderId && o.BuyerId == buyerId, ct)
            ?? throw new DomainException("Order not found.");
        if (order.Status is OrderStatus.PendingPayment or OrderStatus.Cancelled)
            throw new DomainException("Order is not eligible for review.");

        var product = await _db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == r.ProductId, ct)
            ?? throw new DomainException("Product not found.");

        var purchased = await (
            from vo in _db.VendorOrders.AsNoTracking()
            join oi in _db.OrderItems.AsNoTracking() on vo.Id equals oi.VendorOrderId
            join v in _db.ProductVariants.AsNoTracking() on oi.VariantId equals v.Id
            where vo.OrderId == r.OrderId && v.ProductId == r.ProductId
            select oi.Id).AnyAsync(ct);
        if (!purchased)
            throw new DomainException("You can only review products you purchased on this order.");

        if (await _db.ProductReviews.AnyAsync(x => x.BuyerId == buyerId && x.ProductId == r.ProductId && x.OrderId == r.OrderId, ct))
            throw new DomainException("You already reviewed this product for this order.");

        var review = ProductReview.Create(r.ProductId, buyerId, r.OrderId, r.Rating, r.Body, r.Title);
        _db.ProductReviews.Add(review);
        await _db.SaveChangesAsync(ct);
        return review.Id;
    }
}

public class ListProductReviewsHandler : IRequestHandler<ListProductReviewsQuery, ReviewListResult>
{
    private readonly IValoirDbContext _db;
    public ListProductReviewsHandler(IValoirDbContext db) => _db = db;

    public async Task<ReviewListResult> Handle(ListProductReviewsQuery q, CancellationToken ct)
    {
        var baseQ = _db.ProductReviews.AsNoTracking().Where(r => r.ProductId == q.ProductId && r.IsVisible);
        var total = await baseQ.CountAsync(ct);
        var avg = total == 0 ? 0 : await baseQ.AverageAsync(r => (double)r.Rating, ct);
        var page = Math.Max(1, q.Page);
        var size = Math.Clamp(q.PageSize, 1, 50);
        var items = await baseQ.OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * size).Take(size)
            .Select(r => new ReviewDto(r.Id, r.BuyerId, r.Rating, r.Title, r.Body, r.CreatedAt))
            .ToListAsync(ct);
        return new ReviewListResult(items, Math.Round(avg, 2), total, page, size);
    }
}

public class FollowBoutiqueHandler : IRequestHandler<FollowBoutiqueCommand>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _user;
    public FollowBoutiqueHandler(IValoirDbContext db, ICurrentUserService user) { _db = db; _user = user; }

    public async Task Handle(FollowBoutiqueCommand r, CancellationToken ct)
    {
        var uid = _user.UserId ?? throw new DomainException("Not authenticated.");
        var boutique = await _db.Boutiques.AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == r.BoutiqueId && b.Status == BoutiqueStatus.Approved, ct)
            ?? throw new DomainException("Boutique not found.");
        if (await _db.SellerFollows.AnyAsync(f => f.BuyerId == uid && f.BoutiqueId == r.BoutiqueId, ct))
            return; // idempotent
        _db.SellerFollows.Add(SellerFollow.Create(uid, r.BoutiqueId));
        await _db.SaveChangesAsync(ct);
    }
}

public class UnfollowBoutiqueHandler : IRequestHandler<UnfollowBoutiqueCommand>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _user;
    public UnfollowBoutiqueHandler(IValoirDbContext db, ICurrentUserService user) { _db = db; _user = user; }

    public async Task Handle(UnfollowBoutiqueCommand r, CancellationToken ct)
    {
        var uid = _user.UserId ?? throw new DomainException("Not authenticated.");
        var f = await _db.SellerFollows.FirstOrDefaultAsync(x => x.BuyerId == uid && x.BoutiqueId == r.BoutiqueId, ct);
        if (f is null) return;
        _db.SellerFollows.Remove(f);
        await _db.SaveChangesAsync(ct);
    }
}

public class ListFollowedBoutiquesHandler : IRequestHandler<ListFollowedBoutiquesQuery, IReadOnlyList<FollowedBoutiqueDto>>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _user;
    public ListFollowedBoutiquesHandler(IValoirDbContext db, ICurrentUserService user) { _db = db; _user = user; }

    public async Task<IReadOnlyList<FollowedBoutiqueDto>> Handle(ListFollowedBoutiquesQuery request, CancellationToken ct)
    {
        var uid = _user.UserId ?? throw new DomainException("Not authenticated.");
        return await (
            from f in _db.SellerFollows.AsNoTracking()
            join b in _db.Boutiques.AsNoTracking() on f.BoutiqueId equals b.Id
            where f.BuyerId == uid
            select new FollowedBoutiqueDto(b.Id, b.StoreName, b.Slug)
        ).ToListAsync(ct);
    }
}

public class ListNotificationsHandler : IRequestHandler<ListNotificationsQuery, NotificationListResult>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _user;
    public ListNotificationsHandler(IValoirDbContext db, ICurrentUserService user) { _db = db; _user = user; }

    public async Task<NotificationListResult> Handle(ListNotificationsQuery q, CancellationToken ct)
    {
        var uid = _user.UserId ?? throw new DomainException("Not authenticated.");
        var baseQ = _db.UserNotifications.AsNoTracking().Where(n => n.UserId == uid);
        var total = await baseQ.CountAsync(ct);
        var unread = await baseQ.CountAsync(n => !n.IsRead, ct);
        var page = Math.Max(1, q.Page);
        var size = Math.Clamp(q.PageSize, 1, 50);
        var items = await baseQ.OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * size).Take(size)
            .Select(n => new NotificationDto(n.Id, n.Type, n.Title, n.Message, n.LinkUrl, n.IsRead, n.CreatedAt))
            .ToListAsync(ct);
        return new NotificationListResult(items, unread, page, size, total);
    }
}

public class MarkNotificationReadHandler : IRequestHandler<MarkNotificationReadCommand>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _user;
    public MarkNotificationReadHandler(IValoirDbContext db, ICurrentUserService user) { _db = db; _user = user; }

    public async Task Handle(MarkNotificationReadCommand r, CancellationToken ct)
    {
        var uid = _user.UserId ?? throw new DomainException("Not authenticated.");
        var n = await _db.UserNotifications.FirstOrDefaultAsync(x => x.Id == r.NotificationId && x.UserId == uid, ct)
            ?? throw new DomainException("Notification not found.");
        n.MarkRead();
        await _db.SaveChangesAsync(ct);
    }
}

public class MarkAllNotificationsReadHandler : IRequestHandler<MarkAllNotificationsReadCommand>
{
    private readonly IValoirDbContext _db;
    private readonly ICurrentUserService _user;
    public MarkAllNotificationsReadHandler(IValoirDbContext db, ICurrentUserService user) { _db = db; _user = user; }

    public async Task Handle(MarkAllNotificationsReadCommand request, CancellationToken ct)
    {
        var uid = _user.UserId ?? throw new DomainException("Not authenticated.");
        var list = await _db.UserNotifications.Where(n => n.UserId == uid && !n.IsRead).ToListAsync(ct);
        foreach (var n in list) n.MarkRead();
        await _db.SaveChangesAsync(ct);
    }
}
