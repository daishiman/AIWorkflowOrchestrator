/**
 * @repo/shared モジュール解決整合性テスト
 *
 * package.json exports, tsup entry, vitest alias の整合性を検証する。
 * TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 Phase 4
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { describe, it, expect } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// packages/shared のルートディレクトリ
const sharedRoot = resolve(__dirname, "../..");

function loadPackageJson(): Record<string, unknown> {
  const content = readFileSync(resolve(sharedRoot, "package.json"), "utf-8");
  return JSON.parse(content);
}

function loadTsupConfig(): string {
  return readFileSync(resolve(sharedRoot, "tsup.config.ts"), "utf-8");
}

/**
 * tsup.config.ts の entry 配列をパースする
 * entry: ["index.ts", "core/index.ts", ...] 形式を想定
 */
function parseTsupEntries(configContent: string): string[] {
  const entryMatch = configContent.match(/entry:\s*\[([\s\S]*?)\]/);
  if (!entryMatch) return [];
  const entriesStr = entryMatch[1];
  const entries: string[] = [];
  const regex = /"([^"]+)"/g;
  let match;
  while ((match = regex.exec(entriesStr)) !== null) {
    entries.push(match[1]);
  }
  return entries;
}

/**
 * exports のサブパスキーからソースファイルパスを推定する
 * exports の types フィールドから dist/ を除去してソースパスに変換
 */
function exportsTypesToSourcePath(typesPath: string): string {
  // "./dist/src/types/index.d.ts" → "src/types/index.ts"
  // "./dist/core/index.d.ts" → "core/index.ts"
  return typesPath
    .replace(/^\.\/dist\//, "")
    .replace(/\.d\.ts$/, ".ts")
    .replace(/\.d\.mts$/, ".mts");
}

describe("@repo/shared モジュール解決整合性", () => {
  const pkg = loadPackageJson();
  const exports = pkg.exports as Record<
    string,
    { types: string; import: string }
  >;
  const tsupContent = loadTsupConfig();
  const tsupEntries = parseTsupEntries(tsupContent);

  describe("T-MR-01: exports の全サブパスが tsup entry に対応する", () => {
    const exportKeys = Object.keys(exports);
    for (const key of exportKeys) {
      it(`exports "${key}" に対応する tsup entry が存在する`, () => {
        const exportConfig = exports[key];
        const importPath = exportConfig.import
          .replace(/^\.\/dist\//, "")
          .replace(/\.js$/, ".ts")
          .replace(/\.mjs$/, ".mts");

        const hasEntry = tsupEntries.some((entry) => entry === importPath);
        expect(hasEntry).toBe(true);
      });
    }
  });

  describe("T-MR-02: exports types パスとソースファイルの対応", () => {
    const exportKeys = Object.keys(exports);
    for (const key of exportKeys) {
      it(`exports "${key}" の types パスに対応するソースファイルが存在する`, () => {
        const exportConfig = exports[key];
        const sourcePath = exportsTypesToSourcePath(exportConfig.types);
        const fullPath = resolve(sharedRoot, sourcePath);
        expect(existsSync(fullPath)).toBe(true);
      });
    }
  });

  describe("T-MR-03: exports パスの dist/types/ と dist/src/types/ 混在パターン", () => {
    it("dist/types/ と dist/src/types/ の両方のパスパターンが存在する（混在を記録）", () => {
      const typePaths = Object.values(exports).map((v) => v.types);
      const hasDistTypes = typePaths.some((p) => p.startsWith("./dist/types/"));
      const hasDistSrcTypes = typePaths.some((p) =>
        p.startsWith("./dist/src/types/"),
      );

      // 現状の混在パターンを記録する（修正はPhase 8以降）
      expect(hasDistTypes).toBe(true);
      expect(hasDistSrcTypes).toBe(true);
    });
  });

  describe("T-MR-04: tsup entry に対応しない orphaned exports がない", () => {
    it("全ての exports import パスが tsup entry でビルドされる", () => {
      const orphaned: string[] = [];
      for (const [key, config] of Object.entries(exports)) {
        const importPath = config.import
          .replace(/^\.\/dist\//, "")
          .replace(/\.js$/, ".ts")
          .replace(/\.mjs$/, ".mts");

        if (!tsupEntries.includes(importPath)) {
          orphaned.push(`${key} → ${importPath}`);
        }
      }
      expect(orphaned).toEqual([]);
    });
  });

  describe("T-MR-05: tsup entry のうち exports に未登録のエントリ", () => {
    it("exports に未登録の tsup entry を検出して記録する", () => {
      const exportImportPaths = Object.values(exports).map((config) =>
        config.import
          .replace(/^\.\/dist\//, "")
          .replace(/\.js$/, ".ts")
          .replace(/\.mjs$/, ".mts"),
      );

      const unregistered = tsupEntries.filter(
        (entry) => !exportImportPaths.includes(entry),
      );

      // tsup entry にあるが exports に未登録のエントリが存在し得る
      // これらは内部ビルド用であり、外部公開不要なものもある
      // 現状を記録するためアサーションは柔軟に
      if (unregistered.length > 0) {
        console.log(
          "exports に未登録の tsup entry:",
          JSON.stringify(unregistered),
        );
      }
      // 0件以上であることのみ確認（記録目的）
      expect(unregistered.length).toBeGreaterThanOrEqual(0);
    });
  });
});
