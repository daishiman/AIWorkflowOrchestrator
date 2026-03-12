import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Button } from "../../../../components/atoms/Button";
import { EmptyState } from "../../../../components/atoms/EmptyState";
import { Icon } from "../../../../components/atoms/Icon";
import { Input } from "../../../../components/atoms/Input";
import { SuggestionBubble } from "../../../../components/atoms/SuggestionBubble";
import {
  ONBOARDING_STEP_LABELS,
  ONBOARDING_SUGGESTIONS,
  ONBOARDING_THEME_OPTIONS,
  type OnboardingSkillCard,
  type OnboardingThemeMode,
} from "./constants";

const STEP_TEST_IDS = [
  "onboarding-step-name",
  "onboarding-step-chat",
  "onboarding-step-tool",
  "onboarding-step-theme",
] as const;

const FOCUSABLE_SELECTOR = [
  "button:not([disabled]):not([tabindex='-1'])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export interface OnboardingCompletionPayload {
  userName: string;
  selectedSkillName: string | null;
  theme: OnboardingThemeMode;
}

export interface OnboardingWizardProps {
  defaultName: string;
  defaultTheme: OnboardingThemeMode;
  skillCards: readonly OnboardingSkillCard[];
  isSkillsLoading?: boolean;
  skillLoadError?: string | null;
  onApplyTheme: (theme: OnboardingThemeMode) => Promise<void> | void;
  onSkip: () => Promise<void> | void;
  onComplete: (
    payload: OnboardingCompletionPayload,
  ) => Promise<void> | void;
  onFinished: () => void;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message !== "") {
    return error.message;
  }
  return "はじめようの保存に失敗しました";
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  defaultName,
  defaultTheme,
  skillCards,
  isSkillsLoading = false,
  skillLoadError = null,
  onApplyTheme,
  onSkip,
  onComplete,
  onFinished,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [nameInput, setNameInput] = useState(defaultName);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<
    string | null
  >(null);
  const [selectedSkillName, setSelectedSkillName] = useState<string | null>(
    null,
  );
  const [selectedTheme, setSelectedTheme] =
    useState<OnboardingThemeMode>(defaultTheme);
  const [hasSelectedTheme, setHasSelectedTheme] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCompletionVisible, setIsCompletionVisible] = useState(false);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const stepContainerRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const completionRef = useRef<HTMLDivElement | null>(null);

  const selectedSuggestion = useMemo(
    () =>
      ONBOARDING_SUGGESTIONS.find(
        (suggestion) => suggestion.id === selectedSuggestionId,
      ) ?? null,
    [selectedSuggestionId],
  );
  const trimmedName = nameInput.trim();

  useEffect(() => {
    setNameInput(defaultName);
  }, [defaultName]);

  useEffect(() => {
    setSelectedTheme(defaultTheme);
    setHasSelectedTheme(false);
  }, [defaultTheme]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (isCompletionVisible) {
      completionRef.current?.focus();
      const timeoutId = window.setTimeout(() => {
        onFinished();
      }, 3000);
      return () => window.clearTimeout(timeoutId);
    }

    const focusTarget =
      stepIndex === 0
        ? nameInputRef.current
        : stepContainerRef.current?.querySelector<HTMLElement>(
            FOCUSABLE_SELECTOR,
          ) ?? dialogRef.current;

    const frame = window.requestAnimationFrame(() => {
      focusTarget?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isCompletionVisible, onFinished, stepIndex]);

  const stepIsValid = useMemo(() => {
    switch (stepIndex) {
      case 0:
        return trimmedName.length >= 1;
      case 1:
        return selectedSuggestion !== null;
      case 2:
        return selectedSkillName !== null;
      case 3:
        return hasSelectedTheme;
      default:
        return false;
    }
  }, [
    hasSelectedTheme,
    selectedSkillName,
    selectedSuggestion,
    selectedTheme,
    stepIndex,
    trimmedName.length,
  ]);

  const primaryLabel = stepIndex === 3 ? "準備完了!" : "次へ";

  const handleSkip = async (): Promise<void> => {
    if (isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await onSkip();
    } catch (error) {
      setErrorMessage(toErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepAdvance = async (): Promise<void> => {
    if (!stepIsValid || isSubmitting) {
      return;
    }

    setErrorMessage(null);

    if (stepIndex < ONBOARDING_STEP_LABELS.length - 1) {
      setStepIndex((currentStep) => currentStep + 1);
      return;
    }

    setIsSubmitting(true);
    try {
      await onComplete({
        userName: trimmedName,
        selectedSkillName,
        theme: selectedTheme,
      });
      setIsCompletionVisible(true);
    } catch (error) {
      setErrorMessage(toErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleThemeSelect = async (theme: OnboardingThemeMode) => {
    setSelectedTheme(theme);
    setHasSelectedTheme(true);
    setErrorMessage(null);

    try {
      await onApplyTheme(theme);
    } catch (error) {
      setErrorMessage(toErrorMessage(error));
    }
  };

  const handleDialogKeyDown = async (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key === "Escape" && !isCompletionVisible) {
      event.preventDefault();
      await handleSkip();
      return;
    }

    if (event.key !== "Tab" || !dialogRef.current) {
      return;
    }

    const focusableElements = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );

    if (focusableElements.length === 0) {
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey && activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const renderStepContent = () => {
    switch (stepIndex) {
      case 0:
        return (
          <section
            className="space-y-6"
            data-testid={STEP_TEST_IDS[0]}
            ref={stepContainerRef}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-[color-mix(in_srgb,var(--status-primary)_14%,transparent)] p-4 text-[var(--status-primary)]">
                <Icon name="sparkles" size={40} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  Step 1
                </p>
                <h2
                  className="text-3xl font-semibold text-[var(--text-primary)]"
                  id="onboarding-heading"
                >
                  あなたのお名前は?
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  ニックネームで大丈夫です。あとから設定で変えられます。
                </p>
              </div>
            </div>

            <div className="mx-auto max-w-xl space-y-4">
              <Input
                ref={nameInputRef}
                id="onboarding-name-input"
                value={nameInput}
                onChange={setNameInput}
                placeholder="ニックネームでOK"
                aria-label="オンボーディングの名前入力"
                leftIcon="user"
                className="rounded-[20px] border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-secondary)_88%,transparent)] px-1 py-1"
              />
              <div className="rounded-[24px] border border-dashed border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-secondary)_86%,transparent)] px-5 py-4 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Preview
                </p>
                <p
                  className="mt-2 text-xl font-semibold text-[var(--text-primary)]"
                  data-testid="onboarding-name-preview"
                >
                  こんにちは、{trimmedName || "あなた"}さん!
                </p>
              </div>
            </div>
          </section>
        );
      case 1:
        return (
          <section
            className="space-y-6"
            data-testid={STEP_TEST_IDS[1]}
            ref={stepContainerRef}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-[color-mix(in_srgb,var(--status-info)_16%,transparent)] p-4 text-[var(--status-info)]">
                <Icon name="message-circle" size={40} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  Step 2
                </p>
                <h2 className="text-3xl font-semibold text-[var(--text-primary)]">
                  AIに話しかけてみよう
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  気になるものをタップしてみてください。
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {ONBOARDING_SUGGESTIONS.map((suggestion) => {
                const isSelected = selectedSuggestionId === suggestion.id;
                return (
                  <div
                    key={suggestion.id}
                    className={clsx(
                      "rounded-full transition-transform duration-300",
                      isSelected && "scale-[1.03]",
                    )}
                  >
                    <SuggestionBubble
                      label={suggestion.label}
                      size="lg"
                      onClick={() => {
                        setSelectedSuggestionId(suggestion.id);
                        setErrorMessage(null);
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div
              className={clsx(
                "rounded-[28px] border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-secondary)_88%,transparent)] px-6 py-5 shadow-sm transition-all duration-300",
                selectedSuggestion
                  ? "translate-y-0 opacity-100"
                  : "translate-y-2 opacity-60",
              )}
              data-testid="onboarding-mock-response"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Mock Reply
              </p>
              <p className="mt-3 text-base leading-7 text-[var(--text-primary)]">
                {selectedSuggestion?.response ??
                  "タップすると、ここにAIの返答イメージが表示されます。"}
              </p>
            </div>
          </section>
        );
      case 2:
        return (
          <section
            className="space-y-6"
            data-testid={STEP_TEST_IDS[2]}
            ref={stepContainerRef}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-[color-mix(in_srgb,var(--status-success)_16%,transparent)] p-4 text-[var(--status-success)]">
                <Icon name="puzzle" size={40} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  Step 3
                </p>
                <h2 className="text-3xl font-semibold text-[var(--text-primary)]">
                  ツールを1つ追加してみよう
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  使ってみたいものを1つだけ選んでください。
                </p>
              </div>
            </div>

            {skillCards.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-secondary)_88%,transparent)] px-6 py-8">
                <EmptyState
                  title={
                    isSkillsLoading
                      ? "利用できるツールを確認しています"
                      : "利用できるツールが見つかりませんでした"
                  }
                  description={
                    skillLoadError ??
                    "スキル一覧が読み込まれるまで、そのまま少しお待ちください。"
                  }
                  icon={isSkillsLoading ? "loader-2" : "alert-circle"}
                  mood={isSkillsLoading ? "encouraging" : "welcoming"}
                  compact
                />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {skillCards.map((skillCard) => {
                  const isSelected = selectedSkillName === skillCard.skillName;
                  return (
                    <button
                      key={skillCard.skillName}
                      type="button"
                      className={clsx(
                        "group rounded-[28px] border px-5 py-5 text-left transition-all duration-300",
                        "bg-[color-mix(in_srgb,var(--bg-secondary)_92%,transparent)] shadow-sm",
                        isSelected
                          ? "border-[var(--status-success)] bg-[color-mix(in_srgb,var(--status-success)_12%,var(--bg-secondary))] shadow-[0_18px_50px_rgba(15,118,110,0.18)]"
                          : "border-[var(--border-subtle)] hover:-translate-y-1 hover:border-[var(--status-primary)] hover:shadow-[0_20px_45px_rgba(15,23,42,0.10)]",
                      )}
                      data-testid={`onboarding-skill-card-${skillCard.skillName}`}
                      onClick={() => {
                        setSelectedSkillName(skillCard.skillName);
                        setErrorMessage(null);
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="rounded-2xl bg-[color-mix(in_srgb,var(--status-primary)_14%,transparent)] p-3 text-[var(--status-primary)]">
                          <Icon name={skillCard.icon} size={28} />
                        </div>
                        <span
                          className={clsx(
                            "rounded-full border px-2.5 py-1 text-xs font-medium",
                            skillCard.availability === "available"
                              ? "border-[var(--border-subtle)] text-[var(--text-muted)]"
                              : "border-[var(--status-success)] text-[var(--status-success)]",
                          )}
                        >
                          {skillCard.availability === "available"
                            ? "追加候補"
                            : "追加済み"}
                        </span>
                      </div>
                      <div className="mt-4 space-y-2">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                          {skillCard.label}
                        </h3>
                        <p className="text-sm leading-6 text-[var(--text-secondary)]">
                          {skillCard.description}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
                          {skillCard.skillName}
                        </span>
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--status-success)_16%,transparent)] px-3 py-1 text-xs font-medium text-[var(--status-success)]">
                            <Icon name="check-circle" size={14} />
                            選択中
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        );
      case 3:
      default:
        return (
          <section
            className="space-y-6"
            data-testid={STEP_TEST_IDS[3]}
            ref={stepContainerRef}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-[color-mix(in_srgb,var(--status-warning)_16%,transparent)] p-4 text-[var(--status-warning)]">
                <Icon name="sun" size={40} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  Step 4
                </p>
                <h2 className="text-3xl font-semibold text-[var(--text-primary)]">
                  見た目を選ぼう
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  タップすると画面全体のテーマが切り替わります。
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {ONBOARDING_THEME_OPTIONS.map((themeOption) => {
                const isSelected = selectedTheme === themeOption.mode;
                return (
                  <button
                    key={themeOption.mode}
                    type="button"
                    className={clsx(
                      "rounded-[28px] border px-5 py-5 text-left transition-all duration-300",
                      isSelected
                        ? "border-[var(--status-primary)] bg-[color-mix(in_srgb,var(--status-primary)_12%,var(--bg-secondary))] shadow-[0_18px_48px_rgba(37,99,235,0.18)]"
                        : "border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-secondary)_92%,transparent)] hover:-translate-y-1 hover:border-[var(--status-primary)] hover:shadow-[0_20px_45px_rgba(15,23,42,0.10)]",
                    )}
                    data-testid={`onboarding-theme-card-${themeOption.mode}`}
                    onClick={() => void handleThemeSelect(themeOption.mode)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                          {themeOption.label}
                        </h3>
                        <p className="text-sm leading-6 text-[var(--text-secondary)]">
                          {themeOption.description}
                        </p>
                      </div>
                      {isSelected ? (
                        <div className="rounded-full bg-[color-mix(in_srgb,var(--status-primary)_14%,transparent)] p-2 text-[var(--status-primary)]">
                          <Icon name="check-circle" size={18} />
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-5 flex gap-2">
                      {themeOption.swatches.map((color) => (
                        <span
                          key={`${themeOption.mode}-${color}`}
                          className="h-12 flex-1 rounded-2xl border border-white/10"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-[color-mix(in_srgb,var(--bg-primary)_35%,rgba(15,23,42,0.72))] px-4 py-6 backdrop-blur-md sm:px-6"
      data-testid="onboarding-overlay"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--status-primary)_18%,transparent),transparent_58%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl items-center justify-center">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-heading"
          className="relative w-full rounded-[32px] border border-[color-mix(in_srgb,var(--border-subtle)_85%,transparent)] bg-[color-mix(in_srgb,var(--bg-primary)_94%,rgba(9,13,28,0.92))] shadow-[0_32px_120px_rgba(15,23,42,0.32)]"
          data-testid="onboarding-wizard"
          onKeyDown={(event) => void handleDialogKeyDown(event)}
        >
          <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_30%,transparent_70%,rgba(255,255,255,0.04))]" />
          <div className="relative px-6 pb-6 pt-6 sm:px-8 sm:pb-8">
            <header className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-secondary)_92%,transparent)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  はじめよう
                </span>
                <span className="text-sm text-[var(--text-muted)]">
                  {stepIndex + 1} / {ONBOARDING_STEP_LABELS.length}
                </span>
              </div>

              <ol
                className="grid gap-3 sm:grid-cols-4"
                data-testid="onboarding-step-indicator"
              >
                {ONBOARDING_STEP_LABELS.map((label, index) => {
                  const isActive = index === stepIndex;
                  const isComplete = index < stepIndex;
                  return (
                    <li
                      key={label}
                      className={clsx(
                        "rounded-[22px] border px-4 py-3 transition-all duration-300",
                        isActive
                          ? "border-[var(--status-primary)] bg-[color-mix(in_srgb,var(--status-primary)_14%,transparent)]"
                          : "border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-secondary)_88%,transparent)]",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={clsx(
                            "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                            isComplete || isActive
                              ? "bg-[var(--status-primary)] text-[var(--text-inverse)]"
                              : "bg-[var(--bg-tertiary)] text-[var(--text-muted)]",
                          )}
                          aria-current={isActive ? "step" : undefined}
                        >
                          {isComplete ? <Icon name="check" size={16} /> : index + 1}
                        </span>
                        <div className="space-y-0.5">
                          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            Step
                          </p>
                          <p className="text-sm font-medium text-[var(--text-primary)]">
                            {label}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </header>

            <div className="mt-8">
              {isCompletionVisible ? (
                <div
                  ref={completionRef}
                  tabIndex={-1}
                  className="relative overflow-hidden rounded-[28px] border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-secondary)_90%,transparent)] px-6 py-12"
                  data-testid="onboarding-step-complete"
                >
                  <div className="pointer-events-none absolute inset-0">
                    {Array.from({ length: 12 }, (_, index) => {
                      const left = 8 + (index % 6) * 15;
                      const top = index < 6 ? 8 : 22;
                      const colors = [
                        "var(--status-primary)",
                        "var(--status-success)",
                        "var(--status-warning)",
                      ];
                      return (
                        <span
                          key={`confetti-${index}`}
                          className="absolute h-2.5 w-2.5 rounded-full opacity-80 animate-bounce"
                          style={{
                            left: `${left}%`,
                            top: `${top}%`,
                            backgroundColor: colors[index % colors.length],
                            animationDelay: `${index * 80}ms`,
                          }}
                        />
                      );
                    })}
                  </div>
                  <EmptyState
                    title={`${trimmedName || "あなた"}さん、準備完了です!`}
                    description="3秒後にパーソナライズされたホームへ戻ります。"
                    icon="sparkles"
                    mood="celebrating"
                    className="min-h-[280px]"
                  />
                </div>
              ) : (
                renderStepContent()
              )}
            </div>

            {isCompletionVisible ? null : (
              <footer className="mt-8 space-y-4 border-t border-[var(--border-subtle)] pt-6">
                {errorMessage ? (
                  <p
                    className="rounded-2xl border border-[color-mix(in_srgb,var(--status-error)_35%,transparent)] bg-[color-mix(in_srgb,var(--status-error)_10%,transparent)] px-4 py-3 text-sm text-[var(--status-error)]"
                    data-testid="onboarding-error-message"
                  >
                    {errorMessage}
                  </p>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => void handleSkip()}
                    disabled={isSubmitting}
                  >
                    あとで
                  </Button>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                      disabled={stepIndex === 0 || isSubmitting}
                    >
                      戻る
                    </Button>
                    <Button
                      className={clsx(
                        stepIsValid && "animate-pulse",
                        "min-w-[140px]",
                      )}
                      onClick={() => void handleStepAdvance()}
                      disabled={!stepIsValid || (stepIndex === 2 && skillCards.length === 0)}
                      loading={isSubmitting}
                      data-testid="onboarding-primary-action"
                    >
                      {primaryLabel}
                    </Button>
                  </div>
                </div>
              </footer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

OnboardingWizard.displayName = "OnboardingWizard";
