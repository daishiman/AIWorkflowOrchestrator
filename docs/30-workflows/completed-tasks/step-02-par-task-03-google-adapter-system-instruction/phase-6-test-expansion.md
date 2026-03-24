# Phase 6: テスト拡充 - GoogleAdapter system_instruction 対応

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 6                                 |
| 機能名   | google-adapter-system-instruction |
| 作成日   | 2026-03-23                        |
| タスクID | TASK-LLM-MOD-03                   |
| 依存     | phase-5-implementation.md         |

## 目的

Phase 5 の実装完了後にカバレッジ不足箇所を特定し、境界値・異常系テストを追加してカバレッジ基準（Line: 80%以上、Branch: 60%以上、Function: 80%以上）を満たす。

## 実行タスク

### Task 6-1: カバレッジ計測

```bash
cd apps/desktop && pnpm vitest run --coverage \
  src/main/adapters/llm/__tests__/GoogleAdapter.test.ts \
  src/main/adapters/llm/GoogleAdapter.ts
```

**確認ポイント**:

- `GoogleAdapter.ts` の Line Coverage が 80% 以上
- `GoogleAdapter.ts` の Branch Coverage が 60% 以上
- `GoogleAdapter.ts` の Function Coverage が 80% 以上

### Task 6-2: カバレッジ不足箇所の分析

Phase 5 完了時点で未カバーが予想される箇所:

| 箇所                                                                          | 理由                                                                           | 追加テストの方針           |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------- |
| `buildRequestBody` の `system_instruction` なしパス（`if` の false ブランチ） | Phase 4 で `ADP-012-SI-02` を追加済みだが Branch coverage カウントの確認が必要 | 既存テストで充足するか確認 |
| `formatContents` の `assistant` → `model` ロール変換                          | 既存テスト `ADP-012` で対応済み                                                | 確認のみ                   |
| `streamChat` の `for await` ループ内の `catch` ブロック（JSONパースエラー）   | ストリームに不正 JSON を流すテストが未存在                                     | Task 6-3 で追加            |
| `checkHealth` の `catch` ブロック（エラー時）                                 | エラーケースのテストが未存在                                                   | Task 6-3 で追加            |

### Task 6-3: 追加テストケース

#### テスト T6-01: streamChat での不正 JSON チャンク無視

```typescript
it("should ignore invalid JSON chunks in streamChat", async () => {
  server.use(
    http.post(
      "https://generativelanguage.googleapis.com/v1beta/models/*",
      () => {
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode("data: INVALID_JSON\n\n"));
            controller.enqueue(
              encoder.encode(
                'data: {"candidates":[{"content":{"parts":[{"text":"Valid chunk"}]}}]}\n\n',
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
    stream: true,
  };

  const chunks = [];
  // 不正 JSON によるエラーが throw されないこと
  for await (const chunk of adapter.streamChat(request)) {
    chunks.push(chunk);
  }

  // 不正 JSON は無視され、有効なチャンクのみ yield されること
  expect(chunks.length).toBe(1);
  expect(chunks[0].delta.content).toBe("Valid chunk");
});
```

#### テスト T6-02: checkHealth エラー時の error ステータス返却

```typescript
it("should return error status when health check fails", async () => {
  server.use(
    http.get("https://generativelanguage.googleapis.com/v1beta/models", () => {
      return HttpResponse.json(
        { error: { message: "Service unavailable" } },
        { status: 503 },
      );
    }),
  );

  const result = await adapter.checkHealth();

  expect(result.status).toBe("error");
  expect(result.providerId).toBe("google");
  expect(result.errorMessage).toBeDefined();
  expect(result.checkedAt).toBeInstanceOf(Date);
});
```

#### テスト T6-03: systemPrompt が空文字列の場合の動作確認

空文字列は falsy なので `system_instruction` が設定されないことを確認する。

```typescript
it("should omit system_instruction when systemPrompt is empty string", async () => {
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
    systemPrompt: "", // 空文字列
  };

  await adapter.sendChat(request);

  // 空文字列は falsy なので system_instruction が設定されないこと
  expect(capturedBody.system_instruction).toBeUndefined();
});
```

### Task 6-4: カバレッジ再計測

追加テスト後にカバレッジが基準を満たしているか確認する。

```bash
cd apps/desktop && pnpm vitest run --coverage \
  src/main/adapters/llm/__tests__/GoogleAdapter.test.ts \
  src/main/adapters/llm/GoogleAdapter.ts
```

**達成基準**:

- Line Coverage: 80% 以上
- Branch Coverage: 60% 以上（`if (request.systemPrompt)` の両ブランチが実行されること）
- Function Coverage: 80% 以上（`formatContents`、`buildRequestBody`、`sendChat`、`streamChat`、`checkHealth` が全てカバー）

## 参照資料

| 資料名           | パス                               | 内容                           |
| ---------------- | ---------------------------------- | ------------------------------ |
| テスト作成       | `phase-4-test-creation.md`         | Phase 4 で追加したテストケース |
| コード品質ルール | `.claude/rules/02-code-quality.md` | カバレッジ基準                 |

## 統合テスト連携

カバレッジが基準を満たさない場合は、Phase 7 の判定が「未達」になり Phase 6 に戻る。追加テストは Task04（step-03 のテスト更新）でも参照されるため、正確なテストコードを維持すること。

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |

## 成果物

| 成果物                 | パス                                                                 | 説明                  |
| ---------------------- | -------------------------------------------------------------------- | --------------------- |
| 拡充済みテストファイル | `apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts` | T6-01〜T6-03 追加済み |

## 完了条件

- [ ] カバレッジ計測を実行し結果を記録している
- [ ] T6-01（streamChat 不正 JSON 無視テスト）が追加されている
- [ ] T6-02（checkHealth エラーステータステスト）が追加されている
- [ ] T6-03（systemPrompt 空文字列テスト）が追加されている
- [ ] 全追加テストが PASS している
- [ ] Line Coverage 80% 以上を達成している
- [ ] Branch Coverage 60% 以上を達成している
- [ ] Function Coverage 80% 以上を達成している
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 7: カバレッジ確認
