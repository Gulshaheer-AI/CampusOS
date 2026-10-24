import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests-e2e",
  webServer: { command: "npm run dev", url: "http://127.0.0.1:3002", reuseExistingServer: !process.env.CI, timeout: 120000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3002",
    launchOptions: process.env.CAMPUSOS_CHROMIUM_PATH ? { executablePath: process.env.CAMPUSOS_CHROMIUM_PATH, args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"] } : undefined,
    trace: "on-first-retry",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "tablet",
      use: {
        viewport: { width: 768, height: 1024 },
        deviceScaleFactor: 2,
        isMobile: true,
      },
    },
  ],
});
