import React from "react";
import { Play } from "lucide-react";
import { transitions } from "./animations";

export interface ExecuteButtonProps {
  selectedSkillName: string | null;
  onExecute: () => void;
  isExecuting: boolean;
}

export const ExecuteButton: React.FC<ExecuteButtonProps> = ({
  selectedSkillName,
  onExecute,
  isExecuting,
}) => {
  const isDisabled = !selectedSkillName;

  if (isExecuting) {
    return null;
  }

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onExecute}
      className={`h-14 w-full px-6 rounded-[12px] font-medium text-base ${transitions.colorFade} flex items-center justify-center gap-2 ${
        isDisabled
          ? "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] cursor-not-allowed"
          : "bg-[var(--status-primary)] text-[var(--text-inverse)] hover:opacity-90"
      }`}
    >
      {!isDisabled && <Play className="w-4 h-4" />}
      {isDisabled ? "ツールを選んでください" : "実行する"}
    </button>
  );
};

ExecuteButton.displayName = "ExecuteButton";
