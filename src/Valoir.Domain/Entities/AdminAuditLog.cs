using System.Text.Json;
using Valoir.Domain.Common;

namespace Valoir.Domain.Entities;

public class AdminAuditLog : BaseEntity
{
    public Guid AdminUserId { get; private set; }
    public string Action { get; private set; } = null!;
    public string? TargetType { get; private set; }
    public Guid? TargetId { get; private set; }
    public string? PreviousValueJson { get; private set; }
    public string? NewValueJson { get; private set; }
    public string? Reason { get; private set; }
    public string? IpAddress { get; private set; }
    public string? CorrelationId { get; private set; }
    public DateTime OccurredAt { get; private set; } = DateTime.UtcNow;

    private AdminAuditLog() { }

    public static AdminAuditLog Create(
        Guid adminUserId,
        string action,
        string? targetType = null,
        Guid? targetId = null,
        object? previousValue = null,
        object? newValue = null,
        string? reason = null,
        string? ipAddress = null,
        string? correlationId = null)
    {
        return new AdminAuditLog
        {
            AdminUserId = adminUserId,
            Action = action,
            TargetType = targetType,
            TargetId = targetId,
            PreviousValueJson = previousValue is null ? null : JsonSerializer.Serialize(previousValue),
            NewValueJson = newValue is null ? null : JsonSerializer.Serialize(newValue),
            Reason = reason,
            IpAddress = ipAddress,
            CorrelationId = correlationId,
            OccurredAt = DateTime.UtcNow
        };
    }
}
