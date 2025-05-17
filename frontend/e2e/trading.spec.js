import { test, expect } from '@playwright/test';

test.describe('Stock Trading E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/auth/v1/session', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: {
            session: {
              user: {
                id: '123',
                email: 'test@example.com'
              }
            }
          }
        })
      });
    });

    // Mock user profile
    await page.route('**/rest/v1/profiles*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: {
            wallet_amt: 10000.00
          }
        })
      });
    });

    // Mock stock data
    await page.route('**/api/v1/quote*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          c: 150.00,
          d: 2.50,
          dp: 1.67
        })
      });
    });

    await page.route('**/api/v1/stock/profile*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          name: 'Apple Inc',
          ticker: 'AAPL'
        })
      });
    });

    // Mock portfolio data
    await page.route('**/rest/v1/portfolio*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: {
            amt_bought: 5,
            total_spent: 750.00
          }
        })
      });
    });

    // Mock trade execution
    await page.route('**/rest/v1/trades*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: {
            success: true
          }
        })
      });
    });

    // Start at the explore page
    await page.goto('/explore');
  });

  test('complete trading flow', async ({ page }) => {
    // Search for stock
    await page.fill('[placeholder="Search by symbol"]', 'AAPL');
    await page.waitForTimeout(500); // Wait for debounce

    // Verify stock appears
    await expect(page.getByText('Apple Inc')).toBeVisible();

    // Click stock to open trade modal
    await page.click('text=Apple Inc');
    await expect(page.getByTestId('trade-modal')).toBeVisible();

    // Enter quantity and execute trade
    await page.fill('[data-testid="quantity-input"]', '5');
    await page.click('[data-testid="buy-button"]');

    // Verify success message
    await expect(page.getByText('Trade successful')).toBeVisible();

    // Verify portfolio update
    await expect(page.getByText('5 shares')).toBeVisible();
  });

  test('handles insufficient funds', async ({ page }) => {
    // Mock low balance
    await page.route('**/rest/v1/profiles*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: {
            wallet_amt: 100.00
          }
        })
      });
    });

    // Search and attempt trade
    await page.fill('[placeholder="Search by symbol"]', 'AAPL');
    await page.waitForTimeout(500);

    await page.click('text=Apple Inc');
    await page.fill('[data-testid="quantity-input"]', '10');
    await page.click('[data-testid="buy-button"]');

    // Verify error message
    await expect(page.getByText(/insufficient funds/i)).toBeVisible();
  });

  test('handles network errors', async ({ page }) => {
    // Mock network error for stock data
    await page.route('**/api/v1/quote*', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({
          error: 'Internal server error'
        })
      });
    });

    // Search for stock
    await page.fill('[placeholder="Search by symbol"]', 'AAPL');
    await page.waitForTimeout(500);

    // Verify error message
    await expect(page.getByText(/error loading stock data/i)).toBeVisible();
  });

  test('validates trade quantity', async ({ page }) => {
    // Search and open trade modal
    await page.fill('[placeholder="Search by symbol"]', 'AAPL');
    await page.waitForTimeout(500);
    await page.click('text=Apple Inc');

    // Try invalid quantities
    await page.fill('[data-testid="quantity-input"]', '0');
    await page.click('[data-testid="buy-button"]');
    await expect(page.getByText(/quantity must be greater than 0/i)).toBeVisible();

    await page.fill('[data-testid="quantity-input"]', '-1');
    await page.click('[data-testid="buy-button"]');
    await expect(page.getByText(/quantity must be greater than 0/i)).toBeVisible();

    // Try valid quantity
    await page.fill('[data-testid="quantity-input"]', '1');
    await page.click('[data-testid="buy-button"]');
    await expect(page.getByText('Trade successful')).toBeVisible();
  });
}); 