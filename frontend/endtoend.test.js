const { test, expect } = require('@playwright/test');

// For this test, I am going to attempt to sign up a user through the front end and then when
// it submits to the backend via the /signup endpoint, I should get an 
// 'Account Created' message. If I do not, then the test fails.

test('Sign Up Test', async ({ page }) => {
  await page.goto('http://localhost:3000/signup');
  await page.waitForSelector('input[placeholder="Username"]');
  await page.fill('input[placeholder="Username"]', 'Martin2');
  await page.fill('input[placeholder="Password"]', 'password');
  await page.click('button[type="submit"]');

  // Get confirmation from backend that the account was registered in the database
  await page.waitForSelector('text=Account created');
  await expect(page.locator('text=Account created')).toBeVisible();
});
