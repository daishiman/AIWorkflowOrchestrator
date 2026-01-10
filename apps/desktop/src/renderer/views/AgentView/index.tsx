import React from "react";
import clsx from "clsx";
import { useAppStore } from "../../store";
import { GlassPanel } from "../../components/organisms/GlassPanel";
import type { Skill } from "../../store/slices/agentSlice";

export interface AgentViewProps {
  className?: string;
}

/** 共通のコンテナクラス */
const containerClassName = "flex flex-col gap-6 p-6 h-full overflow-auto";

/**
 * ヘッダーセクション
 * エージェントビューの共通ヘッダー
 */
const AgentHeader: React.FC = () => (
  <header role="banner">
    <h1 className="text-2xl font-bold text-white">Agent</h1>
    <p className="text-gray-400 mt-1">エージェント機能の管理と実行</p>
  </header>
);

/**
 * スキル一覧を表示
 */
const SkillList: React.FC<{ skills: Skill[] }> = ({ skills }) => (
  <div className="w-full p-4">
    <ul className="space-y-2">
      {skills.map((skill) => (
        <li
          key={skill.id}
          className="p-3 rounded bg-[var(--bg-glass)] border border-[var(--border-subtle)]"
        >
          <span className="text-white">{skill.name}</span>
          <p className="text-gray-400 text-sm mt-1">{skill.description}</p>
        </li>
      ))}
    </ul>
  </div>
);

/**
 * メインコンテンツを表示
 */
const MainContent: React.FC<{ isLoading: boolean; skills: Skill[] }> = ({
  isLoading,
  skills,
}) => {
  if (isLoading) {
    return <p className="text-gray-400">読み込み中...</p>;
  }

  if (skills.length > 0) {
    return <SkillList skills={skills} />;
  }

  return <p className="text-gray-400">エージェント機能は準備中です</p>;
};

/**
 * AgentView コンポーネント
 * エージェント機能の管理と実行を行うビュー
 */
export const AgentView: React.FC<AgentViewProps> = ({ className }) => {
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);
  const skills = useAppStore((state) => state.skills);

  if (error) {
    return (
      <div
        data-testid="agent-view"
        className={clsx(containerClassName, className)}
      >
        <AgentHeader />
        <section role="region" aria-label="エラー" className="flex-1">
          <GlassPanel className="h-full flex items-center justify-center">
            <p className="text-red-400">{error}</p>
          </GlassPanel>
        </section>
      </div>
    );
  }

  return (
    <div
      data-testid="agent-view"
      className={clsx(containerClassName, className)}
    >
      <AgentHeader />
      <section role="region" aria-label="メインコンテンツ" className="flex-1">
        <GlassPanel className="h-full flex items-center justify-center">
          <MainContent isLoading={isLoading} skills={skills} />
        </GlassPanel>
      </section>
    </div>
  );
};

AgentView.displayName = "AgentView";
