/**
 * RuntimeSkillCreatorFacade execute() persist integration tests
 *
 * TASK-P0-05: SkillFileWriter.persist() 連携テスト (Phase 4)
 * AC-3: SkillFileWriter.persist() でファイル書き出し
 * AC-4: 書き出し結果が ExecuteResult に含まれる
 * AC-5: パース失敗時のエラーハンドリング
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { RuntimeSkillCreatorFacade } from "../RuntimeSkillCreatorFacade";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import * as parserModule from "../parseLlmResponseToContent";
import type { SkillExecutor } from "../../skill/SkillExecutor";
import type {
  SkillFileWriter,
  PersistResult,
} from "../../skill/SkillFileWriter";
import type { ILLMAdapter } from "../../../adapters/llm/types";
import type { RuntimeSkillCreatorPlanResult } from "@repo/shared/types";

/** LLMAdapter のモック生成（status を "ready" にするための最小実装） */
function createMockLLMAdapter(): ILLMAdapter {
  return {
    providerId: "anthropic" as ILLMAdapter["providerId"],
    sendChat: vi.fn(),
    streamChat: vi.fn(),
    checkHealth: vi.fn(),
  } as unknown as ILLMAdapter;
}

/**
 * LLMAdapter を ready 状態で注入済みの Facade を生成する。
 * TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001:
 * _llmAdapterStatus ガードが追加されたため、execute() テストでは
 * setLLMAdapter() が必須。
 */
function createFacadeReady(
  deps: ConstructorParameters<typeof RuntimeSkillCreatorFacade>[0],
): RuntimeSkillCreatorFacade {
  const facade = new RuntimeSkillCreatorFacade(deps);
  facade.setLLMAdapter(createMockLLMAdapter());
  return facade;
}

/** SkillExecutor のモック生成 */
function createMockSkillExecutor(options: {
  success: boolean;
  sdkMessages?: unknown[];
  executionId?: string;
  error?: { code: string; message: string };
}): SkillExecutor {
  return {
    execute: vi.fn().mockResolvedValue({
      executionId: options.executionId ?? "exec-test-001",
      success: options.success,
      sdkMessages: options.sdkMessages ?? [],
      error: options.error,
    }),
  } as unknown as SkillExecutor;
}

/** SkillFileWriter のモック生成 */
function createMockSkillFileWriter(
  result?: PersistResult,
  error?: Error,
): SkillFileWriter {
  const mock = {
    persist: error
      ? vi.fn().mockRejectedValue(error)
      : vi.fn().mockResolvedValue(
          result ?? {
            skillPath: "/skills/test-skill",
            files: ["SKILL.md"],
          },
        ),
  };
  return mock as unknown as SkillFileWriter;
}

/** LLM 応答テキストを含む SDK メッセージを生成 */
function makeSdkMessages(text: string): unknown[] {
  return [{ type: "assistant", content: text }];
}

/** コードブロック付き LLM 応答テキスト */
const SKILL_RESPONSE_TEXT = [
  "### SKILL.md",
  "```markdown",
  "# Test Skill",
  "A generated skill.",
  "```",
].join("\n");

/** テスト用 PlanResult */
function makePlanResult(
  overrides?: Partial<RuntimeSkillCreatorPlanResult>,
): RuntimeSkillCreatorPlanResult {
  return {
    planId: "plan-persist-001",
    skillSpec: "test-skill\nspec body",
    estimatedSteps: 3,
    skillName: "test-skill",
    description: "Test skill for persist",
    agents: [],
    scripts: [],
    triggers: [],
    anchors: [],
    ...overrides,
  } as RuntimeSkillCreatorPlanResult;
}

/** RuntimePolicyResolver を integrated_api に固定 */
function mockResolverAsIntegratedApi(): void {
  vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
    type: "integrated_api",
    apiKey: "sk-test",
    permissionMode: "default",
  });
}

describe("RuntimeSkillCreatorFacade execute() persist integration", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("persist 正常系", () => {
    it("F-01: persist が正しい引数 (skillName, content, { overwrite: true }) で呼ばれる", async () => {
      mockResolverAsIntegratedApi();
      const mockWriter = createMockSkillFileWriter();
      const mockExecutor = createMockSkillExecutor({
        success: true,
        sdkMessages: makeSdkMessages(SKILL_RESPONSE_TEXT),
      });
      const facade = createFacadeReady({
        skillExecutor: mockExecutor,
        skillFileWriter: mockWriter,
      });

      await facade.execute(makePlanResult(), "api-key", "sk-test");

      expect(mockWriter.persist).toHaveBeenCalledWith(
        "test-skill",
        expect.objectContaining({ skillMd: expect.any(String) }),
        { overwrite: true },
      );
    });

    it("F-02: persist 成功 → persistResult に PersistResult が格納される", async () => {
      mockResolverAsIntegratedApi();
      const expectedResult: PersistResult = {
        skillPath: "/skills/my-skill",
        files: ["SKILL.md", "agents/planner.md"],
      };
      const mockWriter = createMockSkillFileWriter(expectedResult);
      const mockExecutor = createMockSkillExecutor({
        success: true,
        sdkMessages: makeSdkMessages(SKILL_RESPONSE_TEXT),
      });
      const facade = createFacadeReady({
        skillExecutor: mockExecutor,
        skillFileWriter: mockWriter,
      });

      const result = await facade.execute(
        makePlanResult({ skillName: "my-skill" }),
        "api-key",
        "sk-test",
      );

      expect(result).toHaveProperty("persistResult", expectedResult);
      expect(result).toHaveProperty("persistError", null);
    });
  });

  describe("persist 異常系", () => {
    it("F-03: persist 失敗 → persistError にメッセージ、success は true", async () => {
      mockResolverAsIntegratedApi();
      const mockWriter = createMockSkillFileWriter(
        undefined,
        new Error("WRITE_ERROR: disk full"),
      );
      const mockExecutor = createMockSkillExecutor({
        success: true,
        sdkMessages: makeSdkMessages(SKILL_RESPONSE_TEXT),
      });
      const facade = createFacadeReady({
        skillExecutor: mockExecutor,
        skillFileWriter: mockWriter,
      });

      const result = await facade.execute(
        makePlanResult(),
        "api-key",
        "sk-test",
      );

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty(
        "persistError",
        expect.stringContaining("WRITE_ERROR"),
      );
      expect(result).toHaveProperty("persistResult", null);
    });

    it("F-04: skillFileWriter 未DI → persist スキップ、persistResult: null", async () => {
      mockResolverAsIntegratedApi();
      const mockExecutor = createMockSkillExecutor({
        success: true,
        sdkMessages: makeSdkMessages(SKILL_RESPONSE_TEXT),
      });
      // skillFileWriter を渡さない
      const facade = createFacadeReady({
        skillExecutor: mockExecutor,
      });

      const result = await facade.execute(
        makePlanResult(),
        "api-key",
        "sk-test",
      );

      expect(result).toHaveProperty("persistResult", null);
      expect(result).toHaveProperty("persistError", null);
    });

    it("F-05: コードブロックなし → persist 呼ばれない、persistResult: null", async () => {
      mockResolverAsIntegratedApi();
      const mockWriter = createMockSkillFileWriter();
      const mockExecutor = createMockSkillExecutor({
        success: true,
        sdkMessages: makeSdkMessages(
          "コードブロックを含まないテキスト応答です。",
        ),
      });
      const facade = createFacadeReady({
        skillExecutor: mockExecutor,
        skillFileWriter: mockWriter,
      });

      const result = await facade.execute(
        makePlanResult(),
        "api-key",
        "sk-test",
      );

      expect(mockWriter.persist).not.toHaveBeenCalled();
      expect(result).toHaveProperty("persistResult", null);
    });

    it("F-06: execute 失敗 (response.success === false) → persist 呼ばれない", async () => {
      mockResolverAsIntegratedApi();
      const mockWriter = createMockSkillFileWriter();
      const mockExecutor = createMockSkillExecutor({
        success: false,
        sdkMessages: makeSdkMessages(SKILL_RESPONSE_TEXT),
        error: { code: "EXECUTION_FAILED", message: "SDK execution failed" },
      });
      const facade = createFacadeReady({
        skillExecutor: mockExecutor,
        skillFileWriter: mockWriter,
      });

      await facade.execute(makePlanResult(), "api-key", "sk-test");

      expect(mockWriter.persist).not.toHaveBeenCalled();
    });
  });

  // --- Phase 6: persist エラーパターンテスト ---

  describe("persist エラーパターン", () => {
    it("E-10: VALIDATION_ERROR → persistError に記録", async () => {
      mockResolverAsIntegratedApi();
      const validationError = Object.assign(
        new Error("skillMd must be a non-empty string"),
        { code: "VALIDATION_ERROR" },
      );
      const mockWriter = createMockSkillFileWriter(undefined, validationError);
      const mockExecutor = createMockSkillExecutor({
        success: true,
        sdkMessages: makeSdkMessages(SKILL_RESPONSE_TEXT),
      });
      const facade = createFacadeReady({
        skillExecutor: mockExecutor,
        skillFileWriter: mockWriter,
      });

      const result = await facade.execute(
        makePlanResult(),
        "api-key",
        "sk-test",
      );

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty(
        "persistError",
        expect.stringContaining("skillMd must be a non-empty string"),
      );
    });

    it("E-11: PATH_TRAVERSAL → persistError に記録", async () => {
      mockResolverAsIntegratedApi();
      const error = Object.assign(new Error("Invalid skill name"), {
        code: "PATH_TRAVERSAL",
      });
      const mockWriter = createMockSkillFileWriter(undefined, error);
      const mockExecutor = createMockSkillExecutor({
        success: true,
        sdkMessages: makeSdkMessages(SKILL_RESPONSE_TEXT),
      });
      const facade = createFacadeReady({
        skillExecutor: mockExecutor,
        skillFileWriter: mockWriter,
      });

      const result = await facade.execute(
        makePlanResult({ skillName: "../malicious" }),
        "api-key",
        "sk-test",
      );

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty(
        "persistError",
        expect.stringContaining("Invalid skill name"),
      );
    });

    it("E-12: SKILL_ALREADY_EXISTS → persistError に記録", async () => {
      mockResolverAsIntegratedApi();
      const error = Object.assign(new Error("Skill already exists"), {
        code: "SKILL_ALREADY_EXISTS",
      });
      const mockWriter = createMockSkillFileWriter(undefined, error);
      const mockExecutor = createMockSkillExecutor({
        success: true,
        sdkMessages: makeSdkMessages(SKILL_RESPONSE_TEXT),
      });
      const facade = createFacadeReady({
        skillExecutor: mockExecutor,
        skillFileWriter: mockWriter,
      });

      const result = await facade.execute(
        makePlanResult(),
        "api-key",
        "sk-test",
      );

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty(
        "persistError",
        expect.stringContaining("Skill already exists"),
      );
    });

    it("E-13: WRITE_ERROR → persistError に記録", async () => {
      mockResolverAsIntegratedApi();
      const error = Object.assign(new Error("Failed to write files"), {
        code: "WRITE_ERROR",
      });
      const mockWriter = createMockSkillFileWriter(undefined, error);
      const mockExecutor = createMockSkillExecutor({
        success: true,
        sdkMessages: makeSdkMessages(SKILL_RESPONSE_TEXT),
      });
      const facade = createFacadeReady({
        skillExecutor: mockExecutor,
        skillFileWriter: mockWriter,
      });

      const result = await facade.execute(
        makePlanResult(),
        "api-key",
        "sk-test",
      );

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty(
        "persistError",
        expect.stringContaining("Failed to write files"),
      );
    });

    it("E-14: skillName が空文字でも Writer 側エラーを persistError に記録", async () => {
      mockResolverAsIntegratedApi();
      const mockWriter = createMockSkillFileWriter(
        undefined,
        new Error("skillName must not be empty"),
      );
      const mockExecutor = createMockSkillExecutor({
        success: true,
        sdkMessages: makeSdkMessages(SKILL_RESPONSE_TEXT),
      });
      const facade = createFacadeReady({
        skillExecutor: mockExecutor,
        skillFileWriter: mockWriter,
      });

      const result = await facade.execute(
        makePlanResult({ skillName: "" }),
        "api-key",
        "sk-test",
      );

      expect(mockWriter.persist).toHaveBeenCalledWith(
        "",
        expect.objectContaining({ skillMd: expect.any(String) }),
        { overwrite: true },
      );
      expect(result).toHaveProperty(
        "persistError",
        expect.stringContaining("skillName must not be empty"),
      );
    });

    it("E-15: parseLlmResponseToContent が throw しても persistError に記録する", async () => {
      mockResolverAsIntegratedApi();
      const parseSpy = vi
        .spyOn(parserModule, "parseLlmResponseToContent")
        .mockImplementation(() => {
          throw new Error("Unexpected parse error");
        });
      const mockWriter = createMockSkillFileWriter();
      const mockExecutor = createMockSkillExecutor({
        success: true,
        sdkMessages: makeSdkMessages(SKILL_RESPONSE_TEXT),
      });
      const facade = createFacadeReady({
        skillExecutor: mockExecutor,
        skillFileWriter: mockWriter,
      });

      const result = await facade.execute(
        makePlanResult(),
        "api-key",
        "sk-test",
      );

      expect(mockWriter.persist).not.toHaveBeenCalled();
      expect(result).toHaveProperty(
        "persistError",
        expect.stringContaining("Unexpected parse error"),
      );
      parseSpy.mockRestore();
    });

    it("E-16: skillFileWriter 未DI時に console.warn が出力される（MR-01）", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      mockResolverAsIntegratedApi();
      const mockExecutor = createMockSkillExecutor({
        success: true,
        sdkMessages: makeSdkMessages(SKILL_RESPONSE_TEXT),
      });
      const facade = createFacadeReady({
        skillExecutor: mockExecutor,
        // skillFileWriter 未DI
      });

      await facade.execute(makePlanResult(), "api-key", "sk-test");

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("skillFileWriter is not injected"),
      );
      warnSpy.mockRestore();
    });
  });
});
