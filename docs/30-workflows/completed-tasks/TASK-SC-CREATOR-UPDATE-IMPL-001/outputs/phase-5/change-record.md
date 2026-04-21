# Phase 5: 変更記録

## タスクID: TASK-SC-CREATOR-UPDATE-IMPL-001

## 変更1: `case "update":` のスタブ解消

| 項目   | 内容                                                                              |
| ------ | --------------------------------------------------------------------------------- |
| 対象   | `SkillCreatorService.ts` `createSkill()` switch文                                 |
| Before | `emitProgress("loading-skill"); emitProgress("analyzing"); break;`                |
| After  | progress emit 後に `runUpdateWorkflow()` を呼び出し、`structurePlan` に結果を格納 |
| 理由   | update モードが実処理なしの stub のままだったため                                 |

## 変更2: `runUpdateWorkflow()` 追加

| 項目   | 内容                                                                     |
| ------ | ------------------------------------------------------------------------ |
| 対象   | `SkillCreatorService.ts` プライベートメソッド（新規）                    |
| Before | 存在しない                                                               |
| After  | 既存 SKILL.md 読込 → purpose 抽出 → LLM 再生成 → StructurePlanJson 返却  |
| 理由   | update モードの実処理を `runCreateWorkflow()` と整合する形で実装するため |

## 変更3: `extractPurposeFromSkillMd()` 追加

| 項目   | 内容                                                                            |
| ------ | ------------------------------------------------------------------------------- |
| 対象   | `SkillCreatorService.ts` プライベートメソッド（新規）                           |
| Before | 存在しない                                                                      |
| After  | YAML frontmatter の `description` フィールドを抽出、multiline/singleline 両対応 |
| 理由   | 既存スキルの purpose を再利用するための純粋関数として分離                       |

## 変更4: テスト追加

| 項目   | 内容                                                                       |
| ------ | -------------------------------------------------------------------------- |
| 対象   | `SkillCreatorService.test.ts` 末尾                                         |
| Before | `runUpdateWorkflow()` の専用テストなし                                     |
| After  | `update-TC-01〜06` の 6 テストケース追加                                   |
| 理由   | update モードの正常系・フォールバック・cancel・progress 順序を検証するため |

## 影響範囲

- 既存 SC-020 テストに変更なし（後方互換を維持）
- `improve-prompt` モードには影響しない（別 case）
- `PROGRESS_FLOWS.update` の定義は変更なし
- `SkillService.updateSkill()` の内部実装は変更しない（スコープ外）
