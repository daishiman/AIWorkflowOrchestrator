/**
 * @file ApplySummaryCard.tsx
 * @description 適用サマリーカード - 未回答問のスマートデフォルト一覧表示
 * @task UT-SKILL-WIZARD-W1-par-02b
 */

import React from "react";
import type {
  ConversationAnswers,
  SmartDefaultResult,
  SkillInfoFormData,
} from "@repo/shared/types/skillCreator";

type QuestionKey = keyof ConversationAnswers;
type SmartDefaultKey =
  | "who"
  | "input"
  | "timing"
  | "output"
  | "tool"
  | "format";

const QUESTION_KEYS: readonly QuestionKey[] = [
  "q1",
  "q2",
  "q3",
  "q4",
  "q5",
  "q6",
];

const QUESTION_LABELS: Record<QuestionKey, string> = {
  q1: "利用者",
  q2: "入力データ",
  q3: "実行タイミング",
  q4: "出力先",
  q5: "外部ツール連携",
  q6: "出力フォーマット",
};

const DEFAULT_KEY_BY_QUESTION: Record<QuestionKey, SmartDefaultKey> = {
  q1: "who",
  q2: "input",
  q3: "timing",
  q4: "output",
  q5: "tool",
  q6: "format",
};

function getUnansweredDefaults(
  answers: ConversationAnswers,
  smartDefaults: SmartDefaultResult,
): Array<{ key: QuestionKey; label: string; defaultValue: string }> {
  return QUESTION_KEYS.flatMap((key) => {
    const answer = answers[key];
    const isUnanswered =
      answer.selectedOption === null && answer.freeText.trim() === "";
    if (!isUnanswered) return [];
    const defaultValue = smartDefaults[DEFAULT_KEY_BY_QUESTION[key]];
    if (!defaultValue) return [];
    return [{ key, label: QUESTION_LABELS[key], defaultValue }];
  });
}

export interface ApplySummaryCardProps {
  answers: ConversationAnswers;
  smartDefaults: SmartDefaultResult;
  formData: SkillInfoFormData;
  onDismiss: () => void;
  onConfirm: () => void;
  onCancel?: () => void;
}

/**
 * 「今すぐ生成する」時に表示される適用サマリーカード。
 *
 * 未回答問の smart defaults を表示し、Q5 が外部統合カテゴリで未設定でも
 * 警告だけを出して生成を妨げない。
 */
export const ApplySummaryCard = ({
  answers,
  smartDefaults,
  formData,
  onDismiss,
  onConfirm,
  onCancel,
}: ApplySummaryCardProps) => {
  const isQ5Required = formData.category === "external-integration";
  const isQ5Unanswered =
    answers.q5.selectedOption === null && answers.q5.freeText.trim() === "";

  const unansweredWithDefaults = getUnansweredDefaults(answers, smartDefaults);

  return (
    <section
      aria-label="適用サマリー"
      className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 flex flex-col gap-3"
    >
      <div className="flex justify-between items-center">
        <span className="font-medium text-sm text-[var(--text-primary)]">
          スマートデフォルト適用
        </span>
        <button
          onClick={onDismiss}
          aria-label="閉じる"
          type="button"
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-lg leading-none"
        >
          ×
        </button>
      </div>

      {unansweredWithDefaults.length > 0 && (
        <ul className="flex flex-col gap-1 text-sm">
          {unansweredWithDefaults.map(({ key, label, defaultValue }) => (
            <li key={key} className="text-[var(--text-secondary)]">
              <span className="font-medium text-[var(--text-primary)]">
                {label}:
              </span>{" "}
              {defaultValue}
            </li>
          ))}
        </ul>
      )}

      {isQ5Required && isQ5Unanswered && (
        <p className="text-sm text-yellow-600">
          Q5（外部ツール連携）は必須です
        </p>
      )}

      <div className="flex gap-2">
        {onCancel && (
          <button
            onClick={onCancel}
            type="button"
            className="flex-1 py-2 rounded-lg border border-[var(--border-primary)] text-[var(--text-primary)] text-sm"
          >
            キャンセル
          </button>
        )}
        <button
          onClick={onConfirm}
          type="button"
          className="flex-1 py-2 rounded-lg bg-[var(--status-primary)] text-[var(--text-inverse)] text-sm font-medium"
        >
          生成する
        </button>
      </div>
    </section>
  );
};

ApplySummaryCard.displayName = "ApplySummaryCard";

export { QUESTION_KEYS, QUESTION_LABELS, DEFAULT_KEY_BY_QUESTION };
