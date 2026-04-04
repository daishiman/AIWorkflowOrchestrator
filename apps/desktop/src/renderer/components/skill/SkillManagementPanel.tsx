import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ImportedSkill, SkillMetadata } from "@repo/shared";
import {
  useAvailableSkillsMetadata,
  useClearSkillError,
  useFetchSkills,
  useImportedSkills,
  useImportingSkillName,
  useIsImportingSkill,
  useIsLoadingSkills,
  useRemoveSkill,
  useSkillError,
} from "../../store";
import { SkillAnalysisView } from "./SkillAnalysisView";
import { SkillCreateWizard } from "./SkillCreateWizard";
import { SkillEditor } from "./SkillEditor";
import { SkillImportDialog } from "./SkillImportDialog";
import { SkillLifecyclePanel } from "./SkillLifecyclePanel";

export const buttonStyles = {
  primary:
    "rounded-md bg-[var(--status-primary)] px-3 py-1 text-sm text-[var(--text-inverse)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]",
  secondary:
    "rounded-md border border-[var(--border-primary)] px-3 py-1 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]",
  danger:
    "rounded-md px-3 py-1 text-sm text-[var(--status-error)] hover:bg-[var(--bg-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-error)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]",
  dangerConfirm:
    "rounded-md bg-[var(--status-error)] px-3 py-1 text-sm text-[var(--text-inverse)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-error)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]",
} as const;

type View = "list" | "editor" | "analysis" | "create" | "lifecycle";

interface SkillManagementPanelProps {
  onClose?: () => void;
}

interface SkillCardProps {
  skill: ImportedSkill;
  onEdit: () => void;
  onAnalyze: () => void;
  onRemove: () => void;
  cardRef?: (node: HTMLDivElement | null) => void;
  testId: string;
}

interface AvailableSkillRowProps {
  skill: SkillMetadata;
  isImporting: boolean;
  onRequestImport: () => void;
  buttonRef?: (node: HTMLButtonElement | null) => void;
  testId: string;
}

const RESOURCE_KEYS = [
  "agents",
  "references",
  "scripts",
  "assets",
  "schemas",
  "indexes",
  "otherFiles",
] as const;

function normalizeSearchText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function toDisplayText(value: unknown, fallback = "説明はありません"): string {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function toTestIdSegment(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getSkillResourceCount(skill: SkillMetadata | ImportedSkill): number {
  return RESOURCE_KEYS.reduce((count, key) => {
    const section = skill[key];
    return count + (Array.isArray(section) ? section.length : 0);
  }, 0);
}

function matchesQuery(
  skill: Pick<SkillMetadata, "name" | "description">,
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) {
    return true;
  }

  return (
    normalizeSearchText(skill.name).includes(normalizedQuery) ||
    normalizeSearchText(skill.description).includes(normalizedQuery)
  );
}

function scheduleFocus(callback: () => void): void {
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(() => callback());
    return;
  }

  setTimeout(callback, 0);
}

function setElementRef<T extends HTMLElement>(
  map: Map<string, T>,
  key: string,
  node: T | null,
): void {
  if (node) {
    map.set(key, node);
    return;
  }

  map.delete(key);
}

function formatSectionCount(
  visibleCount: number,
  totalCount: number,
  isFiltering: boolean,
): string {
  if (isFiltering) {
    return `${visibleCount}/${totalCount}件`;
  }

  return `${totalCount}件`;
}

function SkillCard({
  skill,
  onEdit,
  onAnalyze,
  onRemove,
  cardRef,
  testId,
}: SkillCardProps) {
  const skillName = String(skill.name);
  const description = toDisplayText(skill.description);
  const resourceCount = getSkillResourceCount(skill);

  return (
    <div
      ref={cardRef}
      role="listitem"
      tabIndex={-1}
      data-testid={testId}
      className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4 shadow-sm"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="font-medium text-[var(--text-primary)]">
            {skillName}
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">{description}</p>
        </div>
        <div className="rounded-full bg-[var(--bg-tertiary)] px-2 py-1 text-xs text-[var(--text-secondary)]">
          {resourceCount} リソース
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          aria-label={`${skillName} を編集`}
          className={`${buttonStyles.primary} min-h-[44px]`}
          onClick={onEdit}
        >
          編集
        </button>
        <button
          aria-label={`${skillName} を分析`}
          className={`${buttonStyles.secondary} min-h-[44px]`}
          onClick={onAnalyze}
        >
          分析
        </button>
        <button
          aria-label={`${skillName} を削除`}
          className={`${buttonStyles.danger} min-h-[44px]`}
          onClick={onRemove}
        >
          削除
        </button>
      </div>
    </div>
  );
}

function AvailableSkillRow({
  skill,
  isImporting,
  onRequestImport,
  buttonRef,
  testId,
}: AvailableSkillRowProps) {
  const skillName = String(skill.name);
  const description = toDisplayText(skill.description);
  const resourceCount = getSkillResourceCount(skill);

  return (
    <div
      role="listitem"
      data-testid={testId}
      className="flex flex-col gap-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4 md:flex-row md:items-center md:justify-between"
      aria-busy={isImporting}
    >
      <div className="space-y-1">
        <h3 className="font-medium text-[var(--text-primary)]">{skillName}</h3>
        <p className="text-sm text-[var(--text-secondary)]">{description}</p>
        <p className="text-xs text-[var(--text-secondary)]">
          {resourceCount} リソース
        </p>
      </div>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`${skillName} を追加する`}
        data-testid={`available-skill-trigger-${toTestIdSegment(skill.name)}`}
        className={`${buttonStyles.primary} min-h-[44px] min-w-[120px] self-start md:self-auto`}
        onClick={onRequestImport}
        disabled={isImporting}
      >
        {isImporting ? "追加中..." : "追加する"}
      </button>
    </div>
  );
}

export function SkillManagementPanel({
  onClose,
}: SkillManagementPanelProps = {}) {
  const [currentView, setCurrentView] = useState<View>("list");
  const [selectedSkill, setSelectedSkill] = useState<ImportedSkill | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [skillToDelete, setSkillToDelete] = useState<ImportedSkill | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [importDialogSkill, setImportDialogSkill] =
    useState<SkillMetadata | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeImportSkillName, setActiveImportSkillName] = useState<
    string | null
  >(null);
  const [completedImportSkillName, setCompletedImportSkillName] = useState<
    string | null
  >(null);
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
      return;
    }

    window.history.back();
  }, [onClose]);

  const importedCardRefs = useRef(new Map<string, HTMLDivElement>());
  const availableTriggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const completedImportSkillNameRef = useRef<string | null>(null);

  const importedSkills = useImportedSkills() ?? [];
  const availableSkillsMetadata = useAvailableSkillsMetadata() ?? [];
  const skillError = useSkillError();
  const isLoadingSkills = useIsLoadingSkills();
  const isImporting = useIsImportingSkill();
  const importingSkillName = useImportingSkillName();
  const fetchSkills = useFetchSkills();
  const removeSkill = useRemoveSkill();
  const clearSkillError = useClearSkillError();

  useEffect(() => {
    void fetchSkills();
  }, [fetchSkills]);

  const importedSkillNameSet = useMemo(
    () => new Set(importedSkills.map((skill) => String(skill.name))),
    [importedSkills],
  );

  const availableSkills = useMemo(
    () =>
      availableSkillsMetadata.filter(
        (skill) => !importedSkillNameSet.has(String(skill.name)),
      ),
    [availableSkillsMetadata, importedSkillNameSet],
  );

  const normalizedQuery = normalizeSearchText(searchQuery);

  const filteredImportedSkills = useMemo(
    () =>
      importedSkills.filter((skill) => matchesQuery(skill, normalizedQuery)),
    [importedSkills, normalizedQuery],
  );

  const filteredAvailableSkills = useMemo(
    () =>
      availableSkills.filter((skill) => matchesQuery(skill, normalizedQuery)),
    [availableSkills, normalizedQuery],
  );

  const totalSkillCount = importedSkills.length + availableSkills.length;
  const visibleSkillCount =
    filteredImportedSkills.length + filteredAvailableSkills.length;
  const isFiltering = normalizedQuery.length > 0;
  const showGlobalEmpty =
    !isLoadingSkills &&
    !isFiltering &&
    importedSkills.length === 0 &&
    availableSkills.length === 0;
  const showGlobalNoResult =
    !isLoadingSkills &&
    isFiltering &&
    filteredImportedSkills.length === 0 &&
    filteredAvailableSkills.length === 0;

  useEffect(() => {
    if (!completedImportSkillName) {
      return;
    }

    scheduleFocus(() => {
      importedCardRefs.current.get(completedImportSkillName)?.focus();
    });

    completedImportSkillNameRef.current = null;
    setCompletedImportSkillName(null);
    setActiveImportSkillName(null);
  }, [completedImportSkillName]);

  const handleEdit = useCallback((skill: ImportedSkill) => {
    setSelectedSkill(skill);
    setCurrentView("editor");
  }, []);

  const handleAnalyze = useCallback((skill: ImportedSkill) => {
    setSelectedSkill(skill);
    setCurrentView("analysis");
  }, []);

  const handleRequestDelete = useCallback((skill: ImportedSkill) => {
    setDeleteError(null);
    setStatusMessage(null);
    setSkillToDelete(skill);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!skillToDelete) {
      return;
    }

    try {
      await removeSkill(String(skillToDelete.name) as ImportedSkill["name"]);
      setSkillToDelete(null);
      setDeleteError(null);
      setStatusMessage(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "不明なエラーが発生しました";
      setDeleteError(`削除に失敗しました: ${message}`);
    }
  }, [removeSkill, skillToDelete]);

  const handleCancelDelete = useCallback(() => {
    setSkillToDelete(null);
  }, []);

  const handleBackToList = useCallback(() => {
    setCurrentView("list");
    setSelectedSkill(null);
  }, []);

  const handleRequestImport = useCallback(
    (skill: SkillMetadata) => {
      clearSkillError();
      setDeleteError(null);
      setStatusMessage(null);
      completedImportSkillNameRef.current = null;
      setCompletedImportSkillName(null);
      setActiveImportSkillName(String(skill.name));
      setImportDialogSkill(skill);
    },
    [clearSkillError],
  );

  const handleImportCompleted = useCallback(
    (skillName: string) => {
      completedImportSkillNameRef.current = skillName;
      setCompletedImportSkillName(skillName);
      setStatusMessage(`${skillName} を追加しました`);
      clearSkillError();
    },
    [clearSkillError],
  );

  const handleCloseImportDialog = useCallback(() => {
    const closingSkillName =
      importDialogSkill !== null
        ? String(importDialogSkill.name)
        : activeImportSkillName;

    setImportDialogSkill(null);

    if (
      closingSkillName &&
      completedImportSkillNameRef.current === closingSkillName
    ) {
      return;
    }

    clearSkillError();

    if (closingSkillName) {
      scheduleFocus(() => {
        availableTriggerRefs.current.get(closingSkillName)?.focus();
      });
    }

    setActiveImportSkillName(null);
  }, [activeImportSkillName, clearSkillError, importDialogSkill]);

  if (currentView === "editor" && selectedSkill) {
    return (
      <div data-testid="skill-management-panel-editor-view">
        <SkillEditor skill={selectedSkill} onClose={handleBackToList} />
      </div>
    );
  }

  if (currentView === "analysis" && selectedSkill) {
    return (
      <div data-testid="skill-management-panel-analysis-view">
        <SkillAnalysisView
          skillName={String(selectedSkill.name)}
          onClose={handleBackToList}
        />
      </div>
    );
  }

  if (currentView === "create") {
    return (
      <div
        data-testid="skill-management-panel-create-view"
        data-route-kind="secondary"
      >
        <SkillCreateWizard onClose={handleBackToList} />
      </div>
    );
  }

  if (currentView === "lifecycle") {
    return (
      <div
        data-testid="skill-management-panel-lifecycle-view"
        data-route-kind="secondary"
      >
        <SkillLifecyclePanel
          onClose={handleBackToList}
          onOpenWizard={() => setCurrentView("create")}
        />
      </div>
    );
  }

  return (
    <div
      className="flex h-full flex-col p-4"
      data-testid="skill-management-panel"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            スキル管理
          </h2>
          <p
            id="skill-management-summary"
            role="status"
            aria-live="polite"
            className="text-sm text-[var(--text-secondary)]"
          >
            {isFiltering
              ? `${visibleSkillCount}件を表示中 / 全${totalSkillCount}件`
              : `合計${totalSkillCount}件`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className={buttonStyles.secondary}
            onClick={handleClose}
            data-testid="skill-management-back-button"
          >
            スキルセンターへ戻る
          </button>
          <button
            className={`${buttonStyles.primary} min-h-[44px]`}
            onClick={() => setCurrentView("lifecycle")}
            data-testid="skill-management-lifecycle-button"
          >
            ライフサイクルを開始
          </button>
          <button
            className={`${buttonStyles.secondary} min-h-[44px]`}
            onClick={() => setCurrentView("create")}
            data-testid="skill-management-create-button"
          >
            詳細ウィザード
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="スキルを検索..."
          aria-label="スキルを検索"
          aria-describedby="skill-management-summary"
          className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)]"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      {statusMessage ? (
        <div
          role="status"
          aria-live="polite"
          data-testid="skill-management-success"
          className="mb-3 rounded-md border border-[var(--status-primary)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm text-[var(--text-primary)]"
        >
          {statusMessage}
        </div>
      ) : null}

      {skillError && !importDialogSkill ? (
        <div
          role="alert"
          data-testid="skill-management-error"
          className="mb-3 rounded-md border border-[var(--status-error)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm text-[var(--status-error)]"
        >
          {skillError} もう一度試してみてください。
        </div>
      ) : null}

      {deleteError ? (
        <div
          role="alert"
          data-testid="skill-management-delete-error"
          className="mb-3 rounded-md border border-[var(--status-error)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm text-[var(--status-error)]"
        >
          {deleteError}
        </div>
      ) : null}

      {isLoadingSkills ? (
        <div
          className="py-8 text-center text-[var(--text-secondary)]"
          data-testid="skill-management-loading"
        >
          読み込み中...
        </div>
      ) : null}

      {!isLoadingSkills && showGlobalEmpty ? (
        <div
          data-testid="skill-management-global-empty"
          className="rounded-lg border border-dashed border-[var(--border-primary)] bg-[var(--bg-secondary)] px-6 py-8 text-center text-[var(--text-secondary)]"
        >
          <p>追加済みのスキルも、追加できるスキルもまだありません。</p>
          <button
            className={`mt-4 ${buttonStyles.secondary} min-h-[44px]`}
            onClick={() => setCurrentView("lifecycle")}
          >
            ライフサイクルを開始
          </button>
        </div>
      ) : null}

      {!isLoadingSkills && showGlobalNoResult ? (
        <div
          data-testid="skill-management-no-result"
          className="rounded-lg border border-dashed border-[var(--border-primary)] bg-[var(--bg-secondary)] px-6 py-8 text-center text-[var(--text-secondary)]"
        >
          <p>検索条件に一致するスキルはありません。</p>
          <p className="mt-2 text-sm">条件を変えてもう一度試してください。</p>
        </div>
      ) : null}

      {!isLoadingSkills && !showGlobalEmpty && !showGlobalNoResult ? (
        <div className="space-y-6">
          <section
            aria-labelledby="imported-skills-heading"
            data-testid="skill-management-imported-section"
            className="space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <h3
                id="imported-skills-heading"
                className="text-base font-semibold text-[var(--text-primary)]"
              >
                インポート済み
              </h3>
              <span
                className="text-sm text-[var(--text-secondary)]"
                data-testid="skill-management-imported-count"
              >
                {formatSectionCount(
                  filteredImportedSkills.length,
                  importedSkills.length,
                  isFiltering,
                )}
              </span>
            </div>

            {filteredImportedSkills.length === 0 ? (
              <div
                data-testid="skill-management-imported-empty"
                className="rounded-lg border border-dashed border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-5 text-sm text-[var(--text-secondary)]"
              >
                {isFiltering
                  ? "検索条件に一致する追加済みスキルはありません。"
                  : "まだ追加済みのスキルはありません。"}
              </div>
            ) : (
              <div role="list" className="flex flex-col gap-3">
                {filteredImportedSkills.map((skill) => {
                  const skillName = String(skill.name);
                  return (
                    <SkillCard
                      key={skillName}
                      skill={skill}
                      testId={`imported-skill-card-${toTestIdSegment(skill.name)}`}
                      cardRef={(node) =>
                        setElementRef(importedCardRefs.current, skillName, node)
                      }
                      onEdit={() => handleEdit(skill)}
                      onAnalyze={() => handleAnalyze(skill)}
                      onRemove={() => handleRequestDelete(skill)}
                    />
                  );
                })}
              </div>
            )}
          </section>

          <section
            aria-labelledby="available-skills-heading"
            data-testid="skill-management-available-section"
            className="space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <h3
                id="available-skills-heading"
                className="text-base font-semibold text-[var(--text-primary)]"
              >
                利用可能なスキル
              </h3>
              <span
                className="text-sm text-[var(--text-secondary)]"
                data-testid="skill-management-available-count"
              >
                {formatSectionCount(
                  filteredAvailableSkills.length,
                  availableSkills.length,
                  isFiltering,
                )}
              </span>
            </div>

            {filteredAvailableSkills.length === 0 ? (
              <div
                data-testid="skill-management-available-empty"
                className="rounded-lg border border-dashed border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-5 text-sm text-[var(--text-secondary)]"
              >
                {isFiltering
                  ? "検索条件に一致する追加候補はありません。"
                  : "追加できるスキルはありません。"}
              </div>
            ) : (
              <div role="list" className="flex flex-col gap-3">
                {filteredAvailableSkills.map((skill) => {
                  const skillName = String(skill.name);
                  const isCurrentRowImporting =
                    isImporting && importingSkillName === skill.name;

                  return (
                    <AvailableSkillRow
                      key={skillName}
                      skill={skill}
                      isImporting={isCurrentRowImporting}
                      testId={`available-skill-row-${toTestIdSegment(skill.name)}`}
                      buttonRef={(node) =>
                        setElementRef(
                          availableTriggerRefs.current,
                          skillName,
                          node,
                        )
                      }
                      onRequestImport={() => handleRequestImport(skill)}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </div>
      ) : null}

      {skillToDelete ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-label="削除確認ダイアログ"
        >
          <div className="w-80 rounded-lg bg-[var(--bg-primary)] p-6 shadow-lg">
            <h3 className="mb-2 font-semibold text-[var(--text-primary)]">
              削除確認
            </h3>
            <p className="mb-4 text-sm text-[var(--text-secondary)]">
              {String(skillToDelete.name)} を削除してもよろしいですか？
            </p>
            <div className="flex justify-end gap-2">
              <button
                className={`${buttonStyles.secondary} min-h-[44px]`}
                onClick={handleCancelDelete}
              >
                キャンセル
              </button>
              <button
                className={`${buttonStyles.dangerConfirm} min-h-[44px]`}
                onClick={handleConfirmDelete}
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {importDialogSkill ? (
        <SkillImportDialog
          skill={importDialogSkill}
          isOpen={Boolean(importDialogSkill)}
          onClose={handleCloseImportDialog}
          onImported={handleImportCompleted}
        />
      ) : null}
    </div>
  );
}
