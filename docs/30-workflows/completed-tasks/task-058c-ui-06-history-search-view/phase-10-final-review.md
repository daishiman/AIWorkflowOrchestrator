# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| タスクID     | TASK-UI-06-HISTORY-SEARCH-VIEW |
| Phase        | 10                             |
| Phase名      | 最終レビューゲート             |
| カテゴリ     | UI改善                         |
| ステータス   | completed                      |
| 前提Phase    | Phase 9                        |
| 後続Phase    | Phase 11                       |
| 担当SubAgent | SubAgent-A, SubAgent-D         |

## 目的

実装、test、QA の結果を統合し、058c を release 候補として扱えるかを判定する。

## 実行タスク

- 総合レビュー: UI、Store、IPC、shared types の変更を総点検する
- release readiness 判定: 主要リスクと残課題を確認する
- rollback review: 戻し条件と観測点を確認する

## 参照資料

| 参照資料       | パス                                     | 内容          |
| -------------- | ---------------------------------------- | ------------- |
| Phase 1 成果物 | `outputs/phase-1/`                       | 初期受入基準  |
| Phase 2 成果物 | `outputs/phase-2/`                       | 設計正本      |
| Phase 7 成果物 | `outputs/phase-7/`                       | coverage 根拠 |
| Phase 9 成果物 | `outputs/phase-9/`                       | QA 根拠       |
| Phase 5 成果物 | `outputs/phase-5/implementation-plan.md` | 変更内容      |

### システム仕様（aiworkflow-requirements）

| 参照資料      | パス                                                                   | 内容                |
| ------------- | ---------------------------------------------------------------------- | ------------------- |
| task workflow | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`   | 同期先の確認        |
| lessons       | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | review 時の再発確認 |

## 実行手順

### ステップ1: 根拠を集約

coverage、QA、主要 test、未解決 issue を 1 枚の表へまとめる。

### ステップ2: release readiness を判定

must fix と deferred を分け、manual test 前に残してよい項目を確認する。

### ステップ3: rollback 条件を確認

timeline 不表示、observer 無限発火、ChatHistoryView link failure を戻し条件へ入れる。

## 統合テスト連携

- Phase 4-9 の自動 test と QA を review gate の必須入力にする
- Phase 11 で撮る screenshot 対象状態が release readiness と一致しているかを確認する
- navigation link と IPC failure の回帰が残っていないかを確認する

## 成果物

| 成果物                   | パス                                           | 説明       |
| ------------------------ | ---------------------------------------------- | ---------- |
| 最終レビュー結果         | `outputs/phase-10/final-review-report.md`      | Gate 判定  |
| release readiness matrix | `outputs/phase-10/release-readiness-matrix.md` | 出荷判断表 |
| rollback review          | `outputs/phase-10/rollback-review.md`          | 戻し条件   |

## レビューゲート

### レビュー結果判定

| 判定     | 条件                               | 次のアクション                |
| -------- | ---------------------------------- | ----------------------------- |
| PASS     | 実装、test、QA に blockers がない  | Phase 11 へ進行               |
| MINOR    | 文章整備や軽微な test 追加のみ必要 | 修正後に Phase 11 へ進行      |
| MAJOR    | regression または契約不一致が残る  | Phase 5-9 の該当 Phase へ戻る |
| CRITICAL | 058c の体験要件を満たしていない    | Phase 2 へ戻る                |

## 完了条件

- [x] coverage、QA、主要 test の根拠が集約されている
- [x] release readiness 判定が明記されている
- [x] rollback 条件が確認されている
- [x] 本Phase内の全タスクを100%実行完了

## Phase実行記録

### 実行タスク

| タスク                 | 結果      | 備考                                 |
| ---------------------- | --------- | ------------------------------------ |
| 総合レビュー           | completed | `final-review-report.md` に反映      |
| release readiness 判定 | completed | `release-readiness-matrix.md` に反映 |
| rollback review        | completed | `rollback-review.md` に反映          |

### 発見事項

- 良かった点: 実装、test、coverage、QA を gate へ集約できた
- 問題点: visual polish は manual test 後でしか確定しない
- 改善提案: 以後は screenshot harness を earlier phase から使いたい

### 次Phaseへの引き継ぎ事項

- Phase 11 では 6 枚の screenshot と keyboard / navigation 確認を実施する

## 次のPhase

Phase 11: 手動テスト検証へ進む。
