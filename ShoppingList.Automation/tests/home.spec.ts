import { test, expect } from '../fixtures/fixtures';

test('goes to Azure', async ({ shoppingList }) => {
  await shoppingList.goto('https://exampletestapp-hvd2cbazc8gmbsfk.centralus-01.azurewebsites.net');
  await expect(shoppingList.header).toBeVisible();
});
