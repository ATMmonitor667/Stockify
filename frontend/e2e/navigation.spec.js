const { test, expect } = require('@playwright/test');

test('Basic navigation test', async ({ page }) => {
  // Load home page
  await page.goto('/');
  
  // Store initial URL
  const initialUrl = page.url();
  
  // Check features link exists
  const featuresLink = page.getByRole('link', { name: /features/i }).first();
  await expect(featuresLink).toBeVisible();
  
  // Click features link
  await featuresLink.click();
  
  // Check URL changed (navigation happened)
  await expect(async () => {
    expect(page.url()).not.toBe(initialUrl);
  }).toPass();
  
  // Verify new page loaded
  await expect(page.locator('body')).toBeVisible();
  
  // Return to home
  await page.goto('/');
  
  // Verify logo visible
  await expect(page.getByText(/stockify/i).first()).toBeVisible();
});