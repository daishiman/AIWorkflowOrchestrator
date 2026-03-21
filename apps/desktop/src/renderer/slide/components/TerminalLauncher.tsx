import React from "react";

interface TerminalLauncherProps {
  terminalCommand?: string;
  onCopy: () => void;
  onLaunch: () => void;
}

export const TerminalLauncher: React.FC<TerminalLauncherProps> = ({
  terminalCommand,
  onCopy,
  onLaunch,
}) => {
  if (terminalCommand === undefined) {
    return null;
  }

  return (
    <div
      role="complementary"
      aria-label="ターミナルランチャー"
      data-testid="terminal-launcher"
      className="flex items-center gap-2 rounded-xl border border-[#C6C6C8] dark:border-[#38383A] bg-[#F2F2F7] dark:bg-[#1C1C1E] px-4 py-3"
    >
      <code className="flex-1 truncate text-sm font-mono text-[#000000] dark:text-[#FFFFFF]">
        {terminalCommand}
      </code>
      <button
        type="button"
        onClick={onCopy}
        aria-label="コマンドをコピー"
        className="rounded-lg px-3 py-1.5 text-xs font-medium border border-[#C6C6C8] dark:border-[#38383A] text-[#3C3C43] dark:text-[rgba(235,235,245,0.6)] hover:bg-[#E5E5EA] dark:hover:bg-[#2C2C2E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:ring-offset-2"
      >
        コピー
      </button>
      <button
        type="button"
        onClick={onLaunch}
        aria-label="ターミナルを開く"
        className="rounded-lg px-3 py-1.5 text-xs font-medium bg-[#000000] dark:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#000000] hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:ring-offset-2"
      >
        ターミナルを開く
      </button>
    </div>
  );
};
