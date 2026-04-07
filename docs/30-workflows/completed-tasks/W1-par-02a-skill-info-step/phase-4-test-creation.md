# Phase 4: テスト作成

## メタ情報

- Phase: 4
- タスクID: UT-SKILL-WIZARD-W1-par-02a
- 機能名: SkillInfoStep コンポーネント実装（Step 0）
- 作成日: 2026-04-07

## 目的

実装前にテストコードを作成し（TDD方式）、`SkillInfoStep` コンポーネントの振る舞いを仕様として確定する。

## 実行タスク

- [ ] テストファイルを作成する
- [ ] レンダリングテストを作成する
- [ ] バリデーションテストを作成する
- [ ] カテゴリタグ選択テストを作成する
- [ ] 「次へ」ボタン活性化テストを作成する
- [ ] `onFormDataChange` コールバックテストを作成する
- [ ] テストが RED（失敗）状態であることを確認する

## 参照資料

| 資料名               | パス                            | 説明                 |
| -------------------- | ------------------------------- | -------------------- |
| Phase 2 設計書       | `phase-2-design.md`             | テスト対象の仕様     |
| Phase 3 設計レビュー | `phase-3-design-review.md`      | レビュー済み仕様     |
| Vitest 設定          | `apps/desktop/vitest.config.ts` | テスト実行環境       |
| Testing Library      | `@testing-library/react`        | テストユーティリティ |

## 実行手順

### Step 1: テストファイル作成

```
apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx
```

### Step 2: テストコード作成

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SkillInfoStep } from "../SkillInfoStep";
import type { SkillInfoFormData } from "@repo/shared/types/skillCreator";

const defaultFormData: SkillInfoFormData = {
  skillName: "",
  purpose: "",
  category: null,
};

describe("SkillInfoStep", () => {
  describe("レンダリング", () => {
    it("スキル名入力フィールドが表示される", () => {
      render(
        <SkillInfoStep
          formData={defaultFormData}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />
      );
      expect(screen.getByLabelText(/スキル名/)).toBeInTheDocument();
    });

    it("目的・背景テキストエリアが表示される", () => {
      render(
        <SkillInfoStep
          formData={defaultFormData}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />
      );
      expect(screen.getByLabelText(/目的・背景/)).toBeInTheDocument();
    });

    it("カテゴリタグが5種表示される", () => {
      render(
        <SkillInfoStep
          formData={defaultFormData}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />
      );
      expect(screen.getByRole("button", { name: "自動化" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "外部連携" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "データ分析" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "コードサポート" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "その他" })).toBeInTheDocument();
    });

    it("「次へ」ボタンが表示される", () => {
      render(
        <SkillInfoStep
          formData={defaultFormData}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />
      );
      expect(screen.getByRole("button", { name: "次へ" })).toBeInTheDocument();
    });
  });

  describe("「次へ」ボタンの活性化", () => {
    it("目的が空のとき「次へ」ボタンは無効", () => {
      render(
        <SkillInfoStep
          formData={defaultFormData}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />
      );
      expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
    });

    it("目的が9文字のとき「次へ」ボタンは無効", () => {
      render(
        <SkillInfoStep
          formData={{ ...defaultFormData, purpose: "123456789" }}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />
      );
      expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
    });

    it("目的が10文字でもカテゴリ未選択なら「次へ」ボタンは無効", () => {
      render(
        <SkillInfoStep
          formData={{ ...defaultFormData, purpose: "1234567890" }}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />
      );
      expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
    });

    it("目的が10文字以上のとき「次へ」ボタンは有効", () => {
      render(
        <SkillInfoStep
          formData={{
            ...defaultFormData,
            purpose: "1234567890",
            category: "automation",
          }}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />
      );
      expect(screen.getByRole("button", { name: "次へ" })).toBeEnabled();
    });
  });

  describe("バリデーション", () => {
    it("目的フィールドからフォーカスが外れたとき、10文字未満ならエラーが表示される", () => {
      render(
        <SkillInfoStep
          formData={defaultFormData}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />
      );
      const textarea = screen.getByLabelText(/目的・背景/);
      fireEvent.blur(textarea);
      expect(screen.getByText(/10文字以上/)).toBeInTheDocument();
    });

    it("目的が10文字以上のときエラーは表示されない", () => {
      render(
        <SkillInfoStep
          formData={{
            ...defaultFormData,
            purpose: "1234567890",
            category: "automation",
          }}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />
      );
      expect(screen.queryByText(/10文字以上/)).not.toBeInTheDocument();
    });
  });

  describe("カテゴリタグ選択", () => {
    it("カテゴリタグを別のカテゴリに切り替えると onFormDataChange が呼ばれる", () => {
      const onFormDataChange = vi.fn();
      render(
        <SkillInfoStep
          formData={defaultFormData}
          onFormDataChange={onFormDataChange}
          onNext={vi.fn()}
        />
      );
      fireEvent.click(screen.getByRole("button", { name: "外部連携" }));
      expect(onFormDataChange).toHaveBeenCalledWith(
        expect.objectContaining({ category: "external-integration" })
      );
    });

    it("選択中のカテゴリを再クリックしても onFormDataChange は呼ばれない", () => {
      const onFormDataChange = vi.fn();
      render(
        <SkillInfoStep
          formData={{ ...defaultFormData, category: "automation" }}
          onFormDataChange={onFormDataChange}
          onNext={vi.fn()}
        />
      );
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      expect(onFormDataChange).not.toHaveBeenCalled();
    });

    it("選択中のカテゴリタグに aria-pressed=true が付与される", () => {
      render(
        <SkillInfoStep
          formData={{ ...defaultFormData, category: "external-integration" }}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />
      );
      expect(screen.getByRole("button", { name: "外部連携" })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
    });
  });

  describe("onNext コールバック", () => {
    it("「次へ」ボタンクリック時に onNext が呼ばれる", () => {
      const onNext = vi.fn();
      render(
        <SkillInfoStep
          formData={{
            ...defaultFormData,
            purpose: "10文字以上の目的入力テスト",
            category: "automation",
          }}
          onFormDataChange={vi.fn()}
          onNext={onNext}
        />
      );
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      expect(onNext).toHaveBeenCalledTimes(1);
    });
  });
});
```

### Step 3: テスト実行（RED確認）

```bash
# vitest でテスト実行（実装前なので失敗することを確認）
pnpm --filter @repo/desktop vitest run src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx
```

## 成果物

- `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx`

## 完了条件

- [ ] テストファイルが作成されている
- [ ] レンダリングテストが網羅されている
- [ ] バリデーションテスト（Touched-state）が作成されている
- [ ] カテゴリタグ選択テストが作成されている
- [ ] 「次へ」ボタン活性化テストが作成されている
- [ ] `onFormDataChange` / `onNext` コールバックテストが作成されている
- [ ] 実装前にテストが失敗（RED）することを確認している
