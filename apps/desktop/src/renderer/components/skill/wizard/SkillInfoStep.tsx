import { useState } from "react";
import type {
  SkillCategory,
  SkillInfoFormData,
} from "@repo/shared/types/skillCreator";

const CATEGORY_OPTIONS: { value: SkillCategory; label: string }[] = [
  { value: "automation", label: "自動化" },
  { value: "external-integration", label: "外部連携" },
  { value: "data-analysis", label: "データ分析" },
  { value: "code-support", label: "コードサポート" },
  { value: "other", label: "その他" },
];

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
 * - スキル名（任意）、目的・背景（必須・10文字以上）、カテゴリタグ（必須・5種の単一選択）を入力する。
 * - カテゴリは未選択状態として `null` を取り得るが、一度選択した値は再クリックで `null` には戻さない。
 * - カテゴリに `external-integration` を選択した場合、Step 1 の Q5 が必須になる。
 * - 「次へ」ボタンは目的が 10 文字以上入力され、かつカテゴリが選択されたときに活性化する。
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

  // Step 0 の完了条件: purpose(10文字以上) + category(選択済み)
  const isNextEnabled =
    formData.purpose.trim().length >= 10 && formData.category !== null;
  const showPurposeError =
    purposeTouched && formData.purpose.trim().length < 10;

  const handleCategoryClick = (value: SkillCategory) => {
    if (formData.category === value) return;
    onFormDataChange({ ...formData, category: value });
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
          className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="例: メール自動返信スキル"
        />
      </div>

      {/* 目的・背景 */}
      <div className="flex flex-col gap-1">
        <label htmlFor="purpose" className="text-sm font-medium text-gray-700">
          目的・背景
          <span className="ml-1 text-xs text-red-500">必須</span>
        </label>
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
              : "border-gray-300 focus:border-blue-500"
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
          {CATEGORY_OPTIONS.map(({ value, label }) => {
            const isSelected = formData.category === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleCategoryClick(value)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  isSelected
                    ? "border-blue-500 bg-blue-100 text-blue-700"
                    : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                }`}
              >
                {label}
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
          className="rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-blue-700"
        >
          次へ
        </button>
      </div>
    </div>
  );
}
