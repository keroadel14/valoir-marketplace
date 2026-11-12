using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Valoir.Application.Common.Interfaces;

namespace Valoir.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _http;

    public CurrentUserService(IHttpContextAccessor http) => _http = http;

    public Guid? UserId
    {
        get
        {
            var sub = _http.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? _http.HttpContext?.User?.FindFirstValue("sub");
            return Guid.TryParse(sub, out var id) ? id : null;
        }
    }

    public string? Email => _http.HttpContext?.User?.FindFirstValue(ClaimTypes.Email)
                            ?? _http.HttpContext?.User?.FindFirstValue("email");

    public bool IsAuthenticated => _http.HttpContext?.User?.Identity?.IsAuthenticated == true;

    public bool IsInRole(string role) => _http.HttpContext?.User?.IsInRole(role) == true;

    public string? IpAddress =>
        _http.HttpContext?.Connection?.RemoteIpAddress?.ToString()
        ?? _http.HttpContext?.Request?.Headers["X-Forwarded-For"].FirstOrDefault();

    public string? CorrelationId =>
        _http.HttpContext?.Request?.Headers["X-Correlation-ID"].FirstOrDefault()
        ?? _http.HttpContext?.TraceIdentifier;
}
