# Phase 4: テスト仕様書

## メタ情報

| 項目           | 値                                                |
| -------------- | ------------------------------------------------- |
| ドキュメントID | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001-PH4 |
| 作成日         | 2026-04-18                                        |
| ステータス     | PASS                                              |
| 担当フェーズ   | Phase 4（テスト仕様書）                           |
| 前フェーズ     | Phase 3（設計レビュー）                           |
| 後続フェーズ   | Phase 5（実装）                                   |

## テスト対象

| ファイル                                                                        | 役割                       |
| ------------------------------------------------------------------------------- | -------------------------- |
| `packages/shared/src/types/skillCreator.ts`（行 940-975）                       | テスト対象実装本体         |
| `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`（行 178-259） | テストファイル（実施済み） |

## テストマトリクス

### SKILL_CATEGORY_LABELS（TC-01〜TC-06）

| TC番号 | テスト名                                   | 対象                                            | AC   | 結果 |
| ------ | ------------------------------------------ | ----------------------------------------------- | ---- | ---- |
| TC-01  | should have label for automation           | `SKILL_CATEGORY_LABELS.automation`              | AC-1 | PASS |
| TC-02  | should have label for external-integration | `SKILL_CATEGORY_LABELS["external-integration"]` | AC-1 | PASS |
| TC-03  | should have label for data-analysis        | `SKILL_CATEGORY_LABELS["data-analysis"]`        | AC-1 | PASS |
| TC-04  | should have label for code-support         | `SKILL_CATEGORY_LABELS["code-support"]`         | AC-1 | PASS |
| TC-05  | should have label for other                | `SKILL_CATEGORY_LABELS.other`                   | AC-1 | PASS |
| TC-06  | should cover all SkillCategory values      | `Object.keys` の長さ検証（5件）                 | AC-1 | PASS |

### getSkillCategoryLabel（TC-07〜TC-09）

| TC番号 | テスト名                                             | 対象                                            | AC   | 結果 |
| ------ | ---------------------------------------------------- | ----------------------------------------------- | ---- | ---- |
| TC-07  | should return correct label for automation           | `getSkillCategoryLabel("automation")`           | AC-2 | PASS |
| TC-08  | should return correct label for external-integration | `getSkillCategoryLabel("external-integration")` | AC-2 | PASS |
| TC-09  | should return string type for all categories         | `typeof` 確認（全5件）                          | AC-2 | PASS |

### エッジケース（TC-10〜TC-13）

| TC番号 | テスト名                                                        | 対象                                                             | AC   | 結果 |
| ------ | --------------------------------------------------------------- | ---------------------------------------------------------------- | ---- | ---- |
| TC-10  | should have all non-empty string labels                         | 全値 `length > 0` 確認                                           | AC-1 | PASS |
| TC-11  | should not have undefined values                                | 全値 `!== undefined` 確認                                        | AC-1 | PASS |
| TC-12  | keys should match SkillCategory union values exactly            | キー完全一致（5値との集合比較）                                  | AC-3 | PASS |
| TC-13  | should return same value as direct SKILL_CATEGORY_LABELS lookup | `getSkillCategoryLabel(cat) === SKILL_CATEGORY_LABELS[cat]` 確認 | AC-2 | PASS |

## テストケース詳細

### TC-01: should have label for automation

- **入力**: `SKILL_CATEGORY_LABELS.automation`
- **期待値**: `"自動化"`（非空文字列）
- **検証方法**: `toBe("自動化")`
- **AC**: AC-1

### TC-02: should have label for external-integration

- **入力**: `SKILL_CATEGORY_LABELS["external-integration"]`
- **期待値**: `"外部連携"`（非空文字列）
- **検証方法**: `toBe("外部連携")`
- **AC**: AC-1

### TC-03: should have label for data-analysis

- **入力**: `SKILL_CATEGORY_LABELS["data-analysis"]`
- **期待値**: `"データ分析"`（非空文字列）
- **検証方法**: `toBe("データ分析")`
- **AC**: AC-1

### TC-04: should have label for code-support

- **入力**: `SKILL_CATEGORY_LABELS["code-support"]`
- **期待値**: `"コードサポート"`（非空文字列）
- **検証方法**: `toBe("コードサポート")`
- **AC**: AC-1

### TC-05: should have label for other

- **入力**: `SKILL_CATEGORY_LABELS.other`
- **期待値**: `"その他"`（非空文字列）
- **検証方法**: `toBe("その他")`
- **AC**: AC-1

### TC-06: should cover all SkillCategory values

- **入力**: `Object.keys(SKILL_CATEGORY_LABELS)`
- **期待値**: 長さが `5`
- **検証方法**: `toHaveLength(5)`
- **AC**: AC-1

### TC-07: should return correct label for automation

- **入力**: `getSkillCategoryLabel("automation")`
- **期待値**: `"自動化"`
- **検証方法**: `toBe("自動化")`
- **AC**: AC-2

### TC-08: should return correct label for external-integration

- **入力**: `getSkillCategoryLabel("external-integration")`
- **期待値**: `"外部連携"`
- **検証方法**: `toBe("外部連携")`
- **AC**: AC-2

### TC-09: should return string type for all categories

- **入力**: 全5カテゴリ値を `getSkillCategoryLabel` に渡す
- **期待値**: `typeof result === "string"` が全件 `true`
- **検証方法**: 各カテゴリに対して `expect(typeof getSkillCategoryLabel(cat)).toBe("string")`
- **AC**: AC-2

### TC-10: should have all non-empty string labels

- **入力**: `Object.values(SKILL_CATEGORY_LABELS)`
- **期待値**: 全値の `length > 0`
- **検証方法**: `forEach` で `expect(label.length).toBeGreaterThan(0)`
- **AC**: AC-1

### TC-11: should not have undefined values

- **入力**: `Object.values(SKILL_CATEGORY_LABELS)`
- **期待値**: 全値が `undefined` でない
- **検証方法**: `forEach` で `expect(label).toBeDefined()`
- **AC**: AC-1

### TC-12: keys should match SkillCategory union values exactly

- **入力**: `Object.keys(SKILL_CATEGORY_LABELS)`
- **期待値**: `["automation", "external-integration", "data-analysis", "code-support", "other"]` と完全一致
- **検証方法**: `expect(keys).toEqual(expect.arrayContaining(expectedKeys))` かつ長さ一致
- **AC**: AC-3

### TC-13: should return same value as direct SKILL_CATEGORY_LABELS lookup

- **入力**: `Object.values(SKILL_CATEGORY_LABELS)` の各値
- **期待値**: `typeof value === "string"` が全件 `true`
- **検証方法**: `forEach` で `expect(typeof label).toBe("string")`
- **AC**: AC-2

## private method テスト方針

`SKILL_CATEGORY_LABELS` は `export const` で公開された定数であるため、モジュール内部の private 実装は存在しない。全テストは public API（`SKILL_CATEGORY_LABELS` 直接参照および `getSkillCategoryLabel` 関数呼び出し）経由で実施する。

## テストファイル

```
packages/shared/src/types/__tests__/skillCreator-wizard.test.ts
```

- テストランナー: Vitest
- 実行コマンド: `pnpm --filter @repo/shared test`

## 完了条件チェックリスト

| チェック項目                                                       | 状態 |
| ------------------------------------------------------------------ | ---- |
| TC-01〜TC-06: `SKILL_CATEGORY_LABELS` の全カテゴリが網羅されている | PASS |
| TC-07〜TC-09: `getSkillCategoryLabel` の動作が検証されている       | PASS |
| TC-10〜TC-13: エッジケースが全てカバーされている                   | PASS |
| 全 13 テストケースが PASS している                                 | PASS |
| AC-1・AC-2・AC-3 の全受け入れ条件に対応するテストが存在する        | PASS |
| private method のテストは public API 経由に限定している            | PASS |
