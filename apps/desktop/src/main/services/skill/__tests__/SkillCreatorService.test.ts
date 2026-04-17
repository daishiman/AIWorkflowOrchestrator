/**
 * SkillCreatorService Unit Tests
 * Phase 4: TDD Red State - Tests created before implementation
 *
 * Test Coverage:
 * - SC-001〜SC-019: detectMode(), createSkill(), executeTasks(), validateSkill(), validateWithSchema()
 * - SC-020〜SC-021: createSkill() Extended Modes (update, improve-prompt)
 * - SC-022〜SC-023: improveSkill() [Red - Not Yet Implemented]
 * - SC-024〜SC-025: forkSkill() [Red - Not Yet Implemented]
 * - SC-026: shareSkill() [Red - Not Yet Implemented]
 * - SC-027: scheduleSkill() [Red - Not Yet Implemented]
 * - SC-028: debugSkill() [Red - Not Yet Implemented]
 * - SC-029: generateDocs() [Red - Not Yet Implemented]
 * - SC-030: getStats() [Red - Not Yet Implemented]
 * - SC-031: executeTasks() Parallel Extension
 * - BC-001〜BC-005: Boundary and error cases
 * - BV-001〜BV-008: Boundary value tests (validation, security, performance)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import os from "os";
import * as fsPromises from "fs/promises";
import { SkillCreatorService } from "../SkillCreatorService";
import { ScriptExecutor } from "../ScriptExecutor";
import { ResourceLoader } from "../ResourceLoader";
import type { CreateSkillOptions, InterviewResult } from "@repo/shared/types";

// Mock dependencies
vi.mock("../ScriptExecutor");
vi.mock("../ResourceLoader");
vi.mock("fs/promises");

describe("SkillCreatorService", () => {
  let service: SkillCreatorService;
  let mockScriptExecutor: {
    execute: ReturnType<typeof vi.fn>;
    executeJson: ReturnType<typeof vi.fn>;
  };
  let mockResourceLoader: {
    load: ReturnType<typeof vi.fn>;
    loadAgent: ReturnType<typeof vi.fn>;
    loadSchema: ReturnType<typeof vi.fn>;
    clearCache: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock implementations
    mockScriptExecutor = {
      execute: vi.fn(),
      executeJson: vi.fn(),
    };

    mockResourceLoader = {
      load: vi.fn(),
      loadAgent: vi.fn(),
      loadSchema: vi.fn(),
      clearCache: vi.fn(),
    };

    // Mock constructor implementations
    vi.mocked(ScriptExecutor).mockImplementation(
      () => mockScriptExecutor as unknown as ScriptExecutor,
    );
    vi.mocked(ResourceLoader).mockImplementation(
      () => mockResourceLoader as unknown as ResourceLoader,
    );

    // fs/promises デフォルトモック（createSkill内のensureSkillMdExists・generate blockで使用）
    vi.mocked(fsPromises.mkdir).mockResolvedValue(undefined);
    vi.mocked(fsPromises.access).mockRejectedValue(new Error("ENOENT"));
    vi.mocked(fsPromises.writeFile).mockResolvedValue();
    vi.mocked(fsPromises.unlink).mockResolvedValue();
    vi.mocked(fsPromises.readdir).mockResolvedValue([]);
    vi.mocked(fsPromises.readFile).mockResolvedValue(Buffer.from(""));

    service = new SkillCreatorService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const allowGeneratedSkillMd = () => {
    mockScriptExecutor.execute.mockImplementation(async () => ({
      success: true,
      stdout: "",
      stderr: "",
      exitCode: 0,
    }));
    vi.mocked(fsPromises.access).mockImplementation(async (target) => {
      const resolvedPath = String(target);
      if (/test-skill[\\/\\\\]SKILL\.md$/.test(resolvedPath)) {
        return;
      }
      throw new Error("ENOENT");
    });
  };

  describe("detectMode()", () => {
    it("SC-001: should detect collaborative mode for ambiguous requests", async () => {
      // Arrange
      mockScriptExecutor.executeJson.mockResolvedValue({
        mode: "collaborative",
      });

      // Act
      const result = await service.detectMode("新しいスキルを一緒に作りたい");

      // Assert
      expect(result).toBe("collaborative");
      expect(mockScriptExecutor.executeJson).toHaveBeenCalledWith(
        "detect_mode.js",
        expect.arrayContaining(["--request"]),
      );
    });

    it("SC-002: should detect orchestrate mode for execution engine requests", async () => {
      // Arrange
      mockScriptExecutor.executeJson.mockResolvedValue({ mode: "orchestrate" });

      // Act
      const result = await service.detectMode("Codexで実行したい");

      // Assert
      expect(result).toBe("orchestrate");
    });

    it("SC-003: should detect create mode for explicit skill creation", async () => {
      // Arrange
      mockScriptExecutor.executeJson.mockResolvedValue({ mode: "create" });

      // Act
      const result = await service.detectMode("my-skillという名前でスキル作成");

      // Assert
      expect(result).toBe("create");
    });

    it("SC-004: should detect update mode for skill path specification", async () => {
      // Arrange
      mockScriptExecutor.executeJson.mockResolvedValue({ mode: "update" });

      // Act
      const result = await service.detectMode("/path/to/skillを更新");

      // Assert
      expect(result).toBe("update");
    });

    it("SC-005: should detect improve-prompt mode for prompt optimization", async () => {
      // Arrange
      mockScriptExecutor.executeJson.mockResolvedValue({
        mode: "improve-prompt",
      });

      // Act
      const result = await service.detectMode("プロンプトを最適化して");

      // Assert
      expect(result).toBe("improve-prompt");
    });
  });

  describe("createSkill()", () => {
    const mockInterviewResult: InterviewResult = {
      purpose: "Test skill purpose",
      features: ["feature1", "feature2"],
      inputs: ["input1"],
      outputs: ["output1"],
      toolsNeeded: ["Read", "Write"],
      abstractionLevel: "L2",
    };

    it("SC-006: should execute collaborative workflow", async () => {
      // Arrange
      const options: CreateSkillOptions = {
        name: "test-skill",
        description: "Test description",
        mode: "collaborative",
        interviewResult: mockInterviewResult,
      };
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "/path/to/skill",
        stderr: "",
        exitCode: 0,
      });

      // Act
      const result = await service.createSkill(options);

      // Assert
      expect(result).toContain("test-skill");
    });

    it("SC-007: should execute orchestrate workflow", async () => {
      // Arrange
      const options: CreateSkillOptions = {
        name: "test-skill",
        description: "Test description",
        mode: "orchestrate",
        executionEngine: "claude",
      };
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "/path/to/skill",
        stderr: "",
        exitCode: 0,
      });

      // Act
      const result = await service.createSkill(options);

      // Assert
      expect(result).toBeDefined();
    });

    it("SC-008: should execute create workflow", async () => {
      // Arrange
      const options: CreateSkillOptions = {
        name: "simple-skill",
        description: "Simple skill description",
        mode: "create",
      };
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "/path/to/simple-skill",
        stderr: "",
        exitCode: 0,
      });

      // Act
      const result = await service.createSkill(options);

      // Assert
      expect(result).toContain("simple-skill");
    });

    it("SC-009: should generate task specifications when generateTasks is true", async () => {
      // Arrange
      const options: CreateSkillOptions = {
        name: "task-skill",
        description: "Skill with tasks",
        mode: "create",
        generateTasks: true,
      };
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "/path/to/task-skill",
        stderr: "",
        exitCode: 0,
      });

      // Act
      const result = await service.createSkill(options);

      // Assert
      expect(mockScriptExecutor.execute).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("SC-010: should throw error on validation failure", async () => {
      // Arrange
      const options: CreateSkillOptions = {
        name: "invalid-skill",
        description: "Invalid",
        mode: "create",
      };
      mockScriptExecutor.execute.mockResolvedValue({
        success: false,
        stdout: "",
        stderr: "Validation failed",
        exitCode: 1,
      });

      // Act & Assert
      await expect(service.createSkill(options)).rejects.toThrow();
    });
  });

  describe("executeTasks()", () => {
    it("SC-011: should execute tasks in topological order", async () => {
      // Arrange
      const options: ExecuteTasksOptions = {
        tasksDir: "/path/to/tasks",
        parallel: false,
      };
      mockScriptExecutor.executeJson.mockResolvedValue({
        tasks: [
          { id: "task-1", content: "Task 1", depends_on: [] },
          { id: "task-2", content: "Task 2", depends_on: ["task-1"] },
        ],
      });
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "",
        stderr: "",
        exitCode: 0,
      });

      // Act
      const result = await service.executeTasks(options);

      // Assert
      expect(result.mode).toBe("execution");
      expect(result.results).toBeDefined();
    });

    it("SC-012: should throw error on circular dependency", async () => {
      // Arrange
      const options: ExecuteTasksOptions = {
        tasksDir: "/path/to/circular",
      };
      mockScriptExecutor.executeJson.mockResolvedValue({
        tasks: [
          { id: "task-1", content: "Task 1", depends_on: ["task-2"] },
          { id: "task-2", content: "Task 2", depends_on: ["task-1"] },
        ],
      });

      // Act & Assert
      await expect(service.executeTasks(options)).rejects.toThrow(/circular/i);
    });

    it("SC-013: should execute independent tasks in parallel when parallel=true", async () => {
      // Arrange
      const options: ExecuteTasksOptions = {
        tasksDir: "/path/to/parallel",
        parallel: true,
      };
      mockScriptExecutor.executeJson.mockResolvedValue({
        tasks: [
          { id: "task-1", content: "Task 1", depends_on: [] },
          { id: "task-2", content: "Task 2", depends_on: [] },
        ],
      });
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "",
        stderr: "",
        exitCode: 0,
      });

      // Act
      const result = await service.executeTasks(options);

      // Assert
      expect(result.summary?.completed).toBe(2);
    });

    it("SC-014: should stop execution on first failure", async () => {
      // Arrange
      const options: ExecuteTasksOptions = {
        tasksDir: "/path/to/failing",
      };
      mockScriptExecutor.executeJson.mockResolvedValue({
        tasks: [
          { id: "task-1", content: "Task 1", depends_on: [] },
          { id: "task-2", content: "Task 2", depends_on: ["task-1"] },
        ],
      });
      mockScriptExecutor.execute
        .mockResolvedValueOnce({
          success: false,
          stdout: "",
          stderr: "Task failed",
          exitCode: 1,
        })
        .mockResolvedValue({
          success: true,
          stdout: "",
          stderr: "",
          exitCode: 0,
        });

      // Act
      const result = await service.executeTasks(options);

      // Assert
      expect(result.summary?.failed).toBeGreaterThan(0);
    });

    it("SC-015: should return dry-run plan without execution", async () => {
      // Arrange
      const options: ExecuteTasksOptions = {
        tasksDir: "/path/to/tasks",
        dryRun: true,
      };
      mockScriptExecutor.executeJson.mockResolvedValue({
        tasks: [
          { id: "task-1", content: "Task 1", depends_on: [] },
          { id: "task-2", content: "Task 2", depends_on: ["task-1"] },
        ],
      });

      // Act
      const result = await service.executeTasks(options);

      // Assert
      expect(result.mode).toBe("dry-run");
      expect(result.tasks).toBeDefined();
      expect(result.estimatedTime).toBeDefined();
    });
  });

  describe("validateSkill()", () => {
    it("SC-016: should return true for valid skill directory", async () => {
      // Arrange
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "Validation passed",
        stderr: "",
        exitCode: 0,
      });

      // Act
      const result = await service.validateSkill("/path/to/valid-skill");

      // Assert
      expect(result).toBe(true);
    });

    it("SC-017: should return false for invalid skill directory", async () => {
      // Arrange
      mockScriptExecutor.execute.mockResolvedValue({
        success: false,
        stdout: "",
        stderr: "Validation failed",
        exitCode: 1,
      });

      // Act
      const result = await service.validateSkill("/path/to/invalid-skill");

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("validateWithSchema()", () => {
    it("SC-018: should return true for schema-compliant data", async () => {
      // Arrange
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "Schema validation passed",
        stderr: "",
        exitCode: 0,
      });
      const data = { name: "test", version: "1.0.0" };

      // Act
      const result = await service.validateWithSchema("skill", data);

      // Assert
      expect(result).toBe(true);
    });

    it("SC-019: should return false for schema-non-compliant data", async () => {
      // Arrange
      mockScriptExecutor.execute.mockResolvedValue({
        success: false,
        stdout: "",
        stderr: "Schema validation failed",
        exitCode: 1,
      });
      const data = { invalid: "data" };

      // Act
      const result = await service.validateWithSchema("skill", data);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("Boundary and Error Cases", () => {
    it("BC-001: should handle empty task list", async () => {
      // Arrange
      const options: ExecuteTasksOptions = {
        tasksDir: "/path/to/empty",
      };
      mockScriptExecutor.executeJson.mockResolvedValue({ tasks: [] });

      // Act
      const result = await service.executeTasks(options);

      // Assert
      expect(result.summary?.total).toBe(0);
    });

    it("BC-002: should report all tasks failed when all fail", async () => {
      // Arrange
      const options: ExecuteTasksOptions = {
        tasksDir: "/path/to/all-failing",
      };
      mockScriptExecutor.executeJson.mockResolvedValue({
        tasks: [{ id: "task-1", content: "Task 1", depends_on: [] }],
      });
      mockScriptExecutor.execute.mockResolvedValue({
        success: false,
        stdout: "",
        stderr: "Failed",
        exitCode: 1,
      });

      // Act
      const result = await service.executeTasks(options);

      // Assert
      expect(result.summary?.failed).toBe(result.summary?.total);
    });

    it("BC-005: should throw error for empty interview result in collaborative mode", async () => {
      // Arrange
      const options: CreateSkillOptions = {
        name: "test",
        description: "test",
        mode: "collaborative",
        interviewResult: {} as InterviewResult, // Empty/invalid interview result
      };

      // Act & Assert
      await expect(service.createSkill(options)).rejects.toThrow();
    });
  });

  describe("createSkill() - Extended Modes", () => {
    it("SC-020: should execute update workflow for mode=update", async () => {
      const options: CreateSkillOptions = {
        name: "existing-skill",
        description: "Update existing",
        mode: "update",
        skillPath: "/path/to/existing",
      };
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "",
        stderr: "",
        exitCode: 0,
      });
      const result = await service.createSkill(options);
      expect(result).toContain("existing-skill");
    });

    it("SC-021: should execute improve-prompt workflow for mode=improve-prompt", async () => {
      const options: CreateSkillOptions = {
        name: "prompt-skill",
        description: "Improve prompt",
        mode: "improve-prompt",
      };
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "",
        stderr: "",
        exitCode: 0,
      });
      const result = await service.createSkill(options);
      expect(result).toContain("prompt-skill");
    });
  });

  describe("improveSkill() [Red - Not Yet Implemented]", () => {
    it("SC-022: should analyze existing skill and return improvement suggestions", async () => {
      // This test will fail until improveSkill() is implemented
      mockScriptExecutor.executeJson.mockResolvedValue({
        suggestions: [
          {
            category: "prompt",
            description: "Improve clarity",
            severity: "medium",
            autoFixable: true,
          },
        ],
      });
      const result = await (service as any).improveSkill(
        "existing-skill",
        false,
      );
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it("SC-023: should throw error for non-existent skill", async () => {
      mockScriptExecutor.executeJson.mockRejectedValue(
        new Error("Skill not found"),
      );
      await expect(
        (service as any).improveSkill("non-existent", false),
      ).rejects.toThrow("Skill not found");
    });
  });

  describe("forkSkill() [Red - Not Yet Implemented]", () => {
    it("SC-024: should clone skill to new directory", async () => {
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "/path/to/forked-skill",
        stderr: "",
        exitCode: 0,
      });
      const result = await (service as any).forkSkill(
        "original-skill",
        "forked-skill",
        {
          copyAgents: true,
          copyReferences: true,
          copyScripts: true,
          modifyTools: false,
        },
      );
      expect(result).toContain("forked-skill");
    });

    it("SC-025: should throw error when target skill name already exists", async () => {
      mockScriptExecutor.execute.mockRejectedValue(
        new Error("Skill already exists"),
      );
      await expect(
        (service as any).forkSkill("original", "existing", {}),
      ).rejects.toThrow("already exists");
    });
  });

  describe("shareSkill() [Red - Not Yet Implemented]", () => {
    it("SC-026: should export skill in shareable format", async () => {
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "https://gist.github.com/abc123",
        stderr: "",
        exitCode: 0,
      });
      const result = await (service as any).shareSkill(
        "export",
        "gist",
        "my-skill",
      );
      expect(result).toBeDefined();
    });
  });

  describe("scheduleSkill() [Red - Not Yet Implemented]", () => {
    it("SC-027: should save schedule configuration", async () => {
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "",
        stderr: "",
        exitCode: 0,
      });
      await expect(
        (service as any).scheduleSkill("test-skill", {
          skillName: "test-skill",
          scheduleType: "cron",
          value: "0 9 * * *",
          isEnabled: true,
        }),
      ).resolves.not.toThrow();
    });
  });

  describe("debugSkill() [Red - Not Yet Implemented]", () => {
    it("SC-028: should return debug result with step details", async () => {
      mockScriptExecutor.executeJson.mockResolvedValue({
        steps: [
          {
            stepNumber: 1,
            toolName: "Read",
            input: {},
            output: "content",
            duration: 100,
            hitBreakpoint: false,
          },
        ],
      });
      const result = await (service as any).debugSkill("test-skill", {});
      expect(result.steps).toBeDefined();
      expect(result.steps.length).toBeGreaterThan(0);
    });
  });

  describe("generateDocs() [Red - Not Yet Implemented]", () => {
    it("SC-029: should generate documentation files", async () => {
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "/path/to/docs/output.md",
        stderr: "",
        exitCode: 0,
      });
      const result = await (service as any).generateDocs(
        "test-skill",
        "markdown",
        ["overview", "api"],
      );
      expect(result).toBeDefined();
    });
  });

  describe("getStats() [Red - Not Yet Implemented]", () => {
    it("SC-030: should return usage statistics", async () => {
      mockScriptExecutor.executeJson.mockResolvedValue({
        skillName: "test-skill",
        period: "7d",
        executionCount: 42,
        successCount: 38,
        failureCount: 4,
        averageDuration: 1500,
        topTools: [{ tool: "Read", count: 100 }],
        hourlyDistribution: {},
        errorTrends: [],
      });
      const result = await (service as any).getStats("test-skill", "7d");
      expect(result.executionCount).toBe(42);
      expect(result.successCount).toBe(38);
    });
  });

  describe("executeTasks() - Parallel Extension", () => {
    it("SC-031: should execute independent tasks simultaneously in parallel mode", async () => {
      const options = {
        tasksDir: "/path/to/parallel-tasks",
        parallel: true,
      };
      mockScriptExecutor.executeJson.mockResolvedValue({
        tasks: [
          { id: "task-a", content: "Task A", depends_on: [] },
          { id: "task-b", content: "Task B", depends_on: [] },
          { id: "task-c", content: "Task C", depends_on: ["task-a"] },
        ],
      });
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "",
        stderr: "",
        exitCode: 0,
      });
      const result = await service.executeTasks(options);
      expect(result.summary?.completed).toBe(3);
    });
  });

  describe("Boundary Value Tests", () => {
    it("BV-001: should throw error for empty skill name", async () => {
      const options: CreateSkillOptions = {
        name: "",
        description: "test",
        mode: "create",
      };
      mockScriptExecutor.execute.mockResolvedValue({
        success: false,
        stdout: "",
        stderr: "Invalid name",
        exitCode: 1,
      });
      await expect(service.createSkill(options)).rejects.toThrow();
    });

    it("BV-002: should throw error for whitespace-only skill name (P42)", async () => {
      const options: CreateSkillOptions = {
        name: "   ",
        description: "test",
        mode: "create",
      };
      mockScriptExecutor.execute.mockResolvedValue({
        success: false,
        stdout: "",
        stderr: "Invalid name",
        exitCode: 1,
      });
      await expect(service.createSkill(options)).rejects.toThrow();
    });

    it("BV-003: should throw error for skill name exceeding 256 characters", async () => {
      const options: CreateSkillOptions = {
        name: "a".repeat(257),
        description: "test",
        mode: "create",
      };
      mockScriptExecutor.execute.mockResolvedValue({
        success: false,
        stdout: "",
        stderr: "Name too long",
        exitCode: 1,
      });
      await expect(service.createSkill(options)).rejects.toThrow();
    });

    it("BV-004: should reject path traversal in directory path", async () => {
      const options = {
        tasksDir: "../../../etc/passwd",
      };
      await expect(service.executeTasks(options)).rejects.toThrow();
    });

    it("BV-005: should reject null byte in input string", async () => {
      const options: CreateSkillOptions = {
        name: "test\0evil",
        description: "test",
        mode: "create",
      };
      await expect(service.createSkill(options)).rejects.toThrow();
    });

    it("BV-006: should handle empty dependency list correctly", async () => {
      mockScriptExecutor.executeJson.mockResolvedValue({
        tasks: [{ id: "task-1", content: "Task 1", depends_on: [] }],
      });
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "",
        stderr: "",
        exitCode: 0,
      });
      const result = await service.executeTasks({ tasksDir: "/path" });
      expect(result.summary?.completed).toBe(1);
    });

    it("BV-007: should complete topological sort for 1000 tasks", async () => {
      const tasks = Array.from({ length: 1000 }, (_, i) => ({
        id: `task-${i}`,
        content: `Task ${i}`,
        depends_on: i > 0 ? [`task-${i - 1}`] : [],
      }));
      mockScriptExecutor.executeJson.mockResolvedValue({ tasks });
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "",
        stderr: "",
        exitCode: 0,
      });
      const result = await service.executeTasks({ tasksDir: "/path" });
      expect(result.results?.length).toBeGreaterThan(0);
    });

    it("BV-008: should detect self-referencing circular dependency", async () => {
      mockScriptExecutor.executeJson.mockResolvedValue({
        tasks: [{ id: "task-1", content: "Task 1", depends_on: ["task-1"] }],
      });
      await expect(service.executeTasks({ tasksDir: "/path" })).rejects.toThrow(
        /circular/i,
      );
    });
  });

  describe("Phase 6 Expansion Tests", () => {
    it("SC-EX-001: improveSkill: autoApply=true で自動修正が適用される", async () => {
      // Arrange
      mockScriptExecutor.executeJson.mockResolvedValue({
        suggestions: [
          {
            category: "prompt",
            description: "Improve clarity",
            severity: "medium",
            autoFixable: true,
          },
        ],
      });

      // Act
      const result = await service.improveSkill("existing-skill", true);

      // Assert
      expect(result.applied).toBe(true);
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions[0].autoFixable).toBe(true);
    });

    it("SC-EX-002: improveSkill: targetAreas 指定で対象領域がexecuteに渡される", async () => {
      // Arrange
      mockScriptExecutor.executeJson.mockResolvedValue({
        suggestions: [],
      });

      // Act
      await service.improveSkill("my-skill", false);

      // Assert
      expect(mockScriptExecutor.executeJson).toHaveBeenCalledWith(
        "improve_skill.js",
        expect.arrayContaining(["--name", "my-skill"]),
      );
    });

    it("SC-EX-003: forkSkill: sourceName がパストラバーサルで拒否される", async () => {
      // Arrange
      mockScriptExecutor.execute.mockRejectedValue(
        new Error("Failed to fork skill: invalid source path"),
      );

      // Act & Assert
      await expect(
        service.forkSkill("../evil", "new-skill", {}),
      ).rejects.toThrow();
    });

    it("SC-EX-004: shareSkill: format='zip' でZIPファイルが生成される", async () => {
      // Arrange
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "/tmp/my-skill.zip",
        stderr: "",
        exitCode: 0,
      });

      // Act
      const result = await service.shareSkill("export", "zip", "my-skill");

      // Assert
      expect(result).toBeDefined();
      expect(mockScriptExecutor.execute).toHaveBeenCalledWith(
        "share_skill.js",
        expect.arrayContaining(["--target", "zip"]),
      );
    });

    it("SC-EX-005: shareSkill: format='tar' でtarballが生成される", async () => {
      // Arrange
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "/tmp/my-skill.tar.gz",
        stderr: "",
        exitCode: 0,
      });

      // Act
      const result = await service.shareSkill("export", "tar", "my-skill");

      // Assert
      expect(result).toBeDefined();
      expect(mockScriptExecutor.execute).toHaveBeenCalledWith(
        "share_skill.js",
        expect.arrayContaining(["--target", "tar"]),
      );
    });

    it("SC-EX-006: shareSkill: format='directory' でディレクトリコピーされる", async () => {
      // Arrange
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "/tmp/my-skill-copy",
        stderr: "",
        exitCode: 0,
      });

      // Act
      const result = await service.shareSkill(
        "export",
        "directory",
        "my-skill",
      );

      // Assert
      expect(result).toBeDefined();
      expect(mockScriptExecutor.execute).toHaveBeenCalledWith(
        "share_skill.js",
        expect.arrayContaining(["--target", "directory"]),
      );
    });

    it("SC-EX-007: scheduleSkill: 不正なcron式でエラーを返す", async () => {
      // Arrange
      mockScriptExecutor.execute.mockResolvedValue({
        success: false,
        stdout: "",
        stderr: "Invalid cron expression",
        exitCode: 1,
      });

      // Act & Assert
      await expect(
        service.scheduleSkill("test-skill", {
          skillName: "test-skill",
          scheduleType: "cron",
          value: "invalid-cron",
          isEnabled: true,
        }),
      ).rejects.toThrow();
    });

    it("SC-EX-008: debugSkill: breakpoints 指定で特定行で停止する", async () => {
      // Arrange
      mockScriptExecutor.executeJson.mockResolvedValue({
        steps: [
          {
            stepNumber: 1,
            toolName: "Read",
            input: { path: "/test.ts" },
            output: "content",
            duration: 50,
            hitBreakpoint: false,
          },
          {
            stepNumber: 2,
            toolName: "Write",
            input: { path: "/output.ts" },
            output: "written",
            duration: 80,
            hitBreakpoint: true,
          },
        ],
      });

      // Act
      const result = await service.debugSkill("test-skill", {
        breakpoints: ["line:10", "line:20"],
      });

      // Assert
      expect(result.steps).toBeDefined();
      expect(result.steps.length).toBe(2);
      expect(result.steps[1].hitBreakpoint).toBe(true);
      expect(mockScriptExecutor.executeJson).toHaveBeenCalledWith(
        "debug_skill.js",
        expect.arrayContaining(["--breakpoints", "line:10,line:20"]),
      );
    });

    it("SC-EX-009: getStats: period パラメータがスクリプトに渡される", async () => {
      // Arrange
      mockScriptExecutor.executeJson.mockResolvedValue({
        skillName: "test-skill",
        period: "30d",
        executionCount: 100,
        successCount: 90,
        failureCount: 10,
        averageDuration: 2000,
        topTools: [],
        hourlyDistribution: {},
        errorTrends: [],
      });

      // Act
      const result = await service.getStats("test-skill", "30d");

      // Assert
      expect(result.period).toBe("30d");
      expect(mockScriptExecutor.executeJson).toHaveBeenCalledWith(
        "get_stats.js",
        expect.arrayContaining(["--period", "30d"]),
      );
    });

    it("SC-EX-010: executeTasks: タスク0件で空レポートを返す（summaryフィールド検証）", async () => {
      // Arrange
      mockScriptExecutor.executeJson.mockResolvedValue({ tasks: [] });

      // Act
      const result = await service.executeTasks({ tasksDir: "/path/to/empty" });

      // Assert
      expect(result.summary).toBeDefined();
      expect(result.summary?.total).toBe(0);
      expect(result.summary?.completed).toBe(0);
      expect(result.summary?.failed).toBe(0);
      expect(result.summary?.skipped).toBe(0);
      expect(result.results).toBeDefined();
      expect(result.results?.length).toBe(0);
    });
  });

  // ===================================================================
  // TASK-SC-FIX-GENERATE-SKILL-MD-001: generate_skill_md.js 引数修正
  // TC-01〜TC-07: AC-1〜AC-5 の検証テスト
  // ===================================================================

  describe("generate_skill_md.js 引数検証 (TC-01〜TC-03: AC-1対応)", () => {
    beforeEach(() => {
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "",
        stderr: "",
        exitCode: 0,
      });
    });

    it("TC-01: generate_skill_md.js を --plan と --output 引数で呼び出し、plan JSON が skillName/workflow を含む", async () => {
      // Arrange
      allowGeneratedSkillMd();
      const ensureSpy = vi.spyOn(service as any, "ensureSkillMdExists");

      // Act
      await service.createSkill({
        name: "test-skill",
        description: "Test description",
        mode: "create",
      });

      // Assert
      const generateCall = mockScriptExecutor.execute.mock.calls.find(
        ([script]: [string]) => script === "generate_skill_md.js",
      );
      expect(generateCall).toBeDefined();
      const args = generateCall![1] as string[];
      expect(args).toContain("--plan");
      expect(args).toContain("--output");
      expect(args).not.toContain("--path");

      const planWriteCall = vi
        .mocked(fsPromises.writeFile)
        .mock.calls.find(
          ([filePath]: [unknown]) =>
            typeof filePath === "string" &&
            /skill-plan-[0-9a-f-]{36}\.json$/.test(filePath),
        );
      expect(planWriteCall).toBeDefined();
      const plan = JSON.parse(planWriteCall![1] as string);
      expect(plan.skillName).toBe("test-skill");
      expect(plan.workflow.summary).toBe("Test description");
      expect(plan.workflow.anchors).toEqual([]);
      expect(plan.workflow.trigger).toMatchObject({
        keywords: ["test-skill"],
      });
      expect(plan.workflow.phases).toEqual([]);
      expect(plan.workflow.tasks).toEqual([]);
      expect(plan.directories).toEqual({});
      expect(plan.files).toEqual([]);
      expect(ensureSpy).not.toHaveBeenCalled();
    });

    it("TC-02: --plan の次要素が os.tmpdir() 配下の UUID 付きパスである", async () => {
      // Arrange
      allowGeneratedSkillMd();

      // Act
      await service.createSkill({
        name: "test-skill",
        description: "Test description",
        mode: "create",
      });

      // Assert
      const generateCall = mockScriptExecutor.execute.mock.calls.find(
        ([script]: [string]) => script === "generate_skill_md.js",
      );
      const args = generateCall![1] as string[];
      const planIdx = args.indexOf("--plan");
      expect(planIdx).toBeGreaterThanOrEqual(0);
      expect(args[planIdx + 1]).toContain(os.tmpdir());
      expect(args[planIdx + 1]).toMatch(/skill-plan-[0-9a-f-]{36}\.json$/);
    });

    it("TC-03: --output の次要素が skillDir/SKILL.md である", async () => {
      // Arrange
      allowGeneratedSkillMd();

      // Act
      await service.createSkill({
        name: "test-skill",
        description: "Test description",
        mode: "create",
      });

      // Assert
      const generateCall = mockScriptExecutor.execute.mock.calls.find(
        ([script]: [string]) => script === "generate_skill_md.js",
      );
      const args = generateCall![1] as string[];
      const outputIdx = args.indexOf("--output");
      expect(outputIdx).toBeGreaterThanOrEqual(0);
      expect(args[outputIdx + 1]).toMatch(/test-skill[/\\]SKILL\.md$/);
    });
  });

  describe("フォールバック動作 (TC-04〜TC-05: AC-4対応)", () => {
    it("TC-04: generate_skill_md.js が失敗した場合に ensureSkillMdExists が呼ばれ、Task一覧付きの fallback SKILL.md を書き込む", async () => {
      // Arrange
      mockScriptExecutor.execute.mockImplementation(async (script: string) => {
        if (script === "generate_skill_md.js") {
          return {
            success: false,
            stdout: "",
            stderr: "MODULE_NOT_FOUND: Cannot find module",
            exitCode: 1,
          };
        }
        return { success: true, stdout: "", stderr: "", exitCode: 0 };
      });
      const errorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      const ensureSpy = vi.spyOn(service as any, "ensureSkillMdExists");

      // Act
      await service.createSkill({
        name: "test-skill",
        description: "Test description",
        mode: "create",
      });

      // Assert
      expect(ensureSpy).toHaveBeenCalledTimes(1);
      const fallbackWriteCall = vi
        .mocked(fsPromises.writeFile)
        .mock.calls.find(
          ([filePath]: [unknown]) =>
            typeof filePath === "string" &&
            /test-skill[\\/\\\\]SKILL\.md$/.test(filePath),
        );
      expect(fallbackWriteCall).toBeDefined();
      const fallbackContent = fallbackWriteCall![1] as string;
      expect(fallbackContent).toContain("name: test-skill");
      expect(fallbackContent).toContain("## Task一覧");
      expect(fallbackContent).toContain("| Task | 責務 | 入力 | 出力 |");
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "generateSkillMd fallback to ensureSkillMdExists",
        ),
        expect.objectContaining({
          skillName: "test-skill",
          reason: "generate_skill_md.js returned failure",
          stderr: "MODULE_NOT_FOUND: Cannot find module",
        }),
      );
      errorSpy.mockRestore();
    });

    it("TC-05: 生成成功でも SKILL.md が存在しない場合は ensureSkillMdExists が呼ばれる", async () => {
      // Arrange
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "",
        stderr: "",
        exitCode: 0,
      });
      vi.mocked(fsPromises.access).mockRejectedValue(new Error("ENOENT"));
      const ensureSpy = vi.spyOn(service as any, "ensureSkillMdExists");

      // Act
      await service.createSkill({
        name: "test-skill",
        description: "Test description",
        mode: "create",
      });

      // Assert
      expect(ensureSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("tmp ファイル cleanup (TC-06〜TC-07: AC-5対応)", () => {
    it("TC-06: SKILL.md が存在する成功時に tmp json ファイルを削除する", async () => {
      // Arrange
      allowGeneratedSkillMd();
      const ensureSpy = vi.spyOn(service as any, "ensureSkillMdExists");

      // Act
      await service.createSkill({
        name: "test-skill",
        description: "Test description",
        mode: "create",
      });

      // Assert
      expect(ensureSpy).not.toHaveBeenCalled();
      expect(vi.mocked(fsPromises.unlink)).toHaveBeenCalledWith(
        expect.stringMatching(/skill-plan-[0-9a-f-]{36}\.json$/),
      );
    });

    it("TC-07: tmp json cleanup が失敗しても createSkill は成功として完了する", async () => {
      // Arrange
      allowGeneratedSkillMd();
      vi.mocked(fsPromises.unlink).mockRejectedValueOnce(
        new Error("unlink failed"),
      );

      // Act / Assert
      await expect(
        service.createSkill({
          name: "test-skill",
          description: "Test description",
          mode: "create",
        }),
      ).resolves.toContain("test-skill");
    });
  });

  // ===================================================================
  // TASK-SC-IMP-CREATE-WORKFLOW-001: create モード 構造計画生成
  // TC-01〜TC-B06: AC-1〜AC-4 の検証テスト
  // ===================================================================

  describe("create モード", () => {
    beforeEach(() => {
      mockResourceLoader.loadAgent.mockResolvedValue("mock-agent-content");
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "/test/skills/test-skill",
        stderr: "",
        exitCode: 0,
      });
    });

    // TC-01: STRUCT-001 AC-2 — runCreateWorkflow が structurePlan を返す
    // NOTE: loadAgent は新実装では呼ばれない（options.description を purpose に直接使用）
    it("TC-01: create モードで createSkill() を呼ぶと runCreateWorkflow が structurePlan を返す", async () => {
      const spy = vi.spyOn(service as any, "runCreateWorkflow");

      const result = await service.createSkill({
        name: "test-skill",
        description: "テスト用スキル",
        mode: "create",
      });

      expect(spy).toHaveBeenCalled();
      const structurePlan = await spy.mock.results[0].value;
      expect(structurePlan).not.toBeNull();
      expect(structurePlan.skillName).toBe("test-skill");
      expect(result).toContain("test-skill");
      // loadAgent は呼ばれない（options.description を直接 purpose に使用する新実装）
      expect(mockResourceLoader.loadAgent).not.toHaveBeenCalled();
    });

    // TC-02: AC-2 — 後続処理が継続してスキルパスを返す
    it("TC-02: runCreateWorkflow 完了後、createSkill() がスキルパスを返す", async () => {
      const result = await service.createSkill({
        name: "test-skill",
        description: "テスト用スキル",
        mode: "create",
      });

      expect(typeof result).toBe("string");
      expect(result).toContain("test-skill");
    });

    // TC-03: AC-3 — loadAgent 失敗時もフォールバックで createSkill() 成功
    it("TC-03: loadAgent が例外をスローしても createSkill() は成功する", async () => {
      mockResourceLoader.loadAgent.mockRejectedValue(
        new Error("Agent file not found"),
      );

      await expect(
        service.createSkill({
          name: "test-skill",
          description: "テスト用スキル",
          mode: "create",
        }),
      ).resolves.not.toThrow();
    });

    // TC-04: STRUCT-001 AC-1/AC-2 — purpose=description, agents=hardcoded list
    // NOTE: 新実装では loadAgent を呼ばず description を purpose に設定する
    it("TC-04: runCreateWorkflow は options.description を purpose に、エージェント名リストを agents に設定する", async () => {
      const description = "詳細な説明テキスト";

      const structurePlan = await (service as any).runCreateWorkflow({
        name: "test-skill",
        description,
        mode: "create",
      });

      expect(structurePlan).toMatchObject({
        skillName: "test-skill",
        description,
        purpose: description, // STRUCT-001 AC-1: options.description を使用（LLM抽出は別タスク）
        agents: ["extract-purpose", "plan-structure"], // STRUCT-001 AC-2: エージェント名リスト（コンテンツではない）
      });
    });

    // TC-05: STRUCT-001 AC-2 — structurePlan.agents に "extract-purpose" が含まれる
    // NOTE: 新実装では loadAgent を呼ばず description を purpose に直接設定する
    it("TC-05: runCreateWorkflow が返す structurePlan.agents に extract-purpose が含まれる", async () => {
      const description = "テスト用スキル";
      const structurePlan = await (service as any).runCreateWorkflow({
        name: "test-skill",
        description,
        mode: "create",
      });

      expect(structurePlan).not.toBeNull();
      expect(structurePlan?.purpose).toBe(description);
      expect(structurePlan.agents).toContain("extract-purpose");
      expect(mockResourceLoader.loadAgent).not.toHaveBeenCalled();
    });

    // TC-B01: STRUCT-001 AC-2 — structurePlan.agents に2エージェント名が含まれる
    // NOTE: 新実装では loadAgent を呼ばず、エージェント名をリストとして設定する
    it("TC-B01: runCreateWorkflow の agents に extract-purpose と plan-structure の2エージェントが含まれる", async () => {
      const structurePlan = await (service as any).runCreateWorkflow({
        name: "test-skill",
        description: "テスト用スキル",
        mode: "create",
      });

      expect(structurePlan).not.toBeNull();
      expect(structurePlan.agents).toContain("extract-purpose");
      expect(structurePlan.agents).toContain("plan-structure");
      expect(structurePlan.agents).toHaveLength(2);
      expect(mockResourceLoader.loadAgent).not.toHaveBeenCalled();
    });

    // TC-B02: options.name が createSkill() に反映される
    // NOTE: 新実装では loadAgent を呼ばないため、loadAgent 確認は削除
    it("TC-B02: options.name が異なる場合でも createSkill() が成功しスキルパスを返す", async () => {
      const result = await service.createSkill({
        name: "my-custom-skill",
        description: "カスタムスキル説明",
        mode: "create",
      });

      expect(result).toContain("my-custom-skill");
    });

    // TC-B03: Phase 6 Task 3 — loadAgent が null を返しても後続処理が継続する
    it("TC-B03: loadAgent が null 同等の値を返しても createSkill() がスキルパスを返す", async () => {
      mockResourceLoader.loadAgent.mockResolvedValue(null as unknown as string);

      await expect(
        service.createSkill({
          name: "test-skill",
          description: "テスト用スキル",
          mode: "create",
        }),
      ).resolves.not.toThrow();
    });
  });

  // Phase 6 Task 4: モード分岐確認
  describe("モード分岐（create vs collaborative / orchestrate）", () => {
    beforeEach(() => {
      mockResourceLoader.loadAgent.mockResolvedValue("mock-agent-content");
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "/test/skills/test-skill",
        stderr: "",
        exitCode: 0,
      });
    });

    // TC-B04: collaborative モードでは extract-purpose が呼ばれない
    it("TC-B04: collaborative モードでは extract-purpose エージェントが呼ばれない", async () => {
      const mockInterviewResult: InterviewResult = {
        purpose: "test purpose",
        features: ["feature1"],
        inputs: [],
        outputs: [],
        toolsNeeded: [],
        abstractionLevel: "L2",
      };

      await service.createSkill({
        name: "test-skill",
        description: "テスト",
        mode: "collaborative",
        interviewResult: mockInterviewResult,
      });

      expect(mockResourceLoader.loadAgent).not.toHaveBeenCalledWith(
        "extract-purpose",
      );
    });

    // TC-B05: orchestrate モードでは runCreateWorkflow が呼ばれない
    it("TC-B05: orchestrate モードでは extract-purpose エージェントが呼ばれない", async () => {
      await service.createSkill({
        name: "test-skill",
        description: "テスト",
        mode: "orchestrate",
      });

      expect(mockResourceLoader.loadAgent).not.toHaveBeenCalledWith(
        "extract-purpose",
      );
    });

    // TC-B06: create モードのみが runCreateWorkflow を経由する分岐確認
    // NOTE: 新実装では loadAgent を呼ばず、structurePlan.agents にエージェント名を設定する
    it("TC-B06: create モードでのみ runCreateWorkflow が呼ばれ plan-structure がエージェントリストに含まれる", async () => {
      const spy = vi.spyOn(service as any, "runCreateWorkflow");

      await service.createSkill({
        name: "test-skill",
        description: "テスト",
        mode: "create",
      });

      // create モードでは runCreateWorkflow が呼ばれ plan-structure が agents に含まれる
      expect(spy).toHaveBeenCalledTimes(1);
      const structurePlan = await spy.mock.results[0]?.value;
      expect(structurePlan?.agents).toContain("plan-structure");
    });
  });

  // ===================================================================
  // TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001:
  // runCreateWorkflow → generateSkillMd 接続
  // TC-CONNECT-1〜4, IT-CONNECT-1〜2
  // ===================================================================

  describe("generateSkillMd 接続 (TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001)", () => {
    const createOptions = () => ({
      name: "test-skill",
      description: "テスト用スキル",
      mode: "create" as const,
    });

    describe("TC-CONNECT-1: structurePlan が返された場合", () => {
      it("createSkill() で generateSkillMd が1回呼ばれること", async () => {
        // Arrange
        mockResourceLoader.loadAgent.mockResolvedValue("mock-agent-content");
        mockScriptExecutor.execute.mockResolvedValue({
          success: true,
          stdout: "",
          stderr: "",
          exitCode: 0,
        });
        vi.mocked(fsPromises.access).mockImplementation(async (target) => {
          if (/test-skill[/\\]SKILL\.md$/.test(String(target))) return;
          throw new Error("ENOENT");
        });
        const generateSkillMdSpy = vi
          .spyOn(
            service as unknown as {
              generateSkillMd: (...args: unknown[]) => Promise<void>;
            },
            "generateSkillMd",
          )
          .mockResolvedValue(undefined);

        // Act
        await service.createSkill(createOptions());

        // Assert
        expect(generateSkillMdSpy).toHaveBeenCalledTimes(1);
        expect(generateSkillMdSpy).toHaveBeenCalledWith(
          expect.stringContaining("test-skill"),
          expect.objectContaining({
            skillName: "test-skill",
            description: "テスト用スキル",
            purpose: "テスト用スキル",
            features: [],
            agents: ["extract-purpose", "plan-structure"],
          }),
          expect.any(Object),
        );
      });
    });

    describe("TC-CONNECT-2: structurePlan が null の場合", () => {
      it("ensureSkillMdExists にフォールバックし、generateSkillMd は呼ばれないこと", async () => {
        // Arrange: runCreateWorkflow を直接 null を返すようにモック
        // NOTE: 新実装では loadAgent を呼ばないため、loadAgent の reject では null にならない（STRUCT-001: loadAgent は呼ばれない）
        vi.spyOn(service as any, "runCreateWorkflow").mockResolvedValue(null);
        mockScriptExecutor.execute.mockResolvedValue({
          success: true,
          stdout: "",
          stderr: "",
          exitCode: 0,
        });
        const warnSpy = vi
          .spyOn(console, "warn")
          .mockImplementation(() => undefined);
        const generateSkillMdSpy = vi
          .spyOn(
            service as unknown as {
              generateSkillMd: (...args: unknown[]) => Promise<void>;
            },
            "generateSkillMd",
          )
          .mockResolvedValue(undefined);
        const ensureSkillMdExistsSpy = vi
          .spyOn(
            service as unknown as {
              ensureSkillMdExists: (...args: unknown[]) => Promise<void>;
            },
            "ensureSkillMdExists",
          )
          .mockResolvedValue(undefined);

        // Act
        await service.createSkill(createOptions());

        // Assert
        expect(generateSkillMdSpy).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining("structurePlan is null"),
          expect.objectContaining({
            skillName: "test-skill",
            mode: "create",
          }),
        );
        expect(ensureSkillMdExistsSpy).toHaveBeenCalledWith(
          expect.any(String),
          "test-skill",
          "テスト用スキル",
          expect.any(Object),
        );
        warnSpy.mockRestore();
      });
    });

    describe("TC-CONNECT-3: generateSkillMd のスクリプト引数確認", () => {
      it("generate_skill_md.js を --plan と --output の引数で呼ぶこと", async () => {
        // Arrange
        mockScriptExecutor.execute.mockResolvedValue({
          success: true,
          stdout: "",
          stderr: "",
          exitCode: 0,
        });
        vi.mocked(fsPromises.access).mockResolvedValue(undefined);

        // Act: generateSkillMd を直接呼び出す
        await (
          service as unknown as {
            generateSkillMd: (skillDir: string, plan: unknown) => Promise<void>;
          }
        ).generateSkillMd("/path/to/skillDir", {
          skillName: "test-skill",
          description: "テスト用スキル",
          purpose: "mock-purpose",
          features: [],
          agents: ["agent1", "agent2"],
        });

        // Assert
        const generateCall = mockScriptExecutor.execute.mock.calls.find(
          ([script]: [string]) => script === "generate_skill_md.js",
        );
        expect(generateCall).toBeDefined();
        const args = generateCall![1] as string[];
        expect(args).toContain("--plan");
        expect(args).toContain("--output");
        expect(args[args.indexOf("--output") + 1]).toMatch(
          /skillDir[/\\]SKILL\.md$/,
        );
      });
    });

    describe("TC-CONNECT-4: スクリプト実行失敗時の fallback", () => {
      it("ensureSkillMdExists(skillDir, skillName, description) へ fallback すること", async () => {
        // Arrange
        mockScriptExecutor.execute.mockRejectedValue(
          new Error("script failed"),
        );
        const ensureSkillMdExistsSpy = vi
          .spyOn(
            service as unknown as {
              ensureSkillMdExists: (...args: unknown[]) => Promise<void>;
            },
            "ensureSkillMdExists",
          )
          .mockResolvedValue(undefined);

        // Act
        await (
          service as unknown as {
            generateSkillMd: (skillDir: string, plan: unknown) => Promise<void>;
          }
        ).generateSkillMd("/path/to/skillDir", {
          skillName: "test-skill",
          description: "テスト用スキル",
          purpose: "mock-purpose",
          features: [],
          agents: [],
        });

        // Assert
        expect(ensureSkillMdExistsSpy).toHaveBeenCalledWith(
          "/path/to/skillDir",
          "test-skill",
          "テスト用スキル",
          undefined,
        );
      });
    });

    describe("IT-CONNECT-1: create モード end-to-end", () => {
      it("runCreateWorkflow → generateSkillMd → generate_skill_md.js 呼び出しの end-to-end フロー", async () => {
        // Arrange
        mockResourceLoader.loadAgent.mockResolvedValue("mock-agent-content");
        mockScriptExecutor.execute.mockResolvedValue({
          success: true,
          stdout: "",
          stderr: "",
          exitCode: 0,
        });
        vi.mocked(fsPromises.access).mockImplementation(async (target) => {
          if (/test-skill[/\\]SKILL\.md$/.test(String(target))) return;
          throw new Error("ENOENT");
        });

        // Act
        await service.createSkill({
          name: "test-skill",
          description: "統合テスト用スキル",
          mode: "create",
        });

        // Assert: generate_skill_md.js が呼ばれていること
        const generateCall = mockScriptExecutor.execute.mock.calls.find(
          ([script]: [string]) => script === "generate_skill_md.js",
        );
        expect(generateCall).toBeDefined();
      });
    });

    describe("IT-CONNECT-2: JSON シリアライズ → tmpPlanPath 検証", () => {
      it("generateSkillMd が tmpPlanPath に workflow 形式の JSON を書き込むこと", async () => {
        // Arrange
        mockScriptExecutor.execute.mockResolvedValue({
          success: true,
          stdout: "",
          stderr: "",
          exitCode: 0,
        });
        vi.mocked(fsPromises.access).mockResolvedValue(undefined);

        const mockStructurePlan = {
          skillName: "it-test-skill",
          description: "IT テスト用スキル",
          purpose: "mock-purpose",
          features: ["feature1"],
          agents: ["agent1"],
          anchors: [
            {
              source: "Clean Code",
              application: "SRP",
              purpose: "責務分離",
            },
          ],
          triggers: [],
        };

        // Act
        await (
          service as unknown as {
            generateSkillMd: (skillDir: string, plan: unknown) => Promise<void>;
          }
        ).generateSkillMd("/path/to/it-test-skill", mockStructurePlan);

        // Assert: writeFile が tmpPlanPath に JSON を書き込んでいること
        const writeSpy = vi.mocked(fsPromises.writeFile);
        const tmpWriteCall = writeSpy.mock.calls.find(
          ([filePath]: [unknown]) =>
            typeof filePath === "string" &&
            /skill-plan-[0-9a-f-]{36}\.json$/.test(filePath),
        );
        expect(tmpWriteCall).toBeDefined();
        const writtenPlan = JSON.parse(tmpWriteCall![1] as string);
        expect(writtenPlan.skillName).toBe("it-test-skill");
        expect(writtenPlan.workflow.summary).toBe("IT テスト用スキル");
        expect(writtenPlan.workflow.anchors).toEqual([
          {
            source: "Clean Code",
            application: "SRP",
            purpose: "責務分離",
          },
        ]);
        expect(writtenPlan.workflow.trigger.description).toContain(
          "Purpose: mock-purpose",
        );
        expect(writtenPlan.workflow.trigger.keywords).toEqual([
          "it-test-skill",
        ]);
      });
    });
  });

  // ===================================================================
  // Phase 6: エッジケース・異常系テスト拡充
  // TC-5〜TC-8, IT-3〜IT-4
  // ===================================================================

  describe("エッジケース (Phase 6 拡充)", () => {
    const mockStructurePlan = {
      skillName: "test-skill",
      description: "テスト用スキル",
      purpose: "mock-agent-content",
      features: [],
      agents: ["mock-agent-content"],
    };

    describe("TC-5: generateSkillMd スクリプト実行失敗時のエラー処理", () => {
      it("スクリプト実行失敗時に ensureSkillMdExists が呼ばれること", async () => {
        // Arrange
        mockScriptExecutor.execute.mockRejectedValue(
          new Error("generate_skill_md.js execution failed"),
        );
        const ensureSkillMdExistsSpy = vi
          .spyOn(
            service as unknown as {
              ensureSkillMdExists: (...args: unknown[]) => Promise<void>;
            },
            "ensureSkillMdExists",
          )
          .mockResolvedValue(undefined);

        // Act
        await (
          service as unknown as {
            generateSkillMd: (skillDir: string, plan: unknown) => Promise<void>;
          }
        ).generateSkillMd("/path/to/skillDir", mockStructurePlan);

        // Assert
        expect(ensureSkillMdExistsSpy).toHaveBeenCalledTimes(1);
        expect(ensureSkillMdExistsSpy).toHaveBeenCalledWith(
          "/path/to/skillDir",
          "test-skill",
          "テスト用スキル",
          undefined,
        );
      });
    });

    describe("TC-6: tmpPlanPath JSON 書き込み失敗時の fallback", () => {
      it("fs.writeFile が失敗した場合に ensureSkillMdExists が呼ばれること", async () => {
        // Arrange
        vi.mocked(fsPromises.writeFile).mockRejectedValueOnce(
          new Error("EACCES: permission denied"),
        );
        const ensureSkillMdExistsSpy = vi
          .spyOn(
            service as unknown as {
              ensureSkillMdExists: (...args: unknown[]) => Promise<void>;
            },
            "ensureSkillMdExists",
          )
          .mockResolvedValue(undefined);

        // Act
        await (
          service as unknown as {
            generateSkillMd: (skillDir: string, plan: unknown) => Promise<void>;
          }
        ).generateSkillMd("/path/to/skillDir", mockStructurePlan);

        // Assert
        expect(ensureSkillMdExistsSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe("TC-7: スクリプト成功後 SKILL.md が存在する場合", () => {
      it("スクリプト成功かつ SKILL.md 存在時は ensureSkillMdExists が呼ばれないこと", async () => {
        // Arrange
        mockScriptExecutor.execute.mockResolvedValue({
          success: true,
          stdout: "",
          stderr: "",
          exitCode: 0,
        });
        // SKILL.md が存在する状態をモック
        vi.mocked(fsPromises.access).mockResolvedValue(undefined);
        const ensureSkillMdExistsSpy = vi.spyOn(
          service as unknown as {
            ensureSkillMdExists: (...args: unknown[]) => Promise<void>;
          },
          "ensureSkillMdExists",
        );

        // Act
        await (
          service as unknown as {
            generateSkillMd: (skillDir: string, plan: unknown) => Promise<void>;
          }
        ).generateSkillMd("/path/to/skillDir", mockStructurePlan);

        // Assert
        expect(ensureSkillMdExistsSpy).not.toHaveBeenCalled();
        expect(mockScriptExecutor.execute).toHaveBeenCalledWith(
          "generate_skill_md.js",
          expect.any(Array),
        );
      });
    });

    describe("TC-8: 複数回 create が実行された場合の冪等性", () => {
      it("複数回 create を実行しても毎回 generateSkillMd が呼ばれること", async () => {
        // Arrange
        mockResourceLoader.loadAgent.mockResolvedValue("mock-agent-content");
        mockScriptExecutor.execute.mockResolvedValue({
          success: true,
          stdout: "",
          stderr: "",
          exitCode: 0,
        });
        vi.mocked(fsPromises.access).mockImplementation(async (target) => {
          if (/test-skill[/\\]SKILL\.md$/.test(String(target))) return;
          throw new Error("ENOENT");
        });
        const generateSkillMdSpy = vi
          .spyOn(
            service as unknown as {
              generateSkillMd: (...args: unknown[]) => Promise<void>;
            },
            "generateSkillMd",
          )
          .mockResolvedValue(undefined);

        // Act: 2回実行
        await service.createSkill({
          name: "test-skill",
          description: "テスト用スキル",
          mode: "create",
        });
        await service.createSkill({
          name: "test-skill",
          description: "テスト用スキル",
          mode: "create",
        });

        // Assert: 2回とも generateSkillMd が呼ばれていること
        expect(generateSkillMdSpy).toHaveBeenCalledTimes(2);
      });
    });

    describe("IT-3: generate_skill_md.js 利用不可時の fallback", () => {
      it("スクリプト ENOENT エラー時に ensureSkillMdExists が呼ばれること", async () => {
        // Arrange
        mockScriptExecutor.execute.mockRejectedValue(
          new Error("ENOENT: no such file or directory, generate_skill_md.js"),
        );
        const ensureSkillMdExistsSpy = vi
          .spyOn(
            service as unknown as {
              ensureSkillMdExists: (...args: unknown[]) => Promise<void>;
            },
            "ensureSkillMdExists",
          )
          .mockResolvedValue(undefined);

        // Act
        await (
          service as unknown as {
            generateSkillMd: (skillDir: string, plan: unknown) => Promise<void>;
          }
        ).generateSkillMd("/path/to/skillDir", mockStructurePlan);

        // Assert
        expect(ensureSkillMdExistsSpy).toHaveBeenCalledWith(
          "/path/to/skillDir",
          "test-skill",
          "テスト用スキル",
          undefined,
        );
      });
    });

    describe("IT-4: ファイルシステムエラー時の動作継続確認", () => {
      it("fs.writeFile 失敗時も generateSkillMd が例外を throw せず処理を継続すること", async () => {
        // Arrange
        vi.mocked(fsPromises.writeFile).mockRejectedValueOnce(
          new Error("ENOSPC: no space left on device"),
        );
        vi.spyOn(
          service as unknown as {
            ensureSkillMdExists: (...args: unknown[]) => Promise<void>;
          },
          "ensureSkillMdExists",
        ).mockResolvedValue(undefined);

        // Act & Assert: 例外が呼び出し元に伝播しないこと
        await expect(
          (
            service as unknown as {
              generateSkillMd: (
                skillDir: string,
                plan: unknown,
              ) => Promise<void>;
            }
          ).generateSkillMd("/path/to/skillDir", mockStructurePlan),
        ).resolves.not.toThrow();
      });
    });
  });

  // ===================================================================
  // Phase 6 拡充: TC-08〜TC-15 (TASK-SW-STRUCT-002)
  // anchors/purpose/triggers/keywords の境界値・モード分岐テスト
  // ===================================================================

  describe("境界値・モード分岐テスト (TASK-SW-STRUCT-002 Phase 6)", () => {
    describe("TC-08: anchors が undefined の場合のフォールバック", () => {
      it("structurePlan.anchors が undefined のとき [] が使われること", async () => {
        // Arrange
        mockScriptExecutor.execute.mockResolvedValue({
          success: true,
          stdout: "",
          stderr: "",
          exitCode: 0,
        });
        vi.mocked(fsPromises.access).mockResolvedValue(undefined);
        const planWithoutAnchors = {
          skillName: "test-skill",
          description: "テスト",
          purpose: "test purpose",
          features: [],
          agents: [],
          // anchors は意図的に省略（undefined）
        };

        // Act
        await (
          service as unknown as {
            generateSkillMd: (skillDir: string, plan: unknown) => Promise<void>;
          }
        ).generateSkillMd("/path/to/skillDir", planWithoutAnchors);

        // Assert: writeFile に渡された JSON の anchors が [] であること
        const writeSpy = vi.mocked(fsPromises.writeFile);
        const tmpWriteCall = writeSpy.mock.calls.find(
          ([filePath]: [unknown]) =>
            typeof filePath === "string" &&
            /skill-plan-[0-9a-f-]{36}\.json$/.test(filePath),
        );
        expect(tmpWriteCall).toBeDefined();
        const writtenPlan = JSON.parse(tmpWriteCall![1] as string);
        expect(writtenPlan.workflow.anchors).toEqual([]);
      });
    });

    describe("TC-09: orchestrate モードで structurePlan が null のままフォールバック", () => {
      it("orchestrate モードで options.name ベースの ensureSkillMdExists が使われること", async () => {
        // Arrange
        mockScriptExecutor.execute.mockResolvedValue({
          success: true,
          stdout: "",
          stderr: "",
          exitCode: 0,
        });
        const ensureSkillMdExistsSpy = vi
          .spyOn(
            service as unknown as {
              ensureSkillMdExists: (...args: unknown[]) => Promise<void>;
            },
            "ensureSkillMdExists",
          )
          .mockResolvedValue(undefined);
        const generateSkillMdSpy = vi
          .spyOn(
            service as unknown as {
              generateSkillMd: (...args: unknown[]) => Promise<void>;
            },
            "generateSkillMd",
          )
          .mockResolvedValue(undefined);

        // Act: orchestrate モードでは structurePlan は null のまま
        await service.createSkill({
          name: "orch-skill",
          description: "orchestrate test",
          mode: "orchestrate",
        });

        // Assert: generateSkillMd は呼ばれず、ensureSkillMdExists が呼ばれる
        expect(generateSkillMdSpy).not.toHaveBeenCalled();
        expect(ensureSkillMdExistsSpy).toHaveBeenCalledWith(
          expect.stringContaining("orch-skill"),
          "orch-skill",
          "orchestrate test",
          expect.any(Object),
        );
      });
    });

    describe("TC-10: structurePlan.skillName が空文字の場合の動作確認", () => {
      it("空文字の skillName が plan.skillName に反映されること", async () => {
        // Arrange
        mockScriptExecutor.execute.mockResolvedValue({
          success: true,
          stdout: "",
          stderr: "",
          exitCode: 0,
        });
        vi.mocked(fsPromises.access).mockResolvedValue(undefined);
        const planWithEmptySkillName = {
          skillName: "",
          description: "テスト",
          purpose: "test",
          features: [],
          agents: [],
        };

        // Act
        await (
          service as unknown as {
            generateSkillMd: (skillDir: string, plan: unknown) => Promise<void>;
          }
        ).generateSkillMd("/path/to/skillDir", planWithEmptySkillName);

        // Assert: plan.skillName が空文字のまま反映されている（バリデーションは別層の責務）
        const writeSpy = vi.mocked(fsPromises.writeFile);
        const tmpWriteCall = writeSpy.mock.calls.find(
          ([filePath]: [unknown]) =>
            typeof filePath === "string" &&
            /skill-plan-[0-9a-f-]{36}\.json$/.test(filePath),
        );
        expect(tmpWriteCall).toBeDefined();
        const writtenPlan = JSON.parse(tmpWriteCall![1] as string);
        expect(writtenPlan.skillName).toBe("");
      });
    });

    describe("TC-11: plan.workflow.trigger.keywords に skillName が含まれること", () => {
      it("structurePlan に triggers がない場合 keywords が [skillName] になること", async () => {
        // Arrange
        mockScriptExecutor.execute.mockResolvedValue({
          success: true,
          stdout: "",
          stderr: "",
          exitCode: 0,
        });
        vi.mocked(fsPromises.access).mockResolvedValue(undefined);
        const planWithoutTriggers = {
          skillName: "my-skill",
          description: "テスト",
          purpose: "test purpose",
          features: [],
          agents: [],
        };

        // Act
        await (
          service as unknown as {
            generateSkillMd: (skillDir: string, plan: unknown) => Promise<void>;
          }
        ).generateSkillMd("/path/to/skillDir", planWithoutTriggers);

        // Assert: keywords に skillName が含まれる
        const writeSpy = vi.mocked(fsPromises.writeFile);
        const tmpWriteCall = writeSpy.mock.calls.find(
          ([filePath]: [unknown]) =>
            typeof filePath === "string" &&
            /skill-plan-[0-9a-f-]{36}\.json$/.test(filePath),
        );
        expect(tmpWriteCall).toBeDefined();
        const writtenPlan = JSON.parse(tmpWriteCall![1] as string);
        expect(writtenPlan.workflow.trigger.keywords).toContain("my-skill");
      });
    });

    describe("TC-12: structurePlan.purpose が空文字列の場合の triggerDescription", () => {
      it("purpose が空文字のとき triggerDescription が短縮形になること", async () => {
        // Arrange
        mockScriptExecutor.execute.mockResolvedValue({
          success: true,
          stdout: "",
          stderr: "",
          exitCode: 0,
        });
        vi.mocked(fsPromises.access).mockResolvedValue(undefined);
        const planWithEmptyPurpose = {
          skillName: "empty-purpose-skill",
          description: "テスト",
          purpose: "",
          features: [],
          agents: [],
        };

        // Act
        await (
          service as unknown as {
            generateSkillMd: (skillDir: string, plan: unknown) => Promise<void>;
          }
        ).generateSkillMd("/path/to/skillDir", planWithEmptyPurpose);

        // Assert: purpose なしの短縮 trigger.description
        const writeSpy = vi.mocked(fsPromises.writeFile);
        const tmpWriteCall = writeSpy.mock.calls.find(
          ([filePath]: [unknown]) =>
            typeof filePath === "string" &&
            /skill-plan-[0-9a-f-]{36}\.json$/.test(filePath),
        );
        expect(tmpWriteCall).toBeDefined();
        const writtenPlan = JSON.parse(tmpWriteCall![1] as string);
        expect(writtenPlan.workflow.trigger.description).toBe(
          "Use when empty-purpose-skill is requested",
        );
        expect(writtenPlan.workflow.trigger.description).not.toContain(
          "Purpose:",
        );
      });

      it("purpose の前後空白と連続空白が正規化されること", async () => {
        // Arrange
        mockScriptExecutor.execute.mockResolvedValue({
          success: true,
          stdout: "",
          stderr: "",
          exitCode: 0,
        });
        vi.mocked(fsPromises.access).mockResolvedValue(undefined);
        const planWithWhitespacePurpose = {
          skillName: "normalized-skill",
          description: "テスト",
          purpose: "  first   second \n third  ",
          features: [],
          agents: [],
        };

        // Act
        await (
          service as unknown as {
            generateSkillMd: (skillDir: string, plan: unknown) => Promise<void>;
          }
        ).generateSkillMd("/path/to/skillDir", planWithWhitespacePurpose);

        // Assert
        const writeSpy = vi.mocked(fsPromises.writeFile);
        const tmpWriteCall = writeSpy.mock.calls.find(
          ([filePath]: [unknown]) =>
            typeof filePath === "string" &&
            /skill-plan-[0-9a-f-]{36}\.json$/.test(filePath),
        );
        expect(tmpWriteCall).toBeDefined();
        const writtenPlan = JSON.parse(tmpWriteCall![1] as string);
        expect(writtenPlan.workflow.trigger.description).toBe(
          "Use when normalized-skill is requested. Purpose: first second third",
        );
      });
    });

    describe("TC-13: structurePlan.triggers が空配列の場合の triggerKeywords", () => {
      it("triggers が空配列のとき triggerKeywords が [skillName] になること", async () => {
        // Arrange
        mockScriptExecutor.execute.mockResolvedValue({
          success: true,
          stdout: "",
          stderr: "",
          exitCode: 0,
        });
        vi.mocked(fsPromises.access).mockResolvedValue(undefined);
        const planWithEmptyTriggers = {
          skillName: "trigger-skill",
          description: "テスト",
          purpose: "test",
          features: [],
          agents: [],
          triggers: [],
        };

        // Act
        await (
          service as unknown as {
            generateSkillMd: (skillDir: string, plan: unknown) => Promise<void>;
          }
        ).generateSkillMd("/path/to/skillDir", planWithEmptyTriggers);

        // Assert: triggers 空配列 → keywords = [skillName]
        const writeSpy = vi.mocked(fsPromises.writeFile);
        const tmpWriteCall = writeSpy.mock.calls.find(
          ([filePath]: [unknown]) =>
            typeof filePath === "string" &&
            /skill-plan-[0-9a-f-]{36}\.json$/.test(filePath),
        );
        expect(tmpWriteCall).toBeDefined();
        const writtenPlan = JSON.parse(tmpWriteCall![1] as string);
        expect(writtenPlan.workflow.trigger.keywords).toEqual([
          "trigger-skill",
        ]);
      });
    });

    describe("TC-14: generate_skill_md.js が失敗しても createSkill() が成功すること", () => {
      it("スクリプトが stderr を出力して失敗しても createSkill() が例外をスローしないこと", async () => {
        // Arrange: init_skill は成功、generate_skill_md は失敗
        mockResourceLoader.loadAgent.mockResolvedValue("mock-agent-content");
        mockScriptExecutor.execute.mockImplementation(
          async (script: string) => {
            if (script === "generate_skill_md.js") {
              return {
                success: false,
                stdout: "",
                stderr: "internal error",
                exitCode: 1,
              };
            }
            return { success: true, stdout: "", stderr: "", exitCode: 0 };
          },
        );
        vi.spyOn(
          service as unknown as {
            ensureSkillMdExists: (...args: unknown[]) => Promise<void>;
          },
          "ensureSkillMdExists",
        ).mockResolvedValue(undefined);

        // Act & Assert: 例外が throw されない
        await expect(
          service.createSkill({
            name: "test-skill",
            description: "テスト",
            mode: "create",
          }),
        ).resolves.not.toThrow();
      });
    });

    describe("TC-15: generateSkillMd が例外をスローした場合の ensureSkillMdExists フォールバック", () => {
      it("generateSkillMd 内で例外が発生しても ensureSkillMdExists が呼ばれること", async () => {
        // Arrange
        mockScriptExecutor.execute.mockRejectedValue(
          new Error("unexpected error"),
        );
        const ensureSkillMdExistsSpy = vi
          .spyOn(
            service as unknown as {
              ensureSkillMdExists: (...args: unknown[]) => Promise<void>;
            },
            "ensureSkillMdExists",
          )
          .mockResolvedValue(undefined);
        const planForFallback = {
          skillName: "fallback-skill",
          description: "フォールバックテスト",
          purpose: "test",
          features: [],
          agents: [],
        };

        // Act
        await (
          service as unknown as {
            generateSkillMd: (skillDir: string, plan: unknown) => Promise<void>;
          }
        ).generateSkillMd("/path/to/skillDir", planForFallback);

        // Assert: ensureSkillMdExists がフォールバックとして呼ばれる
        expect(ensureSkillMdExistsSpy).toHaveBeenCalledWith(
          "/path/to/skillDir",
          "fallback-skill",
          "フォールバックテスト",
          undefined,
        );
      });
    });
  });
});
