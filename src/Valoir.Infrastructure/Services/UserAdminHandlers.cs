using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Valoir.Application.Admin.Commands;
using Valoir.Application.Admin.Queries;
using Valoir.Application.Common.Interfaces;
using Valoir.Domain.Enums;
using Valoir.Domain.Exceptions;
using Valoir.Infrastructure.Identity;
using Valoir.Infrastructure.Persistence;

namespace Valoir.Infrastructure.Services;

public class SuspendUserHandler : IRequestHandler<SuspendUserCommand>
{
    private readonly UserManager<ApplicationUser> _users;
    private readonly IAdminAuditService _audit;

    public SuspendUserHandler(UserManager<ApplicationUser> users, IAdminAuditService audit)
    {
        _users = users;
        _audit = audit;
    }

    public async Task Handle(SuspendUserCommand request, CancellationToken ct)
    {
        var user = await _users.FindByIdAsync(request.UserId.ToString())
            ?? throw new DomainException("User not found.");

        if (await _users.IsInRoleAsync(user, SuperAdminSeeder.SuperAdminRole))
            throw new DomainException("Cannot suspend a SuperAdmin account.");

        var prev = user.AccountStatus;
        user.AccountStatus = UserAccountStatus.Suspended;
        user.SuspendedAt = DateTime.UtcNow;
        user.SuspensionReason = request.Reason.Trim();
        await _users.UpdateAsync(user);

        await _audit.LogAsync("User.Suspend", "User", user.Id,
            previousValue: new { Status = prev },
            newValue: new { Status = user.AccountStatus },
            reason: request.Reason, ct: ct);
    }
}

public class ReactivateUserHandler : IRequestHandler<ReactivateUserCommand>
{
    private readonly UserManager<ApplicationUser> _users;
    private readonly IAdminAuditService _audit;

    public ReactivateUserHandler(UserManager<ApplicationUser> users, IAdminAuditService audit)
    {
        _users = users;
        _audit = audit;
    }

    public async Task Handle(ReactivateUserCommand request, CancellationToken ct)
    {
        var user = await _users.FindByIdAsync(request.UserId.ToString())
            ?? throw new DomainException("User not found.");

        var prev = user.AccountStatus;
        user.AccountStatus = UserAccountStatus.Active;
        user.SuspendedAt = null;
        user.SuspensionReason = null;
        await _users.UpdateAsync(user);

        await _audit.LogAsync("User.Reactivate", "User", user.Id,
            previousValue: new { Status = prev },
            newValue: new { Status = user.AccountStatus }, ct: ct);
    }
}

public class GetUsersHandler : IRequestHandler<GetUsersQuery, PagedResult<UserListItemDto>>
{
    private readonly UserManager<ApplicationUser> _users;
    private readonly ValoirDbContext _db;

    public GetUsersHandler(UserManager<ApplicationUser> users, ValoirDbContext db)
    {
        _users = users;
        _db = db;
    }

    public async Task<PagedResult<UserListItemDto>> Handle(GetUsersQuery q, CancellationToken ct)
    {
        // Base query on users
        var usersQuery = _users.Users.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var s = q.Search.Trim().ToLower();
            usersQuery = usersQuery.Where(u =>
                (u.Email != null && u.Email.ToLower().Contains(s)) ||
                (u.FullName != null && u.FullName.ToLower().Contains(s)));
        }

        // Role filter BEFORE pagination via AspNetUserRoles join
        if (!string.IsNullOrWhiteSpace(q.Role))
        {
            var roleName = q.Role.Trim();
            var roleId = await _db.Roles.AsNoTracking()
                .Where(r => r.Name == roleName)
                .Select(r => r.Id)
                .FirstOrDefaultAsync(ct);

            if (roleId == Guid.Empty)
                return new PagedResult<UserListItemDto>(Array.Empty<UserListItemDto>(), Math.Max(1, q.Page), Math.Clamp(q.PageSize, 1, 100), 0);

            var userIdsInRole = _db.UserRoles.AsNoTracking()
                .Where(ur => ur.RoleId == roleId)
                .Select(ur => ur.UserId);

            usersQuery = usersQuery.Where(u => userIdsInRole.Contains(u.Id));
        }

        var total = await usersQuery.CountAsync(ct);
        var page = Math.Max(1, q.Page);
        var size = Math.Clamp(q.PageSize, 1, 100);

        var pageUsers = await usersQuery
            .OrderByDescending(u => u.CreatedAt)
            .ThenBy(u => u.Id) // stable sort
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync(ct);

        var items = new List<UserListItemDto>(pageUsers.Count);
        foreach (var u in pageUsers)
        {
            var roles = await _users.GetRolesAsync(u);
            items.Add(new UserListItemDto(u.Id, u.Email ?? "", u.FullName, roles.ToList(),
                u.AccountStatus.ToString(), u.CreatedAt));
        }

        return new PagedResult<UserListItemDto>(items, page, size, total);
    }
}

public class GetUserDetailHandler : IRequestHandler<GetUserDetailQuery, UserDetailDto?>
{
    private readonly UserManager<ApplicationUser> _users;
    public GetUserDetailHandler(UserManager<ApplicationUser> users) => _users = users;

    public async Task<UserDetailDto?> Handle(GetUserDetailQuery q, CancellationToken ct)
    {
        var u = await _users.FindByIdAsync(q.Id.ToString());
        if (u is null) return null;
        var roles = await _users.GetRolesAsync(u);
        return new UserDetailDto(
            u.Id, u.Email ?? "", u.FullName, roles.ToList(), u.AccountStatus.ToString(),
            u.CreatedAt, u.SuspendedAt, u.SuspensionReason, u.HasAcceptedTerms, u.AcceptedTermsAt);
    }
}
