import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PanelResizeHandle } from "./PanelResizeHandle";

describe("PanelResizeHandle", () => {
  it("separator 属性を持ち、mouse / key / dblclick を resize へ委譲する", () => {
    const resize = {
      isDragging: false,
      handleMouseDown: vi.fn(),
      handleDoubleClick: vi.fn(),
      handleKeyDown: vi.fn(),
    };

    render(
      <PanelResizeHandle
        testId="workspace-resize-file"
        label="ファイルパネル幅の調整"
        resize={resize}
      />,
    );

    const handle = screen.getByTestId("workspace-resize-file");
    expect(handle).toHaveAttribute("role", "separator");
    expect(handle).toHaveAttribute("aria-label", "ファイルパネル幅の調整");

    fireEvent.mouseDown(handle, { clientX: 100 });
    fireEvent.doubleClick(handle);
    fireEvent.keyDown(handle, { key: "ArrowLeft" });

    expect(resize.handleMouseDown).toHaveBeenCalledTimes(1);
    expect(resize.handleDoubleClick).toHaveBeenCalledTimes(1);
    expect(resize.handleKeyDown).toHaveBeenCalledTimes(1);
  });
});
