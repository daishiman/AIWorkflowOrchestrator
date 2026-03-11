import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FileContextMenu } from "./FileContextMenu";

describe("FileContextMenu", () => {
  it("menuitem click で handler を呼ぶ", () => {
    const onAttach = vi.fn();
    const onOpenPreview = vi.fn();

    render(
      <FileContextMenu
        x={10}
        y={20}
        onClose={vi.fn()}
        onAttach={onAttach}
        onOpenPreview={onOpenPreview}
      />,
    );

    fireEvent.click(screen.getByRole("menuitem", { name: "背景情報に追加" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "プレビューを開く" }));

    expect(onAttach).toHaveBeenCalledTimes(1);
    expect(onOpenPreview).toHaveBeenCalledTimes(1);
  });

  it("document click で閉じる", () => {
    const onClose = vi.fn();

    render(
      <FileContextMenu
        x={10}
        y={20}
        onClose={onClose}
        onAttach={vi.fn()}
        onOpenPreview={vi.fn()}
      />,
    );

    fireEvent.click(document);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
