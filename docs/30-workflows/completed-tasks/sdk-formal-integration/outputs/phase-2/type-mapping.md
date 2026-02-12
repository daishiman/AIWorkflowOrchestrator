# Phase 2: 型マッピング - Agent SDK 正式統合

## メタ情報

| 項目     | 内容                             |
| -------- | -------------------------------- |
| タスクID | TASK-9B-I-SDK-FORMAL-INTEGRATION |
| Phase    | 2（設計）                        |
| 作成日   | 2026-02-12                       |
| 作成者   | Claude Agent (Phase 1-3)         |

---

## 1. 型マッピング概要

本ドキュメントは、SDK の実 API シグネチャと型宣言ファイル・SkillExecutor ローカル型定義の対応関係を定義する。

---

## 2. query() 関数のシグネチャマッピング

### 2.1 SDK 実 API

```typescript
// SDK実API（.claude/skills/claude-agent-sdk/references/query-api.md より）
function query({
  prompt,
  options,
}: {
  prompt: string | AsyncIterable<SDKUserMessage>;
  options?: Options;
}): Query;

// Query extends AsyncGenerator<SDKMessage, void>
// conversation.stream() でストリーミング取得
```

### 2.2 型宣言ファイル（変更後）

```typescript
// packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts に追加
export interface QueryFunctionArgs {
  prompt: string; // AsyncIterable は SkillExecutor では不使用のため省略
  options?: QueryFunctionOptions;
}

export interface QueryConversation {
  stream(): AsyncIterable<unknown>; // SDKMessage の詳細型は SkillExecutor ローカル型で処理
}

export function query(args: QueryFunctionArgs): QueryConversation;
```

### 2.3 マッピング表

| SDK実API の要素                                   | 型宣言ファイルの対応             | 簡略化の理由                                                  |
| ------------------------------------------------- | -------------------------------- | ------------------------------------------------------------- |
| `prompt: string \| AsyncIterable<SDKUserMessage>` | `prompt: string`                 | SkillExecutor は文字列プロンプトのみ使用                      |
| `options?: Options`                               | `options?: QueryFunctionOptions` | 既存の `QueryOptions` と名前衝突を避ける                      |
| 戻り値: `Query` (AsyncGenerator)                  | `QueryConversation`              | `.stream()` メソッドのみ使用するため簡略化                    |
| `stream()` の要素型: `SDKMessage` (Union)         | `AsyncIterable<unknown>`         | SkillExecutor 内で独自の型ガード `isValidSDKMessage()` で処理 |

---

## 3. Options のプロパティマッピング

### 3.1 SDK 実 API の Options

```typescript
// SDK実API
interface Options {
  tools?: string[] | ToolConfig;
  permissionMode?: "auto" | "ask" | "deny" | "default";
  signal?: AbortSignal;
  apiKey?: string;
  hooks?: HooksObject;
  permissions?: PermissionsObject;
  provider?: "anthropic" | "bedrock" | "vertex" | "foundry";
  includePartialMessages?: boolean;
  // ... 他のプロパティ
}
```

### 3.2 型宣言ファイルの QueryFunctionOptions

```typescript
export interface QueryFunctionOptions {
  tools?: string[];
  permissionMode?: "auto" | "ask" | "deny" | "default";
  signal?: AbortSignal;
  apiKey?: string;
  timeout?: number;
  hooks?: Record<string, unknown>;
  permissions?: Record<string, unknown>;
}
```

### 3.3 SkillExecutor ローカル SDKQueryOptions

```typescript
// SkillExecutor.ts 内（変更後）
interface SDKQueryOptions {
  tools?: string[];
  permissionMode?: "auto" | "ask" | "deny" | "default"; // 変更
  signal?: AbortSignal;
  timeout?: number;
}
```

### 3.4 プロパティ対応表

| SDK Options プロパティ   | QueryFunctionOptions                     | SDKQueryOptions (ローカル)               | 使用状況                                         |
| ------------------------ | ---------------------------------------- | ---------------------------------------- | ------------------------------------------------ |
| `tools`                  | `string[]`                               | `string[]`                               | callSDKQuery で使用                              |
| `permissionMode`         | `"auto" \| "ask" \| "deny" \| "default"` | `"auto" \| "ask" \| "deny" \| "default"` | callSDKQuery で `"default"` を渡す               |
| `signal`                 | `AbortSignal`                            | `AbortSignal`                            | callSDKQuery で AbortController.signal を渡す    |
| `apiKey`                 | `string`                                 | -                                        | callSDKQuery 内で getApiKey() から取得           |
| `timeout`                | `number`                                 | `number`                                 | ローカル型のみ（SDK Options には直接渡さない）   |
| `hooks`                  | `Record<string, unknown>`                | -                                        | SkillExecutor では未使用（AgentExecutor が使用） |
| `permissions`            | `Record<string, unknown>`                | -                                        | SkillExecutor では未使用（AgentExecutor が使用） |
| `provider`               | -                                        | -                                        | スコープ外                                       |
| `includePartialMessages` | -                                        | -                                        | スコープ外                                       |

---

## 4. SDKMessage のマッピング

### 4.1 SDK 実 API の SDKMessage（Union型）

```typescript
type SDKMessage =
  | SDKAssistantMessage // { type: "assistant", message: APIAssistantMessage }
  | SDKUserMessage // { type: "user", message: APIUserMessage }
  | SDKUserMessageReplay
  | SDKResultMessage // { type: "result", message: APIToolResultMessage }
  | SDKSystemMessage
  | SDKPartialAssistantMessage // { type: "stream_event", event: ... }
  | SDKCompactBoundaryMessage;
```

### 4.2 SkillExecutor ローカル SDKMessage

```typescript
// SkillExecutor.ts 内（変更なし）
interface SDKMessage {
  type?: string;
  content?: string;
  tool_use?: {
    name: string;
    input: unknown;
  };
  error?: {
    message: string;
  };
}
```

### 4.3 マッピング方針

SkillExecutor ローカル `SDKMessage` は **変更しない**。理由:

1. **変換レイヤーとしての機能**: `convertToStreamMessage()` メソッドが SDK の多様なメッセージ形式を内部の `SkillStreamMessage` に変換するため、入力側は緩い型（`unknown` のプロパティアクセス）で十分
2. **`isValidSDKMessage()` 型ガード**: 既存の型ガードが `message !== null && typeof message === "object"` で検証しており、SDK メッセージの詳細構造に依存していない
3. **テスト互換性**: テストモックが SkillExecutor ローカル `SDKMessage` の形式でメッセージを生成している

### 4.4 型宣言での stream() 要素型

型宣言ファイルでは `stream()` の要素型を `unknown` とする:

```typescript
export interface QueryConversation {
  stream(): AsyncIterable<unknown>;
}
```

理由: SkillExecutor は `handleStreamMessage(executionId, message)` で `message: unknown` を受け取り、内部で `isValidSDKMessage()` → `SDKMessage` に変換する。`stream()` の要素型が `unknown` でも既存の処理フローと完全に互換。

---

## 5. 型安全性の境界

### 5.1 型チェックが有効になる範囲

| 箇所                                             | 型チェック | 詳細                                                                              |
| ------------------------------------------------ | ---------- | --------------------------------------------------------------------------------- |
| `import("@anthropic-ai/claude-agent-sdk")`       | 有効       | モジュールの型がカスタム型宣言から解決される                                      |
| `const { query } = ...`                          | 有効       | `query` 関数が `QueryFunctionArgs => QueryConversation` として型付けされる        |
| `query({ prompt, options: { ... } })`            | 有効       | 引数が `QueryFunctionArgs` に対して型チェックされる                               |
| `conversation.stream()`                          | 有効       | 戻り値が `AsyncIterable<unknown>` として型付けされる                              |
| `for await (const message of response.stream())` | 既存通り   | `message` は `unknown` 型（既存の `handleStreamMessage` が `unknown` を受け取る） |

### 5.2 型チェックが効かない範囲（意図的）

| 箇所                                    | 理由                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------ |
| stream メッセージの詳細構造             | ローカル `SDKMessage` + `isValidSDKMessage()` 型ガードで処理             |
| SDK の Hooks オブジェクトの詳細型       | SkillExecutor ではhooksを SDK に渡していない（AgentExecutor のスコープ） |
| SDK の Permissions オブジェクトの詳細型 | 同上                                                                     |

---

## 6. 後方互換性チェックリスト

| 項目                                         | 状態              | 確認方法                                      |
| -------------------------------------------- | ----------------- | --------------------------------------------- |
| ClaudeSDK default export の型が不変          | 維持              | `agent-client.ts` のコンパイル成功            |
| 既存 QueryOptions, QueryMessage 型が不変     | 維持              | 型名を変更しない                              |
| テストモック `{ query: ... }` パターンが有効 | 互換              | 全テスト PASS                                 |
| `callSDKQuery` の戻り値型が不変              | 互換              | `{ stream: () => AsyncIterable<SDKMessage> }` |
| `executeWithRetry` のインターフェースが不変  | 不変              | コード変更なし                                |
| `handleStreamMessage` の引数型が不変         | 不変（`unknown`） | コード変更なし                                |
