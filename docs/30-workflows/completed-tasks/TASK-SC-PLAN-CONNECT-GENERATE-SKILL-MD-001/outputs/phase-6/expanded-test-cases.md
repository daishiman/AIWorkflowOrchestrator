# 拡張テストケース - TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001

## 追加テストケース

| TC-ID            | シナリオ                                             | 期待結果                                      | AC         |
| ---------------- | ---------------------------------------------------- | --------------------------------------------- | ---------- |
| TC-SC-CONNECT-04 | `generateSkillMd` が例外を投げる                     | エラーが createSkill から伝播する             | AC-4       |
| TC-SC-CONNECT-05 | `runCreateWorkflow` が例外をスロー（loadAgent 失敗） | createSkill 成功 + generateSkillMd 未呼び出し | AC-5       |
| TC-SC-CONNECT-06 | structurePlan あり/なしの連続呼び出し                | 各ブランチが独立して動作する                  | AC-1, AC-2 |

## テストダブル

| TC-ID            | 方式                                                                             |
| ---------------- | -------------------------------------------------------------------------------- |
| TC-SC-CONNECT-04 | `vi.spyOn(service as any, "generateSkillMd").mockRejectedValue(...)`             |
| TC-SC-CONNECT-05 | `mockResourceLoader.loadAgent.mockRejectedValue(...)` + `generateSkillMd` スパイ |
| TC-SC-CONNECT-06 | 1回目: `loadAgent.mockResolvedValue()` → 2回目: `loadAgent.mockRejectedValue()`  |
