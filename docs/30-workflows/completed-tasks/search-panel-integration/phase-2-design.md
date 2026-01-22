# Phase 2: 設計 - 検索パネル EditorView 統合

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| フェーズ   | Phase 2                                        |
| 名称       | 設計                                           |
| 目的       | アダプターパターンを用いた EditorView 統合設計 |
| 前提Phase  | Phase 1: 要件定義                              |
| 次Phase    | Phase 3: 設計レビューゲート                    |
| ステータス | 未実施                                         |

---

## 目的

Phase 1 で定義した要件に基づき、アダプターパターンを用いて SearchPanel を EditorView に統合するための詳細設計を行う。

---

## 実行タスク

### Task 1: アーキテクチャ設計

**目的**: EditorView 統合の全体アーキテクチャを設計する

**実行内容**:

1. 統合アーキテクチャ図の作成

```
┌─────────────────────────────────────────────────────┐
│ EditorView                                          │
│ ┌─────────────────┐   ┌─────────────────────┐      │
│ │ SearchPanel     │◀──│ TextAreaEditorAdapter│      │
│ │ (Phase 5)       │   │ (EditorInstance)    │      │
│ └─────────────────┘   └──────────┬──────────┘      │
│                                  │                  │
│ ┌─────────────────┐   ┌──────────▼──────────┐      │
│ │WorkspaceSearch  │◀──│ useWorkspaceSearch  │      │
│ │Panel (Phase 5)  │   │ (Provider)          │      │
│ └─────────────────┘   └─────────────────────┘      │
│                                                     │
│ ┌─────────────────────────────────────────────┐    │
│ │ useSearchKeyboardShortcuts                   │    │
│ │ (キーボードショートカット管理)               │    │
│ └─────────────────────────────────────────────┘    │
│                                                     │
│ ┌─────────────────────────────────────────────┐    │
│ │ TextArea (既存エディタ)                      │    │
│ └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

2. コンポーネント責務の定義

| コンポーネント             | 責務                                |
| -------------------------- | ----------------------------------- |
| SearchPanel                | ファイル内検索UI（Phase 5実装）     |
| WorkspaceSearchPanel       | ワークスペース検索UI（Phase 5実装） |
| TextAreaEditorAdapter      | TextArea を EditorInstance に適合   |
| useWorkspaceSearch         | ワークスペース検索プロバイダ        |
| useSearchKeyboardShortcuts | キーボードショートカット管理        |
| useEditorInstance          | EditorInstance アダプターのフック   |

**完了条件**:

- [ ] 統合アーキテクチャ図が作成されている
- [ ] 各コンポーネントの責務が明確に定義されている

### Task 2: EditorInstance アダプター設計

**目的**: TextArea を EditorInstance インターフェースに適合させるアダプターを設計する

**実行内容**:

1. EditorInstance インターフェース定義

```typescript
interface EditorInstance {
  // コンテンツ操作
  getContent: () => string;
  setContent: (content: string) => void;

  // ハイライト管理
  setHighlights: (matches: SearchMatch[]) => void;
  getHighlights: () => SearchMatch[];
  clearHighlights: () => void;

  // カーソル・スクロール
  scrollToLine: (line: number, column?: number) => void;
  getCursorPosition: () => { line: number; column: number };
  setCursorPosition: (line: number, column: number) => void;

  // テキスト置換
  replaceText: (
    line: number,
    column: number,
    length: number,
    replacement: string,
  ) => void;
  replaceAllText: (matches: SearchMatch[], replacement: string) => void;

  // フォーカス管理
  focus: () => void;
}
```

2. TextAreaEditorAdapter 実装設計

```typescript
class TextAreaEditorAdapter implements EditorInstance {
  private textAreaRef: RefObject<HTMLTextAreaElement>;
  private contentGetter: () => string;
  private contentSetter: (content: string) => void;
  private highlightState: SearchMatch[];

  constructor(options: TextAreaEditorAdapterOptions) {
    // 初期化
  }

  // EditorInstance メソッド実装
}
```

**完了条件**:

- [ ] EditorInstance インターフェースが定義されている
- [ ] TextAreaEditorAdapter の設計が完了している
- [ ] 設計が `outputs/phase-2/adapter-design.md` に文書化されている

### Task 3: 統合フック設計

**目的**: EditorView での統合に必要なカスタムフックを設計する

**実行内容**:

1. useEditorInstance フック設計

```typescript
function useEditorInstance(options: {
  textAreaRef: RefObject<HTMLTextAreaElement>;
  content: string;
  setContent: (content: string) => void;
}): {
  editorInstanceRef: RefObject<EditorInstance>;
};
```

2. useWorkspaceSearch フック設計

```typescript
function useWorkspaceSearch(): WorkspaceSearchProvider;

type WorkspaceSearchProvider = (
  wsPath: string,
  query: string,
  options: SearchProviderOptions,
) => AsyncGenerator<FileSearchResult>;
```

3. useSearchKeyboardShortcuts フック設計

```typescript
function useSearchKeyboardShortcuts(options: {
  isSearchPanelOpen: boolean;
  searchMode: SearchMode;
  selectedFilePath: string | null;
  searchPanelRef: RefObject<HTMLElement>;
  setSearchMode: (mode: SearchMode) => void;
  setShowReplace: (show: boolean) => void;
  setIsSearchPanelOpen: (open: boolean) => void;
}): void;
```

**完了条件**:

- [ ] 各フックのインターフェースが定義されている
- [ ] フック間の依存関係が明確化されている
- [ ] 設計が `outputs/phase-2/hooks-design.md` に文書化されている

### Task 4: EditorView 統合設計

**目的**: EditorView コンポーネントの更新設計を行う

**実行内容**:

1. EditorView 更新箇所の特定
   - 検索パネル表示領域の追加
   - 状態管理の追加
   - フックの統合

2. 統合コード設計

```typescript
function EditorView() {
  // 1. 検索状態管理
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>('file');
  const [showReplace, setShowReplace] = useState(false);

  // 2. エディタアダプター
  const { editorInstanceRef } = useEditorInstance({
    textAreaRef,
    content: editorContent,
    setContent: setEditorContent,
  });

  // 3. 検索プロバイダ
  const workspaceSearchProvider = useWorkspaceSearch();

  // 4. キーボードショートカット
  useSearchKeyboardShortcuts({
    isSearchPanelOpen,
    searchMode,
    selectedFilePath,
    searchPanelRef,
    setSearchMode,
    setShowReplace,
    setIsSearchPanelOpen,
  });

  // 5. レンダリング
  return (
    <>
      {/* 既存コンテンツ */}

      {/* 検索パネル */}
      {isSearchPanelOpen && searchMode === 'file' && (
        <SearchPanel
          editorRef={editorInstanceRef}
          showReplace={showReplace}
          onClose={() => setIsSearchPanelOpen(false)}
        />
      )}
      {isSearchPanelOpen && searchMode === 'workspace' && (
        <WorkspaceSearchPanel
          searchProvider={workspaceSearchProvider}
          showReplace={showReplace}
          onClose={() => setIsSearchPanelOpen(false)}
        />
      )}
    </>
  );
}
```

**完了条件**:

- [ ] EditorView の更新設計が完了している
- [ ] 既存機能との競合がないことが確認されている
- [ ] 設計が `outputs/phase-2/editorview-integration-design.md` に文書化されている

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                       | 内容                   |
| ------------------ | -------------------------------------------------------------------------- | ---------------------- |
| 検索パネルUI設計   | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`  | EditorInstance設計参照 |
| Search Service API | `.claude/skills/aiworkflow-requirements/references/api-internal-search.md` | 検索API設計参照        |

### Phase 1 成果物

| 参照資料       | パス                                          |
| -------------- | --------------------------------------------- |
| 機能要件定義書 | `outputs/phase-1/functional-requirements.md`  |
| 統合要件定義書 | `outputs/phase-1/integration-requirements.md` |

---

## 成果物

| 成果物               | パス                                               |
| -------------------- | -------------------------------------------------- |
| アダプター設計書     | `outputs/phase-2/adapter-design.md`                |
| フック設計書         | `outputs/phase-2/hooks-design.md`                  |
| EditorView統合設計書 | `outputs/phase-2/editorview-integration-design.md` |
| コンポーネント構成図 | `outputs/phase-2/component-diagram.md`             |

---

## 完了条件

- [ ] EditorInstance アダプター設計が完了している
- [ ] 統合フックの設計が完了している
- [ ] EditorView の更新設計が完了している
- [ ] 全ての設計が文書化されている
- [ ] Phase 5 実装との整合性が確認されている

---

## 次のPhaseへの引き継ぎ

Phase 3（設計レビューゲート）では、本Phaseで作成した設計の妥当性を検証:

- 要件との整合性確認
- Phase 5 実装との整合性確認
- 設計の実現可能性確認
