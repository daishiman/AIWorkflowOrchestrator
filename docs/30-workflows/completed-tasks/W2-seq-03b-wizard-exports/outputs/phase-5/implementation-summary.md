# 実装サマリー

**タスクID**: UT-SKILL-WIZARD-W2-seq-03b
**タスク名**: wizard/index.ts エクスポート更新

## 変更概要

`wizard/index.ts` のパブリック API を旧 `DescribeStep` 系から新 `SkillInfoStep` 系へ移行した。

## 変更内容

### 1. `SkillInfoStep.tsx` — interface に export を追加

`interface SkillInfoStepProps` が外部からインポートできるよう `export` キーワードを付与した。

### 2. `index.ts` — エクスポート差し替え

- 削除: `export { DescribeStep } from "./DescribeStep"`
- 削除: `export type { DescribeStepProps } from "./DescribeStep"`
- 追加: `export { SkillInfoStep } from "./SkillInfoStep"`
- 追加: `export type { SkillInfoStepProps } from "./SkillInfoStep"`

### 3. `DescribeStep.tsx` — 非推奨マーキング

JSDoc に `@deprecated W2-seq-03b: SkillInfoStep に置き換えられました。` を追加。ファイル自体は残存させ、段階的廃止を宣言。

### 4. `wizard-exports.test.ts` — 新規テストファイル

エクスポート契約を 13 テストケースで検証するファイルを新規作成。

## 設計方針

- 後方互換を意識し `DescribeStep.tsx` ファイルは即時削除せず deprecated 宣言に留める
- 型エクスポートは値エクスポートと同行に並べてガード漏れを防ぐ
