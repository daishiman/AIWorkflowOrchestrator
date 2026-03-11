# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 |
| Phase      | 13                                              |
| Phase名    | PR作成                                          |
| ステータス | blocked                                         |
| 前提Phase  | Phase 12                                        |
| 後続Phase  | なし                                            |

## 目的

将来の commit / PR 作成条件を明文化する。ただし本依頼では実行しない。

## 実行タスク

- タスク1: ユーザー承認があるまで commit / PR を禁止する
- タスク2: 承認後のみ batch 単位の commit 計画を起こす

## 参照資料

| 参照資料               | パス                                                                             | 説明                     |
| ---------------------- | -------------------------------------------------------------------------------- | ------------------------ |
| Phase 12 documentation | `docs/30-workflows/light-theme-shared-color-migration/phase-12-documentation.md` | 完了前提                 |
| Phase 2 成果物         | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-2/`          | batch 設計               |
| Phase 5 成果物         | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-5/`          | 実装差分                 |
| Phase 6 成果物         | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-6/`          | テスト拡張結果           |
| Phase 7 成果物         | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-7/`          | coverage                 |
| Phase 8 成果物         | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-8/`          | refactoring 結果         |
| Phase 9 成果物         | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-9/`          | 品質結果                 |
| Phase 10 成果物        | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-10/`         | 最終レビュー結果         |
| Phase 11 成果物        | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-11/`         | 手動テスト結果           |
| User policy            | `docs/30-workflows/light-theme-shared-color-migration/index.md`                  | commit / PR 禁止ルール   |
| Execute workflow       | `.claude/skills/task-specification-creator/references/execute-workflow.md`       | 将来の Phase 13 実行手順 |

## ユーザー承認ゲート

| 項目   | ルール           |
| ------ | ---------------- |
| commit | 明示承認まで禁止 |
| PR     | 明示承認まで禁止 |
| push   | 明示承認まで禁止 |

## 成果物

| 成果物  | パス                                                                               |
| ------- | ---------------------------------------------------------------------------------- |
| pr-plan | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-13/pr-plan.md` |

## 完了条件

- [ ] commit / PR 禁止方針が残っている
- [ ] blocked 理由が明文化されている

## 次Phase

なし
