import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { ImportedSkill } from "@repo/shared";
import {
  useImportedSkills,
  useIsLoadingSkills,
  useFetchSkills,
  useRemoveSkill,
} from "../../store";
import { SkillEditor } from "./SkillEditor";
import { SkillAnalysisView } from "./SkillAnalysisView";
import { SkillCreateWizard } from "./SkillCreateWizard";

/** ボタンスタイル定数 */
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

/** ビューの種類 */
type View = "list" | "editor" | "analysis" | "create";

/** SkillCard の Props 型 */
interface SkillCardProps {
  skill: ImportedSkill;
  onEdit: () => void;
  onAnalyze: () => void;
  onRemove: () => void;
}

/** スキルカードサブコンポーネント */
function SkillCard({ skill, onEdit, onAnalyze, onRemove }: SkillCardProps) {
  return (
    <div
      role="listitem"
      className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4"
    >
      <div className="mb-2">
        <h3 className="font-medium text-[var(--text-primary)]">
          {String(skill.name)}
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          {skill.description}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          aria-label={`${String(skill.name)} を編集`}
          className={buttonStyles.primary}
          onClick={onEdit}
        >
          編集
        </button>
        <button
          aria-label={`${String(skill.name)} を分析`}
          className={buttonStyles.secondary}
          onClick={onAnalyze}
        >
          分析
        </button>
        <button
          aria-label={`${String(skill.name)} を削除`}
          className={buttonStyles.danger}
          onClick={onRemove}
        >
          削除
        </button>
      </div>
    </div>
  );
}

/** SkillManagementPanel メインコンポーネント */
export function SkillManagementPanel() {
  const [currentView, setCurrentView] = useState<View>("list");
  const [selectedSkill, setSelectedSkill] = useState<ImportedSkill | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [skillToDelete, setSkillToDelete] = useState<ImportedSkill | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const importedSkills = useImportedSkills();
  const isLoadingSkills = useIsLoadingSkills();
  const fetchSkills = useFetchSkills();
  const removeSkill = useRemoveSkill();

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return importedSkills;
    const query = searchQuery.toLowerCase();
    return importedSkills.filter(
      (skill) =>
        String(skill.name).toLowerCase().includes(query) ||
        skill.description.toLowerCase().includes(query),
    );
  }, [importedSkills, searchQuery]);

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
    setSkillToDelete(skill);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (skillToDelete) {
      try {
        await removeSkill(String(skillToDelete.name) as ImportedSkill["name"]);
        setSkillToDelete(null);
        setDeleteError(null);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "不明なエラーが発生しました";
        setDeleteError(`削除に失敗しました: ${message}`);
      }
    }
  }, [skillToDelete, removeSkill]);

  const handleCancelDelete = useCallback(() => {
    setSkillToDelete(null);
  }, []);

  const handleBackToList = useCallback(() => {
    setCurrentView("list");
    setSelectedSkill(null);
  }, []);

  // --- エディタービュー ---
  if (currentView === "editor" && selectedSkill) {
    return (
      <div data-testid="skill-management-panel-editor-view">
        <SkillEditor skill={selectedSkill} onClose={handleBackToList} />
      </div>
    );
  }

  // --- 分析ビュー ---
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

  // --- 作成ビュー ---
  if (currentView === "create") {
    return (
      <div data-testid="skill-management-panel-create-view">
        <SkillCreateWizard onClose={handleBackToList} />
      </div>
    );
  }

  // --- リストビュー ---
  return (
    <div
      className="flex h-full flex-col p-4"
      data-testid="skill-management-panel"
    >
      {/* ヘッダー */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          スキル管理
        </h2>
        <button
          className={buttonStyles.primary}
          onClick={() => setCurrentView("create")}
        >
          新規作成
        </button>
      </div>

      {/* 検索 */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="スキルを検索..."
          aria-label="スキルを検索"
          className="w-full rounded-lg border border-[var(--border-primary)] px-3 py-2 text-[var(--text-primary)]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {deleteError ? (
        <div
          role="status"
          className="mb-3 rounded-md border border-[var(--status-error)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm text-[var(--status-error)]"
        >
          {deleteError}
        </div>
      ) : null}

      {/* ローディング */}
      {isLoadingSkills && (
        <div className="py-8 text-center text-[var(--text-secondary)]">
          読み込み中...
        </div>
      )}

      {/* スキルリスト */}
      {!isLoadingSkills && (
        <>
          {filteredSkills.length === 0 ? (
            <div className="py-8 text-center text-[var(--text-secondary)]">
              <p>
                {searchQuery.trim()
                  ? "検索条件に一致するスキルはありません"
                  : "インポート済みのスキルはありません"}
              </p>
              {!searchQuery.trim() ? (
                <button
                  className={`mt-3 ${buttonStyles.secondary}`}
                  onClick={() => setCurrentView("create")}
                >
                  新規作成へ進む
                </button>
              ) : null}
            </div>
          ) : (
            <div role="list" className="flex flex-col gap-3">
              {filteredSkills.map((skill) => (
                <SkillCard
                  key={String(skill.name)}
                  skill={skill}
                  onEdit={() => handleEdit(skill)}
                  onAnalyze={() => handleAnalyze(skill)}
                  onRemove={() => handleRequestDelete(skill)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* 削除確認ダイアログ */}
      {skillToDelete && (
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
                className={buttonStyles.secondary}
                onClick={handleCancelDelete}
              >
                キャンセル
              </button>
              <button
                className={buttonStyles.dangerConfirm}
                onClick={handleConfirmDelete}
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
