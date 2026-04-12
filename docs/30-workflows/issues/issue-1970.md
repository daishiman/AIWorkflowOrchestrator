# [#1970] feat(ui): MultiSelectCheckbox maxSelect プロパティ実装 (W-MC-06)

## メタ情報

```yaml
issue_number: 1970
title: feat(ui): MultiSelectCheckbox maxSelect プロパティ実装 (W-MC-06)
state: OPEN
priority: 低
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-04-06
updated_date: 2026-04-06
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1970
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`MultiSelectCheckbox` コンポーネントに `maxSelect?: number` プロパティを追加し、選択上限に達した際に未選択のチェックボックスを非活性化する。これにより、ユーザーが意図せず上限を超えて選択できないようにする。

## 問題点

- 現状の `MultiSelectCheckboxProps` には `maxSelect?: number` が定義されていない
- スキル仕様で「最大 N 個まで選択可能」という制約があっても、UI 側で制限できない
- `MultiSelectCheckbox.test.tsx` 128 行目に `it.todo("W-MC-06: cannot select more than maxSelect when limit is reached")` が残存

## 実装方針

```tsx
const isMaxReached = maxSelect !== undefined && selectedIds.length >= maxSelect;
const isDisabled =
  disabled || (isMaxReached && !selectedIds.includes(option.id));
```

- `maxSelect` 到達時、未選択チェックボックスに `disabled` を付与
- 選択済みチェックボックスは上限到達後も解除可能
- `maxSelect` 未指定時は従来通り制限なし（後方互換性維持）

## 対象ファイル

- `apps/desktop/src/renderer/components/skill/interview-widgets/MultiSelectCheckbox.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/interview-widgets/MultiSelectCheckbox.test.tsx`

## 仕様書

`docs/30-workflows/unassigned-task/task-multi-select-checkbox-max-select.md`

## タスクID

TASK-UI-W-MC-06

## 優先度

LOW

## 見積もり規模

小規模

## 発見元

TASK-UI-02 Phase 6 (ConversationPanel 孤立解消) 未タスク検出
