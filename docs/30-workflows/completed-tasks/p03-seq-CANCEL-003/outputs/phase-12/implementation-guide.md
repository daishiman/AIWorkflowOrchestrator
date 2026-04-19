# 実装ガイド - TASK-SW-CANCEL-003

## メタ情報

| 項目     | 内容                              |
| -------- | --------------------------------- |
| タスクID | TASK-SW-CANCEL-003                |
| 機能名   | skill-creator-cancel-main-handler |
| 作成日   | 2026-04-19                        |

---

## Part 1: 中学生向け説明

### なぜ必要か

スキル作成は数秒から数十秒かかることがあり、途中で「条件を変えたい」「別の案に切り替えたい」と思うことがあります。そのときに止める仕組みがないと、もう不要になった作業が最後まで走ってしまい、待ち時間や混乱が増えます。

たとえば、電子レンジで温めを始めたあとに「やっぱり今はやめよう」と思ったら、停止ボタンを押して無駄な加熱を止めます。この task は、その停止ボタンを Main 側でちゃんと受け取って実際に止められるようにした確認作業です。

今回何をするかというと、画面から届いた「止めて」という合図を Main 側の処理に渡し、実行中の作業を安全に中断できることを確かめます。

### cancel って何？

スキル作成中に「やっぱりやめたい」と思ったとき、途中でやめられる仕組みのことです。

たとえば、レンジでチンしているときに「取り消し」ボタンを押すと、加熱が止まりますよね。それと同じです。

### どうやって止める？

アプリには「Main（メイン）」と「Renderer（画面）」の 2 つの部分があります。

1. 画面でキャンセルボタンを押すと、Main に「止めて！」というメッセージが飛びます
2. Main は「わかった！」と言って、作業中のプログラムに「中断信号」を送ります
3. プログラムはその信号を受け取ったら、作業をキャンセルして片付けをします

### 大事な点

- 途中でやめても、壊れかけのファイルが残らないようにちゃんと後片付けします
- 「止めて！」と言われる前に作業が終わっていても、問題なく動きます（2 重に押しても大丈夫）

### 今回作ったもの

- Main プロセスでキャンセル要求を受ける handler が正しく動くこと
- 作業中の処理に中断信号を渡し、止めたあとに状態を片付けること
- NON_VISUAL task として、画面の画像ではなくテスト結果と walkthrough で完了証跡を残すこと

---

## Part 2: 技術者向け説明

### TypeScript 型定義

```typescript
type CancelResult = { success: true };

interface SkillCreatorServiceLike {
  cancelCurrentOperation(): void;
}
```

### APIシグネチャ

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_CREATOR_CANCEL,
  async (event): Promise<CancelResult> => {
    validateIpcSender(event, IPC_CHANNELS.SKILL_CREATOR_CANCEL, mainWindowRef);
    skillCreatorService.cancelCurrentOperation();
    onCancelCurrentSkillCreation?.();
    return { success: true };
  },
);
```

### AbortController の管理

```typescript
// SkillCreatorService.ts
private currentAbortController: AbortController | null = null;

async createSkill(options, onProgress?) {
  const abortController = new AbortController();
  this.currentAbortController = abortController;       // 登録
  const operationSignal = abortController.signal;

  try {
    // 各ステップで signal を渡す
    await this.executeScript("init_skill.js", args, operationSignal);
    // ...
  } finally {
    // 同一インスタンスか確認してからリセット（並行呼び出し対策）
    if (this.currentAbortController === abortController) {
      this.currentAbortController = null;
    }
  }
}

public cancelCurrentOperation(): void {
  this.currentAbortController?.abort();   // optional chaining で null-safe
  this.currentAbortController = null;
}
```

### IPC Handler 登録・解除

```typescript
// skillCreatorHandlers.ts
// 登録
ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_CANCEL, async (event) => {
  validateIpcSender(event, ...);
  skillCreatorService.cancelCurrentOperation();
  onCancelCurrentSkillCreation?.();
  return { success: true };
});

// 解除
ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_CANCEL);
```

### 使用例

```typescript
await window.skillCreatorAPI.cancelGeneration();
```

### テスト構成

| テストファイル                        | TC 数 | カバー観点                        |
| ------------------------------------- | ----- | --------------------------------- |
| `SkillCreatorService-cancel.test.ts`  | 5     | abort/reset/null-safe/signal 伝播 |
| `skillCreatorHandlers-cancel.test.ts` | 3     | register/delegate/unregister      |

### エラーハンドリング

- `validateIpcSender(...)` で無効な sender を弾き、Renderer 以外からの cancel 呼び出しを防ぐ
- `cancelCurrentOperation()` は optional chaining により、実行中処理がない場合でも例外を投げない
- `finally` で `currentAbortController` を同一インスタンス確認つきで `null` に戻し、古い操作が新しい操作を壊さないようにする

### エッジケース

| ケース                                    | 対処                                          |
| ----------------------------------------- | --------------------------------------------- |
| `cancelCurrentOperation()` を連続呼び出し | optional chaining で null-safe                |
| `createSkill()` 完了後に cancel           | finally リセット済みのため abort は発火しない |
| 複数の `createSkill()` が重なった場合     | 後勝ち（最後の AbortController が有効）       |

### 設定項目と定数一覧

| 項目                                | 値 / 役割                                  |
| ----------------------------------- | ------------------------------------------ |
| `IPC_CHANNELS.SKILL_CREATOR_CANCEL` | cancel invoke 用の canonical channel       |
| `currentAbortController`            | 現在進行中の createSkill を指す controller |
| `onCancelCurrentSkillCreation`      | Main 層で cancel 完了後に通知する callback |

---

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要
代替証跡: `outputs/phase-10/final-review-result.md`, `outputs/phase-11/TASK-SW-CANCEL-003-manual-test-report.md`
