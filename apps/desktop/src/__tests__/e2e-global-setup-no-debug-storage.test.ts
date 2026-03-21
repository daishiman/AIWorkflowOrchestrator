/**
 * e2e global-setup の debug-clear-storage 依存検証テスト
 *
 * e2e global-setup.ts が debug-clear-storage を前提としない
 * 正常な preflight を行うことを検証する。
 */
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const globalSetupPath = resolve(__dirname, "../../e2e/global-setup.ts");

function readGlobalSetup(): string {
  return readFileSync(globalSetupPath, "utf-8");
}

describe("e2e global-setup の debug-clear-storage 非依存検証", () => {
  it("2-1: global-setup.ts に debug-clear-storage が含まれない", () => {
    const content = readGlobalSetup();
    expect(content).not.toContain("debug-clear-storage");
  });

  it("2-2: global-setup.ts が認証バイパス用の auth-storage を設定している", () => {
    const content = readGlobalSetup();
    // 認証バイパスの基盤として auth-storage の localStorage 設定が維持されていること
    expect(content).toContain("auth-storage");
  });

  it("2-3: global-setup.ts に debug 目的の sessionStorage 操作が含まれない", () => {
    const content = readGlobalSetup();
    // debug-clear-storage 以外の sessionStorage.setItem は検出対象外だが、
    // debug 目的の sessionStorage 操作がないことを確認
    const lines = content.split("\n");
    const debugSessionStorageLines = lines.filter(
      (line) =>
        line.includes("sessionStorage.setItem") && line.includes("debug"),
    );
    expect(debugSessionStorageLines).toHaveLength(0);
  });
});
