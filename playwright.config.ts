import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: "http://localhost:3091",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node --import ./tests/mock-discord.mjs .output/server/index.mjs",
    url: "http://localhost:3091",
    reuseExistingServer: false,
    env: {
      PORT: "3091",
      GLIMPSE_STATE_DIR: `.test-state-${Date.now()}`,
      DISCORD_CLIENT_ID: "test-client",
      DISCORD_CLIENT_SECRET: "test-secret",
      DISCORD_REDIRECT_URI: "http://localhost:3091/auth/discord/callback",
    },
  },
});
