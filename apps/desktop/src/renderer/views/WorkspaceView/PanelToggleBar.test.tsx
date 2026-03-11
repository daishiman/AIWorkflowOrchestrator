import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PanelToggleBar } from "./PanelToggleBar";

describe("PanelToggleBar", () => {
  it("switch role と checked 状態を反映する", () => {
    render(
      <PanelToggleBar
        isFilePanelOpen={true}
        isPreviewOpen={false}
        onToggleFilePanel={vi.fn()}
        onTogglePreview={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("switch", { name: "ファイルサイドバーの表示切替" }),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("switch", { name: "プレビューサイドバーの表示切替" }),
    ).toHaveAttribute("aria-checked", "false");
  });

  it("クリックで各 handler を呼ぶ", () => {
    const onToggleFilePanel = vi.fn();
    const onTogglePreview = vi.fn();

    render(
      <PanelToggleBar
        isFilePanelOpen={false}
        isPreviewOpen={false}
        onToggleFilePanel={onToggleFilePanel}
        onTogglePreview={onTogglePreview}
      />,
    );

    fireEvent.click(screen.getByTestId("workspace-toggle-file"));
    fireEvent.click(screen.getByTestId("workspace-toggle-preview"));

    expect(onToggleFilePanel).toHaveBeenCalledTimes(1);
    expect(onTogglePreview).toHaveBeenCalledTimes(1);
  });
});
