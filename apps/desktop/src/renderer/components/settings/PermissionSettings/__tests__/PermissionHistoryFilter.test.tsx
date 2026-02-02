/**
 * @file PermissionHistoryFilter コンポーネントテスト
 * @description TDD Red Phase - 期間フィルタUIの表示・操作テスト
 * @feature task-imp-permission-date-filter
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { PermissionHistoryFilter } from "../PermissionHistoryFilter";
import type { PermissionHistoryFilter as FilterType } from "../../../skill/permissionHistory";

// ==========================================================================
// テストスイート
// ==========================================================================

describe("PermissionHistoryFilter - 期間フィルタ", () => {
  const user = userEvent.setup();
  const defaultProps = {
    filter: {} as FilterType,
    onFilterChange: vi.fn(),
    availableTools: ["Bash", "Read", "Write"],
  };

  // ------ 表示テスト ------

  it("期間セレクトボックスが表示される", () => {
    render(<PermissionHistoryFilter {...defaultProps} />);
    expect(screen.getByRole("combobox", { name: /期間/i })).toBeInTheDocument();
  });

  it("デフォルト値が「全期間」である", () => {
    render(<PermissionHistoryFilter {...defaultProps} />);
    const select = screen.getByRole("combobox", { name: /期間/i });
    expect(select).toHaveValue("all");
  });

  it("プリセット選択でonFilterChangeが発火する", async () => {
    const onFilterChange = vi.fn();
    render(
      <PermissionHistoryFilter
        {...defaultProps}
        onFilterChange={onFilterChange}
      />,
    );
    const select = screen.getByRole("combobox", { name: /期間/i });
    await user.selectOptions(select, "today");
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        dateRange: expect.objectContaining({ preset: "today" }),
      }),
    );
  });

  it("カスタム選択時に日付入力が表示される", () => {
    render(
      <PermissionHistoryFilter
        {...defaultProps}
        filter={{ dateRange: { preset: "custom" } }}
      />,
    );
    expect(screen.getByLabelText(/開始日/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/終了日/i)).toBeInTheDocument();
  });

  it("プリセット選択時に日付入力が非表示", () => {
    render(
      <PermissionHistoryFilter
        {...defaultProps}
        filter={{ dateRange: { preset: "week" } }}
      />,
    );
    expect(screen.queryByLabelText(/開始日/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/終了日/i)).not.toBeInTheDocument();
  });

  it("カスタム範囲のstart入力でonFilterChangeが発火する", async () => {
    const onFilterChange = vi.fn();
    render(
      <PermissionHistoryFilter
        {...defaultProps}
        filter={{ dateRange: { preset: "custom" } }}
        onFilterChange={onFilterChange}
      />,
    );
    const startInput = screen.getByLabelText(/開始日/i);
    await user.clear(startInput);
    await user.type(startInput, "2026-02-01");
    expect(onFilterChange).toHaveBeenCalled();
  });

  it("カスタム範囲のend入力でonFilterChangeが発火する", async () => {
    const onFilterChange = vi.fn();
    render(
      <PermissionHistoryFilter
        {...defaultProps}
        filter={{ dateRange: { preset: "custom" } }}
        onFilterChange={onFilterChange}
      />,
    );
    const endInput = screen.getByLabelText(/終了日/i);
    await user.clear(endInput);
    await user.type(endInput, "2026-02-05");
    expect(onFilterChange).toHaveBeenCalled();
  });

  it("dateRange未設定時もフィルタが正常表示される", () => {
    render(<PermissionHistoryFilter {...defaultProps} filter={{}} />);
    const select = screen.getByRole("combobox", { name: /期間/i });
    expect(select).toHaveValue("all");
  });
});
