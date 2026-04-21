# [#2327] [UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001] qualityInsights 11 フィールドを正本へ追記

## メタ情報

```yaml
issue_number: 2327
title: [UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001] qualityInsights 11 フィールドを正本へ追記
state: OPEN
priority: 中
scale: 小規模
category: 要件
status: 未実施
created_date: 2026-04-19
updated_date: 2026-04-19
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2327
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`qualityInsights.*` 11 フィールドの役割、writer、運用責任を正本仕様へ追加する。

## 発見元

- TASK-EVALS-CONSUMER-AUDIT-001 Phase 9 / 12
- 判定根拠: [implementation-guide.md](../blob/docs/task-spec-TASK-EVALS-CONSUMER-AUDIT-001/docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/implementation-guide.md) + phase-5/evals-field-map.md §3.\*

## 仕様書

`docs/30-workflows/unassigned-task/task-evals-spec-quality-insights-document-001.md`

## 依存

- 独立

## 主な苦戦箇所

- qualityInsights は representative スキーマ（task-specification-creator 系）のみ、writer 非自動化
- 誰が/いつ/どのトリガーで書き換えるか運用責任未定義
- validator=0 件のため手動更新漏れ silent break を検出できない
- int-test-skill / github-issue-manager 他スキルへの波及判断
