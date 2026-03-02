import { useState, useCallback, useEffect } from "react";
import type { SkillFileTreeNode } from "../types";

interface UseFileTreeResult {
  fileTree: SkillFileTreeNode[];
  selectedFile: string;
  expandedDirs: Set<string>;
  isLoading: boolean;
  error: string | null;
  refreshTree: () => Promise<void>;
  selectFile: (path: string) => void;
  toggleExpand: (path: string) => void;
  createFile: (path: string, content: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
}

export const useFileTree = (skillName: string): UseFileTreeResult => {
  const [fileTree, setFileTree] = useState<SkillFileTreeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTree = useCallback(async () => {
    if (!skillName) return;
    setIsLoading(true);
    setError(null);
    try {
      // skill:getFileTree は未実装（UT-UI-05A-GETFILETREE-001）のため型に存在しない
      const skillApi = window.electronAPI?.skill as
        | (Record<string, unknown> & typeof window.electronAPI.skill)
        | undefined;
      const getFileTree = skillApi?.getFileTree as
        | ((
            name: string,
          ) => Promise<{ tree: SkillFileTreeNode[] } | SkillFileTreeNode[]>)
        | undefined;
      if (typeof getFileTree !== "function") {
        setError("ファイルツリーの取得はまだ実装されていません");
        setFileTree([]);
        return;
      }
      const result = await getFileTree(skillName);
      // { tree: [...] } 形式と直接配列形式の両方に対応
      const tree = Array.isArray(result)
        ? result
        : ((result as { tree: SkillFileTreeNode[] })?.tree ?? []);
      setFileTree(tree);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "ファイルツリーの読み込みに失敗しました",
      );
      setFileTree([]);
    } finally {
      setIsLoading(false);
    }
  }, [skillName]);

  useEffect(() => {
    void refreshTree();
  }, [refreshTree]);

  const selectFile = useCallback((path: string) => {
    setSelectedFile(path);
  }, []);

  const toggleExpand = useCallback((path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const createFile = useCallback(
    async (path: string, initialContent: string) => {
      setError(null);
      try {
        await window.electronAPI.skill.createFile(
          skillName,
          path,
          initialContent,
        );
        await refreshTree();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "ファイルの作成に失敗しました",
        );
      }
    },
    [skillName, refreshTree],
  );

  const deleteFile = useCallback(
    async (path: string) => {
      setError(null);
      try {
        await window.electronAPI.skill.deleteFile(skillName, path);
        if (selectedFile === path) {
          setSelectedFile("");
        }
        await refreshTree();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "ファイルの削除に失敗しました",
        );
      }
    },
    [skillName, selectedFile, refreshTree],
  );

  return {
    fileTree,
    selectedFile,
    expandedDirs,
    isLoading,
    error,
    refreshTree,
    selectFile,
    toggleExpand,
    createFile,
    deleteFile,
  };
};
