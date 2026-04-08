# implementation-guide.md

## 概要

wizard/index.ts エクスポート更新（UT-SKILL-WIZARD-W2-seq-03b）

## 中学生向け説明

「部品箱」の比喩で説明する。

- `wizard/index.ts` は「部品箱のふた」のようなもの。外から取り出せる部品（エクスポート）を管理している
- 今回の変更: 古い部品（DescribeStep）を取り出せなくし、新しい部品（SkillInfoStepProps 型）を追加した
- DescribeStep ファイル自体はまだあるが、箱の外からは見えなくなった（@deprecated マーク付き）

つまり、「古い部品を箱の奥にしまい、新しい部品を前に並べた」という作業である。

## 技術者向け説明

### 変更前（Before）

```typescript
export { DescribeStep } from "./DescribeStep";
export type { DescribeStepProps } from "./DescribeStep";
export { SkillInfoStep } from "./SkillInfoStep";
// SkillInfoStepProps 型エクスポートなし
```

### 変更後（After）

```typescript
export { SkillInfoStep } from "./SkillInfoStep";
export type { SkillInfoStepProps } from "./SkillInfoStep"; // 追加
// DescribeStep/DescribeStepProps は削除
```

### 変更詳細

- 削除: `DescribeStep`、`DescribeStepProps`（W2-seq-03a で SkillInfoStep に移行済みのため）
- 追加: `SkillInfoStepProps` 型エクスポート（`SkillInfoStep.tsx` の interface に `export` を付与）
- `@deprecated` 付与: `DescribeStep.tsx`（段階的廃止の明示）
- 維持: `StepIndicator`、`GenerateStep`、`CompleteStep` および関連型（変更なし）

### 変更ファイル一覧

| ファイル                                  | 変更種別 | 内容                                                         |
| ----------------------------------------- | -------- | ------------------------------------------------------------ |
| `wizard/index.ts`                         | 更新     | DescribeStep/DescribeStepProps 削除、SkillInfoStepProps 追加 |
| `wizard/SkillInfoStep.tsx`                | 更新     | interface に `export` キーワード付与                         |
| `wizard/DescribeStep.tsx`                 | 更新     | `@deprecated` JSDoc 追加                                     |
| `wizard/__tests__/wizard-exports.test.ts` | 新規     | エクスポート契約を検証する 13 テスト                         |

### 検証結果

- TypeScript: 型エラー 0 件（`tsc --noEmit`）
- テスト: 13/13 PASS（`wizard-exports.test.ts`）
