import React, { useState, useEffect, useCallback } from "react";
import type { Skill } from "@repo/shared/types/skill";
import { X, Play, Trash2 } from "lucide-react";

export interface SkillDetailPanelProps {
  /** スキル情報（nullの場合は非表示） */
  skill: Skill | null;
  /** 実行ハンドラ */
  onExecute: (skill: Skill) => void;
  /** 削除ハンドラ */
  onDelete: (skill: Skill) => void;
  /** 閉じるハンドラ */
  onClose: () => void;
  /** カスタムクラス */
  className?: string;
}

/**
 * スキル詳細パネルコンポーネント
 * 選択されたスキルの詳細情報を表示
 */
export const SkillDetailPanel: React.FC<SkillDetailPanelProps> = ({
  skill,
  onExecute,
  onDelete,
  onClose,
  className = "",
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Escapeキーで閉じる
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          onClose();
        }
      }
    },
    [onClose, showDeleteConfirm],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // スキルがない場合は何も表示しない
  if (!skill) {
    return null;
  }

  const handleExecute = () => {
    onExecute(skill);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(skill);
    setShowDeleteConfirm(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <aside
      role="complementary"
      aria-label={`スキル詳細: ${skill.name}`}
      className={`bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 ${className}`}
    >
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-50">{skill.name}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="p-1 rounded hover:bg-slate-700/50 transition-colors"
        >
          <X className="h-5 w-5 text-slate-400" />
        </button>
      </div>

      {/* 説明 */}
      <p className="text-slate-300 mb-4">{skill.description}</p>

      {/* カテゴリ */}
      {skill.category && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-slate-400 mb-2">カテゴリ</h3>
          <span className="px-2 py-1 text-sm rounded bg-slate-700/50 text-slate-300">
            {skill.category}
          </span>
        </div>
      )}

      {/* トリガー */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-slate-400 mb-2">トリガー</h3>
        <div className="flex flex-wrap gap-2">
          {skill.triggers.map((trigger) => (
            <span
              key={trigger}
              className="px-2 py-1 text-sm rounded bg-slate-700/50 text-slate-300"
            >
              {trigger}
            </span>
          ))}
        </div>
      </div>

      {/* アンカー */}
      {skill.anchors.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-slate-400 mb-2">
            アンカー（参照文献）
          </h3>
          <ul className="space-y-2">
            {skill.anchors.map((anchor, index) => (
              <li
                key={`${anchor.name}-${index}`}
                className="p-2 rounded bg-slate-700/30 border border-slate-700/50"
              >
                <p className="font-medium text-slate-200">{anchor.name}</p>
                <p className="text-sm text-slate-400">
                  適用: {anchor.application}
                </p>
                <p className="text-sm text-slate-400">目的: {anchor.purpose}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* パス */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-slate-400 mb-2">パス</h3>
        <code className="text-sm text-slate-300 bg-slate-700/50 px-2 py-1 rounded break-all">
          {skill.path}
        </code>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleExecute}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Play className="h-4 w-4" />
          実行
        </button>
        <button
          type="button"
          onClick={handleDeleteClick}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors border border-red-600/30"
        >
          <Trash2 className="h-4 w-4" />
          削除
        </button>
      </div>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="mt-4 p-4 rounded-lg bg-red-900/20 border border-red-600/30">
          <p className="text-red-200 mb-3">
            このスキルを削除しますか？この操作は取り消せません。
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              はい
            </button>
            <button
              type="button"
              onClick={handleDeleteCancel}
              className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

SkillDetailPanel.displayName = "SkillDetailPanel";
