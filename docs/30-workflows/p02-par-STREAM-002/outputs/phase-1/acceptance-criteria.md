# Phase 1: 受け入れ条件（Acceptance Criteria）

**タスクID**: TASK-SW-STREAM-002  
**作成日**: 2026-04-18

---

## AC-1: `SKILL_CREATOR_CREATE` ハンドラーで `createSkill()` の第2引数に `onProgress` コールバックが接続されること

### 検証条件

- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` の `SKILL_CREATOR_CREATE` ハンドラー内で `skillCreatorService.createSkill()` が第2引数付きで呼ばれること
- 第2引数はコールバック関数 `(progress) => { ... }` であること

### 検証方法

1. **静的検査（コードレビュー）**: `skillCreatorHandlers.ts` 行278-283 を確認

   ```typescript
   const skillDir = await skillCreatorService.createSkill(
     validatedArgs,
     (progress) => {
       sendSkillCreatorProgress(mainWindow, progress);
     },
   );
   ```

   第2引数としてアロー関数が渡されていることを確認する。

2. **型チェック**: `SkillCreatorService.createSkill()` の型シグネチャが `onProgress?: SkillCreatorProgressCallback` を受け入れることを確認する。

### 現在の状態

**充足済み**  
コードベース上の行278-283 に実装が存在する。

---

## AC-2: `sendSkillCreatorProgress(mainWindow, progress)` がコールバック内で呼ばれること

### 検証条件

- コールバック内で `sendSkillCreatorProgress(mainWindow, progress)` が呼ばれること
- `sendSkillCreatorProgress` が `IPC_CHANNELS.SKILL_CREATOR_PROGRESS` チャンネルで `mainWindow.webContents.send()` を呼ぶこと
- `mainWindow.isDestroyed()` の安全チェックが含まれること

### 検証方法

1. **静的検査（コードレビュー）**: `skillCreatorHandlers.ts` 行720-731 を確認

   ```typescript
   export function sendSkillCreatorProgress(
     mainWindow: BrowserWindow,
     progress: { phase: string; percentage: number; message: string },
   ): void {
     if (!mainWindow.isDestroyed()) {
       mainWindow.webContents.send(
         IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
         progress,
       );
     }
   }
   ```

2. **ユニットテスト**: `SKILL_CREATOR_CREATE` ハンドラーのテストで、`createSkill` のモック実装が `onProgress` コールバックを呼んだとき、`mainWindow.webContents.send` が `IPC_CHANNELS.SKILL_CREATOR_PROGRESS` チャンネルで呼ばれることを `expect(mockWebContents.send).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, expect.any(Object))` で検証する。

3. **統合確認**: `IPC_CHANNELS.SKILL_CREATOR_PROGRESS` の値が `"skill-creator:progress"` であることを `packages/shared/src/ipc/channels.ts` 行196 で確認する。

### 現在の状態

**充足済み**  
コールバック内で `sendSkillCreatorProgress` が呼ばれており、`sendSkillCreatorProgress` の実装も存在する。

---

## AC-3: `SkillCreateWizard.tsx` で `useStreamingProgress()` の戻り値が `GenerateStep` に渡されること

### 検証条件

- `SkillCreateWizard.tsx` で `useStreamingProgress()` が呼ばれること
- 戻り値の `stage`, `percent`, `message`, `previewContent` が `GenerateStep` の props として渡されること
- `stage` は `resolveStage()` によって `streaming.stage` と `isGenerating` フラグをマージして解決されること

### 検証方法

1. **静的検査（コードレビュー）**: `SkillCreateWizard.tsx` の以下の箇所を確認
   - 行323: `const streaming = useStreamingProgress();`
   - 行577-581:
     ```typescript
     const resolvedStage = resolveStage(
       streaming.stage,
       isGenerating || isSkillGenerating,
       bridgeLocalError(error),
     );
     const resolvedPercent = streaming.percent;
     const resolvedMessage = streaming.message || generationProgress || "";
     const resolvedPreview = streaming.previewContent;
     ```
   - 行631-644: `<GenerateStep stage={resolvedStage} percent={resolvedPercent} message={resolvedMessage} previewContent={resolvedPreview} ... />`

2. **型チェック**: `GenerateStepProps` が `stage: GenerationStage`, `percent: number`, `message: string`, `previewContent?: string | null` を要求することと、渡される値の型が一致することを確認する。

3. **レンダリングテスト**: `stage` が `"planning"` 以外の `"idle"` のとき、プログレスバーが表示されないことを確認する。

### 現在の状態

**充足済み**  
`SkillCreateWizard.tsx` 行323・577-644 に実装が存在し、`useStreamingProgress()` の戻り値が `GenerateStep` に渡されている。

---

## AC-4: スキル生成中に `GenerateStep.tsx` のプログレスバーが更新されること

### 検証条件

- `GenerateStep.tsx` が `percent` prop の値に応じて `style={{ width: \`${Math.min(Math.max(percent, 0), 100)}%\` }}` でプログレスバーの幅を更新すること
- `stage` が `"idle"`, `"error"`, `"cancelled"` 以外の場合にプログレスバーが表示されること
- `aria-valuenow={percent}` が設定されること（アクセシビリティ）
- `SKILL_CREATOR_PROGRESS` IPC イベントが発火されると、`useStreamingProgress.ts` が Redux store を更新し、再レンダリングが起きること

### 検証方法

1. **静的検査（コードレビュー）**: `GenerateStep.tsx` の以下の箇所を確認
   - 行119-137: プログレスバーのレンダリング条件と `aria-valuenow`
   - 行129-133: `style={{ width: \`${Math.min(Math.max(percent, 0), 100)}%\` }}`

2. **IPC → UI のデータフロー確認**: 以下のフローが完成していることを確認する

   ```
   SkillCreatorService.emitProgress()
     → skillCreatorHandlers.ts の onProgress コールバック
       → sendSkillCreatorProgress(mainWindow, progress)
         → mainWindow.webContents.send(SKILL_CREATOR_PROGRESS, progress)
           → preload: skillCreatorAPI.onProgress リスナー
             → useStreamingProgress.ts の updateProgress()
               → Redux store 更新
                 → SkillCreateWizard.tsx の streaming.percent
                   → GenerateStep の percent prop
                     → プログレスバーの幅更新
   ```

3. **E2E テスト（手動確認）**: スキル生成を実行し、Step 2（生成中）でプログレスバーが 10% → 40% → 70% → 90% → 100% と変化することを確認する。

4. **アクセシビリティ確認**: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` が適切に設定されていること。

### 現在の状態

**充足済み（実装済み）**  
`GenerateStep.tsx` のプログレスバーは `percent` prop で幅が制御されており、`useStreamingProgress` → Redux → `SkillCreateWizard` → `GenerateStep` の全経路が実装済み。

---

## まとめ

| AC   | 内容                                                                        | 現在の状態           |
| ---- | --------------------------------------------------------------------------- | -------------------- |
| AC-1 | `createSkill()` 第2引数に `onProgress` コールバック接続                     | 充足済み             |
| AC-2 | `sendSkillCreatorProgress(mainWindow, progress)` がコールバック内で呼ばれる | 充足済み             |
| AC-3 | `useStreamingProgress()` の戻り値が `GenerateStep` に渡される               | 充足済み             |
| AC-4 | スキル生成中に `GenerateStep.tsx` のプログレスバーが更新される              | 充足済み（実装済み） |

**全AC充足済み**: TASK-SW-STREAM-002 が要求する実装はコードベースに既に存在する。
