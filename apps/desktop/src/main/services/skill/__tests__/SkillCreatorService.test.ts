/**
 * SkillCreatorService Unit Tests
 * Phase 4: TDD Red State - Tests created before implementation
 *
 * Test Coverage:
 * - SC-001〜SC-019: detectMode(), createSkill(), executeTasks(), validateSkill(), validateWithSchema()
 * - BC-001〜BC-005: Boundary and error cases
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SkillCreatorService } from "../SkillCreatorService";
import { ScriptExecutor } from "../ScriptExecutor";
import { ResourceLoader } from "../ResourceLoader";
import type { CreateSkillOptions, InterviewResult } from "@repo/shared/types";

// Mock dependencies
vi.mock("../ScriptExecutor");
vi.mock("../ResourceLoader");

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

    service = new SkillCreatorService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

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
});
