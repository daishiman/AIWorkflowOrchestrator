# [#1431] [UT-SLIDE-UI-HIG-LEGACY-001] 既存 Slide コンポーネント Apple HIG 統一

## メタ情報

```yaml
issue_number: 1431
title: [UT-SLIDE-UI-HIG-LEGACY-001] 既存 Slide コンポーネント Apple HIG 統一
state: OPEN
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-03-21
updated_date: 2026-03-21
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1431
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

SyncStatusIndicator.tsx / SkillPhasePanel.tsx に Tailwind gray クラスが残存。Apple HIG System Colors との統一が不完全。

## 起源

UT-SLIDE-UI-001 Phase 10 MINOR-004

## 対応方針

- SyncStatusIndicator の bg-green-500 等を Apple HIG 色に変更
- SkillPhasePanel の Tailwind gray を Apple HIG 中性灰に変更

## 仕様書

docs/30-workflows/unassigned-task/task-ut-slide-ui-hig-legacy-001.md
