# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                               |
| ------ | ------------------------------------------------ |
| Phase  | 12                                               |
| 機能名 | SkillExecutor env オプション全環境変数上書き修正 |
| 作成日 | 2026-04-01                                       |

## 目的

Phase 12 の必須タスク（Task 1〜5）を実行し、6成果物 + compliance check を揃えて同一ターンで同期完了させる。

## 生成する成果物（必須6ファイル）

すべて `outputs/phase-12/` に作成する。

1. `implementation-guide.md`
2. `system-spec-update-summary.md`
3. `documentation-changelog.md`
4. `unassigned-task-detection.md`
5. `skill-feedback-report.md`
6. `phase12-task-spec-compliance-check.md`

## Task 12-1: 実装ガイド（2パート）

**出力**: `outputs/phase-12/implementation-guide.md`

### Part 1（初学者・中学生レベル）

- 日常生活の例え話を必ず含める（`たとえば` を最低1回使う）
- 専門用語を避け、使う場合は即時説明する
- 「なぜ必要か」→「何をするか」の順で説明する

### Part 2（技術者向け）

- TypeScript 型・APIシグネチャ・使用例
- エラーハンドリング・エッジケース
- 設定可能なパラメータ/定数一覧

**参照**:

- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`
- `.claude/skills/task-specification-creator/references/phase-12-tasks-guide.md`

## Task 12-2: system spec update summary（Step 1 + Step 2）

**出力**: `outputs/phase-12/system-spec-update-summary.md`

### Step 1-A〜1-G（必須）

- 完了タスク記録: `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`
- 関連ドキュメント導線: 同上の関連ドキュメントセクションへ実装ガイドを追加
- LOGS.md 更新（2ファイル必須）
  - `.claude/skills/aiworkflow-requirements/LOGS.md`
  - `.claude/skills/task-specification-creator/LOGS.md`
- SKILL.md 変更履歴更新（2ファイル必須）
  - `.claude/skills/aiworkflow-requirements/SKILL.md`
  - `.claude/skills/task-specification-creator/SKILL.md`
- 既存未タスクの参照・配置先確認:
  - `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`
- 教訓の記録先を `lessons-learned-current.md` に統一
  - `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`
- `generate-index.js` の再実行（topic-map 再生成）

### Step 1-B（spec_created）

- 本workflowは仕様書作成のみのため、完了記録は `spec_created` として同期する
- completed と混同しない

### Step 1-C（関連タスクの確認）

- `task-workflow-completed.md` / `task-workflow-backlog.md` の関連テーブルに当該タスクの記載があるか確認し、必要ならステータス更新

### Step 1-D〜1-G

- `verify-unassigned-links.js` / `generate-index.js` / `quick_validate.js` の実行結果を `documentation-changelog.md` と `system-spec-update-summary.md` に記録
- Warning は分類し、`要監視` / `要対応` を明記する

### Step 2（条件付き）

- 本タスクは interface / API / shared contract の変更なしを想定
- Step 2 を `N/A` とする場合は、その判断理由を `system-spec-update-summary.md` と `documentation-changelog.md` に同値で記録する

**参照**:

- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/task-specification-creator/references/spec-update-step1-detailed-checklist.md`
- `.claude/skills/task-specification-creator/references/spec-update-step1-validation-commands.md`

## Task 12-3: documentation changelog

**出力**: `outputs/phase-12/documentation-changelog.md`

記録事項:

- 変更したファイル一覧（workflow + `.claude/skills`）
- validator 実行結果（`verify-unassigned-links.js`, `generate-index.js`, `quick_validate.js`）
- `artifacts.json` / `outputs/artifacts.json` の同期結果
- Step 2 の判断（更新あり/なしの根拠）
- `current` と `baseline` の分離記録

## Task 12-4: 未タスク検出

**出力**: `outputs/phase-12/unassigned-task-detection.md`

- 0件でも必ず出力する
- 既存 backlog を参照する場合は、`current` / `baseline` を分離して記録する
- 新規未タスクがある場合は `docs/30-workflows/unassigned-task/` に指示書を作成し、`task-workflow-backlog.md` に登録する

## Task 12-5: スキルフィードバック

**出力**: `outputs/phase-12/skill-feedback-report.md`

- 対象スキル: `aiworkflow-requirements` / `task-specification-creator`
- 改善点がない場合も「改善点なし」と理由を明記する
- `skill-creator` を更新した場合は、同レポートに含める

## Task 12-6: Phase 12 compliance check

**出力**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

- Task 1〜5 の全完了後に作成する
- `outputs/phase-12/*.md` に planned wording が残っていないことを確認する
- `artifacts.json` / `outputs/artifacts.json` の parity を確認する
- Phase 11 の `manual-test-result.md` が `not_run` のままなら Phase 12 を completed にしない

## 完了条件

- 6成果物が `outputs/phase-12/` に揃っている
- `phase-12-documentation.md` の実行記録と成果物が同期している
- `artifacts.json` / `outputs/artifacts.json` の内容が一致している
- `phase12-task-spec-compliance-check.md` で PASS 判定が記録されている
