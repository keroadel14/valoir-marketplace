using Valoir.Domain.Common;
using Valoir.Domain.Exceptions;

namespace Valoir.Domain.Entities;

/// <summary>
/// Stored refresh token with rotation and reuse detection.
/// </summary>
public class RefreshToken : BaseEntity
{
    public Guid UserId { get; private set; }
    public string TokenHash { get; private set; } = null!;
    public DateTime ExpiresAt { get; private set; }
    public DateTime? RevokedAt { get; private set; }
    public string? ReplacedByTokenHash { get; private set; }
    public string? CreatedByIp { get; private set; }
    public string? RevokedByIp { get; private set; }
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsRevoked => RevokedAt.HasValue;
    public bool IsActive => !IsRevoked && !IsExpired;

    private RefreshToken() { }

    public static RefreshToken Create(Guid userId, string tokenHash, DateTime expiresAt, string? ip)
    {
        if (string.IsNullOrWhiteSpace(tokenHash)) throw new DomainException("Token hash required.");
        return new RefreshToken
        {
            UserId = userId,
            TokenHash = tokenHash,
            ExpiresAt = expiresAt,
            CreatedByIp = ip
        };
    }

    public void Revoke(string? replacedByHash, string? ip)
    {
        if (IsRevoked) return;
        RevokedAt = DateTime.UtcNow;
        ReplacedByTokenHash = replacedByHash;
        RevokedByIp = ip;
        Touch();
    }
}
