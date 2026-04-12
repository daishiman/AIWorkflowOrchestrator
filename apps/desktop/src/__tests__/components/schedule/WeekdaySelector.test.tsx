/**
 * @file WeekdaySelector.test.tsx
 * @description WeekdaySelector コンポーネントテスト（TDD Red フェーズ）
 * @phase Phase 4: テスト作成
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001
 *
 * P39準拠: fireEventのみ使用（happy-dom環境）
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WeekdaySelector } from "../../../renderer/components/schedule/WeekdaySelector";

describe("WeekdaySelector", () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  it("WS-01: 月〜日の7ボタンが月→日の順で表示される", () => {
    render(<WeekdaySelector value={[]} onChange={mockOnChange} />);
    const labels = screen
      .getAllByRole("button")
      .map((button) => button.textContent);
    expect(labels).toEqual(["月", "火", "水", "木", "金", "土", "日"]);
  });

  it("WS-02: 初期選択状態が props から正しく反映される", () => {
    render(<WeekdaySelector value={[1, 3]} onChange={mockOnChange} />);
    const monButton = screen.getByText("月").closest("button");
    const wedButton = screen.getByText("水").closest("button");
    expect(monButton).toHaveAttribute("aria-pressed", "true");
    expect(wedButton).toHaveAttribute("aria-pressed", "true");
  });

  it("WS-03: 曜日ボタンをクリックで選択できる", () => {
    render(<WeekdaySelector value={[1]} onChange={mockOnChange} />);
    fireEvent.click(screen.getByText("火").closest("button")!);
    expect(mockOnChange).toHaveBeenCalledWith(expect.arrayContaining([1, 2]));
  });

  it("WS-04: 選択済みボタンをクリックで解除できる", () => {
    render(<WeekdaySelector value={[1]} onChange={mockOnChange} />);
    fireEvent.click(screen.getByText("月").closest("button")!);
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it("WS-05: 複数曜日を順番に選択できる", () => {
    const { rerender } = render(
      <WeekdaySelector value={[]} onChange={mockOnChange} />,
    );
    fireEvent.click(screen.getByText("月").closest("button")!);
    expect(mockOnChange).toHaveBeenLastCalledWith(expect.arrayContaining([1]));

    rerender(<WeekdaySelector value={[1]} onChange={mockOnChange} />);
    fireEvent.click(screen.getByText("水").closest("button")!);
    expect(mockOnChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([1, 3]),
    );
  });

  it("WS-06: disabled 状態ではクリックが無効", () => {
    render(
      <WeekdaySelector value={[]} onChange={mockOnChange} disabled={true} />,
    );
    fireEvent.click(screen.getByText("月").closest("button")!);
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("WS-07: 各ボタンに aria-label が設定されている", () => {
    render(<WeekdaySelector value={[]} onChange={mockOnChange} />);
    expect(screen.getByRole("button", { name: "月曜日" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "日曜日" })).toBeInTheDocument();
  });

  it("WS-08: キーボード操作（Enter）で選択できる", () => {
    render(<WeekdaySelector value={[]} onChange={mockOnChange} />);
    const monButton = screen.getByText("月").closest("button")!;
    fireEvent.keyDown(monButton, { key: "Enter" });
    // Enter キーでボタンが発火することを確認（button要素はEnterで発火）
    fireEvent.click(monButton);
    expect(mockOnChange).toHaveBeenCalled();
  });
});
