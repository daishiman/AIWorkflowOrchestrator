/**
 * @file SkillInfoStep.test.tsx
 * @description SkillInfoStep コンポーネント ユニットテスト
 * @phase Phase 4+6+7: テスト作成・拡充・カバレッジ補完（TDD: Red -> Green）
 * @task UT-SKILL-WIZARD-W1-par-02a
 *
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 */

import { describe, it, expect, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
} from "@testing-library/react";
import { SkillInfoStep } from "../SkillInfoStep";
import type { SkillInfoFormData } from "@repo/shared/types/skillCreator";

const defaultFormData: SkillInfoFormData = {
  skillName: "",
  purpose: "",
  category: [],
};

const CATEGORY_EXPECTATIONS = [
  {
    value: "automation",
    label: "自動化",
    icon: "⚡",
    title: "繰り返し作業の自動化・スケジュール実行などのスキル",
  },
  {
    value: "external-integration",
    label: "外部連携",
    icon: "🔗",
    title: "外部API・Webhookなど外部サービスと連携するスキル",
  },
  {
    value: "data-analysis",
    label: "データ分析",
    icon: "📊",
    title: "データの集計・分析・可視化を行うスキル",
  },
  {
    value: "code-support",
    label: "コードサポート",
    icon: "💻",
    title: "コードレビュー・生成・リファクタリングを支援するスキル",
  },
  {
    value: "other",
    label: "その他",
    icon: "📦",
    title: "上記カテゴリに当てはまらないスキル",
  },
] as const;

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

    it("カテゴリが未選択（空配列）のとき「次へ」ボタンは無効", () => {
      render(
        <SkillInfoStep
          formData={{
            ...defaultFormData,
            purpose: "1234567890",
            category: [],
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
            category: ["automation"],
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
        expect.objectContaining({ category: ["external-integration"] }),
      );
    });

    it("選択中のカテゴリを再クリックすると onFormDataChange が呼ばれトグル解除される", () => {
      const onFormDataChange = vi.fn();
      render(
        <SkillInfoStep
          formData={{ ...defaultFormData, category: ["automation"] }}
          onFormDataChange={onFormDataChange}
          onNext={vi.fn()}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      expect(onFormDataChange).toHaveBeenCalledWith(
        expect.objectContaining({ category: [] }),
      );
    });

    it("複数カテゴリ選択時に1つだけ解除しても残りの選択は維持される", () => {
      const onFormDataChange = vi.fn();
      render(
        <SkillInfoStep
          formData={{
            ...defaultFormData,
            category: ["automation", "external-integration"],
          }}
          onFormDataChange={onFormDataChange}
          onNext={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "外部連携" }));

      expect(onFormDataChange).toHaveBeenCalledWith(
        expect.objectContaining({ category: ["automation"] }),
      );
    });

    it("選択中のカテゴリタグに aria-pressed=true が付与される", () => {
      render(
        <SkillInfoStep
          formData={{ ...defaultFormData, category: ["external-integration"] }}
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
            category: ["automation"],
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
            category: ["automation"],
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
            category: ["automation"],
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
          formData={{ ...defaultFormData, category: ["external-integration"] }}
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
          formData={{ ...defaultFormData, category: ["automation"] }}
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
          formData={{ ...defaultFormData, category: ["automation"] }}
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
        expect.objectContaining({ category: ["external-integration"] }),
      );
    });
  });

  describe("カテゴリアイコン・ツールチップ・A11y", () => {
    it.each(CATEGORY_EXPECTATIONS)(
      "%s ボタンが icon / title / a11y を正しく持つ",
      ({ label, icon, title }) => {
        render(
          <SkillInfoStep
            formData={defaultFormData}
            onFormDataChange={vi.fn()}
            onNext={vi.fn()}
          />,
        );
        const button = screen.getByRole("button", { name: label });
        expect(button).toHaveAccessibleName(label);
        expect(button).toHaveAttribute("title", title);
        expect(within(button).getByText(icon)).toHaveAttribute(
          "aria-hidden",
          "true",
        );
      },
    );

    it("全5カテゴリのボタンが個別の icon と title を持つ", () => {
      render(
        <SkillInfoStep
          formData={defaultFormData}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />,
      );
      const expectations = CATEGORY_EXPECTATIONS.map(({ label, icon }) => {
        const button = screen.getByRole("button", { name: label });
        return {
          label,
          icon: within(button).getByText(icon),
          title: button.getAttribute("title"),
        };
      });

      expectations.forEach(({ label, icon, title }) => {
        expect(icon).toHaveAttribute("aria-hidden", "true");
        expect(title).toBe(
          CATEGORY_EXPECTATIONS.find((entry) => entry.label === label)?.title,
        );
      });
    });

    it("aria-pressed は選択中のカテゴリだけ true になる", () => {
      render(
        <SkillInfoStep
          formData={{ ...defaultFormData, category: ["external-integration"] }}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />,
      );
      CATEGORY_EXPECTATIONS.forEach(({ label, value }) => {
        const button = screen.getByRole("button", { name: label });
        expect(button).toHaveAttribute(
          "aria-pressed",
          value === "external-integration" ? "true" : "false",
        );
      });
    });
  });

  // Phase 6: エッジケーステスト（TC-EC）
  describe("カテゴリ選択エッジケース", () => {
    it("formData.category が空配列のとき全ボタンが aria-pressed='false' であること", () => {
      render(
        <SkillInfoStep
          formData={defaultFormData}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />,
      );
      CATEGORY_EXPECTATIONS.forEach(({ label }) => {
        expect(screen.getByRole("button", { name: label })).toHaveAttribute(
          "aria-pressed",
          "false",
        );
      });
    });
  });

  // Phase 6: A11y深掘りテスト（TC-A2）
  describe("A11y 深掘り（aria-label / title 整合）", () => {
    it("aria-label がカテゴリ名と一致し説明文を含まないこと（全5カテゴリ）", () => {
      render(
        <SkillInfoStep
          formData={defaultFormData}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />,
      );
      const expected = [
        { label: "自動化" },
        { label: "外部連携" },
        { label: "データ分析" },
        { label: "コードサポート" },
        { label: "その他" },
      ];
      expected.forEach(({ label }) => {
        const btn = screen.getByRole("button", { name: label });
        expect(btn.getAttribute("aria-label")).toBe(label);
      });
    });

    it("title が説明文を含むこと（全5カテゴリ）", () => {
      render(
        <SkillInfoStep
          formData={defaultFormData}
          onFormDataChange={vi.fn()}
          onNext={vi.fn()}
        />,
      );
      const labels = [
        "自動化",
        "外部連携",
        "データ分析",
        "コードサポート",
        "その他",
      ];
      labels.forEach((label) => {
        const btn = screen.getByRole("button", { name: label });
        const title = btn.getAttribute("title");
        expect(title).toBeTruthy();
        expect(title!.length).toBeGreaterThan(5);
      });
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
          expect.objectContaining({ category: [value] }),
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

// TASK-SW-UI-POLISH-001: カテゴリ選択上限・アニメーション追加テスト（TC-02〜TC-06, TC-10〜TC-18）
describe("TASK-SW-UI-POLISH-001 カテゴリ選択上限（MAX_CATEGORY_COUNT = 3）", () => {
  const threeCategories = [
    "automation",
    "external-integration",
    "data-analysis",
  ] as const;

  it("TC-02: 3件選択済みの状態で4件目のカテゴリをクリックしても onFormDataChange が呼ばれない", () => {
    const onFormDataChange = vi.fn();
    render(
      <SkillInfoStep
        formData={{
          ...defaultFormData,
          category: [...threeCategories],
        }}
        onFormDataChange={onFormDataChange}
        onNext={vi.fn()}
      />,
    );
    // 未選択ボタン（disabled）をクリック → onFormDataChange が呼ばれないはず
    fireEvent.click(screen.getByRole("button", { name: "コードサポート" }));
    expect(onFormDataChange).not.toHaveBeenCalled();
  });

  it("TC-03: 上限到達後に未選択ボタンが disabled になる", () => {
    render(
      <SkillInfoStep
        formData={{
          ...defaultFormData,
          category: [...threeCategories],
        }}
        onFormDataChange={vi.fn()}
        onNext={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "コードサポート" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "その他" })).toBeDisabled();
  });

  it("TC-04: 上限到達後に選択済みカテゴリを解除すると onFormDataChange が2件のカテゴリで呼ばれる", () => {
    const onFormDataChange = vi.fn();
    render(
      <SkillInfoStep
        formData={{
          ...defaultFormData,
          category: [...threeCategories],
        }}
        onFormDataChange={onFormDataChange}
        onNext={vi.fn()}
      />,
    );
    // 選択済みの「自動化」を解除
    fireEvent.click(screen.getByRole("button", { name: "自動化" }));
    expect(onFormDataChange).toHaveBeenCalledWith(
      expect.objectContaining({
        category: expect.arrayContaining([
          "external-integration",
          "data-analysis",
        ]),
      }),
    );
    const lastCall = onFormDataChange.mock.calls[0][0];
    expect(lastCall.category).toHaveLength(2);
  });

  it("TC-05: 上限未到達時に選択済みカテゴリを解除できる（回帰）", () => {
    const onFormDataChange = vi.fn();
    render(
      <SkillInfoStep
        formData={{ ...defaultFormData, category: ["automation"] }}
        onFormDataChange={onFormDataChange}
        onNext={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "自動化" }));
    expect(onFormDataChange).toHaveBeenCalledWith(
      expect.objectContaining({ category: [] }),
    );
  });

  it("TC-06: カテゴリボタンに transition-all / duration-200 クラスが含まれる", () => {
    render(
      <SkillInfoStep
        formData={defaultFormData}
        onFormDataChange={vi.fn()}
        onNext={vi.fn()}
      />,
    );
    const categoryButton = screen.getByRole("button", { name: "自動化" });
    expect(categoryButton.className).toContain("transition-all");
    expect(categoryButton.className).toContain("duration-200");
  });

  it("初期状態（0件選択）で全ボタンが有効", () => {
    render(
      <SkillInfoStep
        formData={{ ...defaultFormData, category: [] }}
        onFormDataChange={vi.fn()}
        onNext={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "自動化" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "外部連携" })).not.toBeDisabled();
    expect(
      screen.getByRole("button", { name: "データ分析" }),
    ).not.toBeDisabled();
    expect(
      screen.getByRole("button", { name: "コードサポート" }),
    ).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "その他" })).not.toBeDisabled();
  });
});

// TC-10〜TC-13: カテゴリ上限エッジケース（Phase 6: テスト拡充）
describe("TASK-SW-UI-POLISH-001 カテゴリ上限エッジケース（TC-10〜TC-13）", () => {
  const threeCategories = [
    "automation",
    "external-integration",
    "data-analysis",
  ] as const;

  it("TC-10: 初期状態（0件）で全ボタンが enabled", () => {
    render(
      <SkillInfoStep
        formData={{ ...defaultFormData, category: [] }}
        onFormDataChange={vi.fn()}
        onNext={vi.fn()}
      />,
    );
    ["自動化", "外部連携", "データ分析", "コードサポート", "その他"].forEach(
      (label) => {
        expect(screen.getByRole("button", { name: label })).not.toBeDisabled();
      },
    );
  });

  it("TC-11: 1件選択→解除のサイクルで正しく更新される", () => {
    const onFormDataChange = vi.fn();
    render(
      <SkillInfoStep
        formData={{ ...defaultFormData, category: ["automation"] }}
        onFormDataChange={onFormDataChange}
        onNext={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "自動化" }));
    expect(onFormDataChange).toHaveBeenCalledWith(
      expect.objectContaining({ category: [] }),
    );
  });

  it("TC-12: 3件選択→1件解除で onFormDataChange が2件で呼ばれる", () => {
    const onFormDataChange = vi.fn();
    render(
      <SkillInfoStep
        formData={{
          ...defaultFormData,
          category: [...threeCategories],
        }}
        onFormDataChange={onFormDataChange}
        onNext={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "データ分析" }));
    const lastCall = onFormDataChange.mock.calls[0][0];
    expect(lastCall.category).toHaveLength(2);
  });

  it("TC-13: 上限到達時に選択済みカテゴリは disabled でない（解除可能）", () => {
    render(
      <SkillInfoStep
        formData={{
          ...defaultFormData,
          category: [...threeCategories],
        }}
        onFormDataChange={vi.fn()}
        onNext={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "自動化" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "外部連携" })).not.toBeDisabled();
    expect(
      screen.getByRole("button", { name: "データ分析" }),
    ).not.toBeDisabled();
  });
});

// TC-17〜TC-18: 回帰ガード（Phase 6）
describe("TASK-SW-UI-POLISH-001 回帰ガード（TC-17〜TC-18）", () => {
  it("TC-17: 既存の選択→解除フローが壊れていない（上限未到達）", () => {
    const onFormDataChange = vi.fn();
    render(
      <SkillInfoStep
        formData={{ ...defaultFormData, category: [] }}
        onFormDataChange={onFormDataChange}
        onNext={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "自動化" }));
    expect(onFormDataChange).toHaveBeenCalledWith(
      expect.objectContaining({ category: ["automation"] }),
    );
  });

  it("TC-18: onFormDataChange が category 以外のフィールドを変えない", () => {
    const onFormDataChange = vi.fn();
    render(
      <SkillInfoStep
        formData={{
          skillName: "テストスキル",
          purpose: "テスト目的テスト目的",
          category: [],
        }}
        onFormDataChange={onFormDataChange}
        onNext={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "自動化" }));
    expect(onFormDataChange).toHaveBeenCalledWith(
      expect.objectContaining({
        skillName: "テストスキル",
        purpose: "テスト目的テスト目的",
        category: ["automation"],
      }),
    );
  });
});
