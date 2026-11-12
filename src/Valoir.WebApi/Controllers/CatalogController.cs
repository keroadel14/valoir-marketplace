using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Valoir.Application.Catalog;

namespace Valoir.WebApi.Controllers;

/// <summary>Public product catalog — no auth required. Only Published + Approved boutique items.</summary>
[ApiController]
[Route("api/v1/catalog")]
[AllowAnonymous]
public class CatalogController : ControllerBase
{
    private readonly ISender _mediator;
    public CatalogController(ISender mediator) => _mediator = mediator;

    [HttpGet("products")]
    public async Task<IActionResult> List(
        [FromQuery] string? search,
        [FromQuery] Guid? boutiqueId,
        [FromQuery] string? boutiqueSlug,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] bool? featuredOnly,
        [FromQuery] string sort = "newest",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetPublicProductsQuery(
            search, boutiqueId, boutiqueSlug, minPrice, maxPrice, featuredOnly, sort, page, pageSize), ct);
        return Ok(result);
    }

    [HttpGet("products/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken ct)
    {
        var dto = await _mediator.Send(new GetPublicProductBySlugQuery(slug), ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpGet("boutiques/{slug}")]
    public async Task<IActionResult> GetBoutique(string slug, CancellationToken ct)
    {
        var dto = await _mediator.Send(new GetPublicBoutiqueQuery(slug), ct);
        return dto is null ? NotFound() : Ok(dto);
    }
}
