# Phase 9: リスク登録簿

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 9                                                  |
| 作成日   | 2026-03-22                                         |

## 1. 残余リスク

| ID   | リスク                                      | 影響度 | 発生確率 | 緩和策                                         |
| ---- | ------------------------------------------- | ------ | -------- | ---------------------------------------------- |
| R-01 | openTerminal handler が placeholder のまま  | 低     | 高       | Task06 完了まで console.warn、後続タスクで実装 |
| R-02 | retryConnection の IPC 契約未定義           | 中     | 中       | health:check IPC handler を後続タスクで定義    |
| R-03 | 複数 reason 同時存在時の優先度未定義        | 中     | 中       | 最初の reason を優先する簡易ルールで暫定対応   |
| R-04 | chatSlice 未使用 state のクリーンアップ遅延 | 低     | 高       | 後続タスクで削除候補として管理                 |
| R-05 | LLMGuidanceBanner 削除時の既存テスト破壊    | 中     | 高       | GuidanceBanner テストを先に更新してから削除    |
