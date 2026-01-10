# エディタ統合パターン

## 概要

ElectronアプリケーションでTextArea・Monaco Editor・CodeMirrorなど複数のエディタ実装を
統一的に扱うための抽象化パターンを解説。検索・置換機能との統合も含む。

## EditorInstance インターフェース

### 抽象化パターン

異なるエディタ実装を統一APIで操作するためのインターフェース設計。

```typescript
/**
 * エディタ実装を抽象化するインターフェース
 * TextArea、Monaco、CodeMirrorなど異なるエディタを統一的に扱う
 */
export interface EditorInstance {
  /** エディタのテキスト内容を取得 */
  getContent: () => string;

  /** 指定位置にスクロールしてハイライト */
  scrollToLine: (line: number, column: number) => void;

  /** 現在のカーソル位置を取得 */
  getCursorPosition: () => { line: number; column: number };

  /** 指定位置のテキストを置換 */
  replaceText: (
    line: number,
    column: number,
    length: number,
    replacement: string
  ) => void;

  /** 複数マッチを一括置換 */
  replaceAllText: (
    matches: Array<{ line: number; column: number; length: number }>,
    replacement: string
  ) => void;

  /** エディタにフォーカス */
  focus: () => void;
}
```

### TextArea アダプター実装例

```typescript
// apps/desktop/src/features/search/adapters/TextAreaEditorAdapter.ts

export function createTextAreaEditorInstance(
  textAreaRef: React.RefObject<HTMLTextAreaElement>,
  contentRef: React.MutableRefObject<string>,
  setContent: (content: string) => void
): EditorInstance {
  const calculateCharPosition = (
    content: string,
    line: number,
    column: number
  ): number => {
    const lines = content.split("\n");
    let position = 0;
    for (let i = 0; i < line - 1 && i < lines.length; i++) {
      position += lines[i].length + 1; // +1 for newline
    }
    return position + (column - 1);
  };

  const calculateLineColumn = (
    content: string,
    position: number
  ): { line: number; column: number } => {
    const lines = content.substring(0, position).split("\n");
    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
    };
  };

  return {
    getContent: () => contentRef.current,

    scrollToLine: (line, column) => {
      const textArea = textAreaRef.current;
      if (!textArea) return;

      const position = calculateCharPosition(contentRef.current, line, column);
      textArea.focus();
      textArea.setSelectionRange(position, position);

      // スクロール位置計算（行高さベース）
      const lineHeight = 20;
      const scrollPosition = Math.max(0, (line - 5) * lineHeight);
      textArea.scrollTop = scrollPosition;
    },

    getCursorPosition: () => {
      const textArea = textAreaRef.current;
      if (!textArea) return { line: 1, column: 1 };
      return calculateLineColumn(contentRef.current, textArea.selectionStart);
    },

    replaceText: (line, column, length, replacement) => {
      const start = calculateCharPosition(contentRef.current, line, column);
      const newContent =
        contentRef.current.slice(0, start) +
        replacement +
        contentRef.current.slice(start + length);
      setContent(newContent);
    },

    replaceAllText: (matches, replacement) => {
      // 後ろから置換して位置ズレを防ぐ
      const sortedMatches = [...matches].sort((a, b) => {
        if (a.line !== b.line) return b.line - a.line;
        return b.column - a.column;
      });

      let newContent = contentRef.current;
      for (const match of sortedMatches) {
        const start = calculateCharPosition(newContent, match.line, match.column);
        newContent =
          newContent.slice(0, start) +
          replacement +
          newContent.slice(start + match.length);
      }
      setContent(newContent);
    },

    focus: () => textAreaRef.current?.focus(),
  };
}
```

## カスタムフック統合パターン

### useEditorInstance フック

EditorInstanceアダプターをReactフックとして提供。

```typescript
// apps/desktop/src/renderer/views/EditorView/hooks/useEditorInstance.ts

interface UseEditorInstanceOptions {
  textAreaRef: RefObject<HTMLTextAreaElement | null>;
  editorContent: string;
  setEditorContent: (content: string) => void;
}

interface UseEditorInstanceResult {
  editorInstanceRef: RefObject<EditorInstance>;
  editorContentRef: MutableRefObject<string>;
}

export function useEditorInstance({
  textAreaRef,
  editorContent,
  setEditorContent,
}: UseEditorInstanceOptions): UseEditorInstanceResult {
  const editorContentRef = useRef<string>(editorContent);

  // コンテンツ同期
  useEffect(() => {
    editorContentRef.current = editorContent;
  }, [editorContent]);

  const editorInstanceRef = useRef<EditorInstance>({
    getContent: () => editorContentRef.current,
    scrollToLine: (line, column) => {
      /* 実装 */
    },
    getCursorPosition: () => {
      /* 実装 */
    },
    replaceText: (line, column, length, replacement) => {
      /* 実装 */
    },
    replaceAllText: (matches, replacement) => {
      /* 実装 */
    },
    focus: () => textAreaRef.current?.focus(),
  });

  return { editorInstanceRef, editorContentRef };
}
```

## 検索プロバイダーパターン

### WorkspaceSearchProvider

Electron IPC経由のワークスペース検索を抽象化。

```typescript
// 型定義
export type WorkspaceSearchProvider = (
  workspacePath: string,
  query: string,
  options: SearchOptions
) => AsyncGenerator<FileSearchResult, void, unknown>;

// フック実装
export function useWorkspaceSearch(): WorkspaceSearchProvider {
  return useCallback(async function* (workspacePath, query, options) {
    // Electron IPC経由で検索実行
    const response = await window.electronAPI.search.executeWorkspace({
      workspacePath,
      query,
      options,
    });

    if (!response.success || !response.results) {
      return;
    }

    // ファイル単位でグループ化してyield
    const fileGroups = groupMatchesByFile(response.results);
    for (const group of fileGroups) {
      yield group;
    }
  }, []);
}
```

### AsyncGenerator活用

ストリーミング検索結果をReact UIに効率的に反映。

```typescript
// 検索結果を段階的に表示
async function handleSearch(query: string) {
  const generator = workspaceSearchProvider(workspacePath, query, options);

  for await (const fileResult of generator) {
    // ファイル単位で結果を追加（UI更新）
    dispatch(addSearchResult(fileResult));
  }
}
```

## キーボードショートカット統合

### useSearchKeyboardShortcuts フック

エディタとパネル間のキーボードショートカット管理。

```typescript
interface UseSearchKeyboardShortcutsOptions {
  searchPanelRef: RefObject<{ focus: () => void } | null>;
  workspaceSearchPanelRef: RefObject<{ focus: () => void } | null>;
  filenameSearchPanelRef: RefObject<{ focus: () => void } | null>;
  onToggleSearchPanel: () => void;
  onToggleFilenameSearch: () => void;
  onToggleWorkspaceSearch: () => void;
  onCloseAllPanels: () => void;
  onNavigateResult: (direction: "next" | "prev") => void;
}

export function useSearchKeyboardShortcuts(
  options: UseSearchKeyboardShortcutsOptions
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // Cmd+F: ファイル内検索
      if (isMod && e.key === "f" && !e.shiftKey) {
        e.preventDefault();
        options.onToggleSearchPanel();
        return;
      }

      // Cmd+Shift+F: ワークスペース検索
      if (isMod && e.key === "f" && e.shiftKey) {
        e.preventDefault();
        options.onToggleWorkspaceSearch();
        return;
      }

      // Cmd+T or Cmd+P: ファイル名検索
      if (isMod && (e.key === "t" || e.key === "p")) {
        e.preventDefault();
        options.onToggleFilenameSearch();
        return;
      }

      // F3: 次の検索結果
      if (e.key === "F3") {
        e.preventDefault();
        options.onNavigateResult(e.shiftKey ? "prev" : "next");
        return;
      }

      // Escape: パネルを閉じる
      if (e.key === "Escape") {
        options.onCloseAllPanels();
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [options]);
}
```

## テスト戦略

### EditorInstance モック

```typescript
// テスト用モック
export const createMockEditorInstance = (): EditorInstance => ({
  getContent: vi.fn(() => "test content"),
  scrollToLine: vi.fn(),
  getCursorPosition: vi.fn(() => ({ line: 1, column: 1 })),
  replaceText: vi.fn(),
  replaceAllText: vi.fn(),
  focus: vi.fn(),
});

// フックテスト
describe("useEditorInstance", () => {
  it("should return editor instance with all methods", () => {
    const { result } = renderHook(() =>
      useEditorInstance({
        textAreaRef: { current: document.createElement("textarea") },
        editorContent: "test",
        setEditorContent: vi.fn(),
      })
    );

    expect(result.current.editorInstanceRef.current).toBeDefined();
    expect(result.current.editorInstanceRef.current.getContent()).toBe("test");
  });
});
```

### IPC通信モック

```typescript
// Electron APIモック
vi.mock("@/preload", () => ({
  electronAPI: {
    search: {
      executeWorkspace: vi.fn().mockResolvedValue({
        success: true,
        results: [
          { file: "test.ts", line: 1, column: 1, match: "test" },
        ],
      }),
    },
  },
}));
```

## ベストプラクティス

### すべきこと

- **インターフェース抽象化**: エディタ実装を直接参照せず、EditorInstanceを経由
- **カスタムフック分離**: UIロジックとエディタ操作を分離
- **AsyncGenerator活用**: 大量検索結果のストリーミング
- **Ref同期**: contentRefでレンダリングとエディタ状態を同期
- **後ろから置換**: 複数置換時の位置ズレ防止

### 避けるべきこと

- **直接DOM操作**: Refを通さないtextArea操作
- **同期IPC**: 検索などの重い処理は非同期で
- **グローバルイベント漏れ**: useEffect内でcleanup忘れ
- **エディタ固有コード**: 抽象化レイヤーを通さない実装
