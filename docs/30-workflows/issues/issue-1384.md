# [#1384] [UT-IMP-ICON-MAP-ANALYSIS-ICONS-001] Icon map への分析系アイコン追加（edit-2 / bar-chart-2）

## メタ情報

```yaml
issue_number: 1384
title: [UT-IMP-ICON-MAP-ANALYSIS-ICONS-001] Icon map への分析系アイコン追加（edit-2 / bar-chart-2）
state: OPEN
priority: 低
scale: 小規模
category: -
status: 未実施
created_date: 2026-03-19
updated_date: 2026-03-19
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1384
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

Icon コンポーネントの icon map に `edit-2`（lucide-react Edit2）と `bar-chart-2`（lucide-react BarChart2）を追加する。

## 背景

TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 の Phase 5 実装時に、設計書で指定した `leftIcon="edit-2"` / `leftIcon="bar-chart-2"` が Icon コンポーネントの icon map に未登録であることが判明。現在は `pencil` / `eye` で代替中。

## 対象ファイル

- `apps/desktop/src/renderer/components/atoms/Icon/index.tsx`
- `apps/desktop/src/renderer/components/atoms/Icon/Icon.test.tsx`

## 受入基準

- [ ] `<Icon name="edit-2" />` がレンダリングされる
- [ ] `<Icon name="bar-chart-2" />` がレンダリングされる
- [ ] 既存の Icon テストが全て PASS する

## 仕様書

`docs/30-workflows/unassigned-task/task-imp-icon-map-analysis-icons-001.md`
