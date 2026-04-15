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
});
