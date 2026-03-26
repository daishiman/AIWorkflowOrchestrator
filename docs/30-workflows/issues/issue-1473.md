# [#1473] [UT-SC-02-003] Facade の RuntimePolicyResolver 直接生成（DIP 違反 P61再発）

## メタ情報

```yaml
issue_number: 1473
title: [UT-SC-02-003] Facade の RuntimePolicyResolver 直接生成（DIP 違反 P61再発）
state: OPEN
priority: 中
scale: -
category: -
status: 未実施
created_date: 2026-03-22
updated_date: 2026-03-22
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1473
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

RuntimeSkillCreatorFacade のコンストラクタが `new RuntimePolicyResolver()` で具象クラスを直接生成。IRuntimePolicyResolver インターフェースが定義済みなのに DI 注入していない。P61 再発パターン。

## 対応方針

Deps インターフェースに `resolver?: IRuntimePolicyResolver` を追加し、未指定時のみデフォルト生成する。

## 元タスク

TASK-SC-02-RUNTIME-POLICY-CLOSURE

## 優先度

中

## 仕様書パス

`docs/30-workflows/unassigned-task/UT-SC-02-003.md`
