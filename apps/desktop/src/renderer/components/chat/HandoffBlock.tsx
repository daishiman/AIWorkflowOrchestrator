import React from "react";

export interface HandoffGuidance {
  terminalCommand: string;
  contextSummary: string;
  reason: string;
}

export interface HandoffBlockProps {
  guidance: HandoffGuidance;
  onOpenTerminal?: () => void;
}

export const HandoffBlock: React.FC<HandoffBlockProps> = ({
  guidance,
  onOpenTerminal,
}) => {
  return (
    <div data-testid="handoff-block">
      <span data-testid="handoff-summary">{guidance.contextSummary}</span>
      <pre data-testid="handoff-command">{guidance.terminalCommand}</pre>
      <button
        data-testid="persistent-terminal-launcher"
        onClick={onOpenTerminal}
      >
        ターミナルを開く
      </button>
    </div>
  );
};
