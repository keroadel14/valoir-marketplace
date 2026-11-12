using FluentAssertions;
using Valoir.Domain.Entities;
using Xunit;

namespace Valoir.UnitTests.Domain;

public class OutboxMessageTests
{
    [Fact]
    public void Claim_IssuesUniqueLeaseToken_AndIncrementsAttempt()
    {
        var msg = OutboxMessage.Create("stripe.refund", "{}", "k");
        var t1 = msg.Claim();
        t1.Should().NotBe(Guid.Empty);
        msg.LeaseToken.Should().Be(t1);
        msg.Status.Should().Be(OutboxStatus.Processing);
        msg.AttemptCount.Should().Be(1);
        msg.ProcessingStartedAt.Should().NotBeNull();

        // Re-claim (stale reclaim) gets a new token and increments attempt
        var t2 = msg.Claim();
        t2.Should().NotBe(t1);
        msg.LeaseToken.Should().Be(t2);
        msg.AttemptCount.Should().Be(2);
    }

    [Fact]
    public void ApplyFailed_EightAttempts_DeadLetters()
    {
        var msg = OutboxMessage.Create("stripe.refund", "{}", "key-1");
        for (int i = 0; i < 8; i++)
        {
            msg.Claim();
            msg.ApplyFailed("err");
        }
        msg.Status.Should().Be(OutboxStatus.DeadLetter);
        msg.AttemptCount.Should().Be(8);
        msg.LeaseToken.Should().BeNull();
    }

    [Fact]
    public void ApplyCompleted_ClearsLease()
    {
        var msg = OutboxMessage.Create("signalr.notify", "{}", null);
        msg.Claim();
        msg.ApplyCompleted();
        msg.Status.Should().Be(OutboxStatus.Completed);
        msg.ProcessedAt.Should().NotBeNull();
        msg.LeaseToken.Should().BeNull();
        msg.ProcessingStartedAt.Should().BeNull();
    }

    [Fact]
    public void ApplyFailed_ResetsLease_AndSchedulesRetry()
    {
        var msg = OutboxMessage.Create("stripe.refund", "{}", "k2");
        msg.Claim();
        msg.ApplyFailed("transient");
        msg.Status.Should().Be(OutboxStatus.Pending);
        msg.LeaseToken.Should().BeNull();
        msg.NextAttemptAt.Should().NotBeNull();
        msg.AttemptCount.Should().Be(1);
    }

    [Fact]
    public void IsStaleProcessing_RespectsLeaseWindow()
    {
        var msg = OutboxMessage.Create("stripe.transfer", "{}", "k");
        msg.Claim();
        msg.IsStaleProcessing(DateTime.UtcNow).Should().BeFalse();
        msg.IsStaleProcessing(DateTime.UtcNow.Add(OutboxMessage.ProcessingLease).AddSeconds(1)).Should().BeTrue();
    }

    [Fact]
    public void DeadLetter_IsNotPending_CannotBeAutoClaimedByStatusFilter()
    {
        var msg = OutboxMessage.Create("x", "{}", "d");
        for (int i = 0; i < 8; i++) { msg.Claim(); msg.ApplyFailed("e"); }
        msg.Status.Should().Be(OutboxStatus.DeadLetter);
        // Claim query filters Pending or stale Processing only — DeadLetter excluded by design
        (msg.Status is OutboxStatus.Pending or OutboxStatus.Processing).Should().BeFalse();
    }
}
