# Phase 2: アーキテクチャ設計書

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase     | 2                      |
| 機能名    | search-replace-ui      |
| タスクID  | task-imp-search-ui-001 |
| 関連Issue | #366                   |
| 作成日    | 2026-02-04             |

## 概要

検索・置換機能の全体アーキテクチャ設計。既存実装を活用し、E2E統合とIPC統合を追加する。

## 全体構成図

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Renderer Process                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐    ┌────────────────────────────────────┐    │
│  │  EditorView      │    │  AppLayout                         │    │
│  │  ┌────────────┐  │    │  ┌────────────────────────────────┐│    │
│  │  │SearchPanel │◄─┼────┼──│ キーボードショートカットハンドラ││    │
│  │  │(File Search)│ │    │  │ Cmd+F: openSearchPanel         ││    │
│  │  └────────────┘  │    │  │ Cmd+T: openReplacePanel        ││    │
│  └──────────────────┘    │  │ Cmd+Shift+F: openWorkspaceSearch││   │
│                          │  └────────────────────────────────┘│    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Sidebar                                                      │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  WorkspaceSearchPanel                                  │  │  │
│  │  │  ┌──────────────────┐  ┌────────────────────────────┐  │  │  │
│  │  │  │ searchProvider   │──│ window.searchApi           │  │  │  │
│  │  │  │ (IPC via Preload)│  │ .searchWorkspace()         │  │  │  │
│  │  │  └──────────────────┘  └────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  State Management (Zustand)                                   │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  useSearchStore                                        │  │  │
│  │  │  - isSearchPanelOpen                                   │  │  │
│  │  │  - isWorkspaceSearchPanelOpen                          │  │  │
│  │  │  - searchQuery, replaceText                            │  │  │
│  │  │  - options (caseSensitive, regex, wholeWord)           │  │  │
│  │  │  - results, currentIndex                               │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ contextBridge (secure)
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          Preload Script                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  searchApi                                                  │    │
│  │  - searchWorkspace(request, callbacks): cancelFn            │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ IPC (search:workspace)
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          Main Process                                │
├─────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  IPC Handlers (searchHandlers.ts)                          │    │
│  │  - search:workspace                                         │    │
│  │  - search:workspace:cancel                                  │    │
│  └────────────────────────────────────────────────────────────┘    │
│                          │                                          │
│                          ▼                                          │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  WorkspaceSearchEngine                                      │    │
│  │  - search(path, query, options, signal)                     │    │
│  │  - Security: ReDoS protection, path traversal prevention    │    │
│  └────────────────────────────────────────────────────────────┘    │
│                          │                                          │
│                          ▼                                          │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  File System                                                │    │
│  │  - glob (file pattern matching)                             │    │
│  │  - fs.readFile (content reading)                            │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

## コンポーネント構成

### 既存コンポーネント（変更なし）

```
apps/desktop/src/features/search/
├── components/
│   ├── SearchPanel.tsx           # ファイル内検索UI
│   ├── WorkspaceSearchPanel.tsx  # ワークスペース検索UI
│   └── SearchOptionButtons.tsx   # 検索オプションボタン
├── stores/
│   └── useSearchStore.ts         # Zustand状態管理
├── hooks/
│   └── useSearchKeyboardShortcuts.ts  # キーボードショートカット
├── adapters/
│   └── TextAreaEditorAdapter.ts  # エディタアダプター
├── utils/
│   ├── executeSearch.ts          # 検索ロジック
│   ├── highlightUtils.tsx        # ハイライト処理
│   └── index.ts
├── types.ts
├── constants.ts
└── index.ts
```

### 新規/追加コンポーネント

```
apps/desktop/
├── e2e/                           # E2Eテスト（新規）
│   ├── pages/
│   │   ├── SearchPanelPage.ts
│   │   └── WorkspaceSearchPage.ts
│   ├── fixtures/
│   │   └── search-test-files/
│   └── search.spec.ts
└── src/
    └── preload/
        └── searchApi.ts           # 検索API（IPC統合）
```

## 状態管理設計

### useSearchStore

```typescript
interface SearchState {
  // パネル状態
  isSearchPanelOpen: boolean;
  isWorkspaceSearchPanelOpen: boolean;
  showReplace: boolean;

  // 検索状態
  searchQuery: string;
  replaceText: string;
  options: SearchOptions;

  // ファイル検索結果
  fileResults: SearchMatch[];
  currentFileResultIndex: number;

  // フィルター（WS検索用）
  includePattern: string;
  excludePattern: string;

  // 状態フラグ
  isSearching: boolean;
  error: string | null;
}

interface SearchActions {
  // パネル操作
  openSearchPanel: () => void;
  closeSearchPanel: () => void;
  openWorkspaceSearchPanel: () => void;
  closeWorkspaceSearchPanel: () => void;
  toggleReplaceMode: () => void;

  // 検索操作
  setSearchQuery: (query: string) => void;
  setReplaceText: (text: string) => void;
  setOption: <K extends keyof SearchOptions>(
    key: K,
    value: SearchOptions[K],
  ) => void;

  // 結果操作
  setFileResults: (results: SearchMatch[]) => void;
  goToNextResult: () => void;
  goToPreviousResult: () => void;

  // リセット
  reset: () => void;
}
```

## キーボードショートカット設計

### グローバルショートカット登録

| コンポーネント | ショートカット             | アクション                          |
| -------------- | -------------------------- | ----------------------------------- |
| AppLayout      | Cmd+F / Ctrl+F             | `openSearchPanel()`                 |
| AppLayout      | Cmd+T / Ctrl+T             | `openSearchPanel()` + `showReplace` |
| AppLayout      | Cmd+Shift+F / Ctrl+Shift+F | `openWorkspaceSearchPanel()`        |

### パネル内ショートカット

| コンポーネント       | ショートカット | アクション           |
| -------------------- | -------------- | -------------------- |
| SearchPanel          | Escape         | `onClose()`          |
| SearchPanel          | Enter          | `performSearch()`    |
| SearchPanel          | F3             | `goToNext()`         |
| SearchPanel          | Shift+F3       | `goToPrevious()`     |
| SearchPanel          | Alt+Enter      | `handleReplaceAll()` |
| WorkspaceSearchPanel | Escape         | `onClose()`          |
| WorkspaceSearchPanel | Enter          | `executeSearch()`    |
| WorkspaceSearchPanel | ArrowDown/Up   | 結果ナビゲーション   |

## データフロー

### ファイル内検索フロー

```
1. ユーザーが Cmd+F を押す
   ↓
2. AppLayout が useSearchStore.openSearchPanel() を呼び出す
   ↓
3. SearchPanel が表示される
   ↓
4. ユーザーが検索クエリを入力して Enter
   ↓
5. SearchPanel.performSearch() が実行される
   ↓
6. executeSearch() がエディタ内容を検索
   ↓
7. 結果が editorRef.setHighlights() でハイライト表示
   ↓
8. ステータスに「X/Y」形式で結果件数表示
```

### ワークスペース検索フロー

```
1. ユーザーが Cmd+Shift+F を押す
   ↓
2. AppLayout が useSearchStore.openWorkspaceSearchPanel() を呼び出す
   ↓
3. WorkspaceSearchPanel が表示される
   ↓
4. ユーザーが検索クエリを入力して Enter
   ↓
5. searchProvider (IPC経由) が呼び出される
   ↓
6. Main Process で WorkspaceSearchEngine.search() が実行
   ↓
7. 結果がストリーミングで Renderer に送信
   ↓
8. WorkspaceSearchPanel が結果をツリー表示
   ↓
9. ユーザーが結果をクリック → onFileOpen() で該当ファイルを開く
```

## セキュリティ設計

### contextBridge による分離

```typescript
// preload/index.ts
contextBridge.exposeInMainWorld("searchApi", {
  // ワークスペース検索API（安全にエクスポート）
  searchWorkspace: (request, callbacks) => {
    /* ... */
  },
});
```

### 入力検証

| 検証項目         | 実施場所        | 処理                         |
| ---------------- | --------------- | ---------------------------- |
| 正規表現の妥当性 | Renderer + Main | ReDoS検出、タイムアウト      |
| パスの妥当性     | Main            | ワークスペース外アクセス防止 |
| ファイルパターン | Renderer        | glob構文検証                 |

## テスト戦略

### レイヤー別テスト

| レイヤー       | テスト種別     | ツール       | カバレッジ目標 |
| -------------- | -------------- | ------------ | -------------- |
| コンポーネント | ユニットテスト | Vitest + RTL | 80%            |
| 統合           | 統合テスト     | Vitest       | 主要フロー     |
| E2E            | E2Eテスト      | Playwright   | 8シナリオ      |

### 既存テストの活用

- SearchPanel.test.tsx: 46テスト
- WorkspaceSearchPanel.test.tsx: 48テスト
- useSearchStore.test.ts: 21テスト
- useSearchKeyboardShortcuts.test.ts: 13テスト
- integration/\*.test.tsx: 121テスト

**合計**: 275テスト（既存）

## 完了条件チェック

- [x] E2Eテストシナリオが定義されている
- [x] E2Eテストのページオブジェクト設計が完了している
- [x] IPC統合設計が完了している
- [x] 既存実装との整合性が確認されている
- [x] 統合ポイント/契約が設計に反映されている
