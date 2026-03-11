import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WorkspaceShell } from "./WorkspaceShell";

const resize = {
  isDragging: false,
  handleMouseDown: vi.fn(),
  handleDoubleClick: vi.fn(),
  handleKeyDown: vi.fn(),
};

describe("WorkspaceShell", () => {
  it("inline panel と overlay panel を両方描画できる", () => {
    render(
      <WorkspaceShell
        topBar={<div>top</div>}
        filePanel={<div data-testid="file-panel">file</div>}
        chatPanel={<div>chat</div>}
        previewPanel={<div data-testid="preview-panel">preview</div>}
        statusBar={<div>status</div>}
        showFilePanelInline={true}
        showPreviewPanelInline={true}
        showFilePanelOverlay={true}
        showPreviewPanelOverlay={true}
        closeOverlayPanel={vi.fn()}
        fileResize={resize}
        previewResize={resize}
        filePanelWidth={260}
        previewPanelWidth={360}
      />,
    );

    expect(screen.getByTestId("workspace-resize-file")).toBeInTheDocument();
    expect(screen.getByTestId("workspace-resize-preview")).toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: "ファイル" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: "プレビュー" }),
    ).toBeInTheDocument();
  });
});
