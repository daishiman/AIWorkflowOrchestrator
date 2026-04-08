# Phase 2 成果物: 設計

## タスクID: UT-SKILL-WIZARD-W1-SKILL-INFO-STEP-001

## 変更ファイル一覧

| 変更種別 | ファイルパス                                                                         | 変更内容                          |
| -------- | ------------------------------------------------------------------------------------ | --------------------------------- |
| 新規作成 | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`                | Step 0 フォームコンポーネント     |
| 新規作成 | `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx` | ユニットテスト                    |
| 修正     | `apps/desktop/src/renderer/components/skill/wizard/index.ts`                         | `SkillInfoStep` の re-export 追加 |

## コンポーネント設計

### Props 型

```typescript
interface SkillInfoStepProps {
  formData: SkillInfoFormData;
  onFormDataChange: (data: SkillInfoFormData) => void;
  onNext: () => void;
}
```

### 設計方針

- **controlled component パターン**: 親（`SkillCreateWizard.tsx`）が `formData` を保持し、`SkillInfoStep` は受け取り・変更通知のみを担う薄いコンポーネント
- **subpath import 必須**: `SkillInfoFormData` / `SkillCategory` は `@repo/shared/types/skillCreator` からの subpath import に閉じる
- **最小ローカル state**: `purposeTouched`（blur判定）のみを局所保持

## フィールド構成（3フィールド）

| フィールド | 入力 UI   | 型                      | 必須 | `SkillInfoFormData` フィールド名 |
| ---------- | --------- | ----------------------- | ---- | -------------------------------- |
| スキル名   | text 入力 | `string \| undefined`   | 任意 | `skillName`                      |
| 目的       | textarea  | `string`                | 必須 | `purpose`                        |
| カテゴリ   | button 群 | `SkillCategory \| null` | 必須 | `category`                       |

## `SkillCategory` 全値と UI ラベル

| 値                     | ラベル         |
| ---------------------- | -------------- |
| `automation`           | 自動化         |
| `external-integration` | 外部連携       |
| `data-analysis`        | データ分析     |
| `code-support`         | コードサポート |
| `other`                | その他         |

## 「次へ」活性条件

```typescript
const isNextEnabled =
  formData.purpose.trim().length >= 10 && formData.category !== null;
```

## subpath import 方針

- `import type { SkillInfoFormData, SkillCategory } from "@repo/shared/types/skillCreator"`
- root `@repo/shared` への拡張は行わない
