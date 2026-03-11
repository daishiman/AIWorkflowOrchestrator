# Phase 2 コンポーネント設計

| コンポーネント      | 入力                                                             | 出力 / 責務                                            |
| ------------------- | ---------------------------------------------------------------- | ------------------------------------------------------ |
| `PreviewPanel`      | `filePath`, `extension`, `content`, `size`, `isLoading`, `error` | 表示方式の分岐、fallback、toolbar 接続                 |
| `PreviewToolbar`    | `mode`, `canPreview`, `isWrap`                                   | `コード表示 / プレビュー` の切替と `再読み込み / Wrap` |
| `SourceView`        | `filePath`, `content`, `language`, `isWrap`                      | read-only 行番号付きコード表示                         |
| `HtmlPreview`       | `html`                                                           | sanitize + CSP 付き iframe                             |
| `MarkdownPreview`   | `markdown`                                                       | 既存 MarkdownRenderer による描画                       |
| `StructuredPreview` | `formatted`, `format`                                            | JSON/YAML 整形表示                                     |
| `ImagePreview`      | `content`, `extension`, `size`                                   | 画像表示とメタ情報 toggle                              |
| `QuickFileSearch`   | `isOpen`, `query`, `results`, `selectedIndex`                    | dialog / input / listbox / focus trap                  |

## Props 境界

- Preview component 群は `WorkspaceView` の local state から props 経由でのみ値を受ける
- `QuickFileSearch` は hook の返り値をそのまま受け、Store へ直接触れない
- Toolbar / modal は UI 文言を task 5D 語彙に固定する
