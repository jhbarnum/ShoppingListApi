import { test, expect } from '../fixtures/fixtures';

test('home page shows header', async ({ page, shoppingList }) => {
  await shoppingList.goto();
  await expect(shoppingList.header).toHaveText('Shopping Lists');
});
