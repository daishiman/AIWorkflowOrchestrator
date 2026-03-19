# Phase 11 引き継ぎチェックリスト

## Phase 12 へ渡す事項

- [x] `AI_CHECK_CONNECTION` / `AI_INDEX` の legacy guidance 契約を system spec に同期する
- [x] `communityHandlers.ts` の guidance-only 実装を system spec に同期する
- [x] `GraphRAGQueryService` の `fallbackReason` と warn log を system spec に同期する
- [x] `HybridRAGFactory` の `[FACTORY_NOT_READY]` を system spec に同期する
- [x] Phase 11 screenshot evidence を current workflow 正本へ配置する

## follow-up として残す事項

- [x] UT-RAG-08-001: community response unification
- [x] UT-RAG-08-002: HybridRAGFactory wiring
- [x] UT-RAG-08-003: embedding spec sync
- [x] UT-RAG-08-004: hybrid-rag-engine type safety
- [x] UT-RAG-08-005: ILLMClient type unification
- [x] UT-RAG-08-006: aiHandlers coverage improvement
- [x] UT-RAG-08-007: openai provider unit tests
- [x] UT-RAG-08-008: circuit breaker / async utils tests
- [x] UT-RAG-08-009: contract-matrix postconditions fix
- [x] UT-RAG-08-010: AI_INDEX exclusive control design
- [x] UT-RAG-08-011: AI_INDEX guidance message template
- [x] UT-RAG-08-012: main process DI assembly design
- [x] UT-RAG-08-013: RelevanceEvaluator SF-07 fix
