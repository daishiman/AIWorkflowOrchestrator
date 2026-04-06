# Phase 4 成果物: テストマトリクス

## 正常系テスト

| ID    | 対応AC | テストケース                                                      | 期待結果                                                                       |
| ----- | ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| TC-0  | AC-2   | plan の dynamic path で manifest resourceIds が優先される         | `buildManifestPhaseResourceRequests()` が manifest の plan resources を返す    |
| TC-0B | AC-4   | manifest に custom plan agent が定義されている場合に優先される    | plan の system prompt が custom resource に切り替わる                          |
| TC-1  | AC-1   | fallback path で `IMPROVE_RESOURCE_REQUESTS` のagentが使われる    | `loadAgent("improve-prompt")` が呼ばれ、AGENT_NAMEは参照されない               |
| TC-2  | AC-3   | fallback path: resourceLoaderのみ注入時に `improve()` が成功      | IMPROVE_RESOURCE_REQUESTS の agent エントリを反復して agentPrompt を組み立てる |
| TC-3  | AC-4   | manifest に custom improve agent が定義されている場合に優先される | manifest の resourceId が使われ、fallback は使われない                         |
| TC-4  | AC-5   | 既存の I-1: 正常系LLM呼び出しテストがpassする                     | `loadAgent("improve-prompt")` が呼ばれる（後方互換）                           |
| TC-5  | AC-6   | IMPROVE_RESOURCE_REQUESTS が source of truth であるテスト         | `loadAgent` の呼び出し引数が `IMPROVE_RESOURCE_REQUESTS` の agent id と一致    |
| TC-6  | AC-6   | plan の sourceResolver が同一 root を dedupe する                 | manifest / explicit / env の同一 root が 1 件に正規化される                    |

## 異常系テスト

| ID    | 対応AC | テストケース                                       | 期待結果                             |
| ----- | ------ | -------------------------------------------------- | ------------------------------------ |
| TC-E1 | AC-3   | `resourceLoader.loadAgent` が失敗した場合          | 例外が `improve()` から伝播する      |
| TC-E2 | AC-5   | `IMPROVE_PROMPT_CONSTANTS.AGENT_NAME` が存在しない | TypeScriptコンパイルエラー（削除後） |

## 境界値テスト

| ID    | 対応AC | テストケース                                        | 期待結果                             |
| ----- | ------ | --------------------------------------------------- | ------------------------------------ |
| TC-B1 | AC-6   | IMPROVE_RESOURCE_REQUESTS に agent が1件のみの場合  | `join("\n\n")` 後も正常に動作する    |
| TC-B2 | AC-6   | dynamic pipeline と resourceLoader の両方がない場合 | `resource_loader_unavailable` エラー |

## 実装するテストファイル

`apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.p0-07-dynamic-agent-names.test.ts`

対象テスト: TC-1, TC-2, TC-5（AC-1, AC-3, AC-6 を直接カバー）
既存テストで担保: TC-0/TC-0B（plan-resource-selection.test.ts）、TC-3（improve-resource-selection.test.ts）、TC-4（improve.test.ts I-1）、TC-6（SkillCreatorSourceResolver.test.ts / PhaseResourcePlanner.test.ts）
