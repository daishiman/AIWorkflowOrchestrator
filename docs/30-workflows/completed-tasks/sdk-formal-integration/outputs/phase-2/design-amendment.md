# Phase 2: 設計補遺 - SDK 実インストール発見に伴う設計修正

## メタ情報

| 項目     | 内容                             |
| -------- | -------------------------------- |
| タスクID | TASK-9B-I-SDK-FORMAL-INTEGRATION |
| Phase    | 2（設計補遺）                    |
| 作成日   | 2026-02-12                       |
| 作成者   | Claude Agent (Phase 5 実装中)    |

---

## 1. 設計前提の修正

### 1.1 発見事実

Phase 2 の設計は「SDK が node_modules にインストールされていない」という前提に基づいていたが、
実装フェーズで以下の事実が判明した：

- `@anthropic-ai/claude-agent-sdk@0.2.30` が `apps/desktop/node_modules/` にインストール済み
- pnpm グローバルストア経由でリンクされている
- TypeScript は `sdk.d.ts`（実パッケージの型定義）を優先的に解決し、カスタム `declare module` を無視する

### 1.2 影響範囲

| Phase 2 の設計項目            | 影響             | 修正内容                                                                   |
| ----------------------------- | ---------------- | -------------------------------------------------------------------------- |
| 方式A「型宣言ファイル拡張」   | 無効化           | SDK 実型が使用されるため、カスタム declare module は不要（既存の維持のみ） |
| パターン2「型アノテーション」 | 有効（修正あり） | `as any` 除去は同様だが、型は SDK 実型に合わせる必要あり                   |
| SDKQueryOptions ローカル型    | 修正必要         | permissionMode を SDK 実 API に合わせる                                    |

---

## 2. SDK 実 API に基づく修正設計

### 2.1 callSDKQuery メソッドの変更

#### 変更前（as any あり）

```typescript
const { query } = (await import("@anthropic-ai/claude-agent-sdk")) as any;
const conversation = query({
  prompt,
  options: {
    apiKey,
    tools: options.tools,
    permissionMode: options.permissionMode,
    signal: options.signal,
  },
});
return {
  stream: () => conversation.stream(),
};
```

#### 変更後（型安全）

```typescript
const { query } = await import("@anthropic-ai/claude-agent-sdk");
const conversation = query({
  prompt,
  options: {
    env: { ANTHROPIC_API_KEY: apiKey },
    tools: options.tools,
    permissionMode: options.permissionMode,
    abortController: options.abortController,
  },
});
return {
  stream: () => conversation,
};
```

### 2.2 変更点の詳細

| 項目                    | 変更前                                       | 変更後                                                                                   | 理由                                                        |
| ----------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `as any`                | あり                                         | 除去                                                                                     | SDK 実型で型推論が効く                                      |
| `apiKey`                | `options.apiKey` で直接渡す                  | `env: { ANTHROPIC_API_KEY: apiKey }`                                                     | SDK Options に `apiKey` フィールドなし                      |
| `signal`                | `signal: AbortSignal`                        | `abortController: AbortController`                                                       | SDK は `AbortController` を受け取る                         |
| `conversation.stream()` | `.stream()` 経由                             | `conversation` 直接返却                                                                  | `Query extends AsyncGenerator` — Query 自体が AsyncIterable |
| `permissionMode`        | `"default" \| "plan" \| "bypassPermissions"` | `"default" \| "acceptEdits" \| "bypassPermissions" \| "plan" \| "delegate" \| "dontAsk"` | SDK 実 PermissionMode に合わせる                            |

### 2.3 SDKQueryOptions ローカル型の修正

```typescript
// 変更後
interface SDKQueryOptions {
  tools?: string[];
  permissionMode?:
    | "default"
    | "acceptEdits"
    | "bypassPermissions"
    | "plan"
    | "delegate"
    | "dontAsk";
  abortController?: AbortController;
  timeout?: number;
}
```

### 2.4 callSDKQuery の戻り値型

```typescript
// 変更なし（stream() のインターフェースを維持）
Promise<{ stream: () => AsyncIterable<SDKMessage> }>;
```

`conversation` (Query) は `AsyncGenerator<SDKMessage, void>` を extends するため、
`AsyncIterable<SDKMessage>` に割り当て可能。しかし `SDKMessage`（SDK型）と
`SDKMessage`（ローカル型）は異なるため、戻り値型は `AsyncIterable<unknown>` に変更が必要。

最終的な戻り値型:

```typescript
Promise<{ stream: () => AsyncIterable<unknown> }>;
```

### 2.5 executeWithRetry の呼び出し修正

```typescript
// 変更前
signal: abortSignal,

// 変更後（AbortController を渡す）
abortController: abortController,  // execute() 内の abortController を直接渡す
```

---

## 3. 型宣言ファイルの扱い

### 3.1 `@anthropic-ai-claude-agent-sdk.d.ts`

SDK が実際にインストールされているため、このファイルの `declare module` は TypeScript に無視される。

**方針**: Phase 2 で追加した `QueryFunctionOptions` 等の型定義を**元に戻す**（Phase 2 追加分を除去）。
既存の `ClaudeSDK` default export 関連の型定義は `agent-client.ts` 用に維持する。

### 3.2 テストモック

`apps/desktop/src/test/__mocks__/@anthropic-ai/claude-agent-sdk.ts` のモックは
Vitest `vi.mock` 経由で使用されるため、SDK 型定義とは独立。
ただし、`query()` のモック構造は `callSDKQuery` の利用パターンに合わせる。

---

## 4. 後方互換性

| 項目                               | 互換性   | 詳細                                  |
| ---------------------------------- | -------- | ------------------------------------- |
| `execute()` の公開インターフェース | 維持     | 引数・戻り値型は変更なし              |
| `executeWithRetry`                 | 内部修正 | `signal` → `abortController` のみ     |
| `callSDKQuery`                     | 内部修正 | SDK 実 API に合わせた型安全な呼び出し |
| `handleStreamMessage`              | 変更なし | `unknown` を受け取る既存設計          |
| 全既存テスト                       | 互換     | vi.mock により SDK 型変更の影響なし   |
