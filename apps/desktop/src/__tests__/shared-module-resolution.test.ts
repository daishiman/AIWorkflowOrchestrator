/**
 * @repo/shared モジュール解決テスト（apps/desktop 側）
 *
 * TypeScript の paths 設定と package.json exports が
 * 正しくモジュール解決されることを検証する。
 * TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 Phase 4
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { describe, it, expect } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const desktopRoot = resolve(__dirname, "../..");
const sharedRoot = resolve(desktopRoot, "../../packages/shared");

function loadDesktopTsconfig(): Record<string, unknown> {
  const content = readFileSync(resolve(desktopRoot, "tsconfig.json"), "utf-8");
  return JSON.parse(content);
}

function loadSharedPackageJson(): Record<string, unknown> {
  const content = readFileSync(resolve(sharedRoot, "package.json"), "utf-8");
  return JSON.parse(content);
}

describe("@repo/shared TypeScript paths 検証", () => {
  const tsconfig = loadDesktopTsconfig();
  const compilerOptions = tsconfig.compilerOptions as Record<string, unknown>;
  const paths = compilerOptions.paths as Record<string, string[]>;
  const pkg = loadSharedPackageJson();
  const exports = pkg.exports as Record<
    string,
    { types: string; import: string }
  >;

  describe("T-SMR-01: tsconfig paths に全 exports サブパスが存在する", () => {
    const exportKeys = Object.keys(exports);
    for (const key of exportKeys) {
      const tsconfigKey =
        key === "."
          ? "@repo/shared"
          : `@repo/shared/${key.replace(/^\.\//, "")}`;

      it(`exports "${key}" に対応する paths "${tsconfigKey}" が存在する`, () => {
        expect(paths).toHaveProperty(tsconfigKey);
      });
    }
  });

  describe("T-SMR-02: tsconfig paths が正しいソースファイルを指している", () => {
    const exportKeys = Object.keys(exports);
    for (const key of exportKeys) {
      const tsconfigKey =
        key === "."
          ? "@repo/shared"
          : `@repo/shared/${key.replace(/^\.\//, "")}`;

      it(`paths "${tsconfigKey}" のソースファイルが存在する`, () => {
        const pathEntries = paths[tsconfigKey];
        expect(pathEntries).toBeDefined();
        expect(pathEntries.length).toBeGreaterThan(0);

        const relativePath = pathEntries[0];
        const absolutePath = resolve(desktopRoot, relativePath);
        expect(existsSync(absolutePath)).toBe(true);
      });
    }
  });

  describe("T-SMR-03: @repo/shared 以外の paths が維持されている", () => {
    it("@renderer/* パスが存在する", () => {
      expect(paths).toHaveProperty("@renderer/*");
    });

    it("@/* パスが存在する", () => {
      expect(paths).toHaveProperty("@/*");
    });
  });

  describe("T-SMR-04: typesVersions が package.json に存在する", () => {
    it("typesVersions フィールドが存在する", () => {
      expect(pkg).toHaveProperty("typesVersions");
    });

    it("typesVersions の '*' エントリが存在する", () => {
      const typesVersions = pkg.typesVersions as Record<
        string,
        Record<string, string[]>
      >;
      expect(typesVersions).toHaveProperty("*");
    });

    it("typesVersions の全エントリが exports のサブパスに対応する", () => {
      const typesVersions = pkg.typesVersions as Record<
        string,
        Record<string, string[]>
      >;
      const tvKeys = Object.keys(typesVersions["*"]);
      const exportSubpaths = Object.keys(exports)
        .filter((k) => k !== ".")
        .map((k) => k.replace(/^\.\//, ""));

      for (const tvKey of tvKeys) {
        expect(exportSubpaths).toContain(tvKey);
      }
    });
  });
});
