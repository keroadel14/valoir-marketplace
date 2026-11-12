using System.Security.Cryptography;
using System.Text;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Valoir.Application.Auth.Commands;
using Valoir.Application.Auth.DTOs;
using Valoir.Application.Common.Interfaces;
using Valoir.Domain.Entities;
using Valoir.Domain.Enums;
using Valoir.Domain.Exceptions;
using Valoir.Infrastructure.Identity;

namespace Valoir.Infrastructure.Services;

public class RegisterBuyerHandler : IRequestHandler<RegisterBuyerCommand, AuthResponse>
{
    private readonly UserManager<ApplicationUser> _users;
    private readonly IValoirDbContext _db;
    private readonly ITokenService _tokens;

    public RegisterBuyerHandler(UserManager<ApplicationUser> users, IValoirDbContext db, ITokenService tokens)
    {
        _users = users;
        _db = db;
        _tokens = tokens;
    }

    public async Task<AuthResponse> Handle(RegisterBuyerCommand cmd, CancellationToken ct)
    {
        var req = cmd.Request;
        if (!req.AcceptTerms || !req.AcceptPrivacyPolicy)
            throw new DomainException("Terms and Privacy Policy must be accepted.");

        if (await _users.FindByEmailAsync(req.Email) is not null)
            throw new DomainException("Email is already registered.");

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = req.Email.Trim().ToLowerInvariant(),
            Email = req.Email.Trim().ToLowerInvariant(),
            EmailConfirmed = true,
            FullName = req.FullName.Trim(),
            HasAcceptedTerms = true,
            AcceptedTermsAt = DateTime.UtcNow,
            HasAcceptedPrivacyPolicy = true,
            AcceptedPrivacyPolicyAt = DateTime.UtcNow,
            TermsAcceptanceIp = cmd.IpAddress,
            PreferredLanguage = string.IsNullOrWhiteSpace(req.PreferredLanguage) ? "en" : req.PreferredLanguage,
            PreferredTheme = "system",
            AccountStatus = UserAccountStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _users.CreateAsync(user, req.Password);
        if (!result.Succeeded)
            throw new DomainException(string.Join("; ", result.Errors.Select(e => e.Description)));

        await _users.AddToRoleAsync(user, SuperAdminSeeder.BuyerRole);
        // Never assign Admin/SuperAdmin from public registration

        return await IssueTokensAsync(user, cmd.IpAddress, ct);
    }

    private async Task<AuthResponse> IssueTokensAsync(ApplicationUser user, string? ip, CancellationToken ct)
    {
        var roles = await _users.GetRolesAsync(user);
        Guid? boutiqueId = null;
        string? boutiqueStatus = null;

        if (roles.Contains(SuperAdminSeeder.VendorRole))
        {
            var boutique = await _db.Boutiques.AsNoTracking()
                .FirstOrDefaultAsync(b => b.OwnerUserId == user.Id, ct);
            if (boutique is not null)
            {
                boutiqueId = boutique.Id;
                boutiqueStatus = boutique.Status.ToString();
            }
        }

        var (access, accessExp) = _tokens.CreateAccessToken(user.Id, user.Email!, roles, boutiqueId);
        var refreshPlain = _tokens.GenerateRefreshToken();
        var refreshHash = _tokens.HashToken(refreshPlain);
        var refreshExp = DateTime.UtcNow.AddDays(14);

        _db.RefreshTokens.Add(RefreshToken.Create(user.Id, refreshHash, refreshExp, ip));
        await _db.SaveChangesAsync(ct);

        return new AuthResponse(access, refreshPlain, accessExp, refreshExp, user.Id, user.Email!, user.FullName ?? "",
            roles.ToList(), boutiqueId, boutiqueStatus);
    }
}

public class RegisterVendorHandler : IRequestHandler<RegisterVendorCommand, AuthResponse>
{
    private readonly UserManager<ApplicationUser> _users;
    private readonly IValoirDbContext _db;
    private readonly ITokenService _tokens;

    public RegisterVendorHandler(UserManager<ApplicationUser> users, IValoirDbContext db, ITokenService tokens)
    {
        _users = users;
        _db = db;
        _tokens = tokens;
    }

    public async Task<AuthResponse> Handle(RegisterVendorCommand cmd, CancellationToken ct)
    {
        var req = cmd.Request;
        if (!req.AcceptTerms || !req.AcceptPrivacyPolicy || !req.AcceptVendorAgreement)
            throw new DomainException("All legal agreements must be accepted.");

        if (await _users.FindByEmailAsync(req.Email) is not null)
            throw new DomainException("Email is already registered.");

        var slug = req.Slug.Trim().ToLowerInvariant();
        if (await _db.Boutiques.AnyAsync(b => b.Slug == slug, ct))
            throw new DomainException("Store slug is already taken.");

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = req.Email.Trim().ToLowerInvariant(),
            Email = req.Email.Trim().ToLowerInvariant(),
            EmailConfirmed = true,
            FullName = req.FullName.Trim(),
            HasAcceptedTerms = true,
            AcceptedTermsAt = DateTime.UtcNow,
            HasAcceptedPrivacyPolicy = true,
            AcceptedPrivacyPolicyAt = DateTime.UtcNow,
            TermsAcceptanceIp = cmd.IpAddress,
            PreferredLanguage = string.IsNullOrWhiteSpace(req.PreferredLanguage) ? "en" : req.PreferredLanguage,
            PreferredTheme = "system",
            AccountStatus = UserAccountStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _users.CreateAsync(user, req.Password);
        if (!result.Succeeded)
            throw new DomainException(string.Join("; ", result.Errors.Select(e => e.Description)));

        await _users.AddToRoleAsync(user, SuperAdminSeeder.VendorRole);

        var boutique = Boutique.Create(user.Id, req.StoreName, slug, req.TradeLicenseOrVatId);
        _db.Boutiques.Add(boutique);
        await _db.SaveChangesAsync(ct);

        var roles = await _users.GetRolesAsync(user);
        var (access, accessExp) = _tokens.CreateAccessToken(user.Id, user.Email!, roles, boutique.Id);
        var refreshPlain = _tokens.GenerateRefreshToken();
        var refreshHash = _tokens.HashToken(refreshPlain);
        var refreshExp = DateTime.UtcNow.AddDays(14);
        _db.RefreshTokens.Add(RefreshToken.Create(user.Id, refreshHash, refreshExp, cmd.IpAddress));
        await _db.SaveChangesAsync(ct);

        return new AuthResponse(access, refreshPlain, accessExp, refreshExp, user.Id, user.Email!, user.FullName ?? "",
            roles.ToList(), boutique.Id, boutique.Status.ToString());
    }
}

public class LoginHandler : IRequestHandler<LoginCommand, AuthResponse>
{
    private readonly UserManager<ApplicationUser> _users;
    private readonly SignInManager<ApplicationUser> _signIn;
    private readonly IValoirDbContext _db;
    private readonly ITokenService _tokens;

    public LoginHandler(UserManager<ApplicationUser> users, SignInManager<ApplicationUser> signIn, IValoirDbContext db, ITokenService tokens)
    {
        _users = users;
        _signIn = signIn;
        _db = db;
        _tokens = tokens;
    }

    public async Task<AuthResponse> Handle(LoginCommand cmd, CancellationToken ct)
    {
        var user = await _users.FindByEmailAsync(cmd.Request.Email.Trim().ToLowerInvariant())
            ?? throw new DomainException("Invalid email or password.");

        if (user.AccountStatus == UserAccountStatus.Suspended)
            throw new DomainException("Account is suspended.");

        var check = await _signIn.CheckPasswordSignInAsync(user, cmd.Request.Password, lockoutOnFailure: true);
        if (!check.Succeeded)
            throw new DomainException("Invalid email or password.");

        var roles = await _users.GetRolesAsync(user);
        Guid? boutiqueId = null;
        string? boutiqueStatus = null;
        if (roles.Contains(SuperAdminSeeder.VendorRole))
        {
            var b = await _db.Boutiques.AsNoTracking().FirstOrDefaultAsync(x => x.OwnerUserId == user.Id, ct);
            if (b is not null) { boutiqueId = b.Id; boutiqueStatus = b.Status.ToString(); }
        }

        var (access, accessExp) = _tokens.CreateAccessToken(user.Id, user.Email!, roles, boutiqueId);
        var refreshPlain = _tokens.GenerateRefreshToken();
        var refreshHash = _tokens.HashToken(refreshPlain);
        var refreshExp = DateTime.UtcNow.AddDays(14);
        _db.RefreshTokens.Add(RefreshToken.Create(user.Id, refreshHash, refreshExp, cmd.IpAddress));
        await _db.SaveChangesAsync(ct);

        return new AuthResponse(access, refreshPlain, accessExp, refreshExp, user.Id, user.Email!, user.FullName ?? "",
            roles.ToList(), boutiqueId, boutiqueStatus);
    }
}

public class RefreshTokenHandler : IRequestHandler<RefreshTokenCommand, AuthResponse>
{
    private readonly UserManager<ApplicationUser> _users;
    private readonly IValoirDbContext _db;
    private readonly ITokenService _tokens;

    public RefreshTokenHandler(UserManager<ApplicationUser> users, IValoirDbContext db, ITokenService tokens)
    {
        _users = users;
        _db = db;
        _tokens = tokens;
    }

    public async Task<AuthResponse> Handle(RefreshTokenCommand cmd, CancellationToken ct)
    {
        var hash = _tokens.HashToken(cmd.RefreshToken);
        var stored = await _db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hash, ct)
            ?? throw new DomainException("Invalid refresh token.");

        // Reuse detection: if already revoked, revoke all active tokens for this user
        if (stored.IsRevoked)
        {
            var active = await _db.RefreshTokens
                .Where(t => t.UserId == stored.UserId && t.RevokedAt == null && t.ExpiresAt > DateTime.UtcNow)
                .ToListAsync(ct);
            foreach (var t in active)
                t.Revoke(null, cmd.IpAddress);
            await _db.SaveChangesAsync(ct);
            throw new DomainException("Refresh token reuse detected. All sessions revoked.");
        }

        if (stored.IsExpired)
            throw new DomainException("Refresh token expired.");

        var user = await _users.FindByIdAsync(stored.UserId.ToString())
            ?? throw new DomainException("User not found.");

        if (user.AccountStatus == UserAccountStatus.Suspended)
            throw new DomainException("Account is suspended.");

        // Rotate
        var newPlain = _tokens.GenerateRefreshToken();
        var newHash = _tokens.HashToken(newPlain);
        var newExp = DateTime.UtcNow.AddDays(14);
        stored.Revoke(newHash, cmd.IpAddress);
        _db.RefreshTokens.Add(RefreshToken.Create(user.Id, newHash, newExp, cmd.IpAddress));

        var roles = await _users.GetRolesAsync(user);
        Guid? boutiqueId = null;
        string? boutiqueStatus = null;
        if (roles.Contains(SuperAdminSeeder.VendorRole))
        {
            var b = await _db.Boutiques.AsNoTracking().FirstOrDefaultAsync(x => x.OwnerUserId == user.Id, ct);
            if (b is not null) { boutiqueId = b.Id; boutiqueStatus = b.Status.ToString(); }
        }

        var (access, accessExp) = _tokens.CreateAccessToken(user.Id, user.Email!, roles, boutiqueId);
        await _db.SaveChangesAsync(ct);

        return new AuthResponse(access, newPlain, accessExp, newExp, user.Id, user.Email!, user.FullName ?? "",
            roles.ToList(), boutiqueId, boutiqueStatus);
    }
}

public class LogoutHandler : IRequestHandler<LogoutCommand>
{
    private readonly IValoirDbContext _db;
    private readonly ITokenService _tokens;

    public LogoutHandler(IValoirDbContext db, ITokenService tokens)
    {
        _db = db;
        _tokens = tokens;
    }

    public async Task Handle(LogoutCommand cmd, CancellationToken ct)
    {
        var hash = _tokens.HashToken(cmd.RefreshToken);
        var stored = await _db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hash, ct);
        if (stored is null || stored.IsRevoked) return;
        stored.Revoke(null, cmd.IpAddress);
        await _db.SaveChangesAsync(ct);
    }
}
