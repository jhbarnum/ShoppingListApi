using Microsoft.EntityFrameworkCore;
using ShoppingList.Api.Data;
using ShoppingList.Api.Models;

var builder = WebApplication.CreateBuilder(args);

// SQLite DB
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS for React dev server
builder.Services.AddCors(options =>
{
    options.AddPolicy("dev", p =>
        p.WithOrigins("http://localhost:5173")
         .AllowAnyHeader()
         .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors("dev");

// Ensure DB exists + apply migrations automatically (dev-friendly)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.MapGet("/api/items", async (AppDbContext db) =>
{
    var items = await db.ShoppingItems
        .OrderByDescending(x => x.CreatedUtc)       
        .ToListAsync();

    return Results.Ok(items);
});

app.MapPost("/api/items", async (CreateShoppingItemRequest req, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(req.Name))
        return Results.BadRequest("Name is required.");

    var item = new ShoppingItem
    {
        Name = req.Name.Trim(),
        Quantity = req.Quantity <= 0 ? 1 : req.Quantity,
        IsChecked = req.IsChecked
    };

    db.ShoppingItems.Add(item);
    await db.SaveChangesAsync();

    return Results.Created($"/api/items/{item.Id}", item);
});

app.MapDelete("/api/items/{id:guid}", async (Guid id, AppDbContext db) =>
{
    var item = await db.ShoppingItems.FindAsync(id);
    if (item is null) return Results.NotFound();

    db.ShoppingItems.Remove(item);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.Run();
