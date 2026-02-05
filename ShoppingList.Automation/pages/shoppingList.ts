
import { type Page, type Locator } from '@playwright/test';

export class shoppingList {
  readonly page: Page;
  readonly header: Locator;
  readonly textInput: Locator;
  readonly addButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Define locators for elements
    this.header = page.locator('#username');
    this.textInput = page.locator('#password');
    this.addButton = page.locator('button[type="submit"]');
  }

  // Method to navigate to the list page
  async goto() {
    await this.page.goto('https://exampletestapp-hvd2cbazc8gmbsfk.centralus-01.azurewebsites.net/');
  }

}
