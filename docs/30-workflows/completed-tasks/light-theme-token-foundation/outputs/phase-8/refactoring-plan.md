# Phase 8 成果物: refactoring-plan

## 実施内容

| 項目        | 内容                                                               |
| ----------- | ------------------------------------------------------------------ |
| alias 整理  | `--border-primary` / `--border-color` を `--border-default` へ統一 |
| accent 整理 | `--accent-primary` を `--status-primary` alias に固定              |
| hover 整理  | `--bg-hover` を `--bg-tertiary` alias で統一                       |

## リファクタ対象外

- component 直書き色の置換（後続 task）
- screenshot 運用基盤の恒久化（後続 task）

## 契約差分確認

- token-role-matrix の役割定義と実装差分は一致。
- `tokens.light-theme.contract.test.ts` で alias 追加後の整合を確認済み。
