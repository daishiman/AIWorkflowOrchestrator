/**
 * RuntimeSkillCreatorFacade execute() persist integration tests
 *
 * TASK-P0-05: SkillFileWriter.persist() 連携テスト
 * - F-01 ~ F-06: 基本 persist フロー
 * - E-10 ~ E-16: persist エラーパターン
 * - E-21 ~ E-29: パストラバーサル / ロールバック / 回帰ガード
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { RuntimeSkillCreatorFacade } from "../RuntimeSkillCreatorFacade";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import * as parserModule from "../parseLlmResponseToContent";
import type { SkillExecutor } from "../../skill/SkillExecutor";
import type { ILLMAdapter } from "../../../adapters/llm/types";
import type {
  SkillFileWriter,
  PersistResult,
} from "../../skill/SkillFileWriter";
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
        llmAdapter: createMockLLMAdapter(),
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
        llmAdapter: createMockLLMAdapter(),
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
        llmAdapter: createMockLLMAdapter(),
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
        llmAdapter: createMockLLMAdapter(),
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
        llmAdapter: createMockLLMAdapter(),
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
        llmAdapter: createMockLLMAdapter(),
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
        llmAdapter: createMockLLMAdapter(),
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
        llmAdapter: createMockLLMAdapter(),
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
        llmAdapter: createMockLLMAdapter(),
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
        llmAdapter: createMockLLMAdapter(),
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
        llmAdapter: createMockLLMAdapter(),
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
        llmAdapter: createMockLLMAdapter(),
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
        llmAdapter: createMockLLMAdapter(),
        // skillFileWriter 未DI
      });

      await facade.execute(makePlanResult(), "api-key", "sk-test");

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("skillFileWriter is not injected"),
      );
      warnSpy.mockRestore();
    });
  });

  // --- Phase 6: パストラバーサル統合テスト ---

  describe("パストラバーサル統合テスト", () => {
    it("E-21: '../malicious' skillName で persistError に PATH_TRAVERSAL が含まれる", async () => {
      mockResolverAsIntegratedApi();
      const error = Object.assign(
        new Error("PATH_TRAVERSAL: Invalid skill name: ../malicious"),
        { code: "PATH_TRAVERSAL" },
      );
      const mockWriter = createMockSkillFileWriter(undefined, error);
      const mockExecutor = createMockSkillExecutor({
        success: true,
        sdkMessages: makeSdkMessages(SKILL_RESPONSE_TEXT),
      });
      const facade = createFacadeReady({
        skillExecutor: mockExecutor,
        skillFileWriter: mockWriter,
        llmAdapter: createMockLLMAdapter(),
      });

      const result = await facade.execute(
        makePlanResult({ skillName: "../malicious" }),
        "api-key",
        "sk-test",
      );

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty(
        "persistError",
        expect.stringContaining("PATH_TRAVERSAL"),
      );
    });

    it("E-22: 'dir/subdir' skillName で persistError に PATH_TRAVERSAL が含まれる", async () => {
      mockResolverAsIntegratedApi();
      const error = Object.assign(
        new Error("PATH_TRAVERSAL: Invalid skill name: dir/subdir"),
        { code: "PATH_TRAVERSAL" },
      );
      const mockWriter = createMockSkillFileWriter(undefined, error);
      const mockExecutor = createMockSkillExecutor({
        success: true,
        sdkMessages: makeSdkMessages(SKILL_RESPONSE_TEXT),
      });
      const facade = createFacadeReady({
        skillExecutor: mockExecutor,
        skillFileWriter: mockWriter,
        llmAdapter: createMockLLMAdapter(),
      });

      const result = await facade.execute(
        makePlanResult({ skillName: "dir/subdir" }),
        "api-key",
        "sk-test",
      );

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty(
        "persistError",
        expect.stringContaining("PATH_TRAVERSAL"),
      );
    });

    it("E-23: null バイト含む skillName で persistError が設定される", async () => {
      mockResolverAsIntegratedApi();
      const error = Object.assign(
        new Error("Invalid skill name contains null byte"),
        { code: "PATH_TRAVERSAL" },
      );
      const mockWriter = createMockSkillFileWriter(undefined, error);
      const mockExecutor = createMockSkillExecutor({
        success: true,
        sdkMessages: makeSdkMessages(SKILL_RESPONSE_TEXT),
      });
      const facade = createFacadeReady({
        skillExecutor: mockExecutor,
        skillFileWriter: mockWriter,
        llmAdapter: createMockLLMAdapter(),
      });

      const result = await facade.execute(
        makePlanResult({ skillName: "skill\x00name" }),
        "api-key",
        "sk-test",
      );

      expect(result).toHaveProperty("success", true);
      expect(result.persistError).toBeTruthy();
    });
  });

  // --- Phase 6: ロールバック統合テスト ---

  describe("ロールバック統合テスト", () => {
    it("E-24: 複数ファイル書き出し中の部分失敗で persistError が記録される", async () => {
      mockResolverAsIntegratedApi();
      const error = Object.assign(
        new Error("WRITE_ERROR: partial write failure, rollback executed"),
        { code: "WRITE_ERROR" },
      );
      const mockWriter = createMockSkillFileWriter(undefined, error);
      const mockExecutor = createMockSkillExecutor({
        success: true,
        sdkMessages: makeSdkMessages(SKILL_RESPONSE_TEXT),
      });
      const facade = createFacadeReady({
        skillExecutor: mockExecutor,
        skillFileWriter: mockWriter,
        llmAdapter: createMockLLMAdapter(),
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

    it("E-25: ロールバック自体が失敗した場合のエラー伝播", async () => {
      mockResolverAsIntegratedApi();
      const error = Object.assign(
        new Error(
          "WRITE_ERROR: partial write failure, rollback also failed: EACCES",
        ),
        { code: "WRITE_ERROR" },
      );
      const mockWriter = createMockSkillFileWriter(undefined, error);
      const mockExecutor = createMockSkillExecutor({
        success: true,
        sdkMessages: makeSdkMessages(SKILL_RESPONSE_TEXT),
      });
      const facade = createFacadeReady({
        skillExecutor: mockExecutor,
        skillFileWriter: mockWriter,
        llmAdapter: createMockLLMAdapter(),
      });

      const result = await facade.execute(
        makePlanResult(),
        "api-key",
        "sk-test",
      );

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty(
        "persistError",
        expect.stringContaining("rollback also failed"),
      );
    });
  });

  // --- Phase 6: 回帰ガードテスト ---

  describe("回帰ガードテスト", () => {
    it("E-26: executeResult に persistResult フィールドが常に存在する", async () => {
      mockResolverAsIntegratedApi();
      const mockWriter = createMockSkillFileWriter();
      const mockExecutor = createMockSkillExecutor({
        success: true,
        sdkMessages: makeSdkMessages(SKILL_RESPONSE_TEXT),
      });
      const facade = createFacadeReady({
        skillExecutor: mockExecutor,
        skillFileWriter: mockWriter,
        llmAdapter: createMockLLMAdapter(),
      });

      const result = await facade.execute(
        makePlanResult(),
        "api-key",
        "sk-test",
      );

      expect(result).toHaveProperty("persistResult");
    });

    it("E-27: executeResult に persistError フィールドが常に存在する", async () => {
      mockResolverAsIntegratedApi();
      const mockWriter = createMockSkillFileWriter();
      const mockExecutor = createMockSkillExecutor({
        success: true,
        sdkMessages: makeSdkMessages(SKILL_RESPONSE_TEXT),
      });
      const facade = createFacadeReady({
        skillExecutor: mockExecutor,
        skillFileWriter: mockWriter,
        llmAdapter: createMockLLMAdapter(),
      });

      const result = await facade.execute(
        makePlanResult(),
        "api-key",
        "sk-test",
      );

      expect(result).toHaveProperty("persistError");
    });

    it("E-28: parseLlmResponseToContent が null を返す場合 persist は未呼出", async () => {
      mockResolverAsIntegratedApi();
      vi.spyOn(parserModule, "parseLlmResponseToContent").mockReturnValue(null);
      const mockWriter = createMockSkillFileWriter();
      const mockExecutor = createMockSkillExecutor({
        success: true,
        sdkMessages: makeSdkMessages("no code blocks"),
      });
      const facade = createFacadeReady({
        skillExecutor: mockExecutor,
        skillFileWriter: mockWriter,
        llmAdapter: createMockLLMAdapter(),
      });

      const result = await facade.execute(
        makePlanResult(),
        "api-key",
        "sk-test",
      );

      expect(mockWriter.persist).not.toHaveBeenCalled();
      expect(result).toHaveProperty("persistResult", null);
    });

    it("E-29: skillFileWriter 未注入時も execute 全体は正常完了する", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      mockResolverAsIntegratedApi();
      const mockExecutor = createMockSkillExecutor({
        success: true,
        sdkMessages: makeSdkMessages(SKILL_RESPONSE_TEXT),
      });
      const facade = createFacadeReady({
        skillExecutor: mockExecutor,
        llmAdapter: createMockLLMAdapter(),
      });

      const result = await facade.execute(
        makePlanResult(),
        "api-key",
        "sk-test",
      );

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("persistResult", null);
      expect(result).toHaveProperty("persistError", null);
      warnSpy.mockRestore();
    });
  });
});
