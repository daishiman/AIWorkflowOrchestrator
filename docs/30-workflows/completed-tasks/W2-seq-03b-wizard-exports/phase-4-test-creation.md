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
| ステータス | completed                        |

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
// wizard/index.ts のエクスポートチェック
describe("wizard/index.ts 削除エクスポート確認", () => {
  it("DescribeStep がエクスポートされていないこと", () => {
    // @ts-expect-error 削除済みのためエラーが期待される
    const module = require("../wizard/index");
    expect(module.DescribeStep).toBeUndefined();
  });

  it("ConfigureStep がエクスポートされていないこと", () => {
    const module = require("../wizard/index");
    expect(module.ConfigureStep).toBeUndefined();
  });

  it("GenerationMode 型エクスポートが存在しないこと", () => {
    // TypeScript コンパイル時チェック（型レベルのテスト）
    // import type { GenerationMode } from "../wizard/index" が型エラーになること
  });
});
```

### 追加エクスポートの存在確認テスト

```typescript
describe("wizard/index.ts 追加エクスポート確認", () => {
  it("SkillInfoStep がエクスポートされていること", () => {
    const { SkillInfoStep } = require("../wizard/index");
    expect(SkillInfoStep).toBeDefined();
    expect(typeof SkillInfoStep).toBe("function");
  });

  it("ConversationRoundStep がエクスポートされていること", () => {
    const { ConversationRoundStep } = require("../wizard/index");
    expect(ConversationRoundStep).toBeDefined();
    expect(typeof ConversationRoundStep).toBe("function");
  });
});
```

### 維持エクスポートの存在確認テスト

```typescript
describe("wizard/index.ts 維持エクスポート確認", () => {
  it("StepIndicator が引き続きエクスポートされていること", () => {
    const { StepIndicator } = require("../wizard/index");
    expect(StepIndicator).toBeDefined();
  });

  it("InterviewProgressBar が引き続きエクスポートされていること", () => {
    const { InterviewProgressBar } = require("../wizard/index");
    expect(InterviewProgressBar).toBeDefined();
  });

  it("ApplySummaryCard が引き続きエクスポートされていること", () => {
    const { ApplySummaryCard } = require("../wizard/index");
    expect(ApplySummaryCard).toBeDefined();
  });

  it("GenerateStep が引き続きエクスポートされていること", () => {
    const { GenerateStep } = require("../wizard/index");
    expect(GenerateStep).toBeDefined();
  });

  it("CompleteStep が引き続きエクスポートされていること", () => {
    const { CompleteStep } = require("../wizard/index");
    expect(CompleteStep).toBeDefined();
  });
});
```

### TypeScript 型チェックテスト

```typescript
// 型テスト（tsd または expect-type を使用）
import type { SkillInfoStepProps } from "../wizard/index";
import type { ConversationRoundStepProps } from "../wizard/index";
// 上記 import が型エラーなしでコンパイルされることを確認
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
2. テストファイルを `__tests__/wizard-index-exports.test.ts` に作成する。
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
- [ ] 削除エクスポート5件の非存在テストが定義されていること
- [ ] 追加エクスポート4件の存在テストが定義されていること
- [ ] 維持エクスポート6件の存在テストが定義されていること
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
