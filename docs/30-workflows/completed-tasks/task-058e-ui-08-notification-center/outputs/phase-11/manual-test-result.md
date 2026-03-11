# Phase 11 手動テスト結果

## 実施概要

- 実行日: 2026-03-11
- 実行方法: `apps/desktop/scripts/capture-task-058e-notification-center-phase11.mjs`
- 証跡: `outputs/phase-11/screenshots/phase11-capture-metadata.json`
- 評価者視点: Apple UI/UX engineer 観点で視覚レビュー

## テストカテゴリ別結果

### 機能テスト

| テストケース | 機能            | 期待結果                                          | 結果 | 備考                                    |
| ------------ | --------------- | ------------------------------------------------- | ---- | --------------------------------------- |
| TC-11-01     | Bell idle badge | 未読数が Bell 右上に表示される                    | PASS | 2件 badge 表示を確認                    |
| TC-11-02     | popover open    | `お知らせ`、`すべて既読`、close が表示される      | PASS | `すべて削除` は見当たらない             |
| TC-11-03     | item expanded   | 1件展開の detail 表示が成立する                   | PASS | 階層は明確                              |
| TC-11-04     | tablet layout   | 右寄せ popover が破綻しない                       | PASS | 横幅 360px が収まる                     |
| TC-11-05     | mobile overlay  | overlay が viewport 内に収まる                    | PASS | close 導線を維持                        |
| TC-11-06     | empty state     | `お知らせはありません` と EmptyState が表示される | PASS | アイコンと文言が一致                    |
| TC-11-07     | delete reveal   | swipe 相当操作で delete affordance が見える       | PASS | 赤い delete action と hit target を確認 |

### アクセシビリティ/操作品質

| テストケース | 要件           | 結果 | 備考                                  |
| ------------ | -------------- | ---- | ------------------------------------- |
| TC-11-A      | Bell 導線      | PASS | icon-only でも認知しやすい            |
| TC-11-B      | close 操作     | PASS | header 右端で見つけやすい             |
| TC-11-C      | list hierarchy | PASS | unread dot と time による優先度が明瞭 |

### スクリーンショットエビデンス

| テストケース | 証跡                                             | 仕様照合結果 | 備考                                   |
| ------------ | ------------------------------------------------ | ------------ | -------------------------------------- |
| TC-11-01     | `screenshots/TC-11-01-desktop-idle-badge.png`    | 一致         | badge の視認性良好                     |
| TC-11-02     | `screenshots/TC-11-02-desktop-popover-open.png`  | 一致         | header / list / hit target 構成は成立  |
| TC-11-03     | `screenshots/TC-11-03-desktop-item-expanded.png` | 一致         | detail inset の階層は成立              |
| TC-11-04     | `screenshots/TC-11-04-tablet-popover-open.png`   | 一致         | tablet でも収まり良好                  |
| TC-11-05     | `screenshots/TC-11-05-mobile-overlay-open.png`   | 一致         | mobile overlay に破綻なし              |
| TC-11-06     | `screenshots/TC-11-06-empty-state.png`           | 一致         | empty state は仕様通り                 |
| TC-11-07     | `screenshots/TC-11-07-desktop-delete-reveal.png` | 一致         | delete affordance の色・幅・文脈が成立 |

## Apple UI/UX 観点レビュー

### 良い点

- 情報階層が明快で、未読ドットとタイトルの重みづけが直感的
- Bell から popover への導線が軽く、header の操作も過不足がない
- mobile でも card の角丸と余白が維持され、圧迫感が少ない

### 軽微な改善余地

- popover 外枠の border/shadow がやや硬く、Apple らしい柔らかいレイヤ感にはあと一歩
- empty state は内部余白が広く、内容密度に対して少し間延びして見える
- expanded detail の背景差は十分だが、本文のコントラストをわずかに上げる余地がある

## 総合判定

- 判定: `PASS`
- 重要度 `高` の視覚不具合はなし
- 改善余地は `MINOR` として Phase 12 に記録する
