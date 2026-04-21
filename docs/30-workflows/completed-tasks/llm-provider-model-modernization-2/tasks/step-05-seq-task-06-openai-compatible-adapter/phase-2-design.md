# Phase 2: 設計 -- OpenAICompatibleAdapter 統一アーキテクチャ実装

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase番号  | 2                         |
| 機能名     | openai-compatible-adapter |
| タスクID   | TASK-LLM-MOD-06           |
| 作成日     | 2026-03-23                |
| 依存 Phase | Phase 1（要件定義）       |

## 目的

Phase 1 で確定した要件（R-01 から R-05）を満たすための具体的なクラス設計・ファクトリ設計・設定マップ設計を定義する。

## 実行タスク

### Task 2-1: クラス図

```
BaseLLMAdapter (abstract)
  |
  +-- OpenAICompatibleAdapter
  |     - providerId: LLMProviderId
  |     - baseUrl: string
  |     - extraHeaders: Record<string, string>
  |     + constructor(providerConfig, apiKey, config?)
  |     + sendChat(request): Promise<AdapterChatResponse>
  |     + streamChat(request, signal?): AsyncGenerator<StreamChunk>
  |     + checkHealth(): Promise<HealthCheckResult>
  |     - formatMessages(request): Array<{role, content}>
  |
  +-- AnthropicAdapter  (変更なし)
  +-- GoogleAdapter     (変更なし)
```

### Task 2-2: OpenAICompatibleProviderConfig 設計

```typescript
export interface OpenAICompatibleProviderConfig {
  /** プロバイダーID */
  providerId: LLMProviderId;
  /** デフォルトのベースURL */
  defaultBaseUrl: string;
  /** 追加HTTPヘッダー（OpenRouterのHTTP-Referer等） */
  extraHeaders?: Record<string, string>;
}
```

設計判断:

- `extraHeaders` をオプショナルにすることで、OpenAI / xAI のように追加ヘッダー不要なプロバイダーとの共存を実現
- `defaultBaseUrl` という命名は、`config?.baseUrl` でオーバーライド可能であることを示す

### Task 2-3: OpenAICompatibleAdapter クラス設計

#### コンストラクタ

```typescript
constructor(
  providerConfig: OpenAICompatibleProviderConfig,
  apiKey: string,
  config?: Partial<Omit<LLMAdapterConfig, "apiKey">>,
)
```

- `super(apiKey, config)` で BaseLLMAdapter を初期化
- `this.providerId = providerConfig.providerId`
- `this.baseUrl = config?.baseUrl ?? providerConfig.defaultBaseUrl`（オーバーライド可能）
- `this.extraHeaders = providerConfig.extraHeaders ?? {}`

#### sendChat 設計

- `POST ${this.baseUrl}/chat/completions` に JSON リクエスト送信
- ヘッダー: `Content-Type`, `Authorization: Bearer ${apiKey}`, `...this.extraHeaders`
- ボディ: `{ model, messages, temperature, max_tokens, stream: false }`
- レスポンス: `ChatCompletionResponse` をパースして `AdapterChatResponse` に変換
- エラーハンドリング: `isLLMError` チェック後、`handleNetworkError` で変換

#### streamChat 設計

- `POST ${this.baseUrl}/chat/completions` に SSE リクエスト送信
- ボディ: `{ ...同上, stream: true }`
- `fetchSSE` を使用して SSE ストリームを取得
- 各チャンクを `StreamChunkResponse` としてパースし、`StreamChunk` に変換して yield
- JSON パースエラーは無視（SSE の keep-alive メッセージ等）

#### checkHealth 設計

- `GET ${this.baseUrl}/models` に認証付きリクエスト送信
- リトライなし（`fetchWithRetry` の第3引数に `0`）
- 成功: `{ status: "connected", providerId, latency, checkedAt }`
- 失敗: `{ status: "error", providerId, errorMessage, checkedAt }`

#### formatMessages 設計（private）

- `systemPrompt` がある場合: `[{ role: "system", content: systemPrompt }]` を先頭に追加
- `messages` 配列を `[{ role, content }]` 形式に変換

### Task 2-4: OPENAI_COMPATIBLE_CONFIGS マップ設計

```typescript
const OPENAI_COMPATIBLE_CONFIGS: Record<
  string,
  OpenAICompatibleProviderConfig
> = {
  openai: {
    providerId: "openai",
    defaultBaseUrl: "https://api.openai.com/v1",
  },
  xai: {
    providerId: "xai",
    defaultBaseUrl: "https://api.x.ai/v1",
  },
  openrouter: {
    providerId: "openrouter",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    extraHeaders: {
      "HTTP-Referer": "https://aiworkflow.app",
      "X-Title": "AIWorkflowOrchestrator",
    },
  },
};
```

設計判断:

- マップのキーは `string` 型（`LLMProviderId` へのキャストはループ内で行う）
- 新規プロバイダー追加時はこのマップに 1 エントリ追加するだけで対応可能

### Task 2-5: LLMAdapterFactory コンストラクタ設計

```typescript
constructor() {
  // OpenAI互換プロバイダーを設定駆動で一括登録
  for (const [id, providerConfig] of Object.entries(OPENAI_COMPATIBLE_CONFIGS)) {
    this.register(
      id as LLMProviderId,
      (apiKey, config) => new OpenAICompatibleAdapter(providerConfig, apiKey, config),
    );
  }

  // 独自API形式のプロバイダーは個別アダプターで登録
  this.register("anthropic", (apiKey, config) => new AnthropicAdapter(apiKey, config));
  this.register("google", (apiKey, config) => new GoogleAdapter(apiKey, config));
}
```

設計判断:

- OpenAI 互換プロバイダーと独自 API プロバイダーを明確に分離
- `xAIAdapter` の個別登録を削除し、`OPENAI_COMPATIBLE_CONFIGS` 経由に統一

### Task 2-6: index.ts エクスポート設計

```typescript
// Provider adapters
export { OpenAICompatibleAdapter } from "./OpenAICompatibleAdapter";
export type { OpenAICompatibleProviderConfig } from "./OpenAICompatibleAdapter";
export { AnthropicAdapter } from "./AnthropicAdapter";
export { GoogleAdapter } from "./GoogleAdapter";
```

### Task 2-7: 変更ファイル一覧

| ファイルパス                                                    | 変更種別 | 変更内容                                              |
| --------------------------------------------------------------- | -------- | ----------------------------------------------------- |
| `apps/desktop/src/main/adapters/llm/OpenAICompatibleAdapter.ts` | 新規作成 | 統一アダプタークラス + ProviderConfig + レスポンス型  |
| `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`       | 更新     | OPENAI_COMPATIBLE_CONFIGS マップ + コンストラクタ変更 |
| `apps/desktop/src/main/adapters/llm/index.ts`                   | 更新     | OpenAICompatibleAdapter エクスポート追加              |

変更しないファイル（本タスクのスコープ外）:

- `apps/desktop/src/main/adapters/llm/OpenAIAdapter.ts`（共存を許容）
- `apps/desktop/src/main/adapters/llm/xAIAdapter.ts`（共存を許容）
- `apps/desktop/src/main/adapters/llm/types.ts`（ILLMAdapter 変更なし）
- `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts`
- `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts`

## 参照資料

| 資料名           | パス                                                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Phase 1 要件定義 | `docs/30-workflows/llm-provider-model-modernization/tasks/step-05-seq-task-06-openai-compatible-adapter/phase-1-requirements.md` |
| BaseLLMAdapter   | `apps/desktop/src/main/adapters/llm/BaseLLMAdapter.ts`                                                                           |
| ILLMAdapter      | `apps/desktop/src/main/adapters/llm/types.ts`                                                                                    |
| OpenAIAdapter    | `apps/desktop/src/main/adapters/llm/OpenAIAdapter.ts`                                                                            |

## 成果物

| 成果物               | パス                                                                                                                       | 形式     |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| 設計書（本ファイル） | `docs/30-workflows/llm-provider-model-modernization/tasks/step-05-seq-task-06-openai-compatible-adapter/phase-2-design.md` | Markdown |

## 完了条件

- [x] `OpenAICompatibleProviderConfig` インターフェースを設計した
- [x] `OpenAICompatibleAdapter` の全メソッド（constructor, sendChat, streamChat, checkHealth, formatMessages）を設計した
- [x] `OPENAI_COMPATIBLE_CONFIGS` マップで 3 プロバイダー（OpenAI, xAI, OpenRouter）を定義した
- [x] `LLMAdapterFactory` コンストラクタの設定駆動化を設計した
- [x] `index.ts` のエクスポート変更を設計した
- [x] 変更対象ファイルが 3 ファイルのみであることを確認した
- [x] スコープ外ファイル（OpenAIAdapter, xAIAdapter, types.ts 等）を変更しないことを確認した

## 次の Phase

Phase 3: 設計レビュー（`phase-3-design-review.md`）
