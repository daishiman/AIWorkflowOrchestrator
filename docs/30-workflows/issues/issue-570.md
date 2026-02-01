# [#570] [task-imp-error-reporting-001] エラーレポーティングサービス統合

## メタ情報

```yaml
issue_number: 570
title: [task-imp-error-reporting-001] エラーレポーティングサービス統合
state: OPEN
priority: 低
scale: 中規模
category: 改善
status: 未実施
created_date: 2026-01-29
updated_date: 2026-01-29
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/570
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## タスク概要

| 項目     | 内容                         |
| -------- | ---------------------------- |
| タスクID | task-imp-error-reporting-001 |
| カテゴリ | 改善（imp）                  |
| 優先度   | 低                           |
| 規模     | 中                           |
| 発見元   | コードコメント（TODO）       |

## Why

AuthErrorBoundaryでキャッチされたエラーがローカルのconsole.errorにのみ出力。プロダクション環境でのエラー把握手段がない。

## What

エラートラッキングサービス（Sentry推奨）を統合し、プロダクションエラーの可視化・分析を実現。

## 参照

- 仕様書: `docs/30-workflows/completed-tasks/TASK-CI-FIX-001-fix-backend-lint-next16/unassigned-tasks/task-imp-error-reporting-001.md`
