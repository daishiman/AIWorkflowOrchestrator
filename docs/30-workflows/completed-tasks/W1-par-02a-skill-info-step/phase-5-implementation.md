# Phase 5: 実装

## メタ情報

- Phase: 5
- タスクID: UT-SKILL-WIZARD-W1-par-02a
- 機能名: SkillInfoStep コンポーネント実装（Step 0）
- 作成日: 2026-04-07

## 目的

設計・テストに基づき `SkillInfoStep.tsx` を新規作成し、`DescribeStep.tsx` を削除する。全テストが GREEN になることを目標とする。

## 実行タスク

- [ ] `SkillInfoFormData` / `SkillCategory` を shared 正本から参照する
- [ ] `SkillInfoStep.tsx` を新規作成する
- [ ] `DescribeStep.tsx` を削除する
- [ ] `DescribeStep` 由来の `GenerationMode` 定義を `GenerateStep.tsx` に集約する
- [ ] `DescribeStep` の import 箇所を `SkillInfoStep` に置き換える
- [ ] テストを実行して GREEN を確認する

## 参照資料

| 資料名               | パス                       | 説明         |
| -------------------- | -------------------------- | ------------ |
| Phase 4 テスト       | `phase-4-test-creation.md` | テスト仕様   |
| Phase 2 設計書       | `phase-2-design.md`        | 実装仕様     |
| Phase 3 設計レビュー | `phase-3-design-review.md` | 修正済み仕様 |

## 実行手順

### Step 1: shared 型の参照準備

`SkillInfoFormData` と `SkillCategory` は `packages/shared/src/types/skillCreator.ts` に定義済みの正本を参照する。

```typescript
import type {
  SkillInfoFormData,
  SkillCategory,
} from "@repo/shared/types/skillCreator";
```

### Step 2: SkillInfoStep.tsx の新規作成

**ファイル**: `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`

```typescript
import { useState } from "react";
import type {
  SkillInfoFormData,
  SkillCategory,
} from "@repo/shared/types/skillCreator";

interface SkillInfoStepProps {
  formData: SkillInfoFormData;
  onFormDataChange: (data: SkillInfoFormData) => void;
  onNext: () => void;
}

const CATEGORY_OPTIONS: { value: SkillCategory; label: string }[] = [
  { value: "automation",           label: "自動化" },
  { value: "external-integration", label: "外部連携" },
  { value: "data-analysis",        label: "データ分析" },
  { value: "code-support",         label: "コードサポート" },
  { value: "other",                label: "その他" },
];

export function SkillInfoStep({
  formData,
  onFormDataChange,
  onNext,
}: SkillInfoStepProps) {
  const [purposeTouched, setPurposeTouched] = useState(false);

  const isNextEnabled =
    formData.purpose.trim().length >= 10 && formData.category !== null;
  const showPurposeError =
    purposeTouched && formData.purpose.trim().length < 10;

  const handleCategoryClick = (value: SkillCategory) => {
    if (formData.category === value) {
      return;
    }
    onFormDataChange({
      ...formData,
      category: value,
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* スキル名 */}
      <div className="flex flex-col gap-1">
        <label htmlFor="skill-name" className="text-sm font-medium text-gray-700">
          スキル名
          <span className="ml-1 text-xs text-gray-400">（任意）</span>
        </label>
        <input
          id="skill-name"
          type="text"
          value={formData.skillName ?? ""}
          onChange={(e) =>
            onFormDataChange({ ...formData, skillName: e.target.value })
          }
          className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="例: メール自動返信スキル"
        />
      </div>

      {/* 目的・背景 */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="purpose"
          className="text-sm font-medium text-gray-700"
        >
          目的・背景
          <span className="ml-1 text-xs text-red-500">必須</span>
        </label>
        <textarea
          id="purpose"
          value={formData.purpose}
          onChange={(e) =>
            onFormDataChange({ ...formData, purpose: e.target.value })
          }
          onBlur={() => setPurposeTouched(true)}
          rows={4}
          className={`rounded border px-3 py-2 text-sm focus:outline-none ${
            showPurposeError
              ? "border-red-500 focus:border-red-500"
              : "border-gray-300 focus:border-blue-500"
          }`}
          placeholder="このスキルで何を実現したいか、背景や目的を入力してください"
        />
        {showPurposeError && (
          <p className="text-xs text-red-500">
            目的・背景は10文字以上で入力してください
          </p>
        )}
      </div>

      {/* カテゴリタグ */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-700">
          カテゴリ
          <span className="ml-1 text-xs text-red-500">（必須）</span>
        </span>
        <div
          role="group"
          aria-label="カテゴリを選択"
          className="flex flex-wrap gap-2"
        >
          {CATEGORY_OPTIONS.map(({ value, label }) => {
            const isSelected = formData.category === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleCategoryClick(value)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  isSelected
                    ? "border-blue-500 bg-blue-100 text-blue-700"
                    : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 次へボタン */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!isNextEnabled}
          className="rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-blue-700"
        >
          次へ
        </button>
      </div>
    </div>
  );
}
```

### Step 3: DescribeStep.tsx の削除

```bash
rm apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx
```

### Step 4: 参照箇所の修正

`DescribeStep` と旧 `GenerationMode` 定義の参照箇所を整理し、Step 0 は `SkillInfoStep` / `SkillInfoFormData` に置き換える。

```bash
# 影響箇所の確認
grep -r "DescribeStep\|GenerationMode" apps/ packages/ --include="*.ts" --include="*.tsx"
```

各参照ファイルで以下の置き換えを行う:

- `import { DescribeStep } from "./DescribeStep"` → `import { SkillInfoStep } from "./SkillInfoStep"`
- `GenerationMode` 型の利用 → `SkillInfoFormData` の `category` フィールドで代替

### Step 5: テスト実行（GREEN 確認）

```bash
pnpm --filter @repo/desktop vitest run src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx
```

## 成果物

### 新規作成

- `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`

### 修正

- `DescribeStep` / 旧 `GenerationMode` 定義を参照していた全ファイル（import 置き換え）

### 削除

- `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`

## 完了条件

- [ ] `SkillInfoStep.tsx` が新規作成されている
- [ ] `SkillInfoFormData` / `SkillCategory` は shared 正本から参照されている
- [ ] `DescribeStep.tsx` が削除されている
- [ ] `GenerationMode` 型の参照が全て解消されている
- [ ] 全テストが GREEN になっている
- [ ] TypeScript のコンパイルエラーがない
