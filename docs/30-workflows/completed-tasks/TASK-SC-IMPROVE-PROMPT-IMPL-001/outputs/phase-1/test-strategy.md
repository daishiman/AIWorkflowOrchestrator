# テスト戦略: TASK-SC-IMPROVE-PROMPT-IMPL-001

## テストファイル

`apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.improve-prompt.test.ts`

## モック方針

既存 `SkillCreatorService.purpose.test.ts` と同じパターンを踏襲:

- `vi.mock("../ScriptExecutor")`
- `vi.mock("../ResourceLoader")`
- `vi.mock("fs/promises")`
- `mockLlmClient = { generate: vi.fn() }` を外部で定義

## テストケース

| TC    | 分類                        | 観測点                                                                    |
| ----- | --------------------------- | ------------------------------------------------------------------------- |
| TC-01 | 正常系 LLM あり             | fs.readFile で SKILL.md 読み込み → LLM 呼び出し → fs.writeFile で書き戻し |
| TC-02 | 正常系 LLM なし             | improveSkill() の executeJson が呼ばれる                                  |
| TC-03 | 異常系 ファイル読み込み失敗 | improveSkill() フォールバック                                             |
| TC-04 | 異常系 LLM 失敗             | improveSkill() フォールバック                                             |
| TC-05 | 異常系 abort                | loading-skill / analyzing / improving 各ポイントで AbortError がスロー    |
| TC-06 | 回帰                        | create / update / collaborative モードが improve-prompt の変更で壊れない  |

## Progress 観測

```
loading-skill(10%) → analyzing(30%) → improving(65%) → validating(90%) → done(100%)
```

onProgress callback で進捗を記録し、順序と percentage を検証する。

## targeted run コマンド

```bash
pnpm --filter @repo/desktop test SkillCreatorService.improve-prompt
```

## 既存回帰コマンド

```bash
pnpm --filter @repo/desktop test SkillCreatorService
```
