# Phase 11 スクリーンショットカバレッジ

## カバレッジサマリー

| 区分                | 計画 | 実績 | 判定 |
| ------------------- | ---- | ---- | ---- |
| 必須視覚状態 [A][B] | 5    | 5    | 100% |
| 非視覚TC            | 2    | 2    | 100% |

## TC-ID と画像対応

| テストケース | 撮影ファイル                                               | 仕様照合結果 | 備考                                             |
| ------------ | ---------------------------------------------------------- | ------------ | ------------------------------------------------ |
| TC-11-01     | `screenshots/TC-11-01-desktop-expanded-dashboard.png`      | 一致         | expanded rail、header、active state を確認       |
| TC-11-02     | `screenshots/TC-11-02-tablet-collapsed-focus.png`          | 一致         | collapsed rail と focus ring を確認              |
| TC-11-03     | `screenshots/TC-11-03-mobile-default.png`                  | 一致         | primary 5 の配置を確認                           |
| TC-11-03     | `screenshots/TC-11-03-mobile-more-menu.png`                | 一致         | More 4項目と active trigger を確認               |
| TC-11-04     | `screenshots/TC-11-04-desktop-history-search-shortcut.png` | 一致         | shortcut 後の active state と back button を確認 |
| TC-11-05     | `NON_VISUAL: editable guard`                               | 一致         | Playwright で確認                                |
| TC-11-06     | `NON_VISUAL: go back`                                      | 一致         | Playwright で確認                                |

## Apple UI/UX レビュー

- desktop rail は過剰に主張せず、情報階層が明瞭。
- mobile More sheet はネイティブ感があり、下部ナビの混雑を避けられている。
- tablet collapsed は focus 導線が読み取れ、キーボード利用の確認に十分。

## 軽微な観察事項

- mobile では nav 自体より既存 dashboard 本文のコントラストが弱く見える。
- tablet 画像に viewer/canvas 由来と思われる右端の黒帯が見えるが、ナビの整列自体は崩れていない。
