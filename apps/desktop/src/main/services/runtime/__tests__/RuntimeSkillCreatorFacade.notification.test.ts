/**
 * RuntimeSkillCreatorFacade 通知機能ユニットテスト
 *
 * TASK-NOTIFICATION-SERVICE-001
 * Phase 4: テスト作成（TDD Red → Phase 5 で Green）
 *
 * TC-F-01: 完了時に MockNotificationService.calls に正しいエントリが追加される
 * TC-F-02: 失敗時に MockNotificationService.calls に失敗エントリが追加される
 * TC-F-03: notify() がエラーを投げても execute が完了ステータスを変えない
 * TC-F-04: hasRunningExecution() が実行中に true を返す
 * TC-F-05: hasRunningExecution() が完了後に false を返す
 * TC-F-06: 並行 execute が実行中のとき hasRunningExecution() が true を返す（Phase 6）
 * TC-F-07: 1 つが完了し残り 1 つが実行中のとき true を返す（Phase 6）
 * TC-F-08: 全 execute が完了したとき false を返す（Phase 6）
 *
 * TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001
 * verifyAndImproveLoop() adapter エラー時の通知テスト
 *
 * T-VL-01: improve() が llm_adapter_unavailable を返した場合 notify() を呼び出す
 * T-VL-02: improve() が adapter エラーを返した場合、戻り値の errorCode が設定される
 * T-VL-03: notificationService が未設定でも正常終了する
 * T-VL-04: notify() が例外を投げてもループ戻り値に影響しない
 * T-VL-05: improve() が success（正常）の場合、通知が呼ばれない
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { RuntimeSkillCreatorFacade } from "../RuntimeSkillCreatorFacade";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import type { INotificationService } from "../../notification/INotificationService";
import type { SkillExecutor } from "../../skill/SkillExecutor";
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

// ─── MockNotificationService ────────────────────────────────────────────────

class MockNotificationService implements INotificationService {
  readonly calls: Array<{ title: string; body: string }> = [];

  notify(title: string, body: string): void {
    this.calls.push({ title, body });
  }
}

// ─── ヘルパー関数 ────────────────────────────────────────────────────────────

function createMockSkillExecutor(options: {
  success: boolean;
  executionId?: string;
  error?: { message: string };
}): SkillExecutor {
  return {
    execute: vi.fn().mockResolvedValue({
      executionId: options.executionId ?? "exec-001",
      success: options.success,
      sdkMessages: [],
      error: options.error,
    }),
  } as unknown as SkillExecutor;
}

function makePlanResult(
  overrides?: Partial<RuntimeSkillCreatorPlanResult>,
): RuntimeSkillCreatorPlanResult {
  return {
    planId: "plan-notif-001",
    skillSpec: "test-notification-skill\nspec",
    estimatedSteps: 1,
    skillName: "test-notification-skill",
    description: "Test skill for notification",
    agents: [],
    scripts: [],
    triggers: [],
    anchors: [],
    adapterStatus: "ready",
    ...overrides,
  };
}

function mockIntegratedApiDecision() {
  vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
    type: "integrated_api",
    apiKey: "sk-test",
    permissionMode: "default",
  });
}

// ─── テストスイート ───────────────────────────────────────────────────────────

describe("RuntimeSkillCreatorFacade notification", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("TC-F-01: execute calls notificationService.notify with completion message on success", async () => {
    mockIntegratedApiDecision();

    const mockNotification = new MockNotificationService();
    const executor = createMockSkillExecutor({ success: true });
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: executor,
      notificationService: mockNotification,
      llmAdapter: createMockLLMAdapter(),
    });
    // TASK-UT-RT-01: _llmAdapterStatus ガードを通過させるため
    facade.setLLMAdapter(createMockLLMAdapter());

    const planResult = makePlanResult();
    await facade.execute(planResult, "api-key", "sk-test");

    expect(mockNotification.calls).toHaveLength(1);
    expect(mockNotification.calls[0]).toEqual({
      title: "スキル作成完了",
      body: "test-notification-skill",
    });
  });

  it("TC-F-02: execute calls notificationService.notify with failure message on error", async () => {
    mockIntegratedApiDecision();

    const mockNotification = new MockNotificationService();
    const executor = createMockSkillExecutor({
      success: false,
      error: { message: "execution failed" },
    });
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: executor,
      notificationService: mockNotification,
      llmAdapter: createMockLLMAdapter(),
    });
    // TASK-UT-RT-01: _llmAdapterStatus ガードを通過させるため
    facade.setLLMAdapter(createMockLLMAdapter());

    const planResult = makePlanResult();
    await facade.execute(planResult, "api-key", "sk-test");

    expect(mockNotification.calls).toHaveLength(1);
    expect(mockNotification.calls[0]).toEqual({
      title: "スキル作成失敗",
      body: expect.any(String),
    });
  });

  it("TC-F-02b: adapter guard で execute が即時失敗した場合も失敗通知を送る", async () => {
    const mockNotification = new MockNotificationService();
    const executor = createMockSkillExecutor({ success: true });
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: executor,
      notificationService: mockNotification,
    });
    facade.setLLMAdapterFailed("Connection refused");

    const planResult = makePlanResult();
    const result = await facade.execute(planResult, "api-key", "sk-test");

    expect(result).toEqual({
      success: false,
      error: {
        code: "llm_adapter_unavailable",
        message: "Connection refused",
      },
    });
    expect(mockNotification.calls).toHaveLength(1);
    expect(mockNotification.calls[0]).toEqual({
      title: "スキル作成失敗",
      body: "Connection refused",
    });
  });

  it("TC-F-03: execute completes normally even if notificationService.notify throws", async () => {
    mockIntegratedApiDecision();

    const throwingNotification: INotificationService = {
      notify: () => {
        throw new Error("notification failed");
      },
    };
    const executor = createMockSkillExecutor({ success: true });
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: executor,
      notificationService: throwingNotification,
      llmAdapter: createMockLLMAdapter(),
    });

    const planResult = makePlanResult();
    // execute が例外を外に伝播しないこと
    const result = await facade.execute(planResult, "api-key", "sk-test");

    expect(result).toBeDefined();
  });

  it("TC-F-04: hasRunningExecution() returns true while execute is running", () => {
    // resolve が絶対に完了しないようにする → execute は実行中のまま
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockImplementation(
      () => new Promise(() => {}),
    );

    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
      notificationService: new MockNotificationService(),
    });

    const planResult = makePlanResult();
    // activeExecutionCount++ は await より前（同期）なので、呼び出し直後に true になる
    facade.execute(planResult, "api-key", "sk-test");

    expect(facade.hasRunningExecution()).toBe(true);
  });

  it("TC-F-05: hasRunningExecution() returns false after execute completes", async () => {
    mockIntegratedApiDecision();

    const mockNotification = new MockNotificationService();
    const executor = createMockSkillExecutor({ success: true });
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: executor,
      notificationService: mockNotification,
      llmAdapter: createMockLLMAdapter(),
    });

    const planResult = makePlanResult();
    await facade.execute(planResult, "api-key", "sk-test");

    expect(facade.hasRunningExecution()).toBe(false);
  });

  it("TC-F-06: hasRunningExecution() returns true with multiple concurrent executions", () => {
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockImplementation(
      () => new Promise(() => {}),
    );

    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
      notificationService: new MockNotificationService(),
    });

    // 2 つの execute を並行開始
    facade.execute(makePlanResult({ planId: "plan-1" }), "api-key", "sk-test");
    facade.execute(makePlanResult({ planId: "plan-2" }), "api-key", "sk-test");

    expect(facade.hasRunningExecution()).toBe(true);
  });

  it("TC-F-07: hasRunningExecution() returns true when one of two executions completes", async () => {
    let resolveFirst!: (value: {
      type: "integrated_api";
      apiKey: string;
      permissionMode: string;
    }) => void;
    let callCount = 0;

    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockImplementation(
      () => {
        callCount++;
        if (callCount === 1) {
          // 1 つ目は即座に完了
          return Promise.resolve({
            type: "integrated_api" as const,
            apiKey: "sk-test",
            permissionMode: "default",
          });
        }
        // 2 つ目は永遠にペンディング
        return new Promise<{
          type: "integrated_api";
          apiKey: string;
          permissionMode: string;
        }>((r) => {
          resolveFirst = r;
        });
      },
    );

    const executor = createMockSkillExecutor({ success: true });
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: executor,
      notificationService: new MockNotificationService(),
      llmAdapter: createMockLLMAdapter(),
    });

    // 1 つ目の execute を完了させる
    await facade.execute(
      makePlanResult({ planId: "plan-1" }),
      "api-key",
      "sk-test",
    );
    // 2 つ目を開始してペンディング状態にする
    facade.execute(makePlanResult({ planId: "plan-2" }), "api-key", "sk-test");

    // 2 つ目がまだ実行中なので true
    expect(facade.hasRunningExecution()).toBe(true);

    // クリーンアップ: resolveFirst を呼ばないとプロミスがハングするが
    // vitest の afterEach で restoreAllMocks するので問題なし
    void resolveFirst;
  });

  it("TC-F-08: hasRunningExecution() returns false after all executions complete", async () => {
    mockIntegratedApiDecision();

    const executor = createMockSkillExecutor({ success: true });
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: executor,
      notificationService: new MockNotificationService(),
      llmAdapter: createMockLLMAdapter(),
    });

    await facade.execute(
      makePlanResult({ planId: "plan-1" }),
      "api-key",
      "sk-test",
    );
    await facade.execute(
      makePlanResult({ planId: "plan-2" }),
      "api-key",
      "sk-test",
    );

    expect(facade.hasRunningExecution()).toBe(false);
  });
});

// ─── verifyAndImproveLoop() adapter エラー通知テスト (T-VL) ───────────────────

describe("verifyAndImproveLoop() adapter エラー時の通知", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** improve() がアダプターエラーを返すようにするため: LLM アダプター未設定状態のままにする */
  function createWorkflowEngineMock() {
    return {
      onPhaseChanged: undefined as unknown,
      recordImproveAttempt: vi.fn(),
      getWorkflowState: vi.fn().mockReturnValue(null),
      getImproveAttemptCount: vi.fn().mockReturnValue(0),
      recordVerifyPass: vi.fn(),
      recordVerifyFailure: vi.fn(),
    };
  }

  function createVerificationEngineWithWarning() {
    return {
      verify: vi.fn().mockResolvedValue([
        {
          id: "check-001",
          layer: "layer1",
          severity: "warning" as const,
          summary: "$schema missing",
        },
      ]),
    };
  }

  /**
   * LLM アダプター未設定（"initializing" 状態）のファサードを生成する。
   * この状態では improve() が llm_adapter_unavailable エラーを返す。
   */
  function createFacadeForVL(notificationService?: INotificationService) {
    return new RuntimeSkillCreatorFacade({
      skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
      workflowEngine: createWorkflowEngineMock() as never,
      verificationEngine: createVerificationEngineWithWarning() as never,
      notificationService,
      // llmAdapter を渡さない → _llmAdapterStatus = "initializing" → improve() がエラーを返す
    });
  }

  it("T-VL-01: improve() が llm_adapter_unavailable を返した場合 notify() を呼び出す", async () => {
    const mockNotify = vi.fn();
    const facade = createFacadeForVL({ notify: mockNotify });

    await facade.verifyAndImproveLoop(
      "plan-vl-01",
      "/tmp/skill",
      "test-skill",
      "api-key",
    );

    expect(mockNotify).toHaveBeenCalledWith(
      "スキル作成失敗",
      expect.any(String),
    );
  });

  it("T-VL-02: improve() が adapter エラーを返した場合、戻り値に errorCode が設定される", async () => {
    const facade = createFacadeForVL();

    const result = await facade.verifyAndImproveLoop(
      "plan-vl-02",
      "/tmp/skill",
      "test-skill",
      "api-key",
    );

    expect(result.finalStatus).toBe("error");
    expect(result.errorCode).toBe("llm_adapter_unavailable");
  });

  it("T-VL-03: notificationService が未設定でもエラーなく正常終了する", async () => {
    // notificationService を渡さない
    const facade = createFacadeForVL(undefined);

    const result = await facade.verifyAndImproveLoop(
      "plan-vl-03",
      "/tmp/skill",
      "test-skill",
      "api-key",
    );

    expect(result.finalStatus).toBe("error");
    expect(result.errorCode).toBe("llm_adapter_unavailable");
  });

  it("T-VL-04: notify() が例外を投げてもループ戻り値に影響しない", async () => {
    const throwingNotification: INotificationService = {
      notify: () => {
        throw new Error("notification service unavailable");
      },
    };
    const facade = createFacadeForVL(throwingNotification);

    const result = await facade.verifyAndImproveLoop(
      "plan-vl-04",
      "/tmp/skill",
      "test-skill",
      "api-key",
    );

    // 通知の例外にかかわらず、improve() の errorCode が正しく伝播すること
    expect(result.finalStatus).toBe("error");
    expect(result.errorCode).toBe("llm_adapter_unavailable");
  });

  it("T-VL-05: improve() が success（正常）を返した場合、通知が呼ばれない", async () => {
    const mockNotify = vi.fn();
    const facade = createFacadeForVL({ notify: mockNotify });

    // improve() を正常系（改善提案なし）でスパイ → 通知を呼ばないパスに誘導
    vi.spyOn(facade as any, "improve").mockResolvedValueOnce({
      suggestions: [],
    });

    await facade.verifyAndImproveLoop(
      "plan-vl-05",
      "/tmp/skill",
      "test-skill",
      "api-key",
    );

    expect(mockNotify).not.toHaveBeenCalled();
  });

  it("T-VL-06: improve() 呼び出し自体が例外を投げた場合、通知は呼ばれない", async () => {
    const mockNotify = vi.fn();
    const facade = createFacadeForVL({ notify: mockNotify });

    // improve() を例外を投げるようにスパイ（アダプターエラーではなく例外）
    vi.spyOn(facade as any, "improve").mockRejectedValueOnce(
      new Error("network timeout"),
    );

    const result = await facade.verifyAndImproveLoop(
      "plan-vl-06",
      "/tmp/skill",
      "test-skill",
      "api-key",
    );

    // improve() 例外はアダプターエラーではないので通知なし
    expect(mockNotify).not.toHaveBeenCalled();
    // ループは error で終了する
    expect(result.finalStatus).toBe("error");
  });

  it("T-VL-07: improve() が terminal_handoff を返した場合、通知が呼ばれない", async () => {
    const mockNotify = vi.fn();
    const facade = createFacadeForVL({ notify: mockNotify });

    // improve() が terminal_handoff を返すようにスパイ
    vi.spyOn(facade as any, "improve").mockResolvedValueOnce({
      type: "terminal_handoff",
      guidance: { message: "Please use terminal" },
    });

    await facade.verifyAndImproveLoop(
      "plan-vl-07",
      "/tmp/skill",
      "test-skill",
      "api-key",
    );

    // terminal_handoff はアダプターエラーではないので通知なし
    expect(mockNotify).not.toHaveBeenCalled();
  });
});

// ─── T-REG-01: verifyAndImproveLoop() リグレッション確認 ─────────────────────

describe("verifyAndImproveLoop() リグレッション確認 (T-REG)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("T-REG-01: verify で全チェック PASS → ループ正常終了（通知なし）", async () => {
    const mockNotify = vi.fn();
    const mockWorkflowEngine = {
      onPhaseChanged: undefined as unknown,
      recordVerifyPass: vi.fn().mockReturnValue({
        planId: "plan-reg-01",
        currentPhase: "verify" as const,
        awaitingUserInput: null,
        verifyResult: { status: "pass", nextAction: "handoff" },
        phaseArtifacts: [],
        resumeTokenEnvelope: {
          version: "task-sdk-02-v1",
          planId: "plan-reg-01",
          currentPhase: "verify" as const,
          artifactCount: 0,
          updatedAt: new Date().toISOString(),
        },
      }),
      recordImproveAttempt: vi.fn(),
      getWorkflowState: vi.fn().mockReturnValue(null),
      getImproveAttemptCount: vi.fn().mockReturnValue(0),
    };
    const mockVerificationEngine = {
      verify: vi.fn().mockResolvedValue([
        {
          id: "L1-001",
          layer: "layer1",
          severity: "info" as const,
          summary: "OK",
        },
      ]),
    };

    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: { execute: vi.fn() } as unknown as SkillExecutor,
      workflowEngine: mockWorkflowEngine as never,
      verificationEngine: mockVerificationEngine as never,
      notificationService: { notify: mockNotify },
    });

    const result = await facade.verifyAndImproveLoop(
      "plan-reg-01",
      "/tmp/skill",
      "test-skill",
      "api-key",
    );

    expect(result.finalStatus).toBe("pass");
    expect(result.totalAttempts).toBe(0);
    expect(mockNotify).not.toHaveBeenCalled();
  });
});
