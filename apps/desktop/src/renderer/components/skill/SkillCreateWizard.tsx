/**
 * @file SkillCreateWizard.tsx
 * @description スキル作成ウィザード統合コンポーネント（LLM専用フロー）
 * @task UT-SKILL-WIZARD-W2-seq-03a
 *
 * 現行フロー要約:
 * - 旧 generationMode 分岐を廃止し、LLM専用フローへ統一
 * - formData / answers / smartDefaults / generationMethod / skillPath /
 *   hasExternalIntegration / externalToolName state を追加
 * - STEPS を ["スキル情報入力","詳細設定","生成","完了"] に変更
 * - Step 0: DescribeStep の役割を SkillInfoStep に統合
 * - Step 1: ConversationRoundStep（onGenerate(method) 接続）
 * - Step 2: GenerateStep（生成進捗・再試行・キャンセル表示）
 * - Step 3: CompleteStep（skillPath / action cards / onRetry 接続）
 * - inferSmartDefaults / handleStep0Next / handleGenerate(method) /
 *   handleQualityFeedback / handleRetry を実装
 */

import React, { useEffect, useRef, useState } from "react";
import { trackEvent } from "../../utils/trackEvent";
import {
  StepIndicator,
  SkillInfoStep,
  ConversationRoundStep,
  GenerateStep,
  CompleteStep,
} from "./wizard";
import type { GenerationError, GenerationStage } from "./wizard";
import type {
  ConversationAnswers,
  SkillInfoFormData,
  SmartDefaultResult,
} from "@repo/shared/types/skillCreator";
import {
  buildSkillContext,
  resolvePrimarySkillCategory,
} from "@repo/shared/types/skillCreator";
import { useWizardStep } from "./hooks/useWizardStep";
import {
  useCreateSkill,
  useIsSkillGenerating,
  useGenerationProgress,
  useGenerationError,
  useClearGenerationState,
  useWorkflowSnapshot,
  useResetStreamingProgress,
} from "../../store";
import { ProvenanceWarningSummary } from "./ProvenanceWarningSummary";
import { useStreamingProgress } from "../../hooks/useStreamingProgress";
import { useCancelGeneration } from "../../hooks/useCancelGeneration";
import { inferSmartDefaults } from "./wizard/utils/inferSmartDefaults";
export { inferSmartDefaults } from "./wizard/utils/inferSmartDefaults";
import {
  fetchToolIntegrationInfo,
  type ExternalToolIntegration,
} from "./fetchToolIntegrationInfo";
export type { ExternalToolIntegration } from "./fetchToolIntegrationInfo";

// ────────────────────────────────────────────────────────────────────────────
// 定数
// ────────────────────────────────────────────────────────────────────────────

/** 現行ウィザードのステップ名称 */
export const STEPS = ["スキル情報入力", "詳細設定", "生成", "完了"];

/** 現行の createSkill 呼び出しオプション */
const SKILL_GENERATION_OPTIONS = {
  generateTasks: true,
  addAgents: false,
  addReferences: false,
} as const;

const DEFAULT_FORM_DATA: SkillInfoFormData = {
  skillName: "",
  purpose: "",
  category: [],
};

const DEFAULT_ANSWERS: ConversationAnswers = {
  q1: { selectedOptions: [], freeText: "" },
  q2: { selectedOptions: [], freeText: "" },
  q3: { selectedOptions: [], freeText: "", scheduleConfig: undefined },
  q4: { selectedOptions: [], freeText: "" },
  q5: { selectedOptions: [], freeText: "" },
  q6: { selectedOptions: [], freeText: "" },
};

const DEFAULT_SMART_DEFAULTS: SmartDefaultResult = {
  who: null,
  input: null,
  timing: null,
  output: null,
  tool: null,
  format: null,
};

export interface MergedExternalIntegration {
  tools: ExternalToolIntegration[];
  apiEndpoints: string[];
  authMethods: string[];
  mainOperations: string[];
}

const EXTERNAL_TOOL_LABELS = {
  slack: "Slack",
  github: "GitHub",
  notion: "Notion",
} as const;

// ────────────────────────────────────────────────────────────────────────────
// ユーティリティ関数
// ────────────────────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────────────────────
// W3-seq-04: 計装ユーティリティ
// ────────────────────────────────────────────────────────────────────────────

/**
 * スキップ時に何問目でスキップしたかを回答状態から判定する。
 * 未回答の最初の設問インデックス（1始まり）を返す。全問回答済みの場合 null。
 */
const QUESTION_KEYS = [
  "q1",
  "q2",
  "q3",
  "q4",
  "q5",
  "q6",
] as const satisfies readonly (keyof ConversationAnswers)[];

function isAnswered(answer: ConversationAnswers[keyof ConversationAnswers]) {
  return (
    answer.selectedOptions.length > 0 ||
    answer.freeText.trim().length > 0 ||
    answer.scheduleConfig !== undefined
  );
}

export function resolveSkippedAtQuestion(
  answers: ConversationAnswers,
): number | null {
  const idx = QUESTION_KEYS.findIndex((k) => !isAnswered(answers[k]));
  return idx === -1 ? null : idx + 1;
}

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

export function mergeIntegrations(
  infos: ExternalToolIntegration[],
): MergedExternalIntegration {
  return {
    tools: infos,
    apiEndpoints: [...new Set(infos.flatMap((info) => info.apiEndpoints))],
    authMethods: [...new Set(infos.flatMap((info) => info.authMethods))],
    mainOperations: [...new Set(infos.flatMap((info) => info.mainOperations))],
  };
}

function defaultMergedExternalIntegration(): MergedExternalIntegration {
  return {
    tools: [],
    apiEndpoints: [],
    authMethods: [],
    mainOperations: [],
  };
}

function summarizeExternalIntegration(integration: MergedExternalIntegration): {
  hasExternalIntegration: boolean;
  externalToolName: string | null;
} {
  return {
    hasExternalIntegration: integration.tools.length > 0,
    externalToolName:
      integration.tools.length > 0
        ? integration.tools.map((tool) => tool.toolName).join(", ")
        : null,
  };
}

function normalizeExternalToolName(
  toolName: string | null | undefined,
): string {
  const trimmed = toolName?.trim() ?? "";
  if (!trimmed) {
    return "";
  }

  const normalizedKey =
    trimmed.toLowerCase() as keyof typeof EXTERNAL_TOOL_LABELS;
  return EXTERNAL_TOOL_LABELS[normalizedKey] ?? trimmed;
}

export function extractExternalToolNames(
  q5Answer: ConversationAnswers["q5"],
  smartDefaultTool: string | null,
): string[] {
  const selectedOptions = (q5Answer.selectedOptions ?? [])
    .map((option) => option.trim())
    .filter(Boolean);
  const freeText = q5Answer.freeText ?? "";
  const normalizedFreeText = normalizeExternalToolName(freeText);
  const isQ5Empty =
    selectedOptions.length === 0 && freeText.trim().length === 0;

  if (selectedOptions.includes("なし")) {
    return [];
  }

  if (isQ5Empty) {
    const fallbackTool = normalizeExternalToolName(smartDefaultTool);
    return fallbackTool && fallbackTool !== "なし" ? [fallbackTool] : [];
  }

  const toolNames = new Set<string>();
  for (const option of selectedOptions) {
    if (option === "その他") {
      if (normalizedFreeText) {
        toolNames.add(normalizedFreeText);
      }
      continue;
    }

    if (option !== "なし") {
      toolNames.add(normalizeExternalToolName(option));
    }
  }

  if (selectedOptions.length === 0 && normalizedFreeText) {
    toolNames.add(normalizedFreeText);
  }

  return [...toolNames];
}

export async function resolveExternalIntegration(
  toolNames: string[],
): Promise<MergedExternalIntegration> {
  const normalizedToolNames = [
    ...new Set(
      toolNames
        .map((name) => normalizeExternalToolName(name))
        .filter((name) => name !== "" && name !== "なし" && name !== "その他"),
    ),
  ];

  if (normalizedToolNames.length === 0) {
    return defaultMergedExternalIntegration();
  }

  const results = await Promise.all(
    normalizedToolNames.map(async (toolName) => {
      try {
        return await fetchToolIntegrationInfo(toolName);
      } catch {
        return null;
      }
    }),
  );

  return mergeIntegrations(
    results.filter(
      (integration): integration is ExternalToolIntegration =>
        integration !== null,
    ),
  );
}

// ────────────────────────────────────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────────────────────────────────────

export interface SkillCreateWizardProps {
  onClose: () => void;
  source?: "lifecycle_panel" | "direct";
  isTemplateMode?: boolean;
}

export const SkillCreateWizard = React.forwardRef<
  HTMLDivElement,
  SkillCreateWizardProps
>(({ onClose: _onClose, source, isTemplateMode = false }, ref) => {
  const { currentStep, goNext, goBack, goToStep } = useWizardStep(STEPS.length);
  const createSkill = useCreateSkill();
  const streaming = useStreamingProgress();
  const { cancelGeneration } = useCancelGeneration();
  const workflowSnapshot = useWorkflowSnapshot();
  const clearGenerationState = useClearGenerationState();
  const resetStreamingProgress = useResetStreamingProgress();
  const isSkillGenerating = useIsSkillGenerating();
  const generationProgress = useGenerationProgress();
  const generationError = useGenerationError();
  const generationLockRef = useRef(false);
  const generationRequestIdRef = useRef(0);
  // W3-seq-04: abandon 制御 ref（P-5）
  const wizardCompletedRef = useRef(false);
  const currentStepRef = useRef(0);

  // ── 現行 state ──────────────────────────────────────────────────────────
  const [formData, setFormData] =
    useState<SkillInfoFormData>(DEFAULT_FORM_DATA);
  const [answers, setAnswers] = useState<ConversationAnswers>(DEFAULT_ANSWERS);
  const [smartDefaults, setSmartDefaults] = useState<SmartDefaultResult | null>(
    null,
  );
  const [generationMethod, setGenerationMethod] = useState<"complete" | "skip">(
    "complete",
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [skillPath, setSkillPath] = useState<string | null>(null);
  const [hasExternalIntegration, setHasExternalIntegration] = useState(false);
  const [externalToolName, setExternalToolName] = useState<string | null>(null);

  // W3-seq-04 計装 1: ウィザード起動・開封イベント（AC-01 / P-1）
  useEffect(() => {
    trackEvent("skill_wizard_started", {});
    trackEvent("skill_wizard_open", { source: source ?? "direct" });
  }, []);

  // W3-seq-04: currentStep を useRef で追跡（アンマウント時クロージャ問題回避）
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  // 問題18修正: q5 変更後に hasExternalIntegration / externalToolName を再計算する
  useEffect(() => {
    const toolNames = extractExternalToolNames(
      answers.q5,
      smartDefaults?.tool ?? null,
    );

    if (toolNames.length === 0) {
      setHasExternalIntegration(false);
      setExternalToolName(null);
      return;
    }

    let isStale = false;
    void resolveExternalIntegration(toolNames).then((integration) => {
      if (isStale) {
        return;
      }
      const summary = summarizeExternalIntegration(integration);
      setHasExternalIntegration(summary.hasExternalIntegration);
      setExternalToolName(summary.externalToolName);
    });

    return () => {
      isStale = true;
    };
    // q5 本体と smartDefaults.tool の変化時だけ再計算する。
  }, [answers.q5, smartDefaults?.tool]);
  const invalidateGenerationRequests = () => {
    generationRequestIdRef.current += 1;
  };
  // アンマウント時にリクエストを無効化・abandon 発火（P-5）
  useEffect(() => {
    return () => {
      generationRequestIdRef.current += 1;
      generationLockRef.current = false;
      if (!wizardCompletedRef.current) {
        trackEvent("skill_wizard_abandon", {
          lastStep: currentStepRef.current,
        });
      }
    };
  }, []);

  // ── ハンドラ ───────────────────────────────────────────────────────────

  const resetGeneratedState = (preserveFormData: boolean) => {
    invalidateGenerationRequests();
    resetStreamingProgress();
    if (!preserveFormData) {
      setFormData(DEFAULT_FORM_DATA);
    }
    setAnswers(DEFAULT_ANSWERS);
    setSmartDefaults(null);
    setGenerationMethod("complete");
    setIsGenerating(false);
    setError(null);
    setSkillPath(null);
    setHasExternalIntegration(false);
    setExternalToolName(null);
    generationLockRef.current = false;
    wizardCompletedRef.current = false;
    clearGenerationState();
  };

  /**
   * Step 0 → Step 1 遷移。formData からスマートデフォルトを推論して保存する。
   */
  const handleStep0Next = async () => {
    const defaults = inferSmartDefaults(formData);
    setSmartDefaults(defaults);
    const toolNames = extractExternalToolNames(answers.q5, defaults.tool);
    const integration = await resolveExternalIntegration(toolNames);
    const summary = summarizeExternalIntegration(integration);
    setHasExternalIntegration(summary.hasExternalIntegration);
    setExternalToolName(summary.externalToolName);
    trackEvent("skill_wizard_step_complete", { step: 0, stepName: STEPS[0] });
    goNext();
  };

  /**
   * LLM 生成を起動する。"complete" はフル生成、"skip" は即時生成。
   * 現行は createSkill バックエンドを使用。
   */
  const handleGenerate = async (method: "complete" | "skip") => {
    if (
      generationLockRef.current ||
      isGenerating ||
      isSkillGenerating ||
      streaming.isGenerating
    ) {
      return;
    }

    // W3-seq-04 計装 2: Step 1 完了イベント（AC-02）
    trackEvent("skill_wizard_step1_completed", {
      method,
      skippedAtQuestion:
        method === "skip" ? resolveSkippedAtQuestion(answers) : null,
    });
    trackEvent("skill_wizard_step_complete", { step: 1, stepName: STEPS[1] });

    generationLockRef.current = true;
    invalidateGenerationRequests();
    const requestId = generationRequestIdRef.current;
    const defaults = smartDefaults ?? inferSmartDefaults(formData);
    if (!smartDefaults) {
      setSmartDefaults(defaults);
    }
    const toolNames = extractExternalToolNames(answers.q5, defaults.tool);
    const integration = await resolveExternalIntegration(toolNames);

    clearGenerationState();
    resetStreamingProgress();
    setGenerationMethod(method);
    setSkillPath(null);
    goToStep(2);
    setIsGenerating(true);
    setError(null);

    try {
      const skillContext = buildSkillContext(formData, answers);
      const path = await createSkill(
        formData.purpose,
        SKILL_GENERATION_OPTIONS,
        skillContext,
      );
      if (requestId !== generationRequestIdRef.current) {
        return;
      }
      if (!path) {
        setError(new Error("スキル生成に失敗しました"));
        return;
      }
      setSkillPath(path);
      const hasExt = integration.tools.length > 0;
      const summary = summarizeExternalIntegration(integration);
      setHasExternalIntegration(summary.hasExternalIntegration);
      setExternalToolName(summary.externalToolName);

      // W3-seq-04 計装 3: 生成完了イベント（AC-03）—失敗時は発火しない
      trackEvent("skill_wizard_generation_completed", {
        method,
        category: resolvePrimarySkillCategory(formData.category) ?? "other",
        hasExternalIntegration: hasExt,
      });
      wizardCompletedRef.current = true;
      trackEvent("skill_wizard_step_complete", { step: 2, stepName: STEPS[2] });

      goToStep(3);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("スキル生成に失敗しました"),
      );
    } finally {
      // 問題19修正: 正常完了・エラー・キャンセルの全経路でロックを必ず解放する
      generationLockRef.current = false;
      if (requestId === generationRequestIdRef.current) {
        setIsGenerating(false);
        generationLockRef.current = false;
      }
    }
  };

  /**
   * 品質フィードバックを受信する。W3-seq-04 計装 4（AC-04）。
   */
  const handleQualityFeedback = (satisfied: boolean) => {
    trackEvent("skill_skeleton_quality_feedback", {
      satisfied,
      generationMethod,
    });
  };

  /**
   * 👎 から Step 0 へ復帰。前回入力（formData）は保持し、生成結果関連 state を初期化する。
   */
  const handleRetry = () => {
    resetGeneratedState(true);
    goToStep(0);
  };

  /** 生成をキャンセルして Step 0 に戻る */
  const handleCancelGeneration = () => {
    cancelGeneration();
    resetGeneratedState(true);
    goToStep(0);
  };

  /** 今すぐ実行する → ウィザードを閉じる（W3-seq-04 計装 5: AC-05） */
  const handleExecuteNow = () => {
    _onClose();
  };

  /** エディタで開く → ウィザードを閉じる（W3-seq-04 計装 5: AC-05） */
  const handleOpenInEditor = () => {
    _onClose();
  };

  /** 別のスキルを作る → Step 0 復帰（W3-seq-04 計装 5: AC-05） */
  const handleCreateAnother = () => {
    resetGeneratedState(false);
    goToStep(0);
  };

  // ── GenerateStep 用 props 計算 ───────────────────────────────────────

  const resolvedStage = resolveStage(
    streaming.stage,
    isGenerating || isSkillGenerating,
    bridgeLocalError(error),
  );
  const resolvedPercent = streaming.percent;
  const resolvedMessage = streaming.message || generationProgress || "";
  const resolvedPreview = streaming.previewContent;
  const resolvedError =
    bridgeLocalError(error) ?? bridgeGenerationError(generationError);

  // ── レンダリング ──────────────────────────────────────────────────────

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

      {/* Step 0: スキル情報入力（LLM専用フロー） */}
      {currentStep === 0 && (
        <div data-testid="wizard-step-info">
          <SkillInfoStep
            formData={formData}
            onFormDataChange={setFormData}
            onNext={handleStep0Next}
          />
        </div>
      )}

      {/* Step 1: 詳細設定（ConversationRoundStep） */}
      {currentStep === 1 && (
        <div data-testid="wizard-step-conversation-round">
          <ConversationRoundStep
            formData={formData}
            smartDefaults={smartDefaults ?? DEFAULT_SMART_DEFAULTS}
            answers={answers}
            onAnswersChange={setAnswers}
            onBack={goBack}
            onGenerate={handleGenerate}
          />
        </div>
      )}

      {/* Step 2: 生成中（GenerateStep） */}
      {currentStep === 2 && (
        <div data-testid="wizard-step-generate">
          <GenerateStep
            stage={resolvedStage}
            percent={resolvedPercent}
            message={resolvedMessage}
            previewContent={resolvedPreview}
            error={resolvedError}
            isTemplateMode={isTemplateMode}
            isGenerating={
              isGenerating || isSkillGenerating || streaming.isGenerating
            }
            onCancel={handleCancelGeneration}
            onRetry={() => void handleGenerate(generationMethod)}
            generationProgress={generationProgress}
          />
        </div>
      )}

      {/* Step 3: 完了（CompleteStep）— skillPath / action cards / onRetry 接続 */}
      {currentStep === 3 && (
        <div data-testid="wizard-step-complete">
          <CompleteStep
            skillPath={skillPath}
            hasExternalIntegration={hasExternalIntegration}
            externalToolName={externalToolName}
            onExecuteNow={handleExecuteNow}
            onOpenInEditor={handleOpenInEditor}
            onCreateAnother={handleCreateAnother}
            onQualityFeedback={handleQualityFeedback}
            onRetry={handleRetry}
          />
        </div>
      )}
    </div>
  );
});
SkillCreateWizard.displayName = "SkillCreateWizard";
