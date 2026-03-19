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
| 更新日     | 2026-03-19                                       |
| 機能名     | rag-embedding-extraction-runtime                 |

## 目的

backend AI surface の capability matrix、runtime resolver、fail-fast / guidance ポリシー、error policy を確定し、Integrated API Runtime として一貫性のある設計を提供する。

## 実行タスク

- capability matrix 設計: 各 surface の `runtime capability`（`api-key-only` / `guidance-only` / `not-in-scope`）と `implementation status`（`implemented` / `mock` / `todo`）を分離して定義し、runtime resolver の判定ロジックを明文化する
- concern topology 設計: 3 lane 以下で concern を分類し、target topology を table 化する
- flow 設計: check connection、index、embedding、classifier、extraction、graph summary、CRAG、reranking の authority と実行順序を定義する
- error policy 設計: unsupported capability、rate limit、timeout、long-running job failure、provider failure の表示方針を定義する
- UI/UX 契約設計: status row、fail-fast notice、guidance-only 表示の共通部品仕様を定義する

## 設計方針

- terminal surface や consumer subscription を backend job の fallback に使わない
- index job と online query は別責務として扱う
- production mock は設計上の残置を許可しない
- 各 surface は Task01 の access matrix を消費し、独自の mode 判定を持たない

## concern topology（3 lane 以下）

| lane           | concern                                                                     | 主要 surface                                                | 判断ポイント                                                       |
| -------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------ |
| Index Lane     | AI_CHECK_CONNECTION, AI_INDEX                                               | aiHandlers.ts                                               | job lifecycle（queued/running/failed/blocked）と long-running 管理 |
| Embedding Lane | embedding service/pipeline, providers                                       | embedding-service.ts, openai-provider.ts, qwen3-provider.ts | API key 前提の provider 切替と batch/retry                         |
| Search Lane    | classifier, extraction, graph summary, GraphRAG, HybridRAG, CRAG, reranking | search/, extraction/, graph/                                | online query pipeline の orchestration と fail-fast                |

## validation matrix（command 単位）

| command                                             | 検証内容                                 | 期待結果                     |
| --------------------------------------------------- | ---------------------------------------- | ---------------------------- |
| `grep -rn "TODO\|FIXME" aiHandlers.ts`              | AI_INDEX / check connection の TODO 残存 | Phase 5 で解消予定として記録 |
| `grep -rn "mock\|stub" communityHandlers.ts`        | community summary の mock 残存           | Phase 5 で排除対象として記録 |
| `grep -rn "fallback.*terminal\|terminal.*fallback"` | terminal への silent fallback            | 0 件であること               |

## SubAgent 分担

| 役割            | 主担当                                                               |
| --------------- | -------------------------------------------------------------------- |
| Index Agent     | `AI_INDEX` / check connection / job 状態の契約を整理する             |
| Embedding Agent | embedding provider / capability / guidance を整理する                |
| Search Agent    | classifier / extraction / graph summary / HybridRAG の契約を整理する |

## 参照資料

### 前提 Phase

| 参照資料            | パス                      | 内容                            |
| ------------------- | ------------------------- | ------------------------------- |
| Phase 1（要件定義） | `phase-1-requirements.md` | capability inventory を確認する |

### ソースコード

| 参照資料               | パス                                                                      | 内容                                                   |
| ---------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------ |
| aiHandlers             | `apps/desktop/src/main/ipc/aiHandlers.ts`                                 | `AI_CHECK_CONNECTION` / `AI_INDEX` の TODO を確認する  |
| communityHandlers      | `apps/desktop/src/main/ipc/communityHandlers.ts`                          | community summary mock の現状を確認する                |
| embedding-service      | `packages/shared/src/services/embedding/embedding-service.ts`             | embedding 実行サービスを確認する                       |
| embedding-pipeline     | `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`   | batch / retry / persistence を含む pipeline を確認する |
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

| 参照資料           | パス                                                                      | 内容                                           |
| ------------------ | ------------------------------------------------------------------------- | ---------------------------------------------- |
| api-ipc-system     | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`     | `AI_CHECK_CONNECTION` / `AI_INDEX` の正本      |
| llm-embedding      | `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`      | embedding provider / pipeline 契約の正本       |
| architecture-rag   | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`   | RAG / graph / search 正本                      |
| rag-services       | `.claude/skills/aiworkflow-requirements/references/rag-services.md`       | classifier / extraction / community 関連の正本 |
| rag-query-pipeline | `.claude/skills/aiworkflow-requirements/references/rag-query-pipeline.md` | GraphRAG / HybridRAG の正本                    |

### aiworkflow-requirements 抽出起点

| 参照資料                         | パス                                                                                            | 内容                                                                                                                                                           |
| -------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| workflow foundation              | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | foundation 契約、current canonical set、Task08 への伝搬方針を確認する                                                                                          |
| resource-map                     | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                | Task08 専用 row `設計仕様（RAG runtime / AI_INDEX / Embedding / Extraction / Graph Summary）` と `設計同期（AI runtime/auth-mode unification）` から逆引きする |
| quick-reference                  | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                             | Task08 専用ショートカットから canonical spec の最短導線を確認する                                                                                              |
| quick-reference-search-patterns  | `.claude/skills/aiworkflow-requirements/indexes/quick-reference-search-patterns.md`             | `AI_INDEX` / `AI_CHECK_CONNECTION` / `entity extraction` / `relation extraction` / `graph summary` / `query classifier` を分割検索する                         |
| api-ipc-system-core              | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                      | `AI_CHECK_CONNECTION` legacy、`AI_INDEX`、long-running job 契約を確認する                                                                                      |
| interfaces-rag                   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`                           | relation extraction、entity extraction、GraphRAG の上位契約を確認する                                                                                          |
| interfaces-rag-entity-extraction | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-entity-extraction.md`         | `IEntityExtractor` と fallback 抽出器の契約を確認する                                                                                                          |
| interfaces-rag-search            | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`                    | GraphRAG / HybridRAG / CRAG / reranking の共通契約を確認する                                                                                                   |
| interfaces-rag-graphrag-query    | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-graphrag-query.md`            | GraphRAG query service 契約を確認する                                                                                                                          |
| interfaces-rag-chunk-embedding   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-chunk-embedding.md`           | chunk / embedding 型と provider 境界を確認する                                                                                                                 |
| interfaces-rag-community-summary | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md`   | community summary 契約を確認する                                                                                                                               |
| api-internal-embedding           | `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md`                   | embedding API の request / response を確認する                                                                                                                 |
| rag-search-hybrid                | `.claude/skills/aiworkflow-requirements/references/rag-search-hybrid.md`                        | HybridRAG 4 stage pipeline を確認する                                                                                                                          |
| rag-search-crag                  | `.claude/skills/aiworkflow-requirements/references/rag-search-crag.md`                          | CRAG evaluation / correction action を確認する                                                                                                                 |
| error-handling                   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                           | fail-fast / explicit error propagation の cross-cutting を確認する                                                                                             |
| security-electron-ipc            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                    | IPC 引数検証、秘密情報非露出、guidance-only 契約を確認する                                                                                                     |
| quality-requirements             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                     | silent fallback 排除、coverage、品質ゲート基準を確認する                                                                                                       |

### パック横断資料

| 参照資料          | パス                                                                       | 内容                                                   |
| ----------------- | -------------------------------------------------------------------------- | ------------------------------------------------------ |
| pack parent index | `docs/30-workflows/ai-runtime-authmode-unification/index.md`               | 実行順序、依存グラフ、共通方針の正本を確認する         |
| pack design audit | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md` | 多角的監査の結論、禁止事項、依存整合を確認する         |
| pack UI/UX 図解   | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`      | 5図セットの画面構成、状態遷移、CTA 導線を確認する      |
| pack UI/UX 正本   | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`   | backend job の status row と guidance block を確認する |

## UI/UX リアライズ

| 観点           | 内容                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------- |
| 画面構成       | backend job は専用チャット UI を持たず、status row と fail-fast notice を共通部品として使う |
| Primary CTA    | `実行する`                                                                                  |
| Secondary CTA  | `詳細を見る` `設定を開く`                                                                   |
| 状態           | `queued` `running` `failed` `blocked` を扱う                                                |
| マイクロコピー | backend job では「terminal で代替実行できる」と誤解させず、guidance-only を明示する         |

## 実行手順

### ステップ1: Phase 1 成果物を確認する

Phase 1 の capability inventory と gap 整理結果を確認し、設計の入力として使用する。

### ステップ2: concern topology と lane を設計する

3 lane（Index / Embedding / Search）に沿って、各 surface の target topology を定義する。

### ステップ3: capability matrix を確定する

各 surface の `runtime capability`（`api-key-only` / `guidance-only` / `not-in-scope`）と `implementation status`（`implemented` / `mock` / `todo`）を分離して確定し、runtime resolver の判定ロジックを定義する。

### ステップ4: error policy を設計する

unsupported capability、rate limit、timeout、long-running job failure、provider failure の各パターンについて、UI 表示方針とリカバリ手段を定義する。

### ステップ5: UI/UX 契約を設計する

pack UI/UX 正本（`ui-ux-realization.md`）を参照し、status row / fail-fast notice / guidance-only 表示の共通部品仕様を定義する。

### ステップ6: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ7: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

AI_INDEX、check connection、embedding、query classifier、extraction、graph summary、CRAG、reranking の契約、state、IPC 境界を設計へ反映する。各 lane の境界を跨ぐ依存を明示し、統合テストで検証すべき接続点を列挙する。

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                       | 仕様参照先                                          |
| ------------------ | ---------------------------------------------- | --------------------------------------------------- |
| セキュリティ       | API key 管理と provider 認証のため適用         | `aiworkflow-requirements: security-api-electron.md` |
| UI/UX              | status row / guidance 表示設計のため適用       | `aiworkflow-requirements: ui-ux-panels.md`          |
| アーキテクチャ     | RAG pipeline 責務分離設計のため適用            | `aiworkflow-requirements: architecture-rag.md`      |
| API設計            | IPC handler / resolver 設計のため適用          | `aiworkflow-requirements: api-ipc-system.md`        |
| エラーハンドリング | fail-fast / guidance / error policy のため適用 | `aiworkflow-requirements: error-handling.md`        |
| パフォーマンス     | long-running job / batch 管理のため適用        | `aiworkflow-requirements: architecture-rag.md`      |

## 成果物

| 成果物       | パス                                   | 内容                                                              |
| ------------ | -------------------------------------- | ----------------------------------------------------------------- |
| 設計サマリー | `outputs/phase-2/design-summary.md`    | concern topology、責務境界、依存関係、接続順序を整理する          |
| 契約一覧     | `outputs/phase-2/contract-matrix.md`   | capability matrix、IPC 契約、state 契約、runtime 契約を一覧化する |
| UI/UX 実体化 | `outputs/phase-2/ui-ux-realization.md` | status row、fail-fast notice、guidance-only 表示を整理する        |

## 完了条件

- [ ] backend AI surface ごとの capability matrix が GraphRAG / HybridRAG / CRAG / reranking まで明文化されている
- [ ] concern topology が 3 lane 以下で定義されている
- [ ] unsupported capability の guidance 条件と fail-fast 条件が定義されている
- [ ] backend job の status / guidance-only UI が定義されている
- [ ] terminal surface への silent fallback が設計に含まれていない
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. Phase 1 成果物の確認
2. concern topology と lane 設計
3. capability matrix の確定
4. flow 設計（authority と実行順序）
5. error policy 設計
6. UI/UX 契約設計
7. system spec との整合確認
8. 成果物の作成・配置
9. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime --phase 2
```

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md) に進む
