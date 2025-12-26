import { clsx } from "clsx";
import { Settings } from "lucide-react";

export interface SystemPromptToggleButtonProps {
  isExpanded: boolean;
  onClick: () => void;
  hasContent: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * システムプロンプトパネルの展開/折りたたみボタン
 * - 内容があるときはインジケーターを表示
 * - 展開時はアイコンが回転
 */
export function SystemPromptToggleButton({
  isExpanded,
  onClick,
  hasContent,
  disabled = false,
  className,
}: SystemPromptToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid="system-prompt-toggle-button"
      className={clsx(
        "relative flex items-center justify-center",
        "w-8 h-8 rounded-md",
        "transition-all duration-200",
        "bg-transparent",
        hasContent ? "text-[var(--status-primary)]" : "text-white/60",
        "hover:bg-white/5 hover:text-white/80",
        isExpanded && "bg-white/10 text-white",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      aria-expanded={isExpanded}
      aria-controls="system-prompt-panel"
      aria-label={
        isExpanded ? "システムプロンプトを閉じる" : "システムプロンプトを開く"
      }
    >
      <Settings
        size={18}
        className={clsx(
          "transition-transform duration-200",
          isExpanded && "rotate-180",
        )}
      />
      {hasContent && !isExpanded && (
        <span
          className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--status-primary,#7aa2f7)]"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

export default SystemPromptToggleButton;
