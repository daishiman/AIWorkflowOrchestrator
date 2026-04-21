# Phase 7: カバレッジレポート

## coverage 観点

| 観点             | 対象                                | 判定基準                    |
| ---------------- | ----------------------------------- | --------------------------- |
| 旧方言残存       | 変更対象ファイル限定                | camelCase 3組が 0 件        |
| parity           | 変更対象 `.claude` / `.agents` ペア | 差分 0 件                   |
| desktop consumer | fixture / test / `SkillScanner`     | snake_case fixture 契約維持 |
| 依存ゲート       | 先行仕様書 + validator follow-up    | ID とリンクが正しい         |

## スコープ外の明示

- `automation-30` の camelCase 残存は本タスクの FAIL 条件にしない
- `apps/backend` / `packages/shared` は今回の 3 組 6 フィールドの直接 consumer なし
