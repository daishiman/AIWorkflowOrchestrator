# [#1474] [UT-SC-02-004] bundle 構築の二重責務（Resolver/Builder分散）

## メタ情報

```yaml
issue_number: 1474
title: [UT-SC-02-004] bundle 構築の二重責務（Resolver/Builder分散）
state: OPEN
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-03-22
updated_date: 2026-03-22
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1474
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

TerminalHandoffBundle の構築が RuntimePolicyResolver のプライベートメソッドと TerminalHandoffBuilder.build() に分散。shell injection 対策の有無が不均一。

## 対応方針

Resolver の bundle 構築を TerminalHandoffBuilder に委譲し一箇所に統合する。

## 元タスク

TASK-SC-02-RUNTIME-POLICY-CLOSURE

## 優先度

低

## 仕様書パス

`docs/30-workflows/unassigned-task/UT-SC-02-004.md`
