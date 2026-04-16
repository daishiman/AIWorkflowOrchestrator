# Phase 4: テストケース設計書

## タスクID

TASK-SW-STRUCT-001

## 実装済みテスト

`apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.struct-001.test.ts` が current branch の回帰テストになっている。

| TC ID | 対応 AC | テスト内容                                                             | 状態     |
| ----- | ------- | ---------------------------------------------------------------------- | -------- |
| TC-01 | AC-1    | `runCreateWorkflow()` の `purpose` が `options.description` と一致する | 実装済み |
| TC-02 | AC-2    | `agents` が `["extract-purpose", "plan-structure"]` である             | 実装済み |
| TC-03 | AC-3    | `features` が空配列である                                              | 実装済み |
| TC-04 | AC-4    | `createSkill()` のフォールバック耐性を確認する                         | 実装済み |

## 観測ポイント

- `runCreateWorkflow()` は private だが、テスト内で型キャストして直接観測している
- `TC-04` は `runCreateWorkflow` の将来の内部エラーに対するガードテストとして残している
- `createSkill()` の外部契約は変わらないため、回帰範囲は小さい

## 結論

テスト設計は current branch の実装に反映済みで、`STRUCT-001` の回帰面は `SkillCreatorService.struct-001.test.ts` に集約されている。
