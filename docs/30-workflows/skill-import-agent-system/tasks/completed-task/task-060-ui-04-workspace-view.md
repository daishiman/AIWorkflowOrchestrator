# TASK-UI-04-WORKSPACE-VIEW: ワークスペース統合画面（ポインタードキュメント）

> **本ファイルは分割されました。** 実装仕様は以下の3ファイルを参照してください。

## canonical workflow root

| 種別                | 参照先                                                                             | 用途                                                                   |
| ------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 親参照仕様 workflow | `../../../completed-tasks/task-060-ui-04-workspace-view/index.md`                  | Phase 1-13 の実行可能な親仕様、canonical path、system spec sync policy |
| 04A 実装 workflow   | `../../../completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/index.md`  | layout / file browser / watcher の実装仕様                             |
| 04B 実装 workflow   | `../../../completed-tasks/task-059a-ui-04b-workspace-chat-panel/index.md`          | chat / mention / stream の実装仕様                                     |
| 04C 実装 workflow   | `../../../completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/index.md` | preview / quick search の実装仕様                                      |

親タスクの責務は `pointer / dependency / canonical path / system spec sync policy` に限定し、実装詳細は workflow root と child workflow を参照する。

## 分割先

| ファイル                                                                                                    | 責務                                                                       | 推定ファイル数 |
| ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------- |
| [04A-workspace-layout-filebrowser.md](../completed-task/task-058b-ui-04a-workspace-layout-filebrowser.md)   | 3ペインレイアウト + FileBrowserPanel + StatusBar + リサイズ + ファイル監視 | ~14            |
| [04B-workspace-chat-panel.md](../completed-task/task-059a-ui-04b-workspace-chat-panel.md)                   | ChatPanel + ファイルコンテキスト連携 + @mention + ストリーミング           | ~10            |
| [04C-workspace-preview-quicksearch.md](../completed-task/task-059b-ui-04c-workspace-preview-quicksearch.md) | PreviewPanel + Source/Preview切替 + QuickFileSearch(Cmd+P) + CSP           | ~12            |

## 分割理由

1. **単一責務原則**: 元ファイル（958行・32ファイル）が3つの独立した責務を内包していた
2. **並列実装可能**: 04A（レイアウト基盤）完了後、04B（Chat）と04C（Preview）は並列実装可能
3. **コンテキスト負荷**: 実装者が1ファイル~300行の仕様を読めば十分になる

## 依存関係

```
04A (Layout + FileBrowser)
  ↓ blocks
04B (ChatPanel)  ←→  04C (PreviewPanel + QuickSearch)
                       ↑ 04C は 04A のレイアウトに組み込まれる
```

04B と 04C は互いに独立で並列実装可能。ただし両方とも 04A のレイアウトコンテナに依存する。

## メタ情報（オリジナル）

| 項目           | 値                                                                              |
| -------------- | ------------------------------------------------------------------------------- |
| タスクID       | TASK-UI-04-WORKSPACE-VIEW                                                       |
| ステータス     | 完了（Phase 1-12 完了 / Phase 13 保留、workflow は completed-tasks へ移管済み） |
| 優先度         | high                                                                            |
| 複雑度         | large                                                                           |
| 推定ファイル数 | 32（合計: 04A=14 + 04B=10 + 04C=12、うち重複4）                                 |
| 依存タスク     | TASK-UI-00, TASK-UI-01, TASK-UI-02                                              |
