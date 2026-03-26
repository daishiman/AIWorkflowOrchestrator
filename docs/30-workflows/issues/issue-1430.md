# [#1430] [UT-SLIDE-UI-CLOSE-ERROR-001] closeProject エラー通知改善

## メタ情報

```yaml
issue_number: 1430
title: [UT-SLIDE-UI-CLOSE-ERROR-001] closeProject エラー通知改善
state: OPEN
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-03-21
updated_date: 2026-03-21
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1430
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

closeProject/cancelExecution の失敗が console.error で握りつぶされ、UI への通知がない。

## 起源

UT-SLIDE-UI-001 Phase 10 MINOR-003

## 対応方針

- catch ブロックで store.setError() を呼び出し UI にエラーを表示
- または toast 通知で一時的にエラーを表示

## 仕様書

docs/30-workflows/unassigned-task/task-ut-slide-ui-close-error-001.md
