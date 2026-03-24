# Phase 2: 設計サマリー - TASK-LLM-MOD-03

## 変更後のクラス設計

```typescript
class GoogleAdapter extends BaseLLMAdapter {
  private formatContents(
    request: LLMChatRequestInput,
  ): Array<{ role: string; parts: Array<{ text: string }> }>;

  private buildRequestBody(
    request: LLMChatRequestInput,
  ): Record<string, unknown>; // 新規追加

  async sendChat(request: LLMChatRequestInput): Promise<AdapterChatResponse>;
  async *streamChat(
    request: LLMChatRequestInput,
    signal?: AbortSignal,
  ): AsyncGenerator<StreamChunk>;
}
```

## 変更概要

### Task 2-2: formatContents リファクタリング

- systemPrompt の `user` ロール挿入ロジックを削除
- `request.messages` のみをマッピングする純粋関数に変更

### Task 2-3: buildRequestBody 新規追加

- 戻り値型: `Record<string, unknown>`（条件付きフィールドのため）
- `contents`: `this.formatContents(request)` の結果
- `generationConfig`: `temperature`, `maxOutputTokens`
- `system_instruction`: `request.systemPrompt` が truthy な場合のみ追加

### Task 2-4: sendChat / streamChat 更新

- インラインのボディ構築を `JSON.stringify(this.buildRequestBody(request))` に置換

### Task 2-5: baseUrl 変更

- `v1` -> `v1beta`（`system_instruction` の確実なサポートのため）

### Task 2-6: IPC 影響なし

- `buildRequestBody` は `private`、外部シグネチャ変更なし

## 完了条件

- [x] 変更前後のクラス設計が明記されている
- [x] `formatContents` の変更内容が明確
- [x] `buildRequestBody` の完全な実装コードが記述されている
- [x] `sendChat` / `streamChat` の変更差分が明確
- [x] `baseUrl` 変更の根拠が記録されている
- [x] 型安全性の設計判断が記録されている
- [x] IPC ハンドラへの影響がないことが確認されている
- [x] 本Phase内の全タスクを100%実行完了
