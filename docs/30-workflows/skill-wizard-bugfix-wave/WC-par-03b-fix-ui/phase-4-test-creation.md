# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| Phase      | 4                                                                       |
| タスクID   | TASK-SW-FIX-UI-001                                                      |
| 機能名     | UI整合性修正（カテゴリ複数選択・ボタン統一・ProgressBar・カテゴリ解除） |
| 前提Phase  | Phase 3                                                                 |
| 後続Phase  | Phase 5                                                                 |
| 作成日     | 2026-04-12                                                              |
| ステータス | pending                                                                 |

## 目的

Phase 2 の設計を検証するテストを、実装前に作成する（TDD）。
型変更・複数選択ロジック・ProgressBar動的計算・ボタンスタイルの各修正に対応するテストを準備する。
shared 推論・`ApplySummaryCard`・`ConversationRoundStep` まで含めて、関連分岐を先に固定する。

## 実行タスク

- [ ] `SkillInfoFormData.category`型変更に対応するテスト更新箇所を特定する
- [ ] `handleCategoryClick`の複数選択・トグル解除テストを作成する
- [ ] `currentQuestion`動的計算のテストを作成する
- [ ] ボタンスタイル検証テストを作成する
- [ ] shared 推論・`ApplySummaryCard` の配列前提テストを作成する
- [ ] テスト実行コマンドを確認する

## 参照資料

| 資料名                | パス                                                                                       | 説明                     |
| --------------------- | ------------------------------------------------------------------------------------------ | ------------------------ |
| 設計書                | `phase-2-design.md`                                                                        | テスト対象の仕様         |
| 既存型テスト          | `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`                          | 更新対象テスト           |
| shared推論テスト      | `packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts` | 更新対象テスト           |
| SkillInfoStep         | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`                      | テスト対象コンポーネント |
| ApplySummaryCard      | `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`                   | テスト対象コンポーネント |
| ConversationRoundStep | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`              | テスト対象コンポーネント |
| SkillCreateWizard     | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                         | テスト対象コンポーネント |

## 実行手順

### Step 1: 既存型テストの更新（`skillCreator-wizard.test.ts`）

`SkillInfoFormData.category`の型が`SkillCategory | null`から`SkillCategory[]`に変わるため、
`packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`の以下のテストを更新する。未選択は空配列 `[]` に統一し、`null` は使わない。

```typescript
// 変更前（単一選択を前提としたテスト）
describe("SkillInfoFormData", () => {
  it("カテゴリを含む構成で構築できる", () => {
    const data: SkillInfoFormData = {
      skillName: "slack-notifier",
      purpose: "Slack通知を整理する",
      category: "automation", // ← SkillCategory | null → SkillCategory[] に変更
    };
    expectTypeOf(data).toMatchTypeOf<SkillInfoFormData>();
  });

  it("category が SkillCategory | null 型である", () => {
    expectTypeOf<
      SkillInfoFormData["category"]
    >().toEqualTypeOf<SkillCategory | null>();
  });
});

// 変更後（複数選択に対応）
describe("SkillInfoFormData", () => {
  it("カテゴリを複数含む構成で構築できる", () => {
    const data: SkillInfoFormData = {
      skillName: "slack-notifier",
      purpose: "Slack通知を整理する",
      category: ["automation", "external-integration"],
    };
    expectTypeOf(data).toMatchTypeOf<SkillInfoFormData>();
  });

  it("category が SkillCategory[] 型である", () => {
    expectTypeOf<SkillInfoFormData["category"]>().toEqualTypeOf<
      SkillCategory[]
    >();
  });

  it("category に空配列を指定できる", () => {
    const data: SkillInfoFormData = {
      purpose: "Slack通知を整理する",
      category: [],
    };
    expectTypeOf(data).toMatchTypeOf<SkillInfoFormData>();
  });
});
```

### Step 2: `handleCategoryClick`のテスト（`SkillInfoStep.test.tsx`）

`SkillInfoStep`のテストファイルが存在する場合は追加・更新、存在しない場合は新規作成する。
テストファイルパス: `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx`

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SkillInfoStep } from "../SkillInfoStep";
import type { SkillInfoFormData } from "@repo/shared/types/skillCreator";

const baseFormData: SkillInfoFormData = {
  purpose: "テスト用の目的（10文字以上）",
  category: [],
};

describe("SkillInfoStep カテゴリ選択", () => {
  it("カテゴリをクリックすると選択状態になる", () => {
    const onChange = vi.fn();
    render(
      <SkillInfoStep
        formData={baseFormData}
        onFormDataChange={onChange}
        onNext={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "自動化" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ category: ["automation"] })
    );
  });

  it("選択済みカテゴリを再クリックすると解除される", () => {
    const onChange = vi.fn();
    render(
      <SkillInfoStep
        formData={{ ...baseFormData, category: ["automation"] }}
        onFormDataChange={onChange}
        onNext={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "自動化" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ category: [] })
    );
  });

  it("複数カテゴリを選択できる", () => {
    const onChange = vi.fn();
    render(
      <SkillInfoStep
        formData={{ ...baseFormData, category: ["automation"] }}
        onFormDataChange={onChange}
        onNext={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "外部連携" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        category: ["automation", "external-integration"],
      })
    );
  });
});

describe("SkillInfoStep 次へボタン活性化", () => {
  it("purposeが10文字以上かつcategoryが1件以上で次へボタンが活性化する", () => {
    render(
      <SkillInfoStep
        formData={{ purpose: "テスト用の目的（10文字以上）", category: ["automation"] }}
        onFormDataChange={vi.fn()}
        onNext={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: "次へ" })).not.toBeDisabled();
  });

  it("categoryが空配列の場合は次へボタンが非活性", () => {
    render(
      <SkillInfoStep
        formData={{ purpose: "テスト用の目的（10文字以上）", category: [] }}
        onFormDataChange={vi.fn()}
        onNext={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
  });
});
```

### Step 3: `currentQuestion`動的計算のテスト（`ConversationRoundStep.test.tsx`）

```typescript
describe("ConversationRoundStep currentQuestion動的計算", () => {
  it("selectedOptionsが増えるとcurrentQuestionも増える", () => {
    const answers = {
      q1: { selectedOptions: ["a"], freeText: "", scheduleConfig: undefined },
      q2: { selectedOptions: ["b"], freeText: "", scheduleConfig: undefined },
      q3: { selectedOptions: [], freeText: "", scheduleConfig: undefined },
      q4: { selectedOptions: [], freeText: "", scheduleConfig: undefined },
      q5: { selectedOptions: [], freeText: "", scheduleConfig: undefined },
      q6: { selectedOptions: [], freeText: "", scheduleConfig: undefined },
    };
    const answeredCount = Object.values(answers).filter(
      (answer) =>
        answer.selectedOptions.length > 0 || answer.freeText.trim() !== "",
    ).length;
    expect(Math.max(1, answeredCount)).toBe(2);
  });

  it("全問未回答時は1/6を表示する", () => {
    const answeredCount = 0;
    expect(Math.max(1, answeredCount)).toBe(1);
  });
});
```

### Step 4: ボタンスタイルの確認テスト

スタイルの検証はビジュアルリグレッションテストまたはスナップショットテストで対応する。
Phase 11（手動テスト・VISUAL）でも目視確認を実施する。

```typescript
describe("SkillInfoStep ボタンスタイル", () => {
  it("次へボタンにCSS変数クラスが適用されている", () => {
    render(
      <SkillInfoStep
        formData={{ purpose: "テスト用の目的（10文字以上）", category: ["automation"] }}
        onFormDataChange={vi.fn()}
        onNext={vi.fn()}
      />
    );
    const nextButton = screen.getByRole("button", { name: "次へ" });
    // bg-blue-600 が含まれていないことを確認
    expect(nextButton.className).not.toContain("bg-blue-600");
    // CSS変数クラスが含まれていることを確認
    expect(nextButton.className).toContain("status-primary");
    expect(nextButton.className).toContain("rounded-lg");
  });
});
```

### Step 5: テスト実行コマンド

```bash
# 型テスト（shared パッケージ）
pnpm --filter @repo/shared test packages/shared/src/types/__tests__/skillCreator-wizard.test.ts
pnpm --filter @repo/shared test packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts

# SkillInfoStep コンポーネントテスト
pnpm --filter @repo/desktop test src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx
pnpm --filter @repo/desktop test src/renderer/components/skill/wizard/__tests__/ApplySummaryCard.test.tsx
pnpm --filter @repo/desktop test src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
pnpm --filter @repo/desktop test src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx

# 全テスト
pnpm --filter @repo/desktop test
pnpm --filter @repo/shared test
```

## 成果物

- `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`: category型変更対応のテスト更新（修正）
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx`: 複数選択・解除テスト（新規作成 or 修正）
- `packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts`: shared 推論の配列対応テスト（修正）
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/ApplySummaryCard.test.tsx`: Q5 必須判定テスト（修正）
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`: `currentQuestion` 動的化テスト（修正）
- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`: 代表カテゴリ・推論テスト（修正）

## 完了条件

- [ ] `skillCreator-wizard.test.ts`の`category`型テストが`SkillCategory[]`に更新されている
- [ ] `handleCategoryClick`の複数選択・解除テストが作成されている
- [ ] `isNextEnabled`の活性化条件テストが作成されている
- [ ] `currentQuestion`動的計算のテストが作成されている
- [ ] shared 推論・`ApplySummaryCard` の配列前提テストが作成されている
- [ ] Phase 5 実装前の時点ではテストが失敗する（TDD として正常）
