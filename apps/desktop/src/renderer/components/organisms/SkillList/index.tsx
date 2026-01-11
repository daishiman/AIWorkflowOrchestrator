import React, { useMemo } from "react";
import type { Skill, SkillCategory } from "@repo/shared/types/skill";
import { SkillCard } from "../../molecules/SkillCard";
import { Plus } from "lucide-react";

export interface SkillListProps {
  /** スキル一覧 */
  skills: Skill[];
  /** 選択中のスキルID */
  selectedSkillId: string | null;
  /** スキル選択ハンドラ */
  onSkillSelect: (skill: Skill) => void;
  /** ローディング状態 */
  isLoading: boolean;
  /** 検索フィルター */
  filter: string;
  /** カテゴリフィルター */
  category: SkillCategory | null;
  /** インポートボタンハンドラ */
  onImportClick?: () => void;
  /** カスタムクラス */
  className?: string;
}

/**
 * スキル一覧コンポーネント
 * グリッドレイアウトでスキルカードを表示
 */
export const SkillList: React.FC<SkillListProps> = ({
  skills,
  selectedSkillId,
  onSkillSelect,
  isLoading,
  filter,
  category,
  onImportClick,
  className = "",
}) => {
  // フィルタリング
  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      // カテゴリフィルター
      if (category && skill.category !== category) {
        return false;
      }

      // 検索フィルター
      if (filter) {
        const lowerFilter = filter.toLowerCase();
        const matchName = skill.name.toLowerCase().includes(lowerFilter);
        const matchDescription = skill.description
          .toLowerCase()
          .includes(lowerFilter);
        const matchTriggers = skill.triggers.some((t) =>
          t.toLowerCase().includes(lowerFilter),
        );
        return matchName || matchDescription || matchTriggers;
      }

      return true;
    });
  }, [skills, filter, category]);

  // ローディング状態
  if (isLoading) {
    return (
      <div
        className={`grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${className}`}
        aria-busy="true"
      >
        <div
          role="status"
          aria-label="読み込み中"
          className="col-span-full flex justify-center py-8"
        >
          <div className="flex items-center gap-3 text-slate-400">
            <div className="animate-spin h-5 w-5 border-2 border-slate-400 border-t-transparent rounded-full" />
            <span>スキルを読み込み中...</span>
          </div>
        </div>
      </div>
    );
  }

  // 空状態
  if (skills.length === 0) {
    return (
      <div
        className={`grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${className}`}
      >
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
          <p className="text-slate-400 mb-4">
            スキルがインポートされていません
          </p>
          <button
            type="button"
            onClick={onImportClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            インポート
          </button>
        </div>
      </div>
    );
  }

  // フィルター後に結果がない場合
  if (filteredSkills.length === 0) {
    return (
      <div
        className={`grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${className}`}
        role="list"
      >
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
          <p className="text-slate-400">条件に一致するスキルが見つかりません</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${className}`}
      role="list"
    >
      {filteredSkills.map((skill) => (
        <div key={skill.id} role="listitem">
          <SkillCard
            skill={skill}
            isSelected={selectedSkillId === skill.id}
            onClick={() => onSkillSelect(skill)}
          />
        </div>
      ))}
    </div>
  );
};

SkillList.displayName = "SkillList";
