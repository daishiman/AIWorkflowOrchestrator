import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CodeViewer } from "./index";
import { renderWithAllThemes } from "../../../tests/helpers/renderWithTheme";

describe("CodeViewer", () => {
  it("コードを表示する", () => {
    render(<CodeViewer code={"const a = 1;"} />);
    expect(screen.getByText("const a = 1;")).toBeInTheDocument();
  });

  it("行番号を表示できる", () => {
    render(<CodeViewer code={"line1\nline2"} showLineNumbers={true} />);
    expect(screen.getByTestId("line-number-1")).toHaveTextContent("1");
    expect(screen.getByTestId("line-number-2")).toHaveTextContent("2");
  });

  it("filePathヘッダーを表示する", () => {
    render(<CodeViewer code={"x"} filePath="src/app.ts" />);
    expect(screen.getByText("src/app.ts")).toBeInTheDocument();
  });

  it("コピー操作時にclipboardへ書き込む", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis.navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(<CodeViewer code={"copied text"} />);
    fireEvent.click(screen.getByRole("button", { name: "コードをコピー" }));

    expect(writeText).toHaveBeenCalledWith("copied text");
    expect(await screen.findByText("コピー済み")).toBeInTheDocument();
  });

  it("showCopyButton=falseでコピーボタンを表示しない", () => {
    render(<CodeViewer code={"x"} showCopyButton={false} />);
    expect(
      screen.queryByRole("button", { name: "コードをコピー" }),
    ).not.toBeInTheDocument();
  });

  it("3テーマでレンダリングできる", () => {
    expect(() => {
      renderWithAllThemes(<CodeViewer code={"theme test"} />);
    }).not.toThrow();
  });
});
