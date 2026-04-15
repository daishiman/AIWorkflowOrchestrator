/**
 * @file VisualCronPicker.customValidation.test.tsx
 * @description direct input / custom cron モードへの月次バリデーションテスト
 * @phase Phase 4: テスト作成（TDD Red） / Phase 6: テスト拡充
 * @task TASK-CRON-CUSTOM-VALIDATION-001
 *
 * テストケース CV-01〜CV-20
 * AC-1〜AC-8 の全受け入れ基準を網羅する
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VisualCronPicker } from "../../../renderer/components/schedule/VisualCronPicker";

const renderPicker = (
  value: string,
  onValidationChange?: (valid: boolean) => void,
) => {
  return render(
    <VisualCronPicker
      value={value}
      onValidationChange={onValidationChange}
      onChange={() => {}}
    />,
  );
};

const openDirectInputMode = () => {
  const toggleButton = screen.queryByRole("button", { name: "高度な設定" });
  if (toggleButton) {
    fireEvent.click(toggleButton);
  }
};

const getDirectInputTextbox = () =>
  screen.getByRole("textbox", { name: "カスタムcron式" });

const changeDirectInput = (value: string) => {
  fireEvent.change(getDirectInputTextbox(), { target: { value } });
};

const expectDirectInputError = (message: string) => {
  const alert = screen.getByRole("alert");
  expect(alert).toHaveTextContent(message);
  const input = getDirectInputTextbox();
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(input).toHaveAttribute("aria-describedby", "direct-input-error");
};

const expectDirectInputValid = () => {
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  const input = getDirectInputTextbox();
  expect(input).toHaveAttribute("aria-invalid", "false");
  expect(input).not.toHaveAttribute("aria-describedby");
};

describe("VisualCronPicker - Custom Cron Validation (CV-01〜CV-12)", () => {
  // --- AC-1: 空文字 ---
  describe("CV-01: 空文字入力", () => {
    it("should show alert and call onValidationChange(false) for empty input", () => {
      const onValidationChange = vi.fn();
      renderPicker("", onValidationChange);
      openDirectInputMode();
      changeDirectInput("");
      expectDirectInputError("cron式を入力してください");
      expect(onValidationChange).toHaveBeenCalledWith(false);
    });
  });

  // --- AC-2: フィールド数不足 ---
  describe("CV-02: フィールド数不足（4フィールド）", () => {
    it("should show alert for 4-field cron expression", () => {
      const onValidationChange = vi.fn();
      renderPicker("0 9 * *", onValidationChange);
      openDirectInputMode();
      expectDirectInputError(
        "cron式は5つのフィールドが必要です（分 時 日 月 曜日）",
      );
      expect(onValidationChange).toHaveBeenCalledWith(false);
    });
  });

  // --- AC-3: day-of-month=0 ---
  describe("CV-03: day-of-month=0（下限範囲外）", () => {
    it("should show alert for day-of-month value of 0", () => {
      const onValidationChange = vi.fn();
      renderPicker("0 9 15 * *", onValidationChange);
      openDirectInputMode();
      changeDirectInput("0 9 0 * *");
      expectDirectInputError("日の値は1〜31の範囲で指定してください");
      expect(onValidationChange).toHaveBeenCalledWith(false);
    });
  });

  // --- AC-4: day-of-month=32 ---
  describe("CV-04: day-of-month=32（上限範囲外）", () => {
    it("should show alert for day-of-month value of 32", () => {
      const onValidationChange = vi.fn();
      renderPicker("0 9 15 * *", onValidationChange);
      openDirectInputMode();
      changeDirectInput("0 9 32 * *");
      expectDirectInputError("日の値は1〜31の範囲で指定してください");
      expect(onValidationChange).toHaveBeenCalledWith(false);
    });
  });

  // --- AC-5: 有効なcron式 ---
  describe("CV-05: 有効なcron式（日付指定）", () => {
    it("should not show alert for valid cron expression", () => {
      const onValidationChange = vi.fn();
      renderPicker("0 9 15 * *", onValidationChange);
      openDirectInputMode();
      expect(getDirectInputTextbox()).toHaveValue("0 9 15 * *");
      expectDirectInputValid();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });
  });

  describe("CV-06: every-minute（全フィールド*）", () => {
    it("should not show alert for every-minute cron", () => {
      const onValidationChange = vi.fn();
      renderPicker("* * * * *", onValidationChange);
      openDirectInputMode();
      expect(getDirectInputTextbox()).toHaveValue("* * * * *");
      expectDirectInputValid();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });
  });

  // --- AC-6: 非数値スキップ ---
  describe("CV-07: dom=*/2（ステップ値）", () => {
    it("should not show alert for step value in day-of-month", () => {
      const onValidationChange = vi.fn();
      renderPicker("0 9 */2 * *", onValidationChange);
      openDirectInputMode();
      expect(getDirectInputTextbox()).toHaveValue("0 9 */2 * *");
      expectDirectInputValid();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });
  });

  describe("CV-08: dom=1-15（区間指定）", () => {
    it("should not show alert for range in day-of-month", () => {
      const onValidationChange = vi.fn();
      renderPicker("0 9 1-15 * *", onValidationChange);
      openDirectInputMode();
      expect(getDirectInputTextbox()).toHaveValue("0 9 1-15 * *");
      expectDirectInputValid();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });
  });

  // --- AC-7: モード切替時のバリデーション再計算 ---
  describe("CV-09: visual→direct切り替え（初期値が有効なcron式）", () => {
    it("should preserve a valid cron value when switching from visual to direct mode", () => {
      const onValidationChange = vi.fn();
      render(
        <VisualCronPicker
          value="0 9 15 * *"
          onValidationChange={onValidationChange}
          onChange={() => {}}
        />,
      );
      openDirectInputMode();
      expect(getDirectInputTextbox()).toHaveValue("0 9 15 * *");
      expectDirectInputValid();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });
  });

  describe("CV-10: visual→direct切り替え（バリデーション再計算）", () => {
    it("should recalculate validation when direct input changes after mode switch", () => {
      const onValidationChange = vi.fn();
      render(
        <VisualCronPicker
          value="0 9 15 * *"
          onValidationChange={onValidationChange}
          onChange={() => {}}
        />,
      );
      openDirectInputMode();
      changeDirectInput("0 9 * *");
      expectDirectInputError(
        "cron式は5つのフィールドが必要です（分 時 日 月 曜日）",
      );
      expect(onValidationChange).toHaveBeenLastCalledWith(false);
    });
  });

  // --- AC-8: onValidationChange=undefined ---
  describe("CV-11: onValidationChange=undefined", () => {
    it("should render without error when onValidationChange is not provided", () => {
      expect(() => {
        renderPicker("0 9 15 * *", undefined);
      }).not.toThrow();
    });
  });

  // --- AC-1: 空白のみ ---
  describe("CV-12: 半角スペースのみ入力", () => {
    it("should show alert for whitespace-only input", () => {
      const onValidationChange = vi.fn();
      renderPicker("   ", onValidationChange);
      openDirectInputMode();
      changeDirectInput("   ");
      expectDirectInputError("cron式を入力してください");
      expect(onValidationChange).toHaveBeenCalledWith(false);
    });
  });
});

describe("VisualCronPicker - Custom Cron Validation Extended (CV-13〜CV-20)", () => {
  // --- 境界値テスト ---
  describe("境界値テスト", () => {
    it("CV-13: day-of-month=1（最小有効値）でエラーなし", () => {
      const onValidationChange = vi.fn();
      render(
        <VisualCronPicker
          value="0 9 1 * *"
          onValidationChange={onValidationChange}
          onChange={() => {}}
        />,
      );
      openDirectInputMode();
      expect(getDirectInputTextbox()).toHaveValue("0 9 1 * *");
      expectDirectInputValid();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });

    it("CV-14: day-of-month=31（最大有効値）でエラーなし", () => {
      const onValidationChange = vi.fn();
      render(
        <VisualCronPicker
          value="0 9 31 * *"
          onValidationChange={onValidationChange}
          onChange={() => {}}
        />,
      );
      openDirectInputMode();
      expect(getDirectInputTextbox()).toHaveValue("0 9 31 * *");
      expectDirectInputValid();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });
  });

  // --- 空白文字バリエーション ---
  describe("空白文字バリエーション", () => {
    it("CV-15: タブ文字のみ入力時にエラー表示", () => {
      const onValidationChange = vi.fn();
      render(
        <VisualCronPicker
          value={"\t"}
          onValidationChange={onValidationChange}
          onChange={() => {}}
        />,
      );
      openDirectInputMode();
      changeDirectInput("\t");
      expectDirectInputError("cron式を入力してください");
      expect(onValidationChange).toHaveBeenCalledWith(false);
    });

    it("CV-16: 複数スペース区切りでも有効なcron式として認識", () => {
      const onValidationChange = vi.fn();
      render(
        <VisualCronPicker
          value="0  9  15  *  *"
          onValidationChange={onValidationChange}
          onChange={() => {}}
        />,
      );
      openDirectInputMode();
      expect(getDirectInputTextbox()).toHaveValue("0 9 15 * *");
      expectDirectInputValid();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });
  });

  // --- 特殊フィールド ---
  describe("特殊フィールド", () => {
    it("CV-17: dom=1,15（カンマリスト）でエラーなし", () => {
      const onValidationChange = vi.fn();
      render(
        <VisualCronPicker
          value="0 9 1,15 * *"
          onValidationChange={onValidationChange}
          onChange={() => {}}
        />,
      );
      openDirectInputMode();
      expect(getDirectInputTextbox()).toHaveValue("0 9 1,15 * *");
      expectDirectInputValid();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });

    it("CV-18: dom=L（月末指定）でエラーなし", () => {
      const onValidationChange = vi.fn();
      render(
        <VisualCronPicker
          value="0 9 L * *"
          onValidationChange={onValidationChange}
          onChange={() => {}}
        />,
      );
      openDirectInputMode();
      expect(getDirectInputTextbox()).toHaveValue("0 9 L * *");
      expectDirectInputValid();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });
  });

  // --- エッジケース ---
  describe("エッジケース", () => {
    it("CV-19: 6フィールドcron式（秒付き）でエラー表示", () => {
      const onValidationChange = vi.fn();
      render(
        <VisualCronPicker
          value="0 0 9 15 * *"
          onValidationChange={onValidationChange}
          onChange={() => {}}
        />,
      );
      openDirectInputMode();
      expectDirectInputError(
        "cron式は5つのフィールドが必要です（分 時 日 月 曜日）",
      );
      expect(onValidationChange).toHaveBeenCalledWith(false);
    });

    it("CV-20: 先頭・末尾スペースありの有効cron式でエラーなし", () => {
      const onValidationChange = vi.fn();
      render(
        <VisualCronPicker
          value=" 0 9 15 * * "
          onValidationChange={onValidationChange}
          onChange={() => {}}
        />,
      );
      openDirectInputMode();
      expect(getDirectInputTextbox()).toHaveValue("0 9 15 * *");
      expectDirectInputValid();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });
  });
});
