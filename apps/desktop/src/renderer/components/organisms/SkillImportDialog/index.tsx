import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import type { Skill, SkillId, SkillName } from "@repo/shared/types/skill";
import { X, Search, Download } from "lucide-react";

export interface SkillImportDialogProps {
  /** 開閉状態 */
  isOpen: boolean;
  /** 閉じるハンドラ */
  onClose: () => void;
  /** 利用可能なスキル一覧 */
  availableSkills: Skill[];
  /** インポート済みスキルID一覧 */
  importedSkillIds: SkillId[];
  /** インポートハンドラ（スキル名の配列を受け取る） */
  onImport: (skillNames: SkillName[]) => void;
  /** カスタムクラス */
  className?: string;
}

/**
 * スキルインポートダイアログコンポーネント
 * グローバルスキルリポジトリからスキルを選択してインポート
 */
export const SkillImportDialog: React.FC<SkillImportDialogProps> = ({
  isOpen,
  onClose,
  availableSkills,
  importedSkillIds,
  onImport,
  className = "",
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<SkillId>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const importedSkillIdSet = useMemo(
    () => new Set(importedSkillIds),
    [importedSkillIds],
  );

  // ダイアログが開いた時に選択をリセットしフォーカスを移動
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set());
      setSearchQuery("");
      // フォーカスを検索バーに移動
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  // Escapeキーで閉じる
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // 非表示の場合は何もレンダリングしない
  if (!isOpen) {
    return null;
  }

  // フィルタリング
  const filteredSkills = availableSkills.filter((skill) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      skill.name.toLowerCase().includes(lowerQuery) ||
      skill.description.toLowerCase().includes(lowerQuery) ||
      skill.triggers.some((t) => t.toLowerCase().includes(lowerQuery))
    );
  });

  const handleToggleSkill = (skillId: SkillId) => {
    // インポート済みは選択不可
    if (importedSkillIdSet.has(skillId)) {
      return;
    }

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        next.add(skillId);
      }
      return next;
    });
  };

  const handleImport = () => {
    const selectedNames = availableSkills
      .filter((skill) => selectedIds.has(skill.id))
      .map((skill) => skill.name);
    onImport(selectedNames);
    onClose();
  };

  const selectedCount = selectedIds.size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ダイアログ */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-dialog-title"
        className={`relative w-full max-w-2xl max-h-[80vh] bg-slate-800 rounded-xl border border-slate-700 shadow-2xl flex flex-col ${className}`}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2
            id="import-dialog-title"
            className="text-lg font-semibold text-slate-50"
          >
            スキルをインポート
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="p-1 rounded hover:bg-slate-700/50 transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* 検索バー */}
        <div className="p-4 border-b border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="スキルを検索..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 text-slate-50 placeholder-slate-400 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* スキル一覧 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filteredSkills.map((skill) => {
              const isImported = importedSkillIdSet.has(skill.id);
              const isSelected = selectedIds.has(skill.id);

              return (
                <label
                  key={skill.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    isImported
                      ? "bg-slate-700/30 border-slate-600/50 opacity-60 cursor-not-allowed"
                      : isSelected
                        ? "bg-blue-600/20 border-blue-500/50"
                        : "bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isImported || isSelected}
                    disabled={isImported}
                    onChange={() => handleToggleSkill(skill.id)}
                    aria-label={skill.name}
                    className="mt-1 h-4 w-4 rounded border-slate-500 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-200">
                        {skill.name}
                      </span>
                      {isImported && (
                        <span className="px-2 py-0.5 text-xs rounded bg-green-600/20 text-green-400">
                          インポート済み
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 truncate">
                      {skill.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          {filteredSkills.length === 0 && (
            <div className="flex items-center justify-center py-8 text-slate-400">
              スキルが見つかりません
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700">
          <div className="text-sm text-slate-400">
            {selectedCount > 0 && <span>{selectedCount}件選択中</span>}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-slate-100 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={selectedCount === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              インポート
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

SkillImportDialog.displayName = "SkillImportDialog";
