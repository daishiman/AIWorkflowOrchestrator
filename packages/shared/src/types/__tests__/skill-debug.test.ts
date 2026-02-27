/**
 * Skill Debug Types - Type Definition Tests
 * TASK-9H: Phase 4 Red テスト
 *
 * @module skill-debug.test
 */
import { describe, it, expect } from "vitest";

import type {
  DebugSessionStatus,
  DebugSessionState,
  BreakpointType,
  HookType,
  Breakpoint,
  DebugStepType,
  CallStackEntryType,
  CallStackEntry,
  DebugEvent,
  DebugCommand,
  DebugStartRequest,
  DebugCommandRequest,
  DebugBreakpointAddRequest,
  DebugBreakpointRemoveRequest,
  DebugInspectRequest,
  DebugEvaluateRequest,
  DebugEvaluateResponse,
} from "../skill-debug";

import { VALID_DEBUG_TRANSITIONS, DEBUG_CONSTANTS } from "../skill-debug";

// =============================================================================
// Task 4-1: 型エクスポート検証
// =============================================================================
describe("Skill Debug Types - Export Check", () => {
  it("should export all types from skill-debug module", async () => {
    const module = await import("../skill-debug");
    expect(module).toBeDefined();
    expect(module.VALID_DEBUG_TRANSITIONS).toBeDefined();
    expect(module.DEBUG_CONSTANTS).toBeDefined();
  });
});

// =============================================================================
// Task 4-2: DebugSessionStatus 型検証
// =============================================================================
describe("DebugSessionStatus", () => {
  it("should accept all 5 valid status values", () => {
    const statuses: DebugSessionStatus[] = [
      "idle",
      "running",
      "paused",
      "completed",
      "error",
    ];
    expect(statuses).toHaveLength(5);
    expect(statuses).toContain("idle");
    expect(statuses).toContain("running");
    expect(statuses).toContain("paused");
    expect(statuses).toContain("completed");
    expect(statuses).toContain("error");
  });
});

// =============================================================================
// Task 4-3: BreakpointType 型検証
// =============================================================================
describe("BreakpointType", () => {
  it("should accept all 3 valid breakpoint types", () => {
    const types: BreakpointType[] = ["tool", "hook", "step"];
    expect(types).toHaveLength(3);
    expect(types).toContain("tool");
    expect(types).toContain("hook");
    expect(types).toContain("step");
  });

  it("should accept valid HookType values", () => {
    const hookTypes: HookType[] = ["PreToolUse", "PostToolUse"];
    expect(hookTypes).toHaveLength(2);
  });
});

// =============================================================================
// Task 4-4: DebugStepType 型検証
// =============================================================================
describe("DebugStepType", () => {
  it("should accept all 3 valid step types", () => {
    const types: DebugStepType[] = [
      "tool_call",
      "hook_execution",
      "agent_response",
    ];
    expect(types).toHaveLength(3);
    expect(types).toContain("tool_call");
    expect(types).toContain("hook_execution");
    expect(types).toContain("agent_response");
  });
});

// =============================================================================
// Task 4-5: CallStackEntryType 型検証
// =============================================================================
describe("CallStackEntryType", () => {
  it("should accept all 3 valid call stack entry types", () => {
    const types: CallStackEntryType[] = ["skill", "agent", "tool"];
    expect(types).toHaveLength(3);
    expect(types).toContain("skill");
    expect(types).toContain("agent");
    expect(types).toContain("tool");
  });
});

// =============================================================================
// Task 4-6: DebugEvent Discriminated Union 検証
// =============================================================================
describe("DebugEvent - Discriminated Union", () => {
  it("should narrow to step event by type field", () => {
    const event: DebugEvent = {
      type: "step",
      sessionId: "session-1",
      step: {
        stepNumber: 1,
        type: "tool_call",
        toolName: "read_file",
        timestamp: "2026-02-27T12:00:00Z",
      },
    };

    if (event.type === "step") {
      expect(event.step.stepNumber).toBe(1);
      expect(event.step.type).toBe("tool_call");
    }
  });

  it("should narrow to breakpoint-hit event by type field", () => {
    const event: DebugEvent = {
      type: "breakpoint-hit",
      sessionId: "session-1",
      breakpoint: {
        id: "bp-1",
        type: "tool",
        toolName: "write_file",
        enabled: true,
      },
    };

    if (event.type === "breakpoint-hit") {
      expect(event.breakpoint.id).toBe("bp-1");
      expect(event.breakpoint.type).toBe("tool");
    }
  });

  it("should narrow to variable-changed event by type field", () => {
    const event: DebugEvent = {
      type: "variable-changed",
      sessionId: "session-1",
      path: "result.data",
      value: { count: 42 },
    };

    if (event.type === "variable-changed") {
      expect(event.path).toBe("result.data");
      expect(event.value).toEqual({ count: 42 });
    }
  });

  it("should narrow to session-ended event by type field", () => {
    const event: DebugEvent = {
      type: "session-ended",
      sessionId: "session-1",
      completedAt: "2026-02-27T12:30:00Z",
    };

    if (event.type === "session-ended") {
      expect(event.completedAt).toBe("2026-02-27T12:30:00Z");
      expect(event.error).toBeUndefined();
    }
  });

  it("should handle session-ended event with error", () => {
    const event: DebugEvent = {
      type: "session-ended",
      sessionId: "session-1",
      error: "Timeout exceeded",
    };

    if (event.type === "session-ended") {
      expect(event.error).toBe("Timeout exceeded");
    }
  });
});

// =============================================================================
// Task 4-7: DebugCommand 型検証
// =============================================================================
describe("DebugCommand", () => {
  it("should accept all 6 valid command values", () => {
    const commands: DebugCommand[] = [
      "continue",
      "stepOver",
      "stepInto",
      "stepOut",
      "pause",
      "stop",
    ];
    expect(commands).toHaveLength(6);
    expect(commands).toContain("continue");
    expect(commands).toContain("stepOver");
    expect(commands).toContain("stepInto");
    expect(commands).toContain("stepOut");
    expect(commands).toContain("pause");
    expect(commands).toContain("stop");
  });
});

// =============================================================================
// Task 4-8: VALID_DEBUG_TRANSITIONS 定数検証
// =============================================================================
describe("VALID_DEBUG_TRANSITIONS", () => {
  it("should have entries for all 5 statuses", () => {
    const statuses: DebugSessionStatus[] = [
      "idle",
      "running",
      "paused",
      "completed",
      "error",
    ];
    for (const status of statuses) {
      expect(VALID_DEBUG_TRANSITIONS).toHaveProperty(status);
    }
  });

  it("should allow idle to transition only to running", () => {
    expect(VALID_DEBUG_TRANSITIONS.idle).toEqual(["running"]);
  });

  it("should allow running to transition to paused, completed, or error", () => {
    expect(VALID_DEBUG_TRANSITIONS.running).toEqual([
      "paused",
      "completed",
      "error",
    ]);
  });

  it("should allow paused to transition to running, completed, or error", () => {
    expect(VALID_DEBUG_TRANSITIONS.paused).toEqual([
      "running",
      "completed",
      "error",
    ]);
  });

  it("should not allow completed to transition to any state", () => {
    expect(VALID_DEBUG_TRANSITIONS.completed).toEqual([]);
  });

  it("should not allow error to transition to any state", () => {
    expect(VALID_DEBUG_TRANSITIONS.error).toEqual([]);
  });
});

// =============================================================================
// Task 4-9: DEBUG_CONSTANTS 定数検証
// =============================================================================
describe("DEBUG_CONSTANTS", () => {
  it("should have SESSION_TIMEOUT_MS as 30 minutes", () => {
    expect(DEBUG_CONSTANTS.SESSION_TIMEOUT_MS).toBe(30 * 60 * 1000);
  });

  it("should have MAX_STEPS as 10000", () => {
    expect(DEBUG_CONSTANTS.MAX_STEPS).toBe(10_000);
  });

  it("should have EXPRESSION_TIMEOUT_MS as 5 seconds", () => {
    expect(DEBUG_CONSTANTS.EXPRESSION_TIMEOUT_MS).toBe(5_000);
  });

  it("should have MAX_BREAKPOINTS as 100", () => {
    expect(DEBUG_CONSTANTS.MAX_BREAKPOINTS).toBe(100);
  });

  it("should have MAX_CALL_STACK_DEPTH as 100", () => {
    expect(DEBUG_CONSTANTS.MAX_CALL_STACK_DEPTH).toBe(100);
  });
});

// =============================================================================
// Task 4-10: Breakpoint インターフェース検証
// =============================================================================
describe("Breakpoint Interface", () => {
  it("should have all required fields", () => {
    const breakpoint: Breakpoint = {
      id: "bp-1",
      type: "tool",
      enabled: true,
    };

    expect(breakpoint.id).toBe("bp-1");
    expect(breakpoint.type).toBe("tool");
    expect(breakpoint.enabled).toBe(true);
  });

  it("should accept optional fields for tool breakpoint", () => {
    const breakpoint: Breakpoint = {
      id: "bp-2",
      type: "tool",
      toolName: "read_file",
      condition: "input.path.endsWith('.ts')",
      enabled: true,
    };

    expect(breakpoint.toolName).toBe("read_file");
    expect(breakpoint.condition).toBe("input.path.endsWith('.ts')");
  });

  it("should accept optional fields for hook breakpoint", () => {
    const breakpoint: Breakpoint = {
      id: "bp-3",
      type: "hook",
      hookType: "PreToolUse",
      enabled: false,
    };

    expect(breakpoint.hookType).toBe("PreToolUse");
    expect(breakpoint.enabled).toBe(false);
  });
});

// =============================================================================
// Task 4-11: DebugStartRequest インターフェース検証
// =============================================================================
describe("DebugStartRequest Interface", () => {
  it("should have required fields", () => {
    const request: DebugStartRequest = {
      skillName: "test-skill",
      prompt: "Run the test",
      breakpoints: [],
    };

    expect(request.skillName).toBe("test-skill");
    expect(request.prompt).toBe("Run the test");
    expect(request.breakpoints).toEqual([]);
  });

  it("should accept breakpoints without id (Omit<Breakpoint, 'id'>)", () => {
    const request: DebugStartRequest = {
      skillName: "test-skill",
      prompt: "Debug mode",
      breakpoints: [
        {
          type: "tool",
          toolName: "write_file",
          enabled: true,
        },
        {
          type: "hook",
          hookType: "PostToolUse",
          enabled: true,
        },
      ],
    };

    expect(request.breakpoints).toHaveLength(2);
    expect(request.breakpoints[0].type).toBe("tool");
    expect(request.breakpoints[1].type).toBe("hook");
  });
});

// =============================================================================
// Task 4-12: IPC リクエスト型検証
// =============================================================================
describe("IPC Request Types", () => {
  it("should create valid DebugCommandRequest", () => {
    const request: DebugCommandRequest = {
      sessionId: "sess-123",
      command: "stepOver",
    };

    expect(request.sessionId).toBe("sess-123");
    expect(request.command).toBe("stepOver");
  });

  it("should create valid DebugBreakpointAddRequest", () => {
    const request: DebugBreakpointAddRequest = {
      sessionId: "sess-123",
      breakpoint: {
        type: "step",
        enabled: true,
      },
    };

    expect(request.sessionId).toBe("sess-123");
    expect(request.breakpoint.type).toBe("step");
  });

  it("should create valid DebugBreakpointRemoveRequest", () => {
    const request: DebugBreakpointRemoveRequest = {
      sessionId: "sess-123",
      breakpointId: "bp-1",
    };

    expect(request.sessionId).toBe("sess-123");
    expect(request.breakpointId).toBe("bp-1");
  });

  it("should create valid DebugInspectRequest", () => {
    const request: DebugInspectRequest = {
      sessionId: "sess-123",
      path: "variables.result",
    };

    expect(request.sessionId).toBe("sess-123");
    expect(request.path).toBe("variables.result");
  });

  it("should create valid DebugEvaluateRequest", () => {
    const request: DebugEvaluateRequest = {
      sessionId: "sess-123",
      expression: "Object.keys(variables)",
    };

    expect(request.sessionId).toBe("sess-123");
    expect(request.expression).toBe("Object.keys(variables)");
  });

  it("should create valid DebugEvaluateResponse", () => {
    const response: DebugEvaluateResponse = {
      result: ["key1", "key2"],
      type: "object",
    };

    expect(response.result).toEqual(["key1", "key2"]);
    expect(response.type).toBe("object");
  });
});

// =============================================================================
// Task 4-13: DebugSessionState 全フィールド検証
// =============================================================================
describe("DebugSessionState Interface", () => {
  it("should create a complete session state with all fields", () => {
    const state: DebugSessionState = {
      id: "sess-abc-123",
      skillName: "my-skill",
      status: "running",
      breakpoints: [
        { id: "bp-1", type: "tool", toolName: "read_file", enabled: true },
      ],
      currentStep: {
        stepNumber: 3,
        type: "tool_call",
        toolName: "read_file",
        timestamp: "2026-02-27T12:00:00Z",
      },
      variables: { result: { data: [1, 2, 3] } },
      callStack: [
        {
          depth: 0,
          name: "my-skill",
          type: "skill",
          startTime: "2026-02-27T12:00:00Z",
        },
      ],
      startedAt: "2026-02-27T12:00:00Z",
      completedAt: undefined,
      error: undefined,
    };

    expect(state.id).toBe("sess-abc-123");
    expect(state.skillName).toBe("my-skill");
    expect(state.status).toBe("running");
    expect(state.breakpoints).toHaveLength(1);
    expect(state.currentStep?.stepNumber).toBe(3);
    expect(state.variables).toHaveProperty("result");
    expect(state.callStack).toHaveLength(1);
    expect(state.startedAt).toBe("2026-02-27T12:00:00Z");
  });

  it("should create a minimal session state with only required fields", () => {
    const state: DebugSessionState = {
      id: "sess-min",
      skillName: "minimal-skill",
      status: "idle",
      breakpoints: [],
      variables: {},
      callStack: [],
      startedAt: "2026-02-27T12:00:00Z",
    };

    expect(state.id).toBe("sess-min");
    expect(state.currentStep).toBeUndefined();
    expect(state.completedAt).toBeUndefined();
    expect(state.error).toBeUndefined();
  });
});

// =============================================================================
// Task 4-14: CallStackEntry インターフェース検証
// =============================================================================
describe("CallStackEntry Interface", () => {
  it("should have all required fields", () => {
    const entry: CallStackEntry = {
      depth: 0,
      name: "my-skill",
      type: "skill",
      startTime: "2026-02-27T12:00:00Z",
    };

    expect(entry.depth).toBe(0);
    expect(entry.name).toBe("my-skill");
    expect(entry.type).toBe("skill");
    expect(entry.startTime).toBe("2026-02-27T12:00:00Z");
  });

  it("should represent nested call stack correctly", () => {
    const stack: CallStackEntry[] = [
      {
        depth: 0,
        name: "outer-skill",
        type: "skill",
        startTime: "2026-02-27T12:00:00Z",
      },
      {
        depth: 1,
        name: "inner-agent",
        type: "agent",
        startTime: "2026-02-27T12:00:01Z",
      },
      {
        depth: 2,
        name: "read_file",
        type: "tool",
        startTime: "2026-02-27T12:00:02Z",
      },
    ];

    expect(stack).toHaveLength(3);
    expect(stack[0].type).toBe("skill");
    expect(stack[1].type).toBe("agent");
    expect(stack[2].type).toBe("tool");
    expect(stack[2].depth).toBe(2);
  });
});
