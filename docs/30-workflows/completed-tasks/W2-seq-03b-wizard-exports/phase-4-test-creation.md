# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 4                                |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03b       |
| 機能名     | wizard/index.ts エクスポート更新 |
| 前提Phase  | Phase 3                          |
| 後続Phase  | Phase 5                          |
| 作成日     | 2026-04-07                       |
| ステータス | pending                          |

## 目的

実装前に Red（失敗）状態のテストを定義し、エクスポート変更の検証基準を固める。

## テスト対象

| テスト対象                   | テスト種別     | 目的                                   |
| ---------------------------- | -------------- | -------------------------------------- |
| 削除エクスポートの非存在確認 | ユニットテスト | 旧エクスポートが存在しないこと         |
| 追加エクスポートの存在確認   | ユニットテスト | 新エクスポートがimport可能であること   |
| 維持エクスポートの存在確認   | ユニットテスト | 既存エクスポートが変更されていないこと |
| TypeScript 型チェック        | 型テスト       | 型エラーがないこと                     |

## テストケース定義

### 削除エクスポートの非存在確認テスト

```typescript
import { describe, it, expect, expectTypeOf } from "vitest";
import * as wizardIndex from "../wizard/index";
import type { GenerationMode, SkillInfoStepProps } from "../wizard";
import type { SkillInfoFormData } from "@repo/shared/types/skillCreator";

describe("wizard/index.ts 削除エクスポート確認", () => {
  it("DescribeStep がエクスポートされていないこと", () => {
    expect(
      (wizardIndex as Record<string, unknown>)["DescribeStep"],
    ).toBeUndefined();
  });

  it("ConfigureStep がエクスポートされていないこと", () => {
    expect(
      (wizardIndex as Record<string, unknown>)["ConfigureStep"],
    ).toBeUndefined();
  });

  it("WizardOptions がエクスポートされていないこと", () => {
    expect(
      (wizardIndex as Record<string, unknown>)["WizardOptions"],
    ).toBeUndefined();
  });
});
```

### 追加エクスポートの存在確認テスト

```typescript
describe("wizard/index.ts 追加エクスポート確認", () => {
  it("SkillInfoStep がエクスポートされていること", () => {
    expect(wizardIndex.SkillInfoStep).toBeDefined();
    expect(typeof wizardIndex.SkillInfoStep).toBe("function");
  });

  it("ConversationRoundStep がエクスポートされていること", () => {
    expect(wizardIndex.ConversationRoundStep).toBeDefined();
    expect(typeof wizardIndex.ConversationRoundStep).toBe("function");
  });
});
```

### 維持エクスポートの存在確認テスト

```typescript
describe("wizard/index.ts 維持エクスポート確認", () => {
  it("StepIndicator が引き続きエクスポートされていること", () => {
    expect(wizardIndex.StepIndicator).toBeDefined();
  });

  it("GenerateStep が引き続きエクスポートされていること", () => {
    expect(wizardIndex.GenerateStep).toBeDefined();
  });

  it("CompleteStep が引き続きエクスポートされていること", () => {
    expect(wizardIndex.CompleteStep).toBeDefined();
  });
});

describe("wizard/index.ts 型契約確認", () => {
  it("GenerationMode が barrel 経由で期待どおりの union 型で参照できること", () => {
    expectTypeOf<GenerationMode>().toEqualTypeOf<"llm" | "template">();
  });

  it("SkillInfoStepProps が barrel 経由で期待どおりの型で参照できること", () => {
    expectTypeOf<
      SkillInfoStepProps["formData"]
    >().toEqualTypeOf<SkillInfoFormData>();
    expectTypeOf<SkillInfoStepProps["onNext"]>().toEqualTypeOf<() => void>();
  });
});
```

### TypeScript 型チェックテスト

```typescript
// expectTypeOf を使った型契約テスト
expectTypeOf<GenerationMode>().toEqualTypeOf<"llm" | "template">();
expectTypeOf<
  SkillInfoStepProps["formData"]
>().toEqualTypeOf<SkillInfoFormData>();
```

## 参照資料

| 資料名             | パス                                      | 用途           |
| ------------------ | ----------------------------------------- | -------------- |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md` | Phase 3 成果物 |
| ゲート判定         | `outputs/phase-3/gate-decision.md`        | Phase 3 成果物 |
| エクスポート設計書 | `outputs/phase-2/export-design.md`        | Phase 2 成果物 |
| 変更差分テーブル   | `outputs/phase-2/change-diff-table.md`    | Phase 2 成果物 |

## 実行手順

1. Phase 3 成果物を確認し、ゲート判定が PASS であることを確認する。
2. テストファイルを `__tests__/wizard-exports.test.ts` に作成する。
3. 全テストケースが Red（失敗）状態であることを確認する。
4. テスト仕様書として成果物を出力する。

## 成果物

| 成果物         | パス                                       | 説明                       |
| -------------- | ------------------------------------------ | -------------------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`    | テストケース一覧           |
| Red テスト結果 | `outputs/phase-4/red-test-result.md`       | 実装前の失敗確認記録       |
| 統合テスト計画 | `outputs/phase-4/integration-test-plan.md` | ビルド後の統合検証シナリオ |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 削除契約・追加契約・維持契約・型契約のテストが定義されていること
- [ ] 全テストが Red（失敗）状態であることが確認されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. テストケース設計
3. テストファイル作成（Red段階）
4. Red状態確認
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 5: 実装
