# Phase 1: 要件定義 - 成果物

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| Phase      | 1                                                |
| 作成日     | 2026-03-19                                       |
| ステータス | completed                                        |

---

## 1. P50チェック結果（既実装状態の調査）

### git log サマリー

| ディレクトリ                                     | 最終更新                                                     | 概要                                              |
| ------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------- |
| `apps/desktop/src/main/ipc/aiHandlers.ts`        | `46dd79827` feat(runtime): Main Chat/Settings AI runtime同期 | AI_CHECK_CONNECTION / AI_INDEX は TODO のまま     |
| `apps/desktop/src/main/ipc/communityHandlers.ts` | `79e29c2ca` feat(shared): export Community types             | 全ハンドラが mock データのまま                    |
| `packages/shared/src/services/embedding/`        | `3809e1394` feat(shared): Embedding Generation Pipeline      | pipeline/service/provider 全て implemented        |
| `packages/shared/src/services/search/`           | `4c4898400` feat(search): HybridRAG統合検索エンジン          | 個別サービスは implemented、Factory は throw stub |
| `packages/shared/src/services/extraction/`       | `ea82cb78b` feat(rag): relation extraction                   | entity/relation extractor 共に implemented        |
| `packages/shared/src/services/graph/`            | `863848d49` feat(graph): community summarization             | community-summarizer implemented                  |

### P50 結論

- **Embedding Lane**: 全サービス implemented。runtime 対応済み（API key DI 設計確立）
- **Search Lane**: 個別サービスは implemented だが HybridRAGFactory の統合配線が未完成
- **Index Lane**: AI_CHECK_CONNECTION / AI_INDEX / community 全て production mock

Phase 4-5 は **新規設計 + 既存 gap 補完** モードで進める。

---

## 2. Capability Inventory

### 2.1 Index Lane

| surface                | current path                   | runtime capability       | implementation status | gap pattern                                             | IPC response format          | notes                                                        |
| ---------------------- | ------------------------------ | ------------------------ | --------------------- | ------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------ |
| AI_CHECK_CONNECTION    | `aiHandlers.ts:183-203`        | not-in-scope (legacy)    | production mock       | silent fallback (always "connected") + guidance deficit | `{ success, data?, error? }` | 正本仕様: `llm:check-health` を primary とし legacy 互換残置 |
| AI_INDEX               | `aiHandlers.ts:205-233`        | not-in-scope (RAG未着手) | production mock       | long-running job failure + guidance deficit             | `{ success, data?, error? }` | setTimeout(1000) で固定値返却。job contract 未設計           |
| COMMUNITY_GET_ALL      | `communityHandlers.ts:181-200` | not-in-scope             | production mock       | silent fallback (6件固定)                               | `{ ok, value?, error? }`     | response format が aiHandlers と不統一                       |
| COMMUNITY_GET_BY_LEVEL | `communityHandlers.ts:203-223` | not-in-scope             | production mock       | silent fallback                                         | `{ ok, value?, error? }`     | -                                                            |
| COMMUNITY_GET_BY_ID    | `communityHandlers.ts:225-255` | not-in-scope             | production mock       | NOT_FOUND error あり                                    | `{ ok, value?, error? }`     | -                                                            |
| COMMUNITY_GET_MEMBERS  | `communityHandlers.ts:257-288` | not-in-scope             | production mock       | NOT_FOUND error あり                                    | `{ ok, value?, error? }`     | -                                                            |
| COMMUNITY_GET_SUMMARY  | `communityHandlers.ts:290-321` | not-in-scope             | production mock       | NOT_FOUND error あり                                    | `{ ok, value?, error? }`     | -                                                            |
| COMMUNITY_SEARCH       | `communityHandlers.ts:323-352` | not-in-scope             | production mock       | silent fallback                                         | `{ ok, value?, error? }`     | -                                                            |

### 2.2 Embedding Lane

| surface                 | current path            | runtime capability | implementation status | gap pattern                                | DI pattern                                | notes                                 |
| ----------------------- | ----------------------- | ------------------ | --------------------- | ------------------------------------------ | ----------------------------------------- | ------------------------------------- |
| EmbeddingService        | `embedding-service.ts`  | api-key-only       | implemented           | ordered-fallback chain (all fail -> throw) | Constructor Injection (providers[])       | fallback chain 設計あり               |
| EmbeddingPipeline       | `embedding-pipeline.ts` | api-key-only       | implemented           | none (PipelineError throw)                 | Constructor Injection                     | batch/retry/deduplication 実装済み    |
| OpenAIEmbeddingProvider | `openai-provider.ts`    | api-key-only       | implemented           | tiktoken 失敗時の簡易推定 silent fallback  | Constructor Injection (apiKey)            | EMB-002 (実装) vs EMB-001 (仕様) 逆転 |
| Qwen3EmbeddingProvider  | `qwen3-provider.ts`     | api-key-only       | implemented           | countTokens 簡易計算 (comment明示)         | Constructor Injection (apiKey, fail-fast) | EMB-001 (実装) vs EMB-002 (仕様) 逆転 |

### 2.3 Search Lane

| surface              | current path                  | runtime capability | implementation status       | gap pattern                                      | AI API call pattern                                   | partial failure                   | notes                                         |
| -------------------- | ----------------------------- | ------------------ | --------------------------- | ------------------------------------------------ | ----------------------------------------------------- | --------------------------------- | --------------------------------------------- |
| LLMQueryClassifier   | `llm-query-classifier.ts`     | api-key-required   | implemented                 | silent fallback (LLM fail -> fallbackClassifier) | DI (ILLMProvider.generate)                            | fallback classifier 委譲          | useLLM=false でも動作                         |
| LLMEntityExtractor   | `entity-extractor.ts`         | api-key-required   | implemented                 | fail-fast (err return)                           | DI (ILLMProvider.generate)                            | extractBatch: error skip          | fallbackExtractor オプション未実装 (仕様差分) |
| LLMRelationExtractor | `relation-extractor.ts`       | api-key-required   | implemented                 | fail-fast (err return)                           | DI (ILLMProvider.generate)                            | extractBatch: error skip          | bidirectional 自動検出あり                    |
| CommunitySummarizer  | `community-summarizer.ts`     | api-key-required   | implemented                 | mixed (embed fail=warn, LLM fail=err)            | DI (ILLMProvider + IEmbeddingProvider)                | summarizeAll: failedCommunities[] | embed 失敗は console.warn のみ (GAP-5)        |
| GraphRAGQueryService | `graphrag-query-service.ts`   | api-key-required   | implemented                 | silent fallback (community search fail -> [])    | DI (ILLMProvider + IEmbeddingProvider)                | searchWithFallback: [] fallback   | 分類失敗でも hybrid fallback                  |
| HybridRAGEngine      | `hybrid-rag-engine.ts`        | api-key-required   | implemented                 | silent fallback (rerank fail -> fusion result)   | DI (IQueryClassifier + IReranker + ICorrectiveRAG)    | graceful fallback per stage       | `any` 型使用 (L428,442,461)                   |
| HybridRAGFactory     | `hybrid-rag-factory.ts`       | not-implemented    | **production mock (throw)** | **CRITICAL: throw stub**                         | n/a                                                   | n/a                               | createFull()/createLite() = throw Error       |
| RelevanceEvaluator   | `crag/relevance-evaluator.ts` | api-key-required   | implemented                 | silent fallback (JSON parse fail -> score=5)     | DI (ILLMClient.complete)                              | fallback score                    | ILLMClient 型が独自定義 (GAP-2)               |
| CrossEncoderReranker | `cross-encoder-reranker.ts`   | api-key-required   | implemented (3 variants)    | silent fallback (fail -> fusedScore order)       | LLM: DI / Cohere: direct fetch / Voyage: direct fetch | candidates.slice fallback         | NoOpReranker も実装済み                       |

---

## 3. Gap 整理（4パターン）

### 3.1 Silent Fallback

| #     | surface              | 場所                        | 内容                                  | 深刻度         | 後続 Phase               |
| ----- | -------------------- | --------------------------- | ------------------------------------- | -------------- | ------------------------ |
| SF-01 | AI_CHECK_CONNECTION  | aiHandlers.ts:187           | 常に `{ status: "connected" }` を返す | HIGH           | Phase 5 (guidance 追加)  |
| SF-02 | COMMUNITY_GET_ALL    | communityHandlers.ts:181    | 6件固定データ返却                     | HIGH           | Phase 5 (guidance 追加)  |
| SF-03 | COMMUNITY_SEARCH     | communityHandlers.ts:323    | mock データでの文字列マッチ           | MEDIUM         | Phase 5 (guidance 追加)  |
| SF-04 | LLMQueryClassifier   | llm-query-classifier.ts     | LLM 失敗で fallbackClassifier         | LOW (設計意図) | Phase 2 (明文化)         |
| SF-05 | GraphRAGQueryService | graphrag-query-service.ts   | community search 失敗 -> []           | MEDIUM         | Phase 2 (判定)           |
| SF-06 | HybridRAGEngine      | hybrid-rag-engine.ts        | rerank 失敗 -> fusion result          | LOW (設計意図) | Phase 2 (明文化)         |
| SF-07 | RelevanceEvaluator   | relevance-evaluator.ts      | JSON parse 失敗 -> score=5            | MEDIUM         | Phase 2 (判定)           |
| SF-08 | CrossEncoderReranker | cross-encoder-reranker.ts   | 全 reranker 失敗 -> fusedScore        | LOW (設計意図) | Phase 2 (明文化)         |
| SF-09 | CommunitySummarizer  | community-summarizer.ts:136 | embed 失敗 -> console.warn のみ       | MEDIUM         | Phase 5 (fail-fast 検討) |

### 3.2 Long-Running Job 失敗

| #     | surface  | 場所              | 内容                                                  | 深刻度 | 後続 Phase                  |
| ----- | -------- | ----------------- | ----------------------------------------------------- | ------ | --------------------------- |
| LR-01 | AI_INDEX | aiHandlers.ts:210 | setTimeout(1000) 固定値。progress/cancel/排他制御なし | HIGH   | Phase 2 (job contract 設計) |

### 3.3 Guidance 不足

| #     | surface             | 場所                 | 内容                                            | 深刻度 | 後続 Phase              |
| ----- | ------------------- | -------------------- | ----------------------------------------------- | ------ | ----------------------- |
| GD-01 | AI_CHECK_CONNECTION | aiHandlers.ts        | legacy 互換残置方針が UI に反映されていない     | MEDIUM | Phase 2 (guidance 設計) |
| GD-02 | AI_INDEX            | aiHandlers.ts        | RAG 実装未着手の旨が guidance として返されない  | HIGH   | Phase 2 (guidance 設計) |
| GD-03 | community handlers  | communityHandlers.ts | mock 状態であることが guidance として返されない | MEDIUM | Phase 2 (guidance 設計) |

### 3.4 Production Mock

| #     | surface                | 場所                          | 内容                                                                 | 深刻度   | 後続 Phase                     |
| ----- | ---------------------- | ----------------------------- | -------------------------------------------------------------------- | -------- | ------------------------------ |
| PM-01 | AI_CHECK_CONNECTION    | aiHandlers.ts:187             | ハードコード `{ status: "connected", indexedDocuments: 892 }`        | HIGH     | Phase 5 (guidance 置換)        |
| PM-02 | AI_INDEX               | aiHandlers.ts:210             | ハードコード `{ indexedCount: 15, skippedCount: 3, errors: [] }`     | HIGH     | Phase 5 (guidance 置換)        |
| PM-03 | communityHandlers 全体 | communityHandlers.ts:29-174   | generateMockCommunities / generateMockEntities / generateMockSummary | HIGH     | Phase 5 (guidance 置換)        |
| PM-04 | HybridRAGFactory       | hybrid-rag-factory.ts:154-177 | createFull()/createLite() = throw Error                              | CRITICAL | Phase 5 (配線実装 or guidance) |

---

## 4. 正本仕様との差分

### Embedding Lane 仕様差分

| ID     | 差分内容                      | 実装                             | 仕様                           | 深刻度 |
| ------ | ----------------------------- | -------------------------------- | ------------------------------ | ------ |
| SD-E01 | EMB-001/002 割り当て逆転      | EMB-001=Qwen3, EMB-002=OpenAI    | EMB-001=OpenAI, EMB-002=Qwen3  | HIGH   |
| SD-E02 | OpenAI 次元数不一致           | 3072 (text-embedding-3-large)    | 1536 (text-embedding-3-small)  | MEDIUM |
| SD-E03 | Qwen3 次元数不一致            | 4096                             | 768                            | MEDIUM |
| SD-E04 | PipelineOutput フィールド欠落 | duplicatesRemoved/cacheHits なし | 仕様に定義あり                 | LOW    |
| SD-E05 | embed() シグネチャ差分        | (text, modelId?, options?)       | (text, options?)               | LOW    |
| SD-E06 | embedBatch() シグネチャ差分   | (texts, modelId?, options?)      | (texts, options?)              | LOW    |
| SD-E07 | EmbeddingProvider 列挙型差分  | openai/dashscope 2種             | openai/cohere/voyage/local 4種 | LOW    |

### Search Lane 仕様差分

| ID     | 差分内容                             | 実装                     | 仕様                            | 深刻度 |
| ------ | ------------------------------------ | ------------------------ | ------------------------------- | ------ |
| SD-S01 | LLMEntityExtractor fallbackExtractor | コンストラクタ引数1のみ  | options.fallbackExtractor 推奨  | LOW    |
| SD-S02 | ILLMClient 型乖離                    | crag/types.ts 独自定義   | llm/types.ts と異なるシグネチャ | MEDIUM |
| SD-S03 | HybridRAGEngine any 型               | L428,442,461 で any 使用 | strict: true 準拠すべき         | MEDIUM |

### Index Lane 仕様差分

| ID     | 差分内容                       | 実装                            | 仕様                         | 深刻度 |
| ------ | ------------------------------ | ------------------------------- | ---------------------------- | ------ |
| SD-I01 | IPC response 形式不統一        | communityHandlers: `{ok,value}` | aiHandlers: `{success,data}` | MEDIUM |
| SD-I02 | register/unregister ペア未整備 | register のみ                   | P5 準拠で unregister 必要    | MEDIUM |

---

## 5. 受入基準（番号付き）

| AC-ID | 受入基準                                                                                                                           | 検証方法                                                                   |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| AC-01 | backend AI surface ごとの runtime capability / implementation status が GraphRAG / HybridRAG / CRAG / reranking まで列挙されている | capability inventory table の行数 >= 18 (Index 8 + Embedding 4 + Search 9) |
| AC-02 | production mock / TODO / unsupported capability が後続設計へ割り当てられている                                                     | gap pattern 列が「mock」「todo」の行が全て後続 Phase 参照を持つ            |
| AC-03 | terminal surface への silent fallback が要件に含まれていない                                                                       | grep で `fallback.*terminal` / `terminal.*fallback` が 0 件                |
| AC-04 | FR/NFR が分類され優先度が設定されている                                                                                            | FR/NFR テーブルに分類漏れがない                                            |
| AC-05 | concern topology が 3 lane 以下で定義されている                                                                                    | Index / Embedding / Search の 3 lane が明示                                |
| AC-06 | error policy が 5 パターンを網羅している                                                                                           | unsupported / rate limit / timeout / job failure / provider failure        |

---

## 6. 機能要件（FR）

| FR-ID | 要件                                                                                                                                | 優先度 | 対応 lane         | 対応 AC |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------- | ------- |
| FR-01 | 各 backend AI surface の runtime capability (api-key-only / guidance-only / not-in-scope) が capability matrix として定義されている | HIGH   | 全 lane           | AC-01   |
| FR-02 | production mock (AI_CHECK_CONNECTION / AI_INDEX / community) に対して guidance-only の明示的なレスポンスが設計されている            | HIGH   | Index             | AC-02   |
| FR-03 | HybridRAGFactory の createFull()/createLite() の配線設計が定義されている                                                            | HIGH   | Search            | AC-02   |
| FR-04 | AI_INDEX の long-running job contract (progress / cancel / 排他制御) が定義されている                                               | HIGH   | Index             | AC-06   |
| FR-05 | unsupported capability 時の fail-fast エラーレスポンスが統一形式で定義されている                                                    | HIGH   | 全 lane           | AC-06   |
| FR-06 | provider failure 時の retry / fallback / guidance が定義されている                                                                  | HIGH   | Embedding, Search | AC-06   |
| FR-07 | partial failure 時のレスポンス形式が定義されている (成功分返却 + 失敗件数/理由)                                                     | MEDIUM | Embedding, Search | AC-06   |
| FR-08 | silent fallback (SF-01 ~ SF-09) の是非が設計判定されている                                                                          | HIGH   | 全 lane           | AC-03   |
| FR-09 | IPC レスポンス形式の統一方針が定義されている (success/data vs ok/value)                                                             | MEDIUM | Index             | AC-05   |
| FR-10 | register/unregister ペアの方針が定義されている                                                                                      | MEDIUM | Index             | AC-05   |

## 7. 非機能要件（NFR）

| NFR-ID | 要件                                                                                   | 優先度 | カテゴリ     | 対応 AC |
| ------ | -------------------------------------------------------------------------------------- | ------ | ------------ | ------- |
| NFR-01 | API key は Main Process でのみ取り扱い、Renderer / error message / log に漏洩しない    | HIGH   | Security     | -       |
| NFR-02 | IPC 引数は P42 準拠 3段バリデーション (型チェック -> 空文字列 -> trim())               | HIGH   | Security     | -       |
| NFR-03 | long-running index job は非同期で処理し、progress を IPC イベントで通知する            | MEDIUM | Performance  | AC-06   |
| NFR-04 | embedding batch 処理の concurrency は設定可能 (default: 4)                             | LOW    | Performance  | -       |
| NFR-05 | retry は transport 系のみ (parse error には適用しない)。最大 3 回、exponential backoff | MEDIUM | Reliability  | AC-06   |
| NFR-06 | Line Coverage >= 80%, Branch Coverage >= 60%, Function Coverage >= 80%                 | HIGH   | Quality      | -       |
| NFR-07 | ESLint エラー 0 件、TypeScript エラー 0 件                                             | HIGH   | Quality      | -       |
| NFR-08 | production コードに mock / stub / placeholder が残存しない                             | HIGH   | Quality      | AC-02   |
| NFR-09 | terminal surface を backend job の fallback に使用しない                               | HIGH   | Architecture | AC-03   |
| NFR-10 | 各 surface は Task01 の access matrix を消費し、独自 mode 判定を持たない               | HIGH   | Architecture | -       |

---

## 8. 統合テスト連携の要件

backend AI surface は terminal surface への fallback を持たないため、API runtime 接続が唯一の実行経路である。以下の接続点を Phase 4 以降のテスト設計に含める:

| 接続点                                         | 関連 surface     | テスト観点                                         |
| ---------------------------------------------- | ---------------- | -------------------------------------------------- |
| aiHandlers -> embedding-service                | Index, Embedding | AI_INDEX から embedding pipeline への接続          |
| hybrid-rag-engine -> llm-query-classifier      | Search           | query classification -> search strategy 選択       |
| hybrid-rag-engine -> entity/relation-extractor | Search           | extraction pipeline の fail-fast / partial failure |
| hybrid-rag-engine -> community-summarizer      | Search           | graph summary の取得と fallback                    |
| hybrid-rag-engine -> relevance-evaluator       | Search           | CRAG evaluation と correction action               |
| hybrid-rag-engine -> cross-encoder-reranker    | Search           | reranking の fallback (fusedScore)                 |
| hybrid-rag-factory -> 全 search surface        | Search           | factory 配線の統合テスト                           |
| communityHandlers -> community-summarizer      | Index, Search    | IPC 経由での community summary 取得                |

---

## 9. 完了条件チェック

- [x] AC-01: backend AI surface ごとの runtime capability / implementation status が GraphRAG / HybridRAG / CRAG / reranking まで列挙されている (21 surface)
- [x] AC-02: production mock / TODO / unsupported capability が後続設計へ割り当てられている (PM-01~04, LR-01, GD-01~03)
- [x] AC-03: terminal surface への silent fallback が要件に含まれていない (NFR-09)
- [x] AC-04: FR/NFR が分類され優先度が設定されている (FR 10件, NFR 10件)
- [x] P50 チェック完了
- [x] 本 Phase 内の全タスクを 100% 実行完了
