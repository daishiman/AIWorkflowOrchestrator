# Phase 5: 実装結果 - TASK-LLM-MOD-03

## 実施内容

### Task 5-2: baseUrl デフォルト値変更

```
変更前: https://generativelanguage.googleapis.com/v1
変更後: https://generativelanguage.googleapis.com/v1beta
```

### Task 5-3: formatContents リファクタリング

systemPrompt の `user` ロール挿入ロジックを削除し、`request.messages` のみをマッピングする純粋関数に変更。

### Task 5-4: buildRequestBody メソッド追加

```typescript
private buildRequestBody(
  request: LLMChatRequestInput,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    contents: this.formatContents(request),
    generationConfig: {
      temperature: request.temperature,
      maxOutputTokens: request.maxTokens,
    },
  };
  if (request.systemPrompt?.trim()) {
    body.system_instruction = {
      parts: [{ text: request.systemPrompt }],
    };
  }
  return body;
}
```

### Task 5-5: sendChat 更新

`body: JSON.stringify(this.buildRequestBody(request))` に変更。

### Task 5-6: streamChat 更新

`body: JSON.stringify(this.buildRequestBody(request))` に変更。

### Task 5-7: Green 確認

```
Test Files  1 passed (1)
      Tests  15 passed (15)
   Duration  765ms
```

全 15 テスト PASS。

## 成果物

- `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts` 更新済み

## 完了条件

- [x] `baseUrl` のデフォルト値が `v1beta` に変更されている
- [x] `formatContents` から systemPrompt 挿入ロジックが削除されている
- [x] `buildRequestBody` メソッドが追加されている
- [x] `sendChat` が `buildRequestBody` を使用している
- [x] `streamChat` が `buildRequestBody` を使用している
- [x] `pnpm vitest run` で全テストが PASS している
- [x] 本Phase内の全タスクを100%実行完了
