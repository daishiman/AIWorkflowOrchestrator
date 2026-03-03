import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["scripts/__tests__/evidence-bundle-*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["scripts/evidence-bundle-validator.ts"],
      exclude: ["vitest.config.ts", "scripts/__tests__/**", "dist/**"],
      reporter: ["text", "text-summary"],
      thresholds: {
        lines: 80,
        branches: 60,
        functions: 80,
      },
    },
  },
});
