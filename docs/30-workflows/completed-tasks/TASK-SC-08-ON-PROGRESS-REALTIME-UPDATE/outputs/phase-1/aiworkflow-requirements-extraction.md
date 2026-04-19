# IPC/Renderer/State 仕様抽出結果

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 1                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 作成日     | 2026-04-19                                                                  |
| ステータス | completed                                                                   |

---

## 1. IPC 仕様抽出

### チャネル: `SKILL_CREATOR_PROGRESS`

| 項目           | 内容                                                     |
| -------------- | -------------------------------------------------------- |
| 方向           | Main → Renderer（ipcRenderer.on）                        |
| チャネル名     | `SKILL_CREATOR_PROGRESS`                                 |
| ペイロード型   | `{ phase: string; percentage: number; message: string }` |
| 発火タイミング | スキル生成処理の各 phase 完了時                          |
| クリーンアップ | `safeOn` の返却関数でリスナー解除（P5対策）              |

### onProgress API 契約（Preload 公開）

```typescript
type StreamingProgressApi = {
  onProgress?: (
    callback: (progress: {
      phase: string;
      percentage: number;
      message: string;
    }) => void,
  ) => () => void; // 返却値はクリーンアップ関数
};
```

- `window.skillCreatorAPI.onProgress` として Preload から公開
- コールバック登録後、返却されるクリーンアップ関数を `useEffect` の `return` で呼び出す

---

## 2. Renderer 仕様抽出

### useStreamingProgress Hook

| 項目           | 内容                                                                |
| -------------- | ------------------------------------------------------------------- |
| ファイル       | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`           |
| 役割           | IPC リスナー管理・progress → stage 変換・Zustand Store 更新         |
| 変換マップ     | `PHASE_TO_STAGE: Record<string, StreamingGenerationStage>`          |
| フォールバック | `PHASE_TO_STAGE[phase] ?? "planning"` （未知 phase は planning へ） |
| P5 対策        | `api.onProgress` の返却関数を `useEffect` cleanup で呼び出し済み    |

#### PHASE_TO_STAGE マップ（実装後）

```typescript
const PHASE_TO_STAGE: Record<string, StreamingGenerationStage> = {
  // create モード
  planning: "planning",
  "generating-skill": "generating-skill",
  "generating-agents": "generating-agents",
  validating: "validating",
  done: "done",
  // update モード（TASK-SC-08 追加）
  "loading-skill": "planning",
  analyzing: "planning",
  // orchestrate モード（TASK-SC-08 追加）
  "engine-selection": "planning",
  // improve-prompt モード（TASK-SC-08 追加）
  improving: "generating-skill",
};
```

### GenerateStep コンポーネント

| 項目           | 内容                                                                 |
| -------------- | -------------------------------------------------------------------- |
| ファイル       | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx` |
| 動的メッセージ | `const currentMessage = message \|\| generationProgress \|\| ""`     |
| 対応状況       | 既に動的表示対応済み。TASK-SC-08 での変更不要                        |

---

## 3. State 仕様抽出

### generationProgressSlice

| 項目                          | 内容                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| ファイル                      | `apps/desktop/src/renderer/store/slices/generationProgressSlice.ts`                                     |
| `StreamingGenerationStage` 型 | `idle \| planning \| generating-skill \| generating-agents \| validating \| done \| error \| cancelled` |
| 変更要否                      | 不要。既存 stage 型で全モードの進捗をカバーできる                                                       |
| `updateStreamingProgress`     | `{ stage, percent, message, previewContent? }` を受け取り一括更新するアクション                         |
| `resetStreamingProgress`      | コンポーネントアンマウント時に呼び出す初期化アクション                                                  |

---

## 4. モード別 phase 対応表

| モード         | IPC phase 名        | マッピング先 stage  | 備考                           |
| -------------- | ------------------- | ------------------- | ------------------------------ |
| create         | `planning`          | `planning`          | 既存                           |
| create         | `generating-skill`  | `generating-skill`  | 既存                           |
| create         | `generating-agents` | `generating-agents` | 既存                           |
| create         | `validating`        | `validating`        | 既存                           |
| create         | `done`              | `done`              | 既存                           |
| update         | `loading-skill`     | `planning`          | TASK-SC-08 追加                |
| update         | `analyzing`         | `planning`          | TASK-SC-08 追加                |
| orchestrate    | `engine-selection`  | `planning`          | TASK-SC-08 追加                |
| improve-prompt | `improving`         | `generating-skill`  | TASK-SC-08 追加                |
| すべて         | `error`             | （特殊処理）        | `setStage("error")` を呼び出し |
| 未知 phase     | any                 | `planning`          | フォールバック                 |

---

## 5. 抽出まとめ

| カテゴリ | 抽出結果                                                   | 変更要否 |
| -------- | ---------------------------------------------------------- | -------- |
| IPC 契約 | `SKILL_CREATOR_PROGRESS` チャネル・onProgress API 確認済み | なし     |
| Renderer | `useStreamingProgress.ts` の PHASE_TO_STAGE 拡張が必要     | あり     |
| State    | `generationProgressSlice.ts` 型変更不要                    | なし     |
| UI       | `GenerateStep.tsx` 動的表示対応済み                        | なし     |
| Preload  | `skillCreatorAPI.onProgress` 型変更不要                    | なし     |
