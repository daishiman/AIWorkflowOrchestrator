/**
 * SkillCenterView
 *
 * ツールを探す画面。
 * - SearchBar + FeaturedSection + CategoryTabs + CardGrid + DetailPanel
 * - レスポンシブ対応（4ブレークポイント）
 * - UX言語: 「スキル」->「ツール」
 *
 * @module SkillCenterView
 */

import React, { memo, useMemo, useCallback, useEffect } from "react";
import clsx from "clsx";
import type { SkillMetadata, ImportedSkill } from "@repo/shared/types/skill";
import { Icon } from "../../components/atoms/Icon";
import { useSkillCenter } from "./hooks/useSkillCenter";
import { FeaturedSection } from "./components/FeaturedSection/FeaturedSection";
import { CategoryTabs } from "./components/CategoryTabs";
import { SkillCard } from "./components/SkillCard";
import { SkillEmptyState } from "./components/SkillEmptyState";
import { SkillDetailPanel } from "./components/SkillDetailPanel/SkillDetailPanel";

/** ビュー全体のスタイル定義 */
export const viewStyles = {
  container: clsx(
    "flex flex-col h-full",
    "bg-[var(--bg-primary)]",
    "overflow-hidden",
  ),
  scrollArea: "flex-1 overflow-y-auto",
  content: clsx("max-w-6xl mx-auto px-4 py-6", "sm:px-6 md:px-8 lg:px-10"),
  header: "mb-6",
  title: "text-2xl font-bold text-[var(--text-primary)] mb-1",
  subtitle: "text-sm text-[var(--text-secondary)]",
  searchWrapper: clsx("relative mb-6"),
  searchInput: clsx(
    "w-full pl-10 pr-4 py-2.5 rounded-xl",
    "bg-[var(--bg-secondary)] border border-[var(--border-primary)]",
    "text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]",
    "transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)] focus:border-transparent",
  ),
  searchIcon: clsx(
    "absolute left-3 top-1/2 -translate-y-1/2",
    "text-[var(--text-muted)]",
    "pointer-events-none",
  ),
  tabSection: "mb-6",
  countText: "text-xs text-[var(--text-muted)] mt-3",
  cardGrid: clsx(
    "grid gap-4",
    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  ),
  loadingContainer: "flex items-center justify-center py-16",
  loadingSpinner: "text-[var(--text-muted)]",
  errorContainer: clsx(
    "flex flex-col items-center justify-center py-16",
    "text-[var(--status-error)]",
  ),
} as const;

/**
 * SkillCenterView メインコンポーネント。
 */
export const SkillCenterView: React.FC = memo(() => {
  const {
    importedSkills,
    isLoading,
    error,
    filter,
    category,
    isDetailOpen,
    detailSkillName,
    isDeleteConfirmOpen,
    deleteTargetSkillName,
    addingSkills,
    filteredSkills,
    featuredSkills,
    handleAddSkill,
    handleOpenDetail,
    handleCloseDetail,
    handleConfirmDelete,
    handleCancelDelete,
    handleRequestDelete,
    handleSetFilter,
    handleSetCategory,
  } = useSkillCenter();

  // インポート済みスキル名の Set（カード判定用）
  const importedSkillNames = useMemo(
    () => importedSkills.map((s) => String(s.name)),
    [importedSkills],
  );

  const importedSkillNameSet = useMemo(
    () => new Set(importedSkillNames),
    [importedSkillNames],
  );

  // 詳細パネル用のスキルデータ
  const detailSkill = useMemo((): SkillMetadata | ImportedSkill | undefined => {
    if (!detailSkillName) return undefined;

    // まずインポート済みから検索
    const imported = importedSkills.find(
      (s) => String(s.name) === detailSkillName,
    );
    if (imported) return imported;

    // 次に利用可能スキルから検索
    return filteredSkills.find((s) => String(s.name) === detailSkillName);
  }, [detailSkillName, importedSkills, filteredSkills]);

  const isDetailImported = detailSkillName
    ? importedSkillNameSet.has(detailSkillName)
    : false;

  // 検索ハンドラ
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleSetFilter(event.target.value);
    },
    [handleSetFilter],
  );

  const handleClearFilter = useCallback(() => {
    handleSetFilter("");
    handleSetCategory("all");
  }, [handleSetFilter, handleSetCategory]);

  useEffect(() => {
    if (!isDeleteConfirmOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCancelDelete();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDeleteConfirmOpen, handleCancelDelete]);

  const handleConfirmDeleteClick = useCallback(() => {
    void handleConfirmDelete();
  }, [handleConfirmDelete]);

  // スキル件数テキスト
  const countText = `${filteredSkills.length}件のツール`;

  // ローディング状態
  if (isLoading) {
    return (
      <div className={viewStyles.container} data-testid="skill-center-view">
        <div className={viewStyles.loadingContainer} role="status">
          <Icon
            name="loader-2"
            size={32}
            spin
            className={viewStyles.loadingSpinner}
          />
        </div>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className={viewStyles.container} data-testid="skill-center-view">
        <div className={viewStyles.errorContainer}>
          <Icon name="alert-circle" size={32} className="mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={viewStyles.container} data-testid="skill-center-view">
      <div className={viewStyles.scrollArea}>
        <div className={viewStyles.content}>
          {/* ヘッダー */}
          <div className={viewStyles.header}>
            <h1 className={viewStyles.title}>ツールを探す</h1>
            <p className={viewStyles.subtitle}>
              AIワークフローを強化するツールを見つけましょう
            </p>
          </div>

          {/* 検索バー */}
          <div className={viewStyles.searchWrapper}>
            <div className={viewStyles.searchIcon}>
              <Icon name="search" size={18} />
            </div>
            <input
              type="text"
              placeholder="ツールを検索..."
              value={filter}
              onChange={handleSearchChange}
              className={viewStyles.searchInput}
              aria-label="ツールを検索"
              data-testid="skill-search-input"
            />
          </div>

          {/* おすすめセクション（フィルタリング中は非表示） */}
          {!filter.trim() && !category && (
            <FeaturedSection
              skills={featuredSkills}
              importedSkillNames={importedSkillNames}
              onAdd={handleAddSkill}
              onSelect={handleOpenDetail}
            />
          )}

          {/* カテゴリタブ */}
          <div className={viewStyles.tabSection}>
            <CategoryTabs
              selectedCategory={category ?? "all"}
              onCategoryChange={handleSetCategory}
            />
            <p className={viewStyles.countText} data-testid="skill-count">
              {countText}
            </p>
          </div>

          {/* カードグリッド or 空状態 */}
          {filteredSkills.length === 0 ? (
            <SkillEmptyState
              variant={filter.trim() || category ? "no-results" : "no-skills"}
              keyword={filter.trim() || undefined}
              onClearFilter={handleClearFilter}
            />
          ) : (
            <div className={viewStyles.cardGrid} data-testid="skill-card-grid">
              {filteredSkills.map((skill) => {
                const name = String(skill.name);
                return (
                  <SkillCard
                    key={name}
                    skill={skill}
                    isAdded={importedSkillNameSet.has(name)}
                    isAdding={addingSkills.get(name) ?? false}
                    onAdd={handleAddSkill}
                    onSelect={handleOpenDetail}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 詳細パネル */}
      <SkillDetailPanel
        skillName={detailSkillName}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onDelete={handleRequestDelete}
        isImported={isDetailImported}
        skill={detailSkill}
      />

      {isDeleteConfirmOpen && deleteTargetSkillName && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4"
          role="presentation"
          data-testid="delete-confirm-overlay"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="ツール削除の確認"
            className={clsx(
              "w-full max-w-md rounded-xl border border-[var(--status-error)]/30",
              "bg-[var(--bg-primary)] p-6 shadow-2xl",
            )}
            data-testid="delete-confirm-dialog"
          >
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              ツールを削除しますか？
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
              <span className="font-medium text-[var(--text-primary)]">
                {deleteTargetSkillName}
              </span>{" "}
              を削除すると、このツールの設定は失われます。この操作は取り消せません。
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className={clsx(
                  "px-3 py-2 rounded-lg text-sm font-medium",
                  "border border-[var(--border-primary)]",
                  "text-[var(--text-primary)] bg-[var(--bg-secondary)]",
                  "hover:bg-[var(--bg-tertiary)] transition-colors duration-200",
                )}
                onClick={handleCancelDelete}
                data-testid="cancel-delete-button"
              >
                キャンセル
              </button>
              <button
                type="button"
                className={clsx(
                  "px-3 py-2 rounded-lg text-sm font-medium",
                  "bg-[var(--status-error)] text-white",
                  "hover:opacity-90 transition-opacity duration-200",
                )}
                onClick={handleConfirmDeleteClick}
                data-testid="confirm-delete-button"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

SkillCenterView.displayName = "SkillCenterView";

export default SkillCenterView;
