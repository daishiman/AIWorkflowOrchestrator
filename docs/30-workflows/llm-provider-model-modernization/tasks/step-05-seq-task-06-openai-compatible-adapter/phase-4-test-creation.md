# Phase 4: テスト作成（TDD: Red）-- OpenAICompatibleAdapter 統一アーキテクチャ実装

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase番号  | 4                         |
| 機能名     | openai-compatible-adapter |
| タスクID   | TASK-LLM-MOD-06           |
| 作成日     | 2026-03-23                |
| 依存 Phase | Phase 3（設計レビュー）   |

## 目的

Phase 2 の設計に基づき、`OpenAICompatibleAdapter` と `LLMAdapterFactory` の設定駆動化に対するテストコードを作成する（TDD: Red フェーズ）。テストファイルは `apps/desktop/src/main/adapters/llm/__tests__/OpenAICompatibleAdapter.test.ts` に新規作成する。

## 実行タスク

### Task 4-1: テストファイルの配置確認

テストファイルの配置先を確認する:

- 新規: `apps/desktop/src/main/adapters/llm/__tests__/OpenAICompatibleAdapter.test.ts`
- 既存テスト参照: `apps/desktop/src/main/adapters/llm/__tests__/` 配下の既存ファイル（import パス確認用、P63 対策）

### Task 4-2: テストケース設計

#### テストブロック T-01: OpenAICompatibleAdapter コンストラクタ

```typescript
describe("OpenAICompatibleAdapter", () => {
  describe("T-01: コンストラクタ", () => {
    it("should set providerId from providerConfig", () => {
      const adapter = new OpenAICompatibleAdapter(
        { providerId: "openai", defaultBaseUrl: "https://api.openai.com/v1" },
        "test-api-key",
      );
      expect(adapter.providerId).toBe("openai");
    });

    it("should use defaultBaseUrl when config.baseUrl is not provided", () => {
      // baseUrl は private のため、sendChat のリクエスト URL で間接検証
    });

    it("should override baseUrl when config.baseUrl is provided", () => {
      // config.baseUrl を指定し、sendChat のリクエスト URL で間接検証
    });

    it("should set empty extraHeaders when not provided", () => {
      // extraHeaders なしの場合、リクエストヘッダーに追加ヘッダーがないことを検証
    });

    it("should set extraHeaders from providerConfig", () => {
      // OpenRouter 設定で extraHeaders が含まれることを検証
    });
  });
});
```

#### テストブロック T-02: sendChat

```typescript
describe("T-02: sendChat", () => {
  it("should send POST to /chat/completions with correct headers", async () => {
    // fetchWithRetry のモックで URL とヘッダーを検証
  });

  it("should include extraHeaders in request", async () => {
    // OpenRouter 設定で HTTP-Referer, X-Title がヘッダーに含まれることを検証
  });

  it("should return AdapterChatResponse with correct fields", async () => {
    // content, model, usage, finishReason の変換を検証
  });

  it("should propagate LLM errors without wrapping", async () => {
    // isLLMError が true の場合、エラーがそのまま throw されることを検証
  });

  it("should wrap network errors via handleNetworkError", async () => {
    // isLLMError が false の場合、handleNetworkError で変換されることを検証
  });
});
```

#### テストブロック T-03: streamChat

```typescript
describe("T-03: streamChat", () => {
  it("should send POST to /chat/completions with stream: true", async () => {
    // fetchSSE のモックで stream: true がボディに含まれることを検証
  });

  it("should yield StreamChunk for each SSE data", async () => {
    // SSE データを複数返し、各チャンクが正しく変換されることを検証
  });

  it("should set done: true when finish_reason is not null", async () => {
    // finish_reason: "stop" のチャンクで done: true を検証
  });

  it("should ignore JSON parse errors in stream", async () => {
    // 不正な JSON が含まれても例外が発生しないことを検証
  });
});
```

#### テストブロック T-04: checkHealth

```typescript
describe("T-04: checkHealth", () => {
  it("should send GET to /models with auth header", async () => {
    // fetchWithRetry のモックで URL とメソッドを検証
  });

  it("should return connected status on success", async () => {
    // 成功時の status, providerId, latency, checkedAt を検証
  });

  it("should return error status on failure", async () => {
    // 失敗時の status, providerId, errorMessage, checkedAt を検証
  });

  it("should not retry on health check (retries = 0)", async () => {
    // fetchWithRetry の第3引数が 0 であることを検証
  });
});
```

#### テストブロック T-05: formatMessages

```typescript
describe("T-05: formatMessages（sendChat 経由の間接検証）", () => {
  it("should include system message when systemPrompt is provided", async () => {
    // systemPrompt を含むリクエストで、messages の先頭に system ロールが含まれることを検証
  });

  it("should not include system message when systemPrompt is absent", async () => {
    // systemPrompt なしのリクエストで、system ロールが含まれないことを検証
  });

  it("should convert messages to {role, content} format", async () => {
    // user/assistant メッセージが正しく変換されることを検証
  });
});
```

#### テストブロック T-06: LLMAdapterFactory 設定駆動化

```typescript
describe("T-06: LLMAdapterFactory 設定駆動化", () => {
  it("should register openai as OpenAICompatibleAdapter", async () => {
    // getAdapter("openai") が OpenAICompatibleAdapter インスタンスを返すことを検証
  });

  it("should register xai as OpenAICompatibleAdapter", async () => {
    // getAdapter("xai") が OpenAICompatibleAdapter インスタンスを返すことを検証
  });

  it("should register openrouter as OpenAICompatibleAdapter", async () => {
    // getAdapter("openrouter") が OpenAICompatibleAdapter インスタンスを返すことを検証
  });

  it("should register anthropic as AnthropicAdapter", async () => {
    // getAdapter("anthropic") が AnthropicAdapter インスタンスを返すことを検証
  });

  it("should register google as GoogleAdapter", async () => {
    // getAdapter("google") が GoogleAdapter インスタンスを返すことを検証
  });

  it("should return all 5 provider IDs", () => {
    // getAllProviderIds() が ["openai", "anthropic", "google", "xai", "openrouter"] を返すことを検証
  });
});
```

### Task 4-3: テスト実行確認

テスト追加後に以下を実行する:

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/OpenAICompatibleAdapter.test.ts
```

## 参照資料

| 資料名             | パス                                                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計       | `docs/30-workflows/llm-provider-model-modernization/tasks/step-05-seq-task-06-openai-compatible-adapter/phase-2-design.md` |
| ILLMAdapter        | `apps/desktop/src/main/adapters/llm/types.ts`                                                                              |
| 既存テスト参照     | `apps/desktop/src/main/adapters/llm/__tests__/`（既存テストの import パス確認）                                            |
| 既知の落とし穴 P63 | `.claude/rules/06-known-pitfalls.md`（サブエージェントのインポートパス誤り）                                               |

## 成果物

| 成果物                 | パス                                                                           | 形式       |
| ---------------------- | ------------------------------------------------------------------------------ | ---------- |
| テストファイル（新規） | `apps/desktop/src/main/adapters/llm/__tests__/OpenAICompatibleAdapter.test.ts` | TypeScript |

## 完了条件

- [x] テストファイルの配置先を確認した
- [x] 既存テストの import パスを参照した（P63 対策）
- [x] T-01（コンストラクタ）: 5 テストケースを作成した
- [x] T-02（sendChat）: 5 テストケースを作成した
- [x] T-03（streamChat）: 4 テストケースを作成した
- [x] T-04（checkHealth）: 4 テストケースを作成した
- [x] T-05（formatMessages）: 3 テストケースを作成した
- [x] T-06（LLMAdapterFactory 設定駆動化）: 6 テストケースを作成した
- [x] テスト実行で結果を確認した

## 次の Phase

Phase 5: 実装（`phase-5-implementation.md`）
