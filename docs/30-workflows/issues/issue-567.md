# [#567] [task-ref-community-test-sync-001] Community統合テストとUI実装の同期修正

## メタ情報

```yaml
issue_number: 567
title: [task-ref-community-test-sync-001] Community統合テストとUI実装の同期修正
state: OPEN
priority: 中
scale: 小規模
category: リファクタリング
status: 未実施
created_date: 2026-01-29
updated_date: 2026-01-29
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/567
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## タスク概要

| 項目     | 内容                             |
| -------- | -------------------------------- |
| タスクID | task-ref-community-test-sync-001 |
| カテゴリ | リファクタリング（ref）          |
| 優先度   | 中                               |
| 規模     | 小                               |
| 発見元   | コードコメント（TODO）           |

## Why

community-integration.test.tsx に4箇所のTODOコメントが存在し、テストケースがCommunityGraph UIコンポーネントの実装と不一致。

## What

4つのTODO箇所を解消し、テストとUI実装を完全に同期させる。

## 参照

- 仕様書: `docs/30-workflows/completed-tasks/TASK-CI-FIX-001-fix-backend-lint-next16/unassigned-tasks/task-ref-community-test-sync-001.md`
