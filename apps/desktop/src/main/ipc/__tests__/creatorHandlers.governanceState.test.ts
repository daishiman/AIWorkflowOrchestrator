/**
 * creatorHandlers - governanceState / cleanupExpiredSessions null path
 *
 * Phase 7 カバレッジ補完: lines 659-661, 670-694
 * TASK-FIX-IPC-SKILL-NAME-001
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  BrowserWindow as BrowserWindowType,
  IpcMainInvokeEvent,
} from "electron";
import type { RuntimeSkillCreatorFacade } from "../../services/runtime/RuntimeSkillCreatorFacade";
import type { SkillCreatorGovernanceState } from "@repo/shared/types";

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

vi.mock(
  "../../infrastructure/security/ipc-validator",
  async (importOriginal) => {
    const original =
      await importOriginal<
        typeof import("../../infrastructure/security/ipc-validator")
      >();
    return {
      ...original,
      validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
    };
  },
);

import { IPC_CHANNELS } from "../../../preload/channels";
import {
  registerRuntimeSkillCreatorHandlers,
  unregisterRuntimeSkillCreatorHandlers,
} from "../creatorHandlers";

function createMockMainWindow(): BrowserWindowType {
  return {
    id: 1,
    isDestroyed: vi.fn(() => false),
    webContents: {
      id: 1,
      send: vi.fn(),
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
  } as unknown as BrowserWindowType;
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

const mockGovernanceState: SkillCreatorGovernanceState = {
  phase: "plan",
  activePolicy: {
    phase: "plan",
    permissionMode: "default",
    allowedTools: [],
    disallowedTools: [],
  },
  recentAuditEvents: [],
  recentDenials: [],
};

function createMockServiceWithGovernance(
  governanceState: SkillCreatorGovernanceState | null = mockGovernanceState,
  shouldThrow = false,
) {
  return {
    llmAdapterStatus: "ready",
    llmAdapterFailureReason: null,
    onAdapterStatusChanged: undefined,
    onWorkflowStateSnapshot: undefined,
    cleanupExpiredSessions: vi.fn().mockResolvedValue(3),
    getGovernanceState: shouldThrow
      ? vi.fn().mockImplementation(() => {
          throw new Error("governance error");
        })
      : vi.fn().mockReturnValue(governanceState),
  } as unknown as RuntimeSkillCreatorFacade;
}

describe("creatorHandlers - getGovernanceState (lines 670-694)", () => {
  let mainWindow: BrowserWindowType;

  beforeEach(() => {
    handlerMap.clear();
    vi.clearAllMocks();
    mainWindow = createMockMainWindow();
  });

  afterEach(() => {
    unregisterRuntimeSkillCreatorHandlers();
    handlerMap.clear();
  });

  // T-GOV-01: サービスが利用不可のとき validationError を返す
  it("runtimeSkillCreatorService が null のとき { success: false } を返す", async () => {
    registerRuntimeSkillCreatorHandlers(mainWindow, undefined);

    const handler = handlerMap.get(
      IPC_CHANNELS.SKILL_CREATOR_GET_GOVERNANCE_STATE,
    )!;
    const result = (await handler(createMockEvent())) as {
      success: boolean;
      error?: string;
    };

    expect(result.success).toBe(false);
    expect(result.error).toContain("利用できません");
  });

  // T-GOV-02: 正常系 - getGovernanceState() が状態を返す
  it("getGovernanceState() 正常系: { success: true, data: state } を返す", async () => {
    const service = createMockServiceWithGovernance(mockGovernanceState);
    registerRuntimeSkillCreatorHandlers(mainWindow, service);

    const handler = handlerMap.get(
      IPC_CHANNELS.SKILL_CREATOR_GET_GOVERNANCE_STATE,
    )!;
    const result = (await handler(createMockEvent())) as {
      success: boolean;
      data?: SkillCreatorGovernanceState;
    };

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockGovernanceState);
  });

  // T-GOV-03: getGovernanceState() が例外をスローしたとき { success: false } を返す
  it("getGovernanceState() が例外をスローしたとき { success: false, error } を返す", async () => {
    const service = createMockServiceWithGovernance(null, true);
    registerRuntimeSkillCreatorHandlers(mainWindow, service);

    const handler = handlerMap.get(
      IPC_CHANNELS.SKILL_CREATOR_GET_GOVERNANCE_STATE,
    )!;
    const result = (await handler(createMockEvent())) as {
      success: boolean;
      error?: string;
    };

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe("creatorHandlers - deleteSession null service path (lines 643-645)", () => {
  let mainWindow: BrowserWindowType;

  beforeEach(() => {
    handlerMap.clear();
    vi.clearAllMocks();
    mainWindow = createMockMainWindow();
  });

  afterEach(() => {
    unregisterRuntimeSkillCreatorHandlers();
    handlerMap.clear();
  });

  // T-DEL-01: サービスが null のとき例外をスロー
  it("runtimeSkillCreatorService が null のとき例外をスローする", async () => {
    registerRuntimeSkillCreatorHandlers(mainWindow, undefined);

    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_DELETE_SESSION)!;
    await expect(
      handler(createMockEvent(), { checkpointId: "some-id" }),
    ).rejects.toThrow("利用できません");
  });
});

describe("creatorHandlers - resumeSession error reason branches (lines 618-620)", () => {
  let mainWindow: BrowserWindowType;

  beforeEach(() => {
    handlerMap.clear();
    vi.clearAllMocks();
    mainWindow = createMockMainWindow();
  });

  afterEach(() => {
    unregisterRuntimeSkillCreatorHandlers();
    handlerMap.clear();
  });

  function createServiceWithResumeResult(
    errorReason: "not_found" | "expired" | "incompatible" | undefined,
  ) {
    return {
      llmAdapterStatus: "ready",
      llmAdapterFailureReason: null,
      onAdapterStatusChanged: undefined,
      onWorkflowStateSnapshot: undefined,
      resumeSessionWithResult: vi.fn().mockReturnValue({
        success: false,
        errorReason,
        workflowSnapshot: null,
      }),
    } as unknown as RuntimeSkillCreatorFacade;
  }

  // T-GET-DETAIL-00: getSessionDetail null service path (line 573-574)
  it("getSessionDetail: runtimeSkillCreatorService が null のとき { success: false } を返す", async () => {
    registerRuntimeSkillCreatorHandlers(mainWindow, undefined);

    const handler = handlerMap.get(
      IPC_CHANNELS.SKILL_CREATOR_GET_SESSION_DETAIL,
    )!;
    const result = (await handler(createMockEvent(), {
      checkpointId: "ckpt-001",
    })) as { success: boolean; error: string };

    expect(result.success).toBe(false);
    expect(result.error).toContain("利用できません");
  });

  // T-RESUME-00: サービスが null のとき { success: false, errorReason: "not_found" } を返す
  it("runtimeSkillCreatorService が null のとき { success: false } を返す", async () => {
    registerRuntimeSkillCreatorHandlers(mainWindow, undefined);

    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION)!;
    const result = (await handler(createMockEvent(), {
      checkpointId: "ckpt-001",
    })) as { success: boolean; error: string; errorReason: string };

    expect(result.success).toBe(false);
    expect(result.error).toContain("利用できません");
    expect(result.errorReason).toBe("not_found");
  });

  // T-RESUME-01: errorReason === "not_found" のとき「セッションが見つかりません」
  it("reason not_found のとき「セッションが見つかりません」を返す", async () => {
    const service = createServiceWithResumeResult("not_found");
    registerRuntimeSkillCreatorHandlers(mainWindow, service);

    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION)!;
    const result = (await handler(createMockEvent(), {
      checkpointId: "ckpt-001",
    })) as { success: boolean; error: string };

    expect(result.success).toBe(false);
    expect(result.error).toBe("セッションが見つかりません");
  });

  // T-RESUME-01a: errorReason === "expired" のとき「有効期限が切れています」
  it("reason expired のとき「有効期限が切れています」を返す", async () => {
    const service = createServiceWithResumeResult("expired");
    registerRuntimeSkillCreatorHandlers(mainWindow, service);

    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION)!;
    const result = (await handler(createMockEvent(), {
      checkpointId: "ckpt-001",
    })) as { success: boolean; error: string };

    expect(result.success).toBe(false);
    expect(result.error).toContain("有効期限が切れています");
  });

  // T-RESUME-01b: errorReason === "incompatible" のとき「互換性がありません」
  it("reason incompatible のとき「互換性がありません」を返す", async () => {
    const service = createServiceWithResumeResult("incompatible");
    registerRuntimeSkillCreatorHandlers(mainWindow, service);

    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION)!;
    const result = (await handler(createMockEvent(), {
      checkpointId: "ckpt-001",
    })) as { success: boolean; error: string };

    expect(result.success).toBe(false);
    expect(result.error).toContain("互換性がありません");
  });

  // T-RESUME-02: errorReason が undefined のとき「セッションの復元に失敗しました」
  it("reason undefined のとき「セッションの復元に失敗しました」を返す", async () => {
    const service = createServiceWithResumeResult(undefined);
    registerRuntimeSkillCreatorHandlers(mainWindow, service);

    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION)!;
    const result = (await handler(createMockEvent(), {
      checkpointId: "ckpt-001",
    })) as { success: boolean; error: string };

    expect(result.success).toBe(false);
    expect(result.error).toBe("セッションの復元に失敗しました");
  });
});

describe("creatorHandlers - cleanupExpiredSessions null service path (lines 659-661)", () => {
  let mainWindow: BrowserWindowType;

  beforeEach(() => {
    handlerMap.clear();
    vi.clearAllMocks();
    mainWindow = createMockMainWindow();
  });

  afterEach(() => {
    unregisterRuntimeSkillCreatorHandlers();
    handlerMap.clear();
  });

  // T-CLEANUP-01: サービスが null のとき 0 を返す
  it("runtimeSkillCreatorService が null のとき 0 を返す", async () => {
    registerRuntimeSkillCreatorHandlers(mainWindow, undefined);

    const handler = handlerMap.get(
      IPC_CHANNELS.SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS,
    )!;
    const result = await handler(createMockEvent());

    expect(result).toBe(0);
  });

  // T-CLEANUP-02: サービスが有効のとき cleanupExpiredSessions() の戻り値を返す
  it("サービスが有効のとき cleanupExpiredSessions() の結果を返す", async () => {
    const service = createMockServiceWithGovernance();
    registerRuntimeSkillCreatorHandlers(mainWindow, service);

    const handler = handlerMap.get(
      IPC_CHANNELS.SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS,
    )!;
    const result = await handler(createMockEvent());

    expect(result).toBe(3);
  });
});
