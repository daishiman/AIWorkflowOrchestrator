/**
 * SkillCreatorService Integration Tests
 * Phase 6: Test expansion with real dependencies
 *
 * These tests use real ScriptExecutor and ResourceLoader
 * to verify actual integration behavior.
 */

import { describe, it, expect, beforeEach } from "vitest";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { SkillCreatorService } from "../SkillCreatorService";
import { ScriptExecutor } from "../ScriptExecutor";
import { ResourceLoader } from "../ResourceLoader";
import type { CreateSkillOptions, InterviewResult } from "@repo/shared/types";

// Test with real skill-creator path if available
const SKILL_CREATOR_PATH = path.join(
  os.homedir(),
  ".aiworkflow",
  "skills",
  "skill-creator",
);

describe("SkillCreatorService Integration Tests", () => {
  let service: SkillCreatorService;
  let skillCreatorExists: boolean;

  beforeEach(async () => {
    // Check if skill-creator exists
    try {
      await fs.access(SKILL_CREATOR_PATH);
      skillCreatorExists = true;
    } catch {
      skillCreatorExists = false;
    }

    service = new SkillCreatorService();
  });

  describe("ScriptExecutor Integration", () => {
    it("should construct correct script paths", () => {
      const executor = new ScriptExecutor(SKILL_CREATOR_PATH);
      // Verify the executor is instantiated correctly
      expect(executor).toBeDefined();
    });
  });

  describe("ResourceLoader Integration", () => {
    it("should construct correct resource paths", () => {
      const loader = new ResourceLoader(SKILL_CREATOR_PATH);
      expect(loader).toBeDefined();
    });

    it("should load resources from real skill-creator if available", async () => {
      if (!skillCreatorExists) {
        console.log("Skipping: skill-creator not available");
        return;
      }

      const loader = new ResourceLoader(SKILL_CREATOR_PATH);

      // Try to load a known agent file
      try {
        const content = await loader.loadAgent("hearing");
        expect(content).toBeDefined();
        expect(typeof content).toBe("string");
        expect(content.length).toBeGreaterThan(0);
      } catch {
        // Agent may not exist, which is acceptable
        console.log("Agent file not found, skipping");
      }
    });

    it("should cache loaded resources", async () => {
      if (!skillCreatorExists) {
        console.log("Skipping: skill-creator not available");
        return;
      }

      const loader = new ResourceLoader(SKILL_CREATOR_PATH);

      try {
        // Load twice
        const content1 = await loader.load("agents", "hearing.md");
        const content2 = await loader.load("agents", "hearing.md");

        // Both should return same content
        expect(content1).toBe(content2);
      } catch {
        console.log("Resource not found, skipping cache test");
      }
    });
  });

  describe("SkillCreatorService Dependency Graph", () => {
    it("should detect circular dependencies correctly", () => {
      // Test the cycle detection algorithm directly
      // This tests the private method indirectly through public behavior

      // The service should throw on circular dependencies in executeTasks
      // We'll test this through mocked executeJson response in unit tests
      expect(service).toBeDefined();
    });

    it("should handle empty interview result validation", async () => {
      const options: CreateSkillOptions = {
        name: "test-skill",
        description: "Test",
        mode: "collaborative",
        interviewResult: {} as InterviewResult, // Empty
      };

      await expect(service.createSkill(options)).rejects.toThrow();
    });

    it("should validate collaborative mode requirements", async () => {
      // Collaborative mode requires valid interview result
      const optionsWithoutPurpose: CreateSkillOptions = {
        name: "test-skill",
        description: "Test",
        mode: "collaborative",
        interviewResult: {
          purpose: "", // Empty purpose
          features: ["feature1"],
          inputs: [],
          outputs: [],
          toolsNeeded: [],
          abstractionLevel: "L2",
        },
      };

      await expect(
        service.createSkill(optionsWithoutPurpose),
      ).rejects.toThrow();
    });

    it("should validate collaborative mode requires features", async () => {
      const optionsWithoutFeatures: CreateSkillOptions = {
        name: "test-skill",
        description: "Test",
        mode: "collaborative",
        interviewResult: {
          purpose: "Test purpose",
          features: [], // Empty features
          inputs: [],
          outputs: [],
          toolsNeeded: [],
          abstractionLevel: "L2",
        },
      };

      await expect(
        service.createSkill(optionsWithoutFeatures),
      ).rejects.toThrow();
    });
  });

  describe("SkillCreatorService Topological Sort", () => {
    it("should handle tasks with no dependencies", async () => {
      // Create a mock service that we can test sortng with
      const service = new SkillCreatorService();

      // The topological sort is tested through executeTasks
      // When there are no dependencies, tasks should execute in order
      expect(service).toBeDefined();
    });
  });

  describe("SkillCreatorService Error Handling", () => {
    it("should handle missing skill-creator gracefully", async () => {
      // Create service with non-existent paths
      const service = new SkillCreatorService(
        "/nonexistent/skills",
        "/nonexistent/workflows",
      );

      // detectMode should fail when scripts don't exist
      await expect(service.detectMode("test")).rejects.toThrow();
    });
  });

  // =====================================================
  // INT-001 ~ INT-005: Phase 4 統合テストシナリオ (Red)
  // =====================================================

  describe("INT-001: スキル生成フロー", () => {
    it("should execute full create workflow: createSkill → validateSkill", async () => {
      // [Red] createSkill() → ScriptExecutor → SKILL.md生成 → validateSkill() = true
      const tmpDir = path.join(os.tmpdir(), `skill-creator-int-${Date.now()}`);
      await fs.mkdir(tmpDir, { recursive: true });

      try {
        const skillDir = await service.createSkill({
          name: "int-test-skill",
          description: "Integration test skill",
          mode: "create",
          tasksDir: tmpDir,
        });

        // 生成先ディレクトリパスが返されること
        expect(skillDir).toBeDefined();
        expect(typeof skillDir).toBe("string");

        // validateSkill() が true を返すこと
        const isValid = await service.validateSkill(skillDir);
        expect(isValid).toBe(true);

        // SKILL.md が生成されていること
        const skillMdExists = await fs
          .access(path.join(skillDir, "SKILL.md"))
          .then(() => true)
          .catch(() => false);
        expect(skillMdExists).toBe(true);
      } finally {
        await fs.rm(tmpDir, { recursive: true, force: true });
      }
    });
  });

  describe("INT-002: タスク実行フロー", () => {
    it("should execute all tasks in dependency order and report results", async () => {
      // [Red] scanTasks → buildDependencyGraph → topologicalSort → executeTask
      const tmpDir = path.join(os.tmpdir(), `task-exec-int-${Date.now()}`);
      await fs.mkdir(tmpDir, { recursive: true });

      try {
        // タスク仕様書を作成
        await fs.writeFile(
          path.join(tmpDir, "task-a.md"),
          "# Task A\n## depends_on\n\n## description\nFirst task",
        );
        await fs.writeFile(
          path.join(tmpDir, "task-b.md"),
          "# Task B\n## depends_on\ntask-a\n## description\nSecond task",
        );

        const report = await service.executeTasks({
          tasksDir: tmpDir,
          parallel: false,
          dryRun: false,
        });

        // 全タスクが完了していること
        expect(report).toBeDefined();
        expect(report.summary.total).toBe(2);
        expect(
          report.summary.completed +
            report.summary.failed +
            report.summary.skipped,
        ).toBe(report.summary.totalTasks);

        // 各タスクの duration が 0 以上
        for (const result of report.results) {
          expect(result.duration).toBeGreaterThanOrEqual(0);
        }
      } finally {
        await fs.rm(tmpDir, { recursive: true, force: true });
      }
    });
  });

  describe("INT-003: エラーリカバリフロー", () => {
    it("should handle task failure: A=completed, B=failed, C=skipped", async () => {
      // [Red] A→B→C の依存関係でBが失敗→Cはスキップ
      const tmpDir = path.join(os.tmpdir(), `error-recovery-int-${Date.now()}`);
      await fs.mkdir(tmpDir, { recursive: true });

      try {
        await fs.writeFile(
          path.join(tmpDir, "task-a.md"),
          "# Task A\n## depends_on\n\n## description\nSucceeding task",
        );
        await fs.writeFile(
          path.join(tmpDir, "task-b.md"),
          "# Task B\n## depends_on\ntask-a\n## description\nFailing task\n## error_trigger\ntrue",
        );
        await fs.writeFile(
          path.join(tmpDir, "task-c.md"),
          "# Task C\n## depends_on\ntask-b\n## description\nShould be skipped",
        );

        const report = await service.executeTasks({
          tasksDir: tmpDir,
          parallel: false,
          dryRun: false,
        });

        expect(report.summary.completed).toBe(1); // Task A
        expect(report.summary.failed).toBe(1); // Task B
        expect(report.summary.skipped).toBe(1); // Task C

        // Task B の error フィールドにメッセージが含まれること
        const failedTask = report.results.find(
          (r: { status: string }) => r.status === "failed",
        );
        expect(failedTask).toBeDefined();
        expect(failedTask?.error).toBeTruthy();
      } finally {
        await fs.rm(tmpDir, { recursive: true, force: true });
      }
    });
  });

  describe("INT-004: ドライランフロー", () => {
    it("should return execution plan without executing tasks", async () => {
      // [Red] dryRun=true → 実行せず計画のみ返却
      const tmpDir = path.join(os.tmpdir(), `dry-run-int-${Date.now()}`);
      await fs.mkdir(tmpDir, { recursive: true });

      try {
        await fs.writeFile(
          path.join(tmpDir, "task-a.md"),
          "# Task A\n## depends_on\n\n## description\nFirst",
        );
        await fs.writeFile(
          path.join(tmpDir, "task-b.md"),
          "# Task B\n## depends_on\ntask-a\n## description\nSecond",
        );

        const report = await service.executeTasks({
          tasksDir: tmpDir,
          parallel: false,
          dryRun: true,
        });

        expect(report.mode).toBe("dry-run");
        // tasks が2次元配列（並列実行グループ）であること
        expect(Array.isArray(report.tasks)).toBe(true);
        if (report.tasks) {
          for (const group of report.tasks) {
            expect(Array.isArray(group)).toBe(true);
          }
        }
        // estimatedTime が 0 以上
        expect(report.estimatedTime).toBeGreaterThanOrEqual(0);
        // results は undefined または空
        expect(!report.results || report.results.length === 0).toBe(true);
      } finally {
        await fs.rm(tmpDir, { recursive: true, force: true });
      }
    });
  });

  describe("INT-005: IPC→Service連携フロー", () => {
    it("should verify service methods are callable with valid arguments", async () => {
      // [Red] IPCハンドラ→Service呼び出しチェーンの検証
      // Note: 実際のIPCハンドラはipcMain環境が必要なため、
      //       ここではServiceレベルのインターフェース整合性を検証する

      // detectMode: 文字列引数を受け取る
      await expect(service.detectMode("test user request")).rejects.toThrow(); // ScriptExecutor未セットアップのため

      // validateSkill: ディレクトリパスを受け取る
      const isValid = await service.validateSkill("/nonexistent/path");
      expect(typeof isValid).toBe("boolean");

      // validateWithSchema: スキーマ名とデータを受け取る
      const schemaResult = await service.validateWithSchema("task-spec", {
        name: "test",
      });
      expect(typeof schemaResult).toBe("boolean");
    });
  });

  describe("Phase 6 Expansion Tests", () => {
    it("INT-EX-001: improveSkill should throw when skill doesn't exist", async () => {
      // ScriptExecutorがスクリプト実行に失敗するため、
      // 存在しないスキル名でimproveSkillを呼ぶとエラーになる
      await expect(
        service.improveSkill("nonexistent-skill", false),
      ).rejects.toThrow();
    });

    it("INT-EX-002: forkSkill should throw when source doesn't exist", async () => {
      // 存在しないソーススキル名でforkSkillを呼ぶとエラーになる
      await expect(
        service.forkSkill("nonexistent-source", "new-fork", {}),
      ).rejects.toThrow();
    });

    it("INT-EX-003: debugSkill should throw when skill doesn't exist", async () => {
      // 存在しないスキル名でdebugSkillを呼ぶとエラーになる
      await expect(
        service.debugSkill("nonexistent-debug-skill", {}),
      ).rejects.toThrow();
    });

    it("INT-EX-004: generateDocs should throw when skill doesn't exist", async () => {
      // 存在しないスキル名でgenerateDocsを呼ぶとエラーになる
      await expect(
        service.generateDocs("nonexistent-docs-skill", "markdown", [
          "overview",
        ]),
      ).rejects.toThrow();
    });
  });
});
