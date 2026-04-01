# Test Matrix — UT-IMP-SDK-06 Layer3/4

## Layer3 テストケース

| テストID | チェックID | シナリオ                                         | 期待 severity                  | 期待 layer |
| -------- | ---------- | ------------------------------------------------ | ------------------------------ | ---------- |
| T-L3-01  | L3-001     | output-schema.json に `$schema` フィールドあり   | info                           | layer3     |
| T-L3-02  | L3-001     | output-schema.json に `$schema` フィールドなし   | warning                        | layer3     |
| T-L3-03  | L3-002     | output-schema.json の `type` が `"object"`       | info                           | layer3     |
| T-L3-04  | L3-002     | output-schema.json の `type` が `"invalid_type"` | error                          | layer3     |
| T-L3-05  | L3-002     | output-schema.json の `type` フィールドなし      | warning                        | layer3     |
| T-L3-06  | L3-003     | agent の `## 責務` 記述が 30 文字                | info                           | layer3     |
| T-L3-07  | L3-003     | agent の `## 責務` 記述が 4 文字                 | warning                        | layer3     |
| T-L3-08  | L3-004     | SKILL.md の `## Trigger` 記述が 20 文字          | info                           | layer3     |
| T-L3-09  | L3-004     | SKILL.md の `## Trigger` 記述が 5 文字           | warning                        | layer3     |
| T-L3-10  | L3-001/002 | output-schema.json が存在しない                  | L3-001/L3-002 が emit されない | —          |

## Layer3 Edge Case テストケース

| テストID   | チェックID | シナリオ                                                                        | 期待結果                     |
| ---------- | ---------- | ------------------------------------------------------------------------------- | ---------------------------- |
| T-L3-EC-01 | L3-002     | output-schema.json が `{}` 空オブジェクト / `true` などの object 以外の JSON 値 | warning / crash なし         |
| T-L3-EC-02 | L3-002     | output-schema.json の `type` が配列 `["object", "null"]` / 空配列 `[]`          | info / error                 |
| T-L3-EC-03 | L3-003     | agents/ に複数 .md ファイルがある                                               | 各 agent 分の L3-003 が emit |
| T-L3-EC-04 | L3-003     | `## 責務` セクション直後に空行のみ                                              | warning                      |
| T-L3-EC-05 | L3-004     | `## Trigger` セクションが複数行で合計 10 文字以上                               | info                         |

## Layer4 テストケース

| テストID | チェックID | シナリオ                                                   | 期待 severity           | 期待 layer |
| -------- | ---------- | ---------------------------------------------------------- | ----------------------- | ---------- |
| T-L4-01  | L4-001     | Anchors セクションに `- anchor1` が 1 件以上               | info                    | layer4     |
| T-L4-02  | L4-001     | Anchors セクションはあるがリスト項目なし                   | error                   | layer4     |
| T-L4-03  | L4-001     | Anchors セクション自体がない                               | error                   | layer4     |
| T-L4-04  | L4-002     | `references/spec.md` が実在し SKILL.md で言及              | info                    | layer4     |
| T-L4-05  | L4-002     | SKILL.md で `references/missing.md` を参照するが実在しない | warning                 | layer4     |
| T-L4-06  | L4-002     | `references/` ディレクトリが存在しない                     | L4-002 が emit されない | —          |
| T-L4-07  | L4-003     | `planner.md` が SKILL.md 本文で言及                        | info                    | layer4     |
| T-L4-08  | L4-003     | `planner.md` が SKILL.md 本文で言及されていない            | warning                 | layer4     |

## Layer4 Edge Case テストケース

| テストID   | チェックID | シナリオ                                                         | 期待結果      |
| ---------- | ---------- | ---------------------------------------------------------------- | ------------- |
| T-L4-EC-01 | L4-001     | Anchors に `*` 形式のリスト項目                                  | info          |
| T-L4-EC-02 | L4-002     | references/ ディレクトリが空                                     | emit されない |
| T-L4-EC-03 | L4-002     | SKILL.md で複数参照し一部が実在しない / `references/` を脱出する | warning       |
| T-L4-EC-04 | L4-003     | agent ファイル名に日本語が含まれる                               | 正しく判定    |
| T-L4-EC-05 | L4-001     | Anchors にインデントあり `  - anchor1`                           | info          |

## 結合テストケース

| テストID  | シナリオ                                                  | 期待結果                     |
| --------- | --------------------------------------------------------- | ---------------------------- |
| T-LOOP-01 | L4-001 fail fixture → verify → SKILL.md 修正 → re-verify  | 1回目: error、2回目: info    |
| T-LOOP-02 | L3-001 warn fixture → verify → `$schema` 追加 → re-verify | 1回目: warning、2回目: info  |
| T-LOOP-03 | 完全な fixture で `Facade.verifySkill()` を呼ぶ           | layer3/layer4 両方が含まれる |
| T-LOOP-04 | WorkflowEngine + VerificationEngine 結合                  | verifyResult が正しく更新    |

## 結合テスト Edge Case

| テストID     | シナリオ                                     | 期待結果                            |
| ------------ | -------------------------------------------- | ----------------------------------- |
| T-LOOP-EC-01 | verify→ファイル削除→re-verify                | L3/L4 が skip または warning に変化 |
| T-LOOP-EC-02 | verify→改善なし→re-verify                    | 2回目も同じ severity（冪等性）      |
| T-LOOP-EC-03 | 複数の Layer3/4 チェックが fail する fixture | 全 fail チェックが配列に含まれる    |

## 検証コマンド

```bash
pnpm --filter @repo/desktop vitest run apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts
pnpm --filter @repo/desktop vitest run
```

## AC 写像

| AC   | 対応テストケース                         |
| ---- | ---------------------------------------- |
| AC-1 | T-L3-01〜T-L3-05, T-L3-10                |
| AC-2 | T-L3-06〜T-L3-07, T-L3-EC-03, T-L3-EC-04 |
| AC-3 | T-L4-01〜T-L4-03, T-L4-EC-01, T-L4-EC-05 |
| AC-4 | T-L4-04〜T-L4-06, T-L4-EC-02, T-L4-EC-03 |
| AC-5 | T-LOOP-01, T-LOOP-02                     |
| AC-6 | T-LOOP-04                                |
| AC-7 | T-ENG-01〜T-FAC-02（既存テスト）         |
| AC-8 | 全テスト                                 |
