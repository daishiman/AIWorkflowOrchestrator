# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 6                                             |
| タスクID   | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |
| 機能名     | skill-wizard-category-display-label-mapping   |
| 前提Phase  | Phase 5                                       |
| 後続Phase  | Phase 7                                       |
| 作成日     | 2026-04-11                                    |
| ステータス | pending                                       |

## 目的

Phase 4 のTCに加えて、型安全性・エッジケース・回帰ガードのテストを追加し、
テストスイートの堅牢性を高める。

## 実行タスク

- Phase 4 テストのレビュー: TC-01〜TC-09の充足性確認
- エッジケーステスト追加: ラベル値の型・非空文字チェック
- 型安全性テスト追加: `Record<SkillCategory, string>` の網羅性検証
- 回帰ガードテスト追加: 将来のカテゴリ追加時の漏れ検出パターン確認

## 参照資料

| 資料名         | パス                                                              | 用途           |
| -------------- | ----------------------------------------------------------------- | -------------- |
| Phase 4 テスト | `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts` | 既存テスト確認 |
| Phase 5 実装   | `packages/shared/src/types/skillCreator.ts`                       | 実装確認       |

## 実行手順

### 1. Phase 4 テスト充足性確認

| TC番号       | テスト内容                  | Phase 4での充足 |
| ------------ | --------------------------- | --------------- |
| TC-01〜TC-05 | 各カテゴリのラベル値確認    | ✅              |
| TC-06        | 全カテゴリ件数確認          | ✅              |
| TC-07〜TC-08 | getSkillCategoryLabel正常系 | ✅              |
| TC-09        | 戻り値型確認                | ✅              |

### 2. 追加テストケース定義

| TC番号 | テスト名                                                             | 対象           | 追加理由             |
| ------ | -------------------------------------------------------------------- | -------------- | -------------------- |
| TC-10  | `all labels should be non-empty strings`                             | 全ラベル値     | 空文字列ラベル防止   |
| TC-11  | `SKILL_CATEGORY_LABELS should not have undefined values`             | 定数全値       | undefined混入防止    |
| TC-12  | `getSkillCategoryLabel should return same as direct lookup`          | 関数vs直接参照 | 実装の一貫性確認     |
| TC-13  | `SKILL_CATEGORY_LABELS keys should match SkillCategory union values` | キー一覧       | 型網羅性の実行時検証 |

### 3. 追加テストコード

```typescript
describe("SKILL_CATEGORY_LABELS - edge cases", () => {
  it("should have all non-empty string labels", () => {
    Object.values(SKILL_CATEGORY_LABELS).forEach((label) => {
      expect(typeof label).toBe("string");
      expect(label.length).toBeGreaterThan(0);
    });
  });

  it("should not have undefined values", () => {
    Object.values(SKILL_CATEGORY_LABELS).forEach((label) => {
      expect(label).toBeDefined();
    });
  });

  it("keys should match SkillCategory union values exactly", () => {
    const skillCategories: SkillCategory[] = [
      "automation",
      "external-integration",
      "data-analysis",
      "code-support",
      "other",
    ];
    const labelKeys = Object.keys(SKILL_CATEGORY_LABELS) as SkillCategory[];
    expect(labelKeys.sort()).toEqual(skillCategories.sort());
  });
});

describe("getSkillCategoryLabel - consistency", () => {
  it("should return same value as direct SKILL_CATEGORY_LABELS lookup", () => {
    const categories: SkillCategory[] = [
      "automation",
      "external-integration",
      "data-analysis",
      "code-support",
      "other",
    ];
    categories.forEach((cat) => {
      expect(getSkillCategoryLabel(cat)).toBe(SKILL_CATEGORY_LABELS[cat]);
    });
  });
});
```

### 4. 全テスト実行確認

```bash
# 全テスト（Phase 4 + Phase 6 追加分）実行
pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillCreator-wizard.test.ts

# 型チェック（追加テストで型エラーがないことを確認）
pnpm --filter @repo/shared typecheck
```

## 統合テスト連携【必須】

| 判定項目           | 基準   | 結果    |
| ------------------ | ------ | ------- |
| TC-01〜TC-13全PASS | PASS   | pending |
| 型チェック         | PASS   | pending |
| 既存テスト回帰なし | 全PASS | pending |

## 成果物

| 成果物           | パス                                                              | 説明               |
| ---------------- | ----------------------------------------------------------------- | ------------------ |
| テストコード拡充 | `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts` | TC-10〜TC-13を追加 |

## 完了条件

- [ ] Phase 4 テスト（TC-01〜TC-09）の充足性確認済み
- [ ] TC-10〜TC-13が追加済み
- [ ] 全テスト（TC-01〜TC-13）がPASS
- [ ] 型チェックがPASS
- [ ] 既存テストへの悪影響なし
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 4 テスト充足性確認
2. エッジケーステスト設計（TC-10〜TC-11）
3. 型安全性テスト設計（TC-12〜TC-13）
4. テストコード追加
5. 全テスト実行確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 7: カバレッジ確認
