# Phase 12 実装ガイド — 2Workflow 証跡集約バンドル

## Part 1: 概念説明（中学生レベル）

### なぜ必要か

2つのワークフローを同時に監査すると、記録が別々に散らばり、後で「本当に全部できたか」を確認しづらくなる。そこで、結果を1つにまとめて、同じ基準で判定できるようにする。

### 1. 衛生検査員のたとえ

保健所の検査員がA店とB店を同じ日にチェックする場面を考える。店ごとに記録用紙を分けたままだと比較しづらい。最終的に1枚のまとめ表にすると、どちらの店がどこで引っかかったかがすぐ分かる。

このタスクでも同じで、`spec_created` と `completed` の監査結果を同じ表にそろえて比較する。

### 2. スタンプラリーのたとえ

スタンプラリーは、

1. 台紙を受け取る
2. 各チェックポイントでスタンプを押す
3. 最後に全部そろっているか確認する

の3つがそろって初めて完了になる。

Phase 12 ではこれが「Task 1/3/4/5 の成果物実体確認」に対応する。1つでも欠けていたら未完了として扱う。

### 3. テストの成績のたとえ

「今回の点数」と「過去の平均」は別の意味を持つ。今回の点数が合格でも、過去に改善課題が残っていることはある。

監査でも同じで、

- `current`: 今回の差分で新規に発生した違反
- `baseline`: 以前から残っている違反

を分けて記録する。合否判定は `current` を使い、`baseline` は改善バックログとして扱う。

## Part 2: 開発者向け実装詳細

### 2Workflow 証跡集約テンプレート仕様

| 項目         | 内容                                                                |
| ------------ | ------------------------------------------------------------------- |
| 入力         | `verify-all-specs.js --json` のJSON出力（workflowごと）             |
| 集約単位     | `spec_created` / `completed` の2workflow                            |
| 主要テーブル | `ワークフロー名 / totalSpecs / passedSpecs / failedSpecs / details` |
| 出力先       | `outputs/phase-12/spec-update-summary.md`                           |

### 型定義（TypeScript）

```ts
interface WorkflowResult {
  workflowName: string;
  timestamp: string;
  totalSpecs: number;
  passedSpecs: number;
  failedSpecs: number;
  violations: { file: string; rule: string; message: string }[];
}

interface ChecklistItem {
  taskId: string;
  label: string;
  isChecked: boolean;
}

interface ChecklistValidationResult {
  status: "complete" | "incomplete";
  missingItems: string[];
}

interface ViolationEvaluation {
  verdict: "pass" | "fail";
  currentViolations: number;
  baseline: number;
}

interface ScreenshotVerification {
  exists: boolean;
  capturedAt: string | null;
}
```

### APIシグネチャと使用例

```ts
parseWorkflowResult(rawOutput: string): WorkflowResult
validateChecklist(checklist: ChecklistItem[]): ChecklistValidationResult
evaluateViolations(current: number, baseline: number): ViolationEvaluation
verifyScreenshot(filePath: string): ScreenshotVerification
```

```ts
const parsed = parseWorkflowResult(rawJson);
const checklistResult = validateChecklist(checklist);
const auditResult = evaluateViolations(currentViolations, baselineViolations);
```

### Task 1/3/4/5 実体確認チェックリスト仕様

| Task   | 必須確認                                                         |
| ------ | ---------------------------------------------------------------- |
| Task 1 | `implementation-guide.md` の存在、Part 1/Part 2 セクションの存在 |
| Task 3 | `documentation-changelog.md` の存在、Step結果の記録              |
| Task 4 | `unassigned-task-detection.md` の存在（0件でも必須）             |
| Task 5 | `skill-feedback-report.md` の存在（改善点なしでも必須）          |

### current/baseline 分離判定アルゴリズム

- 判定対象: `audit-unassigned-tasks.js --json --target-file <path>` の `currentViolations.total`
- 合否基準: `currentViolations.total === 0`
- `baselineViolations.total` は合否に使わず、改善対象として別記録

### エラーハンドリングとエッジケース

- `workflowName` が空文字: 例外
- `currentViolations < 0`: 例外
- チェックリスト空配列: `incomplete`
- スクリーンショットパスに `..`: 例外（パストラバーサル対策）
- ファイル名長 > 255: 例外

### 設定可能パラメータと定数

| 名称                  | 値/型    | 用途                           |
| --------------------- | -------- | ------------------------------ |
| `MAX_FILENAME_LENGTH` | `255`    | スクリーンショット検証時の上限 |
| `workflowName`        | `string` | 監査対象の識別子               |
| `currentViolations`   | `number` | 今回差分の違反件数             |
| `baselineViolations`  | `number` | 既存違反件数（監視値）         |

### 台帳同期ルール

- `task-workflow.md`: 残課題/完了台帳の同期
- `lessons-learned.md`: 苦戦箇所と再発防止手順の同期
- `LOGS.md`: `aiworkflow-requirements` と `task-specification-creator` の2ファイル同時更新

### 監査スクリプト連携

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-two-workflow-evidence-bundle-001.md
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```
