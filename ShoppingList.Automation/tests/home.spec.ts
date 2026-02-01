import { test, expect } from '@playwright/test';

test('home page shows header', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Shopping List');
});
