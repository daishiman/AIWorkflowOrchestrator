# Phase 1: 要件定義 -- OpenAICompatibleAdapter 統一アーキテクチャ実装

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase番号  | 1                                        |
| 機能名     | openai-compatible-adapter                |
| タスクID   | TASK-LLM-MOD-06                          |
| 作成日     | 2026-03-23                               |
| 依存 Phase | なし（起点）                             |
| 依存タスク | TASK-LLM-MOD-01（PROVIDER_CONFIGS 更新） |

## 目的

OpenAI / xAI / OpenRouter の 3 プロバイダーが共通して使用する OpenAI Chat Completions API（`/chat/completions`）を、1 つの汎用アダプタークラス `OpenAICompatibleAdapter` で統一するための要件を定義する。

## 実行タスク

### Task 1-1: 現状調査

- `apps/desktop/src/main/adapters/llm/OpenAIAdapter.ts`（227行）を読み込み、sendChat / streamChat / checkHealth の実装を記録する
- `apps/desktop/src/main/adapters/llm/xAIAdapter.ts`（227行）を読み込み、OpenAIAdapter との差分を特定する
- `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts` を読み込み、各プロバイダーのファクトリ登録パターンを記録する
- `apps/desktop/src/main/adapters/llm/BaseLLMAdapter.ts` を読み込み、継承元の API（fetchWithRetry, fetchSSE, handleNetworkError, isLLMError）を確認する

### Task 1-2: 重複コード分析

OpenAIAdapter と xAIAdapter を比較し、以下の差分を明確にする:

| 項目                | OpenAIAdapter                | xAIAdapter                   | 差分の種類   |
| ------------------- | ---------------------------- | ---------------------------- | ------------ |
| providerId          | `"openai"`                   | `"xai"`                      | 設定値       |
| baseUrl             | `https://api.openai.com/v1`  | `https://api.x.ai/v1`        | 設定値       |
| sendChat 実装       | fetchWithRetry + JSON.parse  | fetchWithRetry + JSON.parse  | 同一         |
| streamChat 実装     | fetchSSE + JSON.parse        | fetchSSE + JSON.parse        | 同一         |
| checkHealth 実装    | GET /models                  | GET /models                  | 同一         |
| formatMessages 実装 | system + user/assistant 変換 | system + user/assistant 変換 | 同一         |
| extraHeaders        | なし                         | なし                         | 拡張ポイント |

結論: providerId と baseUrl 以外は 99% 同一コード。設定による差し替えが適切。

### Task 1-3: 要件定義

**変更対象ファイル**:

| ファイル                                                        | 変更種別 |
| --------------------------------------------------------------- | -------- |
| `apps/desktop/src/main/adapters/llm/OpenAICompatibleAdapter.ts` | 新規作成 |
| `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`       | 更新     |
| `apps/desktop/src/main/adapters/llm/index.ts`                   | 更新     |

#### 要件 R-01: OpenAICompatibleProviderConfig インターフェース

設定駆動のために以下のインターフェースを定義する:

```typescript
export interface OpenAICompatibleProviderConfig {
  providerId: LLMProviderId;
  defaultBaseUrl: string;
  extraHeaders?: Record<string, string>;
}
```

- `providerId`: プロバイダー識別子（`"openai"`, `"xai"`, `"openrouter"` 等）
- `defaultBaseUrl`: API のベース URL
- `extraHeaders`: プロバイダー固有の追加 HTTP ヘッダー（OpenRouter の `HTTP-Referer`, `X-Title` 等）

#### 要件 R-02: OpenAICompatibleAdapter クラス

`BaseLLMAdapter` を継承し、以下のメソッドを実装する:

- `sendChat(request: LLMChatRequestInput): Promise<AdapterChatResponse>` -- 非ストリーミングチャット
- `streamChat(request: LLMChatRequestInput, signal?: AbortSignal): AsyncGenerator<StreamChunk>` -- ストリーミングチャット
- `checkHealth(): Promise<HealthCheckResult>` -- GET /models によるヘルスチェック
- `formatMessages(request: LLMChatRequestInput)` -- systemPrompt + messages の OpenAI 形式変換（private）

#### 要件 R-03: LLMAdapterFactory 設定駆動化

`OPENAI_COMPATIBLE_CONFIGS` マップで OpenAI / xAI / OpenRouter の 3 プロバイダーを一括定義し、コンストラクタ内のループ登録で個別の `this.register()` コールを排除する。

#### 要件 R-04: OpenRouter 固有ヘッダー対応

OpenRouter は API リクエストに以下のヘッダーを要求する:

- `HTTP-Referer`: アプリケーション URL（`https://aiworkflow.app`）
- `X-Title`: アプリケーション名（`AIWorkflowOrchestrator`）

`extraHeaders` フィールドでこれらを設定駆動で注入する。

#### 要件 R-05: 後方互換性

- 既存の OpenAI / xAI テストが引き続き PASS すること
- `LLMAdapterFactory.getAdapter("openai")` / `getAdapter("xai")` / `getAdapter("openrouter")` の呼び出しインターフェースは変更しない
- `ILLMAdapter` インターフェースへの変更なし

### Task 1-4: 受入基準定義

| ID    | 受入基準                                                                                                 |
| ----- | -------------------------------------------------------------------------------------------------------- |
| AC-01 | `OpenAICompatibleAdapter` が `sendChat` を正しく実装し、OpenAI Chat Completions API レスポンスを返す     |
| AC-02 | `OpenAICompatibleAdapter` が `streamChat` を正しく実装し、SSE 形式のストリームチャンクを yield する      |
| AC-03 | `OpenAICompatibleAdapter` が `checkHealth` を正しく実装し、GET /models でヘルスチェックを行う            |
| AC-04 | `LLMAdapterFactory` が `OPENAI_COMPATIBLE_CONFIGS` マップから OpenAI / xAI / OpenRouter を設定駆動で生成 |
| AC-05 | OpenRouter の `extraHeaders`（HTTP-Referer, X-Title）がリクエストヘッダーに含まれる                      |
| AC-06 | TypeScript コンパイルエラーが 0 件                                                                       |
| AC-07 | 既存の OpenAI / xAI テストが引き続き PASS する                                                           |
| AC-08 | `ILLMAdapter` インターフェースへの変更がない                                                             |

### Task 1-5: スコープ外事項の明記

以下は本タスクのスコープ外とする:

- `OpenAIAdapter.ts` / `xAIAdapter.ts` の削除（別タスクで対応。本タスクでは共存を許容する）
- `AnthropicAdapter` / `GoogleAdapter` の変更（独自 API 形式のため対象外）
- Renderer 側の変更
- Preload 型定義の変更
- PROVIDER_CONFIGS のモデル定義変更（TASK-LLM-MOD-01 で対応済み）

## 参照資料

| 資料名            | パス                                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| OpenAIAdapter     | `apps/desktop/src/main/adapters/llm/OpenAIAdapter.ts`                                                             |
| xAIAdapter        | `apps/desktop/src/main/adapters/llm/xAIAdapter.ts`                                                                |
| BaseLLMAdapter    | `apps/desktop/src/main/adapters/llm/BaseLLMAdapter.ts`                                                            |
| LLMAdapterFactory | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`                                                         |
| ILLMAdapter       | `apps/desktop/src/main/adapters/llm/types.ts`                                                                     |
| タスク概要        | `docs/30-workflows/llm-provider-model-modernization/tasks/step-05-seq-task-06-openai-compatible-adapter/index.md` |
| TASK-LLM-MOD-01   | `docs/30-workflows/llm-provider-model-modernization/tasks/step-01-seq-task-01-provider-configs-update/index.md`   |

## 成果物

| 成果物                   | パス                                                                                                                             | 形式     |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 要件定義書（本ファイル） | `docs/30-workflows/llm-provider-model-modernization/tasks/step-05-seq-task-06-openai-compatible-adapter/phase-1-requirements.md` | Markdown |

## 完了条件

- [x] OpenAIAdapter と xAIAdapter の重複コード分析を完了した
- [x] 差分が providerId / baseUrl / extraHeaders のみであることを確認した
- [x] `OpenAICompatibleProviderConfig` インターフェースの要件を定義した
- [x] `OpenAICompatibleAdapter` クラスの要件（sendChat, streamChat, checkHealth, formatMessages）を定義した
- [x] `LLMAdapterFactory` の設定駆動化要件を定義した
- [x] 受入基準 AC-01 から AC-08 を定義した
- [x] スコープ外事項を明記した

## 次の Phase

Phase 2: 設計（`phase-2-design.md`）
