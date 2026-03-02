import { useState, useCallback } from "react";

interface UseSkillEditorResult {
  content: string;
  isLoading: boolean;
  hasChanges: boolean;
  error: string | null;
  currentPath: string;
  language: string;
  loadFile: (path: string) => Promise<void>;
  saveFile: () => Promise<void>;
  updateContent: (value: string) => void;
}

const getLanguageFromPath = (path: string): string => {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const langMap: Record<string, string> = {
    md: "markdown",
    json: "json",
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    yaml: "yaml",
    yml: "yaml",
    txt: "text",
  };
  return langMap[ext] ?? "text";
};

export const useSkillEditor = (
  skillName: string,
  isReadOnly?: boolean,
): UseSkillEditorResult => {
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanges = content !== originalContent;
  const language = getLanguageFromPath(currentPath);

  const loadFile = useCallback(
    async (path: string) => {
      if (!path) return;
      setIsLoading(true);
      setError(null);
      try {
        const fileContent = await window.electronAPI.skill.readFile(
          skillName,
          path,
        );
        setContent(fileContent);
        setOriginalContent(fileContent);
        setCurrentPath(path);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "ファイルの読み込みに失敗しました",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [skillName],
  );

  const saveFile = useCallback(async () => {
    if (!currentPath || !hasChanges || isReadOnly) return;
    setError(null);
    try {
      await window.electronAPI.skill.writeFile(skillName, currentPath, content);
      setOriginalContent(content);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "ファイルの保存に失敗しました",
      );
    }
  }, [skillName, currentPath, content, hasChanges, isReadOnly]);

  const updateContent = useCallback((value: string) => {
    setContent(value);
  }, []);

  return {
    content,
    isLoading,
    hasChanges,
    error,
    currentPath,
    language,
    loadFile,
    saveFile,
    updateContent,
  };
};
