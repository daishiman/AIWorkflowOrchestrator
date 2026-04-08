# Phase 1 成果物: 要件定義

## タスクID: UT-SKILL-WIZARD-W1-SKILL-INFO-STEP-001

## 受入条件（AC-1〜AC-9）

| AC   | 内容                                                                                          | 判定 |
| ---- | --------------------------------------------------------------------------------------------- | ---- |
| AC-1 | `SkillInfoStep.tsx` が `apps/desktop/src/renderer/components/skill/wizard/` に存在する        | PASS |
| AC-2 | `SkillInfoStep` が `SkillInfoFormData` 型（`@repo/shared/types/skillCreator`）を props に使用 | PASS |
| AC-3 | スキル名・目的・カテゴリの 3フィールドが描画される                                            | PASS |
| AC-4 | カテゴリは `SkillCategory` 型の全値を選択肢として表示する                                     | PASS |
| AC-5 | フォーム変更が `onFormDataChange(data: SkillInfoFormData)` コールバックで親へ通知される       | PASS |
| AC-6 | `wizard/index.ts` から `SkillInfoStep` が export される                                       | PASS |
| AC-7 | `pnpm --filter @repo/desktop typecheck` が PASS する                                          | PASS |
| AC-8 | `pnpm --filter @repo/desktop lint` が PASS する                                               | PASS |
| AC-9 | `SkillInfoStep.test.tsx` の全テストが PASS する                                               | PASS |

## タスク分類

- **タスク種別**: NON_VISUAL タスク（Renderer 内部の計装のみ / 視覚差分なし）
- **影響 Process**: Renderer（ブラウザ環境）のみ

## コードインベントリ（変更対象ファイル一覧）

| 変更種別 | ファイルパス                                                                         | 変更内容                          |
| -------- | ------------------------------------------------------------------------------------ | --------------------------------- |
| 新規作成 | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`                | Step 0 フォームコンポーネント     |
| 新規作成 | `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx` | ユニットテスト                    |
| 修正     | `apps/desktop/src/renderer/components/skill/wizard/index.ts`                         | `SkillInfoStep` の re-export 追加 |

## 型構造確認

`packages/shared/src/types/skillCreator.ts` の定義（確認済み）:

```typescript
export type SkillCategory =
  | "automation"
  | "external-integration"
  | "data-analysis"
  | "code-support"
  | "other";

export interface SkillInfoFormData {
  skillName?: string;
  purpose: string;
  category: SkillCategory | null;
}
```
