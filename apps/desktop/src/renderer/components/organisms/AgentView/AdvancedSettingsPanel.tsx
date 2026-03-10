import React, { useEffect } from "react";
import { X } from "lucide-react";
import { transitions } from "./animations";
import { interactiveStyles } from "./styles";
import type { AgentPermissionMode, ModelCardItem } from "./types";

export interface AdvancedSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  models: ModelCardItem[];
  selectedProviderId: string | null;
  selectedModelId: string | null;
  onSelectModel: (providerId: string, modelId: string) => void;
  permissionMode: AgentPermissionMode;
  onModeChange: (mode: AgentPermissionMode) => void;
  rememberedCount: number;
  onResetRemembered: () => void;
}

const healthBadgeStyles: Record<ModelCardItem["healthStatus"], string> = {
  healthy:
    "bg-[var(--status-success)]/10 text-[var(--status-success)] border-[var(--status-success)]/20",
  degraded:
    "bg-[var(--status-warning)]/10 text-[var(--status-warning)] border-[var(--status-warning)]/20",
  unavailable:
    "bg-[var(--status-error)]/10 text-[var(--status-error)] border-[var(--status-error)]/20",
  unknown:
    "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-primary)]",
};

const healthBadgeLabels: Record<ModelCardItem["healthStatus"], string> = {
  healthy: "利用可能",
  degraded: "不安定",
  unavailable: "利用不可",
  unknown: "未確認",
};

export const AdvancedSettingsPanel: React.FC<AdvancedSettingsPanelProps> = ({
  isOpen,
  onClose,
  models,
  selectedProviderId,
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
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        data-testid="advanced-settings-overlay"
        aria-label="詳細設定を閉じる"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />

      <div
        data-testid="advanced-settings-panel"
        role="dialog"
        aria-modal="true"
        aria-label="詳細設定"
        className={`relative z-10 h-full w-[360px] max-w-[90vw] border-l border-[var(--border-primary)] bg-[var(--bg-secondary)] p-6 shadow-2xl ${transitions.slideIn} overflow-auto`}
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

        <div className="mt-6 space-y-4">
          <h4 className="text-sm font-medium text-[var(--text-secondary)]">
            AIの種類
          </h4>
          <div role="radiogroup" aria-label="AIの種類" className="grid gap-2">
            {models.map((model) => {
              const isSelected =
                model.providerId === selectedProviderId &&
                model.modelId === selectedModelId;

              return (
                <div
                  key={`${model.providerId}:${model.modelId}`}
                  onClick={() => onSelectModel(model.providerId, model.modelId)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectModel(model.providerId, model.modelId);
                    }
                  }}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  className={`rounded-xl border p-3 ${interactiveStyles.cardHover} ${transitions.colorFade} ${
                    isSelected
                      ? "border-[var(--status-primary)] bg-[var(--status-primary)]/10"
                      : "border-transparent bg-[var(--bg-tertiary)] hover:border-[var(--border-primary)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-sm text-[var(--text-primary)]">
                        {model.displayName}
                      </div>
                      {model.description && (
                        <div className="mt-1 text-xs text-[var(--text-secondary)]">
                          {model.description}
                        </div>
                      )}
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-medium ${healthBadgeStyles[model.healthStatus]}`}
                    >
                      {healthBadgeLabels[model.healthStatus]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-[var(--text-secondary)]">
            許可モード
          </h4>
          <select
            data-testid="permission-mode-selector"
            value={permissionMode}
            onChange={(e) =>
              onModeChange(e.target.value as AgentPermissionMode)
            }
            className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-tertiary)] p-2.5 text-[var(--text-primary)]"
          >
            <option value="default">デフォルト</option>
            <option value="acceptEdits">編集を許可</option>
            <option value="bypassPermissions">全て許可</option>
            <option value="plan">プランモード</option>
          </select>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-[var(--text-secondary)]">
            記憶された許可: {rememberedCount}件
          </span>
          <button
            type="button"
            onClick={onResetRemembered}
            aria-label="リセット"
            disabled={rememberedCount === 0}
            className="text-sm text-[var(--status-primary)] hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
          >
            リセット
          </button>
        </div>
      </div>
    </div>
  );
};

AdvancedSettingsPanel.displayName = "AdvancedSettingsPanel";
