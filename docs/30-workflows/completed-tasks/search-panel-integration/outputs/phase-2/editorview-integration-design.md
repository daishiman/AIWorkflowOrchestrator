# Phase 2: EditorView 統合設計書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| 作成日     | 2026-01-22           |
| フェーズ   | Phase 2              |
| 成果物種別 | EditorView統合設計書 |
| ステータス | 完了                 |
| 関連Issue  | #361                 |

---

## 1. 統合概要

EditorView コンポーネントに Phase 5 で実装した SearchPanel および WorkspaceSearchPanel を統合する。

### 1.1 統合対象コンポーネント

| コンポーネント       | 提供元                              | 役割                      |
| -------------------- | ----------------------------------- | ------------------------- |
| SearchPanel          | `features/search/components/`       | ファイル内検索 UI         |
| WorkspaceSearchPanel | `features/search/components/`       | ワークスペース検索 UI     |
| UnifiedSearchPanel   | `components/organisms/SearchPanel/` | ファイル名検索 UI（既存） |

### 1.2 統合フック

| フック                     | 提供元              | 役割                      |
| -------------------------- | ------------------- | ------------------------- |
| useEditorInstance          | `EditorView/hooks/` | EditorInstance アダプター |
| useWorkspaceSearch         | `EditorView/hooks/` | 検索プロバイダ            |
| useSearchKeyboardShortcuts | `EditorView/hooks/` | ショートカット管理        |

---

## 2. 状態管理設計

### 2.1 ローカル状態

```typescript
// EditorView 内部の検索関連状態
type SearchMode = "file" | "workspace" | "filename";

const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
const [searchMode, setSearchMode] = useState<SearchMode>("file");
const [showReplace, setShowReplace] = useState(false);
```

### 2.2 グローバル状態（AppStore）

```typescript
// AppStore から取得
const editorContent = useAppStore((state) => state.editorContent);
const setEditorContent = useAppStore((state) => state.setEditorContent);
const selectedFilePath = useAppStore((state) => state.selectedFilePath);
const workspacePath = useAppStore((state) => state.workspacePath);
```

### 2.3 状態フロー

```
┌──────────────────────────────────────────────────────────┐
│                      AppStore                            │
│  ┌────────────────┐  ┌────────────────┐                 │
│  │ editorContent  │  │ workspacePath  │                 │
│  └───────┬────────┘  └───────┬────────┘                 │
└──────────┼───────────────────┼───────────────────────────┘
           ▼                   ▼
┌──────────────────────────────────────────────────────────┐
│                      EditorView                          │
│  ┌────────────────┐  ┌────────────────┐                 │
│  │ isSearchOpen   │  │   searchMode   │                 │
│  │ showReplace    │  │                │                 │
│  └───────┬────────┘  └───────┬────────┘                 │
│          │                   │                           │
│          ▼                   ▼                           │
│  ┌────────────────────────────────────────┐              │
│  │   SearchPanel / WorkspaceSearchPanel   │              │
│  └────────────────────────────────────────┘              │
└──────────────────────────────────────────────────────────┘
```

---

## 3. EditorView 更新設計

### 3.1 現在の構造

```typescript
function EditorView() {
  // 既存の状態・ロジック
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const editorContent = useAppStore((state) => state.editorContent);
  const setEditorContent = useAppStore((state) => state.setEditorContent);

  return (
    <div className="editor-view">
      {/* ファイルツリー */}
      {/* ツールバー */}
      {/* TextArea エディタ */}
      <textarea ref={textAreaRef} value={editorContent} ... />
    </div>
  );
}
```

### 3.2 統合後の構造

```typescript
function EditorView() {
  // === 既存の状態・ロジック ===
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const editorContent = useAppStore((state) => state.editorContent);
  const setEditorContent = useAppStore((state) => state.setEditorContent);
  const selectedFilePath = useAppStore((state) => state.selectedFilePath);
  const workspacePath = useAppStore((state) => state.workspacePath);

  // === 検索関連状態（追加）===
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>('file');
  const [showReplace, setShowReplace] = useState(false);

  // === 統合フック（追加）===
  const { editorInstanceRef } = useEditorInstance({
    textAreaRef,
    editorContent,
    setEditorContent,
  });

  const workspaceSearchProvider = useWorkspaceSearch();

  useSearchKeyboardShortcuts({
    isSearchPanelOpen,
    searchMode,
    selectedFilePath,
    searchPanelRef,
    setSearchMode,
    setShowReplace,
    setIsSearchPanelOpen,
  });

  // === ハンドラー（追加）===
  const handleSearchClose = useCallback(() => {
    setIsSearchPanelOpen(false);
    setShowReplace(false);
  }, []);

  const handleFileOpen = useCallback(
    async (filePath: string, line: number, column?: number) => {
      // ファイルを開く
      await handleFileSelect(filePath);
      // 該当行にジャンプ
      setTimeout(() => {
        editorInstanceRef.current?.scrollToLine(line, column);
      }, 100);
    },
    [handleFileSelect, editorInstanceRef]
  );

  return (
    <div className="editor-view">
      {/* ファイルツリー */}
      {/* ツールバー */}

      {/* === 検索パネル（追加）=== */}
      {isSearchPanelOpen && searchMode === 'file' && selectedFilePath && (
        <SearchPanel
          isOpen={isSearchPanelOpen}
          onClose={handleSearchClose}
          editorRef={editorInstanceRef}
          showReplace={showReplace}
        />
      )}

      {isSearchPanelOpen && searchMode === 'workspace' && workspacePath && (
        <WorkspaceSearchPanel
          isOpen={isSearchPanelOpen}
          onClose={handleSearchClose}
          workspacePath={workspacePath}
          onFileOpen={handleFileOpen}
          showReplace={showReplace}
          searchProvider={workspaceSearchProvider}
        />
      )}

      {isSearchPanelOpen && searchMode === 'filename' && (
        <UnifiedSearchPanel
          ref={searchPanelRef}
          allFilePaths={allFilePaths}
          onFileNameSelect={handleFileNameSelect}
          onClose={handleSearchClose}
        />
      )}

      {/* TextArea エディタ */}
      <textarea ref={textAreaRef} value={editorContent} ... />
    </div>
  );
}
```

---

## 4. レイアウト設計

### 4.1 パネル配置

```
┌─────────────────────────────────────────────────────┐
│                    EditorView                        │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │              SearchPanel (overlay)              │ │
│ │  ┌───────────────────────────────────────────┐  │ │
│ │  │ 🔍 [Search input..................] [⚙️] │  │ │
│ │  │     [Replace input................]       │  │ │
│ │  └───────────────────────────────────────────┘  │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │                                                 │ │
│ │              TextArea (エディタ)                │ │
│ │                                                 │ │
│ │                                                 │ │
│ │                                                 │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 4.2 スタイリング

```css
/* 検索パネルのオーバーレイ配置 */
.search-panel-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
}

/* WorkspaceSearchPanel のサイドパネル配置（オプション）*/
.workspace-search-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 400px;
  height: 100%;
  z-index: 50;
}
```

---

## 5. 既存機能との競合回避

### 5.1 ショートカット競合

| ショートカット | 既存機能                   | 対処法                         |
| -------------- | -------------------------- | ------------------------------ |
| `Cmd+F`        | ブラウザ検索（無効化済み） | Electron で `preventDefault()` |
| `Cmd+P`        | 印刷                       | Electron で無効化              |
| `Cmd+H`        | アプリを隠す（Mac）        | 置換は `Cmd+T` を使用          |

### 5.2 フォーカス管理

| シナリオ       | 動作                                  |
| -------------- | ------------------------------------- |
| パネルオープン | 検索入力にフォーカス                  |
| パネルクローズ | エディタ (TextArea) にフォーカス      |
| Escape 押下    | パネルクローズ + エディタにフォーカス |
| マッチへ移動   | エディタにフォーカス維持              |

### 5.3 状態リセット

| イベント           | リセット対象                         |
| ------------------ | ------------------------------------ |
| ファイル切替       | 検索結果、ハイライト                 |
| パネルクローズ     | showReplace のみ（検索クエリは保持） |
| ワークスペース切替 | 全検索状態                           |

---

## 6. エラーハンドリング

### 6.1 検索エラー

```typescript
// SearchPanel 内
const handleSearchError = (error: Error) => {
  // 正規表現エラーなど
  setErrorMessage(error.message);
};

// UI 表示
{error && (
  <div
    role="alert"
    className="text-red-500 text-sm"
    aria-live="polite"
  >
    {error}
  </div>
)}
```

### 6.2 IPC エラー

```typescript
// useWorkspaceSearch 内
try {
  const response = await window.electronAPI.search.executeWorkspace(request);
  if (!response.success) {
    throw new Error(response.error || "Search failed");
  }
} catch (error) {
  console.error("Workspace search error:", error);
  yield * []; // 空の結果
}
```

---

## 7. パフォーマンス最適化

### 7.1 メモ化

```typescript
// ハンドラーのメモ化
const handleSearchClose = useCallback(() => {...}, []);
const handleFileOpen = useCallback(async (...) => {...}, [deps]);

// 検索プロバイダのメモ化
const workspaceSearchProvider = useCallback(async function* (...) {...}, []);
```

### 7.2 遅延レンダリング

```typescript
// パネルは isOpen 時のみレンダリング
{isSearchPanelOpen && searchMode === 'file' && (
  <SearchPanel ... />
)}
```

---

## 8. 実装状況

### EditorView 現在の状態

| 項目                            | ステータス |
| ------------------------------- | ---------- |
| 基本構造                        | 実装済み   |
| SearchPanel 統合                | 実装済み   |
| WorkspaceSearchPanel 統合       | 実装済み   |
| UnifiedSearchPanel（filename）  | 実装済み   |
| useEditorInstance 統合          | 実装済み   |
| useWorkspaceSearch 統合         | 実装済み   |
| useSearchKeyboardShortcuts 統合 | 実装済み   |

---

## 完了条件チェック

- [x] EditorView の更新設計が完了している
- [x] 既存機能との競合回避策が定義されている
- [x] レイアウト設計が完了している
- [x] エラーハンドリング設計が完了している
- [x] パフォーマンス最適化方針が定義されている
