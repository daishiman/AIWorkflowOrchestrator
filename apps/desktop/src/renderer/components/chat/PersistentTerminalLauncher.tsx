import React from "react";

export interface PersistentTerminalLauncherProps {
  command: string;
  onLaunch?: () => void;
}

export const PersistentTerminalLauncher: React.FC<
  PersistentTerminalLauncherProps
> = ({ command, onLaunch }) => {
  return (
    <button
      data-testid="persistent-terminal-launcher"
      onClick={onLaunch}
      aria-label="実行コンソールを開く"
    >
      実行コンソールを開く: {command}
    </button>
  );
};
