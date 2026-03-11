# Phase 1 スコープ定義

## In Scope

- `WorkspaceView` への PreviewPanel 統合
- `QuickFileSearch` モーダルと検索 hook
- `file:read` timeout / retry / watcher 再読込
- HTML/Markdown/JSON/YAML/Image の preview 表示
- SourceView の read-only / 行番号 / EditorView 導線
- Phase 11 screenshot 再取得と Phase 12 文書同期

## Out of Scope

- 新規 Main IPC channel の追加
- Editor 本体の編集 UI
- RAG 検索や chat 本体ロジックの追加
- Phase 13 の commit / PR 作成

## 境界

| 境界           | 04C の責務                                | 他タスクへ委譲する責務                      |
| -------------- | ----------------------------------------- | ------------------------------------------- |
| 04A            | Preview slot への差し込み、watcher 再利用 | layout mode / resize / overlay shell の基盤 |
| 04B            | file 選択を背景情報へ渡す導線             | chat 入力、mention、streaming 表示          |
| Main / Preload | 既存 `file:*` の再利用                    | 新規 API / channel 追加                     |

## 判定

- Scope creep なし
- 04A / 04B / 04C の責務衝突なし
