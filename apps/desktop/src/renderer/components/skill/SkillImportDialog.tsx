import { useCallback, useEffect, useMemo, useRef } from "react";
import type { SkillMetadata, SkillSubResource } from "@repo/shared";
import { useAppStore } from "../../store";

export interface SkillImportDialogProps {
  skill: SkillMetadata;
  isOpen: boolean;
  onClose: () => void;
  onImported?: (skillName: string) => void;
}

const RESOURCE_SECTIONS = [
  { key: "agents", title: "サブエージェント (agents/)" },
  { key: "references", title: "参照資料 (references/)" },
  { key: "scripts", title: "スクリプト (scripts/)" },
  { key: "assets", title: "アセット (assets/)" },
  { key: "schemas", title: "スキーマ (schemas/)" },
  { key: "indexes", title: "インデックス (indexes/)" },
] as const;

const dialogButtonStyles =
  "min-h-[44px] rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";

function toSafeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function toSafeText(value: unknown, fallback = "説明はありません"): string {
  const text = String(value ?? "").trim();
  return text || fallback;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mb-4">
    <h3 className="mb-2 text-sm font-medium text-gray-500">{title}</h3>
    <div className="border-l-2 border-gray-200 pl-2">{children}</div>
  </div>
);

const ResourceList: React.FC<{ resources: SkillSubResource[] }> = ({
  resources,
}) => (
  <ul className="space-y-1">
    {resources.map((resource) => (
      <li
        key={String(resource.relativePath ?? resource.filename)}
        className="flex items-start gap-2 text-sm"
      >
        <span className="text-gray-400">•</span>
        <div>
          <span className="font-mono text-gray-700">
            {String(resource.filename ?? "unknown")}
          </span>
          {resource.description ? (
            <span className="text-gray-500"> - {resource.description}</span>
          ) : null}
        </div>
      </li>
    ))}
  </ul>
);

export function SkillImportDialog({
  skill,
  isOpen,
  onClose,
  onImported,
}: SkillImportDialogProps): JSX.Element | null {
  const dialogRef = useRef<HTMLDivElement>(null);
  const importSkill = useAppStore((state) => state.importSkill);
  const isImporting = useAppStore((state) => state.isImporting);
  const importingSkillName = useAppStore((state) => state.importingSkillName);
  const skillError = useAppStore((state) => state.skillError);

  const safeDescription = toSafeText(skill.description);
  const safeAllowedTools = toSafeArray<string>(skill.allowedTools);

  const safeResources = useMemo(
    () =>
      RESOURCE_SECTIONS.map(({ key, title }) => ({
        key,
        title,
        resources: toSafeArray<SkillSubResource>(skill[key]),
      })),
    [skill],
  );

  const isCurrentlyImporting = isImporting && importingSkillName === skill.name;

  const handleImport = useCallback(async () => {
    const skillName = String(skill.name);
    const wasImportedBefore = useAppStore
      .getState()
      .importedSkills.some(
        (importedSkill) => importedSkill.name === skill.name,
      );

    try {
      await importSkill(skill.name);

      const { importedSkills, skillError: latestSkillError } =
        useAppStore.getState();
      const isImportedAfter = importedSkills.some(
        (importedSkill) => importedSkill.name === skill.name,
      );

      if (latestSkillError || (!wasImportedBefore && !isImportedAfter)) {
        return;
      }

      onImported?.(skillName);
      onClose();
    } catch {
      // エラー時は skillError をダイアログ内に表示する。
    }
  }, [importSkill, onClose, onImported, skill.name]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isCurrentlyImporting) {
        onClose();
      }
    },
    [isCurrentlyImporting, onClose],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, isOpen]);

  useEffect(() => {
    if (!isOpen || !dialogRef.current) {
      return;
    }

    const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement?.focus();

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") {
        return;
      }

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
        return;
      }

      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    const currentRef = dialogRef.current;
    currentRef.addEventListener("keydown", handleTabKey);
    return () => currentRef.removeEventListener("keydown", handleTabKey);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

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
        aria-describedby="skill-import-dialog-description"
        data-testid="skill-import-dialog"
        className="mx-4 flex max-h-[80vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2
            id="skill-import-dialog-title"
            className="text-lg font-semibold text-gray-900"
          >
            スキルを追加する
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

        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              {String(skill.name)}
            </h3>
          </div>

          <Section title="説明">
            <p
              id="skill-import-dialog-description"
              className="text-sm text-gray-700"
            >
              {safeDescription}
            </p>
          </Section>

          {safeAllowedTools.length > 0 ? (
            <Section title="許可ツール">
              <div className="flex flex-wrap gap-2">
                {safeAllowedTools.map((tool) => (
                  <span
                    key={tool}
                    className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </Section>
          ) : null}

          {safeResources
            .filter(({ resources }) => resources.length > 0)
            .map(({ key, title, resources }) => (
              <Section key={key} title={`${title} - ${resources.length}件`}>
                <ResourceList resources={resources} />
              </Section>
            ))}
        </div>

        <div className="border-t bg-gray-50 px-6 py-4">
          {skillError ? (
            <div
              role="alert"
              data-testid="skill-import-dialog-error"
              className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {skillError} もう一度試してみてください。
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isCurrentlyImporting}
              className={`${dialogButtonStyles} text-gray-700 hover:bg-gray-100 focus:ring-gray-500`}
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={isCurrentlyImporting}
              className={`${dialogButtonStyles} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`}
            >
              {isCurrentlyImporting ? "追加中..." : "追加する"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
