# [#564] [TASK-CI-FIX-001-U3] apps/web の lint 設定移行

## メタ情報

```yaml
issue_number: 564
title: [TASK-CI-FIX-001-U3] apps/web の lint 設定移行
state: OPEN
priority: 低
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-01-29
updated_date: 2026-01-29
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/564
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## タスク概要

| 項目     | 内容                           |
| -------- | ------------------------------ |
| タスクID | TASK-CI-FIX-001-U3             |
| カテゴリ | 改善                           |
| 優先度   | 低                             |
| 規模     | 小規模                         |
| 発見元   | TASK-CI-FIX-001 元タスク仕様書 |

## Why

apps/backend と同様に、apps/web パッケージの lint スクリプトも `next lint` から `eslint . --cache` に移行が必要。

## What

apps/web の package.json lint スクリプトを直接 ESLint CLI 呼び出しに変更し、eslint.config.mjs を作成する。

## 参照

- 仕様書: `docs/30-workflows/completed-tasks/TASK-CI-FIX-001-fix-backend-lint-next16/unassigned-tasks/task-web-lint-migration.md`
