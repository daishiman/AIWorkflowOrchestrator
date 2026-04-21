# TASK-RALLY-011: 送信中競合防止UI強化

## メタ情報

- 検出元: TASK-RALLY-001 Phase 12 レビュー・競合状態ギャップ分析
- 優先度: Medium
- GitHub Issue: #2396
- Wave: 4（RALLY-010完了後）
- 前提タスク: RALLY-010（ラリー完了状態UI表示）
- 後続タスク: RALLY-012（エラー回復導線追加）
- 衝突ドメイン: ConversationalInterview
- 関連ファイル:
  - `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`

## 目的

ユーザーが送信中（`isSubmitting = true`）に IPC push イベントを受信した際、スナップショット更新を即時反映せずバッファリングする設計（`pendingSnapshotRef`）を実装し、UI の競合状態を防止する。

## 背景

送信中に IPC push イベントが到着すると、`isSubmitting` と `workflowSnapshot` が競合し、UI が一瞬ちらつく・不整合な状態になる問題がある。`pendingSnapshotRef` にバッファリングし、送信完了後にまとめて反映することで競合を防止する。RALLY-010 の完了状態UI実装後に連続して実施する Wave 4 タスク。

## 実行タスク

- [ ] `pendingSnapshotRef` を useRef で定義する
- [ ] `isSubmitting` 中の push イベントを `pendingSnapshotRef` にバッファリングするロジックを実装する
- [ ] 送信完了時に `pendingSnapshotRef` の内容を `workflowSnapshot` に反映する
- [ ] バッファリングの動作をテストで検証する

## 完了条件

- [ ] 送信中に push イベントが届いても UI がちらつかないこと
- [ ] 送信完了後にバッファされたスナップショットが正しく反映されること
- [ ] TypeScript 型チェック PASS
- [ ] 既存テスト PASS

## 苦戦箇所（RALLY-001実装知見）

| 苦戦箇所                    | 問題                                                                  | 解決策                                                      |
| --------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------- |
| useRef と useState の整合性 | pendingSnapshotRef（ref）と workflowSnapshot（state）の同期タイミング | 送信完了の useEffect cleanup で setState をバッチ更新       |
| テストでのタイミング再現    | 送信中にpushが届くシナリオをテストで再現しにくい                      | vi.useFakeTimers + msw でIPC pushをモックして競合条件を制御 |

## 参照

- 詳細Phase仕様書: `docs/30-workflows/skill-create-flow-caps/wave4-seq-RALLY-011/`
- 前提: TASK-RALLY-010（ラリー完了状態UI表示）
- 後続: TASK-RALLY-012（エラー回復導線）
