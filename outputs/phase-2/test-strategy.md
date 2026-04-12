# Phase 2: テスト戦略 — UT-SKILL-WIZARD-W2-seq-03b

## テスト方針

このタスクは barrel export の変更のみで UI ロジックを含まない。
テストは以下の観点で設計する。

## テスト種別

| 種別             | 目的                                               | ファイル                                                                      |
| ---------------- | -------------------------------------------------- | ----------------------------------------------------------------------------- |
| エクスポート確認 | 削除/追加/維持の各エクスポートが期待通りであること | `apps/desktop/src/renderer/components/skill/__tests__/wizard-exports.test.ts` |
| 型チェック       | TypeScript コンパイルが通ること                    | `pnpm --filter @repo/desktop typecheck`                                       |

## テスト構成

```
describe("wizard/index.ts 削除エクスポート確認")
  it("DescribeStep がエクスポートされていないこと")
  it("ConfigureStep がエクスポートされていないこと")
  it("WizardOptions がエクスポートされていないこと")

describe("wizard/index.ts 追加エクスポート確認")
  it("SkillInfoStep がエクスポートされていること")
  it("ConversationRoundStep がエクスポートされていること")

describe("wizard/index.ts 維持エクスポート確認")
  it("StepIndicator が引き続きエクスポートされていること")
  it("GenerateStep が引き続きエクスポートされていること")
  it("CompleteStep が引き続きエクスポートされていること")
  it("InterviewProgressBar が引き続きエクスポートされていること")
  it("ApplySummaryCard が引き続きエクスポートされていること")

describe("wizard/index.ts バレルエクスポート整合確認")
  it("GenerationMode が barrel から期待どおりの union 型で参照できること")
  it("SkillInfoStepProps が barrel から期待どおりの型で参照できること")
```

## 型チェック検証観点

- `SkillCreateWizard.tsx` が `import type { GenerationMode } from "./wizard"` を解決できること
- `SkillInfoStepProps` が `wizard/index.ts` 経由でインポート可能であること
