# [#1118] [TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001] App.tsx debug storage clear削除

## メタ情報

```yaml
issue_number: 1118
title: [TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001] App.tsx debug storage clear削除
state: CLOSED
priority: -
scale: -
category: -
status: -
created_date: 2026-03-09
updated_date: 2026-03-09
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1118
dependencies: []
```

| 項目       | 内容 |
| ---------- | ---- |
| 優先度     | -    |
| 規模       | -    |
| ステータス | -    |

---

## 概要

App.tsx に残っていた debug 用の storage clear / forced reload を除去し、persist 状態破壊と起動時エラーを解消する task です。

## 目的

- localStorage.clear() の起動時実行を除去する
- forced reload を止めて BROWSER_GET_LAST_WEB_PREFERENCES エラーを防ぐ
- Phase 11/12/13 の成果物と follow-up unassigned task を同期する

## 関連 workflow

- docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/

## Follow-up

- #1115
- #1116
- #1117
