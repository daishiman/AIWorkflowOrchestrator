import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  resetWorkspaceLayoutStorage,
  useWorkspaceLayout,
} from "./useWorkspaceLayout";

function setViewportWidth(width: number): void {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
  window.dispatchEvent(new Event("resize"));
}

describe("useWorkspaceLayout", () => {
  beforeEach(() => {
    resetWorkspaceLayoutStorage();
    setViewportWidth(1280);
  });

  it("初期状態は chat-only", () => {
    const { result } = renderHook(() => useWorkspaceLayout());
    expect(result.current.layoutMode).toBe("chat-only");
  });

  it("wide で両 panel を開くと 3-pane になる", () => {
    setViewportWidth(1600);
    const { result } = renderHook(() => useWorkspaceLayout());

    act(() => {
      result.current.toggleFilePanel();
      result.current.togglePreviewPanel();
    });

    expect(result.current.layoutMode).toBe("3-pane");
    expect(result.current.showFilePanelInline).toBe(true);
    expect(result.current.showPreviewPanelInline).toBe(true);
  });

  it("mobile では overlay 表示になる", () => {
    setViewportWidth(800);
    const { result } = renderHook(() => useWorkspaceLayout());

    act(() => {
      result.current.toggleFilePanel();
    });

    expect(result.current.showFilePanelOverlay).toBe(true);
    expect(result.current.showFilePanelInline).toBe(false);
  });

  it("破損した panel size は default へ戻し、setter は clamp する", () => {
    window.localStorage.setItem(
      "workspace-panel-sizes",
      JSON.stringify({ filePanelWidth: "bad", previewPanelWidth: 9999 }),
    );

    const { result } = renderHook(() => useWorkspaceLayout());

    expect(result.current.filePanelWidth).toBe(260);
    expect(result.current.previewPanelWidth).toBe(560);

    act(() => {
      result.current.setFilePanelWidth(999);
      result.current.setPreviewPanelWidth(100);
    });

    expect(result.current.filePanelWidth).toBe(400);
    expect(result.current.previewPanelWidth).toBe(280);
  });

  it("mobile overlay は closeOverlayPanel で閉じられる", () => {
    setViewportWidth(800);
    const { result } = renderHook(() => useWorkspaceLayout());

    act(() => {
      result.current.togglePreviewPanel();
    });
    expect(result.current.showPreviewPanelOverlay).toBe(true);

    act(() => {
      result.current.closeOverlayPanel();
    });
    expect(result.current.layoutMode).toBe("chat-only");
  });
});
