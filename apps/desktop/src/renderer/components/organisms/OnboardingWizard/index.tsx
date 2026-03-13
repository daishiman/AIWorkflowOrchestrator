import React, { useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";
import { Button } from "../../atoms/Button";
import { Input } from "../../atoms/Input";
import { SuggestionBubble } from "../../atoms/SuggestionBubble";
import { Icon } from "../../atoms/Icon";
import type { ThemeMode } from "../../../store/types";

export const ONBOARDING_STORE_KEYS = {
  hasCompleted: "onboarding.hasCompleted",
  userName: "onboarding.userName",
  selectedStarterTool: "onboarding.selectedStarterTool",
  lastCompletedAt: "onboarding.lastCompletedAt",
} as const;

const ONBOARDING_STEPS = [
  { id: "name", label: "名前" },
  { id: "ai", label: "AIおためし" },
  { id: "starter", label: "使い始め" },
  { id: "theme", label: "テーマ" },
] as const;

const COMPLETION_STEP_INDEX = ONBOARDING_STEPS.length;

const DEFAULT_THEME_MODE: ThemeMode = "kanagawa-dragon";
const DEFAULT_PREVIEW_NAME = "User";

const GENERIC_NAMES = new Set(["User", "ユーザー"]);

const AI_PROMPTS = [
  {
    id: "summarize",
    label: "要点だけ教えて",
    icon: "sparkles" as const,
    responseTitle: "会議メモを3行で要約します",
    responseBody:
      "まず結論、次に決めること、最後に残課題という順で整理します。最初の一手が迷子にならない返し方を優先します。",
  },
  {
    id: "plan",
    label: "次の一手を決める",
    icon: "bot" as const,
    responseTitle: "今日の進め方を提案します",
    responseBody:
      "大きな作業を3つまでに絞り、依存関係のあるものから順に並べます。あとから振り返りやすい単位に分けます。",
  },
  {
    id: "debug",
    label: "不具合の切り分け",
    icon: "alert-circle" as const,
    responseTitle: "原因候補を段階的に狭めます",
    responseBody:
      "再現条件、ログ、境界条件の順で確認します。すぐ直す前に、どこまで壊れているかを短時間で見える化します。",
  },
] as const;

const STARTER_TOOLS = [
  {
    id: "workspace",
    title: "作業スペースから始める",
    description:
      "ファイルを開きながら全体像をつかみたいときの導線です。まず現状を読む人向けです。",
    icon: "folder-tree" as const,
  },
  {
    id: "skillCenter",
    title: "ツールを探して試す",
    description:
      "すでに用意されているスキルを見て、何ができるかを把握したいときに向いています。",
    icon: "puzzle" as const,
  },
  {
    id: "agent",
    title: "AIに相談しながら進める",
    description:
      "次の一手や実行方針を会話で決めたいときの入口です。保留タスクの整理にも向いています。",
    icon: "bot" as const,
  },
] as const;

const THEME_OPTIONS = [
  {
    mode: "kanagawa-dragon" as const,
    label: "Kanagawa",
    description: "落ち着いたコントラストで集中しやすい標準テーマです。",
    chipClassName:
      "bg-[#1f1f28] text-[#dcd7ba] border border-[#363646] shadow-[0_18px_40px_rgba(16,16,24,0.45)]",
    accentClassName: "bg-[#7e9cd8]",
    panelClassName: "bg-[#2a2a37] border border-[#3b3b51]",
    textClassName: "text-[#dcd7ba]",
    mutedClassName: "text-[#908e7c]",
  },
  {
    mode: "light" as const,
    label: "ライト",
    description: "白を基調にした明るい表示で、長文や一覧を読みやすくします。",
    chipClassName:
      "bg-white text-black border border-[#d2d2d7] shadow-[0_14px_32px_rgba(15,23,42,0.08)]",
    accentClassName: "bg-[#0a6ce9]",
    panelClassName: "bg-[#f5f5f7] border border-[#d2d2d7]",
    textClassName: "text-black",
    mutedClassName: "text-[rgba(0,0,0,0.58)]",
  },
  {
    mode: "dark" as const,
    label: "ダーク",
    description:
      "黒を基調にして情報の明暗差をはっきり見せる夜間向けテーマです。",
    chipClassName:
      "bg-[#111111] text-white border border-[#2c2c2e] shadow-[0_18px_40px_rgba(0,0,0,0.45)]",
    accentClassName: "bg-[#0a84ff]",
    panelClassName: "bg-[#1c1c1e] border border-[#38383a]",
    textClassName: "text-white",
    mutedClassName: "text-[rgba(235,235,245,0.6)]",
  },
  {
    mode: "system" as const,
    label: "システム",
    description: "OS設定に追従して明暗を自動で切り替えます。",
    chipClassName:
      "bg-[linear-gradient(135deg,#ffffff_0%,#f5f5f7_45%,#1c1c1e_46%,#000000_100%)] text-black border border-[#b8b8bf] shadow-[0_14px_32px_rgba(15,23,42,0.12)]",
    accentClassName: "bg-[#0a6ce9]",
    panelClassName:
      "bg-[rgba(255,255,255,0.92)] border border-[#b8b8bf] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]",
    textClassName: "text-black",
    mutedClassName: "text-[rgba(0,0,0,0.72)]",
  },
] as const;

export type OnboardingBubbleId = (typeof AI_PROMPTS)[number]["id"];
export type OnboardingStarterToolId = (typeof STARTER_TOOLS)[number]["id"];

export interface OnboardingCompletionPayload {
  userName: string;
  selectedBubbleId: OnboardingBubbleId;
  selectedStarterTool: OnboardingStarterToolId;
  themeMode: ThemeMode;
}

export interface OnboardingWizardProps {
  isOpen: boolean;
  initialName?: string;
  initialStarterTool?: OnboardingStarterToolId | null;
  initialThemeMode?: ThemeMode;
  allowDismiss?: boolean;
  onClose: () => void;
  onComplete: (payload: OnboardingCompletionPayload) => Promise<void> | void;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    "button:not([disabled])",
    "[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");
  return Array.from(container.querySelectorAll<HTMLElement>(selectors));
}

function normalizeInitialName(value?: string): string {
  if (!value) {
    return "";
  }
  const trimmed = value.trim();
  return GENERIC_NAMES.has(trimmed) ? "" : trimmed;
}

function getPreviewName(value: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : DEFAULT_PREVIEW_NAME;
}

export function isOnboardingStarterToolId(
  value: unknown,
): value is OnboardingStarterToolId {
  return STARTER_TOOLS.some((tool) => tool.id === value);
}

function ThemePreviewCard({ mode }: { mode: ThemeMode }): JSX.Element {
  const option =
    THEME_OPTIONS.find((candidate) => candidate.mode === mode) ??
    THEME_OPTIONS[0];

  return (
    <div
      className={clsx(
        "rounded-[28px] p-5 shadow-sm transition-colors duration-200",
        option.chipClassName,
      )}
      data-testid="onboarding-theme-preview"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p
            className={clsx(
              "text-xs uppercase tracking-[0.18em]",
              option.mutedClassName,
            )}
          >
            Preview
          </p>
          <h3
            className={clsx("mt-2 text-xl font-semibold", option.textClassName)}
          >
            {option.label}
          </h3>
          <p className={clsx("mt-2 text-sm leading-6", option.mutedClassName)}>
            {option.description}
          </p>
        </div>
        <span
          className={clsx("h-10 w-10 rounded-2xl", option.accentClassName)}
          aria-hidden="true"
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className={clsx("rounded-3xl p-4", option.panelClassName)}>
          <p
            className={clsx(
              "text-xs uppercase tracking-[0.18em]",
              option.mutedClassName,
            )}
          >
            Home
          </p>
          <p
            className={clsx(
              "mt-2 text-base font-semibold",
              option.textClassName,
            )}
          >
            次の一手をすぐ見つける
          </p>
        </div>
        <div className={clsx("rounded-3xl p-4", option.panelClassName)}>
          <p
            className={clsx(
              "text-xs uppercase tracking-[0.18em]",
              option.mutedClassName,
            )}
          >
            Helper
          </p>
          <p
            className={clsx(
              "mt-2 text-base font-semibold",
              option.textClassName,
            )}
          >
            情報の強弱が読みやすい
          </p>
        </div>
      </div>
    </div>
  );
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  initialName = "",
  initialStarterTool = null,
  initialThemeMode = DEFAULT_THEME_MODE,
  allowDismiss = true,
  onClose,
  onComplete,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const [currentStep, setCurrentStep] = useState(0);
  const [draftName, setDraftName] = useState(normalizeInitialName(initialName));
  const [selectedBubbleId, setSelectedBubbleId] =
    useState<OnboardingBubbleId | null>(null);
  const [selectedStarterTool, setSelectedStarterTool] =
    useState<OnboardingStarterToolId | null>(initialStarterTool);
  const [selectedThemeMode, setSelectedThemeMode] =
    useState<ThemeMode>(initialThemeMode);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setCurrentStep(0);
    setDraftName(normalizeInitialName(initialName));
    setSelectedBubbleId(null);
    setSelectedStarterTool(initialStarterTool);
    setSelectedThemeMode(initialThemeMode);
    setIsCompleting(false);
    setCompletionError(null);
  }, [initialName, initialStarterTool, initialThemeMode, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent): void => {
      if (!dialogRef.current) {
        return;
      }

      if (event.key === "Escape") {
        if (
          !allowDismiss ||
          isCompleting ||
          currentStep === COMPLETION_STEP_INDEX
        ) {
          return;
        }
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const elements = getFocusableElements(dialogRef.current);
        if (elements.length === 0) {
          event.preventDefault();
          return;
        }

        const first = elements[0];
        const last = elements[elements.length - 1];
        const active = document.activeElement;

        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [allowDismiss, currentStep, isCompleting, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const selectedPrompt =
    AI_PROMPTS.find((prompt) => prompt.id === selectedBubbleId) ?? null;
  const selectedTool =
    STARTER_TOOLS.find((tool) => tool.id === selectedStarterTool) ?? null;

  const canGoNext =
    currentStep === 0 ||
    (currentStep === 1 && selectedBubbleId !== null) ||
    (currentStep === 2 && selectedStarterTool !== null) ||
    currentStep >= 3;

  const handleNext = (): void => {
    if (!canGoNext || currentStep >= ONBOARDING_STEPS.length - 1) {
      return;
    }
    setCurrentStep((step) => step + 1);
  };

  const handleBack = (): void => {
    setCompletionError(null);
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const handleComplete = async (): Promise<void> => {
    if (!selectedBubbleId || !selectedStarterTool) {
      return;
    }

    setIsCompleting(true);
    setCompletionError(null);

    try {
      await onComplete({
        userName: draftName.trim(),
        selectedBubbleId,
        selectedStarterTool,
        themeMode: selectedThemeMode,
      });
      setCurrentStep(COMPLETION_STEP_INDEX);
    } catch (error) {
      setCompletionError(
        error instanceof Error
          ? error.message
          : "はじめてガイドの保存に失敗しました。",
      );
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-[rgba(15,23,42,0.56)] backdrop-blur-[2px]" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        data-testid="onboarding-wizard"
        className={clsx(
          "relative flex w-full max-w-[1040px] flex-col overflow-hidden rounded-[32px]",
          "border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-primary)_88%,rgba(15,23,42,0.16))]",
          "shadow-[0_30px_120px_rgba(15,23,42,0.22)]",
          "max-h-[min(100vh-24px,920px)]",
        )}
      >
        <header className="border-b border-[var(--border-subtle)] px-5 py-4 sm:px-8 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                Onboarding Wizard
              </p>
              <h2
                id={titleId}
                className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl"
              >
                最初の準備を3分で整える
              </h2>
              <p
                id={descriptionId}
                className="mt-3 text-sm leading-6 text-[var(--text-secondary)] sm:text-base"
              >
                名前、AIへの頼み方、最初に触りたい導線、見た目の好みを先に決めます。
                今あるアプリ構造を壊さず、上から重ねる形で案内します。
              </p>
            </div>

            {allowDismiss ? (
              <Button
                ref={closeButtonRef}
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isCompleting}
                aria-label="はじめてガイドを閉じる"
                className="shrink-0"
              >
                <Icon name="x" size={16} />
                閉じる
              </Button>
            ) : null}
          </div>

          {currentStep < ONBOARDING_STEPS.length ? (
            <ol
              className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
              data-testid="onboarding-step-indicator"
            >
              {ONBOARDING_STEPS.map((step, index) => {
                const isActive = index === currentStep;
                const isComplete = index < currentStep;

                return (
                  <li
                    key={step.id}
                    className={clsx(
                      "rounded-2xl border px-4 py-3 transition-colors duration-200",
                      isActive
                        ? "border-[var(--status-primary)] bg-[color-mix(in_srgb,var(--status-primary)_10%,transparent)]"
                        : isComplete
                          ? "border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--status-success)_10%,transparent)]"
                          : "border-[var(--border-subtle)] bg-[var(--bg-secondary)]",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={clsx(
                          "inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                          isActive || isComplete
                            ? "bg-[var(--status-primary)] text-white"
                            : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
                        )}
                      >
                        {isComplete ? (
                          <Icon name="check" size={16} />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                          Step {index + 1}
                        </p>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {step.label}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : null}
        </header>

        <div className="min-h-0 flex-1 overflow-auto px-5 py-5 sm:px-8 sm:py-6">
          {currentStep === 0 ? (
            <section
              className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
              data-testid="onboarding-step-name"
            >
              <div className="rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Step 1
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">
                  呼ばれたい名前を決める
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  空欄のままでも進めます。入力した名前は Dashboard の挨拶と、
                  はじめてガイドの完了サマリーに反映されます。
                </p>

                <div className="mt-6 space-y-3">
                  <label
                    htmlFor="onboarding-name-input"
                    className="text-sm font-medium text-[var(--text-primary)]"
                  >
                    表示名
                  </label>
                  <Input
                    id="onboarding-name-input"
                    value={draftName}
                    onChange={setDraftName}
                    placeholder="例: 田中"
                    aria-describedby="onboarding-name-helper"
                    onEnter={handleNext}
                  />
                  <p
                    id="onboarding-name-helper"
                    className="text-sm text-[var(--text-secondary)]"
                  >
                    後で設定画面から何度でも見直せます。
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] border border-[var(--border-subtle)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent-primary)_12%,var(--bg-secondary))_0%,color-mix(in_srgb,var(--status-info)_8%,var(--bg-secondary))_100%)] p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  Preview
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">
                  ホームでこう迎えます
                </h3>
                <div
                  className="mt-6 rounded-[28px] border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-primary)_68%,transparent)] p-5 shadow-sm"
                  data-testid="onboarding-name-preview"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Home
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
                    おはようございます、{getPreviewName(draftName)}さん
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                    今日の保留と最近の動きを先に見せます。空欄なら汎用名のまま始めます。
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          {currentStep === 1 ? (
            <section
              className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]"
              data-testid="onboarding-step-ai"
            >
              <div className="rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Step 2
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">
                  AI への頼み方をひとつ試す
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  既存の SuggestionBubble
                  をそのまま使い、オンボーディング専用のモック応答だけを重ねています。
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {AI_PROMPTS.map((prompt) => {
                    const isSelected = prompt.id === selectedBubbleId;
                    return (
                      <div
                        key={prompt.id}
                        className={clsx(
                          "rounded-full border p-1 transition-colors duration-200",
                          isSelected
                            ? "border-[var(--status-primary)] bg-[color-mix(in_srgb,var(--status-primary)_12%,transparent)]"
                            : "border-transparent",
                        )}
                        data-testid={`onboarding-ai-option-${prompt.id}`}
                      >
                        <SuggestionBubble
                          label={prompt.label}
                          icon={prompt.icon}
                          onClick={() => setSelectedBubbleId(prompt.id)}
                          size="lg"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Mock Response
                </p>
                {selectedPrompt ? (
                  <div
                    className="mt-4 rounded-[24px] border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-tertiary)_90%,transparent)] p-5"
                    data-testid="onboarding-ai-response"
                  >
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent-primary)_14%,transparent)] text-[var(--accent-primary)]">
                        <Icon name="bot" size={18} />
                      </span>
                      <div>
                        <h4 className="text-base font-semibold text-[var(--text-primary)]">
                          {selectedPrompt.responseTitle}
                        </h4>
                        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                          {selectedPrompt.responseBody}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-[24px] border border-dashed border-[var(--border-subtle)] bg-[var(--bg-tertiary)] p-5">
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                      ひとつ選ぶと、ここに AI
                      の返し方サンプルを表示します。ネットワークには接続しません。
                    </p>
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {currentStep === 2 ? (
            <section data-testid="onboarding-step-starter">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Step 3
              </p>
              <h3 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">
                使い始めたい用途を選ぶ
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                ここでは「何から始めたいか」だけを保存します。ツールの即時インストールは行いません。
              </p>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {STARTER_TOOLS.map((tool) => {
                  const isSelected = tool.id === selectedStarterTool;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => setSelectedStarterTool(tool.id)}
                      data-testid={`onboarding-starter-${tool.id}`}
                      className={clsx(
                        "rounded-[28px] border p-6 text-left transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)]",
                        isSelected
                          ? "border-[var(--status-primary)] bg-[color-mix(in_srgb,var(--status-primary)_12%,transparent)] shadow-sm"
                          : "border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--border-default)] hover:bg-[var(--bg-tertiary)]",
                      )}
                    >
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent-primary)_12%,transparent)] text-[var(--accent-primary)]">
                        <Icon name={tool.icon} size={18} />
                      </span>
                      <h4 className="mt-5 text-lg font-semibold text-[var(--text-primary)]">
                        {tool.title}
                      </h4>
                      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                        {tool.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {currentStep === 3 ? (
            <section
              className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"
              data-testid="onboarding-step-theme"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Step 4
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">
                  見た目を決める
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  既存 ThemeMode 契約を崩さず、オンボーディング専用の preview
                  card で選びます。
                </p>

                <div className="mt-6 space-y-3">
                  {THEME_OPTIONS.map((option) => {
                    const isSelected = option.mode === selectedThemeMode;
                    return (
                      <button
                        key={option.mode}
                        type="button"
                        onClick={() => setSelectedThemeMode(option.mode)}
                        data-testid={`onboarding-theme-${option.mode}`}
                        className={clsx(
                          "flex w-full items-start gap-4 rounded-[24px] border p-4 text-left transition-all duration-200",
                          "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)]",
                          isSelected
                            ? "border-[var(--status-primary)] bg-[color-mix(in_srgb,var(--status-primary)_12%,transparent)]"
                            : "border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]",
                        )}
                      >
                        <span
                          className={clsx(
                            "mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white",
                            option.accentClassName,
                          )}
                        >
                          <Icon
                            name={
                              option.mode === "light"
                                ? "sun"
                                : option.mode === "dark"
                                  ? "moon"
                                  : option.mode === "system"
                                    ? "monitor"
                                    : "sparkles"
                            }
                            size={18}
                          />
                        </span>
                        <div>
                          <h4 className="text-base font-semibold text-[var(--text-primary)]">
                            {option.label}
                          </h4>
                          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                            {option.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <ThemePreviewCard mode={selectedThemeMode} />
            </section>
          ) : null}

          {currentStep === COMPLETION_STEP_INDEX ? (
            <section
              className="mx-auto flex max-w-3xl flex-col items-center text-center"
              data-testid="onboarding-step-complete"
            >
              <span className="inline-flex h-20 w-20 items-center justify-center rounded-[28px] bg-[color-mix(in_srgb,var(--status-success)_14%,transparent)] text-[var(--status-success)] shadow-sm">
                <Icon name="check-circle" size={36} />
              </span>
              <p className="mt-6 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Ready
              </p>
              <h3 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
                最初の準備が整いました
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                名前、最初に触る導線、テーマを保存しました。必要になったら設定画面からいつでもこのガイドを開き直せます。
              </p>

              <div className="mt-8 grid w-full gap-4 sm:grid-cols-3">
                <div className="rounded-[24px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5 text-left">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Name
                  </p>
                  <p className="mt-3 text-base font-semibold text-[var(--text-primary)]">
                    {getPreviewName(draftName)}
                  </p>
                </div>
                <div className="rounded-[24px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5 text-left">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Start Here
                  </p>
                  <p className="mt-3 text-base font-semibold text-[var(--text-primary)]">
                    {selectedTool?.title ?? "未選択"}
                  </p>
                </div>
                <div className="rounded-[24px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5 text-left">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Theme
                  </p>
                  <p className="mt-3 text-base font-semibold text-[var(--text-primary)]">
                    {THEME_OPTIONS.find(
                      (option) => option.mode === selectedThemeMode,
                    )?.label ?? "Kanagawa"}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button onClick={onClose} size="lg">
                  ホームへ進む
                </Button>
                <Button onClick={onClose} variant="secondary" size="lg">
                  後で設定から見直す
                </Button>
              </div>
            </section>
          ) : null}
        </div>

        {currentStep < ONBOARDING_STEPS.length ? (
          <footer className="border-t border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-primary)_92%,transparent)] px-5 py-4 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {completionError ? (
                  <p
                    className="text-sm text-[var(--status-error)]"
                    data-testid="onboarding-completion-error"
                  >
                    {completionError}
                  </p>
                ) : (
                  <p className="text-sm text-[var(--text-secondary)]">
                    {currentStep === 0
                      ? "空欄のままでも進めます。"
                      : currentStep === 1
                        ? "Bubble を1つ選ぶと次へ進めます。"
                        : currentStep === 2
                          ? "保存されるのは「最初の導線」の意図だけです。"
                          : "完了時にテーマ設定へ反映します。"}
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                {currentStep > 0 ? (
                  <Button variant="secondary" onClick={handleBack}>
                    戻る
                  </Button>
                ) : null}

                {currentStep < ONBOARDING_STEPS.length - 1 ? (
                  <Button onClick={handleNext} disabled={!canGoNext}>
                    次へ
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      void handleComplete();
                    }}
                    loading={isCompleting}
                    disabled={!canGoNext}
                  >
                    完了する
                  </Button>
                )}
              </div>
            </div>
          </footer>
        ) : null}
      </div>
    </div>
  );
};

OnboardingWizard.displayName = "OnboardingWizard";
