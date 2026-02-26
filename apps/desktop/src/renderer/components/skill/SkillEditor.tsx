import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { ImportedSkill, SkillSubResource } from "@repo/shared";
import { SkillCodeEditor } from "./SkillCodeEditor";

const EXTENSION_LANGUAGE_MAP: Record<string, string> = {
  ".ts": "typescript",
  ".tsx": "typescript",
  ".js": "javascript",
  ".jsx": "javascript",
  ".mjs": "javascript",
  ".cjs": "javascript",
  ".md": "markdown",
  ".json": "json",
  ".yaml": "yaml",
  ".yml": "yaml",
  ".css": "css",
  ".html": "html",
  ".xml": "xml",
  ".sh": "shell",
  ".py": "python",
};

const BACKUP_SUFFIX_PATTERN = /\.(backup|deleted)\.(\d+)$/;

const ROOT_FILE_PATH = "SKILL.md";

const CATEGORY_ORDER = [
  "root",
  "agents",
  "references",
  "scripts",
  "assets",
  "schemas",
  "indexes",
  "other",
] as const;

const CATEGORY_LABELS: Record<(typeof CATEGORY_ORDER)[number], string> = {
  root: "ルート",
  agents: "エージェント (agents/)",
  references: "参照資料 (references/)",
  scripts: "スクリプト (scripts/)",
  assets: "アセット (assets/)",
  schemas: "スキーマ (schemas/)",
  indexes: "インデックス (indexes/)",
  other: "その他",
};

interface BackupInfo {
  filename: string;
  relativePath: string;
  originalPath?: string;
  type: "backup" | "deleted";
  timestamp: number;
  createdAt: Date | string | number;
}

interface FileBuffer {
  content: string;
  original: string;
}

type PendingAction =
  | { type: "select"; relativePath: string }
  | { type: "close" };

export interface FileTreeCategory {
  key: string;
  label: string;
  files: SkillSubResource[];
}

export interface SkillEditorProps {
  /** 編集対象のインポート済みスキル */
  skill: ImportedSkill;
  /** エディターを閉じるコールバック */
  onClose: () => void;
}

function isReadonlySkillPath(skillPath: string): boolean {
  return /(^|[\\/])\.claude[\\/]skills([\\/]|$)/.test(skillPath);
}

function normalizeDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value);
}

function stripBackupSuffix(relativePath: string): string {
  return relativePath.replace(BACKUP_SUFFIX_PATTERN, "");
}

function uniquePaths(paths: string[]): string[] {
  return Array.from(new Set(paths));
}

function toFilename(relativePath: string): string {
  const segments = relativePath.split("/");
  return segments[segments.length - 1] || relativePath;
}

function toSubResource(relativePath: string): SkillSubResource {
  return {
    filename: toFilename(relativePath),
    relativePath,
    size: 0,
  };
}

function categorizePath(relativePath: string): (typeof CATEGORY_ORDER)[number] {
  if (relativePath === ROOT_FILE_PATH) return "root";
  if (relativePath.startsWith("agents/")) return "agents";
  if (relativePath.startsWith("references/")) return "references";
  if (relativePath.startsWith("scripts/")) return "scripts";
  if (relativePath.startsWith("assets/")) return "assets";
  if (relativePath.startsWith("schemas/")) return "schemas";
  if (relativePath.startsWith("indexes/")) return "indexes";
  return "other";
}

function sortPaths(a: string, b: string): number {
  const categoryA = CATEGORY_ORDER.indexOf(categorizePath(a));
  const categoryB = CATEGORY_ORDER.indexOf(categorizePath(b));
  if (categoryA !== categoryB) return categoryA - categoryB;
  return a.localeCompare(b);
}

function buildTreeFromPaths(paths: string[]): FileTreeCategory[] {
  const grouped: Record<(typeof CATEGORY_ORDER)[number], SkillSubResource[]> = {
    root: [],
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    other: [],
  };

  for (const path of paths) {
    grouped[categorizePath(path)].push(toSubResource(path));
  }

  return CATEGORY_ORDER.map((key) => ({
    key,
    label: CATEGORY_LABELS[key],
    files: grouped[key].sort((a, b) =>
      a.relativePath.localeCompare(b.relativePath),
    ),
  })).filter((category) => category.files.length > 0);
}

function collectInitialFilePaths(skill: ImportedSkill): string[] {
  const rootPaths = [ROOT_FILE_PATH];
  const subResourcePaths = [
    ...skill.agents.map((file) => file.relativePath),
    ...skill.references.map((file) => file.relativePath),
    ...skill.scripts.map((file) => file.relativePath),
    ...skill.assets.map((file) => file.relativePath),
    ...skill.schemas.map((file) => file.relativePath),
    ...skill.indexes.map((file) => file.relativePath),
    ...skill.otherFiles.map((file) => file.filename),
  ];
  return uniquePaths([...rootPaths, ...subResourcePaths]).sort(sortPaths);
}

/**
 * ファイル名の拡張子から言語識別子を推定する。
 * 未対応拡張子は plaintext を返す。
 */
export function getLanguage(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex <= 0) return "plaintext";
  const extension = filename.slice(lastDotIndex).toLowerCase();
  return EXTENSION_LANGUAGE_MAP[extension] ?? "plaintext";
}

/**
 * ImportedSkill からカテゴリ別ファイルツリーを構築する。
 */
export function buildFileTree(skill: ImportedSkill): FileTreeCategory[] {
  return buildTreeFromPaths(collectInitialFilePaths(skill));
}

export function SkillEditor({ skill, onClose }: SkillEditorProps): JSX.Element {
  const isReadOnly = useMemo(
    () => isReadonlySkillPath(skill.path),
    [skill.path],
  );
  const [filePaths, setFilePaths] = useState<string[]>(() =>
    collectInitialFilePaths(skill),
  );
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [buffers, setBuffers] = useState<Record<string, FileBuffer>>({});
  const [loadingPath, setLoadingPath] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBackups, setShowBackups] = useState(false);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const categories = useMemo(() => buildTreeFromPaths(filePaths), [filePaths]);

  const unsavedByPath = useMemo(() => {
    const result: Record<string, boolean> = {};
    for (const [relativePath, buffer] of Object.entries(buffers)) {
      result[relativePath] = buffer.content !== buffer.original;
    }
    return result;
  }, [buffers]);

  const currentBuffer = selectedPath ? buffers[selectedPath] : undefined;
  const hasUnsavedCurrent = selectedPath
    ? (unsavedByPath[selectedPath] ?? false)
    : false;
  const editorValue = currentBuffer?.content ?? "";
  const editorLanguage = selectedPath ? getLanguage(selectedPath) : "plaintext";

  const loadFile = useCallback(
    async (relativePath: string, options?: { force?: boolean }) => {
      if (!options?.force && buffers[relativePath]) {
        setSelectedPath(relativePath);
        setError(null);
        return;
      }

      setLoadingPath(relativePath);
      setError(null);
      try {
        const readFile = window.electronAPI?.skill?.readFile;
        if (!readFile) {
          throw new Error("skill.readFile が利用できません");
        }
        const content = await readFile(skill.name, relativePath);
        setBuffers((prev) => ({
          ...prev,
          [relativePath]: { content, original: content },
        }));
        setSelectedPath(relativePath);
      } catch (readError) {
        const message =
          readError instanceof Error ? readError.message : String(readError);
        setError(`ファイル読み込みに失敗しました: ${message}`);
      } finally {
        setLoadingPath(null);
      }
    },
    [buffers, skill.name],
  );

  const saveCurrentFile = useCallback(async (): Promise<boolean> => {
    if (
      !selectedPath ||
      !currentBuffer ||
      currentBuffer.content === currentBuffer.original
    ) {
      return true;
    }

    if (isReadOnly) {
      setError("読み取り専用スキルは保存できません");
      return false;
    }

    setIsSaving(true);
    setError(null);
    try {
      const writeFile = window.electronAPI?.skill?.writeFile;
      if (!writeFile) {
        throw new Error("skill.writeFile が利用できません");
      }
      await writeFile(skill.name, selectedPath, currentBuffer.content);
      setBuffers((prev) => ({
        ...prev,
        [selectedPath]: {
          content: currentBuffer.content,
          original: currentBuffer.content,
        },
      }));
      return true;
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : String(saveError);
      setError(`保存に失敗しました: ${message}`);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [currentBuffer, isReadOnly, selectedPath, skill.name]);

  const refreshBackups = useCallback(async () => {
    setIsLoadingBackups(true);
    setError(null);
    try {
      const listBackups = window.electronAPI?.skill?.listBackups;
      if (!listBackups) {
        throw new Error("skill.listBackups が利用できません");
      }
      const results = await listBackups(skill.name);
      setBackups(results as unknown as BackupInfo[]);
    } catch (backupError) {
      const message =
        backupError instanceof Error
          ? backupError.message
          : String(backupError);
      setError(`バックアップ一覧の取得に失敗しました: ${message}`);
    } finally {
      setIsLoadingBackups(false);
    }
  }, [skill.name]);

  const applyPendingAction = useCallback(
    (action: PendingAction | null) => {
      if (!action) return;
      if (action.type === "select") {
        void loadFile(action.relativePath);
      } else {
        onClose();
      }
    },
    [loadFile, onClose],
  );

  const handleActionWithUnsavedCheck = useCallback(
    (action: PendingAction) => {
      if (hasUnsavedCurrent) {
        setPendingAction(action);
        setShowUnsavedDialog(true);
        return;
      }
      applyPendingAction(action);
    },
    [applyPendingAction, hasUnsavedCurrent],
  );

  const handleSelectFile = useCallback(
    (relativePath: string) => {
      if (relativePath === selectedPath) return;
      handleActionWithUnsavedCheck({ type: "select", relativePath });
    },
    [handleActionWithUnsavedCheck, selectedPath],
  );

  const handleTreeItemKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, relativePath: string) => {
      const currentIndex = filePaths.indexOf(relativePath);
      if (currentIndex === -1) return;

      const focusByPath = (targetPath: string) => {
        const treeItems = Array.from(
          document.querySelectorAll<HTMLButtonElement>(
            "button[data-file-path]",
          ),
        );
        const target = treeItems.find(
          (item) => item.dataset.filePath === targetPath,
        );
        target?.focus();
      };

      switch (event.key) {
        case "ArrowDown":
        case "ArrowRight": {
          event.preventDefault();
          const nextPath = filePaths[currentIndex + 1];
          if (nextPath) {
            focusByPath(nextPath);
          }
          break;
        }
        case "ArrowUp":
        case "ArrowLeft": {
          event.preventDefault();
          const prevPath = filePaths[currentIndex - 1];
          if (prevPath) {
            focusByPath(prevPath);
          }
          break;
        }
        case "Enter":
        case " ": {
          event.preventDefault();
          handleSelectFile(relativePath);
          break;
        }
      }
    },
    [filePaths, handleSelectFile],
  );

  const handleCreateFile = useCallback(async () => {
    if (isReadOnly) return;
    const input = window.prompt(
      "作成するファイルの相対パスを入力してください（例: references/new.md）",
    );
    if (input === null) return;

    const relativePath = input.trim();
    if (relativePath.length === 0) {
      setError("ファイルパスを入力してください");
      return;
    }
    if (relativePath.includes("..")) {
      setError("相対パスに '..' は使用できません");
      return;
    }

    try {
      const createFile = window.electronAPI?.skill?.createFile;
      if (!createFile) {
        throw new Error("skill.createFile が利用できません");
      }
      await createFile(skill.name, relativePath, "");
      setFilePaths((prev) =>
        uniquePaths([...prev, relativePath]).sort(sortPaths),
      );
      await loadFile(relativePath, { force: true });
    } catch (createError) {
      const message =
        createError instanceof Error
          ? createError.message
          : String(createError);
      setError(`ファイル作成に失敗しました: ${message}`);
    }
  }, [isReadOnly, loadFile, skill.name]);

  const handleDeleteFile = useCallback(async () => {
    if (isReadOnly || !selectedPath) return;
    if (selectedPath === ROOT_FILE_PATH) {
      setError("SKILL.md は削除できません");
      return;
    }
    if (!window.confirm(`${selectedPath} を削除しますか？`)) return;

    const pathToDelete = selectedPath;
    try {
      const deleteFile = window.electronAPI?.skill?.deleteFile;
      if (!deleteFile) {
        throw new Error("skill.deleteFile が利用できません");
      }
      await deleteFile(skill.name, pathToDelete);

      const nextPaths = filePaths.filter((path) => path !== pathToDelete);
      setFilePaths(nextPaths);
      setBuffers((prev) => {
        const next = { ...prev };
        delete next[pathToDelete];
        return next;
      });

      const fallbackPath =
        nextPaths.find((path) => path === ROOT_FILE_PATH) ??
        nextPaths[0] ??
        null;
      if (fallbackPath) {
        await loadFile(fallbackPath);
      } else {
        setSelectedPath(null);
      }
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : String(deleteError);
      setError(`ファイル削除に失敗しました: ${message}`);
    }
  }, [filePaths, isReadOnly, loadFile, selectedPath, skill.name]);

  const handleRestoreBackup = useCallback(
    async (backup: BackupInfo) => {
      if (isReadOnly) return;
      const originalPath =
        backup.originalPath ?? stripBackupSuffix(backup.relativePath);
      if (!window.confirm(`${originalPath} をバックアップから復元しますか？`)) {
        return;
      }

      try {
        const restoreBackup = window.electronAPI?.skill?.restoreBackup;
        if (!restoreBackup) {
          throw new Error("skill.restoreBackup が利用できません");
        }
        await restoreBackup(skill.name, backup.relativePath);
        setFilePaths((prev) =>
          uniquePaths([...prev, originalPath]).sort(sortPaths),
        );
        await refreshBackups();
        await loadFile(originalPath, { force: true });
      } catch (restoreError) {
        const message =
          restoreError instanceof Error
            ? restoreError.message
            : String(restoreError);
        setError(`バックアップ復元に失敗しました: ${message}`);
      }
    },
    [isReadOnly, loadFile, refreshBackups, skill.name],
  );

  const handleContentChange = useCallback(
    (nextValue: string) => {
      if (!selectedPath) return;
      setBuffers((prev) => {
        const current = prev[selectedPath] ?? { content: "", original: "" };
        return {
          ...prev,
          [selectedPath]: {
            ...current,
            content: nextValue,
          },
        };
      });
    },
    [selectedPath],
  );

  const handleCloseClick = useCallback(() => {
    handleActionWithUnsavedCheck({ type: "close" });
  }, [handleActionWithUnsavedCheck]);

  const closeUnsavedDialog = useCallback(() => {
    setShowUnsavedDialog(false);
    setPendingAction(null);
  }, []);

  const handleUnsavedSave = useCallback(async () => {
    const ok = await saveCurrentFile();
    if (!ok) return;
    const nextAction = pendingAction;
    setPendingAction(null);
    setShowUnsavedDialog(false);
    applyPendingAction(nextAction);
  }, [applyPendingAction, pendingAction, saveCurrentFile]);

  const handleUnsavedDiscard = useCallback(() => {
    if (selectedPath && currentBuffer) {
      setBuffers((prev) => ({
        ...prev,
        [selectedPath]: {
          ...currentBuffer,
          content: currentBuffer.original,
        },
      }));
    }
    const nextAction = pendingAction;
    setPendingAction(null);
    setShowUnsavedDialog(false);
    applyPendingAction(nextAction);
  }, [applyPendingAction, currentBuffer, pendingAction, selectedPath]);

  useEffect(() => {
    setFilePaths(collectInitialFilePaths(skill));
    setSelectedPath(null);
    setBuffers({});
    setError(null);
    setBackups([]);
    setPendingAction(null);
    setShowUnsavedDialog(false);
  }, [skill.name, skill.path, skill.updatedAt]);

  useEffect(() => {
    if (selectedPath) return;
    const initialPath =
      filePaths.find((path) => path === ROOT_FILE_PATH) ?? filePaths[0] ?? null;
    if (!initialPath) return;
    void loadFile(initialPath);
  }, [filePaths, loadFile, selectedPath]);

  useEffect(() => {
    if (!showBackups) return;
    void refreshBackups();
  }, [refreshBackups, showBackups]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void saveCurrentFile();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [saveCurrentFile]);

  return (
    <section
      className="flex h-full min-h-[560px] overflow-hidden rounded-lg border border-gray-200 bg-white"
      aria-label="スキルエディター"
    >
      <aside className="w-80 border-r border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
          <h2 className="text-sm font-semibold text-gray-700">ファイル</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCreateFile}
              disabled={isReadOnly}
              aria-label="新規ファイル"
              className="rounded px-2 py-1 text-xs text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              新規
            </button>
            <button
              type="button"
              onClick={handleDeleteFile}
              disabled={
                isReadOnly || !selectedPath || selectedPath === ROOT_FILE_PATH
              }
              aria-label="ファイル削除"
              className="rounded px-2 py-1 text-xs text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              削除
            </button>
          </div>
        </div>
        <div className="h-full overflow-y-auto p-2">
          <div role="tree" aria-label="スキルファイルツリー">
            {categories.map((category) => (
              <div key={category.key} className="mb-3">
                <p className="mb-1 px-2 text-xs font-semibold text-gray-500">
                  {category.label}
                </p>
                <div className="space-y-1">
                  {category.files.map((file) => {
                    const isSelected = selectedPath === file.relativePath;
                    const hasUnsaved =
                      unsavedByPath[file.relativePath] ?? false;
                    return (
                      <button
                        key={file.relativePath}
                        type="button"
                        role="treeitem"
                        aria-selected={isSelected}
                        data-file-path={file.relativePath}
                        onClick={() => handleSelectFile(file.relativePath)}
                        onKeyDown={(event) =>
                          handleTreeItemKeyDown(event, file.relativePath)
                        }
                        className={`flex w-full items-center justify-between rounded px-2 py-1 text-left text-sm ${
                          isSelected
                            ? "bg-blue-100 text-blue-900"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span className="truncate">{file.filename}</span>
                        {hasUnsaved && (
                          <span
                            className="ml-2 text-xs font-semibold text-orange-600"
                            aria-label="未保存"
                          >
                            ●
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-800">
              {selectedPath ?? "ファイル未選択"}
            </p>
            <p className="text-xs text-gray-500">
              {hasUnsavedCurrent ? "未保存の変更あり" : "保存済み"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBackups((prev) => !prev)}
              aria-label="バックアップ一覧"
              className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-100"
            >
              バックアップ
            </button>
            <button
              type="button"
              onClick={() => void saveCurrentFile()}
              disabled={isReadOnly || !hasUnsavedCurrent || isSaving}
              aria-label="保存"
              className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "保存中..." : "保存"}
            </button>
            <button
              type="button"
              onClick={handleCloseClick}
              aria-label="エディターを閉じる"
              className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-100"
            >
              閉じる
            </button>
          </div>
        </header>

        {isReadOnly && (
          <div className="border-b border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            読み取り専用スキルです（`~/.claude/skills/`）
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="border-b border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
          >
            {error}
          </div>
        )}

        <div className="flex min-h-0 flex-1">
          <div className="min-h-0 min-w-0 flex-1">
            {selectedPath && loadingPath === selectedPath ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                読み込み中...
              </div>
            ) : (
              <SkillCodeEditor
                value={editorValue}
                onChange={handleContentChange}
                language={editorLanguage}
                isReadOnly={isReadOnly}
              />
            )}
          </div>

          {showBackups && (
            <aside className="w-80 border-l border-gray-200 bg-gray-50">
              <div className="border-b border-gray-200 px-3 py-2">
                <h3 className="text-sm font-semibold text-gray-700">
                  バックアップ履歴
                </h3>
              </div>
              <div className="max-h-full space-y-2 overflow-y-auto p-2">
                {isLoadingBackups && (
                  <p className="text-xs text-gray-500">読み込み中...</p>
                )}
                {!isLoadingBackups && backups.length === 0 && (
                  <p className="text-xs text-gray-500">
                    バックアップはありません
                  </p>
                )}
                {backups.map((backup) => {
                  const originalPath =
                    backup.originalPath ??
                    stripBackupSuffix(backup.relativePath);
                  return (
                    <div
                      key={`${backup.relativePath}-${backup.timestamp}`}
                      className="rounded border border-gray-200 bg-white p-2"
                    >
                      <p className="truncate text-xs font-medium text-gray-800">
                        {originalPath}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {backup.type} /{" "}
                        {normalizeDate(backup.createdAt).toLocaleString(
                          "ja-JP",
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={() => void handleRestoreBackup(backup)}
                        disabled={isReadOnly}
                        aria-label={`バックアップを復元: ${originalPath}`}
                        className="mt-2 rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        復元
                      </button>
                    </div>
                  );
                })}
              </div>
            </aside>
          )}
        </div>
      </div>

      {showUnsavedDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="unsaved-dialog-title"
            className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl"
          >
            <h3
              id="unsaved-dialog-title"
              className="mb-2 text-base font-semibold text-gray-900"
            >
              未保存の変更があります
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              このまま移動すると変更が失われます。どうしますか？
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeUnsavedDialog}
                className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleUnsavedDiscard}
                className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
              >
                保存せずに続行
              </button>
              <button
                type="button"
                onClick={() => void handleUnsavedSave()}
                className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
              >
                保存して続行
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
