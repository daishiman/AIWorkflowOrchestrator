import { useCallback, useEffect, useMemo, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  buildSearchResults,
  type QuickFileSearchResult,
} from "../utils/quickFileSearchResilience";

export type { QuickFileSearchResult } from "../utils/quickFileSearchResilience";
export { buildSearchResults } from "../utils/quickFileSearchResilience";

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
