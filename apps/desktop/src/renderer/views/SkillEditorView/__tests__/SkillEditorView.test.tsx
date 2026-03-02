import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SkillEditorView } from "../index";
import { setupSkillApiMocks } from "./helpers/test-factories";

describe("SkillEditorView", () => {
  let mocks: ReturnType<typeof setupSkillApiMocks>;
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mocks = setupSkillApiMocks();
  });

  // SEV-01
  it("初期レンダリングでファイルツリーとエディターパネルを表示する", async () => {
    await act(async () => {
      render(<SkillEditorView skillName="my-skill" onClose={mockOnClose} />);
    });
    // FileTreePanel (role="tree") とテキストエリアの存在を確認
    expect(screen.getByRole("tree")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  // SEV-02
  it("skillName を FileTreePanel に渡す", async () => {
    await act(async () => {
      render(<SkillEditorView skillName="my-skill" onClose={mockOnClose} />);
    });
    // getFileTree が skillName で呼ばれたことを確認
    expect(mocks.getFileTree).toHaveBeenCalledWith("my-skill");
  });

  // SEV-03
  it("ファイルノードクリック時にエディターにコンテンツを表示する", async () => {
    await act(async () => {
      render(<SkillEditorView skillName="my-skill" onClose={mockOnClose} />);
    });

    // ファイルノード（SKILL.md）をクリック
    await act(async () => {
      fireEvent.click(screen.getByText("SKILL.md"));
    });

    // readFile IPCが呼ばれたことを確認
    expect(mocks.readFile).toHaveBeenCalledWith("my-skill", "SKILL.md");
  });

  // SEV-04
  it("エディター編集後に保存ボタンが有効化される", async () => {
    await act(async () => {
      render(<SkillEditorView skillName="my-skill" onClose={mockOnClose} />);
    });

    // まずファイルを読み込む
    await act(async () => {
      fireEvent.click(screen.getByText("SKILL.md"));
    });

    // テキストエリアを変更
    const textarea = screen.getByRole("textbox");
    await act(async () => {
      fireEvent.change(textarea, { target: { value: "edited content" } });
    });

    // 保存ボタンが有効になっていることを確認
    const saveButton = screen.getByLabelText("保存");
    expect(saveButton).not.toBeDisabled();
  });

  // SEV-05
  it("保存ボタンクリック時に writeFile IPC が呼び出される", async () => {
    await act(async () => {
      render(<SkillEditorView skillName="my-skill" onClose={mockOnClose} />);
    });

    // ファイルを読み込む
    await act(async () => {
      fireEvent.click(screen.getByText("SKILL.md"));
    });

    // テキストを変更
    const textarea = screen.getByRole("textbox");
    await act(async () => {
      fireEvent.change(textarea, { target: { value: "new content" } });
    });

    // 保存ボタンをクリック
    await act(async () => {
      fireEvent.click(screen.getByLabelText("保存"));
    });

    expect(mocks.writeFile).toHaveBeenCalledWith(
      "my-skill",
      "SKILL.md",
      "new content",
    );
  });

  // SEV-06
  it("未保存変更がある状態で別ファイル選択時にダイアログを表示する", async () => {
    // 複数ファイルを持つツリーを用意
    await act(async () => {
      render(<SkillEditorView skillName="my-skill" onClose={mockOnClose} />);
    });

    // ファイルを読み込む
    await act(async () => {
      fireEvent.click(screen.getByText("SKILL.md"));
    });

    // テキストを変更（未保存変更を作る）
    const textarea = screen.getByRole("textbox");
    await act(async () => {
      fireEvent.change(textarea, { target: { value: "modified" } });
    });

    // ディレクトリを展開して別ファイルを選択
    await act(async () => {
      fireEvent.click(screen.getByText("agents"));
    });
    await act(async () => {
      fireEvent.click(screen.getByText("agent-1.md"));
    });

    // UnsavedChangesDialog が表示されることを確認
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  // SEV-07
  it("isReadOnly=true の場合に編集操作が無効化される", async () => {
    await act(async () => {
      render(
        <SkillEditorView
          skillName="my-skill"
          isReadOnly={true}
          onClose={mockOnClose}
        />,
      );
    });

    // ファイルを読み込む
    await act(async () => {
      fireEvent.click(screen.getByText("SKILL.md"));
    });

    // textarea が readOnly
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.readOnly).toBe(true);

    // 保存ボタンが disabled
    const saveButton = screen.getByLabelText("保存");
    expect(saveButton).toBeDisabled();
  });

  // SEV-08
  it("onClose コールバックが閉じるボタンクリック時に呼び出される", async () => {
    await act(async () => {
      render(<SkillEditorView skillName="my-skill" onClose={mockOnClose} />);
    });

    fireEvent.click(screen.getByLabelText("閉じる"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
