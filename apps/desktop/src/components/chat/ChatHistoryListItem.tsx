/**
 * ChatHistoryListItem - チャット履歴リストアイテム
 *
 * 個別のセッションアイテムコンポーネント。
 * ピン留め、お気に入り、削除、名前変更機能を提供。
 */

import { useState, useRef, useEffect } from "react";
import {
  Pin,
  PinOff,
  Star,
  StarOff,
  MoreHorizontal,
  Pencil,
  Trash2,
  MessageSquare,
} from "lucide-react";
import type { ChatSession } from "./types";

/**
 * セッションアイテムコンポーネント
 * リストボックスパターン (role="option" + aria-selected)
 */
export function ChatHistoryListItem({
  session,
  isSelected,
  onSelect,
  onTogglePin,
  onToggleFavorite,
  onDelete,
  onRename,
}: {
  session: ChatSession;
  isSelected: boolean;
  onSelect: () => void;
  onTogglePin: (isPinned: boolean) => void;
  onToggleFavorite: (isFavorite: boolean) => void;
  onDelete: () => void;
  onRename: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  // メニュー外クリックで閉じる
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div
      ref={itemRef}
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={`group relative cursor-pointer rounded-hig-md px-3 py-2 transition-colors duration-hig-micro focus:outline-none focus:ring-2 focus:ring-hig-accent/50 ${
        isSelected
          ? "bg-hig-accent/10 border border-hig-accent/30"
          : "hover:bg-hig-bg-secondary"
      }`}
    >
      {/* タイトルとプレビュー */}
      <div className="flex items-start gap-2 pr-24">
        <MessageSquare
          className="mt-1 h-4 w-4 shrink-0 text-hig-text-secondary"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-hig-text-primary">
            {session.title}
          </p>
          {session.lastMessagePreview && (
            <p className="truncate text-sm text-hig-text-secondary">
              {session.lastMessagePreview}
            </p>
          )}
          <p className="mt-1 text-xs text-hig-text-secondary">
            {session.messageCount}件
          </p>
        </div>
      </div>

      {/* アクションボタン - tabIndex=-1 でフォーカス不可にし、nested-interactive問題を回避 */}
      <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-hig-micro">
        {/* ピン留めボタン */}
        <button
          type="button"
          tabIndex={-1}
          aria-label={session.isPinned ? "ピン留め解除" : "ピン留め"}
          onClick={(e) =>
            handleActionClick(e, () => onTogglePin(!session.isPinned))
          }
          className="rounded-hig-sm p-1 hover:bg-hig-bg-tertiary"
        >
          {session.isPinned ? (
            <PinOff className="h-4 w-4 text-hig-accent" aria-hidden="true" />
          ) : (
            <Pin
              className="h-4 w-4 text-hig-text-secondary"
              aria-hidden="true"
            />
          )}
        </button>

        {/* お気に入りボタン */}
        <button
          type="button"
          tabIndex={-1}
          aria-label={session.isFavorite ? "お気に入り解除" : "お気に入り"}
          onClick={(e) =>
            handleActionClick(e, () => onToggleFavorite(!session.isFavorite))
          }
          className="rounded-hig-sm p-1 hover:bg-hig-bg-tertiary"
        >
          {session.isFavorite ? (
            <Star
              className="h-4 w-4 fill-hig-warning text-hig-warning"
              aria-hidden="true"
            />
          ) : (
            <StarOff
              className="h-4 w-4 text-hig-text-secondary"
              aria-hidden="true"
            />
          )}
        </button>

        {/* その他メニュー */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            tabIndex={-1}
            aria-label="その他のアクション"
            aria-haspopup="menu"
            aria-expanded={showMenu}
            onClick={(e) => handleActionClick(e, () => setShowMenu(!showMenu))}
            className="rounded-hig-sm p-1 hover:bg-hig-bg-tertiary"
          >
            <MoreHorizontal
              className="h-4 w-4 text-hig-text-secondary"
              aria-hidden="true"
            />
          </button>

          {/* ドロップダウンメニュー */}
          {showMenu && (
            <div
              role="menu"
              aria-label="セッションメニュー"
              className="absolute right-0 top-full z-10 mt-1 w-40 rounded-hig-md border border-hig-border bg-hig-bg-primary py-1 shadow-hig-md"
            >
              <button
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={(e) => {
                  handleActionClick(e, () => {
                    setShowMenu(false);
                    onRename();
                  });
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-hig-text-primary hover:bg-hig-bg-secondary"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                名前を変更
              </button>
              <button
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={(e) => {
                  handleActionClick(e, () => {
                    setShowMenu(false);
                    onDelete();
                  });
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-hig-error hover:bg-hig-bg-secondary"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                削除
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
