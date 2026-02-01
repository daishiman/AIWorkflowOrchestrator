# [#566] [TASK-CI-FIX-001-U5] packages/shared の no-explicit-any warning 解消

## メタ情報

```yaml
issue_number: 566
title: [TASK-CI-FIX-001-U5] packages/shared の no-explicit-any warning 解消
state: OPEN
priority: 低
scale: 中規模
category: リファクタリング
status: 未実施
created_date: 2026-01-29
updated_date: 2026-01-29
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/566
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## タスク概要

| 項目     | 内容                |
| -------- | ------------------- |
| タスクID | TASK-CI-FIX-001-U5  |
| カテゴリ | リファクタリング    |
| 優先度   | 低                  |
| 規模     | 中規模              |
| 発見元   | Phase 11 手動テスト |

## Why

packages/shared に4件の `@typescript-eslint/no-explicit-any` 警告が存在。TypeScript型安全性の確保が必要。

## What

4件の `any` 型使用箇所を適切な型定義に置き換える。

## 参照

- 仕様書: `docs/30-workflows/completed-tasks/TASK-CI-FIX-001-fix-backend-lint-next16/unassigned-tasks/task-shared-no-explicit-any-fix.md`
