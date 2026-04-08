# Phase 5: 実装

## メタ情報

- Phase: 5
- タスクID: UT-SKILL-WIZARD-W1-SKILL-INFO-STEP-001
- 機能名: SkillInfoStep コンポーネント実装（Step 0: スキル情報入力）
- 作成日: 2026-04-08
- ステータス: **completed**

## 目的

Phase 4 で作成したテストを Green にする実装を行う。
`wizard/SkillInfoStep.tsx` を新規作成し、`wizard/index.ts` へ re-export を追加する。

## 実装計画

**新規作成ファイル**:

- `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx` — Step 0 フォームコンポーネント
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx` — ユニットテスト

**修正ファイル**:

- `apps/desktop/src/renderer/components/skill/wizard/index.ts` — `SkillInfoStep` の re-export 追加

## 実装タスク一覧

### Task 5-1: `SkillInfoStep.tsx` を新規作成する

1. `packages/shared/src/types/skillCreator.ts` の `SkillInfoFormData` と `SkillCategory` を
   subpath import で確認する（`@repo/shared/types/skillCreator` からの import）
2. `formData` / `onFormDataChange` / `onNext` を受け取る controlled component として実装する
3. スキル名（text）・目的（textarea）・カテゴリ（button 群）の 3フィールドを描画する
4. `SkillCategory` の全値を chip/button として列挙する
5. 目的の blur で validation message を出し、Next の活性条件を `purpose` と `category` で制御する
6. `pnpm --filter @repo/desktop vitest run` で TC-01〜TC-09 が Green になることを確認する

### Task 5-2: `wizard/index.ts` に `SkillInfoStep` を追加する

1. `apps/desktop/src/renderer/components/skill/wizard/index.ts` を確認する
2. `export { SkillInfoStep } from "../SkillInfoStep"` またはパスを合わせた re-export を追加する
3. `pnpm --filter @repo/desktop typecheck` が PASS することを確認する

## 実装参考コード

### SkillInfoStep.tsx の骨格

```typescript
import { useState } from "react";
import type { SkillInfoFormData, SkillCategory } from "@repo/shared/types/skillCreator";

interface SkillInfoStepProps {
  formData: SkillInfoFormData;
  onFormDataChange: (data: SkillInfoFormData) => void;
  onNext: () => void;
}

const CATEGORY_OPTIONS: { value: SkillCategory; label: string }[] = [
  { value: "automation", label: "自動化" },
  { value: "external-integration", label: "外部連携" },
  { value: "data-analysis", label: "データ分析" },
  { value: "code-support", label: "コードサポート" },
  { value: "other", label: "その他" },
];

export function SkillInfoStep({
  formData,
  onFormDataChange,
  onNext,
}: SkillInfoStepProps) {
  const [purposeTouched, setPurposeTouched] = useState(false);
  const isNextEnabled =
    formData.purpose.trim().length >= 10 && formData.category !== null;

  return (
    <div>
      <label>
        スキル名
        <input
          type="text"
          value={formData.skillName ?? ""}
          onChange={(e) =>
            onFormDataChange({ ...formData, skillName: e.target.value })
          }
        />
      </label>
      <label>
        目的・背景
        <textarea
          value={formData.purpose}
          onChange={(e) =>
            onFormDataChange({ ...formData, purpose: e.target.value })
          }
          onBlur={() => setPurposeTouched(true)}
        />
      </label>
      <label>
        カテゴリ
        <div role="group" aria-label="カテゴリを選択">
          {CATEGORY_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={formData.category === value}
              onClick={() =>
                formData.category === value
                  ? undefined
                  : onFormDataChange({ ...formData, category: value })
              }
            >
              {label}
            </button>
          ))}
        </div>
      </label>
      {purposeTouched && formData.purpose.trim().length < 10 ? (
        <p>目的・背景は10文字以上で入力してください</p>
      ) : null}
      <button type="button" onClick={onNext} disabled={!isNextEnabled}>
        次へ
      </button>
    </div>
  );
}
```

> 上記は骨格のみ。実際の `SkillCategory` の値・フィールド名・スタイリングは実装時に確認して調整する。

## 参照資料

| 資料名               | パス                                        | 説明                                  |
| -------------------- | ------------------------------------------- | ------------------------------------- |
| Phase 4 テスト       | `phase-4-test-creation.md`                  | テスト仕様                            |
| Phase 2 設計書       | `phase-2-design.md`                         | 実装仕様                              |
| Phase 3 設計レビュー | `phase-3-design-review.md`                  | 修正済み仕様                          |
| 共有型定義           | `packages/shared/src/types/skillCreator.ts` | `SkillInfoFormData` / `SkillCategory` |

## 成果物

- `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`（実装済み）
- 修正済み `apps/desktop/src/renderer/components/skill/wizard/index.ts`
- `pnpm --filter @repo/desktop vitest run` の Green 確認ログ

## 完了条件

- [x] TC-01〜TC-09 が全て Green になっている
- [x] `pnpm --filter @repo/desktop typecheck` が PASS している
- [x] `wizard/index.ts` から `SkillInfoStep` が re-export されている
