import { beforeEach, describe, expect, it, vi } from "vitest";
import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import {
  registerTerminalHandlers,
  type TerminalHandlerDependencies,
} from "./terminalHandlers";

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}));

describe("terminalHandlers", () => {
  const handlers = new Map<string, (...args: unknown[]) => Promise<unknown>>();

  beforeEach(() => {
    handlers.clear();
    vi.clearAllMocks();
    vi.mocked(ipcMain.handle).mockImplementation((channel, handler) => {
      handlers.set(
        channel,
        handler as (...args: unknown[]) => Promise<unknown>,
      );
      return undefined as unknown as void;
    });
  });

  it("TERMINAL_OPEN ハンドラーを登録する", () => {
    registerTerminalHandlers();

    expect(ipcMain.handle).toHaveBeenCalledWith(
      IPC_CHANNELS.TERMINAL_OPEN,
      expect.any(Function),
    );
  });

  it("macOS では osascript 経由で Terminal.app を起動する", async () => {
    const spawnMock = vi.fn(() => ({ unref: vi.fn() }));

    registerTerminalHandlers({
      spawn: spawnMock as unknown as NonNullable<
        TerminalHandlerDependencies["spawn"]
      >,
      platform: "darwin",
      cwdResolver: () => "/repo",
    });

    const handler = handlers.get(IPC_CHANNELS.TERMINAL_OPEN);
    const result = (await handler?.(undefined, {
      command: "claude --continue",
    })) as { success: boolean; data?: { cwd: string; command?: string } };

    expect(spawnMock).toHaveBeenCalledWith(
      "osascript",
      expect.arrayContaining(["-e", 'tell application "Terminal" to activate']),
      expect.objectContaining({
        cwd: "/repo",
        detached: true,
        stdio: "ignore",
      }),
    );
    expect(result).toEqual({
      success: true,
      data: {
        cwd: "/repo",
        command: "claude --continue",
      },
    });
  });

  it("起動失敗時は error response を返す", async () => {
    registerTerminalHandlers({
      spawn: vi.fn(() => {
        throw new Error("spawn failed");
      }) as unknown as NonNullable<TerminalHandlerDependencies["spawn"]>,
      platform: "linux",
      cwdResolver: () => "/repo",
    });

    const handler = handlers.get(IPC_CHANNELS.TERMINAL_OPEN);
    const result = (await handler?.(undefined, {})) as {
      success: boolean;
      error?: string;
    };

    expect(result).toEqual({
      success: false,
      error: "spawn failed",
    });
  });
});
