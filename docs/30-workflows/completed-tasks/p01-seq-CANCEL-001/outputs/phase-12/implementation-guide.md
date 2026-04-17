# Phase 12 成果物: 実装ガイド

## タスクID: TASK-SW-CANCEL-001

## 1. 変更概要

`packages/shared/src/ipc/channels.ts` の `SKILL_CREATOR_RUNTIME_CHANNELS` に `SKILL_CREATOR_CANCEL` を追加し、`IPC_CHANNELS` に自動伝播させた。
これで、後続の Preload / Main / Renderer が同じ定数名を参照できる土台ができた。

UI/UX 変更はないため、Phase 11 のスクリーンショット更新は対象外。

---

## Part 1

### なぜ必要か

キャンセルの合図が人によって違うと、同じボタンを押しても別の名前で呼ばれてしまい、途中で止めたい処理が見つからなくなる。
今回はその合図を 1 つの場所に置いて、みんなが同じ言葉を使えるようにした。

たとえば:

- 先生に「手を止めて」と言う人と「ストップ」と言う人が混ざると、指示が伝わりにくい
- 先に「止める合図はこれ」と決めておくと、あとから参加する人も迷わない

### 何をするか

このタスクでは、共有の辞書に `skill-creator:cancel` という名前を登録した。
登録した名前は、下流のコードでも同じ定数として使える。

### 日常の例え

たとえば:

```
クラスで「黒板の消し方」を 1 つに決める場面を想像してください。
「左から消す」「右から消す」「上から消す」が混ざると、みんなの動きが揃いません。
最初に 1 つのやり方を決めると、誰がやっても同じ結果になります。
```

今回も同じで、`skill-creator:cancel` を共通のやり方として決めた。

### 今回作ったもの

| 日本語                     | 英語 / 定数                      | 役割                              |
| -------------------------- | -------------------------------- | --------------------------------- |
| スキルクリエイター停止合図 | `SKILL_CREATOR_CANCEL`           | 生成を止める共有チャンネル名      |
| 共有 runtime 辞書          | `SKILL_CREATOR_RUNTIME_CHANNELS` | runtime 用チャンネルの正本        |
| 統合 IPC 定数群            | `IPC_CHANNELS`                   | shared 正本をまとめて参照する入口 |

---

## Part 2

### 型定義

```typescript
export const SKILL_CREATOR_RUNTIME_CHANNELS = {
  SKILL_CREATOR_PROGRESS: "skill-creator:progress",
  SKILL_CREATOR_CANCEL: "skill-creator:cancel",
  SKILL_CREATOR_WORKFLOW_STATE_CHANGED: "skill-creator:workflow-state-changed",
  SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed",
} as const;

export const IPC_CHANNELS = {
  ...SKILL_CREATOR_RUNTIME_CHANNELS,
  // 他の shared / feature チャンネル群
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
```

### APIシグネチャ

今回の追加は関数 API ではなく、共有定数の追加。
外から見えるシグネチャは次の形になる。

```typescript
const cancelChannel: typeof IPC_CHANNELS.SKILL_CREATOR_CANCEL =
  IPC_CHANNELS.SKILL_CREATOR_CANCEL;
```

### Consumer Contract & IPC Compatibility

| 項目                        | Before                      | After                                       | 補足                                    |
| --------------------------- | --------------------------- | ------------------------------------------- | --------------------------------------- |
| 共有チャンネル名            | `skill-creator:cancel` なし | `skill-creator:cancel` を shared 正本へ追加 | 既存契約の破壊なし                      |
| payload / 戻り値            | 変更なし                    | 変更なし                                    | このタスクは定数追加のみ                |
| type guard / optional field | N/A                         | N/A                                         | payload 変更がないため不要              |
| follow-up 未タスク          | なし                        | `TASK-SW-CANCEL-002`〜`TASK-SW-CANCEL-004`  | 実際の cancel 呼び出しは後続で実装      |
| fire-and-forget / timeout   | 対象外                      | 対象外                                      | `cancelGeneration` の公開は後続タスク側 |

### 使用例

```typescript
import { IPC_CHANNELS } from "@repo/shared/src/ipc/channels";

expect(IPC_CHANNELS.SKILL_CREATOR_CANCEL).toBe("skill-creator:cancel");
```

```typescript
const values = Object.values(IPC_CHANNELS);
const hasCancelChannel = values.includes("skill-creator:cancel");
```

### エラーハンドリング

| ケース             | 起きること                         | 対応                                     |
| ------------------ | ---------------------------------- | ---------------------------------------- |
| 文字列を直書きした | タイポで壊れやすい                 | 定数参照に統一する                       |
| 下流タスクが未実装 | 定数はあるが invoke はつながらない | CANCEL-002〜004 で順番に埋める           |
| 既存値と重複した   | テストで重複検知できる             | `channels-cancel.test.ts` で回帰防止する |

### エッジケース

| ケース                                                        | 懸念                          | 現在の扱い                                |
| ------------------------------------------------------------- | ----------------------------- | ----------------------------------------- |
| `SKILL_CREATOR_CANCEL` を追加したのに `IPC_CHANNELS` へ出ない | 型伝播の漏れ                  | spread で自動伝播する設計なので漏れにくい |
| `ALLOWED_INVOKE_CHANNELS` だけ先に触る                        | shared 正本より下流が先行する | このタスクではやらない                    |
| UI 変更があると誤解される                                     | screenshot を探しに行く       | UI 変更なしのため N/A と明記する          |

### 設定項目と定数一覧

| 定数                                   | 値                                     | 役割                     |
| -------------------------------------- | -------------------------------------- | ------------------------ |
| `SKILL_CREATOR_CANCEL`                 | `skill-creator:cancel`                 | 生成中断の共有チャンネル |
| `SKILL_CREATOR_PROGRESS`               | `skill-creator:progress`               | 進捗通知                 |
| `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` | `skill-creator:workflow-state-changed` | 状態変化通知             |
| `SKILL_CREATOR_ADAPTER_STATUS_CHANGED` | `skill-creator:adapter-status-changed` | アダプタ状態通知         |

### テスト構成

| ファイル                                                    | 内容                                             |
| ----------------------------------------------------------- | ------------------------------------------------ |
| `packages/shared/src/ipc/__tests__/channels.test.ts`        | runtime チャンネル数と `IPC_CHANNELS` 伝播を確認 |
| `packages/shared/src/ipc/__tests__/channels-cancel.test.ts` | cancel 定数の値・重複・型を確認                  |

### 検証結果

- `pnpm --filter @repo/shared exec vitest run src/ipc/__tests__/channels.test.ts src/ipc/__tests__/channels-cancel.test.ts` は PASS
- `pnpm --filter @repo/shared build` は PASS
- `pnpm typecheck` は PASS

## 視覚証跡

- UI/UX 変更なしのため、Phase 11 スクリーンショットは不要
- `outputs/phase-11/screenshots/` の追加・更新は行っていない

---

## 未タスク (GitHub Issues)

| タスクID           | Issue | 内容                                 |
| ------------------ | ----- | ------------------------------------ |
| TASK-SW-CANCEL-002 | #2210 | Preload API に cancelGeneration 追加 |
| TASK-SW-CANCEL-003 | #2211 | Main ハンドラーに cancel 処理追加    |
| TASK-SW-CANCEL-004 | #2212 | Renderer フックから IPC cancel 送信  |
