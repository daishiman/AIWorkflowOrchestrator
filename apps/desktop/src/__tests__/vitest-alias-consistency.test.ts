/**
 * Vitest と TypeScript paths の整合性テスト（vite-tsconfig-paths 前提）
 *
 * 旧方式: resolve.alias に @repo/shared を手動列挙
 * 現方式: vite-tsconfig-paths が tsconfig.json の paths を参照
 */
import { existsSync, readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const desktopRoot = resolve(__dirname, "../..");

function loadDesktopTsconfig(): Record<string, unknown> {
  const content = readFileSync(resolve(desktopRoot, "tsconfig.json"), "utf-8");
  return JSON.parse(content);
}

function loadVitestConfigRaw(): string {
  return readFileSync(resolve(desktopRoot, "vitest.config.ts"), "utf-8");
}

describe("Vitest alias と TypeScript paths の整合性", () => {
  const tsconfig = loadDesktopTsconfig();
  const compilerOptions = tsconfig.compilerOptions as Record<string, unknown>;
  const paths = compilerOptions.paths as Record<string, string[]>;
  const repoSharedPathEntries = Object.entries(paths).filter(([key]) =>
    key.startsWith("@repo/shared"),
  );
  const vitestConfigRaw = loadVitestConfigRaw();

  it("T-VAC-01: vite-tsconfig-paths プラグインが有効化されている", () => {
    expect(vitestConfigRaw).toContain("tsconfigPaths()");
  });

  it("T-VAC-02: TypeScript paths に @repo/shared エントリが1件以上ある", () => {
    expect(repoSharedPathEntries.length).toBeGreaterThan(0);
  });

  it("T-VAC-03: TypeScript paths の @repo/shared エントリは配列先頭を持つ", () => {
    for (const [key, values] of repoSharedPathEntries) {
      expect(Array.isArray(values), `paths[${key}] は配列であること`).toBe(
        true,
      );
      expect(
        values.length,
        `paths[${key}] は1件以上の候補を持つこと`,
      ).toBeGreaterThan(0);
    }
  });

  it("T-VAC-04: TypeScript paths の @repo/shared エントリ先頭は実在する", () => {
    for (const [key, values] of repoSharedPathEntries) {
      const firstTarget = values[0];
      const targetAbsPath = resolve(desktopRoot, firstTarget);
      expect(
        existsSync(targetAbsPath),
        `paths[${key}] -> ${firstTarget} (${targetAbsPath}) が存在すること`,
      ).toBe(true);
    }
  });
});
