# Phase 6: 回帰テスト計画

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| Phase      | 6                                                |
| 作成日     | 2026-03-19                                       |
| ステータス | completed                                        |

## 目的

Phase 5 で変更したファイルの回帰テストを実行し、レグレッションがないことを確認する。
また、カバレッジ不足の箇所を特定し、補完方針を整理する。

## Phase 5 変更ファイル一覧

| ファイル                                                                  | 変更種別 | 対象テストスイート                             |
| ------------------------------------------------------------------------- | -------- | ---------------------------------------------- |
| `apps/desktop/src/main/ipc/aiHandlers.ts`                                 | modify   | `aiHandlers.test.ts`                           |
| `apps/desktop/src/main/ipc/communityHandlers.ts`                          | modify   | 専用テストなし（IPC層統合）                    |
| `apps/desktop/src/main/ipc/aiHandlers.test.ts`                            | modify   | 自身                                           |
| `packages/shared/src/services/search/hybrid-rag-factory.ts`               | modify   | `hybrid-rag-engine.test.ts`                    |
| `packages/shared/src/services/graph/community-summarizer.ts`              | modify   | `community-summarizer.test.ts`                 |
| `packages/shared/src/services/search/graphrag-query-service.ts`           | modify   | `graphrag-query-service.test.ts` + integration |
| `packages/shared/src/services/search/crag/relevance-evaluator.ts`         | modify   | `crag.integration.test.ts`                     |
| `packages/shared/src/services/search/__tests__/hybrid-rag-engine.test.ts` | modify   | 自身                                           |

## 回帰テスト実行計画

### 優先度 HIGH: 変更ファイルの直接テスト

| テストスイート         | 実行コマンド                                                                                              | 理由                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------- |
| aiHandlers             | `pnpm --dir apps/desktop exec vitest run src/main/ipc/aiHandlers.test.ts`                                 | 変更ファイルの直接テスト  |
| hybrid-rag-engine      | `pnpm --dir packages/shared exec vitest run src/services/search/__tests__/hybrid-rag-engine.test.ts`      | factory/engine 変更の回帰 |
| graphrag-query-service | `pnpm --dir packages/shared exec vitest run src/services/search/__tests__/graphrag-query-service.test.ts` | fallback ログ変更の確認   |
| community-summarizer   | `pnpm --dir packages/shared exec vitest run src/services/graph/__tests__/community-summarizer.test.ts`    | SF-09 ログ変更の回帰      |

### 優先度 MEDIUM: 間接影響テスト

| テストスイート  | 実行コマンド                                                          | 理由                            |
| --------------- | --------------------------------------------------------------------- | ------------------------------- |
| search 全体     | `pnpm --dir packages/shared exec vitest run src/services/search/`     | 依存関係変更の間接影響確認      |
| graph 全体      | `pnpm --dir packages/shared exec vitest run src/services/graph/`      | community-summarizer 変更の波及 |
| embedding 全体  | `pnpm --dir packages/shared exec vitest run src/services/embedding/`  | 依存注入境界の変更確認          |
| extraction 全体 | `pnpm --dir packages/shared exec vitest run src/services/extraction/` | extraction サービス変更の確認   |

## カバレッジ不足分析

### aiHandlers.ts（最重要補完対象）

- 現状: Stmts 44.72% / Branch 72.72% / Funcs 33.33%
- 不足理由: `aiHandlers.test.ts` は13テストのみで、多くのハンドラ関数が未カバー
- Uncovered lines: 71-88, 97-109, 126-135, 163-178, 216-219
- 補完方針: Phase 7 では structural fallback として記録。追加テストは別タスク化

### embedding サービス（軽微な不足）

- 現状: Funcs 78.82%（基準 80% 未満）
- 不足ファイル:
  - `async-utils.ts`: Funcs 50% / Lines 16.66%（circuit-breaker 内部関数が未使用パス）
  - `circuit-breaker.ts`: Funcs 42.85% / Lines 46.66%
  - `openai-provider.ts`: 全指標 0%（テストでモック化のみ、実装未カバー）
- 補完方針: `openai-provider.ts` のユニットテスト追加が最も効果的（未タスク化候補）

### search サービス（基準クリア）

- 現状: All files Stmts 96.85% / Branch 90.84% / Funcs 100%
- 全て基準値超過。追加テスト不要

### graph サービス（基準クリア）

- 現状: 302 PASS + 1 todo（1 todo は意図的スキップ）
- 全て基準値超過。追加テスト不要

### extraction サービス（基準クリア）

- 現状: 93 テスト全 PASS
- 全て基準値超過。追加テスト不要

## Phase 6 補完方針まとめ

| 対象              | 現状 Funcs | 判定             | 方針                                               |
| ----------------- | ---------- | ---------------- | -------------------------------------------------- |
| aiHandlers.ts     | 33.33%     | 基準未達（HIGH） | Structural fallback + 未タスク化（追加テスト別途） |
| embedding overall | 78.82%     | 基準未達（LOW）  | Structural fallback（openai-provider は別タスク）  |
| search            | 100%       | 基準クリア       | 追加不要                                           |
| graph             | 基準クリア | 基準クリア       | 追加不要                                           |
| extraction        | 基準クリア | 基準クリア       | 追加不要                                           |

## 未タスク候補（Phase 12 で管理）

| ID      | 内容                                           | 優先度 |
| ------- | ---------------------------------------------- | ------ |
| UT-P6-1 | aiHandlers.ts 未カバーハンドラのテスト追加     | MEDIUM |
| UT-P6-2 | openai-provider.ts ユニットテスト追加          | LOW    |
| UT-P6-3 | circuit-breaker.ts / async-utils.ts テスト追加 | LOW    |
