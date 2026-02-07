import { type Page, type Locator } from '@playwright/test';

export class ShoppingList {
  readonly page: Page;
  readonly header: Locator;
  readonly textInput: Locator;
  readonly addButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('h1');
    this.textInput = page.locator('#password');
    this.addButton = page.locator('button[type="submit"]');
  }

  async goto() {
    await this.page.goto('/');
  }
}
