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

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var items = await _db.ShoppingItems
            .OrderByDescending(x => x.CreatedUtc)
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] CreateShoppingItemRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest("Name is required.");

        var item = new ShoppingItem
        {
            Name = req.Name.Trim(),
            Quantity = req.Quantity <= 0 ? 1 : req.Quantity,
            IsChecked = req.IsChecked
        };

        _db.ShoppingItems.Add(item);
        await _db.SaveChangesAsync();

        return Created($"/api/items/{item.Id}", item);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var item = await _db.ShoppingItems.FindAsync(id);
        if (item is null) return NotFound();

        _db.ShoppingItems.Remove(item);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
