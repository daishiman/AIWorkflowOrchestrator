# Phase 5 成果物: 実装サマリー

## 変更ファイル

### 1. `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

- `plan()` の dynamic path は manifest 優先解決を維持
- `improve()` の fallback path を `IMPROVE_RESOURCE_REQUESTS` ベースへ統一
- `resolveOperationResources()` に manifest phase 由来 request を渡せるよう整理

### 2. `apps/desktop/src/main/services/runtime/SkillCreatorSourceResolver.ts`

- 同一 root の重複候補を `resolvedRoot` ベースで dedupe
- manifest / explicit / env の同一 root が複数 source から来ても provenance を安定化

### 3. `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`

- `AGENT_NAME` を削除し、agent 名の単一ソースを `IMPROVE_RESOURCE_REQUESTS` に固定

## 受入基準充足状況

| AC   | 状態 | 根拠                                               |
| ---- | ---- | -------------------------------------------------- |
| AC-1 | ✅   | ハードコード agent 名の direct 参照を除去          |
| AC-2 | ✅   | ManifestLoader 既存実装で resources を提供         |
| AC-3 | ✅   | manifest 未定義時は static fallback                |
| AC-4 | ✅   | custom manifest の plan / improve 両方で動作       |
| AC-5 | ✅   | 既存テストは PASS                                  |
| AC-6 | ✅   | plan / improve / resolver / planner のテストを追加 |

## テスト結果

- 18 テスト PASS
- `RuntimeSkillCreatorFacade.plan-resource-selection.test.ts`
- `RuntimeSkillCreatorFacade.improve-resource-selection.test.ts`
- `RuntimeSkillCreatorFacade.p0-07-dynamic-agent-names.test.ts`
- `SkillCreatorSourceResolver.test.ts`
- `PhaseResourcePlanner.test.ts`

## 後方互換性

- fallback path の static request id は維持
- public IPC / shared type の shape は変更なし
