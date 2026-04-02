/**
 * creatorHandlers - skill-creator:execute-plan fire-and-forget 動作検証
 *
 * TASK-FIX-EXECUTE-PLAN-FF-001 Phase 4: TDD Red テスト
 * TC-T2-01: invoke が 100ms 以内に { accepted: true, planId } を返す
 * TC-T2-02: バックグラウンドで executeAsync が呼ばれる
 * TC-T2-03: executeAsync がエラーを throw しても invoke は正常に返る
 * TC-T2-04: 複数の planId が並列で invoke されてもそれぞれ受け付けられる
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  BrowserWindow as BrowserWindowType,
  IpcMainInvokeEvent,
} from "electron";

const handlerMap = new Map<string, (...args: unknown[]) => unknown>();

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(
      (channel: string, handler: (...args: unknown[]) => unknown) => {
        handlerMap.set(channel, handler);
      },
    ),
    removeHandler: vi.fn((channel: string) => {
      handlerMap.delete(channel);
    }),
  },
  BrowserWindow: {
    fromWebContents: vi.fn(),
    getAllWindows: vi.fn(() => []),
  },
}));

import { BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../../preload/channels";
import {
  registerRuntimeSkillCreatorHandlers,
  unregisterRuntimeSkillCreatorHandlers,
} from "../creatorHandlers";

function createMockMainWindow() {
  return {
    id: 1,
    webContents: {
      id: 1,
      getType: () => "window",
      isDevToolsOpened: () => false,
      send: vi.fn(),
    },
    isDestroyed: () => false,
  };
}

function createMockEvent(webContentsId = 1): IpcMainInvokeEvent {
  return {
    sender: {
      id: webContentsId,
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
  } as unknown as IpcMainInvokeEvent;
}

describe("creatorHandlers - skill-creator:execute-plan fire-and-forget", () => {
  let mockFacade: Record<string, ReturnType<typeof vi.fn>>;
  let invokeExecutePlan: (req: {
    planId: string;
    skillSpec?: string;
  }) => Promise<unknown>;

  beforeEach(() => {
    vi.clearAllMocks();
    handlerMap.clear();
    (BrowserWindow.fromWebContents as ReturnType<typeof vi.fn>).mockReturnValue(
      createMockMainWindow(),
    );

    mockFacade = {
      plan: vi.fn(),
      execute: vi.fn(),
      executeAsync: vi.fn().mockResolvedValue(undefined),
      improve: vi.fn(),
      applyImprovement: vi.fn(),
      getWorkflowStateSnapshot: vi.fn().mockReturnValue(undefined),
      submitUserInput: vi.fn(),
      getVerifyDetail: vi.fn(),
      reverifyWorkflow: vi.fn(),
      normalizeSdkStream: vi.fn(),
      listSessions: vi.fn().mockReturnValue([]),
      getSessionDetail: vi.fn(),
      resumeSession: vi.fn(),
      deleteSession: vi.fn(),
      getGovernanceState: vi.fn(),
    };

    registerRuntimeSkillCreatorHandlers(
      createMockMainWindow() as unknown as BrowserWindowType,
      mockFacade as never,
    );

    invokeExecutePlan = async (req) => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN);
      return handler?.(createMockEvent(), {
        skillSpec: "some skill spec",
        ...req,
      });
    };
  });

  afterEach(() => {
    unregisterRuntimeSkillCreatorHandlers();
  });

  it("TC-T2-01: execute-plan invoke が 100ms 以内に { accepted: true, planId } を返す", async () => {
    const slowExecution = new Promise<void>((resolve) =>
      setTimeout(resolve, 10_000),
    );
    mockFacade.executeAsync.mockReturnValue(slowExecution);

    const startTime = Date.now();
    const result = await invokeExecutePlan({ planId: "plan-001" });
    const elapsed = Date.now() - startTime;

    expect(result).toEqual({ accepted: true, planId: "plan-001" });
    expect(elapsed).toBeLessThan(100);
  });

  it("TC-T2-02: バックグラウンドで executeAsync が呼ばれる", async () => {
    mockFacade.executeAsync.mockResolvedValue(undefined);

    await invokeExecutePlan({ planId: "plan-001" });

    expect(mockFacade.executeAsync).toHaveBeenCalledWith(
      "plan-001",
      expect.any(Object),
    );
  });

  it("TC-T2-03: executeAsync がエラーを throw しても invoke は正常に返る", async () => {
    mockFacade.executeAsync.mockImplementation(async () => {
      throw new Error("Agent SDK error");
    });

    const result = await invokeExecutePlan({ planId: "plan-001" });

    expect(result).toEqual({ accepted: true, planId: "plan-001" });
  });

  it("TC-T2-04: 複数の planId が並列で invoke されてもそれぞれ受け付けられる", async () => {
    const [result1, result2] = await Promise.all([
      invokeExecutePlan({ planId: "plan-001" }),
      invokeExecutePlan({ planId: "plan-002" }),
    ]);

    expect(result1).toEqual({ accepted: true, planId: "plan-001" });
    expect(result2).toEqual({ accepted: true, planId: "plan-002" });
  });

  it("TC-T2-05: 1回目の executeAsync がエラーになった後、2回目の invoke が正常に動作する", async () => {
    mockFacade.executeAsync
      .mockRejectedValueOnce(new Error("first execution failed"))
      .mockResolvedValueOnce(undefined);

    const result1 = await invokeExecutePlan({ planId: "plan-001" });
    const result2 = await invokeExecutePlan({ planId: "plan-002" });

    expect(result1).toEqual({ accepted: true, planId: "plan-001" });
    expect(result2).toEqual({ accepted: true, planId: "plan-002" });
    expect(mockFacade.executeAsync).toHaveBeenCalledTimes(2);
  });

  it("TC-T2-06: planId が req から正しく抽出されて executeAsync に渡される", async () => {
    mockFacade.executeAsync.mockResolvedValue(undefined);
    const planId = "unique-plan-id-abc-123";

    await invokeExecutePlan({ planId });

    expect(mockFacade.executeAsync).toHaveBeenCalledWith(
      planId,
      expect.objectContaining({ planId }),
    );
  });

  it("TC-T2-07: 10 件の並列 invoke が全て 100ms 以内に { accepted: true } を返す", async () => {
    const neverResolves = () => new Promise<void>(() => {});
    mockFacade.executeAsync.mockImplementation(neverResolves);

    const startTime = Date.now();
    const results = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        invokeExecutePlan({ planId: `plan-${i.toString().padStart(3, "0")}` }),
      ),
    );
    const elapsed = Date.now() - startTime;

    expect(elapsed).toBeLessThan(100);
    results.forEach((result, i) => {
      expect(result).toEqual({
        accepted: true,
        planId: `plan-${i.toString().padStart(3, "0")}`,
      });
    });
  });
});
