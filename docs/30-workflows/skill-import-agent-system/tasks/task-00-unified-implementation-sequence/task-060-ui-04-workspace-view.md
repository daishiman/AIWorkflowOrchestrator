# TASK-UI-04-WORKSPACE-VIEW: ワークスペース統合画面（ポインタードキュメント）

> **本ファイルは分割されました。** 実装仕様は以下の3ファイルを参照してください。
> **実装 workflow 正本**:
> [04A](../../../completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/index.md) /
> [04B](../../../completed-tasks/task-059a-ui-04b-workspace-chat-panel/index.md) /
> [04C](../../../completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/index.md)

## 分割先

| ファイル                                                                                                                       | 責務                                                                       | 推定ファイル数 |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | -------------- |
| [04A-workspace-layout-filebrowser workflow](../../../completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/index.md)   | 3ペインレイアウト + FileBrowserPanel + StatusBar + リサイズ + ファイル監視 | ~14            |
| [04B-workspace-chat-panel workflow](../../../completed-tasks/task-059a-ui-04b-workspace-chat-panel/index.md)                   | ChatPanel + ファイルコンテキスト連携 + @mention + ストリーミング           | ~10            |
| [04C-workspace-preview-quicksearch workflow](../../../completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/index.md) | PreviewPanel + Source/Preview切替 + QuickFileSearch(Cmd+P) + CSP           | ~12            |

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

| 項目           | 値                                               |
| -------------- | ------------------------------------------------ |
| タスクID       | TASK-UI-04-WORKSPACE-VIEW                        |
| ステータス     | 参照仕様（実装本体は completed workflow で管理） |
| 優先度         | high                                             |
| 複雑度         | large                                            |
| 推定ファイル数 | 32（合計: 04A=14 + 04B=10 + 04C=12、うち重複4）  |
| 依存タスク     | TASK-UI-00, TASK-UI-01, TASK-UI-02               |
