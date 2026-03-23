# Task03: GoogleAdapter system_instruction 対応

## メタ情報

| 項目         | 値                               |
| ------------ | -------------------------------- |
| タスクID     | TASK-LLM-MOD-03                  |
| 責務         | Adapter lane                     |
| 実行順序     | step-02-par（Task02 と並列可能） |
| 依存先       | Task01                           |
| ブロック対象 | Task04                           |

## 目的

GoogleAdapter の systemPrompt 処理を、`user` ロールへの埋め込みワークアラウンドから、Gemini API の正式な `system_instruction` フィールドに移行する。

## 対象ファイル

| ファイル                                              | 変更内容                                                                                |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts` | `formatContents` メソッドリファクタリング、`system_instruction` 対応、APIバージョン検討 |

## 実行タスク

### Task 3-1: formatContents から systemPrompt を分離

現在の `formatContents` は systemPrompt を `user` ロールに埋め込んでいる。これを分離し、`contents` には会話メッセージのみを含めるようにする。

```typescript
// 現在
private formatContents(request: LLMChatRequestInput) {
  const contents = [];
  if (request.systemPrompt) {
    contents.push({ role: "user", parts: [{ text: `System: ${request.systemPrompt}` }] });
  }
  contents.push(...request.messages.map(...));
  return contents;
}

// 改善後
private formatContents(request: LLMChatRequestInput) {
  return request.messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}
```

### Task 3-2: buildRequestBody メソッド追加

リクエストボディ構築を共通化するメソッドを追加する。

```typescript
private buildRequestBody(request: LLMChatRequestInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    contents: this.formatContents(request),
    generationConfig: {
      temperature: request.temperature,
      maxOutputTokens: request.maxTokens,
    },
  };

  if (request.systemPrompt) {
    body.system_instruction = {
      parts: [{ text: request.systemPrompt }],
    };
  }

  return body;
}
```

### Task 3-3: sendChat / streamChat のリクエストボディ更新

`sendChat` と `streamChat` で `buildRequestBody` を使用する。

### Task 3-4: APIバージョン検討

`v1` で `system_instruction` が使用可能か確認し、不可能な場合は `v1beta` に切り替える。

| 判断                                | 対応                       |
| ----------------------------------- | -------------------------- |
| v1 で system_instruction が使える   | baseUrl 変更なし           |
| v1 で system_instruction が使えない | baseUrl を `v1beta` に変更 |

## 参照資料

- [research/google-models.md](../../research/google-models.md)

## 完了条件

- [ ] systemPrompt が `system_instruction` フィールドで送信される
- [ ] systemPrompt なしの場合に `system_instruction` フィールドが省略される
- [ ] `sendChat` / `streamChat` 両方で正しく動作する
- [ ] TypeScript コンパイルが通る
