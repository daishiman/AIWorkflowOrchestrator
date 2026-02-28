# Phase 12 未タスク検出レポート

## 検出結果サマリー

| ソース                           | 検出数  |
| -------------------------------- | ------- |
| Phase 3 レビュー指摘             | 0件     |
| Phase 10 レビュー指摘            | 0件     |
| Phase 11 手動テスト              | 0件     |
| 各成果物の TODO/FIXME            | 0件     |
| コードベース TODO/FIXME/HACK/XXX | 0件     |
| 苦戦箇所からの派生課題           | 0件     |
| **合計**                         | **0件** |

## 検出タスク一覧

検出タスクなし。

## 実施コマンド

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan packages/shared/src/types \
  --output docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/outputs/phase-12/.tmp-unassigned-candidates.json

node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

## 判定

- `currentViolations.total` を合否判定値とする。
- `baselineViolations.total` は監視値として別枠記録する。
