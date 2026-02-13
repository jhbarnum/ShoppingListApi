import { test, expect } from '../fixtures/fixtures';

test.describe('list page tests', () => {
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

  test.only('user inputs multiple items', async ({ page,shoppingList }) => {
    await shoppingList.goto();
    await shoppingList.textInput.isVisible();
    const capturedUserIds: string[] = [];

    await page.route('**/api/items**', async (route, request) => {
      const userId = request.headers()['x-user-id'];
      if (userId) capturedUserIds.push(userId);
      await route.continue();
    });

    const items = [
      'Apples',
      'Bananas',
      'Carrots',
      'Milk',
      'Bread',
      'Eggs',
      'Cheese',
      'Tomatoes',
      'Lettuce',
      'Chicken'
    ];

    for (const item of items) {
      await shoppingList.textInput.click();
      await shoppingList.textInput.fill(item);
      await shoppingList.addButton.click();
    }

    // Verify items added
    for (const item of items) {
      await shoppingList.lineItem(item).isVisible();
    }

    console.log('Captured User IDs:', capturedUserIds);
    expect(capturedUserIds.length).toBeGreaterThan(0);
  });

  test('user deletes item', async ({ shoppingList }) => {
    await shoppingList.goto();
    await shoppingList.textInput.isVisible();
    await shoppingList.textInput.fill('Apples');
    await shoppingList.addButton.click();
    // Verify item added 
    await shoppingList.lineItem('Apples').isVisible();
  });
});