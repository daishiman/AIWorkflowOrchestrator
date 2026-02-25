# Phase 4 テスト仕様（Red）

## SubAgent設計結果

| SubAgent   | 観点     | ケース                     |
| ---------- | -------- | -------------------------- |
| SubAgent-A | 正常系   | TC-001〜TC-004             |
| SubAgent-B | 異常系   | TC-005                     |
| Lead       | 判定統合 | current/baseline/exit code |

## テストケース

| ID     | 種別    | 目的                     | 期待値                           |
| ------ | ------- | ------------------------ | -------------------------------- |
| TC-001 | normal  | full mode互換            | 全体違反で exit 1                |
| TC-002 | normal  | target-file baseline分離 | current 0 / baseline >0 / exit 0 |
| TC-003 | normal  | target-file current違反  | current >0 / exit 1              |
| TC-004 | edge    | diff-from scope判定      | diff対象のみ current へ分類      |
| TC-005 | invalid | 不正target-file          | exit 2                           |

## Red証跡

- 実行ログ: `outputs/phase-4/pre-implementation-red.log`
- 観測: `--target-file` / `--diff-from` 指定時も旧実装は全体監査で同一結果（scope分離未実装）

## 判定

- [x] 正常/境界/異常を網羅
- [x] すべてのケースに期待値定義済み
