# Phase 4 成果物: token-test-matrix

| テストケース | 対象 token                                                    | 期待値                    | 実装テスト                                                      |
| ------------ | ------------------------------------------------------------- | ------------------------- | --------------------------------------------------------------- |
| TC-04-01     | `bg-primary`, `bg-elevated`                                   | light が純白固定でない    | `light theme の背景階層を純白依存から外す`                      |
| TC-04-02     | `text-tertiary`, `border-primary`, `accent-primary`           | 3テーマで定義済み         | `必須 token が 3テーマすべてで解決できる`                       |
| TC-04-03     | `bg-hover`, `border-color`, `status-*-subtle`, `syntax-*`     | fallback なし未定義参照 0 | `renderer で fallback なし未定義 token 参照が存在しない`        |
| TC-04-04     | `text-primary`, `text-tertiary`, `bg-primary`, `bg-secondary` | 同色化しない              | `代表レンダリングで light の text と background が同色化しない` |

## メモ

- `TC-04-03` は renderer 全体走査で回帰検知を行うため、後続タスクでも再利用可能。
