# Phase 1 Scope Definition

## 対象

- `apps/desktop/src/main/ipc/index.ts` の runtime policy 注入
- `apps/desktop/src/main/ipc/agentHandlers.ts` の central policy 消費
- `apps/desktop/src/main/ipc/skillHandlers.ts` の central policy 消費
- agent / skill runtime integration tests の更新
- runtime workflow / backlog / completed ledger の same-wave sync

## 非対象

- `AI_CHECK_CONNECTION` legacy route の削除
- deprecated `RuntimeResolver` 本体の削除
- chat-edit / slide lane の resolver 置換
- public preload / shared 型の新規 API 追加
- commit / push / PR

## 依存

| 依存                              | 使い方                                           |
| --------------------------------- | ------------------------------------------------ |
| Task02 contract matrix            | authority / consumer の設計根拠                  |
| TASK-SC-02-RUNTIME-POLICY-CLOSURE | `RuntimePolicyResolver` の subscription 判定前提 |
| existing shared handoff transport | public IPC / preload no-op 判定の根拠            |

## ゲート

1. Phase 1-3 がそろうまで consumer 実装へ入らない。
2. public contract 変更の有無を先に判定し、internal-only change を Step 2 へ誤登録しない。
3. cleanup task は close-out の完了条件に混ぜず、carry-over として別記録する。
