# [#1592] [TASK-SC-11] AbortController による plan/execute キャンセル実装

## メタ情報

```yaml
issue_number: 1592
title: [TASK-SC-11] AbortController による plan/execute キャンセル実装
state: OPEN
priority: 中
scale: -
category: -
status: 未実施
created_date: 2026-03-24
updated_date: 2026-03-24
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1592
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

handleCancelPlan が UI 状態のクリアだけでなく、進行中の IPC 呼出し（planSkill/executePlan）を AbortController で実際にキャンセルし、ネットワークリソースの無駄遣いと遅延レスポンスによる state 上書きリスクを排除する。

## 背景

現在の handleCancelPlan は generationStep や generationProgress 等の UI 状態をリセットするのみで、バックグラウンドで進行中の planSkill / executePlan の IPC 呼出しは継続する。

問題:

1. **ネットワークリソースの無駄遣い**: キャンセル後も AI API へのリクエストが継続し、トークン消費とネットワーク帯域を浪費
2. **遅延レスポンスによる state 上書き**: キャンセル後にユーザーが別の操作を開始した場合、先行リクエストの遅延レスポンスが新しい state を上書きするリスク

## 変更対象ファイル

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/preload/skill-creator-api.ts`
- `apps/desktop/src/main/handlers/skillCreatorHandlers.ts`

## 受入基準

- [ ] handleCancelPlan 実行時に進行中の IPC 呼出しがキャンセルされること
- [ ] キャンセル後に遅延レスポンスが state を上書きしないこと
- [ ] キャンセル後に新しい plan/execute を正常に開始できること
- [ ] ユーザー起因のキャンセルでエラーメッセージが表示されないこと
- [ ] TypeScript 型チェック PASS
- [ ] 関連テスト全件 PASS

## 参照

- TASK-SC-06-UI-RUNTIME-CONNECTION Phase 10 レビュー（U-3）
- TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE（プログレス更新との連携）
- 指示書: `docs/30-workflows/unassigned-task/TASK-SC-11-ABORT-CONTROLLER-PLAN-CANCEL.md`
