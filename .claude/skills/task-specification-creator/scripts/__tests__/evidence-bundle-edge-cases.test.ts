import { describe, it, expect, afterEach } from "vitest";
import { writeFileSync, unlinkSync, mkdtempSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import {
  parseWorkflowResult,
  validateChecklist,
  evaluateViolations,
  verifyScreenshot,
} from "../evidence-bundle-validator";
import type { ChecklistItem } from "../evidence-bundle-validator";

describe("evidence-bundle-edge-cases", () => {
  const tempFiles: string[] = [];

  afterEach(() => {
    for (const f of tempFiles) {
      try {
        unlinkSync(f);
      } catch {
        // ignore cleanup errors
      }
    }
    tempFiles.length = 0;
  });

  // ── エッジケース（T6-01〜T6-03）──────────────────

  // T6-01: 1workflow のみでもパースできる
  it("T6-01: 1workflow のみの配列でも正常に動作する", () => {
    const raw = JSON.stringify({
      workflowName: "aiworkflow-requirements",
      timestamp: "2026-03-03T10:00:00Z",
      totalSpecs: 5,
      passedSpecs: 5,
      failedSpecs: 0,
      violations: [],
    });

    const result = parseWorkflowResult(raw);
    const bundled = [result];

    expect(bundled).toHaveLength(1);
    expect(bundled[0].workflowName).toBe("aiworkflow-requirements");
  });

  // T6-02: 3つ以上の workflow を配列に追加できる
  it("T6-02: 3workflow 以上を配列に統合できる", () => {
    const names = ["wf-alpha", "wf-beta", "wf-gamma"];
    const results = names.map((name) =>
      parseWorkflowResult(
        JSON.stringify({
          workflowName: name,
          timestamp: new Date().toISOString(),
          totalSpecs: 1,
          passedSpecs: 1,
          failedSpecs: 0,
          violations: [],
        }),
      ),
    );

    expect(results).toHaveLength(3);
    expect(results.map((r) => r.workflowName)).toEqual(names);
  });

  // T6-03: 空の workflowName でエラーになる
  it("T6-03: workflowName が空文字列の場合にエラーを投げる", () => {
    const raw = JSON.stringify({
      workflowName: "",
      timestamp: "2026-03-03T10:00:00Z",
      totalSpecs: 0,
      passedSpecs: 0,
      failedSpecs: 0,
      violations: [],
    });

    expect(() => parseWorkflowResult(raw)).toThrow(
      "workflowName must be a non-empty string",
    );
  });

  // ── エラーハンドリング（T6-04〜T6-08）──────────────

  // T6-04: 不正な JSON 文字列でエラーになる
  it("T6-04: 不正な JSON でパースエラーを投げる", () => {
    expect(() => parseWorkflowResult("not-valid-json")).toThrow();
  });

  // T6-05: 未知の taskId を含むチェックリストも正常に処理できる
  it("T6-05: 未知の taskId を含むチェックリストでも検証可能", () => {
    const checklist: ChecklistItem[] = [
      { taskId: "unknown-task-999", label: "未知の項目A", isChecked: true },
      { taskId: "unknown-task-999", label: "未知の項目B", isChecked: false },
    ];

    const result = validateChecklist(checklist);

    expect(result.status).toBe("incomplete");
    expect(result.missingItems).toContain("未知の項目B");
  });

  // T6-06: ディレクトリトラバーサルパスを拒否する
  it("T6-06: パスに '..' を含む場合にエラーを投げる", () => {
    expect(() => verifyScreenshot("../../../etc/passwd")).toThrow(
      "directory traversal is not allowed",
    );
  });

  // T6-07: 負の violations 数でエラーになる
  it("T6-07: currentViolations が負数の場合にエラーを投げる", () => {
    expect(() => evaluateViolations(-1, 5)).toThrow(
      "currentViolations must be non-negative",
    );
  });

  // T6-08: 空のチェックリスト配列で incomplete 判定になる
  it("T6-08: 空のチェックリスト配列で incomplete を返す", () => {
    const result = validateChecklist([]);

    expect(result.status).toBe("incomplete");
    expect(result.missingItems).toHaveLength(0);
  });

  // ── 境界値（T6-09〜T6-13）────────────────────────

  // T6-09: 100 項目のチェックリストを正常に検証できる
  it("T6-09: 100 項目の大規模チェックリストを処理できる", () => {
    const checklist: ChecklistItem[] = Array.from({ length: 100 }, (_, i) => ({
      taskId: `task-${i}`,
      label: `項目 ${i}`,
      isChecked: true,
    }));

    const result = validateChecklist(checklist);

    expect(result.status).toBe("complete");
    expect(result.missingItems).toHaveLength(0);
  });

  // T6-10: 255 文字のファイル名でスクリーンショット検証できる
  it("T6-10: 255 文字のファイル名を受け入れる", () => {
    const fileName = "a".repeat(251) + ".png";
    expect(fileName.length).toBe(255);

    const tempDir = mkdtempSync(join(tmpdir(), "evidence-edge-"));
    const filePath = join(tempDir, fileName);
    writeFileSync(filePath, "fake-png");
    tempFiles.push(filePath);

    const result = verifyScreenshot(filePath);
    expect(result.exists).toBe(true);
  });

  // T6-11: 256 文字以上のファイル名でエラーになる
  it("T6-11: 256 文字以上のファイル名でエラーを投げる", () => {
    const fileName = "a".repeat(252) + ".png";
    expect(fileName.length).toBe(256);

    expect(() => verifyScreenshot(`/tmp/${fileName}`)).toThrow(
      "filename exceeds 255 characters",
    );
  });

  // T6-12: current=0, baseline=0 の場合に pass 判定になる
  it("T6-12: current=0, baseline=0 で pass 判定", () => {
    const result = evaluateViolations(0, 0);

    expect(result.verdict).toBe("pass");
    expect(result.currentViolations).toBe(0);
    expect(result.baseline).toBe(0);
  });

  // T6-13: 1000 件の violations を持つ WorkflowResult をパースできる
  it("T6-13: 1000 件の violations を正常にパースできる", () => {
    const violations = Array.from({ length: 1000 }, (_, i) => ({
      file: `spec-${i}.md`,
      rule: `rule-${i}`,
      message: `violation ${i}`,
    }));

    const raw = JSON.stringify({
      workflowName: "stress-test",
      timestamp: "2026-03-03T12:00:00Z",
      totalSpecs: 1000,
      passedSpecs: 0,
      failedSpecs: 1000,
      violations,
    });

    const result = parseWorkflowResult(raw);

    expect(result.violations).toHaveLength(1000);
    expect(result.violations[999].file).toBe("spec-999.md");
  });
});
