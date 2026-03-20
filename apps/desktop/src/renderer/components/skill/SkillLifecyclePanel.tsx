import React, { startTransition, useEffect, useRef, useState } from "react";
import type { SkillExecutionStatus } from "@repo/shared";
import {
  useClearSkillError,
  useClearStreamingMessages,
  useCreateSkill,
  useExecuteSkill,
  useIsSkillExecuting,
  useSelectedSkillName,
  useSelectSkillByName,
  useSkillError,
  useSkillExecutionStatus,
  useStreamingMessages,
} from "../../store";
import { SkillAnalysisView } from "./SkillAnalysisView";
import { SkillStreamingView } from "./SkillStreamingView";

type SkillCreatorMode =
  | "collaborative"
  | "orchestrate"
  | "create"
  | "update"
  | "improve-prompt";

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

type IpcResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

type SkillCreatorRuntimeApi = {
  detectMode?: (request: string) => Promise<IpcResult<SkillCreatorMode>>;
  improveSkill?: (
    skillName: string,
    options?: { autoApply?: boolean },
  ) => Promise<IpcResult<ImproveResult>>;
};

type SessionEntry = {
  id: string;
  role: SessionRole;
  title: string;
  detail: string;
};

const defaultExecutionPrompt =
  "このスキルの基本動作を確認し、改善余地があれば短くまとめてください。";

const defaultCreateOptions = {
  generateTasks: true,
  addAgents: false,
  addReferences: false,
};

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
};

const severityStyles: Record<ImproveSuggestion["severity"], string> = {
  high: "bg-[var(--status-error)]/10 text-[var(--status-error)]",
  medium: "bg-amber-500/10 text-amber-700",
  low: "bg-[var(--status-primary)]/10 text-[var(--status-primary)]",
};

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
  onOpenWizard: () => void;
}

export function SkillLifecyclePanel({
  onClose,
  onOpenWizard,
}: SkillLifecyclePanelProps) {
  const createSkill = useCreateSkill();
  const executeSkill = useExecuteSkill();
  const selectSkillByName = useSelectSkillByName();
  const clearSkillError = useClearSkillError();
  const clearStreamingMessages = useClearStreamingMessages();
  const selectedSkillName = useSelectedSkillName();
  const isExecuting = useIsSkillExecuting();
  const streamingMessages = useStreamingMessages();
  const skillExecutionStatus = useSkillExecutionStatus();
  const skillError = useSkillError();

  const [request, setRequest] = useState("");
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
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isPlanningImprovement, setIsPlanningImprovement] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
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

  const handlePrepare = async () => {
    const trimmedRequest = request.trim();
    if (!trimmedRequest) {
      setLocalError("まず作りたいスキルの依頼文を入力してください。");
      return;
    }

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
      setIsPreparing(false);
    }
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
    setShowDetailedAnalysis(false);

    selectSkillByName(createdSkillName);
    appendSessionEntry(setSessionEntries, {
      role: "user",
      title: "実行依頼",
      detail: trimmedPrompt,
    });

    try {
      await executeSkill(trimmedPrompt);
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

    clearSkillError();
    setLocalError(null);
    setIsPlanningImprovement(true);

    try {
      const skillCreatorApi = getSkillCreatorApi();
      if (!skillCreatorApi?.improveSkill) {
        setCreatorImproveResult({
          suggestions: [],
          applied: false,
        });
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

      setCreatorImproveResult(result.data);
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

  const currentSurfaceError = localError ?? skillError;
  const shouldShowStreaming =
    Boolean(createdSkillName) &&
    (isExecuting ||
      streamingMessages.length > 0 ||
      (skillExecutionStatus !== null && skillExecutionStatus !== "idle"));

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
              onClick={onClose}
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
                disabled={isPreparing || isCreating}
                data-testid="skill-lifecycle-prepare-button"
              >
                {isPreparing ? "判定中..." : "方針を決める"}
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
                disabled={
                  !createdSkillName ||
                  isExecuting ||
                  executionPrompt.trim().length === 0
                }
                data-testid="skill-lifecycle-execute-button"
              >
                {isExecuting ? "実行中..." : "実行する"}
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
                  disabled={!createdSkillName || isPlanningImprovement}
                  data-testid="skill-lifecycle-improve-button"
                >
                  {isPlanningImprovement ? "整理中..." : "改善提案を取得"}
                </button>
                <button
                  type="button"
                  className={lifecycleButtonStyles.subtle}
                  onClick={() => setShowDetailedAnalysis((current) => !current)}
                  disabled={!createdSkillName}
                  data-testid="skill-lifecycle-analysis-toggle"
                >
                  {showDetailedAnalysis ? "詳細分析を閉じる" : "詳細分析を開く"}
                </button>
              </div>
            </div>

            {creatorImproveResult ? (
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
