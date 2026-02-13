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
    await shoppingList.textInput.fill('Apples');
    await shoppingList.addButton.click();
    //await shoppingList.textInput.clear();
    await shoppingList.textInput.click();
    await shoppingList.textInput.fill('Bananas');
    await shoppingList.addButton.click();
    // Verify item added 
    await shoppingList.lineItem('Apples').isVisible();
    await shoppingList.lineItem('Bananas').isVisible();
    await page.pause();
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