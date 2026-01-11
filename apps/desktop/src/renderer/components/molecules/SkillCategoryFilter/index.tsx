import React from "react";
import type { SkillCategory } from "@repo/shared/types/skill";
import { SKILL_CATEGORIES } from "@repo/shared/types/skill";

export interface SkillCategoryFilterProps {
  /** 選択中のカテゴリ */
  value: SkillCategory | null;
  /** カテゴリ変更ハンドラ */
  onChange: (category: SkillCategory | null) => void;
  /** 利用可能なカテゴリ */
  categories: SkillCategory[];
  /** カスタムクラス */
  className?: string;
}

/**
 * スキルカテゴリフィルターコンポーネント
 * カテゴリ選択ドロップダウン
 */
export const SkillCategoryFilter: React.FC<SkillCategoryFilterProps> = ({
  value,
  onChange,
  categories,
  className = "",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    onChange(selectedValue === "" ? null : (selectedValue as SkillCategory));
  };

  return (
    <div
      className={`relative bg-slate-800/40 backdrop-blur-sm rounded-lg border border-slate-700/50 ${className}`}
    >
      <select
        value={value || ""}
        onChange={handleChange}
        aria-label="カテゴリでフィルター"
        className="w-full px-4 py-2 bg-transparent text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg appearance-none cursor-pointer"
      >
        <option value="" className="bg-slate-800 text-slate-50">
          全て
        </option>
        {categories.map((category) => (
          <option
            key={category}
            value={category}
            className="bg-slate-800 text-slate-50"
          >
            {SKILL_CATEGORIES[category]?.label || category}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className="h-4 w-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};

SkillCategoryFilter.displayName = "SkillCategoryFilter";
