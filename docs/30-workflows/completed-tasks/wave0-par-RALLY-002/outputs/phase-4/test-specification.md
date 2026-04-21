# Phase 4 テスト仕様書

## 方針

verify_existing タスクのため、RED テストではなく「既存挙動を固定する targeted regression test」を作成する。

## テストケース定義

### TC-RPR-01: 通常経路 — restoredPendingRequest が null のとき awaitingUserInput を使う

| 項目     | 内容                                                                      |
| -------- | ------------------------------------------------------------------------- |
| 前提     | `restoredPendingRequest = null`（初期状態）                               |
| 入力     | snapshot に `awaitingUserInput = {requestId: "q1", prompt: "通常の質問"}` |
| 期待     | "通常の質問" がチャットに表示される                                       |
| 検証観点 | 正常経路での `pendingRequest` = `awaitingUserInput`                       |

### TC-RPR-02: 復元経路 — undo 後に restoredPendingRequest が awaitingUserInput より優先される

| 項目     | 内容                                                                      |
| -------- | ------------------------------------------------------------------------- |
| 前提     | q1 に回答済み（submit 完了）→ undo 実行済み                               |
| 状態     | `restoredPendingRequest = q1`, `awaitingUserInput = q1`（同じ requestId） |
| 検証     | undo ボタンが無効になり、q1 の選択肢が再表示される                        |
| 検証観点 | undo 後に `restoredPendingRequest` 経由で質問が復元される                 |

### TC-RPR-03: clear 条件 — requestId が変化したとき restoredPendingRequest がクリアされる

| 項目     | 内容                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------- |
| 前提     | q1 に回答済み → undo で `restoredPendingRequest = q1`                                           |
| 操作     | snapshot を q2（requestId 変化）に更新                                                          |
| 期待     | q2 の prompt がチャットに追加される                                                             |
| 検証観点 | `workflowSnapshot?.awaitingUserInput?.requestId` 変化 → clear useEffect 発火 → 通常フローへ復帰 |

### TC-RPR-04: submit 後のクリア — submit 完了後に restoredPendingRequest がクリアされる

| 項目     | 内容                                                                    |
| -------- | ----------------------------------------------------------------------- |
| 前提     | undo で `restoredPendingRequest = q1`                                   |
| 操作     | 選択肢を選び直して送信                                                  |
| 期待     | onSubmit が呼ばれ、submit 完了後に restoredPendingRequest = null になる |
| 検証観点 | `submitAnswer` 内の `setRestoredPendingRequest(null)`                   |

## テストファイル

- `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.restoredPendingRequest.test.tsx`

## 非テスト観点（typecheck/lint に委ねる）

- 型整合（TypeScript が保証）
- ESLint exhaustive-deps（lint が保証）
- UI 描画（既存テストでカバー済み）
