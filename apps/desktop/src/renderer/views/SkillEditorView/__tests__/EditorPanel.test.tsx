import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditorPanel } from "../components/EditorPanel/EditorPanel";
import { sampleContent } from "./helpers/test-factories";

describe("EditorPanel", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // EP-01
  it("コンテンツを textarea に表示する", () => {
    render(
      <EditorPanel
        content="# Hello"
        language="markdown"
        isLoading={false}
        isReadOnly={false}
        onChange={mockOnChange}
      />,
    );
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("# Hello");
  });

  // EP-02
  it("編集入力時に onChange コールバックを呼び出す", () => {
    render(
      <EditorPanel
        content="original"
        language="markdown"
        isLoading={false}
        isReadOnly={false}
        onChange={mockOnChange}
      />,
    );
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "new" } });
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith("new");
  });

  // EP-03
  it("読み取り専用モードで textarea を無効化する", () => {
    render(
      <EditorPanel
        content="readonly content"
        language="markdown"
        isLoading={false}
        isReadOnly={true}
        onChange={mockOnChange}
      />,
    );
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.readOnly).toBe(true);
  });

  // EP-04
  it("ローディング中にスピナーを表示する", () => {
    render(
      <EditorPanel
        content=""
        language="markdown"
        isLoading={true}
        isReadOnly={false}
        onChange={mockOnChange}
      />,
    );
    expect(screen.getByTestId("editor-loading")).toBeInTheDocument();
  });

  // EP-05
  it("ステータスバーに行数を表示する", () => {
    render(
      <EditorPanel
        content={sampleContent}
        language="markdown"
        isLoading={false}
        isReadOnly={false}
        onChange={mockOnChange}
      />,
    );
    expect(screen.getByText("50 行")).toBeInTheDocument();
  });

  // EP-06
  it("ステータスバーに文字数を表示する", () => {
    const content500 = "a".repeat(500);
    render(
      <EditorPanel
        content={content500}
        language="markdown"
        isLoading={false}
        isReadOnly={false}
        onChange={mockOnChange}
      />,
    );
    expect(screen.getByText("500 文字")).toBeInTheDocument();
  });

  // EP-07
  it("ステータスバーに言語名を表示する", () => {
    render(
      <EditorPanel
        content="test"
        language="markdown"
        isLoading={false}
        isReadOnly={false}
        onChange={mockOnChange}
      />,
    );
    expect(screen.getByText("Markdown")).toBeInTheDocument();
  });

  // EP-08
  it("空コンテンツで「ファイルを選択してください」を表示する", () => {
    render(
      <EditorPanel
        content=""
        language="text"
        isLoading={false}
        isReadOnly={false}
        onChange={mockOnChange}
      />,
    );
    expect(screen.getByText("ファイルを選択してください")).toBeInTheDocument();
  });
});
