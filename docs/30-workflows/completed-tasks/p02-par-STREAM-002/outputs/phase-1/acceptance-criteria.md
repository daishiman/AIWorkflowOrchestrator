# Phase 1: 受け入れ基準

## タスクID: TASK-SW-STREAM-002

## 受け入れ基準一覧

| ID   | 受け入れ基準                                                                                                            | 検証方法                                                 |
| ---- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| AC-1 | `SKILL_CREATOR_CREATE` ハンドラーで `createSkill()` の第2引数に `onProgress` コールバックが接続されること               | コードレビュー + `skillCreatorHandlers.progress.test.ts` |
| AC-2 | `sendSkillCreatorProgress(mainWindow, progress)` がコールバック内で呼ばれ、IPC 経由で進捗が送信されること               | `webContents.send` のモック検証                          |
| AC-3 | `SkillCreateWizard.tsx` で `useStreamingProgress()` の戻り値（`stage/percent/message`）が `GenerateStep` に渡されること | コードレビュー（既接続確認済み）                         |
| AC-4 | スキル生成中に `GenerateStep.tsx` のプログレスバーが IPC メッセージ受信時に更新されること                               | 手動テスト観点として記録済み                             |
| AC-5 | 既存の `SkillCreateWizard.tsx` 接続が残り続け、追加修正が不要であること                                                 | `grep` 確認済み、変更不要                                |

## current state 確認

- `SkillCreateWizard.tsx` は既に `useStreamingProgress()` と `GenerateStep` に接続済み
- `skillCreatorHandlers.ts` に `sendSkillCreatorProgress` は定義済みだが、onProgress 接続は Phase 5 で必要
- 前提タスク `TASK-SW-STREAM-001` は完了済み
