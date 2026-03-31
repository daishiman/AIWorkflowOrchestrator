/**
 * shared パッケージのビルド検証テスト
 *
 * tsup による ESM/CJS dual output が正しく構成されていることを検証する。
 * - dist/index.js (ESM) と dist/index.cjs (CJS) の両方が存在すること
 * - package.json の exports に require 条件が存在すること
 */
import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { resolve } from "path";

const SHARED_ROOT = resolve(__dirname, "..");
const DIST_DIR = resolve(SHARED_ROOT, "dist");
const PKG_JSON_PATH = resolve(SHARED_ROOT, "package.json");

describe("shared パッケージ dual output ビルド検証", () => {
  describe("ビルド成果物の存在確認", () => {
    it("dist/index.js (ESM) が存在すること", () => {
      expect(existsSync(resolve(DIST_DIR, "index.js"))).toBe(true);
    });

    it("dist/index.cjs (CJS) が存在すること", () => {
      expect(existsSync(resolve(DIST_DIR, "index.cjs"))).toBe(true);
    });

    it("dist/index.d.ts (型定義) が存在すること", () => {
      expect(existsSync(resolve(DIST_DIR, "index.d.ts"))).toBe(true);
    });
  });

  describe("package.json exports の require 条件検証", () => {
    let packageJson: Record<string, unknown>;

    beforeAll(async () => {
      const content = await readFile(PKG_JSON_PATH, "utf-8");
      packageJson = JSON.parse(content);
    });

    it('exports の "." エントリに require 条件があること', () => {
      const exports = packageJson.exports as Record<
        string,
        Record<string, string>
      >;
      expect(exports["."]).toBeDefined();
      expect(exports["."].require).toBe("./dist/index.cjs");
    });

    it('exports の "." エントリに import 条件があること', () => {
      const exports = packageJson.exports as Record<
        string,
        Record<string, string>
      >;
      expect(exports["."]).toBeDefined();
      expect(exports["."].import).toBe("./dist/index.js");
    });

    it("全 exports エントリに require 条件が存在すること", () => {
      const exports = packageJson.exports as Record<
        string,
        Record<string, string>
      >;
      const missingRequire: string[] = [];

      for (const [key, value] of Object.entries(exports)) {
        if (typeof value === "object" && value.import && !value.require) {
          missingRequire.push(key);
        }
      }

      expect(missingRequire).toEqual([]);
    });

    it("全 require パスが .cjs 拡張子であること", () => {
      const exports = packageJson.exports as Record<
        string,
        Record<string, string>
      >;
      const invalidPaths: string[] = [];

      for (const [key, value] of Object.entries(exports)) {
        if (typeof value === "object" && value.require) {
          if (!value.require.endsWith(".cjs")) {
            invalidPaths.push(`${key}: ${value.require}`);
          }
        }
      }

      expect(invalidPaths).toEqual([]);
    });

    it("require パスが対応する import パスの .js -> .cjs 変換であること", () => {
      const exports = packageJson.exports as Record<
        string,
        Record<string, string>
      >;
      const mismatches: string[] = [];

      for (const [key, value] of Object.entries(exports)) {
        if (typeof value === "object" && value.import && value.require) {
          const expectedCjs = value.import.replace(/\.js$/, ".cjs");
          if (value.require !== expectedCjs) {
            mismatches.push(
              `${key}: import=${value.import}, require=${value.require}, expected=${expectedCjs}`,
            );
          }
        }
      }

      expect(mismatches).toEqual([]);
    });
  });
});
