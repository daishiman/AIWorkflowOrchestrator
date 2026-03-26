# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                                                         |
| -------- | ---------------------------------------------------------- |
| Phase    | 8                                                          |
| タスクID | UT-IMP-TASK-SDK-02-PHASE11-PHASE12-EVIDENCE-COMPLIANCE-001 |
| 機能名   | task-sdk-02-phase11-phase12-evidence-compliance            |
| 作成日   | 2026-03-26                                                 |

## 目的

drift を生みやすい曖昧文言、placeholder 文言、current / baseline 混在を除去する。

## 実行タスク

- placeholder 文言の除去
- `present` / `updated` / `validated` の用語整理
- current workflow と baseline 参照の分離

## 参照資料

| 資料名                       | パス                                          | 説明                     |
| ---------------------------- | --------------------------------------------- | ------------------------ |
| Phase 1 requirements         | `outputs/phase-1/requirements.md`             | 用語の正本               |
| Phase 2 evidence decision    | `outputs/phase-2/evidence-decision-record.md` | visual / non-visual 判定 |
| Phase 5 evidence linkage     | `outputs/phase-5/evidence-linkage-map.md`     | 文言整理対象             |
| Phase 6 regression checklist | `outputs/phase-6/regression-checklist.md`     | 再発観点                 |
| Phase 7 coverage audit       | `outputs/phase-7/coverage-audit.md`           | AC 対応表                |

## 統合テスト連携

refactor 後に `verify-all-specs.js --json` を再実行し、曖昧表現や broken ref を確認する。

## エレガント化ルール

- `present`、`updated`、`validated` を結果語として混用しない
- `current` と `baseline` を別列または別節に分離し、1文で混在させない
- `phase12-task-spec-compliance-check.md` は存在確認の要約ではなく、Task 12-1〜12-5 の最終監査票として扱う

## 成果物

| 成果物                     | パス                                            | 説明         |
| -------------------------- | ----------------------------------------------- | ------------ |
| content normalization plan | `outputs/phase-8/content-normalization-plan.md` | 文言統一指針 |

## 完了条件

- [ ] placeholder 文言の扱いを固定済み
- [ ] 用語統一ルールを定義済み
- [ ] current / baseline の混在防止策を定義済み
- [ ] **本Phase内の全タスクを100%実行完了**
