import fs from "fs";
import path from "path";

/**
 * HIGH 重要度の問題から unassigned-task ファイルを生成
 * @param {import('./evaluate-ui-ux-types').UXEvaluationResult} result
 * @param {string} outputDir
 * @param {string} taskId
 * @returns {Promise<string[]>}
 */
export async function generateUnassignedTasks(result, outputDir, taskId) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const generatedFiles = [];

  const highPriorityIssues = [
    ...result.usabilityIssues.filter((i) => i.severity === "HIGH"),
    ...result.accessibilityConcerns.filter((c) => c.severity === "HIGH"),
  ];

  highPriorityIssues.forEach((issue, index) => {
    const issueId = `ui-ux-issue-${date}-${String(index + 1).padStart(3, "0")}`;
    const isA11y = "wcagCriteria" in issue;
    const filePath = path.join(outputDir, `${issueId}.md`);

    const issueTitle = isA11y ? issue.concern : issue.description;
    const issueLayer = isA11y ? "層1: Semantic" : "層3: AI UX";
    const wcagNote = isA11y ? `\nWCAG 基準: ${issue.wcagCriteria}` : "";

    const content = `# UI/UX 改善タスク: ${issueTitle}

## メタ情報

| 項目       | 値                                           |
| ---------- | -------------------------------------------- |
| タスク ID  | ${issueId}                                   |
| 発見元     | ${taskId} Phase 11                           |
| 発見日     | ${new Date().toISOString().slice(0, 10)}     |
| 重要度     | HIGH                                         |
| 層         | ${issueLayer}                                |

## 問題の説明

${issueTitle}${wcagNote}

## 受入条件

- [ ] 問題が解消され、再評価で PASS になること

## 参照

- 発見元: \`outputs/phase-11/ai-ux-evaluation.md\`
`;

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, "utf-8");
    generatedFiles.push(filePath);
    console.log(`unassigned-task 生成: ${filePath}`);
  });

  return generatedFiles;
}

