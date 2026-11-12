using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Valoir.Application.Common.Interfaces;
using Valoir.Domain.Entities;
using Valoir.Infrastructure.Identity;

namespace Valoir.Infrastructure.Persistence;

public class ValoirDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>, IValoirDbContext
{
    public ValoirDbContext(DbContextOptions<ValoirDbContext> options) : base(options) { }

    public DbSet<Boutique> Boutiques => Set<Boutique>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<VendorOrder> VendorOrders => Set<VendorOrder>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<InventoryReservation> InventoryReservations => Set<InventoryReservation>();
    public DbSet<VendorLedgerEntry> VendorLedgerEntries => Set<VendorLedgerEntry>();
    public DbSet<Dispute> Disputes => Set<Dispute>();
    public DbSet<AdminAuditLog> AdminAuditLogs => Set<AdminAuditLog>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();
    public DbSet<ProcessedStripeEvent> ProcessedStripeEvents => Set<ProcessedStripeEvent>();
    public DbSet<ShippingAddress> ShippingAddresses => Set<ShippingAddress>();
    public DbSet<ProductReview> ProductReviews => Set<ProductReview>();
    public DbSet<SellerFollow> SellerFollows => Set<SellerFollow>();
    public DbSet<UserNotification> UserNotifications => Set<UserNotification>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Boutique>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Slug).IsUnique();
            e.HasIndex(x => x.OwnerUserId);
            e.HasIndex(x => x.Status);
            e.Property(x => x.CommissionRate).HasPrecision(5, 4);
            e.Property(x => x.StoreName).HasMaxLength(200).IsRequired();
            e.Property(x => x.Slug).HasMaxLength(120).IsRequired();
            e.HasQueryFilter(x => !x.IsDeleted);
        });

        builder.Entity<Product>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Slug);
            e.HasIndex(x => x.BoutiqueId);
            e.HasIndex(x => x.Status);
            e.Property(x => x.BasePrice).HasPrecision(18, 2);
            e.Property(x => x.Title).HasMaxLength(300).IsRequired();
            e.Property(x => x.Slug).HasMaxLength(200).IsRequired();
            e.HasQueryFilter(x => !x.IsDeleted);
            e.HasMany(x => x.Variants).WithOne().HasForeignKey(v => v.ProductId);
        });

        builder.Entity<ProductVariant>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Sku);
            e.HasIndex(x => x.ProductId);
            e.Property(x => x.PriceOverride).HasPrecision(18, 2);
            e.Property(x => x.Sku).HasMaxLength(64).IsRequired();
        });

        builder.Entity<Order>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.OrderNumber).IsUnique();
            e.HasIndex(x => x.BuyerId);
            e.HasIndex(x => x.Status);
            e.HasIndex(x => x.StripePaymentIntentId);
            e.Property(x => x.TotalAmount).HasPrecision(18, 2);
            e.Property(x => x.ShippingAmount).HasPrecision(18, 2);
            e.Property(x => x.OrderNumber).HasMaxLength(40).IsRequired();
            e.HasMany(x => x.VendorOrders).WithOne().HasForeignKey(v => v.OrderId);
        });

        builder.Entity<VendorOrder>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.OrderId);
            e.HasIndex(x => x.BoutiqueId);
            e.HasIndex(x => x.Status);
            e.Property(x => x.Subtotal).HasPrecision(18, 2);
            e.Property(x => x.CommissionRateSnapshot).HasPrecision(5, 4);
            e.Property(x => x.CommissionAmount).HasPrecision(18, 2);
            e.Property(x => x.VendorNetPayout).HasPrecision(18, 2);
            e.Property(x => x.ShippingFee).HasPrecision(18, 2);
            e.HasMany(x => x.Items).WithOne().HasForeignKey(i => i.VendorOrderId);
        });

        builder.Entity<OrderItem>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.VendorOrderId);
            e.HasIndex(x => x.VariantId);
            e.Property(x => x.UnitPriceSnapshot).HasPrecision(18, 2);
            e.Property(x => x.ProductTitleSnapshot).HasMaxLength(300).IsRequired();
        });

        builder.Entity<InventoryReservation>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.VariantId);
            e.HasIndex(x => x.OrderId);
            e.HasIndex(x => new { x.IsReleased, x.IsConfirmed, x.ExpiresAt });
        });

        builder.Entity<VendorLedgerEntry>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.BoutiqueId);
            e.HasIndex(x => x.IdempotencyKey).IsUnique().HasFilter("\"IdempotencyKey\" IS NOT NULL");
            e.HasIndex(x => x.VendorOrderId);
            e.Property(x => x.Amount).HasPrecision(18, 2);
            e.Property(x => x.IdempotencyKey).HasMaxLength(120);
        });

        builder.Entity<Dispute>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.VendorOrderId);
            e.HasIndex(x => x.BoutiqueId);
            e.HasIndex(x => x.BuyerId);
            e.HasIndex(x => x.Status);
            e.Property(x => x.Reason).HasMaxLength(500).IsRequired();
        });

        builder.Entity<AdminAuditLog>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.AdminUserId);
            e.HasIndex(x => x.OccurredAt);
            e.HasIndex(x => new { x.TargetType, x.TargetId });
            e.Property(x => x.Action).HasMaxLength(200).IsRequired();
        });

        builder.Entity<RefreshToken>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.TokenHash).IsUnique();
            e.HasIndex(x => x.UserId);
            e.HasIndex(x => new { x.UserId, x.RevokedAt, x.ExpiresAt });
            e.Property(x => x.TokenHash).HasMaxLength(128).IsRequired();
        });

        
        builder.Entity<ShippingAddress>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.UserId);
            e.HasIndex(x => new { x.UserId, x.IsDefault });
            e.Property(x => x.FullName).HasMaxLength(200).IsRequired();
            e.Property(x => x.Phone).HasMaxLength(40).IsRequired();
            e.Property(x => x.Line1).HasMaxLength(300).IsRequired();
            e.Property(x => x.Line2).HasMaxLength(300);
            e.Property(x => x.City).HasMaxLength(120).IsRequired();
            e.Property(x => x.StateOrRegion).HasMaxLength(120);
            e.Property(x => x.PostalCode).HasMaxLength(32).IsRequired();
            e.Property(x => x.CountryCode).HasMaxLength(2).IsRequired();
            e.Property(x => x.Label).HasMaxLength(60).IsRequired();
        });

        
        builder.Entity<ProductReview>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.ProductId);
            e.HasIndex(x => x.BuyerId);
            e.HasIndex(x => new { x.BuyerId, x.ProductId, x.OrderId }).IsUnique();
            e.Property(x => x.Body).HasMaxLength(4000).IsRequired();
            e.Property(x => x.Title).HasMaxLength(200);
        });
        builder.Entity<SellerFollow>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.BuyerId, x.BoutiqueId }).IsUnique();
            e.HasIndex(x => x.BoutiqueId);
        });
        builder.Entity<UserNotification>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.UserId, x.IsRead });
            e.Property(x => x.Type).HasMaxLength(64).IsRequired();
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.Message).HasMaxLength(2000).IsRequired();
            e.Property(x => x.LinkUrl).HasMaxLength(500);
        });

        builder.Entity<OutboxMessage>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.Status, x.NextAttemptAt });
            e.HasIndex(x => x.IdempotencyKey).IsUnique().HasFilter("\"IdempotencyKey\" IS NOT NULL");
            e.Property(x => x.Type).HasMaxLength(200).IsRequired();
            e.Property(x => x.IdempotencyKey).HasMaxLength(120);
        });

        builder.Entity<ProcessedStripeEvent>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.EventId).IsUnique();
            e.Property(x => x.EventId).HasMaxLength(128).IsRequired();
            e.Property(x => x.EventType).HasMaxLength(120).IsRequired();
        });
    }
}
