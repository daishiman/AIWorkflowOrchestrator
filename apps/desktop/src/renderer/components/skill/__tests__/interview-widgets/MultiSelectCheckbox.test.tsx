import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MultiSelectCheckbox } from "../../interview-widgets/MultiSelectCheckbox";
import type { SkillCreatorUserInputOption } from "@repo/shared/types/skillCreator";

const threeOptions: SkillCreatorUserInputOption[] = [
  { id: "a", label: "Alpha" },
  { id: "b", label: "Beta" },
  { id: "c", label: "Charlie" },
];

describe("MultiSelectCheckbox", () => {
  it("renders all options as checkboxes", () => {
    render(
      <MultiSelectCheckbox
        options={threeOptions}
        selectedIds={[]}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByTestId("multi-select-checkbox")).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
  });

  it("marks selected options as checked", () => {
    render(
      <MultiSelectCheckbox
        options={threeOptions}
        selectedIds={["a", "c"]}
        onToggle={vi.fn()}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(checkboxes[0].checked).toBe(true);
    expect(checkboxes[1].checked).toBe(false);
    expect(checkboxes[2].checked).toBe(true);
  });

  it("calls onToggle when checkbox is clicked (TC-16)", () => {
    const onToggle = vi.fn();
    render(
      <MultiSelectCheckbox
        options={threeOptions}
        selectedIds={[]}
        onToggle={onToggle}
      />,
    );

    fireEvent.click(screen.getAllByRole("checkbox")[1]);
    expect(onToggle).toHaveBeenCalledWith("b");
  });

  it("calls onToggle on Space key", () => {
    const onToggle = vi.fn();
    render(
      <MultiSelectCheckbox
        options={threeOptions}
        selectedIds={[]}
        onToggle={onToggle}
      />,
    );

    fireEvent.keyDown(screen.getAllByRole("checkbox")[0], { key: " " });
    expect(onToggle).toHaveBeenCalledWith("a");
  });

  it("shows option descriptions when available", () => {
    const withDesc: SkillCreatorUserInputOption[] = [
      { id: "x", label: "X", description: "Xの説明" },
      { id: "y", label: "Y" },
    ];

    render(
      <MultiSelectCheckbox
        options={withDesc}
        selectedIds={[]}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByText("Xの説明")).toBeInTheDocument();
  });

  it("does not fire onToggle when disabled", () => {
    const onToggle = vi.fn();
    render(
      <MultiSelectCheckbox
        options={threeOptions}
        selectedIds={[]}
        onToggle={onToggle}
        disabled
      />,
    );

    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(onToggle).not.toHaveBeenCalled();
  });

  // TC-B05: 選択肢が10個以上の場合
  it("renders 12 options correctly (TC-B05)", () => {
    const manyOptions: SkillCreatorUserInputOption[] = Array.from(
      { length: 12 },
      (_, i) => ({
        id: `opt-${i}`,
        label: `Option ${i}`,
      }),
    );

    render(
      <MultiSelectCheckbox
        options={manyOptions}
        selectedIds={["opt-3", "opt-7", "opt-11"]}
        onToggle={vi.fn()}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(checkboxes).toHaveLength(12);
    expect(checkboxes[3].checked).toBe(true);
    expect(checkboxes[7].checked).toBe(true);
    expect(checkboxes[11].checked).toBe(true);
    expect(checkboxes[0].checked).toBe(false);
  });
});
