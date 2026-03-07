# Phase 12: 未タスク検出レポート

## メタ情報

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| タスクID   | TASK-10A-B                            |
| 機能名     | SkillAnalysisView（スキル分析ビュー） |
| 初回検出日 | 2026-03-02                            |
| 最終同期日 | 2026-03-06                            |
| 状態       | current active set 同期済み           |

## 情報源の扱い

| 区分       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| canonical  | `task-workflow.md` の残課題表と completed 指示書配置              |
| derived    | 本レポート、および `ui-ux-feature-components.md` の関連未タスク表 |
| historical | Issue #996 と初回 5件時点の検出経緯                               |

## 検出サマリー

| 区分                      | 件数 |
| ------------------------- | ---- |
| current active set        | 6    |
| completed set             | 3    |
| new findings in this sync | 0    |
| canonical/derived drift   | 0    |

## 現行 active set（2026-03-06 同期結果）

| 未タスクID        | 概要                                         | 深刻度 | 指示書                                                                                       |
| ----------------- | -------------------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| UT-TASK-10A-B-002 | 改善結果トースト通知実装                     | Minor  | `docs/30-workflows/unassigned-task/task-10a-b-improvement-toast-notification.md`             |
| UT-TASK-10A-B-004 | Props契約整合（`skill` vs `skillName`）      | Minor  | `docs/30-workflows/unassigned-task/task-10a-b-props-contract-alignment.md`                   |
| UT-TASK-10A-B-005 | molecule分割設計追補（Header/Error/Actions） | Minor  | `docs/30-workflows/unassigned-task/task-10a-b-analysis-view-molecule-separation.md`          |
| UT-TASK-10A-B-006 | Phase 11 必須セクション検証ガード            | Medium | `docs/30-workflows/unassigned-task/task-10a-b-phase11-required-sections-validation-guard.md` |
| UT-TASK-10A-B-007 | Phase 11 画面証跡鮮度ガード                  | Medium | `docs/30-workflows/unassigned-task/task-10a-b-phase11-screenshot-freshness-guard.md`         |
| UT-TASK-10A-B-009 | 完了済みUT配置ポリシー統一ガード             | Medium | `docs/30-workflows/unassigned-task/task-10a-b-completed-ut-placement-policy-guard.md`        |

## 完了済み派生タスク（2026-03-06 時点）

| タスクID          | 状態               | 指示書                                                                            |
| ----------------- | ------------------ | --------------------------------------------------------------------------------- |
| UT-TASK-10A-B-001 | 完了（2026-03-05） | `docs/30-workflows/completed-tasks/task-10a-b-autofixable-filter-button.md`       |
| UT-TASK-10A-B-003 | 完了（2026-03-05） | `docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui.md` |
| UT-TASK-10A-B-008 | 完了（2026-03-06） | `docs/30-workflows/completed-tasks/task-10a-b-unassigned-count-resync-guard.md`   |

## 3ステップ整合確認

| 観点                      | 結果 | 補足                                                |
| ------------------------- | ---- | --------------------------------------------------- |
| Step1: 指示書実体         | ✅   | active/completed の各参照先が実在                   |
| Step2: task-workflow 登録 | ✅   | active/completed 集合とも `task-workflow.md` と一致 |
| Step3: 関連仕様参照       | ✅   | `ui-ux-feature-components.md` と一致                |

## 補足

- 初回 2026-03-02 時点の 5 件検出は historical snapshot として保持し、current active set の正本には使わない。
- `UT-TASK-10A-B-001 / 003 / 008` は completed 集合へ移行済み。
- 以後は `validate-task10ab-ledger-sync` を同期ゲートとして利用する。
