using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Valoir.Application.Common.Interfaces;

namespace Valoir.Infrastructure.Services;

public class JwtTokenService : ITokenService
{
    private readonly IConfiguration _config;
    private readonly byte[] _key;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _accessMinutes;

    public JwtTokenService(IConfiguration config)
    {
        _config = config;
        var key = config["Jwt:Key"] ?? Environment.GetEnvironmentVariable("VALOIR_JWT_KEY")
            ?? "DEV_ONLY_CHANGE_ME_TO_A_LONG_RANDOM_SECRET_KEY_32CHARS_MIN";
        _key = Encoding.UTF8.GetBytes(key);
        _issuer = config["Jwt:Issuer"] ?? "valoir.luxury";
        _audience = config["Jwt:Audience"] ?? "valoir.luxury";
        _accessMinutes = int.TryParse(config["Jwt:AccessTokenMinutes"], out var m) ? m : 15;
    }

    public (string AccessToken, DateTime ExpiresAt) CreateAccessToken(
        Guid userId, string email, IEnumerable<string> roles, Guid? boutiqueId = null)
    {
        var expires = DateTime.UtcNow.AddMinutes(_accessMinutes);
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.Email, email),
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Email, email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        if (boutiqueId.HasValue)
            claims.Add(new Claim("store_id", boutiqueId.Value.ToString()));

        var creds = new SigningCredentials(new SymmetricSecurityKey(_key), SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(_issuer, _audience, claims, expires: expires, signingCredentials: creds);
        return (new JwtSecurityTokenHandler().WriteToken(token), expires);
    }

    public string GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }

    public string HashToken(string token)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(hash);
    }
}
