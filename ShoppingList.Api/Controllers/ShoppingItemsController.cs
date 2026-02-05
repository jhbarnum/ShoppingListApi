using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShoppingList.Api.Data;
using ShoppingList.Api.Models;

namespace ShoppingList.Api.Controllers;

[ApiController]
[Route("api/items")]
public class ShoppingItemsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ShoppingItemsController(AppDbContext db)
    {
        _db = db;
    }

    // Helper to read the client-provided user id header
    private string? GetOwnerId()
    {
        if (Request.Headers.TryGetValue("X-User-Id", out var vals))
            return vals.FirstOrDefault();
        return null;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var owner = GetOwnerId();
        if (string.IsNullOrWhiteSpace(owner))
            return BadRequest("Missing X-User-Id header.");

        var items = await _db.ShoppingItems
            .Where(x => x.OwnerId == owner)
            .OrderByDescending(x => x.CreatedUtc)
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] CreateShoppingItemRequest req)
    {
        var owner = GetOwnerId();
        if (string.IsNullOrWhiteSpace(owner))
            return BadRequest("Missing X-User-Id header.");

        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest("Name is required.");

        var item = new ShoppingItem
        {
            Name = req.Name.Trim(),
            Quantity = req.Quantity <= 0 ? 1 : req.Quantity,
            IsChecked = req.IsChecked,
            OwnerId = owner
        };

        _db.ShoppingItems.Add(item);
        await _db.SaveChangesAsync();

        return Created($"/api/items/{item.Id}", item);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var owner = GetOwnerId();
        if (string.IsNullOrWhiteSpace(owner))
            return BadRequest("Missing X-User-Id header.");

        var item = await _db.ShoppingItems.FirstOrDefaultAsync(i => i.Id == id && i.OwnerId == owner);
        if (item is null) return NotFound();

        _db.ShoppingItems.Remove(item);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Patch(Guid id, [FromBody] UpdateShoppingItemRequest req)
    {
        var owner = GetOwnerId();
        if (string.IsNullOrWhiteSpace(owner))
            return BadRequest("Missing X-User-Id header.");

        var item = await _db.ShoppingItems.FirstOrDefaultAsync(i => i.Id == id && i.OwnerId == owner);
        if (item is null) return NotFound();

        item.IsChecked = req.IsChecked;
        _db.ShoppingItems.Update(item);
        await _db.SaveChangesAsync();

        return Ok(item);
    }
}
