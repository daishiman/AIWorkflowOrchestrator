# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                            |
| ------ | --------------------------------------------- |
| Phase  | 12                                            |
| 機能名 | task-058b-ui-04a-workspace-layout-filebrowser |
| 作成日 | 2026-03-10                                    |

## 目的

実装結果を後続開発へ伝える文書を作成し、`aiworkflow-requirements` の正本仕様と workflow 台帳を同期し、未タスクと教訓を残す。

## 実行タスク

- 実装ガイド作成: Part 1 と Part 2 を含む `implementation-guide.md` を作成する
- システム仕様同期: UI、state、navigation、workflow、lessons の更新対象を判断する
- 変更履歴作成: `documentation-changelog.md` を作成する
- 未タスク検出: `outputs/phase-12/unassigned-task-detection.md` を作成する
- スキル改善記録: `skill-feedback-report.md` を作成する

## 参照資料

| 参照資料           | パス                                         | 説明            |
| ------------------ | -------------------------------------------- | --------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物  |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物  |
| スコープ定義       | `outputs/phase-1/scope-definition.md`        | Phase 1 成果物  |
| SubAgent責務表     | `outputs/phase-1/subagent-ownership.md`      | Phase 1 成果物  |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | Phase 2 成果物  |
| コンポーネント設計 | `outputs/phase-2/component-design.md`        | Phase 2 成果物  |
| 状態設計           | `outputs/phase-2/state-design.md`            | Phase 2 成果物  |
| IPC watcher設計    | `outputs/phase-2/ipc-watcher-design.md`      | Phase 2 成果物  |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md`  | Phase 5 成果物  |
| 回帰マトリクス     | `outputs/phase-6/regression-matrix.md`       | Phase 6 成果物  |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`         | Phase 7 成果物  |
| リファクタ記録     | `outputs/phase-8/refactoring-log.md`         | Phase 8 成果物  |
| 品質レポート       | `outputs/phase-9/quality-report.md`          | Phase 9 成果物  |
| 最終レビュー結果   | `outputs/phase-10/final-review-result.md`    | Phase 10 成果物 |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md`     | Phase 11 成果物 |

## 実行手順

### ステップ1: 実装ガイド構成

| Part   | 対象読者 | 必須内容                                                                     |
| ------ | -------- | ---------------------------------------------------------------------------- |
| Part 1 | 初学者   | 1 ペイン起点、toggle、file panel、watcher を日常の例えで説明する             |
| Part 2 | 開発者   | component 一覧、hook 契約、persist key、IPC 利用、error edge case を説明する |

### ステップ2: システム仕様更新 Task 2 の実行手順

| Step     | 必須     | 内容                                                                                                                                                             |
| -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Step 1-A | 必須     | 完了タスク記録、関連ドキュメント、変更履歴、`.claude/skills/aiworkflow-requirements/LOGS.md`、`.claude/skills/task-specification-creator/LOGS.md` を同時更新する |
| Step 1-B | 必須     | 実装状況テーブルの `spec_created` / `completed` を実体へ同期する                                                                                                 |
| Step 1-C | 必須     | 関連タスク / 未タスク候補テーブルの状態を同期する                                                                                                                |
| Step 2   | 条件付き | 新規 interface / 定数 / API 変更がある場合のみ `aiworkflow-requirements` 正本仕様を更新する                                                                      |

### ステップ3: システム仕様更新候補

| 正本仕様                                                             | 更新条件                                                                    |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `ui-ux-feature-components.md`                                        | WorkspaceView 実装の責務、component 階層、test path が確定した場合          |
| `arch-state-management.md`                                           | local state と `workspaceSlice` / `fileSelectionSlice` の境界が確定した場合 |
| `ui-ux-navigation.md`                                                | `workspace` view 表示契約に変更が入った場合                                 |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | preview preflight、P5 watcher guard の運用を更新した場合                    |
| `lessons-learned.md`                                                 | watcher 二重登録、preview preflight、resize persist で教訓が出た場合        |

### ステップ4: 未タスク判定

- 04A の責務外で残った項目は 04B / 04C または `unassigned-task` へ切り出す
- 新規 IPC が必要になった場合は未タスク化する
- preview / watcher で運用 gap が出た場合は未タスク化する

### ステップ5: Phase 12 実体確認

| 確認項目                        | 確認対象                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Part 1 / Part 2 が両方ある      | `outputs/phase-12/implementation-guide.md`                                                              |
| 変更履歴がある                  | `outputs/phase-12/documentation-changelog.md`                                                           |
| 0 件でも未タスク検出がある      | `outputs/phase-12/unassigned-task-detection.md`                                                         |
| 改善点 0 件でも feedback がある | `outputs/phase-12/skill-feedback-report.md`                                                             |
| LOGS 2 ファイル更新             | `.claude/skills/aiworkflow-requirements/LOGS.md`, `.claude/skills/task-specification-creator/LOGS.md`   |
| SKILL 変更履歴更新              | `.claude/skills/aiworkflow-requirements/SKILL.md`, `.claude/skills/task-specification-creator/SKILL.md` |

## 多角的チェック観点

| 観点         | このPhaseでの確認内容                                                                              | 仕様参照先                                                                                                                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| システム仕様 | UI / state / navigation / architecture / quality のどこまで Step 2 更新対象か切り分ける            | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`, `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` |
| 運用         | LOGS 2 ファイル、SKILL 更新、未タスク 3 ステップ完了が同期規則どおりか確認する                     | `.claude/skills/task-specification-creator/references/evidence-sync-rules.md`                                                                                                                                                              |
| 説明責務     | Part 1 / Part 2、documentation-changelog、feedback report の中身が Phase 12 定義を満たすか確認する | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`                                                                                                                                                     |
| 依存関係     | Phase 11 の証跡と Phase 5-10 の結果を参照したうえで完了台帳へ同期する                              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `phase-11-manual-test.md`                                                                                                                                            |

## 成果物

| 成果物         | パス                                            | 説明                      |
| -------------- | ----------------------------------------------- | ------------------------- |
| 実装ガイド     | `outputs/phase-12/implementation-guide.md`      | Part 1 / 2 を含む         |
| 変更履歴       | `outputs/phase-12/documentation-changelog.md`   | 更新台帳                  |
| 未タスク検出   | `outputs/phase-12/unassigned-task-detection.md` | 0 件でも出力              |
| スキル改善報告 | `outputs/phase-12/skill-feedback-report.md`     | 改善点が 0 件でも出力     |
| 仕様同期計画   | `outputs/phase-12/system-spec-update-plan.md`   | 更新対象と no-change 記録 |

## 完了条件

- [ ] `implementation-guide.md` の Part 1 と Part 2 の構成を定義している
- [ ] Task 2 Step 1-A / 1-B / 1-C / 条件付き Step 2 を明記している
- [ ] 更新候補の正本仕様を列挙している
- [ ] `documentation-changelog.md` を成果物に含めている
- [ ] `outputs/phase-12/unassigned-task-detection.md` を成果物に含めている
- [ ] `skill-feedback-report.md` を成果物に含めている
- [ ] LOGS / SKILL 更新の実体確認項目を含めている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase 実行時は以下を SubTask として分離する。

1. 実装ガイド作成
2. Step 1-A / 1-B / 1-C / 条件付き Step 2 の判定
3. changelog / unassigned / feedback 作成
4. LOGS / SKILL / 正本仕様の同期
5. 完了条件と validator の確認

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-12/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser` を再実行できる状態

## 次のPhase

[Phase 13: PR作成](./phase-13-pr-creation.md)
