# TASK-RALLY-013: Undo可能範囲の視覚的表現追加

## メタ情報

- 検出元: TASK-RALLY-001 Phase 12 レビュー・UXギャップ分析
- 優先度: Low
- GitHub Issue: #2398
- Wave: 4（RALLY-003 + RALLY-012 完了後、チェーン末尾）
- 前提タスク: RALLY-003（UndoサーバーサイドRollback API）, RALLY-012（エラー回復導線）
- 衝突ドメイン: ConversationalInterview
- 関連ファイル:
  - `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`

## 目的

ラリー中にユーザーが Undo 操作で巻き戻せるステップ数を視覚的に表示するインジケーターを追加する。`undoableStepCount` 計算ロジックを実装し、「あと N ステップ Undo できます」などのUXを提供する。RALLYグループのチェーン末尾タスク。

## 背景

RALLY-003 でサーバーサイドの Rollback API が実装された後、ユーザーが「どこまで Undo できるか」を認識できる UI が必要になる。現状は Undo の可能範囲が不明確で、ユーザーが試行錯誤する必要がある。このタスクは RALLY-003（Undo API）と RALLY-012（エラー回復UI）の両方が揃ってから実施する最終タスク。

## 実行タスク

- [ ] `undoableStepCount` 計算ロジックを `workflowSnapshot` から導出する
- [ ] Undo 可能範囲インジケーターUIを実装する（例: ステップ番号のハイライト・テキスト表示）
- [ ] Undo 実行後にインジケーターが更新されることをテストする
- [ ] Undo 不可（`undoableStepCount === 0`）の状態でUI が適切に無効化されることを確認する

## 完了条件

- [ ] Undo 可能なステップ数がリアルタイムで表示されること
- [ ] `undoableStepCount === 0` 時に Undo ボタンが無効化されること
- [ ] Undo 実行後にインジケーターが正しく更新されること
- [ ] TypeScript 型チェック PASS
- [ ] 既存テスト PASS

## 苦戦箇所（RALLY-001実装知見）

| 苦戦箇所                             | 問題                                                                | 解決策                                                                  |
| ------------------------------------ | ------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| undoableStepCount の計算             | workflowSnapshot からどのフィールドを使って Undo 可能数を算出するか | RALLY-003 の Rollback API 設計に undoableStepCount を含めるよう連携する |
| インジケーターの再レンダリング最適化 | 毎ステップで再計算が走るとパフォーマンスが低下する懸念              | useMemo で依存する workflowSnapshot フィールドのみをメモ化              |

## 参照

- 詳細Phase仕様書: `docs/30-workflows/skill-create-flow-gaps/wave4-seq-RALLY-013/`
- 前提: TASK-RALLY-003（Rollback API）, TASK-RALLY-012（エラー回復導線）
- このタスクが完了するとRALLYグループ全体が完結
