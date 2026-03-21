# AI_CHECK_CONNECTION ハンドラー削除タスク

| 項目       | 値                                                        |
| ---------- | --------------------------------------------------------- |
| タスクID   | UT-CLEANUP-AI-CHECK-CONNECTION-001                        |
| 優先度     | 低                                                        |
| 依存       | Step 03-09 全 surface の llm:check-health 移行完了        |
| 関連タスク | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001（Phase 3 M-3） |

---

## 目的

legacy health route（AI_CHECK_CONNECTION）を aiHandlers.ts から安全に削除する。

---

## 前提条件

- `grep -rn "AI_CHECK_CONNECTION" apps/desktop/src/renderer/` の結果が 0 件であること
- 全 surface が llm:check-health のみを参照していることが確認されていること

---

## 実行手順

1. `grep -rn "AI_CHECK_CONNECTION" apps/desktop/src/` で残存箇所を確認
2. aiHandlers.ts から AI_CHECK_CONNECTION ハンドラーを削除
3. IPC_CHANNELS.AI_CHECK_CONNECTION 定数を削除（channels.ts）
4. Preload API から AI_CHECK_CONNECTION 関連のメソッドを削除
5. 関連テストの更新
6. `pnpm typecheck && pnpm lint && pnpm test` で品質確認

---

## 完了条件

- [ ] AI_CHECK_CONNECTION に関するコードが apps/desktop/ 内に存在しないこと
- [ ] 全テストが PASS すること
