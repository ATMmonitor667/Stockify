const { test, expect } = require('@playwright/test');

/**
 * Basic End-to-End Test for Stockify Signup
 * Prerequisites:
 * - Backend server running on http://127.0.0.1:5001
 * - Frontend server running (port will be determined automatically)
 * 
 * Test Steps:
 * 1. Verify servers are running
 * 2. Navigate to signup page
 * 3. Fill in form
 * 4. Submit form
 * 5. Verify success
 */

test.describe('Basic Signup Flow', () => {
  let frontendPort;

  test.beforeAll(async ({ request }) => {
    // Check if backend is running
    try {
      const response = await request.get('http://127.0.0.1:5001/');
      expect(response.ok()).toBeTruthy();
    } catch (error) {
      throw new Error('Backend server is not running. Please start it with `flask run --port=5001`');
    }

    // Try to determine the frontend port by checking common Next.js ports
    for (const port of [3000, 3001, 3002, 3003]) {
      try {
        const response = await request.get(`http://localhost:${port}`);
        if (response.ok()) {
          frontendPort = port;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!frontendPort) {
      throw new Error('Could not find running Next.js server. Please start it with `npm run dev`');
    }
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to signup page with the detected port
    await page.goto(`http://localhost:${frontendPort}/signup`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Wait for the form to be visible
    await expect(page.locator('form')).toBeVisible({ timeout: 30000 });
    
    // Wait for the heading to be visible
    await expect(page.getByRole('heading', { name: 'Sign Up' })).toBeVisible({ timeout: 30000 });
  });

  test('should successfully register a new user', async ({ page }) => {
    // Generate unique test username
    const testUsername = `testuser_${Date.now()}`;
    
    // Fill the form
    await page.getByPlaceholder('Username').fill(testUsername);
    await page.getByPlaceholder('Password').fill('TestPassword123');
    
    // Submit form and wait for the network request to complete
    await Promise.all([
      page.waitForResponse(response => response.url().includes('/signup')),
      page.getByRole('button', { name: 'Sign Up' }).click()
    ]);
    
    // Verify success message appears
    const successMessage = page.locator('.text-green-500');
    await expect(successMessage).toBeVisible({ timeout: 10000 });
    await expect(successMessage).toHaveText('User successfully registered!');
  });
}); 