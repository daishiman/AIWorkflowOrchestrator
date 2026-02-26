/**
 * TaskGenerator - インタビュー結果からタスクリスト生成
 * TASK-9B Phase 5
 *
 * InterviewResultからタスク仕様（TaskSpec）を生成し、
 * 依存関係の解決・循環検出・トポロジカルソート・並列グループ化を提供する。
 */
import type { InterviewResult, TaskSpec } from "@repo/shared/types";

/**
 * 循環依存検出エラー
 * タスク間の依存関係に循環が検出された場合にスローされる
 */
export class CyclicDependencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CyclicDependencyError";
    Object.setPrototypeOf(this, CyclicDependencyError.prototype);
  }
}

/**
 * 無効な依存関係エラー
 * 存在しないタスクIDへの依存が検出された場合にスローされる
 */
export class InvalidDependencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDependencyError";
    Object.setPrototypeOf(this, InvalidDependencyError.prototype);
  }
}

export class TaskGenerator {
  /**
   * インタビュー結果からタスクリストを生成する
   *
   * @param interviewResult - インタビュー結果
   * @returns 生成されたタスク仕様の配列
   */
  generateTasks(interviewResult: InterviewResult): TaskSpec[] {
    if (!interviewResult.features || interviewResult.features.length === 0) {
      return [];
    }

    return interviewResult.features.map((feature, index) => ({
      id: `task-${index + 1}`,
      content: `Implement: ${feature}`,
      allowedTools: interviewResult.toolsNeeded,
      depends_on: index > 0 ? [`task-${index}`] : [],
    }));
  }

  /**
   * タスクの依存関係を検証する
   * 存在しないタスクIDへの依存を検出する
   *
   * @param tasks - 検証対象のタスク配列
   * @returns 検証済みのタスク配列
   * @throws InvalidDependencyError - 存在しないタスクIDへの依存が検出された場合
   */
  resolveDependencies(tasks: TaskSpec[]): TaskSpec[] {
    const taskIds = new Set(tasks.map((t) => t.id));

    for (const task of tasks) {
      if (task.depends_on) {
        for (const depId of task.depends_on) {
          if (!taskIds.has(depId)) {
            throw new InvalidDependencyError(
              `Task "${task.id}" depends on non-existent task "${depId}"`,
            );
          }
        }
      }
    }

    return tasks;
  }

  /**
   * タスク間の循環依存を検出する（DFS）
   *
   * @param tasks - 検出対象のタスク配列
   * @returns 循環依存が存在する場合true
   */
  detectCycles(tasks: TaskSpec[]): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (taskId: string): boolean => {
      if (recursionStack.has(taskId)) return true;
      if (visited.has(taskId)) return false;

      visited.add(taskId);
      recursionStack.add(taskId);

      const task = tasks.find((t) => t.id === taskId);
      if (task?.depends_on) {
        for (const depId of task.depends_on) {
          if (dfs(depId)) return true;
        }
      }

      recursionStack.delete(taskId);
      return false;
    };

    for (const task of tasks) {
      if (dfs(task.id)) return true;
    }
    return false;
  }

  /**
   * トポロジカルソート（Kahn's algorithm）
   * 依存関係を考慮した実行順序を決定する
   *
   * @param tasks - ソート対象のタスク配列
   * @returns ソートされたタスク配列
   * @throws InvalidDependencyError - 存在しないタスクIDへの依存が検出された場合
   * @throws CyclicDependencyError - 循環依存が検出された場合
   */
  topologicalSort(tasks: TaskSpec[]): TaskSpec[] {
    // 依存関係を検証
    this.resolveDependencies(tasks);

    // 循環依存を検出
    if (this.detectCycles(tasks)) {
      throw new CyclicDependencyError("Circular dependency detected in tasks");
    }

    const inDegree = new Map<string, number>();
    const taskMap = new Map<string, TaskSpec>();

    for (const task of tasks) {
      inDegree.set(task.id, 0);
      taskMap.set(task.id, task);
    }

    for (const task of tasks) {
      if (task.depends_on) {
        inDegree.set(task.id, task.depends_on.length);
      }
    }

    const queue: string[] = [];
    for (const [taskId, degree] of inDegree) {
      if (degree === 0) queue.push(taskId);
    }

    const result: TaskSpec[] = [];
    while (queue.length > 0) {
      const taskId = queue.shift()!;
      const task = taskMap.get(taskId);
      if (task) {
        result.push(task);
        for (const t of tasks) {
          if (t.depends_on?.includes(taskId)) {
            const newDegree = (inDegree.get(t.id) || 1) - 1;
            inDegree.set(t.id, newDegree);
            if (newDegree === 0) queue.push(t.id);
          }
        }
      }
    }

    return result;
  }

  /**
   * 並列実行可能なタスクをグループ化する
   * 同一グループ内のタスクは同時実行可能
   *
   * @param tasks - グループ化対象のタスク配列
   * @returns グループ化されたタスク配列の配列
   */
  groupParallelTasks(tasks: TaskSpec[]): TaskSpec[][] {
    const sorted = this.topologicalSort(tasks);
    const groups: TaskSpec[][] = [];
    const completed = new Set<string>();

    while (completed.size < sorted.length) {
      const group: TaskSpec[] = [];
      for (const task of sorted) {
        if (completed.has(task.id)) continue;
        const isDepsCompleted =
          !task.depends_on || task.depends_on.every((d) => completed.has(d));
        if (isDepsCompleted) group.push(task);
      }
      if (group.length === 0) break;
      for (const task of group) completed.add(task.id);
      groups.push(group);
    }

    return groups;
  }
}
