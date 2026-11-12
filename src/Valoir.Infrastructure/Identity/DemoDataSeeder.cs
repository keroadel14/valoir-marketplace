using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Valoir.Domain.Entities;
using Valoir.Domain.Enums;
using Valoir.Infrastructure.Persistence;

namespace Valoir.Infrastructure.Identity;

/// <summary>
/// Idempotent portfolio demo data. Enable with Demo:Enabled=true (Development only recommended).
/// Password for all demo accounts: see Demo:Password / default Demo@Valoir2026!
/// </summary>
public static class DemoDataSeeder
{
    public const string MarkerEmail = "demo.marker@valoir.local";
    public const int TargetProductCount = 120;

    private static readonly (string Email, string Name, string Store, string Slug)[] Sellers =
    {
        ("seller1@demo.valoir", "Amira Hassan", "Maison Lumière", "maison-lumiere"),
        ("seller2@demo.valoir", "James Whitfield", "Atelier Noir", "atelier-noir"),
        ("seller3@demo.valoir", "Layla Al-Rashid", "Pearl & Thread", "pearl-and-thread"),
        ("seller4@demo.valoir", "Marco Bellini", "Casa Bellini", "casa-bellini"),
    };

    private static readonly (string Email, string Name)[] Buyers =
    {
        ("buyer1@demo.valoir", "Sara Ahmed"),
        ("buyer2@demo.valoir", "Omar Khalil"),
        ("buyer3@demo.valoir", "Emma Thompson"),
        ("buyer4@demo.valoir", "Youssef Nasser"),
        ("buyer5@demo.valoir", "Chloe Martin"),
        ("buyer6@demo.valoir", "Nour Ibrahim"),
        ("buyer7@demo.valoir", "Daniel Reed"),
    };

    // Logical categories (no Category table required) — used in titles/descriptions
    private static readonly (string Key, string En, int Count, decimal MinPrice, decimal MaxPrice)[] Categories =
    {
        ("fashion", "Clothing & Fashion", 20, 180, 2200),
        ("shoes", "Shoes", 15, 220, 1800),
        ("bags", "Bags & Accessories", 15, 150, 3200),
        ("electronics", "Electronics", 20, 90, 4500),
        ("home", "Home & Living", 15, 80, 2800),
        ("beauty", "Beauty & Personal Care", 15, 45, 650),
        ("jewelry", "Watches & Jewelry", 10, 300, 8500),
        ("sports", "Sports & Lifestyle", 10, 70, 1200),
    };

    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var sp = scope.ServiceProvider;
        var config = sp.GetRequiredService<IConfiguration>();
        var logger = sp.GetRequiredService<ILoggerFactory>().CreateLogger("DemoDataSeeder");

        var enabled = config.GetValue("Demo:Enabled", false)
                      || string.Equals(config["Demo:Enabled"], "true", StringComparison.OrdinalIgnoreCase)
                      || string.Equals(Environment.GetEnvironmentVariable("VALOIR_DEMO_ENABLED"), "true", StringComparison.OrdinalIgnoreCase);

        if (!enabled)
        {
            logger.LogInformation("Demo seeder disabled (set Demo:Enabled=true or VALOIR_DEMO_ENABLED=true).");
            return;
        }

        var password = config["Demo:Password"]
                       ?? Environment.GetEnvironmentVariable("VALOIR_DEMO_PASSWORD")
                       ?? "Demo@Valoir2026!";

        var userManager = sp.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = sp.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var db = sp.GetRequiredService<ValoirDbContext>();

        foreach (var role in new[] { SuperAdminSeeder.VendorRole, SuperAdminSeeder.BuyerRole, SuperAdminSeeder.AdminRole })
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
        }

        // SuperAdmin for boutique approvals
        var adminEmail = config["SuperAdmin:Email"] ?? Environment.GetEnvironmentVariable("VALOIR_SUPERADMIN_EMAIL");
        var adminUser = !string.IsNullOrWhiteSpace(adminEmail)
            ? await userManager.FindByEmailAsync(adminEmail)
            : null;
        var adminId = adminUser?.Id ?? Guid.Empty;

        // ── Sellers + boutiques ──────────────────────────────────────────
        var boutiques = new List<Boutique>();
        foreach (var s in Sellers)
        {
            var user = await EnsureUserAsync(userManager, s.Email, s.Name, password, SuperAdminSeeder.VendorRole, logger);
            var boutique = await db.Boutiques.FirstOrDefaultAsync(b => b.Slug == s.Slug);
            if (boutique is null)
            {
                boutique = Boutique.Create(user.Id, s.Store, s.Slug, "DEMO-VAT-" + s.Slug.ToUpperInvariant());
                if (adminId != Guid.Empty)
                    boutique.Approve(adminId);
                else
                {
                    // Approve without admin: set via Approve requires admin — use empty is ok for portfolio if we force status
                    // Domain Approve needs any Guid
                    boutique.Approve(user.Id);
                }
                db.Boutiques.Add(boutique);
                await db.SaveChangesAsync();
                logger.LogInformation("Created boutique {Slug}", s.Slug);
            }
            else if (boutique.Status != BoutiqueStatus.Approved)
            {
                boutique.Approve(adminId != Guid.Empty ? adminId : user.Id);
                await db.SaveChangesAsync();
            }
            boutiques.Add(boutique);
        }

        // ── Buyers ───────────────────────────────────────────────────────
        var buyerUsers = new List<ApplicationUser>();
        foreach (var b in Buyers)
        {
            var user = await EnsureUserAsync(userManager, b.Email, b.Name, password, SuperAdminSeeder.BuyerRole, logger);
            buyerUsers.Add(user);
        }

        // ── Products (exactly 120) ───────────────────────────────────────
        var existingDemoCount = await db.Products.CountAsync(p => p.Slug.StartsWith("demo-"));
        if (existingDemoCount < TargetProductCount)
        {
            var toCreate = TargetProductCount - existingDemoCount;
            logger.LogInformation("Creating {Count} demo products (have {Have})", toCreate, existingDemoCount);
            var productIndex = existingDemoCount;
            var rng = new Random(42); // deterministic
            var boutiqueIds = boutiques.Select(b => b.Id).ToList();

            foreach (var cat in Categories)
            {
                for (var i = 0; i < cat.Count; i++)
                {
                    if (productIndex >= TargetProductCount) break;
                    var n = productIndex + 1;
                    var slug = $"demo-{cat.Key}-{n:D3}";
                    if (await db.Products.AnyAsync(p => p.Slug == slug))
                    {
                        productIndex++;
                        continue;
                    }

                    var title = BuildTitle(cat.Key, n, cat.En);
                    var price = Math.Round((decimal)(rng.NextDouble() * (double)(cat.MaxPrice - cat.MinPrice) + (double)cat.MinPrice), 2);
                    var boutiqueId = boutiqueIds[productIndex % boutiqueIds.Count];
                    var desc =
                        $"{cat.En}. Premium VALOIR demo piece #{n}. " +
                        $"وصف تجريبي فاخر ضمن فئة {cat.En}. Crafted for portfolio demonstration — not a commercial listing.";

                    var product = Product.Create(boutiqueId, title, slug, price, desc);
                    product.Publish();
                    if (n % 11 == 0)
                        product.SetFeatured(true);

                    db.Products.Add(product);
                    await db.SaveChangesAsync();

                    var stock = rng.Next(5, 80);
                    var variant = ProductVariant.Create(
                        product.Id,
                        $"SKU-DEMO-{n:D4}",
                        stock,
                        colorName: n % 3 == 0 ? "Champagne" : n % 3 == 1 ? "Obsidian" : "Ivory",
                        size: cat.Key is "fashion" or "shoes" ? (n % 2 == 0 ? "M" : "L") : null);
                    db.ProductVariants.Add(variant);
                    await db.SaveChangesAsync();

                    productIndex++;
                }
            }
            logger.LogInformation("Demo products now: {Count}", await db.Products.CountAsync(p => p.Slug.StartsWith("demo-")));
        }
        else
        {
            logger.LogInformation("Demo products already present: {Count}", existingDemoCount);
        }

        // ── Orders (multi-vendor samples) ────────────────────────────────
        await SeedOrdersAsync(db, buyerUsers, boutiques, logger);

        // ── Reviews (verified only) ──────────────────────────────────────
        await SeedReviewsAsync(db, logger);

        // ── Notifications ────────────────────────────────────────────────
        await SeedNotificationsAsync(db, buyerUsers, logger);

        logger.LogInformation(
            "Demo seed complete. Sellers={S} Buyers={B} Products={P} Orders={O} Reviews={R} Notifications={N}",
            Sellers.Length, Buyers.Length,
            await db.Products.CountAsync(p => p.Slug.StartsWith("demo-")),
            await db.Orders.CountAsync(o => o.StripePaymentIntentId != null && o.StripePaymentIntentId.StartsWith("pi_demo")),
            await db.ProductReviews.CountAsync(r => r.Body.Contains("VALOIR demo")),
            await db.UserNotifications.CountAsync(n => n.Type.StartsWith("demo.")));
    }

    private static async Task<ApplicationUser> EnsureUserAsync(
        UserManager<ApplicationUser> userManager,
        string email,
        string fullName,
        string password,
        string role,
        ILogger logger)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                FullName = fullName,
                HasAcceptedTerms = true,
                AcceptedTermsAt = DateTime.UtcNow,
                HasAcceptedPrivacyPolicy = true,
                AcceptedPrivacyPolicyAt = DateTime.UtcNow,
                PreferredLanguage = "en",
                PreferredTheme = "system",
                AccountStatus = UserAccountStatus.Active,
                CreatedAt = DateTime.UtcNow
            };
            var result = await userManager.CreateAsync(user, password);
            if (!result.Succeeded)
                throw new InvalidOperationException($"Failed to create {email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            logger.LogInformation("Created demo user {Email} ({Role})", email, role);
        }

        if (!await userManager.IsInRoleAsync(user, role))
            await userManager.AddToRoleAsync(user, role);

        return user;
    }

    private static string BuildTitle(string key, int n, string categoryEn) => key switch
    {
        "fashion" => $"Silk Tailored Blazer {n}",
        "shoes" => $"Handcrafted Leather Oxford {n}",
        "bags" => $"Calfskin Crossbody Bag {n}",
        "electronics" => $"Minimal Wireless Earbuds {n}",
        "home" => $"Artisan Ceramic Vase {n}",
        "beauty" => $"Botanical Serum Collection {n}",
        "jewelry" => $"18k Gold Accent Pendant {n}",
        "sports" => $"Performance Linen Set {n}",
        _ => $"VALOIR Piece {n} ({categoryEn})"
    };

    private static async Task SeedOrdersAsync(
        ValoirDbContext db,
        List<ApplicationUser> buyers,
        List<Boutique> boutiques,
        ILogger logger)
    {
        // Idempotency: any order with mock PI prefix pi_demo_
        if (await db.Orders.AnyAsync(o => o.StripePaymentIntentId != null && o.StripePaymentIntentId.StartsWith("pi_demo")))
        {
            logger.LogInformation("Demo orders already exist — skipping.");
            return;
        }

        var products = await db.Products.Where(p => p.Slug.StartsWith("demo-") && p.Status == ProductStatus.Published)
            .Take(40).ToListAsync();
        var variants = await db.ProductVariants
            .Where(v => products.Select(p => p.Id).Contains(v.ProductId))
            .ToListAsync();

        if (products.Count < 4 || variants.Count < 4 || buyers.Count < 3)
        {
            logger.LogWarning("Not enough catalog data for demo orders.");
            return;
        }

        var scenarios = new[]
        {
            VendorOrderStatus.Paid,
            VendorOrderStatus.Processing,
            VendorOrderStatus.Shipped,
            VendorOrderStatus.Delivered,
            VendorOrderStatus.Delivered,
            VendorOrderStatus.Paid,
            VendorOrderStatus.Shipped,
            VendorOrderStatus.Cancelled,
        };

        for (var i = 0; i < scenarios.Length; i++)
        {
            var buyer = buyers[i % buyers.Count];
            var order = Order.Create(buyer.Id, shippingAmount: 25m, holdDuration: TimeSpan.FromMinutes(10));
            db.Orders.Add(order);
            await db.SaveChangesAsync();

            var selected = new[] { variants[i % variants.Count], variants[(i + 5) % variants.Count] };
            var byBoutique = selected
                .Select(v => (Variant: v, Product: products.First(p => p.Id == v.ProductId)))
                .GroupBy(x => x.Product.BoutiqueId);

            var vendorOrders = new List<VendorOrder>();
            foreach (var group in byBoutique)
            {
                var bout = boutiques.FirstOrDefault(b => b.Id == group.Key)
                           ?? await db.Boutiques.FirstAsync(b => b.Id == group.Key);
                var vo = VendorOrder.Create(order.Id, group.Key, bout.CommissionRate, 0m);
                db.VendorOrders.Add(vo);
                await db.SaveChangesAsync();

                foreach (var row in group)
                {
                    var item = OrderItem.Create(vo.Id, row.Variant.Id, 1, row.Product.BasePrice, row.Product.Title, row.Variant.Sku);
                    vo.AddItem(item);
                    db.OrderItems.Add(item);
                }
                await db.SaveChangesAsync();
                vendorOrders.Add(vo);
            }

            order.AttachPaymentIntent($"pi_demo_{i:D2}_{order.Id:N}"[..28]);
            var merchandise = vendorOrders.Sum(v => v.Subtotal + v.ShippingFee);
            order.SetComputedTotal(merchandise, 25m);

            var target = scenarios[i];
            if (target == VendorOrderStatus.Cancelled)
            {
                order.MarkFailedOrCancelled();
                foreach (var vo in vendorOrders)
                    vo.MarkCancelled();
            }
            else
            {
                order.MarkPaid();
                foreach (var vo in vendorOrders)
                {
                    // Parent MarkPaid does not update VOs loaded outside aggregate
                    vo.MarkPaid();
                    if (target is VendorOrderStatus.Processing or VendorOrderStatus.Shipped or VendorOrderStatus.Delivered)
                        vo.MarkProcessing();
                    if (target is VendorOrderStatus.Shipped or VendorOrderStatus.Delivered)
                        vo.MarkShipped($"TRK-DEMO-{i:D5}", i % 2 == 0 ? "DHL" : "Aramex");
                    if (target is VendorOrderStatus.Delivered)
                        vo.MarkDelivered();
                }
            }

            await db.SaveChangesAsync();
        }

        logger.LogInformation("Created {Count} demo orders", scenarios.Length);
    }

    private static async Task SeedReviewsAsync(ValoirDbContext db, ILogger logger)
    {
        if (await db.ProductReviews.AnyAsync(r => r.Body.Contains("VALOIR demo review")))
        {
            logger.LogInformation("Demo reviews already exist — skipping.");
            return;
        }

        // Delivered vendor orders → review products
        var delivered = await (
            from vo in db.VendorOrders
            join o in db.Orders on vo.OrderId equals o.Id
            join oi in db.OrderItems on vo.Id equals oi.VendorOrderId
            join v in db.ProductVariants on oi.VariantId equals v.Id
            where vo.Status == VendorOrderStatus.Delivered
            select new { o.BuyerId, o.Id, ProductId = v.ProductId }
        ).Distinct().Take(15).ToListAsync();

        var texts = new[]
        {
            "VALOIR demo review: Exceptional quality and packaging. Highly recommend.",
            "VALOIR demo review: Beautiful piece, matches the photos. شحن سريع وتغليف فاخر.",
            "VALOIR demo review: Worth every dirham — craftsmanship is outstanding.",
            "VALOIR demo review: Soft materials and elegant finish. سأعود للشراء مرة أخرى.",
            "VALOIR demo review: Arrived quickly, exactly as described.",
        };

        var i = 0;
        foreach (var row in delivered)
        {
            if (await db.ProductReviews.AnyAsync(r =>
                    r.BuyerId == row.BuyerId && r.ProductId == row.ProductId && r.OrderId == row.Id))
                continue;

            var rating = 3 + (i % 3); // 3–5
            var review = ProductReview.Create(row.ProductId, row.BuyerId, row.Id, rating, texts[i % texts.Length], "Demo experience");
            db.ProductReviews.Add(review);
            i++;
        }
        await db.SaveChangesAsync();
        logger.LogInformation("Created {Count} demo reviews", i);
    }

    private static async Task SeedNotificationsAsync(
        ValoirDbContext db,
        List<ApplicationUser> buyers,
        ILogger logger)
    {
        if (await db.UserNotifications.AnyAsync(n => n.Type.StartsWith("demo.")))
        {
            logger.LogInformation("Demo notifications already exist — skipping.");
            return;
        }

        foreach (var buyer in buyers.Take(5))
        {
            db.UserNotifications.Add(UserNotification.Create(
                buyer.Id, "demo.welcome", "Welcome to VALOIR",
                "Explore curated boutiques and luxury essentials. (Demo notification)",
                "/shop"));
            db.UserNotifications.Add(UserNotification.Create(
                buyer.Id, "demo.order", "Order update",
                "Your demo order is being prepared by the boutique.",
                "/account/orders"));
        }
        await db.SaveChangesAsync();
        logger.LogInformation("Demo notifications seeded.");
    }
}
