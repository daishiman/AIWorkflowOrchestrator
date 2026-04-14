/**
 * @file VisualCronPicker.validation.test.tsx
 * @description VisualCronPicker UIバリデーションテスト
 * @phase Phase 4: テスト作成（TDD Red） / Phase 6: テスト拡充
 * @task TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001
 *
 * P39準拠: fireEventのみ使用（happy-dom環境）
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VisualCronPicker } from "../../../renderer/components/schedule/VisualCronPicker";

describe("VisualCronPicker - UIバリデーション", () => {
  // --- weekly 空曜日バリデーション ---

  describe("週次（weekly）空曜日バリデーション", () => {
    it("VAL-W-01: weekly + 月曜日選択済みでレンダリングするとエラーメッセージが DOM に存在しない", () => {
      render(<VisualCronPicker value="0 9 * * 1" onChange={() => {}} />);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("VAL-W-02: weekly + 月曜日を解除して空曜日にすると onValidationChange が false で呼ばれる", () => {
      const onValidationChange = vi.fn();
      render(
        <VisualCronPicker
          value="0 9 * * 1"
          onChange={() => {}}
          onValidationChange={onValidationChange}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "月曜日" }));
      expect(onValidationChange).toHaveBeenLastCalledWith(false);
    });

    it("VAL-W-03: weekly + 空曜日から月曜日を再選択するとエラーメッセージが消え、true コールバックが呼ばれる", () => {
      const onValidationChange = vi.fn();
      render(
        <VisualCronPicker
          value="0 9 * * 1"
          onChange={() => {}}
          onValidationChange={onValidationChange}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "月曜日" }));
      fireEvent.click(screen.getByRole("button", { name: "月曜日" }));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(onValidationChange).toHaveBeenLastCalledWith(true);
    });
  });

  // --- monthly 日付バリデーション ---

  describe("月次（monthly）日付バリデーション", () => {
    it("VAL-M-01: monthly + 最小範囲外（0）でレンダリングするとエラーメッセージが DOM に存在する", () => {
      render(<VisualCronPicker value="0 9 0 * *" onChange={() => {}} />);
      expect(
        screen.getByText(/日付は1〜31の範囲で入力してください/),
      ).toBeInTheDocument();
    });

    it("VAL-M-02: monthly + 最大範囲外（32）でレンダリングするとエラーメッセージが DOM に存在する", () => {
      render(<VisualCronPicker value="0 9 32 * *" onChange={() => {}} />);
      expect(
        screen.getByText(/日付は1〜31の範囲で入力してください/),
      ).toBeInTheDocument();
    });

    it("VAL-M-03: monthly + 有効な日付（15）でレンダリングするとエラーメッセージが存在しない", () => {
      render(<VisualCronPicker value="0 9 15 * *" onChange={() => {}} />);
      expect(
        screen.queryByText(/日付は1〜31の範囲で入力してください/),
      ).not.toBeInTheDocument();
    });

    it("VAL-M-04: monthly + 無効日付で onValidationChange が false で呼ばれる", () => {
      const onValidationChange = vi.fn();
      render(
        <VisualCronPicker
          value="0 9 0 * *"
          onChange={() => {}}
          onValidationChange={onValidationChange}
        />,
      );
      expect(onValidationChange).toHaveBeenLastCalledWith(false);
    });
  });

  // --- コールバックなしの動作確認 ---

  describe("onValidationChange なし", () => {
    it("VAL-CB-01: onValidationChange を渡さなくてもエラーなく動作する", () => {
      expect(() => {
        render(<VisualCronPicker value="0 9 * * 1" onChange={() => {}} />);
      }).not.toThrow();
    });
  });

  // --- 境界値テスト（Phase 6 拡充） ---

  describe("月次（monthly）dayOfMonth 境界値テスト", () => {
    it("EXP-B-01: 最小有効値（1）でエラーメッセージが存在しない", () => {
      render(<VisualCronPicker value="0 9 1 * *" onChange={() => {}} />);
      expect(
        screen.queryByText(/日付は1〜31の範囲で入力してください/),
      ).not.toBeInTheDocument();
    });

    it("EXP-B-02: 最大有効値（31）でエラーメッセージが存在しない", () => {
      render(<VisualCronPicker value="0 9 31 * *" onChange={() => {}} />);
      expect(
        screen.queryByText(/日付は1〜31の範囲で入力してください/),
      ).not.toBeInTheDocument();
    });

    it("EXP-B-03: 最小有効値の1つ下（0）でエラーメッセージが存在する", () => {
      render(<VisualCronPicker value="0 9 0 * *" onChange={() => {}} />);
      expect(
        screen.getByText(/日付は1〜31の範囲で入力してください/),
      ).toBeInTheDocument();
    });

    it("EXP-B-04: 最大有効値の1つ上（32）でエラーメッセージが存在する", () => {
      render(<VisualCronPicker value="0 9 32 * *" onChange={() => {}} />);
      expect(
        screen.getByText(/日付は1〜31の範囲で入力してください/),
      ).toBeInTheDocument();
    });
  });

  // --- 複合ケーステスト（Phase 6 拡充） ---

  describe("週次（weekly）複合ケース", () => {
    it("EXP-C-01: 月曜日を解除して空曜日にするとエラーメッセージが再表示される", () => {
      const onValidationChange = vi.fn();
      render(
        <VisualCronPicker
          value="0 9 * * 1"
          onChange={() => {}}
          onValidationChange={onValidationChange}
        />,
      );
      const mondayButton = screen.getByRole("button", { name: "月曜日" });
      fireEvent.click(mondayButton);
      expect(
        screen.getByText(/曜日を1つ以上選択してください/),
      ).toBeInTheDocument();
      expect(onValidationChange).toHaveBeenLastCalledWith(false);
    });
  });

  // --- アクセシビリティテスト（Phase 6 拡充） ---

  describe('アクセシビリティ: role="alert" 属性', () => {
    it('EXP-A-01: weekly エラー要素に role="alert" が付与されている', () => {
      render(<VisualCronPicker value="0 9 * * 1" onChange={() => {}} />);
      fireEvent.click(screen.getByRole("button", { name: "月曜日" }));
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it('EXP-A-02: monthly エラー要素に role="alert" が付与されている', () => {
      render(<VisualCronPicker value="0 9 0 * *" onChange={() => {}} />);
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  // --- コールバック呼び出し回数テスト（Phase 6 拡充） ---

  describe("onValidationChange コールバック呼び出し回数", () => {
    it("EXP-CB-01: 初回レンダリングで onValidationChange が1回だけ呼ばれる", () => {
      const onValidationChange = vi.fn();
      render(
        <VisualCronPicker
          value="0 9 0 * *"
          onChange={() => {}}
          onValidationChange={onValidationChange}
        />,
      );
      expect(onValidationChange).toHaveBeenCalledTimes(1);
      expect(onValidationChange).toHaveBeenCalledWith(false);
    });

    it("EXP-CB-02: monthly 無効状態から毎日へ切り替えると合計2回呼ばれ、最後は true で呼ばれる", () => {
      // 開始: monthly + dayOfMonth=0（無効）→ onValidationChange(false)
      // 切替: 毎日 → monthlyError=false, isFormValid=true → onValidationChange(true)
      const onValidationChange = vi.fn();
      render(
        <VisualCronPicker
          value="0 9 0 * *"
          onChange={() => {}}
          onValidationChange={onValidationChange}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "毎日" }));
      expect(onValidationChange).toHaveBeenCalledTimes(2);
      expect(onValidationChange).toHaveBeenLastCalledWith(true);
    });
  });
});
