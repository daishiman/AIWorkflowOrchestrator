import type { PromptEvaluation, SkillAnalysis } from "./skill-improver";

export type EvaluationStage =
  | "draft"
  | "post_create"
  | "post_execute"
  | "post_improve";

export type GateStatus =
  | "revise_required"
  | "save_with_warning"
  | "use_with_warning"
  | "use_ready"
  | "recommended";

export type LifecycleNextSurface =
  | "skillCreator"
  | "skillCenter"
  | "workspace"
  | "agent";

export interface ExecutionQualityEvaluation {
  score: number;
  reliability: number;
  resultClarity: number;
  permissionSafety: number;
  retryReadiness: number;
  evidence: string[];
}

export interface LifecycleEvaluationSnapshot {
  skillName: string;
  stage: EvaluationStage;
  promptEvaluation?: PromptEvaluation;
  skillAnalysis?: SkillAnalysis;
  executionQuality?: ExecutionQualityEvaluation;
  totalScore: number;
  hardBlocks: string[];
  deltaFromPrevious?: number;
  createdAt: string;
}

export interface LifecycleGateDecision {
  stage: EvaluationStage;
  status: GateStatus;
  nextSurface: LifecycleNextSurface;
  summary: string;
  blockingIssues: string[];
  totalScore: number;
  recommended: boolean;
}
