# Phase 1: 要件定義 - HybridRAGFactory.createFull/createLite 実配線

## メタ情報

| 項目         | 値                                                          |
| ------------ | ----------------------------------------------------------- |
| タスクID     | `UT-RAG-08-002`                                             |
| Phase        | `1 - 要件定義`                                              |
| 前提Phase    | なし                                                        |
| 次Phase      | `Phase 2: 設計`                                             |
| 対象ファイル | `packages/shared/src/services/search/hybrid-rag-factory.ts` |
| 作成日       | 2026-03-20                                                  |

## 目的

現行コードと system spec の両方を事実ベースで固定し、`factory wiring だけで終わる task` ではなく `adapter と config 契約再定義を含む task` であることを要件として確定する。

## 実行タスク

- P50チェック: stub / placeholder / interface split の current-state を固定する
- FR/NFR整理: adapter、config、validation、Phase 12 sync を要件化する
- 受入基準定義: 実装後に検証できる条件へ落とし込む
- 参照仕様固定: RAG domain canonical set を Phase 2 以降で迷わない形にする

## P50チェック: current-state の事実確認

- [ ] `createFull()` / `createLite()` が `FACTORY_NOT_READY` を throw していることを確認する
- [ ] `KeywordSearchStrategy` が `ISearchStrategy` 非互換であることを確認する
- [ ] `LLMQueryClassifier` / `LLMReranker` / `RelevanceEvaluator` が異なる interface 系統を要求することを確認する
- [ ] `GraphSearchStrategy` の `queryType` が engine から渡らないことを確認する
- [ ] `rag-search-hybrid.md` / `architecture-rag.md` / `rag-query-pipeline.md` が current runtime snapshot を `not-ready` としていることを確認する

## 機能要件

### FR-01: current config 契約を責務分離する

`FullHybridRAGConfig` は少なくとも以下を分離して持つ:

| プロパティ             | 型                                      | 役割                                  |
| ---------------------- | --------------------------------------- | ------------------------------------- |
| `db`                   | `LibSQLDatabase<Record<string, never>>` | keyword / vector strategy 用 DB       |
| `embeddingProvider`    | `IEmbeddingProvider`                    | vector / graph strategy 用            |
| `graphStore`           | `IKnowledgeGraphStore`                  | graph strategy 用                     |
| `llmProvider`          | `ILLMProvider`                          | `LLMQueryClassifier` 用               |
| `rerankerLlmClient`    | `services/llm/types.ts` の `ILLMClient` | `LLMReranker` 用                      |
| `cragLlmClient`        | `search/crag/types.ts` の `ILLMClient`  | `RelevanceEvaluator` 用               |
| `communitySummarizer?` | `ICommunitySummarizer`                  | graph strategy の optional dependency |
| `webSearcher?`         | `IWebSearcher`                          | CRAG の optional dependency           |

### FR-02: keyword adapter を追加する

- `KeywordSearchStrategy` を直接 engine に渡さない。
- `ISearchStrategy` を実装する adapter を追加し、`string + limit + filters` を `SearchQuery` へ変換して bridge する。
- adapter は `source="keyword"` と score 変換を崩さない。

### FR-03: createFull() は 3 つの LLM 系統を混同しない

- Query classification は `llmProvider` を使う。
- `rerankerType === "llm"` のときだけ `rerankerLlmClient` を使う。
- `enableCRAG === true` のときだけ `cragLlmClient` を使う。
- 共有インスタンスを使う場合でも caller が明示的に同じ実体を渡す。

### FR-04: createLite() は current engine 契約に整合する

- `RuleBasedQueryClassifier` を使う。
- keyword は adapter 経由で接続する。
- semantic は `VectorSearchStrategy` を使う。
- graph は `GraphSearchStrategy` を使う。
- reranker は `NoOpReranker()`、crag は `null` とする。

### FR-05: placeholder 型の削除は import 置換ではなく契約再定義として扱う

| placeholder            | 実型                                    | 補足                                                    |
| ---------------------- | --------------------------------------- | ------------------------------------------------------- |
| `IEmbeddingProvider`   | `../embedding/providers/interfaces`     | `services` 配下の実型を使い、戻り値は `EmbeddingResult` |
| `IKnowledgeGraphStore` | `../graph/knowledge-graph-store`        | `services` 配下の実型を使い、`query()` 以外も持つ       |
| `ILLMClient`           | `../llm/types` と `./crag/types`        | reranker 用と CRAG 用で同名別契約を分離する             |
| `DrizzleClient`        | `LibSQLDatabase<Record<string, never>>` | `drizzle-orm/libsql` を使う                             |
| `IWebSearcher`         | `./crag/types`                          | `Result<WebSearchResult[], Error>` を返す               |

### FR-06: Phase 12 で same-wave system spec sync を行う

最小更新対象:

- `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`
- `.claude/skills/aiworkflow-requirements/references/rag-search-hybrid.md`
- `.claude/skills/aiworkflow-requirements/references/rag-query-pipeline.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`

必要時のみ追加:

- `.claude/skills/aiworkflow-requirements/references/rag-services.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md`
- `.claude/skills/aiworkflow-requirements/references/rag-search-graph.md`
- `.claude/skills/aiworkflow-requirements/references/rag-search-crag.md`

## 非機能要件

### NFR-01: silent fallback を禁止する

- `cohereApiKey` / `voyageApiKey` / `rerankerLlmClient` / `cragLlmClient` の不足は明示的に error を返す。
- `queryType` 伝播未対応は実装で黙って拡張せず、仕様上の制約または follow-up として扱う。

### NFR-02: coverage target を baseline と分けて扱う

| 指標       | repo baseline | task target |
| ---------- | ------------- | ----------- |
| Lines      | 65%           | 80%         |
| Functions  | 80%           | 80%         |
| Branches   | 60%           | 60%         |
| Statements | 65%           | 65%         |

### NFR-03: DIP 準拠

- factory の呼び出し元は interface を渡す。
- 具象クラスの生成は factory helper に閉じ込める。
- adapter は keyword 特有の bridge responsibility だけを持つ。

### NFR-04: task scope を守る

- `HybridRAGEngine` の `queryType` 伝播改善は本 task の必須要件にしない。
- ただし current limitation は Phase 3 / 10 / 12 に必ず記録する。

## 受入基準

- [ ] AC-01: `FullHybridRAGConfig` に `llmProvider` / `rerankerLlmClient` / `cragLlmClient` の責務分離が反映されている
- [ ] AC-02: keyword adapter が `ISearchStrategy` 契約を満たす
- [ ] AC-03: `createFull()` と `createLite()` が `FACTORY_NOT_READY` を投げず engine を返す
- [ ] AC-04: placeholder 型と `@placeholder` コメントが削除されている
- [ ] AC-05: `cohere` / `voyage` / `llm` / `none` の 4 分岐が検証可能である
- [ ] AC-06: `enableCRAG === true` 時のみ `CorrectiveRAG` を生成し、依存不足なら明示エラーになる
- [ ] AC-07: Phase 12 の same-wave sync 対象が仕様書に明記されている

## 参照資料

| 資料名                   | パス / 場所                                                                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| current runtime snapshot | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                                                                                                |
| RAG contract root        | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`                                                                                                  |
| hybrid contract          | `.claude/skills/aiworkflow-requirements/references/rag-search-hybrid.md`                                                                                               |
| pipeline parent          | `.claude/skills/aiworkflow-requirements/references/rag-query-pipeline.md`                                                                                              |
| service inventory        | `.claude/skills/aiworkflow-requirements/references/rag-services.md`                                                                                                    |
| search family index      | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`                                                                                           |
| graph store contract     | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md`                                                                            |
| quality details          | `.claude/skills/aiworkflow-requirements/references/quality-requirements-details.md`                                                                                    |
| coverage baseline        | `.claude/skills/aiworkflow-requirements/references/quality-requirements-advanced.md`                                                                                   |
| pitfalls                 | `.claude/rules/06-known-pitfalls.md#P19`, `.claude/rules/06-known-pitfalls.md#P34`, `.claude/rules/06-known-pitfalls.md#P62`, `.claude/rules/06-known-pitfalls.md#P63` |

## 成果物

| 成果物     | パス                                                                                |
| ---------- | ----------------------------------------------------------------------------------- |
| 要件定義書 | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-1/requirements.md` |

## 完了条件

- [ ] current-state の重大差分が仕様化されている
- [ ] FR-01 から FR-06 が曖昧さなく記述されている
- [ ] NFR-01 から NFR-04 が task scope と整合している
- [ ] 受入基準が Phase 4 以降のテストへ落とし込める

## 統合テスト連携

- `createFull()` / `createLite()` が返す engine で `search()` を実行し、keyword adapter と semantic / graph strategy の接続を確認する。
- `rerankerType` の 4 分岐と `enableCRAG` の条件分岐を統合観点へ含める。

## 多角的チェック観点（AIが判断）

1. `KeywordSearchStrategyAdapter` が score / source / filters を壊さないか。
2. `llmProvider` と 2 種の `ILLMClient` の名前衝突を import alias で安全に扱えるか。
3. `GraphSearchStrategy` の local-only limitation を誤って「解決済み」と書いていないか。

## タスク100%実行確認【必須】

- [ ] 本仕様書の全セクションを読み通し、漏れがないことを確認した
- [ ] current-state の事実と要件が矛盾していないことを確認した
- [ ] 次 Phase へ引き継ぐ blocker が明示されていることを確認した

## 次Phase

Phase 2: 設計 → `phase-2-design.md`
