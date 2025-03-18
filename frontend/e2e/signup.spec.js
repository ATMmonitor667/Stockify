const { test, expect } = require('@playwright/test');

test.describe('Signup Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the signup page before each test
    await page.goto('http://localhost:3000/signup');
  });

  test('successful signup flow', async ({ page }) => {
    // Fill in the form
    await page.fill('input[placeholder="Username"]', 'newuser123');
    await page.fill('input[placeholder="Password"]', 'securepass123');

    // Submit the form
    await page.click('button:has-text("Sign Up")');

    // Wait for success message
    await expect(page.locator('text=User successfully registered!')).toBeVisible();

    // Verify redirect to login page
    await expect(page).toHaveURL('http://localhost:3000/login');
  });

  test('handles existing username', async ({ page }) => {
    // Fill in the form with existing username
    await page.fill('input[placeholder="Username"]', 'existinguser');
    await page.fill('input[placeholder="Password"]', 'testpass123');

    // Submit the form
    await page.click('button:has-text("Sign Up")');

    // Check for error message
    await expect(page.locator('text=Username already exists')).toBeVisible();
  });

  test('validates empty fields', async ({ page }) => {
    // Try to submit without filling in fields
    await page.click('button:has-text("Sign Up")');

    // Check for validation message
    await expect(page.locator('text=Please fill in all fields')).toBeVisible();
  });

  test('password requirements', async ({ page }) => {
    // Fill in the form with weak password
    await page.fill('input[placeholder="Username"]', 'newuser123');
    await page.fill('input[placeholder="Password"]', 'weak');

    // Submit the form
    await page.click('button:has-text("Sign Up")');

    // Check for password requirement message
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
  });
}); 