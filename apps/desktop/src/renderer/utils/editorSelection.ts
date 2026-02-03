/**
 * editorSelection - Monaco Editor選択範囲取得ユーティリティ
 *
 * @description
 * Monaco Editorの選択範囲を取得し、Main Processに提供するためのユーティリティ。
 * window.__editorSelectionとしてグローバルに公開され、
 * Main ProcessからwebContents.executeJavaScriptで呼び出される。
 *
 * @module renderer/utils/editorSelection
 */

import type { TextSelection } from "../features/workspace-chat-edit/types";

/**
 * Monaco Editor インスタンスの最小インターフェース
 */
interface IMonacoSelection {
  readonly startLineNumber: number;
  readonly startColumn: number;
  readonly endLineNumber: number;
  readonly endColumn: number;
  isEmpty(): boolean;
}

interface IMonacoModel {
  getValueInRange(selection: IMonacoSelection): string;
}

interface IMonacoEditor {
  getSelection(): IMonacoSelection | null;
  getModel(): IMonacoModel | null;
}

/**
 * アクティブなエディタインスタンスへの参照
 */
let activeEditor: IMonacoEditor | null = null;

/**
 * アクティブなエディタを設定する
 *
 * Monaco Editorコンポーネントがマウントされた時に呼び出す。
 *
 * @param editor - Monaco Editorインスタンス、またはnullでクリア
 */
export function setActiveEditor(editor: IMonacoEditor | null): void {
  activeEditor = editor;
}

/**
 * アクティブなエディタを取得する
 *
 * @returns 現在アクティブなエディタ、未設定の場合はnull
 */
export function getActiveEditor(): IMonacoEditor | null {
  return activeEditor;
}

/**
 * エディタの選択範囲を取得する
 *
 * Main Processから呼び出される主要関数。
 * 選択範囲がない場合（カーソルのみ）はnullを返す。
 *
 * @returns TextSelection または null
 */
export function getEditorSelection(): TextSelection | null {
  const editor = getActiveEditor();
  if (!editor) {
    return null;
  }

  const selection = editor.getSelection();
  if (!selection) {
    return null;
  }

  const model = editor.getModel();
  if (!model) {
    return null;
  }

  // 空選択（カーソルのみ）の場合はnullを返す
  if (selection.isEmpty()) {
    return null;
  }

  const selectedText = model.getValueInRange(selection);

  return {
    startLine: selection.startLineNumber,
    startColumn: selection.startColumn,
    endLine: selection.endLineNumber,
    endColumn: selection.endColumn,
    selectedText,
  };
}

/**
 * エディタ選択ユーティリティのグローバルインターフェース
 */
export interface EditorSelectionGlobal {
  getEditorSelection: () => TextSelection | null;
  setActiveEditor: (editor: IMonacoEditor | null) => void;
  getActiveEditor: () => IMonacoEditor | null;
}

/**
 * グローバルオブジェクトとして公開
 *
 * Main ProcessからwebContents.executeJavaScriptで
 * window.__editorSelection.getEditorSelection() として呼び出される。
 */
export function exposeEditorSelection(): void {
  if (typeof window !== "undefined") {
    (
      window as unknown as { __editorSelection: EditorSelectionGlobal }
    ).__editorSelection = {
      getEditorSelection,
      setActiveEditor,
      getActiveEditor,
    };
  }
}

// 自動公開（このモジュールがインポートされた時点で公開）
exposeEditorSelection();
