# Phase 8 成果物: リファクタリング計画

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## 実施済みリファクタリング

Phase 5の実装で以下のリファクタリングを同時実施：

1. **不要なインポート除去**: GenerationMode, PlanResult, SkillCreatorWorkflowUiSnapshot,
   TerminalHandoffBundle, 7つのstore hook
2. **不要な関数除去**: isTerminalHandoffExecuteResponse, toHandoffGuidance,
   toTerminalHandoffPlanResult, SkillCreatorRuntimeApi, getSkillCreatorApi
3. **関数のリネーム**: handleCancelTemplateGeneration → handleCancelGeneration
4. **invalidateGenerationRequests の簡素化**: llmRef除去でsingle ref操作に

## 残存する技術的負債（将来タスク）

| 負債                           | 内容                                  | 優先度 |
| ------------------------------ | ------------------------------------- | ------ |
| templateGenerationRequestIdRef | "template"の命名はLLM専用化後は不適切 | 低     |
| TASK-SC-07コメント残存         | jsdocコメントに旧タスク参照           | 低     |
| llm-generation.test.tsx        | skipされたテストの削除                | 低     |

## リファクタリング後のテスト確認

全34テストPASS（変更なし）。
