/**
 * DebugPanel - デバッグパネルメインビュー（Organism）
 *
 * スキルのステップ実行をデバッグするためのパネル。
 * - DebugToolbar: コマンドボタン群
 * - CodeView + StepHistoryList: メインエリア
 * - VariableInspector + CallStackView + EvaluateConsole: サイドパネル
 * - BreakpointEditor: ブレークポイント管理（FR-3C-05）
 * - OutputConsole: 出力コンソール（FR-3C-07）
 * - キーボードショートカット: F5/F6/F10/F11/Shift+F5/Shift+F11（FR-3C-10）
 *
 * レイアウト:
 * ┌──────────────── DebugToolbar ──────────────────┐
 * │ [続行] [一時停止] [ステップ] ... [停止]        │
 * ├──────────────────────┬─────────────────────────┤
 * │  CodeView            │  VariableInspector      │
 * │  (ステップ詳細)      │  (変数一覧)            │
 * │                      │                         │
 * │  StepHistoryList     │  CallStackView          │
 * │  (実行履歴)          │  (コールスタック)       │
 * │                      │                         │
 * │  OutputConsole       │  BreakpointEditor       │
 * │  (出力コンソール)    │  (ブレークポイント)     │
 * │                      │                         │
 * │                      │  EvaluateConsole        │
 * │                      │  (式評価)               │
 * └──────────────────────┴─────────────────────────┘
 *
 * @module DebugPanel
 */

import React, { memo, useState, useCallback, useEffect } from "react";
import clsx from "clsx";
import type {
  DebugStep,
  DebugEvent,
  DebugEvaluateResponse,
  Breakpoint,
} from "@repo/shared/types/skill-debug";
import { useDebugSession } from "./hooks/useDebugSession";
import { useDebugEvents } from "./hooks/useDebugEvents";
import { DebugToolbar } from "./components/DebugToolbar";
import { CodeView } from "./components/CodeView";
import { StepHistoryList } from "./components/StepHistoryList";
import { VariableInspector } from "./components/VariableInspector";
import { CallStackView } from "./components/CallStackView";
import { EvaluateConsole } from "./components/EvaluateConsole";
import { BreakpointEditor } from "./components/BreakpointEditor";
import { OutputConsole } from "./components/OutputConsole";
import { StartDebugDialog } from "./components/StartDebugDialog";
import { ErrorDisplay } from "../../components/atoms/ErrorDisplay";

export const DebugPanel: React.FC = memo(() => {
  const {
    session,
    isLoading,
    error,
    startSession,
    executeCommand,
    setSession,
    resetSession: _resetSession,
  } = useDebugSession();

  const [selectedStep, setSelectedStep] = useState<DebugStep | undefined>(
    undefined,
  );
  const [isStopConfirmOpen, setIsStopConfirmOpen] = useState(false);

  // デバッグイベントのハンドリング
  const handleDebugEvent = useCallback(
    (event: DebugEvent) => {
      switch (event.type) {
        case "step":
          setSession((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              steps: [...prev.steps, event.step],
              currentStep: event.step,
            };
          });
          setSelectedStep(event.step);
          break;
        case "breakpoint-hit":
          setSession((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              status: "paused",
              currentStep: event.step ?? prev.currentStep,
            };
          });
          break;
        case "variable-changed":
          setSession((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              variables: {
                ...prev.variables,
                [event.path]: event.value,
              },
            };
          });
          break;
        case "session-ended":
          setSession((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              status: event.error ? "error" : "completed",
              error: event.error,
              completedAt: event.completedAt,
            };
          });
          break;
      }
    },
    [setSession],
  );

  useDebugEvents(session?.id ?? null, handleDebugEvent);

  // ステップ選択ハンドラ
  const handleSelectStep = useCallback((step: DebugStep) => {
    setSelectedStep(step);
  }, []);

  // 停止確認
  const handleStopRequest = useCallback(() => {
    setIsStopConfirmOpen(true);
  }, []);

  const handleStopConfirm = useCallback(async () => {
    await executeCommand("stop");
    setIsStopConfirmOpen(false);
  }, [executeCommand]);

  const handleStopCancel = useCallback(() => {
    setIsStopConfirmOpen(false);
  }, []);

  // 式評価ハンドラ
  const handleEvaluate = useCallback(
    async (expression: string): Promise<DebugEvaluateResponse | null> => {
      if (!session) return null;
      try {
        const result = await window.electronAPI.skill.debug.evaluateExpression({
          sessionId: session.id,
          expression,
        });
        return result;
      } catch {
        return null;
      }
    },
    [session],
  );

  // ブレークポイント管理ハンドラ（FR-3C-05）
  const handleBreakpointAdded = useCallback(
    (breakpoint: Breakpoint) => {
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          breakpoints: [...prev.breakpoints, breakpoint],
        };
      });
    },
    [setSession],
  );

  const handleBreakpointRemoved = useCallback(
    (breakpointId: string) => {
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          breakpoints: prev.breakpoints.filter((bp) => bp.id !== breakpointId),
        };
      });
    },
    [setSession],
  );

  const handleBreakpointToggled = useCallback(
    (breakpointId: string, enabled: boolean) => {
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          breakpoints: prev.breakpoints.map((bp) =>
            bp.id === breakpointId ? { ...bp, enabled } : bp,
          ),
        };
      });
    },
    [setSession],
  );

  // キーボードショートカットハンドラ（FR-3C-10）
  // F5: 続行（paused のみ）/ F6: 一時停止（running のみ）/ F10: ステップオーバー /
  // F11: ステップイン / Shift+F11: ステップアウト / Shift+F5: 停止
  useEffect(() => {
    if (!session) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // フォーカスがテキスト入力にある場合はショートカットを無効化
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if (isInputFocused) return;

      const status = session.status;
      const isPaused = status === "paused";
      const isRunning = status === "running";
      const isActive = isPaused || isRunning;

      switch (e.key) {
        case "F5":
          e.preventDefault();
          if (e.shiftKey) {
            // Shift+F5: 停止
            if (isActive) {
              handleStopRequest();
            }
          } else {
            // F5: 続行
            if (isPaused) {
              executeCommand("continue");
            }
          }
          break;
        case "F6":
          e.preventDefault();
          // F6: 一時停止
          if (isRunning) {
            executeCommand("pause");
          }
          break;
        case "F10":
          e.preventDefault();
          // F10: ステップオーバー
          if (isPaused) {
            executeCommand("stepOver");
          }
          break;
        case "F11":
          e.preventDefault();
          if (e.shiftKey) {
            // Shift+F11: ステップアウト
            if (isPaused) {
              executeCommand("stepOut");
            }
          } else {
            // F11: ステップイン
            if (isPaused) {
              executeCommand("stepInto");
            }
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [session, executeCommand, handleStopRequest]);

  // セッション未開始時
  if (!session) {
    return (
      <div
        className={clsx("flex flex-col h-full", "bg-[var(--bg-primary)]")}
        data-testid="debug-panel"
      >
        {error && <ErrorDisplay message={error} />}
        <StartDebugDialog onStart={startSession} isLoading={isLoading} />
      </div>
    );
  }

  return (
    <div
      className={clsx("flex flex-col h-full", "bg-[var(--bg-primary)]")}
      data-testid="debug-panel"
    >
      {/* ツールバー */}
      <DebugToolbar
        status={session.status}
        skillName={session.skillName}
        onCommand={executeCommand}
        onStop={handleStopRequest}
      />

      {/* エラー表示 */}
      {error && (
        <div className="px-4 py-2">
          <ErrorDisplay message={error} />
        </div>
      )}

      {/* メインコンテンツ */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左側: コードビュー + ステップ履歴 + 出力コンソール */}
        <div className="flex-1 flex flex-col overflow-hidden p-2 gap-2">
          <div className="flex-1 overflow-hidden">
            <CodeView currentStep={selectedStep ?? session.currentStep} />
          </div>
          <div className="h-36 shrink-0 overflow-hidden">
            <StepHistoryList
              steps={session.steps}
              currentStepNumber={session.currentStep?.stepNumber}
              onSelectStep={handleSelectStep}
            />
          </div>
          {/* 出力コンソール（FR-3C-07） */}
          <div className="h-36 shrink-0 overflow-hidden">
            <OutputConsole steps={session.steps} />
          </div>
        </div>

        {/* 右側: 変数 + コールスタック + ブレークポイント + コンソール */}
        <div className="w-72 shrink-0 flex flex-col overflow-hidden p-2 gap-2 border-l border-[var(--border-primary)]">
          <div className="flex-1 overflow-hidden">
            <VariableInspector variables={session.variables} />
          </div>
          <div className="h-28 shrink-0 overflow-hidden">
            <CallStackView callStack={session.callStack} />
          </div>
          {/* ブレークポイントエディタ（FR-3C-05） */}
          <div className="shrink-0">
            <BreakpointEditor
              sessionId={session.id}
              breakpoints={session.breakpoints}
              onBreakpointAdded={handleBreakpointAdded}
              onBreakpointRemoved={handleBreakpointRemoved}
              onBreakpointToggled={handleBreakpointToggled}
            />
          </div>
          <div className="shrink-0">
            <EvaluateConsole
              sessionId={session.id}
              onEvaluate={handleEvaluate}
            />
          </div>
        </div>
      </div>

      {/* 停止確認ダイアログ */}
      {isStopConfirmOpen && (
        <div
          className={clsx(
            "fixed inset-0 z-50 flex items-center justify-center",
            "bg-black/50",
          )}
          data-testid="stop-confirm-dialog"
        >
          <div
            className={clsx(
              "p-6 rounded-xl max-w-sm w-full",
              "bg-[var(--bg-secondary)] border border-[var(--border-primary)]",
              "shadow-xl",
            )}
          >
            <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
              デバッグを停止しますか？
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              実行中のセッションが終了します。この操作は元に戻せません。
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleStopCancel}
                className={clsx(
                  "px-4 py-2 text-sm rounded-lg",
                  "text-[var(--text-primary)]",
                  "hover:bg-[var(--bg-tertiary)]",
                )}
                data-testid="stop-cancel-btn"
              >
                キャンセル
              </button>
              <button
                onClick={handleStopConfirm}
                className={clsx(
                  "px-4 py-2 text-sm rounded-lg",
                  "bg-[var(--status-error)] text-white",
                  "hover:opacity-90",
                )}
                data-testid="stop-confirm-btn"
              >
                停止する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

DebugPanel.displayName = "DebugPanel";

export default DebugPanel;
