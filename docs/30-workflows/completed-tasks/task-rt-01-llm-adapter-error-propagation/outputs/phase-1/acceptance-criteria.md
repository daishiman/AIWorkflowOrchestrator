# Phase 1: 受入条件一覧 - TASK-RT-01

## 受入条件（Acceptance Criteria）

| ID   | 条件                                                                                                                     | 実装対象                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| AC-1 | `ANTHROPIC_API_KEY` 未設定または無効値でアプリを起動したとき、`SkillLifecyclePanel` 上部にエラーバナーが表示される       | `SkillLifecyclePanel` + `useLLMAdapterStatus` + `LLMAdapterErrorBanner`  |
| AC-2 | エラーバナーには actionable なメッセージ（「APIキーを設定してください」等）が含まれる                                    | `LLMAdapterErrorBanner.buildMessage()`                                   |
| AC-3 | `skill-creator:get-adapter-status` を invoke すると `{ status: LLMAdapterStatus, failureReason: string \| null }` が返る | `creatorHandlers.ts` + `channels.ts`                                     |
| AC-4 | `setLLMAdapterFailed()` が呼ばれたタイミングで `skill-creator:adapter-status-changed` push イベントが Renderer に届く    | `Facade.onAdapterStatusChanged` → `creatorHandlers.ts` push ワイヤリング |
| AC-5 | UI は `"ready"` / `"initializing"` / `"failed"` の 3 状態を正しく表示・切り替えられる                                    | `LLMAdapterErrorBanner` + `useLLMAdapterStatus`                          |
| AC-6 | 正常な API キー設定時（status が `"ready"`）にはエラーバナーが表示されない                                               | `LLMAdapterErrorBanner`: `status !== "failed"` → null                    |
| AC-7 | 全 TypeScript 型チェックが通る                                                                                           | `pnpm --filter @repo/desktop typecheck`                                  |
| AC-8 | 新規追加テストが全て PASS する                                                                                           | Phase 4・6 テストファイル                                                |

## 統合テスト対象

1. `creatorHandlers.adapterStatus.test.ts` — IPC ハンドラ単体テスト
2. `LLMAdapterErrorBanner.test.tsx` — コンポーネント統合テスト
3. `useLLMAdapterStatus.test.ts` — フックテスト
