/**
 * RuntimeSkillCreatorFacade stub elimination tests
 *
 * TASK-RT-02: stub-response-error-notification
 * Phase 5 T-02 / Phase 6 拡充
 *
 * false-success スタブ排除後の回帰テスト。
 * plan() / execute() が degraded 条件で explicit error を返すことを検証する。
 *
 * TC-10: llmAdapter 未注入時の execute() → success:false を返す
 * TC-11: llmAdapter 注入済みの execute() → skillExecutor.execute() に到達する（回帰）
 * TC-12: plan() で llmAdapter 未注入 → success:false（既存実装の回帰）
 * TC-13: plan() で resourceLoader 未注入 → success:false（既存実装の回帰）
 * TC-14: terminal_handoff 経路は execute 抑止対象にならない
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RuntimeSkillCreatorFacade } from "../RuntimeSkillCreatorFacade";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import { SkillCreatorWorkflowEngine } from "../SkillCreatorWorkflowEngine";
import type { SkillExecutor } from "../../skill/SkillExecutor";
import type { ILLMAdapter } from "../../../adapters/llm/types";
import type { RuntimeSkillCreatorPlanResult as SkillPlanResult } from "@repo/shared";

// --- Mock factories ---

function createMockLLMAdapter(): ILLMAdapter {
  return {
    providerId: "anthropic" as ILLMAdapter["providerId"],
    sendChat: vi.fn(),
    streamChat: vi.fn(),
    checkHealth: vi.fn(),
  } as ILLMAdapter;
}

function createMockSkillExecutor(): SkillExecutor {
  return {
    execute: vi.fn(),
  } as unknown as SkillExecutor;
}

/** execute() 呼び出しに最低限必要な SkillPlanResult を生成する */
function createMinimalPlanResult(
  overrides: Partial<SkillPlanResult> = {},
): SkillPlanResult {
  return {
    planId: "plan-test-001",
    skillSpec: "test-skill\nspec content",
    skillName: "test-skill",
    description: "テスト用スキル",
    estimatedSteps: 3,
    agents: [],
    scripts: [],
    triggers: [],
    anchors: [],
    ...overrides,
  };
}

// ------------------------------------------------------------------
// TC-10: llmAdapter 未注入時の execute() は success:false を返す
// ------------------------------------------------------------------
describe("TC-10: execute() — llmAdapter 未注入時は explicit error を返す", () => {
  let workflowEngine: SkillCreatorWorkflowEngine;
  let mockSkillExecutor: SkillExecutor;
  let facade: RuntimeSkillCreatorFacade;

  beforeEach(() => {
    workflowEngine = new SkillCreatorWorkflowEngine();
    mockSkillExecutor = createMockSkillExecutor();
    facade = new RuntimeSkillCreatorFacade({
      skillExecutor: mockSkillExecutor,
      workflowEngine,
      // llmAdapter 未注入
    });
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("execute() が success:false を返す", async () => {
    const planResult = createMinimalPlanResult();
    const result = await facade.execute(planResult, "api-key", "sk-test");

    expect(result).toMatchObject({
      success: false,
    });
  });

  it("error メッセージに LLM アダプタ未利用の旨が含まれる", async () => {
    const planResult = createMinimalPlanResult();
    const result = await facade.execute(planResult, "api-key", "sk-test");

    expect((result as { success: false; error?: string }).error).toContain(
      "LLM アダプタが利用できません",
    );
  });

  it("skillExecutor.execute() は呼ばれない", async () => {
    const planResult = createMinimalPlanResult();
    await facade.execute(planResult, "api-key", "sk-test");

    expect(mockSkillExecutor.execute).not.toHaveBeenCalled();
  });

  it("workflowEngine.recordExecutionFailure() が呼ばれる", async () => {
    const recordFailureSpy = vi.spyOn(workflowEngine, "recordExecutionFailure");
    const planResult = createMinimalPlanResult();
    await facade.execute(planResult, "api-key", "sk-test");

    expect(recordFailureSpy).toHaveBeenCalledTimes(1);
    expect(recordFailureSpy).toHaveBeenCalledWith(
      planResult.planId,
      expect.objectContaining({
        reason: "execution_error",
      }),
    );
  });

  it("governance audit に session_start / session_end が記録される", async () => {
    const planResult = createMinimalPlanResult({
      planId: "plan-audit-001",
    });
    await facade.execute(planResult, "api-key", "sk-test");

    const auditSink = (
      facade as unknown as {
        auditSink: {
          getEventsBySession: (
            sessionId: string,
          ) => Array<{ eventType: string }>;
        };
      }
    ).auditSink;
    const events = auditSink.getEventsBySession(planResult.planId);

    expect(events.map((event) => event.eventType)).toEqual([
      "session_start",
      "session_end",
    ]);
  });
});

// ------------------------------------------------------------------
// TC-11: llmAdapter 注入済みの execute() は skillExecutor に到達する（回帰）
// ------------------------------------------------------------------
describe("TC-11: execute() — llmAdapter 注入済み時は skillExecutor.execute() に到達する", () => {
  let mockSkillExecutor: SkillExecutor;
  let facade: RuntimeSkillCreatorFacade;

  beforeEach(() => {
    mockSkillExecutor = createMockSkillExecutor();
    facade = new RuntimeSkillCreatorFacade({
      skillExecutor: mockSkillExecutor,
      llmAdapter: createMockLLMAdapter(),
    });
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    // skillExecutor.execute() の戻り値をモック
    (mockSkillExecutor.execute as ReturnType<typeof vi.fn>).mockResolvedValue({
      executionId: "exec-001",
      success: true,
      sdkMessages: [],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("skillExecutor.execute() が呼ばれる", async () => {
    const planResult = createMinimalPlanResult();
    await facade.execute(planResult, "api-key", "sk-test");

    expect(mockSkillExecutor.execute).toHaveBeenCalledTimes(1);
  });
});

// ------------------------------------------------------------------
// TC-12: plan() — llmAdapter 未注入時は explicit error を返す（回帰）
// ------------------------------------------------------------------
describe("TC-12: plan() — llmAdapter 未注入時は explicit error を返す（回帰）", () => {
  let mockSkillExecutor: SkillExecutor;

  beforeEach(() => {
    mockSkillExecutor = createMockSkillExecutor();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("success:false かつ code === 'llm_adapter_unavailable' を返す", async () => {
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: mockSkillExecutor,
      // llmAdapter 未注入
    });

    const result = await facade.plan("テスト入力", "api-key", "sk-test");

    expect(result).toMatchObject({
      success: false,
      error: {
        code: "llm_adapter_unavailable",
      },
    });
  });

  it("error.message が設定されている", async () => {
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: mockSkillExecutor,
    });

    const result = await facade.plan("テスト入力", "api-key", "sk-test");

    expect(
      (result as { success: false; error: { message: string } }).error.message,
    ).toBeTruthy();
  });
});

// ------------------------------------------------------------------
// TC-13: plan() — resourceLoader 未注入時は explicit error を返す（回帰）
// ------------------------------------------------------------------
describe("TC-13: plan() — resourceLoader 未注入時は explicit error を返す（回帰）", () => {
  let mockSkillExecutor: SkillExecutor;
  let mockLLMAdapter: ILLMAdapter;

  beforeEach(() => {
    mockSkillExecutor = createMockSkillExecutor();
    mockLLMAdapter = createMockLLMAdapter();
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("success:false かつ code === 'resource_loader_unavailable' を返す", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_124);
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: mockSkillExecutor,
      llmAdapter: mockLLMAdapter,
      // resourceLoader 未注入
    });

    const result = await facade.plan("テスト入力", "api-key", "sk-test");

    expect(result).toMatchObject({
      success: false,
      error: {
        code: "resource_loader_unavailable",
      },
    });

    const auditSink = (
      facade as unknown as {
        auditSink: {
          getEventsBySession: (
            sessionId: string,
          ) => Array<{ eventType: string }>;
        };
      }
    ).auditSink;
    const events = auditSink.getEventsBySession("plan-1710000000124");
    expect(events.map((event) => event.eventType)).toEqual([
      "session_start",
      "session_end",
    ]);
  });
});

// ------------------------------------------------------------------
// TC-14: terminal_handoff 経路は execute 抑止対象にならない
// ------------------------------------------------------------------
describe("TC-14: terminal_handoff 経路は execute 抑止対象にならない", () => {
  let mockSkillExecutor: SkillExecutor;

  beforeEach(() => {
    mockSkillExecutor = createMockSkillExecutor();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("llmAdapter 未注入でも terminal_handoff 判定時は type:'terminal_handoff' を返す", async () => {
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: mockSkillExecutor,
      // llmAdapter 未注入
    });
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "terminal_handoff",
      bundle: {
        launcher: "claude",
        promptBundle: "prompt",
        cwd: "/tmp",
        suggestedCommand: 'claude -p "test"',
        manualRetryRule: "retry",
      },
    });

    const planResult = createMinimalPlanResult();
    const result = await facade.execute(planResult, "subscription", null);

    expect(result).toMatchObject({ type: "terminal_handoff" });

    const auditSink = (
      facade as unknown as {
        auditSink: {
          getEventsBySession: (
            sessionId: string,
          ) => Array<{ eventType: string }>;
        };
      }
    ).auditSink;
    const events = auditSink.getEventsBySession(planResult.planId);
    expect(events.map((event) => event.eventType)).toEqual([
      "session_start",
      "session_end",
    ]);
  });

  it("llmAdapter 未注入でも terminal_handoff 判定時は skillExecutor.execute() は呼ばれない", async () => {
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: mockSkillExecutor,
      // llmAdapter 未注入
    });
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "terminal_handoff",
      bundle: {
        launcher: "claude",
        promptBundle: "prompt",
        cwd: "/tmp",
        suggestedCommand: 'claude -p "test"',
        manualRetryRule: "retry",
      },
    });

    const planResult = createMinimalPlanResult();
    await facade.execute(planResult, "subscription", null);

    expect(mockSkillExecutor.execute).not.toHaveBeenCalled();
  });
});
