using Valoir.Domain.Common;
using Valoir.Domain.Exceptions;

namespace Valoir.Domain.Entities;

/// <summary>
/// Tracks a temporary stock hold (default 10 minutes) during checkout.
/// Backed by Redis for atomicity; this entity is the durable record.
/// </summary>
public class InventoryReservation : BaseEntity
{
    public Guid VariantId { get; private set; }
    public Guid OrderId { get; private set; }
    public int Quantity { get; private set; }
    public DateTime ExpiresAt { get; private set; }
    public bool IsReleased { get; private set; }
    public bool IsConfirmed { get; private set; }
    public string? RedisKey { get; private set; }

    private InventoryReservation() { }

    public static InventoryReservation Create(Guid variantId, Guid orderId, int quantity, DateTime expiresAt, string? redisKey = null)
    {
        if (quantity <= 0) throw new DomainException("Reservation quantity must be positive.");
        return new InventoryReservation
        {
            VariantId = variantId,
            OrderId = orderId,
            Quantity = quantity,
            ExpiresAt = expiresAt,
            IsReleased = false,
            IsConfirmed = false,
            RedisKey = redisKey
        };
    }

    public void Confirm()
    {
        if (IsReleased) throw new DomainException("Cannot confirm a released reservation.");
        IsConfirmed = true;
        Touch();
    }

    public void Release()
    {
        if (IsConfirmed) throw new DomainException("Cannot release a confirmed reservation.");
        IsReleased = true;
        Touch();
    }

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt && !IsConfirmed && !IsReleased;
}
