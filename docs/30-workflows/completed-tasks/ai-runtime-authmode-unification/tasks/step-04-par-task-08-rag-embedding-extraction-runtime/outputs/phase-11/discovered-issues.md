# Phase 11 発見事項

## サマリー

| 区分    | 件数 |
| ------- | ---- |
| Blocker | 0    |
| Note    | 3    |
| Info    | 1    |

## Note

### N-01: community IPC 応答形が統一 IPC 形式ではない

- 内容: `communityHandlers.ts` は `ok/value/error` 形式を返し、統一 IPC 形式 `{ success, data?, error }` と drift が残る
- 影響: Renderer 側の `useCommunities` が guidance-only を通常 Error として扱いやすい
- 対応: `task-rag-08-001-community-handlers-response-unification.md` を作成し、backlog 登録する

### N-02: HybridRAGFactory の Full/Lite 配線は未実装

- 内容: `createFull()` / `createLite()` は `[FACTORY_NOT_READY]` 付き Error throw のまま
- 影響: GraphRAG / HybridRAG の production wiring は current branch では未接続
- 対応: `task-rag-08-002-hybrid-rag-factory-wiring.md`、`task-rag-08-010-ai-index-exclusive-control-design.md`、`task-rag-08-012-main-process-di-assembly-design.md` を作成し、backlog 登録する

### N-03: RelevanceEvaluator の設計値と実装値に差が残る

- 内容: SF-07 は score=5 fallback を warn 維持しており、Phase 2 の stricter contract と差がある
- 影響: contract matrix と実装の説明がズレやすい
- 対応: `task-rag-08-013-relevance-evaluator-sf07-fix.md` と `task-rag-08-009-contract-matrix-postconditions-fix.md` を作成し、backlog 登録する

## Info

### I-01: current build direct capture は esbuild native binary mismatch で失敗

- 内容: `capture-task-06-main-chat-settings-runtime-sync-phase11.mjs` 実行時に `@esbuild/darwin-arm64` / `darwin-x64` 不一致で Vite capture が起動せず、最終的に Vite server wait timeout で失敗した
- 判定: 環境由来であり、feature blocker ではない
- 対応: same-day upstream evidence + current workflow review board capture へ切替
