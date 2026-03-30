import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SingleSelectChips } from "../../interview-widgets/SingleSelectChips";
import type { SkillCreatorUserInputOption } from "@repo/shared/types/skillCreator";

const twoOptions: SkillCreatorUserInputOption[] = [
  { id: "a", label: "Alpha" },
  { id: "b", label: "Beta" },
];

describe("SingleSelectChips", () => {
  it("renders all options as radio buttons", () => {
    const onSelect = vi.fn();
    render(
      <SingleSelectChips
        options={twoOptions}
        selectedId={null}
        onSelect={onSelect}
      />,
    );

    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("marks selected option with aria-checked", () => {
    render(
      <SingleSelectChips
        options={twoOptions}
        selectedId="a"
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByTestId("chip-a")).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByTestId("chip-b")).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("calls onSelect when chip is clicked (TC-15)", () => {
    const onSelect = vi.fn();
    render(
      <SingleSelectChips
        options={twoOptions}
        selectedId={null}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByTestId("chip-b"));
    expect(onSelect).toHaveBeenCalledWith("b");
  });

  it("calls onSelect on Enter key (TC-23)", () => {
    const onSelect = vi.fn();
    render(
      <SingleSelectChips
        options={twoOptions}
        selectedId={null}
        onSelect={onSelect}
      />,
    );

    fireEvent.keyDown(screen.getByTestId("chip-a"), { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("a");
  });

  it("calls onSelect on Space key (TC-23)", () => {
    const onSelect = vi.fn();
    render(
      <SingleSelectChips
        options={twoOptions}
        selectedId={null}
        onSelect={onSelect}
      />,
    );

    fireEvent.keyDown(screen.getByTestId("chip-a"), { key: " " });
    expect(onSelect).toHaveBeenCalledWith("a");
  });

  it("does not fire onSelect when disabled", () => {
    const onSelect = vi.fn();
    render(
      <SingleSelectChips
        options={twoOptions}
        selectedId={null}
        onSelect={onSelect}
        disabled
      />,
    );

    // disabled button の click は発火しない
    fireEvent.click(screen.getByTestId("chip-a"));
    expect(onSelect).not.toHaveBeenCalled();
  });

  // TC-B04: 選択肢が1つだけの場合
  it("renders correctly with a single option (TC-B04)", () => {
    const singleOption: SkillCreatorUserInputOption[] = [
      { id: "only", label: "唯一の選択肢" },
    ];
    const onSelect = vi.fn();

    render(
      <SingleSelectChips
        options={singleOption}
        selectedId={null}
        onSelect={onSelect}
      />,
    );

    expect(screen.getAllByRole("radio")).toHaveLength(1);
    fireEvent.click(screen.getByTestId("chip-only"));
    expect(onSelect).toHaveBeenCalledWith("only");
  });
});
