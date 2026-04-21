# Phase 1: 要件定義

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| Phase      | 1                                |
| 機能名     | TASK-RALLY-005                   |
| タスク名   | workflowSnapshot更新権限設計確立 |
| 前提Phase  | -                                |
| 後続Phase  | Phase 2                          |
| 作成日     | 2026-04-21                       |
| ステータス | pending                          |

## 目的

`workflowSnapshot` の更新経路が「IPC invoke 戻り値」と「IPC push イベント（onWorkflowStateChanged）」の二重経路になっており、タイミング競合により正しい質問が表示されなくなる問題を解消する。

## SubAgentチーム編成（並列実行可能部分を明示）

| SubAgent   | 担当                                                                                              | 実行形態                  |
| ---------- | ------------------------------------------------------------------------------------------------- | ------------------------- |
| SubAgent-A | SkillLifecyclePanel.tsx の onWorkflowStateChanged・isSubmitting・applyWorkflowSnapshot の現状調査 | **並列**                  |
| SubAgent-B | creatorHandlers.ts の snapshot 返却箇所・seqNo/updatedAt の有無確認                               | **並列**                  |
| SubAgent-C | packages/shared/src/types/skillCreator.ts の WorkflowSnapshot 型・seqNo フィールド有無確認        | **並列**                  |
| SubAgent-D | A・B・C 結果を統合し受け入れ基準を確定                                                            | **直列**（A・B・C完了後） |

## P50チェック（必須）

```bash
# onWorkflowStateChanged・isSubmitting・pendingPush の現状確認
grep -n "onWorkflowStateChanged\|applyWorkflowSnapshot\|setWorkflowSnapshot\|isSubmitting\|pendingPush" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx | head -40

# creatorHandlers.ts での snapshot 返却箇所確認
grep -n "workflowSnapshot\|WorkflowSnapshot\|seqNo\|updatedAt" \
  apps/desktop/src/main/ipc/creatorHandlers.ts | head -30

# 型定義の現状確認
grep -n "seqNo\|WorkflowSnapshot\|updatedAt" \
  packages/shared/src/types/skillCreator.ts | head -20
```

## 実行タスク

1. SubAgent-A: SkillLifecyclePanel.tsx を読み込み、onWorkflowStateChanged ハンドラの現状実装・isSubmitting フラグの管理箇所・applyWorkflowSnapshot の呼び出し箇所を特定する
2. SubAgent-B: creatorHandlers.ts を読み込み、snapshot を返却する箇所を全件列挙し、seqNo または updatedAt の付与状況を確認する
3. SubAgent-C: packages/shared/src/types/skillCreator.ts を読み込み、WorkflowSnapshot 型の現在のフィールド一覧と seqNo フィールドの有無を確認する
4. SubAgent-D: A・B・C の結果を統合し、設計方針（invoke 正規・push 補完・seqNo 排他制御）の実現可否を判定する

## 受け入れ基準

- AC-1: `workflowSnapshot` の更新経路が「invoke 優先、push は補完かつ古い場合は無視」と一本化され、コードおよびコメントで明示されること
- AC-2: `isSubmitting === true` の間に push イベントが届いた場合、pendingPushRef にキューイングされ、即時 state 更新が発生しないこと
- AC-3: push イベントの seqNo（または updatedAt）が現在の workflowSnapshot の seqNo 以下の場合、更新がスキップされること
- AC-4: `packages/shared/src/types/skillCreator.ts` に seqNo フィールドが型定義として追加されること
- AC-5: `pnpm typecheck` がエラーなしで通過すること
- AC-6: `pnpm lint` がエラーなしで通過すること（exhaustive-deps 警告含む）

## 完了条件

- [ ] SubAgent-A による SkillLifecyclePanel.tsx 現状調査が完了している
- [ ] SubAgent-B による creatorHandlers.ts 現状調査が完了している
- [ ] SubAgent-C による型定義現状調査が完了している
- [ ] SubAgent-D による統合判定が完了し、設計方針が確定している
- [ ] P50チェックの bash コマンドが全件実行済みである
- [ ] 受け入れ基準 AC-1〜AC-6 が検証可能な形で定義されている

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計
