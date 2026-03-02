/**
 * StartDebugDialog - デバッグ開始ダイアログ（Organism）
 *
 * デバッグセッション開始時にスキル名とプロンプトを入力するダイアログ。
 *
 * @module StartDebugDialog
 */

import React, { memo, useState, useCallback } from "react";
import clsx from "clsx";
import type { DebugStartRequest } from "@repo/shared/types/skill-debug";
import { Icon } from "../../../components/atoms/Icon";
import { Button } from "../../../components/atoms/Button";

export interface StartDebugDialogProps {
  /** 開始ハンドラ */
  onStart: (request: DebugStartRequest) => void;
  /** ローディング状態 */
  isLoading?: boolean;
}

export const StartDebugDialog: React.FC<StartDebugDialogProps> = memo(
  ({ onStart, isLoading = false }) => {
    const [skillName, setSkillName] = useState("");
    const [prompt, setPrompt] = useState("");

    const handleSkillNameChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setSkillName(e.target.value);
      },
      [],
    );

    const handlePromptChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(e.target.value);
      },
      [],
    );

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        if (!skillName.trim() || !prompt.trim()) return;
        onStart({
          skillName: skillName.trim(),
          prompt: prompt.trim(),
          breakpoints: [],
        });
      },
      [skillName, prompt, onStart],
    );

    const isValid = skillName.trim().length > 0 && prompt.trim().length > 0;

    return (
      <div
        className="flex items-center justify-center h-full"
        data-testid="start-debug-dialog"
      >
        <form
          onSubmit={handleSubmit}
          className={clsx(
            "w-full max-w-md p-6 rounded-xl",
            "bg-[var(--bg-secondary)] border border-[var(--border-primary)]",
            "shadow-lg",
          )}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={clsx(
                "p-2 rounded-lg",
                "bg-[var(--status-primary)]/10",
              )}
            >
              <Icon
                name="zap"
                size={20}
                className="text-[var(--status-primary)]"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                デバッグ開始
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                スキルのステップ実行をデバッグします
              </p>
            </div>
          </div>

          {/* スキル名入力 */}
          <div className="mb-4">
            <label
              htmlFor="debug-skill-name"
              className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
            >
              スキル名
            </label>
            <input
              id="debug-skill-name"
              type="text"
              value={skillName}
              onChange={handleSkillNameChange}
              placeholder="例: code-review"
              disabled={isLoading}
              className={clsx(
                "w-full px-3 py-2 rounded-lg text-sm",
                "bg-[var(--bg-primary)] border border-[var(--border-primary)]",
                "text-[var(--text-primary)] placeholder-[var(--text-muted)]",
                "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)]",
                isLoading && "opacity-50 cursor-not-allowed",
              )}
              data-testid="debug-skill-name-input"
            />
          </div>

          {/* プロンプト入力 */}
          <div className="mb-6">
            <label
              htmlFor="debug-prompt"
              className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
            >
              プロンプト
            </label>
            <textarea
              id="debug-prompt"
              value={prompt}
              onChange={handlePromptChange}
              placeholder="実行するプロンプトを入力..."
              disabled={isLoading}
              rows={3}
              className={clsx(
                "w-full px-3 py-2 rounded-lg text-sm resize-none",
                "bg-[var(--bg-primary)] border border-[var(--border-primary)]",
                "text-[var(--text-primary)] placeholder-[var(--text-muted)]",
                "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)]",
                isLoading && "opacity-50 cursor-not-allowed",
              )}
              data-testid="debug-prompt-input"
            />
          </div>

          {/* 開始ボタン */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={!isValid}
            loading={isLoading}
            leftIcon="play"
          >
            デバッグ開始
          </Button>
        </form>
      </div>
    );
  },
);

StartDebugDialog.displayName = "StartDebugDialog";
