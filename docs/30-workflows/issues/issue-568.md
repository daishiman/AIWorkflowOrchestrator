# [#568] [task-bug-debug-code-removal-001] プロダクションビルド向けデバッグコード除去

## メタ情報

```yaml
issue_number: 568
title: [task-bug-debug-code-removal-001] プロダクションビルド向けデバッグコード除去
state: OPEN
priority: 中
scale: 小規模
category: バグ修正
status: 未実施
created_date: 2026-01-29
updated_date: 2026-01-29
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/568
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## タスク概要

| 項目     | 内容                            |
| -------- | ------------------------------- |
| タスクID | task-bug-debug-code-removal-001 |
| カテゴリ | バグ修正（bug）                 |
| 優先度   | 中                              |
| 規模     | 小                              |
| 発見元   | コードコメント（TODO）          |

## Why

App.tsx に初回起動時ストレージ全クリアのデバッグコード、devMockAuth.ts に認証モックコードが残存。プロダクションビルドでのデータ消失・セキュリティリスク。

## What

App.tsx のデバッグコード除去、devMockAuth.ts の環境変数制御確認。

## 参照

- 仕様書: `docs/30-workflows/completed-tasks/TASK-CI-FIX-001-fix-backend-lint-next16/unassigned-tasks/task-bug-debug-code-removal-001.md`
