# Chat / Workspace Guidance 導入後の stale state 整理タスク

| 項目         | 値                                                                 |
| ------------ | ------------------------------------------------------------------ |
| タスクID     | UT-CLEANUP-CHAT-WORKSPACE-GUIDANCE-STATE-001                       |
| 優先度       | 低                                                                 |
| 依存         | current guidance wiring 実装の安定化                               |
| 関連タスク   | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001（Phase 3 M-03） |
| issue_number | 1452                                                               |

---

## 目的

guidance 導入後に不要化または意味が曖昧になった state / comment / fallback 前提を整理し、controller と slice の責務を軽くする。

---

## 背景

- `useWorkspaceChatController` は `blockedReason` を導入して model/provider 未設定 guard を明示化した
- 一方で Phase 3 で指摘された `chatSlice` 周辺の未使用 state や stale な意図説明が残っている
- このままだと later task で「まだ使っているのか、消してよいのか」が判別しづらい

---

## 実行手順

1. `chatSlice` / Workspace controller / 関連 test comment を棚卸しする
2. 未使用 state、古い fallback 前提、Red フェーズ由来コメントを分類する
3. 残すものは用途を明記し、不要なものは削除する
4. selector / guard / test の責務境界を再確認する
5. typecheck / vitest を再実行する

---

## 完了条件

- [ ] 未使用 state の扱いが「削除」または「用途明記」のどちらかに確定する
- [ ] stale comment や fallback 前提が残らない
- [ ] controller / slice の責務境界が読みやすくなる
- [ ] 関連テストが green のまま維持される

---

## 参照

- `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts`
- `apps/desktop/src/renderer/views/WorkspaceView/hooks/__tests__/useWorkspaceChatController.runtime.test.ts`
- `apps/desktop/src/renderer/store/slices/chatSlice.ts`
- `docs/30-workflows/step-03-par-task-04-chat-workspace-guidance-action-wiring/outputs/phase-10/final-review-report.md`
