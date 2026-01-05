/**
 * 検索・置換機能 UIコンポーネント用 型定義
 */

import type { RefObject } from "react";

/**
 * エディタインスタンスのインターフェース
 */
export interface EditorInstance {
  /** エディタのコンテンツを取得 */
  getContent: () => string;
  /** 検索ハイライトを設定 */
  setHighlights: (
    highlights: Array<{
      line: number;
      column: number;
      length: number;
      isCurrent?: boolean;
    }>,
  ) => void;
  /** 現在のハイライトを取得 */
  getHighlights: () => Array<{
    line: number;
    column: number;
    length: number;
    isCurrent?: boolean;
  }>;
  /** 指定行にスクロール */
  scrollToLine: (line: number, column?: number) => void;
  /** カーソル位置を取得 */
  getCursorPosition: () => { line: number; column: number };
  /** カーソル位置を設定 */
  setCursorPosition: (line: number, column: number) => void;
  /** 現在の位置のテキストを置換 */
  replaceText: (
    line: number,
    column: number,
    length: number,
    replacement: string,
  ) => void;
  /** すべてのマッチを置換 */
  replaceAllText: (
    matches: Array<{ line: number; column: number; length: number }>,
    replacement: string,
  ) => void;
  /** エディタにフォーカス */
  focus: () => void;
}

/**
 * SearchPanel コンポーネントの Props
 */
export interface SearchPanelProps {
  /** パネルが開いているか */
  isOpen: boolean;
  /** パネルを閉じるコールバック */
  onClose: () => void;
  /** エディタへの参照 */
  editorRef: RefObject<EditorInstance>;
  /** 初期検索テキスト */
  initialSearchText?: string;
  /** 置換モードを表示するか */
  showReplace?: boolean;
}

/**
 * WorkspaceSearchPanel コンポーネントの Props
 */
export interface WorkspaceSearchPanelProps {
  /** パネルが開いているか */
  isOpen: boolean;
  /** パネルを閉じるコールバック */
  onClose: () => void;
  /** ワークスペースパス */
  workspacePath: string;
  /** ファイルを開くコールバック */
  onFileOpen: (filePath: string, line: number, column?: number) => void;
  /** 初期検索テキスト */
  initialSearchText?: string;
  /** 置換モードを表示するか */
  showReplace?: boolean;
}

/**
 * 検索入力の Props
 */
export interface SearchInputProps {
  /** 値 */
  value: string;
  /** 値変更コールバック */
  onChange: (value: string) => void;
  /** キーダウンコールバック */
  onKeyDown?: (event: React.KeyboardEvent) => void;
  /** プレースホルダー */
  placeholder?: string;
  /** エラー状態 */
  isError?: boolean;
  /** 自動フォーカス */
  autoFocus?: boolean;
  /** aria-label */
  "aria-label"?: string;
  /** aria-describedby */
  "aria-describedby"?: string;
}

/**
 * 検索オプションの Props
 */
export interface SearchOptionsProps {
  /** 大文字小文字を区別 */
  caseSensitive: boolean;
  /** 大文字小文字を区別の変更コールバック */
  onCaseSensitiveChange: (value: boolean) => void;
  /** 正規表現 */
  regex: boolean;
  /** 正規表現の変更コールバック */
  onRegexChange: (value: boolean) => void;
  /** 単語単位 */
  wholeWord: boolean;
  /** 単語単位の変更コールバック */
  onWholeWordChange: (value: boolean) => void;
}

/**
 * 検索ナビゲーションの Props
 */
export interface SearchNavigationProps {
  /** 前へ移動コールバック */
  onPrevious: () => void;
  /** 次へ移動コールバック */
  onNext: () => void;
  /** 前へ移動可能か */
  hasPrevious: boolean;
  /** 次へ移動可能か */
  hasNext: boolean;
}

/**
 * 置換アクションの Props
 */
export interface ReplaceActionsProps {
  /** 置換コールバック */
  onReplace: () => void;
  /** 全置換コールバック */
  onReplaceAll: () => void;
  /** 置換が無効か */
  isReplaceDisabled: boolean;
  /** 全置換が無効か */
  isReplaceAllDisabled: boolean;
}

/**
 * 検索結果ステータスの Props
 */
export interface SearchStatusProps {
  /** 現在のインデックス (1-indexed) */
  currentIndex: number;
  /** 総件数 */
  totalCount: number;
  /** 検索中か */
  isSearching?: boolean;
}

/**
 * ファイル結果ヘッダーの Props
 */
export interface FileResultHeaderProps {
  /** ファイルパス */
  filePath: string;
  /** マッチ数 */
  matchCount: number;
  /** 展開状態 */
  isExpanded: boolean;
  /** 展開切り替えコールバック */
  onToggle: () => void;
}

/**
 * マッチ結果アイテムの Props
 */
export interface MatchResultItemProps {
  /** 行番号 */
  lineNumber: number;
  /** 行のコンテンツ */
  lineContent: string;
  /** マッチ開始位置 */
  matchStart: number;
  /** マッチの長さ */
  matchLength: number;
  /** クリックコールバック */
  onClick: () => void;
  /** 現在選択中か */
  isCurrent?: boolean;
}
