# Test info

- Name: Stock Trading Flow >> user can search and trade a stock
- Location: C:\Users\ATM Rahat Hossain\Desktop\CS322\Stockify\frontend\e2e\trading.spec.js:38:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
Call log:
  - navigating to "http://localhost:3000/login", waiting until "load"

    at C:\Users\ATM Rahat Hossain\Desktop\CS322\Stockify\frontend\e2e\trading.spec.js:40:16
```

# Test source

```ts
   1 | const { test, expect } = require('@playwright/test');
   2 |
   3 | test.describe('Stock Trading Flow', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     // Mock authentication
   6 |     await page.route('**/auth/v1/token', async (route) => {
   7 |       await route.fulfill({
   8 |         status: 200,
   9 |         body: JSON.stringify({
  10 |           access_token: 'mock-token',
  11 |           user: {
  12 |             id: '123',
  13 |             email: 'test@example.com'
  14 |           }
  15 |         })
  16 |       });
  17 |     });
  18 |
  19 |     // Mock stock data
  20 |     await page.route('**/api/stocks/*', async (route) => {
  21 |       await route.fulfill({
  22 |         status: 200,
  23 |         body: JSON.stringify({
  24 |           quote: {
  25 |             c: 150.00,
  26 |             d: 2.50,
  27 |             dp: 1.67
  28 |           },
  29 |           profile: {
  30 |             name: 'Apple Inc',
  31 |             ticker: 'AAPL'
  32 |           }
  33 |         })
  34 |       });
  35 |     });
  36 |   });
  37 |
  38 |   test('user can search and trade a stock', async ({ page }) => {
  39 |     // Login
> 40 |     await page.goto('/login');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
  41 |     await page.fill('[data-testid="email"]', 'test@example.com');
  42 |     await page.fill('[data-testid="password"]', 'password123');
  43 |     await page.click('[data-testid="login-button"]');
  44 |     
  45 |     // Wait for navigation
  46 |     await page.waitForURL('/explore');
  47 |     
  48 |     // Search for stock
  49 |     await page.fill('[data-testid="stock-search"]', 'AAPL');
  50 |     await page.click('[data-testid="search-button"]');
  51 |     
  52 |     // Verify stock appears
  53 |     await expect(page.locator('text=Apple Inc')).toBeVisible();
  54 |     
  55 |     // Click stock and verify trade modal
  56 |     await page.click('text=Apple Inc');
  57 |     await expect(page.locator('[data-testid="trade-modal"]')).toBeVisible();
  58 |     
  59 |     // Execute trade
  60 |     await page.fill('[data-testid="quantity-input"]', '5');
  61 |     await page.click('[data-testid="buy-button"]');
  62 |     
  63 |     // Verify success
  64 |     await expect(page.locator('text=Trade successful')).toBeVisible();
  65 |   });
  66 | }); 
```