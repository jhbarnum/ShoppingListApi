import { test, expect } from '../fixtures/fixtures';

test.describe('Assert navigation to the list page', () => {
  test('goes to Azure', async ({ shoppingList }) => {
    await shoppingList.goto('https://exampletestapp-hvd2cbazc8gmbsfk.centralus-01.azurewebsites.net');
    await expect(shoppingList.header).toBeVisible();
  });
    test('fails on something', async ({ shoppingList }) => {
    await shoppingList.goto('https://exampletestapp-hvd2cbazc8gmbsfk.centralus-01.azurewebsites.net');
    await expect(shoppingList.header).toBeDisabled();
  });
});