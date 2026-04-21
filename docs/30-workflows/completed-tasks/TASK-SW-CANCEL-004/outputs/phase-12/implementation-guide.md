# TASK-SW-CANCEL-004 実装ガイド

## Part 1: 初学者向け説明（中学生レベル）

### なぜ必要か？

スキル生成の途中で「やっぱりやめる」と思ったとき、画面のボタンだけ止まっても意味がありません。受付の人に「中止して」と伝えたつもりでも、裏の作業担当まで伝わっていなければ、作業は続いてしまいます。

このタスクは、キャンセルの合図が

1. 画面
2. 受け渡し役
3. 実際に動いている処理

の順に届くかを確認し、足りない説明や記録を直すためのものです。

### 何を確認したか？

1. 画面のキャンセル操作が Preload を通って Main 側へ届くこと
2. 生成開始時にローカルの `AbortController` が初期化されること
3. ただし、その `AbortSignal` 自体はまだ `createSkill()` の実処理には渡っていないこと

つまり、「Main 側へ中止をお願いする道」はある一方で、「画面側の中止札をそのまま実処理へ渡す道」は未完成です。

## Part 2: 技術者向け説明

### 現在の cancel chain

```text
[Renderer]
SkillCreateWizard.handleCancelGeneration()
  -> useCancelGeneration.cancelGeneration()
  -> abortControllerRef.current?.abort()
  -> window.skillCreatorAPI.cancelGeneration()

[Preload]
skillCreatorAPI.cancelGeneration()
  -> safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL)

[Main]
ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_CANCEL)
  -> skillCreatorService.cancelCurrentOperation()
  -> onCancelCurrentSkillCreation?.()
```

### 型と契約

```ts
export interface UseCancelGenerationReturn {
  cancelGeneration: () => Promise<void>;
  startGeneration: () => AbortSignal;
}
```

```ts
createSkill: (
  description: string,
  options: {
    generateTasks: boolean;
    addAgents: boolean;
    addReferences: boolean;
  },
  context?: SkillCreationContext,
) => Promise<string>;
```

`useCancelGeneration()` は `AbortSignal` を返すが、`createSkill()` 側の契約には signal 引数がない。これが residual issue の本体である。

### 実施した修正

- `SkillCreateWizard.tsx` で `startGeneration()` を生成開始時に呼ぶように修正
- `handleCancelGeneration()` を `async` 化し、キャンセル要求送信後に state reset するよう順序を明確化

### テストと限界

- 追加テスト: `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.e2e.test.ts`
- テスト観点:
  - `cancelGeneration()` が `skillCreatorAPI.cancelGeneration()` を呼ぶ
  - `startGeneration()` -> `cancelGeneration()` で local signal が abort される
  - `streamingStage` が `cancelled` になる
  - API 未定義でもクラッシュしない

現ワークツリーでの再実行は `esbuild` の host/binary mismatch で blocked。したがって、このガイドでは「テストファイル存在」「静的コード監査」「既存記録」を区別して扱う。

### エラーハンドリングとエッジケース

- IPC 呼び出し失敗は `useCancelGeneration()` 内で握りつぶしている
- `startGeneration()` 未実行でも `cancelGeneration()` は null-safe
- `AbortSignal` は local state には効くが、`createSkill()` の実処理 consumer には未接続

### 設定可能パラメータ / 定数

| 項目                                | 内容                                      |
| ----------------------------------- | ----------------------------------------- |
| `IPC_CHANNELS.SKILL_CREATOR_CANCEL` | cancel IPC チャンネル                     |
| `SKILL_GENERATION_OPTIONS`          | wizard の createSkill 呼び出しオプション  |
| `generationRequestIdRef`            | stale response を無効化する request guard |

## 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要。
代替証跡は以下：

- `docs/30-workflows/TASK-SW-CANCEL-004/outputs/phase-9/quality-gate-report.md`
- `docs/30-workflows/TASK-SW-CANCEL-004/outputs/phase-10/final-review-result.md`
- `docs/30-workflows/TASK-SW-CANCEL-004/outputs/phase-11/manual-test-result.md`
