# Phase 6 監査分離ログ

## 実行コマンド

```bash
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json --diff-from HEAD
```

## 結果

| 指標                     | 値               |
| ------------------------ | ---------------- |
| currentViolations.total  | 0                |
| baselineViolations.total | 97               |
| 判定                     | PASS（今回差分） |

## 解釈ルール

- 合否は `currentViolations.total` を正本に判定。
- `baselineViolations` は既存負債監視値として分離記録。
