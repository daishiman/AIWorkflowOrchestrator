# TASK-RALLY-012: エラー回復導線追加

## メタ情報

- 検出元: TASK-RALLY-001 Phase 12 レビュー・エラーUXギャップ分析
- 優先度: Medium
- GitHub Issue: #2397
- Wave: 4（RALLY-011完了後）
- 前提タスク: RALLY-011（送信中競合防止UI強化）
- 後続タスク: RALLY-013（Undo可能範囲の視覚的表現）
- 衝突ドメイン: ConversationalInterview
- 関連ファイル:
  - `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`

## 目的

ラリー中にエラーが発生した際、ユーザーが「再試行（Retry）」または「リセット（Reset）」を選択できるUI導線を追加する。`localError` state と `handleRetry`・`handleReset` ハンドラーを実装し、エラー後の回復フローを明確化する。

## 背景

現状のラリーフローでエラーが発生しても、ユーザーへのフィードバックと回復操作がない。RALLY-008 で `processWorkflowOutcome` の `await + try/catch` が実装された後、catch したエラーをUIに反映し、ユーザーが主体的に回復操作を実行できるようにする。RALLY-013 の Undo 視覚化の前提となるタスク。

## 実行タスク

- [ ] `localError` state を追加する（`null | Error`）
- [ ] `handleRetry` と `handleReset` ハンドラーを実装する
- [ ] エラー時に「再試行」「リセット」ボタンを表示するUI を実装する
- [ ] エラー回復後に `localError` がクリアされることをテストする

## 完了条件

- [ ] エラー発生時に `localError` state に格納されること
- [ ] 「再試行」でラリーが再開されること
- [ ] 「リセット」でラリー初期状態に戻ること
- [ ] TypeScript 型チェック PASS
- [ ] 既存テスト PASS

## 苦戦箇所（RALLY-001実装知見）

| 苦戦箇所             | 問題                                                                        | 解決策                                                |
| -------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| エラー後の状態不整合 | localError をクリアせずに再試行すると古いエラーが残留する                   | handleRetry の先頭で setLocalError(null) を必ず呼ぶ   |
| リセット範囲の設計   | どこまでの状態をリセットするか（ローカルのみか、IPC経由でサーバーも含むか） | RALLY-003（Rollback API）と連携してリセット範囲を設計 |

## 参照

- 詳細Phase仕様書: `docs/30-workflows/skill-create-flow-gaps/wave4-seq-RALLY-012/`
- 前提: TASK-RALLY-011（送信中競合防止）、TASK-RALLY-008（fire-and-forget修正）
- 後続: TASK-RALLY-013（Undo可能範囲の視覚的表現）
