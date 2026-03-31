# implementation-plan.md — Phase 5 成果物

## 変更ファイル一覧

| ファイル                                                                     | 変更種別 | 内容                                                    |
| ---------------------------------------------------------------------------- | -------- | ------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                                  | 変更     | `AgentConfig` interface 追加                            |
| `apps/desktop/src/main/services/runtime/AgentNameResolver.ts`                | 新規     | `AgentNameResolver` クラス + `DEFAULT_PLAN_AGENT_NAMES` |
| `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                   | 変更     | `extractAgentConfig()` メソッド追加                     |
| `apps/desktop/src/main/services/runtime/planPromptConstants.ts`              | 変更     | `AGENT_NAMES` 定数を削除                                |
| `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`           | 変更     | `AGENT_NAME` 定数を削除                                 |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`        | 変更     | legacy branch を `AgentNameResolver` 経由に変更         |
| `apps/desktop/src/main/services/runtime/__tests__/AgentNameResolver.test.ts` | 新規     | `AgentNameResolver` ユニットテスト (12 ケース)          |
| `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.test.ts`    | 変更     | `extractAgentConfig` テスト追加 (3 ケース)              |

## テスト結果

- 新規テスト: 12 + 3 = 15 ケース pass
- 既存テスト: 425 ケース pass（退行なし）
- 合計: 26 テストファイル / 425 テスト全て pass

## 受入基準充足確認

| AC   | 充足                                                                                 |
| ---- | ------------------------------------------------------------------------------------ |
| AC-1 | ✅ `AGENT_NAMES` / `AGENT_NAME` 定数を両方削除                                       |
| AC-2 | ✅ `ManifestLoader.extractAgentConfig()` 追加                                        |
| AC-3 | ✅ `resolveFromManifest` が空 manifest → `DEFAULT_PLAN_AGENT_NAMES` にフォールバック |
| AC-4 | ✅ 異なる agent ID を持つ manifest を正しく解決                                      |
| AC-5 | ✅ 全 425 テスト pass（後方互換維持）                                                |
| AC-6 | ✅ `AgentNameResolver.test.ts` が manifest あり/なし/空/reference混在 を網羅         |
