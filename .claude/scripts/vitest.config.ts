import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["*.ts"],
      exclude: ["vitest.config.ts", "__tests__/**", "dist/**", "types.ts"],
      reporter: ["text", "text-summary"],
      thresholds: {
        lines: 80,
        branches: 60,
        functions: 80,
      },
    },
  },
});
