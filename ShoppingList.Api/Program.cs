using Microsoft.EntityFrameworkCore;
using ShoppingList.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Determine a writable directory for the SQLite DB. On Azure App Service the
// app content may be read-only when running from a package, so use the
// platform LocalApplicationData folder which maps to a writable location.
var dataDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "ShoppingListApp");
Directory.CreateDirectory(dataDir);
var dbPath = Path.Combine(dataDir, "shoppinglist.db");

// SQLite DB (use the computed absolute path)
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlite($"Data Source={dbPath}"));

// Add controllers
builder.Services.AddControllers();

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

// Ensure DB exists + apply migrations automatically (capture and log errors)
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        // Log helpful diagnostic info to stdout/stderr so App Service logs capture it
        Console.WriteLine($"Environment: {app.Environment.EnvironmentName}");
        Console.WriteLine($"ContentRootPath: {app.Environment.ContentRootPath}");
        Console.WriteLine($"Using DB path: {dbPath}");

        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        // Write startup migration errors to console so they appear in App Service logs / Kudu
        Console.Error.WriteLine("ERROR applying migrations: " + ex);
        throw; // rethrow so the host fails loudly (you'll see the error in logs)
    }
}

// Capture any top-level startup exceptions and log them so App Service shows details
try
{
    // Use controllers for API endpoints
    app.UseDefaultFiles();
    app.UseStaticFiles();
    app.MapControllers();
    app.MapFallbackToFile("index.html");

    app.Run();
}
catch (Exception ex)
{
    Console.Error.WriteLine("Application failed to start: " + ex);
    throw;
}
