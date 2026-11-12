using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Valoir.Application.Catalog;

namespace Valoir.WebApi.Controllers;

[ApiController]
[Route("api/v1")]
public class SocialController : ControllerBase
{
    private readonly ISender _mediator;
    public SocialController(ISender mediator) => _mediator = mediator;

    [HttpGet("catalog/products/{productId:guid}/reviews")]
    [AllowAnonymous]
    public async Task<IActionResult> ListReviews(Guid productId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await _mediator.Send(new ListProductReviewsQuery(productId, page, pageSize), ct));

    [HttpPost("buyer/reviews")]
    [Authorize]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewCommand body, CancellationToken ct)
    {
        var id = await _mediator.Send(body, ct);
        return Created($"/api/v1/catalog/products/{body.ProductId}/reviews", new { id });
    }

    [HttpPost("buyer/follows/{boutiqueId:guid}")]
    [Authorize]
    public async Task<IActionResult> Follow(Guid boutiqueId, CancellationToken ct)
    {
        await _mediator.Send(new FollowBoutiqueCommand(boutiqueId), ct);
        return NoContent();
    }

    [HttpDelete("buyer/follows/{boutiqueId:guid}")]
    [Authorize]
    public async Task<IActionResult> Unfollow(Guid boutiqueId, CancellationToken ct)
    {
        await _mediator.Send(new UnfollowBoutiqueCommand(boutiqueId), ct);
        return NoContent();
    }

    [HttpGet("buyer/follows")]
    [Authorize]
    public async Task<IActionResult> ListFollows(CancellationToken ct)
        => Ok(await _mediator.Send(new ListFollowedBoutiquesQuery(), ct));

    [HttpGet("buyer/notifications")]
    [Authorize]
    public async Task<IActionResult> ListNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 30, CancellationToken ct = default)
        => Ok(await _mediator.Send(new ListNotificationsQuery(page, pageSize), ct));

    [HttpPost("buyer/notifications/{id:guid}/read")]
    [Authorize]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new MarkNotificationReadCommand(id), ct);
        return NoContent();
    }

    [HttpPost("buyer/notifications/read-all")]
    [Authorize]
    public async Task<IActionResult> MarkAllRead(CancellationToken ct)
    {
        await _mediator.Send(new MarkAllNotificationsReadCommand(), ct);
        return NoContent();
    }
}
