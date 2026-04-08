# 再テスト計画（Phase 8 リファクタ後）

## タスク情報

- タスクID: UT-SKILL-WIZARD-W2-seq-03b
- 対象: wizard/index.ts エクスポート更新
- 実施日: 2026-04-08

## 再テスト対象

### 1. wizard-exports.test.ts 全テスト再実行

リファクタ後に以下の 13 テストが全て PASS することを確認する。

| #   | テストケース                                               | 期待結果 |
| --- | ---------------------------------------------------------- | -------- |
| 1   | SkillInfoStep がエクスポートされている                     | PASS     |
| 2   | SkillInfoStepProps 型がエクスポートされている              | PASS     |
| 3   | StepIndicator がエクスポートされている                     | PASS     |
| 4   | GenerateStep がエクスポートされている                      | PASS     |
| 5   | CompleteStep がエクスポートされている                      | PASS     |
| 6   | DescribeStep が index.ts からエクスポートされていない      | PASS     |
| 7   | DescribeStepProps が index.ts からエクスポートされていない | PASS     |
| 8   | SkillInfoStep が有効な React コンポーネントである          | PASS     |
| 9   | StepIndicator が有効な React コンポーネントである          | PASS     |
| 10  | GenerateStep が有効な React コンポーネントである           | PASS     |
| 11  | CompleteStep が有効な React コンポーネントである           | PASS     |
| 12  | SkillInfoStepProps に必須プロパティが含まれている          | PASS     |
| 13  | DescribeStep.tsx に @deprecated JSDoc が付与されている     | PASS     |

### 2. TypeScript 型チェック（tsc --noEmit）

```bash
pnpm --filter @repo/desktop exec tsc --noEmit
```

- 期待結果: エラー 0 件

## 実行コマンド

```bash
# テスト実行
pnpm --filter @repo/desktop test -- wizard-exports

# 型チェック
pnpm --filter @repo/desktop exec tsc --noEmit
```

## 合否基準

- 全 13 テスト PASS かつ型エラー 0 件 → 再テスト合格
- 1 件でも FAIL → 実装を修正して再実行
