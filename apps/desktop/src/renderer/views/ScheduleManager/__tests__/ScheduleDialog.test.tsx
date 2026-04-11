/**
 * @file ScheduleDialog.test.tsx
 * @description ScheduleDialog の保存前検証テスト
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScheduleDialog } from "../components/ScheduleDialog";

describe("ScheduleDialog", () => {
  let mockOnClose: ReturnType<typeof vi.fn>;
  let mockOnSave: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnClose = vi.fn();
    mockOnSave = vi.fn().mockResolvedValue(undefined);
  });

  it("無効な cron 式では保存できず、エラーが表示される", () => {
    render(<ScheduleDialog onClose={mockOnClose} onSave={mockOnSave} />);

    fireEvent.change(screen.getByTestId("dialog-skill-name"), {
      target: { value: "sample-skill" },
    });

    fireEvent.click(screen.getByRole("button", { name: "高度な設定" }));

    const input = screen.getByRole("textbox", { name: "カスタムcron式" });
    fireEvent.change(input, { target: { value: "0 24 * * *" } });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "cron式の形式が正しくありません",
    );

    const saveButton = screen.getByRole("button", { name: "作成" });
    expect(saveButton).toBeDisabled();
    fireEvent.click(saveButton);

    expect(mockOnSave).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("有効な cron 式では保存コールバックが呼ばれる", async () => {
    render(<ScheduleDialog onClose={mockOnClose} onSave={mockOnSave} />);

    fireEvent.change(screen.getByTestId("dialog-skill-name"), {
      target: { value: "sample-skill" },
    });

    fireEvent.click(screen.getByRole("button", { name: "高度な設定" }));

    const input = screen.getByRole("textbox", { name: "カスタムcron式" });
    fireEvent.change(input, { target: { value: "0 8 * * 1-5" } });

    const saveButton = screen.getByRole("button", { name: "作成" });
    expect(saveButton).not.toBeDisabled();
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });
});
