# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 12                       |
| タスクID   | TASK-RALLY-003           |
| 機能名     | undo-server-rollback-api |
| 前提Phase  | Phase 11                 |
| 後続Phase  | Phase 13                 |
| 作成日     | 2026-04-21               |
| ステータス | pending                  |

## 目的

変更内容をドキュメントとして記録し、RALLY-UNDO-CHAIN-001 の完了を記録する。

## 変更サマリー

Undo 操作がサーバー側の状態を巻き戻さずに UI 表示のみ戻っていた問題（RALLY-003）を解消した。

以下の変更により、Undo 操作が IPC 経由でサーバー側の `awaitingUserInput` を前の質問状態に巻き戻し、サーバー状態と UI 状態が同期して巻き戻されるようになった。

| ファイル                                    | 変更内容                                              |
| ------------------------------------------- | ----------------------------------------------------- |
| `packages/shared/src/ipc/channels.ts`       | `SKILL_CREATOR_UNDO_USER_INPUT` チャンネル定数追加    |
| `packages/shared/src/types/skillCreator.ts` | `UndoUserInputRequest` / `UndoUserInputResult` 型追加 |
| `apps/desktop/src/preload/channels.ts`      | allowedChannels にチャンネル追加                      |
| `RuntimeSkillCreatorFacade.ts`              | `rollbackLastInput(planId)` メソッド追加              |
| `creatorHandlers.ts`                        | `skill-creator:undo-user-input` IPC ハンドラ追加      |
| `preload/skill-creator-api.ts`              | `undoUserInput` API 追加                              |
| `ConversationalInterview.tsx`               | `handleUndo` を IPC 呼び出し対応に更新                |

## 中学生レベルの概念説明

**サーバー側の状態巻き戻しとは何か？**

「元に戻す」ボタンを押したとき、画面の表示は戻るけど、サーバー（バックエンドのコンピューター）はまだ「進んだ状態」のままだと、次に答えを送ったときに「あれ、この質問はもう終わったはずなのに？」と混乱してしまいます。

今回の変更では、「元に戻す」ボタンを押したとき、画面の表示だけでなく、サーバー側の状態も一緒に前の質問に戻るようにしました。これにより、画面とサーバーが常に同じ「どこまで進んだか」を把握できるようになります。

## chain 完了記録

| chain_id             | 完了条件                                                                 | 充足確認                      |
| -------------------- | ------------------------------------------------------------------------ | ----------------------------- |
| RALLY-UNDO-CHAIN-001 | Undo 操作がサーバー状態を巻き戻し、UI とサーバーが同期した状態になること | Phase 11 手動テストで確認済み |

## 更新すべきドキュメント

| ドキュメント                                                           | 更新内容                    | 優先度 |
| ---------------------------------------------------------------------- | --------------------------- | ------ |
| `docs/30-workflows/skill-create-flow-gaps/index.md`                    | RALLY-003完了ステータス更新 | 必須   |
| `docs/30-workflows/00-task-spec-design-docs/rally-phase-1-analysis.md` | 懸念点7 解消済みマーク      | 推奨   |

## 参照資料

| 資料名         | パス                                        | 用途            |
| -------------- | ------------------------------------------- | --------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md`    | Phase 11 成果物 |
| 実装サマリー   | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物  |

## 成果物

| 成果物           | パス                                          | 説明                          |
| ---------------- | --------------------------------------------- | ----------------------------- |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`    | IPC 4層追加の詳細ガイド       |
| 仕様更新サマリー | `outputs/phase-12/spec-update-summary.md`     | 変更内容と影響範囲のサマリー  |
| 更新履歴         | `outputs/phase-12/documentation-changelog.md` | ドキュメント更新の記録        |
| chain完了記録    | `outputs/phase-12/chain-completion-record.md` | RALLY-UNDO-CHAIN-001 完了記録 |

## 完了条件

- [ ] 変更サマリーを作成した
- [ ] chain 完了を記録した
- [ ] 更新すべきドキュメントを更新した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 受け入れ基準 AC-1〜AC-6 全 PASS 確認
- [ ] RALLY-UNDO-CHAIN-001 完了記録済み
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 13: PR作成
