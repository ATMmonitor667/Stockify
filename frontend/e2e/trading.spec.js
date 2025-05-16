const { test, expect } = require('@playwright/test');

test.describe('Stock Trading Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/auth/v1/token', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          access_token: 'mock-token',
          user: {
            id: '123',
            email: 'test@example.com'
          }
        })
      });
    });

    // Mock stock data
    await page.route('**/api/stocks/*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          quote: {
            c: 150.00,
            d: 2.50,
            dp: 1.67
          },
          profile: {
            name: 'Apple Inc',
            ticker: 'AAPL'
          }
        })
      });
    });

    // Mock user profile data
    await page.route('**/profiles*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          wallet_amt: 10000.00
        })
      });
    });
  });

  test('user can search and trade a stock', async ({ page }) => {
    // Start the application if not already running
    try {
      await page.goto('http://localhost:3000/login', { timeout: 5000 });
    } catch (error) {
      console.error('Application not running. Please start it with: npm run dev');
      throw error;
    }
    
    // Login
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for navigation with increased timeout
    await page.waitForURL('/explore', { timeout: 10000 });
    
    // Search for stock
    await page.fill('[data-testid="stock-search"]', 'AAPL');
    await page.click('[data-testid="search-button"]');
    
    // Verify stock appears with retry
    await expect(page.locator('text=Apple Inc')).toBeVisible({ timeout: 10000 });
    
    // Click stock and verify trade modal
    await page.click('text=Apple Inc');
    await expect(page.locator('[data-testid="trade-modal"]')).toBeVisible({ timeout: 5000 });
    
    // Execute trade
    await page.fill('[data-testid="quantity-input"]', '5');
    await page.click('[data-testid="buy-button"]');
    
    // Verify success with retry
    await expect(page.locator('text=Trade successful')).toBeVisible({ timeout: 5000 });
  });
}); 