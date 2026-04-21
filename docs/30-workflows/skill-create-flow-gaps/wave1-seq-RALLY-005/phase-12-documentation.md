# Phase 12: ドキュメント

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 12             |
| 機能名     | TASK-RALLY-005 |
| 前提Phase  | Phase 11       |
| 後続Phase  | Phase 13       |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                                   | 実行形態 |
| ---------- | -------------------------------------- | -------- |
| SubAgent-A | 変更サマリー作成・関連ドキュメント更新 | **直列** |

## 変更サマリー

3ファイルにわたり `workflowSnapshot` の更新権限を「IPC invoke 戻り値を正規ソース・push イベントを補完ソース」として設計確立した。

- `packages/shared/src/types/skillCreator.ts`: `WorkflowSnapshot` 型に `seqNo?: number` フィールド追加
- `apps/desktop/src/main/ipc/creatorHandlers.ts`: snapshot 返却時に seqNo を付与
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`: `workflowSnapshotRef`・`pendingPushRef` 追加、`handleWorkflowStateChanged` に isSubmitting ガードと seqNo 比較ガードを実装

これにより rally-phase-1-analysis.md の懸念点1「push/pull二重経路による冪等性欠如」と懸念点11「送信中競合処理なし」が解消された。

## 中学生レベルの概念説明

IPC（プロセス間通信）には「invoke（問いかけて返事を待つ）」と「push（サーバーから一方的に送られてくる）」の2種類があります。

例えば、答えを送信して「次の質問」を受け取るとき、invoke の返事と push の通知が同時に届くと「どちらが正しいのか」が分からなくなります。これが「競合」です。

本タスクでは「invoke の返事が一番正しい」と決めました。push が来ても、送信中（isSubmitting=true）の場合は「保留ボックス（pendingPushRef）」に入れておき、送信が終わってから確認します。また、seqNo（番号）が古い push は捨てます。

これにより「古い情報で画面が上書きされる」「二重送信になる」という問題が起きなくなります。

## 関連ドキュメント更新

- `docs/30-workflows/00-task-spec-design-docs/rally-phase-1-analysis.md` の懸念点1・11が本タスクで解消されたことを記録する
- `docs/30-workflows/00-task-spec-design-docs/rally-phase-2-solution.md` の RALLY-005 欄に完了記録を追加する

## 完了条件

- [ ] 変更サマリーが作成されている
- [ ] 中学生レベルの概念説明が含まれている
- [ ] 関連ドキュメントへの反映が完了している

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 13: PR作成
