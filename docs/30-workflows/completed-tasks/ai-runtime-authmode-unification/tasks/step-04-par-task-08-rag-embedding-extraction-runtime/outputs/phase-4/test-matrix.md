# Phase 4: テストマトリクス (test-matrix.md)

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| Phase      | 4                                                |
| 作成日     | 2026-03-19                                       |
| ステータス | completed                                        |
| 前提       | Phase 2: outputs/phase-2/contract-matrix.md      |

---

## 事前確認結果

### 1. 既存ユーティリティ重複検出（P50対策）

既存の embedding/search/extraction/graph 各 service に対するテストファイルは存在する。
ただし、これらのテストは各 service の内部動作（正常系・graceful degradation）をカバーしており、
以下の観点のテストは存在しない：

- Phase 2 設計の「guidance-only IPC レスポンス形式」への準拠検証
- IPC 統一レスポンス形式 `{ success, data?, error: { code, message } }` の検証
- `register/unregister` ペアの存在検証（P5対策）
- P42 3段バリデーション（型チェック → 空文字列 → トリム空文字列）の検証

結論: **本 Phase 4 のテストは既存テストと重複しない**。

### 2. IPCレスポンス形式の事前合意（P60対策）

`aiHandlers.ts` の現行実装は `{ success: false, error: string }` を返す。
Phase 2 設計の統一型は `{ success: false, error: { code: string, message: string } }` を要求する。

- Red state: 現行実装の `error: string` 形式
- Green state: Phase 5 実装後の `error: { code, message }` 形式

P60 教訓に従い、テストアサーションは **Phase 5 実装後（Green state）の形式** で記述する。

### 3. 既存テストファイル確認

| テスト対象          | 既存テストファイル                              | カバレッジ状況               |
| ------------------- | ----------------------------------------------- | ---------------------------- |
| EmbeddingPipeline   | `__tests__/pipeline/embedding-pipeline.test.ts` | 正常系・batch 処理あり       |
| HybridRAGEngine     | `__tests__/hybrid-rag-engine.test.ts`           | 正常系・rerank fallback あり |
| LLMEntityExtractor  | `__tests__/entity-extractor.test.ts`            | 正常系・LLM エラー一部あり   |
| CommunitySummarizer | `__tests__/community-summarizer.test.ts`        | 正常系・エラー一部あり       |
| RelevanceEvaluator  | `crag/__tests__/relevance-evaluator.test.ts`    | 正常系あり                   |
| aiHandlers          | **存在しない**                                  | 新規作成が必要               |

---

## テストマトリクス

### 凡例

| 列             | 定義                                                                 |
| -------------- | -------------------------------------------------------------------- |
| Red state      | Phase 5 実装前に失敗する（現行実装との差異を検出する）テストの期待値 |
| Green state    | Phase 5 実装後に通過する（Phase 2 契約準拠の）テストの期待値         |
| 既存テスト重複 | `yes` = 既存テストと重複するため作成不要 / `no` = 新規作成が必要     |

---

## M 層: Main Process / IPC (aiHandlers)

| ID   | ケース名                                          | command                                          | 対象ファイル    | Red state (現行)                                                                 | Green state (Phase 5 後)                                                                   | 既存テスト重複 | 優先度 |
| ---- | ------------------------------------------------- | ------------------------------------------------ | --------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------- | ------ |
| M-01 | AI_CHECK_CONNECTION: guidance-only レスポンス形式 | `ai:check-connection` の ipcMain.handle 呼び出し | `aiHandlers.ts` | `{ success: true, data: { status: "connected", indexedDocuments: 892 } }` (mock) | `{ success: true, data: { status: "guidance-only", message: "...", nextAction?: "..." } }` | no             | HIGH   |
| M-02 | AI_INDEX: guidance-only レスポンス形式            | `ai:index` の ipcMain.handle 呼び出し            | `aiHandlers.ts` | `{ success: true, data: { indexedCount: 15, skippedCount: 3 } }` (mock)          | `{ success: true, data: { status: "guidance-only", message: "...", nextAction?: "..." } }` | no             | HIGH   |
| M-03 | AI_INDEX: unsupported provider で fail-fast       | `ai:index` に unsupported provider を指定        | `aiHandlers.ts` | バリデーションなし（mock が常に成功返却）                                        | `{ success: false, error: { code: "GUIDANCE_ONLY", message: "...", retryable: false } }`   | no             | HIGH   |
| M-04 | AI_CHAT: error 形式が object か string か         | `ai:chat` でエラー発生時                         | `aiHandlers.ts` | `{ success: false, error: "エラーメッセージ" }` (string)                         | `{ success: false, error: { code: string, message: string, retryable: boolean } }`         | no             | MEDIUM |
| M-05 | registerAIHandlers: unregister 関数の存在確認     | module export チェック                           | `aiHandlers.ts` | `unregisterAIHandlers` export が存在しない                                       | `unregisterAIHandlers` が export される                                                    | no             | HIGH   |
| M-06 | AI_CHECK_CONNECTION: 二重登録防止（P5対策）       | `registerAIHandlers()` を2回呼び出した場合       | `aiHandlers.ts` | 2回目の呼び出しで例外 or 二重登録                                                | 2回目は no-op（unregister 後に register）                                                  | no             | MEDIUM |

---

## S 層: Shared Services

### S-01 ~ S-02: Embedding Lane

| ID   | ケース名                                                     | 対象ファイル            | Red state (現行)                                    | Green state (Phase 5 後)                                                    | 既存テスト重複 | 優先度 |
| ---- | ------------------------------------------------------------ | ----------------------- | --------------------------------------------------- | --------------------------------------------------------------------------- | -------------- | ------ |
| S-01 | EmbeddingService: 全 provider 失敗時の explicit error        | `embedding-service.ts`  | PipelineError が throw されるが code フィールドなし | `{ code: "PROVIDER_ERROR", message: "...", retryable: false }` を含む Error | no             | HIGH   |
| S-02 | EmbeddingPipeline: batch 部分失敗時の成功数 + 失敗数レポート | `embedding-pipeline.ts` | 部分失敗は全 or nothing で throw                    | `{ successCount: N, failureCount: M, errors: [...] }` を含む PipelineOutput | no             | MEDIUM |

### S-03 ~ S-04: Search Lane - Classifier / Reranking

| ID   | ケース名                                                   | 対象ファイル              | Red state (現行)                                        | Green state (Phase 5 後)                                     | 既存テスト重複 | 優先度 |
| ---- | ---------------------------------------------------------- | ------------------------- | ------------------------------------------------------- | ------------------------------------------------------------ | -------------- | ------ |
| S-03 | HybridRAGEngine: rerank 失敗時の fallback ログ出力         | `hybrid-rag-engine.ts`    | rerank 失敗 -> fusion result （silent fallback: SF-06） | rerank 失敗 -> fusion result + warn ログ出力（SF-06 明文化） | no             | MEDIUM |
| S-04 | LLMQueryClassifier: LLM 失敗時に fallbackClassifier を使用 | `llm-query-classifier.ts` | LLM 失敗 -> fallback（動作するが explicit ログなし）    | LLM 失敗 -> fallback + warn ログ出力（SF-04 明文化）         | no             | MEDIUM |

### S-05 ~ S-06: Search Lane - Extraction / Graph

| ID   | ケース名                                                    | 対象ファイル              | Red state (現行)                           | Green state (Phase 5 後)                                            | 既存テスト重複 | 優先度 |
| ---- | ----------------------------------------------------------- | ------------------------- | ------------------------------------------ | ------------------------------------------------------------------- | -------------- | ------ |
| S-05 | LLMEntityExtractor: extractBatch 部分失敗時の error count   | `entity-extractor.ts`     | error skip のみ（count なし）              | `{ extractedCount: N, errorCount: M, errors: [...] }` を含む result | no             | MEDIUM |
| S-06 | CommunitySummarizer: embed 失敗時の warn + 部分失敗カウンタ | `community-summarizer.ts` | embed 失敗 -> `console.warn` のみ（SF-09） | warn + failureCount をレスポンスに含む                              | no             | HIGH   |

### S-07 ~ S-09: Search Lane - GraphRAG / CRAG / Factory

| ID   | ケース名                                                        | 対象ファイル                  | Red state (現行)                                 | Green state (Phase 5 後)                                                   | 既存テスト重複 | 優先度 |
| ---- | --------------------------------------------------------------- | ----------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------- | -------------- | ------ |
| S-07 | GraphRAGQueryService: community search 失敗時の UI 明示用フラグ | `graphrag-query-service.ts`   | 失敗 -> `[]`（silent: SF-05）                    | `{ results: [], partialFailure: true, reason: "community search failed" }` | no             | HIGH   |
| S-08 | RelevanceEvaluator: JSON parse 失敗時の score=5 + ログ記録      | `crag/relevance-evaluator.ts` | JSON parse 失敗 -> score=5（silent: SF-07）      | score=5 + warn ログ出力（SF-07 監視義務化）                                | no             | MEDIUM |
| S-09 | HybridRAGFactory: createFull が throw stub であることの検証     | `hybrid-rag-factory.ts`       | `createFull()` で `Error: not implemented` throw | `createFull()` が実装される（throw ではなく `HybridRAGEngine` を返す）     | no             | HIGH   |

---

## I 層: IPC 契約 (communityHandlers / aiHandlers)

| ID   | ケース名                                                    | 対象ファイル           | Red state (現行)                                 | Green state (Phase 5 後)                                                           | 既存テスト重複 | 優先度 |
| ---- | ----------------------------------------------------------- | ---------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------- | -------------- | ------ |
| I-01 | communityHandlers: レスポンス形式が統一されているか         | `communityHandlers.ts` | `{ ok, value, error }` 形式（旧形式）            | `{ success, data?, error: { code, message } }` 形式（SD-I01 解消）                 | no             | HIGH   |
| I-02 | communityHandlers: P42 3段バリデーション（communityId）     | `communityHandlers.ts` | `typeof === "string" && !== ""` の2段のみ        | 型チェック → 空文字列 → `.trim() === ""` の3段                                     | no             | HIGH   |
| I-03 | aiHandlers: register/unregister ペア存在確認                | `aiHandlers.ts`        | `unregisterAIHandlers` が export されない        | `registerAIHandlers` + `unregisterAIHandlers` のペアが export される               | no             | HIGH   |
| I-04 | communityHandlers: register/unregister ペア存在確認         | `communityHandlers.ts` | `unregisterCommunityHandlers` が export されない | `registerCommunityHandlers` + `unregisterCommunityHandlers` のペアが export される | no             | HIGH   |
| I-05 | aiHandlers: AI_INDEX の P42 3段バリデーション（folderPath） | `aiHandlers.ts`        | folderPath が空文字列でもバリデーションを通過    | folderPath: 型チェック → 空文字列 → `.trim() === ""` の3段                         | no             | MEDIUM |

---

## テストケース作成対象ファイル

Phase 5 実装（TDD: Red phase）のため、以下の新規テストファイルを作成する：

| テストファイル                                                                                 | 対応するプロダクションファイル | テストケース ID |
| ---------------------------------------------------------------------------------------------- | ------------------------------ | --------------- |
| `apps/desktop/src/main/ipc/__tests__/aiHandlers.test.ts`                                       | `aiHandlers.ts`                | M-01 ~ M-06     |
| `apps/desktop/src/main/ipc/__tests__/communityHandlers.runtime.test.ts`                        | `communityHandlers.ts`         | I-01 ~ I-04     |
| `packages/shared/src/services/embedding/__tests__/embedding-service.runtime.test.ts`           | `embedding-service.ts`         | S-01            |
| `packages/shared/src/services/embedding/__tests__/pipeline/embedding-pipeline.runtime.test.ts` | `embedding-pipeline.ts`        | S-02            |
| `packages/shared/src/services/search/__tests__/hybrid-rag-engine.runtime.test.ts`              | `hybrid-rag-engine.ts`         | S-03            |
| `packages/shared/src/services/search/__tests__/hybrid-rag-factory.runtime.test.ts`             | `hybrid-rag-factory.ts`        | S-09            |
| `packages/shared/src/services/search/__tests__/graphrag-query-service.runtime.test.ts`         | `graphrag-query-service.ts`    | S-07            |
| `packages/shared/src/services/search/__tests__/llm-query-classifier.runtime.test.ts`           | `llm-query-classifier.ts`      | S-04            |
| `packages/shared/src/services/extraction/__tests__/entity-extractor.runtime.test.ts`           | `entity-extractor.ts`          | S-05            |
| `packages/shared/src/services/graph/__tests__/community-summarizer.runtime.test.ts`            | `community-summarizer.ts`      | S-06            |
| `packages/shared/src/services/search/crag/__tests__/relevance-evaluator.runtime.test.ts`       | `crag/relevance-evaluator.ts`  | S-08            |

---

## 優先度集計

| 優先度 | 件数 | テストケース ID                                                        |
| ------ | ---- | ---------------------------------------------------------------------- |
| HIGH   | 11   | M-01, M-02, M-03, M-05, S-01, S-06, S-07, S-09, I-01, I-02, I-03, I-04 |
| MEDIUM | 8    | M-04, M-06, S-02, S-03, S-04, S-05, S-08, I-05                         |

合計テストケース: **19件**

---

## 完了条件チェック

- [x] 既存ユーティリティ重複検出（P50対策）: 重複なし確認済み
- [x] IPCレスポンス形式の事前合意（P60対策）: Phase 2 contract-matrix.md 準拠で定義
- [x] テスト対象ファイルの import 副作用チェック: aiHandlers.ts 確認済み
- [x] 既存テストファイルの確認: 全 5 service 確認済み
- [x] Main 層 (aiHandlers): M-01 ~ M-06 定義（6件）
- [x] Shared service 層 (embedding/search/extraction/graph): S-01 ~ S-09 定義（9件）
- [x] IPC 層 (communityHandlers/aiHandlers): I-01 ~ I-05 定義（5件）（実質重複なし）
- [x] テストファイル作成対象一覧: 11ファイル特定済み
- [x] 優先度集計: HIGH 11件 / MEDIUM 8件
