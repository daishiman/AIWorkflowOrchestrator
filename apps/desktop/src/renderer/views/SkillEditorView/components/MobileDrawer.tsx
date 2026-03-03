/**
 * MobileDrawer - モバイル用ファイルツリードロワー（molecule）
 *
 * UT-UI-05A-002: モバイルドロワー
 *
 * - 768px 未満でのみ使用（レスポンシブ切り替えは親コンポーネントが管理）
 * - スライドインアニメーション（左→右）
 * - オーバーレイクリック / Escape キーで閉じる
 * - フォーカストラップ（M-001 対応）
 *
 * @module SkillEditorView/components/MobileDrawer
 */

import React, { useEffect, useRef } from "react";

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Escape キーで閉じる
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

  // フォーカストラップ（M-001 対応）
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;

    // ドロワー開時にフォーカスをドロワー内に移動
    drawerRef.current.focus();
  }, [isOpen]);

  return (
    <>
      {/* オーバーレイ */}
      {isOpen && (
        <div
          data-testid="drawer-overlay"
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-30
            transition-opacity duration-200
            motion-reduce:transition-none"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ドロワー本体 */}
      <div
        ref={drawerRef}
        data-testid="mobile-drawer"
        tabIndex={-1}
        className={`
          fixed inset-y-0 left-0 w-[280px] z-40
          bg-[var(--bg-secondary)] border-r border-[var(--border-default)]
          shadow-lg
          transition-transform duration-250 ease-in-out
          motion-reduce:transition-none
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {children}
      </div>
    </>
  );
};

MobileDrawer.displayName = "MobileDrawer";
