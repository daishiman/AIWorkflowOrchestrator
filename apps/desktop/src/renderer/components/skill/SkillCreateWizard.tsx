/**
 * @file SkillCreateWizard.tsx
 * @description スキル作成ウィザード統合コンポーネント
 * @task TASK-10A-C, TASK-SC-07
 */

import React, { useEffect, useState } from "react";
import {
  StepIndicator,
  DescribeStep,
  ConversationRoundStep,
  GenerateStep,
  CompleteStep,
} from "./wizard";
import type {
  GenerationMode,
  GenerationError,
  GenerationStage,
} from "./wizard";
import type {
  ConversationAnswers,
  SkillInfoFormData,
  SkillCategory,
  SmartDefaultResult,
} from "@repo/shared/types/skillCreator";
import type {
  SkillCreatorExecutePlanAck,
  RuntimeSkillCreatorExecuteErrorResponse,
  RuntimeSkillCreatorExecuteResponse,
  RuntimeSkillCreatorPlanErrorResponse,
  RuntimeSkillCreatorPlanResponse,
  SkillCreatorWorkflowUiSnapshot,
} from "@repo/shared/types";
import type { PlanResult } from "../../store/slices/agentSlice";
import { useWizardStep } from "./hooks/useWizardStep";
import {
  useCreateSkill,
  useIsSkillGenerating,
  useGenerationProgress,
  useGenerationError,
  useCurrentPlanResult,
  useCurrentPlanId,
  useSetIsSkillGenerating,
  useSetGenerationProgress,
  useSetGenerationError,
  useSetCurrentPlanResult,
  useSetCurrentPlanId,
  useClearGenerationState,
  useWorkflowSnapshot,
} from "../../store";
import { ProvenanceWarningSummary } from "./ProvenanceWarningSummary";
import { useStreamingProgress } from "../../hooks/useStreamingProgress";
import { useCancelGeneration } from "../../hooks/useCancelGeneration";

const STEPS = ["説明入力", "設定", "生成", "完了"];

function resolveStage(
  streamingStage: GenerationStage,
  isGenerating: boolean,
  localError: GenerationError | null,
): GenerationStage {
  if (localError && !isGenerating) return "error";
  if (streamingStage !== "idle") return streamingStage;
  if (isGenerating) return "planning";
  return "idle";
}

function bridgeLocalError(error: Error | null): GenerationError | null {
  if (!error) return null;
  return {
    code: "LLM_ERROR",
    message: error.message || "スキル生成に失敗しました",
  };
}

function bridgeGenerationError(error: string | null): GenerationError | null {
  if (!error) return null;
  return {
    code: "LLM_ERROR",
    message: error,
  };
}

// テンプレート生成で使うオプション（ConversationRoundStep 追加後も固定）
const TEMPLATE_OPTIONS = {
  generateTasks: true,
  addAgents: false,
  addReferences: false,
} as const;

const DEFAULT_ANSWERS: ConversationAnswers = {
  q1: { selectedOption: null, freeText: "" },
  q2: { selectedOption: null, freeText: "" },
  q3: { selectedOption: null, freeText: "" },
  q4: { selectedOption: null, freeText: "" },
  q5: { selectedOption: null, freeText: "" },
  q6: { selectedOption: null, freeText: "" },
};

const DEFAULT_SMART_DEFAULTS: SmartDefaultResult = {
  who: null,
  input: null,
  timing: null,
  output: null,
  tool: null,
  format: null,
};

function inferSmartDefaults(data: {
  purpose: string;
  category: SkillCategory | null;
}): SmartDefaultResult {
  const text = data.purpose.toLowerCase();
  const defaults: SmartDefaultResult = {
    who: null,
    input: null,
    timing: null,
    output: null,
    tool: null,
    format: null,
  };

  if (text.includes("自分")) {
    defaults.who = "自分のみ";
  } else if (
    text.includes("チーム") ||
    data.category === "external-integration"
  ) {
    defaults.who = "チームメンバー";
  } else if (text.includes("社内")) {
    defaults.who = "社内全体";
  } else if (text.includes("外部")) {
    defaults.who = "外部ユーザー";
  }

  if (text.includes("ファイル")) {
    defaults.input = "ファイル";
  } else if (text.includes("url") || text.includes("リンク")) {
    defaults.input = "URLリンク";
  } else if (text.includes("json") || text.includes("構造化")) {
    defaults.input = "構造化データ";
  } else if (text.includes("テキスト")) {
    defaults.input = "テキスト";
  }

  if (
    text.includes("毎日") ||
    text.includes("毎週") ||
    text.includes("定期") ||
    text.includes("スケジュール")
  ) {
    defaults.timing = "定期実行";
  } else if (text.includes("イベント")) {
    defaults.timing = "イベント駆動";
  } else if (text.includes("手動")) {
    defaults.timing = "手動実行";
  }

  if (text.includes("通知") || text.includes("アラート")) {
    defaults.output = "通知";
  } else if (text.includes("返信") || text.includes("チャット")) {
    defaults.output = "チャット返信";
  } else if (text.includes("保存")) {
    defaults.output = "ファイル保存";
  } else if (text.includes("ツール")) {
    defaults.output = "外部ツール";
  }

  if (text.includes("slack")) {
    defaults.tool = "Slack";
  } else if (text.includes("github")) {
    defaults.tool = "GitHub";
  } else if (text.includes("その他")) {
    defaults.tool = "その他";
  }

  if (text.includes("json")) {
    defaults.format = "JSON";
  } else if (text.includes("箇条書き") || text.includes("リスト")) {
    defaults.format = "箇条書き";
  } else if (
    text.includes("表") ||
    text.includes("markdown") ||
    text.includes("レポート")
  ) {
    defaults.format = "Markdown";
  }

  return defaults;
}

type SkillCreatorRuntimeApi = {
  planSkill?: (
    prompt: string,
    authMode?: string,
    apiKey?: string,
  ) => Promise<{
    success: boolean;
    data?: RuntimeSkillCreatorPlanResponse;
    error?: string;
  }>;
  executePlan?: (
    planId: string,
    skillSpec: string,
    authMode?: string,
    apiKey?: string,
  ) => Promise<{
    success: boolean;
    data?: SkillCreatorExecutePlanAck | RuntimeSkillCreatorExecuteResponse;
    error?: string;
  }>;
  getWorkflowState?: (planId: string) => Promise<{
    success: boolean;
    data?: SkillCreatorWorkflowUiSnapshot;
    error?: string;
  }>;
};

function isRuntimePlanErrorResponse(
  response: unknown,
): response is RuntimeSkillCreatorPlanErrorResponse {
  if (!response || typeof response !== "object") {
    return false;
  }
  if (!("success" in response) || response.success !== false) {
    return false;
  }
  if (!("error" in response) || !response.error) {
    return false;
  }
  return (
    typeof response.error === "object" &&
    "message" in response.error &&
    typeof response.error.message === "string"
  );
}

function isExecuteTerminalHandoff(
  response: RuntimeSkillCreatorExecuteResponse,
): response is Extract<
  RuntimeSkillCreatorExecuteResponse,
  { type: "terminal_handoff" }
> {
  return "type" in response && response.type === "terminal_handoff";
}

function isExecuteErrorResponse(
  response: RuntimeSkillCreatorExecuteResponse,
): response is RuntimeSkillCreatorExecuteErrorResponse {
  return (
    "success" in response &&
    response.success === false &&
    typeof response.error === "object" &&
    response.error !== null &&
    "message" in response.error &&
    typeof response.error.message === "string"
  );
}

function isExecutePlanAck(
  response: unknown,
): response is SkillCreatorExecutePlanAck {
  return (
    !!response &&
    typeof response === "object" &&
    "accepted" in response &&
    (response as { accepted: unknown }).accepted === true &&
    "planId" in response &&
    typeof (response as { planId: unknown }).planId === "string"
  );
}

function getWorkflowFailureMessage(
  snapshot: SkillCreatorWorkflowUiSnapshot | null | undefined,
): string | null {
  if (!snapshot?.verifyResult || snapshot.verifyResult.status !== "fail") {
    return null;
  }

  return snapshot.verifyResult.message ?? "スキル生成に失敗しました";
}

function toPlanResult(
  response: RuntimeSkillCreatorPlanResponse,
): PlanResult | null {
  if ("type" in response && response.type === "terminal_handoff") {
    return {
      type: "terminal_handoff",
      guidance: response.guidance,
    };
  }
  if ("success" in response && response.success === false) {
    return null;
  }
  if (!("planId" in response)) {
    return null;
  }
  return {
    type: "integrated_api",
    planId: response.planId,
    estimatedSteps: response.estimatedSteps,
  };
}

const getSkillCreatorApi = (): SkillCreatorRuntimeApi => {
  const api = (window as Window & { skillCreatorAPI?: SkillCreatorRuntimeApi })
    .skillCreatorAPI;
  return api ?? {};
};

export interface SkillCreateWizardProps {
  onClose: () => void;
}

export const SkillCreateWizard = React.forwardRef<
  HTMLDivElement,
  SkillCreateWizardProps
>(({ onClose }, ref) => {
  const { currentStep, goNext, goBack, goToStep } = useWizardStep(STEPS.length);
  const createSkill = useCreateSkill();
  const streaming = useStreamingProgress();
  const { cancelGeneration } = useCancelGeneration();

  // Existing local state
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<SkillCategory | null>(null);
  const [answers, setAnswers] = useState<ConversationAnswers>(DEFAULT_ANSWERS);
  const [smartDefaults, setSmartDefaults] = useState<SmartDefaultResult>(
    DEFAULT_SMART_DEFAULTS,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [skillPath, setSkillPath] = useState<string | null>(null);

  // TASK-SC-07: LLM generation state
  const [generationMode, setGenerationMode] =
    useState<GenerationMode>("template");
  const [localPlanResult, setLocalPlanResult] = useState<PlanResult | null>(
    null,
  );

  // Store hooks (TASK-SC-07)
  const isSkillGenerating = useIsSkillGenerating();
  const generationProgress = useGenerationProgress();
  const generationError = useGenerationError();
  const storePlanResult = useCurrentPlanResult();
  const storePlanId = useCurrentPlanId();
  const setStoreIsGenerating = useSetIsSkillGenerating();
  const setStoreGenerationProgress = useSetGenerationProgress();
  const setStoreGenerationError = useSetGenerationError();
  const setCurrentPlanResult = useSetCurrentPlanResult();
  const setCurrentPlanId = useSetCurrentPlanId();
  const clearGenerationState = useClearGenerationState();
  const workflowSnapshot = useWorkflowSnapshot();

  // TASK-SC-07: Cleanup store on unmount (P3)
  useEffect(() => {
    return () => {
      clearGenerationState();
    };
  }, [clearGenerationState]);

  const clearPlanExecutionState = () => {
    setLocalPlanResult(null);
    setCurrentPlanResult(null);
    setCurrentPlanId(null);
  };

  // Existing template generation handler
  const handleGenerate = async () => {
    goToStep(2);
    setIsGenerating(true);
    setError(null);
    try {
      const path = await createSkill(description, TEMPLATE_OPTIONS);
      if (path) {
        setSkillPath(path);
        goToStep(3);
      } else {
        setError(new Error("スキル生成に失敗しました"));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("スキル生成に失敗しました"),
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // TASK-SC-07: LLM plan generation (AC-2)
  const handleLlmGenerate = async () => {
    if (!description.trim()) return;
    if (isSkillGenerating) return;
    goToStep(2);
    setStoreIsGenerating(true);
    setStoreGenerationProgress("計画を生成中...");
    setStoreGenerationError(null);
    try {
      const api = getSkillCreatorApi();
      if (!api.planSkill) {
        throw new Error("planSkill API が利用できません");
      }
      const result = await api.planSkill(description);
      if (result.success && result.data) {
        // TASK-RT-02: plan logical error の検出（UT-RT-02-M03: SkillLifecyclePanel とパリティ統一）
        const data = result.data;
        if (isRuntimePlanErrorResponse(data)) {
          clearPlanExecutionState();
          setStoreGenerationError(data.error.message);
          return;
        }
        const normalizedPlan = toPlanResult(data);
        if (!normalizedPlan) {
          clearPlanExecutionState();
          setStoreGenerationError("計画レスポンスの形式が不正です");
          return;
        }
        setLocalPlanResult(normalizedPlan);
        setCurrentPlanResult(normalizedPlan);
        if (normalizedPlan.planId) {
          setCurrentPlanId(normalizedPlan.planId);
        }
      } else {
        clearPlanExecutionState();
        setStoreGenerationError(result.error ?? "計画生成に失敗しました");
      }
    } catch (err) {
      clearPlanExecutionState();
      setStoreGenerationError(
        err instanceof Error ? err.message : "計画生成に失敗しました",
      );
    } finally {
      setStoreIsGenerating(false);
      setStoreGenerationProgress(null);
    }
  };

  // TASK-SC-07: Execute plan (AC-4, AC-10)
  const handleExecutePlan = async () => {
    if (!storePlanId || !localPlanResult) return;
    setStoreIsGenerating(true);
    setStoreGenerationError(null);
    try {
      const api = getSkillCreatorApi();
      if (!api.executePlan) {
        throw new Error("executePlan API が利用できません");
      }
      const result = await api.executePlan(storePlanId, description);
      if (result.success && result.data) {
        if (isExecutePlanAck(result.data)) {
          if (api.getWorkflowState) {
            try {
              const snapshotResult = await api.getWorkflowState(storePlanId);
              if (
                snapshotResult.success &&
                snapshotResult.data?.handoffBundle
              ) {
                setStoreGenerationError(
                  `ターミナル実行が必要です: ${snapshotResult.data.handoffBundle.suggestedCommand}`,
                );
                return;
              }
              const failureMessage = getWorkflowFailureMessage(
                snapshotResult.success ? snapshotResult.data : null,
              );
              if (failureMessage) {
                setStoreGenerationError(failureMessage);
                return;
              }
            } catch {
              // ack 受理後の snapshot 取得失敗は最終遷移を妨げない
            }
          }
          setSkillPath(null);
          setLocalPlanResult(null);
          clearGenerationState();
          goToStep(3);
          return;
        }
        if (isExecuteTerminalHandoff(result.data)) {
          setStoreGenerationError(
            `ターミナル実行が必要です: ${result.data.bundle.suggestedCommand}`,
          );
          return;
        }
        if (isExecuteErrorResponse(result.data)) {
          setStoreGenerationError(result.data.error.message);
          return;
        }
        if (!result.data.success) {
          setStoreGenerationError(
            result.data.error ?? "スキル生成に失敗しました",
          );
          return;
        }
        setSkillPath(null);
        setLocalPlanResult(null);
        clearGenerationState();
        goToStep(3);
      } else {
        setStoreGenerationError(result.error ?? "スキル生成に失敗しました");
      }
    } catch (err) {
      setStoreGenerationError(
        err instanceof Error ? err.message : "スキル生成に失敗しました",
      );
    } finally {
      setStoreIsGenerating(false);
    }
  };

  // TASK-SC-07: Cancel plan (AC-5, AC-10)
  const handleCancelPlan = () => {
    setLocalPlanResult(null);
    clearGenerationState();
    goToStep(0);
  };

  // TASK-SC-07: Route DescribeStep onNext based on mode (AC-2, AC-8)
  const handleDescribeNext = () => {
    if (generationMode === "llm") {
      void handleLlmGenerate();
    } else {
      setSmartDefaults(inferSmartDefaults({ purpose: description, category }));
      goNext();
    }
  };

  const activePlanResult = localPlanResult ?? storePlanResult;
  const llmError = bridgeGenerationError(generationError);
  const templateError = streaming.error ?? bridgeLocalError(error);
  const resolvedStage =
    generationMode === "llm"
      ? resolveStage("idle", isSkillGenerating, llmError)
      : resolveStage(streaming.stage, isGenerating, templateError);
  const resolvedPercent =
    generationMode === "llm" ? (isSkillGenerating ? 25 : 0) : streaming.percent;
  const resolvedMessage =
    generationMode === "llm" ? (generationProgress ?? "") : streaming.message;
  const resolvedPreview =
    generationMode === "llm" ? null : streaming.previewContent;
  const resolvedError = generationMode === "llm" ? llmError : templateError;

  return (
    <div
      ref={ref}
      data-testid="skill-create-wizard"
      data-route-kind="destination"
      data-step={currentStep}
      className="flex flex-col gap-6 p-6"
    >
      <ProvenanceWarningSummary
        sourceProvenance={workflowSnapshot?.sourceProvenance ?? null}
      />
      <StepIndicator steps={STEPS} currentStep={currentStep} />
      {currentStep === 0 && (
        <div data-testid="wizard-step-describe">
          <DescribeStep
            description={description}
            onDescriptionChange={setDescription}
            category={category}
            onCategoryChange={setCategory}
            generationMode={generationMode}
            onGenerationModeChange={setGenerationMode}
            onNext={handleDescribeNext}
          />
        </div>
      )}
      {currentStep === 1 && (
        <div data-testid="wizard-step-conversation-round">
          <ConversationRoundStep
            formData={{ purpose: description, category } as SkillInfoFormData}
            smartDefaults={smartDefaults}
            answers={answers}
            onAnswersChange={setAnswers}
            onBack={goBack}
            onGenerate={() => void handleGenerate()}
          />
        </div>
      )}
      {currentStep === 2 && (
        <div data-testid="wizard-step-generate">
          <GenerateStep
            stage={resolvedStage}
            percent={resolvedPercent}
            message={resolvedMessage}
            previewContent={resolvedPreview}
            error={resolvedError}
            generationMode={generationMode}
            generationProgress={
              generationMode === "llm" ? generationProgress : null
            }
            isGenerating={
              generationMode === "llm"
                ? isSkillGenerating
                : isGenerating || streaming.isGenerating
            }
            planResult={generationMode === "llm" ? activePlanResult : null}
            onExecutePlan={
              generationMode === "llm" ? handleExecutePlan : undefined
            }
            onCancelPlan={
              generationMode === "llm" ? handleCancelPlan : undefined
            }
            onCancel={
              generationMode === "template" ? cancelGeneration : undefined
            }
            onRetry={generationMode === "template" ? handleGenerate : undefined}
          />
        </div>
      )}
      {currentStep === 3 && (
        <div data-testid="wizard-step-complete">
          <CompleteStep skillPath={skillPath} onClose={onClose} />
        </div>
      )}
    </div>
  );
});
SkillCreateWizard.displayName = "SkillCreateWizard";
