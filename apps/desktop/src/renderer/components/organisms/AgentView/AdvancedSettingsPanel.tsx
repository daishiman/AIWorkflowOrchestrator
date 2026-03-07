import React, { useEffect } from "react";
import { X } from "lucide-react";
import { interactiveStyles } from "./styles";

export interface ModelCardItem {
  providerId: string;
  modelId: string;
  displayName: string;
  description?: string;
  healthStatus: "healthy" | "degraded" | "unavailable" | "unknown";
  isSelected: boolean;
}

export interface AdvancedSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  models: ModelCardItem[];
  selectedProviderId: string | null;
  selectedModelId: string | null;
  onSelectModel: (providerId: string, modelId: string) => void;
  permissionMode: string;
  onModeChange: (mode: string) => void;
  rememberedCount: number;
  onResetRemembered: () => void;
}

export const AdvancedSettingsPanel: React.FC<AdvancedSettingsPanelProps> = ({
  isOpen,
  onClose,
  models,
  selectedModelId,
  onSelectModel,
  permissionMode,
  onModeChange,
  rememberedCount,
  onResetRemembered,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="advanced-settings-panel"
      role="dialog"
      aria-modal="true"
      aria-label="詳細設定"
      className="h-full bg-[var(--bg-secondary)] border-l border-[var(--border-primary)] p-6 space-y-6 overflow-auto"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          詳細設定
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className={interactiveStyles.iconButton}
        >
          <X className="w-5 h-5 text-[var(--text-secondary)]" />
        </button>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-[var(--text-secondary)]">
          モデル選択
        </h4>
        <div className="grid gap-2">
          {models.map((model) => (
            <div
              key={model.modelId}
              onClick={() => onSelectModel(model.providerId, model.modelId)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectModel(model.providerId, model.modelId);
                }
              }}
              role="radio"
              aria-checked={model.modelId === selectedModelId}
              tabIndex={0}
              className={`p-3 rounded-xl ${interactiveStyles.cardHover} ${
                model.modelId === selectedModelId
                  ? "bg-[var(--status-primary)]/10 border-2 border-[var(--status-primary)]"
                  : "bg-[var(--bg-tertiary)] border border-transparent hover:border-[var(--border-primary)]"
              }`}
            >
              <div className="font-medium text-sm text-[var(--text-primary)]">
                {model.displayName}
              </div>
              {model.description && (
                <div className="text-xs text-[var(--text-secondary)] mt-1">
                  {model.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-[var(--text-secondary)]">
          許可モード
        </h4>
        <select
          data-testid="permission-mode-selector"
          value={permissionMode}
          onChange={(e) => onModeChange(e.target.value)}
          className="w-full p-2.5 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary)]"
        >
          <option value="default">デフォルト</option>
          <option value="acceptEdits">編集を許可</option>
          <option value="bypassPermissions">全て許可</option>
          <option value="plan">プランモード</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--text-secondary)]">
          記憶された許可: {rememberedCount}件
        </span>
        <button
          type="button"
          onClick={onResetRemembered}
          aria-label="リセット"
          className="text-sm text-[var(--status-primary)] hover:underline"
        >
          リセット
        </button>
      </div>
    </div>
  );
};

AdvancedSettingsPanel.displayName = "AdvancedSettingsPanel";
