/**
 * debug-clear-storage 残存チェック自動テスト
 *
 * App.tsx のデバッグコード本体は TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 で削除済み。
 * repo-wide に残存する debug-clear-storage 前提の workaround を検出し、
 * 全て除去されたことを検証する。
 */
import { execSync } from "child_process";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const desktopRoot = resolve(__dirname, "../..");
const repoRoot = resolve(desktopRoot, "../..");

function searchPattern(
  pattern: string,
  searchPath: string,
  excludePatterns: string[] = [],
): string[] {
  const excludeArgs = excludePatterns.map((p) => `--glob '!${p}'`).join(" ");
  try {
    const cmd = `rg -n "${pattern}" ${searchPath} ${excludeArgs} 2>/dev/null || true`;
    const result = execSync(cmd, { encoding: "utf-8", cwd: repoRoot }).trim();
    return result ? result.split("\n").filter(Boolean) : [];
  } catch {
    // rg not found, fallback to grep
    try {
      const cmd = `grep -rn "${pattern}" ${searchPath} 2>/dev/null || true`;
      const result = execSync(cmd, { encoding: "utf-8", cwd: repoRoot }).trim();
      return result ? result.split("\n").filter(Boolean) : [];
    } catch {
      return [];
    }
  }
}

describe("debug-clear-storage 残存チェック", () => {
  const excludes = [
    "docs/30-workflows/debug-clear-storage-shim-cleanup/**",
    "docs/30-workflows/unassigned-task/**",
    "docs/30-workflows/issues/**",
    "docs/30-workflows/completed-tasks/**",
    "**/outputs/**",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/coverage*/**",
    "**/*.html",
  ];

  it("1-1: apps/ 配下のソースコード (.ts/.tsx) に debug-clear-storage が存在しない", () => {
    const matches = searchPattern("debug-clear-storage", "apps/", [
      ...excludes,
      "**/__tests__/**",
    ]);
    // テストファイルと仕様書を除外した結果が0件であること
    const filtered = matches.filter(
      (line) =>
        !line.includes(".test.ts") &&
        !line.includes(".test.tsx") &&
        !line.includes("__tests__/") &&
        !line.includes("outputs/") &&
        !line.includes("coverage") &&
        !line.includes(".html") &&
        !line.includes("docs/30-workflows/debug-clear-storage-shim-cleanup/"),
    );
    expect(
      filtered,
      `以下の箇所に debug-clear-storage が残存しています:\n${filtered.join("\n")}`,
    ).toHaveLength(0);
  });

  it("1-2: scripts/ 配下に debug-clear-storage が存在しない", () => {
    const matches = searchPattern(
      "debug-clear-storage",
      "apps/desktop/scripts/",
    );
    expect(
      matches,
      `以下の scripts に debug-clear-storage が残存しています:\n${matches.join("\n")}`,
    ).toHaveLength(0);
  });

  it("1-3: sessionStorage.setItem で debug-clear-storage をセットするコードが存在しない", () => {
    const matches = searchPattern(
      "sessionStorage\\.setItem.*debug-clear-storage",
      "apps/",
      [...excludes, "**/__tests__/**"],
    );
    const filtered = matches.filter(
      (line) =>
        !line.includes(".test.ts") &&
        !line.includes(".test.tsx") &&
        !line.includes("__tests__/") &&
        !line.includes("coverage") &&
        !line.includes(".html"),
    );
    expect(
      filtered,
      `以下の箇所に sessionStorage.setItem("debug-clear-storage",...) が残存しています:\n${filtered.join("\n")}`,
    ).toHaveLength(0);
  });
});
