/**
 * UnifiedSearchPanel - 統合検索パネル
 *
 * ファイル内検索、ワークスペース検索、ファイル名検索を統合したパネル。
 * タブで検索モードを切り替え可能。
 */

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import clsx from "clsx";
import {
  FileSearchPanel,
  type FileSearchPanelRef,
  type SearchMatch,
} from "./FileSearchPanel";
import { FileNameSearchPanel } from "./FileNameSearchPanel";
import {
  WorkspaceSearchPanel,
  type SearchResultItemProps,
} from "../WorkspaceSearch/WorkspaceSearchPanel";
import { Icon, type IconName } from "../../atoms/Icon";
import { Button } from "../../atoms/Button";

export type SearchMode = "file" | "workspace" | "filename";

export interface UnifiedSearchPanelProps {
  /** 現在選択中のファイルパス */
  currentFilePath: string | null;
  /** ワークスペースのルートパス */
  workspacePath: string | null;
  /** ワークスペース内の全ファイルパス一覧 */
  allFilePaths: string[];
  /** ファイル内検索のナビゲーションコールバック */
  onFileSearchNavigate?: (match: SearchMatch) => void;
  /** ワークスペース検索結果クリック時のコールバック */
  onWorkspaceResultClick?: (result: SearchResultItemProps) => void;
  /** ファイル名検索でファイル選択時のコールバック */
  onFileNameSelect?: (filePath: string) => void;
  /** パネルを閉じるコールバック */
  onClose?: () => void;
  /** 置換後にファイル内容が更新されたときのコールバック */
  onContentUpdated?: (newContent: string) => void;
  /** 初期検索モード */
  initialMode?: SearchMode;
  /** 置換モードで開くかどうか */
  showReplace?: boolean;
  /** カスタムクラス名 */
  className?: string;
}

interface TabConfig {
  mode: SearchMode;
  label: string;
  replaceLabel: string;
  shortLabel: string;
  replaceShortLabel: string;
  icon: IconName;
  shortcut: string;
  replaceShortcut: string;
  /** Whether this mode supports replace functionality */
  supportsReplace: boolean;
}

const TABS: TabConfig[] = [
  {
    mode: "file",
    label: "ファイル内検索",
    replaceLabel: "ファイル内置換",
    shortLabel: "Search",
    replaceShortLabel: "Replace",
    icon: "file-text",
    shortcut: "⌘F",
    replaceShortcut: "⌘T",
    supportsReplace: true,
  },
  {
    mode: "workspace",
    label: "全体検索",
    replaceLabel: "全体置換",
    shortLabel: "All",
    replaceShortLabel: "All",
    icon: "folder-search",
    shortcut: "⌘⇧F",
    replaceShortcut: "⌘⇧T",
    supportsReplace: true,
  },
  {
    mode: "filename",
    label: "ファイル名",
    replaceLabel: "ファイル名",
    shortLabel: "Name",
    replaceShortLabel: "Name",
    icon: "file",
    shortcut: "⌘P",
    replaceShortcut: "⌘P",
    supportsReplace: false, // ファイル名検索は置換をサポートしない
  },
];

// Export ref type for external navigation control
export interface UnifiedSearchPanelRef {
  goToNext: () => void;
  goToPrev: () => void;
  setMode: (mode: SearchMode) => void;
}

export const UnifiedSearchPanel = forwardRef<
  UnifiedSearchPanelRef,
  UnifiedSearchPanelProps
>(
  (
    {
      currentFilePath,
      workspacePath,
      allFilePaths,
      onFileSearchNavigate,
      onWorkspaceResultClick,
      onFileNameSelect,
      onClose,
      onContentUpdated,
      initialMode = "file",
      showReplace = false,
      className,
    },
    ref,
  ) => {
    const [searchMode, setSearchMode] = useState<SearchMode>(initialMode);
    // Use prop directly for replace mode display, internal state for FileSearchPanel sync
    const [internalReplaceMode, setInternalReplaceMode] = useState(showReplace);
    const fileSearchRef = useRef<FileSearchPanelRef>(null);

    // Determine if we're in replace mode (from prop or internal toggle)
    const isReplaceMode = showReplace || internalReplaceMode;

    // Sync searchMode with initialMode when it changes (from keyboard shortcuts)
    useEffect(() => {
      setSearchMode(initialMode);
    }, [initialMode]);

    // Sync internal replace mode with showReplace prop
    useEffect(() => {
      setInternalReplaceMode(showReplace);
    }, [showReplace]);

    // Handle tab change
    const handleTabChange = useCallback((mode: SearchMode) => {
      setSearchMode(mode);
    }, []);

    // Handle file name selection - open file and switch to file search
    const handleFileNameSelect = useCallback(
      (filePath: string) => {
        onFileNameSelect?.(filePath);
        // Switch to file search mode after selecting
        setSearchMode("file");
      },
      [onFileNameSelect],
    );

    // Handle workspace result click - open file at position
    const handleWorkspaceResultClick = useCallback(
      (result: SearchResultItemProps) => {
        onWorkspaceResultClick?.(result);
      },
      [onWorkspaceResultClick],
    );

    // Expose navigation methods through ref
    useImperativeHandle(
      ref,
      () => ({
        goToNext: () => {
          fileSearchRef.current?.goToNext();
        },
        goToPrev: () => {
          fileSearchRef.current?.goToPrev();
        },
        setMode: (mode: SearchMode) => {
          setSearchMode(mode);
        },
      }),
      [],
    );

    // =========================================================================
    // レンダリングヘルパー: 各検索モードのコンテンツを返す
    // =========================================================================
    const renderSearchContent = () => {
      switch (searchMode) {
        case "file":
          return currentFilePath ? (
            <FileSearchPanel
              key={`file-search-${searchMode}-${currentFilePath}`}
              ref={fileSearchRef}
              filePath={currentFilePath}
              onNavigate={onFileSearchNavigate}
              onClose={onClose}
              onContentUpdated={onContentUpdated}
              initialShowReplace={isReplaceMode}
              onReplaceModeChange={setInternalReplaceMode}
              className="border-b-0"
            />
          ) : (
            <div className="px-4 py-8 flex flex-col items-center gap-4 text-center">
              <Icon name="search" size={48} className="text-slate-600" />
              <div>
                <p className="text-slate-400 text-sm mb-3">
                  ファイル内検索を使用するには、まずファイルを開いてください。
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSearchMode("workspace")}
                  className="text-slate-300"
                >
                  グローバル検索を使用
                </Button>
              </div>
            </div>
          );

        case "workspace":
          return workspacePath ? (
            <WorkspaceSearchPanel
              key={`workspace-search-${searchMode}`}
              workspacePath={workspacePath}
              onResultClick={handleWorkspaceResultClick}
              initialShowReplace={isReplaceMode}
              onReplaceModeChange={setInternalReplaceMode}
              className="border-none"
            />
          ) : (
            <div className="px-4 py-8 text-center text-slate-500 text-sm">
              ワークスペースにフォルダを追加してください
            </div>
          );

        case "filename":
          return (
            <FileNameSearchPanel
              key={`filename-search-${searchMode}`}
              files={allFilePaths}
              onSelectFile={handleFileNameSelect}
              onClose={onClose}
              className="border-b-0"
            />
          );

        default:
          return null;
      }
    };

    return (
      <div
        className={clsx("flex flex-col bg-slate-800", className)}
        data-testid="unified-search-panel"
      >
        {/* Tab Bar */}
        <div className="flex items-center border-b border-slate-700">
          <div className="flex flex-1">
            {TABS.filter((tab) => !isReplaceMode || tab.supportsReplace).map(
              (tab) => {
                const isActive = searchMode === tab.mode;

                return (
                  <button
                    key={tab.mode}
                    type="button"
                    onClick={() => handleTabChange(tab.mode)}
                    aria-selected={isActive}
                    className={clsx(
                      "flex items-center gap-1.5 px-3 py-2 text-xs font-medium",
                      "transition-colors duration-150",
                      "border-b-2 -mb-[1px]",
                      isActive
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-slate-400 hover:text-slate-300",
                    )}
                  >
                    <Icon name={tab.icon} size={14} />
                    <span className="hidden sm:inline">
                      {isReplaceMode ? tab.replaceLabel : tab.label}
                    </span>
                    <span className="sm:hidden">
                      {isReplaceMode ? tab.replaceShortLabel : tab.shortLabel}
                    </span>
                    <span className="hidden md:inline text-[10px] text-slate-500 ml-1">
                      {isReplaceMode ? tab.replaceShortcut : tab.shortcut}
                    </span>
                  </button>
                );
              },
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる / Close"
            className={clsx(
              "w-8 h-8 flex items-center justify-center",
              "text-slate-400 hover:bg-slate-700",
              "transition-colors duration-100",
            )}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Search Panel Content */}
        <div className="flex-1">{renderSearchContent()}</div>
      </div>
    );
  },
);

UnifiedSearchPanel.displayName = "UnifiedSearchPanel";
