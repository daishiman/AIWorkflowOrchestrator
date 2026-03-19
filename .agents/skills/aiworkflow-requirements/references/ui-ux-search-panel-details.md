# 検索・置換パネルUI設計 / detail specification

> 親仕様書: [ui-ux-search-panel.md](ui-ux-search-panel.md)
> 役割: detail specification

## 実装詳細（TASK-SEARCH-INTEGRATE-001）

### ファイル構成

**ディレクトリ**: apps/desktop/src/features/search/

| ディレクトリ/ファイル | 役割 |
| --------------------- | ---- |
| adapters/ | アダプター層 |
| └─ TextAreaEditorAdapter.ts | EditorInstance アダプター実装 |
| utils/ | ユーティリティ |
| ├─ executeSearch.ts | 検索ロジックユーティリティ |
| ├─ highlightUtils.tsx | ハイライトユーティリティ |
| └─ index.ts | バレルエクスポート |
| components/ | UIコンポーネント |
| ├─ SearchPanel.tsx | ファイル内検索パネル |
| └─ WorkspaceSearchPanel.tsx | ワークスペース検索パネル |
| stores/ | 状態管理 |
| └─ useSearchStore.ts | Zustand検索状態管理 |
| __tests__/ | テストファイル（275テスト） |

### TextAreaEditorAdapter

EditorInstanceインターフェースのTextArea実装。

**コンストラクタ**:

| 引数 | 型 | 説明 |
| ---- | -- | ---- |
| textareaRef | React.RefObject&lt;HTMLTextAreaElement&gt; | TextArea要素への参照 |
| onHighlightsChange | (highlights: Highlight[]) => void（オプション） | ハイライト変更時のコールバック |

**メソッド一覧**:

| カテゴリ | メソッド名 | 引数 | 戻り値 | 説明 |
| -------- | ---------- | ---- | ------ | ---- |
| コンテンツ操作 | getContent | なし | string | 内容を取得 |
| コンテンツ操作 | setContent | content: string | void | 内容を設定 |
| コンテンツ操作 | insertText | text: string, position?: number | void | テキストを挿入 |
| 選択・カーソル | getSelection | なし | { start: number; end: number } | 選択範囲を取得 |
| 選択・カーソル | setSelection | start: number, end: number | void | 選択範囲を設定 |
| 選択・カーソル | getCursorPosition | なし | number | カーソル位置を取得 |
| 選択・カーソル | setCursorPosition | position: number | void | カーソル位置を設定 |
| ハイライト | setHighlights | highlights: Highlight[] | void | ハイライトを設定 |
| ハイライト | clearHighlights | なし | void | ハイライトをクリア |
| スクロール・フォーカス | scrollToLine | line: number, column?: number | void | 指定行にスクロール |
| スクロール・フォーカス | focus | なし | void | フォーカスを設定 |

### executeSearch ユーティリティ

検索ロジックをコンポーネントから分離。

**SearchOptions（検索オプション）**:

| プロパティ | 型 | 説明 |
| ---------- | -- | ---- |
| caseSensitive | boolean | 大文字小文字を区別するか |
| wholeWord | boolean | 単語単位で検索するか |
| regex | boolean | 正規表現検索を有効にするか |

**SearchResult（検索結果）**:

| プロパティ | 型 | 説明 |
| ---------- | -- | ---- |
| matches | SearchMatch[] | マッチした結果の配列 |
| error | string または null | エラーメッセージ（正規表現エラー等） |

**executeSearch関数**:

| 引数 | 型 | 説明 |
| ---- | -- | ---- |
| content | string | 検索対象のコンテンツ |
| query | string | 検索クエリ |
| options | SearchOptions | 検索オプション |

| 戻り値 | 説明 |
| ------ | ---- |
| SearchResult | マッチ結果とエラー情報を含むオブジェクト |

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

## 未タスク（将来の改善候補）

以下のタスクは TASK-SEARCH-INTEGRATE-001 完了時に検出された改善候補です。

| タスクID                         | 概要                           | 優先度 | サイズ | 仕様書                                                                      |
| -------------------------------- | ------------------------------ | ------ | ------ | --------------------------------------------------------------------------- |
| TASK-SEARCH-REGEX-ERROR-UI-001   | 正規表現エラーのUI表示改善     | 低     | S      | [task-search-panel-regex-error-ui.md](../../../docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-search-panel-regex-error-ui.md) |
| TASK-SEARCH-HISTORY-001          | 検索履歴機能                   | 低     | M      | [task-search-panel-history.md](../../../docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-search-panel-history.md) |
| TASK-SEARCH-FILE-NAV-001         | 検索結果ファイル間ナビゲーション | 低     | M      | [task-search-panel-file-navigation.md](../../../docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-search-panel-file-navigation.md) |
| task-search-scope-folder-001     | 検索スコープ指定機能           | 中     | M      | [task-search-scope-folder.md](../../../docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-search-scope-folder.md) |
| task-search-multifile-replace-001| マルチファイル一括置換機能     | 中     | M      | [task-search-multifile-replace.md](../../../docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-search-multifile-replace.md) |

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

#### 4. 検索スコープ指定機能（task-search-scope-folder-001）

**現状**: ワークスペース全体が検索対象で、絞り込みができない

**改善案**:
- WorkspaceSearchModalに「検索フォルダ」入力欄を追加
- Electron dialogによるフォルダ選択をサポート
- 複数フォルダの指定をサポート
- 除外パターン（.gitignore形式）のサポート

**実装課題の参考**:
- MR-01: 既存実装の品質評価（Phase 5でギャップ分析を実施）
- MR-04: E2Eテスト設計（Page Objectパターンを使用）

#### 5. マルチファイル一括置換機能（task-search-multifile-replace-001）

**現状**: 1ファイルずつ手動で置換を実行する必要がある

**改善案**:
- WorkspaceSearchModalに「すべて置換」ボタンを追加
- 置換プレビュー表示（Monaco Diff Viewer活用）
- 確認ダイアログによる安全な実行フロー
- Undo機能（1回の操作で全ファイルを元に戻す）

**実装課題の参考**:
- MR-01: 既存実装の品質評価（Phase 5でギャップ分析を実施）
- MR-02: Phase 12 Task 2 Step 1-A更新漏れ（spec-update-workflow.mdのチェックリスト確認）
- MR-03: generate-index.jsファイル名（`.mjs`ではなく`.js`）

---

