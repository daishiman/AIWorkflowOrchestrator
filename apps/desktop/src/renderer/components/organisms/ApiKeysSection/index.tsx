/**
 * APIキー設定セクション
 *
 * 各AIプロバイダーのAPIキーを管理するUIコンポーネント
 *
 * @see docs/30-workflows/api-key-management/ui-design.md
 */

import React, { useState, useCallback, useEffect } from "react";
import clsx from "clsx";
import { SettingsCard } from "../SettingsCard";
import { Button } from "../../atoms/Button";
import { Input } from "../../atoms/Input";
import { Badge } from "../../atoms/Badge";
import { Spinner } from "../../atoms/Spinner";
import { Icon, type IconName } from "../../atoms/Icon";
import { AIProviderIcon } from "../../atoms/AIProviderIcon";
import { GlassPanel } from "../GlassPanel";
import type {
  AIProvider,
  ProviderStatus,
  ApiKeyValidationStatus,
} from "@repo/shared/types/api-keys";

// === Types ===

export interface ApiKeysSectionProps {
  className?: string;
}

interface ApiKeysSectionState {
  providers: ProviderStatus[];
  isLoading: boolean;
  error: string | null;
  editingProvider: AIProvider | null;
  deletingProvider: AIProvider | null;
}

interface ApiKeyFormState {
  apiKey: string;
  validationStatus: ApiKeyValidationStatus | null;
  validationMessage: string | null;
  isValidating: boolean;
  isSaving: boolean;
  error: string | null;
  showPassword: boolean;
}

// === Constants ===

const AI_PROVIDERS_META: Record<
  AIProvider,
  { displayName: string; placeholder: string }
> = {
  openai: { displayName: "OpenAI", placeholder: "sk-..." },
  anthropic: { displayName: "Anthropic", placeholder: "sk-ant-..." },
  google: { displayName: "Google AI", placeholder: "AIza..." },
  xai: { displayName: "xAI", placeholder: "xai-..." },
};

const ALL_PROVIDERS: AIProvider[] = ["openai", "anthropic", "google", "xai"];

const VALIDATION_STATUS_CONFIG: Record<
  ApiKeyValidationStatus,
  { icon: IconName; color: string; message: string }
> = {
  valid: {
    icon: "check-circle",
    color: "text-green-400",
    message: "APIキーは有効です",
  },
  invalid: {
    icon: "x-circle",
    color: "text-red-400",
    message: "APIキーが無効です。キーを確認して再入力してください",
  },
  network_error: {
    icon: "alert-triangle",
    color: "text-yellow-400",
    message: "サーバーに接続できません。しばらく待ってから再試行してください",
  },
  timeout: {
    icon: "clock",
    color: "text-yellow-400",
    message: "接続がタイムアウトしました。ネットワーク環境を確認してください",
  },
  unknown_error: {
    icon: "alert-circle",
    color: "text-yellow-400",
    message: "検証中にエラーが発生しました。もう一度お試しください",
  },
};

// === Helpers ===

const formatValidatedAt = (isoDate: string | null): string | null => {
  if (!isoDate) return null;
  try {
    const date = new Date(isoDate);
    return `最終検証: ${date.toLocaleDateString("ja-JP")}`;
  } catch {
    return null;
  }
};

// === Sub Components ===

interface ValidationStatusDisplayProps {
  status: ApiKeyValidationStatus | null;
  message?: string;
  isLoading?: boolean;
  className?: string;
}

const ValidationStatusDisplay: React.FC<ValidationStatusDisplayProps> = ({
  status,
  message,
  isLoading,
  className,
}) => {
  if (isLoading) {
    return (
      <div
        className={clsx("flex items-center gap-2 text-white/60", className)}
        role="status"
        aria-live="polite"
      >
        <Spinner size="sm" />
        <span>検証中...</span>
      </div>
    );
  }

  if (!status) return null;

  const config = VALIDATION_STATUS_CONFIG[status];
  const displayMessage = message || config.message;

  return (
    <div
      className={clsx("flex items-center gap-2", config.color, className)}
      role="status"
      aria-live="polite"
      aria-label={`検証結果: ${displayMessage}`}
    >
      <Icon name={config.icon} size={16} aria-hidden="true" />
      <span>{displayMessage}</span>
    </div>
  );
};

interface ApiKeyItemProps {
  provider: AIProvider;
  displayName: string;
  status: "registered" | "not_registered";
  lastValidatedAt: string | null;
  onRegister: () => void;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

const ApiKeyItem: React.FC<ApiKeyItemProps> = ({
  provider,
  displayName,
  status,
  lastValidatedAt,
  onRegister,
  onEdit,
  onDelete,
  disabled,
}) => {
  const isRegistered = status === "registered";
  const validatedAtText = formatValidatedAt(lastValidatedAt);

  return (
    <div
      role="listitem"
      aria-label={`${displayName}のAPIキー、${isRegistered ? "登録済み" : "未登録"}`}
      className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <AIProviderIcon
            provider={provider}
            size={18}
            className="text-white/80"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-white font-medium">{displayName}</span>
          {validatedAtText && (
            <span className="text-xs text-white/40">{validatedAtText}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge
          variant={isRegistered ? "success" : "default"}
          size="sm"
          aria-label={isRegistered ? "登録済み" : "未登録"}
        >
          {isRegistered ? "登録済み" : "未登録"}
        </Badge>

        {isRegistered ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              disabled={disabled}
              aria-label="編集"
            >
              編集
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={disabled}
              aria-label="削除"
            >
              削除
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRegister}
            disabled={disabled}
            aria-label={`${displayName}のAPIキーを登録`}
          >
            登録
          </Button>
        )}
      </div>
    </div>
  );
};

interface ApiKeyFormModalProps {
  provider: AIProvider;
  displayName: string;
  isOpen: boolean;
  isEdit: boolean;
  onClose: () => void;
  onSave: () => void;
}

const ApiKeyFormModal: React.FC<ApiKeyFormModalProps> = ({
  provider,
  displayName,
  isOpen,
  isEdit,
  onClose,
  onSave,
}) => {
  const [formState, setFormState] = useState<ApiKeyFormState>({
    apiKey: "",
    validationStatus: null,
    validationMessage: null,
    isValidating: false,
    isSaving: false,
    error: null,
    showPassword: false,
  });

  useEffect(() => {
    if (isOpen) {
      setFormState({
        apiKey: "",
        validationStatus: null,
        validationMessage: null,
        isValidating: false,
        isSaving: false,
        error: null,
        showPassword: false,
      });
    }
  }, [isOpen, provider]);

  const handleValidate = useCallback(async () => {
    if (!formState.apiKey) return;

    setFormState((prev) => ({
      ...prev,
      isValidating: true,
      validationStatus: null,
      validationMessage: null,
    }));

    try {
      const result = await window.electronAPI.apiKey.validate({
        provider,
        apiKey: formState.apiKey,
      });

      if (result.success && result.data) {
        setFormState((prev) => ({
          ...prev,
          isValidating: false,
          validationStatus: result.data!.status,
          validationMessage: result.data!.errorMessage || null,
        }));
      } else {
        setFormState((prev) => ({
          ...prev,
          isValidating: false,
          validationStatus: "unknown_error",
          validationMessage: result.error?.message || "検証に失敗しました",
        }));
      }
    } catch {
      setFormState((prev) => ({
        ...prev,
        isValidating: false,
        validationStatus: "unknown_error",
        validationMessage: "検証中にエラーが発生しました",
      }));
    }
  }, [formState.apiKey, provider]);

  const handleSave = useCallback(async () => {
    if (!formState.apiKey) return;

    setFormState((prev) => ({
      ...prev,
      isSaving: true,
      error: null,
    }));

    try {
      const result = await window.electronAPI.apiKey.save({
        provider,
        apiKey: formState.apiKey,
      });

      if (result.success) {
        onSave();
        onClose();
      } else {
        setFormState((prev) => ({
          ...prev,
          isSaving: false,
          error: result.error?.message || "保存に失敗しました",
        }));
      }
    } catch {
      setFormState((prev) => ({
        ...prev,
        isSaving: false,
        error: "保存中にエラーが発生しました",
      }));
    }
  }, [formState.apiKey, provider, onSave, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  const handleBlur = useCallback(() => {
    setFormState((prev) => ({ ...prev, showPassword: false }));
  }, []);

  if (!isOpen) return null;

  const placeholder =
    AI_PROVIDERS_META[provider]?.placeholder || "APIキーを入力";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <GlassPanel radius="lg" blur="lg" className="w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2
              id="api-key-form-title"
              className="text-lg font-semibold text-white"
            >
              {displayName}のAPIキーを{isEdit ? "編集" : "登録"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="閉じる"
            >
              <Icon name="x" size={20} />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="api-key-input"
                className="block text-sm font-medium text-white mb-1"
              >
                APIキー
              </label>
              <div className="relative">
                <Input
                  id="api-key-input"
                  type={formState.showPassword ? "text" : "password"}
                  value={formState.apiKey}
                  onChange={(value) =>
                    setFormState((prev) => ({ ...prev, apiKey: value }))
                  }
                  placeholder={placeholder}
                  onBlur={handleBlur}
                  aria-label="APIキー"
                  aria-describedby="api-key-hint"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white"
                  onClick={() =>
                    setFormState((prev) => ({
                      ...prev,
                      showPassword: !prev.showPassword,
                    }))
                  }
                  aria-label={
                    formState.showPassword
                      ? "APIキーを隠す"
                      : "APIキーを表示する"
                  }
                >
                  <Icon
                    name={formState.showPassword ? "eye-off" : "eye"}
                    size={18}
                  />
                </button>
              </div>
              <p id="api-key-hint" className="mt-1 text-xs text-white/40">
                {`「${placeholder.replace("...", "")}」で始まるAPIキーを入力してください`}
              </p>
            </div>

            {(formState.validationStatus || formState.isValidating) && (
              <ValidationStatusDisplay
                status={formState.validationStatus}
                message={formState.validationMessage || undefined}
                isLoading={formState.isValidating}
              />
            )}

            {formState.error && (
              <div className="text-sm text-red-400" role="alert">
                {formState.error}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" onClick={onClose}>
              キャンセル
            </Button>
            <Button
              variant="secondary"
              onClick={handleValidate}
              disabled={!formState.apiKey || formState.isValidating}
            >
              検証
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!formState.apiKey || formState.isSaving}
            >
              保存
            </Button>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
};

interface DeleteConfirmDialogProps {
  provider: AIProvider;
  displayName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  provider,
  displayName,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = useCallback(async () => {
    setIsDeleting(true);
    try {
      const result = await window.electronAPI.apiKey.delete({ provider });
      if (result.success) {
        onConfirm();
        onClose();
      }
    } finally {
      setIsDeleting(false);
    }
  }, [provider, onConfirm, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <GlassPanel radius="lg" blur="lg" className="w-full max-w-sm p-6">
        <h2
          id="delete-confirm-title"
          className="text-lg font-semibold text-white mb-4"
        >
          APIキーを削除
        </h2>

        <p className="text-white/80 mb-2">
          {displayName}のAPIキーを削除しますか？
        </p>

        <p className="text-sm text-white/60 mb-6">
          この操作は取り消せません。削除後、このプロバイダーを使用するには再度APIキーを登録する必要があります。
        </p>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600"
          >
            削除
          </Button>
        </div>
      </GlassPanel>
    </div>
  );
};

// === Main Component ===

export const ApiKeysSection: React.FC<ApiKeysSectionProps> = ({
  className,
}) => {
  const [state, setState] = useState<ApiKeysSectionState>({
    providers: [],
    isLoading: true,
    error: null,
    editingProvider: null,
    deletingProvider: null,
  });

  const [formModalProvider, setFormModalProvider] = useState<{
    provider: AIProvider;
    isEdit: boolean;
  } | null>(null);

  const loadProviders = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await window.electronAPI.apiKey.list();

      if (result.success && result.data) {
        setState((prev) => ({
          ...prev,
          providers: result.data!.providers,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: result.error?.message || "Failed to load API keys",
        }));
      }
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "APIキーの取得に失敗しました",
      }));
    }
  }, []);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const handleRegister = useCallback((provider: AIProvider) => {
    setFormModalProvider({ provider, isEdit: false });
  }, []);

  const handleEdit = useCallback((provider: AIProvider) => {
    setFormModalProvider({ provider, isEdit: true });
  }, []);

  const handleDelete = useCallback((provider: AIProvider) => {
    setState((prev) => ({ ...prev, deletingProvider: provider }));
  }, []);

  const handleFormClose = useCallback(() => {
    setFormModalProvider(null);
  }, []);

  const handleFormSave = useCallback(() => {
    loadProviders();
  }, [loadProviders]);

  const handleDeleteClose = useCallback(() => {
    setState((prev) => ({ ...prev, deletingProvider: null }));
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    loadProviders();
  }, [loadProviders]);

  const handleRetry = useCallback(() => {
    loadProviders();
  }, [loadProviders]);

  // プロバイダー一覧を構築（常に4つ表示）
  const providerList = ALL_PROVIDERS.map((provider) => {
    const existing = state.providers.find((p) => p.provider === provider);
    return (
      existing || {
        provider,
        displayName: AI_PROVIDERS_META[provider].displayName,
        status: "not_registered" as const,
        lastValidatedAt: null,
      }
    );
  });

  return (
    <div className={clsx(className)} aria-label="APIキー設定">
      <SettingsCard
        title="APIキー設定"
        description="AIサービスへの接続に使用するAPIキーを管理します"
        id="api-keys-settings-heading"
      >
        {state.isLoading ? (
          <div
            className="flex items-center justify-center py-8"
            role="status"
            aria-label="読み込み中"
            data-testid="loading-spinner"
          >
            <Spinner size="md" />
          </div>
        ) : state.error ? (
          <div className="text-center py-4">
            <p className="text-red-400 mb-2" role="alert">
              {state.error}
            </p>
            <Button variant="ghost" onClick={handleRetry} aria-label="再試行">
              再試行
            </Button>
          </div>
        ) : (
          <div role="list" className="space-y-2">
            {providerList.map((provider) => (
              <ApiKeyItem
                key={provider.provider}
                provider={provider.provider}
                displayName={provider.displayName}
                status={provider.status}
                lastValidatedAt={provider.lastValidatedAt}
                onRegister={() => handleRegister(provider.provider)}
                onEdit={() => handleEdit(provider.provider)}
                onDelete={() => handleDelete(provider.provider)}
                disabled={state.isLoading}
              />
            ))}
          </div>
        )}

        <p className="mt-4 text-xs text-white/40 flex items-center gap-1">
          <Icon name="lock" size={14} aria-hidden="true" />
          APIキーは暗号化して安全に保存されます
        </p>
      </SettingsCard>

      {/* Form Modal */}
      {formModalProvider && (
        <ApiKeyFormModal
          provider={formModalProvider.provider}
          displayName={
            AI_PROVIDERS_META[formModalProvider.provider].displayName
          }
          isOpen={true}
          isEdit={formModalProvider.isEdit}
          onClose={handleFormClose}
          onSave={handleFormSave}
        />
      )}

      {/* Delete Confirm Dialog */}
      {state.deletingProvider && (
        <DeleteConfirmDialog
          provider={state.deletingProvider}
          displayName={AI_PROVIDERS_META[state.deletingProvider].displayName}
          isOpen={true}
          onClose={handleDeleteClose}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

ApiKeysSection.displayName = "ApiKeysSection";
