import { describe, it, expect } from "vitest";
import { parseWorkflowResult } from "../evidence-bundle-validator";
import type { WorkflowResult } from "../evidence-bundle-validator";

describe("evidence-bundle-template", () => {
  // T4-01: verify-all-specs の結果が JSON 形式で記録される
  it("T4-01: verify-all-specs の結果を WorkflowResult 型にパースできる", () => {
    const rawOutput = JSON.stringify({
      workflowName: "aiworkflow-requirements",
      timestamp: "2026-03-03T10:00:00Z",
      totalSpecs: 10,
      passedSpecs: 8,
      failedSpecs: 2,
      violations: [
        {
          file: "spec-a.md",
          rule: "section-order",
          message: "セクション順序が不正",
        },
        {
          file: "spec-b.md",
          rule: "missing-field",
          message: "必須フィールド欠落",
        },
      ],
    });

    const result: WorkflowResult = parseWorkflowResult(rawOutput);

    expect(result.workflowName).toBe("aiworkflow-requirements");
    expect(result.timestamp).toBe("2026-03-03T10:00:00Z");
    expect(result.totalSpecs).toBe(10);
    expect(result.passedSpecs).toBe(8);
    expect(result.failedSpecs).toBe(2);
    expect(result.violations).toHaveLength(2);
    expect(result.violations[0].file).toBe("spec-a.md");
    expect(result.violations[0].rule).toBe("section-order");
  });

  // T4-02: validate-phase-output の結果が同一フォーマットで記録される
  it("T4-02: validate-phase-output の結果を同一スキーマで記録できる", () => {
    const rawOutput = JSON.stringify({
      workflowName: "task-specification-creator",
      timestamp: "2026-03-03T11:00:00Z",
      totalSpecs: 5,
      passedSpecs: 5,
      failedSpecs: 0,
      violations: [],
    });

    const result: WorkflowResult = parseWorkflowResult(rawOutput);

    expect(result.workflowName).toBe("task-specification-creator");
    expect(result.totalSpecs).toBe(5);
    expect(result.failedSpecs).toBe(0);
    expect(result.violations).toHaveLength(0);
  });

  // T4-03: 2workflow の結果を1テンプレートに統合記録できる
  it("T4-03: 2つの WorkflowResult を統合して1つの配列に記録できる", () => {
    const raw1 = JSON.stringify({
      workflowName: "aiworkflow-requirements",
      timestamp: "2026-03-03T10:00:00Z",
      totalSpecs: 10,
      passedSpecs: 8,
      failedSpecs: 2,
      violations: [
        { file: "a.md", rule: "r1", message: "m1" },
      ],
    });

    const raw2 = JSON.stringify({
      workflowName: "task-specification-creator",
      timestamp: "2026-03-03T11:00:00Z",
      totalSpecs: 5,
      passedSpecs: 5,
      failedSpecs: 0,
      violations: [],
    });

    const result1 = parseWorkflowResult(raw1);
    const result2 = parseWorkflowResult(raw2);
    const bundledResults: WorkflowResult[] = [result1, result2];

    expect(bundledResults).toHaveLength(2);
    expect(bundledResults[0].workflowName).toBe("aiworkflow-requirements");
    expect(bundledResults[1].workflowName).toBe("task-specification-creator");
    expect(bundledResults[0].violations).toHaveLength(1);
    expect(bundledResults[1].violations).toHaveLength(0);
  });
});
