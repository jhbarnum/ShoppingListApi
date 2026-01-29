namespace ShoppingList.Api.Models;

public record CreateShoppingItemRequest(string Name, int Quantity, bool IsChecked);