# [#1506] [UT-CHATPANEL-PROPS-ROLE-TYPE] ChatPanelProps role 型追加検討

## メタ情報

```yaml
issue_number: 1506
title: [UT-CHATPANEL-PROPS-ROLE-TYPE] ChatPanelProps role 型追加検討
state: OPEN
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-03-23
updated_date: 2026-03-23
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1506
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

`ChatPanelProps` に `role?: 'mainline' | 'review-harness'` 型を追加し、コンパイル時にコンポーネントの役割を型で表現できるか評価・決定する。

## 背景

- 検出元: TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001 Phase 3 設計レビュー MINOR-B
- 現状は JSDoc `@role review-harness` で役割を記述。型として表現するとコンパイル時検証が可能
- P46（HTMLAttributes 型衝突パターン）への対策が必要（`role` は HTML 標準属性との衝突リスク）

## スコープ

- P46 衝突評価（`Omit<HTMLAttributes, 'role'>` が必要か判定）
- 型追加の場合の Props 設計
- JSDoc との共存または移行方針の決定

## 仕様書

`docs/30-workflows/unassigned-task/ut-chatpanel-props-role-type.md`
