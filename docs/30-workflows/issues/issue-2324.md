# [#2324] [UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001] EVALS スキーマ方言（camelCase / snake_case）統一

## メタ情報

```yaml
issue_number: 2324
title: [UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001] EVALS スキーマ方言（camelCase / snake_case）統一
state: OPEN
priority: 高
scale: 中規模
category: 改善
status: 未実施
created_date: 2026-04-19
updated_date: 2026-04-19
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2324
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 概要

`skill-creator` / `aiworkflow-requirements` 系の snake_case と、`task-specification-creator` 系の camelCase が併存している。EVALS writer / reader の方言を統一し、silent break を防ぐ。

## 発見元

- TASK-EVALS-CONSUMER-AUDIT-001 Phase 12
- 判定根拠: [implementation-guide.md §3.2](../blob/docs/task-spec-TASK-EVALS-CONSUMER-AUDIT-001/docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/implementation-guide.md)（camelCase/snake_case 二重スキーマ併存）

## 仕様書

`docs/30-workflows/unassigned-task/task-evals-schema-dialect-unification-001.md`

## 依存

- 先行: UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001（正本スキーマ決定）
- 後続: UNASSIGNED-EVALS-VALIDATOR-GUARD-001

## 主な苦戦箇所

- camelCase と snake_case が 3 組 6 フィールド（currentLevel/current_level 等）で並立
- skill-creator 内で init（camelCase）と log_usage（snake_case）のミスマッチ
- fixture が snake_case を test 契約として固定（TC-004 修正必須）
- validator=0 件のため中間状態の silent break を検出できない
