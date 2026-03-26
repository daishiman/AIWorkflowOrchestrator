# [#1471] [UT-SC-02-001] RuntimeSkillCreatorFacade の subscriptionAuthProvider DI 配線

## メタ情報

```yaml
issue_number: 1471
title: [UT-SC-02-001] RuntimeSkillCreatorFacade の subscriptionAuthProvider DI 配線
state: OPEN
priority: 中
scale: -
category: -
status: 未実施
created_date: 2026-03-22
updated_date: 2026-03-22
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1471
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

`ipc/index.ts` L889 で `new RuntimeSkillCreatorFacade({ skillExecutor, authKeyService })` を生成しているが、`subscriptionAuthProvider` を渡していない。

## 対応方針

main process の初期化コードで `SubscriptionAuthProvider` インスタンスを取得し、`RuntimeSkillCreatorFacadeDeps` に渡す。

## 元タスク

TASK-SC-02-RUNTIME-POLICY-CLOSURE

## 優先度

中

## 仕様書パス

`docs/30-workflows/unassigned-task/UT-SC-02-001.md`
