# TASK-UI-04C-WORKSPACE-PREVIEW: ワークスペースPreviewPanel・QuickFileSearch

## 1. メタ情報

| 項目             | 値                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| タスクID         | TASK-UI-04C-WORKSPACE-PREVIEW                                                                                                              |
| 元タスクID       | TASK-UI-04-WORKSPACE-VIEW（分割元）                                                                                                        |
| ステータス       | 未着手                                                                                                                                     |
| 優先度           | high                                                                                                                                       |
| 複雑度           | medium                                                                                                                                     |
| 推定ファイル数   | ~12                                                                                                                                        |
| 依存タスク       | TASK-UI-00（デザイン基盤）, TASK-UI-01（アーキテクチャ）, TASK-UI-04A（レイアウト基盤）                                                    |
| ブロック対象     | なし（04B と並列実行可能）                                                                                                                 |
| 対象ビュー       | WorkspaceView 内 PreviewPanel ペイン + QuickFileSearch モーダル                                                                            |
| 関連スライス     | `workspaceSlice`（既存利用）                                                                                                               |
| 関連 IPC         | `file:read`（既存利用）                                                                                                                    |
| 関連ドキュメント | [04A-workspace-layout-filebrowser.md](./04A-workspace-layout-filebrowser.md), [04B-workspace-chat-panel.md](./04B-workspace-chat-panel.md) |

## 2. 目的

ワークスペース画面内の PreviewPanel ペインと QuickFileSearch（Cmd+P）モーダルを実装する。選択ファイルの Source/Preview 切替表示と、ワークスペース内のファイル高速検索機能を提供する。

レイアウト基盤（3ペイン構造、リサイズ機構）は [04A](./04A-workspace-layout-filebrowser.md) で提供される。本ドキュメントでは PreviewPanel と QuickFileSearch の内部設計に集中する。

### 2.1 UX言語マッピング（5D準拠）

| 技術用語         | やさしい日本語                   | 表示箇所                  |
| ---------------- | -------------------------------- | ------------------------- |
| Preview          | プレビュー                       | PreviewToolbar タブ       |
| Source           | コード表示                       | PreviewToolbar タブ       |
| QuickFileSearch  | ファイルをすばやく探す           | Cmd+P モーダルタイトル    |
| Reload / Refresh | 再読み込み                       | PreviewToolbar ボタン     |
| Empty State      | まだ表示するファイルがありません | PreviewPanel ゼロステート |

## 2.2 システム仕様（aiworkflow-requirements）

今回の実装は `aiworkflow-requirements` の参照仕様に基づき、UI/UX・アクセシビリティ・品質観点を仕様へ反映する。

| 観点             | 抽出した必須要件                                                    | 主参照                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI/UX            | PreviewPanel と検索モーダルの責務分離、Atomic Design 境界を維持する | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                                                        |
| アクセシビリティ | キーボード操作、フォーカス管理、ARIA の整合を担保する               | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                                                                                   |
| 品質保証         | happy-dom 前提のテスト実装と Vitest 品質ゲートを満たす              | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`, `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` |

## 2.3 実行タスク

- PreviewPanel実装: Source/Preview切替、形式別レンダリング、ゼロステートを実装する
- QuickFileSearch実装: Cmd+Pモーダル、ファジー検索、キーボード選択を実装する
- 安全性実装: iframe CSP/サニタイズ、IPC連携、クラッシュ時フォールバックを実装する
- 品質実装: コンポーネント/Hookテストを追加し、P31/P39/P40対策を適用する

## 3. PreviewPanel ペイン設計

### 3.1 概要

選択ファイルのプレビュー表示パネル。Source モード（コードビューアー）と Preview モード（HTML/Markdown レンダリング）を切り替えて使用する。

### 3.2 対応ファイル形式

| 形式       | Source モード              | Preview モード               |
| ---------- | -------------------------- | ---------------------------- |
| TypeScript | シンタックスハイライト表示 | 非対応（Source のみ）        |
| JavaScript | シンタックスハイライト表示 | 非対応（Source のみ）        |
| HTML       | シンタックスハイライト表示 | iframe sandbox レンダリング  |
| Markdown   | シンタックスハイライト表示 | Markdown → HTML レンダリング |
| CSS/SCSS   | シンタックスハイライト表示 | 非対応（Source のみ）        |
| JSON/YAML  | シンタックスハイライト表示 | 整形表示（ツリービューア）   |
| 画像       | Base64 / メタデータ表示    | 画像表示（fit-contain）      |
| その他     | プレーンテキスト表示       | 非対応（Source のみ）        |

### 3.3 Source モード

- `CodeViewer`（TASK-UI-00 参照）に `selectedFilePath` のコンテンツを表示
- 行番号表示: 左ガター（40px幅）
- ワードラップ: トグル可能
- シンタックスハイライト: ファイル拡張子に基づく自動言語検出
- 読み取り専用（編集はダブルクリックで EditorView へ遷移）

### 3.4 Preview モード

- HTML: iframe sandbox でレンダリング
- Markdown: markdown-it / remark 等で HTML に変換してレンダリング
- 自動更新: ファイル変更検知時に 300ms デバウンスでリロード

### 3.5 CSP 設計（iframe プレビュー）

```html
<iframe
  sandbox="allow-same-origin"
  referrerpolicy="no-referrer"
  style="border: none; width: 100%; height: 100%;"
  srcdoc="{sanitizedHtml}"
/>
```

CSP ヘッダー（iframe 内コンテンツ用）:

```
Content-Security-Policy:
  default-src 'none';
  style-src 'unsafe-inline';
  img-src data: blob:;
  font-src data:;
  script-src 'none';
  object-src 'none';
  frame-src 'none';
```

- `script-src 'none'`: JavaScript 実行を完全禁止
- `object-src 'none'`: プラグイン（Flash 等）を禁止
- `style-src 'unsafe-inline'`: インラインスタイルのみ許可（HTML プレビューに必要）
- `img-src data: blob:`: Base64 画像と Blob URL のみ許可

HTML サニタイズ:

- `srcdoc` に渡す前に DOMPurify でサニタイズ
- `<script>`, `<iframe>`, `<object>`, `<embed>` タグを除去
- `on*` イベントハンドラ属性を除去

### 3.6 PreviewToolbar

```
┌──────────────────────────────┐
│ [Source] [Preview]  |  ↻ Wrap│
└──────────────────────────────┘
```

- Source/Preview: TabSwitcher（TASK-UI-00 参照）
- Refresh ボタン: 手動リロード
- Wrap トグル: ワードラップ ON/OFF
- Preview が利用不可のファイル形式では Preview タブを `disabled` にする

### 3.7 ファイル未選択時のゼロステート

```
┌──────────────────────────────┐
│                              │
│         📄                   │
│                              │
│  ファイルを選択すると        │
│  ここにプレビューが          │
│  表示されます                │
│                              │
│  FileBrowser から            │
│  ファイルをクリック          │
│                              │
└──────────────────────────────┘
```

## 4. QuickFileSearch（Cmd+P モーダル）

| 項目         | 仕様                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| トリガー     | Cmd+P（グローバルショートカット）                                           |
| UI           | 画面中央のモーダル（幅 480px、角丸 12px、影 `0 8px 32px rgba(0,0,0,0.12)`） |
| 検索方式     | ファジーマッチ（ファイル名のみ、パスの一部も対象）                          |
| 結果表示     | 最大 10 件、ハイライト付き                                                  |
| 選択         | Arrow Up/Down で移動、Enter で選択、Escape で閉じる                         |
| 選択後の動作 | `setSelectedFilePath(path)` でプレビューに表示                              |

```typescript
// hooks/useQuickFileSearch.ts
interface QuickFileSearchState {
  isOpen: boolean;
  query: string;
  results: FileSearchResult[];
  selectedIndex: number;
}

interface FileSearchResult {
  filePath: string;
  fileName: string;
  relativePath: string;
  matchScore: number; // 0-1、ファジーマッチスコア
}
```

## 5. コンポーネント階層

### 5.1 PreviewPanel コンポーネントツリー

```
WorkspaceView/components/
├── PreviewPanel/
│   ├── PreviewPanel.tsx             # Source/Preview 切替コンテナ（organisms）
│   ├── SourceView.tsx              # CodeViewer（00 参照）ラッパー（molecules）
│   ├── HtmlPreview.tsx             # iframe sandbox プレビュー（molecules）
│   ├── MarkdownPreview.tsx         # Markdown レンダリング（molecules）
│   ├── ImagePreview.tsx            # 画像表示（molecules）
│   └── PreviewToolbar.tsx          # モード切替ツールバー（molecules）
└── QuickFileSearch.tsx              # Cmd+P モーダル（molecules）
```

### 5.2 Hooks

```
WorkspaceView/hooks/
└── useQuickFileSearch.ts            # Cmd+P ファイル検索ロジック
```

### 5.3 Atomic Design 分類

| レベル    | コンポーネント                                                                          |
| --------- | --------------------------------------------------------------------------------------- |
| molecules | SourceView, HtmlPreview, MarkdownPreview, ImagePreview, PreviewToolbar, QuickFileSearch |
| organisms | PreviewPanel                                                                            |

## 6. IPC 連携

PreviewPanel は既存の `file:read` IPC チャネルを使用してファイル内容を取得する。新規 IPC チャネルの追加は不要。

| チャネル名  | 方向   | 用途                 | ハンドラ位置      |
| ----------- | ------ | -------------------- | ----------------- |
| `file:read` | invoke | ファイル内容読み込み | `fileHandlers.ts` |

> **注**: `workspace:*`, `file:*`（ツリー・監視）チャネルは [04A](./04A-workspace-layout-filebrowser.md)、`llm:*`, `conversation:*` チャネルは [04B](./04B-workspace-chat-panel.md) を参照。

## 7. ゼロステート

### 7.1 PreviewPanel ゼロステート（ファイル未選択時）

- FileBrowserPanel: ツリー表示（通常動作、04A 参照）
- ChatPanel: 通常動作（ファイルコンテキストなしでチャット可能、04B 参照）
- PreviewPanel: ゼロステート表示（前述の 3.7）

## 8. Main Process クラッシュフォールバック（C9対策）

### PreviewPanel でのエラー境界

- `file:read` IPC がタイムアウト（5秒）した場合のフォールバック表示
- Main Process 切断時: 「接続が切断されました。再接続を試みています...」表示
- エラー境界（React Error Boundary）で PreviewPanel のレンダリングエラーをキャッチ

### リカバリーフロー

1. IPC タイムアウト: 3回リトライ（1秒間隔）→ エラー表示 + 「再読み込み」ボタン
2. レンダリングエラー: Error Boundary でフォールバック UI 表示 + 「リセット」ボタン
3. iframe クラッシュ: sandbox 内のクラッシュは親に影響しない（CSP で保護済み）

## 9. テスト計画

### 9.1 コンポーネントテスト

| テストファイル             | テスト対象      | テスト項目                                                |
| -------------------------- | --------------- | --------------------------------------------------------- |
| `PreviewPanel.test.tsx`    | PreviewPanel    | Source/Preview 切替、各ファイル形式のプレビュー、CSP 適用 |
| `QuickFileSearch.test.tsx` | QuickFileSearch | Cmd+P 開閉、ファジー検索、キーボード選択                  |

### 9.2 Hook テスト

| テストファイル               | テスト対象         | テスト項目                             |
| ---------------------------- | ------------------ | -------------------------------------- |
| `useQuickFileSearch.test.ts` | useQuickFileSearch | ファジーマッチ、結果ソート、スコア計算 |

### 9.3 P31/P39/P40 対策

- **P31**: 全テストで個別セレクタ（`useStore((s) => s.xxx)`）を使用。合成 Hook をモックしない
- **P39**: happy-dom 環境では `fireEvent` を使用。`userEvent.setup()` は使わない
- **P40**: テスト実行は `cd apps/desktop && pnpm vitest run` で実行

## 9.4 実行手順（task-specification-creator準拠）

| Step | 内容                                                                    | 実行方式 |
| ---- | ----------------------------------------------------------------------- | -------- |
| 1    | PreviewPanelのコンポーネント実装（Source/Preview/Toolbar/ゼロステート） | 直列     |
| 2    | QuickFileSearch の Hook とモーダルUI実装（Cmd+P + ファジー検索）        | 直列     |
| 3    | CSP/サニタイズ/IPC/フォールバックを実装                                 | 直列     |
| 4    | テストコード（コンポーネント + Hook）を追加                             | 直列     |
| 5    | `cd apps/desktop && pnpm vitest run` で検証し、完了条件を確認           | 直列     |

## 10. 成果物一覧

### 10.1 プロダクションコード

```
apps/desktop/src/renderer/
└── views/WorkspaceView/
    ├── components/
    │   ├── PreviewPanel/
    │   │   ├── PreviewPanel.tsx             # プレビューパネル
    │   │   ├── SourceView.tsx              # コードビューア
    │   │   ├── HtmlPreview.tsx             # HTML プレビュー
    │   │   ├── MarkdownPreview.tsx         # Markdown プレビュー
    │   │   ├── ImagePreview.tsx            # 画像プレビュー
    │   │   └── PreviewToolbar.tsx          # モード切替ツールバー
    │   └── QuickFileSearch.tsx              # Cmd+P モーダル
    └── hooks/
        └── useQuickFileSearch.ts            # ファイル検索
```

### 10.2 テストコード

```
apps/desktop/src/renderer/
├── views/WorkspaceView/__tests__/
│   ├── PreviewPanel.test.tsx
│   └── QuickFileSearch.test.tsx
└── views/WorkspaceView/hooks/__tests__/
    └── useQuickFileSearch.test.ts
```

### 10.3 推定ファイル数

- プロダクションコード: ~8 ファイル（うち hooks 1）
- テストコード: ~3 ファイル
- 合計: ~11 ファイル

> **注**: WorkspaceView の `index.tsx`（レイアウトコンテナ）は 04A の成果物。PreviewPanel は 04A が提供するスロットに配置される。

## 11. 完了条件

### 11.1 PreviewPanel

- [ ] Source/Preview モード切替が動作する
- [ ] TypeScript/JavaScript ファイルがシンタックスハイライト付きで表示される
- [ ] HTML ファイルが iframe sandbox でプレビューされる
- [ ] Markdown ファイルがレンダリング表示される
- [ ] 画像ファイルが表示される
- [ ] iframe プレビューが CSP に準拠し、script 実行が禁止されている

### 11.2 ゼロステート（PreviewPanel）

- [ ] ファイル未選択時にプレビューゼロステートが表示される

### 11.3 QuickFileSearch

- [ ] Cmd+P でモーダルが開く
- [ ] ファジーマッチ検索が動作する
- [ ] Arrow Up/Down で選択移動、Enter で確定する

### 11.4 テスト・品質

- [ ] 全コンポーネントテストが PASS する
- [ ] 個別セレクタパターンを使用していること（P31 対策）
- [ ] happy-dom 環境で `fireEvent` を使用していること（P39 対策）
- [ ] テスト実行が `cd apps/desktop` から行われること（P40 対策）
- [ ] UIテキストが Task 5D（UX言語ガイドライン）に準拠していること

## 12. 既知の落とし穴・教訓

| Pitfall | 該当箇所                 | 対策                                                                                                            |
| ------- | ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| **P5**  | ファイル変更検知         | PreviewPanel の自動更新で `file:changed` リスナーを使用する場合、二重登録防止（04A の `useFileWatcher` を利用） |
| **P31** | Store Hook 依存配列      | 個別セレクタ使用。合成 Hook を useEffect 依存配列に含めない                                                     |
| **P39** | happy-dom 環境 userEvent | `fireEvent` を使用。`userEvent.setup()` は使わない                                                              |
| **P40** | テスト実行ディレクトリ   | `cd apps/desktop && pnpm vitest run` で実行                                                                     |

## 13. 関連ドキュメント

### 04 シリーズ分割ドキュメント

| ファイル                                                                     | 責務                                                                       |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [04A-workspace-layout-filebrowser.md](./04A-workspace-layout-filebrowser.md) | 3ペインレイアウト + FileBrowserPanel + StatusBar + リサイズ + ファイル監視 |
| [04B-workspace-chat-panel.md](./04B-workspace-chat-panel.md)                 | ChatPanel + ファイルコンテキスト連携 + @mention + ストリーミング           |
| **本ドキュメント（04C）**                                                    | PreviewPanel + Source/Preview切替 + QuickFileSearch(Cmd+P) + CSP           |

## 13.1 参照資料

| 資料                       | パス / タスク ID                                                                  |
| -------------------------- | --------------------------------------------------------------------------------- |
| デザイン基盤               | TASK-UI-00 `00-ui-design-foundation.md`                                           |
| UI アーキテクチャ          | TASK-UI-01 `01-store-ipc-architecture.md`                                         |
| レイアウト基盤（04A）      | [04A-workspace-layout-filebrowser.md](./04A-workspace-layout-filebrowser.md)      |
| UX言語ガイドライン（5D）   | TASK-UI-00 `00-ui-design-foundation.md` Task 5D                                   |
| UI/UXコンポーネント仕様    | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           |
| a11yテスト基準             | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      |
| コンポーネントテスト基準   | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` |
| 品質要件                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       |
| セキュリティルール         | `.claude/rules/04-electron-security.md`                                           |
| IPC チャネル定義           | `apps/desktop/src/preload/channels.ts`                                            |
| P5: リスナー二重登録       | `.claude/rules/06-known-pitfalls.md#P5`                                           |
| P31: Store Hook 無限ループ | `.claude/rules/06-known-pitfalls.md#P31`                                          |
| P39: happy-dom userEvent   | `.claude/rules/06-known-pitfalls.md#P39`                                          |

## 14. 次の Phase

- 04A（レイアウト基盤）完了後に実装開始
- [04B](./04B-workspace-chat-panel.md)（ChatPanel）と **並列実装可能**
- TASK-UI-05（スキルセンター）、TASK-UI-06（履歴・統合検索）とも **並列実行可能**
- 全画面が揃った後、TASK-UI-07（ダッシュボード）でワークスペース統計を統合する
