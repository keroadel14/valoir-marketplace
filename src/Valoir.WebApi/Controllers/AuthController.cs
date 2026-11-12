using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Valoir.Application.Auth.Commands;
using Valoir.Application.Auth.DTOs;

namespace Valoir.WebApi.Controllers;

[ApiController]
[Route("api/v1/auth")]
[EnableRateLimiting("auth")]
public class AuthController : ControllerBase
{
    private readonly ISender _mediator;

    public AuthController(ISender mediator) => _mediator = mediator;

    private string? ClientIp =>
        HttpContext.Connection.RemoteIpAddress?.ToString()
        ?? Request.Headers["X-Forwarded-For"].FirstOrDefault();

    [HttpPost("register-buyer")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> RegisterBuyer([FromBody] RegisterBuyerRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new RegisterBuyerCommand(req, ClientIp), ct);
        return Created(string.Empty, result);
    }

    [HttpPost("register-vendor")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> RegisterVendor([FromBody] RegisterVendorRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new RegisterVendorCommand(req, ClientIp), ct);
        return Created(string.Empty, result);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new LoginCommand(req, ClientIp), ct);
        return Ok(result);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Refresh([FromBody] RefreshRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new RefreshTokenCommand(req.RefreshToken, ClientIp), ct);
        return Ok(result);
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<IActionResult> Logout([FromBody] RefreshRequest req, CancellationToken ct)
    {
        await _mediator.Send(new LogoutCommand(req.RefreshToken, ClientIp), ct);
        return NoContent();
    }
}
