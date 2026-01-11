import React, { forwardRef } from "react";
import type { Skill, SkillCategory } from "@repo/shared/types/skill";
import { SKILL_CATEGORIES } from "@repo/shared/types/skill";

export interface SkillCardProps {
  /** スキル情報 */
  skill: Skill;
  /** 選択状態 */
  isSelected: boolean;
  /** クリックハンドラ */
  onClick: () => void;
  /** カスタムクラス */
  className?: string;
}

/**
 * スキルカードコンポーネント
 * スキル情報をカード形式で表示する
 */
export const SkillCard = forwardRef<HTMLButtonElement, SkillCardProps>(
  ({ skill, isSelected, onClick, className = "" }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    };

    const getCategoryColorClasses = (category: SkillCategory): string => {
      const colorMap: Record<string, string> = {
        green: "bg-green-500/20 text-green-400",
        blue: "bg-blue-500/20 text-blue-400",
        purple: "bg-purple-500/20 text-purple-400",
        orange: "bg-orange-500/20 text-orange-400",
        red: "bg-red-500/20 text-red-400",
        yellow: "bg-yellow-500/20 text-yellow-400",
        gray: "bg-gray-500/20 text-gray-400",
      };
      const color = SKILL_CATEGORIES[category]?.color || "gray";
      return colorMap[color] || colorMap.gray;
    };

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        onKeyDown={handleKeyDown}
        aria-label={`スキル: ${skill.name}`}
        aria-pressed={isSelected}
        className={`
          w-full p-4 text-left rounded-xl
          bg-slate-800/40 backdrop-blur-sm
          border border-slate-700/50
          transition-all duration-200 ease-in-out
          hover:scale-[1.02] hover:shadow-lg hover:border-slate-600/50
          focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
          ${isSelected ? "ring-2 ring-blue-500 border-blue-500/50" : ""}
          ${className}
        `}
      >
        <h3 className="text-lg font-semibold text-slate-50 mb-2">
          {skill.name}
        </h3>
        <p className="text-sm text-slate-400 line-clamp-2 mb-3">
          {skill.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {skill.triggers.slice(0, 3).map((trigger) => (
            <span
              key={trigger}
              className="px-2 py-0.5 text-xs rounded-full bg-slate-700/50 text-slate-300"
            >
              {trigger}
            </span>
          ))}
          {skill.triggers.length > 3 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-slate-700/50 text-slate-400">
              +{skill.triggers.length - 3}
            </span>
          )}
          {skill.category && (
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${getCategoryColorClasses(skill.category)}`}
            >
              {SKILL_CATEGORIES[skill.category].label}
            </span>
          )}
        </div>
      </button>
    );
  },
);

SkillCard.displayName = "SkillCard";
