export type GuidanceActionType =
  | "open-settings"
  | "open-terminal"
  | "copy-command"
  | "retry-connection";

export type ModelSelectionBlockedReason = "NO_PROVIDER" | "NO_MODEL";

interface GuidanceActionConfig {
  type: GuidanceActionType;
  label: string;
  ariaLabel?: string;
}

interface ModelSelectionGuidanceConfig {
  reason: ModelSelectionBlockedReason;
  message: string;
  inputHint: string;
  primaryAction: GuidanceActionConfig;
  secondaryAction: GuidanceActionConfig;
}

export interface GuidanceActionHandlers {
  openSettings?: () => void;
  openTerminal?: () => void;
  copyCommand?: () => void;
  retryConnection?: () => void;
}

const SETTINGS_ACTION = Object.freeze({
  type: "open-settings",
  label: "設定を見る",
  ariaLabel: "設定画面へ移動",
} as const);

const TERMINAL_ACTION = Object.freeze({
  type: "open-terminal",
  label: "ターミナルを開く",
  ariaLabel: "ターミナルを開く",
} as const);

const MODEL_SELECTION_MESSAGE =
  "AIモデルが選択されていません。設定画面でモデルを選択してください。";
const MODEL_SELECTION_INPUT_HINT = "設定画面でモデルを選択すると送信できます";

export const MODEL_SELECTION_GUIDANCE = Object.freeze({
  message: MODEL_SELECTION_MESSAGE,
  actionLabel: SETTINGS_ACTION.label,
  actionAriaLabel: SETTINGS_ACTION.ariaLabel,
  inputHint: MODEL_SELECTION_INPUT_HINT,
});

export const MODEL_SELECTION_BLOCKED_GUIDANCE_MAP = Object.freeze({
  NO_PROVIDER: Object.freeze({
    reason: "NO_PROVIDER",
    message: MODEL_SELECTION_MESSAGE,
    inputHint: MODEL_SELECTION_INPUT_HINT,
    primaryAction: SETTINGS_ACTION,
    secondaryAction: TERMINAL_ACTION,
  }),
  NO_MODEL: Object.freeze({
    reason: "NO_MODEL",
    message: MODEL_SELECTION_MESSAGE,
    inputHint: MODEL_SELECTION_INPUT_HINT,
    primaryAction: SETTINGS_ACTION,
    secondaryAction: TERMINAL_ACTION,
  }),
} satisfies Record<ModelSelectionBlockedReason, ModelSelectionGuidanceConfig>);

export function deriveModelSelectionBlockedReason(input: {
  selectedProviderId: string | null;
  selectedModelId: string | null;
}): ModelSelectionBlockedReason | null {
  if (input.selectedProviderId == null) {
    return "NO_PROVIDER";
  }

  if (input.selectedModelId == null) {
    return "NO_MODEL";
  }

  return null;
}

export function getModelSelectionGuidance(
  reason: ModelSelectionBlockedReason | null,
): ModelSelectionGuidanceConfig | null {
  return reason ? MODEL_SELECTION_BLOCKED_GUIDANCE_MAP[reason] : null;
}

export function createGuidanceActionDispatcher(
  handlers: GuidanceActionHandlers,
): (actionType: GuidanceActionType) => (() => void) | undefined {
  return (actionType) => {
    switch (actionType) {
      case "open-settings":
        return handlers.openSettings;
      case "open-terminal":
        return handlers.openTerminal;
      case "copy-command":
        return handlers.copyCommand;
      case "retry-connection":
        return handlers.retryConnection;
      default: {
        const exhaustiveCheck: never = actionType;
        return exhaustiveCheck;
      }
    }
  };
}
