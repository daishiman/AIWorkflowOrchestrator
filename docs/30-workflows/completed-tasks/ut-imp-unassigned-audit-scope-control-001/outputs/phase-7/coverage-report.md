# Phase 7 カバレッジ報告

## 実行コマンド

```bash
node --test --experimental-test-coverage .claude/skills/task-specification-creator/scripts/__tests__/audit-unassigned-tasks.test.mjs
```

## 計測結果

- 対象: `audit-unassigned-tasks.js`
- Line: **81.82%**
- Branch: **74.00%**
- Functions: **81.82%**

## しきい値判定

| 指標     | 基準 | 実測   | 判定 |
| -------- | ---- | ------ | ---- |
| Line     | 80%  | 81.82% | PASS |
| Branch   | 60%  | 74.00% | PASS |
| Function | 80%  | 81.82% | PASS |

## 証跡

- `outputs/phase-7/coverage-raw.log`
