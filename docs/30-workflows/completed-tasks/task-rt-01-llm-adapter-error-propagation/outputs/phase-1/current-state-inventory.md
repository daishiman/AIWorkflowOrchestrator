# Phase 1: 現状棚卸し - TASK-RT-01

## 既実装確認（2026-04-04）

| 項目                                              | 実装状態    | ファイル・行                                    |
| ------------------------------------------------- | ----------- | ----------------------------------------------- |
| `_llmAdapterStatus` フィールド                    | ✅ 実装済み | `RuntimeSkillCreatorFacade.ts:146`              |
| `setLLMAdapterFailed(reason)`                     | ✅ 実装済み | `RuntimeSkillCreatorFacade.ts:226-229`          |
| `setLLMAdapter(adapter)`                          | ✅ 実装済み | `RuntimeSkillCreatorFacade.ts:216-220`          |
| `llmAdapterStatus` getter                         | ✅ 実装済み | `RuntimeSkillCreatorFacade.ts:198-200`          |
| `llmAdapterFailureReason` getter                  | ✅ 実装済み | `RuntimeSkillCreatorFacade.ts:203-205`          |
| 初期化失敗時 `setLLMAdapterFailed()` 呼び出し     | ✅ 実装済み | `main/ipc/index.ts:1060-1063`                   |
| `LLMAdapterStatus` 型                             | ✅ 実装済み | `shared/types/skillCreator.ts:338`              |
| `SkillCreatorErrorCode` 型                        | ✅ 実装済み | `shared/types/skillCreator.ts:341-344`          |
| `AdapterStatusBadge` コンポーネント               | ✅ 実装済み | `renderer/components/atoms/AdapterStatusBadge/` |
| `skill-creator:get-adapter-status` チャネル       | ❌ 未実装   | `preload/channels.ts`（追加必要）               |
| `skill-creator:adapter-status-changed` チャネル   | ❌ 未実装   | `preload/channels.ts`（追加必要）               |
| `onAdapterStatusChanged` コールバック             | ❌ 未実装   | `RuntimeSkillCreatorFacade.ts`（追加必要）      |
| IPC ハンドラ                                      | ❌ 未実装   | `creatorHandlers.ts`（追加必要）                |
| `getAdapterStatus()` / `onAdapterStatusChanged()` | ❌ 未実装   | `preload/skill-creator-api.ts`（追加必要）      |
| `LLMAdapterErrorBanner.tsx`                       | ❌ 未実装   | 新規作成必要                                    |
| `useLLMAdapterStatus.ts`                          | ❌ 未実装   | 新規作成必要                                    |
| `SkillLifecyclePanel` 統合                        | ❌ 未実装   | 追加必要                                        |

## 現状差分分析

| 観点                | 現状                                                   | 本タスクで到達する状態                           |
| ------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| IPC チャネル        | `skill-creator:get-adapter-status` 未定義              | `channels.ts` に追加・ALLOWED リスト登録済み     |
| push 通知           | `setLLMAdapterFailed()` 呼び出し後の Renderer 通知なし | `adapter-status-changed` push が Renderer に届く |
| Facade コールバック | なし                                                   | `onAdapterStatusChanged` コールバックがある      |
| Preload API         | `getAdapterStatus()` メソッドなし                      | `skillCreatorAPI.getAdapterStatus()` が呼べる    |
| UI 表示             | エラーバナーなし                                       | `SkillLifecyclePanel` にエラーバナーが表示される |
