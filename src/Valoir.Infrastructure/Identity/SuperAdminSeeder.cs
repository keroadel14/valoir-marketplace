using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Valoir.Infrastructure.Identity;

/// <summary>
/// Idempotent SuperAdmin role + account seeder.
/// Credentials MUST come from configuration / environment variables.
/// Never hard-code passwords.
/// </summary>
public static class SuperAdminSeeder
{
    public const string SuperAdminRole = "SuperAdmin";
    public const string AdminRole = "Admin";
    public const string VendorRole = "Vendor";
    public const string BuyerRole = "Buyer";

    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("SuperAdminSeeder");

        // 1. Ensure roles exist (idempotent)
        foreach (var roleName in new[] { SuperAdminRole, AdminRole, VendorRole, BuyerRole })
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                var result = await roleManager.CreateAsync(new IdentityRole<Guid>(roleName));
                if (!result.Succeeded)
                    logger.LogError("Failed to create role {Role}: {Errors}", roleName, string.Join(", ", result.Errors.Select(e => e.Description)));
                else
                    logger.LogInformation("Created role {Role}", roleName);
            }
        }

        // 2. Read credentials from configuration (never hard-coded)
        var email = config["SuperAdmin:Email"] ?? Environment.GetEnvironmentVariable("VALOIR_SUPERADMIN_EMAIL");
        var password = config["SuperAdmin:Password"] ?? Environment.GetEnvironmentVariable("VALOIR_SUPERADMIN_PASSWORD");
        var fullName = config["SuperAdmin:FullName"] ?? "VALOIR Super Administrator";

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            logger.LogWarning(
                "SuperAdmin credentials not configured. Set SuperAdmin:Email / SuperAdmin:Password in appsettings or " +
                "VALOIR_SUPERADMIN_EMAIL / VALOIR_SUPERADMIN_PASSWORD environment variables. Skipping seed.");
            return;
        }

        // 3. Create or update the SuperAdmin user (idempotent)
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
                AccountStatus = Domain.Enums.UserAccountStatus.Active,
                CreatedAt = DateTime.UtcNow
            };

            var createResult = await userManager.CreateAsync(user, password);
            if (!createResult.Succeeded)
            {
                logger.LogError("Failed to create SuperAdmin user: {Errors}",
                    string.Join(", ", createResult.Errors.Select(e => e.Description)));
                return;
            }
            logger.LogInformation("Created SuperAdmin user {Email}", email);
        }
        else
        {
            logger.LogInformation("SuperAdmin user {Email} already exists", email);
        }

        // 4. Ensure SuperAdmin role is assigned (and only SuperAdmin can hold it via policy)
        if (!await userManager.IsInRoleAsync(user, SuperAdminRole))
        {
            var roleResult = await userManager.AddToRoleAsync(user, SuperAdminRole);
            if (!roleResult.Succeeded)
                logger.LogError("Failed to assign SuperAdmin role: {Errors}",
                    string.Join(", ", roleResult.Errors.Select(e => e.Description)));
            else
                logger.LogInformation("Assigned SuperAdmin role to {Email}", email);
        }

        // Also ensure Admin role for backward compatibility with existing [Authorize(Roles = "Admin")]
        if (!await userManager.IsInRoleAsync(user, AdminRole))
        {
            await userManager.AddToRoleAsync(user, AdminRole);
        }
    }
}
