/**
 * FileContextList コンポーネント
 *
 * 添付ファイル一覧を表示するコンテナコンポーネント
 */

import type { CSSProperties, FC } from "react";
import { memo, useCallback } from "react";
import { cn } from "../../../lib/utils";
import { useFileContext } from "../hooks";
import type { FileContext } from "../types";
import { FileContextBadge } from "./FileContextBadge";

/**
 * FileContextList Props
 */
export interface FileContextListProps {
  /** ファイルコンテキスト配列（省略時はstoreから取得） */
  contexts?: FileContext[];
  /** 削除コールバック */
  onRemove?: (id: string) => void;
  /** 選択コールバック */
  onSelect?: (id: string) => void;
  /** 選択中のコンテキストID */
  selectedId?: string;
  /** 空状態メッセージ */
  emptyMessage?: string;
  /** 最大高さ */
  maxHeight?: string | number;
  /** 追加CSSクラス */
  className?: string;
}

/**
 * FileContextList コンポーネント
 *
 * React.memo で最適化
 */
export const FileContextList: FC<FileContextListProps> = memo(
  ({
    contexts,
    onRemove,
    onSelect,
    selectedId,
    emptyMessage = "ファイルが添付されていません",
    maxHeight,
    className,
  }) => {
    const {
      fileContexts: storeContexts,
      activeContextId,
      removeFileContext,
      setActiveContext,
    } = useFileContext();

    // Props優先、なければstoreから取得
    const displayContexts = contexts ?? storeContexts;
    const currentSelectedId = selectedId ?? activeContextId;
    const isEmpty = displayContexts.length === 0;

    /**
     * 削除ハンドラ
     */
    const handleRemove = useCallback(
      (id: string) => {
        // コールバック優先
        if (onRemove) {
          onRemove(id);
        } else {
          removeFileContext(id);
        }
      },
      [onRemove, removeFileContext],
    );

    /**
     * 選択ハンドラ
     */
    const handleSelect = useCallback(
      (id: string) => {
        // コールバック優先
        if (onSelect) {
          onSelect(id);
        } else {
          setActiveContext(id);
        }
      },
      [onSelect, setActiveContext],
    );

    // maxHeightスタイル
    const style: CSSProperties = {
      maxHeight: maxHeight
        ? typeof maxHeight === "number"
          ? `${maxHeight}px`
          : maxHeight
        : undefined,
    };

    // 空状態
    if (isEmpty) {
      return (
        <div
          className={cn(
            "flex flex-wrap gap-2 p-2",
            "overflow-y-auto",
            "bg-slate-50 dark:bg-slate-900",
            "border border-slate-200 dark:border-slate-700",
            "rounded-lg",
            className,
          )}
          style={style}
        >
          <p
            role="status"
            aria-label="添付ファイル一覧"
            className={cn(
              "text-slate-500 dark:text-slate-400",
              "text-sm text-center p-4",
              "w-full",
            )}
          >
            {emptyMessage}
          </p>
        </div>
      );
    }

    return (
      <div
        role="list"
        aria-label="添付ファイル一覧"
        className={cn(
          "flex flex-wrap gap-2 p-2",
          "overflow-y-auto",
          "bg-slate-50 dark:bg-slate-900",
          "border border-slate-200 dark:border-slate-700",
          "rounded-lg",
          className,
        )}
        style={style}
      >
        {displayContexts.map((context) => (
          <FileContextBadge
            key={context.id}
            context={context}
            isActive={currentSelectedId === context.id}
            onRemove={() => handleRemove(context.id)}
            onSelect={() => handleSelect(context.id)}
            showTooltip={true}
          />
        ))}
      </div>
    );
  },
);

FileContextList.displayName = "FileContextList";

export default FileContextList;
