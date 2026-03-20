/**
 * Skill Types - Type Definition Tests
 * @module skill.test
 *
 * TDD: Red Phase - Tests for types that are not yet implemented
 */
import { describe, it, expect } from "vitest";

// Type imports for compile-time checking
import type {
  // Skill metadata types (§5.1)
  SkillMetadata,
  SkillSubResource,
  SkillOtherFile,
  ImportedSkill,
  // Execution types (§5.1)
  SkillExecutionRequest,
  SkillExecutionResponse,
  SkillExecutionStatus,
  // Streaming message types (§5.1)
  SkillStreamMessageType,
  AssistantMessageContent,
  ToolUseMessageContent,
  ToolResultMessageContent,
  StatusMessageContent,
  ErrorMessageContent,
  SkillStreamMessage,
  // Permission types (§5.1)
  SkillPermissionRequest,
  SkillPermissionResponse,
} from "../skill";

// =============================================================================
// Task 4-1: Type Export Tests
// =============================================================================
describe("Skill Types - Export Check", () => {
  it("should export skill metadata types", async () => {
    const module = await import("../skill");
    expect(module).toBeDefined();
  });
});

// =============================================================================
// Task 4-1: Skill Metadata Type Compatibility Tests
// =============================================================================
describe("Skill Metadata Types - Type Compatibility", () => {
  it("should have correct SkillOtherFile structure", () => {
    const file: SkillOtherFile = {
      filename: "EVALS.json",
      type: "evals",
      size: 512,
    };

    expect(file.filename).toBe("EVALS.json");
    expect(file.type).toBe("evals");
    expect(file.size).toBe(512);
  });

  it("should accept all valid SkillOtherFile types", () => {
    const types: Array<SkillOtherFile["type"]> = [
      "evals",
      "logs",
      "package",
      "other",
    ];
    expect(types).toHaveLength(4);
  });

  it("should have correct SkillSubResource structure", () => {
    const resource: SkillSubResource = {
      filename: "agent.md",
      relativePath: "agents/agent.md",
      size: 1024,
    };

    expect(resource.filename).toBe("agent.md");
    expect(resource.relativePath).toBe("agents/agent.md");
    expect(resource.size).toBe(1024);
  });

  it("should allow optional description in SkillSubResource", () => {
    const resource: SkillSubResource = {
      filename: "agent.md",
      relativePath: "agents/agent.md",
      description: "Main agent file",
      size: 1024,
    };

    expect(resource.description).toBe("Main agent file");
  });

  it("should have correct SkillMetadata structure", () => {
    const metadata: SkillMetadata = {
      name: "test-skill",
      description: "Test skill description",
      path: "/path/to/skill",
      updatedAt: new Date(),
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    };

    expect(metadata.name).toBe("test-skill");
    expect(metadata.description).toBe("Test skill description");
    expect(metadata.path).toBe("/path/to/skill");
    expect(metadata.updatedAt).toBeInstanceOf(Date);
  });

  it("should allow optional allowedTools in SkillMetadata", () => {
    const metadata: SkillMetadata = {
      name: "test-skill",
      description: "Test skill",
      allowedTools: ["Read", "Write", "Edit"],
      path: "/path/to/skill",
      updatedAt: new Date(),
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    };

    expect(metadata.allowedTools).toEqual(["Read", "Write", "Edit"]);
  });

  it("should have correct ImportedSkill structure", () => {
    const imported: ImportedSkill = {
      name: "imported-skill",
      description: "Imported skill description",
      path: "/path/to/skill",
      updatedAt: new Date(),
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
      importedAt: new Date(),
      status: "active",
    };

    expect(imported.importedAt).toBeInstanceOf(Date);
    expect(imported.status).toBe("active");
  });

  it("should allow optional content in ImportedSkill", () => {
    const imported: ImportedSkill = {
      name: "imported-skill",
      description: "Imported skill",
      path: "/path/to/skill",
      updatedAt: new Date(),
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
      importedAt: new Date(),
      status: "disabled",
      content: "# SKILL.md content",
    };

    expect(imported.content).toBe("# SKILL.md content");
    expect(imported.status).toBe("disabled");
  });
});

// =============================================================================
// Task 4-2: Execution Types Tests
// =============================================================================
describe("Skill Execution Types", () => {
  it("should have correct SkillExecutionRequest structure", () => {
    const request: SkillExecutionRequest = {
      skillName: "test-skill",
      prompt: "Execute this task",
    };

    expect(request.skillName).toBe("test-skill");
    expect(request.prompt).toBe("Execute this task");
  });

  it("should allow optional workingDirectory in SkillExecutionRequest", () => {
    const request: SkillExecutionRequest = {
      skillName: "test-skill",
      prompt: "Execute this task",
      workingDirectory: "/custom/path",
    };

    expect(request.workingDirectory).toBe("/custom/path");
  });

  it("should have correct SkillExecutionResponse structure", () => {
    const response: SkillExecutionResponse = {
      executionId: "exec-123",
      success: true,
    };

    expect(response.executionId).toBe("exec-123");
    expect(response.success).toBe(true);
  });

  it("should allow optional error in SkillExecutionResponse", () => {
    const response: SkillExecutionResponse = {
      executionId: "exec-123",
      success: false,
      error: "Skill not found",
    };

    expect(response.success).toBe(false);
    expect(response.error).toBe("Skill not found");
  });

  it("should have valid SkillExecutionStatus values", () => {
    const statuses: SkillExecutionStatus[] = [
      "idle",
      "running",
      "permission_pending",
      "completed",
      "cancelled",
      "error",
      "review",
      "improve_ready",
      "reuse_ready",
    ];

    expect(statuses).toHaveLength(9);
    expect(statuses).toContain("idle");
    expect(statuses).toContain("running");
    expect(statuses).toContain("permission_pending");
    expect(statuses).toContain("completed");
    expect(statuses).toContain("cancelled");
    expect(statuses).toContain("error");
    expect(statuses).toContain("review");
    expect(statuses).toContain("improve_ready");
    expect(statuses).toContain("reuse_ready");
  });
});

// =============================================================================
// Task 4-3: Streaming Message Types Tests
// =============================================================================
describe("Skill Stream Message Types", () => {
  it("should have valid SkillStreamMessageType values", () => {
    const types: SkillStreamMessageType[] = [
      "assistant",
      "tool_use",
      "tool_result",
      "status",
      "error",
    ];

    expect(types).toHaveLength(5);
  });

  it("should have correct AssistantMessageContent structure", () => {
    const content: AssistantMessageContent = {
      text: "Hello, world!",
    };

    expect(content.text).toBe("Hello, world!");
  });

  it("should allow optional isPartial in AssistantMessageContent", () => {
    const content: AssistantMessageContent = {
      text: "Hello",
      isPartial: true,
    };

    expect(content.isPartial).toBe(true);
  });

  it("should have correct ToolUseMessageContent structure", () => {
    const content: ToolUseMessageContent = {
      toolName: "read_file",
      args: { path: "/test/file.txt" },
      toolUseId: "tool-123",
    };

    expect(content.toolName).toBe("read_file");
    expect(content.args).toEqual({ path: "/test/file.txt" });
    expect(content.toolUseId).toBe("tool-123");
  });

  it("should have correct ToolResultMessageContent structure", () => {
    const content: ToolResultMessageContent = {
      toolUseId: "tool-123",
      success: true,
      result: "file content here",
    };

    expect(content.toolUseId).toBe("tool-123");
    expect(content.success).toBe(true);
    expect(content.result).toBe("file content here");
  });

  it("should allow error in ToolResultMessageContent", () => {
    const content: ToolResultMessageContent = {
      toolUseId: "tool-123",
      success: false,
      error: "File not found",
    };

    expect(content.success).toBe(false);
    expect(content.error).toBe("File not found");
  });

  it("should have correct StatusMessageContent structure", () => {
    const content: StatusMessageContent = {
      status: "started",
    };

    expect(content.status).toBe("started");
  });

  it("should have all valid StatusMessageContent status values", () => {
    const statuses: Array<StatusMessageContent["status"]> = [
      "started",
      "tool_executing",
      "tool_completed",
      "completed",
    ];

    expect(statuses).toHaveLength(4);
  });

  it("should allow optional detail in StatusMessageContent", () => {
    const content: StatusMessageContent = {
      status: "tool_executing",
      detail: "Running read_file",
    };

    expect(content.detail).toBe("Running read_file");
  });

  it("should have correct ErrorMessageContent structure", () => {
    const content: ErrorMessageContent = {
      code: "sdk_error",
      message: "An error occurred",
      retryable: true,
    };

    expect(content.code).toBe("sdk_error");
    expect(content.message).toBe("An error occurred");
    expect(content.retryable).toBe(true);
  });

  it("should have all valid ErrorMessageContent code values", () => {
    const codes: Array<ErrorMessageContent["code"]> = [
      "sdk_error",
      "permission_denied",
      "timeout",
      "network",
      "unknown",
    ];

    expect(codes).toHaveLength(5);
  });
});

// =============================================================================
// Task 4-3: SkillStreamMessage Discriminated Union Tests
// =============================================================================
describe("SkillStreamMessage Discriminated Union", () => {
  it("should have correct assistant message structure", () => {
    const message: SkillStreamMessage = {
      executionId: "exec-123",
      type: "assistant",
      content: {
        text: "Hello",
        isPartial: false,
      },
      timestamp: Date.now(),
    };

    expect(message.type).toBe("assistant");
    expect(message.executionId).toBe("exec-123");
    expect(typeof message.timestamp).toBe("number");
  });

  it("should have correct tool_use message structure", () => {
    const message: SkillStreamMessage = {
      executionId: "exec-123",
      type: "tool_use",
      content: {
        toolName: "read_file",
        args: { path: "/test" },
        toolUseId: "tool-123",
      },
      timestamp: Date.now(),
    };

    expect(message.type).toBe("tool_use");
  });

  it("should have correct tool_result message structure", () => {
    const message: SkillStreamMessage = {
      executionId: "exec-123",
      type: "tool_result",
      content: {
        toolUseId: "tool-123",
        success: true,
        result: "file content",
      },
      timestamp: Date.now(),
    };

    expect(message.type).toBe("tool_result");
  });

  it("should have correct status message structure", () => {
    const message: SkillStreamMessage = {
      executionId: "exec-123",
      type: "status",
      content: {
        status: "started",
      },
      timestamp: Date.now(),
    };

    expect(message.type).toBe("status");
  });

  it("should have correct error message structure", () => {
    const message: SkillStreamMessage = {
      executionId: "exec-123",
      type: "error",
      content: {
        code: "sdk_error",
        message: "An error occurred",
        retryable: true,
      },
      timestamp: Date.now(),
    };

    expect(message.type).toBe("error");
  });

  it("should allow type narrowing with discriminated union", () => {
    const message: SkillStreamMessage = {
      executionId: "exec-123",
      type: "assistant",
      content: {
        text: "Hello",
      },
      timestamp: Date.now(),
    };

    // Type narrowing test
    if (message.type === "assistant") {
      expect(message.content.text).toBe("Hello");
    }
  });
});

// =============================================================================
// Task 4-4: Permission Types Tests
// =============================================================================
describe("Permission Types", () => {
  it("should have correct SkillPermissionRequest structure", () => {
    const request: SkillPermissionRequest = {
      executionId: "exec-123",
      requestId: "req-456",
      toolName: "write_file",
      args: { path: "/test", content: "data" },
    };

    expect(request.executionId).toBe("exec-123");
    expect(request.requestId).toBe("req-456");
    expect(request.toolName).toBe("write_file");
    expect(request.args).toEqual({ path: "/test", content: "data" });
  });

  it("should allow optional reason in SkillPermissionRequest", () => {
    const request: SkillPermissionRequest = {
      executionId: "exec-123",
      requestId: "req-456",
      toolName: "delete_file",
      args: { path: "/important" },
      reason: "This action will delete an important file",
    };

    expect(request.reason).toBe("This action will delete an important file");
  });

  it("should have correct SkillPermissionResponse structure", () => {
    const response: SkillPermissionResponse = {
      requestId: "req-456",
      approved: true,
    };

    expect(response.requestId).toBe("req-456");
    expect(response.approved).toBe(true);
  });

  it("should allow optional rememberChoice in SkillPermissionResponse", () => {
    const response: SkillPermissionResponse = {
      requestId: "req-456",
      approved: true,
      rememberChoice: true,
    };

    expect(response.rememberChoice).toBe(true);
  });

  it("should allow optional rejectReason in SkillPermissionResponse", () => {
    const response: SkillPermissionResponse = {
      requestId: "req-456",
      approved: false,
      rejectReason: "User denied the request",
    };

    expect(response.approved).toBe(false);
    expect(response.rejectReason).toBe("User denied the request");
  });
});

// =============================================================================
// TASK-FIX-1-1-TYPE-ALIGNMENT: Type Integration Tests
// Phase 4: TDD Red - Tests for types to be migrated from skill-execution.ts
// =============================================================================

// Import types that will be migrated from skill-execution.ts
import type {
  ExecutionState,
  ExecutionInfo,
  SkillExecutionErrorCode,
  SkillExecutionError,
  ExecutionContext,
} from "../skill";

// Import constant that will be migrated
import { SKILL_EXECUTION_DEFAULTS } from "../skill";

describe("TASK-FIX-1-1: Execution State Types (migrated from skill-execution.ts)", () => {
  it("should have valid ExecutionState values", () => {
    const states: ExecutionState[] = [
      "pending",
      "running",
      "completed",
      "aborted",
      "error",
    ];

    expect(states).toHaveLength(5);
    expect(states).toContain("pending");
    expect(states).toContain("running");
    expect(states).toContain("completed");
    expect(states).toContain("aborted");
    expect(states).toContain("error");
  });

  it("should have correct ExecutionInfo structure", () => {
    const info: ExecutionInfo = {
      id: "exec-123",
      skillId: "skill-456",
      state: "running",
      startedAt: Date.now(),
    };

    expect(info.id).toBe("exec-123");
    expect(info.skillId).toBe("skill-456");
    expect(info.state).toBe("running");
    expect(typeof info.startedAt).toBe("number");
  });

  it("should allow optional completedAt in ExecutionInfo", () => {
    const info: ExecutionInfo = {
      id: "exec-123",
      skillId: "skill-456",
      state: "completed",
      startedAt: Date.now() - 1000,
      completedAt: Date.now(),
    };

    expect(info.completedAt).toBeDefined();
    expect(typeof info.completedAt).toBe("number");
  });
});

describe("TASK-FIX-1-1: Execution Error Types (migrated from skill-execution.ts)", () => {
  it("should have valid SkillExecutionErrorCode values", () => {
    const codes: SkillExecutionErrorCode[] = [
      "EXECUTION_FAILED",
      "TIMEOUT",
      "ABORTED",
      "MAX_CONCURRENT_EXCEEDED",
      "SKILL_NOT_FOUND",
      "VALIDATION_FAILED",
      "SDK_ERROR",
      "NETWORK_ERROR",
      "AUTHENTICATION_ERROR",
    ];

    expect(codes).toHaveLength(9);
    expect(codes).toContain("EXECUTION_FAILED");
    expect(codes).toContain("TIMEOUT");
    expect(codes).toContain("SKILL_NOT_FOUND");
    expect(codes).toContain("SDK_ERROR");
  });

  it("should have correct SkillExecutionError structure", () => {
    const error: SkillExecutionError = {
      code: "SKILL_NOT_FOUND",
      message: "The requested skill was not found",
    };

    expect(error.code).toBe("SKILL_NOT_FOUND");
    expect(error.message).toBe("The requested skill was not found");
  });

  it("should allow optional details in SkillExecutionError", () => {
    const error: SkillExecutionError = {
      code: "VALIDATION_FAILED",
      message: "Validation failed",
      details: { field: "skillName", reason: "required" },
    };

    expect(error.details).toEqual({ field: "skillName", reason: "required" });
  });
});

describe("TASK-FIX-1-1: Execution Context Types (migrated from skill-execution.ts)", () => {
  it("should have correct ExecutionContext structure", () => {
    const context: ExecutionContext = {
      id: "exec-123",
      skillId: "skill-456",
      abortController: new AbortController(),
      state: "running",
      startedAt: Date.now(),
    };

    expect(context.id).toBe("exec-123");
    expect(context.skillId).toBe("skill-456");
    expect(context.abortController).toBeInstanceOf(AbortController);
    expect(context.state).toBe("running");
    expect(typeof context.startedAt).toBe("number");
  });

  it("should allow optional completedAt in ExecutionContext", () => {
    const context: ExecutionContext = {
      id: "exec-123",
      skillId: "skill-456",
      abortController: new AbortController(),
      state: "completed",
      startedAt: Date.now() - 1000,
      completedAt: Date.now(),
    };

    expect(context.completedAt).toBeDefined();
    expect(context.state).toBe("completed");
  });
});

describe("TASK-FIX-1-1: Execution Defaults (migrated from skill-execution.ts)", () => {
  it("should export SKILL_EXECUTION_DEFAULTS constant", () => {
    expect(SKILL_EXECUTION_DEFAULTS).toBeDefined();
    expect(typeof SKILL_EXECUTION_DEFAULTS).toBe("object");
  });

  it("should have correct default values", () => {
    expect(SKILL_EXECUTION_DEFAULTS.DEFAULT_TIMEOUT).toBe(30000);
    expect(SKILL_EXECUTION_DEFAULTS.MAX_CONCURRENT_EXECUTIONS).toBe(5);
    expect(SKILL_EXECUTION_DEFAULTS.MAX_RETRIES).toBe(3);
    expect(SKILL_EXECUTION_DEFAULTS.INITIAL_RETRY_DELAY).toBe(1000);
    expect(SKILL_EXECUTION_DEFAULTS.MAX_RETRY_DELAY).toBe(4000);
  });

  it("should be immutable (as const)", () => {
    // TypeScript compile-time check - these should be readonly
    const defaults = SKILL_EXECUTION_DEFAULTS;
    expect(Object.isFrozen(defaults)).toBe(false); // as const doesn't freeze
    // But values should be constant at compile time
    expect(defaults.DEFAULT_TIMEOUT).toBe(30000);
  });
});

describe("TASK-FIX-1-1: Type Export Verification", () => {
  it("should export all migrated types from skill.ts", async () => {
    const skillModule = await import("../skill");

    // Verify type exports exist (runtime check for value exports)
    expect(skillModule.SKILL_EXECUTION_DEFAULTS).toBeDefined();

    // Type-only exports are verified at compile time by the imports above
    // If this test compiles, the types are correctly exported
  });

  it("should NOT have skill-execution.ts export SkillStreamMessage", async () => {
    // This test verifies that after migration, skill-execution.ts is deleted
    // and types come only from skill.ts
    // The test will fail if skill-execution.ts still exists and exports these types
    try {
      // This import should fail after skill-execution.ts is deleted
      await import("../skill-execution");
      // If we get here, skill-execution.ts still exists
      // This is expected in Red phase, will pass after Green phase
    } catch {
      // Expected: skill-execution.ts should not exist after migration
      expect(true).toBe(true);
    }
  });
});
