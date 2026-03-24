# 実装ガイド Part 2: 開発者向け技術詳細 -- TASK-LLM-MOD-02

## 変更概要

**変更対象**: `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts` L207

**変更内容**:

```typescript
// 変更前
model: "claude-3-haiku-20240307", // 最安モデル

// 変更後
model: "claude-haiku-4-5", // 最安・最速モデル
```

## checkHealth メソッドの仕様

`checkHealth` メソッドは Anthropic Messages API（`POST https://api.anthropic.com/v1/messages`）に最小リクエストを送信し、API キーとネットワーク接続の疎通を確認する。

| パラメータ          | 値                                  | 変更要否 |
| ------------------- | ----------------------------------- | -------- |
| `model`             | `claude-haiku-4-5`（変更後）        | 変更     |
| `messages`          | `[{ role: "user", content: "Hi" }]` | 変更なし |
| `max_tokens`        | `1`（最小トークンで最低限の応答）   | 変更なし |
| `anthropic-version` | `2023-06-01`                        | 変更なし |
| リトライ            | `0`（ヘルスチェックはリトライなし） | 変更なし |

## 新規追加テスト HC-001

```typescript
// apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts
it("should use claude-haiku-4-5 as health check model", async () => {
  let capturedBody: Record<string, unknown> = {};
  server.use(
    http.post("https://api.anthropic.com/v1/messages", async ({ request }) => {
      capturedBody = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({
        content: [{ type: "text", text: "pong" }],
        usage: { input_tokens: 1, output_tokens: 1 },
      });
    }),
  );
  await adapter.checkHealth();
  expect(capturedBody.model).toBe("claude-haiku-4-5");
});
```

## 技術的注意点

- `sendChat` / `streamChat` のモデルIDはリクエスト送信元（Renderer）から注入される。本変更は `checkHealth` 専用モデルのみに影響する
- `inferProviderId` の `claude-` プレフィックスパターンは `claude-haiku-4-5` にも適用されるため変更不要
