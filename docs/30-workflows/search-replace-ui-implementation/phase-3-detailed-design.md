# Phase 3: 詳細設計

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 3                     |
| 機能名 | 検索・置換機能 UI実装 |
| 作成日 | 2026-01-05            |

## 目的

各コンポーネントの詳細仕様、Props、振る舞いを設計する。

## 使用スキル

| スキル               | パス                                           | 選定理由             |
| -------------------- | ---------------------------------------------- | -------------------- |
| electron-ui-patterns | `.claude/skills/electron-ui-patterns/SKILL.md` | Electron UI設計      |
| accessibility-wcag   | `.claude/skills/accessibility-wcag/SKILL.md`   | アクセシビリティ設計 |

## 参照資料

| 資料名        | パス                                          | 説明             |
| ------------- | --------------------------------------------- | ---------------- |
| Phase 2成果物 | `outputs/phase-2/architecture-design.md`      | アーキテクチャ   |
| 既存型定義    | `apps/desktop/src/features/search/types.ts`   | インターフェース |
| 既存テスト    | `apps/desktop/src/features/search/__tests__/` | 期待仕様         |

## 実行手順

### ステップ1: SearchPanel 詳細設計

```typescript
/**
 * SearchPanel - ファイル内検索パネル
 *
 * 位置: エディタ上部にオーバーレイ表示
 * サイズ: 幅100%, 高さ auto（コンテンツに応じて）
 */

interface SearchPanelProps {
  isOpen: boolean; // パネル表示状態
  onClose: () => void; // 閉じるコールバック
  editorRef: RefObject<EditorInstance>; // エディタへの参照
  initialSearchText?: string; // 初期検索テキスト（選択テキスト）
  showReplace?: boolean; // 置換モード表示
}

// 内部状態
interface SearchPanelState {
  searchQuery: string;
  replaceText: string;
  caseSensitive: boolean;
  regex: boolean;
  wholeWord: boolean;
  showReplaceMode: boolean;
  results: SearchMatch[];
  currentIndex: number;
  error: string | null;
}
```

**振る舞い:**

- パネルが開いたら検索入力にフォーカス
- 入力から150msデバウンス後に検索実行
- 結果はエディタにハイライト表示
- Enter: 次の結果へ移動
- Shift+Enter: 前の結果へ移動
- Escape: パネルを閉じる
- Cmd+H: 置換モードトグル

### ステップ2: WorkspaceSearchPanel 詳細設計

```typescript
/**
 * WorkspaceSearchPanel - ワークスペース検索パネル
 *
 * 位置: サイドバーまたはパネルエリア
 * サイズ: 幅300px以上, 高さ100%
 */

interface WorkspaceSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  workspacePath: string;
  onFileOpen: (filePath: string, line: number, column?: number) => void;
  initialSearchText?: string;
  showReplace?: boolean;
}

// 内部状態
interface WorkspaceSearchPanelState {
  searchQuery: string;
  replaceText: string;
  includePattern: string; // 例: "*.ts,*.tsx"
  excludePattern: string; // 例: "node_modules,dist"
  caseSensitive: boolean;
  regex: boolean;
  wholeWord: boolean;
  showReplaceMode: boolean;
  results: FileSearchResult[];
  expandedFiles: Set<string>;
  selectedResultIndex: number;
  isSearching: boolean;
  error: string | null;
}
```

**振る舞い:**

- 検索は Enter キーで明示的に実行
- 結果はストリーミングで順次表示
- ファイルは展開/折りたたみ可能
- 結果行クリックでファイルを開く
- 上下矢印で結果間を移動
- 仮想スクロールで大量結果に対応

### ステップ3: 共通コンポーネント設計

```typescript
// SearchInput
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  placeholder?: string;
  isError?: boolean;
  autoFocus?: boolean;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

// SearchOptions
interface SearchOptionsProps {
  caseSensitive: boolean;
  onCaseSensitiveChange: (value: boolean) => void;
  regex: boolean;
  onRegexChange: (value: boolean) => void;
  wholeWord: boolean;
  onWholeWordChange: (value: boolean) => void;
}

// SearchStatus
interface SearchStatusProps {
  currentIndex: number; // 1-indexed
  totalCount: number;
  isSearching?: boolean;
}
```

### ステップ4: アクセシビリティ設計

```typescript
// WCAG 2.1 AA 準拠チェックリスト

// 1. キーボード操作
const keyboardNavigation = {
  Tab: "フォーカス移動",
  "Shift+Tab": "逆方向フォーカス移動",
  Enter: "検索実行/次の結果",
  "Shift+Enter": "前の結果",
  Escape: "パネルを閉じる",
  F3: "次の結果",
  "Shift+F3": "前の結果",
  "Cmd+H": "置換モードトグル",
};

// 2. ARIA属性
const ariaAttributes = {
  SearchPanel: {
    role: "dialog",
    "aria-label": "検索",
    "aria-modal": "false",
  },
  SearchInput: {
    role: "searchbox",
    "aria-label": "検索",
    "aria-describedby": "search-status", // 結果件数と紐付け
  },
  SearchStatus: {
    role: "status",
    "aria-live": "polite",
  },
  OptionButton: {
    role: "button",
    "aria-pressed": "boolean", // トグル状態
    "aria-label": "大文字小文字を区別 / 正規表現 / 単語単位",
  },
  FileResultTree: {
    role: "tree",
    "aria-label": "検索結果",
  },
  FileResultHeader: {
    role: "treeitem",
    "aria-expanded": "boolean",
  },
  MatchResultItem: {
    role: "treeitem",
    "aria-selected": "boolean",
  },
};

// 3. フォーカス管理
const focusManagement = {
  onOpen: "検索入力にフォーカス",
  onClose: "元のエディタにフォーカスを戻す",
  focusTrap: "パネル内でフォーカスをトラップ",
};

// 4. 視覚的フィードバック
const visualFeedback = {
  focusIndicator: "2px solid #0066cc", // フォーカス時の枠線
  activeOption: "background-color + aria-pressed",
  matchHighlight: "background-color: yellow",
  currentMatchHighlight: "background-color: orange",
};
```

### ステップ5: スタイル設計

```typescript
// Tailwind CSS クラス設計

const styles = {
  panel: "bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4",
  searchInput:
    "w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500",
  optionButton: `
    p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700
    focus:outline-none focus:ring-2 focus:ring-blue-500
    aria-pressed:bg-blue-100 dark:aria-pressed:bg-blue-900
  `,
  navigationButton: `
    p-1 rounded hover:bg-gray-100 disabled:opacity-50
    focus:outline-none focus:ring-2 focus:ring-blue-500
  `,
  resultItem: `
    px-2 py-1 cursor-pointer hover:bg-gray-100
    aria-selected:bg-blue-100
  `,
  matchHighlight: "bg-yellow-200 dark:bg-yellow-800",
  currentMatchHighlight: "bg-orange-300 dark:bg-orange-700",
};
```

### ステップ6: パフォーマンス設計

```typescript
// パフォーマンス最適化

const performanceOptimizations = {
  // 1. デバウンス
  searchDebounce: 150, // ms

  // 2. 仮想スクロール
  virtualScroll: {
    itemHeight: 24, // px
    overscan: 10, // 表示外に追加レンダリングする行数
  },

  // 3. メモ化
  memoization: [
    "useCallback for handlers",
    "useMemo for computed values",
    "React.memo for list items",
  ],

  // 4. バッチ更新
  batchUpdates: "requestAnimationFrame for highlight updates",

  // 5. 大量マッチ対策
  maxHighlights: 1000, // これ以上はハイライト省略
  chunkSize: 100, // ストリーミング結果のチャンクサイズ
};
```

## 成果物

| 成果物     | パス                                 | 説明           |
| ---------- | ------------------------------------ | -------------- |
| 詳細設計書 | `outputs/phase-3/detailed-design.md` | 本ドキュメント |

## 完了条件

- [x] SearchPanel 詳細設計が完了している
- [x] WorkspaceSearchPanel 詳細設計が完了している
- [x] 共通コンポーネント設計が完了している
- [x] アクセシビリティ設計が完了している
- [x] スタイル設計が完了している
- [x] パフォーマンス設計が完了している

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. SearchPanel 詳細設計
2. WorkspaceSearchPanel 詳細設計
3. 共通コンポーネント設計
4. アクセシビリティ設計
5. スタイル設計
6. パフォーマンス設計

## 次のPhase

Phase 4: テスト作成（TDD: Red）
