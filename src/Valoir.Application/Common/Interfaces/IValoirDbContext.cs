using Microsoft.EntityFrameworkCore;
using Valoir.Domain.Entities;

namespace Valoir.Application.Common.Interfaces;

public interface IValoirDbContext
{
    DbSet<Boutique> Boutiques { get; }
    DbSet<Product> Products { get; }
    DbSet<ProductVariant> ProductVariants { get; }
    DbSet<Order> Orders { get; }
    DbSet<VendorOrder> VendorOrders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<InventoryReservation> InventoryReservations { get; }
    DbSet<VendorLedgerEntry> VendorLedgerEntries { get; }
    DbSet<Dispute> Disputes { get; }
    DbSet<AdminAuditLog> AdminAuditLogs { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }
    DbSet<ProcessedStripeEvent> ProcessedStripeEvents { get; }
    DbSet<ShippingAddress> ShippingAddresses { get; }
    DbSet<ProductReview> ProductReviews { get; }
    DbSet<SellerFollow> SellerFollows { get; }
    DbSet<UserNotification> UserNotifications { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
