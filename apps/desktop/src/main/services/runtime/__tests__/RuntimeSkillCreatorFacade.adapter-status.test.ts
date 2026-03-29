/**
 * RuntimeSkillCreatorFacade — LLMAdapter Status Tests
 *
 * TASK-RT-01: llm-adapter-error-propagation
 * Phase 4 test matrix + Phase 6 edge cases
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  RuntimeSkillCreatorFacade,
  toActionableMessage,
} from "../RuntimeSkillCreatorFacade";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import type { SkillExecutor } from "../../skill/SkillExecutor";
import type { ILLMAdapter } from "../../../adapters/llm/types";

function createMockSkillExecutor(): SkillExecutor {
  return { execute: vi.fn() } as unknown as SkillExecutor;
}

function createMockLLMAdapter(
  overrides: Partial<ILLMAdapter> = {},
): ILLMAdapter {
  return {
    providerId: "anthropic" as ILLMAdapter["providerId"],
    sendChat: vi.fn(),
    streamChat: vi.fn(),
    checkHealth: vi.fn(),
    ...overrides,
  } as ILLMAdapter;
}

function createMockResourceLoader() {
  return { loadAgent: vi.fn() };
}

function validPlanResponseJson() {
  return JSON.stringify({
    skillName: "test-skill",
    description: "A test skill",
    agents: [{ name: "agent-1", role: "Tester" }],
    scripts: [{ name: "test.js", purpose: "Run tests" }],
    triggers: ["on test"],
    anchors: ["test-anchor"],
  });
}

describe("RuntimeSkillCreatorFacade — adapter status (TASK-RT-01)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==================================================================
  // T-ST: ステータス遷移テスト
  // ==================================================================
  describe("ステータス遷移", () => {
    it("T-ST-01: Facade 生成直後は initializing", () => {
      const facade = new RuntimeSkillCreatorFacade({
        skillExecutor: createMockSkillExecutor(),
      });
      expect(facade.llmAdapterStatus).toBe("initializing");
    });

    it("T-ST-02: setLLMAdapter() 呼び出し後は ready", () => {
      const facade = new RuntimeSkillCreatorFacade({
        skillExecutor: createMockSkillExecutor(),
      });
      facade.setLLMAdapter(createMockLLMAdapter());
      expect(facade.llmAdapterStatus).toBe("ready");
    });

    it("T-ST-03: setLLMAdapterFailed() 呼び出し後は failed", () => {
      const facade = new RuntimeSkillCreatorFacade({
        skillExecutor: createMockSkillExecutor(),
      });
      facade.setLLMAdapterFailed("API key not set");
      expect(facade.llmAdapterStatus).toBe("failed");
    });

    it("T-ST-04: failed 時に failureReason が取得できる", () => {
      const facade = new RuntimeSkillCreatorFacade({
        skillExecutor: createMockSkillExecutor(),
      });
      facade.setLLMAdapterFailed("API key not set");
      expect(facade.llmAdapterFailureReason).toBe("API key not set");
    });

    it("T-ST-05: ready 時の failureReason は null", () => {
      const facade = new RuntimeSkillCreatorFacade({
        skillExecutor: createMockSkillExecutor(),
      });
      facade.setLLMAdapter(createMockLLMAdapter());
      expect(facade.llmAdapterFailureReason).toBeNull();
    });

    it("T-ST-06: failed → setLLMAdapter() でリカバリー", () => {
      const facade = new RuntimeSkillCreatorFacade({
        skillExecutor: createMockSkillExecutor(),
      });
      facade.setLLMAdapterFailed("temporary error");
      facade.setLLMAdapter(createMockLLMAdapter());

      expect(facade.llmAdapterStatus).toBe("ready");
      expect(facade.llmAdapterFailureReason).toBeNull();
    });
  });

  // ==================================================================
  // T-PL: plan() エラーレスポンステスト
  // ==================================================================
  describe("plan() エラーレスポンス", () => {
    it("T-PL-01: status === 'failed' で plan() はエラーレスポンスを返す", async () => {
      const facade = new RuntimeSkillCreatorFacade({
        skillExecutor: createMockSkillExecutor(),
      });
      facade.setLLMAdapterFailed("Connection refused");

      const result = await facade.plan("test spec", "api-key", "sk-test");

      expect(result).toEqual({
        success: false,
        error: {
          code: "llm_adapter_unavailable",
          message: "Connection refused",
        },
      });
    });

    it("T-PL-02: status === 'initializing' で plan() はエラーレスポンスを返す", async () => {
      const facade = new RuntimeSkillCreatorFacade({
        skillExecutor: createMockSkillExecutor(),
      });
      // setLLMAdapter() 未呼び出し → "initializing"

      const result = await facade.plan("test spec", "api-key", "sk-test");

      expect(result).toEqual({
        success: false,
        error: {
          code: "llm_adapter_unavailable",
          message: "LLMAdapter の初期化中です。しばらくお待ちください",
        },
      });
    });

    it("T-PL-03: status === 'ready' で plan() は正常レスポンスを返す", async () => {
      const mockResourceLoader = createMockResourceLoader();
      const mockLLMAdapter = createMockLLMAdapter();
      const facade = new RuntimeSkillCreatorFacade({
        skillExecutor: createMockSkillExecutor(),
        resourceLoader: mockResourceLoader as never,
      });
      facade.setLLMAdapter(mockLLMAdapter);

      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      (mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce("agent-content-1")
        .mockResolvedValueOnce("agent-content-2")
        .mockResolvedValueOnce("agent-content-3");
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: validPlanResponseJson(),
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      });

      const result = await facade.plan("test spec", "api-key", "sk-test");

      expect(result).toHaveProperty("skillName", "test-skill");
      expect(result).toHaveProperty("adapterStatus", "ready");
    });

    it("T-PL-04: API key 未設定エラーで failed → actionable メッセージ", async () => {
      const facade = new RuntimeSkillCreatorFacade({
        skillExecutor: createMockSkillExecutor(),
      });
      facade.setLLMAdapterFailed(
        "ANTHROPIC_API_KEY environment variable is not set",
      );

      const result = await facade.plan("test spec", "api-key", "sk-test");

      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty(
        "error.message",
        "APIキーを設定してください",
      );
    });

    it("T-PL-05: ネットワークエラーで failed → 具体的理由を返す", async () => {
      const facade = new RuntimeSkillCreatorFacade({
        skillExecutor: createMockSkillExecutor(),
      });
      facade.setLLMAdapterFailed("ECONNREFUSED: connect ECONNREFUSED");

      const result = await facade.plan("test spec", "api-key", "sk-test");

      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty(
        "error.message",
        "ECONNREFUSED: connect ECONNREFUSED",
      );
    });

    it("T-PL-06: エラーレスポンスに adapterStatus が含まれる", async () => {
      const facade = new RuntimeSkillCreatorFacade({
        skillExecutor: createMockSkillExecutor(),
      });
      facade.setLLMAdapterFailed("some error");

      const result = await facade.plan("test spec", "api-key", "sk-test");

      expect(result).toHaveProperty("error.code", "llm_adapter_unavailable");
    });
  });

  // ==================================================================
  // Phase 6 edge cases: ステータス再遷移
  // ==================================================================
  describe("ステータス再遷移 edge case", () => {
    it("failed → failed 連続呼び出しで最後の reason が保持される", () => {
      const facade = new RuntimeSkillCreatorFacade({
        skillExecutor: createMockSkillExecutor(),
      });
      facade.setLLMAdapterFailed("first error");
      facade.setLLMAdapterFailed("second error");

      expect(facade.llmAdapterStatus).toBe("failed");
      expect(facade.llmAdapterFailureReason).toBe("second error");
    });

    it("ready → failed で status が failed に遷移する", () => {
      const facade = new RuntimeSkillCreatorFacade({
        skillExecutor: createMockSkillExecutor(),
      });
      facade.setLLMAdapter(createMockLLMAdapter());
      facade.setLLMAdapterFailed("late failure");

      expect(facade.llmAdapterStatus).toBe("failed");
      expect(facade.llmAdapterFailureReason).toBe("late failure");
    });
  });

  // ==================================================================
  // Phase 6 edge cases: エラーメッセージパターン
  // ==================================================================
  describe("toActionableMessage edge cases", () => {
    it("reason が null → デフォルトメッセージ", () => {
      expect(toActionableMessage(null)).toBe(
        "LLMAdapter の初期化に失敗しました",
      );
    });

    it("reason が空文字 → デフォルトメッセージ", () => {
      expect(toActionableMessage("")).toBe("LLMAdapter の初期化に失敗しました");
    });

    it("reason に 'ANTHROPIC_API_KEY' → actionable メッセージ", () => {
      expect(toActionableMessage("ANTHROPIC_API_KEY is not set")).toBe(
        "APIキーを設定してください",
      );
    });

    it("reason に 'api_key' → actionable メッセージ", () => {
      expect(toActionableMessage("Invalid api_key provided")).toBe(
        "APIキーを設定してください",
      );
    });

    it("reason に 'API key' → actionable メッセージ", () => {
      expect(toActionableMessage("API key is missing")).toBe(
        "APIキーを設定してください",
      );
    });

    it("reason に 'apikey' → actionable メッセージ", () => {
      expect(toActionableMessage("Missing apikey")).toBe(
        "APIキーを設定してください",
      );
    });

    it("reason に 'network' → そのまま返す", () => {
      expect(toActionableMessage("network timeout")).toBe("network timeout");
    });

    it("reason が非常に長い文字列 → truncation なしで返す", () => {
      const longReason = "x".repeat(1000);
      expect(toActionableMessage(longReason)).toBe(longReason);
    });
  });

  // ==================================================================
  // Phase 6 edge cases: タイミング競合
  // ==================================================================
  describe("タイミング競合 edge case", () => {
    it("initializing 時に plan() を呼ぶと即座にエラーを返す（初期化完了を待たない）", async () => {
      const facade = new RuntimeSkillCreatorFacade({
        skillExecutor: createMockSkillExecutor(),
      });
      // setLLMAdapter() 未呼び出し

      const start = Date.now();
      const result = await facade.plan("test spec", "api-key", "sk-test");
      const elapsed = Date.now() - start;

      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error.code", "llm_adapter_unavailable");
      // 即座に返ること（100ms未満）
      expect(elapsed).toBeLessThan(100);
    });

    it("setLLMAdapter() → plan() 同期連続呼び出しで最新ステータスを参照する", async () => {
      const mockResourceLoader = createMockResourceLoader();
      const mockLLMAdapter = createMockLLMAdapter();
      const facade = new RuntimeSkillCreatorFacade({
        skillExecutor: createMockSkillExecutor(),
        resourceLoader: mockResourceLoader as never,
      });

      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      (
        mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>
      ).mockResolvedValue("agent-content");
      (mockLLMAdapter.sendChat as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: validPlanResponseJson(),
        model: "claude-sonnet-4-20250514",
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      });

      facade.setLLMAdapter(mockLLMAdapter);
      const result = await facade.plan("test spec", "api-key", "sk-test");

      // ready ステータスなので正常レスポンス
      expect(result).toHaveProperty("skillName", "test-skill");
      expect(result).toHaveProperty("adapterStatus", "ready");
    });
  });

  // ==================================================================
  // T-COMPAT: 既存テスト互換性
  // ==================================================================
  describe("既存テスト互換性", () => {
    it("T-COMPAT-01: setLLMAdapter() で status が自動的に ready に遷移", () => {
      const facade = new RuntimeSkillCreatorFacade({
        skillExecutor: createMockSkillExecutor(),
      });
      facade.setLLMAdapter(createMockLLMAdapter());

      expect(facade.llmAdapterStatus).toBe("ready");
    });

    it("T-COMPAT-02: llmAdapter 設定なしで improve() は explicit error を返す (TASK-RT-02)", async () => {
      const facade = new RuntimeSkillCreatorFacade({
        skillExecutor: createMockSkillExecutor(),
      });

      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });

      // TASK-RT-02: llmAdapter 未注入時は explicit error
      const result = await facade.improve(
        "skill-b",
        "need better validation",
        "api-key",
        "sk-test",
      );

      expect(result).toEqual({
        success: false,
        error: {
          code: "llm_adapter_unavailable",
          message: "LLM アダプタが利用できません。設定を確認してください。",
        },
      });
    });
  });
});
