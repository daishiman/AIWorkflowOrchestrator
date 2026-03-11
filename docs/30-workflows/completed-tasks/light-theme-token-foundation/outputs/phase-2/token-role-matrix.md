# Phase 2 成果物: token-role-matrix

## 役割マトリクス

| token 群         | UI責務                                         | 禁止事項                            | 主な利用先                  |
| ---------------- | ---------------------------------------------- | ----------------------------------- | --------------------------- |
| `bg-*`           | 背景階層（ベース/カード/hover）                | 直接色コードで代替しない            | App shell, panel, list item |
| `text-*`         | 文字階層（主/補助/弱調）                       | `text-white` 等の固定色へ回帰しない | 見出し, body, hint          |
| `border-*`       | 境界線と区切り線                               | fallback 依存で誤魔化さない         | card border, divider        |
| `status-*`       | 状態色（主操作/成功/警告/情報/エラー）         | 状態と無関係な装飾利用をしない      | button, badge, callout      |
| `accent-primary` | ブランド主アクセント（`status-primary` alias） | 独立値を別管理しない                | CTA, focus, active          |
| `syntax-*`       | Markdown/Code の可読性                         | テーマごとの未定義放置              | code block                  |

## コントラスト目標（light）

| ペア                              | 目標                            |
| --------------------------------- | ------------------------------- |
| `text-primary` on `bg-primary`    | WCAG AA 4.5:1 以上              |
| `text-secondary` on `bg-primary`  | WCAG AA 4.5:1 以上              |
| `text-tertiary` on `bg-secondary` | UI補助文として 4.5:1 以上を目標 |
| `border-default` on `bg-primary`  | UI component 3:1 以上           |
| `status-primary` on `bg-primary`  | UI component 3:1 以上           |

## downstream 引き継ぎ

| 後続タスク                | 引継ぎ内容                                                           |
| ------------------------- | -------------------------------------------------------------------- |
| shared-color-migration    | 画面側クラス置換時は本 matrix の token 役割を遵守                    |
| contrast-regression-guard | screenshot 判定で `text-tertiary` と `bg-primary` の可読性を必須確認 |

## 判定

- [x] token 役割を固定
- [x] 後続タスクへの契約引き継ぎ条件を固定
