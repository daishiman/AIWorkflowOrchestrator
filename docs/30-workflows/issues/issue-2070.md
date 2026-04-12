# [#2070] feat(skill-wizard): UT-SKILL-WIZARD-MSO-LABEL-HINT-001 設問ラベルへの「複数選択可」明示案内追加

## メタ情報

```yaml
issue_number: 2070
title: feat(skill-wizard): UT-SKILL-WIZARD-MSO-LABEL-HINT-001 設問ラベルへの「複数選択可」明示案内追加
state: OPEN
priority:  low
scale: -
category: -
status: -
created_date: 2026-04-09
updated_date: 2026-04-09
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2070
dependencies: []
```

| 項目       | 内容 |
| ---------- | ---- |
| 優先度     | low  |
| 規模       | -    |
| ステータス | -    |

---

## タスク概要

Q1〜Q6 の設問が複数選択可能になったが、設問ラベルに「複数選択可能」という案内が表示されていない。アフォーダンス不足を解消するため、設問ラベルに「複数選択可」の案内テキストおよびアクセシビリティ属性を追加する。

## 背景・なぜ必要か

- `skill-wizard-multi-select-options` タスクにより設問回答が複数選択可能になったが、ラベルに案内がない
- Phase 11 AI UX評価で「選択肢が複数選べることがラベルから読み取れない」というアフォーダンス不足が指摘された（OPT-MSO-001 として登録）
- ユーザーが「1つしか選べない」と思い込み、複数選択を試みない可能性がある
- `aria-label` や `aria-describedby` に「複数選択可」の情報がなく、アクセシビリティ基準（WCAG 2.1 1.3.1）への対応が不完全

## 受入条件

- AC-1: 設問ラベルに「複数選択可」（または同等の案内）が表示される
- AC-2: `aria-label` または `aria-describedby` に複数選択可能であることが含まれる
- AC-3: 単一選択専用の設問（存在する場合）では案内が表示されない（設問ごとの制御）
- AC-4: Phase 11 と同等のスクリーンショット証跡で視覚的変更が確認される
- AC-5: `ConversationRoundStep.test.tsx` が案内テキストの表示・非表示を検証する

## 発見元

skill-wizard-multi-select-options Phase 12 未タスク検出（2026-04-09）

## 参照仕様書

`docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-MSO-LABEL-HINT-001.md`
