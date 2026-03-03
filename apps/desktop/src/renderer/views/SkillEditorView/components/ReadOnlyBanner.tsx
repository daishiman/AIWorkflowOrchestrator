/**
 * ReadOnlyBanner - 読み取り専用バナー（atom）
 *
 * UT-UI-05A-005: 読み取り専用表示強化
 *
 * isReadOnly=true の場合に Lock アイコンと説明テキストを表示する。
 * isReadOnly=false の場合は何もレンダリングしない。
 *
 * @module SkillEditorView/components/ReadOnlyBanner
 */

import React from "react";
import { Lock } from "lucide-react";

export interface ReadOnlyBannerProps {
  isReadOnly: boolean;
}

export const ReadOnlyBanner: React.FC<ReadOnlyBannerProps> = ({
  isReadOnly,
}) => {
  if (!isReadOnly) return null;

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 text-sm
        bg-[var(--bg-tertiary)] border-b border-[var(--border-default)]
        text-[var(--text-secondary)]"
    >
      <Lock size={16} className="shrink-0" data-testid="readonly-lock-icon" />
      <span>読み取り専用 — 編集できません</span>
    </div>
  );
};

ReadOnlyBanner.displayName = "ReadOnlyBanner";
