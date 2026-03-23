# Phase 4: テスト作成（TDD: Red）— PROVIDER_CONFIGS モデル定義 + inferProviderId 更新

## メタ情報

| 項目       | 値                      |
| ---------- | ----------------------- |
| Phase番号  | 4                       |
| 機能名     | provider-configs-update |
| タスクID   | TASK-LLM-MOD-01         |
| 作成日     | 2026-03-23              |
| 依存 Phase | Phase 3（設計レビュー） |

## 目的

Phase 2 の設計に基づき、実装前にテストコードを作成する（TDD: Red フェーズ）。新モデル定義の検証テストと `inferProviderId` の新パターンテストを既存テストファイルに追加し、Phase 5 の実装前の段階では全テストが失敗することを確認する。

## 実行タスク

### Task 4-1: 既存テストの影響確認

以下のテストファイルを読み込み、旧モデルIDを参照するアサーションを特定する：

- `apps/desktop/src/main/handlers/__tests__/llm.test.ts`
- `apps/desktop/src/main/handlers/__tests__/llm-stream.test.ts`
- `apps/desktop/src/main/handlers/__tests__/llm-stream-integration.test.ts`

確認事項:

- `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo` を参照するアサーション
- `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`, `claude-3-haiku-20240307` を参照するアサーション
- `gemini-1.5-pro`, `gemini-1.5-flash` を参照するアサーション
- `grok-beta` を参照するアサーション

### Task 4-2: 新規テストケースの設計

以下のテストケースを `apps/desktop/src/main/handlers/__tests__/llm.test.ts` に追加する。
追加先は既存の `describe("LLM IPC Handlers")` ブロック内に新しい `describe` ブロックとして挿入する。

**注意**: 追加先ファイルの先頭にある import 文を事前に確認し、同じパスを使用すること（P63 対策）。

#### テストブロック: `PROVIDER_CONFIGS - モデル定義更新検証`

```typescript
describe("PROVIDER_CONFIGS - モデル定義更新検証（TASK-LLM-MOD-01）", () => {
  beforeEach(() => {
    vi.mocked(SecureStorage.getApiKey).mockResolvedValue("test-api-key");
  });

  describe("T-01: OpenAI モデル定義", () => {
    it("should include gpt-5.4 as default model", async () => {
      const providers = await handleGetProviders();
      const openai = providers.find((p) => p.id === "openai");
      expect(openai).toBeDefined();
      const defaultModel = openai?.models.find((m) => m.isDefault);
      expect(defaultModel).toBeDefined();
      expect(defaultModel?.id).toBe("gpt-5.4");
    });

    it("should include all 6 new OpenAI models", async () => {
      const providers = await handleGetProviders();
      const openai = providers.find((p) => p.id === "openai");
      expect(openai).toBeDefined();
      const modelIds = openai?.models.map((m) => m.id);
      expect(modelIds).toContain("gpt-5.4");
      expect(modelIds).toContain("gpt-5.4-mini");
      expect(modelIds).toContain("gpt-5.4-nano");
      expect(modelIds).toContain("gpt-5.4-pro");
      expect(modelIds).toContain("o3");
      expect(modelIds).toContain("o4-mini");
    });

    it("should not include legacy OpenAI models", async () => {
      const providers = await handleGetProviders();
      const openai = providers.find((p) => p.id === "openai");
      expect(openai).toBeDefined();
      const modelIds = openai?.models.map((m) => m.id);
      expect(modelIds).not.toContain("gpt-4o");
      expect(modelIds).not.toContain("gpt-4o-mini");
      expect(modelIds).not.toContain("gpt-4-turbo");
    });

    it("should set gpt-5.4 contextWindow to 1050000", async () => {
      const providers = await handleGetProviders();
      const openai = providers.find((p) => p.id === "openai");
      expect(openai).toBeDefined();
      const model = openai?.models.find((m) => m.id === "gpt-5.4");
      expect(model).toBeDefined();
      expect(model?.contextWindow).toBe(1050000);
    });

    it("should set o3 contextWindow to 200000", async () => {
      const providers = await handleGetProviders();
      const openai = providers.find((p) => p.id === "openai");
      expect(openai).toBeDefined();
      const model = openai?.models.find((m) => m.id === "o3");
      expect(model).toBeDefined();
      expect(model?.contextWindow).toBe(200000);
    });

    it("should set o4-mini contextWindow to 200000", async () => {
      const providers = await handleGetProviders();
      const openai = providers.find((p) => p.id === "openai");
      expect(openai).toBeDefined();
      const model = openai?.models.find((m) => m.id === "o4-mini");
      expect(model).toBeDefined();
      expect(model?.contextWindow).toBe(200000);
    });
  });

  describe("T-02: Anthropic モデル定義", () => {
    it("should include claude-sonnet-4-6 as default model", async () => {
      const providers = await handleGetProviders();
      const anthropic = providers.find((p) => p.id === "anthropic");
      expect(anthropic).toBeDefined();
      const defaultModel = anthropic?.models.find((m) => m.isDefault);
      expect(defaultModel).toBeDefined();
      expect(defaultModel?.id).toBe("claude-sonnet-4-6");
    });

    it("should include all 3 new Anthropic models", async () => {
      const providers = await handleGetProviders();
      const anthropic = providers.find((p) => p.id === "anthropic");
      expect(anthropic).toBeDefined();
      const modelIds = anthropic?.models.map((m) => m.id);
      expect(modelIds).toContain("claude-sonnet-4-6");
      expect(modelIds).toContain("claude-opus-4-6");
      expect(modelIds).toContain("claude-haiku-4-5");
    });

    it("should not include legacy Anthropic models", async () => {
      const providers = await handleGetProviders();
      const anthropic = providers.find((p) => p.id === "anthropic");
      expect(anthropic).toBeDefined();
      const modelIds = anthropic?.models.map((m) => m.id);
      expect(modelIds).not.toContain("claude-3-5-sonnet-20241022");
      expect(modelIds).not.toContain("claude-3-opus-20240229");
      expect(modelIds).not.toContain("claude-3-haiku-20240307");
    });
  });

  describe("T-03: Google モデル定義", () => {
    it("should include gemini-3-flash-preview as default model", async () => {
      const providers = await handleGetProviders();
      const google = providers.find((p) => p.id === "google");
      expect(google).toBeDefined();
      const defaultModel = google?.models.find((m) => m.isDefault);
      expect(defaultModel).toBeDefined();
      expect(defaultModel?.id).toBe("gemini-3-flash-preview");
    });

    it("should include all 3 new Google models", async () => {
      const providers = await handleGetProviders();
      const google = providers.find((p) => p.id === "google");
      expect(google).toBeDefined();
      const modelIds = google?.models.map((m) => m.id);
      expect(modelIds).toContain("gemini-3-flash-preview");
      expect(modelIds).toContain("gemini-3.1-pro-preview");
      expect(modelIds).toContain("gemini-3.1-flash-lite-preview");
    });

    it("should not include legacy Google models", async () => {
      const providers = await handleGetProviders();
      const google = providers.find((p) => p.id === "google");
      expect(google).toBeDefined();
      const modelIds = google?.models.map((m) => m.id);
      expect(modelIds).not.toContain("gemini-1.5-pro");
      expect(modelIds).not.toContain("gemini-1.5-flash");
    });
  });

  describe("T-04: xAI モデル定義", () => {
    it("should include grok-4-1-fast-non-reasoning as default model", async () => {
      const providers = await handleGetProviders();
      const xai = providers.find((p) => p.id === "xai");
      expect(xai).toBeDefined();
      const defaultModel = xai?.models.find((m) => m.isDefault);
      expect(defaultModel).toBeDefined();
      expect(defaultModel?.id).toBe("grok-4-1-fast-non-reasoning");
    });

    it("should include all 3 new xAI models", async () => {
      const providers = await handleGetProviders();
      const xai = providers.find((p) => p.id === "xai");
      expect(xai).toBeDefined();
      const modelIds = xai?.models.map((m) => m.id);
      expect(modelIds).toContain("grok-4-1-fast-non-reasoning");
      expect(modelIds).toContain("grok-3-mini");
      expect(modelIds).toContain("grok-4-1-fast-reasoning");
    });

    it("should not include legacy xAI models", async () => {
      const providers = await handleGetProviders();
      const xai = providers.find((p) => p.id === "xai");
      expect(xai).toBeDefined();
      const modelIds = xai?.models.map((m) => m.id);
      expect(modelIds).not.toContain("grok-beta");
    });
  });

  describe("T-05: description フィールド", () => {
    it("should have non-empty description for all new models in all providers", async () => {
      const providers = await handleGetProviders();
      const targetProviders = ["openai", "anthropic", "google", "xai"];
      for (const providerId of targetProviders) {
        const provider = providers.find((p) => p.id === providerId);
        expect(provider).toBeDefined();
        for (const model of provider?.models ?? []) {
          expect(
            "description" in model && typeof model.description === "string",
            `provider ${providerId}, model ${model.id} の description が undefined`,
          ).toBe(true);
          expect(
            "description" in model
              ? (model.description as string).trim().length
              : 0,
            `provider ${providerId}, model ${model.id} の description が空文字列`,
          ).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("T-06: isDefault 一意性", () => {
    it("should have exactly one default model per provider", async () => {
      const providers = await handleGetProviders();
      for (const provider of providers) {
        const defaultModels = provider.models.filter((m) => m.isDefault);
        expect(
          defaultModels.length,
          `provider ${provider.id} の isDefault: true が ${defaultModels.length} 個`,
        ).toBe(1);
      }
    });
  });
});

describe("inferProviderId - 新パターン検証（TASK-LLM-MOD-01）", () => {
  // inferProviderId は非公開関数のため handleSendChat 経由でテストする
  // または handleStreamChat のエラーパスで providerId 解決結果を検証する

  describe("T-07: o3/o4 プレフィックスの OpenAI 解決", () => {
    it("should resolve o3 model to openai provider via handleSendChat", async () => {
      vi.mocked(SecureStorage.getApiKey).mockResolvedValue("test-api-key");
      const mockAdapter = {
        sendChat: vi.fn().mockResolvedValue({
          content: "test",
          model: "o3",
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
          finishReason: "stop",
        }),
        checkHealth: vi.fn(),
        streamChat: vi.fn(),
      };
      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(
        mockAdapter as never,
      );

      const result = await handleSendChat({
        messages: [{ role: "user", content: "test" }],
        modelId: "o3",
        // providerId を省略 → inferProviderId で解決
      });

      expect(result.success).toBe(true);
      // LLMAdapterFactory.getAdapter が "openai" で呼ばれたことを確認
      expect(LLMAdapterFactory.getAdapter).toHaveBeenCalledWith("openai");
    });

    it("should resolve o4-mini model to openai provider via handleSendChat", async () => {
      vi.mocked(SecureStorage.getApiKey).mockResolvedValue("test-api-key");
      const mockAdapter = {
        sendChat: vi.fn().mockResolvedValue({
          content: "test",
          model: "o4-mini",
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
          finishReason: "stop",
        }),
        checkHealth: vi.fn(),
        streamChat: vi.fn(),
      };
      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(
        mockAdapter as never,
      );

      const result = await handleSendChat({
        messages: [{ role: "user", content: "test" }],
        modelId: "o4-mini",
      });

      expect(result.success).toBe(true);
      expect(LLMAdapterFactory.getAdapter).toHaveBeenCalledWith("openai");
    });
  });

  describe("T-08: 既存パターンの継続動作確認", () => {
    it("should still resolve claude- prefix to anthropic", async () => {
      vi.mocked(SecureStorage.getApiKey).mockResolvedValue("test-api-key");
      const mockAdapter = {
        sendChat: vi.fn().mockResolvedValue({
          content: "test",
          model: "claude-sonnet-4-6",
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
          finishReason: "stop",
        }),
        checkHealth: vi.fn(),
        streamChat: vi.fn(),
      };
      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(
        mockAdapter as never,
      );

      await handleSendChat({
        messages: [{ role: "user", content: "test" }],
        modelId: "claude-sonnet-4-6",
      });

      expect(LLMAdapterFactory.getAdapter).toHaveBeenCalledWith("anthropic");
    });

    it("should still resolve gemini- prefix to google", async () => {
      vi.mocked(SecureStorage.getApiKey).mockResolvedValue("test-api-key");
      const mockAdapter = {
        sendChat: vi.fn().mockResolvedValue({
          content: "test",
          model: "gemini-3-flash-preview",
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
          finishReason: "stop",
        }),
        checkHealth: vi.fn(),
        streamChat: vi.fn(),
      };
      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(
        mockAdapter as never,
      );

      await handleSendChat({
        messages: [{ role: "user", content: "test" }],
        modelId: "gemini-3-flash-preview",
      });

      expect(LLMAdapterFactory.getAdapter).toHaveBeenCalledWith("google");
    });
  });
});
```

### Task 4-3: テストファイルへの追加手順

1. `apps/desktop/src/main/handlers/__tests__/llm.test.ts` を Read で確認する
2. ファイル末尾の `});`（最後の `describe` ブロック閉じ）の直前に、Task 4-2 のテストコードを追加する
3. `SecureStorage` と `LLMAdapterFactory` のモック設定が既存の `vi.mock()` と重複しないことを確認する（既存のモックをそのまま使用）

### Task 4-4: Red フェーズの確認

テスト追加後に以下を実行し、追加したテストが失敗することを確認する（Phase 5 実装前）:

```bash
cd apps/desktop && pnpm vitest run src/main/handlers/__tests__/llm.test.ts
```

期待する結果:

- `PROVIDER_CONFIGS - モデル定義更新検証` の全テスト: FAIL（`gpt-5.4` が存在しないため）
- `inferProviderId - 新パターン検証` の T-07〜T-08: PASS（現行コードで既に対応済み）

## 参照資料

| 資料名             | パス                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| Phase 2 設計       | `docs/30-workflows/step-01-seq-task-01-provider-configs-update/phase-2-design.md` |
| 現行テストファイル | `apps/desktop/src/main/handlers/__tests__/llm.test.ts`                            |
| コード品質ルール   | `.claude/rules/02-code-quality.md`                                                |
| 既知の落とし穴 P63 | `.claude/rules/06-known-pitfalls.md`（サブエージェントのインポートパス誤り）      |

## 成果物

| 成果物                 | パス                                                   | 形式       |
| ---------------------- | ------------------------------------------------------ | ---------- |
| 更新済みテストファイル | `apps/desktop/src/main/handlers/__tests__/llm.test.ts` | TypeScript |

## 完了条件

- [ ] `apps/desktop/src/main/handlers/__tests__/llm.test.ts` の既存 import パスを確認した
- [ ] T-01〜T-06（PROVIDER_CONFIGS 検証）のテストを追加した（計 17 テストケース）
- [ ] T-07〜T-08（inferProviderId 検証）のテストを追加した（計 4 テストケース）
- [ ] T-01〜T-06 が Red（失敗）であることを実行結果で確認した
- [ ] T-07〜T-08 が既存実装でパスすることを確認した（inferProviderId は変更不要の確認）
- [ ] 既存の正常テストを壊していないことを確認した

## 統合テスト連携

Phase 4 では追加テストの Red フェーズ確認のみを行う。統合テストは Phase 5 の実装後に実施する。

## 多角的チェック観点

| 観点             | 確認内容                                                       |
| ---------------- | -------------------------------------------------------------- |
| P48 準拠         | テストコード内に non-null assertion (`!`) が残存していないこと |
| P49 準拠         | `as` キャストではなく `in` 演算子で実行時型検証していること    |
| P63 準拠         | import パスが既存テストファイルと一致していること              |
| テストケース数   | T-01〜T-06: 17件、T-07〜T-08: 4件、合計: 21件                  |
| Red フェーズ確認 | T-01〜T-06 が FAIL、T-07〜T-08 が PASS であること              |

## サブタスク管理

| サブタスク | 状態   | 担当   |
| ---------- | ------ | ------ |
| Task 4-1   | 未着手 | メイン |
| Task 4-2   | 未着手 | メイン |
| Task 4-3   | 未着手 | メイン |
| Task 4-4   | 未着手 | メイン |

## タスク 100% 実行確認

- [ ] 全 Task（4-1〜4-4）の完了条件を満たした
- [ ] 多角的チェック観点を全て確認した
- [ ] 成果物が全て生成された

## 次の Phase

Phase 5: 実装（`phase-5-implementation.md`）
