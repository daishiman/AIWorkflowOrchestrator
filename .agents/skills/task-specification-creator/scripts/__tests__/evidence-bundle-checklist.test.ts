import { describe, it, expect } from "vitest";
import { validateChecklist } from "../evidence-bundle-validator";
import type { ChecklistItem } from "../evidence-bundle-validator";

function makeChecklist(overrides: Partial<Record<string, boolean>> = {}): ChecklistItem[] {
  const defaults: ChecklistItem[] = [
    { taskId: "task1", label: "implementation-guide.md Part 1 存在", isChecked: true },
    { taskId: "task1", label: "implementation-guide.md Part 2 存在", isChecked: true },
    { taskId: "task1", label: "API/IPC/Component 文書存在", isChecked: true },
    { taskId: "task3", label: "documentation-changelog.md 存在", isChecked: true },
    { taskId: "task3", label: "全 Step 完了結果記録", isChecked: true },
    { taskId: "task4", label: "unassigned-task-detection.md 存在", isChecked: true },
    { taskId: "task4", label: "未タスク 3 ステップ全完了", isChecked: true },
    { taskId: "task5", label: "aiworkflow-requirements/LOGS.md 更新", isChecked: true },
    { taskId: "task5", label: "task-specification-creator/LOGS.md 更新", isChecked: true },
    { taskId: "task5", label: "aiworkflow-requirements/SKILL.md 変更履歴更新", isChecked: true },
    { taskId: "task5", label: "task-specification-creator/SKILL.md 変更履歴更新", isChecked: true },
  ];

  return defaults.map((item) => ({
    ...item,
    isChecked: overrides[item.label] !== undefined ? overrides[item.label]! : item.isChecked,
  }));
}

describe("evidence-bundle-checklist", () => {
  // T4-04: Task 1 実体確認で未記入項目があれば未完了判定になる
  it("T4-04: Task 1 の Part 1/Part 2 チェックが false の場合に incomplete", () => {
    const checklist = makeChecklist({
      "implementation-guide.md Part 1 存在": false,
      "implementation-guide.md Part 2 存在": false,
    });

    const result = validateChecklist(checklist);

    expect(result.status).toBe("incomplete");
    expect(result.missingItems).toContain("implementation-guide.md Part 1 存在");
    expect(result.missingItems).toContain("implementation-guide.md Part 2 存在");
  });

  // T4-05: Task 3 documentation-changelog 未記入で未完了判定になる
  it("T4-05: changelog チェックが false の場合に incomplete", () => {
    const checklist = makeChecklist({
      "documentation-changelog.md 存在": false,
    });

    const result = validateChecklist(checklist);

    expect(result.status).toBe("incomplete");
    expect(result.missingItems).toContain("documentation-changelog.md 存在");
  });

  // T4-06: Task 4 未タスク検出チェック未記入で未完了判定になる
  it("T4-06: unassigned-task-detection チェックが false の場合に incomplete", () => {
    const checklist = makeChecklist({
      "unassigned-task-detection.md 存在": false,
    });

    const result = validateChecklist(checklist);

    expect(result.status).toBe("incomplete");
    expect(result.missingItems).toContain("unassigned-task-detection.md 存在");
  });

  // T4-07: Task 5 LOGS.md 2ファイル更新チェック未記入で未完了判定になる
  it("T4-07: LOGS.md 2 ファイル更新チェックが false の場合に incomplete", () => {
    const checklist = makeChecklist({
      "aiworkflow-requirements/LOGS.md 更新": false,
      "task-specification-creator/LOGS.md 更新": false,
    });

    const result = validateChecklist(checklist);

    expect(result.status).toBe("incomplete");
    expect(result.missingItems).toContain("aiworkflow-requirements/LOGS.md 更新");
    expect(result.missingItems).toContain("task-specification-creator/LOGS.md 更新");
  });

  // T4-08: 全項目記入済みで完了判定になる
  it("T4-08: 全項目が true の場合に complete", () => {
    const checklist = makeChecklist();

    const result = validateChecklist(checklist);

    expect(result.status).toBe("complete");
    expect(result.missingItems).toHaveLength(0);
  });
});
