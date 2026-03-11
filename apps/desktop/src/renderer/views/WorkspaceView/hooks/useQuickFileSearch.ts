import { useCallback, useEffect, useMemo, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

export interface QuickFileSearchResult {
  path: string;
  fileName: string;
  relativePath: string;
  score: number;
}

export interface UseQuickFileSearchArgs {
  filePaths: string[];
  onSelectFile: (path: string) => void;
  maxResults?: number;
}

export interface UseQuickFileSearchReturn {
  isOpen: boolean;
  query: string;
  results: QuickFileSearchResult[];
  selectedIndex: number;
  open: () => void;
  close: () => void;
  setQuery: (value: string) => void;
  handleKeyDown: (event: KeyboardEvent | ReactKeyboardEvent) => void;
  selectResult: (index: number) => void;
  highlightResult: (index: number) => void;
}

function splitPath(filePath: string): {
  fileName: string;
  relativePath: string;
} {
  const normalized = filePath.replace(/\\/g, "/");
  const segments = normalized.split("/").filter(Boolean);
  const fileName = segments[segments.length - 1] ?? normalized;
  const relativePath =
    segments.length > 1 ? segments.slice(0, -1).join("/") : "";

  return { fileName, relativePath };
}

function subsequenceScore(candidate: string, query: string): number {
  let queryIndex = 0;
  let score = 0;

  for (let i = 0; i < candidate.length && queryIndex < query.length; i += 1) {
    if (candidate[i] === query[queryIndex]) {
      score += 1;
      queryIndex += 1;
    }
  }

  return queryIndex === query.length ? score / candidate.length : 0;
}

export function scoreFilePath(filePath: string, query: string): number {
  const trimmedQuery = query.trim().toLowerCase();
  if (!trimmedQuery) {
    return 0;
  }

  const { fileName, relativePath } = splitPath(filePath);
  const lowerFileName = fileName.toLowerCase();
  const lowerPath = filePath.toLowerCase();

  if (lowerFileName === trimmedQuery) {
    return 1;
  }

  if (lowerFileName.startsWith(trimmedQuery)) {
    return 0.92;
  }

  if (lowerFileName.includes(trimmedQuery)) {
    return 0.8;
  }

  if (lowerPath.includes(trimmedQuery)) {
    return 0.7;
  }

  const fileNameSubsequence = subsequenceScore(lowerFileName, trimmedQuery);
  const pathSubsequence = subsequenceScore(lowerPath, trimmedQuery);

  const relativeBoost = relativePath.toLowerCase().includes(trimmedQuery)
    ? 0.08
    : 0;
  const fileNameFuzzyScore =
    fileNameSubsequence > 0 ? Math.min(fileNameSubsequence + 0.2, 0.79) : 0;
  const pathFuzzyScore =
    pathSubsequence > 0 ? pathSubsequence + relativeBoost : 0;

  return Math.max(fileNameFuzzyScore, pathFuzzyScore);
}

export function buildSearchResults(
  filePaths: string[],
  query: string,
  maxResults: number,
): QuickFileSearchResult[] {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

  return filePaths
    .map((path) => {
      const { fileName, relativePath } = splitPath(path);
      const score = scoreFilePath(path, trimmedQuery);
      return {
        path,
        fileName,
        relativePath,
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.path.localeCompare(b.path);
    })
    .slice(0, maxResults);
}

export function useQuickFileSearch({
  filePaths,
  onSelectFile,
  maxResults = 10,
}: UseQuickFileSearchArgs): UseQuickFileSearchReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQueryState] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results = useMemo(
    () => buildSearchResults(filePaths, query, maxResults),
    [filePaths, maxResults, query],
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, results.length]);

  const close = useCallback(() => {
    setIsOpen(false);
    setQueryState("");
    setSelectedIndex(0);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    const onGlobalKeyDown = (event: KeyboardEvent): void => {
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "p") {
        event.preventDefault();
        open();
        return;
      }

      if (key === "escape" && isOpen) {
        event.preventDefault();
        close();
      }
    };

    window.addEventListener("keydown", onGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", onGlobalKeyDown);
    };
  }, [close, isOpen, open]);

  const selectResult = useCallback(
    (index: number) => {
      const selected = results[index];
      if (!selected) {
        return;
      }

      onSelectFile(selected.path);
      close();
    },
    [close, onSelectFile, results],
  );

  const highlightResult = useCallback(
    (index: number) => {
      if (index < 0 || index >= results.length) {
        return;
      }

      setSelectedIndex(index);
    },
    [results.length],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent | ReactKeyboardEvent) => {
      if (!isOpen) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) => {
          if (results.length === 0) {
            return 0;
          }

          return (prev + 1) % results.length;
        });
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) => {
          if (results.length === 0) {
            return 0;
          }

          return prev <= 0 ? results.length - 1 : prev - 1;
        });
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        selectResult(selectedIndex);
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    },
    [close, isOpen, results.length, selectResult, selectedIndex],
  );

  return {
    isOpen,
    query,
    results,
    selectedIndex,
    open,
    close,
    setQuery: setQueryState,
    handleKeyDown,
    selectResult,
    highlightResult,
  };
}
