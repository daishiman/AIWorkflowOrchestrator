/**
 * ContextMenu - コンテキストメニューコンポーネント
 *
 * フォルダ/ファイルの右クリックメニューを提供します。
 *
 * @module ContextMenu
 */

import React, { useEffect, useRef, useCallback, memo } from "react";

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}

export const ContextMenu = memo(function ContextMenu({
  items,
  position,
  onClose,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // 外側クリックでメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleItemClick = useCallback(
    (item: ContextMenuItem) => {
      if (!item.disabled) {
        item.onClick();
        onClose();
      }
    },
    [onClose],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, item: ContextMenuItem) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleItemClick(item);
      }
    },
    [handleItemClick],
  );

  return (
    <div
      ref={menuRef}
      className="context-menu fixed z-50 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg py-1 min-w-[160px]"
      style={{ left: position.x, top: position.y }}
      role="menu"
      aria-label="コンテキストメニュー"
      data-testid="context-menu"
    >
      {items.map((item) => (
        <button
          key={item.id}
          className={`context-menu-item w-full px-3 py-1.5 text-left text-sm flex items-center gap-2
            ${item.disabled ? "text-zinc-500 cursor-not-allowed" : "text-zinc-200 hover:bg-zinc-700 cursor-pointer"}
            ${item.danger && !item.disabled ? "text-red-400 hover:text-red-300" : ""}`}
          onClick={() => handleItemClick(item)}
          onKeyDown={(e) => handleKeyDown(e, item)}
          disabled={item.disabled}
          role="menuitem"
          tabIndex={item.disabled ? -1 : 0}
          data-testid={`context-menu-item-${item.id}`}
        >
          {item.icon && <span aria-hidden="true">{item.icon}</span>}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
});

export default ContextMenu;
