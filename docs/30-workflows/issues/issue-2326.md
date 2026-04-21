# [#2326] [UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001] snake_case v1 系 EVALS スキーマを正本へ追記

## メタ情報

```yaml
issue_number: 2326
title: [UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001] snake_case v1 系 EVALS スキーマを正本へ追記
state: OPEN
priority: 中
scale: 小規模
category: 要件
status: 未実施
created_date: 2026-04-19
updated_date: 2026-04-19
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2326
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`aiworkflow-requirements` 正本に snake_case v1 系 EVALS スキーマを追記する。

## 発見元

- TASK-EVALS-CONSUMER-AUDIT-001 Phase 9 / 12
- 判定根拠: [implementation-guide.md §8.2](../blob/docs/task-spec-TASK-EVALS-CONSUMER-AUDIT-001/docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/implementation-guide.md)（schema_origin タグ一覧）

## 仕様書

`docs/30-workflows/unassigned-task/task-evals-spec-snake-case-v1-document-001.md`

## 依存

- 後続: UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001

## 主な苦戦箇所

- snake_case v1 は skill-creator / aiworkflow-requirements / skill-fixture-runner 系のみ、正本未記述
- levels.{N} ツリー / average_satisfaction など camel にないフィールドの意味定義
- camelCase v2 との関係を断定せず両立させる正本スタイル
- dual root（.claude/.agents）両方に反映必要
