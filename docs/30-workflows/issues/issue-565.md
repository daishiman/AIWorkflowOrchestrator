# [#565] [TASK-CI-FIX-001-U4] .eslintignore → eslint.config.js ignores 移行

## メタ情報

```yaml
issue_number: 565
title: [TASK-CI-FIX-001-U4] .eslintignore → eslint.config.js ignores 移行
state: OPEN
priority: 低
scale: 小規模
category: リファクタリング
status: 未実施
created_date: 2026-01-29
updated_date: 2026-01-29
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/565
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## タスク概要

| 項目     | 内容                |
| -------- | ------------------- |
| タスクID | TASK-CI-FIX-001-U4  |
| カテゴリ | リファクタリング    |
| 優先度   | 低                  |
| 規模     | 小規模              |
| 発見元   | Phase 11 手動テスト |

## Why

ESLint 9.x flat config では `.eslintignore` ファイルが非推奨。`eslint.config.js` の `ignores` プロパティに移行が必要。

## What

ルートの `.eslintignore` ファイルを `eslint.config.js` の ignores プロパティに移行し、警告を解消する。

## 参照

- 仕様書: `docs/30-workflows/completed-tasks/TASK-CI-FIX-001-fix-backend-lint-next16/unassigned-tasks/task-eslintignore-flat-config-migration.md`
