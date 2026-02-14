import { type Page, type Locator } from '@playwright/test';

export class ShoppingList {
  readonly page: Page;
  readonly header: Locator;
  readonly textInput: Locator;
  readonly addButton: Locator;
  readonly lineItem: (itemName: string) => Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('h1');
    this.textInput = page.getByTestId('item-input');
    this.addButton = page.getByTestId('add_button');
    this.lineItem = (itemName: string) => page.getByTestId(`name-${itemName}`);
  }

  async goto() {
    await this.page.goto('/shopping-lists');
  }
}
