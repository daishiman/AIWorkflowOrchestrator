import { afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { CodeViewer } from "../index";

describe("CodeViewer", () => {
  const sampleCode = "const answer = 42;\nconsole.log(answer);";

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("コード文字列を表示する", () => {
    render(<CodeViewer code={sampleCode} />);
    expect(screen.getByText("const answer = 42;")).toBeInTheDocument();
    expect(screen.getByText("console.log(answer);")).toBeInTheDocument();
  });

  it("showLineNumbers=trueで行番号を表示する", () => {
    render(<CodeViewer code={sampleCode} showLineNumbers />);
    expect(screen.getByTestId("line-number-1")).toHaveTextContent("1");
    expect(screen.getByTestId("line-number-2")).toHaveTextContent("2");
  });

  it("showLineNumbers=falseで行番号を表示しない", () => {
    render(<CodeViewer code={sampleCode} showLineNumbers={false} />);
    expect(screen.queryByTestId("line-number-1")).not.toBeInTheDocument();
  });

  it("コピーボタン押下でclipboard.writeTextを呼び出す", async () => {
    const writeTextSpy = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);

    render(<CodeViewer code={sampleCode} />);

    fireEvent.click(screen.getByRole("button", { name: "コードをコピー" }));

    await waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalledWith(sampleCode);
    });
  });

  it("コピー後にラベルがCopy→Check→Copyで遷移する", async () => {
    vi.useFakeTimers();
    vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);

    render(<CodeViewer code={sampleCode} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "コードをコピー" }));
    });

    expect(
      screen.getByRole("button", { name: "コピー完了" }),
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(
      screen.getByRole("button", { name: "コードをコピー" }),
    ).toBeInTheDocument();
  });

  it("filePath指定時にヘッダーを表示する", () => {
    render(
      <CodeViewer
        code={sampleCode}
        filePath="/tmp/workspace/main.ts"
        language="typescript"
      />,
    );
    expect(screen.getByText("main.ts")).toBeInTheDocument();
    expect(screen.getByText("typescript")).toBeInTheDocument();
  });

  it("maxHeightを反映する", () => {
    render(<CodeViewer code={sampleCode} maxHeight="220px" />);
    expect(screen.getByTestId("code-viewer-scroll")).toHaveStyle({
      maxHeight: "220px",
    });
  });

  it("aria-labelを設定する", () => {
    render(<CodeViewer code={sampleCode} />);
    expect(screen.getByLabelText("コード表示")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "コードをコピー" }),
    ).toBeInTheDocument();
  });

  it("showCopyButton=falseでコピーボタンを表示しない", () => {
    render(<CodeViewer code={sampleCode} showCopyButton={false} />);
    expect(
      screen.queryByRole("button", { name: "コードをコピー" }),
    ).not.toBeInTheDocument();
  });

  describe.each(["kanagawa-dragon", "light", "dark"])("テーマ: %s", (theme) => {
    it("レンダリングできる", () => {
      document.documentElement.setAttribute("data-theme", theme);
      render(<CodeViewer code={sampleCode} />);
      expect(screen.getByLabelText("コード表示")).toBeInTheDocument();
    });
  });
});
