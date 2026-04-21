# [#2225] [TASK-SW-TODO-001] ConversationRoundStep 主ツールバッジ TODOコメント整理

## メタ情報

```yaml
issue_number: 2225
title: [TASK-SW-TODO-001] ConversationRoundStep 主ツールバッジ TODOコメント整理
state: OPEN
priority: 低
scale: 小規模
category: リファクタリング
status: 未実施
created_date: 2026-04-16
updated_date: 2026-04-16
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2225
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`ConversationRoundStep.tsx:456-489` の TODOコメント（`UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` 参照）を整理する。コードの機能的変更は最小限にとどめ、コメント整理のみを対象とする。

## 背景

以下の TODOコメントのトリガー条件が完了済みか不明：

```typescript
// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001): 主ツールバッジ - resolveExternalIntegration の主ツール参照ロジック変更後に削除
```

`UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` タスクの完了状況を確認し、TODOを削除または明確化する。

## 最終ゴール

**オプション A（推奨）**: resolveExternalIntegration 変更が不要と判断 → TODOコメント削除・`MAIN_TOOL_BADGE_ENABLED` フラグ削除して直値化

**オプション B**: 将来変更前提 → TODOを具体的条件に書き換え

どちらでも `shouldShowMainToolBadge` の動作は維持。

## 対象ファイル

- `apps/desktop/src/renderer/components/skill-creator/steps/ConversationRoundStep.tsx`

## 仕様書

`docs/30-workflows/p09-par-TODO-001/` （Phase 1-13 完備）
