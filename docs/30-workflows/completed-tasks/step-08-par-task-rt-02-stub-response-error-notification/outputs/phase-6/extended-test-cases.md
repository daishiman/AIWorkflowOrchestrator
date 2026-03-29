# Phase 6: 拡張テストケース

## 追加テストケース

| TC    | 条件                                          | 期待結果                         | 実装状況                                                                                  |
| ----- | --------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------- |
| TC-10 | `llmAdapter` と `resourceLoader` の両方が不足 | `llm_adapter_unavailable` を優先 | ✅ plan.test.ts で新規追加（llmAdapter チェックが先のため自動的に優先）                   |
| TC-11 | unknown reason code                           | fallback message を表示          | ✅ renderer は `error.message` を直接表示するため、unknown code でも message が表示される |
| TC-12 | wizard で plan logical error                  | lifecycle と同文言を表示         | ✅ SkillCreateWizard.tsx に同等のエラー検出ロジック追加済み                               |
| TC-13 | transport failure                             | outer `success:false` を優先表示 | ✅ 既存 IPC テストが該当（creatorHandlers.test.ts）                                       |
| TC-14 | terminal handoff                              | execute 抑止対象にしない         | ✅ improve.test.ts E-12 が terminal_handoff 非破壊を検証                                  |

## workflow-orchestration テスト修正

- `beforeEach` に llmAdapter mock を追加（TASK-RT-02 で llmAdapter 未注入が error になるため）
- plan テストが LLM 経由で正常な plan result を生成するよう修正
- execute テスト 1 件は pre-existing failure（SkillExecutor 変更起因、RT-02 無関係）

## contract-parity テスト

- `packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts`: 2 passed（union 追加が既存契約を壊していない）
