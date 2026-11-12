using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Valoir.Application.Seller;

namespace Valoir.WebApi.Controllers;

[ApiController]
[Route("api/v1/seller")]
[Authorize(Roles = "Vendor,Admin,SuperAdmin")]
public class SellerController : ControllerBase
{
    private readonly ISender _mediator;
    public SellerController(ISender mediator) => _mediator = mediator;

    [HttpGet("products")]
    public async Task<IActionResult> ListProducts([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await _mediator.Send(new ListSellerProductsQuery(page, pageSize), ct));

    [HttpPost("products")]
    public async Task<IActionResult> CreateProduct([FromBody] CreateSellerProductCommand body, CancellationToken ct)
    {
        var id = await _mediator.Send(body, ct);
        return CreatedAtAction(nameof(ListProducts), new { id }, new { id });
    }

    [HttpGet("orders")]
    public async Task<IActionResult> ListOrders([FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await _mediator.Send(new ListSellerOrdersQuery(status, page, pageSize), ct));

    [HttpGet("orders/{vendorOrderId:guid}")]
    public async Task<IActionResult> GetOrder(Guid vendorOrderId, CancellationToken ct)
    {
        var dto = await _mediator.Send(new GetSellerOrderDetailQuery(vendorOrderId), ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost("orders/{vendorOrderId:guid}/process")]
    public async Task<IActionResult> Process(Guid vendorOrderId, CancellationToken ct)
    {
        await _mediator.Send(new ProcessSellerOrderCommand(vendorOrderId), ct);
        return NoContent();
    }

    [HttpPost("orders/{vendorOrderId:guid}/ship")]
    public async Task<IActionResult> Ship(Guid vendorOrderId, [FromBody] ShipRequest body, CancellationToken ct)
    {
        await _mediator.Send(new ShipSellerOrderCommand(vendorOrderId, body.TrackingNumber, body.Carrier), ct);
        return NoContent();
    }

    public record ShipRequest(string TrackingNumber, string Carrier);
}
