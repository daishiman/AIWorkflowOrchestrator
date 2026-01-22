# Phase 5: 実装 - 検索パネル EditorView 統合

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| フェーズ   | Phase 5                     |
| 名称       | 実装                        |
| 目的       | TDD Green: テストを通す実装 |
| 前提Phase  | Phase 4: テスト作成         |
| 次Phase    | Phase 6: テスト拡充         |
| ステータス | 未実施                      |

---

## 目的

Phase 4 で作成した統合テストを全て通す実装を行う。アダプターパターンを用いて Phase 5 の SearchPanel を EditorView に統合する。

---

## 実行タスク

### Task 1: TextAreaEditorAdapter の実装

**目的**: TextArea を EditorInstance インターフェースに適合させる

**実行内容**:

1. アダプタークラスの実装

```typescript
// apps/desktop/src/features/search/adapters/TextAreaEditorAdapter.ts

import { RefObject } from "react";
import { EditorInstance, SearchMatch } from "../types";

export interface TextAreaEditorAdapterOptions {
  textAreaRef: RefObject<HTMLTextAreaElement>;
  getContent: () => string;
  setContent: (content: string) => void;
}

export class TextAreaEditorAdapter implements EditorInstance {
  private textAreaRef: RefObject<HTMLTextAreaElement>;
  private contentGetter: () => string;
  private contentSetter: (content: string) => void;
  private highlights: SearchMatch[] = [];

  constructor(options: TextAreaEditorAdapterOptions) {
    this.textAreaRef = options.textAreaRef;
    this.contentGetter = options.getContent;
    this.contentSetter = options.setContent;
  }

  getContent(): string {
    return this.contentGetter();
  }

  setContent(content: string): void {
    this.contentSetter(content);
  }

  setHighlights(matches: SearchMatch[]): void {
    this.highlights = matches;
    // ハイライト表示の実装
  }

  getHighlights(): SearchMatch[] {
    return this.highlights;
  }

  clearHighlights(): void {
    this.highlights = [];
  }

  scrollToLine(line: number, column?: number): void {
    const textArea = this.textAreaRef.current;
    if (!textArea) return;

    const content = this.getContent();
    const lines = content.split("\n");
    let position = 0;
    for (let i = 0; i < line - 1 && i < lines.length; i++) {
      position += lines[i].length + 1;
    }
    if (column) {
      position += column - 1;
    }

    textArea.focus();
    textArea.setSelectionRange(position, position);
    // スクロール位置の調整
  }

  getCursorPosition(): { line: number; column: number } {
    const textArea = this.textAreaRef.current;
    if (!textArea) return { line: 1, column: 1 };

    const content = this.getContent();
    const position = textArea.selectionStart;
    const textBeforeCursor = content.substring(0, position);
    const lines = textBeforeCursor.split("\n");

    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
    };
  }

  setCursorPosition(line: number, column: number): void {
    this.scrollToLine(line, column);
  }

  replaceText(
    line: number,
    column: number,
    length: number,
    replacement: string,
  ): void {
    const content = this.getContent();
    const lines = content.split("\n");
    let position = 0;
    for (let i = 0; i < line - 1 && i < lines.length; i++) {
      position += lines[i].length + 1;
    }
    position += column - 1;

    const newContent =
      content.substring(0, position) +
      replacement +
      content.substring(position + length);
    this.setContent(newContent);
  }

  replaceAllText(matches: SearchMatch[], replacement: string): void {
    let content = this.getContent();
    // 後ろから置換してインデックスがずれないようにする
    const sortedMatches = [...matches].sort((a, b) => {
      if (a.line !== b.line) return b.line - a.line;
      return b.column - a.column;
    });

    for (const match of sortedMatches) {
      this.replaceText(match.line, match.column, match.length, replacement);
      content = this.getContent();
    }
  }

  focus(): void {
    this.textAreaRef.current?.focus();
  }
}
```

**完了条件**:

- [ ] TextAreaEditorAdapter が実装されている
- [ ] EditorInstance インターフェースの全メソッドが実装されている
- [ ] アダプターテストが全て合格する

### Task 2: useEditorInstance フックの実装

**目的**: EditorInstance アダプターを React フックとして提供する

**実行内容**:

```typescript
// apps/desktop/src/renderer/views/EditorView/hooks/useEditorInstance.ts

import { useRef, useEffect } from "react";
import { TextAreaEditorAdapter } from "@/features/search/adapters/TextAreaEditorAdapter";
import type { EditorInstance } from "@/features/search/types";

interface UseEditorInstanceOptions {
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  content: string;
  setContent: (content: string) => void;
}

export function useEditorInstance(options: UseEditorInstanceOptions) {
  const editorInstanceRef = useRef<EditorInstance | null>(null);

  useEffect(() => {
    editorInstanceRef.current = new TextAreaEditorAdapter({
      textAreaRef: options.textAreaRef,
      getContent: () => options.content,
      setContent: options.setContent,
    });
  }, [options.textAreaRef, options.content, options.setContent]);

  return { editorInstanceRef };
}
```

**完了条件**:

- [ ] useEditorInstance フックが実装されている
- [ ] フックが EditorInstance を正しく提供する

### Task 3: useWorkspaceSearch フックの実装

**目的**: ワークスペース検索プロバイダを提供する

**実行内容**:

```typescript
// apps/desktop/src/renderer/views/EditorView/hooks/useWorkspaceSearch.ts

import { useCallback } from "react";
import type {
  WorkspaceSearchProvider,
  SearchProviderOptions,
  FileSearchResult,
} from "@/features/search/types";

export function useWorkspaceSearch(): WorkspaceSearchProvider {
  const searchProvider = useCallback(async function* (
    wsPath: string,
    query: string,
    options: SearchProviderOptions,
  ): AsyncGenerator<FileSearchResult> {
    // IPC 経由でワークスペース検索を実行
    const results = await window.electronAPI.searchInWorkspace(
      wsPath,
      query,
      options,
    );

    for (const result of results) {
      yield result;
    }
  }, []);

  return searchProvider;
}
```

**完了条件**:

- [ ] useWorkspaceSearch フックが実装されている
- [ ] IPC 経由でワークスペース検索が実行される

### Task 4: useSearchKeyboardShortcuts フックの実装

**目的**: キーボードショートカットを EditorView に統合する

**実行内容**:

```typescript
// apps/desktop/src/renderer/views/EditorView/hooks/useSearchKeyboardShortcuts.ts

import { useEffect } from "react";
import type { SearchMode } from "@/features/search/types";

interface UseSearchKeyboardShortcutsOptions {
  isSearchPanelOpen: boolean;
  searchMode: SearchMode;
  selectedFilePath: string | null;
  searchPanelRef: React.RefObject<HTMLElement>;
  setSearchMode: (mode: SearchMode) => void;
  setShowReplace: (show: boolean) => void;
  setIsSearchPanelOpen: (open: boolean) => void;
}

export function useSearchKeyboardShortcuts(
  options: UseSearchKeyboardShortcutsOptions,
) {
  const {
    isSearchPanelOpen,
    setSearchMode,
    setShowReplace,
    setIsSearchPanelOpen,
  } = options;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      // Cmd+F / Ctrl+F: ファイル内検索
      if (cmdKey && !e.shiftKey && e.key === "f") {
        e.preventDefault();
        setSearchMode("file");
        setShowReplace(false);
        setIsSearchPanelOpen(true);
      }

      // Cmd+T / Ctrl+T: ファイル内置換
      if (cmdKey && !e.shiftKey && e.key === "t") {
        e.preventDefault();
        setSearchMode("file");
        setShowReplace(true);
        setIsSearchPanelOpen(true);
      }

      // Cmd+Shift+F / Ctrl+Shift+F: ワークスペース検索
      if (cmdKey && e.shiftKey && e.key === "f") {
        e.preventDefault();
        setSearchMode("workspace");
        setShowReplace(false);
        setIsSearchPanelOpen(true);
      }

      // Cmd+Shift+T / Ctrl+Shift+T: ワークスペース置換
      if (cmdKey && e.shiftKey && e.key === "t") {
        e.preventDefault();
        setSearchMode("workspace");
        setShowReplace(true);
        setIsSearchPanelOpen(true);
      }

      // Escape: パネルを閉じる
      if (e.key === "Escape" && isSearchPanelOpen) {
        e.preventDefault();
        setIsSearchPanelOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchPanelOpen, setSearchMode, setShowReplace, setIsSearchPanelOpen]);
}
```

**完了条件**:

- [ ] useSearchKeyboardShortcuts フックが実装されている
- [ ] 全ショートカットが正しく動作する

### Task 5: EditorView への SearchPanel 統合

**目的**: EditorView コンポーネントに SearchPanel を統合する

**実行内容**:

EditorView コンポーネントを更新:

```typescript
// apps/desktop/src/renderer/views/EditorView/index.tsx

import { useState, useRef } from 'react';
import { SearchPanel, WorkspaceSearchPanel } from '@/features/search';
import { useEditorInstance } from './hooks/useEditorInstance';
import { useWorkspaceSearch } from './hooks/useWorkspaceSearch';
import { useSearchKeyboardShortcuts } from './hooks/useSearchKeyboardShortcuts';
import type { SearchMode } from '@/features/search/types';

export function EditorView() {
  // 既存の状態...
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [editorContent, setEditorContent] = useState('');

  // 検索状態
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>('file');
  const [showReplace, setShowReplace] = useState(false);
  const searchPanelRef = useRef<HTMLElement>(null);

  // エディタアダプター
  const { editorInstanceRef } = useEditorInstance({
    textAreaRef,
    content: editorContent,
    setContent: setEditorContent,
  });

  // ワークスペース検索プロバイダ
  const workspaceSearchProvider = useWorkspaceSearch();

  // キーボードショートカット
  useSearchKeyboardShortcuts({
    isSearchPanelOpen,
    searchMode,
    selectedFilePath,
    searchPanelRef,
    setSearchMode,
    setShowReplace,
    setIsSearchPanelOpen,
  });

  return (
    <div className="editor-view">
      {/* 既存のエディタコンテンツ */}
      <textarea
        ref={textAreaRef}
        value={editorContent}
        onChange={(e) => setEditorContent(e.target.value)}
      />

      {/* 検索パネル */}
      {isSearchPanelOpen && searchMode === 'file' && (
        <SearchPanel
          ref={searchPanelRef}
          editorRef={editorInstanceRef}
          showReplace={showReplace}
          onClose={() => setIsSearchPanelOpen(false)}
        />
      )}
      {isSearchPanelOpen && searchMode === 'workspace' && (
        <WorkspaceSearchPanel
          ref={searchPanelRef}
          searchProvider={workspaceSearchProvider}
          showReplace={showReplace}
          onClose={() => setIsSearchPanelOpen(false)}
        />
      )}
    </div>
  );
}
```

**完了条件**:

- [ ] EditorView が SearchPanel/WorkspaceSearchPanel を統合している
- [ ] Phase 4 の統合テストが全て合格する
- [ ] 既存テスト 94 件が全て合格する

---

## 参照資料

### Phase 2/4 成果物

| 参照資料         | パス                                                      |
| ---------------- | --------------------------------------------------------- |
| アダプター設計書 | `outputs/phase-2/adapter-design.md`                       |
| フック設計書     | `outputs/phase-2/hooks-design.md`                         |
| 統合テスト       | `apps/desktop/src/features/search/__tests__/integration/` |

### システム仕様

| 参照資料           | パス                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| 検索パネルUI設計   | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`  |
| Search Service API | `.claude/skills/aiworkflow-requirements/references/api-internal-search.md` |

---

## 成果物

| 成果物                     | パス                                                                             |
| -------------------------- | -------------------------------------------------------------------------------- |
| TextAreaEditorAdapter      | `apps/desktop/src/features/search/adapters/TextAreaEditorAdapter.ts`             |
| useEditorInstance          | `apps/desktop/src/renderer/views/EditorView/hooks/useEditorInstance.ts`          |
| useWorkspaceSearch         | `apps/desktop/src/renderer/views/EditorView/hooks/useWorkspaceSearch.ts`         |
| useSearchKeyboardShortcuts | `apps/desktop/src/renderer/views/EditorView/hooks/useSearchKeyboardShortcuts.ts` |
| 更新された EditorView      | `apps/desktop/src/renderer/views/EditorView/index.tsx`                           |
| 実装ログ                   | `outputs/phase-5/implementation-log.md`                                          |

---

## 完了条件

- [ ] TextAreaEditorAdapter が実装されている
- [ ] 統合フック（useEditorInstance, useWorkspaceSearch, useSearchKeyboardShortcuts）が実装されている
- [ ] EditorView に SearchPanel が統合されている
- [ ] Phase 4 の統合テストが全て合格する（TDD Green）
- [ ] 既存テスト 94 件が全て合格する
- [ ] TypeScript エラーが 0 件

---

## 次のPhaseへの引き継ぎ

Phase 6（テスト拡充）では、本Phaseの実装に対してカバレッジを向上させる追加テストを作成:

- エッジケーステスト
- 異常系テスト
- アクセシビリティテスト
