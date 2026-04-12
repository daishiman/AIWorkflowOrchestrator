# [#2071] feat(skill-wizard): UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001 Q5 複数選択時の「主ツール」UI表示

## メタ情報

```yaml
issue_number: 2071
title: feat(skill-wizard): UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001 Q5 複数選択時の「主ツール」UI表示
state: OPEN
priority:  low
scale: -
category: -
status: -
created_date: 2026-04-09
updated_date: 2026-04-09
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2071
dependencies: []
```

| 項目       | 内容 |
| ---------- | ---- |
| 優先度     | low  |
| 規模       | -    |
| ステータス | -    |

---

## タスク概要

Q5 で複数の外部ツールを選択した際、内部的には先頭選択値が「主ツール」として参照されるが、UI 上ではすべての選択肢が同等に表示されている。この非対称性をユーザーに伝えるため、先頭選択項目に「主ツール」バッジを表示する。

## 背景・なぜ必要か

- `resolveExternalIntegration` は `selectedOptions[0]` を「主ツール」として参照するが、UI 上では複数のチェックボックスが同等に表示されている
- 選択順序によって主ツールが変わるが、ユーザーは選択順序を意識していない
- 複数選択可能になったが「最初に選んだものが主ツール」というルールが不透明なまま
- `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001`（並列統合対応）が実装されるまでの暫定的な「主ツール明示」として必要（OPT-MSO-002 として登録）

## 受入条件

- AC-1: Q5 で2つ以上のツールが選択された際に、最初の選択肢に「主ツール」バッジが表示される
- AC-2: 1つのみ選択されている場合は「主ツール」バッジが表示されない
- AC-3: `aria-label` に「主ツールとして使用される」情報が含まれる
- AC-4: `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` 完了後にバッジ表示が不要になった場合の削除が容易な設計
- AC-5: Phase 11 と同等のスクリーンショット証跡で視覚的変更が確認される
- AC-6: `ConversationRoundStep.test.tsx` が Q5 複数選択時のバッジ表示を検証する

## 発見元

skill-wizard-multi-select-options Phase 12 未タスク検出（2026-04-09）

## 参照仕様書

`docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001.md`
