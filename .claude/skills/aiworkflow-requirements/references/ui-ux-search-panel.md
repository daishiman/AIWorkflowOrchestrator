# 検索・置換パネルUI設計

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

**親ドキュメント**: [ui-ux-panels.md](./ui-ux-panels.md)

## 概要

エディタの検索・置換機能は、UnifiedSearchPanelとして3つの検索モードを統合したパネルで提供する。

| モード    | 機能                                 | ユースケース                       |
| --------- | ------------------------------------ | ---------------------------------- |
| file      | 現在開いているファイル内の検索・置換 | 特定ファイル内のテキスト操作       |
| workspace | ワークスペース全体の検索・置換       | プロジェクト横断のリファクタリング |
| filename  | ファイル名による検索（置換なし）     | ファイルの素早いナビゲーション     |

---

## キーボードショートカット

| 操作               | macOS       | Windows/Linux | 備考                              |
| ------------------ | ----------- | ------------- | --------------------------------- |
| ファイル内検索     | Cmd+F       | Ctrl+F        | 検索パネルをfileモードで開く      |
| ファイル内置換     | Cmd+T       | Ctrl+T        | 置換行を表示した状態で開く        |
| ワークスペース検索 | Cmd+Shift+F | Ctrl+Shift+F  | 検索パネルをworkspaceモードで開く |
| ワークスペース置換 | Cmd+Shift+T | Ctrl+Shift+T  | 置換行を表示した状態で開く        |
| ファイル名検索     | Cmd+P       | Ctrl+P        | ファイル名モードで開く            |
| パネルを閉じる     | Escape      | Escape        | 全モード共通                      |
| 次の結果へ         | Enter / F3  | Enter / F3    | ファイル内検索時                  |
| 前の結果へ         | Shift+Enter | Shift+Enter   | ファイル内検索時                  |

---

## タブバー設計

| 要素             | 仕様                                  |
| ---------------- | ------------------------------------- |
| 配置             | パネル上部、水平方向に並べて表示      |
| アクティブ表示   | 下線（2px、blue-500）+ テキスト色変更 |
| 非アクティブ表示 | ボーダーなし、slate-400のテキスト色   |
| ホバー状態       | テキスト色をslate-300に変更           |
| 閉じるボタン     | タブバー右端に配置（×アイコン）       |

**タブ構成**:

| タブ           | アイコン      | ショートカット表示 | 置換モードサポート |
| -------------- | ------------- | ------------------ | ------------------ |
| ファイル内検索 | file-text     | ⌘F / ⌘T            | ○                  |
| 全体検索       | folder-search | ⌘⇧F / ⌘⇧T          | ○                  |
| ファイル名     | file          | ⌘P                 | ×                  |

**置換モード時の表示**:

- タブラベルが「検索」から「置換」に変更される
- 置換をサポートしないタブ（ファイル名）は非表示になる

---

## ファイル内検索パネル（FileSearchPanel）

### 検索行

| 要素           | 仕様                                |
| -------------- | ----------------------------------- |
| 検索入力       | プレースホルダー「検索 / Search」   |
| 結果カウント   | 「X / Y 件」形式（現在位置 / 総数） |
| 検索オプション | 3つのトグルボタン（後述）           |
| ナビゲーション | ↑↓ボタンで前後の結果に移動          |

### 検索オプションボタン

| ボタン           | ラベル | アイコン/表示 | 機能               |
| ---------------- | ------ | ------------- | ------------------ |
| 大文字小文字区別 | Aa     | テキスト      | Case Sensitive検索 |
| 単語単位         | Ab     | テキスト      | Whole Word検索     |
| 正規表現         | .\*    | テキスト      | Regex検索          |

**ボタン状態**:

| 状態   | 背景色    | テキスト色 |
| ------ | --------- | ---------- |
| 非選択 | 透明      | slate-400  |
| 選択中 | blue-600  | white      |
| ホバー | slate-700 | slate-300  |

### 置換行（折りたたみ可能）

| 要素             | 仕様                               |
| ---------------- | ---------------------------------- |
| 置換入力         | プレースホルダー「置換 / Replace」 |
| 置換ボタン       | 現在のマッチを置換                 |
| すべて置換ボタン | 全マッチを一括置換                 |
| トグルボタン     | 検索行左端に配置、▼/▶アイコン      |

---

## ワークスペース検索パネル（WorkspaceSearchPanel）

### 検索行

| 要素         | 仕様                                       |
| ------------ | ------------------------------------------ |
| 検索入力     | プレースホルダー「ワークスペース内を検索」 |
| 結果カウント | 「X ファイル / Y 件」形式                  |
| 検索実行     | Enter押下またはデバウンス後に自動実行      |

### 置換行（折りたたみ可能）

| 要素             | 仕様                                 |
| ---------------- | ------------------------------------ |
| 置換入力         | プレースホルダー「置換 / Replace」   |
| すべて置換ボタン | 全ファイルの全マッチを一括置換       |
| 確認ダイアログ   | 実行前に影響範囲を表示して確認を取る |

### 結果リスト

| 要素         | 仕様                             |
| ------------ | -------------------------------- |
| グルーピング | ファイルパスでグループ化         |
| 折りたたみ   | ファイル単位で折りたたみ可能     |
| マッチ行表示 | 行番号 + マッチ部分をハイライト  |
| クリック動作 | ファイルを開き、該当行にジャンプ |
| 最大表示件数 | 1000件（パフォーマンス考慮）     |

---

## ファイル名検索パネル（FileNameSearchPanel）

| 要素         | 仕様                                 |
| ------------ | ------------------------------------ |
| 検索入力     | プレースホルダー「ファイル名を検索」 |
| 結果カウント | 「X 件」形式                         |
| デバウンス   | 150msのデバウンス処理                |
| 最大表示件数 | 50件                                 |

### 結果リスト

| 要素           | 仕様                                           |
| -------------- | ---------------------------------------------- |
| ファイル名表示 | 太字で表示                                     |
| パス表示       | ファイル名の下に薄いテキストで表示             |
| 選択状態       | 背景色をblue-600に変更                         |
| キーボード操作 | ↑↓で選択移動、Enterで開く                      |
| スクロール     | 選択アイテムが常に表示されるよう自動スクロール |

---

## ハイライト表示

検索結果のハイライト表示はエディタ側で実装する。

| 要素           | 色               | 用途                       |
| -------------- | ---------------- | -------------------------- |
| 現在のマッチ   | yellow-400 (70%) | フォーカス中のマッチ       |
| その他のマッチ | yellow-300 (40%) | 他のマッチ位置             |
| 置換プレビュー | green-400 (30%)  | 置換後のテキストプレビュー |

---

## アクセシビリティ対応

| 要件                   | 実装方針                               |
| ---------------------- | -------------------------------------- |
| キーボード完全対応     | 全操作がキーボードで実行可能           |
| フォーカス管理         | パネル表示時に検索入力にフォーカス     |
| aria-label             | 各ボタン・入力フィールドに適切なラベル |
| aria-selected          | リスト項目の選択状態を通知             |
| role="listbox"         | 結果リストに適用                       |
| role="option"          | 各結果項目に適用                       |
| 結果カウントの読み上げ | aria-liveで検索結果数を通知            |

---

## エラー状態

| エラー種別     | 表示方法                                       |
| -------------- | ---------------------------------------------- |
| 検索エラー     | 結果エリアにエラーメッセージを表示             |
| 置換エラー     | トースト通知でエラー内容を表示                 |
| 権限エラー     | 該当ファイルの置換をスキップし、サマリーで報告 |
| 大量置換の警告 | 確認ダイアログで影響範囲を明示                 |

---

## パフォーマンス考慮事項

| 項目                 | 対策                                                   |
| -------------------- | ------------------------------------------------------ |
| 検索デバウンス       | 150-300msのデバウンスで入力中の検索を抑制              |
| 結果の仮想化         | 大量結果時はvirtualizationで描画を最適化               |
| バックグラウンド検索 | Web Workerでメインスレッドをブロックしない             |
| キャンセル機能       | 検索中に新しい検索を開始した場合は前の検索をキャンセル |
| 結果上限             | 表示結果数に上限を設け、超過時は通知                   |

---

## 実装アーキテクチャ

### コンポーネント構成

```
apps/desktop/src/features/search/
├── components/
│   ├── SearchPanel.tsx           # ファイル内検索パネル
│   └── WorkspaceSearchPanel.tsx  # ワークスペース検索パネル
├── stores/
│   └── useSearchStore.ts         # Zustand検索状態管理
├── hooks/
│   └── useSearchKeyboardShortcuts.ts  # キーボードショートカット
├── adapters/
│   └── TextAreaEditorAdapter.ts  # エディタアダプター
├── types.ts                      # 型定義
└── index.ts                      # バレルエクスポート
```

### EditorView統合フック

EditorViewからの検索機能呼び出しは、以下のカスタムフックで抽象化する：

| フック                      | 責務                                   | 配置                           |
| --------------------------- | -------------------------------------- | ------------------------------ |
| useEditorInstance           | EditorInstanceアダプター               | EditorView/hooks/              |
| useWorkspaceSearch          | ワークスペース検索プロバイダ           | EditorView/hooks/              |
| useSearchKeyboardShortcuts  | キーボードショートカット管理           | EditorView/hooks/              |

### EditorInstanceインターフェース

検索パネルとエディタの連携は、EditorInstanceインターフェースで抽象化する：

```typescript
interface EditorInstance {
  getContent: () => string;
  setHighlights: (matches: SearchMatch[]) => void;
  getHighlights: () => SearchMatch[];
  scrollToLine: (line: number, column?: number) => void;
  getCursorPosition: () => { line: number; column: number };
  setCursorPosition: (line: number, column: number) => void;
  replaceText: (line: number, column: number, length: number, replacement: string) => void;
  replaceAllText: (matches: SearchMatch[], replacement: string) => void;
  focus: () => void;
}
```

**設計理由**: TextArea、Monaco Editor、CodeMirror等の異なるエディタ実装を同一インターフェースで扱えるようにする（Adapter Pattern）。

### 検索プロバイダパターン

ワークスペース検索は、依存性注入パターンで実装する：

```typescript
type WorkspaceSearchProvider = (
  wsPath: string,
  query: string,
  options: SearchProviderOptions,
) => AsyncGenerator<FileSearchResult>;
```

**設計理由**: テスト時にモック実装を注入可能、IPC呼び出しをEditorView側でラップ。

### 統合パターン（EditorView）

```typescript
function EditorView() {
  // 1. エディタアダプター
  const { editorInstanceRef } = useEditorInstance({
    textAreaRef,
    editorContent,
    setEditorContent,
  });

  // 2. 検索プロバイダ
  const workspaceSearchProvider = useWorkspaceSearch();

  // 3. キーボードショートカット
  useSearchKeyboardShortcuts({
    isSearchPanelOpen,
    searchMode,
    selectedFilePath,
    searchPanelRef,
    setSearchMode,
    setShowReplace,
    setIsSearchPanelOpen,
  });

  // 4. 検索パネル表示
  return (
    <>
      {searchMode === "file" && (
        <SearchPanel editorRef={editorInstanceRef} />
      )}
      {searchMode === "workspace" && (
        <WorkspaceSearchPanel searchProvider={workspaceSearchProvider} />
      )}
    </>
  );
}
```

---

## 実装詳細（TASK-SEARCH-INTEGRATE-001）

### ファイル構成

```
apps/desktop/src/features/search/
├── adapters/
│   └── TextAreaEditorAdapter.ts    # EditorInstance アダプター実装
├── utils/
│   ├── executeSearch.ts            # 検索ロジックユーティリティ
│   ├── highlightUtils.tsx          # ハイライトユーティリティ
│   └── index.ts                    # バレルエクスポート
├── components/
│   ├── SearchPanel.tsx             # ファイル内検索パネル
│   └── WorkspaceSearchPanel.tsx    # ワークスペース検索パネル
├── stores/
│   └── useSearchStore.ts           # Zustand検索状態管理
└── __tests__/                      # テストファイル（275テスト）
```

### TextAreaEditorAdapter

EditorInstanceインターフェースのTextArea実装:

```typescript
class TextAreaEditorAdapter implements EditorInstance {
  constructor(
    textareaRef: React.RefObject<HTMLTextAreaElement>,
    onHighlightsChange?: (highlights: Highlight[]) => void,
  );

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
```

### executeSearch ユーティリティ

検索ロジックをコンポーネントから分離:

```typescript
interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  regex: boolean;
}

interface SearchResult {
  matches: SearchMatch[];
  error: string | null;  // 正規表現エラー等
}

function executeSearch(
  content: string,
  query: string,
  options: SearchOptions,
): SearchResult;
```

### EditorView統合フック

| フック                        | 責務                         | 配置                          |
| ----------------------------- | ---------------------------- | ----------------------------- |
| `useEditorInstance`           | EditorInstanceアダプター生成 | EditorView/hooks/             |
| `useWorkspaceSearch`          | ワークスペース検索プロバイダ | EditorView/hooks/             |
| `useSearchKeyboardShortcuts`  | キーボードショートカット管理 | EditorView/hooks/             |

### 品質指標

| 指標              | 値     |
| ----------------- | ------ |
| テスト合計数      | 275    |
| Line Coverage     | 97.08% |
| Branch Coverage   | 90.13% |
| Function Coverage | 92%    |

---

## 関連ドキュメント

- [パネル・セレクターUI/UXガイドライン](./ui-ux-panels.md)
- [Search Service API](./api-internal-search.md)
- [アクセシビリティガイドライン](./accessibility.md)
- [実装ガイド](../../../docs/30-workflows/search-panel-integration/outputs/phase-12/implementation-guide.md)

---

## 完了タスク

- [x] Phase 5 検索パネル実装の EditorView 統合（TASK-SEARCH-INTEGRATE-001） - 2026-01-22

---

## 未タスク（将来の改善候補）

以下のタスクは TASK-SEARCH-INTEGRATE-001 完了時に検出された改善候補です。

| タスクID                         | 概要                           | 優先度 | サイズ | 仕様書                                                                      |
| -------------------------------- | ------------------------------ | ------ | ------ | --------------------------------------------------------------------------- |
| TASK-SEARCH-REGEX-ERROR-UI-001   | 正規表現エラーのUI表示改善     | 低     | S      | [task-search-panel-regex-error-ui.md](../../../docs/30-workflows/unassigned-task/task-search-panel-regex-error-ui.md) |
| TASK-SEARCH-HISTORY-001          | 検索履歴機能                   | 低     | M      | [task-search-panel-history.md](../../../docs/30-workflows/unassigned-task/task-search-panel-history.md) |
| TASK-SEARCH-FILE-NAV-001         | 検索結果ファイル間ナビゲーション | 低     | M      | [task-search-panel-file-navigation.md](../../../docs/30-workflows/unassigned-task/task-search-panel-file-navigation.md) |

### 改善候補の詳細

#### 1. 正規表現エラーのUI表示改善（TASK-SEARCH-REGEX-ERROR-UI-001）

**現状**: 無効な正規表現パターン入力時、内部でエラーハンドリングされるが「結果なし」と表示

**改善案**:
- エラーメッセージをUIに表示
- `executeSearch.ts` の `error` フィールドを活用（Phase 8 リファクタリングで対応済み）
- `aria-live` でエラー通知

#### 2. 検索履歴機能（TASK-SEARCH-HISTORY-001）

**現状**: 検索クエリはセッション間で保持されない

**改善案**:
- 過去の検索クエリを最大20件保存
- ドロップダウンから履歴選択
- localStorage/IndexedDBで永続化

#### 3. 検索結果ファイル間ナビゲーション（TASK-SEARCH-FILE-NAV-001）

**現状**: ワークスペース検索結果間の移動はマウスクリックが必要

**改善案**:
- F3/Shift+F3 で次/前の検索結果へ移動
- ファイル境界を跨いで連続的に移動
- 現在位置インジケーター表示（例: 3/15）
