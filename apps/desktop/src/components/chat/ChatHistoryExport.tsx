/**
 * ChatHistoryExport - チャット履歴エクスポートダイアログ
 *
 * セッションのチャット履歴をMarkdown/JSON形式でエクスポートする
 * ダイアログコンポーネント。WCAG 2.1 AA準拠、Apple HIG準拠。
 *
 * @see docs/30-workflows/chat-history-persistence/ui-ux-design.md
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { FileText, FileJson, Download, X, AlertCircle } from "lucide-react";
import type {
  ChatHistoryExportProps,
  ExportFormat,
  ExportRange,
} from "./types";

/**
 * フォーマット情報
 */
const FORMAT_OPTIONS: {
  value: ExportFormat;
  label: string;
  extension: string;
  description: string;
  icon: typeof FileText;
}[] = [
  {
    value: "markdown",
    label: "Markdown",
    extension: ".md",
    description: "人間が読みやすい形式",
    icon: FileText,
  },
  {
    value: "json",
    label: "JSON",
    extension: ".json",
    description: "プログラムでの処理に最適",
    icon: FileJson,
  },
];

/**
 * ChatHistoryExport コンポーネント
 */
export function ChatHistoryExport({
  session,
  onExport,
  onClose,
  initialSelectedMessageIds,
}: ChatHistoryExportProps) {
  // 状態管理
  const [format, setFormat] = useState<ExportFormat>("markdown");
  const [range, setRange] = useState<ExportRange>(
    initialSelectedMessageIds && initialSelectedMessageIds.length > 0
      ? "selected"
      : "all",
  );
  const [selectedMessageIds] = useState<string[]>(
    initialSelectedMessageIds ?? [],
  );
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLInputElement>(null);

  // セッションがnullの場合の安全対策
  if (!session) {
    return null;
  }

  // 初期フォーカス
  useEffect(() => {
    firstFocusableRef.current?.focus();
  }, []);

  // Escapeキーでダイアログを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isExporting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isExporting]);

  // フォーカストラップ
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableElements = dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    dialog.addEventListener("keydown", handleTabKey);
    return () => dialog.removeEventListener("keydown", handleTabKey);
  }, [isExporting]);

  // オーバーレイクリックで閉じる
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && !isExporting) {
        onClose();
      }
    },
    [onClose, isExporting],
  );

  // エクスポート実行
  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      await onExport({
        format,
        range,
        selectedMessageIds:
          range === "selected" ? selectedMessageIds : undefined,
        includeMetadata,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "エクスポートに失敗しました";
      setError(message);
    } finally {
      setIsExporting(false);
    }
  };

  // エクスポートボタン無効条件
  const isExportDisabled =
    isExporting || (range === "selected" && selectedMessageIds.length === 0);

  // キーボードでラジオボタン選択（矢印キー）
  const handleFormatKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentFormat: ExportFormat,
  ) => {
    const formats: ExportFormat[] = ["markdown", "json"];
    const currentIndex = formats.indexOf(currentFormat);

    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % formats.length;
      setFormat(formats[nextIndex]);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + formats.length) % formats.length;
      setFormat(formats[prevIndex]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      data-testid="dialog-overlay"
      onClick={handleOverlayClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-label="エクスポート"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape" && !isExporting) {
            onClose();
          }
        }}
        className="mx-4 w-full max-w-md rounded-hig-lg bg-hig-bg-primary p-6 shadow-hig-lg"
      >
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-hig-text-primary">
            エクスポート設定
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            aria-label="閉じる"
            className="rounded-hig-sm p-1 text-hig-text-secondary hover:bg-hig-bg-secondary transition-colors duration-hig-micro disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* セッション情報 */}
        <div className="mb-6 rounded-hig-sm bg-hig-bg-secondary p-3">
          <p className="truncate font-medium text-hig-text-primary">
            {session.title}
          </p>
          <p className="mt-1 text-sm text-hig-text-secondary">
            {session.messageCount}件のメッセージ
          </p>
        </div>

        {/* フォーマット選択 */}
        <fieldset className="mb-6">
          <legend className="mb-3 text-sm font-medium text-hig-text-primary">
            形式を選択
          </legend>
          <div className="space-y-2">
            {FORMAT_OPTIONS.map((option, index) => {
              const Icon = option.icon;
              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-hig-sm border p-3 transition-colors duration-hig-micro ${
                    format === option.value
                      ? "border-hig-accent bg-hig-accent/5"
                      : "border-hig-border hover:bg-hig-bg-secondary"
                  }`}
                >
                  <input
                    ref={index === 0 ? firstFocusableRef : undefined}
                    type="radio"
                    name="export-format"
                    value={option.value}
                    checked={format === option.value}
                    onChange={() => setFormat(option.value)}
                    onKeyDown={(e) => handleFormatKeyDown(e, option.value)}
                    aria-label={`${option.label} 形式 (${option.extension})`}
                    className="h-4 w-4 text-hig-accent focus:ring-hig-accent/50"
                  />
                  <Icon className="h-5 w-5 text-hig-text-secondary" />
                  <div className="flex-1">
                    <span className="font-medium text-hig-text-primary">
                      {option.label}
                    </span>
                    <span className="ml-2 text-xs text-hig-text-secondary">
                      {option.extension}
                    </span>
                    <p className="text-sm text-hig-text-secondary">
                      {option.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* 範囲選択 */}
        <fieldset className="mb-6">
          <legend className="mb-3 text-sm font-medium text-hig-text-primary">
            エクスポート範囲
          </legend>
          <div className="space-y-2">
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-hig-sm border p-3 transition-colors duration-hig-micro ${
                range === "all"
                  ? "border-hig-accent bg-hig-accent/5"
                  : "border-hig-border hover:bg-hig-bg-secondary"
              }`}
            >
              <input
                type="radio"
                name="export-range"
                value="all"
                checked={range === "all"}
                onChange={() => setRange("all")}
                aria-label="全メッセージをエクスポート"
                className="h-4 w-4 text-hig-accent focus:ring-hig-accent/50"
              />
              <div className="flex-1">
                <span className="font-medium text-hig-text-primary">
                  全メッセージ
                </span>
              </div>
            </label>

            <label
              className={`flex cursor-pointer items-center gap-3 rounded-hig-sm border p-3 transition-colors duration-hig-micro ${
                range === "selected"
                  ? "border-hig-accent bg-hig-accent/5"
                  : "border-hig-border hover:bg-hig-bg-secondary"
              }`}
            >
              <input
                type="radio"
                name="export-range"
                value="selected"
                checked={range === "selected"}
                onChange={() => setRange("selected")}
                aria-label="選択したメッセージ"
                className="h-4 w-4 text-hig-accent focus:ring-hig-accent/50"
              />
              <div className="flex-1">
                <span className="font-medium text-hig-text-primary">
                  選択したメッセージ
                </span>
                {range === "selected" && (
                  <span className="ml-2 text-sm text-hig-text-secondary">
                    ({selectedMessageIds.length}件選択)
                  </span>
                )}
              </div>
            </label>
          </div>
        </fieldset>

        {/* メタデータオプション */}
        <div className="mb-6">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={includeMetadata}
              onChange={(e) => setIncludeMetadata(e.target.checked)}
              aria-label="メタデータを含める"
              className="h-4 w-4 rounded border-hig-border text-hig-accent focus:ring-hig-accent/50"
            />
            <span className="text-sm text-hig-text-primary">
              メタデータを含める
            </span>
          </label>
          <p className="mt-1 ml-7 text-xs text-hig-text-secondary">
            タイムスタンプ、モデル情報、トークン数などを含めます
          </p>
        </div>

        {/* エラー表示 */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 flex items-center gap-2 rounded-hig-sm bg-hig-error/10 p-3 text-sm text-hig-error"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="rounded-hig-sm px-4 py-2 text-sm text-hig-text-primary hover:bg-hig-bg-secondary transition-colors duration-hig-micro disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExportDisabled}
            className="flex items-center gap-2 rounded-hig-sm bg-hig-accent px-4 py-2 text-sm text-white hover:opacity-90 transition-opacity duration-hig-micro disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div
                  role="status"
                  aria-label="読み込み中"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                />
                ダウンロード中...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                ダウンロード
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatHistoryExport;
