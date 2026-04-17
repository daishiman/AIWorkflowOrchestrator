# Phase 12: システム仕様更新サマリー

## タスクID: TASK-SW-STREAM-002

## current facts

| 項目       | 内容                                                                             |
| ---------- | -------------------------------------------------------------------------------- |
| ハンドラー | `SKILL_CREATOR_CREATE` は `createSkill(validatedArgs, onProgress)` を呼ぶ        |
| 通知関数   | `sendSkillCreatorProgress(mainWindow, progress)` が progress を IPC 送信する     |
| フロント   | `SkillCreateWizard.tsx` は `useStreamingProgress()` と `GenerateStep` に接続済み |
| テスト     | `skillCreatorHandlers.progress.test.ts` で 10 テストが PASS                      |

## baseline からの差分

- 以前は `skillCreatorHandlers.ts` に `onProgress` 接続がなかった
- 以前は progress を送る呼び出し元が存在しなかった
- 現在は main process -> IPC -> preload -> renderer の流れがつながっている
