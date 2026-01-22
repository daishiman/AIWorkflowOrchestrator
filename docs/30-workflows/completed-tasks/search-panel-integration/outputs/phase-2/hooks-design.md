# Phase 2: 統合フック設計書

## メタ情報

| 項目       | 内容         |
| ---------- | ------------ |
| 作成日     | 2026-01-22   |
| フェーズ   | Phase 2      |
| 成果物種別 | フック設計書 |
| ステータス | 完了         |
| 関連Issue  | #361         |

---

## 1. フック概要

EditorView と検索パネルを統合するために、以下の3つのカスタムフックを設計する。

| フック名                     | 責務                                | 配置先            |
| ---------------------------- | ----------------------------------- | ----------------- |
| `useEditorInstance`          | TextArea を EditorInstance に適合   | EditorView/hooks/ |
| `useWorkspaceSearch`         | ワークスペース検索の IPC プロバイダ | EditorView/hooks/ |
| `useSearchKeyboardShortcuts` | キーボードショートカット管理        | EditorView/hooks/ |

---

## 2. useEditorInstance

### 2.1 目的

TextArea をラップし、SearchPanel が使用する EditorInstance インターフェースを提供する。

### 2.2 インターフェース

```typescript
interface UseEditorInstanceOptions {
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  editorContent: string;
  setEditorContent: (content: string) => void;
}

interface UseEditorInstanceReturn {
  editorInstanceRef: React.RefObject<EditorInstance>;
}

function useEditorInstance(
  options: UseEditorInstanceOptions,
): UseEditorInstanceReturn;
```

### 2.3 実装設計

```typescript
export function useEditorInstance({
  textAreaRef,
  editorContent,
  setEditorContent,
}: UseEditorInstanceOptions): UseEditorInstanceReturn {
  // editorContent を ref で保持（コールバック内で最新値を参照するため）
  const editorContentRef = useRef(editorContent);
  useEffect(() => {
    editorContentRef.current = editorContent;
  }, [editorContent]);

  // EditorInstance の ref
  const editorInstanceRef = useRef<EditorInstance>({
    getContent: () => editorContentRef.current,

    setHighlights: (highlights) => {
      // 現在のマッチを TextArea の選択範囲で表示
      const currentMatch = highlights.find((h) => h.isCurrent);
      if (currentMatch && textAreaRef.current) {
        const charPosition = calculateCharPosition(
          editorContentRef.current,
          currentMatch.line,
          currentMatch.column,
        );
        textAreaRef.current.setSelectionRange(
          charPosition,
          charPosition + currentMatch.length,
        );
      }
    },

    getHighlights: () => [],

    scrollToLine: (line, column) => {
      if (!textAreaRef.current) return;
      const lineHeight = estimateLineHeight(textAreaRef.current);
      const targetScrollTop = (line - 1) * lineHeight - lineHeight * 3;
      textAreaRef.current.scrollTop = Math.max(0, targetScrollTop);

      if (column !== undefined) {
        const charPosition = calculateCharPosition(
          editorContentRef.current,
          line,
          column,
        );
        textAreaRef.current.setSelectionRange(charPosition, charPosition);
      }
    },

    getCursorPosition: () => {
      if (!textAreaRef.current) return { line: 1, column: 1 };
      const position = textAreaRef.current.selectionStart;
      return calculateLineColumn(editorContentRef.current, position);
    },

    setCursorPosition: (line, column) => {
      if (!textAreaRef.current) return;
      const charPosition = calculateCharPosition(
        editorContentRef.current,
        line,
        column,
      );
      textAreaRef.current.setSelectionRange(charPosition, charPosition);
    },

    replaceText: (line, column, length, replacement) => {
      const content = editorContentRef.current;
      const charPosition = calculateCharPosition(content, line, column);
      const newContent =
        content.substring(0, charPosition) +
        replacement +
        content.substring(charPosition + length);
      setEditorContent(newContent);
    },

    replaceAllText: (matches, replacement) => {
      // 後方から置換（位置ずれ防止）
      const sortedMatches = [...matches].sort((a, b) => {
        if (a.line !== b.line) return b.line - a.line;
        return b.column - a.column;
      });

      let content = editorContentRef.current;
      for (const match of sortedMatches) {
        const charPosition = calculateCharPosition(
          content,
          match.line,
          match.column,
        );
        content =
          content.substring(0, charPosition) +
          replacement +
          content.substring(charPosition + match.length);
      }
      setEditorContent(content);
    },

    focus: () => {
      textAreaRef.current?.focus();
    },
  });

  return { editorInstanceRef };
}
```

### 2.4 ヘルパー関数

```typescript
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
  return position + column - 1;
}

function calculateLineColumn(
  content: string,
  position: number,
): { line: number; column: number } {
  const lines = content.split("\n");
  let currentPos = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineEnd = currentPos + lines[i].length;
    if (position <= lineEnd) {
      return { line: i + 1, column: position - currentPos + 1 };
    }
    currentPos = lineEnd + 1;
  }
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

function estimateLineHeight(textArea: HTMLTextAreaElement): number {
  const computedStyle = window.getComputedStyle(textArea);
  const fontSize = parseFloat(computedStyle.fontSize) || 14;
  const lineHeight = parseFloat(computedStyle.lineHeight);
  return isNaN(lineHeight) ? fontSize * 1.5 : lineHeight;
}
```

---

## 3. useWorkspaceSearch

### 3.1 目的

ワークスペース検索の IPC 通信をカプセル化し、WorkspaceSearchPanel に検索プロバイダを提供する。

### 3.2 インターフェース

```typescript
type SearchProvider = (
  workspacePath: string,
  query: string,
  options: SearchProviderOptions,
) => AsyncGenerator<FileSearchResult>;

interface SearchProviderOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
  includePattern?: string;
  excludePattern?: string;
}

interface FileSearchResult {
  filePath: string;
  matches: SearchMatch[];
}

function useWorkspaceSearch(): SearchProvider;
```

### 3.3 実装設計

```typescript
export function useWorkspaceSearch(): SearchProvider {
  const workspaceSearchProvider = useCallback(async function* (
    wsPath: string,
    query: string,
    options: SearchProviderOptions,
  ): AsyncGenerator<FileSearchResult> {
    // IPC 経由でワークスペース検索を実行
    const response = await window.electronAPI.search.executeWorkspace({
      rootPath: wsPath,
      query,
      options: {
        caseSensitive: options.caseSensitive,
        wholeWord: options.wholeWord,
        useRegex: options.useRegex,
      },
      includePattern: options.includePattern,
      excludePatterns: options.excludePattern
        ? [options.excludePattern]
        : undefined,
    });

    if (!response.success || !response.data?.matches) {
      return;
    }

    // マッチをファイルごとにグループ化
    const fileMap = new Map<string, SearchMatch[]>();

    for (const match of response.data.matches) {
      const existingMatches = fileMap.get(match.filePath) || [];
      existingMatches.push({
        line: match.line,
        column: match.column,
        length: match.matchText.length,
        text: match.matchText,
        lineText: match.lineText,
      });
      fileMap.set(match.filePath, existingMatches);
    }

    // ファイルごとに結果を yield
    for (const [filePath, matches] of fileMap) {
      yield { filePath, matches };
    }
  }, []);

  return workspaceSearchProvider;
}
```

### 3.4 IPC 通信仕様

```typescript
// Request
interface WorkspaceSearchRequest {
  rootPath: string;
  query: string;
  options: {
    caseSensitive: boolean;
    wholeWord: boolean;
    useRegex: boolean;
  };
  includePattern?: string;
  excludePatterns?: string[];
}

// Response
interface WorkspaceSearchResponse {
  success: boolean;
  data?: {
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

---

## 4. useSearchKeyboardShortcuts

### 4.1 目的

検索パネルの開閉およびモード切替のキーボードショートカットを管理する。

### 4.2 インターフェース

```typescript
type SearchMode = "file" | "workspace" | "filename";

interface UseSearchKeyboardShortcutsOptions {
  isSearchPanelOpen: boolean;
  searchMode: SearchMode;
  selectedFilePath: string | null;
  searchPanelRef: React.RefObject<HTMLElement>;
  setSearchMode: (mode: SearchMode) => void;
  setShowReplace: (show: boolean) => void;
  setIsSearchPanelOpen: (open: boolean) => void;
}

function useSearchKeyboardShortcuts(
  options: UseSearchKeyboardShortcutsOptions,
): void;
```

### 4.3 実装設計

```typescript
export function useSearchKeyboardShortcuts({
  isSearchPanelOpen,
  searchMode,
  selectedFilePath,
  searchPanelRef,
  setSearchMode,
  setShowReplace,
  setIsSearchPanelOpen,
}: UseSearchKeyboardShortcutsOptions): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modKey = isMac ? event.metaKey : event.ctrlKey;

      // Cmd+F / Ctrl+F: ファイル内検索
      if (modKey && event.key === "f" && !event.shiftKey) {
        event.preventDefault();
        if (selectedFilePath) {
          setSearchMode("file");
          setIsSearchPanelOpen(true);
        }
        return;
      }

      // Cmd+Shift+F / Ctrl+Shift+F: ワークスペース検索
      if (modKey && event.key === "f" && event.shiftKey) {
        event.preventDefault();
        setSearchMode("workspace");
        setIsSearchPanelOpen(true);
        return;
      }

      // Cmd+P / Ctrl+P: ファイル名検索
      if (modKey && event.key === "p" && !event.shiftKey) {
        event.preventDefault();
        setSearchMode("filename");
        setIsSearchPanelOpen(true);
        return;
      }

      // Cmd+T / Ctrl+T: 置換モード（ファイル内検索時）
      if (modKey && event.key === "t" && !event.shiftKey) {
        event.preventDefault();
        if (selectedFilePath && !isSearchPanelOpen) {
          setSearchMode("file");
          setShowReplace(true);
          setIsSearchPanelOpen(true);
        } else if (isSearchPanelOpen && searchMode === "file") {
          setShowReplace(true);
        }
        return;
      }

      // Cmd+Shift+T / Ctrl+Shift+T: 置換モード（ワークスペース検索時）
      if (modKey && event.key === "t" && event.shiftKey) {
        event.preventDefault();
        if (!isSearchPanelOpen) {
          setSearchMode("workspace");
          setShowReplace(true);
          setIsSearchPanelOpen(true);
        } else if (searchMode === "workspace") {
          setShowReplace(true);
        }
        return;
      }

      // Escape: パネルを閉じる
      if (event.key === "Escape" && isSearchPanelOpen) {
        event.preventDefault();
        setIsSearchPanelOpen(false);
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    isSearchPanelOpen,
    searchMode,
    selectedFilePath,
    setSearchMode,
    setShowReplace,
    setIsSearchPanelOpen,
  ]);
}
```

### 4.4 ショートカット一覧

| ショートカット               | macOS         | Windows/Linux  | 条件           | アクション                 |
| ---------------------------- | ------------- | -------------- | -------------- | -------------------------- |
| ファイル内検索               | `Cmd+F`       | `Ctrl+F`       | ファイル選択時 | file モード + open         |
| ワークスペース検索           | `Cmd+Shift+F` | `Ctrl+Shift+F` | 常時           | workspace モード + open    |
| ファイル名検索               | `Cmd+P`       | `Ctrl+P`       | 常時           | filename モード + open     |
| 置換モード（ファイル）       | `Cmd+T`       | `Ctrl+T`       | ファイル選択時 | file + replace + open      |
| 置換モード（ワークスペース） | `Cmd+Shift+T` | `Ctrl+Shift+T` | 常時           | workspace + replace + open |
| 閉じる                       | `Escape`      | `Escape`       | パネル開時     | close                      |

---

## 5. フック間の依存関係

```
┌───────────────────────────────────────┐
│              EditorView               │
├───────────────────────────────────────┤
│                                       │
│   ┌─────────────────────────────────┐ │
│   │  useSearchKeyboardShortcuts     │ │
│   │  ・パネル開閉制御               │ │
│   │  ・モード切替制御               │ │
│   └─────────────────────────────────┘ │
│              │                        │
│              ▼                        │
│   ┌─────────────────────────────────┐ │
│   │       isSearchPanelOpen         │ │
│   │       searchMode                │ │
│   │       showReplace               │ │
│   └─────────────────────────────────┘ │
│              │                        │
│    ┌─────────┴─────────┐              │
│    ▼                   ▼              │
│ SearchPanel      WorkspaceSearchPanel │
│    │                   │              │
│    ▼                   ▼              │
│ useEditorInstance  useWorkspaceSearch │
└───────────────────────────────────────┘
```

---

## 6. 実装状況

### 既存実装

| ファイル                                                                         | ステータス |
| -------------------------------------------------------------------------------- | ---------- |
| `apps/desktop/src/renderer/views/EditorView/hooks/useEditorInstance.ts`          | 実装済み   |
| `apps/desktop/src/renderer/views/EditorView/hooks/useWorkspaceSearch.ts`         | 実装済み   |
| `apps/desktop/src/renderer/views/EditorView/hooks/useSearchKeyboardShortcuts.ts` | 実装済み   |
| `apps/desktop/src/renderer/views/EditorView/hooks/index.ts`                      | 実装済み   |

---

## 完了条件チェック

- [x] useEditorInstance インターフェース設計完了
- [x] useWorkspaceSearch インターフェース設計完了
- [x] useSearchKeyboardShortcuts インターフェース設計完了
- [x] フック間の依存関係が明確化されている
- [x] ショートカット一覧が文書化されている
