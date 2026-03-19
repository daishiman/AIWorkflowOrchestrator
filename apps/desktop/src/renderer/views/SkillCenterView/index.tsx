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
import type { SkillLifecycleJob } from "../../navigation/skillLifecycleJourney";
import {
  SKILL_LIFECYCLE_JOB_GUIDES,
  SKILL_LIFECYCLE_SURFACE_RESPONSIBILITIES,
} from "../../navigation/skillLifecycleJourney";
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
  journeyPanel: clsx(
    "mb-6 rounded-3xl border border-[var(--border-primary)]",
    "bg-[var(--bg-secondary)] p-5 shadow-sm",
  ),
  journeyHeader: "mb-4 flex flex-col gap-1",
  journeyEyebrow:
    "text-xs font-semibold uppercase tracking-[0.18em] text-[var(--status-primary)]",
  journeyTitle: "text-lg font-semibold text-[var(--text-primary)]",
  journeyBody: "text-sm leading-6 text-[var(--text-secondary)]",
  journeyGrid: "grid gap-3 lg:grid-cols-3",
  journeyCard: clsx(
    "rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4",
    "shadow-sm",
  ),
  journeyCardBadge:
    "mb-3 inline-flex rounded-full bg-[var(--bg-tertiary)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]",
  journeyCardTitle: "text-base font-semibold text-[var(--text-primary)]",
  journeyCardCopy: "mt-2 text-sm leading-6 text-[var(--text-secondary)]",
  journeyCardOutcome:
    "mt-3 rounded-2xl bg-[var(--bg-tertiary)] px-3 py-2 text-xs leading-5 text-[var(--text-secondary)]",
  responsibilityPanel: clsx(
    "mb-6 rounded-3xl border border-[var(--border-primary)]",
    "bg-[var(--bg-secondary)] p-5 shadow-sm",
  ),
  responsibilityGrid: "grid gap-3 xl:grid-cols-2",
  responsibilityCard: clsx(
    "rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4",
    "shadow-sm",
  ),
  responsibilityCardTitle: "text-base font-semibold text-[var(--text-primary)]",
  responsibilityList: "mt-3 space-y-3",
  responsibilityTerm:
    "text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]",
  responsibilityValue: "mt-1 text-sm leading-6 text-[var(--text-secondary)]",
  responsibilityFooter: "mt-4 text-xs leading-5 text-[var(--text-muted)]",
  tabSection: "mb-6",
  countText: "text-xs text-[var(--text-muted)] mt-3",
  cardGrid: clsx(
    "grid gap-4",
    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  ),
  loadingContainer: "flex items-center justify-center py-16",
  headerRow: "flex items-center justify-between",
  headerCta: clsx(
    "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl",
    "bg-[var(--status-primary)] text-white text-sm font-medium",
    "hover:opacity-90 transition-opacity duration-200",
    "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)] focus:ring-offset-2",
  ),
  journeyCardCta: clsx(
    "mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg",
    "text-xs font-medium text-[var(--status-primary)]",
    "bg-[var(--status-primary)]/10",
    "hover:bg-[var(--status-primary)]/20 transition-colors duration-200",
    "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)] focus:ring-offset-1",
  ),
  loadingSpinner: "text-[var(--text-muted)]",
  errorContainer: clsx(
    "flex flex-col items-center justify-center py-16",
    "text-[var(--status-error)]",
  ),
} as const;

const PRIMARY_SURFACE_RESPONSIBILITIES =
  SKILL_LIFECYCLE_SURFACE_RESPONSIBILITIES.filter(
    (surface) => surface.id !== "settings",
  );

interface SkillLifecycleJourneyPanelProps {
  onJobAction?: Partial<Record<SkillLifecycleJob, () => void>>;
}

function SkillLifecycleJourneyPanel({
  onJobAction,
}: SkillLifecycleJourneyPanelProps): JSX.Element {
  return (
    <section
      className={viewStyles.journeyPanel}
      aria-labelledby="skill-lifecycle-journey-title"
      data-testid="skill-lifecycle-journey"
    >
      <div className={viewStyles.journeyHeader}>
        <p className={viewStyles.journeyEyebrow}>Primary Journey</p>
        <h2
          id="skill-lifecycle-journey-title"
          className={viewStyles.journeyTitle}
        >
          まずはこの順番で進める
        </h2>
        <p className={viewStyles.journeyBody}>
          「作る」「使う」「改善する」を別々の迷路にせず、入口と受け渡し先を先に固定します。
          高度なルートは検証や補助のために残し、通常は下の流れを優先します。
        </p>
      </div>

      <div className={viewStyles.journeyGrid}>
        {SKILL_LIFECYCLE_JOB_GUIDES.map((job, index) => {
          const action = onJobAction?.[job.id];
          return (
            <article
              key={job.id}
              className={viewStyles.journeyCard}
              data-testid={`skill-lifecycle-job-${job.id}`}
            >
              <div className={viewStyles.journeyCardBadge}>
                Step {index + 1}
              </div>
              <h3 className={viewStyles.journeyCardTitle}>{job.title}</h3>
              <p className={viewStyles.journeyCardCopy}>
                <strong>{job.entryLabel}</strong>
                <br />
                {job.summary}
                <br />
                <strong>{job.handoffLabel}</strong>
              </p>
              <p className={viewStyles.journeyCardOutcome}>{job.completion}</p>
              {job.ctaLabel && action && (
                <button
                  type="button"
                  className={viewStyles.journeyCardCta}
                  onClick={action}
                  data-testid={`skill-lifecycle-cta-${job.id}`}
                >
                  {job.ctaLabel}
                  <Icon name="chevron-right" size={14} />
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SkillLifecycleSurfaceOwnershipPanel(): JSX.Element {
  return (
    <section
      className={viewStyles.responsibilityPanel}
      aria-labelledby="skill-lifecycle-surface-ownership-title"
      data-testid="skill-lifecycle-surface-ownership"
    >
      <div className={viewStyles.journeyHeader}>
        <p className={viewStyles.journeyEyebrow}>Surface Ownership</p>
        <h2
          id="skill-lifecycle-surface-ownership-title"
          className={viewStyles.journeyTitle}
        >
          画面ごとの責務を先に分ける
        </h2>
        <p className={viewStyles.journeyBody}>
          入口、準備、実行、補助導線の役割を混ぜると、どこから始めるかがまた曖昧になります。
          主要 surface ごとに、持つ責務と持たない責務をここで固定します。
        </p>
      </div>

      <div className={viewStyles.responsibilityGrid}>
        {PRIMARY_SURFACE_RESPONSIBILITIES.map((surface) => (
          <article
            key={surface.id}
            className={viewStyles.responsibilityCard}
            data-testid={`skill-lifecycle-surface-${surface.id}`}
          >
            <h3 className={viewStyles.responsibilityCardTitle}>
              {surface.label}
            </h3>
            <dl className={viewStyles.responsibilityList}>
              <div>
                <dt className={viewStyles.responsibilityTerm}>主責務</dt>
                <dd className={viewStyles.responsibilityValue}>
                  {surface.primaryResponsibility}
                </dd>
              </div>
              <div>
                <dt className={viewStyles.responsibilityTerm}>持たない責務</dt>
                <dd className={viewStyles.responsibilityValue}>
                  {surface.forbiddenResponsibility}
                </dd>
              </div>
              <div>
                <dt className={viewStyles.responsibilityTerm}>handoff</dt>
                <dd className={viewStyles.responsibilityValue}>
                  {surface.handoff}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <p className={viewStyles.responsibilityFooter}>
        Settings は公開シェル例外として別ケースで確認する。
      </p>
    </section>
  );
}

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
    importedSkillNames,
    navigateToSkillCreate,
    navigateToWorkspace,
    navigateToSkillAnalysis,
    handleEditSkill,
    handleAnalyzeSkill,
    handleAddSkill,
    handleOpenDetail,
    handleCloseDetail,
    handleConfirmDelete,
    handleCancelDelete,
    handleRequestDelete,
    handleSetFilter,
    handleSetCategory,
  } = useSkillCenter();

  const journeyActions = useMemo(
    () => ({
      create: navigateToSkillCreate,
      use: navigateToWorkspace,
      improve: navigateToSkillAnalysis,
    }),
    [navigateToSkillCreate, navigateToWorkspace, navigateToSkillAnalysis],
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
            <div className={viewStyles.headerRow}>
              <div>
                <h1 className={viewStyles.title}>ツールを探す</h1>
                <p className={viewStyles.subtitle}>
                  AIワークフローを強化するツールを見つけましょう
                </p>
              </div>
              <button
                type="button"
                className={viewStyles.headerCta}
                onClick={navigateToSkillCreate}
                data-testid="header-create-cta"
              >
                <Icon name="plus" size={16} />
                <span>新規作成</span>
              </button>
            </div>
          </div>

          <SkillLifecycleJourneyPanel onJobAction={journeyActions} />
          <SkillLifecycleSurfaceOwnershipPanel />

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
        onEdit={handleEditSkill}
        onAnalyze={handleAnalyzeSkill}
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
