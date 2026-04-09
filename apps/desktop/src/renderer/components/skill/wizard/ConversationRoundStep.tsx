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

import React, { useEffect, useState } from "react";
import type {
  ConversationAnswers,
  QuestionAnswer,
  SkillInfoFormData,
  SmartDefaultResult,
  SkillWizardScheduleConfig,
} from "@repo/shared/types/skillCreator";
import { ApplySummaryCard } from "./ApplySummaryCard";
import { InterviewProgressBar } from "./InterviewProgressBar";

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

const SMART_DEFAULT_LABELS = {
  q3: {
    scheduled: "定期実行",
    realtime: "イベント駆動",
  },
  q5: {
    slack: "Slack",
    github: "GitHub",
  },
} as const;

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
  return (
    answer.selectedOption !== null ||
    answer.freeText.trim().length > 0 ||
    answer.scheduleConfig !== undefined
  );
}

function createEmptyAnswers(): ConversationAnswers {
  return {
    q1: { selectedOption: null, freeText: "" },
    q2: { selectedOption: null, freeText: "" },
    q3: { selectedOption: null, freeText: "", scheduleConfig: undefined },
    q4: { selectedOption: null, freeText: "" },
    q5: { selectedOption: null, freeText: "" },
    q6: { selectedOption: null, freeText: "" },
  };
}

function createQuestionAnswer(
  defaultValue: string | null,
  options: readonly QuestionOption[],
): QuestionAnswer {
  if (!defaultValue) {
    return { selectedOption: null, freeText: "" };
  }

  if (options.includes(defaultValue as QuestionOption)) {
    return { selectedOption: defaultValue, freeText: "" };
  }

  return { selectedOption: null, freeText: defaultValue };
}

function isValidCronField(field: string, min: number, max: number): boolean {
  const parts = field.split(",");
  if (parts.length === 0) {
    return false;
  }

  return parts.every((part) => {
    const trimmed = part.trim();
    if (!trimmed) {
      return false;
    }

    const [base, stepPart] = trimmed.split("/");
    if (stepPart !== undefined && !/^\d+$/.test(stepPart)) {
      return false;
    }

    const step = stepPart ? Number(stepPart) : null;
    if (step !== null && (step < 1 || !Number.isInteger(step))) {
      return false;
    }

    if (base === "*") {
      return true;
    }

    if (/^\d+$/.test(base)) {
      const value = Number(base);
      return value >= min && value <= max;
    }

    const rangeMatch = base.match(/^(\d+)-(\d+)$/);
    if (!rangeMatch) {
      return false;
    }

    const start = Number(rangeMatch[1]);
    const end = Number(rangeMatch[2]);
    return start >= min && end <= max && start <= end;
  });
}

function isValidFiveFieldCronExpression(expression: string): boolean {
  const fields = expression.trim().split(/\s+/);
  if (fields.length !== 5) {
    return false;
  }

  const validators: Array<[number, number]> = [
    [0, 59],
    [0, 23],
    [1, 31],
    [1, 12],
    [0, 7],
  ];

  return fields.every((field, index) =>
    isValidCronField(field, validators[index][0], validators[index][1]),
  );
}

function applySmartDefaults(
  answers: ConversationAnswers,
  smartDefaults: SmartDefaultResult,
): ConversationAnswers {
  const q1 = isQuestionAnswered(answers.q1)
    ? answers.q1
    : createQuestionAnswer(smartDefaults.who, QUESTIONS[0].options);
  const q2 = isQuestionAnswered(answers.q2)
    ? answers.q2
    : createQuestionAnswer(smartDefaults.input, QUESTIONS[1].options);
  const q3 = isQuestionAnswered(answers.q3)
    ? answers.q3
    : (() => {
        const questionAnswer = createQuestionAnswer(
          SMART_DEFAULT_LABELS.q3[
            smartDefaults.timing as keyof typeof SMART_DEFAULT_LABELS.q3
          ] ?? smartDefaults.timing,
          QUESTIONS[2].options,
        );

        return {
          ...questionAnswer,
          scheduleConfig:
            questionAnswer.selectedOption === "定期実行"
              ? DEFAULT_SCHEDULE_CONFIG
              : undefined,
        };
      })();
  const q4 = isQuestionAnswered(answers.q4)
    ? answers.q4
    : createQuestionAnswer(smartDefaults.output, QUESTIONS[3].options);
  const q5 = isQuestionAnswered(answers.q5)
    ? answers.q5
    : (() => {
        const toolValue =
          SMART_DEFAULT_LABELS.q5[
            smartDefaults.tool as keyof typeof SMART_DEFAULT_LABELS.q5
          ] ?? smartDefaults.tool;

        const questionAnswer = createQuestionAnswer(
          toolValue,
          QUESTIONS[4].options,
        );

        if (!questionAnswer.selectedOption && smartDefaults.tool === "notion") {
          return {
            selectedOption: "その他",
            freeText: "Notion",
          };
        }

        return questionAnswer;
      })();
  const q6 = isQuestionAnswered(answers.q6)
    ? answers.q6
    : createQuestionAnswer(smartDefaults.format, QUESTIONS[5].options);

  return { q1, q2, q3, q4, q5, q6 };
}

function validateCronExpression(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return "cron式を入力してください";
  }

  return isValidFiveFieldCronExpression(trimmed)
    ? null
    : "cron式の形式が正しくありません";
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

  const isQ5Required = formData.category === "external-integration";
  const currentQuestion = currentPage === 1 ? 1 : 4;

  useEffect(() => {
    onAnswersChange(internalAnswers);
  }, [internalAnswers, onAnswersChange]);

  // ─── ハンドラ ───────────────────────────────────────────────────────────────

  const handleOptionSelect = (key: QuestionKey, option: string) => {
    setInternalAnswers((prev) => {
      const next: ConversationAnswers = {
        ...prev,
        [key]: { ...prev[key], selectedOption: option },
      };

      if (key === "q3") {
        next.q3 = {
          ...next.q3,
          scheduleConfig:
            option === "定期実行"
              ? (next.q3.scheduleConfig ?? DEFAULT_SCHEDULE_CONFIG)
              : undefined,
        };
        setScheduleTouched(false);
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
      const next: ConversationAnswers = {
        ...prev,
        q3: {
          ...prev.q3,
          selectedOption: prev.q3.selectedOption ?? "定期実行",
          scheduleConfig: {
            cronExpression: value,
            timezone: prev.q3.scheduleConfig?.timezone ?? DEFAULT_TIMEZONE,
          },
        },
      };
      return next;
    });
  };

  const handleTimezoneChange = (value: string) => {
    setInternalAnswers((prev) => {
      const next: ConversationAnswers = {
        ...prev,
        q3: {
          ...prev.q3,
          selectedOption: prev.q3.selectedOption ?? "定期実行",
          scheduleConfig: {
            cronExpression:
              prev.q3.scheduleConfig?.cronExpression ??
              DEFAULT_SCHEDULE_CONFIG.cronExpression,
            timezone: value,
          },
        },
      };
      return next;
    });
  };

  const handleShowSummary = () => {
    setShowSummaryCard(true);
  };

  const handleDismissSummary = () => {
    setShowSummaryCard(false);
  };

  const handleConfirmGenerate = () => {
    setShowSummaryCard(false);
    onGenerate("skip");
  };

  // ─── QuestionCard レンダラ（インライン） ────────────────────────────────────

  const renderQuestion = (idx: number) => {
    const q = QUESTIONS[idx];
    const key = q.key as QuestionKey;
    const answer = internalAnswers[key];
    const selected = answer.selectedOption;
    const freeTextId = `${key}-free-text`;
    const freeTextLabel = `Q${idx + 1} 自由入力`;

    const labelText =
      isQ5Required && key === "q5" ? `${q.label}（必須★）` : q.label;
    const scheduleConfig =
      key === "q3" ? (answer.scheduleConfig ?? DEFAULT_SCHEDULE_CONFIG) : null;
    const scheduleError =
      key === "q3" && selected === "定期実行" && scheduleTouched
        ? validateCronExpression(scheduleConfig?.cronExpression ?? "")
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
          {selected && (
            <span className="rounded-full bg-[var(--bg-primary)] px-2 py-1 text-[11px] text-[var(--text-secondary)]">
              選択済み
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {q.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleOptionSelect(key, opt)}
              aria-pressed={selected === opt}
              className={[
                "px-3 py-1.5 rounded-lg text-sm border transition-colors",
                selected === opt
                  ? "bg-[var(--status-primary)] text-[var(--text-inverse)] border-[var(--status-primary)]"
                  : "border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]",
              ].join(" ")}
            >
              {opt}
            </button>
          ))}
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
            value={answer.freeText}
            onChange={(e) => handleFreeTextChange(key, e.target.value)}
            placeholder={`${q.label}の補足を入力`}
            rows={2}
            className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)]"
          />
        </div>

        {key === "q3" && selected === "定期実行" && (
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
