/**
 * check-shared-module-sync テスト
 *
 * @repo/shared パッケージの exports / paths / alias / typesVersions の
 * 整合性チェックスクリプトの全関数をテストする。
 *
 * テストケース: 43件
 * - パーサー関数: #1-13
 * - チェッカー関数: #14-23
 * - レポーター関数: #24-26
 * - 統合テスト: #27-28
 * - ロバスト性テスト: #29-32
 * - 複合不整合テスト: #33-35
 * - エッジケーステスト: #36-40
 * - エラーハンドリングテスト: #41-43
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  parseExports,
  parsePaths,
  parseAliases,
  parseTypesVersions,
  checkExportsVsPaths,
  checkPathsVsExports,
  checkExportsVsAliases,
  checkAliasesVsExports,
  checkExportsVsTypesVersions,
  formatReport,
  main,
} from "../check-shared-module-sync";
import type { ExportEntry, CheckResult } from "../check-shared-module-sync";

// fs モジュールをモック
vi.mock("fs");

// fs モジュールのモック型付きインポート
import fs from "fs";
const mockedReadFileSync = vi.mocked(fs.readFileSync);

describe("check-shared-module-sync", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================
  // 1. パーサー関数ユニットテスト
  // ============================================================

  describe("parseExports", () => {
    // #1: 標準的な exports を正しくパースする
    it("標準的な exports を正しくパースする", () => {
      const packageJson = {
        exports: {
          ".": {
            types: "./dist/index.d.ts",
            import: "./dist/index.js",
          },
          "./utils": {
            types: "./dist/utils/index.d.ts",
            import: "./dist/utils/index.js",
          },
        },
      };
      mockedReadFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = parseExports("packages/shared/package.json");

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(2);
      expect(result.get(".")).toEqual({
        types: "./dist/index.d.ts",
        import: "./dist/index.js",
      });
      expect(result.get("./utils")).toEqual({
        types: "./dist/utils/index.d.ts",
        import: "./dist/utils/index.js",
      });
    });

    // #2: exports が空オブジェクトの場合は空 Map を返す
    it("exports が空オブジェクトの場合は空 Map を返す", () => {
      const packageJson = {
        exports: {},
      };
      mockedReadFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = parseExports("packages/shared/package.json");

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    // #3: `.` のみの exports は `.` を1件含む Map を返す
    it("`.` のみの exports は `.` を1件含む Map を返す", () => {
      const packageJson = {
        exports: {
          ".": {
            types: "./dist/index.d.ts",
            import: "./dist/index.js",
          },
        },
      };
      mockedReadFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = parseExports("packages/shared/package.json");

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(1);
      expect(result.has(".")).toBe(true);
    });

    // #4: string 形式の export エントリを正しく処理する
    it("string 形式の export エントリを正しく処理する", () => {
      const packageJson = {
        exports: {
          ".": "./dist/index.js",
        },
      };
      mockedReadFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = parseExports("packages/shared/package.json");

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(1);
      expect(result.get(".")).toEqual({ import: "./dist/index.js" });
    });
  });

  describe("parsePaths", () => {
    // #5: 標準的な paths を正しくパースする
    it("標準的な paths を正しくパースする", () => {
      const tsconfig = {
        compilerOptions: {
          paths: {
            "@repo/shared": ["../../packages/shared/index.ts"],
            "@repo/shared/utils": ["../../packages/shared/src/utils/index.ts"],
          },
        },
      };
      mockedReadFileSync.mockReturnValue(JSON.stringify(tsconfig));

      const result = parsePaths("apps/desktop/tsconfig.json");

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(2);
      expect(result.get("@repo/shared")).toEqual([
        "../../packages/shared/index.ts",
      ]);
      expect(result.get("@repo/shared/utils")).toEqual([
        "../../packages/shared/src/utils/index.ts",
      ]);
    });

    // #6: ワイルドカード paths エントリ（`*`）をスキップする
    it("ワイルドカード paths エントリ（`*`）をスキップする", () => {
      const tsconfig = {
        compilerOptions: {
          paths: {
            "@repo/shared/*": ["../../packages/shared/src/*"],
          },
        },
      };
      mockedReadFileSync.mockReturnValue(JSON.stringify(tsconfig));

      const result = parsePaths("apps/desktop/tsconfig.json");

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    // #7: paths が空オブジェクトの場合は空 Map を返す
    it("paths が空オブジェクトの場合は空 Map を返す", () => {
      const tsconfig = {
        compilerOptions: {
          paths: {},
        },
      };
      mockedReadFileSync.mockReturnValue(JSON.stringify(tsconfig));

      const result = parsePaths("apps/desktop/tsconfig.json");

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });
  });

  describe("parseAliases", () => {
    // #8: 標準的な alias を正しくパースする
    it("標準的な alias を正しくパースする", () => {
      const vitestConfig = `
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@repo/shared/utils": resolve(__dirname, "../../packages/shared/src/utils/index.ts"),
    },
  },
});
`;
      mockedReadFileSync.mockReturnValue(vitestConfig);

      const result = parseAliases("apps/desktop/vitest.config.ts");

      expect(result).toBeInstanceOf(Map);
      expect(result.get("@repo/shared/utils")).toBe(
        "../../packages/shared/src/utils/index.ts",
      );
    });

    // #9: resolve パス末尾にカンマがある場合も正しくパースする
    it("resolve パス末尾にカンマがある場合も正しくパースする", () => {
      const vitestConfig = `
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@repo/shared/utils": resolve(__dirname, "../../packages/shared/src/utils/index.ts",),
    },
  },
});
`;
      mockedReadFileSync.mockReturnValue(vitestConfig);

      const result = parseAliases("apps/desktop/vitest.config.ts");

      expect(result).toBeInstanceOf(Map);
      expect(result.get("@repo/shared/utils")).toBe(
        "../../packages/shared/src/utils/index.ts",
      );
    });

    // #10: alias が0件の場合は空 Map を返す
    it("alias が0件の場合は空 Map を返す", () => {
      const vitestConfig = `
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
  },
});
`;
      mockedReadFileSync.mockReturnValue(vitestConfig);

      const result = parseAliases("apps/desktop/vitest.config.ts");

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    // #11: vitest.config.ts が存在しない場合はエラーをスローする
    it("vitest.config.ts が存在しない場合はエラーをスローする", () => {
      mockedReadFileSync.mockImplementation(() => {
        throw new Error("ENOENT: no such file or directory");
      });

      expect(() => parseAliases("nonexistent/vitest.config.ts")).toThrow();
    });
  });

  describe("parseTypesVersions", () => {
    // #12: 標準的な typesVersions を正しくパースする
    it("標準的な typesVersions を正しくパースする", () => {
      const packageJson = {
        typesVersions: {
          "*": {
            utils: ["./dist/utils/index.d.ts"],
          },
        },
      };
      mockedReadFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = parseTypesVersions("packages/shared/package.json");

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(1);
      expect(result.get("utils")).toEqual(["./dist/utils/index.d.ts"]);
    });

    // #13: typesVersions が未定義の場合は空 Map を返す
    it("typesVersions が未定義の場合は空 Map を返す", () => {
      const packageJson = {
        name: "@repo/shared",
      };
      mockedReadFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = parseTypesVersions("packages/shared/package.json");

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });
  });

  // ============================================================
  // 2. チェッカー関数ユニットテスト
  // ============================================================

  describe("checkExportsVsPaths", () => {
    // #14: 全 exports エントリが paths に存在する場合は差分なし
    it("全 exports エントリが paths に存在する場合は差分なし", () => {
      const exports = new Map<string, ExportEntry>([
        [".", { types: "./dist/index.d.ts", import: "./dist/index.js" }],
        [
          "./utils",
          {
            types: "./dist/utils/index.d.ts",
            import: "./dist/utils/index.js",
          },
        ],
      ]);
      const paths = new Map<string, string[]>([
        ["@repo/shared", ["../../packages/shared/index.ts"]],
        ["@repo/shared/utils", ["../../packages/shared/src/utils/index.ts"]],
      ]);

      const result = checkExportsVsPaths(exports, paths);

      expect(result.checkName).toBe("exports -> paths");
      expect(result.passed).toBe(true);
      expect(result.missing).toEqual([]);
    });

    // #15: exports にあるが paths にないエントリを検出する
    it("exports にあるが paths にないエントリを検出する", () => {
      const exports = new Map<string, ExportEntry>([
        [".", { types: "./dist/index.d.ts", import: "./dist/index.js" }],
        [
          "./utils",
          {
            types: "./dist/utils/index.d.ts",
            import: "./dist/utils/index.js",
          },
        ],
        [
          "./errors",
          {
            types: "./dist/errors/index.d.ts",
            import: "./dist/errors/index.js",
          },
        ],
      ]);
      const paths = new Map<string, string[]>([
        ["@repo/shared", ["../../packages/shared/index.ts"]],
        ["@repo/shared/utils", ["../../packages/shared/src/utils/index.ts"]],
      ]);

      const result = checkExportsVsPaths(exports, paths);

      expect(result.checkName).toBe("exports -> paths");
      expect(result.passed).toBe(false);
      expect(result.missing).toContain("./errors");
    });
  });

  describe("checkPathsVsExports", () => {
    // #16: 全 paths エントリが exports に存在する場合は差分なし
    it("全 paths エントリが exports に存在する場合は差分なし", () => {
      const paths = new Map<string, string[]>([
        ["@repo/shared", ["../../packages/shared/index.ts"]],
        ["@repo/shared/utils", ["../../packages/shared/src/utils/index.ts"]],
      ]);
      const exports = new Map<string, ExportEntry>([
        [".", { types: "./dist/index.d.ts", import: "./dist/index.js" }],
        [
          "./utils",
          {
            types: "./dist/utils/index.d.ts",
            import: "./dist/utils/index.js",
          },
        ],
      ]);

      const result = checkPathsVsExports(paths, exports);

      expect(result.checkName).toBe("paths -> exports");
      expect(result.passed).toBe(true);
      expect(result.missing).toEqual([]);
    });

    // #17: paths にあるが exports にないエントリを検出する
    it("paths にあるが exports にないエントリを検出する", () => {
      const paths = new Map<string, string[]>([
        ["@repo/shared", ["../../packages/shared/index.ts"]],
        ["@repo/shared/utils", ["../../packages/shared/src/utils/index.ts"]],
        ["@repo/shared/extra", ["../../packages/shared/src/extra/index.ts"]],
      ]);
      const exports = new Map<string, ExportEntry>([
        [".", { types: "./dist/index.d.ts", import: "./dist/index.js" }],
        [
          "./utils",
          {
            types: "./dist/utils/index.d.ts",
            import: "./dist/utils/index.js",
          },
        ],
      ]);

      const result = checkPathsVsExports(paths, exports);

      expect(result.checkName).toBe("paths -> exports");
      expect(result.passed).toBe(false);
      expect(result.missing).toContain("@repo/shared/extra");
    });
  });

  describe("checkExportsVsAliases", () => {
    // #18: 全 exports エントリが alias に存在する場合は差分なし
    it("全 exports エントリが alias に存在する場合は差分なし", () => {
      const exports = new Map<string, ExportEntry>([
        [".", { types: "./dist/index.d.ts", import: "./dist/index.js" }],
        [
          "./utils",
          {
            types: "./dist/utils/index.d.ts",
            import: "./dist/utils/index.js",
          },
        ],
      ]);
      const aliases = new Map<string, string>([
        ["@repo/shared", "../../packages/shared/index.ts"],
        ["@repo/shared/utils", "../../packages/shared/src/utils/index.ts"],
      ]);

      const result = checkExportsVsAliases(exports, aliases);

      expect(result.checkName).toBe("exports -> aliases");
      expect(result.passed).toBe(true);
      expect(result.missing).toEqual([]);
    });

    // #19: exports にあるが alias にないエントリを検出する
    it("exports にあるが alias にないエントリを検出する", () => {
      const exports = new Map<string, ExportEntry>([
        [".", { types: "./dist/index.d.ts", import: "./dist/index.js" }],
        [
          "./utils",
          {
            types: "./dist/utils/index.d.ts",
            import: "./dist/utils/index.js",
          },
        ],
        [
          "./errors",
          {
            types: "./dist/errors/index.d.ts",
            import: "./dist/errors/index.js",
          },
        ],
      ]);
      const aliases = new Map<string, string>([
        ["@repo/shared", "../../packages/shared/index.ts"],
        ["@repo/shared/utils", "../../packages/shared/src/utils/index.ts"],
      ]);

      const result = checkExportsVsAliases(exports, aliases);

      expect(result.checkName).toBe("exports -> aliases");
      expect(result.passed).toBe(false);
      expect(result.missing).toContain("./errors");
    });
  });

  describe("checkAliasesVsExports", () => {
    // #20: 全 alias エントリが exports に存在する場合は差分なし
    it("全 alias エントリが exports に存在する場合は差分なし", () => {
      const aliases = new Map<string, string>([
        ["@repo/shared", "../../packages/shared/index.ts"],
        ["@repo/shared/utils", "../../packages/shared/src/utils/index.ts"],
      ]);
      const exports = new Map<string, ExportEntry>([
        [".", { types: "./dist/index.d.ts", import: "./dist/index.js" }],
        [
          "./utils",
          {
            types: "./dist/utils/index.d.ts",
            import: "./dist/utils/index.js",
          },
        ],
      ]);

      const result = checkAliasesVsExports(aliases, exports);

      expect(result.checkName).toBe("aliases -> exports");
      expect(result.passed).toBe(true);
      expect(result.missing).toEqual([]);
    });

    // #21: alias にあるが exports にないエントリを検出する
    it("alias にあるが exports にないエントリを検出する", () => {
      const aliases = new Map<string, string>([
        ["@repo/shared", "../../packages/shared/index.ts"],
        ["@repo/shared/utils", "../../packages/shared/src/utils/index.ts"],
        ["@repo/shared/extra", "../../packages/shared/src/extra/index.ts"],
      ]);
      const exports = new Map<string, ExportEntry>([
        [".", { types: "./dist/index.d.ts", import: "./dist/index.js" }],
        [
          "./utils",
          {
            types: "./dist/utils/index.d.ts",
            import: "./dist/utils/index.js",
          },
        ],
      ]);

      const result = checkAliasesVsExports(aliases, exports);

      expect(result.checkName).toBe("aliases -> exports");
      expect(result.passed).toBe(false);
      expect(result.missing).toContain("@repo/shared/extra");
    });
  });

  describe("checkExportsVsTypesVersions", () => {
    // #22: 全 exports サブパスが typesVersions に存在する場合は差分なし
    it("全 exports サブパスが typesVersions に存在する場合は差分なし（`.` はスキップ）", () => {
      const exports = new Map<string, ExportEntry>([
        [".", { types: "./dist/index.d.ts", import: "./dist/index.js" }],
        [
          "./utils",
          {
            types: "./dist/utils/index.d.ts",
            import: "./dist/utils/index.js",
          },
        ],
      ]);
      const typesVersions = new Map<string, string[]>([
        ["utils", ["./dist/utils/index.d.ts"]],
      ]);

      const result = checkExportsVsTypesVersions(exports, typesVersions);

      expect(result.checkName).toBe("exports -> typesVersions");
      expect(result.passed).toBe(true);
      expect(result.missing).toEqual([]);
    });

    // #23: exports にあるが typesVersions にないエントリを検出する
    it("exports にあるが typesVersions にないエントリを検出する", () => {
      const exports = new Map<string, ExportEntry>([
        [".", { types: "./dist/index.d.ts", import: "./dist/index.js" }],
        [
          "./utils",
          {
            types: "./dist/utils/index.d.ts",
            import: "./dist/utils/index.js",
          },
        ],
        [
          "./errors",
          {
            types: "./dist/errors/index.d.ts",
            import: "./dist/errors/index.js",
          },
        ],
      ]);
      const typesVersions = new Map<string, string[]>([
        ["utils", ["./dist/utils/index.d.ts"]],
      ]);

      const result = checkExportsVsTypesVersions(exports, typesVersions);

      expect(result.checkName).toBe("exports -> typesVersions");
      expect(result.passed).toBe(false);
      expect(result.missing).toContain("./errors");
    });
  });

  // ============================================================
  // 3. レポーター関数ユニットテスト
  // ============================================================

  describe("formatReport / printSummary", () => {
    // #24: 不整合なしの場合「ALL CHECKS PASSED」を出力する
    it("不整合なしの場合「ALL CHECKS PASSED」を出力する", () => {
      const results: CheckResult[] = [
        { checkName: "exports -> paths", passed: true, missing: [] },
        { checkName: "paths -> exports", passed: true, missing: [] },
        { checkName: "exports -> aliases", passed: true, missing: [] },
        { checkName: "aliases -> exports", passed: true, missing: [] },
        {
          checkName: "exports -> typesVersions",
          passed: true,
          missing: [],
        },
      ];

      const report = formatReport(results);

      expect(report).toContain("ALL CHECKS PASSED");
    });

    // #25: 不整合ありの場合、差分エントリを一覧出力する
    it("不整合ありの場合、差分エントリを一覧出力する", () => {
      const results: CheckResult[] = [
        {
          checkName: "exports -> paths",
          passed: false,
          missing: ["./errors"],
        },
        { checkName: "paths -> exports", passed: true, missing: [] },
        { checkName: "exports -> aliases", passed: true, missing: [] },
        { checkName: "aliases -> exports", passed: true, missing: [] },
        {
          checkName: "exports -> typesVersions",
          passed: true,
          missing: [],
        },
      ];

      const report = formatReport(results);

      expect(report).toContain("./errors");
      expect(report).toContain("FAILED");
      expect(report).toContain("exports -> paths");
    });

    // #26: 複数チェックの不整合を全て出力する
    it("複数チェックの不整合を全て出力する", () => {
      const results: CheckResult[] = [
        {
          checkName: "exports -> paths",
          passed: false,
          missing: ["./errors"],
        },
        { checkName: "paths -> exports", passed: true, missing: [] },
        {
          checkName: "exports -> aliases",
          passed: false,
          missing: ["./errors"],
        },
        { checkName: "aliases -> exports", passed: true, missing: [] },
        {
          checkName: "exports -> typesVersions",
          passed: false,
          missing: ["./errors"],
        },
      ];

      const report = formatReport(results);

      expect(report).toContain("exports -> paths");
      expect(report).toContain("exports -> aliases");
      expect(report).toContain("exports -> typesVersions");
      expect(report).toContain("SYNC CHECK FAILED");
    });

    // printSummary は formatReport の出力を console.log するだけなので、
    // #24-26 で formatReport の検証は済んでいる。
    // printSummary 自体のテストは main 統合テストでカバーする。
  });

  // ============================================================
  // 4. 統合テスト（main 関数）
  // ============================================================

  describe("main (統合テスト)", () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      vi.spyOn(console, "error").mockImplementation(() => {});
      // process.exitCode をリセット
      process.exitCode = undefined;
    });

    afterEach(() => {
      consoleSpy.mockRestore();
      process.exitCode = undefined;
    });

    // #27: 3層が完全一致する場合 exit code 0
    it("3層が完全一致する場合 process.exitCode は 0 または未設定", () => {
      // package.json モック（exports + typesVersions）
      const packageJson = {
        exports: {
          ".": {
            types: "./dist/index.d.ts",
            import: "./dist/index.js",
          },
          "./utils": {
            types: "./dist/utils/index.d.ts",
            import: "./dist/utils/index.js",
          },
        },
        typesVersions: {
          "*": {
            utils: ["./dist/utils/index.d.ts"],
          },
        },
      };

      // tsconfig.json モック（paths）
      const tsconfig = {
        compilerOptions: {
          paths: {
            "@repo/shared": ["../../packages/shared/index.ts"],
            "@repo/shared/utils": ["../../packages/shared/src/utils/index.ts"],
          },
        },
      };

      // vitest.config.ts モック（aliases）
      const vitestConfig = `
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@repo/shared/utils": resolve(__dirname, "../../packages/shared/src/utils/index.ts"),
      "@repo/shared": resolve(__dirname, "../../packages/shared/index.ts"),
    },
  },
});
`;

      mockedReadFileSync.mockImplementation((filePath: unknown) => {
        const pathStr = String(filePath);
        if (pathStr.includes("package.json")) {
          return JSON.stringify(packageJson);
        }
        if (pathStr.includes("tsconfig.json")) {
          return JSON.stringify(tsconfig);
        }
        if (pathStr.includes("vitest.config.ts")) {
          return vitestConfig;
        }
        throw new Error(`Unexpected file read: ${pathStr}`);
      });

      main();

      expect(process.exitCode).toBeUndefined();
    });

    // #28: 不整合がある場合 exit code 1
    it("不整合がある場合 process.exitCode は 1", () => {
      // package.json モック（exports に ./errors があるが他層にはない）
      const packageJson = {
        exports: {
          ".": {
            types: "./dist/index.d.ts",
            import: "./dist/index.js",
          },
          "./utils": {
            types: "./dist/utils/index.d.ts",
            import: "./dist/utils/index.js",
          },
          "./errors": {
            types: "./dist/errors/index.d.ts",
            import: "./dist/errors/index.js",
          },
        },
        typesVersions: {
          "*": {
            utils: ["./dist/utils/index.d.ts"],
          },
        },
      };

      // tsconfig.json モック（paths には ./errors なし）
      const tsconfig = {
        compilerOptions: {
          paths: {
            "@repo/shared": ["../../packages/shared/index.ts"],
            "@repo/shared/utils": ["../../packages/shared/src/utils/index.ts"],
          },
        },
      };

      // vitest.config.ts モック（aliases にも ./errors なし）
      const vitestConfig = `
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@repo/shared/utils": resolve(__dirname, "../../packages/shared/src/utils/index.ts"),
      "@repo/shared": resolve(__dirname, "../../packages/shared/index.ts"),
    },
  },
});
`;

      mockedReadFileSync.mockImplementation((filePath: unknown) => {
        const pathStr = String(filePath);
        if (pathStr.includes("package.json")) {
          return JSON.stringify(packageJson);
        }
        if (pathStr.includes("tsconfig.json")) {
          return JSON.stringify(tsconfig);
        }
        if (pathStr.includes("vitest.config.ts")) {
          return vitestConfig;
        }
        throw new Error(`Unexpected file read: ${pathStr}`);
      });

      main();

      expect(process.exitCode).toBe(1);
    });
  });

  // ============================================================
  // 5. ロバスト性テスト: parseAliases (#29-32)
  // ============================================================

  describe("ロバスト性テスト: parseAliases", () => {
    // #29: インデントがタブの場合も正しくパースする
    it("インデントがタブの場合も正しくパースする", () => {
      const vitestConfig = `
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
\tresolve: {
\t\talias: {
\t\t\t"@repo/shared/utils": resolve(__dirname, "../../packages/shared/src/utils/index.ts"),
\t\t},
\t},
});
`;
      mockedReadFileSync.mockReturnValue(vitestConfig);

      const result = parseAliases("apps/desktop/vitest.config.ts");

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(1);
      expect(result.get("@repo/shared/utils")).toBe(
        "../../packages/shared/src/utils/index.ts",
      );
    });

    // #30: alias定義が複数行にまたがる場合も正しくパースする
    it("alias定義が複数行にまたがる場合も正しくパースする", () => {
      const vitestConfig = `
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@repo/shared/utils": resolve(
        __dirname,
        "../../packages/shared/src/utils/index.ts"
      ),
    },
  },
});
`;
      mockedReadFileSync.mockReturnValue(vitestConfig);

      const result = parseAliases("apps/desktop/vitest.config.ts");

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(1);
      expect(result.get("@repo/shared/utils")).toBe(
        "../../packages/shared/src/utils/index.ts",
      );
    });

    // #31: resolveの引数間にコメントがある場合の挙動（スキップ確認）
    it("resolveの引数間にコメントがある場合はスキップされる", () => {
      const vitestConfig = `
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@repo/shared/utils": resolve(__dirname, /* path to utils */ "../../packages/shared/src/utils/index.ts"),
    },
  },
});
`;
      mockedReadFileSync.mockReturnValue(vitestConfig);

      const result = parseAliases("apps/desktop/vitest.config.ts");

      // コメントが __dirname と "path" の間にあるため、正規表現はマッチしない
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    // #32: シングルクォートで囲まれたaliasキーはスキップされる
    it("シングルクォートで囲まれたaliasキーはスキップされる", () => {
      const vitestConfig = `
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      '@repo/shared/utils': resolve(__dirname, '../../packages/shared/src/utils/index.ts'),
    },
  },
});
`;
      mockedReadFileSync.mockReturnValue(vitestConfig);

      const result = parseAliases("apps/desktop/vitest.config.ts");

      // 正規表現はダブルクォート前提のため、シングルクォートはマッチしない
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });
  });

  // ============================================================
  // 6. 複合不整合テスト (#33-35)
  // ============================================================

  describe("複合不整合テスト", () => {
    // #33: チェック1,3,5が同時に失敗する場合、全差分が出力される
    it("チェック1,3,5が同時に失敗する場合、全差分が出力される", () => {
      const results: CheckResult[] = [
        {
          checkName: "exports -> paths",
          passed: false,
          missing: ["./errors", "./types"],
        },
        { checkName: "paths -> exports", passed: true, missing: [] },
        {
          checkName: "exports -> aliases",
          passed: false,
          missing: ["./errors"],
        },
        { checkName: "aliases -> exports", passed: true, missing: [] },
        {
          checkName: "exports -> typesVersions",
          passed: false,
          missing: ["./types"],
        },
      ];

      const report = formatReport(results);

      // 3つの FAILED セクション
      expect(report).toContain("Check 1: exports -> paths (FAILED)");
      expect(report).toContain("Check 3: exports -> aliases (FAILED)");
      expect(report).toContain("Check 5: exports -> typesVersions (FAILED)");
      // missing エントリ
      expect(report).toContain("./errors");
      expect(report).toContain("./types");
      // サマリー
      expect(report).toContain("SYNC CHECK FAILED: 3 issue(s) found");
    });

    // #34: チェック1-5が全て失敗する場合、サマリーに総件数を出力する
    it("チェック1-5が全て失敗する場合、サマリーに総件数を出力する", () => {
      const results: CheckResult[] = [
        {
          checkName: "exports -> paths",
          passed: false,
          missing: ["./a"],
        },
        {
          checkName: "paths -> exports",
          passed: false,
          missing: ["@repo/shared/b"],
        },
        {
          checkName: "exports -> aliases",
          passed: false,
          missing: ["./c"],
        },
        {
          checkName: "aliases -> exports",
          passed: false,
          missing: ["@repo/shared/d"],
        },
        {
          checkName: "exports -> typesVersions",
          passed: false,
          missing: ["./e"],
        },
      ];

      const report = formatReport(results);

      expect(report).toContain("SYNC CHECK FAILED: 5 issue(s) found");
      // 全5チェックが FAILED として出力されている
      expect(report).toContain("Check 1: exports -> paths (FAILED)");
      expect(report).toContain("Check 2: paths -> exports (FAILED)");
      expect(report).toContain("Check 3: exports -> aliases (FAILED)");
      expect(report).toContain("Check 4: aliases -> exports (FAILED)");
      expect(report).toContain("Check 5: exports -> typesVersions (FAILED)");
    });

    // #35: 双方向チェック（1+2）で異なるエントリが不足する場合
    it("双方向チェック（1+2）で異なるエントリが不足する場合、両方の差分が独立して出力される", () => {
      // exports に ./errors があるが paths にない（チェック1: FAIL）
      // paths に @repo/shared/extra があるが exports にない（チェック2: FAIL）
      const exportsMap = new Map<string, ExportEntry>([
        [".", { types: "./dist/index.d.ts", import: "./dist/index.js" }],
        [
          "./errors",
          {
            types: "./dist/errors/index.d.ts",
            import: "./dist/errors/index.js",
          },
        ],
      ]);
      const paths = new Map<string, string[]>([
        ["@repo/shared", ["../../packages/shared/index.ts"]],
        ["@repo/shared/extra", ["../../packages/shared/src/extra/index.ts"]],
      ]);

      const result1 = checkExportsVsPaths(exportsMap, paths);
      const result2 = checkPathsVsExports(paths, exportsMap);

      // チェック1: ./errors が paths にない
      expect(result1.passed).toBe(false);
      expect(result1.missing).toContain("./errors");

      // チェック2: @repo/shared/extra が exports にない
      expect(result2.passed).toBe(false);
      expect(result2.missing).toContain("@repo/shared/extra");

      // レポートで両方の差分が出力される
      const report = formatReport([result1, result2]);
      expect(report).toContain("./errors");
      expect(report).toContain("@repo/shared/extra");
      expect(report).toContain("SYNC CHECK FAILED: 2 issue(s) found");
    });
  });

  // ============================================================
  // 7. エッジケーステスト (#36-40)
  // ============================================================

  describe("エッジケース", () => {
    // #36: exportsキーに深いネスト（`./a/b/c`）がある場合
    it("exportsキーに深いネスト（./a/b/c）がある場合も正しく照合される", () => {
      const exportsMap = new Map<string, ExportEntry>([
        [".", { types: "./dist/index.d.ts", import: "./dist/index.js" }],
        [
          "./a/b/c",
          { types: "./dist/a/b/c/index.d.ts", import: "./dist/a/b/c/index.js" },
        ],
      ]);
      const paths = new Map<string, string[]>([
        ["@repo/shared", ["../../packages/shared/index.ts"]],
        ["@repo/shared/a/b/c", ["../../packages/shared/src/a/b/c/index.ts"]],
      ]);

      const result = checkExportsVsPaths(exportsMap, paths);

      expect(result.passed).toBe(true);
      expect(result.missing).toEqual([]);
    });

    // #37: typesVersionsに`"*"`以外のバージョン条件がある場合（`"*"`キーのみ使用）
    it("typesVersionsに他バージョン条件があっても「*」キーのみ使用する", () => {
      const packageJson = {
        typesVersions: {
          ">=4.0": {
            utils: ["./dist/ts4/utils/index.d.ts"],
          },
          "*": {
            utils: ["./dist/utils/index.d.ts"],
          },
        },
      };
      mockedReadFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = parseTypesVersions("packages/shared/package.json");

      // "*" キーのみ使用される
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(1);
      expect(result.get("utils")).toEqual(["./dist/utils/index.d.ts"]);
    });

    // #38: package.jsonが不正なJSONの場合はエラーをスローする
    it("package.jsonが不正なJSONの場合はSyntaxErrorをスローする", () => {
      mockedReadFileSync.mockReturnValue("{ invalid json }");

      expect(() => parseExports("packages/shared/package.json")).toThrow(
        SyntaxError,
      );
    });

    // #39: tsconfig.jsonのcompilerOptionsが存在しない場合は空Map
    it("tsconfig.jsonのcompilerOptionsが存在しない場合は空Mapを返す", () => {
      const tsconfig = {};
      mockedReadFileSync.mockReturnValue(JSON.stringify(tsconfig));

      const result = parsePaths("apps/desktop/tsconfig.json");

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    // #40: exportsエントリの値がnullの場合のハンドリング
    it("exportsエントリの値がnullの場合はスキップされる", () => {
      const packageJson = {
        exports: {
          ".": {
            types: "./dist/index.d.ts",
            import: "./dist/index.js",
          },
          "./internal": null,
        },
      };
      mockedReadFileSync.mockReturnValue(JSON.stringify(packageJson));

      const result = parseExports("packages/shared/package.json");

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(1);
      expect(result.has(".")).toBe(true);
      expect(result.has("./internal")).toBe(false);
    });
  });

  // ============================================================
  // 8. エラーハンドリングテスト (#41-43)
  // ============================================================

  describe("エラーハンドリング", () => {
    // #41: package.jsonが存在しない場合のエラーメッセージ検証
    it("package.jsonが存在しない場合はENOENTエラーをスローする", () => {
      const errorMessage =
        "ENOENT: no such file or directory, open 'packages/shared/package.json'";
      mockedReadFileSync.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      expect(() => parseExports("packages/shared/package.json")).toThrow(
        errorMessage,
      );
    });

    // #42: tsconfig.jsonが存在しない場合のエラーメッセージ検証
    it("tsconfig.jsonが存在しない場合はENOENTエラーをスローする", () => {
      const errorMessage =
        "ENOENT: no such file or directory, open 'apps/desktop/tsconfig.json'";
      mockedReadFileSync.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      expect(() => parsePaths("apps/desktop/tsconfig.json")).toThrow(
        errorMessage,
      );
    });

    // #43: vitest.config.tsパース結果が0件の場合の警告出力検証
    it("vitest.config.tsパース結果が0件でaliasキーワードが含まれる場合は警告を出力する", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // aliasセクションがあるがフォーマットが正規表現にマッチしない
      const vitestConfig = `
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // シングルクォートのため正規表現にマッチしない
      '@repo/shared/utils': '/some/path',
    },
  },
});
`;
      mockedReadFileSync.mockReturnValue(vitestConfig);

      const result = parseAliases("apps/desktop/vitest.config.ts");

      expect(result.size).toBe(0);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("no @repo/shared aliases were parsed"),
      );

      warnSpy.mockRestore();
    });
  });
});
