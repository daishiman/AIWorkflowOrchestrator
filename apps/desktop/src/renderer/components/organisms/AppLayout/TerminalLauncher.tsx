import React from "react";
import type { AccessCapability } from "@repo/shared/types/execution-capability";
import { Button, Icon } from "../../atoms";

export interface TerminalLauncherProps {
  capability: AccessCapability;
  isDisabled: boolean;
  disabledReason?: string;
  onLaunch: () => void;
}

export const TerminalLauncher: React.FC<TerminalLauncherProps> = ({
  capability,
  isDisabled,
  disabledReason,
  onLaunch,
}) => {
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onLaunch}
      disabled={isDisabled}
      title={disabledReason}
      aria-label="ターミナルを開く"
      data-testid="app-layout-terminal-launcher"
      data-capability={capability}
      className="min-w-[112px]"
    >
      <span className="flex items-center gap-2">
        <Icon name="monitor" size={14} />
        <span>{capability === "both" ? "AI + Terminal" : "Terminal"}</span>
      </span>
    </Button>
  );
};
