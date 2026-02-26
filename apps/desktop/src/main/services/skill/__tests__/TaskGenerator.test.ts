/**
 * TaskGenerator ユニットテスト
 * Phase 6: Test Expansion（実クラス使用）
 * テストID: TG-001 ~ TG-007, TG-EX-001 ~ TG-EX-002
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  TaskGenerator,
  CyclicDependencyError,
  InvalidDependencyError,
} from "../TaskGenerator";
import type { InterviewResult, TaskSpec } from "@repo/shared/types";

describe("TaskGenerator", () => {
  let generator: TaskGenerator;

  beforeEach(() => {
    vi.clearAllMocks();
    generator = new TaskGenerator();
  });

  describe("generateTasks()", () => {
    it("TG-001: インタビュー結果からタスクリストを生成する", () => {
      const interviewResult: InterviewResult = {
        purpose: "Build CI tool",
        features: ["run tests", "deploy", "notify"],
        inputs: ["config"],
        outputs: ["report"],
        toolsNeeded: ["Bash"],
        abstractionLevel: "L2",
      };
      const tasks = generator.generateTasks(interviewResult);
      expect(tasks).toBeDefined();
      expect(tasks.length).toBe(3);
      // 各タスクがTaskSpec構造を持つことを確認
      for (const task of tasks) {
        expect(task.id).toBeDefined();
        expect(task.content).toBeDefined();
        expect(typeof task.id).toBe("string");
        expect(typeof task.content).toBe("string");
      }
    });

    it("TG-006: features が空の場合は空のタスクリストを返す", () => {
      const interviewResult: InterviewResult = {
        purpose: "Empty tool",
        features: [],
        inputs: [],
        outputs: [],
        toolsNeeded: [],
        abstractionLevel: "L1",
      };
      const tasks = generator.generateTasks(interviewResult);
      expect(tasks).toEqual([]);
    });
  });

  describe("resolveDependencies()", () => {
    it("TG-002: タスクの依存関係を正しく解決する", () => {
      const tasks: TaskSpec[] = [
        { id: "task-1", content: "Task 1", allowedTools: [], depends_on: [] },
        {
          id: "task-2",
          content: "Task 2",
          allowedTools: [],
          depends_on: ["task-1"],
        },
        {
          id: "task-3",
          content: "Task 3",
          allowedTools: [],
          depends_on: ["task-1", "task-2"],
        },
      ];
      const resolved = generator.resolveDependencies(tasks);
      expect(resolved).toBeDefined();
      expect(resolved.length).toBe(3);
      expect(resolved[1].depends_on).toContain("task-1");
      expect(resolved[2].depends_on).toContain("task-2");
    });

    it("TG-007: 存在しないタスクへの依存がある場合エラーをスローする", () => {
      const tasks: TaskSpec[] = [
        {
          id: "task-1",
          content: "Task 1",
          allowedTools: [],
          depends_on: ["non-existent-task"],
        },
      ];
      expect(() => generator.resolveDependencies(tasks)).toThrow(
        InvalidDependencyError,
      );
      expect(() => generator.resolveDependencies(tasks)).toThrow(
        "non-existent",
      );
    });
  });

  describe("detectCycles()", () => {
    it("TG-003: 循環依存を検出する（A->B->C->A）", () => {
      const tasks: TaskSpec[] = [
        {
          id: "task-a",
          content: "Task A",
          allowedTools: [],
          depends_on: ["task-c"],
        },
        {
          id: "task-b",
          content: "Task B",
          allowedTools: [],
          depends_on: ["task-a"],
        },
        {
          id: "task-c",
          content: "Task C",
          allowedTools: [],
          depends_on: ["task-b"],
        },
      ];
      const hasCycle = generator.detectCycles(tasks);
      expect(hasCycle).toBe(true);
    });

    it("循環依存がない場合falseを返す", () => {
      const tasks: TaskSpec[] = [
        { id: "task-1", content: "Task 1", allowedTools: [], depends_on: [] },
        {
          id: "task-2",
          content: "Task 2",
          allowedTools: [],
          depends_on: ["task-1"],
        },
      ];
      const hasCycle = generator.detectCycles(tasks);
      expect(hasCycle).toBe(false);
    });
  });

  describe("topologicalSort()", () => {
    it("TG-004: トポロジカルソートで実行順序を決定する", () => {
      const tasks: TaskSpec[] = [
        {
          id: "task-3",
          content: "Task 3",
          allowedTools: [],
          depends_on: ["task-1", "task-2"],
        },
        { id: "task-1", content: "Task 1", allowedTools: [], depends_on: [] },
        {
          id: "task-2",
          content: "Task 2",
          allowedTools: [],
          depends_on: ["task-1"],
        },
        {
          id: "task-4",
          content: "Task 4",
          allowedTools: [],
          depends_on: ["task-2"],
        },
        {
          id: "task-5",
          content: "Task 5",
          allowedTools: [],
          depends_on: ["task-3", "task-4"],
        },
      ];
      const sorted = generator.topologicalSort(tasks);
      const ids = sorted.map((t) => t.id);
      expect(ids.indexOf("task-1")).toBeLessThan(ids.indexOf("task-2"));
      expect(ids.indexOf("task-2")).toBeLessThan(ids.indexOf("task-3"));
      expect(ids.indexOf("task-2")).toBeLessThan(ids.indexOf("task-4"));
      expect(ids.indexOf("task-3")).toBeLessThan(ids.indexOf("task-5"));
      expect(ids.indexOf("task-4")).toBeLessThan(ids.indexOf("task-5"));
    });

    it("循環依存がある場合CyclicDependencyErrorをスローする", () => {
      const tasks: TaskSpec[] = [
        {
          id: "task-a",
          content: "Task A",
          allowedTools: [],
          depends_on: ["task-b"],
        },
        {
          id: "task-b",
          content: "Task B",
          allowedTools: [],
          depends_on: ["task-a"],
        },
      ];
      expect(() => generator.topologicalSort(tasks)).toThrow(
        CyclicDependencyError,
      );
    });
  });

  describe("groupParallelTasks()", () => {
    it("TG-005: 独立したタスクを並列実行グループにまとめる", () => {
      const tasks: TaskSpec[] = [
        { id: "task-1", content: "Task 1", allowedTools: [], depends_on: [] },
        { id: "task-2", content: "Task 2", allowedTools: [], depends_on: [] },
        { id: "task-3", content: "Task 3", allowedTools: [], depends_on: [] },
      ];
      const groups = generator.groupParallelTasks(tasks);
      expect(groups).toBeDefined();
      // 全て独立なので1グループに全タスクが含まれる
      expect(groups.length).toBe(1);
      expect(groups[0].length).toBe(3);
    });

    it("依存関係がある場合複数グループに分割する", () => {
      const tasks: TaskSpec[] = [
        { id: "task-1", content: "Task 1", allowedTools: [], depends_on: [] },
        {
          id: "task-2",
          content: "Task 2",
          allowedTools: [],
          depends_on: ["task-1"],
        },
        {
          id: "task-3",
          content: "Task 3",
          allowedTools: [],
          depends_on: ["task-1"],
        },
        {
          id: "task-4",
          content: "Task 4",
          allowedTools: [],
          depends_on: ["task-2", "task-3"],
        },
      ];
      const groups = generator.groupParallelTasks(tasks);
      expect(groups.length).toBeGreaterThanOrEqual(2);
      // 最初のグループにtask-1が含まれる
      expect(groups[0].map((t) => t.id)).toContain("task-1");
    });
  });

  describe("拡張テスト", () => {
    it("TG-EX-001: generateTasks: 10件超のタスクを正しく分割する", () => {
      const features = Array.from({ length: 15 }, (_, i) => `feature-${i + 1}`);
      const interviewResult: InterviewResult = {
        purpose: "Large scale tool",
        features,
        inputs: ["data"],
        outputs: ["result"],
        toolsNeeded: ["Read", "Write"],
        abstractionLevel: "L2",
      };
      const tasks = generator.generateTasks(interviewResult);
      expect(tasks.length).toBe(15);
      // 各タスクIDがユニークであること
      const ids = tasks.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(15);
      // 各タスクのcontentにfeature名が含まれること
      for (let i = 0; i < 15; i++) {
        expect(tasks[i].content).toContain(features[i]);
      }
      // toolsNeeded が引き継がれること
      for (const task of tasks) {
        expect(task.allowedTools).toEqual(["Read", "Write"]);
      }
    });

    it("TG-EX-002: groupParallelTasks: 全タスクが独立の場合に1グループ", () => {
      const tasks: TaskSpec[] = [
        { id: "a", content: "A", allowedTools: [], depends_on: [] },
        { id: "b", content: "B", allowedTools: [], depends_on: [] },
        { id: "c", content: "C", allowedTools: [], depends_on: [] },
        { id: "d", content: "D", allowedTools: [], depends_on: [] },
        { id: "e", content: "E", allowedTools: [], depends_on: [] },
      ];
      const groups = generator.groupParallelTasks(tasks);
      expect(groups.length).toBe(1);
      expect(groups[0].length).toBe(5);
      // 全タスクが最初のグループに含まれること
      const groupIds = groups[0].map((t) => t.id);
      expect(groupIds).toContain("a");
      expect(groupIds).toContain("b");
      expect(groupIds).toContain("c");
      expect(groupIds).toContain("d");
      expect(groupIds).toContain("e");
    });
  });
});
