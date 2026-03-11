import { useEffect, useMemo, useState } from "react";

export interface WorkspaceMentionCandidate {
  path: string;
  name: string;
}

export interface WorkspaceMentionState {
  isOpen: boolean;
  query: string;
  mentionStart: number;
  mentionEnd: number;
  options: WorkspaceMentionCandidate[];
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
  moveHighlight: (direction: -1 | 1) => void;
  reset: () => void;
}

interface MentionToken {
  query: string;
  start: number;
  end: number;
}

function extractMentionToken(
  input: string,
  cursorPosition: number,
): MentionToken | null {
  const clampedCursor = Math.max(0, Math.min(cursorPosition, input.length));
  const textBeforeCursor = input.slice(0, clampedCursor);
  const atIndex = textBeforeCursor.lastIndexOf("@");

  if (atIndex < 0) {
    return null;
  }

  const charBeforeAt = atIndex === 0 ? "" : textBeforeCursor[atIndex - 1];
  if (charBeforeAt !== "" && !/\s/.test(charBeforeAt)) {
    return null;
  }

  const query = textBeforeCursor.slice(atIndex + 1);
  if (/\s/.test(query)) {
    return null;
  }

  return {
    query,
    start: atIndex,
    end: clampedCursor,
  };
}

export function useWorkspaceMentionQuery(params: {
  input: string;
  cursorPosition: number;
  candidates: WorkspaceMentionCandidate[];
}): WorkspaceMentionState {
  const { input, cursorPosition, candidates } = params;

  const token = useMemo(
    () => extractMentionToken(input, cursorPosition),
    [input, cursorPosition],
  );

  const options = useMemo(() => {
    if (!token) {
      return [];
    }

    const normalizedQuery = token.query.toLowerCase();
    const sorted = [...candidates].sort((left, right) =>
      left.name.localeCompare(right.name, "ja"),
    );

    if (normalizedQuery.length === 0) {
      return sorted.slice(0, 8);
    }

    return sorted
      .filter((candidate) => {
        const name = candidate.name.toLowerCase();
        const path = candidate.path.toLowerCase();
        return name.includes(normalizedQuery) || path.includes(normalizedQuery);
      })
      .slice(0, 8);
  }, [candidates, token]);

  const [highlightedIndex, setHighlightedIndex] = useState(0);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [token?.start, token?.end, options.length]);

  const isOpen = Boolean(token) && options.length > 0;

  return {
    isOpen,
    query: token?.query ?? "",
    mentionStart: token?.start ?? -1,
    mentionEnd: token?.end ?? -1,
    options,
    highlightedIndex,
    setHighlightedIndex: (index) => {
      if (options.length === 0) {
        setHighlightedIndex(0);
        return;
      }
      const nextIndex = Math.max(0, Math.min(index, options.length - 1));
      setHighlightedIndex(nextIndex);
    },
    moveHighlight: (direction) => {
      if (options.length === 0) {
        return;
      }

      setHighlightedIndex((current) => {
        const next = current + direction;
        if (next < 0) {
          return options.length - 1;
        }
        if (next >= options.length) {
          return 0;
        }
        return next;
      });
    },
    reset: () => {
      setHighlightedIndex(0);
    },
  };
}
