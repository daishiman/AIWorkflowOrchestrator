# Phase 2: 契約一覧 (contract-matrix.md)

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001   |
| Phase      | 2                                                  |
| 作成日     | 2026-03-19                                         |
| ステータス | completed                                          |
| 前提       | Phase 1 outputs/phase-1/requirements-definition.md |

---

## 1. Capability Matrix

全 21 surface の capability を lane 別に一覧化する。

### 凡例

| 列                     | 定義                                                                                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| runtime capability     | `api-key-only` = API key があれば実行可 / `api-key-required` = API key + LLM 必須 / `not-in-scope` = 現スコープ外（guidance-only 応答） / `not-implemented` = 設計未完 |
| implementation status  | `implemented` = 動作する実装あり / `mock` = production mock / `throw-stub` = 呼び出しで例外 / `todo` = 未実装                                                          |
| guidance-only fallback | `yes` = unsupported 時に guidance を返す / `no` = fail-fast で即エラー                                                                                                 |

### 1.1 Index Lane (8 surface)

| #   | surface                | channel                  | lane  | runtime capability        | implementation status | api-key required | LLM required | embedding required | guidance-only fallback | fail-fast 条件                |
| --- | ---------------------- | ------------------------ | ----- | ------------------------- | --------------------- | ---------------- | ------------ | ------------------ | ---------------------- | ----------------------------- |
| 1   | AI_CHECK_CONNECTION    | `ai:check-connection`    | Index | not-in-scope (legacy)     | mock                  | -                | -            | -                  | yes                    | なし（常に guidance 返却）    |
| 2   | AI_INDEX               | `ai:index`               | Index | not-in-scope (RAG 未着手) | mock                  | -                | -            | -                  | yes                    | long-running job 契約未整備時 |
| 3   | COMMUNITY_GET_ALL      | `community:get-all`      | Index | not-in-scope              | mock                  | -                | -            | -                  | yes                    | なし（常に guidance 返却）    |
| 4   | COMMUNITY_GET_BY_LEVEL | `community:get-by-level` | Index | not-in-scope              | mock                  | -                | -            | -                  | yes                    | なし（常に guidance 返却）    |
| 5   | COMMUNITY_GET_BY_ID    | `community:get-by-id`    | Index | not-in-scope              | mock                  | -                | -            | -                  | yes                    | NOT_FOUND 時                  |
| 6   | COMMUNITY_GET_MEMBERS  | `community:get-members`  | Index | not-in-scope              | mock                  | -                | -            | -                  | yes                    | NOT_FOUND 時                  |
| 7   | COMMUNITY_GET_SUMMARY  | `community:get-summary`  | Index | not-in-scope              | mock                  | -                | -            | -                  | yes                    | NOT_FOUND 時                  |
| 8   | COMMUNITY_SEARCH       | `community:search`       | Index | not-in-scope              | mock                  | -                | -            | -                  | yes                    | なし（常に guidance 返却）    |

### 1.2 Embedding Lane (4 surface)

| #   | surface                 | path                    | lane      | runtime capability | implementation status | api-key required | LLM required | embedding required | guidance-only fallback | fail-fast 条件                                 |
| --- | ----------------------- | ----------------------- | --------- | ------------------ | --------------------- | ---------------- | ------------ | ------------------ | ---------------------- | ---------------------------------------------- |
| 9   | EmbeddingService        | `embedding-service.ts`  | Embedding | api-key-only       | implemented           | yes              | no           | yes                | no                     | all providers fail -> throw PipelineError      |
| 10  | EmbeddingPipeline       | `embedding-pipeline.ts` | Embedding | api-key-only       | implemented           | yes              | no           | yes                | no                     | PipelineError throw（即時）                    |
| 11  | OpenAIEmbeddingProvider | `openai-provider.ts`    | Embedding | api-key-only       | implemented           | yes              | no           | yes                | no                     | tiktoken 失敗は silent（設計意図: 簡易推定へ） |
| 12  | Qwen3EmbeddingProvider  | `qwen3-provider.ts`     | Embedding | api-key-only       | implemented           | yes              | no           | yes                | no                     | countTokens 簡易計算（comment 明示済）         |

### 1.3 Search Lane (9 surface)

| #   | surface              | path                          | lane   | runtime capability | implementation status | api-key required | LLM required | embedding required | guidance-only fallback | fail-fast 条件                                   |
| --- | -------------------- | ----------------------------- | ------ | ------------------ | --------------------- | ---------------- | ------------ | ------------------ | ---------------------- | ------------------------------------------------ |
| 13  | LLMQueryClassifier   | `llm-query-classifier.ts`     | Search | api-key-required   | implemented           | yes              | yes          | no                 | no                     | LLM 失敗 -> fallbackClassifier（設計意図）       |
| 14  | LLMEntityExtractor   | `entity-extractor.ts`         | Search | api-key-required   | implemented           | yes              | yes          | no                 | no                     | extractBatch: error skip + err return            |
| 15  | LLMRelationExtractor | `relation-extractor.ts`       | Search | api-key-required   | implemented           | yes              | yes          | no                 | no                     | extractBatch: error skip + err return            |
| 16  | CommunitySummarizer  | `community-summarizer.ts`     | Search | api-key-required   | implemented           | yes              | yes          | yes                | no                     | embed 失敗=warn / LLM 失敗=err                   |
| 17  | GraphRAGQueryService | `graphrag-query-service.ts`   | Search | api-key-required   | implemented           | yes              | yes          | yes                | no                     | community search 失敗 -> []（要明文化）          |
| 18  | HybridRAGEngine      | `hybrid-rag-engine.ts`        | Search | api-key-required   | implemented           | yes              | yes          | yes                | no                     | rerank 失敗 -> fusion result（設計意図）         |
| 19  | HybridRAGFactory     | `hybrid-rag-factory.ts`       | Search | not-implemented    | throw-stub            | -                | -            | -                  | yes                    | createFull/createLite 呼び出し時 即 throw        |
| 20  | RelevanceEvaluator   | `crag/relevance-evaluator.ts` | Search | api-key-required   | implemented           | yes              | yes          | no                 | no                     | JSON parse 失敗 -> score=5（要明文化）           |
| 21  | CrossEncoderReranker | `cross-encoder-reranker.ts`   | Search | api-key-required   | implemented           | yes              | yes          | no                 | no                     | 全 reranker 失敗 -> fusedScore order（設計意図） |

---

## 2. IPC 契約一覧

### 2.1 統一レスポンス形式

**方針**: 全 IPC handler のレスポンスを以下の統一形式に収束させる（SD-I01 解消）。

```typescript
// 統一 IPC レスポンス型
type IpcResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

// communityHandlers の現行 { ok, value, error } は廃止し上記へ移行
```

### 2.2 Index Lane IPC 契約

| channel                  | direction        | request type                        | response type                                                 | validation                          | error codes                                                | notes                                                            |
| ------------------------ | ---------------- | ----------------------------------- | ------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------- |
| `ai:check-connection`    | Renderer -> Main | `void`                              | `IpcResponse<{ status: "guidance-only"; message: string }>`   | なし                                | `GUIDANCE_ONLY`                                            | legacy 互換のため残置。`llm:check-health` が primary             |
| `ai:index`               | Renderer -> Main | `{ jobId?: string }`                | `IpcResponse<{ jobId: string; status: IndexJobStatus }>`      | jobId: string \| undefined          | `GUIDANCE_ONLY`, `JOB_ALREADY_RUNNING`, `VALIDATION_ERROR` | long-running job。progress は `ai:index:progress` イベントで通知 |
| `ai:index:progress`      | Main -> Renderer | -                                   | `{ jobId: string; progress: number; status: IndexJobStatus }` | -                                   | -                                                          | IPC event（send）。progress: 0-100                               |
| `ai:index:cancel`        | Renderer -> Main | `{ jobId: string }`                 | `IpcResponse<void>`                                           | jobId: 3段 P42 バリデーション       | `VALIDATION_ERROR`, `JOB_NOT_FOUND`                        | job cancel                                                       |
| `community:get-all`      | Renderer -> Main | `void`                              | `IpcResponse<{ status: "guidance-only"; message: string }>`   | なし                                | `GUIDANCE_ONLY`                                            | mock 置換完了まで guidance-only                                  |
| `community:get-by-level` | Renderer -> Main | `{ level: number }`                 | `IpcResponse<{ status: "guidance-only"; message: string }>`   | level: number                       | `GUIDANCE_ONLY`, `VALIDATION_ERROR`                        | mock 置換完了まで guidance-only                                  |
| `community:get-by-id`    | Renderer -> Main | `{ id: string }`                    | `IpcResponse<{ status: "guidance-only"; message: string }>`   | id: 3段 P42 バリデーション          | `GUIDANCE_ONLY`, `VALIDATION_ERROR`, `NOT_FOUND`           | mock 置換完了まで guidance-only                                  |
| `community:get-members`  | Renderer -> Main | `{ communityId: string }`           | `IpcResponse<{ status: "guidance-only"; message: string }>`   | communityId: 3段 P42 バリデーション | `GUIDANCE_ONLY`, `VALIDATION_ERROR`, `NOT_FOUND`           | mock 置換完了まで guidance-only                                  |
| `community:get-summary`  | Renderer -> Main | `{ communityId: string }`           | `IpcResponse<{ status: "guidance-only"; message: string }>`   | communityId: 3段 P42 バリデーション | `GUIDANCE_ONLY`, `VALIDATION_ERROR`, `NOT_FOUND`           | mock 置換完了まで guidance-only                                  |
| `community:search`       | Renderer -> Main | `{ query: string; limit?: number }` | `IpcResponse<{ status: "guidance-only"; message: string }>`   | query: 3段 P42 バリデーション       | `GUIDANCE_ONLY`, `VALIDATION_ERROR`                        | mock 置換完了まで guidance-only                                  |

### 2.3 register / unregister ペア方針（SD-I02 解消）

全 IPC handler は P5 準拠で register/unregister ペアを整備する:

```typescript
// 方針: registerXxxHandlers() / unregisterXxxHandlers() のペアを実装
export function registerIndexHandlers(): void {
  /* ipcMain.handle() x N */
}
export function unregisterIndexHandlers(): void {
  /* ipcMain.removeHandler() x N */
}
export function registerCommunityHandlers(): void {
  /* ipcMain.handle() x N */
}
export function unregisterCommunityHandlers(): void {
  /* ipcMain.removeHandler() x N */
}
```

---

## 3. State 契約

### 3.1 Index Lane Job State

Index job（AI_INDEX）の状態遷移:

```
idle -> queued -> running -> completed
                          -> failed
                          -> cancelled
                          -> blocked    (guidance-only 状態)
```

| state       | 意味                                    | UI 表示                                     | 次アクション              |
| ----------- | --------------------------------------- | ------------------------------------------- | ------------------------- |
| `idle`      | job なし                                | -                                           | 実行ボタン表示            |
| `queued`    | job 受付済み、開始待ち                  | status row: "処理待ち..."                   | キャンセルボタン表示      |
| `running`   | job 実行中                              | status row: "インデックス中... XX%"         | キャンセルボタン表示      |
| `completed` | job 正常完了                            | status row: "完了"                          | 完了メッセージ表示        |
| `failed`    | job 異常終了                            | fail-fast notice: エラー詳細 + 次アクション | 再試行ボタン / 設定へ誘導 |
| `cancelled` | ユーザーキャンセル                      | status row: "キャンセル済み"                | 実行ボタン表示            |
| `blocked`   | capability not-in-scope / guidance-only | guidance block: 理由 + 次アクション         | 設定を開くボタン          |

### 3.2 Embedding Pipeline State

EmbeddingPipeline の内部状態遷移:

```
idle -> chunking -> embedding -> storing -> completed
                              -> failed
```

| state       | 意味                          | エラー伝搬                             |
| ----------- | ----------------------------- | -------------------------------------- |
| `idle`      | pipeline 未起動               | -                                      |
| `chunking`  | テキストをチャンクに分割中    | 失敗時 -> PipelineError throw          |
| `embedding` | chunk ごとに embedding 生成中 | provider 全失敗 -> PipelineError throw |
| `storing`   | embedding を永続化中          | 失敗時 -> PipelineError throw          |
| `completed` | pipeline 正常完了             | -                                      |
| `failed`    | pipeline 異常終了             | PipelineError を呼び出し元に伝播       |

### 3.3 Search Pipeline State

HybridRAGEngine の内部状態遷移:

```
idle -> classifying -> searching -> fusing -> reranking -> correcting -> completed
                                                        -> failed (fail-fast)
```

| state         | 意味                                    | fallback / fail-fast                             |
| ------------- | --------------------------------------- | ------------------------------------------------ |
| `idle`        | pipeline 未起動                         | -                                                |
| `classifying` | LLMQueryClassifier でクエリ分類中       | LLM 失敗 -> fallbackClassifier（設計意図）       |
| `searching`   | GraphRAG / VectorSearch 実行中          | 部分失敗 -> 成功分で継続                         |
| `fusing`      | hybrid fusion スコア算出中              | 失敗時 -> PipelineError throw                    |
| `reranking`   | CrossEncoderReranker 実行中             | 全 reranker 失敗 -> fusedScore order（設計意図） |
| `correcting`  | RelevanceEvaluator (CRAG) 評価 + 修正中 | JSON parse 失敗 -> score=5（要監視）             |
| `completed`   | pipeline 正常完了                       | -                                                |
| `failed`      | pipeline 異常終了（fail-fast）          | エラーを呼び出し元に伝播                         |

---

## 4. Runtime 契約

### 4.1 Runtime Resolver 判定テーブル

各 surface への request が来た際、runtime resolver が以下の順序で判定する。

| 優先順位 | condition                                            | result      | UI response                                                                                      |
| -------- | ---------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| 1        | surface が not-in-scope または not-implemented       | `blocked`   | guidance: "この機能は現在対応していません。詳細は設定をご確認ください。"                         |
| 2        | access matrix = none（Task01 から取得）              | `blocked`   | guidance: "API設定が必要です。設定画面でAPIキーを登録してください。"                             |
| 3        | api-key = missing（required surface）                | `blocked`   | guidance: "APIキーが設定されていません。設定画面で[プロバイダー名]のAPIキーを登録してください。" |
| 4        | capability = unsupported（プロバイダーが機能非対応） | `blocked`   | guidance: "このプロバイダーは[機能名]に対応していません。[対応プロバイダー]に変更してください。" |
| 5        | capability = supported & key = valid                 | `proceed`   | 通常実行                                                                                         |
| 6        | provider = timeout（transport 層）                   | `retry`     | guidance: "接続がタイムアウトしました。再試行中... (N/3回目)"                                    |
| 7        | provider = rate_limit                                | `retry`     | guidance: "レート制限に達しました。XX秒後に再試行します... (N/3回目)"                            |
| 8        | provider = error（非 transport 系）                  | `fail-fast` | guidance: "プロバイダーエラーが発生しました: [sanitized message]"                                |
| 9        | job = already_running（AI_INDEX 排他制御）           | `blocked`   | guidance: "インデックス処理が実行中です。完了をお待ちください。"                                 |

**注記**:

- 判定は優先順位順に評価し、最初にマッチした条件で応答を返す
- API key の実値は guidance message に含めない（NFR-01）
- 各 surface は Task01 の access matrix を消費し、独自 mode 判定を持たない（NFR-10）

### 4.2 Guidance-Only Surface の特別ルール

`not-in-scope` / `not-implemented` surface は常に以下の形式で応答する:

```typescript
// guidance-only 固定レスポンス形式
{
  success: true,
  data: {
    status: "guidance-only" as const,
    message: string,      // 理由（日本語）
    nextAction?: string,  // 次に取るべきアクション（設定を開く等）
  }
}
```

---

## 5. Error Policy Matrix

### 5.1 5パターン定義

| error type                       | code 範囲 | code 例                                      | retry                               | UI display                  | guidance message template                                                                          |
| -------------------------------- | --------- | -------------------------------------------- | ----------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------- |
| unsupported capability           | 1000-1999 | `CAPABILITY_NOT_SUPPORTED` / `GUIDANCE_ONLY` | 不可                                | guidance block（オレンジ）  | "このプロバイダーは[機能名]に対応していません。[対応プロバイダー]を設定してください。"             |
| rate limit                       | 3000-3999 | `RATE_LIMIT_EXCEEDED`                        | 可（最大3回、exponential backoff）  | status row + retry カウンタ | "レート制限に達しました。[N]秒後に再試行します... ([N]/3回目)"                                     |
| timeout（transport 層）          | 3000-3999 | `REQUEST_TIMEOUT`                            | 可（最大3回、exponential backoff）  | status row + retry カウンタ | "接続がタイムアウトしました。再試行中... ([N]/3回目)"                                              |
| long-running job failure         | 4000-4999 | `JOB_FAILED` / `JOB_TIMEOUT`                 | 不可（要ユーザー操作）              | fail-fast notice（赤）      | "インデックス処理が失敗しました: [sanitized reason]。再試行するか設定を確認してください。"         |
| provider failure（非 transport） | 4000-4999 | `PROVIDER_ERROR` / `PARSE_ERROR`             | 不可（parse error は retry 対象外） | fail-fast notice（赤）      | "プロバイダーエラーが発生しました。設定を確認し、問題が続く場合はサポートへお問い合わせください。" |

### 5.2 Retry ポリシー詳細

```typescript
// NFR-05 準拠
const RETRY_POLICY = {
  maxAttempts: 3,
  backoffMs: (attempt: number) => Math.min(1000 * 2 ** attempt, 30_000),
  retryableErrors: ["REQUEST_TIMEOUT", "RATE_LIMIT_EXCEEDED"],
  // parse error / validation error / capability error は retry 対象外
  nonRetryableErrors: [
    "PARSE_ERROR",
    "VALIDATION_ERROR",
    "CAPABILITY_NOT_SUPPORTED",
    "GUIDANCE_ONLY",
  ],
} as const;
```

### 5.3 エラーレスポンス統一形式

```typescript
// 全 surface 共通エラー型
type IpcErrorResponse = {
  success: false;
  error: {
    code: string; // 上記 code 例から選択
    message: string; // sanitized（API key / PII 非含）
    retryable: boolean; // retry 可否
    guidanceMessage?: string; // UI 表示用 guidance（日本語）
  };
};
```

---

## 6. DI 境界表

| layer      | component               | injected dependency                                                 | injection pattern                                                 | lifecycle    |
| ---------- | ----------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------ |
| Main (IPC) | aiHandlers              | なし（guidance-only 固定）                                          | -                                                                 | singleton    |
| Main (IPC) | communityHandlers       | なし（guidance-only 固定）                                          | -                                                                 | singleton    |
| Shared     | EmbeddingService        | `IEmbeddingProvider[]`                                              | Constructor Injection                                             | per-request  |
| Shared     | EmbeddingPipeline       | `IEmbeddingService`                                                 | Constructor Injection                                             | per-request  |
| Shared     | OpenAIEmbeddingProvider | `apiKey: string`                                                    | Constructor Injection                                             | per-provider |
| Shared     | Qwen3EmbeddingProvider  | `apiKey: string`                                                    | Constructor Injection + fail-fast                                 | per-provider |
| Shared     | LLMQueryClassifier      | `ILLMProvider`, `fallbackClassifier?: IQueryClassifier`             | Constructor Injection                                             | per-request  |
| Shared     | LLMEntityExtractor      | `ILLMProvider`                                                      | Constructor Injection                                             | per-request  |
| Shared     | LLMRelationExtractor    | `ILLMProvider`                                                      | Constructor Injection                                             | per-request  |
| Shared     | CommunitySummarizer     | `ILLMProvider`, `IEmbeddingProvider`                                | Constructor Injection                                             | per-request  |
| Shared     | GraphRAGQueryService    | `ILLMProvider`, `IEmbeddingProvider`                                | Constructor Injection                                             | per-request  |
| Shared     | HybridRAGEngine         | `IQueryClassifier`, `IReranker`, `ICorrectiveRAG`                   | Constructor Injection                                             | per-request  |
| Shared     | **HybridRAGFactory**    | `ILLMProvider`, `IEmbeddingProvider`, `IReranker`, `ICorrectiveRAG` | **Factory + Constructor Injection（設計のみ。実装は後続タスク）** | singleton    |
| Shared     | RelevanceEvaluator      | `ILLMClient`                                                        | Constructor Injection                                             | per-request  |
| Shared     | CrossEncoderReranker    | `ILLMProvider` (LLM variant) / `cohereApiKey` / `voyageApiKey`      | Constructor Injection（variant 別）                               | per-request  |

**HybridRAGFactory 配線設計（Phase 5 実装タスク向け）**:

```typescript
// createFull() の想定 DI 設計（現在は throw stub）
class HybridRAGFactory {
  static createFull(deps: {
    llmProvider: ILLMProvider;
    embeddingProvider: IEmbeddingProvider;
    reranker?: IReranker;      // default: NoOpReranker
    correctiveRAG?: ICorrectiveRAG; // default: NoOpCorrectiveRAG
  }): HybridRAGEngine { ... }

  static createLite(deps: {
    llmProvider: ILLMProvider;
    embeddingProvider: IEmbeddingProvider;
  }): HybridRAGEngine { ... }
}
```

---

## 7. 前提条件 / 事後条件

### 7.1 Index Lane

| surface             | preconditions                  | postconditions                                                              |
| ------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| AI_CHECK_CONNECTION | なし（常に応答）               | `{ status: "guidance-only", message: "..." }` を返す                        |
| AI_INDEX            | `jobId` が未実行（排他制御）   | job が queued 状態になり `ai:index:progress` イベント開始 OR `blocked` 応答 |
| COMMUNITY\_\*       | communityId / level が有効な型 | `{ status: "guidance-only", message: "..." }` を返す                        |

### 7.2 Embedding Lane

| surface                 | preconditions                                | postconditions                                                            |
| ----------------------- | -------------------------------------------- | ------------------------------------------------------------------------- |
| EmbeddingService        | providers[] が 1 件以上 / API key が有効     | embedding ベクトルを返す OR PipelineError を throw                        |
| EmbeddingPipeline       | EmbeddingService が注入済み / チャンクが有効 | PipelineOutput を返す（duplicatesRemoved 含む） OR PipelineError を throw |
| OpenAIEmbeddingProvider | apiKey が有効な文字列                        | `EmbeddingResult[]` を返す OR Error を throw                              |
| Qwen3EmbeddingProvider  | apiKey が有効な文字列（fail-fast）           | `EmbeddingResult[]` を返す OR Error を throw（fail-fast）                 |

### 7.3 Search Lane

| surface              | preconditions                                                  | postconditions                                                        |
| -------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------- |
| LLMQueryClassifier   | `ILLMProvider` が注入済み                                      | `QueryClassification` を返す。LLM 失敗時は fallbackClassifier 結果    |
| LLMEntityExtractor   | `ILLMProvider` が注入済み / テキストが非空                     | `ExtractedEntity[]` を返す。partial failure 時は成功分のみ返す        |
| LLMRelationExtractor | `ILLMProvider` が注入済み / テキストが非空                     | `ExtractedRelation[]` を返す。partial failure 時は成功分のみ返す      |
| CommunitySummarizer  | `ILLMProvider` + `IEmbeddingProvider` が注入済み               | `SummaryResult` を返す。embed 失敗は warn のみ / LLM 失敗は err throw |
| GraphRAGQueryService | `ILLMProvider` + `IEmbeddingProvider` が注入済み               | `GraphRAGResult` を返す。community search 失敗時は `[]` で継続        |
| HybridRAGEngine      | `IQueryClassifier` + `IReranker` + `ICorrectiveRAG` が注入済み | `HybridRAGResult` を返す。rerank 失敗は fusion result で代替          |
| HybridRAGFactory     | 後続タスクで実装                                               | `HybridRAGEngine` インスタンスを返す OR guidance-only Error throw     |
| RelevanceEvaluator   | `ILLMClient` が注入済み / candidates が有効                    | `RelevanceScore[]` を返す。JSON parse 失敗時は score=5 で継続         |
| CrossEncoderReranker | variant 別 API key または `ILLMProvider` が注入済み            | `RankedResult[]` を返す。全 reranker 失敗時は fusedScore order        |

---

## 8. Silent Fallback 是非判定

Phase 1 で検出した SF-01 ~ SF-09 の設計判定結果:

| #     | surface              | gap                            | 判定                   | 理由                                                                     |
| ----- | -------------------- | ------------------------------ | ---------------------- | ------------------------------------------------------------------------ |
| SF-01 | AI_CHECK_CONNECTION  | 常に "connected" 返却          | **修正対象**           | production mock。guidance-only 置換必須（Phase 5）                       |
| SF-02 | COMMUNITY_GET_ALL    | 6件固定データ                  | **修正対象**           | production mock。guidance-only 置換必須（Phase 5）                       |
| SF-03 | COMMUNITY_SEARCH     | mock データでのマッチ          | **修正対象**           | production mock。guidance-only 置換必須（Phase 5）                       |
| SF-04 | LLMQueryClassifier   | LLM 失敗 -> fallback           | **設計意図として承認** | fallbackClassifier は意図的な degradation。明文化する                    |
| SF-05 | GraphRAGQueryService | community search 失敗 -> []    | **要監視**             | partial failure として許容するが、空配列返却を UI で明示する             |
| SF-06 | HybridRAGEngine      | rerank 失敗 -> fusion result   | **設計意図として承認** | graceful degradation。明文化する                                         |
| SF-07 | RelevanceEvaluator   | JSON parse 失敗 -> score=5     | **要監視**             | score=5（中立）は検索品質への影響が不明確。ログ記録を義務化する          |
| SF-08 | CrossEncoderReranker | 全 reranker 失敗 -> fusedScore | **設計意図として承認** | NoOpReranker との等価。明文化する                                        |
| SF-09 | CommunitySummarizer  | embed 失敗 -> console.warn     | **要監視**             | warn のみは検出困難。ログ + 部分失敗カウンタを返す方針（Phase 5 で対応） |

---

## 9. 完了条件チェック

- [x] Capability Matrix: 全 21 surface の capability を一覧化（Index 8 + Embedding 4 + Search 9）
- [x] IPC 契約: 統一レスポンス形式 `{ success, data?, error? }` を定義（SD-I01 解消方針）
- [x] IPC 契約: register/unregister ペア方針を定義（SD-I02 解消方針）
- [x] State 契約: Index Lane Job State（6状態）を定義
- [x] State 契約: Embedding Pipeline State（6状態）を定義
- [x] State 契約: Search Pipeline State（8状態）を定義
- [x] Runtime 契約: resolver 判定テーブル（9条件）を定義
- [x] Runtime 契約: guidance-only surface の固定レスポンス形式を定義
- [x] Error Policy: 5パターン（unsupported / rate limit / timeout / job failure / provider failure）を定義
- [x] Error Policy: retry ポリシー（最大3回、exponential backoff）を定義
- [x] DI 境界表: 全 15 component の injection pattern を定義
- [x] DI 境界表: HybridRAGFactory の配線設計（Phase 5 向け）を定義
- [x] 前提条件/事後条件: 全 21 surface を定義
- [x] Silent Fallback 是非: SF-01 ~ SF-09 の全件を判定
