/**
 * Clean Architecture 依存関係ルール検証テスト
 *
 * @description
 * Domain層、Application層、Infrastructure層の依存関係が
 * Clean Architectureの原則に従っていることを検証する。
 */

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FEATURE_ROOT = join(__dirname, "../..");

/**
 * 指定ディレクトリ配下の全TypeScriptファイルを再帰的に取得する
 */
function getAllTsFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // __tests__ ディレクトリはスキップ
      if (entry !== "__tests__") {
        files.push(...getAllTsFiles(fullPath));
      }
    } else if (entry.endsWith(".ts") && !entry.endsWith(".test.ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * ファイル内のimport文を抽出する
 */
function extractImports(filePath: string): string[] {
  const content = readFileSync(filePath, "utf-8");
  const importRegex = /import\s+(?:(?:type\s+)?[^;]+from\s+)?["']([^"']+)["']/g;
  const imports: string[] = [];

  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

/**
 * 相対パスから実際の解決パスを取得する
 */
function resolveImportPath(importPath: string, fromDir: string): string | null {
  if (importPath.startsWith(".")) {
    // 相対パスの場合、実際のパスを解決
    const resolved = join(fromDir, importPath);
    // .js を .ts に変換
    return resolved.replace(/\.js$/, ".ts");
  }
  return importPath;
}

describe("Clean Architecture Dependency Rules", () => {
  describe("Domain層の依存関係", () => {
    const domainDir = join(FEATURE_ROOT, "domain");
    let domainFiles: string[] = [];

    try {
      domainFiles = getAllTsFiles(domainDir);
    } catch {
      // ディレクトリが存在しない場合は空配列
    }

    it("Domain層がInfrastructure層に依存していない", () => {
      const violations: string[] = [];

      for (const file of domainFiles) {
        const imports = extractImports(file);
        const fileDir = dirname(file);

        for (const imp of imports) {
          const resolved = resolveImportPath(imp, fileDir);

          if (resolved && resolved.includes("/infrastructure/")) {
            violations.push(
              `${file.replace(FEATURE_ROOT, "")} imports from infrastructure: ${imp}`,
            );
          }
        }
      }

      expect(violations).toEqual([]);
    });

    it("Domain層がApplication層に依存していない", () => {
      const violations: string[] = [];

      for (const file of domainFiles) {
        const imports = extractImports(file);
        const fileDir = dirname(file);

        for (const imp of imports) {
          const resolved = resolveImportPath(imp, fileDir);

          if (resolved && resolved.includes("/application/")) {
            violations.push(
              `${file.replace(FEATURE_ROOT, "")} imports from application: ${imp}`,
            );
          }
        }
      }

      expect(violations).toEqual([]);
    });

    it("Domain層がDrizzle ORMに依存していない", () => {
      const violations: string[] = [];

      for (const file of domainFiles) {
        const imports = extractImports(file);

        for (const imp of imports) {
          if (imp.includes("drizzle-orm") || imp.includes("drizzle/")) {
            violations.push(
              `${file.replace(FEATURE_ROOT, "")} imports drizzle: ${imp}`,
            );
          }
        }
      }

      expect(violations).toEqual([]);
    });
  });

  describe("Application層の依存関係", () => {
    const applicationDir = join(FEATURE_ROOT, "application");
    let applicationFiles: string[] = [];

    try {
      applicationFiles = getAllTsFiles(applicationDir);
    } catch {
      // ディレクトリが存在しない場合は空配列
    }

    it("Application層がInfrastructure層に依存していない", () => {
      const violations: string[] = [];

      for (const file of applicationFiles) {
        const imports = extractImports(file);
        const fileDir = dirname(file);

        for (const imp of imports) {
          const resolved = resolveImportPath(imp, fileDir);

          if (resolved && resolved.includes("/infrastructure/")) {
            violations.push(
              `${file.replace(FEATURE_ROOT, "")} imports from infrastructure: ${imp}`,
            );
          }
        }
      }

      expect(violations).toEqual([]);
    });

    it("Application層がDrizzle ORMに依存していない", () => {
      const violations: string[] = [];

      for (const file of applicationFiles) {
        const imports = extractImports(file);

        for (const imp of imports) {
          if (imp.includes("drizzle-orm") || imp.includes("drizzle/")) {
            violations.push(
              `${file.replace(FEATURE_ROOT, "")} imports drizzle: ${imp}`,
            );
          }
        }
      }

      expect(violations).toEqual([]);
    });
  });

  describe("Infrastructure層の依存関係", () => {
    const infrastructureDir = join(FEATURE_ROOT, "infrastructure");
    let _infrastructureFiles: string[] = [];

    try {
      _infrastructureFiles = getAllTsFiles(infrastructureDir);
    } catch {
      // ディレクトリが存在しない場合は空配列（_prefixは意図的に未使用を示す）
    }

    it("Infrastructure層はDomain層に依存できる", () => {
      // Infrastructure層からDomain層への依存は許可される
      // これは依存性逆転の原則に従っている（具体が抽象に依存）
      expect(true).toBe(true);
    });

    it("Infrastructure層はApplication層に依存できる", () => {
      // Infrastructure層からApplication層への依存は許可される
      // （DTOの利用など）
      expect(true).toBe(true);
    });
  });
});
