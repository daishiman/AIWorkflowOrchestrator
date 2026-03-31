import fs from "fs";
import path from "path";

/**
 * 評価結果を Markdown レポートに変換して保存
 * @param {import('./evaluate-ui-ux-types').UXEvaluationResult} result
 * @param {string} outputPath
 * @param {string} taskId
 */
export async function saveEvaluationReport(result, outputPath, taskId) {
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");

  const markdown = `# AI UX 評価レポート

## 評価メタ情報

| 項目         | 値              |
| ------------ | --------------- |
| タスク ID    | ${taskId}       |
| 評価日時     | ${now}          |
| 使用モデル   | claude-opus-4-5 |

## ユーザビリティ問題

| ID      | 問題             | 重要度 |
| ------- | ---------------- | ------ |
${result.usabilityIssues.map((i) => `| ${i.id} | ${i.description} | ${i.severity} |`).join("\n")}

## アクセシビリティ懸念

| ID       | 懸念事項         | WCAG 基準          | 重要度 |
| -------- | ---------------- | ------------------ | ------ |
${result.accessibilityConcerns.map((c) => `| ${c.id} | ${c.concern} | ${c.wcagCriteria} | ${c.severity} |`).join("\n")}

## 改善提案

| 優先度 | 提案内容         | 実装難易度 |
| ------ | ---------------- | ---------- |
${result.improvements.map((i) => `| ${i.priority} | ${i.suggestion} | ${i.effort} |`).join("\n")}

## 次ステップ

- [ ] HIGH 重要度の問題を unassigned-task として生成する
- [ ] Phase 12 台帳に登録する
- [ ] 次タスク Phase 2 でこのレポートを参照する
`;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, markdown, "utf-8");
  console.log(`AI UX 評価レポートを保存: ${outputPath}`);
}

