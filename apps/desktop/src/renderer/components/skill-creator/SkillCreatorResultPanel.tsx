/**
 * SkillCreatorResultPanel - スキル生成完了通知・プレビュー表示コンポーネント
 * TASK-SDK-SC-04: Skill Output Integration
 *
 * IPC `skill-creator:output-ready` を受信した際にスキル名と
 * SKILL.md 内容プレビューを表示し、上書き確認ダイアログも担う。
 */

import React from "react";
import type { SkillOutputReadyPayload } from "@repo/shared/types/skillCreator";

interface SkillCreatorResultPanelProps {
  /** IPC 通知から受け取ったペイロード */
  payload: SkillOutputReadyPayload | null;
  /** 「スキルを開く」ボタンクリック時のコールバック */
  onOpenSkill: (savedPath: string) => void;
  /** 上書き確認時に Main へ保存続行を依頼するコールバック */
  onConfirmOverwrite: (payload: SkillOutputReadyPayload) => void;
}

export const SkillCreatorResultPanel: React.FC<
  SkillCreatorResultPanelProps
> = ({ payload, onOpenSkill, onConfirmOverwrite }) => {
  if (!payload) {
    return null;
  }

  return (
    <div className="skill-creator-result-panel space-y-4 rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-semibold">
        スキルを生成しました: {payload.skillName}
      </h2>

      {payload.requiresOverwriteConfirm && (
        <div className="rounded border border-yellow-400 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          同名のスキルが既に存在します。上書きしますか？
        </div>
      )}

      <p className="break-all text-sm text-gray-500">{payload.savedPath}</p>

      <pre className="overflow-auto rounded bg-gray-100 p-3 text-sm">
        <code>{payload.content}</code>
      </pre>

      <div className="flex gap-2">
        {payload.requiresOverwriteConfirm && (
          <button
            type="button"
            className="rounded bg-yellow-500 px-3 py-1.5 text-sm text-white hover:bg-yellow-600"
            onClick={() => onConfirmOverwrite(payload)}
          >
            上書きして保存
          </button>
        )}
        <button
          type="button"
          className="rounded bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
          onClick={() => onOpenSkill(payload.savedPath)}
        >
          スキルを開く
        </button>
      </div>
    </div>
  );
};
