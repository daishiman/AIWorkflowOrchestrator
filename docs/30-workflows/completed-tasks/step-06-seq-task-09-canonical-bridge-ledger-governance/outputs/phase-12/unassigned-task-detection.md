# Phase 12 成果物: 未タスク検出レポート

> タスクID: TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001
> 作成日: 2026-03-23
> Phase: 12 - ドキュメント

## 1. 検出サマリー

| 項目                       | 値                             |
| -------------------------- | ------------------------------ |
| 検出件数                   | 1件（Phase 10 MINOR M-01）     |
| 指示書作成数               | 1件                            |
| backlog テーブル登録数     | 1件                            |
| 発見元仕様書へのリンク追加 | 1件                            |
| GitHub Issue Close 数      | 0件                            |
| Phase 12 Task 4 ステータス | 完了（1件検出・3ステップ完了） |

## 2. 調査対象

以下の観点で未タスクを調査した。

| 調査観点                                  | 調査方法                                              | 結果                                                                                  |
| ----------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Phase 10 MINOR 指摘の未タスク化漏れ       | phase-10-final-review.md の MINOR 指摘一覧を確認      | M-01: rsync worktree 注意書き不足 → 未タスク化（M-02: Phase 12 Task 1 で充足済み）    |
| 設計サマリー中の TODO / 保留事項          | design-summary.md / contract-matrix.md の全文を確認   | 保留事項なし                                                                          |
| validation-matrix.md の未充足 FR          | outputs/phase-2/validation-matrix.md の全 FR チェック | 全 FR PASS（Phase 3 PASS により確認済み）                                             |
| Phase 12 implementation-guide.md 内の注記 | 本 Phase 12 成果物のレビュー                          | 「PR マージ後に実ファイル更新」の留意事項のみ（後続タスクではなくオペレーション手順） |
| Bridge Rule の定期見直しスケジュール      | design-summary.md § 3.2 の legacy bridge 運用方針     | 「無期限保持 + 新規追加禁止」で確定済み。見直し不要                                   |

## 3. 検出された未タスク一覧

| ID   | 発見元              | 内容                                                      | 指示書パス                                                               |
| ---- | ------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------ |
| M-01 | Phase 10 MINOR M-01 | rsync コマンドの worktree 環境注意書きが不足（R-15 関連） | `docs/30-workflows/unassigned-task/worktree-rsync-caution-annotation.md` |

**M-02 について**: NFR-1.1（中学生レベルの概念説明）は Phase 12 Task 1（implementation-guide.md Part 1）で充足済み。独立した未タスク化は不要。

## 4. 3ステップ管理の確認

P3/P38/P58 対策: 検出件数に関わらず以下3ステップの実行確認が必須。

| ステップ | 操作                                                | 結果                                                                                 |
| -------- | --------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Step 1   | `docs/30-workflows/unassigned-task/` に指示書を作成 | 作成済（`worktree-rsync-caution-annotation.md`）                                     |
| Step 2   | `task-workflow-backlog.md` 残課題テーブルに登録     | Step A で登録（TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 Phase 12 と同時実行） |
| Step 3   | 発見元仕様書に参照リンクを追加                      | outputs/phase-9/risk-register.md R-15 に未タスク指示書パスを追記                     |

## 5. GitHub Issue 管理

再評価クローズが必要な Issue: なし（P56 対策確認済み）。

| 確認内容                                                                                | 結果                                            |
| --------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 再評価クローズが必要な未解決 Issue が存在するか                                         | なし                                            |
| `gh issue list --label "task:TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001"` 実行結果 | 0件（または当該タスクに紐付く Open Issue なし） |
