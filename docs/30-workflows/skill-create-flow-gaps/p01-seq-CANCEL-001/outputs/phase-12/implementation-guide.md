# Phase 12 成果物: 実装ガイド

## タスクID: TASK-SW-CANCEL-001

## 1. 変更概要

`packages/shared/src/ipc/channels.ts` の `SKILL_CREATOR_RUNTIME_CHANNELS` に `SKILL_CREATOR_CANCEL: "skill-creator:cancel"` を追加した。これで shared の合言葉辞書に「キャンセル」という新しい言葉が登録された。

## 2. 使い方

`IPC_CHANNELS.SKILL_CREATOR_CANCEL` を使えば、Preload や Main で同じ文字列を手書きせずに参照できる。

```ts
import { IPC_CHANNELS } from "@repo/shared/src/ipc/channels";

const cancelChannel = IPC_CHANNELS.SKILL_CREATOR_CANCEL;
// "skill-creator:cancel"
```

## 3. 中学生レベルの説明

みんなで話すときに、同じ意味でも言い方がバラバラだと困る。今回は「止めて」という合図を、みんなが見られる同じ辞書に `skill-creator:cancel` という名前で書き足した。だから Preload や Main も、その辞書を見れば同じ合図を迷わず使える。

## 4. 接続準備

- 役割1: shared にチャンネル定数を置く
- 役割2: Preload の許可リストに入れる
- 役割3: Main のハンドラーを作る
- 役割4: Preload API を公開する
- 役割5: Renderer のフックから呼び出す

本タスクは役割1だけを完了した。
