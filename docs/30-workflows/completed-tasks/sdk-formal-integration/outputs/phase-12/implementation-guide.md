# Phase 12: 実装ガイド - Agent SDK 正式統合

## メタ情報

| 項目     | 内容                             |
| -------- | -------------------------------- |
| タスクID | TASK-9B-I-SDK-FORMAL-INTEGRATION |
| Phase    | 12（ドキュメント）               |
| 作成日   | 2026-02-12                       |

---

## Part 1: 概念説明（中学生レベル）

### 「翻訳なしで話す」ということ

プログラミングで外部ライブラリ（SDK）を使うとき、TypeScript は「この関数には何を渡して、何が返ってくるか」を事前にチェックしてくれます。これを**型チェック**と呼びます。

しかし、`as any` というおまじないを書くと、TypeScript に「チェックしなくていいよ」と伝えることになります。これは便利ですが危険です。例えるなら：

- **`as any` あり**: 外国語の手紙を翻訳せずに「多分こう書いてあるでしょう」と推測する
- **`as any` なし**: 外国語の手紙を正確に翻訳してから読む

今回のタスクは、SDK への呼び出しから `as any` を除去し、TypeScript が正しく型チェックできるようにしました。これにより、間違った引数を渡すとコンパイル時にエラーになります。

### 実際に何が変わったか

#### API キーの渡し方

- **前**: `{ apiKey: "sk-..." }` — SDK にこのフィールドは存在しなかった！
- **後**: `{ env: { ANTHROPIC_API_KEY: "sk-..." } }` — SDK が正式にサポートする方法

#### 中断処理

- **前**: `{ signal: abortSignal }` — SDK は `signal` を受け取らない！
- **後**: `{ abortController: abortController }` — SDK が正式にサポートする方法

#### ストリーミング

- **前**: `conversation.stream()` — `.stream()` メソッドは存在しなかった！
- **後**: `conversation` を直接使う — `Query` は `AsyncGenerator` なので直接イテレート可能

---

## Part 2: 開発者向け実装詳細

### 変更概要

`SkillExecutor.ts` の `callSDKQuery()` メソッドから `as any` を除去し、SDK 実型（`@anthropic-ai/claude-agent-sdk@0.2.30`）に準拠した型安全な呼び出しを実現。

### アーキテクチャ

```
execute()
  └── executeWithRetry(abortController: AbortController)
        └── callSDKQuery(prompt, options: SDKQueryOptions)
              └── import("@anthropic-ai/claude-agent-sdk").query()
                    ├── 引数: { prompt, options: SDK.Options }
                    └── 戻り値: Query extends AsyncGenerator<SDKMessage>
```

### 型マッピング

| ローカル型                        | SDK 実型                                   | マッピング                                 |
| --------------------------------- | ------------------------------------------ | ------------------------------------------ |
| `SDKQueryOptions.permissionMode`  | `Options.permissionMode: PermissionMode`   | 直接対応                                   |
| `SDKQueryOptions.abortController` | `Options.abortController: AbortController` | 直接対応                                   |
| `SDKQueryOptions.tools`           | `Options.tools: string[]`                  | 直接対応                                   |
| API キー                          | `Options.env: Record<string, string>`      | `env.ANTHROPIC_API_KEY`                    |
| 戻り値 `AsyncIterable<unknown>`   | `Query extends AsyncGenerator<SDKMessage>` | 緩い型で受け取り、isValidSDKMessage で変換 |

### 設計判断

1. **ローカル SDKMessage 型は維持**: SDK の `SDKMessage` は多数の Union 型。SkillExecutor は `isValidSDKMessage()` 型ガードで `unknown` → ローカル `SDKMessage` に変換する既存パターンを維持。
2. **`callSDKQuery` の戻り値型は `AsyncIterable<unknown>`**: SDK 型と SkillExecutor 内部型の疎結合を維持。
3. **`stream()` ラッパーは維持**: `{ stream: () => conversation }` のインターフェースを維持し、`execute()` の `response.stream()` パターンを変更しない。

### テスト

- テスト数: 278（全PASS）
- 新規テスト: `SkillExecutor.sdk-types.test.ts`（13テスト）
  - TC-001: callSDKQuery の型安全な呼び出し
  - TC-002: モックのシグネチャ検証
  - TC-003: SDKQueryOptions と SDK Options の互換性
  - TC-004: 不正な引数のコンパイルエラー検出
  - TC-005: 必須引数省略のコンパイルエラー検出
  - TC-006: AsyncGenerator ストリーミング検証

### Before/After コード比較

#### callSDKQuery（変更前）

```typescript
private async callSDKQuery(
  prompt: string,
  options: SDKQueryOptions,
): Promise<{ stream: () => AsyncIterable<unknown> }> {
  const apiKey = await this.getApiKey();
  const { query } = (await import("@anthropic-ai/claude-agent-sdk")) as any;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const conversation = query({
    prompt,
    options: {
      apiKey,
      tools: options.tools,
      permissionMode: options.permissionMode,
      signal: options.signal,
    },
  }) as any;
  return {
    stream: () => (conversation as any).stream(),
  };
}
```

#### callSDKQuery（変更後）

```typescript
private async callSDKQuery(
  prompt: string,
  options: SDKQueryOptions,
): Promise<{ stream: () => AsyncIterable<unknown> }> {
  const apiKey = await this.getApiKey();
  const { query } = await import("@anthropic-ai/claude-agent-sdk");
  // TASK-9B-I: SDK query() を型安全に呼び出す（as any 不要）
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
}
```

### エッジケースと注意点

1. **SDK バージョン更新時**: SDK の `Options` 型が変更された場合、`callSDKQuery` のオプション構築部分でコンパイルエラーが発生する。これが型安全化の狙い。
2. **カスタム型宣言ファイルの共存**: `packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts` に `declare module` が存在するが、SDK が `node_modules` にインストールされている場合は TypeScript に無視される（UT-9B-I-001 で整理予定）。
3. **AsyncIterable vs AsyncGenerator**: SDK の `Query` は `AsyncGenerator<SDKMessage, void>` を extends するため、`for-await-of` で直接消費可能。`.stream()` メソッドは存在しない。
4. **AbortController vs AbortSignal**: SDK は `AbortController` 全体を受け取る（`signal` のみではない）。`executeWithRetry` のパラメータも同様に変更された。
5. **env パターン**: SDK は `apiKey` フィールドを持たず、`env: Record<string, string>` で環境変数として API キーを渡す。
