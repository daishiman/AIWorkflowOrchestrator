# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                     |
| ---------- | ---------------------- |
| Phase番号  | 12                     |
| 機能名     | skill-create-wizard    |
| タスクID   | TASK-10A-C             |
| 実施日     | 2026-03-02             |
| ステータス | completed              |
| 依存Phase  | Phase 11（手動テスト） |

## 目的

実装・画面証跡・システム仕様書を同期し、TASK-10A-C の成果を再監査可能な状態で固定する。

## 実行タスク

- Task 1: `implementation-guide.md`（Part 1/Part 2）を最終化。
- Task 2: Step 1-A/1-B/1-C/1-D と Step 2 を実施し、aiworkflow正本へ反映。
- Task 3: `documentation-changelog.md` を実績ベースで更新。
- Task 4: `unassigned-task-detection.md` を作成（0件でも必須）。
- Task 5: `skill-feedback-report.md` を作成（改善なしでも必須）。

## 参照資料

| 資料                         | パス                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------- |
| Phase 2 設計成果物           | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-2/architecture-design.md`    |
| Phase 5 実装サマリー         | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-5/implementation-summary.md` |
| Phase 6 テスト拡充結果       | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-6/test-expansion-report.md`  |
| Phase 7 カバレッジ結果       | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-7/coverage-report.md`        |
| Phase 8 リファクタリング結果 | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-8/refactoring-summary.md`    |
| Phase 9 品質保証結果         | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-9/quality-report.md`         |
| Phase 10 最終レビュー結果    | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-10/final-review-result.md`   |
| Phase 11 手動テスト結果      | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/manual-test-result.md`    |
| 仕様更新フロー               | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                    |
| Phase 11/12 ガイド           | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                       |
| 未タスクガイド               | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`              |
| UI仕様（コンポーネント）     | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                           |
| UI仕様（機能別）             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                   |
| IPC仕様                      | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                              |
| インターフェース仕様         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                 |

## 実行手順

1. `outputs/phase-12/implementation-guide.md` の Part 1/Part 2 要件を満たす。
2. `aiworkflow-requirements` と `task-specification-creator` の LOGS/SKILL を更新。
3. `task-workflow.md` / `ui-ux-*` / `api-ipc-agent.md` / `interfaces-agent-sdk-skill.md` を実装契約へ同期。
4. `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` で topic-map を再生成。
5. 必須成果物（Task 1〜5）を `outputs/phase-12/` に配置し、`artifacts.json` と同期。
6. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` で再検証。

## 成果物

| ファイル                                        | 内容                            |
| ----------------------------------------------- | ------------------------------- |
| `outputs/phase-12/implementation-guide.md`      | 実装ガイド（Part 1/Part 2）     |
| `outputs/phase-12/component-documentation.md`   | コンポーネント/IPC仕様          |
| `outputs/phase-12/spec-update-summary.md`       | Step 1-A〜1-D + Step 2 実施記録 |
| `outputs/phase-12/documentation-changelog.md`   | 更新履歴と検証証跡              |
| `outputs/phase-12/unassigned-task-detection.md` | 未タスク検出結果                |
| `outputs/phase-12/skill-feedback-report.md`     | スキル改善フィードバック        |

## 完了条件

- [x] Task 1〜5 の成果物を作成
- [x] Step 1-A（LOGS/SKILL更新）を完了
- [x] Step 1-B（実装状況テーブル）を完了
- [x] Step 1-C（関連タスクテーブル）を完了
- [x] Step 1-D（topic-map再生成）を完了
- [x] Step 2（システム仕様更新）を完了
- [x] `artifacts.json` と `outputs/artifacts.json` を同期
- [x] `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` をPASS
