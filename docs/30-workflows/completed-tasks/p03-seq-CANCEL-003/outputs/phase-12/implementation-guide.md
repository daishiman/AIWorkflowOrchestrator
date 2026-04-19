# Phase 12 成果物: 実装ガイド

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 12                                |
| タスクID   | TASK-SW-CANCEL-003                |
| 機能名     | skill-creator-cancel-main-handler |
| タスク種別 | NON_VISUAL                        |
| 作成日     | 2026-04-19                        |
| 前提Phase  | Phase 11                          |

## Part 1: 中学生レベルの概念説明

### なぜ必要か

スキル生成を途中で止めたいのに、画面から「止めて」と伝えても裏側の作業が動き続けると、使う人は「止まったと思ったのに止まっていない」という不安定な状態になります。先に必要なのは、画面の気持ちではなく、裏側の作業そのものを止めることです。

### たとえ話

これは学校の放送室に連絡する仕組みに近いです。教室で「授業を止めてください」と言っても、放送室まで声が届かなければ授業は続きます。今回の修正は、教室から受付を通って放送室へ確実に連絡し、放送室の担当者が本当にベルを止める仕組みを作ったものです。

### 今回作ったもの

- 受付役: `SKILL_CREATOR_CANCEL` ハンドラー
- 停止役: `cancelCurrentOperation()`
- 後始末役: `currentAbortController` のリセットと cleanup 経路

### 何をするか

画面や preload から届いた cancel 要求を main process で受け取り、実行中の `AbortController` を止めます。これで、`createSkill()` が抱えている処理を中断できるようになります。

## Part 2: 開発者向け技術詳細

### TypeScript 型定義

```typescript
type CancelSkillCreationResult = { success: true };

interface SkillCreatorServiceLike {
  cancelCurrentOperation(): void;
}

interface SkillCreatorChannels {
  SKILL_CREATOR_CANCEL: "skill-creator:cancel";
}
```

### APIシグネチャ

```typescript
public cancelCurrentOperation(): void;

ipcMain.handle(
  IPC_CHANNELS.SKILL_CREATOR_CANCEL,
  async (event): Promise<CancelSkillCreationResult> => {
    validateIpcSender(event, IPC_CHANNELS.SKILL_CREATOR_CANCEL, {
      expectedSender: "renderer",
    });
    skillCreatorService.cancelCurrentOperation();
    return { success: true };
  },
);
```

### 使用例

```ts
// main 側での登録
registerSkillCreatorHandlers({
  skillCreatorService,
});

// cancel 要求の処理
skillCreatorService.cancelCurrentOperation();
```

### `cancelCurrentOperation()` の使用方法

```typescript
public cancelCurrentOperation(): void {
  this.currentAbortController?.abort();
  this.currentAbortController = null;
}
```

| 使用条件                           | 挙動                           |
| ---------------------------------- | ------------------------------ |
| `currentAbortController` が非 null | `abort()` 実行後に null へ戻す |
| `currentAbortController` が null   | 何もせず安全に終了する         |
| 連続呼び出し                       | 2回目も例外なく終わる          |

### 動作フロー

```text
Renderer / DevTools
  -> preload cancelGeneration()
  -> ipcRenderer.invoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL)
  -> ipcMain.handle(SKILL_CREATOR_CANCEL)
  -> skillCreatorService.cancelCurrentOperation()
  -> AbortController.abort()
  -> createSkill() 側の abort 経路へ伝播
```

### `unregisterSkillCreatorHandlers()` への追加の重要性

- `ipcMain.handle()` で登録したチャンネルは `removeHandler()` と対で管理しないと、テストや再初期化で二重登録エラーを起こす
- 本タスクでは `ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_CANCEL)` を追加して対称性を維持した

### IPC 4層（CANCEL-001〜003）の完成状態

| 層                      | 担当タスク | 状態 | 実装箇所                                                        |
| ----------------------- | ---------- | ---- | --------------------------------------------------------------- |
| shared 定数             | CANCEL-001 | 完了 | `packages/shared/src/ipc/channels.ts`                           |
| preload allowlist / API | CANCEL-002 | 完了 | `apps/desktop/src/preload/channels.ts` / `skill-creator-api.ts` |
| main handler            | CANCEL-003 | 完了 | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`             |
| service cancel 実体     | CANCEL-003 | 完了 | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`   |

### エラーハンドリング

- sender 検証に失敗した場合は `validateIpcSender` が例外を返し、不正な renderer からの呼び出しを遮断する
- 実行中操作が無い場合は `?.abort()` により no-op で安全に終わる
- abort 後は `finally` 側でも controller を片付け、状態リークを防ぐ

### エッジケース

- `cancelCurrentOperation()` を 2 回連続で呼んでも例外にしない
- 処理完了済みの controller を誤って残さないよう、`finally` 側で同一性を見てリセットする
- `unregisterSkillCreatorHandlers()` に cancel channel を追加し忘れるとテスト再登録が壊れる

### 設定項目と定数一覧

| 項目                                | 値 / 役割                               |
| ----------------------------------- | --------------------------------------- |
| `IPC_CHANNELS.SKILL_CREATOR_CANCEL` | `skill-creator:cancel`                  |
| `currentAbortController`            | 実行中処理を保持する main 側 controller |
| `{ success: true }`                 | cancel handler の正常戻り値             |

### テスト構成

| ファイル                                                                            | 役割                                     |
| ----------------------------------------------------------------------------------- | ---------------------------------------- |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts` | service 層の cancel / state reset 検証   |
| `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers-cancel.test.ts`           | IPC handler の登録 / 呼び出し / 解除検証 |
| `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.validation.test.ts`       | 既存 validation 契約との整合確認         |

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要。

代替証跡:

- `outputs/phase-10/final-review-result.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/manual-test-checklist.md`

## 成果物

- `outputs/phase-12/implementation-guide.md`（本ファイル）
