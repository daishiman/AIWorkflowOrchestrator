# Phase 12: 実装ガイド

## タスクID: TASK-SW-STREAM-002

## 中学生向けの説明

スキル作成は、長い工作のようなものです。
工作の途中で「今ここまで終わったよ」と教えてもらえると、どこまで進んだか分かります。

このタスクでは、作る側のコードがその「今ここまで終わったよ」というメッセージを出し、
画面側がそれを受け取ってプログレスバーを動かすようにしました。

## 技術的な流れ

1. `SkillCreatorService.createSkill()` が進捗データを作る
2. `skillCreatorHandlers.ts` の `onProgress` コールバックがそれを受け取る
3. `sendSkillCreatorProgress(mainWindow, progress)` が IPC で画面へ送る
4. `useStreamingProgress()` が受け取って Zustand store を更新する
5. `GenerateStep` が `stage / percent / message` を表示する

## current state

- `SkillCreateWizard.tsx` は既に接続済みで、変更不要
- `skillCreatorHandlers.ts` だけが実装面の接続ポイント
- テストは `skillCreatorHandlers.progress.test.ts` に集約済み
