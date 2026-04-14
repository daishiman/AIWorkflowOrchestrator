# Phase 1: 要件定義 - 検証完了

## 検証日: 2026-04-14

## 影響範囲調査結果

### `SkillInfoFormData.category` 参照箇所

| ファイル                                                                    | 行                   | 現在の使用方法                        | 変更必要                                   |
| --------------------------------------------------------------------------- | -------------------- | ------------------------------------- | ------------------------------------------ |
| `packages/shared/src/types/skillCreator.ts`                                 | 988                  | `category: SkillCategory \| null`     | ✅ → `SkillCategory[]`                     |
| `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts` | 60-77                | `category === "code-support"`         | ✅ → `.includes()`                         |
| `apps/desktop/.../wizard/utils/inferSmartDefaults.ts`                       | 65-66                | `data.category === "code-support"`    | ✅ → `.includes()`                         |
| `apps/desktop/.../wizard/SkillInfoStep.tsx`                                 | 80,84-86,157         | `=== null`, `=== value`               | ✅ → `.length > 0`, `.includes()`          |
| `apps/desktop/.../wizard/ApplySummaryCard.tsx`                              | 89                   | `=== "external-integration"`          | ✅ → `.includes()`                         |
| `apps/desktop/.../wizard/ConversationRoundStep.tsx`                         | 256                  | `=== "external-integration"`          | ✅ → `.includes()`                         |
| `apps/desktop/.../SkillCreateWizard.tsx`                                    | 63-66, 210, 213, 447 | `category: null`, `===`, `?? "other"` | ✅ → `[]`, `.includes()`, 代表カテゴリ解決 |
| `packages/shared/src/types/skillCreator.ts`                                 | 1486                 | `formData.category ?? undefined`      | ✅ → 配列対応                              |

### `bg-blue-600` 残存箇所（ウィザード関連）

| ファイル                                    | 行  | 変更必要         |
| ------------------------------------------- | --- | ---------------- |
| `apps/desktop/.../wizard/SkillInfoStep.tsx` | 186 | ✅ CSS変数に統一 |

注: `SkillCreateWizard.tsx` 内には `bg-blue-600` 直接使用なし（inferSmartDefaults関数のコピー内のみ）。

### `currentQuestion` 固定値

| ファイル                    | 行  | 現在                        | 変更        |
| --------------------------- | --- | --------------------------- | ----------- |
| `ConversationRoundStep.tsx` | 257 | `currentPage === 1 ? 1 : 4` | ✅ 動的計算 |

## AC確定

- AC-1〜AC-6 すべて仕様通り実装可能
- subpath export (`@repo/shared/types/skillCreator`) に閉じた変更
- ルート barrel は存在しない（packages/shared/src/index.ts なし）
