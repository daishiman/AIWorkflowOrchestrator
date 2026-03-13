import type { SkillExecutionStatus, SkillStreamMessage } from "@repo/shared";
import type {
  EvaluationStage,
  ExecutionQualityEvaluation,
  GateStatus,
  LifecycleEvaluationSnapshot,
  LifecycleGateDecision,
  LifecycleNextSurface,
} from "@repo/shared/types";
import type {
  PromptEvaluation,
  SkillAnalysis,
} from "@repo/shared/types/skill-improver";

export const LIFECYCLE_SCORE_THRESHOLDS = {
  warning: 60,
  ready: 80,
  hardBlock: 70,
} as const;

export const LIFECYCLE_STAGE_WEIGHTS: Record<
  EvaluationStage,
  { prompt: number; skill: number; execution: number }
> = {
  draft: { prompt: 100, skill: 0, execution: 0 },
  post_create: { prompt: 35, skill: 65, execution: 0 },
  post_execute: { prompt: 20, skill: 40, execution: 40 },
  post_improve: { prompt: 20, skill: 50, execution: 30 },
};

export interface LifecycleEvaluationInput {
  skillName: string;
  stage: EvaluationStage;
  promptEvaluation?: PromptEvaluation | null;
  skillAnalysis?: SkillAnalysis | null;
  executionQuality?: ExecutionQualityEvaluation | null;
  previousSnapshot?: LifecycleEvaluationSnapshot | null;
  createdAt?: string;
}

export interface ExecutionQualityContext {
  status: SkillExecutionStatus | null;
  messages: SkillStreamMessage[];
  permissionPending?: boolean;
}

export function buildExecutionQualityEvaluation(
  context: ExecutionQualityContext,
): ExecutionQualityEvaluation {
  const { status, messages, permissionPending = false } = context;
  const assistantMessages = messages.filter(
    (message) => message.type === "assistant",
  );
  const toolUseCount = messages.filter(
    (message) => message.type === "tool_use",
  ).length;
  const toolErrorCount = messages.filter(
    (message) => message.type === "tool_result" && !message.content.success,
  ).length;
  const hasErrorMessage = messages.some((message) => message.type === "error");
  const hasPartialAssistant = assistantMessages.some(
    (message) => message.content.isPartial,
  );

  let reliability = 60;
  if (status === "completed") reliability = 90;
  if (status === "permission_pending") reliability = 58;
  if (status === "cancelled") reliability = 48;
  if (status === "error") reliability = 34;

  let resultClarity = assistantMessages.length > 0 ? 84 : 52;
  if (toolErrorCount > 0 || hasErrorMessage) {
    resultClarity = 42;
  }
  if (hasPartialAssistant && status !== "completed") {
    resultClarity = Math.min(resultClarity, 56);
  }

  let permissionSafety = permissionPending ? 64 : 86;
  if (toolErrorCount > 0 && permissionPending) {
    permissionSafety = 58;
  }

  let retryReadiness = status === "completed" ? 82 : 52;
  if (toolUseCount > 0 && !hasErrorMessage) {
    retryReadiness = Math.max(retryReadiness, 68);
  }
  if (status === "error") {
    retryReadiness = toolUseCount > 0 ? 60 : 44;
  }

  const score = Math.round(
    reliability * 0.35 +
      resultClarity * 0.25 +
      permissionSafety * 0.25 +
      retryReadiness * 0.15,
  );

  const evidence: string[] = [];
  if (status) evidence.push(`status:${status}`);
  if (assistantMessages.length > 0) {
    evidence.push(`assistant_messages:${assistantMessages.length}`);
  }
  if (toolUseCount > 0) evidence.push(`tool_use:${toolUseCount}`);
  if (toolErrorCount > 0) evidence.push(`tool_errors:${toolErrorCount}`);
  if (permissionPending) evidence.push("permission_pending");

  return {
    score,
    reliability,
    resultClarity,
    permissionSafety,
    retryReadiness,
    evidence,
  };
}

export function calculateLifecycleTotalScore(
  stage: EvaluationStage,
  promptEvaluation?: PromptEvaluation | null,
  skillAnalysis?: SkillAnalysis | null,
  executionQuality?: ExecutionQualityEvaluation | null,
): number {
  const weights = LIFECYCLE_STAGE_WEIGHTS[stage];
  const weightedScores = [
    promptEvaluation
      ? { score: promptEvaluation.score, weight: weights.prompt }
      : null,
    skillAnalysis
      ? { score: skillAnalysis.overallScore, weight: weights.skill }
      : null,
    executionQuality
      ? { score: executionQuality.score, weight: weights.execution }
      : null,
  ].filter(
    (
      value,
    ): value is {
      score: number;
      weight: number;
    } => value !== null && value.weight > 0,
  );

  if (weightedScores.length === 0) {
    return 0;
  }

  const totalWeight = weightedScores.reduce(
    (sum, item) => sum + item.weight,
    0,
  );
  const totalScore = weightedScores.reduce(
    (sum, item) => sum + item.score * item.weight,
    0,
  );

  return Math.round(totalScore / totalWeight);
}

export function detectLifecycleHardBlocks(
  promptEvaluation?: PromptEvaluation | null,
  skillAnalysis?: SkillAnalysis | null,
  executionQuality?: ExecutionQualityEvaluation | null,
): string[] {
  const hardBlocks: string[] = [];

  if (
    typeof promptEvaluation?.breakdown?.security === "number" &&
    promptEvaluation.breakdown.security < LIFECYCLE_SCORE_THRESHOLDS.hardBlock
  ) {
    hardBlocks.push("prompt security が閾値を下回っています。");
  }

  if (skillAnalysis?.risks.some((risk) => risk.level === "critical")) {
    hardBlocks.push("critical risk が残っているため利用できません。");
  }

  if (
    executionQuality &&
    executionQuality.permissionSafety < LIFECYCLE_SCORE_THRESHOLDS.hardBlock
  ) {
    hardBlocks.push("permission 境界が不足しているため再評価が必要です。");
  }

  if (
    executionQuality &&
    executionQuality.reliability < LIFECYCLE_SCORE_THRESHOLDS.warning &&
    executionQuality.retryReadiness < LIFECYCLE_SCORE_THRESHOLDS.hardBlock
  ) {
    hardBlocks.push("実行失敗時の再試行根拠が不足しています。");
  }

  return hardBlocks;
}

function resolveNextSurface(
  status: GateStatus,
  stage: EvaluationStage,
): LifecycleNextSurface {
  switch (status) {
    case "revise_required":
      return "skillCreator";
    case "save_with_warning":
      return "skillCenter";
    case "use_with_warning":
      return "agent";
    case "recommended":
      return "workspace";
    case "use_ready":
    default:
      return stage === "post_execute" ? "agent" : "workspace";
  }
}

export function buildLifecycleGateDecision(
  snapshot: LifecycleEvaluationSnapshot,
): LifecycleGateDecision {
  const { hardBlocks, totalScore, stage, deltaFromPrevious } = snapshot;

  let status: GateStatus;
  if (
    hardBlocks.length > 0 ||
    totalScore < LIFECYCLE_SCORE_THRESHOLDS.warning
  ) {
    status = "revise_required";
  } else if (
    stage === "post_improve" &&
    typeof deltaFromPrevious === "number" &&
    deltaFromPrevious > 0 &&
    totalScore >= LIFECYCLE_SCORE_THRESHOLDS.ready
  ) {
    status = "recommended";
  } else if (
    stage === "post_execute" &&
    totalScore < LIFECYCLE_SCORE_THRESHOLDS.ready
  ) {
    status = "use_with_warning";
  } else if (totalScore < LIFECYCLE_SCORE_THRESHOLDS.ready) {
    status = "save_with_warning";
  } else {
    status = "use_ready";
  }

  const summary = (() => {
    switch (status) {
      case "revise_required":
        return hardBlocks.length > 0
          ? "hard block があるため改善が必要です。"
          : "総合スコアが基準未満のため改善が必要です。";
      case "save_with_warning":
        return "保存は可能ですが、改善余地が残っています。";
      case "use_with_warning":
        return "利用は可能ですが、警告付きでの継続になります。";
      case "recommended":
        return "改善効果が確認できたため推奨利用に進めます。";
      case "use_ready":
      default:
        return "品質ゲートを通過しました。利用に進めます。";
    }
  })();

  return {
    stage,
    status,
    nextSurface: resolveNextSurface(status, stage),
    summary,
    blockingIssues: hardBlocks,
    totalScore,
    recommended: status === "recommended",
  };
}

export function buildLifecycleEvaluationSnapshot(
  input: LifecycleEvaluationInput,
): LifecycleEvaluationSnapshot {
  const totalScore = calculateLifecycleTotalScore(
    input.stage,
    input.promptEvaluation,
    input.skillAnalysis,
    input.executionQuality,
  );
  const hardBlocks = detectLifecycleHardBlocks(
    input.promptEvaluation,
    input.skillAnalysis,
    input.executionQuality,
  );

  return {
    skillName: input.skillName,
    stage: input.stage,
    promptEvaluation: input.promptEvaluation ?? undefined,
    skillAnalysis: input.skillAnalysis ?? undefined,
    executionQuality: input.executionQuality ?? undefined,
    totalScore,
    hardBlocks,
    deltaFromPrevious:
      input.previousSnapshot &&
      input.previousSnapshot.skillName === input.skillName
        ? totalScore - input.previousSnapshot.totalScore
        : undefined,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

export function getLifecycleGateLabel(status: GateStatus): string {
  switch (status) {
    case "revise_required":
      return "改善必須";
    case "save_with_warning":
      return "保存可・警告あり";
    case "use_with_warning":
      return "利用可・警告あり";
    case "recommended":
      return "推奨";
    case "use_ready":
    default:
      return "利用可";
  }
}
