# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 2                                                |
| Phase名    | 設計                                             |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| 前提Phase  | Phase 1（要件定義）                              |
| 後続Phase  | Phase 3（設計レビュー）                          |
| ステータス | not_started                                      |
| 作成日     | 2026-03-13                                       |
| 機能名     | rag-embedding-extraction-runtime                 |

## 目的

backend AI surface の capability matrix と runtime resolver を確定する。

## 実行タスク

- capability 設計: 各 surface を `api-key-only` / `guidance-only` / `not-in-scope` に分類する
- flow 設計: check connection、index、embedding、classifier、extraction、graph summary、CRAG、reranking の authority と順序を定義する
- error policy 設計: unsupported capability、rate limit、timeout、long-running job failure の表示方針を定義する

## 設計方針

- terminal surface や consumer subscription を backend job の fallback に使わない
- index job と online query は別責務として扱う
- production mock は設計上の残置を許可しない

## Atent Team / SubAgent 分担

| 役割            | 主担当                                                               |
| --------------- | -------------------------------------------------------------------- |
| Index Agent     | `AI_INDEX` / check connection / job 状態の契約を整理する             |
| Embedding Agent | embedding provider / capability / guidance を整理する                |
| Graph Agent     | classifier / extraction / graph summary / HybridRAG の契約を整理する |

## 参照資料

| 参照資料               | パス                                                                       | 内容                                                  |
| ---------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------- |
| Phase 1（要件定義）    | `phase-1-requirements.md`                                                  | 依存する前提成果物を確認する                          |
| pack parent index      | `docs/30-workflows/ai-runtime-authmode-unification/index.md`               | 実行順序、依存グラフ、共通方針の正本を確認する        |
| pack design audit      | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md` | 多角的監査の結論、禁止事項、依存整合を確認する        |
| pack UI/UX 図解        | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`      | 5図セットの画面構成、状態遷移、CTA 導線を確認する     |
| aiHandlers             | `apps/desktop/src/main/ipc/aiHandlers.ts`                                  | `AI_CHECK_CONNECTION` / `AI_INDEX` の TODO を確認する |
| communityHandlers      | `apps/desktop/src/main/ipc/communityHandlers.ts`                           | community summary mock の現状を確認する               |
| embedding-service      | `packages/shared/src/services/embedding/embedding-service.ts`              | embedding 実行サービスを確認する                      |
| community-summarizer   | `packages/shared/src/services/graph/community-summarizer.ts`               | graph summary の runtime 依存を確認する               |
| graphrag-query-service | `packages/shared/src/services/search/graphrag-query-service.ts`            | GraphRAG query の runtime 依存を確認する              |
| relevance-evaluator    | `packages/shared/src/services/search/crag/relevance-evaluator.ts`          | CRAG relevance evaluator の runtime 依存を確認する    |
| cross-encoder-reranker | `packages/shared/src/services/search/reranking/cross-encoder-reranker.ts`  | reranking の runtime 依存を確認する                   |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料           | パス                                                                      | 内容                                                   |
| ------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------ |
| api-ipc-system     | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`     | `AI_CHECK_CONNECTION` / `AI_INDEX` の正本              |
| llm-embedding      | `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`      | embedding provider / pipeline 契約の正本               |
| architecture-rag   | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`   | RAG / graph / search 正本                              |
| rag-services       | `.claude/skills/aiworkflow-requirements/references/rag-services.md`       | classifier / extraction / community 関連の正本         |
| rag-query-pipeline | `.claude/skills/aiworkflow-requirements/references/rag-query-pipeline.md` | GraphRAG / HybridRAG の正本                            |
| pack UI/UX 正本    | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`  | backend job の status row と guidance block を確認する |

## UI/UX リアライズ

| 観点           | 内容                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------- |
| 画面構成       | backend job は専用チャット UI を持たず、status row と fail-fast notice を共通部品として使う |
| Primary CTA    | `実行する`                                                                                  |
| Secondary CTA  | `詳細を見る` `設定を開く`                                                                   |
| 状態           | `queued` `running` `failed` `blocked` を扱う                                                |
| マイクロコピー | backend job では「terminal で代替実行できる」と誤解させず、guidance-only を明示する         |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、RAG / AI_INDEX / Embedding / Extraction / Graph Summary の runtime ルール の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

設計 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

AI_INDEX、check connection、embedding、query classifier、extraction、graph summary、CRAG、reranking の契約、state、IPC 境界を設計へ反映する。

## 成果物

| 成果物       | パス                                   | 内容                                                       |
| ------------ | -------------------------------------- | ---------------------------------------------------------- |
| 設計サマリー | `outputs/phase-2/design-summary.md`    | 責務境界、依存関係、接続順序を整理する                     |
| 契約一覧     | `outputs/phase-2/contract-matrix.md`   | IPC、state、runtime 契約を一覧化する                       |
| UI/UX 実体化 | `outputs/phase-2/ui-ux-realization.md` | status row、fail-fast notice、guidance-only 表示を整理する |

## 完了条件

- [ ] backend AI surface ごとの capability matrix が GraphRAG / HybridRAG / CRAG / reranking まで明文化されている
- [ ] unsupported capability の guidance 条件と fail-fast 条件が説明されている
- [ ] backend job の status / guidance-only UI が定義されている

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md) に進む
