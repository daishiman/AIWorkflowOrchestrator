# manual-test-checklist.md — Phase 11 成果物

## 手動テストチェックリスト

本タスクは内部エンジンのリファクタリング（UI 変更なし）のため、
Phase 11 は非視覚エビデンスの確認として実施する。

### 確認項目

| #   | 確認内容                                                                     | 確認方法                                                                               |
| --- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | dynamic pipeline で manifest custom agent/reference が plan prompt に入る    | `RuntimeSkillCreatorFacade.plan-resource-selection.test.ts`                            |
| 2   | dynamic pipeline で manifest custom agent/reference が improve prompt に入る | `RuntimeSkillCreatorFacade.improve-resource-selection.test.ts`                         |
| 3   | legacy path でも manifest custom agent/reference を読む                      | `RuntimeSkillCreatorFacade.plan.test.ts` / `RuntimeSkillCreatorFacade.improve.test.ts` |
| 4   | `AgentNameResolver` / `ManifestLoader.extractAgentConfig` の単体検証が通る   | `AgentNameResolver.test.ts` / `ManifestLoader.test.ts`                                 |
| 5   | TypeScript コンパイルエラーなし                                              | `pnpm --filter @repo/desktop exec tsc --noEmit`                                        |

## 注記

UI への変更がないため、スクリーンショット取得と Electron 画面起動確認は N/A。
manifest phase resource の選択結果は targeted runtime test を一次証跡とする。
