import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "evaluate-ui-ux-playwright-e2e.ts",
  timeout: 60000,
  use: {
    screenshot: "on",
    trace: "on-first-retry",
  },
  snapshotDir: "outputs/phase-11/screenshots",
  snapshotPathTemplate: "{snapshotDir}/{testName}/{arg}{ext}",
});
