# [#1600] [TASK-SC-15] Store 競合防止 UI 制御

## メタ情報

```yaml
issue_number: 1600
title: [TASK-SC-15] Store 競合防止 UI 制御
state: OPEN
priority: 低
scale: -
category: -
status: -
created_date: 2026-03-25
updated_date: 2026-03-25
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1600
dependencies: []
```

| 項目       | 内容 |
| ---------- | ---- |
| 優先度     | 低   |
| 規模       | -    |
| ステータス | -    |

---

## 概要

SkillCreateWizard と SkillLifecyclePanel が同一 agentSlice の generationState を共有する際の競合を防止する UI ガードを実装する。

## 背景

TASK-SC-07 完了により、SkillCreateWizard と SkillLifecyclePanel の両方が agentSlice の generationState を操作するようになった。現在は同時アクティブにならない UI 設計で回避しているが、将来の UI 変更で競合が発生するリスクがある。

TASK-SC-10（agentSlice から generationSlice 分割）の実施後に対応するのが効率的。

## 対応内容

- generationState の「所有者」追跡フィールドの追加
- 生成中の他コンポーネントからのガード処理
- 「他の場所で生成中です」通知 UI
- useEffect cleanup での所有権リセット

## 仕様書

`docs/30-workflows/unassigned-task/TASK-SC-15-STORE-COMPETITION-PREVENTION.md`

## 関連

- 検出元: TASK-SC-07 Phase 12 レビュー
- 前提タスク: #1591 (TASK-SC-10 agentSlice 分割)
- 関連 Issue: #1588 (TASK-SC-07)
