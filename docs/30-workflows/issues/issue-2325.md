# [#2325] [UNASSIGNED-EVALS-VALIDATOR-GUARD-001] EVALS.json validator 追加（validator=0 件の解消）

## メタ情報

```yaml
issue_number: 2325
title: [UNASSIGNED-EVALS-VALIDATOR-GUARD-001] EVALS.json validator 追加（validator=0 件の解消）
state: OPEN
priority: 高
scale: 中規模
category: 改善
status: 未実施
created_date: 2026-04-19
updated_date: 2026-04-19
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2325
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 概要

`validate-schemas.js` / `validate-skill-structure.js` に EVALS.json 検証を追加し、validator=0 件状態を解消する。

## 発見元

- TASK-EVALS-CONSUMER-AUDIT-001 Phase 12
- 判定根拠: [implementation-guide.md §3.1](../blob/docs/task-spec-TASK-EVALS-CONSUMER-AUDIT-001/docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/implementation-guide.md)（validator=0 件）

## 仕様書

`docs/30-workflows/unassigned-task/task-skill-fixture-runner-evals-schema-validate-001.md`

## 依存

- 先行推奨: UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001
- 後続: UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001

## 主な苦戦箇所

- validator=0 件 = schema-change-guide §7 の 3 カテゴリ手動検証が唯一のガード
- camelCase/snake_case 両方言を扱う必要あり
- fixture EVALS（TC-004 契約固定）の特別扱い判断
- 動的パス consumer 13 件のため検証対象列挙が単純 glob では不足
