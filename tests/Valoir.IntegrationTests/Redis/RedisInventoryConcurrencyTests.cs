using FluentAssertions;
using StackExchange.Redis;
using Valoir.IntegrationTests.Infrastructure;
using Xunit;

namespace Valoir.IntegrationTests.Redis;

[Collection("PostgresRedis")]
public class RedisInventoryConcurrencyTests
{
    private readonly PostgresRedisFixture _fx;
    public RedisInventoryConcurrencyTests(PostgresRedisFixture fx) => _fx = fx;

    [Fact]
    public async Task ConcurrentLuaReserves_NeverExceedStock()
    {
        if (!_fx.IsReady) return;

        await using var mux = await ConnectionMultiplexer.ConnectAsync(_fx.RedisConnectionString);
        var db = mux.GetDatabase();
        var stock = 10;
        var reservedKey = $"test:inv:reserved:{Guid.NewGuid():N}";
        const string lua = """
            local reserved = redis.call('INCRBY', KEYS[1], ARGV[1])
            if reserved > tonumber(ARGV[2]) then
              redis.call('DECRBY', KEYS[1], ARGV[1])
              return -1
            end
            return reserved
            """;

        var tasks = Enumerable.Range(0, 50).Select(async _ =>
        {
            var r = (long)await db.ScriptEvaluateAsync(lua,
                new RedisKey[] { reservedKey },
                new RedisValue[] { 1, stock });
            return r > 0;
        });

        var results = await Task.WhenAll(tasks);
        var success = results.Count(x => x);
        success.Should().Be(stock);
        var final = (long)(await db.StringGetAsync(reservedKey));
        final.Should().Be(stock);
        await db.KeyDeleteAsync(reservedKey);
    }
}
