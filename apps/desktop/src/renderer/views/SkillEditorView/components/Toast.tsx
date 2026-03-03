/**
 * Toast - 通知トーストコンポーネント（atom）
 *
 * UT-UI-05A-004: 保存成功 Toast
 *
 * - success: role="status" (aria-live="polite" 相当)
 * - error: role="alert" (aria-live="assertive" 相当)
 * - CheckCircle / XCircle アイコン（lucide-react）
 * - 閉じるボタン付き
 *
 * @module SkillEditorView/components/Toast
 */

import React from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import type { ToastType } from "../hooks/useToast";

/** Toast バリアント別スタイル定義（P47対策: テストで import して使用） */
export const toastVariantStyles: Record<ToastType, string> = {
  success: "bg-[var(--status-success)] text-white",
  error: "bg-[var(--status-error)] text-white",
};

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onDismiss: () => void;
}

const ToastIcon: React.FC<{ type: ToastType }> = ({ type }) => {
  if (type === "success") {
    return (
      <CheckCircle
        size={18}
        className="shrink-0"
        data-testid="toast-icon-success"
      />
    );
  }
  return (
    <XCircle size={18} className="shrink-0" data-testid="toast-icon-error" />
  );
};

export const Toast: React.FC<ToastProps> = ({ type, message, onDismiss }) => {
  const roleAttr = type === "error" ? "alert" : "status";

  return (
    <div
      role={roleAttr}
      className={`
        flex items-center gap-2 px-4 py-3 rounded-lg shadow-md
        pointer-events-auto
        transition-opacity duration-200
        motion-reduce:transition-none
        ${toastVariantStyles[type]}
      `}
    >
      <ToastIcon type={type} />
      <span className="text-sm font-medium">{message}</span>
      <button
        type="button"
        aria-label="閉じる"
        onClick={onDismiss}
        className="ml-2 p-0.5 rounded hover:bg-white hover:bg-opacity-20 transition-colors duration-150"
      >
        <X size={14} />
      </button>
    </div>
  );
};

Toast.displayName = "Toast";
