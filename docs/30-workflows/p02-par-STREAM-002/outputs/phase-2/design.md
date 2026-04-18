# Phase 2: 設計書

**タスクID**: TASK-SW-STREAM-002  
**作成日**: 2026-04-18  
**前提**: Phase 1 の P50 チェックにより、全 AC が実装済みであることを確認済み

---

## 1. コールバック接続の設計

### 1.1 変更前/後のコード例

#### 変更前（想定されていた未実装状態）

```typescript
// skillCreatorHandlers.ts - SKILL_CREATOR_CREATE ハンドラー（想定未実装状態）
try {
  const skillDir = await skillCreatorService.createSkill(validatedArgs);
  // onProgress コールバックが渡されていない
  return { success: true, data: skillDir };
} catch (error) {
  return { success: false, error: sanitizeErrorMessage(error) };
}
```

#### 変更後（現在の実装済み状態）

```typescript
// skillCreatorHandlers.ts 行276-284 - 実装済み
try {
  // progress 通知を renderer に送る
  const skillDir = await skillCreatorService.createSkill(
    validatedArgs,
    (progress) => {
      sendSkillCreatorProgress(mainWindow, progress);
    },
  );
  return { success: true, data: skillDir };
} catch (error) {
  return { success: false, error: sanitizeErrorMessage(error) };
}
```

**判定**: 実装済み。コールバックは `(progress) => { sendSkillCreatorProgress(mainWindow, progress); }` の形で第2引数に渡されている。

### 1.2 `sendSkillCreatorProgress` の実装

```typescript
// skillCreatorHandlers.ts 行720-731 - 実装済み
export function sendSkillCreatorProgress(
  mainWindow: BrowserWindow,
  progress: {
    phase: string;
    percentage: number;
    message: string;
  },
): void {
  if (!mainWindow.isDestroyed()) {
    mainWindow.webContents.send(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, progress);
  }
}
```

安全チェック `!mainWindow.isDestroyed()` が含まれており、BrowserWindow 破棄後の送信クラッシュを防止している。

---

## 2. `sendSkillCreatorProgress` との配線フロー

```
[SkillCreatorService.createSkill()]
  │
  ├── mode === "create" の場合のみ shouldEmitCreateProgress = true
  │     → emitProgress({ phase: "planning",          percentage: 10,  message: "構造を計画しています" })
  │     → emitProgress({ phase: "generating-skill",  percentage: 40,  message: "SKILL.md を生成しています" })
  │     → emitProgress({ phase: "generating-agents", percentage: 70,  message: "エージェント定義を生成しています" })
  │     → emitProgress({ phase: "validating",        percentage: 90,  message: "スキルを検証しています" })
  │     → emitProgress({ phase: "done",              percentage: 100, message: "完了しました" })
  │
  │   ※ emitProgress 内部: onProgress?.(progress) を呼ぶ
  │
  └── onProgress コールバック（skillCreatorHandlers.ts）
        → sendSkillCreatorProgress(mainWindow, progress)
              → mainWindow.isDestroyed() チェック
              → mainWindow.webContents.send(
                   IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
                   progress
                 )
                   │
                   │ (IPC: "skill-creator:progress")
                   │
              → preload: skill-creator-api.ts
                   safeOn<SkillCreatorProgress>(
                     IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
                     callback
                   )
                   → window.skillCreatorAPI.onProgress() リスナー
                         │
              → useStreamingProgress.ts (useEffect)
                   api.onProgress((progress) => {
                     updateProgress({ stage, percent, message })
                   })
                         │
              → Redux store (generationProgressSlice)
                   { stage, percent, message, previewContent }
                         │
              → SkillCreateWizard.tsx
                   const streaming = useStreamingProgress()
                   resolvedStage   = resolveStage(streaming.stage, ...)
                   resolvedPercent = streaming.percent
                   resolvedMessage = streaming.message || ...
                         │
              → <GenerateStep
                   stage={resolvedStage}
                   percent={resolvedPercent}
                   message={resolvedMessage}
                   ...
                 />
                         │
              → プログレスバー幅更新
                   style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
```

---

## 3. `SkillCreateWizard.tsx` のprops接続方針

### 3.1 接続状況の判定

**判定: 接続済み（追加実装不要）**

| props            | 接続元                                                                                        | 状態     |
| ---------------- | --------------------------------------------------------------------------------------------- | -------- |
| `stage`          | `resolveStage(streaming.stage, isGenerating \|\| isSkillGenerating, bridgeLocalError(error))` | 接続済み |
| `percent`        | `streaming.percent`                                                                           | 接続済み |
| `message`        | `streaming.message \|\| generationProgress \|\| ""`                                           | 接続済み |
| `previewContent` | `streaming.previewContent`                                                                    | 接続済み |
| `error`          | `bridgeLocalError(error) ?? bridgeGenerationError(generationError)`                           | 接続済み |
| `isGenerating`   | `isGenerating \|\| isSkillGenerating \|\| streaming.isGenerating`                             | 接続済み |

### 3.2 `resolveStage()` のロジック

```typescript
// SkillCreateWizard.tsx 行146-155
function resolveStage(
  streamingStage: GenerationStage,
  isGenerating: boolean,
  localError: GenerationError | null,
): GenerationStage {
  if (localError && !isGenerating) return "error";
  if (streamingStage !== "idle") return streamingStage;
  if (isGenerating) return "planning";
  return "idle";
}
```

IPC プログレスが届いていない間（`streaming.stage === "idle"`）でも、`isGenerating === true` の場合は `"planning"` として表示される設計になっている。

### 3.3 `mode` 制約に関する注意事項

`SkillCreatorService.createSkill()` 内の `shouldEmitCreateProgress` は `options.mode === "create"` の場合のみ progress を emit する。

`SkillCreateWizard.tsx` の `handleGenerate()` では `createSkill(formData.purpose, SKILL_GENERATION_OPTIONS, skillContext)` を呼ぶが、この呼び出し先（`useCreateSkill` hook）経由で渡される `mode` が `"create"` でない場合、progress は送出されない。その場合でも `isGenerating` フラグにより `resolveStage()` が `"planning"` を返すため、UI 上は「生成中」状態として表示される。

---

## 4. IPC 4層整合性チェック

### 4.1 `SKILL_CREATOR_PROGRESS` チャンネルの4層確認

| 層                        | ファイル                                                       | 定義・使用方法                                                               | 状態 |
| ------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---- |
| Layer 1: Shared (SSoT)    | `packages/shared/src/ipc/channels.ts` 行196                    | `SKILL_CREATOR_PROGRESS: "skill-creator:progress"`                           | 存在 |
| Layer 2: Preload channels | `apps/desktop/src/preload/channels.ts` 行799                   | `ALLOWED_ON_CHANNELS` に `IPC_CHANNELS.SKILL_CREATOR_PROGRESS` が含まれる    | 存在 |
| Layer 3: Main Process     | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` 行729      | `mainWindow.webContents.send(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, progress)` | 存在 |
| Layer 4: Renderer         | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts` 行94 | `api.onProgress(callback)` → preload `safeOn(SKILL_CREATOR_PROGRESS, ...)`   | 存在 |

**判定: 4層すべてに整合性あり（追加実装不要）**

### 4.2 チャンネル名の正本確認

```
packages/shared/src/ipc/channels.ts:
  SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_PROGRESS = "skill-creator:progress"
```

`preload/channels.ts` は `SKILL_CREATOR_RUNTIME_CHANNELS` をスプレッドで取り込み（`...SKILL_CREATOR_RUNTIME_CHANNELS`、行349）、SSoT を維持している。

### 4.3 `ALLOWED_ON_CHANNELS` への登録確認

`preload/channels.ts` の `ALLOWED_ON_CHANNELS`（行799）に `IPC_CHANNELS.SKILL_CREATOR_PROGRESS` が含まれており、preload の `safeOn` 関数がこのチャンネルのリスナー登録を許可している。

---

## 5. 既存テストへの影響範囲

### 5.1 既存テストファイル一覧

| ファイル                                  | 内容                                                        | 影響                                      |
| ----------------------------------------- | ----------------------------------------------------------- | ----------------------------------------- |
| `skillCreatorHandlers.progress.test.ts`   | TASK-SW-STREAM-002 の TC-01〜TC-06（onProgress 配線テスト） | **直接対象**（実装済みのため GREEN 状態） |
| `skillCreatorHandlers.validation.test.ts` | 入力バリデーション（P42準拠3段バリデーション）              | 影響なし                                  |
| `skillCreatorHandlers.security.test.ts`   | セキュリティ（パストラバーサル、スキーマ名ホワイトリスト）  | 影響なし                                  |
| `skillCreatorHandlers.runtime.test.ts`    | ランタイムハンドラー                                        | 影響なし                                  |
| `skillCreatorHandlers-cancel.test.ts`     | キャンセル処理                                              | 影響なし                                  |

### 5.2 `skillCreatorHandlers.progress.test.ts` の詳細

このテストファイルは TASK-SW-STREAM-002 専用で作成されており（TDD Red フェーズ）、以下の TC をカバーする：

- **TC-01**: `createSkill()` 第2引数にコールバック関数が渡されること
- **TC-02**: `planning` フェーズの進捗が正しく `webContents.send` で送信されること
- **TC-03**: `done` フェーズ・複数フェーズの順序が正しいこと
- **TC-04**: コールバック接続後も `skillDir` 戻り値が正しいこと
- **TC-05**: `mainWindow.isDestroyed()` が `true` の場合に `send` がスキップされること
- **TC-06**: `createSkill` エラー時のレスポンスが `{ success: false, error }` であること

**実装がすでに存在するため、これらのテストはすべて GREEN 状態であることが期待される。**

### 5.3 影響を受ける可能性のある関連テスト

- `useStreamingProgress.ts` のテスト（もし存在すれば）: IPC リスナー登録・解除のロジックに影響しないため問題なし
- `SkillCreateWizard.tsx` の統合テスト: props 接続は既に実装済みのため影響なし

---

## 6. 検証マトリクス

| 検証項目                                            | 検証方法                           | 期待結果                                                         | 担当層       |
| --------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------- | ------------ |
| `createSkill()` 第2引数にコールバックが渡される     | ユニットテスト TC-01               | `typeof callArgs[1] === "function"`                              | Main Process |
| `onProgress` 呼び出し時に `webContents.send` が発火 | ユニットテスト TC-01, TC-02, TC-03 | `expect(send).toHaveBeenCalledWith(SKILL_CREATOR_PROGRESS, ...)` | Main Process |
| `isDestroyed() === true` 時に `send` スキップ       | ユニットテスト TC-05               | `expect(send).not.toHaveBeenCalled()`                            | Main Process |
| エラー時のレスポンス形式                            | ユニットテスト TC-06               | `{ success: false, error: string }`                              | Main Process |
| preload `onProgress` リスナー登録                   | `skill-creator-api.test.ts`        | `safeOn` が `SKILL_CREATOR_PROGRESS` で呼ばれる                  | Preload      |
| `useStreamingProgress` の store 更新                | Hook のユニットテスト              | `updateProgress` が呼ばれる                                      | Renderer     |
| `GenerateStep` のプログレスバー表示                 | Component テスト                   | `aria-valuenow` が `percent` と一致                              | Renderer     |
| E2E: 生成中に UI が更新される                       | 手動 or E2E テスト                 | プログレスバーが 10→100% と変化                                  | 統合         |

---

## 7. 設計判定サマリー

| 項目                                      | 判定                     | 根拠                                                 |
| ----------------------------------------- | ------------------------ | ---------------------------------------------------- |
| `onProgress` コールバック接続             | 実装済み（追加不要）     | `skillCreatorHandlers.ts` 行278-283                  |
| `sendSkillCreatorProgress` 配線           | 実装済み（追加不要）     | `skillCreatorHandlers.ts` 行720-731                  |
| `SkillCreateWizard` → `GenerateStep` 接続 | 実装済み（追加不要）     | `SkillCreateWizard.tsx` 行323, 577-644               |
| IPC 4層整合性                             | 整合済み                 | `SKILL_CREATOR_PROGRESS` が4層すべてに存在           |
| テストカバレッジ                          | テスト存在（GREEN 期待） | `skillCreatorHandlers.progress.test.ts` TC-01〜TC-06 |
| 追加実装の必要性                          | **なし**                 | Phase 1 P50チェックで全AC充足済みを確認              |
