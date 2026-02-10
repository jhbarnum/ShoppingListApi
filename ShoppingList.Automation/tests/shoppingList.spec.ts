import { test, expect } from '../fixtures/fixtures';

test.describe('Assert navigation to the list page', () => {
  test('shopping list page loads successfully', async ({ shoppingList }) => {
    await shoppingList.goto();
    await shoppingList.header.isVisible();
    await expect(shoppingList.header).toHaveText('Shopping List');
  });

    test('user inputs one item', async ({ shoppingList }) => {
    await shoppingList.goto();
    await shoppingList.textInput.isVisible();
    await shoppingList.textInput.fill('Apples');
    await shoppingList.addButton.click();
    // Verify item added 
    await shoppingList.lineItem('Apples').isVisible();
  });
});