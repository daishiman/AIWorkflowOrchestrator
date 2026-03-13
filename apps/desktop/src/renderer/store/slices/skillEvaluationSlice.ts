import { StateCreator } from "zustand";
import type { SkillExecutionStatus, SkillStreamMessage } from "@repo/shared";
import type {
  ExecutionQualityEvaluation,
  LifecycleEvaluationSnapshot,
  LifecycleGateDecision,
} from "@repo/shared/types";
import type { SkillAnalysis } from "@repo/shared/types/skill-improver";
import {
  buildExecutionQualityEvaluation,
  buildLifecycleEvaluationSnapshot,
  buildLifecycleGateDecision,
} from "../skillEvaluation";

function formatSkillEvaluationError(prefix: string, error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return `${prefix}: ${message}`;
}

export interface SkillEvaluationState {
  latestPromptRequest: string | null;
  latestEvaluationSnapshot: LifecycleEvaluationSnapshot | null;
  latestGateDecision: LifecycleGateDecision | null;
  latestExecutionQuality: ExecutionQualityEvaluation | null;
  evaluationHistory: LifecycleEvaluationSnapshot[];
  isEvaluatingLifecycle: boolean;
  evaluationError: string | null;
}

export interface SkillEvaluationActions {
  evaluateDraft: (prompt: string) => Promise<LifecycleGateDecision | null>;
  evaluatePostCreate: (params: {
    skillName: string;
    prompt: string;
    skillAnalysis: SkillAnalysis;
  }) => Promise<LifecycleGateDecision | null>;
  evaluatePostExecute: (params: {
    skillName: string;
    prompt: string;
    skillAnalysis?: SkillAnalysis | null;
    status: SkillExecutionStatus | null;
    messages: SkillStreamMessage[];
    permissionPending?: boolean;
  }) => Promise<LifecycleGateDecision | null>;
  evaluatePostImprove: (params: {
    skillName: string;
    prompt: string;
    skillAnalysis: SkillAnalysis;
  }) => Promise<LifecycleGateDecision | null>;
  clearSkillEvaluation: () => void;
}

export interface SkillEvaluationSlice
  extends SkillEvaluationState, SkillEvaluationActions {}

const initialSkillEvaluationState: SkillEvaluationState = {
  latestPromptRequest: null,
  latestEvaluationSnapshot: null,
  latestGateDecision: null,
  latestExecutionQuality: null,
  evaluationHistory: [],
  isEvaluatingLifecycle: false,
  evaluationError: null,
};

export const createSkillEvaluationSlice: StateCreator<
  SkillEvaluationSlice,
  [],
  [],
  SkillEvaluationSlice
> = (set, get) => {
  const resolvePromptEvaluation = async (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      throw new Error("prompt must be a non-empty string");
    }
    if (!window.electronAPI?.skill?.evaluatePrompt) {
      throw new Error("Skill evaluatePrompt API not available");
    }
    return window.electronAPI.skill.evaluatePrompt(trimmedPrompt);
  };

  const persistEvaluation = (snapshot: LifecycleEvaluationSnapshot) => {
    const decision = buildLifecycleGateDecision(snapshot);
    set((state) => ({
      latestEvaluationSnapshot: snapshot,
      latestGateDecision: decision,
      latestExecutionQuality:
        snapshot.executionQuality ?? state.latestExecutionQuality,
      evaluationHistory: [...state.evaluationHistory, snapshot].slice(-24),
      evaluationError: null,
      isEvaluatingLifecycle: false,
    }));
    return decision;
  };

  return {
    ...initialSkillEvaluationState,

    evaluateDraft: async (prompt: string) => {
      set({
        isEvaluatingLifecycle: true,
        evaluationError: null,
        latestPromptRequest: prompt.trim(),
      });

      try {
        const promptEvaluation = await resolvePromptEvaluation(prompt);
        const snapshot = buildLifecycleEvaluationSnapshot({
          skillName: "draft-request",
          stage: "draft",
          promptEvaluation,
          previousSnapshot: null,
        });
        return persistEvaluation(snapshot);
      } catch (error) {
        set({
          evaluationError: formatSkillEvaluationError(
            "依頼文評価に失敗",
            error,
          ),
          isEvaluatingLifecycle: false,
        });
        return null;
      }
    },

    evaluatePostCreate: async ({ skillName, prompt, skillAnalysis }) => {
      set({
        isEvaluatingLifecycle: true,
        evaluationError: null,
        latestPromptRequest: prompt.trim(),
      });

      try {
        const promptEvaluation = await resolvePromptEvaluation(prompt);
        const previousSnapshot = get().latestEvaluationSnapshot;
        const snapshot = buildLifecycleEvaluationSnapshot({
          skillName,
          stage: "post_create",
          promptEvaluation,
          skillAnalysis,
          previousSnapshot,
        });
        return persistEvaluation(snapshot);
      } catch (error) {
        set({
          evaluationError: formatSkillEvaluationError(
            "作成直後の評価に失敗",
            error,
          ),
          isEvaluatingLifecycle: false,
        });
        return null;
      }
    },

    evaluatePostExecute: async ({
      skillName,
      prompt,
      skillAnalysis,
      status,
      messages,
      permissionPending = false,
    }) => {
      set({
        isEvaluatingLifecycle: true,
        evaluationError: null,
        latestPromptRequest: prompt.trim(),
      });

      try {
        const promptEvaluation = await resolvePromptEvaluation(prompt);
        const executionQuality = buildExecutionQualityEvaluation({
          status,
          messages,
          permissionPending,
        });
        const previousSnapshot = get().latestEvaluationSnapshot;
        const snapshot = buildLifecycleEvaluationSnapshot({
          skillName,
          stage: "post_execute",
          promptEvaluation,
          skillAnalysis,
          executionQuality,
          previousSnapshot,
        });
        return persistEvaluation(snapshot);
      } catch (error) {
        set({
          evaluationError: formatSkillEvaluationError(
            "実行後評価に失敗",
            error,
          ),
          isEvaluatingLifecycle: false,
        });
        return null;
      }
    },

    evaluatePostImprove: async ({ skillName, prompt, skillAnalysis }) => {
      set({
        isEvaluatingLifecycle: true,
        evaluationError: null,
        latestPromptRequest: prompt.trim(),
      });

      try {
        const promptEvaluation = await resolvePromptEvaluation(prompt);
        const previousSnapshot = [...get().evaluationHistory]
          .reverse()
          .find((snapshot) => snapshot.skillName === skillName);
        const snapshot = buildLifecycleEvaluationSnapshot({
          skillName,
          stage: "post_improve",
          promptEvaluation,
          skillAnalysis,
          executionQuality: get().latestExecutionQuality,
          previousSnapshot,
        });
        return persistEvaluation(snapshot);
      } catch (error) {
        set({
          evaluationError: formatSkillEvaluationError(
            "改善後評価に失敗",
            error,
          ),
          isEvaluatingLifecycle: false,
        });
        return null;
      }
    },

    clearSkillEvaluation: () => {
      set(initialSkillEvaluationState);
    },
  };
};
