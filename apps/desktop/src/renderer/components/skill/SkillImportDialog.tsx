/**
 * SkillImportDialog コンポーネント
 *
 * スキルインポート前の確認ダイアログ。
 * スキルのメタデータ（名前、説明、許可ツール、サブリソース）を表示し、
 * ユーザーにインポート確認を促す。
 *
 * @module @repo/desktop/renderer/components/skill/SkillImportDialog
 * @see Phase 5: 実装（TDD: Green）
 */

import { useCallback, useEffect, useRef } from "react";
import type { SkillMetadata, SkillSubResource } from "@repo/shared";
import { useAppStore } from "../../store";

// ============================================
// Props定義
// ============================================

export interface SkillImportDialogProps {
  /** 表示するスキルのメタデータ */
  skill: SkillMetadata;
  /** ダイアログの開閉状態 */
  isOpen: boolean;
  /** ダイアログを閉じるコールバック */
  onClose: () => void;
}

// ============================================
// 内部コンポーネント
// ============================================

/**
 * セクション見出し＋コンテンツ
 */
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mb-4">
    <h3 className="mb-2 text-sm font-medium text-gray-500">{title}</h3>
    <div className="border-l-2 border-gray-200 pl-2">{children}</div>
  </div>
);

/**
 * サブリソース一覧
 */
const ResourceList: React.FC<{ resources: SkillSubResource[] }> = ({
  resources,
}) => (
  <ul className="space-y-1">
    {resources.map((resource) => (
      <li
        key={resource.relativePath}
        className="flex items-start gap-2 text-sm"
      >
        <span className="text-gray-400">•</span>
        <div>
          <span className="font-mono text-gray-700">{resource.filename}</span>
          {resource.description && (
            <span className="text-gray-500"> - {resource.description}</span>
          )}
        </div>
      </li>
    ))}
  </ul>
);

// ============================================
// サブリソースセクション定義
// ============================================

const RESOURCE_SECTIONS = [
  { key: "agents", title: "サブエージェント (agents/)" },
  { key: "references", title: "参照資料 (references/)" },
  { key: "scripts", title: "スクリプト (scripts/)" },
  { key: "assets", title: "アセット (assets/)" },
  { key: "schemas", title: "スキーマ (schemas/)" },
  { key: "indexes", title: "インデックス (indexes/)" },
] as const;

// ============================================
// メインコンポーネント
// ============================================

/**
 * スキルインポート確認ダイアログ
 */
export function SkillImportDialog({
  skill,
  isOpen,
  onClose,
}: SkillImportDialogProps): JSX.Element | null {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Store連携
  const importSkill = useAppStore((state) => state.importSkill);
  const isImporting = useAppStore((state) => state.isImporting);
  const importingSkillName = useAppStore((state) => state.importingSkillName);

  const isCurrentlyImporting = isImporting && importingSkillName === skill.name;

  // インポート処理
  const handleImport = useCallback(async () => {
    try {
      await importSkill(skill.name);
      onClose();
    } catch {
      // エラー時はダイアログを開いたまま維持
      // skillSliceがskillErrorを設定する
    }
  }, [importSkill, skill.name, onClose]);

  // ESCキーハンドラー
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isCurrentlyImporting) {
        onClose();
      }
    },
    [onClose, isCurrentlyImporting],
  );

  // キーボードイベントリスナー
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // フォーカストラップ
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      firstElement?.focus();

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      dialogRef.current.addEventListener("keydown", handleTabKey);
      const currentRef = dialogRef.current;
      return () => currentRef.removeEventListener("keydown", handleTabKey);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const hasAllowedTools = skill.allowedTools && skill.allowedTools.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="skill-import-dialog-title"
        className="mx-4 flex max-h-[80vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2
            id="skill-import-dialog-title"
            className="text-lg font-semibold text-gray-900"
          >
            スキルをインポート
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isCurrentlyImporting}
            aria-label="閉じる"
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {/* スキル名 */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900">{skill.name}</h3>
          </div>

          {/* 説明 */}
          <Section title="説明">
            <p className="text-sm text-gray-700">{skill.description}</p>
          </Section>

          {/* 許可ツール */}
          {hasAllowedTools && (
            <Section title="許可ツール">
              <div className="flex flex-wrap gap-2">
                {skill.allowedTools!.map((tool) => (
                  <span
                    key={tool}
                    className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* サブリソースセクション */}
          {RESOURCE_SECTIONS.filter(({ key }) => skill[key].length > 0).map(
            ({ key, title }) => (
              <Section key={key} title={`${title} - ${skill[key].length}件`}>
                <ResourceList resources={skill[key]} />
              </Section>
            ),
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isCurrentlyImporting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={isCurrentlyImporting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isCurrentlyImporting ? "インポート中..." : "インポート"}
          </button>
        </div>
      </div>
    </div>
  );
}
