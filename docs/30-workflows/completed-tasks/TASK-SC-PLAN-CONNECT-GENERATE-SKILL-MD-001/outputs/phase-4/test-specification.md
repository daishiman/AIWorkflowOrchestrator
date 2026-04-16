# テスト仕様書 - TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001

## テストケース一覧

| TC-ID            | シナリオ                                                            | 期待結果                                       | AC   |
| ---------------- | ------------------------------------------------------------------- | ---------------------------------------------- | ---- |
| TC-SC-CONNECT-01 | `runCreateWorkflow` が `StructurePlanJson` を返す（loadAgent 成功） | `generateSkillMd` が1回呼ばれる                | AC-1 |
| TC-SC-CONNECT-02 | `runCreateWorkflow` が `null` を返す（loadAgent 失敗）              | `generateSkillMd` が呼ばれない                 | AC-2 |
| TC-SC-CONNECT-03 | `runCreateWorkflow` が `null` を返す（loadAgent 失敗）              | `console.error` で適切なメッセージが出力される | AC-3 |

## テスト配置

ファイル: `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`

describe ブロック: `runCreateWorkflow → generateSkillMd 接続 (TC-SC-CONNECT-01〜03)`

## テストダブル

| 対象              | 方式                                                                       |
| ----------------- | -------------------------------------------------------------------------- |
| `loadAgent`       | `mockResourceLoader.loadAgent.mockResolvedValue()` / `mockRejectedValue()` |
| `generateSkillMd` | `vi.spyOn(service as any, "generateSkillMd").mockResolvedValue(undefined)` |
| `console.error`   | `vi.spyOn(console, "error").mockImplementation(() => {})`                  |
