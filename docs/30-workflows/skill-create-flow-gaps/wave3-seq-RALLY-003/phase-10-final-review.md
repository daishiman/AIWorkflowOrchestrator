# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 10                       |
| タスクID   | TASK-RALLY-003           |
| 機能名     | undo-server-rollback-api |
| 前提Phase  | Phase 9                  |
| 後続Phase  | Phase 11                 |
| 作成日     | 2026-04-21               |
| ステータス | pending                  |

## 目的

全 Phase の成果物を総合的にレビューし、PR 作成に進める状態かを最終判定する。

## 最終レビューチェックリスト

### 受け入れ基準確認

- [ ] AC-1: `skill-creator:undo-user-input` IPC チャンネルが 4 層すべてに追加されている
- [ ] AC-2: `RuntimeSkillCreatorFacade.rollbackLastInput(planId)` が実装されている
- [ ] AC-3: `handleUndo` が IPC 経由で `undoUserInput` を呼び出している
- [ ] AC-4: rollback 後の最新 `workflowSnapshot` が invoke 戻り値として返却されている
- [ ] AC-5: `pnpm --filter @repo/shared typecheck` がエラーなしで通過する
- [ ] AC-6: `pnpm --filter @repo/desktop typecheck` / `lint` がエラーなしで通過する

### 品質ゲート

- [ ] 全テストが通過している
- [ ] カバレッジが維持または向上している
- [ ] IPC 4層整合が最終確認されている

### chain 完了条件確認

- [ ] RALLY-UNDO-CHAIN-001 の完了条件（Undo がサーバー状態を巻き戻し UI とサーバーが同期）が満たされている
- [ ] RALLY-013（Undo 可能範囲インジケーター）の前提条件が満たされている

## ゲート判定基準

| 判定                   | 条件                                                |
| ---------------------- | --------------------------------------------------- |
| PASS（Phase 11に進む） | AC-1〜AC-6 全PASS、全テスト通過、chain完了条件充足  |
| MINOR（Phase 8に戻る） | 軽微な問題あり、修正後に再レビュー                  |
| MAJOR（Phase 2に戻る） | IPC 4層の不整合、または rollback 動作が期待と異なる |

## 参照資料

| 資料名       | パス                                | 用途           |
| ------------ | ----------------------------------- | -------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | Phase 9 成果物 |
| リスク台帳   | `outputs/phase-9/risk-register.md`  | Phase 9 成果物 |

## 成果物

| 成果物           | パス                                              | 説明                             |
| ---------------- | ------------------------------------------------- | -------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`         | AC確認・品質ゲート結果のサマリー |
| ゲート判定       | `outputs/phase-10/gate-decision.md`               | PASS/MINOR/MAJOR の判定と根拠    |
| 出荷準備チェック | `outputs/phase-10/release-readiness-checklist.md` | PR作成前の最終チェックリスト     |

## 完了条件

- [ ] AC-1〜AC-6 を全て確認した
- [ ] chain 完了条件を確認した
- [ ] ゲート判定（PASS）を決定した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] ゲート判定が PASS であることを確認
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 11: 手動テスト検証（ゲート PASS の場合）
