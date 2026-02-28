import { describe, it, expect, beforeEach } from "vitest";
import { DebugSession } from "../DebugSession";
import { DEBUG_CONSTANTS } from "@repo/shared";

describe("DebugSession", () => {
  let session: DebugSession;

  beforeEach(() => {
    session = new DebugSession("test-skill");
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Constructor
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("constructor", () => {
    it("UUID v4 形式の id を生成する", () => {
      const uuidV4Regex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(session.id).toMatch(uuidV4Regex);
    });

    it("初期状態が idle である", () => {
      expect(session.status).toBe("idle");
    });

    it("初期の配列・オブジェクトが空である", () => {
      expect(session.getBreakpoints()).toEqual([]);
      expect(session.getCallStack()).toEqual([]);
      expect(session.getVariables()).toEqual({});
      expect(session.getCurrentStep()).toBeUndefined();
      expect(session.getStepHistory()).toEqual([]);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // State transitions
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("state transitions", () => {
    it("idle → running に遷移できる（start）", () => {
      session.start();
      expect(session.status).toBe("running");
    });

    it("running → paused に遷移できる（pause）", () => {
      session.start();
      session.pause();
      expect(session.status).toBe("paused");
    });

    it("paused → running に遷移できる（resume）", () => {
      session.start();
      session.pause();
      session.resume();
      expect(session.status).toBe("running");
    });

    it("running → completed に遷移できる（complete）", () => {
      session.start();
      session.complete();
      expect(session.status).toBe("completed");
    });

    it("running → error に遷移できる（fail）", () => {
      session.start();
      session.fail("something went wrong");
      expect(session.status).toBe("error");
    });

    it("paused → completed に遷移できる", () => {
      session.start();
      session.pause();
      session.complete();
      expect(session.status).toBe("completed");
    });

    it("paused → error に遷移できる", () => {
      session.start();
      session.pause();
      session.fail("error from paused");
      expect(session.status).toBe("error");
    });

    it("無効な遷移（idle → paused）でエラーをスローする", () => {
      expect(() => session.pause()).toThrow(
        "Invalid state transition: idle -> paused",
      );
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Breakpoint management
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("breakpoint management", () => {
    it("ブレークポイント追加時に UUID id が生成される", () => {
      const bp = session.addBreakpoint({
        type: "tool",
        toolName: "readFile",
        enabled: true,
      });
      expect(bp.id).toBeDefined();
      expect(bp.type).toBe("tool");
      expect(bp.toolName).toBe("readFile");
      expect(bp.enabled).toBe(true);
    });

    it("既存のブレークポイントを削除できる", () => {
      const bp = session.addBreakpoint({
        type: "tool",
        enabled: true,
      });
      const result = session.removeBreakpoint(bp.id);
      expect(result).toBe(true);
      expect(session.getBreakpoints()).toHaveLength(0);
    });

    it("存在しないブレークポイントの削除は false を返す", () => {
      const result = session.removeBreakpoint("non-existent-id");
      expect(result).toBe(false);
    });

    it("MAX_BREAKPOINTS 制限を超えるとエラーをスローする", () => {
      for (let i = 0; i < DEBUG_CONSTANTS.MAX_BREAKPOINTS; i++) {
        session.addBreakpoint({ type: "step", enabled: true });
      }
      expect(() =>
        session.addBreakpoint({ type: "step", enabled: true }),
      ).toThrow(
        `Maximum breakpoints limit reached: ${DEBUG_CONSTANTS.MAX_BREAKPOINTS}`,
      );
    });

    it("getBreakpoints はコピーを返す", () => {
      session.addBreakpoint({ type: "tool", enabled: true });
      const bps1 = session.getBreakpoints();
      const bps2 = session.getBreakpoints();
      expect(bps1).toEqual(bps2);
      expect(bps1).not.toBe(bps2);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Variable management
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("variable management", () => {
    it("単純なキーで変数を設定・取得できる", () => {
      session.setVariable("count", 42);
      expect(session.getVariable("count")).toBe(42);
    });

    it("ドット記法でネストされた変数を設定・取得できる", () => {
      session.setVariable("user.name", "Alice");
      session.setVariable("user.age", 30);
      expect(session.getVariable("user.name")).toBe("Alice");
      expect(session.getVariable("user.age")).toBe(30);
    });

    it("存在しないパスは undefined を返す", () => {
      expect(session.getVariable("nonexistent")).toBeUndefined();
      expect(session.getVariable("a.b.c")).toBeUndefined();
    });

    it("getVariables はコピーを返す", () => {
      session.setVariable("x", 1);
      const vars1 = session.getVariables();
      const vars2 = session.getVariables();
      expect(vars1).toEqual(vars2);
      expect(vars1).not.toBe(vars2);
    });

    it("深いネストのドット記法もサポートする", () => {
      session.setVariable("a.b.c", "deep");
      expect(session.getVariable("a.b.c")).toBe("deep");
      expect(session.getVariable("a.b")).toEqual({ c: "deep" });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Call stack
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("call stack", () => {
    it("push/pop が LIFO で動作する", () => {
      session.pushCallStack("skill-main", "skill");
      session.pushCallStack("tool-read", "tool");

      const popped = session.popCallStack();
      expect(popped?.name).toBe("tool-read");
      expect(popped?.type).toBe("tool");
      expect(popped?.depth).toBe(1);

      const popped2 = session.popCallStack();
      expect(popped2?.name).toBe("skill-main");
      expect(popped2?.depth).toBe(0);
    });

    it("空のスタックからの pop は undefined を返す", () => {
      expect(session.popCallStack()).toBeUndefined();
    });

    it("MAX_CALL_STACK_DEPTH 制限を超えるとエラーをスローする", () => {
      for (let i = 0; i < DEBUG_CONSTANTS.MAX_CALL_STACK_DEPTH; i++) {
        session.pushCallStack(`entry-${i}`, "tool");
      }
      expect(() => session.pushCallStack("overflow", "tool")).toThrow(
        `Maximum call stack depth reached: ${DEBUG_CONSTANTS.MAX_CALL_STACK_DEPTH}`,
      );
    });

    it("getCallStack はコピーを返す", () => {
      session.pushCallStack("test", "skill");
      const stack1 = session.getCallStack();
      const stack2 = session.getCallStack();
      expect(stack1).toEqual(stack2);
      expect(stack1).not.toBe(stack2);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Step management
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("step management", () => {
    it("recordStep はステップ番号をインクリメントする", () => {
      const step1 = session.recordStep("tool_call");
      const step2 = session.recordStep("hook_execution");
      expect(step1.stepNumber).toBe(1);
      expect(step2.stepNumber).toBe(2);
    });

    it("recordStep は ISO 8601 タイムスタンプを記録する", () => {
      const step = session.recordStep("tool_call");
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
      expect(step.timestamp).toMatch(isoRegex);
    });

    it("recordStep は toolName/hookType を記録する", () => {
      const step = session.recordStep("tool_call", {
        toolName: "readFile",
        hookType: "PreToolUse",
        input: { path: "/test" },
        output: "file content",
      });
      expect(step.toolName).toBe("readFile");
      expect(step.hookType).toBe("PreToolUse");
      expect(step.input).toEqual({ path: "/test" });
      expect(step.output).toBe("file content");
    });

    it("MAX_STEPS 制限を超えるとエラーをスローする", () => {
      for (let i = 0; i < DEBUG_CONSTANTS.MAX_STEPS; i++) {
        session.recordStep("tool_call");
      }
      expect(() => session.recordStep("tool_call")).toThrow(
        `Maximum steps limit reached: ${DEBUG_CONSTANTS.MAX_STEPS}`,
      );
    });

    it("getCurrentStep は最新のステップを返す", () => {
      session.recordStep("tool_call", { toolName: "first" });
      session.recordStep("hook_execution", { hookType: "PreToolUse" });
      const current = session.getCurrentStep();
      expect(current?.type).toBe("hook_execution");
      expect(current?.hookType).toBe("PreToolUse");
      expect(current?.stepNumber).toBe(2);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // toJSON
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("toJSON", () => {
    it("全フィールドを含むオブジェクトを返す", () => {
      const json = session.toJSON();
      expect(json).toHaveProperty("id");
      expect(json).toHaveProperty("skillName", "test-skill");
      expect(json).toHaveProperty("status", "idle");
      expect(json).toHaveProperty("breakpoints");
      expect(json).toHaveProperty("variables");
      expect(json).toHaveProperty("callStack");
      expect(json).toHaveProperty("startedAt");
      expect(json).toHaveProperty("steps");
    });

    it("日付を ISO 8601 文字列として返す", () => {
      const json = session.toJSON();
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
      expect(json.startedAt).toMatch(isoRegex);
    });

    it("現在の状態を正確に反映する", () => {
      session.start();
      session.setVariable("x", 10);
      session.addBreakpoint({ type: "tool", enabled: true });
      session.recordStep("tool_call", { toolName: "test" });

      const json = session.toJSON();
      expect(json.status).toBe("running");
      expect(json.variables).toEqual({ x: 10 });
      expect(json.breakpoints).toHaveLength(1);
      expect(json.steps).toHaveLength(1);
      expect(json.currentStep?.toolName).toBe("test");
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // fail()
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("fail()", () => {
    it("エラーメッセージを設定する", () => {
      session.start();
      session.fail("test error message");
      const json = session.toJSON();
      expect(json.error).toBe("test error message");
    });

    it("error 状態に遷移する", () => {
      session.start();
      session.fail("failure");
      expect(session.status).toBe("error");
    });
  });
});
