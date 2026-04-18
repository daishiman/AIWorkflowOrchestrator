# 実装ガイド: TASK-SW-STREAM-002

## メタ情報

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| タスクID | TASK-SW-STREAM-002                     |
| 機能名   | skill-creator-handlers-progress-wiring |
| taskType | NON_VISUAL                             |
| 作成日   | 2026-04-18                             |

## Part 1

### なぜこの変更が必要か

スキル生成の進み具合が画面へ届かないと、ユーザーは「止まったのか」「まだ動いているのか」を判断できない。
たとえば、荷物の配送で追跡番号はあるのに配達状況が一度も更新されないと不安になる。
今回の変更はその不安を減らし、裏側の進行状況を画面へ届けるために必要だった。

### 何をするか

メイン側で受け取った進捗通知を画面側へ渡す配線の確認と、
その配線が既に入っている現ブランチの状態を current facts として整理する。

### 今回作ったもの

- `NON_VISUAL` close-out 用の Phase 11 証跡束
- validator 互換の Phase 12 実装ガイド
- root / outputs artifacts parity

### 日常生活での例え

たとえば、レストランで「料理を作っています」「盛り付け中です」「もうすぐ運びます」と
厨房からホールへ順番に連絡が来る仕組みに近い。
厨房で進捗を言ってもホールへ伝わらなければ、お客さんには何も見えない。
この task は、その連絡線がちゃんとつながっているかを確かめ、記録として残す役割を持つ。

### この機能でできること

| 機能           | 説明                                 | 例                                    |
| -------------- | ------------------------------------ | ------------------------------------- |
| 進捗通知       | 裏側の進み具合を画面へ渡す           | `planning` から `done` まで順に伝わる |
| 状態可視化     | 何が進んでいるかを文言で示す         | 「SKILL.md を生成しています...」      |
| close-out 記録 | 実装済みか、証跡が揃っているかを残す | Phase 11/12 の成果物で確認できる      |

## Part 2

### 概要

本 task は新規実装そのものより、既に入っている progress wiring を
`NON_VISUAL` close-out として整備する Phase 12 成果物である。

### TypeScript 型定義

```ts
type SkillCreatorProgressPayload = {
  phase: string;
  percentage: number;
  message: string;
};
```

### APIシグネチャ

```ts
await skillCreatorService.createSkill(
  validatedArgs,
  (progress: SkillCreatorProgressPayload) => {
    sendSkillCreatorProgress(mainWindow, progress);
  },
);
```

```bash
node .agents/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/p02-par-STREAM-002
```

### 使用例

```ts
const onProgress = (progress: SkillCreatorProgressPayload) => {
  sendSkillCreatorProgress(mainWindow, progress);
};

await skillCreatorService.createSkill(validatedArgs, onProgress);
```

### エラーハンドリング

- `mainWindow.isDestroyed()` が `true` の場合は IPC 送信を行わず安全に no-op とする。
- `createSkill()` 側で例外が発生した場合、handler 側は通常の error path に戻る。
- 本 workflow では error path の存在と未タスク候補を `unassigned-task-detection.md` に記録する。

### エッジケース

| ケース                             | 期待動作                  | 補足                    |
| ---------------------------------- | ------------------------- | ----------------------- |
| ウィンドウ破棄後に progress が来る | 送信せず終了              | crash 回避              |
| progress が 5段階で来る            | `planning -> done` を維持 | renderer 表示と同期     |
| UI変更なし                         | screenshot を要求しない   | `NON_VISUAL` ルール適用 |

### 設定項目と定数一覧

| 項目                                        | 役割                                        |
| ------------------------------------------- | ------------------------------------------- |
| `IPC_CHANNELS.SKILL_CREATOR_PROGRESS`       | Main -> Renderer の progress 通知チャンネル |
| `taskType: NON_VISUAL`                      | Phase 11/12 の証跡形式を決める分類          |
| `artifacts.json` / `outputs/artifacts.json` | root と outputs の状態同期                  |

### テスト構成

| 種別              | 主な証跡                                                                      |
| ----------------- | ----------------------------------------------------------------------------- |
| 実装確認          | `outputs/phase-5/implementation-summary.md`                                   |
| 品質確認          | `outputs/phase-9/quality-report.md`                                           |
| 最終レビュー      | `outputs/phase-10/final-review-result.md`                                     |
| Phase 11 代替証跡 | `manual-test-result.md` / `manual-test-checklist.md` / `discovered-issues.md` |

### Consumer Contract & IPC Compatibility

| 観点                      | Before                           | After                             |
| ------------------------- | -------------------------------- | --------------------------------- |
| Main -> Renderer progress | 接続漏れ懸念あり                 | branch current facts では接続済み |
| Payload shape             | `{ phase, percentage, message }` | 変更なし                          |
| Public IPC channel        | `SKILL_CREATOR_PROGRESS`         | 変更なし                          |
| 互換性                    | Renderer の受信経路を維持        | breaking change なし              |

公開 IPC 契約そのものに新規フィールド追加はないため、
本 workflow における system spec Step 2 は `N/A` と判定する。

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要。
代替証跡は `manual-test-result.md`、`manual-test-checklist.md`、
`discovered-issues.md`、`phase11-capture-metadata.json` を正本とする。
