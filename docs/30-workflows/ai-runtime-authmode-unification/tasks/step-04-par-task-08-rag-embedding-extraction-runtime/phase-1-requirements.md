# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 1                                                |
| Phase名    | 要件定義                                         |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| 前提Phase  | なし                                             |
| 後続Phase  | Phase 2（設計）                                  |
| ステータス | not_started                                      |
| 作成日     | 2026-03-13                                       |
| 機能名     | rag-embedding-extraction-runtime                 |

## 目的

backend AI surface の capability と gap を整理し、必要要件を定義する。

## 実行タスク

- inventory 整理: `AI_CHECK_CONNECTION`、`AI_INDEX`、embedding service / pipeline、classifier、extraction、graph summary、GraphRAG、HybridRAG factory / engine、CRAG、reranking の current path を整理する
- capability 整理: `api-key-only` / `guidance-only` / `mock` / `todo` の区分で整理する
- gap 整理: silent fallback、long-running job、guidance 不足、production mock を整理する

## 参照資料

| 参照資料               | パス                                                                      | 内容                                                   |
| ---------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------ |
| aiHandlers             | `apps/desktop/src/main/ipc/aiHandlers.ts`                                 | `AI_CHECK_CONNECTION` / `AI_INDEX` の TODO を確認する  |
| communityHandlers      | `apps/desktop/src/main/ipc/communityHandlers.ts`                          | community summary mock の現状を確認する                |
| embedding-service      | `packages/shared/src/services/embedding/embedding-service.ts`             | embedding 実行サービスを確認する                       |
| embedding-pipeline     | `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`   | batch / retry / persistence を含む pipeline を確認する |
| openai-provider        | `packages/shared/src/services/embedding/providers/openai-provider.ts`     | API key 前提の provider を確認する                     |
| qwen3-provider         | `packages/shared/src/services/embedding/providers/qwen3-provider.ts`      | 追加 provider の capability と key 前提を確認する      |
| llm-query-classifier   | `packages/shared/src/services/search/llm-query-classifier.ts`             | query classifier の LLM 依存を確認する                 |
| entity-extractor       | `packages/shared/src/services/extraction/entity-extractor.ts`             | entity extraction の runtime 依存を確認する            |
| relation-extractor     | `packages/shared/src/services/extraction/relation-extractor.ts`           | relation extraction の runtime 依存を確認する          |
| community-summarizer   | `packages/shared/src/services/graph/community-summarizer.ts`              | graph summary の runtime 依存を確認する                |
| graphrag-query-service | `packages/shared/src/services/search/graphrag-query-service.ts`           | GraphRAG query の runtime 依存を確認する               |
| hybrid-rag-engine      | `packages/shared/src/services/search/hybrid-rag-engine.ts`                | HybridRAG 実行と rerank / CRAG handoff を確認する      |
| hybrid-rag-factory     | `packages/shared/src/services/search/hybrid-rag-factory.ts`               | HybridRAG の組み立て点を確認する                       |
| relevance-evaluator    | `packages/shared/src/services/search/crag/relevance-evaluator.ts`         | CRAG relevance evaluator の runtime 依存を確認する     |
| cross-encoder-reranker | `packages/shared/src/services/search/reranking/cross-encoder-reranker.ts` | reranking の runtime 依存を確認する                    |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料           | パス                                                                      | 内容                                           |
| ------------------ | ------------------------------------------------------------------------- | ---------------------------------------------- |
| api-ipc-system     | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`     | `AI_CHECK_CONNECTION` / `AI_INDEX` の正本      |
| interfaces-llm     | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`     | embedding / chat 周辺の正本                    |
| llm-embedding      | `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`      | embedding provider / pipeline 契約の正本       |
| architecture-rag   | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`   | RAG / graph / search 正本                      |
| rag-services       | `.claude/skills/aiworkflow-requirements/references/rag-services.md`       | classifier / extraction / community 関連の正本 |
| rag-query-pipeline | `.claude/skills/aiworkflow-requirements/references/rag-query-pipeline.md` | GraphRAG / HybridRAG の正本                    |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、RAG / AI_INDEX / Embedding / Extraction / Graph Summary の runtime ルール の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

要件定義 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

AI_INDEX、check connection、embedding、query classifier、extraction、graph summary、CRAG、reranking の接続要件を要件として明文化する。

## 成果物

| 成果物       | パス                                         | 内容                           |
| ------------ | -------------------------------------------- | ------------------------------ |
| 要件整理     | `outputs/phase-1/requirements-definition.md` | 要件、制約、受入基準を整理する |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲と除外範囲を明記する   |

## 完了条件

- [ ] backend AI surface ごとの capability 区分が GraphRAG / HybridRAG / CRAG / reranking まで列挙されている
- [ ] production mock / TODO / unsupported capability が後続設計へ割り当てられている

## 次のPhase

- [Phase 2（設計）](./phase-2-design.md) に進む
