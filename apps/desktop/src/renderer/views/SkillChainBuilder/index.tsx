/**
 * SkillChainBuilder ビュー
 *
 * スキルチェーンの一覧表示・作成・編集・実行を提供するメインビュー。
 * - 一覧モード: チェーンカードのグリッド表示、検索フィルタ、新規作成
 * - 編集モード: ChainEditor で詳細編集
 *
 * @module SkillChainBuilder
 */

import React, { memo, useState, useCallback, useMemo } from "react";
import clsx from "clsx";
import { Icon } from "../../components/atoms/Icon";
import { Button } from "../../components/atoms/Button";
import { EmptyState } from "../../components/atoms/EmptyState";
import { ErrorDisplay } from "../../components/atoms/ErrorDisplay";
import { Spinner } from "../../components/atoms/Spinner";
import { useChainList } from "./hooks/useChainList";
import { useChainEditor } from "./hooks/useChainEditor";
import { ChainCardGrid } from "./components/ChainCardGrid";
import { ChainEditor } from "./components/ChainEditor";
import { CreateChainDialog } from "./components/CreateChainDialog";

/** ビューのモード */
type ViewMode = "list" | "edit";

/** ビュー全体のスタイル定義 */
export const viewStyles = {
  container: clsx("flex flex-col h-full", "bg-[var(--bg-primary)]"),
  scrollArea: "flex-1 overflow-y-auto",
  content: clsx("max-w-5xl mx-auto px-4 py-6", "sm:px-6 md:px-8"),
  header: "flex items-center justify-between mb-6",
  titleArea: "",
  title: "text-2xl font-bold text-[var(--text-primary)] mb-1",
  subtitle: "text-sm text-[var(--text-secondary)]",
  searchWrapper: "relative mb-6",
  searchInput: clsx(
    "w-full pl-10 pr-4 py-2.5 rounded-xl",
    "bg-[var(--bg-secondary)] border border-[var(--border-primary)]",
    "text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]",
    "transition-all duration-[var(--duration-default)]",
    "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)] focus:border-transparent",
  ),
  searchIcon: clsx(
    "absolute left-3 top-1/2 -translate-y-1/2",
    "text-[var(--text-muted)]",
    "pointer-events-none",
  ),
  loadingContainer: "flex items-center justify-center py-16",
} as const;

/**
 * SkillChainBuilder メインビュー
 */
export const SkillChainBuilder: React.FC = memo(() => {
  const {
    chains,
    isLoading,
    error: listError,
    refetch,
    deleteChain,
  } = useChainList();

  const editor = useChainEditor();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 検索フィルタリング
  const filteredChains = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return chains;
    return chains.filter(
      (chain) =>
        chain.name.toLowerCase().includes(query) ||
        chain.description.toLowerCase().includes(query),
    );
  }, [chains, searchQuery]);

  // チェーン選択 → 編集モードへ
  const handleSelectChain = useCallback(
    async (chainId: string) => {
      await editor.loadChain(chainId);
      setViewMode("edit");
    },
    [editor],
  );

  // チェーン削除
  const handleDeleteChain = useCallback(
    async (chainId: string) => {
      try {
        await deleteChain(chainId);
      } catch {
        // エラーは useChainList 内で管理
      }
    },
    [deleteChain],
  );

  // 新規チェーン作成
  const handleCreateChain = useCallback(
    (name: string, description: string) => {
      editor.initNewChain(name, description);
      setViewMode("edit");
    },
    [editor],
  );

  // 一覧に戻る
  const handleBackToList = useCallback(() => {
    setViewMode("list");
    refetch();
  }, [refetch]);

  // 検索変更
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [],
  );

  // 編集モード
  if (viewMode === "edit" && editor.chain) {
    return (
      <div
        className={viewStyles.container}
        data-testid="skill-chain-builder-view"
      >
        <ChainEditor
          chain={editor.chain}
          isSaving={editor.isSaving}
          isExecuting={editor.isExecuting}
          executionResult={editor.executionResult}
          error={editor.error}
          onUpdateName={editor.updateName}
          onUpdateDescription={editor.updateDescription}
          onAddStep={editor.addStep}
          onRemoveStep={editor.removeStep}
          onMoveStep={editor.moveStep}
          onUpdateVariable={editor.updateVariable}
          onRemoveVariable={editor.removeVariable}
          onSave={editor.saveChain}
          onExecute={editor.executeChain}
          onBack={handleBackToList}
        />
      </div>
    );
  }

  // ローディング状態
  if (isLoading) {
    return (
      <div
        className={viewStyles.container}
        data-testid="skill-chain-builder-view"
      >
        <div className={viewStyles.loadingContainer} role="status">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  // エラー状態
  if (listError) {
    return (
      <div
        className={viewStyles.container}
        data-testid="skill-chain-builder-view"
      >
        <ErrorDisplay message={listError} onRetry={refetch} className="py-16" />
      </div>
    );
  }

  // 一覧モード
  return (
    <div
      className={viewStyles.container}
      data-testid="skill-chain-builder-view"
    >
      <div className={viewStyles.scrollArea}>
        <div className={viewStyles.content}>
          {/* ヘッダー */}
          <div className={viewStyles.header}>
            <div className={viewStyles.titleArea}>
              <h1 className={viewStyles.title}>スキルチェーン</h1>
              <p className={viewStyles.subtitle}>
                複数のスキルを連携させてワークフローを構築
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateDialogOpen(true)}
              leftIcon="plus"
              data-testid="create-chain-button"
            >
              新規作成
            </Button>
          </div>

          {/* 検索バー（チェーンが存在する場合のみ表示） */}
          {chains.length > 0 && (
            <div className={viewStyles.searchWrapper}>
              <div className={viewStyles.searchIcon}>
                <Icon name="search" size={18} />
              </div>
              <input
                type="text"
                placeholder="チェーンを検索..."
                value={searchQuery}
                onChange={handleSearchChange}
                className={viewStyles.searchInput}
                aria-label="チェーンを検索"
                data-testid="chain-search-input"
              />
            </div>
          )}

          {/* コンテンツ */}
          {chains.length === 0 ? (
            <EmptyState
              title="チェーンがまだありません"
              description="新規作成ボタンからスキルチェーンを作成しましょう"
              icon="zap"
              mood="welcoming"
            />
          ) : filteredChains.length === 0 ? (
            <EmptyState
              title="検索結果が見つかりません"
              description="別のキーワードで検索してみてください"
              icon="search"
            />
          ) : (
            <ChainCardGrid
              chains={filteredChains}
              onSelect={handleSelectChain}
              onDelete={handleDeleteChain}
            />
          )}
        </div>
      </div>

      {/* 新規作成ダイアログ */}
      <CreateChainDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={handleCreateChain}
      />
    </div>
  );
});

SkillChainBuilder.displayName = "SkillChainBuilder";

export default SkillChainBuilder;
