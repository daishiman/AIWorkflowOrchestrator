# Phase 1: 統合要件定義書

## メタ情報

| 項目       | 内容           |
| ---------- | -------------- |
| 作成日     | 2026-01-22     |
| フェーズ   | Phase 1        |
| 成果物種別 | 統合要件定義書 |
| ステータス | 完了           |
| 関連Issue  | #361           |

---

## 1. EditorInstance インターフェース要件

### 1.1 インターフェース定義

```typescript
interface EditorInstance {
  // コンテンツ取得
  getContent(): string;

  // ハイライト管理
  setHighlights(
    highlights: Array<{
      line: number;
      column: number;
      length: number;
      isCurrent?: boolean;
    }>,
  ): void;
  getHighlights(): Array<{
    line: number;
    column: number;
    length: number;
    isCurrent?: boolean;
  }>;

  // スクロール・ナビゲーション
  scrollToLine(line: number, column?: number): void;

  // カーソル操作
  getCursorPosition(): { line: number; column: number };
  setCursorPosition(line: number, column: number): void;

  // テキスト置換
  replaceText(
    line: number,
    column: number,
    length: number,
    replacement: string,
  ): void;
  replaceAllText(
    matches: Array<{ line: number; column: number; length: number }>,
    replacement: string,
  ): void;

  // フォーカス制御
  focus(): void;
}
```

### 1.2 メソッド要件詳細

| メソッド              | 要件                                                           |
| --------------------- | -------------------------------------------------------------- |
| `getContent()`        | 現在のエディタコンテンツを文字列で返却                         |
| `setHighlights()`     | 指定位置にハイライトを設定（現在のマッチは `isCurrent: true`） |
| `getHighlights()`     | 現在設定されているハイライト配列を返却                         |
| `scrollToLine()`      | 指定行（1-indexed）にスクロール、オフセット考慮                |
| `getCursorPosition()` | 現在のカーソル位置を行・列（1-indexed）で返却                  |
| `setCursorPosition()` | 指定位置にカーソルを移動                                       |
| `replaceText()`       | 指定位置のテキストを置換                                       |
| `replaceAllText()`    | 複数マッチを一括置換（後方から処理して位置ずれ回避）           |
| `focus()`             | エディタにフォーカスを設定                                     |

### 1.3 座標系

| 項目     | 仕様              |
| -------- | ----------------- |
| 行番号   | 1-indexed         |
| 列番号   | 1-indexed         |
| 文字位置 | 0-indexed（内部） |

---

## 2. 状態管理の接続要件

### 2.1 useSearchStore との連携

| 状態                         | 用途                              | 接続方法         |
| ---------------------------- | --------------------------------- | ---------------- |
| `searchQuery`                | 検索クエリ                        | Zustand セレクタ |
| `replaceText`                | 置換テキスト                      | Zustand セレクタ |
| `options`                    | 検索オプション（caseSensitive等） | Zustand セレクタ |
| `fileResults`                | ファイル内検索結果                | Zustand セレクタ |
| `currentFileResultIndex`     | 現在の結果インデックス            | Zustand セレクタ |
| `isSearchPanelOpen`          | ファイル内検索パネル開閉          | Zustand セレクタ |
| `isWorkspaceSearchPanelOpen` | ワークスペース検索パネル開閉      | Zustand セレクタ |
| `showReplace`                | 置換モード表示                    | Zustand セレクタ |
| `includePattern`             | ファイルフィルター（含む）        | Zustand セレクタ |
| `excludePattern`             | ファイルフィルター（除外）        | Zustand セレクタ |

### 2.2 EditorView の状態との同期

| EditorView 状態     | 同期対象                            | 同期方法                  |
| ------------------- | ----------------------------------- | ------------------------- |
| `editorContent`     | SearchPanel での検索対象            | AppStore → EditorInstance |
| `selectedFilePath`  | 検索対象ファイルの識別              | EditorView ローカル状態   |
| `searchMode`        | "file" \| "workspace" \| "filename" | EditorView ローカル状態   |
| `isSearchPanelOpen` | パネル表示状態                      | EditorView ローカル状態   |
| `showReplace`       | 置換モード表示                      | EditorView ローカル状態   |

### 2.3 永続化要件

| 永続化対象       | ストレージ   | 復元タイミング |
| ---------------- | ------------ | -------------- |
| `options`        | localStorage | アプリ起動時   |
| `showReplace`    | localStorage | アプリ起動時   |
| `includePattern` | localStorage | アプリ起動時   |
| `excludePattern` | localStorage | アプリ起動時   |

---

## 3. キーボードショートカットの接続要件

### 3.1 useSearchKeyboardShortcuts フックの統合

| パラメータ             | 型                                    | 用途                   |
| ---------------------- | ------------------------------------- | ---------------------- |
| `isSearchPanelOpen`    | `boolean`                             | パネル開閉状態の監視   |
| `searchMode`           | `"file" \| "workspace" \| "filename"` | 検索モード             |
| `selectedFilePath`     | `string \| null`                      | ファイル選択状態       |
| `searchPanelRef`       | `RefObject<UnifiedSearchPanel>`       | レガシーパネル参照     |
| `setSearchMode`        | `(mode: SearchMode) => void`          | モード変更コールバック |
| `setShowReplace`       | `(show: boolean) => void`             | 置換モード切替         |
| `setIsSearchPanelOpen` | `(open: boolean) => void`             | パネル開閉切替         |

### 3.2 ショートカット定義

| ショートカット     | macOS         | Windows/Linux  | アクション                     |
| ------------------ | ------------- | -------------- | ------------------------------ |
| ファイル内検索     | `Cmd+F`       | `Ctrl+F`       | searchMode = "file", open      |
| ファイル内置換     | `Cmd+T`       | `Ctrl+T`       | showReplace = true             |
| ワークスペース検索 | `Cmd+Shift+F` | `Ctrl+Shift+F` | searchMode = "workspace", open |
| ワークスペース置換 | `Cmd+Shift+T` | `Ctrl+Shift+T` | showReplace = true             |
| ファイル名検索     | `Cmd+P`       | `Ctrl+P`       | searchMode = "filename", open  |
| パネルを閉じる     | `Escape`      | `Escape`       | close                          |

### 3.3 競合回避

| 既存ショートカット          | 対処方法                            |
| --------------------------- | ----------------------------------- |
| `Cmd+H` (Mac: アプリを隠す) | 置換ショートカットを `Cmd+T` に変更 |
| ブラウザショートカット      | `preventDefault()` で上書き         |
| エディタ内ショートカット    | フォーカス状態で分岐                |

---

## 4. コンポーネント接続要件

### 4.1 SearchPanel の接続

```tsx
<SearchPanel
  isOpen={isSearchPanelOpen && searchMode === "file"}
  onClose={handleSearchClose}
  editorRef={editorInstanceRef}
  showReplace={showReplace}
  initialSearchText={initialSearchText} // オプション
/>
```

| Props               | 型                          | 必須 | 用途                     |
| ------------------- | --------------------------- | ---- | ------------------------ |
| `isOpen`            | `boolean`                   | ✓    | パネル表示制御           |
| `onClose`           | `() => void`                | ✓    | 閉じるコールバック       |
| `editorRef`         | `RefObject<EditorInstance>` | ✓    | エディタインスタンス参照 |
| `showReplace`       | `boolean`                   |      | 置換モード初期状態       |
| `initialSearchText` | `string`                    |      | 初期検索テキスト         |

### 4.2 WorkspaceSearchPanel の接続

```tsx
<WorkspaceSearchPanel
  isOpen={isSearchPanelOpen && searchMode === "workspace"}
  onClose={handleSearchClose}
  workspacePath={workspacePath}
  onFileOpen={handleFileOpen}
  showReplace={showReplace}
  searchProvider={workspaceSearchProvider}
/>
```

| Props            | 型                           | 必須 | 用途                         |
| ---------------- | ---------------------------- | ---- | ---------------------------- |
| `isOpen`         | `boolean`                    | ✓    | パネル表示制御               |
| `onClose`        | `() => void`                 | ✓    | 閉じるコールバック           |
| `workspacePath`  | `string`                     | ✓    | 検索対象ワークスペース       |
| `onFileOpen`     | `(path, line, col?) => void` | ✓    | ファイルオープンコールバック |
| `showReplace`    | `boolean`                    |      | 置換モード初期状態           |
| `searchProvider` | `SearchProvider`             |      | カスタム検索プロバイダ       |

---

## 5. IPC 接続要件

### 5.1 ワークスペース検索 IPC

```typescript
// Renderer → Main
window.electronAPI.search.executeWorkspace({
  rootPath: string;
  query: string;
  options: {
    caseSensitive: boolean;
    wholeWord: boolean;
    useRegex: boolean;
  };
  includePattern?: string;
  excludePatterns?: string[];
})

// Main → Renderer
{
  success: boolean;
  data: {
    matches: Array<{
      filePath: string;
      line: number;
      column: number;
      matchText: string;
      lineText: string;
    }>;
  };
  error?: string;
}
```

### 5.2 ファイル操作 IPC

```typescript
// ファイル読み込み
window.electronAPI.file.read({ filePath: string })

// ファイル書き込み
window.electronAPI.file.write({ filePath: string; content: string })
```

---

## 6. 統合アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────────┐
│                          EditorView                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐    ┌───────────────────────────────────┐  │
│  │ SearchPanel      │    │ WorkspaceSearchPanel              │  │
│  │ (File Search)    │    │ (Workspace Search)                │  │
│  └────────┬─────────┘    └────────────────┬──────────────────┘  │
│           │                               │                      │
│           ▼                               ▼                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    EditorInstance                          │ │
│  │                    (Interface)                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│           ▲                               ▲                      │
│           │                               │                      │
│  ┌────────┴─────────┐    ┌────────────────┴──────────────────┐  │
│  │ useEditorInstance│    │ useWorkspaceSearch               │  │
│  │ (Adapter Hook)   │    │ (IPC Provider)                   │  │
│  └──────────────────┘    └───────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 useSearchKeyboardShortcuts               │   │
│  │                 (Keyboard Handler)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                          TextArea                                │
│                    (Native HTML Element)                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. 実装済み確認

### EditorView/hooks/ 配下

| ファイル                        | ステータス | 内容                      |
| ------------------------------- | ---------- | ------------------------- |
| `useEditorInstance.ts`          | ✓ 実装済み | EditorInstance アダプター |
| `useWorkspaceSearch.ts`         | ✓ 実装済み | IPC 検索プロバイダ        |
| `useSearchKeyboardShortcuts.ts` | ✓ 実装済み | キーボードショートカット  |
| `index.ts`                      | ✓ 実装済み | バレルエクスポート        |

---

## 完了条件チェック

- [x] EditorInstance インターフェース要件が定義されている
- [x] 状態管理の接続ポイントが明確化されている
- [x] キーボードショートカットの接続方法が決定されている
- [x] 統合アーキテクチャが文書化されている
