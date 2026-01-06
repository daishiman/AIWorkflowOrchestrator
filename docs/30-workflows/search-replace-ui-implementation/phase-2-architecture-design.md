# Phase 2: アーキテクチャ設計

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 2                     |
| 機能名 | 検索・置換機能 UI実装 |
| 作成日 | 2026-01-05            |

## 目的

検索・置換機能UIのアーキテクチャを設計し、コンポーネント構成とデータフローを明確化する。

## 使用スキル

| スキル                 | パス                                             | 選定理由           |
| ---------------------- | ------------------------------------------------ | ------------------ |
| architectural-patterns | `.claude/skills/architectural-patterns/SKILL.md` | アーキテクチャ設計 |
| state-lifting          | `.claude/skills/state-lifting/SKILL.md`          | 状態管理設計       |

## 参照資料

| 資料名                   | パス                                                                         | 説明                 |
| ------------------------ | ---------------------------------------------------------------------------- | -------------------- |
| UI/UX設計                | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`          | UI仕様               |
| キーボードショートカット | `.claude/skills/aiworkflow-requirements/references/ui-keyboard-shortcuts.md` | ショートカット仕様   |
| バックエンド実装         | `packages/shared/src/services/search/`                                       | 検索サービス         |
| 既存型定義               | `apps/desktop/src/features/search/types.ts`                                  | インターフェース定義 |

## 実行手順

### ステップ1: アーキテクチャ全体図

```
┌──────────────────────────────────────────────────────────────────┐
│                        Renderer Process                           │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                      App Component                           │ │
│  │  ┌─────────────────┐  ┌─────────────────────────────────┐  │ │
│  │  │  SearchPanel    │  │  WorkspaceSearchPanel           │  │ │
│  │  │  (Cmd+F)        │  │  (Cmd+Shift+F)                  │  │ │
│  │  │                 │  │                                 │  │ │
│  │  │  ┌───────────┐  │  │  ┌───────────┐ ┌─────────────┐ │  │ │
│  │  │  │SearchInput│  │  │  │SearchInput│ │ResultsTree  │ │  │ │
│  │  │  └───────────┘  │  │  └───────────┘ └─────────────┘ │  │ │
│  │  │  ┌───────────┐  │  │  ┌───────────┐                 │  │ │
│  │  │  │Options    │  │  │  │FileFilter │                 │  │ │
│  │  │  └───────────┘  │  │  └───────────┘                 │  │ │
│  │  │  ┌───────────┐  │  │                                 │  │ │
│  │  │  │ReplaceBar │  │  │                                 │  │ │
│  │  │  └───────────┘  │  │                                 │  │ │
│  │  └────────┬────────┘  └────────────────┬────────────────┘  │ │
│  │           │                            │                    │ │
│  │           ▼                            ▼                    │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │              useSearchStore (Zustand)                 │  │ │
│  │  │  - searchQuery, replaceText                           │  │ │
│  │  │  - options (caseSensitive, regex, wholeWord)          │  │ │
│  │  │  - results, currentIndex                              │  │ │
│  │  │  - isSearching, error                                 │  │ │
│  │  └────────────────────────┬─────────────────────────────┘  │ │
│  └───────────────────────────┼─────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              IPC Bridge (preload/api)                      │  │
│  └───────────────────────────┬───────────────────────────────┘  │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                         Main Process                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              IPC Handlers (search.*)                       │  │
│  └───────────────────────────┬───────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              SearchService (@repo/shared)                  │  │
│  │  - searchInFile()                                          │  │
│  │  - searchInWorkspace()                                     │  │
│  │  - replaceInFile()                                         │  │
│  │  - replaceInWorkspace()                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### ステップ2: コンポーネント階層

```
src/features/search/
├── components/
│   ├── SearchPanel.tsx              # ファイル内検索パネル
│   ├── WorkspaceSearchPanel.tsx     # ワークスペース検索パネル
│   ├── shared/                      # 共通コンポーネント
│   │   ├── SearchInput.tsx          # 検索入力
│   │   ├── SearchOptions.tsx        # 検索オプションボタン群
│   │   ├── ReplaceInput.tsx         # 置換入力
│   │   ├── SearchNavigation.tsx     # 前へ/次へボタン
│   │   ├── ReplaceActions.tsx       # 置換/全置換ボタン
│   │   └── SearchStatus.tsx         # 結果件数表示
│   └── workspace/                   # WS検索専用
│       ├── FileResultTree.tsx       # ファイル結果ツリー
│       ├── FileResultHeader.tsx     # ファイルヘッダー
│       ├── MatchResultItem.tsx      # マッチ行アイテム
│       └── ReplacePreview.tsx       # 置換プレビュー
├── hooks/
│   ├── useSearchStore.ts            # Zustand ストア
│   ├── useSearchKeyboardShortcuts.ts # キーボードショートカット
│   ├── useFileSearch.ts             # ファイル内検索ロジック
│   └── useWorkspaceSearch.ts        # WS検索ロジック
├── types.ts                         # 型定義（既存）
└── index.ts                         # エクスポート
```

### ステップ3: 状態管理設計（Zustand）

```typescript
interface SearchState {
  // 検索状態
  searchQuery: string;
  replaceText: string;

  // 検索オプション
  options: {
    caseSensitive: boolean;
    regex: boolean;
    wholeWord: boolean;
  };

  // ファイル検索結果
  fileResults: Array<{
    line: number;
    column: number;
    length: number;
    text: string;
  }>;
  currentFileResultIndex: number;

  // WS検索結果
  workspaceResults: FileSearchResult[];
  currentWorkspaceResultIndex: number;

  // 状態フラグ
  isSearching: boolean;
  error: string | null;

  // パネル状態
  isSearchPanelOpen: boolean;
  isWorkspaceSearchPanelOpen: boolean;
  showReplace: boolean;

  // ファイルフィルター（WS検索用）
  includePattern: string;
  excludePattern: string;

  // アクション
  setSearchQuery: (query: string) => void;
  setReplaceText: (text: string) => void;
  setOption: (key: keyof SearchState["options"], value: boolean) => void;

  openSearchPanel: () => void;
  closeSearchPanel: () => void;
  openWorkspaceSearchPanel: () => void;
  closeWorkspaceSearchPanel: () => void;
  toggleReplaceMode: () => void;

  goToNextResult: () => void;
  goToPreviousResult: () => void;

  executeSearch: (content: string) => void;
  executeWorkspaceSearch: (workspacePath: string) => Promise<void>;

  replaceCurrent: () => void;
  replaceAll: () => void;

  reset: () => void;
}
```

### ステップ4: データフロー

**ファイル内検索フロー:**

```
1. ユーザーがCmd+Fを押す
2. useSearchKeyboardShortcuts がイベントを検知
3. useSearchStore.openSearchPanel() を呼び出し
4. SearchPanel がレンダリング
5. ユーザーが検索語句を入力
6. デバウンス(150ms)後に useFileSearch が検索実行
7. エディタのコンテンツを取得し、マッチを計算
8. editorRef.setHighlights() でハイライト設定
9. 結果件数を SearchStatus に表示
```

**ワークスペース検索フロー:**

```
1. ユーザーがCmd+Shift+Fを押す
2. useSearchKeyboardShortcuts がイベントを検知
3. useSearchStore.openWorkspaceSearchPanel() を呼び出し
4. WorkspaceSearchPanel がレンダリング
5. ユーザーが検索語句を入力しEnter
6. IPC経由で Main Process の SearchService を呼び出し
7. ストリーミングで結果を受信
8. FileResultTree に結果を順次表示
9. ユーザーが結果をクリック → onFileOpen コールバック
```

### ステップ5: IPC チャンネル設計

```typescript
// 既存チャンネル（packages/shared で定義済み）
const SEARCH_CHANNELS = {
  SEARCH_IN_FILE: "search:in-file",
  SEARCH_IN_WORKSPACE: "search:in-workspace",
  REPLACE_IN_FILE: "search:replace-in-file",
  REPLACE_IN_WORKSPACE: "search:replace-in-workspace",
  CANCEL_SEARCH: "search:cancel",
};
```

## 成果物

| 成果物             | パス                                     | 説明           |
| ------------------ | ---------------------------------------- | -------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | 本ドキュメント |

## 完了条件

- [x] 全体アーキテクチャ図が作成されている
- [x] コンポーネント階層が定義されている
- [x] 状態管理設計が完了している
- [x] データフローが明確化されている
- [x] IPC チャンネル設計が確認されている

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 全体アーキテクチャ図作成
2. コンポーネント階層設計
3. 状態管理設計
4. データフロー定義
5. IPC チャンネル確認

## 次のPhase

Phase 3: 詳細設計
