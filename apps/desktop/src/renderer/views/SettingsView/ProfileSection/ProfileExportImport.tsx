/**
 * ProfileExportImport コンポーネント
 *
 * プロフィールエクスポート/インポートUIコンポーネント
 */

import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { Icon } from "../../../components/atoms/Icon";
import { Button } from "../../../components/atoms/Button";

export interface ProfileExportImportProps {
  onExport: () => Promise<{
    success: boolean;
    filePath?: string;
    error?: string;
  }>;
  onImport: (filePath: string) => Promise<{ success: boolean; error?: string }>;
  disabled?: boolean;
  exportOnly?: boolean;
  className?: string;
}

export const ProfileExportImport: React.FC<ProfileExportImportProps> = ({
  onExport,
  onImport,
  disabled = false,
  exportOnly = false,
  className,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // エクスポート処理
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setMessage(null);
    try {
      const result = await onExport();
      if (result.success) {
        setMessage({
          type: "success",
          text: `エクスポートが完了しました: ${result.filePath?.split("/").pop() ?? ""}`,
        });
      } else {
        setMessage({
          type: "error",
          text: result.error ?? "エクスポートに失敗しました",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "エクスポート中にエラーが発生しました",
      });
    } finally {
      setIsExporting(false);
    }
  }, [onExport]);

  // ファイル選択用のダイアログを開く
  const handleImportClick = useCallback(async () => {
    // Electron のダイアログを使用してファイル選択
    const electronAPI = (
      window as unknown as {
        electronAPI?: {
          dialog?: {
            showOpenDialog: (
              options: unknown,
            ) => Promise<{ filePaths: string[]; canceled: boolean }>;
          };
        };
      }
    ).electronAPI;
    if (!electronAPI?.dialog?.showOpenDialog) {
      setMessage({ type: "error", text: "ファイル選択機能が利用できません" });
      return;
    }

    const result = await electronAPI.dialog.showOpenDialog({
      title: "プロフィール設定をインポート",
      filters: [{ name: "JSON", extensions: ["json"] }],
      properties: ["openFile"],
    });

    if (result.canceled || !result.filePaths?.[0]) {
      return;
    }

    setIsImporting(true);
    setMessage(null);
    try {
      const importResult = await onImport(result.filePaths[0]);
      if (importResult.success) {
        setMessage({ type: "success", text: "インポートが完了しました" });
      } else {
        setMessage({
          type: "error",
          text: importResult.error ?? "インポートに失敗しました",
        });
      }
    } catch {
      setMessage({ type: "error", text: "インポート中にエラーが発生しました" });
    } finally {
      setIsImporting(false);
    }
  }, [onImport]);

  const isDisabled = disabled || isExporting || isImporting;

  return (
    <div
      role="region"
      aria-label="データ管理"
      className={clsx("space-y-4", className)}
      data-testid="profile-export-import"
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-white/80">データ管理</h4>
          <p className="text-xs text-white/50 mt-1">
            設定をファイルに保存・復元できます
          </p>
        </div>
      </div>

      {/* Security note */}
      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
        <p className="text-xs text-white/60">
          <Icon name="shield" size={12} className="inline mr-1" />
          メールアドレスやアカウント情報は含まれません。タイムゾーン情報は含まれます。
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={handleExport}
          disabled={isDisabled}
          loading={isExporting}
          aria-label="エクスポート"
        >
          <Icon name="download" size={16} className="mr-2" />
          エクスポート
        </Button>

        {!exportOnly && (
          <Button
            variant="secondary"
            onClick={handleImportClick}
            disabled={isDisabled}
            loading={isImporting}
            aria-label="インポート"
          >
            <Icon name="upload" size={16} className="mr-2" />
            インポート
          </Button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          role="alert"
          className={clsx(
            "p-3 rounded-lg text-sm",
            message.type === "success"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20",
          )}
        >
          <Icon
            name={message.type === "success" ? "check-circle" : "alert-circle"}
            size={16}
            className="inline mr-2"
          />
          {message.text}
        </div>
      )}
    </div>
  );
};

ProfileExportImport.displayName = "ProfileExportImport";
