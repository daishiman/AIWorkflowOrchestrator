# Phase 5: 実装計画

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| Phase      | 5                                                |
| 作成日     | 2026-03-19                                       |
| ステータス | completed                                        |

## 変更順序

### Task 1: Index Lane (Main側)

| ステップ | 変更対象             | 変更内容                                              | 完了 |
| -------- | -------------------- | ----------------------------------------------------- | ---- |
| 1-1      | aiHandlers.ts        | AI_CHECK_CONNECTION: mock -> guidance-only            | done |
| 1-2      | aiHandlers.ts        | AI_INDEX: setTimeout mock -> guidance-only            | done |
| 1-3      | aiHandlers.ts        | unregisterAIHandlers() 追加 (P5対策)                  | done |
| 1-4      | communityHandlers.ts | 全6ハンドラ: mock -> guidance-only                    | done |
| 1-5      | communityHandlers.ts | mock生成関数削除 + unregisterCommunityHandlers() 追加 | done |
| 1-6      | aiHandlers.test.ts   | テスト期待値を guidance-only に更新                   | done |

### Task 2: Search Lane (shared側)

| ステップ | 変更対象                  | 変更内容                                                       | 完了 |
| -------- | ------------------------- | -------------------------------------------------------------- | ---- |
| 2-1      | hybrid-rag-factory.ts     | createFull()/createLite(): throw -> FACTORY_NOT_READY guidance | done |
| 2-2      | community-summarizer.ts   | SF-09: embed失敗ログ強化 ([CommunitySummarizer] prefix)        | done |
| 2-3      | graphrag-query-service.ts | SF-05: community search fallback ログ追加                      | done |
| 2-4      | relevance-evaluator.ts    | SF-07: JSON parse fallback ログ追加                            | done |

### Task 3: Embedding Lane

変更なし。全サービス implemented 確認済み。仕様差分 (SD-E01~07) は Phase 12 で仕様書側を更新。

## 影響範囲

| 変更ファイル              | テスト影響                                 | ロールバック方法 |
| ------------------------- | ------------------------------------------ | ---------------- |
| aiHandlers.ts             | aiHandlers.test.ts (期待値更新済み)        | git revert       |
| communityHandlers.ts      | テストファイルなし (新規作成は Phase 6)    | git revert       |
| hybrid-rag-factory.ts     | hybrid-rag-engine.test.ts (期待値更新済み) | git revert       |
| community-summarizer.ts   | 既存テスト影響なし (ログ追加のみ)          | git revert       |
| graphrag-query-service.ts | 既存テスト影響なし (ログ追加のみ)          | git revert       |
| relevance-evaluator.ts    | 既存テスト影響なし (ログ追加のみ)          | git revert       |

## 未解決事項

| ID   | 内容                                                          | 対応方針                                          |
| ---- | ------------------------------------------------------------- | ------------------------------------------------- |
| U-01 | communityHandlers の IPC response 形式が `{ok, error}` のまま | CommunityResult<T> 型制約のため。型統一は別タスク |
| U-02 | HybridRAGFactory.createFull() の実配線                        | 依存モジュール完成後の実装タスク                  |
| U-03 | Embedding 仕様差分 SD-E01~07                                  | Phase 12 で仕様書側を更新                         |
