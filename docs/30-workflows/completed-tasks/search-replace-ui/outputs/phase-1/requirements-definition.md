# Phase 1: 要件定義書

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase     | 1                      |
| 機能名    | search-replace-ui      |
| タスクID  | task-imp-search-ui-001 |
| 関連Issue | #366                   |
| 作成日    | 2026-02-04             |

## 既存実装の評価

### 実装済みコンポーネント

| コンポーネント             | ファイル                              | 状態     | 備考                   |
| -------------------------- | ------------------------------------- | -------- | ---------------------- |
| SearchPanel                | `components/SearchPanel.tsx`          | 実装済み | WCAG 2.1 AA準拠        |
| WorkspaceSearchPanel       | `components/WorkspaceSearchPanel.tsx` | 実装済み | プレースホルダーIPC    |
| SearchOptionButtons        | `components/SearchOptionButtons.tsx`  | 実装済み | 3種オプション対応      |
| useSearchStore             | `stores/useSearchStore.ts`            | 実装済み | Zustand + persist      |
| useSearchKeyboardShortcuts | `hooks/useSearchKeyboardShortcuts.ts` | 実装済み | ローカルショートカット |
| TextAreaEditorAdapter      | `adapters/TextAreaEditorAdapter.ts`   | 実装済み | エディタアダプター     |
| executeSearch              | `utils/executeSearch.ts`              | 実装済み | 検索ロジック           |
| highlightUtils             | `utils/highlightUtils.tsx`            | 実装済み | ハイライト処理         |

### 未実装/要改善項目

| 項目                         | 状態             | 優先度 | 備考                             |
| ---------------------------- | ---------------- | ------ | -------------------------------- |
| E2Eテスト                    | 未実装           | 高     | Playwrightによるテスト           |
| グローバルショートカット統合 | 要確認           | 高     | AppLayout/EditorViewでの登録確認 |
| IPC統合（WorkspaceSearch）   | プレースホルダー | 中     | Main ProcessのSearchEngine連携   |

## 機能要件（FR）

### FR-1: ファイル内検索パネル

| 要件ID | 要件                                             | 優先度 | 実装状態 |
| ------ | ------------------------------------------------ | ------ | -------- |
| FR-1-1 | Cmd+F（Mac）/Ctrl+F（Win）で開く                 | 高     | 要確認   |
| FR-1-2 | リアルタイム検索（Enter実行）                    | 高     | 実装済み |
| FR-1-3 | 検索オプション（大文字小文字/正規表現/単語単位） | 高     | 実装済み |
| FR-1-4 | 検索結果ハイライト表示                           | 高     | 実装済み |
| FR-1-5 | 結果間ナビゲーション（F3/Shift+F3）              | 高     | 実装済み |
| FR-1-6 | 置換機能（単一/全置換）                          | 高     | 実装済み |

### FR-2: ワークスペース検索パネル

| 要件ID | 要件                                         | 優先度 | 実装状態         |
| ------ | -------------------------------------------- | ------ | ---------------- |
| FR-2-1 | Cmd+Shift+F（Mac）/Ctrl+Shift+F（Win）で開く | 高     | 要確認           |
| FR-2-2 | ファイル横断検索                             | 高     | プレースホルダー |
| FR-2-3 | ファイルパターンフィルタ                     | 中     | 実装済み         |
| FR-2-4 | 除外パターン指定                             | 中     | 実装済み         |
| FR-2-5 | 検索結果ツリー表示                           | 高     | 実装済み         |
| FR-2-6 | 結果クリックでファイル/位置ジャンプ          | 高     | 実装済み         |
| FR-2-7 | 全ファイル一括置換（確認ダイアログ付き）     | 中     | 実装済み         |

### FR-3: キーボードショートカット

| 要件ID | 機能               | macOS                | Windows/Linux        | 実装状態 |
| ------ | ------------------ | -------------------- | -------------------- | -------- |
| FR-3-1 | ファイル内検索     | Cmd+F                | Ctrl+F               | 要確認   |
| FR-3-2 | ファイル内置換     | Cmd+T                | Ctrl+T               | 要確認   |
| FR-3-3 | ワークスペース検索 | Cmd+Shift+F          | Ctrl+Shift+F         | 要確認   |
| FR-3-4 | 閉じる             | Escape               | Escape               | 実装済み |
| FR-3-5 | 次の結果           | Enter/F3             | Enter/F3             | 実装済み |
| FR-3-6 | 前の結果           | Shift+Enter/Shift+F3 | Shift+Enter/Shift+F3 | 実装済み |

## 非機能要件（NFR）

| 要件ID | カテゴリ         | 要件                     | 基準                 | 仕様参照                       |
| ------ | ---------------- | ------------------------ | -------------------- | ------------------------------ |
| NFR-1  | パフォーマンス   | 検索応答時間             | 200ms以内（P50）     | `ui-ux-search-panel.md`        |
| NFR-2  | パフォーマンス   | デバウンス               | 150-300ms            | `ui-ux-search-panel.md`        |
| NFR-3  | パフォーマンス   | 最大表示件数             | 1000件               | `ui-ux-search-panel.md`        |
| NFR-4  | セキュリティ     | ReDoSタイムアウト        | 5000ms               | `api-internal-search.md`       |
| NFR-5  | セキュリティ     | パストラバーサル防止     | ワークスペース外拒否 | `security-input-validation.md` |
| NFR-6  | アクセシビリティ | WCAG 2.1 AA準拠          | 全項目クリア         | `ui-ux-search-panel.md`        |
| NFR-7  | テストカバレッジ | ユニットテストカバレッジ | Line 80%以上         | `coverage-standards.md`        |
| NFR-8  | テストカバレッジ | E2Eテストカバレッジ      | 主要シナリオ100%     | `coverage-standards.md`        |

## セキュリティ要件

### SEC-1: ReDoS対策

**実装場所**: SearchService.searchInFile / searchInWorkspace（Main Process）

| 対策項目           | 実装内容                               |
| ------------------ | -------------------------------------- |
| タイムアウト       | Promise.race()で5000ms超過時に強制終了 |
| 後方参照禁止       | `\1`, `\2`等のパターンを検出してエラー |
| ネスト量指定子禁止 | `(a+)+`等のパターンを検出してエラー    |
| 非限定量指定子制限 | `.+`, `.*`の連続使用を検出して警告     |

### SEC-2: パストラバーサル防止

**実装場所**: WorkspaceSearchEngine.search()（Main Process）

| 検証項目           | 実装内容                               |
| ------------------ | -------------------------------------- |
| パス正規化         | path.normalize()でパスを正規化         |
| プレフィックス検証 | ワークスペースパス配下か確認           |
| 拒否パターン       | `../`, `..\\`, 絶対パス外参照を拒否    |
| エラー処理         | PATH_TRAVERSALエラーを返却、ログに記録 |

### エラーコード定義

| コード          | カテゴリ       | 説明                          | リトライ |
| --------------- | -------------- | ----------------------------- | -------- |
| INVALID_PATTERN | Validation     | 正規表現が無効（ReDoSリスク） | 不可     |
| TIMEOUT         | Infrastructure | 5000ms以内に完了しなかった    | 不可     |
| PATH_TRAVERSAL  | Security       | ワークスペース外アクセス試行  | 不可     |
| FILE_READ_ERROR | Infrastructure | ファイル読み取りエラー        | 可能     |

## 統合要件

### IPC接続

| 接続先       | チャンネル                | 説明                         |
| ------------ | ------------------------- | ---------------------------- |
| Main Process | `search:workspace`        | ワークスペース検索リクエスト |
| Main Process | `search:workspace:result` | 検索結果ストリーミング       |
| Main Process | `search:workspace:done`   | 検索完了通知                 |
| Main Process | `search:workspace:error`  | エラー通知                   |

### 状態管理

| Store          | 用途                             |
| -------------- | -------------------------------- |
| useSearchStore | 検索パネル状態、オプション永続化 |

### エディタ連携

| 連携先         | インターフェース   | 説明                   |
| -------------- | ------------------ | ---------------------- |
| EditorInstance | `setHighlights()`  | 検索結果ハイライト     |
| EditorInstance | `scrollToLine()`   | 検索結果へのスクロール |
| EditorInstance | `replaceText()`    | 単一置換               |
| EditorInstance | `replaceAllText()` | 全置換                 |

## 完了条件チェック

- [x] 全要件が抽出されている
- [x] 各要件に受け入れ基準がある（別紙参照）
- [x] FR/NFRが分類されている
- [x] セキュリティ要件が明記されている
- [x] 既存実装の状態が評価されている
- [x] 残作業（E2E、IPC統合）が特定されている
