/**
 * ChatHistoryList - チャット履歴一覧コンポーネント
 *
 * セッション一覧をグループ別に表示するorganismコンポーネント。
 * ピン留め、お気に入り、削除、名前変更、無限スクロールをサポート。
 * WCAG 2.1 AA準拠、Apple HIG準拠のデザイン。
 *
 * @see docs/30-workflows/chat-history-persistence/ui-ux-design.md
 */

import { useState, useRef, useCallback, useEffect } from "react";
import type { ChatHistoryListProps, ChatSession } from "./types";
import {
  SkeletonLoader,
  DefaultEmptyState,
  ErrorState,
} from "./ChatHistoryListStates";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { ChatHistoryListItem } from "./ChatHistoryListItem";

/**
 * ChatHistoryList コンポーネント
 */
export function ChatHistoryList({
  sessionGroups,
  selectedSessionId,
  onSelectSession,
  onTogglePin,
  onToggleFavorite,
  onDeleteSession,
  onUpdateTitle,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  error = null,
  emptyState,
}: ChatHistoryListProps) {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 無限スクロール用IntersectionObserver
  useEffect(() => {
    if (!hasMore || !onLoadMore || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  // キーボードナビゲーション
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!listRef.current) return;

    const options = listRef.current.querySelectorAll('[role="option"]');
    const currentIndex = Array.from(options).findIndex(
      (el) => el === document.activeElement,
    );

    if (e.key === "ArrowDown" && currentIndex < options.length - 1) {
      e.preventDefault();
      (options[currentIndex + 1] as HTMLElement).focus();
    } else if (e.key === "ArrowUp" && currentIndex > 0) {
      e.preventDefault();
      (options[currentIndex - 1] as HTMLElement).focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      (options[0] as HTMLElement)?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      (options[options.length - 1] as HTMLElement)?.focus();
    }
  }, []);

  // 編集モードの開始
  const startEditing = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  // 編集の保存
  const handleSaveTitle = async () => {
    if (editingSessionId && editTitle.trim()) {
      await onUpdateTitle(editingSessionId, editTitle.trim());
    }
    setEditingSessionId(null);
    setEditTitle("");
  };

  // 編集のキャンセル
  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditTitle("");
  };

  // 削除確認
  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await onDeleteSession(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  // ローディング状態
  if (isLoading && sessionGroups.length === 0) {
    return <SkeletonLoader />;
  }

  // エラー状態
  if (error) {
    return <ErrorState error={error} />;
  }

  // 空状態
  if (sessionGroups.length === 0) {
    return <>{emptyState || <DefaultEmptyState />}</>;
  }

  return (
    <>
      <div
        ref={listRef}
        role="listbox"
        aria-label="チャット履歴"
        aria-multiselectable={false}
        onKeyDown={handleKeyDown}
        className="space-y-4"
      >
        {sessionGroups.map((group, groupIndex) => (
          <div
            key={group.label}
            role="group"
            aria-labelledby={`group-label-${groupIndex}`}
          >
            {/* グループラベル */}
            <div
              id={`group-label-${groupIndex}`}
              className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-hig-text-secondary"
            >
              {group.label}
            </div>

            {/* セッション一覧 */}
            <div className="space-y-1" role="presentation">
              {group.sessions.map((session) =>
                editingSessionId === session.id ? (
                  // 編集モード
                  <div key={session.id} className="px-3 py-2">
                    <input
                      type="text"
                      aria-label="セッションタイトルを編集"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSaveTitle();
                        } else if (e.key === "Escape") {
                          handleCancelEdit();
                        }
                      }}
                      onBlur={handleSaveTitle}
                      autoFocus
                      className="w-full rounded-hig-sm border border-hig-accent bg-hig-bg-primary px-2 py-1 text-hig-text-primary focus:outline-none focus:ring-2 focus:ring-hig-accent/50"
                    />
                  </div>
                ) : (
                  // 通常表示
                  <ChatHistoryListItem
                    key={session.id}
                    session={session}
                    isSelected={selectedSessionId === session.id}
                    onSelect={() => onSelectSession(session.id)}
                    onTogglePin={(isPinned) =>
                      onTogglePin(session.id, isPinned)
                    }
                    onToggleFavorite={(isFavorite) =>
                      onToggleFavorite(session.id, isFavorite)
                    }
                    onDelete={() =>
                      setDeleteTarget({ id: session.id, title: session.title })
                    }
                    onRename={() => startEditing(session)}
                  />
                ),
              )}
            </div>
          </div>
        ))}

        {/* 無限スクロール用センチネル */}
        {hasMore && <div ref={sentinelRef} data-sentinel className="h-4" />}
      </div>

      {/* 削除確認ダイアログ */}
      {deleteTarget && (
        <DeleteConfirmDialog
          sessionTitle={deleteTarget.title}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}

export default ChatHistoryList;
