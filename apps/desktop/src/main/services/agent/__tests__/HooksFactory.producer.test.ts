/**
 * HooksFactory - pushApprovalRequest producer テスト
 *
 * createPreToolUseHook() 内で危険コマンド検出時に
 * pushApprovalRequest() が正しく呼ばれることを検証する。
 * 既存の危険コマンドブロック挙動と DI 伝搬の回帰も合わせて確認する。
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BrowserWindow } from "electron";
import { HooksFactory, PermissionResolver } from "../HooksFactory";
import type { IApprovalGate } from "../../runtime/ApprovalGate";

// pushApprovalRequest をモック
vi.mock("../../../ipc/approvalHandlers", () => ({
  pushApprovalRequest: vi.fn(),
  registerApprovalHandlers: vi.fn(),
}));

// uuid をモック（operationId の予測可能化）
vi.mock("uuid", () => ({
  v4: vi.fn(() => "mocked-uuid-1234"),
}));

// electron をモック
vi.mock("electron", () => ({
  BrowserWindow: vi.fn(),
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

import { pushApprovalRequest } from "../../../ipc/approvalHandlers";

describe("HooksFactory - pushApprovalRequest producer", () => {
  let mockMainWindow: BrowserWindow;
  let permissionResolver: PermissionResolver;
  let mockApprovalGate: IApprovalGate;
  let hooksFactory: HooksFactory;

  const TEST_SESSION_ID = "session-test-abc";
  const TEST_EXECUTION_ID = "exec-test-xyz";

  beforeEach(() => {
    vi.clearAllMocks();

    mockMainWindow = {
      webContents: {
        send: vi.fn(),
        isDestroyed: vi.fn().mockReturnValue(false),
      },
      isDestroyed: vi.fn().mockReturnValue(false),
    } as unknown as BrowserWindow;

    permissionResolver = new PermissionResolver();

    mockApprovalGate = {
      grantApproval: vi.fn(),
      rejectApproval: vi.fn(),
      checkApproval: vi.fn(),
      revokeAll: vi.fn(),
    } as unknown as IApprovalGate;

    hooksFactory = new HooksFactory(
      mockMainWindow,
      TEST_EXECUTION_ID,
      permissionResolver,
      mockApprovalGate,
      TEST_SESSION_ID,
    );
  });

  describe("createPreToolUseHook", () => {
    it("危険コマンド検出時に pushApprovalRequest が呼ばれること", async () => {
      const hooks = hooksFactory.createHooks();

      await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "rm -rf /tmp/test" } },
        "tool-use-id-1",
        { signal: new AbortController().signal },
      );

      expect(pushApprovalRequest).toHaveBeenCalledTimes(1);
    });

    it("pushApprovalRequest に正しい sessionId が渡されること", async () => {
      const hooks = hooksFactory.createHooks();

      await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "sudo apt-get install curl" } },
        "tool-use-id-2",
        { signal: new AbortController().signal },
      );

      expect(pushApprovalRequest).toHaveBeenCalledWith(
        mockMainWindow,
        expect.objectContaining({
          sessionId: TEST_SESSION_ID,
        }),
      );
    });

    it("pushApprovalRequest に uuidv4() の operationId が渡されること", async () => {
      const hooks = hooksFactory.createHooks();

      await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "rm -rf /var/log" } },
        "tool-use-id-3",
        { signal: new AbortController().signal },
      );

      expect(pushApprovalRequest).toHaveBeenCalledWith(
        mockMainWindow,
        expect.objectContaining({
          operationId: "mocked-uuid-1234",
        }),
      );
    });

    it("operationType が 'dangerous_bash_command' であること", async () => {
      const hooks = hooksFactory.createHooks();

      await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "dd if=/dev/zero of=/dev/sda" } },
        "tool-use-id-4",
        { signal: new AbortController().signal },
      );

      expect(pushApprovalRequest).toHaveBeenCalledWith(
        mockMainWindow,
        expect.objectContaining({
          operationType: "dangerous_bash_command",
        }),
      );
    });

    it("安全なコマンドでは pushApprovalRequest が呼ばれないこと", async () => {
      const hooks = hooksFactory.createHooks();

      await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "ls -la /tmp" } },
        "tool-use-id-5",
        { signal: new AbortController().signal },
      );

      expect(pushApprovalRequest).not.toHaveBeenCalled();
    });

    it("mainWindow 破棄済み時にエラーが発生しないこと", async () => {
      // mainWindow を破棄済み状態にする
      (mockMainWindow.isDestroyed as ReturnType<typeof vi.fn>).mockReturnValue(
        true,
      );
      (
        mockMainWindow.webContents.isDestroyed as ReturnType<typeof vi.fn>
      ).mockReturnValue(true);

      const hooks = hooksFactory.createHooks();

      // エラーがスローされないことを確認
      await expect(
        hooks.PreToolUse!(
          { toolName: "Bash", args: { command: "rm -rf /tmp/test" } },
          "tool-use-id-6",
          { signal: new AbortController().signal },
        ),
      ).resolves.not.toThrow();
    });

    it("複数パターン検出時に最初のパターンで発火すること", async () => {
      // "sudo rm -rf" → DANGEROUS_PATTERNS を順に検索し、最初にマッチしたもので発火
      const hooks = hooksFactory.createHooks();

      await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "sudo rm -rf /important" } },
        "tool-use-id-7",
        { signal: new AbortController().signal },
      );

      // pushApprovalRequest は最初のパターンで 1 回だけ呼ばれる
      expect(pushApprovalRequest).toHaveBeenCalledTimes(1);
    });
  });
});
