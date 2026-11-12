using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Valoir.Application.Admin.Commands;
using Valoir.Application.Admin.Queries;
using Valoir.Domain.Enums;

namespace Valoir.WebApi.Controllers;

[ApiController]
[Route("api/v1/admin")]
[Authorize(Policy = "AdminOrAbove")]
public class AdminController : ControllerBase
{
    private readonly ISender _mediator;
    public AdminController(ISender mediator) => _mediator = mediator;

    // ── Dashboard ──────────────────────────────────────────────────────
    [HttpGet("metrics")]
    public async Task<ActionResult<PlatformMetricsDto>> Metrics(CancellationToken ct)
        => Ok(await _mediator.Send(new GetPlatformMetricsQuery(), ct));

    // ── Boutiques ──────────────────────────────────────────────────────
    [HttpGet("boutiques")]
    public async Task<ActionResult<PagedResult<BoutiqueListItemDto>>> ListBoutiques(
        [FromQuery] BoutiqueStatus? status,
        [FromQuery] string? search,
        [FromQuery] bool? payoutHold,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
        => Ok(await _mediator.Send(new GetBoutiquesQuery(status, search, payoutHold, page, pageSize), ct));

    [HttpGet("boutiques/{id:guid}")]
    public async Task<ActionResult<BoutiqueDetailDto>> GetBoutique(Guid id, CancellationToken ct)
    {
        var dto = await _mediator.Send(new GetBoutiqueDetailQuery(id), ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost("boutiques/{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id, [FromBody] ApproveRequest? req, CancellationToken ct)
    {
        await _mediator.Send(new ApproveBoutiqueCommand(id, req?.Notes), ct);
        return NoContent();
    }

    [HttpPost("boutiques/{id:guid}/suspend")]
    public async Task<IActionResult> Suspend(Guid id, [FromBody] ReasonRequest req, CancellationToken ct)
    {
        await _mediator.Send(new SuspendBoutiqueCommand(id, req.Reason), ct);
        return NoContent();
    }

    [HttpPost("boutiques/{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] ReasonRequest req, CancellationToken ct)
    {
        await _mediator.Send(new RejectBoutiqueCommand(id, req.Reason), ct);
        return NoContent();
    }

    [HttpPost("boutiques/{id:guid}/reinstate")]
    public async Task<IActionResult> Reinstate(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new ReinstateBoutiqueCommand(id), ct);
        return NoContent();
    }

    [HttpPatch("boutiques/{id:guid}/commission")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<IActionResult> OverrideCommission(Guid id, [FromBody] CommissionRequest req, CancellationToken ct)
    {
        await _mediator.Send(new OverrideCommissionCommand(id, req.NewRate), ct);
        return NoContent();
    }

    [HttpPatch("boutiques/{id:guid}/payout-hold")]
    public async Task<IActionResult> SetPayoutHold(Guid id, [FromBody] HoldRequest req, CancellationToken ct)
    {
        await _mediator.Send(new SetPayoutHoldCommand(id, req.Hold), ct);
        return NoContent();
    }

    // ── Orders ─────────────────────────────────────────────────────────
    [HttpGet("orders")]
    public async Task<ActionResult<PagedResult<OrderListItemDto>>> ListOrders(
        [FromQuery] OrderStatus? status,
        [FromQuery] Guid? buyerId,
        [FromQuery] Guid? boutiqueId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
        => Ok(await _mediator.Send(new GetOrdersQuery(status, buyerId, boutiqueId, from, to, page, pageSize), ct));

    [HttpGet("orders/{id:guid}")]
    public async Task<ActionResult<OrderDetailDto>> GetOrder(Guid id, CancellationToken ct)
    {
        var dto = await _mediator.Send(new GetOrderDetailQuery(id), ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost("orders/{orderId:guid}/refund")]
    public async Task<ActionResult<AdminRefundResult>> Refund(Guid orderId, [FromBody] RefundRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new AdminRefundCommand(
            orderId, req.VendorOrderId, req.OrderItemIds, req.Reason, req.ReverseTransfer), ct);
        return Ok(result);
    }

    // ── Disputes ───────────────────────────────────────────────────────
    [HttpGet("disputes")]
    public async Task<ActionResult<PagedResult<DisputeListItemDto>>> ListDisputes(
        [FromQuery] DisputeStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
        => Ok(await _mediator.Send(new GetDisputesQuery(status, page, pageSize), ct));

    // ── Audit ──────────────────────────────────────────────────────────
    [HttpGet("audit-log")]
    public async Task<ActionResult<PagedResult<AuditLogDto>>> AuditLog(
        [FromQuery] Guid? adminUserId,
        [FromQuery] string? action,
        [FromQuery] string? targetType,
        [FromQuery] Guid? targetId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
        => Ok(await _mediator.Send(new GetAuditLogsQuery(adminUserId, action, targetType, targetId, from, to, page, pageSize), ct));

    // ── Products ───────────────────────────────────────────────────────
    [HttpGet("products")]
    public async Task<ActionResult<PagedResult<ProductListItemDto>>> ListProducts(
        [FromQuery] Guid? boutiqueId,
        [FromQuery] string? search,
        [FromQuery] bool? featuredOnly,
        [FromQuery] bool includeDeleted = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
        => Ok(await _mediator.Send(new GetProductsQuery(boutiqueId, search, featuredOnly, includeDeleted, page, pageSize), ct));

    [HttpGet("products/{id:guid}")]
    public async Task<ActionResult<ProductDetailDto>> GetProduct(Guid id, CancellationToken ct)
    {
        var dto = await _mediator.Send(new GetProductDetailQuery(id), ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost("products/{id:guid}/unlist")]
    public async Task<IActionResult> UnlistProduct(Guid id, [FromBody] ReasonRequest req, CancellationToken ct)
    {
        await _mediator.Send(new ForceUnlistProductCommand(id, req.Reason), ct);
        return NoContent();
    }

    [HttpPost("products/{id:guid}/feature")]
    public async Task<IActionResult> FeatureProduct(Guid id, [FromBody] FeatureRequest req, CancellationToken ct)
    {
        await _mediator.Send(new FeatureProductCommand(id, req.Featured), ct);
        return NoContent();
    }

    // ── Users ──────────────────────────────────────────────────────────
    [HttpGet("users")]
    public async Task<ActionResult<PagedResult<UserListItemDto>>> ListUsers(
        [FromQuery] string? search,
        [FromQuery] string? role,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
        => Ok(await _mediator.Send(new GetUsersQuery(search, role, page, pageSize), ct));

    [HttpGet("users/{id:guid}")]
    public async Task<ActionResult<UserDetailDto>> GetUser(Guid id, CancellationToken ct)
    {
        var dto = await _mediator.Send(new GetUserDetailQuery(id), ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost("users/{id:guid}/suspend")]
    public async Task<IActionResult> SuspendUser(Guid id, [FromBody] ReasonRequest req, CancellationToken ct)
    {
        await _mediator.Send(new SuspendUserCommand(id, req.Reason), ct);
        return NoContent();
    }

    [HttpPost("users/{id:guid}/reactivate")]
    public async Task<IActionResult> ReactivateUser(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new ReactivateUserCommand(id), ct);
        return NoContent();
    }
}

public record FeatureRequest(bool Featured);

public record ApproveRequest(string? Notes);
public record ReasonRequest(string Reason);
public record CommissionRequest(decimal NewRate);
public record HoldRequest(bool Hold);
public record RefundRequest(Guid? VendorOrderId, List<Guid>? OrderItemIds, string Reason, bool ReverseTransfer = true);
