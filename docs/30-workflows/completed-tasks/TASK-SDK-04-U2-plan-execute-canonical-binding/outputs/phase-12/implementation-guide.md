# Implementation Guide

## Part 1: 中学生にもわかる説明

### なぜ必要か

「方針を決める」で確認した内容と、「実行する」で本当に動く内容がずれると、確認した意味がなくなる。これを防ぐために、確認した時点の内容を別に持っておく。

### たとえば

先生に見せて OK をもらった提出用紙を、提出直前に別の紙へすり替えられたら困る。それと同じで、実行前に確認した依頼文をそのまま使う必要がある。

### この変更で起きること

| 項目           | 内容                                         |
| -------------- | -------------------------------------------- |
| 入力中の文     | ユーザーが自由に書き換えられる               |
| 承認済みの文   | 「方針を決める」を押した時点で固定される     |
| 実行時の参照先 | 承認済みの文だけを使う                       |
| キャンセル時   | 承認済みの文も入力中の文も両方リセットされる |

## Part 2: 開発者向け技術詳細

### 問題

`handleExecutePlan` が `request.trim()`（textarea の現在値）を `executePlan` の第2引数に渡していた。plan review 後にユーザーが textarea を編集すると、承認済み plan と異なる内容が実行される。

### 修正方針

`approvedSkillSpec` という独立した state を導入し、plan 承認時にスナップショットを固定。execute はこのスナップショットのみを参照する。

### 変更箇所

| 箇所 | ファイル                           | 変更                                                |
| ---- | ---------------------------------- | --------------------------------------------------- |
| M-1  | `SkillLifecyclePanel.tsx` L287-289 | `approvedSkillSpec` state 追加                      |
| M-2  | `SkillLifecyclePanel.tsx` L658     | `setApprovedSkillSpec(trimmedRequest)`              |
| M-3  | `SkillLifecyclePanel.tsx` L701-703 | `request.trim()` → `approvedSkillSpec ?? undefined` |
| M-4  | `SkillLifecyclePanel.tsx` L747     | `setApprovedSkillSpec(null)`                        |

### API シグネチャ

```ts
executePlan(planId: string, skillSpec?: unknown, authMode?: string, apiKey?: string)
```

変更なし。第2引数の source が `request.trim()` から `approvedSkillSpec ?? undefined` に変わっただけ。

### テスト追加

| ID   | シナリオ                                                | ファイル                                      |
| ---- | ------------------------------------------------------- | --------------------------------------------- |
| U-8b | plan → textarea変更 → execute で canonical spec 維持    | `SkillLifecyclePanel.llm-generation.test.tsx` |
| U-18 | cancel → re-plan で新しい snapshot 固定                 | 同上                                          |
| U-19 | 複数回 textarea 変更後も snapshot 不変                  | 同上                                          |
| U-20 | cancel で approved snapshot 対称クリア                  | 同上                                          |
| U-21 | execute 失敗後も approved snapshot を保持して再実行可能 | 同上                                          |

### テスト結果

- このターンで U-21 を追加し、失敗後リトライ時も `approvedSkillSpec` を保持する期待値を明文化した。
- 2026-03-28 のローカル再実行は `esbuild` の host/binary version mismatch により未完了。

### エッジケース

| ケース                         | 動作                                       |
| ------------------------------ | ------------------------------------------ |
| plan 未実行で execute          | 第2引数は `undefined`（API 互換維持）      |
| cancel 後に再 plan             | 新しい `trimmedRequest` で snapshot 再固定 |
| textarea を複数回編集          | execute payload は plan 作成時の値を維持   |
| plan 成功 → cancel → 別の plan | 古い spec は破棄、新しい spec が固定       |
