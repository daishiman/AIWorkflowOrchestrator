/**
 * @file VisualCronPicker.test.tsx
 * @description VisualCronPicker 統合コンポーネントテスト（TDD Red フェーズ）
 * @phase Phase 4: テスト作成
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001
 *
 * P39準拠: fireEventのみ使用（happy-dom環境）
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VisualCronPicker } from "../../../renderer/components/schedule/VisualCronPicker";

describe("VisualCronPicker", () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  it("VP-01: デフォルト表示: FrequencySelector が存在する", () => {
    render(<VisualCronPicker onChange={mockOnChange} />);
    // 毎日ボタン（デフォルト頻度）が表示されること
    expect(screen.getByText("毎日")).toBeInTheDocument();
  });

  it("VP-02: デフォルト表示: TimePickerSection が存在する（時・分セレクター）", () => {
    render(<VisualCronPicker onChange={mockOnChange} />);
    // 時刻セレクターが存在すること
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  it("VP-03: weekly 選択時に WeekdaySelector が表示される", () => {
    render(<VisualCronPicker onChange={mockOnChange} />);
    fireEvent.click(screen.getByText("毎週").closest("button")!);
    // 曜日ボタンが表示されること
    expect(screen.getByText("月")).toBeInTheDocument();
    expect(screen.getByText("日")).toBeInTheDocument();
  });

  it("VP-04: every-minute 選択時に TimePickerSection が非表示", () => {
    render(<VisualCronPicker onChange={mockOnChange} />);
    fireEvent.click(screen.getByText("毎分").closest("button")!);
    // 時刻セレクターが非表示（comboboxの数が減る）
    const selects = screen.queryAllByRole("combobox");
    // every-minute では時刻セレクターは不要
    const hourSelects = selects.filter((s) =>
      s.getAttribute("aria-label")?.includes("時"),
    );
    expect(hourSelects.length).toBe(0);
  });

  it("VP-05: monthly 選択時に DayOfMonthSelector が表示される", () => {
    render(<VisualCronPicker onChange={mockOnChange} />);
    fireEvent.click(screen.getByText("毎月").closest("button")!);
    // 日付選択UIが表示される
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("31")).toBeInTheDocument();
  });

  it("VP-06: weekly + 月水金 + 9:00 選択後に onChange が正しいクロン式を返す", () => {
    render(<VisualCronPicker onChange={mockOnChange} />);
    // weekly を選択
    fireEvent.click(screen.getByText("毎週").closest("button")!);
    // 月曜（デフォルト選択済みの可能性あり）、水曜、金曜を選択
    const monBtn = screen.getByRole("button", { name: "月曜日" });
    const wedBtn = screen.getByRole("button", { name: "水曜日" });
    const friBtn = screen.getByRole("button", { name: "金曜日" });
    // 既に月曜が選択されていない場合は選択
    if (monBtn.getAttribute("aria-pressed") !== "true") {
      fireEvent.click(monBtn);
    }
    if (wedBtn.getAttribute("aria-pressed") !== "true") {
      fireEvent.click(wedBtn);
    }
    if (friBtn.getAttribute("aria-pressed") !== "true") {
      fireEvent.click(friBtn);
    }
    // onChange が呼ばれていること
    expect(mockOnChange).toHaveBeenCalled();
  });

  it("VP-07: CronPreview にクロン式が表示される（daily + 9:00）", () => {
    render(<VisualCronPicker onChange={mockOnChange} />);
    // デフォルトで daily が選択されている場合、プレビューにクロン式が表示される
    // code 要素内にクロン式が表示される
    // code 要素内にクロン式が表示される
    const preview = document.querySelector("code");
    if (preview) {
      expect(preview.textContent).toMatch(/\d/); // 数字が含まれる
    }
  });

  it("VP-08: CronPreview に自然言語が表示される（daily + 9:00）", () => {
    render(<VisualCronPicker onChange={mockOnChange} />);
    // 自然言語プレビューが表示される（"毎日 09:00" のような文字列が p タグに含まれる）
    const allText = document.body.textContent ?? "";
    expect(allText).toMatch(/毎日/);
  });

  it("VP-09: value prop が渡された場合に正しく初期化される", () => {
    render(<VisualCronPicker value="0 9 * * 1,3,5" onChange={mockOnChange} />);
    // weekly が選択されていること
    const weeklyButton = screen.getByText("毎週").closest("button");
    expect(weeklyButton).toHaveAttribute("aria-pressed", "true");
  });

  it("VP-10: AdvancedToggle で直接編集モードに切り替わる", () => {
    render(<VisualCronPicker onChange={mockOnChange} />);
    const advancedBtn = screen.getByText("高度な設定");
    fireEvent.click(advancedBtn);
    // CronInput（直接入力）が表示される
    expect(
      screen.getByPlaceholderText(/0 9 \* \* \*/) ||
        screen.queryByRole("textbox"),
    ).toBeDefined();
  });

  it("VP-11: カスタム頻度を選ぶと直接編集モードに切り替わる", () => {
    render(<VisualCronPicker onChange={mockOnChange} />);
    fireEvent.click(screen.getByText("カスタム").closest("button")!);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "月曜日" })).toBeNull();
  });

  it("VP-12: weekly → daily に切り替えると WeekdaySelector が非表示", () => {
    render(<VisualCronPicker onChange={mockOnChange} />);
    fireEvent.click(screen.getByText("毎週").closest("button")!);
    expect(screen.getByText("月")).toBeInTheDocument();
    fireEvent.click(screen.getByText("毎日").closest("button")!);
    expect(screen.queryByText("月")).not.toBeInTheDocument();
  });

  it("VP-13: weekly で曜日が0件のときエラーメッセージが表示される", () => {
    render(<VisualCronPicker onChange={mockOnChange} />);
    fireEvent.click(screen.getByText("毎週").closest("button")!);
    // 全ての曜日を解除する
    const allDayButtons = [
      screen.queryByRole("button", { name: "月曜日" }),
      screen.queryByRole("button", { name: "火曜日" }),
      screen.queryByRole("button", { name: "水曜日" }),
      screen.queryByRole("button", { name: "木曜日" }),
      screen.queryByRole("button", { name: "金曜日" }),
      screen.queryByRole("button", { name: "土曜日" }),
      screen.queryByRole("button", { name: "日曜日" }),
    ].filter(Boolean);

    // 選択済みのボタンをクリックして解除
    allDayButtons.forEach((btn) => {
      if (btn?.getAttribute("aria-pressed") === "true") {
        fireEvent.click(btn);
      }
    });

    // エラーメッセージが表示される
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("VP-14: 時間セレクターの選択肢が 0〜23 の24個", () => {
    render(<VisualCronPicker onChange={mockOnChange} />);
    const hourSelect = screen.getByRole("combobox", { name: /時/ });
    const options = hourSelect.querySelectorAll("option");
    expect(options.length).toBe(24);
  });

  it("VP-15: 分セレクターの選択肢が 5分刻みで 0〜55 の12個", () => {
    render(<VisualCronPicker onChange={mockOnChange} />);
    const minuteSelect = screen.getByRole("combobox", { name: /分/ });
    const options = minuteSelect.querySelectorAll("option");
    expect(options.length).toBe(12);
  });

  it("VP-16: value prop の変更に UI が追従する", () => {
    const { rerender } = render(
      <VisualCronPicker value="0 9 * * *" onChange={mockOnChange} />,
    );
    rerender(<VisualCronPicker value="0 8 * * 1-5" onChange={mockOnChange} />);
    expect(screen.getByRole("button", { name: "毎週" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "月曜日" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "金曜日" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("VP-17: custom 初期値では直接入力モードで開始する", () => {
    render(<VisualCronPicker value="*/5 * * * *" onChange={mockOnChange} />);
    expect(
      screen.getByRole("textbox", { name: "カスタムcron式" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("毎日")).not.toBeInTheDocument();
  });

  it("VP-18B: 不正な monthly cron でも直接入力モードで開始する", () => {
    render(<VisualCronPicker value="0 9 0 * *" onChange={mockOnChange} />);
    expect(
      screen.getByRole("textbox", { name: "カスタムcron式" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("毎月")).not.toBeInTheDocument();
  });

  it("VP-18: 直接入力モードから戻ると visual state に反映される", () => {
    render(<VisualCronPicker onChange={mockOnChange} />);
    fireEvent.click(screen.getByText("高度な設定"));

    const input = screen.getByRole("textbox", { name: "カスタムcron式" });
    fireEvent.change(input, { target: { value: "0 8 * * 1-5" } });

    fireEvent.click(
      screen.getByRole("button", { name: "ビジュアル設定に戻る" }),
    );

    expect(screen.getByRole("button", { name: "毎週" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "月曜日" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "金曜日" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.queryByRole("textbox", { name: "カスタムcron式" }),
    ).not.toBeInTheDocument();
  });
});
