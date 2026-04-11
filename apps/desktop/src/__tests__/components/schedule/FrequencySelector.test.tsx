/**
 * @file FrequencySelector.test.tsx
 * @description FrequencySelector コンポーネントテスト（TDD Red フェーズ）
 * @phase Phase 4: テスト作成
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001
 *
 * P39準拠: fireEventのみ使用（happy-dom環境）
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FrequencySelector } from "../../../renderer/components/schedule/FrequencySelector";

describe("FrequencySelector", () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  it("FS-01: 全頻度オプション（6種）が表示される", () => {
    render(<FrequencySelector value="daily" onChange={mockOnChange} />);
    expect(screen.getByText("毎分")).toBeInTheDocument();
    expect(screen.getByText("毎時")).toBeInTheDocument();
    expect(screen.getByText("毎日")).toBeInTheDocument();
    expect(screen.getByText("毎週")).toBeInTheDocument();
    expect(screen.getByText("毎月")).toBeInTheDocument();
    expect(screen.getByText("カスタム")).toBeInTheDocument();
  });

  it("FS-02: 初期選択が props から反映される", () => {
    render(<FrequencySelector value="daily" onChange={mockOnChange} />);
    const dailyButton = screen.getByText("毎日").closest("button");
    expect(dailyButton).toHaveAttribute("aria-pressed", "true");
  });

  it("FS-03: オプションをクリックで onChange が呼ばれる", () => {
    render(<FrequencySelector value="daily" onChange={mockOnChange} />);
    fireEvent.click(screen.getByText("毎週").closest("button")!);
    expect(mockOnChange).toHaveBeenCalledWith("weekly");
  });

  it("FS-04: 選択変更: daily → weekly", () => {
    const { rerender } = render(
      <FrequencySelector value="daily" onChange={mockOnChange} />,
    );
    fireEvent.click(screen.getByText("毎週").closest("button")!);
    expect(mockOnChange).toHaveBeenCalledWith("weekly");

    rerender(<FrequencySelector value="weekly" onChange={mockOnChange} />);
    const weeklyButton = screen.getByText("毎週").closest("button");
    expect(weeklyButton).toHaveAttribute("aria-pressed", "true");
    const dailyButton = screen.getByText("毎日").closest("button");
    expect(dailyButton).toHaveAttribute("aria-pressed", "false");
  });

  it("FS-05: disabled 時はクリック無効", () => {
    render(
      <FrequencySelector value="daily" onChange={mockOnChange} disabled />,
    );
    fireEvent.click(screen.getByText("毎週").closest("button")!);
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("FS-06: 日本語ラベルが表示される", () => {
    render(<FrequencySelector value="custom" onChange={mockOnChange} />);
    expect(screen.getByText("カスタム")).toBeInTheDocument();
    expect(screen.getByText("毎日")).toBeInTheDocument();
  });
});
