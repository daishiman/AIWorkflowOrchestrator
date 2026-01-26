/**
 * PermissionDialog - 権限確認ダイアログコンポーネント
 *
 * TASK-4-2: PermissionResolver IPC Handlers
 *
 * @module @repo/desktop/renderer/components/Permission/PermissionDialog
 */

import React, { useEffect, useRef, useId } from "react";
import type { SkillPermissionRequest } from "@repo/shared";

/**
 * PermissionDialog の Props
 */
export interface PermissionDialogProps {
  /** 権限確認リクエスト */
  request: SkillPermissionRequest | null;
  /** ダイアログが開いているか */
  isOpen: boolean;
  /** 許可ボタンクリック時のコールバック */
  onAllow: () => void;
  /** 拒否ボタンクリック時のコールバック */
  onDeny: () => void;
  /** ダイアログを閉じる時のコールバック（オーバーレイクリック時） */
  onClose?: () => void;
  /** 応答処理中フラグ */
  isResponding?: boolean;
}

/**
 * 権限確認ダイアログコンポーネント
 *
 * ユーザーにツール実行の権限確認を求めるモーダルダイアログ。
 * アクセシビリティ対応（ARIA属性、フォーカストラップ、キーボード操作）
 */
export const PermissionDialog: React.FC<PermissionDialogProps> = ({
  request,
  isOpen,
  onAllow,
  onDeny,
  onClose,
  isResponding = false,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const allowButtonRef = useRef<HTMLButtonElement>(null);
  const denyButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Escape キーでダイアログを閉じる
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onDeny();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onDeny]);

  // ダイアログが開いたら許可ボタンにフォーカス
  useEffect(() => {
    if (isOpen && allowButtonRef.current) {
      allowButtonRef.current.focus();
    }
  }, [isOpen]);

  // フォーカストラップ（DOM順序: 拒否 → 許可）
  useEffect(() => {
    if (!isOpen) return;

    const handleTabKey = (event: KeyboardEvent): void => {
      if (event.key !== "Tab") return;

      // DOM順序に合わせる（拒否ボタンが先、許可ボタンが後）
      const focusableElements = [denyButtonRef.current, allowButtonRef.current];
      const validElements = focusableElements.filter(Boolean) as HTMLElement[];

      if (validElements.length === 0) return;

      const firstElement = validElements[0]; // 拒否ボタン
      const lastElement = validElements[validElements.length - 1]; // 許可ボタン

      if (event.shiftKey) {
        // Shift+Tab: 最初の要素から最後の要素へ
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: 最後の要素から最初の要素へ
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTabKey);
    return () => document.removeEventListener("keydown", handleTabKey);
  }, [isOpen]);

  // 表示しない条件
  if (!isOpen || !request) {
    return null;
  }

  // オーバーレイクリック時の処理
  const handleOverlayClick = (): void => {
    if (onClose) {
      onClose();
    } else {
      onDeny();
    }
  };

  return (
    <>
      {/* オーバーレイ（スクリーンリーダーには隠す） */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-black/50"
        onClick={handleOverlayClick}
      />

      {/* ダイアログ本体 */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      >
        <div className="bg-background rounded-lg shadow-lg p-6 max-w-md w-full mx-4 pointer-events-auto">
          {/* タイトル */}
          <h2 id={titleId} className="text-lg font-semibold mb-4">
            権限の確認
          </h2>

          {/* 説明文 */}
          <div id={descriptionId} className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">
              以下のツールを実行してもよろしいですか？
            </p>

            {/* ツール情報 */}
            <div className="bg-muted rounded p-3 space-y-2">
              <p className="font-mono text-sm font-medium">
                {request.toolName}
              </p>

              {/* 理由（存在する場合） */}
              {request.reason && (
                <p className="text-sm text-muted-foreground">
                  {request.reason}
                </p>
              )}

              {/* 引数（JSON表示） */}
              {request.args && Object.keys(request.args).length > 0 && (
                <pre className="text-xs bg-background rounded p-2 overflow-x-auto max-h-32">
                  {JSON.stringify(request.args, null, 2)}
                </pre>
              )}
            </div>
          </div>

          {/* 処理中インジケーター */}
          {isResponding && (
            <p className="text-sm text-muted-foreground mb-4">処理中...</p>
          )}

          {/* ボタン */}
          <div className="flex justify-end gap-3">
            <button
              ref={denyButtonRef}
              onClick={onDeny}
              disabled={isResponding}
              className="px-4 py-2 rounded border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              拒否
            </button>
            <button
              ref={allowButtonRef}
              onClick={onAllow}
              disabled={isResponding}
              className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              許可
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PermissionDialog;
