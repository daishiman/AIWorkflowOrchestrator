/**
 * TextAreaEditorAdapter - TextArea要素をEditorInstanceインターフェースに適合させるアダプター
 *
 * Phase 5のSearchPanelが期待するEditorInstanceインターフェースを
 * 既存のTextArea要素に対して実装する。
 */

import type { EditorInstance } from "../types";
import {
  SCROLL_OFFSET_LINES,
  DEFAULT_FONT_SIZE_PX,
  LINE_HEIGHT_MULTIPLIER,
} from "../constants";

export interface TextAreaEditorAdapterOptions {
  /** TextArea要素への参照 */
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  /** コンテンツを取得するコールバック（状態から取得する場合） */
  getContent: () => string;
  /** コンテンツを設定するコールバック（状態を更新する場合） */
  setContent: (content: string) => void;
  /** ハイライトを設定するコールバック（外部で管理する場合） */
  onHighlightsChange?: (
    highlights: Array<{
      line: number;
      column: number;
      length: number;
      isCurrent?: boolean;
    }>,
  ) => void;
}

/**
 * TextAreaをEditorInstanceとして使用するためのアダプタークラス
 */
export class TextAreaEditorAdapter implements EditorInstance {
  private textAreaRef: React.RefObject<HTMLTextAreaElement>;
  private getContentFn: () => string;
  private setContentFn: (content: string) => void;
  private onHighlightsChangeFn?: (
    highlights: Array<{
      line: number;
      column: number;
      length: number;
      isCurrent?: boolean;
    }>,
  ) => void;
  private currentHighlights: Array<{
    line: number;
    column: number;
    length: number;
    isCurrent?: boolean;
  }> = [];

  constructor(options: TextAreaEditorAdapterOptions) {
    this.textAreaRef = options.textAreaRef;
    this.getContentFn = options.getContent;
    this.setContentFn = options.setContent;
    this.onHighlightsChangeFn = options.onHighlightsChange;
  }

  /**
   * エディタのコンテンツを取得
   */
  getContent(): string {
    return this.getContentFn();
  }

  /**
   * 検索ハイライトを設定
   * TextAreaはネイティブでハイライトをサポートしないため、
   * 選択範囲を使用して現在のマッチを表示する
   */
  setHighlights(
    highlights: Array<{
      line: number;
      column: number;
      length: number;
      isCurrent?: boolean;
    }>,
  ): void {
    this.currentHighlights = highlights;
    this.onHighlightsChangeFn?.(highlights);

    // 現在のマッチがある場合、選択範囲で表示
    const currentMatch = highlights.find((h) => h.isCurrent);
    if (currentMatch && this.textAreaRef.current) {
      const content = this.getContent();
      const position = this.lineColumnToCharPosition(
        content,
        currentMatch.line,
        currentMatch.column,
      );
      this.textAreaRef.current.setSelectionRange(
        position,
        position + currentMatch.length,
      );
    }
  }

  /**
   * 現在のハイライトを取得
   */
  getHighlights(): Array<{
    line: number;
    column: number;
    length: number;
    isCurrent?: boolean;
  }> {
    return this.currentHighlights;
  }

  /**
   * 指定行にスクロール
   */
  scrollToLine(line: number, column?: number): void {
    if (!this.textAreaRef.current) return;

    const textarea = this.textAreaRef.current;
    const content = this.getContent();

    // 行・列からキャラクター位置を計算
    const charPosition = this.lineColumnToCharPosition(
      content,
      line,
      column ?? 1,
    );

    // フォーカスを当てて選択範囲を設定
    textarea.focus();
    textarea.setSelectionRange(charPosition, charPosition);

    // スクロール位置を計算（行の高さを推定）
    const lineHeight = this.estimateLineHeight(textarea);
    const scrollTop = Math.max(0, (line - SCROLL_OFFSET_LINES) * lineHeight);
    textarea.scrollTop = scrollTop;
  }

  /**
   * カーソル位置を取得
   */
  getCursorPosition(): { line: number; column: number } {
    if (!this.textAreaRef.current) {
      return { line: 1, column: 1 };
    }

    const content = this.getContent();
    const cursorPos = this.textAreaRef.current.selectionStart;

    return this.charPositionToLineColumn(content, cursorPos);
  }

  /**
   * カーソル位置を設定
   */
  setCursorPosition(line: number, column: number): void {
    if (!this.textAreaRef.current) return;

    const content = this.getContent();
    const charPosition = this.lineColumnToCharPosition(content, line, column);

    this.textAreaRef.current.setSelectionRange(charPosition, charPosition);
  }

  /**
   * 現在の位置のテキストを置換
   */
  replaceText(
    line: number,
    column: number,
    length: number,
    replacement: string,
  ): void {
    const content = this.getContent();
    const startPos = this.lineColumnToCharPosition(content, line, column);
    const endPos = startPos + length;

    const newContent =
      content.substring(0, startPos) + replacement + content.substring(endPos);

    this.setContentFn(newContent);
  }

  /**
   * すべてのマッチを置換
   * 後ろから置換することで位置のずれを防ぐ
   */
  replaceAllText(
    matches: Array<{ line: number; column: number; length: number }>,
    replacement: string,
  ): void {
    const content = this.getContent();

    // キャラクター位置に変換してソート（後ろから置換するため降順）
    const sortedMatches = matches
      .map((m) => ({
        ...m,
        charPos: this.lineColumnToCharPosition(content, m.line, m.column),
      }))
      .sort((a, b) => b.charPos - a.charPos);

    let newContent = content;
    for (const match of sortedMatches) {
      const startPos = match.charPos;
      const endPos = startPos + match.length;
      newContent =
        newContent.substring(0, startPos) +
        replacement +
        newContent.substring(endPos);
    }

    this.setContentFn(newContent);
  }

  /**
   * エディタにフォーカス
   */
  focus(): void {
    this.textAreaRef.current?.focus();
  }

  // ========== ヘルパーメソッド ==========

  /**
   * 行・列からキャラクター位置を計算（1-indexed）
   */
  private lineColumnToCharPosition(
    content: string,
    line: number,
    column: number,
  ): number {
    const lines = content.split("\n");
    let position = 0;

    for (let i = 0; i < line - 1 && i < lines.length; i++) {
      position += lines[i].length + 1; // +1 for newline
    }

    // 列位置を加算（1-indexedなので-1）
    const lineIndex = Math.min(line - 1, lines.length - 1);
    const lineContent = lines[lineIndex] || "";
    position += Math.min(column - 1, lineContent.length);

    return position;
  }

  /**
   * キャラクター位置から行・列を計算（1-indexed）
   */
  private charPositionToLineColumn(
    content: string,
    position: number,
  ): { line: number; column: number } {
    const lines = content.split("\n");
    let charCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length + 1; // +1 for newline
      if (charCount + lineLength > position) {
        return {
          line: i + 1,
          column: position - charCount + 1,
        };
      }
      charCount += lineLength;
    }

    // 最終行
    return {
      line: lines.length,
      column: position - charCount + lines[lines.length - 1].length + 1,
    };
  }

  /**
   * TextAreaの行の高さを推定
   */
  private estimateLineHeight(textarea: HTMLTextAreaElement): number {
    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    if (!isNaN(lineHeight)) {
      return lineHeight;
    }
    // フォールバック: フォントサイズ × LINE_HEIGHT_MULTIPLIER
    const fontSize = parseFloat(computedStyle.fontSize) || DEFAULT_FONT_SIZE_PX;
    return fontSize * LINE_HEIGHT_MULTIPLIER;
  }
}

/**
 * useTextAreaEditorAdapter - TextAreaEditorAdapterを生成するカスタムフック
 */
export function createTextAreaEditorAdapter(
  options: TextAreaEditorAdapterOptions,
): EditorInstance {
  return new TextAreaEditorAdapter(options);
}
