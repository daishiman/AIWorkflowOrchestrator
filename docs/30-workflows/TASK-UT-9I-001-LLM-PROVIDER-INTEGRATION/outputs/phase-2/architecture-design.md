# Phase 2: アーキテクチャ設計書

## 実装コンテキスト

既存の `LLMDocQueryAdapter.ts` が既にアダプタとして機能しているため、
仕様書設計の `LLMClient.ts` + `AnthropicProvider.ts` を新規作成し、
`LLMDocQueryAdapter.ts` がそれらを委譲する構造で実装する。

## モジュール構成

```
apps/desktop/src/main/
├── services/
│   ├── llm/                               # 新規
│   │   ├── LLMClient.ts                   # 新規: Facade + 実装（リトライ・タイムアウト）
│   │   ├── providers/
│   │   │   └── AnthropicProvider.ts       # 新規: Anthropic SDK ラッパー
│   │   └── __tests__/
│   │       └── LLMClient.test.ts          # 新規: ユニットテスト
│   └── skill/
│       └── LLMDocQueryAdapter.ts          # 修正: stub → LLMClient 委譲
└── ipc/
    └── index.ts                           # 変更なし（LLMDocQueryAdapter を使用）
```

## LLMClient インターフェース設計

```typescript
// apps/desktop/src/main/services/llm/LLMClient.ts

export type DocErrorCode =
  | "API_KEY_MISSING"
  | "API_KEY_INVALID"
  | "RATE_LIMIT"
  | "SERVER_ERROR"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "INTERNAL_ERROR";

export type LLMQueryResult =
  | { success: true; content: string }
  | {
      success: false;
      errorCode: DocErrorCode;
      message: string;
      retryable: boolean;
    };

export interface ILLMClient {
  query(prompt: string): Promise<LLMQueryResult>;
}

export interface LLMClientConfig {
  apiKey: string | null | undefined;
  model: string;
  timeoutMs: number;
  maxRetries: number;
}
```

## DI 設計（変更点）

```typescript
// LLMDocQueryAdapter.ts の修正方針
// Before（stub）:
const content = `Generated content for: ${prompt.slice(0, 100)}`;
return { success: true, data: content };

// After（LLMClient 委譲）:
const result = await this.llmClient.query(prompt);
if (result.success) {
  return { success: true, data: result.content };
}
// result.errorCode → DocError へマッピング
```

## エラー正規化設計

`AnthropicProvider` が Anthropic SDK エラーを `DocErrorCode` にマッピングし、
`LLMDocQueryAdapter` が `DocErrorCode` を既存の `DocError`（`@repo/shared`）に変換する。

| DocErrorCode    | DocError.code | category         |
| --------------- | ------------- | ---------------- |
| API_KEY_MISSING | 2001          | BUSINESS         |
| API_KEY_INVALID | 2002          | BUSINESS         |
| RATE_LIMIT      | 3002          | EXTERNAL_SERVICE |
| SERVER_ERROR    | 3003          | EXTERNAL_SERVICE |
| TIMEOUT         | 3001          | EXTERNAL_SERVICE |
| NETWORK_ERROR   | 3004          | EXTERNAL_SERVICE |
| INTERNAL_ERROR  | 5001          | INTERNAL         |

## 型定義配置方針

| 型名                 | 配置                                              | 理由                      |
| -------------------- | ------------------------------------------------- | ------------------------- |
| `DocErrorCode`       | `services/llm/LLMClient.ts`（新規）               | Main Process 内部使用のみ |
| `LLMQueryResult`     | `services/llm/LLMClient.ts`（新規）               | Main Process 内部使用のみ |
| `DocOperationResult` | `@repo/shared`（変更なし）                        | IPC 境界型は維持          |
| `LLMQueryFn`         | `services/skill/SkillDocGenerator.ts`（変更なし） | DI 契約は変更しない       |
