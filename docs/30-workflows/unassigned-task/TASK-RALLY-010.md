# TASK-RALLY-010: ラリー完了状態UI表示追加

## メタ情報

- 検出元: TASK-RALLY-001 Phase 12 レビュー・ラリーUXギャップ分析
- 優先度: Medium
- GitHub Issue: #2395
- Wave: 3（RALLY-002完了後）
- 前提タスク: RALLY-002（restoredPendingRequest合成ルール明確化）
- 後続タスク: RALLY-011（送信中競合防止UI強化）
- 衝突ドメイン: ConversationalInterview
- 関連ファイル:
  - `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`

## 目的

ラリーが完了したことをユーザーに明示的に通知するUI（完了バナー・メッセージ等）を ConversationalInterview に追加する。`isRallyCompleted` 判定ロジックを実装し、完了状態を視覚的に表現する。

## 背景

現状のラリー機能では、ラリーが完了してもユーザーへの明示的なフィードバックがなく、ユーザーがラリー終了を認識できない。RALLY-002 で合成ルールが明確化された後、ラリーの終了状態（`isRallyCompleted`）を検出し、UX を改善する。このタスクは ConversationalInterview ドメインの Wave 3 起点となる重要タスク。

## 実行タスク

- [ ] ラリー完了状態の検出ロジック（`isRallyCompleted`）を設計・実装する
- [ ] 完了UIコンポーネント（バナー or メッセージ）を実装する
- [ ] 完了状態から非完了状態への遷移をテストする
- [ ] アクセシビリティ（aria-live 等）を考慮したマークアップにする

## 完了条件

- [ ] ラリー完了時に明確なUI表示が出ること
- [ ] 完了判定ロジックが正確であること（偽陽性・偽陰性なし）
- [ ] TypeScript 型チェック PASS
- [ ] 既存テスト PASS

## 苦戦箇所（RALLY-001実装知見）

| 苦戦箇所             | 問題                                                             | 解決策                                                                        |
| -------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 完了状態の検出難易度 | 複数のワークフロー遷移パターンからラリー終了状態をどう識別するか | workflowSnapshot の特定フィールド（status等）の組み合わせで判定ロジックを構築 |
| 完了 → 再開の遷移    | ラリーが「完了→再開」するケースで UI が残留する可能性            | isRallyCompleted を計算プロパティ（useMemo）にして毎レンダリングで再計算      |

## 参照

- 詳細Phase仕様書: `docs/30-workflows/skill-create-flow-gaps/wave3-seq-RALLY-010/`
- 前提: TASK-RALLY-002（合成ルール明確化）
- 後続: TASK-RALLY-011（送信中競合防止UI強化）
