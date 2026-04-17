# 実装成果物: STREAM-002 / CANCEL-003 / CANCEL-004

## 変更ファイル一覧

| ファイル                                                                      | 変更種別 | 内容                                                                             |
| ----------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                           | 変更     | STREAM-002: コールバック接続 / CANCEL-003: キャンセルハンドラー追加・解除        |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                 | 変更     | CANCEL-003: AbortController プロパティ追加 / cancelCurrentOperation メソッド追加 |
| `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`                      | 変更     | CANCEL-004: cancelGeneration を async 化・IPC 呼び出し追加                       |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | 変更     | CANCEL-004: handleCancelGeneration を async 化                                   |
| `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.validation.test.ts` | 変更     | テスト更新: 32チャンネル対応・cancelCurrentOperation モック追加・IPC-EX-006追加  |

---

## STREAM-002: 接続したコールバックの説明

**変更箇所**: `skillCreatorHandlers.ts` の `skill-creator:create` ハンドラー（276行付近）

```typescript
// 変更前
const skillDir = await skillCreatorService.createSkill(validatedArgs);

// 変更後
const skillDir = await skillCreatorService.createSkill(
  validatedArgs,
  (progress) => {
    sendSkillCreatorProgress(mainWindow, progress);
  },
);
```

`SkillCreatorService.createSkill()` の第2引数 `onProgress` コールバックに `sendSkillCreatorProgress` を接続した。
これにより、スキル作成の各フェーズ（planning / generating-skill / generating-skill-md / validating / done）で進捗イベントが Renderer プロセスへ IPC 送信されるようになった。

---

## CANCEL-003: AbortController 管理の説明

### SkillCreatorService への変更

1. **プロパティ追加** (`private readonly logger` の直前)

   ```typescript
   private currentAbortController: AbortController | null = null;
   ```

2. **`cancelCurrentOperation()` メソッド追加** (`validateSkill` の手前)

   ```typescript
   cancelCurrentOperation(): void {
     if (this.currentAbortController) {
       this.currentAbortController.abort();
       this.currentAbortController = null;
     }
   }
   ```

3. **`createSkill` 内での AbortController ライフサイクル管理**
   - バリデーション完了後、ワークフロー実行前: `this.currentAbortController = new AbortController();`
   - `return skillDir;` の直前: `this.currentAbortController = null;`

### skillCreatorHandlers.ts への変更

1. **`skill-creator:cancel` ハンドラー追加** (`registerRuntimeSkillCreatorHandlers` 呼び出しの直前)
   - `validateIpcSender` でセキュリティ検証
   - `skillCreatorService.cancelCurrentOperation()` を呼び出して実行中処理をキャンセル
   - `{ success: true }` を返却

2. **`unregisterSkillCreatorHandlers` への解除追加**
   ```typescript
   ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_CANCEL);
   ```

---

## CANCEL-004: useCancelGeneration の型変更と呼び出し元への影響

### useCancelGeneration.ts の変更

**インターフェース型変更**:

```typescript
// 変更前
cancelGeneration: () => void;

// 変更後
cancelGeneration: () => Promise<void>;
```

**実装変更**:

```typescript
// 変更前
const cancelGeneration = useCallback(() => {
  abortControllerRef.current?.abort();
  abortControllerRef.current = null;
  setStage("cancelled");
  // AbortController.abort() で Main Process 側の処理も中断される
}, [setStage]);

// 変更後
const cancelGeneration = useCallback(async () => {
  abortControllerRef.current?.abort();
  abortControllerRef.current = null;
  setStage("cancelled");
  await window.skillCreatorAPI?.cancelGeneration?.();
}, [setStage]);
```

### 呼び出し元への影響

**`SkillCreateWizard.tsx`** (`handleCancelGeneration`):

- `cancelGeneration` が `Promise<void>` を返すようになったため、`handleCancelGeneration` を `async` 関数に変更し `await` を追加

```typescript
// 変更前
const handleCancelGeneration = () => {
  cancelGeneration();
  resetGeneratedState(true);
  goToStep(0);
};

// 変更後
const handleCancelGeneration = async () => {
  await cancelGeneration();
  resetGeneratedState(true);
  goToStep(0);
};
```

**その他のテストファイル** (`SkillCreateWizard.test.tsx` など):

- `useCancelGeneration` を `vi.fn()` でモック化しているため型変更の影響なし

---

## テスト更新内容

`skillCreatorHandlers.validation.test.ts` への変更:

1. **`mockSkillCreatorService` に `cancelCurrentOperation: vi.fn()` を追加**
2. **IPC-EX-004**: 31チャンネル → 32チャンネルに更新（`"skill-creator:cancel"` 追加）
3. **IPC-EX-006 追加**: `skill-creator:cancel` ハンドラーが登録され `cancelCurrentOperation` を呼ぶことを確認
4. **IPC-AL-001**: 全15 → 全16 invoke チャネルに更新（`SKILL_CREATOR_CANCEL` 追加）

実行結果: 47テスト全て通過
