# Phase 2 成果物: token-contract

## 1. 契約方針

- light theme のまぶしさ低減を最優先に、`surface` をオフホワイト階層へ変更する。
- 未定義 token は「alias で既存契約へ接続」または「明示値追加」で fallback 依存を排除する。
- 3テーマ（light/dark/kanagawa）で同一 token 名を解決可能にする。

## 2. 変更対象 token（確定）

| 区分          | token                                                                                        | 方針                                     |
| ------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------- |
| surface       | `--bg-primary` `--bg-secondary` `--bg-tertiary` `--bg-elevated` `--bg-hover`                 | light をオフホワイト化、hover token 新設 |
| text          | `--text-secondary` `--text-muted` `--text-tertiary`                                          | light の可読性強化、tertiary 新設        |
| border        | `--border-default` `--border-emphasis` `--border-subtle` `--border-primary` `--border-color` | primary/color alias を統一               |
| accent/status | `--accent-primary` + `--status-*-subtle`                                                     | accent alias と subtle 背景色を明示定義  |
| syntax        | `--syntax-operator` `--syntax-punctuation`                                                   | renderer CSS fallback 依存を削減         |

## 3. Light Theme 契約値

| token                     | 値                        |
| ------------------------- | ------------------------- |
| `--bg-primary`            | `#f7f7f5`                 |
| `--bg-secondary`          | `#f0f1ee`                 |
| `--bg-tertiary`           | `#e6e7e3`                 |
| `--bg-elevated`           | `#fcfcfa`                 |
| `--bg-hover`              | `var(--bg-tertiary)`      |
| `--text-primary`          | `#111827`                 |
| `--text-secondary`        | `#334155`                 |
| `--text-muted`            | `#526174`                 |
| `--text-tertiary`         | `#64748b`                 |
| `--border-default`        | `#c4c9d1`                 |
| `--border-emphasis`       | `#aeb6c2`                 |
| `--border-subtle`         | `rgba(51, 65, 85, 0.16)`  |
| `--border-primary`        | `var(--border-default)`   |
| `--border-color`          | `var(--border-default)`   |
| `--status-primary`        | `#0a6ce9`                 |
| `--accent-primary`        | `var(--status-primary)`   |
| `--status-success-subtle` | `rgba(31, 157, 87, 0.14)` |
| `--status-warning-subtle` | `rgba(214, 128, 6, 0.16)` |
| `--status-info-subtle`    | `rgba(79, 70, 229, 0.14)` |
| `--syntax-operator`       | `#7c3aed`                 |
| `--syntax-punctuation`    | `#6b7280`                 |

## 4. Dark / Kanagawa 契約拡張

| token                     | dark                        | kanagawa                        |
| ------------------------- | --------------------------- | ------------------------------- |
| `--text-tertiary`         | `rgba(235, 235, 245, 0.45)` | `rgba(166, 166, 156, 0.55)`     |
| `--border-primary`        | `var(--border-default)`     | `var(--border-default)`         |
| `--border-color`          | `var(--border-default)`     | `var(--border-default)`         |
| `--accent-primary`        | `var(--status-primary)`     | `var(--status-primary)`         |
| `--bg-hover`              | `var(--bg-tertiary)`        | `var(--bg-tertiary)`            |
| `--status-success-subtle` | `rgba(48, 209, 88, 0.2)`    | `rgba(135, 169, 135, 0.2)`      |
| `--status-warning-subtle` | `rgba(255, 159, 10, 0.22)`  | `rgba(255, 158, 59, 0.2)`       |
| `--status-info-subtle`    | `rgba(94, 92, 230, 0.22)`   | `rgba(127, 180, 202, 0.2)`      |
| `--syntax-operator`       | `#ff6961`                   | `var(--kanagawa-dragon-red)`    |
| `--syntax-punctuation`    | `#8e8e93`                   | `var(--kanagawa-dragon-gray-2)` |

## 5. 判定

- [x] token 契約値を確定
- [x] missing token 解消方針を確定
- [x] Phase 3 レビュー入力を作成
