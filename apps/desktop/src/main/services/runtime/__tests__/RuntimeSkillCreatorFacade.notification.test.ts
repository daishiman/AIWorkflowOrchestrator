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
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { RuntimeSkillCreatorFacade } from "../RuntimeSkillCreatorFacade";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import type { INotificationService } from "../../notification/INotificationService";
import type { SkillExecutor } from "../../skill/SkillExecutor";
import type { RuntimeSkillCreatorPlanResult } from "@repo/shared/types";

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
    });

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
    });

    const planResult = makePlanResult();
    await facade.execute(planResult, "api-key", "sk-test");

    expect(mockNotification.calls).toHaveLength(1);
    expect(mockNotification.calls[0]).toEqual({
      title: "スキル作成失敗",
      body: expect.any(String),
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
