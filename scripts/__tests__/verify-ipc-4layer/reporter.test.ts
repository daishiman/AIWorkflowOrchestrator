/**
 * レポーターテスト
 * scripts/verify-ipc-4layer.js の formatReport 関数をテストする
 */
import { describe, it, expect } from "vitest";

const { formatReport } = require("../../verify-ipc-4layer.cjs");

describe("formatReport", () => {
  it("全ルール PASS のレポートを生成する", () => {
    const results = [
      { rule: "Rule-1", status: "pass", missing: [], description: "desc1" },
      { rule: "Rule-2", status: "pass", missing: [], description: "desc2" },
      { rule: "Rule-3", status: "pass", missing: [], description: "desc3" },
    ];
    const report = formatReport(results);
    expect(report.hasErrors).toBe(false);
    expect(report.text).toContain("PASS");
    expect(report.text).toContain("Passed: 3");
    expect(report.text).toContain("Failed: 0");
  });

  it("FAIL ルールがある場合 hasErrors=true を返す", () => {
    const results = [
      { rule: "Rule-1", status: "pass", missing: [], description: "desc1" },
      {
        rule: "Rule-2",
        status: "fail",
        missing: ["ch:missing"],
        description: "desc2",
      },
    ];
    const report = formatReport(results);
    expect(report.hasErrors).toBe(true);
    expect(report.text).toContain("FAIL");
    expect(report.text).toContain("Passed: 1");
    expect(report.text).toContain("Failed: 1");
  });

  it("FAIL 時に ::error:: アノテーションを含む", () => {
    const results = [
      {
        rule: "Rule-2",
        status: "fail",
        missing: ["ch:one", "ch:two"],
        description:
          "preload invoke ホワイトリストのチャネルが main ハンドラに未実装",
      },
    ];
    const report = formatReport(results);
    expect(report.text).toContain('::error::Rule-2: Channel "ch:one"');
    expect(report.text).toContain('::error::Rule-2: Channel "ch:two"');
  });

  it("missing チャネル数をレポートに含む", () => {
    const results = [
      {
        rule: "Rule-1",
        status: "fail",
        missing: ["a:one", "a:two", "a:three"],
        description: "desc",
      },
    ];
    const report = formatReport(results);
    expect(report.text).toContain("FAIL (3 missing)");
  });

  it("ヘッダーとサマリーセクションを含む", () => {
    const results = [
      { rule: "Rule-1", status: "pass", missing: [], description: "desc" },
    ];
    const report = formatReport(results);
    expect(report.text).toContain("=== IPC 4-Layer Alignment Verification ===");
    expect(report.text).toContain("--- Summary ---");
    expect(report.text).toContain("Total rules: 1");
  });

  it("空の結果配列に対して正常なレポートを生成する", () => {
    const results: unknown[] = [];
    const report = formatReport(results);
    expect(report.hasErrors).toBe(false);
    expect(report.text).toContain("Total rules: 0");
    expect(report.text).toContain("Passed: 0");
    expect(report.text).toContain("Failed: 0");
  });

  it("全ルール FAIL のレポートを生成する", () => {
    const results = [
      {
        rule: "Rule-1",
        status: "fail",
        missing: ["ch:a"],
        description: "desc1",
      },
      {
        rule: "Rule-2",
        status: "fail",
        missing: ["ch:b"],
        description: "desc2",
      },
      {
        rule: "Rule-3",
        status: "fail",
        missing: ["ch:c"],
        description: "desc3",
      },
    ];
    const report = formatReport(results);
    expect(report.hasErrors).toBe(true);
    expect(report.text).toContain("Passed: 0");
    expect(report.text).toContain("Failed: 3");
  });

  it("text プロパティが string 型である", () => {
    const results = [
      { rule: "Rule-1", status: "pass", missing: [], description: "desc" },
    ];
    const report = formatReport(results);
    expect(typeof report.text).toBe("string");
  });
});
