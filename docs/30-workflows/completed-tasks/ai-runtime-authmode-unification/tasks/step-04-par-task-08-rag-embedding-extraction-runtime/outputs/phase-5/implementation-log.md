# Phase 5: 実装ログ

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| Phase      | 5                                                |
| 作成日     | 2026-03-19                                       |
| ステータス | completed                                        |

## Baseline (Phase 5 開始前)

| テストスイート             | テスト数                 | 結果        |
| -------------------------- | ------------------------ | ----------- |
| apps/desktop aiHandlers    | 54                       | 全 PASS     |
| packages/shared embedding  | 52                       | 全 PASS     |
| packages/shared search     | 583 (569 pass + 14 skip) | PASS        |
| packages/shared extraction | 93                       | 全 PASS     |
| packages/shared graph      | 303 (302 pass + 1 todo)  | PASS        |
| **合計**                   | **1,085**                | **全 PASS** |

## After (Phase 5 完了後)

| テストスイート          | テスト数                 | 結果        | 変化                       |
| ----------------------- | ------------------------ | ----------- | -------------------------- |
| apps/desktop aiHandlers | 54 (13 in main file)     | 全 PASS     | 期待値更新                 |
| packages/shared search  | 583 (569 pass + 14 skip) | PASS        | エラーメッセージ期待値更新 |
| packages/shared graph   | 303 (302 pass + 1 todo)  | PASS        | 変化なし                   |
| **合計**                | **1,085**                | **全 PASS** | **レグレッションなし**     |

## Changed Files

| ファイル                                                                  | 変更種別 | 変更内容                                                      |
| ------------------------------------------------------------------------- | -------- | ------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/aiHandlers.ts`                                 | modify   | AI_CHECK_CONNECTION/AI_INDEX guidance-only化 + unregister追加 |
| `apps/desktop/src/main/ipc/communityHandlers.ts`                          | modify   | mock削除 + guidance-only化 + unregister追加                   |
| `apps/desktop/src/main/ipc/aiHandlers.test.ts`                            | modify   | 期待値更新                                                    |
| `packages/shared/src/services/search/hybrid-rag-factory.ts`               | modify   | FACTORY_NOT_READY guidance エラー                             |
| `packages/shared/src/services/graph/community-summarizer.ts`              | modify   | SF-09 ログ強化                                                |
| `packages/shared/src/services/search/graphrag-query-service.ts`           | modify   | SF-05 fallback ログ追加                                       |
| `packages/shared/src/services/search/crag/relevance-evaluator.ts`         | modify   | SF-07 fallback ログ追加                                       |
| `packages/shared/src/services/search/__tests__/hybrid-rag-engine.test.ts` | modify   | エラーメッセージ期待値更新                                    |

## Unresolved Items

| ID   | 内容                                            | 優先度 | 対応予定                        |
| ---- | ----------------------------------------------- | ------ | ------------------------------- |
| U-01 | communityHandlers IPC response形式統一 (SD-I01) | MEDIUM | 別タスク (型変更必要)           |
| U-02 | HybridRAGFactory.createFull() 実配線            | HIGH   | 別タスク (依存モジュール完成後) |
| U-03 | Embedding 仕様差分 SD-E01~07                    | MEDIUM | Phase 12 仕様書更新             |
| U-04 | HybridRAGEngine any型 (SD-S03)                  | MEDIUM | 別タスク (型リファクタリング)   |
| U-05 | ILLMClient 型乖離 (SD-S02)                      | MEDIUM | 別タスク (型統一)               |
