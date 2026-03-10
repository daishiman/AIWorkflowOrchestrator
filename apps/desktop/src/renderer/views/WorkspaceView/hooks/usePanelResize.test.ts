import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePanelResize } from "./usePanelResize";

describe("usePanelResize", () => {
  it("forward 方向では右ドラッグで width を増やす", () => {
    const onWidthChange = vi.fn();
    const { result } = renderHook(() =>
      usePanelResize({
        width: 260,
        minWidth: 180,
        maxWidth: 400,
        defaultWidth: 260,
        onWidthChange,
      }),
    );

    act(() => {
      result.current.handleMouseDown({
        preventDefault: vi.fn(),
        clientX: 100,
      } as unknown as React.MouseEvent<HTMLElement>);
    });

    act(() => {
      document.dispatchEvent(new MouseEvent("mousemove", { clientX: 160 }));
      document.dispatchEvent(new MouseEvent("mouseup"));
    });

    expect(onWidthChange).toHaveBeenLastCalledWith(320);
  });

  it("reverse 方向では右ドラッグで width を減らす", () => {
    const onWidthChange = vi.fn();
    const { result } = renderHook(() =>
      usePanelResize({
        width: 360,
        minWidth: 280,
        maxWidth: 560,
        defaultWidth: 320,
        direction: "reverse",
        onWidthChange,
      }),
    );

    act(() => {
      result.current.handleMouseDown({
        preventDefault: vi.fn(),
        clientX: 100,
      } as unknown as React.MouseEvent<HTMLElement>);
    });

    act(() => {
      document.dispatchEvent(new MouseEvent("mousemove", { clientX: 180 }));
      document.dispatchEvent(new MouseEvent("mouseup"));
    });

    expect(onWidthChange).toHaveBeenLastCalledWith(280);
  });

  it("keyboard 操作と double click reset を clamp 付きで処理する", () => {
    const onWidthChange = vi.fn();
    const { result } = renderHook(() =>
      usePanelResize({
        width: 360,
        minWidth: 280,
        maxWidth: 560,
        defaultWidth: 320,
        direction: "reverse",
        onWidthChange,
      }),
    );

    act(() => {
      result.current.handleKeyDown({
        key: "ArrowLeft",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
      result.current.handleKeyDown({
        key: "ArrowRight",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
      result.current.handleDoubleClick();
    });

    expect(onWidthChange).toHaveBeenNthCalledWith(1, 380);
    expect(onWidthChange).toHaveBeenNthCalledWith(2, 340);
    expect(onWidthChange).toHaveBeenNthCalledWith(3, 320);
  });
});
