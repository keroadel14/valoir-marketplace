using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using Valoir.Application.Common.Interfaces;
using Valoir.Domain.Entities;
using Valoir.Domain.Exceptions;
using Valoir.Infrastructure.Persistence;

namespace Valoir.Infrastructure.Services;

/// <summary>
/// Atomic 10-minute inventory hold using Redis + durable DB record.
/// Key pattern: inv:hold:{variantId}:{orderId}
/// </summary>
public class RedisInventoryReservationService : IInventoryReservationService
{
    private readonly IConnectionMultiplexer? _redis;
    private readonly ValoirDbContext _db;
    private readonly IDatabase? _dbRedis;

    public RedisInventoryReservationService(ValoirDbContext db, IConnectionMultiplexer? redis = null)
    {
        _db = db;
        _redis = redis;
        _dbRedis = redis?.GetDatabase();
    }

    public async Task<Guid> ReserveAsync(Guid variantId, Guid orderId, int quantity, TimeSpan ttl, CancellationToken ct = default)
    {
        var variant = await _db.ProductVariants.FirstOrDefaultAsync(v => v.Id == variantId, ct)
            ?? throw new DomainException("Variant not found.");

        if (variant.AvailableQuantity < quantity)
            throw new DomainException($"Insufficient stock. Available: {variant.AvailableQuantity}");

        var redisKey = $"inv:hold:{variantId}:{orderId}";
        if (_dbRedis is not null)
        {
            // Single Lua script: INCRBY + compare stock + optional rollback (no race window)
            var reservedKey = $"inv:reserved:{variantId}";
            const string lua = """
                local reserved = redis.call('INCRBY', KEYS[1], ARGV[1])
                if reserved > tonumber(ARGV[2]) then
                  redis.call('DECRBY', KEYS[1], ARGV[1])
                  return -1
                end
                redis.call('EXPIRE', KEYS[1], tonumber(ARGV[3]))
                return reserved
                """;
            var result = (long)await _dbRedis.ScriptEvaluateAsync(
                lua,
                new RedisKey[] { reservedKey },
                new RedisValue[] { quantity, variant.StockQuantity, (int)(ttl + TimeSpan.FromMinutes(1)).TotalSeconds });
            if (result < 0)
                throw new DomainException("Concurrent reservation exceeded available stock.");
            await _dbRedis.StringSetAsync(redisKey, quantity, ttl);
        }

        variant.Reserve(quantity);
        var reservation = InventoryReservation.Create(variantId, orderId, quantity, DateTime.UtcNow.Add(ttl), redisKey);
        _db.InventoryReservations.Add(reservation);
        await _db.SaveChangesAsync(ct);
        return reservation.Id;
    }

    public async Task ConfirmAsync(Guid reservationId, CancellationToken ct = default)
    {
        var reservation = await _db.InventoryReservations.FirstOrDefaultAsync(r => r.Id == reservationId, ct)
            ?? throw new DomainException("Reservation not found.");
        if (reservation.IsReleased || reservation.IsConfirmed) return;

        var variant = await _db.ProductVariants.FirstOrDefaultAsync(v => v.Id == reservation.VariantId, ct)
            ?? throw new DomainException("Variant not found.");

        variant.ConfirmSale(reservation.Quantity);
        reservation.Confirm();

        if (_dbRedis is not null && !string.IsNullOrEmpty(reservation.RedisKey))
        {
            await _dbRedis.KeyDeleteAsync(reservation.RedisKey);
            var reservedKey = $"inv:reserved:{reservation.VariantId}";
            await _dbRedis.StringDecrementAsync(reservedKey, reservation.Quantity);
        }

        await _db.SaveChangesAsync(ct);
    }

    public async Task ReleaseAsync(Guid reservationId, CancellationToken ct = default)
    {
        var reservation = await _db.InventoryReservations.FirstOrDefaultAsync(r => r.Id == reservationId, ct)
            ?? throw new DomainException("Reservation not found.");
        if (reservation.IsReleased || reservation.IsConfirmed) return;

        var variant = await _db.ProductVariants.FirstOrDefaultAsync(v => v.Id == reservation.VariantId, ct);
        variant?.ReleaseReservation(reservation.Quantity);
        reservation.Release();

        if (_dbRedis is not null && !string.IsNullOrEmpty(reservation.RedisKey))
        {
            await _dbRedis.KeyDeleteAsync(reservation.RedisKey);
            var reservedKey = $"inv:reserved:{reservation.VariantId}";
            await _dbRedis.StringDecrementAsync(reservedKey, reservation.Quantity);
        }

        await _db.SaveChangesAsync(ct);
    }

    public async Task ReleaseByOrderAsync(Guid orderId, CancellationToken ct = default)
    {
        var reservations = await _db.InventoryReservations
            .Where(r => r.OrderId == orderId && !r.IsReleased && !r.IsConfirmed)
            .ToListAsync(ct);

        foreach (var r in reservations)
            await ReleaseAsync(r.Id, ct);
    }
}
