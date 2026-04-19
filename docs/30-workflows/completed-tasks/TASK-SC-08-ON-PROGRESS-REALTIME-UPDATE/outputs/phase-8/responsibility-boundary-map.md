# Phase 8 成果物: Main/Preload/Renderer 責務境界マップ

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| タスク     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE |
| Phase      | 8                                      |
| 作成日     | 2026-04-19                             |
| ステータス | 完了                                   |

## 責務境界マップ

```
╔══════════════════════════════════════════════════════════════════════╗
║  Main プロセス                                                        ║
║  ─────────────────────────────────────────────────────────────────  ║
║  SkillCreatorService / executePlan()                                  ║
║    責務: AIエンジン呼び出し・phaseメッセージ生成・onProgress送信       ║
║    送信: ipcMain.emit("SKILL_CREATOR_PROGRESS", { phase, message })   ║
╚══════════════════════════════════════════════════════════════════════╝
                          ↓ IPC チャンネル
                  SKILL_CREATOR_PROGRESS
                          ↓
╔══════════════════════════════════════════════════════════════════════╗
║  Preload スクリプト                                                   ║
║  ─────────────────────────────────────────────────────────────────  ║
║  skillCreatorAPI.onProgress(callback)                                 ║
║    責務: IPC受信→Rendererへのブリッジ・型安全な公開境界               ║
║    公開: contextBridge経由でRendererにコールバック登録APIを提供        ║
╚══════════════════════════════════════════════════════════════════════╝
                          ↓ contextBridge
                          ↓
╔══════════════════════════════════════════════════════════════════════╗
║  Renderer プロセス                                                    ║
║  ─────────────────────────────────────────────────────────────────  ║
║                                                                       ║
║  [Hook層: useSkillLLMGeneration.ts または SkillLifecyclePanel.tsx]   ║
║    責務: onProgressリスナーのライフサイクル管理                        ║
║    - isGenerating=true 時にリスナーを登録                             ║
║    - isGenerating=false / アンマウント時に cleanup（リスナー解除）     ║
║    - dispatch(setGenerationProgress(data)) を呼び出す                 ║
║                    ↓ dispatch                                         ║
║  [Store層: generationProgressSlice.ts]                                ║
║    責務: generationProgress 状態の保持と更新                          ║
║    - setGenerationProgress(data) リデューサー                         ║
║    - phase / percentage / message の State 管理                       ║
║                    ↓ useSelector                                      ║
║  [Hook層: useStreamingProgress.ts]                                    ║
║    責務: phase → stage 変換・Store 更新                               ║
║    - PHASE_TO_STAGE[phase] ?? "planning" でstageを解決               ║
║    - 追加エントリ: "loading-skill"→"planning",                        ║
║                   "analyzing"→"planning",                             ║
║                   "engine-selection"→"planning",                      ║
║                   "improving"→"generating-skill"                      ║
║                    ↓ generationProgress.stage/message                 ║
║  [Component層: GenerateStep.tsx]                                      ║
║    責務: generationProgress.message の動的表示                        ║
║    - aria-live="polite" によるアクセシブルな進捗表示                  ║
║    - nullish coalescing fallback（"生成中..."）                       ║
╚══════════════════════════════════════════════════════════════════════╝
```

## 層別責務一覧

| 層                          | ファイル                     | 責務                                      | 本タスクでの変更   |
| --------------------------- | ---------------------------- | ----------------------------------------- | ------------------ |
| Main                        | `SkillCreatorService.ts`など | executePlan実行・phaseメッセージ送信      | なし               |
| Preload                     | `skillCreatorAPI.ts`など     | IPC→Renderer ブリッジ・型安全公開         | なし               |
| Renderer / Hook (lifecycle) | `useSkillLLMGeneration.ts`   | onProgressリスナー登録・cleanup・dispatch | なし（既実装）     |
| Renderer / Store            | `generationProgressSlice.ts` | generationProgress状態管理                | なし（型変更不要） |
| Renderer / Hook (mapping)   | `useStreamingProgress.ts`    | phase→stage変換・PHASE_TO_STAGEマップ管理 | **4エントリ追加**  |
| Renderer / Component        | `GenerateStep.tsx`           | generationProgress.messageの動的UI表示    | なし（既対応）     |

## 境界制約

| 制約                          | 内容                                                         |
| ----------------------------- | ------------------------------------------------------------ |
| Main→Preload 通信             | IPC チャンネル `SKILL_CREATOR_PROGRESS` のみ使用             |
| Preload→Renderer 公開         | `contextBridge.exposeInMainWorld` 経由のみ許可               |
| Renderer 内層間通信           | Redux dispatch/selector のみ（直接参照禁止）                 |
| onProgress リスナーのスコープ | `isGenerating=true` 期間のみ有効。cleanup 必須               |
| PHASE_TO_STAGE の拡張ルール   | フラットマップ方式。モード別分岐なし。文字列キーのみ追加可能 |

## 本タスクの変更影響範囲

本タスクでの変更は `useStreamingProgress.ts` の `PHASE_TO_STAGE` マップへの4エントリ追加のみ。
他の全層（Main/Preload/Store/onProgress接続Hook/Component）は変更なし。

```
変更ファイル: useStreamingProgress.ts（1ファイルのみ）
変更種別: PHASE_TO_STAGEマップへのエントリ追加（4件）
境界への影響: なし（内部マッピングロジックの拡張のみ）
```
