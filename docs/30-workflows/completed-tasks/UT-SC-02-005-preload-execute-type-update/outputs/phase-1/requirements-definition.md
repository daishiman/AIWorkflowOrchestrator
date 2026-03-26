# Phase 1: 要件定義書

## P50チェック結果

| ファイル                                | 現在の型                             | 期待する型                           | 状態   |
| --------------------------------------- | ------------------------------------ | ------------------------------------ | ------ |
| `creatorHandlers.ts:139`                | `RuntimeSkillCreatorExecuteResponse` | 同左                                 | OK     |
| `skillCreator.ts:418`                   | Union型定義済み                      | 同左                                 | OK     |
| `types/index.ts:131`                    | Export済み                           | 同左                                 | OK     |
| `skill-creator-api.ts:110,284`          | `RuntimeSkillCreatorExecuteResult`   | `RuntimeSkillCreatorExecuteResponse` | 要修正 |
| `SkillLifecyclePanel.tsx:72-77,424-427` | `{skillName,skillPath}` 直接アクセス | `terminal_handoff` 型ナロイング      | 要修正 |

## plan/improve との整合性

- `planSkill`: `RuntimeSkillCreatorPlanResponse`（Union型）使用 - OK
- `improveSkillWithFeedback`: `RuntimeSkillCreatorImproveResponse`（Union型）使用 - OK
- `executePlan`: `RuntimeSkillCreatorExecuteResult`（旧型）- 要修正

## 受け入れ基準

| ID   | 基準                                                                                                      | 検証方法                |
| ---- | --------------------------------------------------------------------------------------------------------- | ----------------------- |
| AC-1 | `skill-creator-api.ts` の `executePlan` 戻り値型が `IpcResult<RuntimeSkillCreatorExecuteResponse>` に更新 | grep + typecheck        |
| AC-2 | `SkillLifecyclePanel.tsx` で `"type" in result.data` による discriminated union 型ナロイング実装          | コードレビュー + テスト |
| AC-3 | `pnpm typecheck` が PASS                                                                                  | コマンド実行            |
| AC-4 | 関連テスト（Preload API / Renderer）が PASS                                                               | コマンド実行            |
