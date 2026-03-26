# [#1551] [UT-TASKSPEC-DRY-REFERENCE-TABLE-001] 参照テーブル DRY 原則強化

## メタ情報

```yaml
issue_number: 1551
title: [UT-TASKSPEC-DRY-REFERENCE-TABLE-001] 参照テーブル DRY 原則強化
state: OPEN
priority: 低
scale: 小規模
category: -
status: 未実施
created_date: 2026-03-24
updated_date: 2026-03-24
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1551
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## タスク概要

各 Phase の参照資料テーブルに共通参照が重複（最大19行 x 13ファイル = 247行）。共通参照を index.md に集約し、各 Phase にはポインタのみ記載するパターンをデフォルト化する。

## 発見元

- タスク: TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001
- Phase: 12 skill-feedback-report.md 改善提案2

## 受入基準

- [ ] テンプレート生成時に共通参照が index.md に自動集約されている
- [ ] 各 Phase ファイルの参照テーブルに共通参照の重複がない
- [ ] 既存タスク仕様書のフォーマットとの後方互換性が維持されている

## 指示書

`docs/30-workflows/unassigned-task/UT-TASKSPEC-DRY-REFERENCE-TABLE-001.md`
