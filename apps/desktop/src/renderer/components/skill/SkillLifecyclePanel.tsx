import React, {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { SkillExecutionStatus } from "@repo/shared";
import type {
  ApplyImprovementResult,
  HandoffGuidance,
  SkillCreatorExecutePlanAck,
  RuntimeSkillCreatorExecuteResponse,
  RuntimeSkillCreatorExecuteResult,
  RuntimeSkillCreatorImproveErrorResponse,
  RuntimeSkillCreatorImproveResponse,
  RuntimeSkillCreatorImproveSuggestion,
  RuntimeSkillCreatorPlanErrorResponse,
  RuntimeSkillCreatorPlanResponse,
  RuntimeSkillCreatorPlanResult,
  RuntimeSkillCreatorReverifyResponse,
  RuntimeSkillCreatorVerifyCheck,
  RuntimeSkillCreatorVerifyCheckSeverity,
  RuntimeSkillCreatorVerifyDetailResponse,
  SkillCreatorUserInputSubmission,
  SkillCreatorWorkflowUiSnapshot,
  TerminalHandoffBundle,
} from "@repo/shared/types";
import type { PlanResult } from "../../store/slices/agentSlice";
import { ApiKeySettingsPanel } from "./ApiKeySettingsPanel";
import { ConversationalInterview } from "./ConversationalInterview";
import {
  useBeginSkillReview,
  useClearHandoffGuidance,
  useClearGenerationState,
  useClearSkillError,
  useClearStreamingMessages,
  useCompleteSkillReview,
  useCreateSkill,
  useCurrentPlanId,
  useCurrentPlanResult,
  useExecuteSkill,
  useFetchSkills,
  useGenerationError,
  useGenerationProgress,
  useHandoffGuidance,
  useIsSkillExecuting,
  useIsSkillGenerating,
  useReExecuteAfterImprovement,
  useResetSkillExecutionCycle,
  useSelectedSkillName,
  useSetHandoffGuidance,
  useSelectSkillByName,
  useSetCurrentPlanId,
  useSetCurrentPlanResult,
  useSetGenerationError,
  useSetGenerationProgress,
  useSetIsSkillGenerating,
  useSetWorkflowError,
  useSetWorkflowSnapshot,
  useSkillError,
  useSkillExecutionStatus,
  useStreamingMessages,
  useWorkflowError,
  useWorkflowSnapshot,
} from "../../store";
import { TerminalHandoffCard } from "../organisms/TerminalHandoffCard";
import { ExecuteResultDetailPanel } from "./ExecuteResultDetailPanel";
import { ImprovementProposalPanel } from "./ImprovementProposalPanel";
import { PlanResultDetailPanel } from "./PlanResultDetailPanel";
import { SkillAnalysisView } from "./SkillAnalysisView";
import { SkillStreamingView } from "./SkillStreamingView";

type SkillCreatorMode =
  | "collaborative"
  | "orchestrate"
  | "create"
  | "update"
  | "improve-prompt"
  | "plan";

type SkillExecutionStatusValue = SkillExecutionStatus | null;

type SessionRole = "user" | "assistant";

type ImproveSuggestion = {
  category: string;
  description: string;
  severity: "low" | "medium" | "high";
  autoFixable: boolean;
};

type ImproveResult = {
  suggestions: ImproveSuggestion[];
  applied: boolean;
};

type RuntimeImproveResult = {
  improveId: string;
  suggestions: RuntimeSkillCreatorImproveSuggestion[];
  revisedSpec?: string;
};

type IpcResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

type SkillCreatorRuntimeApi = {
  detectMode?: (request: string) => Promise<IpcResult<SkillCreatorMode>>;
  planSkill?: (
    prompt: string,
    authMode?: string,
    apiKey?: string,
  ) => Promise<IpcResult<RuntimeSkillCreatorPlanResponse>>;
  executePlan?: (
    planId: string,
    skillSpec?: unknown,
    authMode?: string,
    apiKey?: string,
  ) => Promise<
    IpcResult<SkillCreatorExecutePlanAck | RuntimeSkillCreatorExecuteResponse>
  >;
  getWorkflowState?: (
    planId: string,
  ) => Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>>;
  submitUserInput?: (
    submission: SkillCreatorUserInputSubmission,
  ) => Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>>;
  onWorkflowStateChanged?: (
    callback: (snapshot: SkillCreatorWorkflowUiSnapshot) => void,
  ) => () => void;
  getVerifyDetail?: (
    planId: string,
  ) => Promise<IpcResult<RuntimeSkillCreatorVerifyDetailResponse>>;
  reverifyWorkflow?: (
    planId: string,
  ) => Promise<IpcResult<RuntimeSkillCreatorReverifyResponse>>;
  improveSkill?: (
    skillName: string,
    options?: { autoApply?: boolean },
  ) => Promise<IpcResult<ImproveResult>>;
  improveSkillWithFeedback?: (
    skillName: string,
    feedback: string,
    authMode?: string,
    apiKey?: string | null,
  ) => Promise<IpcResult<RuntimeSkillCreatorImproveResponse>>;
  applyRuntimeImprovement?: (
    skillName: string,
    suggestions: RuntimeSkillCreatorImproveSuggestion[],
  ) => Promise<IpcResult<ApplyImprovementResult>>;
  // TASK-SDK-07: shared disclosure channel 再利用
  getDisclosureInfo?: () => Promise<
    IpcResult<{
      aiServiceName: string;
      modelName: string;
      externalDestinations: string[];
    }>
  >;
};

type SessionEntry = {
  id: string;
  role: SessionRole;
  title: string;
  detail: string;
};

function isExecuteTerminalHandoff(
  response: RuntimeSkillCreatorExecuteResponse,
): response is Extract<
  RuntimeSkillCreatorExecuteResponse,
  { type: "terminal_handoff" }
> {
  return "type" in response && response.type === "terminal_handoff";
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

type WorkflowSnapshotWithArtifacts = SkillCreatorWorkflowUiSnapshot & {
  phaseArtifacts?: Array<{
    kind: string;
    payload: unknown;
  }>;
};

function extractExecuteResultFromWorkflowSnapshot(
  snapshot: WorkflowSnapshotWithArtifacts,
): RuntimeSkillCreatorExecuteResult | null {
  const artifacts = snapshot.phaseArtifacts;
  if (!Array.isArray(artifacts) || artifacts.length === 0) {
    return null;
  }

  for (let index = artifacts.length - 1; index >= 0; index--) {
    const artifact = artifacts[index];
    if (artifact.kind !== "execute_result") {
      continue;
    }
    const payload = artifact.payload;
    if (
      !!payload &&
      typeof payload === "object" &&
      "executeId" in payload &&
      "skillName" in payload &&
      "success" in payload
    ) {
      return payload as RuntimeSkillCreatorExecuteResult;
    }
  }

  return null;
}

function isRuntimeImproveTerminalHandoff(
  response: RuntimeSkillCreatorImproveResponse,
): response is Extract<
  RuntimeSkillCreatorImproveResponse,
  { type: "terminal_handoff" }
> {
  return "type" in response && response.type === "terminal_handoff";
}

function isRuntimeImproveErrorResponse(
  response: RuntimeSkillCreatorImproveResponse,
): response is RuntimeSkillCreatorImproveErrorResponse {
  return "success" in response && response.success === false;
}

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

function toHandoffGuidance(bundle: TerminalHandoffBundle): HandoffGuidance {
  return {
    terminalCommand: bundle.suggestedCommand,
    contextSummary: `launcher=${bundle.launcher} cwd=${bundle.cwd}`,
    reason: bundle.manualRetryRule,
  };
}

const defaultExecutionPrompt =
  "このスキルの基本動作を確認し、改善余地があれば短くまとめてください。";

const defaultCreateOptions = {
  generateTasks: true,
  addAgents: false,
  addReferences: false,
};

const reviewGateStatuses: SkillExecutionStatus[] = [
  "completed",
  "review",
  "improve_ready",
  "reuse_ready",
];

const lifecycleButtonStyles = {
  primary:
    "rounded-md bg-[var(--status-primary)] px-3 py-2 text-sm text-[var(--text-inverse)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] disabled:cursor-not-allowed disabled:opacity-50",
  secondary:
    "rounded-md border border-[var(--border-primary)] px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] disabled:cursor-not-allowed disabled:opacity-50",
  subtle:
    "rounded-md border border-transparent px-3 py-2 text-sm text-[var(--text-secondary)] hover:border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]",
} as const;

const modeLabels: Record<SkillCreatorMode, string> = {
  collaborative: "共同設計",
  orchestrate: "実行分担",
  create: "直作成",
  update: "更新",
  "improve-prompt": "プロンプト改善",
  plan: "計画生成",
};

const severityStyles: Record<ImproveSuggestion["severity"], string> = {
  high: "bg-[var(--status-error)]/10 text-[var(--status-error)]",
  medium: "bg-amber-500/10 text-amber-700",
  low: "bg-[var(--status-primary)]/10 text-[var(--status-primary)]",
};

const verifyStatusBadgeStyles: Record<
  RuntimeSkillCreatorVerifyDetailResponse["status"],
  string
> = {
  pending: "bg-amber-500/10 text-amber-700",
  pass: "bg-emerald-500/10 text-emerald-700",
  fail: "bg-[var(--status-error)]/10 text-[var(--status-error)]",
};

const verifyCheckSeverityStyles: Record<
  RuntimeSkillCreatorVerifyCheckSeverity,
  string
> = {
  info: "bg-[var(--status-primary)]/10 text-[var(--status-primary)]",
  warning: "bg-amber-500/10 text-amber-700",
  error: "bg-[var(--status-error)]/10 text-[var(--status-error)]",
};

type VerifyLayerKey = RuntimeSkillCreatorVerifyCheck["layer"];

const VERIFY_LAYER_ORDER: readonly VerifyLayerKey[] = [
  "layer1",
  "layer2",
  "layer3",
  "layer4",
];

const verifyLayerLabels: Record<VerifyLayerKey, string> = {
  layer1: "Layer 1 — 必須ファイル構造",
  layer2: "Layer 2 — SKILL.md セクション",
  layer3: "Layer 3 — スキーマ・コンテンツ品質",
  layer4: "Layer 4 — References整合性",
};

const verifyCheckSeverityIcon: Record<
  RuntimeSkillCreatorVerifyCheckSeverity,
  string
> = {
  info: "✓",
  warning: "⚠",
  error: "✗",
};

const VERIFY_SEVERITY_ORDER: readonly RuntimeSkillCreatorVerifyCheckSeverity[] =
  ["error", "warning", "info"];

type SeverityFilterLevel = "all" | "warning+" | "error";

const SEVERITY_FILTER_OPTIONS: readonly {
  value: SeverityFilterLevel;
  label: string;
}[] = [
  { value: "all", label: "すべて" },
  { value: "warning+", label: "警告以上" },
  { value: "error", label: "エラーのみ" },
];

const severityFilterButtonStyles = {
  active:
    "rounded-md bg-[var(--status-primary)] px-3 py-1.5 text-xs font-medium text-[var(--text-inverse)]",
  inactive:
    "rounded-md px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]",
} as const;

function filterChecksBySeverity(
  checks: RuntimeSkillCreatorVerifyCheck[],
  filter: SeverityFilterLevel,
): RuntimeSkillCreatorVerifyCheck[] {
  if (filter === "all") return checks;
  if (filter === "warning+") return checks.filter((c) => c.severity !== "info");
  return checks.filter((c) => c.severity === "error");
}

function createDefaultExpandedLayers(): Record<VerifyLayerKey, boolean> {
  return {
    layer1: true,
    layer2: true,
    layer3: true,
    layer4: true,
  };
}

function isVerifyLayerKey(layer: string): layer is VerifyLayerKey {
  return VERIFY_LAYER_ORDER.includes(layer as VerifyLayerKey);
}

function formatSeverityCountLabel(
  severity: RuntimeSkillCreatorVerifyCheckSeverity,
  count: number,
): string {
  const severityLabel = severity === "info" ? "info" : `${severity}s`;
  return `${count} ${severityLabel}`;
}

function getVerifySeverityCounts(
  checks: RuntimeSkillCreatorVerifyCheck[],
): Record<RuntimeSkillCreatorVerifyCheckSeverity, number> {
  return checks.reduce(
    (counts, check) => {
      counts[check.severity] += 1;
      return counts;
    },
    {
      info: 0,
      warning: 0,
      error: 0,
    } as Record<RuntimeSkillCreatorVerifyCheckSeverity, number>,
  );
}

function createVerifyChecksByLayer(): Record<
  VerifyLayerKey,
  RuntimeSkillCreatorVerifyCheck[]
> {
  return {
    layer1: [],
    layer2: [],
    layer3: [],
    layer4: [],
  };
}

interface VerifyLayerGroupProps {
  layer: VerifyLayerKey;
  label: string;
  checks: RuntimeSkillCreatorVerifyCheck[];
  isExpanded: boolean;
  onToggle: (layer: VerifyLayerKey) => void;
}

function VerifyLayerGroup({
  layer,
  label,
  checks,
  isExpanded,
  onToggle,
}: VerifyLayerGroupProps) {
  const severityCounts = getVerifySeverityCounts(checks);
  const panelId = `skill-lifecycle-verify-layer-${layer}-panel`;
  const buttonId = `skill-lifecycle-verify-layer-${layer}-button`;

  return (
    <section
      className="overflow-hidden rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)]"
      data-testid={`skill-lifecycle-verify-layer-${layer}`}
    >
      <button
        type="button"
        id={buttonId}
        aria-controls={panelId}
        aria-expanded={isExpanded}
        onClick={() => onToggle(layer)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[var(--bg-secondary)]"
        data-testid={`skill-lifecycle-verify-layer-toggle-${layer}`}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {label}
          </p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            {checks.length} 件のチェック
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {VERIFY_SEVERITY_ORDER.filter(
            (severity) => severityCounts[severity] > 0,
          ).map((severity) => (
            <span
              key={severity}
              className={`rounded-full px-2 py-1 text-xs font-medium ${verifyCheckSeverityStyles[severity]}`}
            >
              {formatSeverityCountLabel(severity, severityCounts[severity])}
            </span>
          ))}
          <span
            aria-hidden="true"
            className="text-xs font-medium text-[var(--text-secondary)]"
          >
            {isExpanded ? "▲" : "▼"}
          </span>
        </div>
      </button>

      {isExpanded ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="border-t border-[var(--border-primary)] px-4 py-4"
          data-testid={`skill-lifecycle-verify-layer-panel-${layer}`}
        >
          <div className="grid gap-3 lg:grid-cols-2">
            {checks.map((check) => (
              <article
                key={check.id}
                className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-4"
                data-testid={`skill-lifecycle-verify-check-${check.id}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {check.id}
                  </span>
                  <span className="rounded-full bg-[var(--bg-primary)] px-2 py-1 text-xs font-medium text-[var(--text-secondary)]">
                    {check.layer}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${verifyCheckSeverityStyles[check.severity]}`}
                  >
                    <span aria-hidden="true">
                      {verifyCheckSeverityIcon[check.severity]}
                    </span>
                    <span>{check.severity}</span>
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--text-primary)]">
                  {check.summary}
                </p>
                {check.evidenceSummary ? (
                  <p className="mt-2 text-xs text-[var(--text-secondary)]">
                    {check.evidenceSummary}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function getSkillCreatorApi(): SkillCreatorRuntimeApi | null {
  const runtimeWindow = window as Window & {
    electronAPI?: { skillCreator?: SkillCreatorRuntimeApi };
    skillCreatorAPI?: SkillCreatorRuntimeApi;
  };

  return (
    runtimeWindow.electronAPI?.skillCreator ??
    runtimeWindow.skillCreatorAPI ??
    null
  );
}

function extractSkillNameFromPath(skillPath: string): string {
  const normalized = skillPath.trim().replace(/\\/g, "/");
  const segments = normalized.split("/").filter(Boolean);
  return segments.at(-1) ?? "";
}

function appendSessionEntry(
  setter: React.Dispatch<React.SetStateAction<SessionEntry[]>>,
  entry: Omit<SessionEntry, "id">,
): void {
  startTransition(() => {
    setter((current) => [
      ...current,
      {
        id: `${Date.now()}-${current.length}`,
        ...entry,
      },
    ]);
  });
}

export interface SkillLifecyclePanelProps {
  onClose: () => void;
  onOpenWizard?: () => void;
  skillName?: string;
}

export function SkillLifecyclePanel({
  onClose,
  onOpenWizard,
  skillName: _skillName,
}: SkillLifecyclePanelProps) {
  const beginSkillReview = useBeginSkillReview();
  const completeSkillReview = useCompleteSkillReview();
  const createSkill = useCreateSkill();
  const executeSkill = useExecuteSkill();
  const fetchSkills = useFetchSkills();
  const reExecuteAfterImprovement = useReExecuteAfterImprovement();
  const resetSkillExecutionCycle = useResetSkillExecutionCycle();
  const selectSkillByName = useSelectSkillByName();
  const clearSkillError = useClearSkillError();
  const clearStreamingMessages = useClearStreamingMessages();
  const clearGenerationState = useClearGenerationState();
  const clearHandoffGuidance = useClearHandoffGuidance();
  const selectedSkillName = useSelectedSkillName();
  const isExecuting = useIsSkillExecuting();
  const streamingMessages = useStreamingMessages();
  const skillExecutionStatus = useSkillExecutionStatus();
  const skillError = useSkillError();
  const handoffGuidance = useHandoffGuidance();

  // LLM Generation state (TASK-SC-06-UI-RUNTIME-CONNECTION)
  const isGenerating = useIsSkillGenerating();
  const generationProgress = useGenerationProgress();
  const generationError = useGenerationError();
  const storePlanResult = useCurrentPlanResult();
  const storePlanId = useCurrentPlanId();
  const setIsGenerating = useSetIsSkillGenerating();
  const setGenerationProgress = useSetGenerationProgress();
  const setGenerationError = useSetGenerationError();
  const setCurrentPlanId = useSetCurrentPlanId();
  const setCurrentPlanResult = useSetCurrentPlanResult();
  const workflowSnapshot = useWorkflowSnapshot();
  const workflowError = useWorkflowError();
  const setWorkflowSnapshot = useSetWorkflowSnapshot();
  const setWorkflowError = useSetWorkflowError();
  const setHandoffGuidance = useSetHandoffGuidance();

  // Local plan result state for immediate UI feedback (hybrid with store)
  const [localPlanResult, setLocalPlanResult] = useState<PlanResult | null>(
    null,
  );
  const activePlanResult = localPlanResult ?? storePlanResult;
  const activeGenerationError = generationError;

  const [request, setRequest] = useState("");
  // plan 承認時点の request snapshot を保持する。
  // live textarea（request state）とは独立しており、
  // handleExecutePlan は常にこの snapshot を execute payload として使用する。
  // cancel または再生成まで不変。
  const [approvedSkillSpec, setApprovedSkillSpec] = useState<string | null>(
    null,
  );
  const [detectedMode, setDetectedMode] = useState<SkillCreatorMode | null>(
    null,
  );
  const [createdSkillPath, setCreatedSkillPath] = useState<string | null>(null);
  const [createdSkillName, setCreatedSkillName] = useState<string | null>(null);
  const [executionPrompt, setExecutionPrompt] = useState(
    defaultExecutionPrompt,
  );
  const [creatorImproveResult, setCreatorImproveResult] =
    useState<ImproveResult | null>(null);
  const [runtimeImproveResult, setRuntimeImproveResult] =
    useState<RuntimeImproveResult | null>(null);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isPlanningImprovement, setIsPlanningImprovement] = useState(false);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [verifyDetail, setVerifyDetail] =
    useState<RuntimeSkillCreatorVerifyDetailResponse | null>(null);
  const [verifyDetailError, setVerifyDetailError] = useState<string | null>(
    null,
  );
  const [isVerifyDetailLoading, setIsVerifyDetailLoading] = useState(false);
  const [isReverifying, setIsReverifying] = useState(false);
  const [expandedLayers, setExpandedLayers] = useState<
    Record<VerifyLayerKey, boolean>
  >(createDefaultExpandedLayers);
  const [severityFilter, setSeverityFilter] =
    useState<SeverityFilterLevel>("all");
  const checksByLayer = useMemo(() => {
    const groups = createVerifyChecksByLayer();
    for (const check of verifyDetail?.checks ?? []) {
      if (!isVerifyLayerKey(check.layer)) {
        continue;
      }
      groups[check.layer].push(check);
    }
    return groups;
  }, [verifyDetail?.checks]);
  const filteredChecksByLayer = useMemo(() => {
    const result = createVerifyChecksByLayer();
    for (const layer of VERIFY_LAYER_ORDER) {
      result[layer] = filterChecksBySeverity(
        checksByLayer[layer],
        severityFilter,
      );
    }
    return result;
  }, [checksByLayer, severityFilter]);
  const severityTotalCounts = useMemo(() => {
    const allChecks = Object.values(checksByLayer).flat();
    return {
      all: allChecks.length,
      "warning+": allChecks.filter((c) => c.severity !== "info").length,
      error: allChecks.filter((c) => c.severity === "error").length,
    };
  }, [checksByLayer]);
  const toggleLayer = useCallback((layer: VerifyLayerKey) => {
    setExpandedLayers((current) => ({
      ...current,
      [layer]: !current[layer],
    }));
  }, []);
  // TASK-SDK-07: disclosure info state
  const [disclosureInfo, setDisclosureInfo] = useState<{
    aiServiceName: string;
    modelName: string;
    externalDestinations: string[];
  } | null>(null);
  // TASK-RT-03: raw plan/execute detail を local state に保持
  const [rawPlanDetail, setRawPlanDetail] =
    useState<RuntimeSkillCreatorPlanResult | null>(null);
  const [rawExecuteDetail, setRawExecuteDetail] =
    useState<RuntimeSkillCreatorExecuteResult | null>(null);

  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [secretAnswer, setSecretAnswer] = useState("");
  const [confirmAnswer, setConfirmAnswer] = useState<boolean | null>(null);
  const [sessionEntries, setSessionEntries] = useState<SessionEntry[]>([
    {
      id: "lifecycle-guide",
      role: "assistant",
      title: "単一ライフサイクル導線",
      detail:
        "依頼文から作成方針を決め、生成したスキルをそのまま実行し、最後に改善提案まで一気通しで確認できます。",
    },
  ]);

  const previousStatus = useRef<SkillExecutionStatusValue>(null);
  const isPrepareFlowActiveRef = useRef(false);
  const processedWorkflowOutcomePlanIdRef = useRef<string | null>(null);

  useEffect(() => {
    setExpandedLayers(createDefaultExpandedLayers());
    setSeverityFilter("all");
  }, [activeWorkflowId]);

  const clearPlanExecutionState = useCallback(() => {
    setLocalPlanResult(null);
    setCurrentPlanResult(null);
    setCurrentPlanId(null);
    setRawPlanDetail(null);
    setRawExecuteDetail(null);
    processedWorkflowOutcomePlanIdRef.current = null;
  }, [setCurrentPlanId, setCurrentPlanResult]);

  const applyWorkflowSnapshot = useCallback(
    (snapshot: SkillCreatorWorkflowUiSnapshot) => {
      setWorkflowSnapshot(snapshot);
      // handoff 時はエラーメッセージを保持する
      // fire-and-forget 配信では後続スナップショットでエラーが消えるバグ（Issue #1844）を防ぐ
      if (snapshot.currentPhase !== "handoff") {
        setWorkflowError(null);
      }
      if (snapshot.handoffBundle) {
        setHandoffGuidance(toHandoffGuidance(snapshot.handoffBundle));
      }
    },
    [setHandoffGuidance, setWorkflowError, setWorkflowSnapshot],
  );

  useEffect(() => {
    if (skillExecutionStatus === previousStatus.current) {
      return;
    }

    if (skillExecutionStatus === "completed" && createdSkillName) {
      appendSessionEntry(setSessionEntries, {
        role: "assistant",
        title: "実行が完了しました",
        detail: `${createdSkillName} の結果が返ってきました。続けて改善観点を整理できます。`,
      });
    }

    if (skillExecutionStatus === "review" && createdSkillName) {
      appendSessionEntry(setSessionEntries, {
        role: "assistant",
        title: "レビューを開始しました",
        detail: `${createdSkillName} の品質評価を進めています。改善が必要か、再利用可能かを整理します。`,
      });
    }

    if (skillExecutionStatus === "improve_ready" && createdSkillName) {
      appendSessionEntry(setSessionEntries, {
        role: "assistant",
        title: "改善準備が整いました",
        detail: `${createdSkillName} は改善サイクルへ入りました。改善後の内容で再実行できます。`,
      });
    }

    if (skillExecutionStatus === "reuse_ready" && createdSkillName) {
      appendSessionEntry(setSessionEntries, {
        role: "assistant",
        title: "再利用準備が整いました",
        detail: `${createdSkillName} は大きな改善なしで再利用できる状態です。`,
      });
    }

    if (skillExecutionStatus === "error") {
      appendSessionEntry(setSessionEntries, {
        role: "assistant",
        title: "実行でエラーが発生しました",
        detail:
          skillError ??
          "実行ログを確認し、必要なら改善提案または詳細ウィザードへ切り替えてください。",
      });
    }

    previousStatus.current = skillExecutionStatus;
  }, [createdSkillName, skillError, skillExecutionStatus]);

  useEffect(() => {
    const requestState = workflowSnapshot?.awaitingUserInput;
    if (!requestState) {
      setSelectedOptionId(null);
      setTextAnswer("");
      setSecretAnswer("");
      setConfirmAnswer(null);
      return;
    }

    if (requestState.kind === "single_select") {
      setSelectedOptionId(
        (current) => current ?? requestState.options?.[0]?.id ?? null,
      );
      return;
    }

    if (requestState.kind === "confirm") {
      setConfirmAnswer((current) => current ?? true);
      return;
    }

    setSelectedOptionId(null);
    setConfirmAnswer(null);
  }, [workflowSnapshot]);

  useEffect(() => {
    const skillCreatorApi = getSkillCreatorApi();
    if (!skillCreatorApi?.onWorkflowStateChanged) {
      return;
    }

    return skillCreatorApi.onWorkflowStateChanged((snapshot) => {
      applyWorkflowSnapshot(snapshot);
    });
  }, [applyWorkflowSnapshot]);

  useEffect(() => {
    const planId =
      storePlanId ?? activePlanResult?.planId ?? workflowSnapshot?.planId;
    const skillCreatorApi = getSkillCreatorApi();
    if (!planId || !skillCreatorApi?.getWorkflowState) {
      return;
    }

    void skillCreatorApi
      .getWorkflowState(planId)
      .then((result) => {
        if (!result.success || !result.data) {
          if (result.error) {
            setWorkflowError(result.error);
          }
          return;
        }
        applyWorkflowSnapshot(result.data);
      })
      .catch((error) => {
        setWorkflowError(
          error instanceof Error
            ? error.message
            : "workflow state の取得に失敗しました。",
        );
      });
  }, [
    activePlanResult?.planId,
    setHandoffGuidance,
    setWorkflowError,
    setWorkflowSnapshot,
    storePlanId,
    workflowSnapshot?.planId,
  ]);

  const handleCopyHandoffCommand = async () => {
    if (!handoffGuidance) {
      return;
    }

    try {
      await navigator.clipboard.writeText(handoffGuidance.terminalCommand);
    } catch {
      // noop: card 側が copied UI を持つため、コピー失敗は surface を壊さない
    }
  };

  // TASK-SDK-07: handoff 発生時に disclosure info を fetch する
  const fetchDisclosureInfo = async () => {
    const skillCreatorApi = getSkillCreatorApi();
    if (!skillCreatorApi?.getDisclosureInfo) return;
    try {
      const result = await skillCreatorApi.getDisclosureInfo();
      if (result.success && result.data) {
        setDisclosureInfo(result.data);
      }
    } catch {
      // disclosure fetch 失敗は execution authority を Renderer へ移さない
    }
  };

  const processWorkflowOutcome = async (
    snapshot: SkillCreatorWorkflowUiSnapshot,
  ): Promise<boolean> => {
    if (processedWorkflowOutcomePlanIdRef.current === snapshot.planId) {
      return true;
    }

    const extendedSnapshot = snapshot as WorkflowSnapshotWithArtifacts;

    if (extendedSnapshot.handoffBundle) {
      processedWorkflowOutcomePlanIdRef.current = snapshot.planId;
      setHandoffGuidance(toHandoffGuidance(extendedSnapshot.handoffBundle));
      setGenerationError(
        `ターミナル実行が必要です: ${extendedSnapshot.handoffBundle.suggestedCommand}`,
      );
      void fetchDisclosureInfo();
      return true;
    }

    const executeResult =
      extractExecuteResultFromWorkflowSnapshot(extendedSnapshot);
    if (!executeResult) {
      return false;
    }

    processedWorkflowOutcomePlanIdRef.current = snapshot.planId;
    setRawExecuteDetail(executeResult);

    if (!executeResult.success) {
      setGenerationError(executeResult.error ?? "計画実行に失敗しました");
      return true;
    }

    try {
      await fetchSkills();
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "スキル一覧の取得に失敗しました。",
      );
      return true;
    }
    if (executeResult.skillName) {
      selectSkillByName(executeResult.skillName);
    }
    setLocalPlanResult(null);
    clearGenerationState();
    return true;
  };

  const dismissHandoffGuidance = () => {
    setDisclosureInfo(null);
    clearHandoffGuidance();
  };

  const _handleSubmitWorkflowInput = async () => {
    if (!workflowSnapshot?.awaitingUserInput) {
      return;
    }

    const skillCreatorApi = getSkillCreatorApi();
    if (!skillCreatorApi?.submitUserInput) {
      setWorkflowError("workflow user input API が利用できません");
      return;
    }

    const requestState = workflowSnapshot.awaitingUserInput;
    const submission: SkillCreatorUserInputSubmission = {
      planId: workflowSnapshot.planId,
      requestId: requestState.requestId,
    };

    if (requestState.kind === "single_select") {
      submission.selectedOptionId = selectedOptionId ?? undefined;
    } else if (requestState.kind === "free_text") {
      submission.textValue = textAnswer;
    } else if (requestState.kind === "secret") {
      submission.secretValue = secretAnswer;
    } else {
      submission.confirmed = confirmAnswer ?? undefined;
    }

    const result = await skillCreatorApi.submitUserInput(submission);
    if (!result.success || !result.data) {
      setWorkflowError(
        result.error ?? "workflow user input の送信に失敗しました",
      );
      return;
    }

    applyWorkflowSnapshot(result.data);
    setSelectedOptionId(null);
    setTextAnswer("");
    setSecretAnswer("");
    setConfirmAnswer(null);
  };
  useEffect(() => {
    if (storePlanId && storePlanId !== activeWorkflowId) {
      setActiveWorkflowId(storePlanId);
    }
  }, [activeWorkflowId, storePlanId]);

  useEffect(() => {
    if (!createdSkillName && selectedSkillName) {
      setCreatedSkillName(selectedSkillName);
    }
  }, [createdSkillName, selectedSkillName]);

  const loadVerifyDetail = async (planId: string) => {
    const skillCreatorApi = getSkillCreatorApi();
    if (!skillCreatorApi?.getVerifyDetail) {
      return;
    }

    setIsVerifyDetailLoading(true);
    setVerifyDetailError(null);

    try {
      const result = await skillCreatorApi.getVerifyDetail(planId);
      if (!result.success || !result.data) {
        setVerifyDetail(null);
        setVerifyDetailError(
          result.error ?? "verify detail の取得に失敗しました。",
        );
        return;
      }
      setVerifyDetail(result.data);
    } catch (error) {
      setVerifyDetail(null);
      setVerifyDetailError(
        error instanceof Error
          ? error.message
          : "verify detail の取得に失敗しました。",
      );
    } finally {
      setIsVerifyDetailLoading(false);
    }
  };

  useEffect(() => {
    if (!activeWorkflowId) {
      return;
    }

    let cancelled = false;
    loadVerifyDetail(activeWorkflowId).catch(() => {
      if (!cancelled) {
        setVerifyDetail(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [activeWorkflowId]);
  const canOpenReviewFlow =
    Boolean(createdSkillName) &&
    !isExecuting &&
    skillExecutionStatus !== null &&
    reviewGateStatuses.includes(skillExecutionStatus);
  const canPlanImprovement =
    Boolean(createdSkillName) &&
    !isPlanningImprovement &&
    !isExecuting &&
    (skillExecutionStatus === "completed" || skillExecutionStatus === "review");
  const canExecuteSkill =
    Boolean(createdSkillName) &&
    !isExecuting &&
    executionPrompt.trim().length > 0 &&
    skillExecutionStatus !== "review" &&
    skillExecutionStatus !== "reuse_ready";
  const executeButtonLabel =
    skillExecutionStatus === "improve_ready"
      ? "改善後に再実行"
      : isExecuting
        ? "実行中..."
        : "スキルを実行する";

  const handlePanelClose = () => {
    resetSkillExecutionCycle();
    setActiveWorkflowId(null);
    setVerifyDetail(null);
    setVerifyDetailError(null);
    setDisclosureInfo(null);
    clearHandoffGuidance();
    onClose();
  };

  const handlePrepare = async () => {
    const trimmedRequest = request.trim();
    if (!trimmedRequest) {
      setLocalError("まず作りたいスキルの依頼文を入力してください。");
      return;
    }

    // R-1: isGenerating ガード（二重呼出防止）
    if (isGenerating) return;
    if (isPrepareFlowActiveRef.current) return;

    isPrepareFlowActiveRef.current = true;
    clearSkillError();
    setLocalError(null);
    setIsPreparing(true);

    appendSessionEntry(setSessionEntries, {
      role: "user",
      title: "作成依頼",
      detail: trimmedRequest,
    });

    try {
      const skillCreatorApi = getSkillCreatorApi();
      if (!skillCreatorApi?.detectMode) {
        setDetectedMode("create");
        appendSessionEntry(setSessionEntries, {
          role: "assistant",
          title: "標準作成モードで継続します",
          detail:
            "mode 判定 API が見つからないため、既存の作成導線を優先して進めます。必要なら詳細ウィザードで細かく調整できます。",
        });
        return;
      }

      const result = await skillCreatorApi.detectMode(trimmedRequest);
      if (!result.success || !result.data) {
        throw new Error(result.error ?? "mode 判定に失敗しました。");
      }

      // detectMode が "plan" を返した場合、planSkill を自動呼出し
      if (result.data === "plan") {
        if (!skillCreatorApi.planSkill) {
          clearPlanExecutionState();
          setGenerationError("planSkill API が利用できません");
          return;
        }

        try {
          setIsGenerating(true);
          setGenerationProgress("計画を生成中...");

          const planResult = await skillCreatorApi.planSkill(
            trimmedRequest,
            "",
            "",
          );

          if (!planResult.success || !planResult.data) {
            clearPlanExecutionState();
            setGenerationError(planResult.error ?? "計画生成に失敗しました");
            return;
          }

          // TASK-RT-02: plan logical error の検出
          if (isRuntimePlanErrorResponse(planResult.data)) {
            clearPlanExecutionState();
            setGenerationError(planResult.data.error.message);
            return;
          }

          const normalizedPlan = toPlanResult(planResult.data);
          if (!normalizedPlan) {
            clearPlanExecutionState();
            setGenerationError("計画レスポンスの形式が不正です");
            return;
          }

          // TASK-RT-03: raw plan detail を local state に保存
          // この時点で terminal_handoff と error response は上流のガードで除外済み
          // normalizedPlan が取得できている = planResult.data は RuntimeSkillCreatorPlanResult
          if ("planId" in planResult.data) {
            setRawPlanDetail(planResult.data as RuntimeSkillCreatorPlanResult);
          }

          // plan 承認時点の request を snapshot として固定する。
          // この後 textarea を編集しても execute payload は変わらない。
          setApprovedSkillSpec(trimmedRequest);
          setLocalPlanResult(normalizedPlan);
          setCurrentPlanResult(normalizedPlan);
          if (normalizedPlan.planId) {
            setCurrentPlanId(normalizedPlan.planId);
            setActiveWorkflowId(normalizedPlan.planId);
          }
        } catch (err) {
          clearPlanExecutionState();
          setGenerationError(
            err instanceof Error ? err.message : "計画生成に失敗しました",
          );
        } finally {
          setIsGenerating(false);
          setGenerationProgress(null);
        }
        return;
      }

      setDetectedMode(result.data);
      appendSessionEntry(setSessionEntries, {
        role: "assistant",
        title: `推奨モード: ${modeLabels[result.data]}`,
        detail:
          "表向きの導線はこのまま維持しつつ、内部では必要な計画・実行・改善の役割だけを使い分けます。",
      });
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "mode 判定に失敗しました。",
      );
    } finally {
      isPrepareFlowActiveRef.current = false;
      setIsPreparing(false);
    }
  };

  const handleExecutePlan = async () => {
    const planId = storePlanId ?? activePlanResult?.planId;
    if (!planId) return;

    const skillCreatorApi = getSkillCreatorApi();
    if (!skillCreatorApi?.executePlan) return;

    try {
      setIsGenerating(true);
      setDisclosureInfo(null);
      // approved snapshot のみを execute payload として渡す。
      // live textarea（request state）の値は使用しない。
      const result = await skillCreatorApi.executePlan(
        planId,
        approvedSkillSpec ?? undefined,
      );
      if (!result.success || !result.data) {
        setGenerationError(result.error ?? "計画実行に失敗しました");
        return;
      }
      if (isExecutePlanAck(result.data)) {
        setActiveWorkflowId(planId);
        if (skillCreatorApi.getWorkflowState) {
          try {
            const snapshotResult =
              await skillCreatorApi.getWorkflowState(planId);
            if (snapshotResult.success && snapshotResult.data) {
              setWorkflowSnapshot(snapshotResult.data);
              setWorkflowError(null);
              if (await processWorkflowOutcome(snapshotResult.data)) {
                await loadVerifyDetail(planId);
                return;
              }
            }
          } catch {
            // ack 受理後の snapshot 取得失敗は、後続の workflow event に委譲する
          }
        }
        await loadVerifyDetail(planId);
        return;
      }

      const executeResponse = result.data;
      setActiveWorkflowId(planId);
      // TASK-SDK-07: visible handoff + disclosure summary へ接続
      if (isExecuteTerminalHandoff(executeResponse)) {
        processedWorkflowOutcomePlanIdRef.current = planId;
        setHandoffGuidance(toHandoffGuidance(executeResponse.bundle));
        void fetchDisclosureInfo();
        if (skillCreatorApi.getWorkflowState) {
          const snapshotResult = await skillCreatorApi.getWorkflowState(planId);
          if (snapshotResult.success && snapshotResult.data) {
            applyWorkflowSnapshot(snapshotResult.data);
          }
        }
        await loadVerifyDetail(planId);
        return;
      }
      // TASK-RT-03: raw execute detail を local state に保存
      // terminal_handoff は上流ガードで除外済み → executeResponse は RuntimeSkillCreatorExecuteResult
      setRawExecuteDetail(executeResponse);

      processedWorkflowOutcomePlanIdRef.current = planId;

      if (!executeResponse.success) {
        await loadVerifyDetail(planId);
        setGenerationError(executeResponse.error ?? "計画実行に失敗しました");
        return;
      }
      await loadVerifyDetail(planId);
      await fetchSkills();
      if (executeResponse.skillName) {
        selectSkillByName(executeResponse.skillName);
      }
      setLocalPlanResult(null);
      clearGenerationState();
    } catch (err) {
      setGenerationError(
        err instanceof Error ? err.message : "計画実行に失敗しました",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancelPlan = () => {
    setLocalPlanResult(null);
    setApprovedSkillSpec(null);
    clearGenerationState();
    setActiveWorkflowId(null);
    processedWorkflowOutcomePlanIdRef.current = null;
    setVerifyDetail(null);
    setVerifyDetailError(null);
    setDisclosureInfo(null);
    setRawPlanDetail(null);
    setRawExecuteDetail(null);
  };

  const handleCreate = async () => {
    const trimmedRequest = request.trim();
    if (!trimmedRequest) {
      setLocalError("作成依頼が空です。");
      return;
    }

    clearSkillError();
    setLocalError(null);
    setIsCreating(true);
    setCreatorImproveResult(null);
    setShowDetailedAnalysis(false);

    try {
      const skillPath = await createSkill(trimmedRequest, defaultCreateOptions);
      if (!skillPath) {
        throw new Error("スキル生成に失敗しました。");
      }

      const nextSkillName = extractSkillNameFromPath(skillPath);
      if (nextSkillName) {
        selectSkillByName(nextSkillName);
      }

      setCreatedSkillPath(skillPath);
      setCreatedSkillName(nextSkillName || null);
      setExecutionPrompt((current) =>
        current.trim().length > 0 ? current : defaultExecutionPrompt,
      );

      appendSessionEntry(setSessionEntries, {
        role: "assistant",
        title: "スキルを生成しました",
        detail: nextSkillName
          ? `${nextSkillName} を作成しました。次はそのまま実行して挙動を確認できます。`
          : `生成先: ${skillPath}`,
      });
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "スキル生成に失敗しました。",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleExecute = async () => {
    const trimmedPrompt = executionPrompt.trim();
    if (!createdSkillName) {
      setLocalError("先にスキルを生成してください。");
      return;
    }
    if (!trimmedPrompt) {
      setLocalError("実行内容を入力してください。");
      return;
    }

    clearSkillError();
    clearStreamingMessages();
    setLocalError(null);
    setCreatorImproveResult(null);
    setRuntimeImproveResult(null);
    setDisclosureInfo(null);
    setShowDetailedAnalysis(false);

    selectSkillByName(createdSkillName);
    appendSessionEntry(setSessionEntries, {
      role: "user",
      title: "実行依頼",
      detail: trimmedPrompt,
    });

    try {
      if (skillExecutionStatus === "improve_ready") {
        await reExecuteAfterImprovement(trimmedPrompt);
      } else {
        await executeSkill(trimmedPrompt);
      }
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "スキル実行に失敗しました。",
      );
    }
  };

  const handlePlanImprovement = async () => {
    if (!createdSkillName) {
      setLocalError("改善対象のスキルがありません。");
      return;
    }
    if (!canPlanImprovement) {
      setLocalError("先に実行を完了してから改善計画を整理してください。");
      return;
    }

    clearSkillError();
    setLocalError(null);
    setIsPlanningImprovement(true);
    setDisclosureInfo(null);
    beginSkillReview();

    try {
      const skillCreatorApi = getSkillCreatorApi();
      const runtimeFeedback = executionPrompt.trim() || defaultExecutionPrompt;
      if (skillCreatorApi?.improveSkillWithFeedback) {
        const runtimeResult = await skillCreatorApi.improveSkillWithFeedback(
          createdSkillName,
          runtimeFeedback,
        );

        if (!runtimeResult.success || !runtimeResult.data) {
          throw new Error(
            runtimeResult.error ?? "改善提案の取得に失敗しました。",
          );
        }

        if (isRuntimeImproveTerminalHandoff(runtimeResult.data)) {
          setHandoffGuidance(runtimeResult.data.guidance);
          void fetchDisclosureInfo();
          appendSessionEntry(setSessionEntries, {
            role: "assistant",
            title: "改善提案は handoff に切り替わりました",
            detail:
              "この改善は terminal handoff 経路で扱います。ガイダンスに従って手動適用してください。",
          });
          return;
        }

        if (isRuntimeImproveErrorResponse(runtimeResult.data)) {
          throw new Error(runtimeResult.data.error.message);
        }

        setCreatorImproveResult(null);
        setRuntimeImproveResult(runtimeResult.data);
        completeSkillReview(
          runtimeResult.data.suggestions.length > 0
            ? "improve_ready"
            : "reuse_ready",
        );
        appendSessionEntry(setSessionEntries, {
          role: "assistant",
          title: "runtime 改善提案を整理しました",
          detail:
            runtimeResult.data.suggestions.length > 0
              ? `${runtimeResult.data.suggestions.length} 件の適用可能な改善候補があります。`
              : "適用可能な runtime 改善候補は見つかりませんでした。",
        });
        return;
      }

      if (!skillCreatorApi?.improveSkill) {
        setCreatorImproveResult({
          suggestions: [],
          applied: false,
        });
        setRuntimeImproveResult(null);
        appendSessionEntry(setSessionEntries, {
          role: "assistant",
          title: "改善 API は未接続です",
          detail:
            "改善計画の自動生成は使えないため、そのまま詳細分析ビューへ進みます。",
        });
        setShowDetailedAnalysis(true);
        return;
      }

      const result = await skillCreatorApi.improveSkill(createdSkillName, {
        autoApply: false,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error ?? "改善提案の取得に失敗しました。");
      }

      setRuntimeImproveResult(null);
      setCreatorImproveResult(result.data);
      completeSkillReview(
        result.data.suggestions.length > 0 ? "improve_ready" : "reuse_ready",
      );
      appendSessionEntry(setSessionEntries, {
        role: "assistant",
        title: "改善計画を整理しました",
        detail:
          result.data.suggestions.length > 0
            ? `${result.data.suggestions.length} 件の改善候補があります。必要なら詳細分析で適用に進めます。`
            : "大きな改善候補は見つかりませんでした。詳細分析で品質確認だけ行えます。",
      });
    } catch (error) {
      setLocalError(
        error instanceof Error
          ? error.message
          : "改善提案の取得に失敗しました。",
      );
    } finally {
      setIsPlanningImprovement(false);
    }
  };

  const handleApplyComplete = (result: ApplyImprovementResult) => {
    appendSessionEntry(setSessionEntries, {
      role: "assistant",
      title: "改善提案を適用しました",
      detail:
        result.errors.length > 0
          ? `適用 ${result.applied} 件、スキップ ${result.skipped} 件、エラー ${result.errors.length} 件。`
          : `適用 ${result.applied} 件、スキップ ${result.skipped} 件。必要ならこのまま再検証できます。`,
    });
  };

  const handleToggleDetailedAnalysis = () => {
    if (showDetailedAnalysis) {
      setShowDetailedAnalysis(false);
      return;
    }
    if (!createdSkillName) {
      setLocalError("分析対象のスキルがありません。");
      return;
    }
    if (!canOpenReviewFlow) {
      setLocalError("先に実行を完了してから詳細分析を開いてください。");
      return;
    }

    clearSkillError();
    setLocalError(null);
    if (skillExecutionStatus === "completed") {
      beginSkillReview();
    }
    setShowDetailedAnalysis(true);
  };

  const handleReverify = async () => {
    if (!activeWorkflowId) {
      setLocalError("再検証対象の workflow がありません。");
      return;
    }

    const skillCreatorApi = getSkillCreatorApi();
    if (!skillCreatorApi?.reverifyWorkflow) {
      setLocalError("reverifyWorkflow API が利用できません。");
      return;
    }

    setLocalError(null);
    setIsReverifying(true);

    try {
      const result = await skillCreatorApi.reverifyWorkflow(activeWorkflowId);
      if (!result.success || !result.data) {
        throw new Error(result.error ?? "再検証の要求に失敗しました。");
      }
      if (!result.data.accepted) {
        setLocalError(result.data.disabledReason ?? "再検証できません。");
        return;
      }
      appendSessionEntry(setSessionEntries, {
        role: "assistant",
        title: "再検証を要求しました",
        detail:
          "verify detail を pending に戻しました。governance と session の owner は sibling task のままです。",
      });
      await loadVerifyDetail(activeWorkflowId);
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "再検証の要求に失敗しました。",
      );
    } finally {
      setIsReverifying(false);
    }
  };

  const currentSurfaceError =
    localError ?? workflowError ?? verifyDetailError ?? skillError;
  const shouldShowStreaming =
    Boolean(createdSkillName) &&
    (isExecuting ||
      streamingMessages.length > 0 ||
      (skillExecutionStatus !== null && skillExecutionStatus !== "idle"));
  const _pendingRequest = workflowSnapshot?.awaitingUserInput ?? null;

  return (
    <div
      className="flex h-full flex-col gap-4 bg-[var(--bg-primary)] p-4"
      data-testid="skill-lifecycle-panel"
    >
      <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--status-primary)]">
              Skill Lifecycle
            </p>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              作成・実行・改善を一つの流れで進める
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
              表向きの入口はこの画面に集約し、内部では作成支援 API
              と既存の実行・分析導線を必要最小限だけ組み合わせます。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={lifecycleButtonStyles.secondary}
              onClick={onOpenWizard}
              data-testid="skill-lifecycle-open-wizard"
            >
              詳細ウィザード
            </button>
            <button
              type="button"
              className={lifecycleButtonStyles.subtle}
              onClick={handlePanelClose}
            >
              一覧へ戻る
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Plan
            </p>
            <p
              className="mt-2 text-sm font-medium text-[var(--text-primary)]"
              data-testid="skill-lifecycle-mode-label"
            >
              {detectedMode ? modeLabels[detectedMode] : "未判定"}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Create
            </p>
            <p
              className="mt-2 text-sm font-medium text-[var(--text-primary)]"
              data-testid="skill-lifecycle-created-name"
            >
              {createdSkillName ?? "未生成"}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Execute
            </p>
            <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
              {selectedSkillName ?? "未選択"}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Improve
            </p>
            <p
              className="mt-2 text-sm font-medium text-[var(--text-primary)]"
              data-testid="skill-lifecycle-improve-count"
            >
              {creatorImproveResult
                ? `${creatorImproveResult.suggestions.length} 件`
                : "未取得"}
            </p>
          </div>
        </div>
      </div>

      {currentSurfaceError ? (
        <div
          role="alert"
          data-testid="skill-lifecycle-error"
          className="rounded-xl border border-[var(--status-error)] bg-[var(--status-error)]/5 px-4 py-3 text-sm text-[var(--status-error)]"
        >
          {currentSurfaceError}
        </div>
      ) : null}

      {generationProgress ? (
        <div
          aria-live="polite"
          className="rounded-xl border border-[var(--accent-primary)] bg-[var(--accent-primary)]/5 px-4 py-3 text-sm text-[var(--accent-primary)]"
          data-testid="skill-lifecycle-generation-progress"
        >
          {generationProgress}
        </div>
      ) : null}

      {activeGenerationError ? (
        <div
          role="alert"
          className="rounded-xl border border-[var(--status-error)] bg-[var(--status-error)]/5 px-4 py-3 text-sm text-[var(--status-error)]"
        >
          {activeGenerationError}
        </div>
      ) : null}

      {workflowSnapshot ? (
        <section
          className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]"
          data-testid="skill-lifecycle-workflow-summary"
        >
          <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  Workflow Phase
                </p>
                <h3 className="mt-2 text-base font-semibold text-[var(--text-primary)]">
                  {workflowSnapshot.currentPhase}
                </h3>
              </div>
              <span className="rounded-full bg-[var(--status-primary)]/10 px-3 py-1 text-xs font-medium text-[var(--status-primary)]">
                planId: {workflowSnapshot.planId}
              </span>
            </div>

            <div
              className="mt-4 min-h-[320px]"
              data-testid="skill-lifecycle-question-host"
            >
              <ConversationalInterview
                workflowSnapshot={workflowSnapshot}
                onSubmit={async (submission) => {
                  const skillCreatorApi = getSkillCreatorApi();
                  if (!skillCreatorApi?.submitUserInput) {
                    setWorkflowError(
                      "workflow user input API が利用できません",
                    );
                    throw new Error("workflow user input API が利用できません");
                  }
                  const result =
                    await skillCreatorApi.submitUserInput(submission);
                  if (!result.success || !result.data) {
                    const message =
                      result.error ??
                      "workflow user input の送信に失敗しました";
                    setWorkflowError(message);
                    throw new Error(message);
                  }
                  applyWorkflowSnapshot(result.data);
                }}
                onError={(msg) => setWorkflowError(msg)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div
              className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5"
              data-testid="skill-lifecycle-provenance-summary"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                Provenance Summary
              </p>
              <p className="mt-3 text-sm text-[var(--text-primary)]">
                source root:{" "}
                {workflowSnapshot.sourceProvenance?.resolvedSkillCreatorRoot ??
                  "未取得"}
              </p>
              {workflowSnapshot.sourceProvenance?.warningNote ? (
                <p className="mt-2 text-sm text-amber-700">
                  {workflowSnapshot.sourceProvenance.warningNote}
                </p>
              ) : null}
              <p className="mt-3 text-xs text-[var(--text-secondary)]">
                resume phase:{" "}
                {workflowSnapshot.resumeTokenEnvelope.currentPhase}
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                artifacts: {workflowSnapshot.resumeTokenEnvelope.artifactCount}
              </p>
            </div>

            {handoffGuidance ? (
              <div data-testid="skill-lifecycle-handoff-card">
                <TerminalHandoffCard
                  guidance={handoffGuidance}
                  onCopyCommand={() => {
                    void handleCopyHandoffCommand();
                  }}
                  onDismiss={dismissHandoffGuidance}
                />
              </div>
            ) : null}

            {disclosureInfo ? (
              <div
                className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-3"
                data-testid="skill-lifecycle-disclosure-summary"
              >
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  AI Disclosure
                </p>
                <p className="mt-2 text-sm text-[var(--text-primary)]">
                  {disclosureInfo.aiServiceName} ({disclosureInfo.modelName})
                </p>
                {disclosureInfo.externalDestinations.length > 0 ? (
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    destinations:{" "}
                    {disclosureInfo.externalDestinations.join(", ")}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {!workflowSnapshot && handoffGuidance ? (
        <div data-testid="skill-lifecycle-handoff-card">
          <TerminalHandoffCard
            guidance={handoffGuidance}
            onCopyCommand={() => {
              void handleCopyHandoffCommand();
            }}
            onDismiss={dismissHandoffGuidance}
          />
          {disclosureInfo ? (
            <div
              className="mt-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-3"
              data-testid="skill-lifecycle-disclosure-summary"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                AI Disclosure
              </p>
              <p className="mt-2 text-sm text-[var(--text-primary)]">
                {disclosureInfo.aiServiceName} ({disclosureInfo.modelName})
              </p>
              {disclosureInfo.externalDestinations.length > 0 ? (
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  destinations: {disclosureInfo.externalDestinations.join(", ")}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {activePlanResult?.type === "integrated_api" ? (
        <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            生成計画
          </h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            推定ステップ数: {activePlanResult.estimatedSteps}
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className={lifecycleButtonStyles.primary}
              onClick={handleExecutePlan}
              disabled={isGenerating}
            >
              実行する
            </button>
            <button
              type="button"
              className={lifecycleButtonStyles.secondary}
              onClick={handleCancelPlan}
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : null}

      {/* TASK-RT-03: Plan 結果詳細パネル — review phase で raw plan detail が存在する場合 */}
      {rawPlanDetail &&
      (!workflowSnapshot ||
        workflowSnapshot.currentPhase === "review" ||
        workflowSnapshot.awaitingUserInput?.reason === "plan_review") ? (
        <PlanResultDetailPanel
          planResult={rawPlanDetail}
          onRetry={() => {
            void handlePrepare();
          }}
        />
      ) : null}

      {activePlanResult?.type === "terminal_handoff" &&
      activePlanResult.guidance ? (
        <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            ターミナルハンドオフ
          </h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {activePlanResult.guidance.reason}
          </p>
          {activePlanResult.guidance.terminalCommand ? (
            <code className="mt-2 block rounded-lg bg-[var(--bg-primary)] px-3 py-2 text-xs text-[var(--text-primary)]">
              {activePlanResult.guidance.terminalCommand}
            </code>
          ) : null}
        </div>
      ) : null}

      {/* TASK-RT-03: Execute 結果詳細パネル — verify phase で raw execute detail が存在する場合 */}
      {rawExecuteDetail && workflowSnapshot?.currentPhase === "verify" ? (
        <ExecuteResultDetailPanel
          executeResult={rawExecuteDetail}
          onRetry={() => {
            void handleExecutePlan();
          }}
        />
      ) : null}

      {activeWorkflowId ? (
        <div
          className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5"
          data-testid="skill-lifecycle-verify-detail"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--status-primary)]">
                Verify Detail
              </p>
              <h3 className="mt-1 text-base font-semibold text-[var(--text-primary)]">
                4. Layer 3 / Layer 4 verify を確認する
              </h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                workflow owner は engine に残したまま、route / provenance /
                re-verify action を detail surface として表示します。
              </p>
            </div>
            <button
              type="button"
              className={lifecycleButtonStyles.secondary}
              onClick={handleReverify}
              disabled={
                isReverifying ||
                isVerifyDetailLoading ||
                !verifyDetail?.reverifyEligible
              }
              data-testid="skill-lifecycle-reverify-button"
            >
              {isReverifying ? "再検証を要求中..." : "再検証を要求する"}
            </button>
          </div>

          {isVerifyDetailLoading ? (
            <p className="mt-4 text-sm text-[var(--text-secondary)]">
              verify detail を読み込み中...
            </p>
          ) : verifyDetail ? (
            <>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                    Status
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-medium ${verifyStatusBadgeStyles[verifyDetail.status]}`}
                  >
                    {verifyDetail.status}
                  </span>
                </div>
                <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                    Phase
                  </p>
                  <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                    {verifyDetail.currentPhase}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                    Evidence
                  </p>
                  <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                    {verifyDetail.evidenceCount}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                    Route
                  </p>
                  <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                    {verifyDetail.route.summary}
                  </p>
                </div>
              </div>

              {verifyDetail.message ? (
                <div className="mt-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)]">
                  {verifyDetail.message}
                </div>
              ) : null}

              <div
                className="mt-4 flex gap-1 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] p-1"
                role="radiogroup"
                aria-label="重要度フィルタ"
                data-testid="severity-filter"
              >
                {SEVERITY_FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={severityFilter === option.value}
                    onClick={() => setSeverityFilter(option.value)}
                    className={
                      severityFilter === option.value
                        ? severityFilterButtonStyles.active
                        : severityFilterButtonStyles.inactive
                    }
                    data-testid={`severity-filter-${option.value}`}
                  >
                    {option.label} ({severityTotalCounts[option.value]})
                  </button>
                ))}
              </div>

              <div className="mt-4 space-y-3">
                {VERIFY_LAYER_ORDER.filter(
                  (layer) => (filteredChecksByLayer[layer]?.length ?? 0) > 0,
                ).map((layer) => (
                  <VerifyLayerGroup
                    key={layer}
                    layer={layer}
                    label={verifyLayerLabels[layer]}
                    checks={filteredChecksByLayer[layer]}
                    isExpanded={expandedLayers[layer] ?? true}
                    onToggle={toggleLayer}
                  />
                ))}
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                    Provenance
                  </p>
                  <dl className="mt-3 space-y-2 text-sm text-[var(--text-primary)]">
                    <div>
                      <dt className="text-xs text-[var(--text-secondary)]">
                        root
                      </dt>
                      <dd>
                        {verifyDetail.resolvedSkillCreatorRoot ?? "未取得"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--text-secondary)]">
                        manifest
                      </dt>
                      <dd>{verifyDetail.manifestPath ?? "未取得"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--text-secondary)]">
                        resource hash
                      </dt>
                      <dd>{verifyDetail.resourceDescriptorHash ?? "未取得"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--text-secondary)]">
                        cache key
                      </dt>
                      <dd>{verifyDetail.manifestCacheKey ?? "未取得"}</dd>
                    </div>
                  </dl>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                      Governance Note
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-primary)]">
                      {verifyDetail.delegatedGovernanceNote}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                      Session Note
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-primary)]">
                      {verifyDetail.delegatedSessionNote}
                    </p>
                  </div>
                  {!verifyDetail.reverifyEligible &&
                  verifyDetail.disabledReason ? (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-4 text-sm text-amber-700">
                      {verifyDetail.disabledReason}
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-[var(--text-secondary)]">
              verify detail はまだ利用できません。
            </p>
          )}
        </div>
      ) : null}

      {/* API キー設定 (TASK-RT-04) */}
      <ApiKeySettingsPanel />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
        <section className="space-y-4">
          <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  1. 依頼をまとめる
                </h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  何を作りたいかを自然文で入力してください。mode
                  判定は内部で処理し、表の導線は増やしません。
                </p>
              </div>
              <button
                type="button"
                className={lifecycleButtonStyles.secondary}
                onClick={handlePrepare}
                disabled={isPreparing || isCreating || isGenerating}
                data-testid="skill-lifecycle-prepare-button"
              >
                {isPreparing
                  ? "判定中..."
                  : isGenerating
                    ? "計画生成中..."
                    : "方針を決める"}
              </button>
            </div>
            <textarea
              value={request}
              onChange={(event) => setRequest(event.target.value)}
              rows={5}
              placeholder="例: ドキュメントを読み、レビュー観点を整理して、改善提案まで返すスキルを作りたい"
              className="mt-4 w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-3 text-sm leading-6 text-[var(--text-primary)]"
              data-testid="skill-lifecycle-request-input"
            />
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={lifecycleButtonStyles.primary}
                onClick={handleCreate}
                disabled={isCreating || request.trim().length === 0}
                data-testid="skill-lifecycle-create-button"
              >
                {isCreating ? "生成中..." : "スキルを生成する"}
              </button>
              <span className="text-xs text-[var(--text-secondary)]">
                実生成は既存の安全な作成導線を再利用し、判定結果は会話プランにだけ反映します。
              </span>
            </div>
            {createdSkillPath ? (
              <p
                className="mt-3 text-xs text-[var(--text-secondary)]"
                data-testid="skill-lifecycle-created-path"
              >
                生成先: {createdSkillPath}
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  2. 生成したスキルを実行する
                </h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  生成後はそのまま選択状態に切り替え、既存の実行ストリームへ接続します。
                </p>
              </div>
              <button
                type="button"
                className={lifecycleButtonStyles.primary}
                onClick={handleExecute}
                disabled={!canExecuteSkill}
                data-testid="skill-lifecycle-execute-button"
              >
                {executeButtonLabel}
              </button>
            </div>
            <textarea
              value={executionPrompt}
              onChange={(event) => setExecutionPrompt(event.target.value)}
              rows={3}
              placeholder="このスキルに何をさせるかを書いてください"
              className="mt-4 w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-3 text-sm leading-6 text-[var(--text-primary)]"
              data-testid="skill-lifecycle-execution-input"
            />
            {shouldShowStreaming && createdSkillName ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border-primary)]">
                <SkillStreamingView
                  skillName={createdSkillName}
                  messages={streamingMessages}
                  status={skillExecutionStatus}
                />
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  3. 改善の次アクションを決める
                </h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  creator
                  側の改善提案で方向性を出し、必要なら詳細分析で適用まで進めます。
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={lifecycleButtonStyles.secondary}
                  onClick={handlePlanImprovement}
                  disabled={!canPlanImprovement}
                  data-testid="skill-lifecycle-improve-button"
                >
                  {isPlanningImprovement ? "整理中..." : "改善提案を取得"}
                </button>
                <button
                  type="button"
                  className={lifecycleButtonStyles.subtle}
                  onClick={handleToggleDetailedAnalysis}
                  disabled={!showDetailedAnalysis && !canOpenReviewFlow}
                  data-testid="skill-lifecycle-analysis-toggle"
                >
                  {showDetailedAnalysis ? "詳細分析を閉じる" : "詳細分析を開く"}
                </button>
              </div>
            </div>

            {runtimeImproveResult ? (
              <div
                className="mt-4"
                data-testid="skill-lifecycle-runtime-improve-result"
              >
                <ImprovementProposalPanel
                  skillName={createdSkillName ?? ""}
                  suggestions={runtimeImproveResult.suggestions}
                  onApplyComplete={handleApplyComplete}
                  onClose={() => setRuntimeImproveResult(null)}
                />
              </div>
            ) : creatorImproveResult ? (
              <div
                className="mt-4 space-y-3"
                data-testid="skill-lifecycle-improve-result"
              >
                {creatorImproveResult.suggestions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-5 text-sm text-[var(--text-secondary)]">
                    追加の creator
                    改善提案は見つかりませんでした。必要なら詳細分析で品質確認だけ進めてください。
                  </div>
                ) : (
                  creatorImproveResult.suggestions.map((suggestion, index) => (
                    <article
                      key={`${suggestion.category}-${index}`}
                      className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          {suggestion.category}
                        </span>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${severityStyles[suggestion.severity]}`}
                        >
                          {suggestion.severity}
                        </span>
                        {suggestion.autoFixable ? (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700">
                            自動適用候補
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                        {suggestion.description}
                      </p>
                    </article>
                  ))
                )}
              </div>
            ) : null}

            {showDetailedAnalysis && createdSkillName ? (
              <div
                className="mt-4 overflow-hidden rounded-2xl border border-[var(--border-primary)]"
                data-testid="skill-lifecycle-analysis-view"
              >
                <SkillAnalysisView
                  skillName={createdSkillName}
                  onClose={() => setShowDetailedAnalysis(false)}
                />
              </div>
            ) : null}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              セッションログ
            </h3>
            <div
              className="mt-4 space-y-3"
              data-testid="skill-lifecycle-session-log"
            >
              {sessionEntries.map((entry) => (
                <article
                  key={entry.id}
                  className={`rounded-2xl px-4 py-3 ${
                    entry.role === "user"
                      ? "bg-[var(--status-primary)]/10"
                      : "bg-[var(--bg-primary)]"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                    {entry.role === "user" ? "Request" : "Guide"}
                  </p>
                  <h4 className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                    {entry.title}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {entry.detail}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              進行状況
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-3">
                <p className="font-medium text-[var(--text-primary)]">
                  方針判定
                </p>
                <p className="mt-1 text-[var(--text-secondary)]">
                  {detectedMode
                    ? `mode 判定: ${modeLabels[detectedMode]}`
                    : "依頼文から作成方針を整理します。"}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-3">
                <p className="font-medium text-[var(--text-primary)]">
                  実行状況
                </p>
                <p className="mt-1 text-[var(--text-secondary)]">
                  {createdSkillName
                    ? `${createdSkillName} を既存の実行ストリームへ接続済みです。`
                    : "生成後に既存 execute 導線へ自動接続します。"}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-3">
                <p className="font-medium text-[var(--text-primary)]">
                  改善状況
                </p>
                <p className="mt-1 text-[var(--text-secondary)]">
                  {creatorImproveResult
                    ? `${creatorImproveResult.suggestions.length} 件の creator 改善候補を整理しました。`
                    : runtimeImproveResult
                      ? `${runtimeImproveResult.suggestions.length} 件の runtime 改善候補を適用待ちです。`
                      : "creator 提案と詳細分析を段階的に使い分けます。"}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
