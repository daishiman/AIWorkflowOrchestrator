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
 * - Step 0: DescribeStep の役割を SkillInfoStep に統合
 * - Step 1: ConversationRoundStep（onGenerate(method) 接続）
 * - Step 2: GenerateStep（generationMode prop 削除）
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
import type {
  GenerationError,
  GenerationStage,
  GenerationMode,
} from "./wizard";
import type { PlanResult } from "../../store/slices/agentSlice"; // AC-9, C-4 回避
import type {
  ConversationAnswers,
  SkillInfoFormData,
  SmartDefaultResult,
} from "@repo/shared/types/skillCreator";
import { buildSkillContext } from "@repo/shared/types/skillCreator";
import type {
  SkillCreatorWorkflowUiSnapshot,
  TerminalHandoffBundle,
} from "@repo/shared/types";
import { useWizardStep } from "./hooks/useWizardStep";
import {
  useCreateSkill,
  useIsSkillGenerating,
  useGenerationProgress,
  useGenerationError,
  useClearGenerationState,
  useWorkflowSnapshot,
  useCurrentPlanResult,
  useCurrentPlanId,
  useSetIsSkillGenerating,
  useSetGenerationProgress,
  useSetGenerationError,
  useSetCurrentPlanResult,
  useSetCurrentPlanId,
  useResetStreamingProgress,
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

interface ExternalIntegrationState {
  hasExternalIntegration: boolean;
  externalToolName: string | null;
}

// ────────────────────────────────────────────────────────────────────────────
// ユーティリティ関数
// ────────────────────────────────────────────────────────────────────────────

/** TASK-SC-07: executePlan レスポンスが terminal_handoff か判定する型ガード */
function isTerminalHandoffExecuteResponse(
  data: unknown,
): data is { type: "terminal_handoff"; bundle: TerminalHandoffBundle } {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as { type?: unknown }).type === "terminal_handoff" &&
    "bundle" in data
  );
}

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

function toHandoffGuidance(
  bundle: TerminalHandoffBundle,
): NonNullable<PlanResult["guidance"]> {
  return {
    terminalCommand: bundle.suggestedCommand,
    contextSummary: `launcher=${bundle.launcher} cwd=${bundle.cwd}`,
    reason: bundle.manualRetryRule,
  };
}

function toTerminalHandoffPlanResult(
  planId: string,
  bundle: TerminalHandoffBundle,
  skillSpec: string,
  estimatedSteps?: number,
): PlanResult {
  return {
    type: "terminal_handoff",
    planId,
    skillSpec,
    estimatedSteps,
    guidance: toHandoffGuidance(bundle),
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
  const purposeLower = purpose.toLowerCase();
  const inferenceLog: string[] = [];
  const result: SmartDefaultResult = {
    who: null,
    input: null,
    timing: null,
    output: null,
    tool: null,
    format: null,
  };

  // ツール推論（大文字小文字を区別しない）
  if (purposeLower.includes("slack")) {
    result.tool = "slack";
    inferenceLog.push("purpose に 'slack' を検出 → tool = 'slack'");
  } else if (purposeLower.includes("github")) {
    result.tool = "github";
    inferenceLog.push("purpose に 'github' を検出 → tool = 'github'");
  } else if (purposeLower.includes("notion")) {
    result.tool = "notion";
    inferenceLog.push("purpose に 'notion' を検出 → tool = 'notion'");
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

function resolveKnownTool(input: string | null | undefined): string | null {
  const normalized = (input ?? "").trim().toLowerCase();
  if (!normalized) return null;
  if (normalized.includes("slack")) return "slack";
  if (normalized.includes("github")) return "github";
  if (normalized.includes("notion")) return "notion";
  return null;
}

function toExternalToolName(tool: string | null): string | null {
  if (!tool) return null;
  if (tool === "slack") return "Slack";
  if (tool === "github") return "GitHub";
  if (tool === "notion") return "Notion";
  return tool;
}

export function resolveExternalIntegration(
  q5Answer: ConversationAnswers["q5"],
  smartDefaultTool: string | null | undefined,
): ExternalIntegrationState {
  // 複数選択時は先頭値を主ツールとして参照する。
  // 複数ツールの並列統合対応は別タスクのスコープ。
  const selected = (q5Answer.selectedOptions[0] ?? "").trim();
  const freeText = q5Answer.freeText.trim();

  if (selected === "なし") {
    return { hasExternalIntegration: false, externalToolName: null };
  }
  if (selected === "Slack") {
    return { hasExternalIntegration: true, externalToolName: "Slack" };
  }
  if (selected === "GitHub") {
    return { hasExternalIntegration: true, externalToolName: "GitHub" };
  }
  if (selected === "その他") {
    return {
      hasExternalIntegration: true,
      externalToolName: freeText.length > 0 ? freeText : null,
    };
  }
  if (freeText.length > 0) {
    const known = resolveKnownTool(freeText);
    return {
      hasExternalIntegration: true,
      externalToolName: toExternalToolName(known) ?? freeText,
    };
  }

  const knownFromDefault = resolveKnownTool(smartDefaultTool);
  if (knownFromDefault) {
    return {
      hasExternalIntegration: true,
      externalToolName: toExternalToolName(knownFromDefault),
    };
  }

  return { hasExternalIntegration: false, externalToolName: null };
}

// ────────────────────────────────────────────────────────────────────────────
// LLM 生成 API アクセス（TASK-SC-07 / C-1 回避: skillSpec は必須）
// ────────────────────────────────────────────────────────────────────────────

type SkillCreatorRuntimeApi = {
  planSkill?: (
    prompt: string,
    authMode?: string,
    apiKey?: string,
  ) => Promise<{ success: boolean; data?: PlanResult; error?: string }>;
  executePlan?: (
    planId: string,
    skillSpec: string, // 必須（C-1 回避: optional にしない）
    authMode?: string,
    apiKey?: string,
  ) => Promise<{ success: boolean; data?: unknown; error?: string }>;
  getWorkflowState?: (
    planId: string,
  ) => Promise<{ success: boolean; data?: unknown; error?: string }>;
};

function getSkillCreatorApi(): SkillCreatorRuntimeApi {
  const runtimeWindow = window as Window & {
    skillCreatorAPI?: SkillCreatorRuntimeApi;
    electronAPI?: { skillCreator?: SkillCreatorRuntimeApi };
  };
  return (
    runtimeWindow.skillCreatorAPI ??
    runtimeWindow.electronAPI?.skillCreator ??
    {}
  );
}

// ────────────────────────────────────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────────────────────────────────────

export interface SkillCreateWizardProps {
  onClose: () => void;
  source?: "lifecycle_panel" | "direct";
}

export const SkillCreateWizard = React.forwardRef<
  HTMLDivElement,
  SkillCreateWizardProps
>(({ onClose: _onClose, source }, ref) => {
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
  const llmGenerationRequestIdRef = useRef(0);
  const templateGenerationRequestIdRef = useRef(0);
  // W3-seq-04: abandon 制御 ref（P-5）
  const wizardCompletedRef = useRef(false);
  const currentStepRef = useRef(0);

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

  // W3-seq-04 計装 1: ウィザード起動・開封イベント（AC-01 / P-1）
  useEffect(() => {
    trackEvent("skill_wizard_started", {});
    trackEvent("skill_wizard_open", { source: source ?? "direct" });
  }, []);

  // W3-seq-04: currentStep を useRef で追跡（アンマウント時クロージャ問題回避）
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  // TASK-SC-07: LLM 生成フロー state
  const [generationMode, setGenerationMode] =
    useState<GenerationMode>("template");
  /** LLM ラジオが一度でも選択されたか（テンプレート復帰時の UI 分岐に使用） */
  const [hasActivatedLlmMode, setHasActivatedLlmMode] = useState(false);
  const [localPlanResult, setLocalPlanResult] = useState<PlanResult | null>(
    null,
  );
  const [llmDescription, setLlmDescription] = useState("");

  // TASK-SC-07: store setters（C-4: PlanResult は agentSlice から import 済み）
  const setStoreIsGenerating = useSetIsSkillGenerating();
  const setGenerationProgressMsg = useSetGenerationProgress();
  const setGenerationErrorMsg = useSetGenerationError();
  const setCurrentPlanResult = useSetCurrentPlanResult();
  const setCurrentPlanId = useSetCurrentPlanId();
  const currentPlanId = useCurrentPlanId();
  const currentPlanResult = useCurrentPlanResult();

  const invalidateGenerationRequests = () => {
    llmGenerationRequestIdRef.current += 1;
    templateGenerationRequestIdRef.current += 1;
  };
  // アンマウント時にリクエストを無効化・abandon 発火（P-5）
  useEffect(() => {
    return () => {
      llmGenerationRequestIdRef.current += 1;
      templateGenerationRequestIdRef.current += 1;
      generationLockRef.current = false;
      if (!wizardCompletedRef.current) {
        trackEvent("skill_wizard_abandon", {
          lastStep: currentStepRef.current,
        });
      }
    };
  }, []);

  // ── ハンドラ（W2-seq-03a） ────────────────────────────────────────────

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
    setLocalPlanResult(null);
    generationLockRef.current = false;
    wizardCompletedRef.current = false;
    clearGenerationState();
  };

  /**
   * LLM モードから切り替え後のテンプレートモード Step 0 → Step 1 遷移。
   * llmDescription を purpose として formData に反映してから ConversationRoundStep へ。
   */
  const handleStep0NextFromLlm = () => {
    const newFormData = { ...formData, purpose: llmDescription };
    setFormData(newFormData);
    const defaults = inferSmartDefaults(newFormData);
    setSmartDefaults(defaults);
    const integration = resolveExternalIntegration(answers.q5, defaults.tool);
    setHasExternalIntegration(integration.hasExternalIntegration);
    setExternalToolName(integration.externalToolName);
    trackEvent("skill_wizard_step_complete", { step: 0, stepName: STEPS[0] });
    goNext();
  };

  /**
   * Step 0 → Step 1 遷移。formData からスマートデフォルトを推論して保存する。
   */
  const handleStep0Next = () => {
    const defaults = inferSmartDefaults(formData);
    setSmartDefaults(defaults);
    const integration = resolveExternalIntegration(answers.q5, defaults.tool);
    setHasExternalIntegration(integration.hasExternalIntegration);
    setExternalToolName(integration.externalToolName);
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
    const requestId = templateGenerationRequestIdRef.current;
    const defaults = smartDefaults ?? inferSmartDefaults(formData);
    if (!smartDefaults) {
      setSmartDefaults(defaults);
    }
    const integration = resolveExternalIntegration(answers.q5, defaults.tool);

    clearGenerationState();
    resetStreamingProgress();
    setGenerationMethod(method);
    setLocalPlanResult(null);
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
      if (requestId !== templateGenerationRequestIdRef.current) {
        return;
      }
      if (!path) {
        setError(new Error("スキル生成に失敗しました"));
        return;
      }
      setSkillPath(path);
      setHasExternalIntegration(integration.hasExternalIntegration);
      setExternalToolName(integration.externalToolName);

      // W3-seq-04 計装 3: 生成完了イベント（AC-03）—失敗時は発火しない
      trackEvent("skill_wizard_generation_completed", {
        method,
        category: formData.category ?? "other",
        hasExternalIntegration: integration.hasExternalIntegration,
      });
      wizardCompletedRef.current = true;
      trackEvent("skill_wizard_step_complete", { step: 2, stepName: STEPS[2] });

      goToStep(3);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("スキル生成に失敗しました"),
      );
    } finally {
      if (requestId === templateGenerationRequestIdRef.current) {
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

  // ── TASK-SC-07: LLM 生成ハンドラ ─────────────────────────────────────

  /** LLM モード: planSkill を呼び出し Step 2 へ遷移する（AC-2） */
  const handleLlmGenerate = async () => {
    if (generationLockRef.current || isGenerating || isSkillGenerating) {
      return; // G-1: 二重呼出防止
    }

    const description = llmDescription.trim();
    setError(null);
    setGenerationErrorMsg(null);
    setGenerationProgressMsg(null);
    if (description.length === 0) {
      setGenerationErrorMsg("スキルの説明を入力してください");
      return;
    }

    const api = getSkillCreatorApi();
    if (!api.planSkill) {
      setGenerationErrorMsg("planSkill API が利用できません"); // F-2
      return;
    }

    generationLockRef.current = true;
    invalidateGenerationRequests();
    const requestId = llmGenerationRequestIdRef.current;
    setLocalPlanResult(null);
    // clearGenerationState は executePlan/cancelPlan の対称クリアで呼ぶ（W-10/W-11 の二重呼出防止）
    setGenerationErrorMsg(null);
    setCurrentPlanResult(null);
    setCurrentPlanId(null);
    resetStreamingProgress();
    setSkillPath(null);
    setStoreIsGenerating(true);
    setGenerationProgressMsg("計画を生成中..."); // W-2
    goToStep(2);

    try {
      const result = await api.planSkill(description);
      if (requestId !== llmGenerationRequestIdRef.current) {
        return;
      }
      if (!result.success || !result.data) {
        setGenerationErrorMsg(
          result.error ?? "スキルプランの生成に失敗しました",
        ); // E-1
        setGenerationProgressMsg(null);
        return;
      }
      // E-2b: data 内部の論理エラーチェック
      const data = result.data as PlanResult & {
        success?: boolean;
        error?: { message?: string };
      };
      if (data.success === false) {
        const errMsg =
          data.error?.message ?? "スキルプランの生成に失敗しました";
        setGenerationErrorMsg(errMsg);
        setGenerationProgressMsg(null);
        setCurrentPlanResult(null); // E-2b: 論理エラー時も plan state をクリア
        setCurrentPlanId(null);
        return;
      }
      setLocalPlanResult(result.data); // ローカル state（localPlanResult）
      setCurrentPlanResult(result.data); // store（W-3）
      setCurrentPlanId(result.data.planId ?? null);
      setGenerationProgressMsg(null);
    } catch (err) {
      if (requestId !== llmGenerationRequestIdRef.current) {
        return;
      }
      const message =
        err instanceof Error ? err.message : "スキルプランの生成に失敗しました";
      setGenerationErrorMsg(message); // E-2
      setGenerationProgressMsg(null);
    } finally {
      if (requestId === llmGenerationRequestIdRef.current) {
        setStoreIsGenerating(false); // E-4
        generationLockRef.current = false;
      }
    }
  };

  /** LLM モード: executePlan を呼び出し生成を実行する（AC-4 / C-1） */
  const handleExecutePlan = async () => {
    if (generationLockRef.current || isGenerating || isSkillGenerating) {
      return;
    }

    setError(null);
    setGenerationErrorMsg(null);
    setGenerationProgressMsg(null);

    const plan = localPlanResult ?? null;
    const planId = plan?.planId ?? currentPlanId;
    if (!planId) return;

    const skillSpec =
      plan?.skillSpec?.trim() ?? currentPlanResult?.skillSpec?.trim() ?? "";
    if (!skillSpec) {
      setGenerationErrorMsg("実行するスキル仕様がありません");
      return;
    }

    const api = getSkillCreatorApi();
    if (!api.executePlan) {
      setGenerationErrorMsg("executePlan API が利用できません");
      return;
    }

    generationLockRef.current = true;
    llmGenerationRequestIdRef.current += 1;
    const requestId = llmGenerationRequestIdRef.current;
    setStoreIsGenerating(true);
    setGenerationProgressMsg("スキルを生成中...");

    try {
      const result = await api.executePlan(planId, skillSpec); // C-1: skillSpec 必須
      if (requestId !== llmGenerationRequestIdRef.current) {
        return;
      }
      if (!result.success) {
        setGenerationErrorMsg(result.error ?? "スキル生成に失敗しました"); // E-3
        setGenerationProgressMsg(null);
        return;
      }
      if (isTerminalHandoffExecuteResponse(result.data)) {
        const suggestedCommand = result.data.bundle?.suggestedCommand?.trim();
        setGenerationErrorMsg(
          suggestedCommand && suggestedCommand.length > 0
            ? `ターミナル実行が必要です: ${suggestedCommand}`
            : "ターミナル実行が必要です",
        );
        setGenerationProgressMsg(null);
        return;
      }

      if (
        result.data &&
        typeof result.data === "object" &&
        "success" in result.data &&
        (result.data as { success?: boolean }).success === false
      ) {
        const maybeError = result.data as {
          error?: { message?: string } | string;
        };
        const errorMessage =
          typeof maybeError.error === "string"
            ? maybeError.error
            : maybeError.error?.message;
        setGenerationErrorMsg(errorMessage ?? "スキル生成に失敗しました");
        setGenerationProgressMsg(null);
        return;
      }

      if (api.getWorkflowState) {
        try {
          const snapshotResult = await api.getWorkflowState(planId);
          if (requestId !== llmGenerationRequestIdRef.current) {
            return;
          }
          if (
            snapshotResult.success &&
            snapshotResult.data &&
            typeof snapshotResult.data === "object"
          ) {
            const snapshot =
              snapshotResult.data as SkillCreatorWorkflowUiSnapshot;
            if (snapshot.handoffBundle) {
              const terminalHandoffResult = toTerminalHandoffPlanResult(
                planId,
                snapshot.handoffBundle,
                skillSpec,
                plan?.estimatedSteps ?? currentPlanResult?.estimatedSteps,
              );
              setLocalPlanResult(terminalHandoffResult);
              setCurrentPlanResult(terminalHandoffResult);
              setGenerationProgressMsg(null);
              return;
            }
            if (snapshot.verifyResult?.status === "fail") {
              setGenerationErrorMsg(
                snapshot.verifyResult.message ?? "スキル生成に失敗しました",
              );
              setGenerationProgressMsg(null);
              return;
            }
            const persistedSkillPath =
              snapshot.persistResult?.skillPath?.trim() ?? "";
            if (persistedSkillPath.length > 0) {
              setSkillPath(persistedSkillPath);
            }
          }
        } catch {
          // snapshot 取得失敗は成功扱いにフォールバックする
        }
      }

      setLocalPlanResult(null); // AC-10: 対称クリア
      clearGenerationState(); // W-10
      wizardCompletedRef.current = true;
      trackEvent("skill_wizard_step_complete", { step: 2, stepName: STEPS[2] });
      goToStep(3);
    } catch (err) {
      if (requestId !== llmGenerationRequestIdRef.current) {
        return;
      }
      const message =
        err instanceof Error ? err.message : "スキル生成に失敗しました";
      setGenerationErrorMsg(message); // E-5
      setGenerationProgressMsg(null);
    } finally {
      if (requestId === llmGenerationRequestIdRef.current) {
        setStoreIsGenerating(false);
        generationLockRef.current = false;
      }
    }
  };

  /** LLM モード: キャンセル → Step 0 に戻る（AC-5 / AC-10） */
  const handleCancelPlan = () => {
    invalidateGenerationRequests();
    setLocalPlanResult(null); // AC-10: 対称クリア
    setError(null);
    setSkillPath(null);
    generationLockRef.current = false;
    cancelGeneration();
    resetStreamingProgress();
    clearGenerationState(); // W-11
    goToStep(0);
  };

  /** template モード: 生成をキャンセルして Step 0 に戻る */
  const handleCancelTemplateGeneration = () => {
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

      {/* Step 0: スキル情報入力（TASK-SC-07: generationMode 切替 UI 追加） */}
      {currentStep === 0 && (
        <div data-testid="wizard-step-info">
          {/* 生成モード選択ラジオボタン（AC-1） */}
          <div className="mb-4 flex gap-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="generationMode"
                value="template"
                checked={generationMode === "template"}
                onChange={() => setGenerationMode("template")}
              />
              テンプレートから作成
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="generationMode"
                value="llm"
                checked={generationMode === "llm"}
                onChange={() => {
                  setGenerationMode("llm");
                  setHasActivatedLlmMode(true);
                }}
              />
              LLM で生成
            </label>
          </div>

          {generationMode === "template" && !hasActivatedLlmMode ? (
            /* テンプレートモード（通常）: フル SkillInfoStep */
            <SkillInfoStep
              formData={formData}
              onFormDataChange={setFormData}
              onNext={handleStep0Next}
            />
          ) : (
            /* LLM モード or LLM→テンプレート切替後: 共通の description 入力 UI
             * aria-label="目的・背景" でアクセシブル名を統一（W-6c: getByLabelText） */
            <div className="flex flex-col gap-4">
              <label htmlFor="llm-description" className="text-sm font-medium">
                スキルの説明
              </label>
              <textarea
                id="llm-description"
                aria-label="目的・背景"
                className="w-full rounded border p-2 text-sm"
                rows={4}
                value={llmDescription}
                onChange={(e) => setLlmDescription(e.target.value)}
                placeholder="作りたいスキルの説明を入力してください"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  className="rounded bg-blue-600 px-4 py-2 text-sm text-white"
                  disabled={llmDescription.trim().length === 0}
                  onClick={
                    generationMode === "llm"
                      ? () => void handleLlmGenerate()
                      : handleStep0NextFromLlm
                  }
                >
                  次へ
                </button>
              </div>
            </div>
          )}
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

      {/* Step 2: 生成中（GenerateStep）— TASK-SC-07: LLM props 追加 */}
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
            onCancel={
              generationMode === "llm"
                ? handleCancelPlan
                : handleCancelTemplateGeneration
            }
            onRetry={
              generationMode === "template"
                ? () => void handleGenerate(generationMethod)
                : undefined
            }
            planResult={generationMode === "llm" ? localPlanResult : undefined}
            onExecutePlan={
              generationMode === "llm"
                ? () => void handleExecutePlan()
                : undefined
            }
            onCancelPlan={
              generationMode === "llm" ? handleCancelPlan : undefined
            }
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
