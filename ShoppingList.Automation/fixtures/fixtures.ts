
import { test as base, expect, Page } from "@playwright/test";
import { shoppingList } from "../pages/shoppingList";

// If you have more pages, add them the same way:
// import { LoginPage } from "./pages/LoginPage";
// import { SettingsPage } from "./pages/SettingsPage";

type Fixtures = {
  shoppingList: shoppingList;

  // Optional: if you want direct access to the underlying Playwright page too
  // pwPage: Page;
};

export const test = base.extend<Fixtures>({
  shoppingList: async ({ page }, use) => {
    const p = new shoppingList(page);
    await use(p);
  },

  // Optional example fixture (uncomment if you want it)
  // pwPage: async ({ page }, use) => {
  //   await use(page);
  // },
});

export { expect };
