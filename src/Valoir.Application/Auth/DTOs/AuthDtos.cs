using System.ComponentModel.DataAnnotations;

namespace Valoir.Application.Auth.DTOs;

public record RegisterBuyerRequest(
    [Required, EmailAddress] string Email,
    [Required, MinLength(12)] string Password,
    [Required] string FullName,
    [Required] bool AcceptTerms,
    [Required] bool AcceptPrivacyPolicy,
    string PreferredLanguage = "en");

public record RegisterVendorRequest(
    [Required, EmailAddress] string Email,
    [Required, MinLength(12)] string Password,
    [Required] string FullName,
    [Required] string StoreName,
    [Required] string Slug,
    string? TradeLicenseOrVatId,
    [Required] bool AcceptTerms,
    [Required] bool AcceptPrivacyPolicy,
    [Required] bool AcceptVendorAgreement,
    string PreferredLanguage = "en");

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password);

public record RefreshRequest(
    [Required] string RefreshToken);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiresAt,
    DateTime RefreshTokenExpiresAt,
    Guid UserId,
    string Email,
    string FullName,
    IReadOnlyList<string> Roles,
    Guid? BoutiqueId,
    string? BoutiqueStatus);

public record MeResponse(
    Guid UserId,
    string Email,
    string? FullName,
    IReadOnlyList<string> Roles,
    Guid? BoutiqueId,
    string? BoutiqueStatus,
    string PreferredLanguage,
    string PreferredTheme,
    bool HasAcceptedTerms);
