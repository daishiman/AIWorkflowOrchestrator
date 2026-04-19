# アーキテクチャ設計書

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 2                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 作成日     | 2026-04-19                                                                  |
| ステータス | completed                                                                   |

---

## 1. 層別責務設計

### 全体構成

```
┌─────────────────────────────────────────────────────────┐
│  Main プロセス                                           │
│  SkillCreatorService                                     │
│  ・mode別に phase を emit（loading-skill / analyzing /   │
│    engine-selection / improving 等）                     │
│  ・ipcMain.emit("SKILL_CREATOR_PROGRESS", payload)       │
└──────────────────────────┬──────────────────────────────┘
                           │ IPC（SKILL_CREATOR_PROGRESS）
┌──────────────────────────▼──────────────────────────────┐
│  Preload プロセス                                        │
│  skill-creator-api.ts                                    │
│  ・contextBridge.exposeInMainWorld("skillCreatorAPI", …) │
│  ・onProgress: safeOn でリスナー登録・返却関数でクリーン │
└──────────────────────────┬──────────────────────────────┘
                           │ window.skillCreatorAPI.onProgress
┌──────────────────────────▼──────────────────────────────┐
│  Renderer プロセス                                       │
│                                                          │
│  useStreamingProgress Hook                               │
│  ・getSkillCreatorApi() で API 取得                      │
│  ・api.onProgress でコールバック登録                     │
│  ・mapPhaseToStage(phase) で stage へ変換                │
│  ・updateStreamingProgress(store action) でState更新     │
│  ・useEffect cleanup でリスナー解除（P5対策）            │
│                          │                               │
│  Zustand Store           │                               │
│  generationProgressSlice │                               │
│  ・streamingStage        │                               │
│  ・streamingPercent      │                               │
│  ・streamingMessage      │                               │
│                          │                               │
│  GenerateStep コンポーネント                             │
│  ・stage / percent / message を表示                      │
│  ・currentMessage = message || generationProgress || ""  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 各層の責務

### Main プロセス層

| 責務                      | 詳細                                                            |
| ------------------------- | --------------------------------------------------------------- |
| phase emit                | スキル生成の各処理ステップで IPC イベントを発火する             |
| mode 別 phase 名の管理    | `update`, `orchestrate`, `improve-prompt` 固有の phase 名を定義 |
| エラー通知                | `phase: "error"` で失敗を通知                                   |
| **TASK-SC-08 の変更なし** | Main 側の実装変更はスコープ外                                   |

### Preload 層

| 責務                      | 詳細                                           |
| ------------------------- | ---------------------------------------------- |
| API 公開                  | `contextBridge.exposeInMainWorld` で安全に公開 |
| リスナー登録・解除        | `safeOn` パターンでクリーンアップ関数を返す    |
| 型契約                    | `phase: string` で汎用的に受け入れ             |
| **TASK-SC-08 の変更なし** | Preload 側の実装変更はスコープ外               |

### Renderer 層（変更対象）

| 責務                       | 詳細                                                                          |
| -------------------------- | ----------------------------------------------------------------------------- |
| **phase → stage 変換**     | `PHASE_TO_STAGE` マップで IPC の phase 名を UI stage に変換（**今回の変更**） |
| Store 更新                 | `updateStreamingProgress` で Zustand Store に反映                             |
| リスナーライフサイクル管理 | `useEffect` cleanup で確実に解除（P5対策済み）                                |
| UI 表示                    | `GenerateStep` が stage / percent / message を受け取り表示                    |

---

## 3. PHASE_TO_STAGE 変換設計

### 設計方針

- IPC の `phase: string` は Main 側の実装依存で増える可能性があるため、`Record<string, StreamingGenerationStage>` で柔軟に受け入れる
- 未知 phase は `"planning"` にフォールバックして UI が壊れないようにする
- mode 別の意味論的なマッピングを明示的にコメントで記録する

### マッピング論理

| phase 名           | マッピング理由                            |
| ------------------ | ----------------------------------------- |
| `loading-skill`    | スキル定義の読み込み = 計画フェーズに相当 |
| `analyzing`        | 入力分析 = 計画フェーズに相当             |
| `engine-selection` | エンジン選択 = 計画フェーズに相当         |
| `improving`        | プロンプト改善 = スキル生成フェーズに相当 |

---

## 4. 依存関係

```
useStreamingProgress.ts
  └── generationProgressSlice.ts（型 StreamingGenerationStage を参照）
  └── window.skillCreatorAPI（Preload 公開 API を参照）

GenerateStep.tsx
  └── useStreamingProgress の戻り値（stage, percent, message）を Props で受け取る
  └── SkillCreateWizard 経由で接続
```

---

## 5. 変更影響の局所化

本タスクの変更は `useStreamingProgress.ts` の `PHASE_TO_STAGE` オブジェクトへの 4 エントリ追加のみであり、以下の理由で影響が局所化される。

1. `PHASE_TO_STAGE` は関数スコープ内の定数であり、外部から参照・変更されない
2. `mapPhaseToStage` の返却型 `StreamingGenerationStage` は変わらない
3. フォールバックロジックは維持されるため、既存 create モードへの影響なし
4. Zustand Store の型・アクションに変更なし
