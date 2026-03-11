import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WorkspaceStatusBar } from "./WorkspaceStatusBar";

describe("WorkspaceStatusBar", () => {
  it("未選択時の既定表示を出す", () => {
    render(
      <WorkspaceStatusBar
        selectedFilePath={null}
        layoutMode="chat-only"
        watchState="idle"
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("ファイル未選択");
    expect(screen.getByTestId("workspace-status-layout")).toHaveTextContent(
      "chat-only",
    );
  });

  it("選択ファイルとサイズを表示する", () => {
    render(
      <WorkspaceStatusBar
        selectedFilePath="/workspace/src/app.ts"
        fileSize={2048}
        extension=".ts"
        layoutMode="3-pane"
        watchState="watching"
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "/workspace/src/app.ts",
    );
    expect(screen.getByTestId("workspace-status-size")).toHaveTextContent(
      "2.0 KB",
    );
    expect(screen.getByTestId("workspace-status-watch")).toHaveTextContent(
      "watching",
    );
  });
});
