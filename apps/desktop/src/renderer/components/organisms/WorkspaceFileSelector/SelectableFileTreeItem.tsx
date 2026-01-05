/**
 * SelectableFileTreeItem コンポーネント
 *
 * 選択可能なファイルツリーアイテム。
 * フォルダの3状態チェックボックス（unselected/indeterminate/selected）に対応。
 *
 * @see docs/30-workflows/file-selector-integration/step09-workspace-file-selector-design.md
 * @see docs/30-workflows/selectable-directory-tree/task-step03-ui-design.md
 */

import React, { useCallback, useRef, useEffect } from "react";
import clsx from "clsx";
import { Icon } from "../../atoms/Icon";
import type { SelectableFileTreeItemProps } from "./types";
import type { SelectionState } from "./hooks/useWorkspaceFileSelection";

/**
 * ツリー階層ごとのインデント幅（ピクセル単位）
 * ネストされたフォルダ/ファイルの視覚的な階層を表現するために使用
 */
const INDENT_SIZE = 16;

/**
 * 選択状態に応じたチェックボックスのスタイルクラスを取得
 *
 * @param state - 選択状態
 * @returns Tailwind CSSクラス文字列
 */
const getCheckboxClasses = (state: SelectionState): string => {
  const baseClasses =
    "w-4 h-4 rounded border transition-colors duration-150 cursor-pointer";
  const focusClasses =
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-zinc-900";

  const stateClasses: Record<SelectionState, string> = {
    unselected: "border-zinc-500 bg-transparent hover:border-zinc-400",
    indeterminate: "border-blue-600 bg-blue-600/50 hover:bg-blue-600/60",
    selected: "border-blue-600 bg-blue-600 hover:bg-blue-700",
  };

  return clsx(baseClasses, focusClasses, stateClasses[state]);
};

/**
 * 選択可能なファイルツリーアイテム
 */
export const SelectableFileTreeItem: React.FC<SelectableFileTreeItemProps> = ({
  node,
  folderId,
  expandedPaths,
  selectedPaths,
  selectionMode,
  onFileToggle,
  onFolderToggle,
  depth,
  fileOnly = true,
  getSelectionState,
  onFolderSelectionToggle,
}) => {
  const isFolder = node.type === "folder";
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPaths.has(node.path);

  // フォルダの選択状態を取得（getSelectionStateがない場合は未選択）
  const folderSelectionState: SelectionState =
    isFolder && getSelectionState ? getSelectionState(node) : "unselected";

  // フォルダチェックボックス用のref（indeterminateプロパティを設定するため）
  const folderCheckboxRef = useRef<HTMLInputElement>(null);

  // indeterminate状態をDOM要素に反映（HTML属性では設定不可）
  useEffect(() => {
    if (folderCheckboxRef.current) {
      folderCheckboxRef.current.indeterminate =
        folderSelectionState === "indeterminate";
    }
  }, [folderSelectionState]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isFolder) {
        onFolderToggle(node.path);
      } else {
        onFileToggle(node.path, node);
      }
    },
    [isFolder, node, onFileToggle, onFolderToggle],
  );

  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      onFileToggle(node.path, node);
    },
    [node, onFileToggle],
  );

  /**
   * フォルダチェックボックスのクリックハンドラ
   * フォルダ配下のファイルを一括選択/解除する
   */
  const handleFolderCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      if (onFolderSelectionToggle) {
        onFolderSelectionToggle(node.path, node);
      }
    },
    [node, onFolderSelectionToggle],
  );

  /**
   * Spaceキー押下時の処理: ファイル/フォルダの選択/解除
   */
  const handleSpaceKey = useCallback(() => {
    if (isFolder && onFolderSelectionToggle) {
      onFolderSelectionToggle(node.path, node);
    } else if (!isFolder) {
      onFileToggle(node.path, node);
    }
  }, [isFolder, node, onFileToggle, onFolderSelectionToggle]);

  /**
   * Enterキー押下時の処理: フォルダの展開/折りたたみ、またはファイルの選択
   */
  const handleEnterKey = useCallback(() => {
    if (isFolder) {
      onFolderToggle(node.path);
    } else {
      onFileToggle(node.path, node);
    }
  }, [isFolder, node, onFileToggle, onFolderToggle]);

  /**
   * ArrowRightキー押下時の処理: 折りたたまれたフォルダを展開
   */
  const handleArrowRightKey = useCallback(() => {
    if (isFolder && !isExpanded) {
      onFolderToggle(node.path);
    }
  }, [isFolder, isExpanded, node.path, onFolderToggle]);

  /**
   * ArrowLeftキー押下時の処理: 展開されたフォルダを折りたたみ
   */
  const handleArrowLeftKey = useCallback(() => {
    if (isFolder && isExpanded) {
      onFolderToggle(node.path);
    }
  }, [isFolder, isExpanded, node.path, onFolderToggle]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const keyHandlers: Record<string, () => void> = {
        " ": handleSpaceKey,
        Enter: handleEnterKey,
        ArrowRight: handleArrowRightKey,
        ArrowLeft: handleArrowLeftKey,
      };

      const handler = keyHandlers[e.key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    },
    [handleSpaceKey, handleEnterKey, handleArrowRightKey, handleArrowLeftKey],
  );

  // チェックボックスのレンダリング（複雑度を下げるために変数に抽出）
  const renderCheckbox = () => {
    if (isFolder) {
      // フォルダ用チェックボックス（一括選択用）
      if (selectionMode === "multiple" && onFolderSelectionToggle) {
        return (
          <input
            ref={folderCheckboxRef}
            type="checkbox"
            role="checkbox"
            checked={folderSelectionState === "selected"}
            onChange={handleFolderCheckboxChange}
            aria-checked={
              folderSelectionState === "indeterminate"
                ? "mixed"
                : folderSelectionState === "selected"
            }
            aria-label={`${node.name} フォルダを選択`}
            className={getCheckboxClasses(folderSelectionState)}
            onClick={(e) => e.stopPropagation()}
          />
        );
      }
      return null;
    }

    // ファイル用チェックボックス
    if (selectionMode === "multiple") {
      return (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          aria-label={`${node.name} を選択`}
          className="w-4 h-4 rounded border border-zinc-500 bg-transparent checked:bg-blue-600 checked:border-blue-600"
          onClick={(e) => e.stopPropagation()}
        />
      );
    }
    return null;
  };

  // フォルダの展開/折りたたみアイコン
  const renderExpandIcon = () => {
    if (!isFolder) return null;

    return (
      <span
        aria-label={isExpanded ? "折りたたみ" : "展開"}
        onClick={(e) => {
          e.stopPropagation();
          onFolderToggle(node.path);
        }}
        className="cursor-pointer"
      >
        <Icon
          name={isExpanded ? "chevron-down" : "chevron-right"}
          size={14}
          className="text-zinc-400"
        />
      </span>
    );
  };

  // ファイル/フォルダのタイプアイコン
  const renderTypeIcon = () => {
    const iconName = isFolder ? "folder" : "file";
    const iconColor = isFolder ? "text-yellow-500" : "text-zinc-400";
    const ariaLabel = isFolder ? "フォルダ" : "ファイル";

    return (
      <span aria-label={ariaLabel}>
        <Icon name={iconName} size={16} className={iconColor} />
      </span>
    );
  };

  // 選択状態に応じたクラス名
  const selectionClasses = isSelected
    ? "bg-blue-600/30 text-white selected"
    : "text-zinc-300";

  return (
    <>
      <div
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={isFolder ? isExpanded : undefined}
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        style={{ paddingLeft: `${depth * INDENT_SIZE}px` }}
        className={clsx(
          "flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer",
          "transition-colors duration-150",
          "hover:bg-zinc-800",
          selectionClasses,
        )}
      >
        {renderCheckbox()}
        {renderExpandIcon()}
        {renderTypeIcon()}

        <span className="truncate">{node.name}</span>
      </div>

      {isFolder && isExpanded && node.children && (
        <div role="group">
          {node.children.map((child) => (
            <SelectableFileTreeItem
              key={child.id}
              node={child}
              folderId={folderId}
              expandedPaths={expandedPaths}
              selectedPaths={selectedPaths}
              selectionMode={selectionMode}
              onFileToggle={onFileToggle}
              onFolderToggle={onFolderToggle}
              depth={depth + 1}
              fileOnly={fileOnly}
              getSelectionState={getSelectionState}
              onFolderSelectionToggle={onFolderSelectionToggle}
            />
          ))}
        </div>
      )}
    </>
  );
};

SelectableFileTreeItem.displayName = "SelectableFileTreeItem";
