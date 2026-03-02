import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FileTreePanel } from "../components/FileTreePanel/FileTreePanel";
import { sampleFileTree } from "./helpers/test-factories";

describe("FileTreePanel", () => {
  const mockOnSelectFile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // FTP-01
  it("空のファイルツリーで「ファイルがありません」を表示する", () => {
    render(
      <FileTreePanel
        fileTree={[]}
        selectedFile=""
        unsavedFiles={new Set()}
        onSelectFile={mockOnSelectFile}
      />,
    );
    expect(screen.getByText("ファイルがありません")).toBeInTheDocument();
  });

  // FTP-02
  it("ファイルツリーの全ノードを再帰的にレンダリングする", () => {
    // ディレクトリを展開しないと子ノードは表示されないので、
    // フラットなトップレベルノードの存在を確認する
    render(
      <FileTreePanel
        fileTree={sampleFileTree}
        selectedFile=""
        unsavedFiles={new Set()}
        onSelectFile={mockOnSelectFile}
      />,
    );
    // トップレベル3ノード
    expect(screen.getByText("SKILL.md")).toBeInTheDocument();
    expect(screen.getByText("agents")).toBeInTheDocument();
    expect(screen.getByText("references")).toBeInTheDocument();
  });

  // FTP-03
  it("ファイルノードクリック時に onSelectFile を呼び出す", () => {
    render(
      <FileTreePanel
        fileTree={sampleFileTree}
        selectedFile=""
        unsavedFiles={new Set()}
        onSelectFile={mockOnSelectFile}
      />,
    );
    fireEvent.click(screen.getByText("SKILL.md"));
    expect(mockOnSelectFile).toHaveBeenCalledTimes(1);
    expect(mockOnSelectFile).toHaveBeenCalledWith("SKILL.md");
  });

  // FTP-04
  it("ディレクトリノードクリック時に展開/折りたたみをトグルする", () => {
    render(
      <FileTreePanel
        fileTree={sampleFileTree}
        selectedFile=""
        unsavedFiles={new Set()}
        onSelectFile={mockOnSelectFile}
      />,
    );
    // 初期状態: 子ノードは非表示
    expect(screen.queryByText("agent-1.md")).not.toBeInTheDocument();

    // ディレクトリをクリック → 展開
    fireEvent.click(screen.getByText("agents"));
    expect(screen.getByText("agent-1.md")).toBeInTheDocument();

    // 再度クリック → 折りたたみ
    fireEvent.click(screen.getByText("agents"));
    expect(screen.queryByText("agent-1.md")).not.toBeInTheDocument();
  });

  // FTP-05
  it("選択中ファイルにハイライトを適用する", () => {
    render(
      <FileTreePanel
        fileTree={sampleFileTree}
        selectedFile="SKILL.md"
        unsavedFiles={new Set()}
        onSelectFile={mockOnSelectFile}
      />,
    );
    const items = screen.getAllByRole("treeitem");
    const selectedItem = items.find((el) =>
      el.textContent?.includes("SKILL.md"),
    );
    expect(selectedItem?.className).toContain("bg-[var(--status-primary)]");
  });

  // FTP-06
  it("未保存ファイルに未保存マーカーを表示する", () => {
    render(
      <FileTreePanel
        fileTree={sampleFileTree}
        selectedFile=""
        unsavedFiles={new Set(["SKILL.md"])}
        onSelectFile={mockOnSelectFile}
      />,
    );
    // 未保存マーカー（ドット）のaria-labelを検索
    const marker = screen.getByLabelText("未保存");
    expect(marker).toBeInTheDocument();
  });

  // FTP-07
  it("パネルに role='tree' を付与する", () => {
    render(
      <FileTreePanel
        fileTree={sampleFileTree}
        selectedFile=""
        unsavedFiles={new Set()}
        onSelectFile={mockOnSelectFile}
      />,
    );
    expect(screen.getByRole("tree")).toBeInTheDocument();
  });

  // FTP-08
  it("ディレクトリノードに aria-expanded を付与する", () => {
    render(
      <FileTreePanel
        fileTree={sampleFileTree}
        selectedFile=""
        unsavedFiles={new Set()}
        onSelectFile={mockOnSelectFile}
      />,
    );
    // 初期状態: 折りたたみ
    const agentsNode = screen.getByText("agents").closest("[role='treeitem']");
    expect(agentsNode).toHaveAttribute("aria-expanded", "false");

    // 展開後
    fireEvent.click(screen.getByText("agents"));
    const agentsNodeAfter = screen
      .getByText("agents")
      .closest("[role='treeitem']");
    expect(agentsNodeAfter).toHaveAttribute("aria-expanded", "true");
  });

  // FTP-09
  it("パネル幅が 240px で固定される", () => {
    render(
      <FileTreePanel
        fileTree={sampleFileTree}
        selectedFile=""
        unsavedFiles={new Set()}
        onSelectFile={mockOnSelectFile}
      />,
    );
    const panel = screen.getByRole("tree");
    expect(panel.className).toContain("w-[240px]");
  });
});
