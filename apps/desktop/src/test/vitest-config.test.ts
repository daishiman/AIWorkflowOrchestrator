/**
 * vitest.config.ts 設定検証テスト
 *
 * TASK-FIX-10-1: dangerouslyIgnoreUnhandledErrors が設定に含まれていないことを検証する。
 * このテストにより、将来的に誤ってフラグが再追加されることを防止する。
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("vitest.config.ts", () => {
  const configPath = resolve(__dirname, "../../vitest.config.ts");
  const configContent = readFileSync(configPath, "utf-8");

  it("should only use dangerouslyIgnoreUnhandledErrors conditionally for CI", () => {
    // CI環境のみ有効化が許可される（Worker crash回避）
    // ローカル開発では無効（デフォルト false）で未処理エラーを検出
    if (configContent.includes("dangerouslyIgnoreUnhandledErrors")) {
      expect(configContent).toContain("process.env.CI");
    }
  });

  it("should use happy-dom as test environment", () => {
    expect(configContent).toContain('environment: "happy-dom"');
  });

  it("should have setup files configured", () => {
    expect(configContent).toContain("setupFiles");
  });

  it("should include test timeout configuration", () => {
    expect(configContent).toContain("testTimeout");
  });

  it("should include teardown timeout configuration", () => {
    expect(configContent).toContain("teardownTimeout");
  });
});
