/**
 * スキルフェーズパネル
 * @module renderer/slide/SkillPhasePanel
 */

import React from "react";
import type { SkillPhase } from "@repo/shared";

interface Props {
  /** スキル実行ハンドラ */
  onExecute: (phase: SkillPhase) => void;
  /** 実行中かどうか */
  isExecuting?: boolean;
  /** 現在のフェーズ */
  currentPhase?: SkillPhase | "idle";
  /** キャンセルハンドラ */
  onCancel?: () => void;
  /** 進捗（0-100） */
  progress?: number;
}

/** フェーズ定義 */
const PHASES: Array<{ phase: SkillPhase; label: string; description: string }> =
  [
    {
      phase: "hearing",
      label: "ヒアリング",
      description: "要件・目的を整理",
    },
    {
      phase: "structure",
      label: "構成設計",
      description: "スライド構成を設計",
    },
    {
      phase: "html",
      label: "HTML生成",
      description: "HTMLを生成",
    },
    {
      phase: "modifier",
      label: "スライド修正",
      description: "内容を修正・調整",
    },
  ];

/**
 * スキルフェーズを選択・実行するパネルコンポーネント
 */
export const SkillPhasePanel: React.FC<Props> = ({
  onExecute,
  isExecuting = false,
  currentPhase = "idle",
  onCancel,
  progress = 0,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
        スキルフェーズ
      </h3>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PHASES.map(({ phase, label, description }) => {
          const isActive = currentPhase === phase;
          const isDisabled = isExecuting && !isActive;

          return (
            <button
              key={phase}
              onClick={() => onExecute(phase)}
              disabled={isDisabled}
              title={description}
              className={`
                px-4 py-3 rounded-lg text-sm font-medium transition-all
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                }
                ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
              aria-pressed={isActive}
              aria-disabled={isDisabled}
            >
              <span className="block">{label}</span>
              {isActive && (
                <span className="block text-xs mt-1 opacity-80">実行中...</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 進捗バー */}
      {isExecuting && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{progress}%</span>
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                キャンセル
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
