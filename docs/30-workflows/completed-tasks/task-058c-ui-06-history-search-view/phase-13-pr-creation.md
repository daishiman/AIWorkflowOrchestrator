# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| タスクID     | TASK-UI-06-HISTORY-SEARCH-VIEW |
| Phase        | 13                             |
| Phase名      | PR作成                         |
| カテゴリ     | UI改善                         |
| ステータス   | pending                        |
| 前提Phase    | Phase 12                       |
| 後続Phase    | 完了                           |
| 担当SubAgent | SubAgent-A                     |

## 目的

058c の変更点、検証結果、system spec 同期結果を reviewer が短時間で把握できる PR パッケージへまとめる。

## 実行タスク

- PR説明作成: 変更の背景、UI差分、契約差分、検証結果を要約する
- review 依頼整理: reviewer が確認する観点を明文化する
- merge readiness 確認: 残課題、未タスク、ロールバック条件を確認する

## 参照資料

| 参照資料        | パス                | 内容                      |
| --------------- | ------------------- | ------------------------- |
| Phase 2 成果物  | `outputs/phase-2/`  | 設計正本                  |
| Phase 5 成果物  | `outputs/phase-5/`  | 実装内容                  |
| Phase 6 成果物  | `outputs/phase-6/`  | 回帰拡充                  |
| Phase 7 成果物  | `outputs/phase-7/`  | coverage 根拠             |
| Phase 8 成果物  | `outputs/phase-8/`  | refactor 結果             |
| Phase 9 成果物  | `outputs/phase-9/`  | QA 根拠                   |
| Phase 10 成果物 | `outputs/phase-10/` | 最終レビュー結果          |
| Phase 11 成果物 | `outputs/phase-11/` | screenshot と manual test |
| Phase 12 成果物 | `outputs/phase-12/` | 文書同期結果              |

### システム仕様（aiworkflow-requirements）

| 参照資料      | パス                                                                   | 内容                  |
| ------------- | ---------------------------------------------------------------------- | --------------------- |
| task workflow | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`   | 完了タスク記録        |
| lessons       | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | review 観点の再発確認 |

## 実行手順

### ステップ1: 変更要約を作る

timeline 主役化、filter 廃止、accordion、observer、state 契約差分を 1 ページに要約する。

### ステップ2: 検証結果を整理する

主要 test、coverage、manual test、screenshot、system spec sync の根拠を表にする。

### ステップ3: reviewer 観点を作る

UI、Store、IPC、a11y、Phase 12 同期の 5 観点で確認依頼を作る。

## Phase実行記録

### 実行タスク

| タスク               | 結果    | 備考         |
| -------------------- | ------- | ------------ |
| PR説明作成           | pending | 実行時に記入 |
| review 依頼整理      | pending | 実行時に記入 |
| merge readiness 確認 | pending | 実行時に記入 |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

- なし

## 成果物

| 成果物                    | パス                                            | 説明              |
| ------------------------- | ----------------------------------------------- | ----------------- |
| PR description            | `outputs/phase-13/pr-description.md`            | PR 本文案         |
| review request note       | `outputs/phase-13/review-request-note.md`       | reviewer 向け観点 |
| merge readiness checklist | `outputs/phase-13/merge-readiness-checklist.md` | 最終確認表        |

## 完了条件

- [ ] PR description に背景、変更点、検証結果、同期結果が含まれている
- [ ] reviewer が見る観点が整理されている
- [ ] merge readiness checklist に残課題と rollback 条件が含まれている
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

全Phase完了。
