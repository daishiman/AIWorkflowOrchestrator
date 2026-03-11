# Phase 11 手動テスト結果

## preflight

| 項目            | 実測                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| build           | `pnpm --filter @repo/desktop build` PASS                                                                 |
| capture command | `pnpm --filter @repo/desktop run screenshot:task-059b` PASS                                              |
| 配信方式        | current worktree `apps/desktop/out/renderer` を `python3 -m http.server 4173 --directory ...` で静的配信 |
| capture route   | `/?phase11Harness=workspace-layout&skipAuth=true`                                                        |
| metadata        | `screenshots/phase11-capture-metadata.json`                                                              |

## テストケース結果

| テストケース | 観点                        | 期待結果                                                        | 証跡                                           | 結果 |
| ------------ | --------------------------- | --------------------------------------------------------------- | ---------------------------------------------- | ---- |
| TC-11-01     | Source view                 | read-only コード表示と 40px 行番号が見える                      | `screenshots/TC-11-01-source-view.png`         | PASS |
| TC-11-02     | Markdown preview            | Markdown が preview 表示される                                  | `screenshots/TC-11-02-markdown-preview.png`    | PASS |
| TC-11-03     | HTML preview                | iframe sandbox で script 非実行                                 | `screenshots/TC-11-03-html-preview.png`        | PASS |
| TC-11-04     | QuickSearch open            | モーダルが中央に開く                                            | `screenshots/TC-11-04-quick-search-dialog.png` | PASS |
| TC-11-05     | QuickSearch keyboard select | Enter で `config.yaml` を選択し preview に反映                  | `screenshots/TC-11-05-quick-search-select.png` | PASS |
| TC-11-06     | QuickSearch close           | Escape でモーダルが閉じる                                       | `screenshots/TC-11-06-quick-search-close.png`  | PASS |
| TC-11-07     | read error                  | alert と再読み込み導線が見える                                  | `screenshots/TC-11-07-read-error.png`          | PASS |
| TC-11-08     | responsive                  | mobile overlay で panel が破綻しない                            | `screenshots/TC-11-08-mobile-overlay.png`      | PASS |
| TC-11-09     | UX terminology              | `コード表示 / プレビュー / ファイルをすばやく探す` が視認できる | `screenshots/TC-11-09-ux-terminology.png`      | PASS |
| TC-11-10     | modal visual spec           | 幅 480px 前後、角丸 12px、柔らかい影が確認できる                | `screenshots/TC-11-10-modal-visual-spec.png`   | PASS |
| TC-11-11     | coverage alignment          | TC-ID と png 命名規則の対応が視覚的に確認できる                 | `screenshots/TC-11-11-coverage-alignment.png`  | PASS |

## Apple UI/UX 視覚レビュー

| 観点           | 判定 | コメント                                                                       |
| -------------- | ---- | ------------------------------------------------------------------------------ |
| 情報階層       | PASS | 左のファイル一覧、中央の作業領域、右の preview が即座に判別できる              |
| 余白 / リズム  | PASS | パネル角丸と内側余白が一貫しており、視線が散らない                             |
| モーダル品質   | PASS | QuickSearch はやや控えめな影で浮きすぎず、Apple 的な静かな層分けに収まっている |
| 用語一貫性     | PASS | toolbar とモーダルの日本語が役割ベースで揃っている                             |
| mobile overlay | PASS | 暗い scrim と sheet の境界が自然で、閉じ UI も明快                             |

## 総合判定

- 結果: **PASS**
- blocking issue: 0
