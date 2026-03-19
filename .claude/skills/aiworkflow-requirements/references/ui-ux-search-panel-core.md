# 検索・置換パネルUI設計 / core specification

> 親仕様書: [ui-ux-search-panel.md](ui-ux-search-panel.md)
> 役割: core specification

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

### Workspace QuickFileSearch dialog（TASK-UI-04C）

`WorkspaceView` では UnifiedSearchPanel をそのまま流用せず、workspace file tree を元にした lightweight な filename search dialog を別コンポーネントとして提供する。

| 要素 | 仕様 |
| --- | --- |
| 起動 | `Cmd/Ctrl+P` |
| データソース | `workspaceSlice` の file tree を flatten した Renderer local data |
| 最大表示件数 | 10件 |
| 結果判定 | fuzzy ranking を使うが、`score = 0` は候補に含めない |
| フォーカス | open 時に input へ focus、dialog 内 Tab 循環を維持 |
| キーボード | ArrowUp / ArrowDown / Enter / Escape |
| 選択時動作 | file selection を更新し、preview panel が閉じていれば自動で開く |
| 置換 | なし |

#### 関連未タスク

| タスクID | 目的 | タスク仕様書 |
| --- | --- | --- |
| UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001 | QuickFileSearch の `score=0` 除外、stable sort、top 10 制御を再利用可能な search resilience ガードへ昇格する | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-workspace-preview-search-resilience-guard-001.md` |

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

**ディレクトリ**: apps/desktop/src/features/search/

| ディレクトリ/ファイル | 役割                           |
| --------------------- | ------------------------------ |
| components/           | UIコンポーネント               |
| ├─ SearchPanel.tsx    | ファイル内検索パネル           |
| └─ WorkspaceSearchPanel.tsx | ワークスペース検索パネル |
| stores/               | 状態管理                       |
| └─ useSearchStore.ts  | Zustand検索状態管理            |
| hooks/                | カスタムフック                 |
| └─ useSearchKeyboardShortcuts.ts | キーボードショートカット |
| adapters/             | アダプター                     |
| └─ TextAreaEditorAdapter.ts | エディタアダプター       |
| types.ts              | 型定義                         |
| index.ts              | バレルエクスポート             |

### EditorView統合フック

EditorViewからの検索機能呼び出しは、以下のカスタムフックで抽象化する：

| フック                      | 責務                                   | 配置                           |
| --------------------------- | -------------------------------------- | ------------------------------ |
| useEditorInstance           | EditorInstanceアダプター               | EditorView/hooks/              |
| useWorkspaceSearch          | ワークスペース検索プロバイダ           | EditorView/hooks/              |
| useSearchKeyboardShortcuts  | キーボードショートカット管理           | EditorView/hooks/              |

### EditorInstanceインターフェース

検索パネルとエディタの連携は、EditorInstanceインターフェースで抽象化する。

**EditorInstance メソッド一覧**:

| メソッド名 | 引数 | 戻り値 | 説明 |
| ---------- | ---- | ------ | ---- |
| getContent | なし | string | エディタの内容を取得 |
| setHighlights | matches: SearchMatch[] | void | 検索マッチをハイライト表示 |
| getHighlights | なし | SearchMatch[] | 現在のハイライトを取得 |
| scrollToLine | line: number, column?: number | void | 指定行にスクロール |
| getCursorPosition | なし | { line: number; column: number } | カーソル位置を取得 |
| setCursorPosition | line: number, column: number | void | カーソル位置を設定 |
| replaceText | line: number, column: number, length: number, replacement: string | void | テキストを置換 |
| replaceAllText | matches: SearchMatch[], replacement: string | void | 全マッチを一括置換 |
| focus | なし | void | エディタにフォーカス |

**設計理由**: TextArea、Monaco Editor、CodeMirror等の異なるエディタ実装を同一インターフェースで扱えるようにする（Adapter Pattern）。

### 検索プロバイダパターン

ワークスペース検索は、依存性注入パターンで実装する。

**WorkspaceSearchProvider型の定義**:

| 引数名 | 型 | 説明 |
| ------ | -- | ---- |
| wsPath | string | ワークスペースのパス |
| query | string | 検索クエリ |
| options | SearchProviderOptions | 検索オプション |

| 戻り値 | 説明 |
| ------ | ---- |
| AsyncGenerator&lt;FileSearchResult&gt; | ファイル検索結果を非同期で返すジェネレータ |

**設計理由**: テスト時にモック実装を注入可能、IPC呼び出しをEditorView側でラップ。

### 統合パターン（EditorView）

EditorViewコンポーネントでの検索機能統合は、以下の4ステップで構成される。

**統合ステップ**:

| ステップ | 処理内容 | 使用フック/コンポーネント |
| -------- | -------- | ------------------------- |
| 1. エディタアダプター | TextAreaRefとコンテンツを基にEditorInstanceを生成 | useEditorInstance |
| 2. 検索プロバイダ | ワークスペース検索プロバイダを取得 | useWorkspaceSearch |
| 3. キーボードショートカット | 検索パネルの開閉・モード切替を管理 | useSearchKeyboardShortcuts |
| 4. 検索パネル表示 | searchModeに応じたパネルを条件付きレンダリング | SearchPanel / WorkspaceSearchPanel |

**useEditorInstanceの引数**:

| 引数 | 説明 |
| ---- | ---- |
| textAreaRef | TextArea要素への参照 |
| editorContent | 現在のエディタ内容 |
| setEditorContent | 内容更新関数 |

**useSearchKeyboardShortcutsの引数**:

| 引数 | 説明 |
| ---- | ---- |
| isSearchPanelOpen | パネル開閉状態 |
| searchMode | 現在の検索モード |
| selectedFilePath | 選択中のファイルパス |
| searchPanelRef | 検索パネルへの参照 |
| setSearchMode | モード設定関数 |
| setShowReplace | 置換表示設定関数 |
| setIsSearchPanelOpen | パネル開閉設定関数 |

**パネル表示条件**:

| searchMode | 表示されるコンポーネント | 渡すProps |
| ---------- | ------------------------ | --------- |
| "file" | SearchPanel | editorRef（EditorInstance参照） |
| "workspace" | WorkspaceSearchPanel | searchProvider（検索プロバイダ） |

---

