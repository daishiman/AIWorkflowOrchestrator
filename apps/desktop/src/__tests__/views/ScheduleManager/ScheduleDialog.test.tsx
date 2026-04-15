/**
 * @file ScheduleDialog.test.tsx
 * @description ScheduleDialog の保存前バリデーションテスト
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001 / TASK-CRON-SEMANTIC-VALIDATION-001
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScheduleDialog } from "../../../renderer/views/ScheduleManager/components/ScheduleDialog";

describe("ScheduleDialog", () => {
  let mockOnClose: ReturnType<typeof vi.fn>;
  let mockOnSave: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnClose = vi.fn();
    mockOnSave = vi.fn().mockResolvedValue(undefined);
  });

  it("cron式が不正な場合は保存をブロックする", () => {
    render(<ScheduleDialog onClose={mockOnClose} onSave={mockOnSave} />);

    fireEvent.change(screen.getByTestId("dialog-skill-name"), {
      target: { value: "テストスキル" },
    });
    fireEvent.click(screen.getByText("高度な設定"));

    const cronInput = screen.getByLabelText("カスタムcron式");
    fireEvent.change(cronInput, { target: { value: "0 9 * *" } });

    fireEvent.click(screen.getByRole("button", { name: /作成|更新/ }));

    expect(mockOnSave).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "cron式は5つのフィールドが必要です",
    );
  });

  it("存在しない日付のcron式でも保存をブロックする", () => {
    render(<ScheduleDialog onClose={mockOnClose} onSave={mockOnSave} />);

    fireEvent.change(screen.getByTestId("dialog-skill-name"), {
      target: { value: "テストスキル" },
    });
    fireEvent.click(screen.getByText("高度な設定"));

    const cronInput = screen.getByLabelText("カスタムcron式");
    fireEvent.change(cronInput, { target: { value: "0 9 31 2 *" } });

    const submitButton = screen.getByRole("button", { name: /作成|更新/ });
    expect(submitButton).toBeDisabled();

    fireEvent.click(submitButton);

    expect(mockOnSave).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "指定した日付は存在しません",
    );
  });
});
