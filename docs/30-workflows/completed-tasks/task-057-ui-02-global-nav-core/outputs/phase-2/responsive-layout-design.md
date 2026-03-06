# Phase 2 レスポンシブ設計

| モード            | 条件                                   | ナビ     | 主な寸法  | 補足                   |
| ----------------- | -------------------------------------- | -------- | --------- | ---------------------- |
| desktop expanded  | `>= 1024px` かつ `isNavExpanded=true`  | 左縦ナビ | 200px     | ラベル表示、トグル表示 |
| desktop collapsed | `>= 1024px` かつ `isNavExpanded=false` | 左縦ナビ | 56px      | アイコンのみ           |
| tablet            | `768px <= width < 1024px`              | 左縦ナビ | 56px      | 強制 collapsed         |
| mobile            | `< 768px`                              | 下部ナビ | 高さ 56px | More メニュー使用      |

## コンテンツ余白

| モード           | main padding          |
| ---------------- | --------------------- |
| desktop / tablet | `p-6`                 |
| mobile           | `px-4 pt-2 pb-[88px]` |

## ヘッダー配置

| 領域 | 内容                 |
| ---- | -------------------- |
| 左   | 戻るボタン           |
| 中央 | `DynamicIsland`      |
| 右   | `NotificationCenter` |

## More メニュー

- 表示位置:
  - `document.body` 直下へ portal
  - trigger の上に固定
- 表示内容:
  - `historySearch`, `graph`, `editor`, `settings`
- 閉じ方:
  - item click
  - overlay click
  - Escape
