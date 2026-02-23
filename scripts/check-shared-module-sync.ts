/**
 * check-shared-module-sync.ts
 *
 * @repo/shared パッケージの4つの設定（exports / paths / alias / typesVersions）の
 * 整合性を検証するCIガードスクリプト。
 *
 * exports を正本として、paths / alias / typesVersions が exports と一致しているかを
 * 双方向で検証する。
 */

import fs from "fs";

// ============================================================
// 型定義
// ============================================================

export interface ExportEntry {
  types?: string;
  import?: string;
  require?: string;
  default?: string;
}

export interface CheckResult {
  checkName: string;
  passed: boolean;
  missing: string[];
}

// ============================================================
// 定数
// ============================================================

/** ファイルパス・プレフィックス設定 */
export const CONFIG = {
  PACKAGE_JSON_PATH: "packages/shared/package.json",
  TSCONFIG_PATH: "apps/desktop/tsconfig.json",
  VITEST_CONFIG_PATH: "apps/desktop/vitest.config.ts",
  SHARED_PREFIX: "@repo/shared",
} as const;

/** 正規表現パターン */
const PATTERNS = {
  VITEST_ALIAS:
    /"(@repo\/shared[^"]*)":\s*resolve\(\s*__dirname,\s*"([^"]+)"\s*,?\s*\)/g,
} as const;

/** チェック名定数 */
const CHECK_NAMES = {
  EXPORTS_VS_PATHS: "exports -> paths",
  PATHS_VS_EXPORTS: "paths -> exports",
  EXPORTS_VS_ALIASES: "exports -> aliases",
  ALIASES_VS_EXPORTS: "aliases -> exports",
  EXPORTS_VS_TYPES_VERSIONS: "exports -> typesVersions",
} as const;

/** 後方互換エイリアス */
export const PACKAGE_JSON_PATH = CONFIG.PACKAGE_JSON_PATH;
export const TSCONFIG_PATH = CONFIG.TSCONFIG_PATH;
export const VITEST_CONFIG_PATH = CONFIG.VITEST_CONFIG_PATH;

// ============================================================
// パーサー関数
// ============================================================

/**
 * package.json の exports フィールドを Map<string, ExportEntry> に変換する。
 * string 形式のエントリは { import: value } に正規化する。
 */
export function parseExports(
  packageJsonPath: string,
): Map<string, ExportEntry> {
  const content = fs.readFileSync(packageJsonPath, "utf-8");
  const packageJson = JSON.parse(content) as {
    exports?: Record<string, ExportEntry | string>;
  };

  const result = new Map<string, ExportEntry>();

  if (!packageJson.exports) {
    return result;
  }

  for (const [key, value] of Object.entries(packageJson.exports)) {
    if (value === null || value === undefined) {
      continue;
    }
    if (typeof value === "string") {
      result.set(key, { import: value });
    } else {
      result.set(key, value);
    }
  }

  return result;
}

/**
 * tsconfig.json の compilerOptions.paths を Map に変換する。
 * @repo/shared プレフィックスのみフィルタリングし、ワイルドカード(*)をスキップする。
 */
export function parsePaths(tsconfigPath: string): Map<string, string[]> {
  const content = fs.readFileSync(tsconfigPath, "utf-8");
  const tsconfig = JSON.parse(content) as {
    compilerOptions?: { paths?: Record<string, string[]> };
  };

  const result = new Map<string, string[]>();

  const paths = tsconfig.compilerOptions?.paths;
  if (!paths) {
    return result;
  }

  for (const [key, value] of Object.entries(paths)) {
    // ワイルドカードエントリをスキップ
    if (key.includes("*")) {
      continue;
    }
    // @repo/shared プレフィックスのみ
    if (key.startsWith(CONFIG.SHARED_PREFIX)) {
      result.set(key, value);
    }
  }

  return result;
}

/**
 * vitest.config.ts を正規表現でパースし、@repo/shared エイリアスを Map に変換する。
 */
export function parseAliases(vitestConfigPath: string): Map<string, string> {
  const content = fs.readFileSync(vitestConfigPath, "utf-8");

  const result = new Map<string, string>();

  const aliasRegex = new RegExp(PATTERNS.VITEST_ALIAS.source, "g");

  let match: RegExpExecArray | null;
  while ((match = aliasRegex.exec(content)) !== null) {
    const aliasName = match[1];
    const sourcePath = match[2];
    result.set(aliasName, sourcePath);
  }

  if (result.size === 0 && content.includes("alias")) {
    console.warn(
      `Warning: vitest.config.ts contains "alias" but no @repo/shared aliases were parsed. Check the alias format.`,
    );
  }

  return result;
}

/**
 * package.json の typesVersions["*"] を Map に変換する。
 */
export function parseTypesVersions(
  packageJsonPath: string,
): Map<string, string[]> {
  const content = fs.readFileSync(packageJsonPath, "utf-8");
  const packageJson = JSON.parse(content) as {
    typesVersions?: { "*"?: Record<string, string[]> };
  };

  const result = new Map<string, string[]>();

  const versions = packageJson.typesVersions?.["*"];
  if (!versions) {
    return result;
  }

  for (const [key, value] of Object.entries(versions)) {
    result.set(key, value);
  }

  return result;
}

// ============================================================
// 変換ユーティリティ
// ============================================================

const SHARED_PREFIX_WITH_SLASH = `${CONFIG.SHARED_PREFIX}/`;

/**
 * exports サブパスキーを paths/alias キーに変換する。
 * "." -> "@repo/shared"
 * "./xxx" -> "@repo/shared/xxx"
 */
function toModuleKey(subpath: string): string {
  if (subpath === ".") {
    return CONFIG.SHARED_PREFIX;
  }
  return `${CONFIG.SHARED_PREFIX}/${subpath.slice(2)}`;
}

/**
 * paths/alias キーを exports サブパスキーに逆変換する。
 * "@repo/shared" -> "."
 * "@repo/shared/xxx" -> "./xxx"
 */
function toSubpath(moduleKey: string): string {
  if (moduleKey === CONFIG.SHARED_PREFIX) {
    return ".";
  }
  return `./${moduleKey.slice(SHARED_PREFIX_WITH_SLASH.length)}`;
}

/**
 * exports サブパスキーを typesVersions キーに変換する。
 * "./xxx" -> "xxx"
 * "." はスキップ対象（null を返す）
 */
function toTypesVersionsKey(subpath: string): string | null {
  if (subpath === ".") {
    return null;
  }
  return subpath.slice(2);
}

// ============================================================
// チェッカー関数
// ============================================================

/**
 * チェック1: exports の各エントリが paths に存在するか検証する。
 */
export function checkExportsVsPaths(
  exportsMap: Map<string, ExportEntry>,
  paths: Map<string, string[]>,
): CheckResult {
  const missing: string[] = [];

  for (const subpath of exportsMap.keys()) {
    if (!paths.has(toModuleKey(subpath))) {
      missing.push(subpath);
    }
  }

  return {
    checkName: CHECK_NAMES.EXPORTS_VS_PATHS,
    passed: missing.length === 0,
    missing,
  };
}

/**
 * チェック2: paths の各エントリが exports に存在するか検証する。
 */
export function checkPathsVsExports(
  paths: Map<string, string[]>,
  exportsMap: Map<string, ExportEntry>,
): CheckResult {
  const missing: string[] = [];

  for (const moduleKey of paths.keys()) {
    if (!exportsMap.has(toSubpath(moduleKey))) {
      missing.push(moduleKey);
    }
  }

  return {
    checkName: CHECK_NAMES.PATHS_VS_EXPORTS,
    passed: missing.length === 0,
    missing,
  };
}

/**
 * チェック3: exports の各エントリが alias に存在するか検証する。
 */
export function checkExportsVsAliases(
  exportsMap: Map<string, ExportEntry>,
  aliases: Map<string, string>,
): CheckResult {
  const missing: string[] = [];

  for (const subpath of exportsMap.keys()) {
    if (!aliases.has(toModuleKey(subpath))) {
      missing.push(subpath);
    }
  }

  return {
    checkName: CHECK_NAMES.EXPORTS_VS_ALIASES,
    passed: missing.length === 0,
    missing,
  };
}

/**
 * チェック4: alias の各エントリが exports に存在するか検証する。
 */
export function checkAliasesVsExports(
  aliases: Map<string, string>,
  exportsMap: Map<string, ExportEntry>,
): CheckResult {
  const missing: string[] = [];

  for (const moduleKey of aliases.keys()) {
    if (!exportsMap.has(toSubpath(moduleKey))) {
      missing.push(moduleKey);
    }
  }

  return {
    checkName: CHECK_NAMES.ALIASES_VS_EXPORTS,
    passed: missing.length === 0,
    missing,
  };
}

/**
 * チェック5: exports の各サブパスエントリが typesVersions に存在するか検証する。
 * "." エントリはスキップする。
 */
export function checkExportsVsTypesVersions(
  exportsMap: Map<string, ExportEntry>,
  typesVersions: Map<string, string[]>,
): CheckResult {
  const missing: string[] = [];

  for (const subpath of exportsMap.keys()) {
    const tvKey = toTypesVersionsKey(subpath);
    // "." はスキップ
    if (tvKey === null) {
      continue;
    }
    if (!typesVersions.has(tvKey)) {
      missing.push(subpath);
    }
  }

  return {
    checkName: CHECK_NAMES.EXPORTS_VS_TYPES_VERSIONS,
    passed: missing.length === 0,
    missing,
  };
}

// ============================================================
// レポーター関数
// ============================================================

/**
 * チェック結果をフォーマットした文字列を返す。
 */
export function formatReport(results: CheckResult[]): string {
  const lines: string[] = [];

  results.forEach((result, index) => {
    const checkNum = index + 1;
    if (result.passed) {
      lines.push(`  Check ${checkNum}: ${result.checkName} (PASSED)`);
    } else {
      lines.push(`  Check ${checkNum}: ${result.checkName} (FAILED)`);
      lines.push(`   Missing: ${result.missing.join(", ")}`);
    }
  });

  const hasFailures = results.some((r) => !r.passed);
  if (hasFailures) {
    const failCount = results.filter((r) => !r.passed).length;
    lines.push("");
    lines.push(`  SYNC CHECK FAILED: ${failCount} issue(s) found`);
  } else {
    lines.push("");
    lines.push("  ALL CHECKS PASSED");
  }

  return lines.join("\n");
}

/**
 * formatReport の結果を console.log で出力する。
 */
export function printSummary(results: CheckResult[]): void {
  const report = formatReport(results);
  console.log(report);
}

// ============================================================
// main 関数
// ============================================================

export function main(): void {
  // 4つのパーサーを実行
  const exportsMap = parseExports(PACKAGE_JSON_PATH);
  const paths = parsePaths(TSCONFIG_PATH);
  const aliases = parseAliases(VITEST_CONFIG_PATH);
  const typesVersions = parseTypesVersions(PACKAGE_JSON_PATH);

  // 5つのチェッカーを実行
  const results: CheckResult[] = [
    checkExportsVsPaths(exportsMap, paths),
    checkPathsVsExports(paths, exportsMap),
    checkExportsVsAliases(exportsMap, aliases),
    checkAliasesVsExports(aliases, exportsMap),
    checkExportsVsTypesVersions(exportsMap, typesVersions),
  ];

  // レポート出力
  printSummary(results);

  // 不整合がある場合は exitCode を 1 に設定
  const hasFailures = results.some((r) => !r.passed);
  if (hasFailures) {
    process.exitCode = 1;
  }
}

// スクリプト直接実行時
const isDirectRun =
  typeof process !== "undefined" &&
  process.argv[1] &&
  (process.argv[1].endsWith("check-shared-module-sync.ts") ||
    process.argv[1].endsWith("check-shared-module-sync.js"));

if (isDirectRun) {
  main();
}
