import { useState } from "react";
import type {
  SkillCategory,
  SkillInfoFormData,
} from "@repo/shared/types/skillCreator";

interface CategoryOption {
  value: SkillCategory;
  label: string;
  icon: string;
  description: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    value: "automation",
    label: "自動化",
    icon: "⚡",
    description: "繰り返し作業の自動化・スケジュール実行などのスキル",
  },
  {
    value: "external-integration",
    label: "外部連携",
    icon: "🔗",
    description: "外部API・Webhookなど外部サービスと連携するスキル",
  },
  {
    value: "data-analysis",
    label: "データ分析",
    icon: "📊",
    description: "データの集計・分析・可視化を行うスキル",
  },
  {
    value: "code-support",
    label: "コードサポート",
    icon: "💻",
    description: "コードレビュー・生成・リファクタリングを支援するスキル",
  },
  {
    value: "other",
    label: "その他",
    icon: "📦",
    description: "上記カテゴリに当てはまらないスキル",
  },
];

const MAX_CATEGORY_COUNT = 3;

export interface SkillInfoStepProps {
  /** スキル名・目的・カテゴリをまとめたフォーム全体の入力値。 */
  formData: SkillInfoFormData;
  /** フォーム変更時に親へ全体値を通知する。 */
  onFormDataChange: (data: SkillInfoFormData) => void;
  /** Step 1 へ進む。 */
  onNext: () => void;
}

/**
 * スキルウィザード Step 0 — スキルの基本情報を入力するフォームコンポーネント。
 *
 * - スキル名（任意）、目的・背景（必須・10文字以上）、カテゴリタグ（必須・5種の複数選択可）を入力する。
 * - カテゴリは複数選択可能で、選択済みカテゴリを再クリックすると解除される。
 * - 全カテゴリを解除した場合も `[]` を維持する。
 * - カテゴリに `external-integration` を含む場合、Step 1 の Q5 が必須になる。
 * - 「次へ」ボタンは目的が 10 文字以上入力され、かつカテゴリが1件以上選択されたときに活性化する。
 *
 * @example
 * <SkillInfoStep
 *   formData={formData}
 *   onFormDataChange={setFormData}
 *   onNext={handleNext}
 * />
 */
export function SkillInfoStep({
  formData,
  onFormDataChange,
  onNext,
}: SkillInfoStepProps) {
  const [purposeTouched, setPurposeTouched] = useState(false);
  const isAtLimit = formData.category.length >= MAX_CATEGORY_COUNT;

  // Step 0 の完了条件: purpose(10文字以上) + category(1件以上選択)
  const isNextEnabled =
    formData.purpose.trim().length >= 10 && formData.category.length > 0;
  const showPurposeError =
    purposeTouched && formData.purpose.trim().length < 10;

  // 既選択の場合は除去（トグル解除）、未選択の場合は追加
  const handleCategoryClick = (value: SkillCategory) => {
    const isSelected = formData.category.includes(value);
    if (isSelected) {
      const next = formData.category.filter((c) => c !== value);
      onFormDataChange({ ...formData, category: next });
      return;
    }

    if (isAtLimit) {
      return;
    }

    onFormDataChange({
      ...formData,
      category: [...formData.category, value],
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* スキル名 */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="skill-name"
          className="text-sm font-medium text-gray-700"
        >
          スキル名
          <span className="ml-1 text-xs text-gray-400">（任意）</span>
        </label>
        <input
          id="skill-name"
          type="text"
          value={formData.skillName ?? ""}
          onChange={(e) =>
            onFormDataChange({ ...formData, skillName: e.target.value })
          }
          className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-[var(--status-primary)] focus:outline-none"
          placeholder="例: メール自動返信スキル"
        />
      </div>

      {/* 目的・背景 */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center">
          <label
            htmlFor="purpose"
            className="text-sm font-medium text-gray-700"
          >
            目的・背景
          </label>
          <span className="ml-1 text-xs text-red-500">必須</span>
        </div>
        <textarea
          id="purpose"
          value={formData.purpose}
          onChange={(e) =>
            onFormDataChange({ ...formData, purpose: e.target.value })
          }
          onBlur={() => setPurposeTouched(true)}
          rows={4}
          className={`rounded border px-3 py-2 text-sm focus:outline-none ${
            showPurposeError
              ? "border-red-500 focus:border-red-500"
              : "border-gray-300 focus:border-[var(--status-primary)]"
          }`}
          placeholder="このスキルで何を実現したいか、背景や目的を入力してください"
        />
        {showPurposeError && (
          <p className="text-xs text-red-500">
            目的・背景は10文字以上で入力してください
          </p>
        )}
      </div>

      {/* カテゴリタグ */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-700">
          カテゴリ
          <span className="ml-1 text-xs text-red-500">（必須）</span>
        </span>
        <div
          role="group"
          aria-label="カテゴリを選択"
          className="flex flex-wrap gap-2"
        >
          {CATEGORY_OPTIONS.map(({ value, label, icon, description }) => {
            const isSelected = formData.category.includes(value);
            return (
              <button
                key={value}
                type="button"
                aria-pressed={isSelected}
                aria-label={label}
                title={description}
                onClick={() => handleCategoryClick(value)}
                disabled={isAtLimit && !isSelected}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-all duration-200 ease-in-out ${
                  isSelected
                    ? "border-[var(--status-primary)] bg-[var(--status-primary)] text-[var(--text-inverse)]"
                    : "border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                }`}
              >
                <span aria-hidden="true">{icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 次へボタン */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!isNextEnabled}
          className="rounded-lg bg-[var(--status-primary)] px-6 py-2 text-sm font-medium text-[var(--text-inverse)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          次へ
        </button>
      </div>
    </div>
  );
}
