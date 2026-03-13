/**
 * @vitest-environment happy-dom
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SkillAnalysis } from "@repo/shared/types/skill-improver";
import { useAppStore } from "../../index";
import {
  buildExecutionQualityEvaluation,
  buildLifecycleEvaluationSnapshot,
  buildLifecycleGateDecision,
  calculateLifecycleTotalScore,
} from "../../skillEvaluation";

const baseAnalysis: SkillAnalysis = {
  skillName: "gate-skill",
  overallScore: 72,
  categories: [
    {
      name: "Code Quality",
      score: 74,
      details: "概ね良好",
      issues: ["改善余地あり"],
    },
  ],
  suggestions: [],
  risks: [],
};

beforeEach(() => {
  useAppStore.getState().clearSkillEvaluation();
  useAppStore.getState().resetAgentState();
  (window as Window & { electronAPI?: unknown }).electronAPI = {
    skill: {
      evaluatePrompt: vi.fn().mockResolvedValue({
        score: 84,
        breakdown: {
          clarity: 88,
          specificity: 82,
          completeness: 84,
          reproducibility: 81,
          security: 92,
        },
        feedback: ["good"],
      }),
    },
  };
});

describe("skillEvaluation helpers", () => {
  it("completed 実行では高い execution quality を返す", () => {
    const quality = buildExecutionQualityEvaluation({
      status: "completed",
      messages: [
        {
          type: "assistant",
          timestamp: Date.now(),
          content: { text: "result", isPartial: false },
        },
      ],
    });

    expect(quality.score).toBeGreaterThanOrEqual(80);
    expect(quality.permissionSafety).toBeGreaterThanOrEqual(80);
  });

  it("critical risk があると revise_required になる", () => {
    const snapshot = buildLifecycleEvaluationSnapshot({
      skillName: "critical-skill",
      stage: "post_create",
      promptEvaluation: {
        score: 90,
        breakdown: {
          clarity: 90,
          specificity: 90,
          completeness: 90,
          reproducibility: 90,
          security: 90,
        },
        feedback: [],
      },
      skillAnalysis: {
        ...baseAnalysis,
        overallScore: 88,
        risks: [
          {
            category: "security",
            level: "critical",
            description: "critical",
            impact: "block",
          },
        ],
      },
    });
    const decision = buildLifecycleGateDecision(snapshot);

    expect(decision.status).toBe("revise_required");
    expect(decision.blockingIssues).toContain(
      "critical risk が残っているため利用できません。",
    );
  });

  it("利用可能な軸だけで合成スコアを正規化する", () => {
    const totalScore = calculateLifecycleTotalScore(
      "post_improve",
      {
        score: 84,
        breakdown: {
          clarity: 88,
          specificity: 82,
          completeness: 84,
          reproducibility: 81,
          security: 92,
        },
        feedback: ["good"],
      },
      {
        ...baseAnalysis,
        overallScore: 91,
      },
      null,
    );

    expect(totalScore).toBe(89);
  });
});

describe("skillEvaluation slice", () => {
  it("draft 評価を保存する", async () => {
    const decision = await useAppStore
      .getState()
      .evaluateDraft("レビュー観点を整理するスキルを作る");

    expect(decision?.status).toBe("use_ready");
    expect(useAppStore.getState().latestEvaluationSnapshot?.stage).toBe(
      "draft",
    );
  });

  it("post_create は 60-79 点で save_with_warning になる", async () => {
    (
      window as Window & { electronAPI: { skill: { evaluatePrompt: unknown } } }
    ).electronAPI.skill.evaluatePrompt = vi.fn().mockResolvedValue({
      score: 70,
      breakdown: {
        clarity: 72,
        specificity: 70,
        completeness: 68,
        reproducibility: 69,
        security: 88,
      },
      feedback: ["warn"],
    });

    const decision = await useAppStore.getState().evaluatePostCreate({
      skillName: "gate-skill",
      prompt: "レビュー観点を整理する",
      skillAnalysis: baseAnalysis,
    });

    expect(decision?.status).toBe("save_with_warning");
    expect(decision?.totalScore).toBeGreaterThanOrEqual(60);
    expect(decision?.totalScore).toBeLessThan(80);
  });

  it("post_execute は completed 実行で use_ready になる", async () => {
    const decision = await useAppStore.getState().evaluatePostExecute({
      skillName: "gate-skill",
      prompt: "レビュー観点を整理する",
      skillAnalysis: {
        ...baseAnalysis,
        overallScore: 88,
      },
      status: "completed",
      messages: [
        {
          type: "assistant",
          timestamp: Date.now(),
          content: { text: "done", isPartial: false },
        },
      ],
    });

    expect(decision?.status).toBe("use_ready");
  });

  it("post_improve は正の差分で recommended になる", async () => {
    await useAppStore.getState().evaluatePostCreate({
      skillName: "gate-skill",
      prompt: "レビュー観点を整理する",
      skillAnalysis: baseAnalysis,
    });

    const decision = await useAppStore.getState().evaluatePostImprove({
      skillName: "gate-skill",
      prompt: "レビュー観点を整理する",
      skillAnalysis: {
        ...baseAnalysis,
        overallScore: 91,
      },
    });

    expect(decision?.status).toBe("recommended");
    expect(
      useAppStore.getState().latestEvaluationSnapshot?.deltaFromPrevious,
    ).toBeGreaterThan(0);
  });
});
