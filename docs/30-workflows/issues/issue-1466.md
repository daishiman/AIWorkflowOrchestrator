# [#1466] feat(ci): canonical チャネルリスト自動突合 CI スクリプト (UT-SLIDE-CI-DRIFT-SCAN-001)

## メタ情報

```yaml
issue_number: 1466
title: feat(ci): canonical チャネルリスト自動突合 CI スクリプト (UT-SLIDE-CI-DRIFT-SCAN-001)
state: OPEN
priority: 低
scale: -
category: 改善
status: 未実施
created_date: 2026-03-22
updated_date: 2026-03-22
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1466
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

canonical チャネルリストと registerAllIpcHandlers の自動突合 CI スクリプト

## 背景

slide-runtime-alignment-impl (#1363) で D1/D2 drift が発見された。再発防止のため CI で自動検出する。

## 参照

- 指示書: docs/30-workflows/unassigned-task/UT-SLIDE-CI-DRIFT-SCAN-001.md
- 関連: #1363
