using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Valoir.Application.Buyer;

namespace Valoir.WebApi.Controllers;

[ApiController]
[Route("api/v1/buyer")]
[Authorize]
public class BuyerController : ControllerBase
{
    private readonly ISender _mediator;
    public BuyerController(ISender mediator) => _mediator = mediator;

    // ── Addresses ──────────────────────────────────────────────────────
    [HttpGet("addresses")]
    public async Task<IActionResult> ListAddresses(CancellationToken ct)
        => Ok(await _mediator.Send(new ListAddressesQuery(), ct));

    [HttpPost("addresses")]
    public async Task<IActionResult> CreateAddress([FromBody] CreateAddressCommand body, CancellationToken ct)
    {
        var id = await _mediator.Send(body, ct);
        return CreatedAtAction(nameof(ListAddresses), new { id }, new { id });
    }

    [HttpPut("addresses/{id:guid}")]
    public async Task<IActionResult> UpdateAddress(Guid id, [FromBody] CreateAddressCommand body, CancellationToken ct)
    {
        await _mediator.Send(new UpdateAddressCommand(
            id, body.FullName, body.Phone, body.Line1, body.City, body.PostalCode, body.CountryCode,
            body.Line2, body.StateOrRegion, body.Label, body.IsDefault), ct);
        return NoContent();
    }

    [HttpDelete("addresses/{id:guid}")]
    public async Task<IActionResult> DeleteAddress(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteAddressCommand(id), ct);
        return NoContent();
    }

    [HttpPost("addresses/{id:guid}/default")]
    public async Task<IActionResult> SetDefault(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new SetDefaultAddressCommand(id), ct);
        return NoContent();
    }

    // ── Orders ─────────────────────────────────────────────────────────
    [HttpGet("orders")]
    public async Task<IActionResult> ListOrders([FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await _mediator.Send(new ListBuyerOrdersQuery(status, page, pageSize), ct));

    [HttpGet("orders/{id:guid}")]
    public async Task<IActionResult> GetOrder(Guid id, CancellationToken ct)
    {
        var dto = await _mediator.Send(new GetBuyerOrderDetailQuery(id), ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost("orders")]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderCommand body, CancellationToken ct)
    {
        var result = await _mediator.Send(body, ct);
        return CreatedAtAction(nameof(GetOrder), new { id = result.OrderId }, result);
    }
}
