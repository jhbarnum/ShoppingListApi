namespace ShoppingList.Api.Models;

public class ShoppingItem
{

    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public bool IsChecked { get; set; } = false;
    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
}
