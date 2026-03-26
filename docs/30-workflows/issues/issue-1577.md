# [#1577] "[UT-SLIDE-UI-CLOSE-ERROR-001] UT"

## メタ情報

```yaml
task_id: UT-SLIDE-UI-CLOSE-ERROR-001
task_name: UT
category: -
target_feature: -
priority: 低
scale: -
status: 未着手
source_phase: -
created_date: 2026-03-24
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-ut-slide-ui-close-error-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未着手 |

---

## 指摘内容

`useSlideProject.ts` の `closeProject` と `cancelExecution` が失敗時に `console.error` のみで終了し、ユーザーへの UI 通知がない。

## 対応方針

1. `closeProject` の catch ブロックで `store.setError()` を呼び出し、UI にエラーを表示
2. `cancelExecution` も同じ方針で UI へ surfacing する
3. または toast 通知で一時的にエラーを表示

## 関連タスク

- UT-SLIDE-UI-001（起源）
