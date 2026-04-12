# Phase 12: 実装ガイド — UT-SKILL-WIZARD-W2-seq-03b

## Part 1: 中学生向けの説明

### この変更は何か

画面そのものを作り替えたのではなく、部品をまとめて外に見せる「案内板」を整理した変更です。

たとえば、学校の職員室の前にある案内板を思い浮かべると分かりやすいです。
部屋そのものは変えていなくても、案内板に古い教室名が残っていると、見る人は間違った部屋へ行きます。
今回やったことは、その案内板から古い名前を消して、今も使う名前だけを正しく並べ直したのに近いです。

### なぜ必要だったか

- `wizard/index.ts` に古い案内が残ると、別のファイルが間違った部品名を使いやすい
- `GenerationMode` を 2 か所で持つと、どちらが本物か分かりにくい
- `SkillInfoStepProps` が外から見えないと、正しい型を安全に使えない

### 何を変えたか

| 変更               | 内容                                                                                |
| ------------------ | ----------------------------------------------------------------------------------- |
| 古い案内を外した   | `DescribeStep` / `DescribeStepProps` / inline `GenerationMode` を barrel から外した |
| 新しい案内を足した | `SkillInfoStepProps` を公開した                                                     |
| 1 か所にまとめた   | `GenerationMode` は `GenerateStep.tsx` を正本にした                                 |
| 迷いを減らした     | deprecated `DescribeStep.tsx` も barrel ではなく実装元から型を読むようにした        |

### 見た目への影響

見た目は変えていません。
そのため、代表画面のスクリーンショットを確認し、「案内板だけ直して部屋の見た目は変わっていない」ことを確かめました。

- `outputs/phase-11/screenshots/TC-11-01-step0-description-category.png`
- `outputs/phase-11/screenshots/TC-11-02-step1-page1-defaults.png`

## Part 2: 技術者向けの詳細

### 変更対象

- `apps/desktop/src/renderer/components/skill/wizard/index.ts`
- `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`
- `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/wizard-exports.test.ts`

### current contract

```ts
export { SkillInfoStep } from "./SkillInfoStep";
export type { SkillInfoStepProps } from "./SkillInfoStep";

export type {
  GenerateStepProps,
  GenerationError,
  GenerationStage,
  GenerationErrorCode,
  GenerationMode,
} from "./GenerateStep";
```

```ts
export interface SkillInfoStepProps {
  formData: SkillInfoFormData;
  onFormDataChange: (data: SkillInfoFormData) => void;
  onNext: () => void;
}
```

### 使用例

```ts
import type { GenerationMode, SkillInfoStepProps } from "./wizard";
```

`SkillCreateWizard.tsx` は `GenerationMode` を barrel 経由で参照し続ける。
deprecated `DescribeStep.tsx` は barrel ループを避けるため、`./GenerateStep` から直接 `GenerationMode` を読む。

### エラーハンドリングと失敗モード

| 失敗モード                                           | 影響                                                                  | 防ぎ方                                            |
| ---------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------- |
| `GenerationMode` の再転送を消す                      | `SkillCreateWizard.tsx` と deprecated `DescribeStep.tsx` が型エラー化 | `GenerateStep.tsx` を正本として再転送を維持する   |
| `SkillInfoStepProps` を非公開に戻す                  | barrel 経由の型 import が壊れる                                       | `wizard-exports.test.ts` で type-level に固定する |
| deprecated `DescribeStep.tsx` が barrel を再参照する | 依存がねじれ、保守時に誤読しやすい                                    | `./GenerateStep` へ直接依存させる                 |

### エッジケース

- `ConfigureStep` / `WizardOptions` / `ConfigureStepProps` は current repo では既に存在しない
- `DescribeStep.tsx` 自体は互換性維持のため残っているが、barrel からは公開しない
- UI 実装変更ではないため、Phase 11 は representative screenshot audit と static verification の組み合わせで閉じた

### 設定値・固定値

| 項目             | 値                    | 役割                                      |
| ---------------- | --------------------- | ----------------------------------------- |
| `GenerationMode` | `"llm" \| "template"` | 生成方式の型                              |
| export test 件数 | `13`                  | runtime / negative / type contract の合計 |

### 検証結果

- `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/wizard-exports.test.ts --maxWorkers 1`
  - `13 passed (13)`
- `pnpm --filter @repo/desktop typecheck`
  - エラー 0 件

### 依存タスク

- W1-par-02a（SkillInfoStep）
- W1-par-02b（ConversationRoundStep）
- W1-par-02c（CompleteStep）
