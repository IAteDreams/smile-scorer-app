import { defineConfig, devices } from "@playwright/test";
import { APP_ENV, APP_PORT, APP_URL, SERVICES_PORT } from "./tests/support/env";

/**
 * End-to-end tests run against a self-contained stack: Postgres in Docker,
 * fake Redis/Storage/SMTP (tests/support/fake-services.ts) and a production
 * build of the app with the mock scorer. No real service is ever called.
 */
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  globalSetup: "./tests/support/global-setup.ts",
  globalTeardown: "./tests/support/global-teardown.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "html",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: APP_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      testMatch: ["**/marketing.spec.ts", "**/dashboard.spec.ts"],
    },
  ],
  webServer: [
    {
      command: "pnpm exec tsx tests/support/fake-services.ts",
      url: `http://localhost:${SERVICES_PORT}/health`,
      reuseExistingServer: !process.env.CI,
      stdout: "ignore",
    },
    {
      command: `pnpm exec next build && pnpm exec next start --port ${APP_PORT}`,
      url: APP_URL,
      env: APP_ENV,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      stdout: "ignore",
    },
  ],
});
