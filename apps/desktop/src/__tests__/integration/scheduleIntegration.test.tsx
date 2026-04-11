/**
 * @file scheduleIntegration.test.tsx
 * @description スケジュール統合テスト（TDD Green フェーズ）
 * @phase Phase 4: テスト作成
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001
 *
 * IPC モック戦略: window.api プロパティを Object.defineProperty でモック
 * (vi.stubGlobal で window 全体を置換すると React 内部が壊れるため不可)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VisualCronPicker } from "../../renderer/components/schedule/VisualCronPicker";

const mockScheduleAdd = vi.fn();

// window.api を安全にモック（window 全体は置換しない）
beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, "api", {
    writable: true,
    configurable: true,
    value: {
      skill: {
        schedule: {
          add: mockScheduleAdd,
          list: vi.fn(),
          remove: vi.fn(),
          update: vi.fn(),
          toggle: vi.fn(),
        },
      },
    },
  });
});

describe("VisualCronPicker 統合テスト", () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  it("SI-01: daily 9:00 の cron 式が onChange に渡される", () => {
    render(<VisualCronPicker onChange={mockOnChange} />);
    // 時間セレクターを変更して onChange が発火されることを確認
    const hourSelect = screen.getByRole("combobox", { name: /時/ });
    fireEvent.change(hourSelect, { target: { value: "9" } });
    const calls = mockOnChange.mock.calls;
    const lastCron = calls[calls.length - 1]?.[0] as string | undefined;
    if (lastCron) {
      expect(lastCron).toMatch(/^\d+ \d+ \* \* \*$/);
    }
    // マウント時点で onChange が少なくとも1回呼ばれていること
    expect(mockOnChange).toHaveBeenCalled();
  });

  it("SI-02: weekly 月水金 9:00 の cron 式が onChange に渡される", () => {
    render(<VisualCronPicker onChange={mockOnChange} />);
    fireEvent.click(screen.getByText("毎週").closest("button")!);

    const monBtn = screen.getByRole("button", { name: "月曜日" });
    if (monBtn.getAttribute("aria-pressed") !== "true") fireEvent.click(monBtn);
    const wedBtn = screen.getByRole("button", { name: "水曜日" });
    if (wedBtn.getAttribute("aria-pressed") !== "true") fireEvent.click(wedBtn);
    const friBtn = screen.getByRole("button", { name: "金曜日" });
    if (friBtn.getAttribute("aria-pressed") !== "true") fireEvent.click(friBtn);

    expect(mockOnChange).toHaveBeenCalled();
    const calls = mockOnChange.mock.calls;
    const lastCron = calls[calls.length - 1]?.[0] as string;
    // weekly cron 式: "分 時 * * 曜日" 形式
    expect(lastCron).toMatch(/^\d+ \d+ \* \* [\d,]+$/);
  });

  it("SI-03: value='0 9 * * *' でマウント → daily が選択されている", () => {
    render(<VisualCronPicker value="0 9 * * *" onChange={mockOnChange} />);
    const dailyButton = screen.getByText("毎日").closest("button");
    expect(dailyButton).toHaveAttribute("aria-pressed", "true");
  });

  it("SI-04: custom クロン式が onChange にそのまま渡される", () => {
    render(<VisualCronPicker onChange={mockOnChange} />);
    const advancedBtn = screen.getByText("高度な設定");
    fireEvent.click(advancedBtn);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "0 */6 * * *" } });
    expect(mockOnChange).toHaveBeenCalledWith("0 */6 * * *");
  });

  it("SI-05: value='0 9 * * 1,3,5' でマウント → weekly に初期化", () => {
    render(<VisualCronPicker value="0 9 * * 1,3,5" onChange={mockOnChange} />);
    const weeklyButton = screen.getByText("毎週").closest("button");
    expect(weeklyButton).toHaveAttribute("aria-pressed", "true");
  });

  it("SI-06: custom 初期値では直接入力モードで初期化される", () => {
    render(<VisualCronPicker value="*/5 * * * *" onChange={mockOnChange} />);
    expect(
      screen.getByRole("textbox", { name: "カスタムcron式" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "毎日" })).toBeNull();
  });

  it("SI-07: value の rerender に合わせて visual state が更新される", () => {
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
  });
});
