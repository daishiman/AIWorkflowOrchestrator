# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| タスクID   | TASK-UI-04B-WORKSPACE-CHAT |
| Phase      | 12                         |
| Phase名    | ドキュメント更新           |
| カテゴリ   | 文書化                     |
| 優先度     | high                       |
| ステータス | completed                  |
| 前提Phase  | Phase 11                   |
| 後続Phase  | Phase 13                   |

## 目的

実装ガイド、system spec 同期、更新履歴、未タスク検出、skill feedback を current workflow 正本へ残す。

## 実行タスク

- 実装ガイド作成: Part 1 と Part 2 を同一文書に作成する
- system spec 同期: renderer chat UI、state、LLM / conversation、security 契約を反映する
- 更新履歴作成: workflow と references の更新履歴を記録する
- 未タスク検出: backlog 化が必要な項目を判定する
- skill feedback 作成: task-spec と aiworkflow skill への改善点を記録する
- 証跡同期: `.claude/skills/aiworkflow-requirements/references/task-workflow.md`、`.claude/skills/aiworkflow-requirements/references/lessons-learned.md`、`.claude/skills/*/LOGS.md`、`.claude/skills/*/SKILL.md` を正本に同期する

## 参照資料

| 参照資料             | パス                                                                                   | 説明                                             |
| -------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------ |
| アーキテクチャ設計   | `outputs/phase-2/architecture-design.md`                                               | Phase 2 成果物                                   |
| 統合テスト結果       | `outputs/phase-6/integration-test.md`                                                  | Phase 6 成果物                                   |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`                                                   | Phase 7 成果物                                   |
| 責務境界チェック     | `outputs/phase-8/boundary-checklist.md`                                                | Phase 8 成果物                                   |
| 品質レポート         | `outputs/phase-9/quality-report.md`                                                    | Phase 9 成果物                                   |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`                                              | Phase 10 成果物                                  |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`                                               | Phase 11 成果物                                  |
| screenshot matrix    | `outputs/phase-11/screenshot-matrix.md`                                                | Phase 11 成果物                                  |
| issues               | `outputs/phase-11/issues-found.md`                                                     | Phase 11 成果物                                  |
| 仕様同期候補         | `outputs/phase-5/spec-update-targets.md`                                               | Phase 5 成果物                                   |
| system spec 抽出     | `outputs/phase-1/aiworkflow-spec-extraction.md`                                        | Phase 1 成果物                                   |
| spec update workflow | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 1-A/B/C と `spec_created` 判定              |
| evidence sync rules  | `.claude/skills/task-specification-creator/references/evidence-sync-rules.md`          | `LOGS.md` / `SKILL.md` / lessons / workflow 同期 |
| Phase 12 checklist   | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md` | Part 1/2 と必須成果物の実体確認                  |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                            | 内容                         |
| ------------------ | ------------------------------------------------------------------------------- | ---------------------------- |
| task workflow      | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | 完了台帳と未タスク登録の正本 |
| lessons learned    | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | 再発防止知見の正本           |
| feature components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | UI 仕様同期の正本            |
| state management   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | state ownership 同期の正本   |
| security           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`    | preload / IPC 契約同期の正本 |

## 実行手順

### ステップ1: 実装ガイドを作成する

| パート | 内容                                                                    |
| ------ | ----------------------------------------------------------------------- |
| Part 1 | 中学生向けに「なぜ必要か」「何が便利か」を日常の例で説明する            |
| Part 2 | 開発者向けに component / hook / IPC / state / error handling を説明する |

### ステップ2: system spec 更新対象を確定する

| 対象候補                                                | 更新理由                                           |
| ------------------------------------------------------- | -------------------------------------------------- |
| `ui-ux-feature-components.md`                           | Workspace ChatPanel の追加                         |
| `arch-state-management.md`                              | 04B の state ownership を追記する場合              |
| `interfaces-llm.md` または `llm-workspace-chat-edit.md` | renderer 側統合契約を追記する場合                  |
| `interfaces-chat-history.md`                            | conversation 利用パターンを追記する場合            |
| `security-electron-ipc.md`                              | 04B が新しい subscribe / invoke 契約を増やした場合 |

### ステップ3: Step 1-A/B/C を実施する

| Step     | 実施内容                                                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Step 1-A | `完了タスク` セクション、関連ドキュメント、`LOGS.md` 2ファイル、topic / changelog の更新要否を確認する                                                                          |
| Step 1-B | 仕様書作成のみ完了した場合は `spec_created` を維持し、実装状況テーブルを completed に誤更新しない                                                                               |
| Step 1-C | `関連タスク` / `未タスク候補` / `.claude/skills/aiworkflow-requirements/references/task-workflow.md` を grep し、該当エントリが存在する場合は完了・残課題・参照リンクを更新する |

### ステップ4: 証跡同期を確定する

| 同期先                                                                 | ルール                                                       |
| ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`   | 完了タスク記録と未タスク登録を current workflow と一致させる |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | 04B で得た再発防止知見を追記する                             |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                       | task 完了記録を追加する                                      |
| `.claude/skills/task-specification-creator/LOGS.md`                    | 同一ターンで task 完了記録を追加する                         |
| `.claude/skills/aiworkflow-requirements/SKILL.md`                      | 変更履歴更新要否を確認する                                   |
| `.claude/skills/task-specification-creator/SKILL.md`                   | 変更履歴更新要否を確認する                                   |

### ステップ5: canonical root を固定する

`.claude/skills/...` を正本 root とし、`.agents/skills/...` は mirror として扱う。Phase 12 の更新対象と検証対象は `.claude` 側を先に記録する。

## 成果物

| 成果物                  | パス                                                     | 説明                       |
| ----------------------- | -------------------------------------------------------- | -------------------------- |
| 実装ガイド              | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2            |
| documentation changelog | `outputs/phase-12/documentation-changelog.md`            | 更新記録                   |
| system spec 更新計画    | `outputs/phase-12/system-spec-update-plan.md`            | 更新対象と理由             |
| 未タスク検出            | `outputs/phase-12/unassigned-task-detection.md`          | 未完了項目                 |
| skill feedback          | `outputs/phase-12/skill-feedback-report.md`              | スキル改善点               |
| 証跡同期チェック        | `outputs/phase-12/evidence-sync-checklist.md`            | `.claude` 正本への同期確認 |
| Phase 12 準拠チェック   | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 1/3/4/5 の15項目監査  |

## 多角的チェック観点

| 観点         | このPhaseでの確認内容                                                         | 仕様参照先                                                                             |
| ------------ | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| システム思考 | workflow、system spec、logs、lessons、unassigned を一つの台帳系として同期する | `.claude/skills/task-specification-creator/references/evidence-sync-rules.md`          |
| why思考      | 実装ガイド Part 1/2 がなぜ必要かを後続利用者目線で確認する                    | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md` |
| 論点思考     | Step 1-A/B/C と条件付き Step 2 を混同せず分離して確認する                     | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         |
| 改善思考     | 今回の苦戦箇所を lessons と skill feedback へ分けて残す                       | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                 |

## 完了条件

- [x] implementation-guide に Part 1 と Part 2 を含めている
- [x] documentation-changelog を作成対象にしている
- [x] system spec 更新対象を列挙している
- [x] 未タスク検出レポートを作成対象にしている
- [x] skill feedback を作成対象にしている
- [x] `.claude/skills/aiworkflow-requirements/references/task-workflow.md` / `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` / `.claude/skills/*/LOGS.md` / `.claude/skills/*/SKILL.md` 同期を作成対象にしている
- [x] `.claude` を canonical root として記録している
- [x] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 実装ガイド作成
2. Step 1-A/B/C と Step 2 判定
3. changelog / unassigned / feedback 作成
4. task-workflow / lessons / LOGS / SKILL 同期
5. 実体確認チェックと完了条件確認

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] `outputs/phase-12/` に作成すべき成果物を定義済み
- [x] `artifacts.json` へ登録すべき成果物を確認済み
- [x] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel` を再実行できる状態

## 次のPhase

[Phase 13: PR作成](./phase-13-pr-creation.md)
