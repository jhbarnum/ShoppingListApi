import { test as base, expect } from '@playwright/test';
import { ShoppingList } from '../pages/shoppingList';

type Fixtures = {
  shoppingList: ShoppingList;
};

export const test = base.extend<Fixtures>({
  shoppingList: async ({ page }, use) => {
    await use(new ShoppingList(page));
  },
});

export { expect };
