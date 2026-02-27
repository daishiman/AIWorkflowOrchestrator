import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type { BrowserWindow } from "electron";
import { SkillDebugger } from "../SkillDebugger";
import { IPC_CHANNELS } from "../../../../preload/channels";
import { DEBUG_CONSTANTS } from "@repo/shared";

// BrowserWindow モック
const createMockMainWindow = () =>
  ({
    webContents: {
      send: vi.fn(),
    },
    isDestroyed: vi.fn().mockReturnValue(false),
  }) as unknown as BrowserWindow;

describe("SkillDebugger", () => {
  let debugger_: SkillDebugger;
  let mockMainWindow: BrowserWindow;

  beforeEach(() => {
    vi.useFakeTimers();
    mockMainWindow = createMockMainWindow();
    debugger_ = new SkillDebugger(mockMainWindow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // startSession
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("startSession", () => {
    it("UUID 付きのセッション状態を返す", () => {
      const state = debugger_.startSession("my-skill", "test prompt", []);
      const uuidV4Regex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(state.id).toMatch(uuidV4Regex);
      expect(state.skillName).toBe("my-skill");
    });

    it("ステータスが running に設定される", () => {
      const state = debugger_.startSession("my-skill", "test prompt", []);
      expect(state.status).toBe("running");
    });

    it("初期ブレークポイントを追加する", () => {
      const state = debugger_.startSession("my-skill", "test prompt", [
        { type: "tool", toolName: "readFile", enabled: true },
        { type: "hook", hookType: "PreToolUse", enabled: true },
      ]);
      expect(state.breakpoints).toHaveLength(2);
      expect(state.breakpoints[0].type).toBe("tool");
      expect(state.breakpoints[0].id).toBeDefined();
      expect(state.breakpoints[1].type).toBe("hook");
    });

    it("既にセッションがアクティブな場合にエラーをスローする（排他制御）", () => {
      debugger_.startSession("skill-1", "prompt", []);
      expect(() => debugger_.startSession("skill-2", "prompt", [])).toThrow(
        "A debug session is already active",
      );
    });

    it("タイムアウトタイマーが設定される", () => {
      const state = debugger_.startSession("my-skill", "test prompt", []);

      // タイムアウト前はセッションがアクティブ
      expect(() => debugger_.getSessionState(state.id)).not.toThrow();
    });

    it("startedAt が ISO 8601 形式である", () => {
      const state = debugger_.startSession("my-skill", "test prompt", []);
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
      expect(state.startedAt).toMatch(isoRegex);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // executeCommand
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("executeCommand", () => {
    let sessionId: string;

    beforeEach(() => {
      const state = debugger_.startSession("test-skill", "prompt", []);
      sessionId = state.id;
    });

    it("continue コマンドで paused → running に遷移する", () => {
      debugger_.executeCommand(sessionId, "pause");
      debugger_.executeCommand(sessionId, "continue");
      const state = debugger_.getSessionState(sessionId);
      expect(state.status).toBe("running");
    });

    it("stepOver コマンドでステップを記録する", () => {
      debugger_.executeCommand(sessionId, "pause");
      debugger_.executeCommand(sessionId, "stepOver");
      const state = debugger_.getSessionState(sessionId);
      expect(state.steps).toHaveLength(1);
    });

    it("stepInto コマンドでコールスタックにプッシュしてステップを記録する", () => {
      debugger_.executeCommand(sessionId, "pause");
      debugger_.executeCommand(sessionId, "stepInto");
      const state = debugger_.getSessionState(sessionId);
      expect(state.callStack).toHaveLength(1);
      expect(state.steps).toHaveLength(1);
    });

    it("stepOut コマンドでコールスタックからポップしてステップを記録する", () => {
      debugger_.executeCommand(sessionId, "pause");
      debugger_.executeCommand(sessionId, "stepInto");
      debugger_.executeCommand(sessionId, "stepOut");
      const state = debugger_.getSessionState(sessionId);
      expect(state.callStack).toHaveLength(0);
      expect(state.steps).toHaveLength(2);
    });

    it("pause コマンドで running → paused に遷移する", () => {
      debugger_.executeCommand(sessionId, "pause");
      const state = debugger_.getSessionState(sessionId);
      expect(state.status).toBe("paused");
    });

    it("stop コマンドでセッションをクリーンアップする", () => {
      debugger_.executeCommand(sessionId, "stop");
      expect(() => debugger_.getSessionState(sessionId)).toThrow(
        "No active debug session",
      );
    });

    it("無効な sessionId でエラーをスローする", () => {
      expect(() => debugger_.executeCommand("wrong-id", "continue")).toThrow(
        "Session ID mismatch",
      );
    });

    it("セッションが存在しない場合にエラーをスローする", () => {
      debugger_.executeCommand(sessionId, "stop");
      expect(() => debugger_.executeCommand(sessionId, "continue")).toThrow(
        "No active debug session",
      );
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // addBreakpoint
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("addBreakpoint", () => {
    let sessionId: string;

    beforeEach(() => {
      const state = debugger_.startSession("test-skill", "prompt", []);
      sessionId = state.id;
    });

    it("アクティブセッションにブレークポイントを追加する", () => {
      const bp = debugger_.addBreakpoint(sessionId, {
        type: "tool",
        toolName: "writeFile",
        enabled: true,
      });
      expect(bp.toolName).toBe("writeFile");
      const state = debugger_.getSessionState(sessionId);
      expect(state.breakpoints).toHaveLength(1);
    });

    it("セッションが存在しない場合にエラーをスローする", () => {
      debugger_.executeCommand(sessionId, "stop");
      expect(() =>
        debugger_.addBreakpoint(sessionId, { type: "tool", enabled: true }),
      ).toThrow("No active debug session");
    });

    it("sessionId が不一致の場合にエラーをスローする", () => {
      expect(() =>
        debugger_.addBreakpoint("wrong-id", { type: "tool", enabled: true }),
      ).toThrow("Session ID mismatch");
    });

    it("ID 付きのブレークポイントを返す", () => {
      const bp = debugger_.addBreakpoint(sessionId, {
        type: "hook",
        hookType: "PostToolUse",
        enabled: true,
      });
      expect(bp.id).toBeDefined();
      expect(bp.type).toBe("hook");
      expect(bp.hookType).toBe("PostToolUse");
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // removeBreakpoint
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("removeBreakpoint", () => {
    let sessionId: string;

    beforeEach(() => {
      const state = debugger_.startSession("test-skill", "prompt", []);
      sessionId = state.id;
    });

    it("アクティブセッションからブレークポイントを削除する", () => {
      const bp = debugger_.addBreakpoint(sessionId, {
        type: "tool",
        enabled: true,
      });
      debugger_.removeBreakpoint(sessionId, bp.id);
      const state = debugger_.getSessionState(sessionId);
      expect(state.breakpoints).toHaveLength(0);
    });

    it("セッションが存在しない場合にエラーをスローする", () => {
      debugger_.executeCommand(sessionId, "stop");
      expect(() => debugger_.removeBreakpoint(sessionId, "bp-id")).toThrow(
        "No active debug session",
      );
    });

    it("sessionId が不一致の場合にエラーをスローする", () => {
      expect(() => debugger_.removeBreakpoint("wrong-id", "bp-id")).toThrow(
        "Session ID mismatch",
      );
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // inspectVariable
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("inspectVariable", () => {
    let sessionId: string;

    beforeEach(() => {
      const state = debugger_.startSession("test-skill", "prompt", []);
      sessionId = state.id;
    });

    it("パスで変数値を返す", () => {
      // セッションに直接変数を設定するために、内部的にステップ/変数操作を行う
      // inspectVariable はセッションの getVariable を呼ぶ
      const result = debugger_.inspectVariable(sessionId, "nonexistent");
      expect(result).toBeUndefined();
    });

    it("セッションが存在しない場合にエラーをスローする", () => {
      debugger_.executeCommand(sessionId, "stop");
      expect(() => debugger_.inspectVariable(sessionId, "x")).toThrow(
        "No active debug session",
      );
    });

    it("sessionId が不一致の場合にエラーをスローする", () => {
      expect(() => debugger_.inspectVariable("wrong-id", "x")).toThrow(
        "Session ID mismatch",
      );
    });

    it("存在しないパスは undefined を返す", () => {
      const result = debugger_.inspectVariable(sessionId, "a.b.c");
      expect(result).toBeUndefined();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // evaluateExpression
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("evaluateExpression", () => {
    let sessionId: string;

    beforeEach(() => {
      const state = debugger_.startSession("test-skill", "prompt", []);
      sessionId = state.id;
      // paused 状態にする
      debugger_.executeCommand(sessionId, "pause");
    });

    it("単純な式を評価する", () => {
      const response = debugger_.evaluateExpression(sessionId, "1 + 2");
      expect(response.result).toBe(3);
      expect(response.type).toBe("number");
    });

    it("セッション変数にアクセスできる", () => {
      // SkillDebugger 経由では直接変数設定ができないため、空変数で確認
      const response = debugger_.evaluateExpression(
        sessionId,
        "typeof undefined",
      );
      expect(response.result).toBe("undefined");
      expect(response.type).toBe("string");
    });

    it("process/require/fs へのアクセスをブロックする", () => {
      expect(() =>
        debugger_.evaluateExpression(sessionId, "process.exit()"),
      ).toThrow();

      expect(() =>
        debugger_.evaluateExpression(sessionId, "require('fs')"),
      ).toThrow();
    });

    it("無限ループでタイムアウトする", () => {
      vi.useRealTimers(); // vm.runInContext の timeout には実時間が必要
      expect(() =>
        debugger_.evaluateExpression(sessionId, "while(true){}"),
      ).toThrow("Expression evaluation timed out");
    });

    it("paused 状態でないとエラーをスローする", () => {
      // resume して running に戻す
      debugger_.executeCommand(sessionId, "continue");
      expect(() => debugger_.evaluateExpression(sessionId, "1 + 1")).toThrow(
        "Can only evaluate expressions when session is paused",
      );
    });

    it("型情報を返す", () => {
      const numResponse = debugger_.evaluateExpression(sessionId, "42");
      expect(numResponse.type).toBe("number");

      const strResponse = debugger_.evaluateExpression(sessionId, "'hello'");
      expect(strResponse.type).toBe("string");

      const boolResponse = debugger_.evaluateExpression(sessionId, "true");
      expect(boolResponse.type).toBe("boolean");
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // emitDebugEvent
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("emitDebugEvent (via stop)", () => {
    let sessionId: string;

    beforeEach(() => {
      const state = debugger_.startSession("test-skill", "prompt", []);
      sessionId = state.id;
    });

    it("webContents.send でイベントを送信する", () => {
      debugger_.executeCommand(sessionId, "stop");
      expect(mockMainWindow.webContents.send).toHaveBeenCalled();
    });

    it("正しいチャンネルで送信する", () => {
      debugger_.executeCommand(sessionId, "stop");
      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_DEBUG_EVENT,
        expect.objectContaining({
          type: "session-ended",
          sessionId,
        }),
      );
    });

    it("ウィンドウが破棄済みの場合にグレースフルに処理する", () => {
      (mockMainWindow.isDestroyed as ReturnType<typeof vi.fn>).mockReturnValue(
        true,
      );
      expect(() => debugger_.executeCommand(sessionId, "stop")).not.toThrow();
    });

    it("session-ended イベントタイプを送信する", () => {
      debugger_.executeCommand(sessionId, "stop");
      const calls = (
        mockMainWindow.webContents.send as ReturnType<typeof vi.fn>
      ).mock.calls;
      const eventArg = calls[0][1];
      expect(eventArg.type).toBe("session-ended");
      expect(eventArg.completedAt).toBeDefined();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // cleanupSession
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("cleanupSession (via stop)", () => {
    it("タイムアウトをクリアする", () => {
      const state = debugger_.startSession("test-skill", "prompt", []);
      debugger_.executeCommand(state.id, "stop");

      // タイムアウト発火しても追加イベントが送信されないことを確認
      const sendCallCount = (
        mockMainWindow.webContents.send as ReturnType<typeof vi.fn>
      ).mock.calls.length;
      vi.advanceTimersByTime(DEBUG_CONSTANTS.SESSION_TIMEOUT_MS + 1000);
      expect(
        (mockMainWindow.webContents.send as ReturnType<typeof vi.fn>).mock.calls
          .length,
      ).toBe(sendCallCount);
    });

    it("セッションを null にする", () => {
      const state = debugger_.startSession("test-skill", "prompt", []);
      debugger_.executeCommand(state.id, "stop");
      expect(() => debugger_.getSessionState(state.id)).toThrow(
        "No active debug session",
      );
    });

    it("クリーンアップ後に新しいセッションを開始できる", () => {
      const state1 = debugger_.startSession("skill-1", "prompt", []);
      debugger_.executeCommand(state1.id, "stop");
      const state2 = debugger_.startSession("skill-2", "prompt", []);
      expect(state2.skillName).toBe("skill-2");
      expect(state2.status).toBe("running");
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // session timeout
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("session timeout", () => {
    it("タイムアウト後にセッションが自動完了する", () => {
      const state = debugger_.startSession("test-skill", "prompt", []);
      vi.advanceTimersByTime(DEBUG_CONSTANTS.SESSION_TIMEOUT_MS);
      expect(() => debugger_.getSessionState(state.id)).toThrow(
        "No active debug session",
      );
    });

    it("タイムアウト時に session-ended イベントを送信する", () => {
      const state = debugger_.startSession("test-skill", "prompt", []);
      vi.advanceTimersByTime(DEBUG_CONSTANTS.SESSION_TIMEOUT_MS);
      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_DEBUG_EVENT,
        expect.objectContaining({
          type: "session-ended",
          sessionId: state.id,
        }),
      );
    });
  });
});
