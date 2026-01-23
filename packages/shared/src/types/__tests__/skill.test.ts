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
    ];

    expect(statuses).toHaveLength(6);
    expect(statuses).toContain("idle");
    expect(statuses).toContain("running");
    expect(statuses).toContain("permission_pending");
    expect(statuses).toContain("completed");
    expect(statuses).toContain("cancelled");
    expect(statuses).toContain("error");
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
