# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 4                                             |
| タスクID   | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |
| 機能名     | skill-wizard-category-display-label-mapping   |
| 前提Phase  | Phase 3（PASS）                               |
| 後続Phase  | Phase 5                                       |
| 作成日     | 2026-04-11                                    |
| ステータス | pending                                       |

## 目的

TDDのRed段階として、`SKILL_CATEGORY_LABELS` と `getSkillCategoryLabel()` のテストを先に作成する。
実装前にテストが失敗することを確認し、期待値を明確化する。

## 実行タスク

- 事前確認: 既存ユーティリティ重複検出・テスト対象import副作用チェック
- テストマトリクス定義: TC-01〜TC-09のテストケース定義（仕様番号↔テスト名対応）
- private methodテスト方針の明記
- テストコード作成: `skillCreator-wizard.test.ts` にテストケース追加

## 参照資料

| 資料名           | パス                                                              | 用途                 |
| ---------------- | ----------------------------------------------------------------- | -------------------- |
| Phase 2 設計書   | `outputs/phase-2/design.md`                                       | インターフェース参照 |
| Phase 3 レビュー | `outputs/phase-3/gate-decision.md`                                | MINOR指摘確認        |
| skillCreator.ts  | `packages/shared/src/types/skillCreator.ts`                       | 追加先ファイル確認   |
| 既存テスト       | `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts` | テスト追加先確認     |

## 実行手順

### 0. 事前確認: 既存ユーティリティ重複検出【必須】

```bash
# SKILL_CATEGORY_LABELS / getSkillCategoryLabel の重複実装確認
grep -rn "SKILL_CATEGORY_LABELS\|getSkillCategoryLabel" packages/ apps/

# 既存テストファイルの現状確認
cat packages/shared/src/types/__tests__/skillCreator-wizard.test.ts | head -30
```

### 1. private methodテスト方針の明記【必須・`[Feedback P0-09-U1-1]`】

本タスクの対象（`SKILL_CATEGORY_LABELS` 定数 + `getSkillCategoryLabel()` 関数）は全てpublic exportであるため、
private method テストは対象外。**public API 直接呼び出し**によるテストを採用する。

### 2. テストマトリクス定義

| TC番号 | テスト名（describe/it）                                                      | 対象関数/定数                                   | 結果    |
| ------ | ---------------------------------------------------------------------------- | ----------------------------------------------- | ------- |
| TC-01  | `SKILL_CATEGORY_LABELS should have label for automation`                     | `SKILL_CATEGORY_LABELS.automation`              | pending |
| TC-02  | `SKILL_CATEGORY_LABELS should have label for external-integration`           | `SKILL_CATEGORY_LABELS["external-integration"]` | pending |
| TC-03  | `SKILL_CATEGORY_LABELS should have label for data-analysis`                  | `SKILL_CATEGORY_LABELS["data-analysis"]`        | pending |
| TC-04  | `SKILL_CATEGORY_LABELS should have label for code-support`                   | `SKILL_CATEGORY_LABELS["code-support"]`         | pending |
| TC-05  | `SKILL_CATEGORY_LABELS should have label for other`                          | `SKILL_CATEGORY_LABELS.other`                   | pending |
| TC-06  | `SKILL_CATEGORY_LABELS should cover all SkillCategory values`                | `Object.keys(SKILL_CATEGORY_LABELS)`            | pending |
| TC-07  | `getSkillCategoryLabel should return correct label for automation`           | `getSkillCategoryLabel("automation")`           | pending |
| TC-08  | `getSkillCategoryLabel should return correct label for external-integration` | `getSkillCategoryLabel("external-integration")` | pending |
| TC-09  | `getSkillCategoryLabel should return string type`                            | `typeof getSkillCategoryLabel("other")`         | pending |

> **`[Feedback W0-RV-001]` 対応**: 日本語ラベル文字列の期待値を書く前に `.length` で実文字数を確認する。
> 例: `"自動化".length === 3`、`"外部連携".length === 4`、`"データ分析".length === 5`、`"コードサポート".length === 7`、`"その他".length === 3`

### 3. テストコードスケルトン

追加先: `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`

```typescript
// 既存テストの末尾に以下を追加
describe("SKILL_CATEGORY_LABELS", () => {
  it("should have label for automation", () => {
    // length: 3
    expect(SKILL_CATEGORY_LABELS.automation).toBe("自動化");
  });

  it("should have label for external-integration", () => {
    // length: 4
    expect(SKILL_CATEGORY_LABELS["external-integration"]).toBe("外部連携");
  });

  it("should have label for data-analysis", () => {
    // length: 5
    expect(SKILL_CATEGORY_LABELS["data-analysis"]).toBe("データ分析");
  });

  it("should have label for code-support", () => {
    // length: 7
    expect(SKILL_CATEGORY_LABELS["code-support"]).toBe("コードサポート");
  });

  it("should have label for other", () => {
    // length: 3
    expect(SKILL_CATEGORY_LABELS.other).toBe("その他");
  });

  it("should cover all SkillCategory values", () => {
    const expectedKeys: SkillCategory[] = [
      "automation",
      "external-integration",
      "data-analysis",
      "code-support",
      "other",
    ];
    expect(Object.keys(SKILL_CATEGORY_LABELS)).toEqual(
      expect.arrayContaining(expectedKeys),
    );
    expect(Object.keys(SKILL_CATEGORY_LABELS)).toHaveLength(
      expectedKeys.length,
    );
  });
});

describe("getSkillCategoryLabel", () => {
  it("should return correct label for automation", () => {
    expect(getSkillCategoryLabel("automation")).toBe("自動化");
  });

  it("should return correct label for external-integration", () => {
    expect(getSkillCategoryLabel("external-integration")).toBe("外部連携");
  });

  it("should return string type for all categories", () => {
    const categories: SkillCategory[] = [
      "automation",
      "external-integration",
      "data-analysis",
      "code-support",
      "other",
    ];
    categories.forEach((cat) => {
      expect(typeof getSkillCategoryLabel(cat)).toBe("string");
    });
  });
});
```

### 4. Red確認コマンド（実装前にテストが失敗することを確認）

```bash
pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillCreator-wizard.test.ts
# 期待: FAIL（SKILL_CATEGORY_LABELS未定義エラー）
```

## 統合テスト連携【必須】

| 判定項目       | 基準                            | 結果    |
| -------------- | ------------------------------- | ------- |
| Red確認        | テストがFAILすること（TDD Red） | pending |
| 既存テスト確認 | 既存テストが全てPASS            | pending |

## 成果物

| 成果物       | パス                                                              | 説明                           |
| ------------ | ----------------------------------------------------------------- | ------------------------------ |
| テストコード | `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts` | TC-01〜TC-09のテストケース追加 |

## 完了条件

- [ ] 既存ユーティリティ重複検出（重複なし確認）
- [ ] private methodテスト方針（public API直接テスト）を明記済み
- [ ] テストマトリクス（TC-01〜TC-09）が定義済み
- [ ] 日本語ラベルの実文字数確認済み（`[Feedback W0-RV-001]`）
- [ ] テストコードが `skillCreator-wizard.test.ts` に追加されている
- [ ] Red確認（実装前にテストがFAILすること）が確認済み
- [ ] 既存テストへの悪影響なし
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 事前確認（重複・副作用チェック）
2. private methodテスト方針の明記
3. テストマトリクス定義
4. テストコード作成（TC-01〜TC-09）
5. Red確認
6. 完了条件の判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 5: 実装
