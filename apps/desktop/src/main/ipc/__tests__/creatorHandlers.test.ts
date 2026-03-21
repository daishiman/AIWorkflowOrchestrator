import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

import { ipcMain } from "electron";
import {
  CREATOR_CHANNELS,
  registerCreatorHandlers,
  unregisterCreatorHandlers,
} from "../creatorHandlers.js";

type RegisteredHandler = (
  event: Electron.IpcMainInvokeEvent,
  args: Record<string, unknown>,
) => Promise<unknown>;

const createMockCreatorService = () => ({
  plan: vi.fn(),
  execute: vi.fn(),
  improve: vi.fn(),
});

describe("creatorHandlers", () => {
  let handlers: Map<string, RegisteredHandler>;
  let creatorService: ReturnType<typeof createMockCreatorService>;

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = new Map();
    creatorService = createMockCreatorService();

    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: RegisteredHandler) => {
        handlers.set(channel, handler);
      },
    );
  });

  afterEach(() => {
    unregisterCreatorHandlers();
  });

  it("3つの creator channel を登録する", () => {
    registerCreatorHandlers(creatorService as never);

    expect(handlers.has(CREATOR_CHANNELS.CREATOR_PLAN)).toBe(true);
    expect(handlers.has(CREATOR_CHANNELS.CREATOR_EXECUTE)).toBe(true);
    expect(handlers.has(CREATOR_CHANNELS.CREATOR_IMPROVE)).toBe(true);
  });

  it("plan handler が raw args を ExecutionCapabilityInput に正規化する", async () => {
    creatorService.plan.mockResolvedValue({
      planId: "plan-001",
      skillSpec: "prompt",
      estimatedSteps: 3,
    });
    registerCreatorHandlers(creatorService as never);

    const handler = handlers.get(CREATOR_CHANNELS.CREATOR_PLAN);
    expect(handler).toBeDefined();

    await handler!({} as Electron.IpcMainInvokeEvent, {
      prompt: "  prompt  ",
      authMode: "subscription",
      apiKey: null,
      apiKeyDegraded: true,
    });

    expect(creatorService.plan).toHaveBeenCalledWith("prompt", {
      apiKeyValid: false,
      subscriptionValid: true,
      apiKeyDegraded: true,
    });
  });

  it("execute handler は terminal handoff 結果を透過する", async () => {
    creatorService.execute.mockResolvedValue({
      type: "terminal_handoff",
      bundle: {
        launcher: "claude",
        promptBundle: "bundle",
        cwd: "/tmp",
        suggestedCommand: 'claude -p "bundle"',
        manualRetryRule: "retry",
      },
    });
    registerCreatorHandlers(creatorService as never);

    const handler = handlers.get(CREATOR_CHANNELS.CREATOR_EXECUTE);
    expect(handler).toBeDefined();

    const result = await handler!({} as Electron.IpcMainInvokeEvent, {
      planId: "plan-001",
      skillSpec: "spec body",
      authMode: "subscription",
      apiKey: "",
    });

    expect(creatorService.execute).toHaveBeenCalledWith(
      {
        planId: "plan-001",
        skillSpec: "spec body",
        estimatedSteps: 3,
      },
      {
        apiKeyValid: false,
        subscriptionValid: true,
        apiKeyDegraded: false,
      },
    );
    expect(result).toEqual({
      success: true,
      data: {
        type: "terminal_handoff",
        bundle: {
          launcher: "claude",
          promptBundle: "bundle",
          cwd: "/tmp",
          suggestedCommand: 'claude -p "bundle"',
          manualRetryRule: "retry",
        },
      },
    });
  });

  it("improve handler が apiKeyDegraded 未指定時に false を補完する", async () => {
    creatorService.improve.mockResolvedValue({
      improveId: "improve-001",
      suggestions: ["a"],
    });
    registerCreatorHandlers(creatorService as never);

    const handler = handlers.get(CREATOR_CHANNELS.CREATOR_IMPROVE);
    expect(handler).toBeDefined();

    await handler!({} as Electron.IpcMainInvokeEvent, {
      skillName: "skill-a",
      feedback: "feedback",
      authMode: "api-key",
      apiKey: "sk-test",
    });

    expect(creatorService.improve).toHaveBeenCalledWith("skill-a", "feedback", {
      apiKeyValid: true,
      subscriptionValid: false,
      apiKeyDegraded: false,
    });
  });

  it("unregisterCreatorHandlers が全 channel を解除する", () => {
    unregisterCreatorHandlers();

    expect(ipcMain.removeHandler).toHaveBeenCalledWith(
      CREATOR_CHANNELS.CREATOR_PLAN,
    );
    expect(ipcMain.removeHandler).toHaveBeenCalledWith(
      CREATOR_CHANNELS.CREATOR_EXECUTE,
    );
    expect(ipcMain.removeHandler).toHaveBeenCalledWith(
      CREATOR_CHANNELS.CREATOR_IMPROVE,
    );
  });
});
