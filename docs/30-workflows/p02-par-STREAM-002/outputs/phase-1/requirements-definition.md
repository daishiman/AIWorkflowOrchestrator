# Phase 1: 要件定義書

## タスク概要

**タスクID**: TASK-SW-STREAM-002  
**タイトル**: `skillCreatorHandlers.ts` の `SKILL_CREATOR_CREATE` ハンドラーで `createSkill()` 呼び出しに `onProgress` コールバックを接続し、`sendSkillCreatorProgress(mainWindow, progress)` と配線する  
**作成日**: 2026-04-18

---

## P50チェック結果（断絶箇所の確認）

調査対象ファイルを実際に読んだ結果を記録する。

### 調査ファイル一覧

| ファイル                                                             | 調査目的                                                            | 結果             |
| -------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------- |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                  | `createSkill()` 呼び出しと `sendSkillCreatorProgress` の接続状態    | **既に実装済み** |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`   | `useStreamingProgress()` の戻り値が `GenerateStep` に渡されているか | **既に接続済み** |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`        | `onProgress?` 引数の存在確認                                        | **実装済み**     |
| `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx` | 受け取る props の確認                                               | **実装済み**     |
| `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`            | 戻り値の型確認                                                      | **実装済み**     |

### P50チェック詳細結果

#### AC-1: `SKILL_CREATOR_CREATE` ハンドラーでの `onProgress` 接続

ファイル: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`（行278-283）

```typescript
const skillDir = await skillCreatorService.createSkill(
  validatedArgs,
  (progress) => {
    sendSkillCreatorProgress(mainWindow, progress);
  },
);
```

**結果: 実装済み（断絶なし）**  
`createSkill()` の第2引数にアロー関数コールバックが渡されており、コールバック内で `sendSkillCreatorProgress(mainWindow, progress)` が呼ばれている。

#### AC-2: `sendSkillCreatorProgress` の実装確認

ファイル: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`（行720-731）

```typescript
export function sendSkillCreatorProgress(
  mainWindow: BrowserWindow,
  progress: { phase: string; percentage: number; message: string },
): void {
  if (!mainWindow.isDestroyed()) {
    mainWindow.webContents.send(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, progress);
  }
}
```

**結果: 実装済み（断絶なし）**  
`IPC_CHANNELS.SKILL_CREATOR_PROGRESS` チャンネルでレンダラーに送信する実装が存在する。

#### AC-3: `SkillCreateWizard.tsx` での `useStreamingProgress()` 戻り値と `GenerateStep` の接続

ファイル: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`（行323、577-644）

```typescript
const streaming = useStreamingProgress();
// ...
const resolvedStage = resolveStage(streaming.stage, isGenerating || isSkillGenerating, bridgeLocalError(error));
const resolvedPercent = streaming.percent;
const resolvedMessage = streaming.message || generationProgress || "";
const resolvedPreview = streaming.previewContent;
// ...
<GenerateStep
  stage={resolvedStage}
  percent={resolvedPercent}
  message={resolvedMessage}
  previewContent={resolvedPreview}
  error={resolvedError}
  // ...
/>
```

**結果: 実装済み（断絶なし）**  
`useStreamingProgress()` の戻り値（`stage`, `percent`, `message`, `previewContent`）が `GenerateStep` に渡されている。

#### AC-4: `SkillCreatorService.ts` の `onProgress?` 引数確認

ファイル: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（行205-208）

```typescript
async createSkill(
  options: CreateSkillOptions,
  onProgress?: SkillCreatorProgressCallback,
): Promise<string>
```

コールバックは `planning`（10%）、`generating-skill`（40%）、`generating-agents`（70%）、`validating`（90%）、`done`（100%）の5段階で呼ばれる。  
ただし、`shouldEmitCreateProgress` が `options.mode === "create"` の場合のみ progress が送出される点に注意。

**結果: 実装済み（断絶なし）**

#### AC-5: `GenerateStep.tsx` のプログレスバー実装確認

ファイル: `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`（行53-69、119-137）

Props:

- `stage: GenerationStage`
- `percent: number`
- `message: string`
- `previewContent?: string | null`

プログレスバーは `stage !== "idle" && stage !== "error" && stage !== "cancelled"` の場合に表示され、`percent` の値で幅が制御される。

**結果: 実装済み（断絶なし）**

#### AC-6: `useStreamingProgress.ts` の戻り値型確認

ファイル: `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`（行43-52）

```typescript
export interface UseStreamingProgressReturn {
  stage: StreamingGenerationStage;
  percent: number;
  message: string;
  previewContent: string | null;
  error: StreamingGenerationError | null;
  isGenerating: boolean;
}
```

IPC `onProgress` リスナーは `window.skillCreatorAPI.onProgress` 経由で登録される。preload層の `skill-creator-api.ts`（行679-682）で `safeOn<SkillCreatorProgress>(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, callback)` として実装済み。

**結果: 実装済み（断絶なし）**

### P50チェック総括

**全ての接続が実装済みであることを確認。TASK-SW-STREAM-002 が要求する実装はすでにコードベースに存在する。**

既存の実装状況:

- TASK-SW-STREAM-001 の成果として `SkillCreatorService.createSkill()` に `onProgress?` が追加済み
- `skillCreatorHandlers.ts` の `SKILL_CREATOR_CREATE` ハンドラーで `onProgress` コールバックが接続済み
- `sendSkillCreatorProgress` が `IPC_CHANNELS.SKILL_CREATOR_PROGRESS` チャンネルを通じてレンダラーへ送信済み
- `useStreamingProgress.ts` がプリロード層の `onProgress` を購読済み
- `SkillCreateWizard.tsx` が `useStreamingProgress()` の戻り値を `GenerateStep` に渡し済み

---

## 機能要件

### 実装済み機能（修正不要）

#### FR-1: `SKILL_CREATOR_CREATE` ハンドラーの onProgress 接続

- **状態**: 実装済み
- **内容**: `skillCreatorService.createSkill(validatedArgs, (progress) => { sendSkillCreatorProgress(mainWindow, progress); })` の形でコールバックが接続済み
- **ファイル**: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` 行278-283

#### FR-2: `sendSkillCreatorProgress` による IPC 送信

- **状態**: 実装済み
- **内容**: `mainWindow.webContents.send(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, progress)` で送信される
- **ファイル**: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` 行720-731

#### FR-3: Renderer 側のプログレス受信

- **状態**: 実装済み
- **内容**: `useStreamingProgress.ts` が preload `skillCreatorAPI.onProgress` 経由で受信し、Zustand store を更新
- **ファイル**: `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`

#### FR-4: GenerateStep へのプログレス反映

- **状態**: 実装済み
- **内容**: `SkillCreateWizard.tsx` が `streaming.stage`, `streaming.percent`, `streaming.message` を `GenerateStep` に渡す
- **ファイル**: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` 行577-644

### 制約事項

- `SkillCreatorService.createSkill()` の `shouldEmitCreateProgress` は `options.mode === "create"` の場合のみ progress を送出する（他モードでは onProgress コールバックは渡されるが呼ばれない）
- 現行の `SkillCreateWizard.tsx` は `createSkill()` を `mode: collaborative` 相当の引数で呼ぶ（`buildSkillContext` 経由）が、`mode` フィールドの値は `SkillInfoFormData.category` から決まる

---

## 非機能要件

| ID    | 分類           | 内容                                                                                                | 根拠                                               |
| ----- | -------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| NFR-1 | セキュリティ   | `mainWindow.isDestroyed()` チェック後にのみ `webContents.send` を呼ぶ                               | BrowserWindow が破棄された後の送信クラッシュを防ぐ |
| NFR-2 | 型安全         | `SkillCreatorProgressCallback` 型を介してコールバックの型を保証                                     | TypeScript 型チェックの通過                        |
| NFR-3 | パフォーマンス | progress は非同期スクリプト実行の合間にのみ発火（過剰なIPC通信を防ぐ）                              | 既存実装の設計方針                                 |
| NFR-4 | 保守性         | `IPC_CHANNELS.SKILL_CREATOR_PROGRESS` のチャンネル名は `packages/shared/src/ipc/channels.ts` が正本 | SSoT 原則                                          |

---

## タスク分類

| 項目         | 内容                                                               |
| ------------ | ------------------------------------------------------------------ |
| タスクタイプ | バグ修正相当の接続確認（ただし実装は既存コードに存在）             |
| 影響範囲     | Main Process（IPC Handler）、Renderer（Hook, Component）           |
| 依存タスク   | TASK-SW-STREAM-001（createSkill に onProgress 引数追加）→ 完了済み |
| 優先度       | 中（機能要件はすでに満たされている）                               |

---

## スコープ

### 含む

- `skillCreatorHandlers.ts` の `SKILL_CREATOR_CREATE` ハンドラーにおける `onProgress` 接続の検証
- `sendSkillCreatorProgress` の動作確認
- `SkillCreateWizard.tsx` から `GenerateStep` へのプログレスデータ受け渡し確認

### 含まない

- `SkillCreatorService.createSkill()` 内部のプログレス送出タイミングの変更
- 新しい IPC チャンネルの追加
- プログレス UI の変更

---

## 実行記録

| 項目     | 内容                                                            |
| -------- | --------------------------------------------------------------- |
| 実行日   | 2026-04-18                                                      |
| 調査者   | Claude Code (claude-sonnet-4-6)                                 |
| 調査方法 | ソースコードの直接読み取り（Read ツール）                       |
| 結論     | TASK-SW-STREAM-002 が要求する全ての実装が既に存在することを確認 |
