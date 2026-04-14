/**
 * @file ConversationRoundStep.tsx
 * @description 6問・2ページ構成のインタビューフォームコンポーネント（Step 1）
 * @task UT-SKILL-WIZARD-W1-par-02b
 *
 * Page 1: Q1（利用者）/ Q2（入力データ）/ Q3（実行タイミング）
 * Page 2: Q4（出力先）/ Q5（外部ツール連携）/ Q6（出力フォーマット）
 * Q3「定期実行」選択時のみ ScheduleConfigInput をインライン展開する。
 * Q5 は category="external-integration" のとき必須マーク表示（ブロックしない）。
 */

import React, { useEffect, useRef, useState } from "react";
import type {
  ConversationAnswers,
  QuestionAnswer,
  SkillInfoFormData,
  SmartDefaultResult,
  SkillWizardScheduleConfig,
} from "@repo/shared/types/skillCreator";
import {
  resolveSemanticLabel,
  SEMANTIC_LABEL_MAP,
  type QuestionSemanticLabelMap,
} from "@repo/shared/types/skillWizard";
import { ApplySummaryCard } from "./ApplySummaryCard";
import { InterviewProgressBar } from "./InterviewProgressBar";
import { validateSkillWizardScheduleConfig } from "../../../utils/scheduleConfigValidator";

// ─── 問定義 ──────────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    key: "q1",
    label: "Q1: 利用者（誰が使うか）",
    options: ["自分のみ", "チームメンバー", "社内全体", "外部ユーザー"],
  },
  {
    key: "q2",
    label: "Q2: 入力データ（何を渡すか）",
    options: ["テキスト", "ファイル", "URLリンク", "構造化データ"],
  },
  {
    key: "q3",
    label: "Q3: 実行タイミング",
    options: ["手動実行", "定期実行", "イベント駆動", "都度判断"],
  },
  {
    key: "q4",
    label: "Q4: 出力先（どこへ）",
    options: ["チャット返信", "ファイル保存", "外部ツール", "通知"],
  },
  {
    key: "q5",
    label: "Q5: 外部ツール連携",
    options: ["なし", "Slack", "GitHub", "その他"],
  },
  {
    key: "q6",
    label: "Q6: 出力フォーマット",
    options: ["Markdown", "プレーンテキスト", "JSON", "箇条書き"],
  },
] as const;

type QuestionKey = keyof ConversationAnswers;
type QuestionOption = (typeof QUESTIONS)[number]["options"][number];

const DEFAULT_TIMEZONE = "Asia/Tokyo";
const DEFAULT_SCHEDULE_CONFIG: SkillWizardScheduleConfig = {
  cronExpression: "",
  timezone: DEFAULT_TIMEZONE,
};

const TIMEZONE_OPTIONS =
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : [
        "Asia/Tokyo",
        "UTC",
        "America/New_York",
        "America/Los_Angeles",
        "Europe/London",
        "Europe/Paris",
        "Asia/Singapore",
        "Australia/Sydney",
      ];

function isQuestionAnswered(answer: QuestionAnswer): boolean {
  const selectedOptions = answer.selectedOptions ?? [];
  const freeText = answer.freeText ?? "";
  return (
    selectedOptions.length > 0 ||
    freeText.trim().length > 0 ||
    answer.scheduleConfig !== undefined
  );
}

const QUESTION_KEYS = [
  "q1",
  "q2",
  "q3",
  "q4",
  "q5",
  "q6",
] as const satisfies readonly QuestionKey[];

const MAIN_TOOL_BADGE_ENABLED = true;

interface MainToolBadgeProps {
  questionKey: QuestionKey;
  optionValue: string;
  selectedOptions: readonly string[];
}

function shouldShowMainToolBadge({
  questionKey,
  optionValue,
  selectedOptions,
}: MainToolBadgeProps): boolean {
  return (
    MAIN_TOOL_BADGE_ENABLED &&
    questionKey === "q5" &&
    selectedOptions.length >= 2 &&
    selectedOptions[0] === optionValue
  );
}

function createEmptyAnswers(): ConversationAnswers {
  return {
    q1: { selectedOptions: [], freeText: "" },
    q2: { selectedOptions: [], freeText: "" },
    q3: { selectedOptions: [], freeText: "", scheduleConfig: undefined },
    q4: { selectedOptions: [], freeText: "" },
    q5: { selectedOptions: [], freeText: "" },
    q6: { selectedOptions: [], freeText: "" },
  };
}

function createQuestionAnswer(
  defaultValue: string | null,
  options: readonly QuestionOption[],
  questionId: string,
  labelMap: QuestionSemanticLabelMap = SEMANTIC_LABEL_MAP,
): QuestionAnswer {
  if (!defaultValue) {
    return { selectedOptions: [], freeText: "" };
  }

  const rawValue = defaultValue.trim();
  // toLowerCase() で正規化した値を map ルックアップに使用する。
  // 日本語文字列は toLowerCase() で変化しないため、日英どちらの入力にも対応できる。
  const normalizedKey = rawValue.toLowerCase();

  // notion は "その他" へマップし、freeText に "Notion" を保持する特別ケース。
  // resolveSemanticLabel 単体では freeText の設定ができないため先行チェックする。
  if (normalizedKey === "notion" && options.includes("その他")) {
    return { selectedOptions: ["その他"], freeText: "Notion" };
  }

  // SEMANTIC_LABEL_MAP（@repo/shared）を参照して rawValue を UI ラベルへ正規化する。
  // 未定義の questionId や rawValue はフォールバックとして元の値をそのまま使用する。
  const resolved = resolveSemanticLabel(normalizedKey, questionId, labelMap);
  const displayValue =
    resolved === normalizedKey ? rawValue : (resolved ?? rawValue);

  if (options.includes(displayValue as QuestionOption)) {
    // SmartDefaultResult の string → selectedOptions: string[] 変換ポイント
    return { selectedOptions: [displayValue], freeText: "" };
  }

  return { selectedOptions: [], freeText: displayValue };
}

export function applySmartDefaults(
  answers: ConversationAnswers,
  smartDefaults: SmartDefaultResult,
): ConversationAnswers {
  const q1 = isQuestionAnswered(answers.q1)
    ? answers.q1
    : createQuestionAnswer(smartDefaults.who, QUESTIONS[0].options, "q1");
  const q2 = isQuestionAnswered(answers.q2)
    ? answers.q2
    : createQuestionAnswer(smartDefaults.input, QUESTIONS[1].options, "q2");
  const q3 = isQuestionAnswered(answers.q3)
    ? answers.q3
    : {
        ...createQuestionAnswer(
          smartDefaults.timing,
          QUESTIONS[2].options,
          "q3",
        ),
        scheduleConfig:
          smartDefaults.timing === "scheduled" ||
          smartDefaults.timing === "定期実行"
            ? DEFAULT_SCHEDULE_CONFIG
            : undefined,
      };
  const q4 = isQuestionAnswered(answers.q4)
    ? answers.q4
    : createQuestionAnswer(smartDefaults.output, QUESTIONS[3].options, "q4");
  const q5 = isQuestionAnswered(answers.q5)
    ? answers.q5
    : createQuestionAnswer(smartDefaults.tool, QUESTIONS[4].options, "q5");
  const q6 = isQuestionAnswered(answers.q6)
    ? answers.q6
    : createQuestionAnswer(smartDefaults.format, QUESTIONS[5].options, "q6");

  return { q1, q2, q3, q4, q5, q6 };
}

function resolveGenerationMethod(
  answers: ConversationAnswers,
): "complete" | "skip" {
  return QUESTION_KEYS.every((key) => isQuestionAnswered(answers[key]))
    ? "complete"
    : "skip";
}
// ─── Props ────────────────────────────────────────────────────────────────────

export interface ConversationRoundStepProps {
  formData: SkillInfoFormData;
  smartDefaults: SmartDefaultResult;
  /** 初期回答値（非制御：マウント後の prop 変更は反映しない） */
  answers: ConversationAnswers;
  onAnswersChange: (answers: ConversationAnswers) => void;
  onBack: () => void;
  onGenerate: (method: "skip" | "complete") => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * 6問・2ページのインタビュー形式でスキル設定を集める Step 1 コンポーネント。
 *
 * - Page 1: Q1〜Q3
 * - Page 2: Q4〜Q6
 * - Q3 で「定期実行」を選んだ場合のみ、cron とタイムゾーンの設定欄を展開する
 * - smart defaults は初回描画時に回答へ反映する
 */
export const ConversationRoundStep = ({
  formData,
  smartDefaults,
  answers,
  onAnswersChange,
  onBack,
  onGenerate,
}: ConversationRoundStepProps) => {
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);
  // smartDefaults は初回描画時に親 state とローカル state の両方へ同期する。
  const [internalAnswers, setInternalAnswers] = useState<ConversationAnswers>(
    () => applySmartDefaults(answers ?? createEmptyAnswers(), smartDefaults),
  );
  const [showSummaryCard, setShowSummaryCard] = useState(false);
  const [scheduleTouched, setScheduleTouched] = useState(false);
  const [timezoneTouched, setTimezoneTouched] = useState(false);

  const isQ5Required = formData.category === "external-integration";
  const currentQuestion = currentPage === 1 ? 1 : 4;

  // 内部操作による親→子エコーを識別するフラグ（問題12: 無限ループ防止）
  const isInternalChangeRef = useRef(false);

  useEffect(() => {
    isInternalChangeRef.current = true;
    onAnswersChange(internalAnswers);
  }, [internalAnswers, onAnswersChange]);

  // answers prop 変化時に internalAnswers をリセット（問題12修正）
  // 親から直接変更（リトライ等）の場合のみリセット。内部操作による echo は isInternalChangeRef で除外。
  useEffect(() => {
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }
    setInternalAnswers(
      applySmartDefaults(answers ?? createEmptyAnswers(), smartDefaults),
    );
  }, [answers, smartDefaults]);

  // ─── ハンドラ ───────────────────────────────────────────────────────────────

  const handleOptionSelect = (key: QuestionKey, option: string) => {
    setInternalAnswers((prev) => {
      const current = prev[key].selectedOptions ?? [];
      const isSelected = current.includes(option);
      const nextSelectedOptions = isSelected
        ? current.filter((o) => o !== option) // 解除
        : [...current, option]; // 追加

      const next: ConversationAnswers = {
        ...prev,
        [key]: { ...prev[key], selectedOptions: nextSelectedOptions },
      };

      if (key === "q3") {
        const hasSchedule = nextSelectedOptions.includes("定期実行");
        next.q3 = {
          ...next.q3,
          scheduleConfig: hasSchedule
            ? (next.q3.scheduleConfig ?? DEFAULT_SCHEDULE_CONFIG)
            : undefined,
        };
        if (!hasSchedule) {
          setScheduleTouched(false);
          setTimezoneTouched(false);
        }
      }

      return next;
    });
  };

  const handleFreeTextChange = (key: QuestionKey, value: string) => {
    setInternalAnswers((prev) => {
      const next: ConversationAnswers = {
        ...prev,
        [key]: { ...prev[key], freeText: value },
      };
      return next;
    });
  };

  const handleCronChange = (value: string) => {
    setInternalAnswers((prev) => {
      const selectedOptions = prev.q3.selectedOptions ?? [];
      const next: ConversationAnswers = {
        ...prev,
        q3: {
          ...prev.q3,
          // cron 入力中は「定期実行」が selectedOptions に含まれていることを保証する。
          // handleOptionSelect 経由で通常は含まれているが、万が一含まれていない場合は自動追加する。
          selectedOptions: selectedOptions.includes("定期実行")
            ? selectedOptions
            : [...selectedOptions, "定期実行"],
          scheduleConfig: {
            ...(prev.q3.scheduleConfig ?? DEFAULT_SCHEDULE_CONFIG),
            cronExpression: value,
          },
        },
      };
      return next;
    });
    setScheduleTouched(true);
  };

  const handleTimezoneChange = (value: string) => {
    setInternalAnswers((prev) => {
      const selectedOptions = prev.q3.selectedOptions ?? [];
      const next: ConversationAnswers = {
        ...prev,
        q3: {
          ...prev.q3,
          // タイムゾーン変更時も「定期実行」の selectedOptions 維持を保証する。
          selectedOptions: selectedOptions.includes("定期実行")
            ? selectedOptions
            : [...selectedOptions, "定期実行"],
          scheduleConfig: {
            ...(prev.q3.scheduleConfig ?? DEFAULT_SCHEDULE_CONFIG),
            timezone: value,
          },
        },
      };
      return next;
    });
    setTimezoneTouched(true);
  };

  const handleShowSummary = () => {
    const q3 = internalAnswers.q3;
    const q3SelectedOptions = q3.selectedOptions ?? [];
    if (q3SelectedOptions.includes("定期実行")) {
      const validation = validateSkillWizardScheduleConfig(
        q3.scheduleConfig ?? DEFAULT_SCHEDULE_CONFIG,
      );
      if (validation.cronExpression || validation.timezone) {
        setShowSummaryCard(false);
        setScheduleTouched(true);
        setTimezoneTouched(true);
        return;
      }
    }
    setShowSummaryCard(true);
  };

  const handleDismissSummary = () => {
    setShowSummaryCard(false);
  };

  const handleConfirmGenerate = () => {
    setShowSummaryCard(false);
    onGenerate(resolveGenerationMethod(internalAnswers));
  };

  // ─── QuestionCard レンダラ（インライン） ────────────────────────────────────

  const renderQuestion = (idx: number) => {
    const q = QUESTIONS[idx];
    const key = q.key as QuestionKey;
    const answer = internalAnswers[key];
    const selectedOptions = answer.selectedOptions ?? [];
    const freeText = answer.freeText ?? "";
    const freeTextId = `${key}-free-text`;
    const freeTextLabel = `Q${idx + 1} 自由入力`;

    const labelText =
      isQ5Required && key === "q5" ? `${q.label}（必須★）` : q.label;
    const scheduleConfig =
      key === "q3" ? (answer.scheduleConfig ?? DEFAULT_SCHEDULE_CONFIG) : null;
    const scheduleValidation =
      key === "q3" && selectedOptions.includes("定期実行")
        ? validateSkillWizardScheduleConfig(
            scheduleConfig ?? DEFAULT_SCHEDULE_CONFIG,
          )
        : null;
    const scheduleError =
      key === "q3" && selectedOptions.includes("定期実行") && scheduleTouched
        ? (scheduleValidation?.cronExpression ?? null)
        : null;
    const timezoneError =
      key === "q3" && selectedOptions.includes("定期実行") && timezoneTouched
        ? (scheduleValidation?.timezone ?? null)
        : null;

    return (
      <section
        key={key}
        className="flex flex-col gap-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {labelText}
          </p>
          {selectedOptions.length > 0 && (
            <span className="rounded-full bg-[var(--bg-primary)] px-2 py-1 text-[11px] text-[var(--text-secondary)]">
              選択済み
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {q.options.map((opt, optionIndex) => {
            // TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001): 主ツールバッジ - resolveExternalIntegration の主ツール参照ロジック変更後に削除
            const isMainTool = shouldShowMainToolBadge({
              questionKey: key,
              optionValue: opt,
              selectedOptions,
            });
            const optionId = `${key}-${optionIndex}`;
            const optionLabelId = `${optionId}-label`;
            const mainToolBadgeId = `${optionId}-main-tool-badge`;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleOptionSelect(key, opt)}
                aria-pressed={selectedOptions.includes(opt)}
                aria-labelledby={optionLabelId}
                aria-describedby={isMainTool ? mainToolBadgeId : undefined}
                className={[
                  "inline-flex items-center px-3 py-1.5 rounded-lg text-sm border transition-colors",
                  selectedOptions.includes(opt)
                    ? "bg-[var(--status-primary)] text-[var(--text-inverse)] border-[var(--status-primary)]"
                    : "border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]",
                ].join(" ")}
              >
                <span id={optionLabelId}>{opt}</span>
                {isMainTool && (
                  <span
                    id={mainToolBadgeId}
                    aria-label="主ツールとして使用される"
                    className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                  >
                    主ツール
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={freeTextId}
            className="text-xs text-[var(--text-secondary)]"
          >
            {freeTextLabel}
          </label>
          <textarea
            id={freeTextId}
            value={freeText}
            onChange={(e) => handleFreeTextChange(key, e.target.value)}
            placeholder={`${q.label}の補足を入力`}
            rows={2}
            className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)]"
          />
        </div>

        {key === "q3" && selectedOptions.includes("定期実行") && (
          <div className="grid gap-3 rounded-lg border border-dashed border-[var(--border-primary)] bg-[var(--bg-primary)] p-3 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="schedule-cron"
                className="text-xs text-[var(--text-secondary)]"
              >
                スケジュール（cron式）
              </label>
              <input
                id="schedule-cron"
                type="text"
                value={scheduleConfig?.cronExpression ?? ""}
                onChange={(e) => handleCronChange(e.target.value)}
                onBlur={() => setScheduleTouched(true)}
                placeholder="0 9 * * 1-5"
                aria-invalid={Boolean(scheduleError)}
                aria-describedby={
                  scheduleError ? "schedule-cron-error" : undefined
                }
                className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)]"
              />
              <p className="text-[11px] text-[var(--text-secondary)]">
                例: 平日9時なら `0 9 * * 1-5`
              </p>
              {scheduleError && (
                <p
                  id="schedule-cron-error"
                  role="alert"
                  className="text-xs text-red-600"
                >
                  {scheduleError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="schedule-timezone"
                className="text-xs text-[var(--text-secondary)]"
              >
                タイムゾーン
              </label>
              <select
                id="schedule-timezone"
                value={scheduleConfig?.timezone ?? DEFAULT_TIMEZONE}
                onChange={(e) => handleTimezoneChange(e.target.value)}
                aria-invalid={Boolean(timezoneError)}
                aria-describedby={
                  timezoneError ? "schedule-timezone-error" : undefined
                }
                className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)]"
              >
                {TIMEZONE_OPTIONS.map((timezone) => (
                  <option key={timezone} value={timezone}>
                    {timezone}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[var(--text-secondary)]">
                実行基準の地域を選びます。
              </p>
              {timezoneError && (
                <p
                  id="schedule-timezone-error"
                  role="alert"
                  className="text-xs text-red-600"
                >
                  {timezoneError}
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    );
  };

  // ─── レンダリング ───────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      <InterviewProgressBar currentQuestion={currentQuestion} />

      {/* Page 1: Q1 / Q2 / Q3 */}
      {currentPage === 1 && (
        <div className="flex flex-col gap-4">
          {renderQuestion(0)}
          {renderQuestion(1)}
          {renderQuestion(2)}
        </div>
      )}

      {/* Page 2: Q4 / Q5 / Q6 */}
      {currentPage === 2 && (
        <div className="flex flex-col gap-4">
          {renderQuestion(3)}
          {renderQuestion(4)}
          {renderQuestion(5)}
        </div>
      )}

      {/* サマリーカード */}
      {showSummaryCard && (
        <ApplySummaryCard
          answers={internalAnswers}
          smartDefaults={smartDefaults}
          formData={formData}
          onDismiss={handleDismissSummary}
          onConfirm={handleConfirmGenerate}
          onCancel={() => {
            setShowSummaryCard(false);
            onBack();
          }}
        />
      )}

      {/* ナビゲーションボタン */}
      <div className="flex justify-between items-center">
        {currentPage === 1 ? (
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-lg border border-[var(--border-primary)] text-[var(--text-primary)]"
          >
            戻る
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            className="px-4 py-2 rounded-lg border border-[var(--border-primary)] text-[var(--text-primary)]"
          >
            前のページ
          </button>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleShowSummary}
            className="px-4 py-2 rounded-lg border border-[var(--status-primary)] text-[var(--status-primary)] text-sm"
          >
            今すぐ生成する
          </button>

          {currentPage === 1 && (
            <button
              type="button"
              onClick={() => setCurrentPage(2)}
              className="px-4 py-2 rounded-lg bg-[var(--status-primary)] text-[var(--text-inverse)] text-sm"
            >
              次のページ
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

ConversationRoundStep.displayName = "ConversationRoundStep";
