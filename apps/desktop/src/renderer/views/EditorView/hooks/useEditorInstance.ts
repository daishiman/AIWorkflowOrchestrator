/**
 * useEditorInstance - EditorInstanceアダプターを提供するカスタムフック
 *
 * Phase 5 SearchPanel用のEditorInstanceインターフェースを
 * TextAreaベースのエディタに適用するアダプター
 */

import { useRef, useEffect, useCallback } from "react";
import type { RefObject } from "react";
import type { EditorInstance } from "../../../../features/search";

export interface UseEditorInstanceOptions {
  textAreaRef: RefObject<HTMLTextAreaElement | null>;
  editorContent: string;
  setEditorContent: (content: string) => void;
}

export interface UseEditorInstanceResult {
  editorInstanceRef: RefObject<EditorInstance>;
  editorContentRef: RefObject<string>;
}

/**
 * 行・列から文字位置を計算する
 */
function calculateCharPosition(
  content: string,
  line: number,
  column: number,
): number {
  const lines = content.split("\n");
  let position = 0;
  for (let i = 0; i < line - 1 && i < lines.length; i++) {
    position += lines[i].length + 1;
  }
  position += column - 1;
  return position;
}

/**
 * 文字位置から行・列を計算する
 */
function calculateLineColumn(
  content: string,
  charPosition: number,
): { line: number; column: number } {
  const lines = content.split("\n");
  let charCount = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineLength = lines[i].length + 1;
    if (charCount + lineLength > charPosition) {
      return { line: i + 1, column: charPosition - charCount + 1 };
    }
    charCount += lineLength;
  }
  return { line: lines.length, column: 1 };
}

/**
 * EditorInstanceアダプターを提供するカスタムフック
 */
export function useEditorInstance({
  textAreaRef,
  editorContent,
  setEditorContent,
}: UseEditorInstanceOptions): UseEditorInstanceResult {
  // 最新のeditorContentを常に参照するためのref
  const editorContentRef = useRef<string>(editorContent);
  useEffect(() => {
    editorContentRef.current = editorContent;
  }, [editorContent]);

  // replaceText のcallback
  const replaceText = useCallback(
    (line: number, column: number, length: number, replacement: string) => {
      const content = editorContentRef.current;
      const startPos = calculateCharPosition(content, line, column);
      const newContent =
        content.substring(0, startPos) +
        replacement +
        content.substring(startPos + length);
      setEditorContent(newContent);
    },
    [setEditorContent],
  );

  // replaceAllText のcallback
  const replaceAllText = useCallback(
    (
      matches: Array<{ line: number; column: number; length: number }>,
      replacement: string,
    ) => {
      const content = editorContentRef.current;
      const sortedMatches = matches
        .map((m) => ({
          ...m,
          charPos: calculateCharPosition(content, m.line, m.column),
        }))
        .sort((a, b) => b.charPos - a.charPos);

      let newContent = content;
      for (const match of sortedMatches) {
        newContent =
          newContent.substring(0, match.charPos) +
          replacement +
          newContent.substring(match.charPos + match.length);
      }
      setEditorContent(newContent);
    },
    [setEditorContent],
  );

  // EditorInstanceアダプター用のRef
  const editorInstanceRef = useRef<EditorInstance>({
    getContent: () => editorContentRef.current,
    setHighlights: () => {},
    getHighlights: () => [],
    scrollToLine: (line, column) => {
      if (!textAreaRef.current) return;
      const textarea = textAreaRef.current;
      const content = editorContentRef.current;
      const position = calculateCharPosition(content, line, column ?? 1);
      textarea.focus();
      textarea.setSelectionRange(position, position);
      const lineHeight = 20;
      textarea.scrollTop = Math.max(0, (line - 3) * lineHeight);
    },
    getCursorPosition: () => {
      if (!textAreaRef.current) return { line: 1, column: 1 };
      const pos = textAreaRef.current.selectionStart;
      return calculateLineColumn(editorContentRef.current, pos);
    },
    setCursorPosition: (line, column) => {
      if (!textAreaRef.current) return;
      const position = calculateCharPosition(
        editorContentRef.current,
        line,
        column,
      );
      textAreaRef.current.setSelectionRange(position, position);
    },
    replaceText: (line, column, length, replacement) => {
      replaceText(line, column, length, replacement);
    },
    replaceAllText: (matches, replacement) => {
      replaceAllText(matches, replacement);
    },
    focus: () => textAreaRef.current?.focus(),
  });

  // replaceText/replaceAllText のcallbackが変更されたらrefを更新
  useEffect(() => {
    editorInstanceRef.current.replaceText = (
      line,
      column,
      length,
      replacement,
    ) => {
      replaceText(line, column, length, replacement);
    };
    editorInstanceRef.current.replaceAllText = (matches, replacement) => {
      replaceAllText(matches, replacement);
    };
  }, [replaceText, replaceAllText]);

  return { editorInstanceRef, editorContentRef };
}
