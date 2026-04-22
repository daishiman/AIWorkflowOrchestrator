# TASK-RALLY-003: UndoサーバーサイドRollback API追加

## メタ情報

- 検出元: TASK-RALLY-001 Phase 12 レビュー・ラリー機能ギャップ分析
- 優先度: Medium
- GitHub Issue: #2388
- Wave: 3（RALLY-005完了後）
- 前提タスク: RALLY-005（workflowSnapshot更新権限設計確立）
- 後続タスク: RALLY-013（Undo可能範囲の視覚的表現）
- chain_id: RALLY-UNDO-CHAIN-001 (2/2)
- 衝突ドメイン: RuntimeFacade / IPC / ConversationalInterview
- 関連ファイル:
  - `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
  - `apps/desktop/src/main/ipc/` (IPC handler)
  - `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`

## 目的

ラリー中にユーザーが「Undo」操作を行った際、サーバー側（RuntimeFacade）の状態をロールバックする API を追加し、クライアント・サーバー間の状態一貫性を保証する。

## 背景

現状のラリー機能では、Undo はクライアント UI 側のみでの巻き戻しとなっており、RuntimeFacade 側のワークフロースナップショットが旧状態に戻らない。RALLY-005 でIPC更新権限設計が確立された後、Rollback API を追加することで真の Undo 機能を実現する。7ファイルにまたがる変更を伴う大規模チェーン末尾タスク。

## 実行タスク

- [ ] RuntimeSkillCreatorFacade に `rollbackWorkflowSnapshot(stepIndex)` を追加する
- [ ] IPC ハンドラーに rollback チャンネルを追加する
- [ ] ConversationalInterview から rollback IPC を呼び出す Undo ロジックを実装する
- [ ] Rollback 後の状態整合性を検証するテストを追加する
- [ ] undo 可能ステップ数の上限を設計・実装する

## 完了条件

- [ ] Undo 操作でサーバー側スナップショットが指定ステップに巻き戻ること
- [ ] ロールバック後に IPC push イベントで UI が同期されること
- [ ] TypeScript 型チェック PASS
- [ ] 統合テスト PASS

## 苦戦箇所（RALLY-001実装知見）

| 苦戦箇所                    | 問題                                           | 解決策                                     |
| --------------------------- | ---------------------------------------------- | ------------------------------------------ |
| IPC invoke vs push 権限競合 | ロールバック時もpushとinvokeが競合する可能性   | RALLY-005のseqNo排他制御を活用する         |
| 状態の冪等性保証            | 二重ロールバックで不整合が起きないよう設計必要 | stepIndex + timestamp による冪等キーを設計 |

## 参照

- 詳細Phase仕様書: `docs/30-workflows/skill-create-flow-gaps/wave3-seq-RALLY-003/`
- 前提: TASK-RALLY-005（IPC権限設計確立）
- 後続: TASK-RALLY-013（Undo可能範囲の視覚的表現）
