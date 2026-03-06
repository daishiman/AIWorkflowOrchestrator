# Phase 2 アクセシビリティ仕様

## ランドマーク

| 要素           | 属性                                                |
| -------------- | --------------------------------------------------- |
| ナビ本体       | `role="navigation"`, `aria-label="Main navigation"` |
| セクション     | `role="group"`, `aria-label` に section label       |
| アクティブ項目 | `aria-current="page"`                               |
| More trigger   | `aria-haspopup="menu"`, `aria-expanded`             |
| More menu      | `role="menu"`                                       |
| More item      | `role="menuitem"`                                   |

## キーボード

| キー                    | 動作                                 |
| ----------------------- | ------------------------------------ |
| `ArrowUp` / `ArrowDown` | GlobalNavStrip 内の前後移動          |
| `Home` / `End`          | 先頭/末尾へ移動                      |
| `Enter` / `Space`       | 項目選択                             |
| `Escape`                | More メニューを閉じて trigger へ戻す |
| `Cmd/Ctrl+[`            | 前のビューへ戻る                     |

## フォーカス

- 各 nav item は可視な focus ring を持つ
- More メニュー open 時は先頭 `menuitem` へ移動
- More close 時は trigger へ復帰

## WCAG 観点

- テキストと背景のコントラスト比は 4.5:1 以上
- アイコンのみ状態でも accessible name を保持
- collapsed 表示では tooltip にラベルと shortcut を提示
