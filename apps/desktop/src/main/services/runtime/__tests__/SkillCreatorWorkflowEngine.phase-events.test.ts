/**
 * SkillCreatorWorkflowEngine - onPhaseChanged callback 検証
 *
 * TASK-FIX-EXECUTE-PLAN-FF-001 Phase 4: TDD Red テスト
 * TC-T3-01: onPhaseChanged が undefined の場合に例外が発生しない
 * TC-T3-02: onPhaseChanged が登録されている場合に planId 付きで呼ばれる
 * TC-T3-03: 複数のフェーズ遷移が順番通りに callback を呼ぶ
 * TC-T3-04: onPhaseChanged callback が型 (planId, phase, progress) を受け取る
 */

import { describe, it, expect, vi } from "vitest";
import {
  SkillCreatorWorkflowEngine,
  type SkillCreatorExecuteAsyncPhase,
} from "../SkillCreatorWorkflowEngine";

describe("SkillCreatorWorkflowEngine - onPhaseChanged callback", () => {
  it("TC-T3-01: onPhaseChanged が undefined の場合に例外が発生しない", () => {
    const engine = new SkillCreatorWorkflowEngine();
    engine.onPhaseChanged = undefined;

    expect(() =>
      engine.triggerPhaseTransition("plan-001", "executing", 10),
    ).not.toThrow();
  });

  it("TC-T3-02: onPhaseChanged が登録されている場合に planId 付きで呼ばれる", () => {
    const engine = new SkillCreatorWorkflowEngine();
    const mockCallback = vi.fn();
    engine.onPhaseChanged = mockCallback;

    engine.triggerPhaseTransition("plan-001", "executing", 10);

    expect(mockCallback).toHaveBeenCalledWith("plan-001", "executing", 10);
  });

  it("TC-T3-03: 複数のフェーズ遷移が順番通りに callback を呼ぶ", () => {
    const engine = new SkillCreatorWorkflowEngine();
    const calls: Array<[string, SkillCreatorExecuteAsyncPhase, number]> = [];
    engine.onPhaseChanged = (planId, phase, progress) =>
      calls.push([planId, phase, progress]);

    engine.triggerPhaseTransition("plan-001", "executing", 0);
    engine.triggerPhaseTransition("plan-001", "complete", 100);
    engine.triggerPhaseTransition("plan-001", "error", 0);

    expect(calls).toEqual([
      ["plan-001", "executing", 0],
      ["plan-001", "complete", 100],
      ["plan-001", "error", 0],
    ]);
  });

  it("TC-T3-04: onPhaseChanged callback が型 (planId, phase, progress) を受け取る", () => {
    const engine = new SkillCreatorWorkflowEngine();

    const typedCallback: (
      planId: string,
      phase: SkillCreatorExecuteAsyncPhase,
      progress: number,
    ) => void = vi.fn();
    engine.onPhaseChanged = typedCallback;

    expect(engine.onPhaseChanged).toBe(typedCallback);
  });

  it("TC-T3-05: onPhaseChanged callback に渡される progress が 0〜100 の範囲である", () => {
    const engine = new SkillCreatorWorkflowEngine();
    const receivedProgress: number[] = [];
    const receivedPlanIds: string[] = [];
    engine.onPhaseChanged = (planId, _phase, progress) => {
      receivedPlanIds.push(planId);
      receivedProgress.push(progress);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    };

    engine.triggerPhaseTransition("plan-001", "executing", 10);
    engine.triggerPhaseTransition("plan-001", "complete", 30);
    engine.triggerPhaseTransition("plan-001", "error", 70);
    engine.triggerPhaseTransition("plan-002", "executing", 100);

    expect(receivedProgress).toEqual([10, 30, 70, 100]);
    expect(receivedPlanIds).toEqual([
      "plan-001",
      "plan-001",
      "plan-001",
      "plan-002",
    ]);
  });

  it("TC-T3-06: onPhaseChanged を後から差し替えると新しい callback が呼ばれる", () => {
    const engine = new SkillCreatorWorkflowEngine();
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();

    engine.onPhaseChanged = firstCallback;
    engine.triggerPhaseTransition("plan-001", "executing", 10);

    engine.onPhaseChanged = secondCallback;
    engine.triggerPhaseTransition("plan-001", "complete", 30);

    expect(firstCallback).toHaveBeenCalledTimes(1);
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });
});
