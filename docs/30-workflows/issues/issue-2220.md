# [#2220] [UT-SW-VISUAL-PHASE11-TEMPLATE-STANDARDIZE-001] Phase 11 VISUAL証跡テンプレート標準化

## メタ情報

```yaml
issue_number: 2220
title: [UT-SW-VISUAL-PHASE11-TEMPLATE-STANDARDIZE-001] Phase 11 VISUAL証跡テンプレート標準化
state: OPEN
priority: 低
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-04-16
updated_date: 2026-04-16
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2220
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

TASK-SW-UI-POLISH-001 Phase 12 Skill Feedback で検出された改善候補。VISUAL タスクの Phase 11 証跡成果物（スクリーンショット・メタデータ）の構造が各タスクで異なることを解消するため、テンプレートを標準化する。

## タスク仕様書

`docs/30-workflows/unassigned-task/UT-SW-VISUAL-PHASE11-TEMPLATE-STANDARDIZE-001.md`

## 発見元

TASK-SW-UI-POLISH-001 Phase 12 Skill Feedback（2026-04-16）

## 主な成果物

- `docs/30-workflows/templates/phase11-visual-artifact-template.md`（必須/任意ファイル一覧）
- `docs/30-workflows/templates/phase11-capture-metadata.schema.json`（JSONスキーマ）
- `docs/30-workflows/templates/phase11-screenshot-naming-convention.md`（命名規則）

## 苦戦箇所（発見時の知見）

Phase 11 証跡の必須要件が未明文化であり、タスクごとに証跡構造を一から検討するコストが発生していた。テンプレート化により再設計コストを削減できる。

## 関連タスク

- 発見元: #2157 (TASK-SW-UI-POLISH-001)
- 関連: UT-SW-VISUAL-REGRESSION-SNAPSHOT-001
