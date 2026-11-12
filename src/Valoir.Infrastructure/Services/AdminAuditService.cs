using Valoir.Application.Common.Interfaces;
using Valoir.Domain.Entities;
using Valoir.Infrastructure.Persistence;

namespace Valoir.Infrastructure.Services;

public class AdminAuditService : IAdminAuditService
{
    private readonly ValoirDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AdminAuditService(ValoirDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task LogAsync(
        string action,
        string? targetType = null,
        Guid? targetId = null,
        object? previousValue = null,
        object? newValue = null,
        string? reason = null,
        string? outcome = "Success",
        CancellationToken ct = default)
    {
        var adminId = _currentUser.UserId ?? Guid.Empty;
        var entry = AdminAuditLog.Create(
            adminUserId: adminId,
            action: action,
            targetType: targetType,
            targetId: targetId,
            previousValue: previousValue is null ? null : new { previousValue, outcome },
            newValue: newValue,
            reason: reason,
            ipAddress: _currentUser.IpAddress,
            correlationId: _currentUser.CorrelationId);

        _db.AdminAuditLogs.Add(entry);
        await _db.SaveChangesAsync(ct);
    }
}
