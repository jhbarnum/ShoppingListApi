using Microsoft.EntityFrameworkCore;
using ShoppingList.Api.Models;

namespace ShoppingList.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    } 
    public DbSet<ShoppingItem> ShoppingItems => Set<ShoppingItem>();
}
