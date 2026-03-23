# Phase 6: テスト拡充 — PROVIDER_CONFIGS モデル定義 + inferProviderId 更新

## メタ情報

| 項目       | 値                      |
| ---------- | ----------------------- |
| Phase番号  | 6                       |
| 機能名     | provider-configs-update |
| タスクID   | TASK-LLM-MOD-01         |
| 作成日     | 2026-03-23              |
| 依存 Phase | Phase 5（実装）         |

## 目的

Phase 5 の実装完了後、Phase 4 で追加したテストのカバレッジ不足を補完する。境界値・異常系・OpenRouter 維持確認・contextWindow 精度確認を追加し、カバレッジ基準（Line: 80%、Branch: 60%、Function: 80%）を達成する。

## 実行タスク

### Task 6-1: カバレッジ測定

Phase 5 の実装完了後、以下でカバレッジを測定する：

```bash
cd apps/desktop && pnpm vitest run src/main/handlers/__tests__/llm.test.ts --coverage
```

カバレッジレポートから `llm.ts` のカバレッジ数値（Line, Branch, Function）を確認する。

### Task 6-2: 追加テストケース実装

カバレッジが基準未達の場合、以下のテストを `apps/desktop/src/main/handlers/__tests__/llm.test.ts` に追加する。

#### テストブロック: `PROVIDER_CONFIGS - 拡充テスト（TASK-LLM-MOD-01）`

```typescript
describe("PROVIDER_CONFIGS - 拡充テスト（TASK-LLM-MOD-01）", () => {
  beforeEach(() => {
    vi.mocked(SecureStorage.getApiKey).mockResolvedValue("test-api-key");
  });

  describe("T-09: OpenRouter 維持確認", () => {
    it("should keep OpenRouter models unchanged", async () => {
      const providers = await handleGetProviders();
      const openrouter = providers.find((p) => p.id === "openrouter");
      expect(openrouter).toBeDefined();
      // 注意: OpenRouter のモデルID（openai/gpt-4o 等）は OpenRouter 更新タスクで変更される可能性がある
      const modelIds = openrouter?.models.map((m) => m.id);
      expect(modelIds).toContain("openai/gpt-4o");
      expect(modelIds).toContain("anthropic/claude-3.5-sonnet");
      expect(modelIds).toContain("google/gemini-pro-1.5");
      expect(modelIds).toContain("meta-llama/llama-3.1-405b-instruct");
      expect(openrouter?.models).toHaveLength(4);
    });

    it("should keep OpenRouter default model unchanged", async () => {
      const providers = await handleGetProviders();
      const openrouter = providers.find((p) => p.id === "openrouter");
      expect(openrouter).toBeDefined();
      const defaultModel = openrouter?.models.find((m) => m.isDefault);
      expect(defaultModel).toBeDefined();
      expect(defaultModel?.id).toBe("openai/gpt-4o");
    });
  });

  describe("T-10: contextWindow 精度確認", () => {
    it("should set gpt-5.4-mini contextWindow to 1050000", async () => {
      const providers = await handleGetProviders();
      const openai = providers.find((p) => p.id === "openai");
      expect(openai).toBeDefined();
      const model = openai?.models.find((m) => m.id === "gpt-5.4-mini");
      expect(model).toBeDefined();
      expect(model?.contextWindow).toBe(1050000);
    });

    it("should set gpt-5.4-nano contextWindow to 1050000", async () => {
      const providers = await handleGetProviders();
      const openai = providers.find((p) => p.id === "openai");
      expect(openai).toBeDefined();
      const model = openai?.models.find((m) => m.id === "gpt-5.4-nano");
      expect(model).toBeDefined();
      expect(model?.contextWindow).toBe(1050000);
    });

    it("should set claude-opus-4-6 contextWindow to 200000", async () => {
      const providers = await handleGetProviders();
      const anthropic = providers.find((p) => p.id === "anthropic");
      expect(anthropic).toBeDefined();
      const model = anthropic?.models.find((m) => m.id === "claude-opus-4-6");
      expect(model).toBeDefined();
      expect(model?.contextWindow).toBe(200000);
    });

    it("should set claude-haiku-4-5 contextWindow to 200000", async () => {
      const providers = await handleGetProviders();
      const anthropic = providers.find((p) => p.id === "anthropic");
      expect(anthropic).toBeDefined();
      const model = anthropic?.models.find((m) => m.id === "claude-haiku-4-5");
      expect(model).toBeDefined();
      expect(model?.contextWindow).toBe(200000);
    });

    it("should set gemini-3.1-pro-preview contextWindow to 1048576", async () => {
      const providers = await handleGetProviders();
      const google = providers.find((p) => p.id === "google");
      expect(google).toBeDefined();
      const model = google?.models.find(
        (m) => m.id === "gemini-3.1-pro-preview",
      );
      expect(model).toBeDefined();
      expect(model?.contextWindow).toBe(1048576);
    });

    it("should set gemini-3.1-flash-lite-preview contextWindow to 1048576", async () => {
      const providers = await handleGetProviders();
      const google = providers.find((p) => p.id === "google");
      expect(google).toBeDefined();
      const model = google?.models.find(
        (m) => m.id === "gemini-3.1-flash-lite-preview",
      );
      expect(model).toBeDefined();
      expect(model?.contextWindow).toBe(1048576);
    });

    it("should set grok-3-mini contextWindow to 131072", async () => {
      const providers = await handleGetProviders();
      const xai = providers.find((p) => p.id === "xai");
      expect(xai).toBeDefined();
      const model = xai?.models.find((m) => m.id === "grok-3-mini");
      expect(model).toBeDefined();
      expect(model?.contextWindow).toBe(131072);
    });
  });

  describe("T-11: プロバイダー総数確認", () => {
    it("should return 5 providers", async () => {
      const providers = await handleGetProviders();
      expect(providers).toHaveLength(5);
    });

    it("should return providers in correct order", async () => {
      const providers = await handleGetProviders();
      const ids = providers.map((p) => p.id);
      expect(ids).toEqual([
        "openai",
        "anthropic",
        "google",
        "xai",
        "openrouter",
      ]);
    });
  });

  describe("T-12: モデル数確認", () => {
    it("should return 6 models for OpenAI", async () => {
      const providers = await handleGetProviders();
      const openai = providers.find((p) => p.id === "openai");
      expect(openai).toBeDefined();
      expect(openai?.models).toHaveLength(6);
    });

    it("should return 3 models for Anthropic", async () => {
      const providers = await handleGetProviders();
      const anthropic = providers.find((p) => p.id === "anthropic");
      expect(anthropic).toBeDefined();
      expect(anthropic?.models).toHaveLength(3);
    });

    it("should return 3 models for Google", async () => {
      const providers = await handleGetProviders();
      const google = providers.find((p) => p.id === "google");
      expect(google).toBeDefined();
      expect(google?.models).toHaveLength(3);
    });

    it("should return 3 models for xAI", async () => {
      const providers = await handleGetProviders();
      const xai = providers.find((p) => p.id === "xai");
      expect(xai).toBeDefined();
      expect(xai?.models).toHaveLength(3);
    });
  });

  describe("T-13: handleSendChat での新モデル使用確認", () => {
    it("should accept gpt-5.4 as modelId in handleSendChat", async () => {
      vi.mocked(SecureStorage.getApiKey).mockResolvedValue("test-api-key");
      const mockAdapter = {
        sendChat: vi.fn().mockResolvedValue({
          content: "response",
          model: "gpt-5.4",
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
        messages: [{ role: "user", content: "hello" }],
        modelId: "gpt-5.4",
      });

      expect(result.success).toBe(true);
      expect(LLMAdapterFactory.getAdapter).toHaveBeenCalledWith("openai");
    });

    it("should accept claude-sonnet-4-6 as modelId in handleSendChat", async () => {
      vi.mocked(SecureStorage.getApiKey).mockResolvedValue("test-api-key");
      const mockAdapter = {
        sendChat: vi.fn().mockResolvedValue({
          content: "response",
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

      const result = await handleSendChat({
        messages: [{ role: "user", content: "hello" }],
        modelId: "claude-sonnet-4-6",
      });

      expect(result.success).toBe(true);
      expect(LLMAdapterFactory.getAdapter).toHaveBeenCalledWith("anthropic");
    });
  });
});
```

### Task 6-3: カバレッジ再測定

追加テスト実装後に再度カバレッジを測定し、基準達成を確認する：

```bash
cd apps/desktop && pnpm vitest run src/main/handlers/__tests__/llm.test.ts --coverage
```

期待するカバレッジ（`llm.ts` のみ）:

- Line Coverage: 80% 以上
- Branch Coverage: 60% 以上
- Function Coverage: 80% 以上

基準未達の場合は Phase 7 に進む前に Task 6-2 を繰り返す。

## 参照資料

| 資料名             | パス                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------- |
| Phase 4 テスト     | `docs/30-workflows/step-01-seq-task-01-provider-configs-update/phase-4-test-creation.md` |
| 現行テストファイル | `apps/desktop/src/main/handlers/__tests__/llm.test.ts`                                   |
| コード品質ルール   | `.claude/rules/02-code-quality.md`（カバレッジ基準）                                     |

## 成果物

| 成果物                       | パス                                                   | 形式       |
| ---------------------------- | ------------------------------------------------------ | ---------- |
| 拡充済みテストファイル       | `apps/desktop/src/main/handlers/__tests__/llm.test.ts` | TypeScript |
| カバレッジレポート（確認用） | `apps/desktop/coverage/` （実行時生成）                | HTML/JSON  |

## 完了条件

- [ ] Phase 5 の全テストが PASS していることを確認した
- [ ] `apps/desktop/src/main/handlers/__tests__/llm.test.ts` に T-09〜T-13 を追加した
- [ ] OpenRouter モデルが変更されていないことを T-09 で検証した
- [ ] 全 contextWindow 値を T-10 で検証した
- [ ] プロバイダー総数（5個）と順序を T-11 で検証した
- [ ] 各プロバイダーのモデル数を T-12 で検証した
- [ ] `llm.ts` の Line Coverage が 80% 以上であることを確認した
- [ ] `llm.ts` の Branch Coverage が 60% 以上であることを確認した
- [ ] `llm.ts` の Function Coverage が 80% 以上であることを確認した

## 統合テスト連携

Phase 6 の全テストが PASS した後、以下で関連ファイルへの影響がないことを確認する：

```bash
cd apps/desktop && pnpm vitest run src/main/handlers/__tests__/
```

## 多角的チェック観点

| 観点             | 確認内容                                                                    |
| ---------------- | --------------------------------------------------------------------------- |
| P48 準拠         | テストコード内に non-null assertion (`!`) が残存していないこと              |
| OpenRouter 注意  | T-09 のモデルIDは OpenRouter 更新タスクで変更される可能性がある旨を注記した |
| カバレッジ基準   | Line: 80%、Branch: 60%、Function: 80% を達成していること                    |
| 既存テスト非破壊 | Phase 4/5 で追加した全テストが引き続き PASS していること                    |

## サブタスク管理

| サブタスク | 状態   | 担当   |
| ---------- | ------ | ------ |
| Task 6-1   | 未着手 | メイン |
| Task 6-2   | 未着手 | メイン |
| Task 6-3   | 未着手 | メイン |

## タスク 100% 実行確認

- [ ] 全 Task（6-1〜6-3）の完了条件を満たした
- [ ] 多角的チェック観点を全て確認した
- [ ] 成果物が全て生成された

## 次の Phase

Phase 7: カバレッジ確認（`phase-7-coverage.md`）
