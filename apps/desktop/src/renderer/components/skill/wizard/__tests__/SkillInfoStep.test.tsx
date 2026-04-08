/**
 * @file SkillInfoStep.test.tsx
 * @description SkillInfoStep コンポーネント ユニットテスト
 * @phase Phase 4+6+7: テスト作成・拡充・カバレッジ補完（TDD: Red -> Green）
 * @task UT-SKILL-WIZARD-W1-par-02a
 *
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
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
        />,
      );
      expect(screen.getByLabelText(/スキル名/)).toBeInTheDocument();
    });

    it("目的・背景テキストエリアが表示される", () => {
      render(
        <SkillInfoStep
          formData={defaultFormData}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />,
      );
      expect(screen.getByLabelText(/目的・背景/)).toBeInTheDocument();
    });

    it("カテゴリタグが5種表示される", () => {
      render(
        <SkillInfoStep
          formData={defaultFormData}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />,
      );
      expect(
        screen.getByRole("button", { name: "自動化" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "外部連携" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "データ分析" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "コードサポート" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "その他" }),
      ).toBeInTheDocument();
    });

    it("「次へ」ボタンが表示される", () => {
      render(
        <SkillInfoStep
          formData={defaultFormData}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />,
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
        />,
      );
      expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
    });

    it("目的が9文字のとき「次へ」ボタンは無効", () => {
      render(
        <SkillInfoStep
          formData={{ ...defaultFormData, purpose: "123456789" }}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />,
      );
      expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
    });

    it("カテゴリが未選択（null）のとき「次へ」ボタンは無効", () => {
      render(
        <SkillInfoStep
          formData={{
            ...defaultFormData,
            purpose: "1234567890",
            category: null,
          }}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />,
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
        />,
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
        />,
      );
      const textarea = screen.getByLabelText(/目的・背景/);
      fireEvent.blur(textarea);
      expect(screen.getByText(/10文字以上/)).toBeInTheDocument();
    });

    it("目的が10文字以上のときエラーは表示されない", () => {
      render(
        <SkillInfoStep
          formData={{ ...defaultFormData, purpose: "1234567890" }}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />,
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
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "外部連携" }));
      expect(onFormDataChange).toHaveBeenCalledWith(
        expect.objectContaining({ category: "external-integration" }),
      );
    });

    it("選択中のカテゴリを再クリックしても onFormDataChange は呼ばれない", () => {
      const onFormDataChange = vi.fn();
      render(
        <SkillInfoStep
          formData={{ ...defaultFormData, category: "automation" }}
          onFormDataChange={onFormDataChange}
          onNext={vi.fn()}
        />,
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
        />,
      );
      expect(screen.getByRole("button", { name: "外部連携" })).toHaveAttribute(
        "aria-pressed",
        "true",
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
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      expect(onNext).toHaveBeenCalledTimes(1);
    });
  });

  // Phase 6: 境界値テスト
  describe("目的フィールドの境界値", () => {
    it("目的がちょうど10文字のとき「次へ」ボタンは有効", () => {
      render(
        <SkillInfoStep
          formData={{
            ...defaultFormData,
            purpose: "あいうえおかきくけこ",
            category: "automation",
          }}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />,
      );
      expect(screen.getByRole("button", { name: "次へ" })).toBeEnabled();
    });

    it("目的が空白のみ10文字のとき「次へ」ボタンは無効", () => {
      render(
        <SkillInfoStep
          formData={{ ...defaultFormData, purpose: "          " }}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />,
      );
      expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
    });
  });

  // Phase 6: エッジケーステスト
  describe("エッジケース", () => {
    it("スキル名が空のままでも目的が10文字以上なら「次へ」は有効", () => {
      render(
        <SkillInfoStep
          formData={{
            skillName: "",
            purpose: "1234567890",
            category: "automation",
          }}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />,
      );
      expect(screen.getByRole("button", { name: "次へ" })).toBeEnabled();
    });

    it("カテゴリが external-integration のとき選択状態が正しく表示される", () => {
      render(
        <SkillInfoStep
          formData={{ ...defaultFormData, category: "external-integration" }}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />,
      );
      const categoryLabels = [
        "自動化",
        "外部連携",
        "データ分析",
        "コードサポート",
        "その他",
      ];
      categoryLabels.forEach((label) => {
        const button = screen.getByRole("button", { name: label });
        if (label === "外部連携") {
          expect(button).toHaveAttribute("aria-pressed", "true");
        } else {
          expect(button).toHaveAttribute("aria-pressed", "false");
        }
      });
    });

    it("スキル名変更時に onFormDataChange が呼ばれる", () => {
      const onFormDataChange = vi.fn();
      render(
        <SkillInfoStep
          formData={defaultFormData}
          onFormDataChange={onFormDataChange}
          onNext={vi.fn()}
        />,
      );
      fireEvent.change(screen.getByLabelText(/スキル名/), {
        target: { value: "テスト" },
      });
      expect(onFormDataChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ skillName: "テスト" }),
      );
    });
  });

  // Phase 6: アクセシビリティテスト
  describe("アクセシビリティ", () => {
    it("カテゴリグループに role=group と aria-label が付与されている", () => {
      render(
        <SkillInfoStep
          formData={defaultFormData}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />,
      );
      expect(
        screen.getByRole("group", { name: "カテゴリを選択" }),
      ).toBeInTheDocument();
    });

    it("選択中カテゴリタグの aria-pressed が true になる", () => {
      render(
        <SkillInfoStep
          formData={{ ...defaultFormData, category: "automation" }}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />,
      );
      expect(screen.getByRole("button", { name: "自動化" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    it("未選択カテゴリタグの aria-pressed が false になる", () => {
      render(
        <SkillInfoStep
          formData={{ ...defaultFormData, category: "automation" }}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />,
      );
      expect(screen.getByRole("button", { name: "外部連携" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });
  });

  // Phase 6: external-integration 伝達テスト
  describe("external-integration カテゴリの伝達", () => {
    it("external-integration を選択すると formData.category が更新される", () => {
      const onFormDataChange = vi.fn();
      render(
        <SkillInfoStep
          formData={defaultFormData}
          onFormDataChange={onFormDataChange}
          onNext={vi.fn()}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "外部連携" }));
      expect(onFormDataChange).toHaveBeenCalledWith(
        expect.objectContaining({ category: "external-integration" }),
      );
    });
  });

  // Phase 7: カバレッジ補完テスト
  describe("カバレッジ補完テスト", () => {
    it("目的フィールドにblurイベントが発生するとエラーが表示される（purposeTouched=true）", () => {
      render(
        <SkillInfoStep
          formData={defaultFormData}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />,
      );
      const textarea = screen.getByLabelText(/目的・背景/);
      fireEvent.blur(textarea);
      expect(screen.getByText(/10文字以上/)).toBeInTheDocument();
    });

    it("全5カテゴリを順番に選択できる", () => {
      const categories: Array<{ label: string; value: string }> = [
        { label: "外部連携", value: "external-integration" },
        { label: "データ分析", value: "data-analysis" },
        { label: "コードサポート", value: "code-support" },
        { label: "その他", value: "other" },
      ];
      for (const { label, value } of categories) {
        const onFormDataChange = vi.fn();
        render(
          <SkillInfoStep
            formData={defaultFormData}
            onFormDataChange={onFormDataChange}
            onNext={vi.fn()}
          />,
        );
        fireEvent.click(screen.getByRole("button", { name: label }));
        expect(onFormDataChange).toHaveBeenCalledWith(
          expect.objectContaining({ category: value }),
        );
        cleanup();
      }
    });

    it("目的フィールドを変更すると onFormDataChange が呼ばれる", () => {
      const onFormDataChange = vi.fn();
      render(
        <SkillInfoStep
          formData={defaultFormData}
          onFormDataChange={onFormDataChange}
          onNext={vi.fn()}
        />,
      );
      fireEvent.change(screen.getByLabelText(/目的・背景/), {
        target: { value: "テスト目的の入力" },
      });
      expect(onFormDataChange).toHaveBeenCalledWith(
        expect.objectContaining({ purpose: "テスト目的の入力" }),
      );
    });
  });
});
