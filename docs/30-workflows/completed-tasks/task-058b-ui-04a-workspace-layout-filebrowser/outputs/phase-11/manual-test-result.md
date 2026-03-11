# Phase 11 手動テスト結果

## preflight

| 項目             | 実測                                                                 |
| ---------------- | -------------------------------------------------------------------- |
| build            | `pnpm build` PASS                                                    |
| capture route    | `/?phase11Harness=workspace-layout`                                  |
| 配信方式         | current worktree `apps/desktop/out/renderer` を static server で配信 |
| base URL         | `http://127.0.0.1:4173`                                              |
| capture metadata | `outputs/phase-11/screenshots/phase11-capture-metadata.json`         |

## テストケース

| テストケース | 観点              | 証跡                                                | 結果 | 備考                                   |
| ------------ | ----------------- | --------------------------------------------------- | ---- | -------------------------------------- |
| TC-11-01     | desktop 初期表示  | `screenshots/TC-11-01-chat-only-light.png`          | PASS | chat-only の初期状態                   |
| TC-11-02     | desktop 3-pane    | `screenshots/TC-11-02-3-pane-dark.png`              | PASS | file + chat + preview を同時表示       |
| TC-11-03     | resize            | `screenshots/TC-11-03-resize-after-drag.png`        | PASS | drag 後もレイアウトが破綻しない        |
| TC-11-04     | tablet mode       | `screenshots/TC-11-04-tablet-chat-files.png`        | PASS | 1 sidebar のみ表示                     |
| TC-11-05     | mobile overlay    | `screenshots/TC-11-05-mobile-overlay.png`           | PASS | overlay と scrim が分離                |
| TC-11-06     | tree keyboard nav | `screenshots/TC-11-06-tree-keyboard-nav.png`        | PASS | focus 移動と展開動作を確認             |
| TC-11-07     | status bar        | `screenshots/TC-11-07-status-bar-selected-file.png` | PASS | path / ext / size / watch state を確認 |
| TC-11-08     | watcher update    | `screenshots/TC-11-08-watcher-updated-preview.png`  | PASS | 変更後 preview が再読込される          |

## テストカテゴリ別結果

### 機能テスト（正常系）

| テストケース | 機能       | 期待結果                                      | 結果 | 備考                                  |
| ------------ | ---------- | --------------------------------------------- | ---- | ------------------------------------- |
| TC-11-01     | 初期表示   | `chat-only` が表示される                      | PASS | light theme                           |
| TC-11-02     | 3-pane     | 3列が同時に表示される                         | PASS | dark theme                            |
| TC-11-03     | resize     | file / preview panel の drag が直感どおり動く | PASS | reverse resize 修正後                 |
| TC-11-04     | tablet     | 1 sidebar に圧縮される                        | PASS | `chat+files`                          |
| TC-11-05     | mobile     | overlay panel を開閉できる                    | PASS | scrim 付き                            |
| TC-11-07     | status bar | selected file 情報を表示する                  | PASS | `README.md`, `md`, `29 B`, `watching` |
| TC-11-08     | watcher    | preview が変更後内容を反映する                | PASS | watcher push 後の再読込               |

### アクセシビリティテスト

| テストケース | 要件                   | 結果 | WCAG違反 |
| ------------ | ---------------------- | ---- | -------- |
| TC-11-06     | tree keyboard nav      | PASS | なし     |
| TC-11-05     | overlay close          | PASS | なし     |
| TC-11-07     | status bar live region | PASS | なし     |

## 画面カバレッジマトリクス

| テストケース | 表示状態                 | テーマ | 証跡                                                | 判定 |
| ------------ | ------------------------ | ------ | --------------------------------------------------- | ---- |
| TC-11-01     | chat-only                | light  | `screenshots/TC-11-01-chat-only-light.png`          | PASS |
| TC-11-02     | 3-pane                   | dark   | `screenshots/TC-11-02-3-pane-dark.png`              | PASS |
| TC-11-03     | resize after drag        | light  | `screenshots/TC-11-03-resize-after-drag.png`        | PASS |
| TC-11-04     | tablet chat+files        | light  | `screenshots/TC-11-04-tablet-chat-files.png`        | PASS |
| TC-11-05     | mobile overlay           | light  | `screenshots/TC-11-05-mobile-overlay.png`           | PASS |
| TC-11-06     | tree keyboard nav        | light  | `screenshots/TC-11-06-tree-keyboard-nav.png`        | PASS |
| TC-11-07     | status bar selected file | light  | `screenshots/TC-11-07-status-bar-selected-file.png` | PASS |
| TC-11-08     | watcher updated preview  | light  | `screenshots/TC-11-08-watcher-updated-preview.png`  | PASS |

## Apple UI/UX 視覚レビュー

| 観点                 | 判定 | コメント                                                         |
| -------------------- | ---- | ---------------------------------------------------------------- |
| 情報階層             | PASS | 左 navigation、中央作業領域、右 preview の役割が一目で分かれる   |
| 余白 / リズム        | PASS | rounded panel と status bar の区切りが安定している               |
| 操作 affordance      | PASS | toggle、resize、overlay の挙動が視覚的に自然                     |
| light theme contrast | PASS | 初回 screenshot で弱かった補助テキストを調整し、再撮影で改善確認 |
| mobile sheet quality | PASS | panel と背景の分離が明確で、sheet として自然                     |

## 仕様照合結果サマリー

| 確認項目           | 結果 |
| ------------------ | ---- |
| レイアウト一致     | PASS |
| カラーパレット準拠 | PASS |
| 8pxグリッド準拠    | PASS |
| ダークモード確認   | PASS |
| エラー状態UI       | PASS |

## 総合判定

- 結果: **PASS**
- blocking issue は検出されなかった。
