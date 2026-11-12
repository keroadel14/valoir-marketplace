using Valoir.Domain.Common;

namespace Valoir.Domain.Entities;

/// <summary>
/// Idempotency store for Stripe webhook events. EventId is unique.
/// </summary>
public class ProcessedStripeEvent : BaseEntity
{
    public string EventId { get; private set; } = null!;
    public string EventType { get; private set; } = null!;
    public DateTime ProcessedAt { get; private set; } = DateTime.UtcNow;
    public string? Outcome { get; private set; }

    private ProcessedStripeEvent() { }

    public static ProcessedStripeEvent Create(string eventId, string eventType, string? outcome = "ok")
    {
        return new ProcessedStripeEvent
        {
            EventId = eventId,
            EventType = eventType,
            ProcessedAt = DateTime.UtcNow,
            Outcome = outcome
        };
    }
}
