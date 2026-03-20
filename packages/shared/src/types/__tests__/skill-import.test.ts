/**
 * Skill Types - Import and Extended Tests
 * @module skill-import.test
 *
 * Phase 6: テスト拡充
 * - Task 6-1: インポート確認テスト
 * - Task 6-2: オプショナルプロパティテスト
 * - Task 6-3: Discriminated Union型ガードテスト
 * - Task 6-4: エッジケーステスト
 */
import { describe, it, expect } from "vitest";

// packages/shared の index.ts からインポート
import type {
  SkillMetadata,
  SkillSubResource,
  SkillOtherFile,
  ImportedSkill,
  SkillExecutionRequest,
  SkillExecutionResponse,
  SkillExecutionStatus,
  SkillStreamMessage,
  SkillStreamMessageType,
  AssistantMessageContent as _AssistantMessageContent,
  ToolUseMessageContent as _ToolUseMessageContent,
  ToolResultMessageContent as _ToolResultMessageContent,
  StatusMessageContent,
  ErrorMessageContent,
  SkillPermissionRequest,
  SkillPermissionResponse,
} from "@repo/shared";

// =============================================================================
// Task 6-1: Import Tests from @repo/shared
// =============================================================================
describe("Skill Types - Import from @repo/shared", () => {
  it("should import SkillMetadata type", () => {
    const metadata: SkillMetadata = {
      name: "test",
      description: "test",
      path: "/test",
      updatedAt: new Date(),
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    };
    expect(metadata).toBeDefined();
  });

  it("should import all stream message types", () => {
    // 型のみのテスト - コンパイルが通ればOK
    const types: SkillStreamMessageType[] = [
      "assistant",
      "tool_use",
      "tool_result",
      "status",
      "error",
    ];
    expect(types).toHaveLength(5);
  });

  it("should import execution types", () => {
    const request: SkillExecutionRequest = {
      skillName: "test-skill",
      prompt: "Execute",
    };
    const response: SkillExecutionResponse = {
      executionId: "exec-1",
      success: true,
    };
    const status: SkillExecutionStatus = "idle";

    expect(request).toBeDefined();
    expect(response).toBeDefined();
    expect(status).toBe("idle");
  });

  it("should import permission types", () => {
    const request: SkillPermissionRequest = {
      executionId: "exec-1",
      requestId: "req-1",
      toolName: "write_file",
      args: { path: "/test" },
    };
    const response: SkillPermissionResponse = {
      requestId: "req-1",
      approved: true,
    };

    expect(request).toBeDefined();
    expect(response).toBeDefined();
  });
});

// =============================================================================
// Task 6-2: Optional Properties Tests
// =============================================================================
describe("Skill Types - Optional Properties", () => {
  it("should allow optional allowedTools in SkillMetadata", () => {
    const withTools: SkillMetadata = {
      name: "test",
      description: "test",
      path: "/test",
      updatedAt: new Date(),
      allowedTools: ["Read", "Write"],
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    };

    const withoutTools: SkillMetadata = {
      name: "test",
      description: "test",
      path: "/test",
      updatedAt: new Date(),
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    };

    expect(withTools.allowedTools).toBeDefined();
    expect(withoutTools.allowedTools).toBeUndefined();
  });

  it("should allow optional description in SkillSubResource", () => {
    const withDesc: SkillSubResource = {
      filename: "test.md",
      relativePath: "agents/test.md",
      description: "Test description",
      size: 100,
    };

    const withoutDesc: SkillSubResource = {
      filename: "test.md",
      relativePath: "agents/test.md",
      size: 100,
    };

    expect(withDesc.description).toBeDefined();
    expect(withoutDesc.description).toBeUndefined();
  });

  it("should allow optional content in ImportedSkill", () => {
    const base: SkillMetadata = {
      name: "test",
      description: "test",
      path: "/test",
      updatedAt: new Date(),
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    };

    const withContent: ImportedSkill = {
      ...base,
      importedAt: new Date(),
      status: "active",
      content: "# SKILL.md content",
    };

    const withoutContent: ImportedSkill = {
      ...base,
      importedAt: new Date(),
      status: "active",
    };

    expect(withContent.content).toBeDefined();
    expect(withoutContent.content).toBeUndefined();
  });

  it("should allow optional workingDirectory in SkillExecutionRequest", () => {
    const withDir: SkillExecutionRequest = {
      skillName: "test",
      prompt: "Execute",
      workingDirectory: "/custom/path",
    };

    const withoutDir: SkillExecutionRequest = {
      skillName: "test",
      prompt: "Execute",
    };

    expect(withDir.workingDirectory).toBeDefined();
    expect(withoutDir.workingDirectory).toBeUndefined();
  });

  it("should allow optional error in SkillExecutionResponse", () => {
    const withError: SkillExecutionResponse = {
      executionId: "exec-1",
      success: false,
      error: "Skill not found",
    };

    const withoutError: SkillExecutionResponse = {
      executionId: "exec-1",
      success: true,
    };

    expect(withError.error).toBeDefined();
    expect(withoutError.error).toBeUndefined();
  });

  it("should allow optional reason in SkillPermissionRequest", () => {
    const withReason: SkillPermissionRequest = {
      executionId: "exec-1",
      requestId: "req-1",
      toolName: "delete_file",
      args: { path: "/important" },
      reason: "This action will delete an important file",
    };

    const withoutReason: SkillPermissionRequest = {
      executionId: "exec-1",
      requestId: "req-1",
      toolName: "write_file",
      args: { path: "/test" },
    };

    expect(withReason.reason).toBeDefined();
    expect(withoutReason.reason).toBeUndefined();
  });

  it("should allow optional rememberChoice and rejectReason in SkillPermissionResponse", () => {
    const approved: SkillPermissionResponse = {
      requestId: "req-1",
      approved: true,
      rememberChoice: true,
    };

    const rejected: SkillPermissionResponse = {
      requestId: "req-1",
      approved: false,
      rejectReason: "User denied the request",
    };

    const minimal: SkillPermissionResponse = {
      requestId: "req-1",
      approved: true,
    };

    expect(approved.rememberChoice).toBe(true);
    expect(rejected.rejectReason).toBeDefined();
    expect(minimal.rememberChoice).toBeUndefined();
    expect(minimal.rejectReason).toBeUndefined();
  });
});

// =============================================================================
// Task 6-3: Discriminated Union Type Guards Tests
// =============================================================================
describe("Skill Types - Discriminated Union Type Guards", () => {
  it("should narrow type based on type property", () => {
    const messages: SkillStreamMessage[] = [
      {
        executionId: "1",
        type: "assistant",
        content: { text: "Hello" },
        timestamp: Date.now(),
      },
      {
        executionId: "2",
        type: "tool_use",
        content: { toolName: "read", args: {}, toolUseId: "t1" },
        timestamp: Date.now(),
      },
    ];

    messages.forEach((msg) => {
      switch (msg.type) {
        case "assistant":
          // TypeScript should narrow to AssistantMessageContent
          expect(msg.content.text).toBeDefined();
          break;
        case "tool_use":
          // TypeScript should narrow to ToolUseMessageContent
          expect(msg.content.toolName).toBeDefined();
          break;
        case "tool_result":
          expect(msg.content.toolUseId).toBeDefined();
          break;
        case "status":
          expect(msg.content.status).toBeDefined();
          break;
        case "error":
          expect(msg.content.code).toBeDefined();
          break;
      }
    });
  });

  it("should correctly narrow all five message types", () => {
    const allMessages: SkillStreamMessage[] = [
      {
        executionId: "1",
        type: "assistant",
        content: { text: "Hello", isPartial: false },
        timestamp: 1000,
      },
      {
        executionId: "2",
        type: "tool_use",
        content: {
          toolName: "read_file",
          args: { path: "/test" },
          toolUseId: "tu-1",
        },
        timestamp: 2000,
      },
      {
        executionId: "3",
        type: "tool_result",
        content: { toolUseId: "tu-1", success: true, result: "file content" },
        timestamp: 3000,
      },
      {
        executionId: "4",
        type: "status",
        content: { status: "completed", detail: "All done" },
        timestamp: 4000,
      },
      {
        executionId: "5",
        type: "error",
        content: {
          code: "sdk_error",
          message: "Something failed",
          retryable: true,
        },
        timestamp: 5000,
      },
    ];

    expect(allMessages).toHaveLength(5);

    // Verify each message type can be narrowed
    const assistantMsg = allMessages[0];
    if (assistantMsg.type === "assistant") {
      expect(assistantMsg.content.text).toBe("Hello");
      expect(assistantMsg.content.isPartial).toBe(false);
    }

    const toolUseMsg = allMessages[1];
    if (toolUseMsg.type === "tool_use") {
      expect(toolUseMsg.content.toolName).toBe("read_file");
      expect(toolUseMsg.content.toolUseId).toBe("tu-1");
    }

    const toolResultMsg = allMessages[2];
    if (toolResultMsg.type === "tool_result") {
      expect(toolResultMsg.content.success).toBe(true);
      expect(toolResultMsg.content.result).toBe("file content");
    }

    const statusMsg = allMessages[3];
    if (statusMsg.type === "status") {
      expect(statusMsg.content.status).toBe("completed");
      expect(statusMsg.content.detail).toBe("All done");
    }

    const errorMsg = allMessages[4];
    if (errorMsg.type === "error") {
      expect(errorMsg.content.code).toBe("sdk_error");
      expect(errorMsg.content.retryable).toBe(true);
    }
  });

  it("should handle type narrowing with function", () => {
    function handleMessage(msg: SkillStreamMessage): string {
      switch (msg.type) {
        case "assistant":
          return `Assistant: ${msg.content.text}`;
        case "tool_use":
          return `Tool: ${msg.content.toolName}`;
        case "tool_result":
          return `Result: ${msg.content.success ? "success" : "failed"}`;
        case "status":
          return `Status: ${msg.content.status}`;
        case "error":
          return `Error: ${msg.content.code}`;
      }
    }

    const msg: SkillStreamMessage = {
      executionId: "1",
      type: "assistant",
      content: { text: "Test" },
      timestamp: Date.now(),
    };

    expect(handleMessage(msg)).toBe("Assistant: Test");
  });
});

// =============================================================================
// Task 6-4: Edge Cases Tests
// =============================================================================
describe("Skill Types - Edge Cases", () => {
  it("should handle empty arrays in SkillMetadata", () => {
    const metadata: SkillMetadata = {
      name: "",
      description: "",
      path: "",
      updatedAt: new Date(0),
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    };

    expect(metadata.agents).toHaveLength(0);
    expect(metadata.references).toHaveLength(0);
    expect(metadata.scripts).toHaveLength(0);
    expect(metadata.assets).toHaveLength(0);
    expect(metadata.schemas).toHaveLength(0);
    expect(metadata.indexes).toHaveLength(0);
    expect(metadata.otherFiles).toHaveLength(0);
  });

  it("should handle all SkillOtherFile types", () => {
    const types: SkillOtherFile["type"][] = [
      "evals",
      "logs",
      "package",
      "other",
    ];

    types.forEach((type) => {
      const file: SkillOtherFile = {
        filename: "test",
        type,
        size: 0,
      };
      expect(file.type).toBe(type);
    });
  });

  it("should handle all error codes in ErrorMessageContent", () => {
    const codes: ErrorMessageContent["code"][] = [
      "sdk_error",
      "permission_denied",
      "timeout",
      "network",
      "unknown",
    ];

    codes.forEach((code) => {
      const content: ErrorMessageContent = {
        code,
        message: "Error",
        retryable: false,
      };
      expect(content.code).toBe(code);
    });
  });

  it("should handle all status values in StatusMessageContent", () => {
    const statuses: StatusMessageContent["status"][] = [
      "started",
      "tool_executing",
      "tool_completed",
      "completed",
    ];

    statuses.forEach((status) => {
      const content: StatusMessageContent = { status };
      expect(content.status).toBe(status);
    });
  });

  it("should handle all SkillExecutionStatus values", () => {
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
    statuses.forEach((status) => {
      expect(typeof status).toBe("string");
    });
  });

  it("should handle zero-byte file sizes", () => {
    const resource: SkillSubResource = {
      filename: "empty.md",
      relativePath: "assets/empty.md",
      size: 0,
    };

    const otherFile: SkillOtherFile = {
      filename: "empty.json",
      type: "other",
      size: 0,
    };

    expect(resource.size).toBe(0);
    expect(otherFile.size).toBe(0);
  });

  it("should handle large file sizes", () => {
    const largeFile: SkillSubResource = {
      filename: "large.bin",
      relativePath: "assets/large.bin",
      size: Number.MAX_SAFE_INTEGER,
    };

    expect(largeFile.size).toBe(Number.MAX_SAFE_INTEGER);
  });

  it("should handle special characters in strings", () => {
    const metadata: SkillMetadata = {
      name: "test-skill_日本語",
      description: 'Description with <special> & "characters"',
      path: "/path/with spaces/and/日本語",
      updatedAt: new Date(),
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    };

    expect(metadata.name).toContain("日本語");
    expect(metadata.description).toContain("<special>");
    expect(metadata.path).toContain(" ");
  });

  it("should handle ImportedSkill with both status values", () => {
    const base: SkillMetadata = {
      name: "test",
      description: "test",
      path: "/test",
      updatedAt: new Date(),
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    };

    const active: ImportedSkill = {
      ...base,
      importedAt: new Date(),
      status: "active",
    };
    const disabled: ImportedSkill = {
      ...base,
      importedAt: new Date(),
      status: "disabled",
    };

    expect(active.status).toBe("active");
    expect(disabled.status).toBe("disabled");
  });
});
