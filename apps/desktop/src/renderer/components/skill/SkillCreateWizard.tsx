/**
 * @file SkillCreateWizard.tsx
 * @description スキル作成ウィザード統合コンポーネント
 * @task UT-SKILL-WIZARD-W2-seq-03a
 *
 * W2-seq-03a 変更:
 * - description / options / generationMode state を削除
 * - formData / answers / smartDefaults / generationMethod / skillPath /
 *   hasExternalIntegration / externalToolName state を追加
 * - STEPS を ["スキル情報入力","詳細設定","生成","完了"] に変更
 * - Step 0: DescribeStep → SkillInfoStep
 * - Step 1: ConversationRoundStep（onGenerate(method) 接続）
 * - Step 2: GenerateStep（generationMode prop 削除）
 * - Step 3: CompleteStep（skillPath / action cards / onRetry 接続）
 * - inferSmartDefaults / handleStep0Next / handleGenerate(method) /
 *   handleQualityFeedback / handleRetry を実装
 */

import React, { useEffect, useState } from "react";
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
import { useWizardStep } from "./hooks/useWizardStep";
import {
  useCreateSkill,
  useIsSkillGenerating,
  useGenerationProgress,
  useGenerationError,
  useClearGenerationState,
  useWorkflowSnapshot,
} from "../../store";
import { ProvenanceWarningSummary } from "./ProvenanceWarningSummary";
import { useStreamingProgress } from "../../hooks/useStreamingProgress";
import { useCancelGeneration } from "../../hooks/useCancelGeneration";

// ────────────────────────────────────────────────────────────────────────────
// 定数
// ────────────────────────────────────────────────────────────────────────────

/** W2-seq-03a: ステップ名称更新 */
export const STEPS = ["スキル情報入力", "詳細設定", "生成", "完了"];

/** LLM生成オプション */
const SKILL_GENERATION_OPTIONS = {
  generateTasks: true,
  addAgents: false,
  addReferences: false,
} as const;

const DEFAULT_FORM_DATA: SkillInfoFormData = {
  skillName: "",
  purpose: "",
  category: null,
};

const DEFAULT_ANSWERS: ConversationAnswers = {
  q1: { selectedOption: null, freeText: "" },
  q2: { selectedOption: null, freeText: "" },
  q3: { selectedOption: null, freeText: "", scheduleConfig: undefined },
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

// ────────────────────────────────────────────────────────────────────────────
// ユーティリティ関数
// ────────────────────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────────────────────
// inferSmartDefaults（W2-seq-03a）
// ────────────────────────────────────────────────────────────────────────────

/**
 * Step 0 の入力から Q1〜Q6 の初期値を推論する純粋関数。
 * - purpose に "Slack" → tool = "slack"
 * - purpose に "GitHub" → tool = "github"
 * - purpose に "Notion" → tool = "notion"
 * - purpose に "毎日/毎週/定期/スケジュール" → timing = "scheduled"
 * - purpose に "リアルタイム/即座/すぐに" → timing = "realtime"
 * - category === "code-support" → format = "code"
 * - category === "data-analysis" → format = "structured"
 */
export function inferSmartDefaults(
  data: SkillInfoFormData,
): SmartDefaultResult {
  const purpose = data.purpose ?? "";
  const inferenceLog: string[] = [];
  const result: SmartDefaultResult = {
    who: null,
    input: null,
    timing: null,
    output: null,
    tool: null,
    format: null,
  };

  // ツール推論（大文字小文字を区別）
  if (purpose.includes("Slack")) {
    result.tool = "slack";
    inferenceLog.push("purpose に 'Slack' を検出 → tool = 'slack'");
  } else if (purpose.includes("GitHub")) {
    result.tool = "github";
    inferenceLog.push("purpose に 'GitHub' を検出 → tool = 'github'");
  } else if (purpose.includes("Notion")) {
    result.tool = "notion";
    inferenceLog.push("purpose に 'Notion' を検出 → tool = 'notion'");
  }

  // タイミング推論
  if (/毎日|毎週|定期|スケジュール/.test(purpose)) {
    result.timing = "scheduled";
    inferenceLog.push(
      "purpose に定期実行キーワードを検出 → timing = 'scheduled'",
    );
  } else if (/リアルタイム|即座|すぐに/.test(purpose)) {
    result.timing = "realtime";
    inferenceLog.push(
      "purpose にリアルタイムキーワードを検出 → timing = 'realtime'",
    );
  }

  // フォーマット推論
  if (data.category === "code-support") {
    result.format = "code";
    inferenceLog.push("category = 'code-support' → format = 'code'");
  } else if (data.category === "data-analysis") {
    result.format = "structured";
    inferenceLog.push("category = 'data-analysis' → format = 'structured'");
  }

  return { ...result, inferenceLog };
}

// ────────────────────────────────────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────────────────────────────────────

export interface SkillCreateWizardProps {
  onClose: () => void;
}

export const SkillCreateWizard = React.forwardRef<
  HTMLDivElement,
  SkillCreateWizardProps
>(({ onClose: _onClose }, ref) => {
  const { currentStep, goNext, goBack, goToStep } = useWizardStep(STEPS.length);
  const createSkill = useCreateSkill();
  const streaming = useStreamingProgress();
  const { cancelGeneration } = useCancelGeneration();
  const workflowSnapshot = useWorkflowSnapshot();
  const clearGenerationState = useClearGenerationState();
  const isSkillGenerating = useIsSkillGenerating();
  const generationProgress = useGenerationProgress();
  const generationError = useGenerationError();

  // ── 新 state（W2-seq-03a） ─────────────────────────────────────────────
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

  // アンマウント時に Store をクリア
  useEffect(() => {
    return () => {
      clearGenerationState();
    };
  }, [clearGenerationState]);

  // ── ハンドラ（W2-seq-03a） ────────────────────────────────────────────

  /**
   * Step 0 → Step 1 遷移。formData からスマートデフォルトを推論して保存する。
   */
  const handleStep0Next = () => {
    const defaults = inferSmartDefaults(formData);
    setSmartDefaults(defaults);
    goNext();
  };

  /**
   * LLM 生成を起動する。"complete" はフル生成、"skip" は即時生成。
   * 現行は createSkill バックエンドを使用。
   */
  const handleGenerate = async (method: "complete" | "skip") => {
    setGenerationMethod(method);
    goToStep(2);
    setIsGenerating(true);
    setError(null);
    try {
      const path = await createSkill(
        formData.purpose,
        SKILL_GENERATION_OPTIONS,
      );
      if (!path) {
        setError(new Error("スキル生成に失敗しました"));
        return;
      }
      setSkillPath(path);
      setHasExternalIntegration(false);
      setExternalToolName(null);
      goToStep(3);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("スキル生成に失敗しました"),
      );
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 品質フィードバックを受信する。W3-seq-04 計装で trackEvent に接続予定。
   */
  const handleQualityFeedback = (satisfied: boolean) => {
    // TODO(W3-seq-04): trackEvent("skill_skeleton_quality_feedback", { satisfied, generationMethod })
    void satisfied;
    void generationMethod;
  };

  /**
   * 👎 から Step 0 へ復帰。前回入力（formData）は保持。
   */
  const handleRetry = () => {
    setSkillPath(null);
    setHasExternalIntegration(false);
    setExternalToolName(null);
    goToStep(0);
  };

  /** 今すぐ実行する → ウィザードを閉じる */
  const handleExecuteNow = () => {
    _onClose();
  };

  /** エディタで開く → ウィザードを閉じる */
  const handleOpenInEditor = () => {
    _onClose();
  };

  /** 別のスキルを作る → Step 0 復帰（フォームリセット） */
  const handleCreateAnother = () => {
    setFormData(DEFAULT_FORM_DATA);
    setSkillPath(null);
    setHasExternalIntegration(false);
    setExternalToolName(null);
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

      {/* Step 0: スキル情報入力（SkillInfoStep） */}
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

      {/* Step 2: 生成中（GenerateStep）— generationMode prop なし */}
      {currentStep === 2 && (
        <div data-testid="wizard-step-generate">
          <GenerateStep
            stage={resolvedStage}
            percent={resolvedPercent}
            message={resolvedMessage}
            previewContent={resolvedPreview}
            error={resolvedError}
            isGenerating={
              isGenerating || isSkillGenerating || streaming.isGenerating
            }
            onCancel={cancelGeneration}
            onRetry={() => void handleGenerate(generationMethod)}
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
