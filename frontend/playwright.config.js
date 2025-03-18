const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'on-first-retry',
    actionTimeout: 10000,
    navigationTimeout: 15001,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...require('@playwright/test').devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
    {
      command: 'cd ../backend && source venv/bin/activate && PYTHONPATH=/Users/ahmed/Stockify/Stockify/backend flask run --port=5001',
      url: 'http://127.0.0.1:5001',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    }
  ],
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
}); 