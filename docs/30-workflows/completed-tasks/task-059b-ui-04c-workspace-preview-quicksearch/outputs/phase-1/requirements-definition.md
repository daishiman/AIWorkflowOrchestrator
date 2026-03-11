# Phase 1 要件定義書

## 調査サマリー

| 項目                 | 実施結果                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `WorkspaceView` 現況 | 04A の 3 pane 基盤上に 04C 用の PreviewPanel / QuickFileSearch を統合済み                                           |
| IPC 境界             | `file:read` / `file:watch-start` / `file:watch-stop` / `file:changed` の既存契約のみ再利用し、新規 channel は未追加 |
| UI 範囲              | Preview toolbar、Source/Preview 切替、Markdown/HTML/JSON/YAML/Image 表示、Cmd/Ctrl+P モーダルを追加                 |
| 品質観点             | task-scope 52 tests、coverage `89.47 / 79.43 / 93.87 / 89.47`、build PASS、current build screenshot 11 件           |

## 機能要件

| 要件ID | 要件                                                             | 実装確認                                       |
| ------ | ---------------------------------------------------------------- | ---------------------------------------------- |
| FR-01  | PreviewPanel は `コード表示` / `プレビュー` の 2 モードを持つ    | `PreviewToolbar.tsx`, `PreviewPanel.tsx`       |
| FR-02  | Source モードは行番号付き read-only 表示を行う                   | `SourceView.tsx`                               |
| FR-03  | HTML は iframe sandbox + CSP で表示する                          | `HtmlPreview.tsx`                              |
| FR-04  | Markdown は既存 `MarkdownRenderer` で描画する                    | `MarkdownPreview.tsx`                          |
| FR-05  | 画像は `fit-contain` 表示とメタ情報トグルを持つ                  | `ImagePreview.tsx`                             |
| FR-06  | JSON/YAML は整形 preview を持ち、失敗時は Source fallback する   | `PreviewPanel.tsx`, `StructuredPreview.tsx`    |
| FR-07  | Cmd/Ctrl+P で QuickFileSearch を開く                             | `useQuickFileSearch.ts`                        |
| FR-08  | QuickFileSearch は上位 10 件までを返す                           | `buildSearchResults()`                         |
| FR-09  | Arrow / Enter / Escape で検索結果を操作できる                    | `useQuickFileSearch.ts`, `QuickFileSearch.tsx` |
| FR-10  | 選択確定時に `selectedFilePath` を更新し PreviewPanel へ反映する | `WorkspaceView/index.tsx`                      |
| FR-11  | Refresh / Wrap 操作を toolbar から行える                         | `PreviewToolbar.tsx`                           |
| FR-12  | SourceView ダブルクリックで EditorView 導線を起動する            | `WorkspaceView/index.tsx`, `SourceView.tsx`    |

## 非機能要件

| 要件ID | 要件                                                                            | 実装確認                                             |
| ------ | ------------------------------------------------------------------------------- | ---------------------------------------------------- |
| NFR-01 | HTML/Markdown は sanitize 経路を通す                                            | `sanitize.ts`, `HtmlPreview.tsx`, `MarkdownRenderer` |
| NFR-02 | iframe は `sandbox="allow-same-origin"` と CSP を持つ                           | `HtmlPreview.tsx`                                    |
| NFR-03 | Preview エラーは `role="alert"` で表示する                                      | `PreviewPanel.tsx`, `PreviewErrorBoundary.tsx`       |
| NFR-04 | QuickSearch は `role="dialog"` と focus trap を持つ                             | `QuickFileSearch.tsx`                                |
| NFR-05 | watcher 通知由来の再読込は 300ms debounce とする                                | `useFileWatcher.ts`                                  |
| NFR-06 | `file:read` は 5 秒 timeout + 1 秒間隔 3 回 retry とする                        | `WorkspaceView/index.tsx`                            |
| NFR-07 | Store は既存 selector を再利用し、新規 slice は作らない                         | `WorkspaceView/index.tsx`                            |
| NFR-08 | 用語は Task 5D の `プレビュー / コード表示 / ファイルをすばやく探す` に統一する | `PreviewToolbar.tsx`, `QuickFileSearch.tsx`          |
| NFR-09 | テストは happy-dom + `fireEvent` / renderHook 前提で実装する                    | WorkspaceView 配下の test 群                         |

## 受入観点の固定

- Source / Preview の切替が視覚的に明確であること
- 非対応拡張子で Preview タブが disabled になること
- QuickSearch が誤マッチせず、キーボードだけで完結すること
- timeout / read error / structured parse error が復帰導線付きで surfacing されること
- current build 由来の screenshot を `outputs/phase-11/screenshots/` に固定できること

## 判定

- Phase 1 は完了
- 後続 Phase はこの定義を正本として実装・テスト・手動検証へ接続した
