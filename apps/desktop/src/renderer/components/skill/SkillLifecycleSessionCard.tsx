import React, { useEffect, useMemo, useState } from "react";
import type {
  SkillExecutionStatus,
  SkillName,
  SkillStreamMessage,
} from "@repo/shared";
import {
  useAnalyzeSkill,
  useAutoImproveSkill,
  useClearSkillError,
  useCreateSkill,
  useCurrentAnalysis,
  useExecuteSkill,
  useIsAnalyzingSkill,
  useIsImprovingSkill,
  useIsSkillExecuting,
  useSelectedSkillName,
  useSelectSkillByName,
  useSkillError,
  useSkillExecutionStatus,
  useStreamingMessages,
} from "../../store";
import { buttonStyles } from "./skillButtonStyles";

const DEFAULT_CREATE_OPTIONS = {
  generateTasks: true,
  addAgents: false,
  addReferences: false,
} as const;

type ModeStatus = "idle" | "loading" | "ready" | "error";

export interface SkillLifecycleSessionCardProps {
  onOpenCreateWizard: () => void;
}

function extractSkillNameFromPath(skillPath: string): string | null {
  const normalized = skillPath.trim().replace(/[\\/]+$/g, "");
  if (!normalized) {
    return null;
  }
  const parts = normalized.split(/[\\/]+/).filter(Boolean);
  return parts.at(-1) ?? null;
}

function formatExecutionStatus(status: SkillExecutionStatus | null): string {
  switch (status) {
    case "running":
      return "実行中";
    case "completed":
      return "完了";
    case "permission_pending":
      return "権限待ち";
    case "cancelled":
      return "中断";
    case "error":
      return "失敗";
    default:
      return "待機中";
  }
}

function formatStreamSummary(message: SkillStreamMessage | undefined): string {
  if (!message) {
    return "まだ実行ログはありません。";
  }

  switch (message.type) {
    case "assistant":
      return message.content.text;
    case "status":
      return message.content.detail ?? message.content.status;
    case "tool_use":
      return `${message.content.toolName} を実行しました`;
    case "tool_result":
      return message.content.success
        ? "ツール実行が完了しました"
        : (message.content.error ?? "ツール実行に失敗しました");
    case "error":
      return message.content.message;
    default:
      return "実行ログを表示できません。";
  }
}

export function SkillLifecycleSessionCard({
  onOpenCreateWizard,
}: SkillLifecycleSessionCardProps) {
  const [prompt, setPrompt] = useState("");
  const [detectedMode, setDetectedMode] = useState<string | null>(null);
  const [modeStatus, setModeStatus] = useState<ModeStatus>("idle");
  const [createdSkillPath, setCreatedSkillPath] = useState<string | null>(null);
  const [createdSkillName, setCreatedSkillName] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  const selectedSkillName = useSelectedSkillName();
  const isExecuting = useIsSkillExecuting();
  const executionStatus = useSkillExecutionStatus();
  const streamingMessages = useStreamingMessages();
  const currentAnalysis = useCurrentAnalysis();
  const isAnalyzing = useIsAnalyzingSkill();
  const isImproving = useIsImprovingSkill();
  const skillError = useSkillError();

  const clearSkillError = useClearSkillError();
  const createSkill = useCreateSkill();
  const selectSkillByName = useSelectSkillByName();
  const executeSkill = useExecuteSkill();
  const analyzeSkill = useAnalyzeSkill();
  const autoImproveSkill = useAutoImproveSkill();

  const trimmedPrompt = prompt.trim();
  const activeSkillName = createdSkillName ?? selectedSkillName ?? null;
  const streamSummary = useMemo(
    () => formatStreamSummary(streamingMessages.at(-1)),
    [streamingMessages],
  );

  useEffect(() => {
    if (!trimmedPrompt) {
      setDetectedMode(null);
      setModeStatus("idle");
      return;
    }

    let cancelled = false;
    const detectMode = async () => {
      if (typeof window === "undefined" || !window.electronAPI?.skillCreator) {
        if (!cancelled) {
          setModeStatus("error");
        }
        return;
      }

      setModeStatus("loading");
      try {
        const result =
          await window.electronAPI.skillCreator.detectMode(trimmedPrompt);
        if (cancelled) {
          return;
        }

        if (result.success && result.data) {
          setDetectedMode(String(result.data));
          setModeStatus("ready");
          return;
        }

        setDetectedMode(null);
        setModeStatus("error");
      } catch {
        if (!cancelled) {
          setDetectedMode(null);
          setModeStatus("error");
        }
      }
    };

    void detectMode();

    return () => {
      cancelled = true;
    };
  }, [trimmedPrompt]);

  const handleCreate = async () => {
    if (!trimmedPrompt) {
      return;
    }

    clearSkillError();
    setSessionMessage(null);
    setValidationMessage(null);

    const skillPath = await createSkill(trimmedPrompt, DEFAULT_CREATE_OPTIONS);
    if (!skillPath) {
      return;
    }

    const nextSkillName = extractSkillNameFromPath(skillPath);
    setCreatedSkillPath(skillPath);
    setCreatedSkillName(nextSkillName);

    if (nextSkillName) {
      selectSkillByName(nextSkillName as SkillName);
      setSessionMessage(`${nextSkillName} を作成しました`);
    } else {
      setSessionMessage("スキルを作成しました");
    }

    if (window.electronAPI?.skillCreator?.validateSkill) {
      try {
        const validationResult =
          await window.electronAPI.skillCreator.validateSkill(skillPath);
        if (validationResult.success && validationResult.data) {
          setValidationMessage("検証済み");
        } else {
          setValidationMessage("検証で問題が見つかりました");
        }
      } catch {
        setValidationMessage("検証を完了できませんでした");
      }
    }
  };

  const handleExecute = async () => {
    if (!activeSkillName || !trimmedPrompt) {
      return;
    }

    clearSkillError();
    setSessionMessage(null);
    selectSkillByName(activeSkillName as SkillName);
    await executeSkill(trimmedPrompt);
  };

  const handleAnalyze = async () => {
    if (!activeSkillName) {
      return;
    }

    clearSkillError();
    setSessionMessage(null);
    selectSkillByName(activeSkillName as SkillName);
    await analyzeSkill(activeSkillName);
  };

  const handleAutoImprove = async () => {
    if (!activeSkillName) {
      return;
    }

    clearSkillError();
    setSessionMessage(null);
    selectSkillByName(activeSkillName as SkillName);
    await autoImproveSkill(activeSkillName);
  };

  return (
    <section
      data-testid="skill-lifecycle-session-card"
      className="mb-4 rounded-2xl border border-[var(--border-primary)] bg-[linear-gradient(180deg,var(--bg-secondary)_0%,var(--bg-primary)_100%)] p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <div className="inline-flex w-fit rounded-full border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
            推奨導線
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            スキル作成セッション
          </h3>
          <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            自然言語で作成し、そのまま実行と改善まで進めます。
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="skill-lifecycle-prompt"
            className="text-sm font-medium text-[var(--text-primary)]"
          >
            作成したいスキルを説明
          </label>
          <textarea
            id="skill-lifecycle-prompt"
            data-testid="skill-lifecycle-prompt"
            className="min-h-[108px] w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-3 text-sm text-[var(--text-primary)]"
            placeholder="例: issue を整理して task 仕様書まで生成するスキルを作りたい"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border-primary)] pt-4">
          <button
            type="button"
            className={`${buttonStyles.primary} min-h-[44px]`}
            onClick={() => void handleCreate()}
            disabled={!trimmedPrompt}
          >
            作成する
          </button>
          <button
            type="button"
            className={`${buttonStyles.secondary} min-h-[44px]`}
            onClick={() => void handleExecute()}
            disabled={!activeSkillName || !trimmedPrompt}
          >
            実行する
          </button>
          <button
            type="button"
            className={`${buttonStyles.secondary} min-h-[44px]`}
            onClick={() => void handleAnalyze()}
            disabled={!activeSkillName}
          >
            分析する
          </button>
          <button
            type="button"
            className={`${buttonStyles.secondary} min-h-[44px]`}
            onClick={() => void handleAutoImprove()}
            disabled={!activeSkillName}
          >
            全自動改善
          </button>
          <button
            type="button"
            className={`${buttonStyles.secondary} min-h-[44px]`}
            onClick={onOpenCreateWizard}
          >
            詳細設定で作成する
          </button>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4">
            <div className="mb-2 text-xs font-medium tracking-[0.08em] text-[var(--text-secondary)]">
              推定モード
            </div>
            <div
              data-testid="skill-lifecycle-mode-hint"
              className="text-sm text-[var(--text-primary)]"
            >
              {modeStatus === "loading" && "判定中"}
              {modeStatus === "error" && "判定できませんでした"}
              {modeStatus === "ready" && detectedMode}
              {modeStatus === "idle" && "入力待ち"}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4">
            <div className="mb-2 text-xs font-medium tracking-[0.08em] text-[var(--text-secondary)]">
              作成結果
            </div>
            <div
              data-testid="skill-lifecycle-created-skill"
              className="text-sm text-[var(--text-primary)]"
            >
              {activeSkillName ?? "まだ作成していません"}
            </div>
            {createdSkillPath ? (
              <div className="mt-1 text-xs text-[var(--text-secondary)]">
                {createdSkillPath}
              </div>
            ) : null}
            {validationMessage ? (
              <div className="mt-1 text-xs text-[var(--text-secondary)]">
                {validationMessage}
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4">
            <div className="mb-2 text-xs font-medium tracking-[0.08em] text-[var(--text-secondary)]">
              実行結果
            </div>
            <div className="text-sm text-[var(--text-primary)]">
              {isExecuting
                ? "実行中"
                : formatExecutionStatus(executionStatus ?? null)}
            </div>
            <div className="mt-1 text-xs text-[var(--text-secondary)]">
              {streamSummary}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4">
          <div className="mb-2 text-xs font-medium tracking-[0.08em] text-[var(--text-secondary)]">
            改善結果
          </div>
          {currentAnalysis ? (
            <div className="space-y-1 text-sm text-[var(--text-primary)]">
              <div>総合スコア: {currentAnalysis.overallScore}</div>
              <div>提案数: {currentAnalysis.suggestions.length}</div>
            </div>
          ) : (
            <div className="text-sm text-[var(--text-secondary)]">
              {isAnalyzing || isImproving
                ? "改善状態を更新しています。"
                : "分析結果はまだありません。"}
            </div>
          )}
        </div>

        {sessionMessage ? (
          <div
            role="status"
            className="rounded-xl border border-[var(--status-primary)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)]"
          >
            {sessionMessage}
          </div>
        ) : null}

        {skillError ? (
          <div
            role="alert"
            className="rounded-xl border border-[var(--status-error)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--status-error)]"
          >
            {skillError}
          </div>
        ) : null}
      </div>
    </section>
  );
}
