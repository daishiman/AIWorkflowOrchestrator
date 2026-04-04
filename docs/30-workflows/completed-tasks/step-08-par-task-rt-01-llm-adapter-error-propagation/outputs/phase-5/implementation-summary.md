# Phase 5: Implementation Summary

## 変更ファイル一覧

| #   | ファイル                                                                                            | 変更内容                                                                                                                                       |
| --- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `packages/shared/src/types/skillCreator.ts`                                                         | `LLMAdapterStatus` / `SkillCreatorErrorCode` 型追加、`RuntimeSkillCreatorPlanErrorResponse` 追加、`RuntimeSkillCreatorPlanResponse` union 拡張 |
| 2   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                               | `_llmAdapterStatus` / `_llmAdapterFailureReason` プロパティ、getter、`setLLMAdapterFailed()`、`plan()` エラー分岐                              |
| 3   | `apps/desktop/src/main/ipc/index.ts` (934-946行)                                                    | catch 内に `setLLMAdapterFailed(reason)` を追加                                                                                                |
| 4   | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.adapter-status.test.ts` | T-ST-01〜06, T-PL-01〜06 の専用テストケース追加                                                                                                |

## 実装方針

- fire-and-forget パターンは維持（`void (async () => { ... })()` を壊さない）
- `RuntimeSkillCreatorPlanResponse` に error response union を追加し、既存 successful response との後方互換を維持
- actionable メッセージ判定は `plan()` 内で `/api.?key|ANTHROPIC_API_KEY/i` パターンマッチ
- `setLLMAdapter()` は既存メソッドを拡張（ステータス `"ready"` 遷移 + failureReason クリア）

## 実装しないこと

- fire-and-forget パターン自体の変更
- UI / renderer 側エラー表示 (TASK-RT-02)
- LLMAdapterFactory リトライロジック
- preload API 新規チャネル追加
- API キー管理機能
