/**
 * FileSelectorModal コンポーネント
 *
 * FileSelectorをモーダルダイアログとして表示するコンポーネント。
 * Portalを使用してdocument.bodyに直接レンダリングする。
 *
 * @see docs/30-workflows/file-selector-integration/step01-design.md
 */

import React, { useEffect, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Button } from "../../atoms/Button";
import { Icon } from "../../atoms/Icon";
import { FileSelector } from "../FileSelector/FileSelector";
import { WorkspaceFileSelector } from "../WorkspaceFileSelector";
import { useSelectedFiles } from "../../../store";
import type { SelectedFile } from "@repo/shared/types";
import type { WorkspaceSelectedFile } from "../WorkspaceFileSelector/types";

// =============================================================================
// Types
// =============================================================================

export interface WorkspaceFileSelectorOptions {
  /** 選択モード */
  selectionMode?: "single" | "multiple";
  /** 許可する拡張子 */
  allowedExtensions?: string[];
  /** 最大選択数 */
  maxSelection?: number;
}

export interface FileSelectorModalProps {
  /** モーダルの開閉状態 */
  open: boolean;

  /** モーダルを閉じるコールバック */
  onClose: () => void;

  /** ファイル選択確定時のコールバック */
  onConfirm: (files: SelectedFile[]) => void;

  /** モーダルのタイトル */
  title?: string;

  /** 確定ボタンのラベル */
  confirmLabel?: string;

  /** キャンセルボタンのラベル */
  cancelLabel?: string;

  /** 追加のCSSクラス */
  className?: string;

  /** 選択モード: 'external' (従来) | 'workspace' (新規) */
  mode?: "external" | "workspace";

  /** ワークスペースモード時の選択設定 */
  workspaceOptions?: WorkspaceFileSelectorOptions;
}

// =============================================================================
// Component
// =============================================================================

export const FileSelectorModal: React.FC<FileSelectorModalProps> = ({
  open,
  onClose,
  onConfirm,
  title = "ファイルを選択",
  confirmLabel = "選択",
  cancelLabel = "キャンセル",
  className,
  mode = "workspace",
  workspaceOptions,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<Element | null>(null);

  // externalモード用の選択ファイル（既存ストアから）
  const externalSelectedFiles = useSelectedFiles();

  // workspaceモード用の選択ファイル（ローカルステート）
  const [workspaceSelectedFiles, setWorkspaceSelectedFiles] = useState<
    WorkspaceSelectedFile[]
  >([]);

  // 現在のモードに応じた選択ファイル数
  const selectedFilesCount =
    mode === "workspace"
      ? workspaceSelectedFiles.length
      : externalSelectedFiles.length;

  // ===========================================================================
  // Focus Management
  // ===========================================================================

  useEffect(() => {
    if (open) {
      // 現在のフォーカス要素を保存
      previousActiveElementRef.current = document.activeElement;

      // モーダルにフォーカス
      const timer = setTimeout(() => {
        modalRef.current?.focus();
      }, 10);

      return () => clearTimeout(timer);
    } else {
      // フォーカスを元に戻す
      if (previousActiveElementRef.current instanceof HTMLElement) {
        previousActiveElementRef.current.focus();
      }
    }
  }, [open]);

  // ===========================================================================
  // Keyboard Handling
  // ===========================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // ===========================================================================
  // Event Handlers
  // ===========================================================================

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const handleConfirm = useCallback(() => {
    if (mode === "workspace") {
      // WorkspaceSelectedFile を SelectedFile に変換
      const convertedFiles: SelectedFile[] = workspaceSelectedFiles.map(
        (file) => {
          // ファイル名から拡張子を取得
          const lastDotIndex = file.name.lastIndexOf(".");
          const extension =
            lastDotIndex > 0 ? file.name.slice(lastDotIndex) : "";

          // 簡易的なMIMEタイプ推定
          const mimeType = extension
            ? `application/${extension.slice(1)}`
            : "application/octet-stream";

          const now = new Date().toISOString();
          return {
            id: file.id,
            name: file.name,
            path: file.path,
            extension,
            size: file.size ?? 0,
            mimeType,
            lastModified: file.modifiedAt?.toISOString() ?? now,
            createdAt: now,
          };
        },
      );
      onConfirm(convertedFiles);
    } else {
      onConfirm(externalSelectedFiles);
    }
  }, [mode, workspaceSelectedFiles, externalSelectedFiles, onConfirm]);

  // ワークスペースモードでの選択変更ハンドラ
  const handleWorkspaceSelectionChange = useCallback(
    (files: WorkspaceSelectedFile[]) => {
      setWorkspaceSelectedFiles(files);
    },
    [],
  );

  // モーダルを閉じるときに選択をリセット
  useEffect(() => {
    if (!open) {
      setWorkspaceSelectedFiles([]);
    }
  }, [open]);

  const handleModalClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // ===========================================================================
  // Render
  // ===========================================================================

  if (!open) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
      data-testid="file-selector-modal-overlay"
    >
      {/* Overlay */}
      <div
        className={clsx(
          "absolute inset-0 bg-black/60 backdrop-blur-sm",
          "transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="file-selector-modal-title"
        aria-describedby="file-selector-modal-description"
        tabIndex={-1}
        onClick={handleModalClick}
        className={clsx(
          // Base styles
          "relative flex flex-col",
          "bg-[var(--bg-glass)] backdrop-blur-xl",
          "border border-[var(--border-subtle)]",
          "rounded-lg shadow-2xl",
          // Animation
          "transition-all duration-200",
          open
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2",
          // Size - responsive
          "w-full max-w-[600px] mx-4",
          "h-[70vh] max-h-[80vh]",
          // Mobile: full screen
          "max-sm:mx-0 max-sm:max-w-none max-sm:h-screen max-sm:max-h-none max-sm:rounded-none",
          className,
        )}
        data-testid="file-selector-modal"
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <h2
            id="file-selector-modal-title"
            className="text-lg font-semibold text-white"
          >
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="閉じる"
            data-testid="file-selector-modal-close"
          >
            <Icon name="x" size={20} />
          </Button>
        </header>

        {/* Description for screen readers */}
        <p id="file-selector-modal-description" className="sr-only">
          ファイルを選択してください。Escapeキーで閉じることができます。
        </p>

        {/* Body */}
        <main className="flex-1 min-h-0 overflow-hidden">
          {mode === "workspace" ? (
            <WorkspaceFileSelector
              selectionMode={workspaceOptions?.selectionMode}
              allowedExtensions={workspaceOptions?.allowedExtensions}
              maxSelection={workspaceOptions?.maxSelection}
              onSelectionChange={handleWorkspaceSelectionChange}
              className="h-full"
            />
          ) : (
            <div className="p-6 overflow-auto h-full">
              <FileSelector />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-subtle)]">
          <span className="text-sm text-gray-400" data-testid="selected-count">
            {selectedFilesCount > 0
              ? `${selectedFilesCount}件選択中`
              : "ファイルを選択してください"}
          </span>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              data-testid="file-selector-modal-cancel"
            >
              {cancelLabel}
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={selectedFilesCount === 0}
              data-testid="file-selector-modal-confirm"
            >
              {confirmLabel}
            </Button>
          </div>
        </footer>
      </div>

      {/* Live region for screen readers */}
      <div role="status" aria-live="polite" className="sr-only">
        {selectedFilesCount > 0
          ? `${selectedFilesCount}件のファイルが選択されています`
          : ""}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

FileSelectorModal.displayName = "FileSelectorModal";

// Re-export hook for convenience
export { useFileSelectorModal } from "./useFileSelectorModal";
export type { UseFileSelectorModalReturn } from "./useFileSelectorModal";
