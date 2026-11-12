using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Valoir.Domain.Entities;
using Valoir.Infrastructure.Persistence;
using Valoir.Infrastructure.Services;
using Valoir.IntegrationTests.Infrastructure;
using Xunit;

namespace Valoir.IntegrationTests.Outbox;

[Collection("PostgresRedis")]
public class OutboxLeaseFencingTests
{
    private readonly PostgresRedisFixture _fx;
    public OutboxLeaseFencingTests(PostgresRedisFixture fx) => _fx = fx;

    private ValoirDbContext Ctx()
    {
        var o = new DbContextOptionsBuilder<ValoirDbContext>().UseNpgsql(_fx.PostgresConnectionString).Options;
        return new ValoirDbContext(o);
    }

    [Fact]
    public async Task StaleWorker_CannotFinalize_AfterLeaseReclaimed()
    {
        if (!_fx.IsReady) return;

        Guid id;
        Guid tokenA;
        await using (var db = Ctx())
        {
            await db.Database.MigrateAsync();
            var msg = OutboxMessage.Create("signalr.notify", "{}", "fence-1");
            tokenA = msg.Claim();
            db.OutboxMessages.Add(msg);
            await db.SaveChangesAsync();
            id = msg.Id;
            // Expire lease timestamp so B can reclaim
            await db.Database.ExecuteSqlRawAsync(
                """UPDATE "OutboxMessages" SET "ProcessingStartedAt" = {0} WHERE "Id" = {1}""",
                DateTime.UtcNow.AddMinutes(-20), id);
        }

        Guid tokenB;
        await using (var db = Ctx())
        {
            var now = DateTime.UtcNow;
            var staleBefore = now - OutboxMessage.ProcessingLease;
            await using var tx = await db.Database.BeginTransactionAsync();
            var rows = await db.OutboxMessages.FromSqlRaw(
                """
                SELECT "Id", "CreatedAt", "UpdatedAt", "RowVersion",
                       "Type", "PayloadJson", "IdempotencyKey", "Status",
                       "AttemptCount", "ProcessedAt", "LastError", "NextAttemptAt",
                       "ProcessingStartedAt", "LeaseToken"
                FROM "OutboxMessages"
                WHERE (
                        ("Status" = {0} AND ("NextAttemptAt" IS NULL OR "NextAttemptAt" <= {1}))
                     OR ("Status" = {2} AND "ProcessingStartedAt" IS NOT NULL AND "ProcessingStartedAt" <= {3})
                      )
                ORDER BY "CreatedAt" LIMIT 5
                FOR UPDATE SKIP LOCKED
                """,
                (int)OutboxStatus.Pending, now, (int)OutboxStatus.Processing, staleBefore)
                .ToListAsync();
            rows.Should().Contain(r => r.Id == id);
            var target = rows.First(r => r.Id == id);
            tokenB = target.Claim();
            await db.SaveChangesAsync();
            await tx.CommitAsync();
        }

        tokenB.Should().NotBe(tokenA);

        // Worker A finalization must fail (lost lease)
        await using (var db = Ctx())
        {
            var okA = await OutboxProcessor.TryFinalizeAsync(db, id, tokenA, completed: true, error: null, default);
            okA.Should().BeFalse("stale worker A must not finalize after B reclaimed");
        }

        // Worker B finalization succeeds
        await using (var db = Ctx())
        {
            var okB = await OutboxProcessor.TryFinalizeAsync(db, id, tokenB, completed: true, error: null, default);
            okB.Should().BeTrue();
            var final = await db.OutboxMessages.AsNoTracking().SingleAsync(m => m.Id == id);
            final.Status.Should().Be(OutboxStatus.Completed);
            final.LeaseToken.Should().BeNull();
        }
    }
}
