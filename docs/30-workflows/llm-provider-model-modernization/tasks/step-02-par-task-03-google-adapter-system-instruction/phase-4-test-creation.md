# Phase 4: テスト作成 - GoogleAdapter system_instruction 対応（TDD: Red）

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 4                                 |
| 機能名   | google-adapter-system-instruction |
| 作成日   | 2026-03-23                        |
| タスクID | TASK-LLM-MOD-03                   |
| 依存     | phase-3-design-review.md          |

## 目的

TDD の Red フェーズとして、実装前に失敗するテストケースを設計・追加し、Phase 5 の実装完了後に Green になることを目標とする。

## 実行タスク

### Task 4-1: 既存テストの MSW モック URL 更新

`baseUrl` が `v1` から `v1beta` に変更されるため、既存テストの全 MSW モック URL を更新する。

**対象ファイル**: `apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts`

**変更内容**: 以下のパターンを全件置換する。

```
変更前: https://generativelanguage.googleapis.com/v1/models/...
変更後: https://generativelanguage.googleapis.com/v1beta/models/...

変更前: https://generativelanguage.googleapis.com/v1/models
変更後: https://generativelanguage.googleapis.com/v1beta/models
```

**影響するモック URL 箇所**:

- `ADP-011: sendChat正常` - `http.post` の URL (2箇所)
- `ADP-012: リクエスト形式変換` - `http.post` の URL (3箇所)
- `Error Mapping` - `http.post` の URL (4箇所)
- `streamChat` - `http.post` の URL (1箇所)
- `checkHealth` - `http.get` の URL (1箇所)

**実行コマンド**:

```bash
# 確認
grep -n "googleapis.com/v1/" \
  apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts

# 置換後に全件 v1beta になっていることを確認
grep -c "googleapis.com/v1beta/" \
  apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts
```

### Task 4-2: 既存テスト「systemPrompt を user メッセージとして追加」の更新

既存テスト `"should prepend systemPrompt as user message"` は変更後の動作と逆の期待値を持つため、`system_instruction` フィールドを検証するテストに置き換える。

**変更前（削除）**:

```typescript
it("should prepend systemPrompt as user message", async () => {
  // ...
  expect(capturedBody.contents).toEqual([
    {
      role: "user",
      parts: [{ text: "System: You are a helpful assistant." }],
    },
    { role: "user", parts: [{ text: "Hello" }] },
  ]);
});
```

**変更後（置換）** - テストID: `ADP-012-SI-01`:

```typescript
it("should send systemPrompt as system_instruction field", async () => {
  let capturedBody: Record<string, unknown> = {};
  // MSW モック（v1beta URL）
  server.use(
    http.post(
      "https://generativelanguage.googleapis.com/v1beta/models/*",
      async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          candidates: [
            {
              content: { parts: [{ text: "Response" }] },
              finishReason: "STOP",
            },
          ],
          usageMetadata: {
            promptTokenCount: 10,
            candidatesTokenCount: 5,
            totalTokenCount: 15,
          },
        });
      },
    ),
  );

  const request: LLMChatRequestInput = {
    providerId: "google",
    modelId: "gemini-2.5-flash",
    messages: [{ role: "user", content: "Hello" }],
    systemPrompt: "You are a helpful assistant.",
  };

  await adapter.sendChat(request);

  // system_instruction フィールドが設定されていること
  expect(capturedBody.system_instruction).toEqual({
    parts: [{ text: "You are a helpful assistant." }],
  });
  // contents に systemPrompt が含まれないこと
  expect(capturedBody.contents).toEqual([
    { role: "user", parts: [{ text: "Hello" }] },
  ]);
});
```

### Task 4-3: systemPrompt なし時の system_instruction 省略テスト追加

**テストID**: `ADP-012-SI-02`

```typescript
it("should omit system_instruction when systemPrompt is not provided", async () => {
  let capturedBody: Record<string, unknown> = {};
  server.use(
    http.post(
      "https://generativelanguage.googleapis.com/v1beta/models/*",
      async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          candidates: [
            {
              content: { parts: [{ text: "Response" }] },
              finishReason: "STOP",
            },
          ],
          usageMetadata: {
            promptTokenCount: 5,
            candidatesTokenCount: 5,
            totalTokenCount: 10,
          },
        });
      },
    ),
  );

  const request: LLMChatRequestInput = {
    providerId: "google",
    modelId: "gemini-2.5-flash",
    messages: [{ role: "user", content: "Hello" }],
    // systemPrompt なし
  };

  await adapter.sendChat(request);

  // system_instruction フィールドが存在しないこと
  expect(capturedBody.system_instruction).toBeUndefined();
  // contents は通常通り設定されていること
  expect(capturedBody.contents).toEqual([
    { role: "user", parts: [{ text: "Hello" }] },
  ]);
});
```

### Task 4-4: buildRequestBody 単体テスト追加

`buildRequestBody` は `private` メソッドのため、テストは `sendChat` 経由で実施する（MSW でリクエストボディをキャプチャする方式を採用）。なお、`buildRequestBody` 自体を直接テストしたい場合は `(adapter as unknown as { buildRequestBody: (r: LLMChatRequestInput) => Record<string, unknown> }).buildRequestBody(request)` でアクセス可能だが、推奨しない（実装詳細に依存するため）。代わりに以下の統合テストで検証する。

**テストID**: `ADP-012-SI-03` - `buildRequestBody` が `generationConfig` を正しく設定する:

```typescript
it("should include temperature and maxOutputTokens in generationConfig with systemPrompt", async () => {
  let capturedBody: Record<string, unknown> = {};
  server.use(
    http.post(
      "https://generativelanguage.googleapis.com/v1beta/models/*",
      async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          candidates: [
            {
              content: { parts: [{ text: "Response" }] },
              finishReason: "STOP",
            },
          ],
          usageMetadata: {
            promptTokenCount: 5,
            candidatesTokenCount: 5,
            totalTokenCount: 10,
          },
        });
      },
    ),
  );

  const request: LLMChatRequestInput = {
    providerId: "google",
    modelId: "gemini-2.5-flash",
    messages: [{ role: "user", content: "Test" }],
    systemPrompt: "Be concise.",
    temperature: 0.5,
    maxTokens: 512,
  };

  await adapter.sendChat(request);

  expect(capturedBody.system_instruction).toEqual({
    parts: [{ text: "Be concise." }],
  });
  expect(capturedBody.generationConfig).toMatchObject({
    temperature: 0.5,
    maxOutputTokens: 512,
  });
});
```

### Task 4-5: streamChat での system_instruction 送信テスト追加

**テストID**: `ADP-STREAM-SI-01`:

```typescript
it("should send system_instruction in streamChat", async () => {
  let capturedBody: Record<string, unknown> = {};
  server.use(
    http.post(
      "https://generativelanguage.googleapis.com/v1beta/models/*",
      async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(
              encoder.encode(
                'data: {"candidates":[{"content":{"parts":[{"text":"Hi"}]},"finishReason":"STOP"}]}\n\n',
              ),
            );
            controller.close();
          },
        });
        return new HttpResponse(stream, {
          headers: { "Content-Type": "text/event-stream" },
        });
      },
    ),
  );

  const request: LLMChatRequestInput = {
    providerId: "google",
    modelId: "gemini-2.5-flash",
    messages: [{ role: "user", content: "Hi" }],
    systemPrompt: "You are concise.",
    stream: true,
  };

  const chunks = [];
  for await (const chunk of adapter.streamChat(request)) {
    chunks.push(chunk);
  }

  expect(capturedBody.system_instruction).toEqual({
    parts: [{ text: "You are concise." }],
  });
  expect(chunks.length).toBeGreaterThan(0);
});
```

### Task 4-6: Red 確認手順

Phase 4 完了後、Phase 5 実装前に以下のコマンドで失敗状態（Red）を確認する。

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/GoogleAdapter.test.ts
```

**期待する失敗**:

- URL 更新テスト: `v1` → `v1beta` 変更前のため全モック URL ミスマッチ
- `ADP-012-SI-01`: `capturedBody.system_instruction` が `undefined` (現実装は `contents` に埋め込み)
- `ADP-012-SI-02`: `capturedBody.system_instruction` が `undefined` のはずだが、現実装は `contents` に不要な挿入をするため `contents` 検証が失敗
- `ADP-STREAM-SI-01`: `capturedBody.system_instruction` が `undefined`

## 参照資料

| 資料名       | パス                                                                 | 内容                          |
| ------------ | -------------------------------------------------------------------- | ----------------------------- |
| 設計書       | `phase-2-design.md`                                                  | `buildRequestBody` の実装仕様 |
| 設計レビュー | `phase-3-design-review.md`                                           | 既存テスト影響分析            |
| 現行テスト   | `apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts` | 既存テストケース              |

## 成果物

| 成果物                 | パス                                                                 | 説明                        |
| ---------------------- | -------------------------------------------------------------------- | --------------------------- |
| 更新済みテストファイル | `apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts` | MSW URL更新・新規テスト追加 |

## 完了条件

- [ ] 全 MSW モック URL が `v1beta` に更新されている
- [ ] `"should prepend systemPrompt as user message"` が `"should send systemPrompt as system_instruction field"` に置換されている
- [ ] `ADP-012-SI-02`（systemPrompt なし時の省略テスト）が追加されている
- [ ] `ADP-012-SI-03`（buildRequestBody の generationConfig テスト）が追加されている
- [ ] `ADP-STREAM-SI-01`（streamChat での system_instruction テスト）が追加されている
- [ ] Phase 5 実装前にテストが Red であることを確認済み（`pnpm vitest run` で失敗を確認）

## 統合テスト連携

本 Phase で追加するテストは Task04（step-03 のテスト更新）の前提となる。Task04 はこれらのテストが Green になった後に期待値の最終整合確認を行う。

## 次のPhase

Phase 5: 実装（TDD: Green）
