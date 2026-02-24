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
  TYPES_VERSIONS_VS_EXPORTS: "typesVersions -> exports",
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
  const usesTsconfigPathsPlugin =
    content.includes("vite-tsconfig-paths") ||
    content.includes("tsconfigPaths(");

  const result = new Map<string, string>();

  // g フラグ付き正規表現の lastIndex 共有を回避するため、新しいインスタンスを生成
  const aliasRegex = new RegExp(PATTERNS.VITEST_ALIAS.source, "g");

  let match: RegExpExecArray | null;
  while ((match = aliasRegex.exec(content)) !== null) {
    const aliasName = match[1];
    const sourcePath = match[2];
    result.set(aliasName, sourcePath);
  }

  if (
    result.size === 0 &&
    content.includes("alias") &&
    !usesTsconfigPathsPlugin
  ) {
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
 * 汎用 Map 包含チェック: source の各キーを変換して target に存在するか検証する。
 * keyTransform が null を返すキーはスキップされる（typesVersions の "." 対応）。
 */
function checkMapContainment(
  source: Map<string, unknown>,
  target: Map<string, unknown>,
  checkName: string,
  keyTransform: (key: string) => string | null = (k) => k,
): CheckResult {
  const missing: string[] = [];
  for (const key of source.keys()) {
    const transformed = keyTransform(key);
    if (transformed === null) continue;
    if (!target.has(transformed)) {
      missing.push(key);
    }
  }
  return { checkName, passed: missing.length === 0, missing };
}

/** チェック1: exports の各エントリが paths に存在するか検証する。 */
export function checkExportsVsPaths(
  exportsMap: Map<string, ExportEntry>,
  paths: Map<string, string[]>,
): CheckResult {
  return checkMapContainment(
    exportsMap,
    paths,
    CHECK_NAMES.EXPORTS_VS_PATHS,
    toModuleKey,
  );
}

/** チェック2: paths の各エントリが exports に存在するか検証する。 */
export function checkPathsVsExports(
  paths: Map<string, string[]>,
  exportsMap: Map<string, ExportEntry>,
): CheckResult {
  return checkMapContainment(
    paths,
    exportsMap,
    CHECK_NAMES.PATHS_VS_EXPORTS,
    toSubpath,
  );
}

/**
 * チェック3: exports の各エントリが alias に存在するか検証する。
 * プラグイン使用時は alias が 0 件になるため、早期 return で PASS を返す。
 */
export function checkExportsVsAliases(
  exportsMap: Map<string, ExportEntry>,
  aliases: Map<string, string>,
): CheckResult {
  if (aliases.size === 0) {
    return {
      checkName: CHECK_NAMES.EXPORTS_VS_ALIASES,
      passed: true,
      missing: [],
    };
  }
  return checkMapContainment(
    exportsMap,
    aliases,
    CHECK_NAMES.EXPORTS_VS_ALIASES,
    toModuleKey,
  );
}

/**
 * チェック4: alias の各エントリが exports に存在するか検証する。
 * プラグイン使用時は alias が 0 件になるため、早期 return で PASS を返す。
 */
export function checkAliasesVsExports(
  aliases: Map<string, string>,
  exportsMap: Map<string, ExportEntry>,
): CheckResult {
  if (aliases.size === 0) {
    return {
      checkName: CHECK_NAMES.ALIASES_VS_EXPORTS,
      passed: true,
      missing: [],
    };
  }
  return checkMapContainment(
    aliases,
    exportsMap,
    CHECK_NAMES.ALIASES_VS_EXPORTS,
    toSubpath,
  );
}

/**
 * チェック5: exports の各サブパスエントリが typesVersions に存在するか検証する。
 * toTypesVersionsKey が null を返す "." エントリはスキップされる。
 */
export function checkExportsVsTypesVersions(
  exportsMap: Map<string, ExportEntry>,
  typesVersions: Map<string, string[]>,
): CheckResult {
  return checkMapContainment(
    exportsMap,
    typesVersions,
    CHECK_NAMES.EXPORTS_VS_TYPES_VERSIONS,
    toTypesVersionsKey,
  );
}

/**
 * チェック6: typesVersions の各エントリが exports に存在するか検証する。
 * typesVersions のキーを "./{key}" 形式に変換して exports と照合する。
 */
export function checkTypesVersionsVsExports(
  typesVersions: Map<string, string[]>,
  exportsMap: Map<string, ExportEntry>,
): CheckResult {
  return checkMapContainment(
    typesVersions,
    exportsMap,
    CHECK_NAMES.TYPES_VERSIONS_VS_EXPORTS,
    (k) => `./${k}`,
  );
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

  // 6つのチェッカーを実行
  const results: CheckResult[] = [
    checkExportsVsPaths(exportsMap, paths),
    checkPathsVsExports(paths, exportsMap),
    checkExportsVsAliases(exportsMap, aliases),
    checkAliasesVsExports(aliases, exportsMap),
    checkExportsVsTypesVersions(exportsMap, typesVersions),
    checkTypesVersionsVsExports(typesVersions, exportsMap),
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
