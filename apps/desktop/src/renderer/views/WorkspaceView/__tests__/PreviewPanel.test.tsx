import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { PreviewPanel } from "../components/PreviewPanel/PreviewPanel";
import type { PreviewSurfaceError } from "../utils/previewResilience";

const transportError: PreviewSurfaceError = {
  category: "transport",
  code: "file-read-timeout",
  summary: "ファイル読み込みがタイムアウトしました",
  detail: "5秒 timeout / 3回再試行済み",
  retryable: true,
  attempts: 3,
  timeoutMs: 5000,
};

function renderPreviewPanel(
  overrides: Partial<ComponentProps<typeof PreviewPanel>> = {},
) {
  const onRefresh = vi.fn();
  const onOpenEditor = vi.fn();

  render(
    <PreviewPanel
      filePath="/workspace/README.md"
      extension=".md"
      content="# title\nbody"
      size={128}
      isLoading={false}
      error={null}
      onRefresh={onRefresh}
      onOpenEditor={onOpenEditor}
      {...overrides}
    />,
  );

  return {
    onRefresh,
    onOpenEditor,
  };
}

describe("PreviewPanel", () => {
  it("ファイル未選択時は空状態を表示する", () => {
    renderPreviewPanel({ filePath: null, extension: null, content: "" });

    expect(screen.getByTestId("preview-empty-state")).toBeInTheDocument();
  });

  it("非対応拡張子ではプレビュータブが無効化される", () => {
    renderPreviewPanel({ extension: ".ts", content: "const value = 1;" });

    expect(screen.getByTestId("preview-tab-preview")).toBeDisabled();
  });

  it("Markdown はプレビュー表示へ切り替えできる", () => {
    renderPreviewPanel();

    fireEvent.click(screen.getByTestId("preview-tab-preview"));

    expect(screen.getByTestId("markdown-preview")).toBeInTheDocument();
  });

  it("HTML プレビューは script を除去した srcdoc を使う", () => {
    renderPreviewPanel({
      filePath: "/workspace/demo.html",
      extension: ".html",
      content: "<h1>safe</h1><script>alert('xss')</script>",
    });

    fireEvent.click(screen.getByTestId("preview-tab-preview"));

    const iframe = screen.getByTestId("preview-html-iframe");
    const srcdoc = iframe.getAttribute("srcdoc") ?? "";
    expect(srcdoc).toContain("Content-Security-Policy");
    expect(srcdoc).not.toContain("<script>alert('xss')</script>");
  });

  it("JSON は structured preview で整形表示する", () => {
    renderPreviewPanel({
      filePath: "/workspace/data.json",
      extension: ".json",
      content: '{"items":[1,2]}',
    });

    fireEvent.click(screen.getByTestId("preview-tab-preview"));

    expect(screen.getByTestId("structured-preview")).toHaveTextContent(
      '"items"',
    );
  });

  it("Refresh/Wrap と editor 導線が動作する", () => {
    const { onRefresh, onOpenEditor } = renderPreviewPanel({
      filePath: "/workspace/app.ts",
      extension: ".ts",
      content: "const app = true;\nconsole.log(app);",
    });

    fireEvent.click(screen.getByTestId("preview-refresh"));
    expect(onRefresh).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("preview-wrap-toggle"));
    expect(screen.getByTestId("preview-wrap-toggle")).toHaveTextContent(
      "Wrap: ON",
    );

    fireEvent.doubleClick(screen.getByTestId("source-view"));
    expect(onOpenEditor).toHaveBeenCalledTimes(1);
  });

  it("SourceView は 40px の行番号ガターを持つ", () => {
    renderPreviewPanel({
      filePath: "/workspace/app.ts",
      extension: ".ts",
      content: "line1\nline2",
    });

    const lineNumber = screen.getAllByTestId("source-line-number")[0];
    expect(lineNumber).toHaveStyle({ width: "40px" });
  });

  it("Structured preview が失敗したときは alert を出して source へフォールバックする", () => {
    renderPreviewPanel({
      filePath: "/workspace/data.json",
      extension: ".json",
      content: '{"items":',
    });

    fireEvent.click(screen.getByTestId("preview-tab-preview"));

    expect(
      screen.getByTestId("preview-structured-fallback-alert"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("source-view")).toBeInTheDocument();
  });

  it("transport error は taxonomy に沿った alert を表示する", () => {
    renderPreviewPanel({
      error: transportError,
    });

    expect(screen.getByTestId("preview-alert")).toHaveTextContent(
      "プレビューの取得に失敗しました",
    );
    expect(screen.getByTestId("preview-alert")).toHaveTextContent(
      "ファイル読み込みがタイムアウトしました",
    );
    expect(screen.getByTestId("preview-alert")).toHaveTextContent(
      "5秒 timeout / 3回再試行済み",
    );
    expect(screen.getByTestId("preview-retry")).toHaveClass(
      "bg-[var(--status-primary)]",
    );
  });

  it("画像 preview でメタ情報を開閉できる", () => {
    renderPreviewPanel({
      filePath: "/workspace/logo.png",
      extension: ".png",
      content:
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO0pQnQAAAAASUVORK5CYII=",
      size: 68,
    });

    fireEvent.click(screen.getByTestId("preview-tab-preview"));

    expect(screen.getByTestId("image-preview")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("image-meta-toggle"));

    expect(screen.getByText("68 bytes")).toBeInTheDocument();
  });
});
