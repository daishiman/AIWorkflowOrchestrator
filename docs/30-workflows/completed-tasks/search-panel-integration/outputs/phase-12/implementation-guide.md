# 検索パネル EditorView 統合 実装ガイド

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| 作成日     | 2026-01-22                |
| タスクID   | TASK-SEARCH-INTEGRATE-001 |
| フェーズ   | Phase 12                  |
| 成果物種別 | 実装ガイド                |
| ステータス | 完了                      |
| 関連Issue  | #361                      |

---

# Part 1: 概念的説明（ユーザー向け）

## 1. 検索パネル統合の概要

### 1.1 機能概要

EditorViewに統合された検索パネルは、以下の2つの検索モードを提供します：

1. **ファイル内検索（SearchPanel）**
   - 現在開いているファイル内でテキストを検索・置換
   - リアルタイムハイライト表示
   - 検索オプション（大文字小文字区別、単語単位、正規表現）

2. **ワークスペース検索（WorkspaceSearchPanel）**
   - プロジェクト全体からテキストを検索
   - ファイル名とマッチ行のプレビュー
   - クリックで該当ファイル・行にジャンプ

### 1.2 機能の使い方

#### ファイル内検索

1. **検索を開く**: `Cmd+F`（Mac）/ `Ctrl+F`（Windows/Linux）
2. **検索クエリ入力**: テキストボックスに検索したい文字列を入力
3. **検索実行**: `Enter`キーで次のマッチへ移動
4. **検索終了**: `Escape`キーでパネルを閉じる

#### 検索オプション

| アイコン | 機能               | 説明                           |
| -------- | ------------------ | ------------------------------ |
| Aa       | 大文字小文字を区別 | ONで大文字小文字を区別して検索 |
| Ab       | 単語単位           | ONで単語の完全一致のみ検索     |
| .\*      | 正規表現           | ONで正規表現パターンを使用     |

#### 置換機能

1. **置換モードを開く**: `Cmd+H`（Mac）/ `Ctrl+H`（Windows/Linux）
2. **置換文字列入力**: 置換後のテキストを入力
3. **単一置換**: 「置換」ボタンで現在のマッチを置換
4. **全置換**: 「すべて置換」ボタンで全マッチを置換

### 1.3 キーボードショートカット一覧

| ショートカット         | 機能                           |
| ---------------------- | ------------------------------ |
| `Cmd/Ctrl + F`         | ファイル内検索パネルを開く     |
| `Cmd/Ctrl + Shift + F` | ワークスペース検索パネルを開く |
| `Cmd/Ctrl + H`         | 置換モードを開く               |
| `Enter`                | 次のマッチへ移動               |
| `Shift + Enter`        | 前のマッチへ移動               |
| `Escape`               | 検索パネルを閉じる             |

---

# Part 2: 技術的詳細（開発者向け）

## 2. アーキテクチャ

### 2.1 コンポーネント構成図

```
EditorView/
├── index.tsx                       # メインコンポーネント
│   ├── TextArea (ref)              # エディタ本体
│   ├── SearchPanel                 # ファイル内検索UI
│   ├── WorkspaceSearchPanel        # ワークスペース検索UI
│   └── useSearchKeyboardShortcuts  # キーボードショートカット
│
├── hooks/
│   ├── useEditorInstance.ts        # EditorInstance 生成
│   ├── useWorkspaceSearch.ts       # ワークスペース検索ロジック
│   └── useSearchKeyboardShortcuts.ts # ショートカット制御
│
└── adapters/
    └── TextAreaEditorAdapter.ts    # EditorInstance 実装

features/search/
├── components/
│   ├── SearchPanel.tsx             # ファイル内検索パネル
│   └── WorkspaceSearchPanel.tsx    # ワークスペース検索パネル
│
├── adapters/
│   └── TextAreaEditorAdapter.ts    # EditorInstance アダプター
│
├── utils/
│   ├── executeSearch.ts            # 検索ロジック
│   └── highlightUtils.tsx          # ハイライトユーティリティ
│
└── stores/
    └── useSearchStore.ts           # 検索状態管理（Zustand）
```

### 2.2 データフロー

```
[User Input]
     │
     ▼
[useSearchKeyboardShortcuts]
     │ Cmd+F / Cmd+Shift+F / Cmd+H
     ▼
[SearchPanel / WorkspaceSearchPanel]
     │ searchQuery
     ▼
[executeSearch]
     │ matches: SearchMatch[]
     ▼
[EditorInstance.setHighlights]
     │
     ▼
[TextAreaEditorAdapter]
     │ highlights state
     ▼
[UI Rendering]
```

## 3. EditorInstance インターフェース

### 3.1 インターフェース定義

```typescript
interface EditorInstance {
  // コンテンツ操作
  getContent(): string;
  setContent(content: string): void;
  insertText(text: string, position?: number): void;

  // 選択・カーソル
  getSelection(): { start: number; end: number };
  setSelection(start: number, end: number): void;
  getCursorPosition(): number;
  setCursorPosition(position: number): void;

  // ハイライト
  setHighlights(highlights: Highlight[]): void;
  clearHighlights(): void;

  // スクロール・フォーカス
  scrollToLine(line: number, column?: number): void;
  focus(): void;
}

interface Highlight {
  line: number;
  column: number;
  length: number;
  isCurrent?: boolean;
}
```

### 3.2 TextAreaEditorAdapter 実装

```typescript
// adapters/TextAreaEditorAdapter.ts
export class TextAreaEditorAdapter implements EditorInstance {
  private textareaRef: React.RefObject<HTMLTextAreaElement>;
  private highlightsState: Highlight[] = [];
  private onHighlightsChange?: (highlights: Highlight[]) => void;

  constructor(
    textareaRef: React.RefObject<HTMLTextAreaElement>,
    onHighlightsChange?: (highlights: Highlight[]) => void,
  ) {
    this.textareaRef = textareaRef;
    this.onHighlightsChange = onHighlightsChange;
  }

  getContent(): string {
    return this.textareaRef.current?.value ?? "";
  }

  setContent(content: string): void {
    if (this.textareaRef.current) {
      this.textareaRef.current.value = content;
    }
  }

  setHighlights(highlights: Highlight[]): void {
    this.highlightsState = highlights;
    this.onHighlightsChange?.(highlights);
  }

  scrollToLine(line: number, column?: number): void {
    const textarea = this.textareaRef.current;
    if (!textarea) return;

    const lines = textarea.value.split("\n");
    let charIndex = 0;
    for (let i = 0; i < line - 1 && i < lines.length; i++) {
      charIndex += lines[i].length + 1;
    }
    charIndex += column ?? 0;

    textarea.setSelectionRange(charIndex, charIndex);
    textarea.focus();
  }

  focus(): void {
    this.textareaRef.current?.focus();
  }
}
```

## 4. フックの使い方

### 4.1 useEditorInstance

EditorInstanceを生成するフック:

```typescript
import { useEditorInstance } from "./hooks/useEditorInstance";

function EditorView() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  const editorInstance = useEditorInstance(textareaRef, setHighlights);

  return (
    <>
      <textarea ref={textareaRef} />
      <SearchPanel editorRef={{ current: editorInstance }} />
    </>
  );
}
```

### 4.2 useSearchKeyboardShortcuts

キーボードショートカットを設定するフック:

```typescript
import { useSearchKeyboardShortcuts } from "./hooks/useSearchKeyboardShortcuts";

function EditorView() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWorkspaceSearchOpen, setIsWorkspaceSearchOpen] = useState(false);
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);

  useSearchKeyboardShortcuts({
    onOpenSearch: () => setIsSearchOpen(true),
    onOpenWorkspaceSearch: () => setIsWorkspaceSearchOpen(true),
    onOpenReplace: () => setIsReplaceOpen(true),
    onCloseSearch: () => {
      setIsSearchOpen(false);
      setIsWorkspaceSearchOpen(false);
      setIsReplaceOpen(false);
    },
  });

  // ...
}
```

### 4.3 useWorkspaceSearch

ワークスペース検索ロジックを提供するフック:

```typescript
import { useWorkspaceSearch } from "./hooks/useWorkspaceSearch";

function WorkspaceSearchIntegration() {
  const { results, isSearching, search, cancel } = useWorkspaceSearch();

  const handleSearch = async (query: string) => {
    await search(query, {
      caseSensitive: false,
      regex: false,
      wholeWord: false,
    });
  };

  return (
    <WorkspaceSearchPanel
      results={results}
      isSearching={isSearching}
      onSearch={handleSearch}
      onCancel={cancel}
    />
  );
}
```

## 5. カスタマイズ方法

### 5.1 カスタムエディタアダプター

別のエディタコンポーネントを使用する場合:

```typescript
class MonacoEditorAdapter implements EditorInstance {
  private editor: monaco.editor.IStandaloneCodeEditor;

  constructor(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
  }

  getContent(): string {
    return this.editor.getValue();
  }

  setContent(content: string): void {
    this.editor.setValue(content);
  }

  setHighlights(highlights: Highlight[]): void {
    // Monaco Editor のデコレーションAPIを使用
    const decorations = highlights.map((h) => ({
      range: new monaco.Range(h.line, h.column, h.line, h.column + h.length),
      options: {
        className: h.isCurrent ? "current-match" : "search-match",
      },
    }));
    this.editor.deltaDecorations([], decorations);
  }

  // ... 他のメソッド
}
```

### 5.2 検索オプションのカスタマイズ

```typescript
import { executeSearch, SearchOptions } from "../utils/executeSearch";

const customOptions: SearchOptions = {
  caseSensitive: true,
  wholeWord: true,
  regex: false,
};

const { matches, error } = executeSearch(content, query, customOptions);
```

### 5.3 検索結果の表示カスタマイズ

```typescript
import { createHighlights } from "../utils/highlightUtils";

// カスタムハイライトスタイル
const customHighlights = matches.map((match, index) => ({
  line: match.line,
  column: match.column,
  length: match.length,
  isCurrent: index === currentIndex,
  className: "custom-highlight-class", // 拡張プロパティ
}));
```

## 6. テスト

### 6.1 テストファイル構成

```
__tests__/
├── integration/
│   ├── EditorViewIntegration.test.tsx    # EditorView 統合テスト
│   ├── KeyboardShortcuts.test.tsx        # ショートカットテスト
│   ├── SearchPanelAdapter.test.tsx       # アダプターテスト
│   ├── WorkspaceSearchIntegration.test.tsx # ワークスペース検索テスト
│   ├── EdgeCases.test.tsx                # エッジケーステスト
│   ├── Accessibility.test.tsx            # アクセシビリティテスト
│   ├── Performance.test.tsx              # パフォーマンステスト
│   └── ErrorHandling.test.tsx            # エラーハンドリングテスト
│
└── unit/
    ├── TextAreaEditorAdapter.test.ts     # アダプター単体テスト
    ├── useSearchStore.test.ts            # ストアテスト
    └── useSearchKeyboardShortcuts.test.ts # フックテスト
```

### 6.2 テスト実行

```bash
# 検索機能のテストのみ実行
pnpm vitest run src/features/search/

# カバレッジ付きで実行
pnpm vitest run src/features/search/ --coverage
```

### 6.3 テスト結果

| 指標              | 値     |
| ----------------- | ------ |
| テスト合計数      | 275    |
| 合格率            | 100%   |
| Line Coverage     | 97.08% |
| Branch Coverage   | 90.13% |
| Function Coverage | 92%    |

---

## 7. 既知の制限

| 項目                         | 説明                                 | 影響度 |
| ---------------------------- | ------------------------------------ | ------ |
| worktree環境のモジュール解決 | @repo/shared参照がworktreeで失敗     | 低     |
| 正規表現エラー表示           | 一部ケースで「結果なし」と表示される | 低     |

---

## 8. 関連資料

| 資料             | パス                                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| 機能要件         | `outputs/phase-1/functional-requirements.md`                              |
| 設計書           | `outputs/phase-2/`                                                        |
| 品質レポート     | `outputs/phase-9/quality-report.md`                                       |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                                 |
| 検索パネルUI仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md` |
