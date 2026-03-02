/**
 * ExportButton - エクスポートボタンコンポーネント（Molecule）
 *
 * JSON/CSV形式でデータをエクスポートする。
 * ドロップダウンで形式を選択する。
 *
 * @module ExportButton
 */

import React, { memo, useState, useCallback, useRef, useEffect } from "react";
import clsx from "clsx";
import { Download } from "lucide-react";

export interface ExportButtonProps {
  /** エクスポート実行ハンドラ */
  onExport: (format: "json" | "csv") => Promise<void>;
  /** 無効化状態 */
  isDisabled?: boolean;
  /** 追加のクラス名 */
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = memo(
  ({ onExport, isDisabled = false, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // ドロップダウン外クリックで閉じる
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    const handleExport = useCallback(
      async (format: "json" | "csv") => {
        setIsExporting(true);
        setIsOpen(false);
        try {
          await onExport(format);
        } finally {
          setIsExporting(false);
        }
      },
      [onExport],
    );

    return (
      <div ref={dropdownRef} className={clsx("relative", className)}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isDisabled || isExporting}
          className={clsx(
            "inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg",
            "border border-[var(--border-primary)]",
            "text-[var(--text-secondary)] bg-[var(--bg-primary)]",
            "hover:bg-[var(--bg-secondary)] transition-colors duration-[var(--duration-default)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
          aria-label="エクスポート"
          aria-expanded={isOpen}
          data-testid="export-button"
        >
          <Download size={14} aria-hidden="true" />
          <span>{isExporting ? "エクスポート中..." : "エクスポート"}</span>
        </button>

        {isOpen && (
          <div
            className={clsx(
              "absolute right-0 mt-1 w-36 rounded-lg shadow-lg",
              "bg-[var(--bg-primary)] border border-[var(--border-primary)]",
              "z-10",
            )}
            role="menu"
            data-testid="export-dropdown"
          >
            <button
              type="button"
              onClick={() => handleExport("json")}
              className={clsx(
                "w-full px-3 py-2 text-left text-sm",
                "text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]",
                "rounded-t-lg transition-colors duration-[var(--duration-quick)]",
              )}
              role="menuitem"
              data-testid="export-json"
            >
              JSON形式
            </button>
            <button
              type="button"
              onClick={() => handleExport("csv")}
              className={clsx(
                "w-full px-3 py-2 text-left text-sm",
                "text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]",
                "rounded-b-lg transition-colors duration-[var(--duration-quick)]",
              )}
              role="menuitem"
              data-testid="export-csv"
            >
              CSV形式
            </button>
          </div>
        )}
      </div>
    );
  },
);

ExportButton.displayName = "ExportButton";
