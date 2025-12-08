import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditorView } from "./index";

// Mock store state - flat structure matching actual store
const createMockState = (overrides = {}) => ({
  // EditorSlice
  fileTree: [
    {
      id: "/docs/readme.md",
      path: "/docs/readme.md",
      name: "readme.md",
      type: "file" as const,
    },
    {
      id: "/docs/guide.md",
      path: "/docs/guide.md",
      name: "guide.md",
      type: "file" as const,
    },
    { id: "/src", path: "/src", name: "src", type: "folder" as const },
  ],
  selectedFile: {
    id: "/docs/readme.md",
    path: "/docs/readme.md",
    name: "readme.md",
    type: "file" as const,
  },
  editorContent: "# README\n\nThis is a readme file.",
  hasUnsavedChanges: false,
  expandedFolders: new Set<string>(),
  setSelectedFile: vi.fn(),
  setFileTree: vi.fn(),
  setEditorContent: vi.fn(),
  setHasUnsavedChanges: vi.fn(),
  setExpandedFolders: vi.fn(),
  toggleFolder: vi.fn(),
  markAsSaved: vi.fn(),
  ...overrides,
});

vi.mock("../../store", () => ({
  useAppStore: vi.fn((selector: (state: unknown) => unknown) =>
    selector(createMockState()),
  ),
}));

describe("EditorView", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { useAppStore } = await import("../../store");
    vi.mocked(useAppStore).mockImplementation(
      (selector: (state: unknown) => unknown) => selector(createMockState()),
    );
  });

  describe("レンダリング", () => {
    it("エディタービューをレンダリングする", () => {
      render(<EditorView />);
      expect(screen.getByTestId("editor-view")).toBeInTheDocument();
    });

    it("ファイルツリーセクションを表示する", () => {
      render(<EditorView />);
      expect(screen.getByText("ファイル")).toBeInTheDocument();
    });

    it("現在のファイル名を表示する", () => {
      render(<EditorView />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("readme.md");
    });
  });

  describe("ファイルツリー", () => {
    it("ファイル一覧を表示する", () => {
      render(<EditorView />);
      expect(screen.getAllByText("readme.md").length).toBeGreaterThan(0);
      expect(screen.getByText("guide.md")).toBeInTheDocument();
      expect(screen.getByText("src")).toBeInTheDocument();
    });

    it("ファイルクリックでsetSelectedFileを呼び出す", async () => {
      const mockSetSelectedFile = vi.fn();
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation((selector) =>
        selector(createMockState({ setSelectedFile: mockSetSelectedFile })),
      );

      render(<EditorView />);
      const guideItem = screen.getByRole("treeitem", { name: /guide\.md/ });
      fireEvent.click(guideItem);
      expect(mockSetSelectedFile).toHaveBeenCalled();
    });
  });

  describe("エディター", () => {
    it("ファイル内容をテキストエリアに表示する", () => {
      render(<EditorView />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("# README\n\nThis is a readme file.");
    });

    it("内容変更でsetEditorContentを呼び出す", async () => {
      const mockSetEditorContent = vi.fn();
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation((selector) =>
        selector(createMockState({ setEditorContent: mockSetEditorContent })),
      );

      render(<EditorView />);
      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "New content" } });
      expect(mockSetEditorContent).toHaveBeenCalledWith("New content");
    });
  });

  describe("保存ボタン", () => {
    it("保存ボタンを表示する", () => {
      render(<EditorView />);
      expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
    });

    it("変更がない場合は無効化される", async () => {
      render(<EditorView />);
      const saveButton = screen.getByRole("button", { name: "保存" });
      expect(saveButton).toBeDisabled();
    });

    it("変更がある場合は有効になる", async () => {
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation((selector) =>
        selector(createMockState({ hasUnsavedChanges: true })),
      );

      render(<EditorView />);
      const saveButton = screen.getByRole("button", { name: "保存" });
      expect(saveButton).not.toBeDisabled();
    });

    it("クリックでmarkAsSavedを呼び出す", async () => {
      const mockMarkAsSaved = vi.fn();
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation((selector) =>
        selector(
          createMockState({
            hasUnsavedChanges: true,
            markAsSaved: mockMarkAsSaved,
          }),
        ),
      );

      render(<EditorView />);
      const saveButton = screen.getByRole("button", { name: "保存" });
      fireEvent.click(saveButton);
      expect(mockMarkAsSaved).toHaveBeenCalled();
    });
  });

  describe("未保存インジケーター", () => {
    it("変更がある場合にインジケーターを表示する", async () => {
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation((selector) =>
        selector(createMockState({ hasUnsavedChanges: true })),
      );

      render(<EditorView />);
      expect(screen.getByLabelText("未保存の変更あり")).toBeInTheDocument();
    });
  });

  describe("ファイル未選択状態", () => {
    it("ファイルが選択されていない場合にメッセージを表示する", async () => {
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation((selector) =>
        selector(
          createMockState({
            selectedFile: null,
            editorContent: "",
          }),
        ),
      );

      render(<EditorView />);
      expect(
        screen.getByText("左側のファイルツリーからファイルを選択してください"),
      ).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "ファイルを選択してください",
      );
    });
  });

  describe("空状態", () => {
    it("ファイルがない場合はメッセージを表示する", async () => {
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation((selector) =>
        selector(createMockState({ fileTree: [] })),
      );

      render(<EditorView />);
      expect(screen.getByText("ファイルがありません")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("ファイルツリーナビゲーションにaria-labelを持つ", () => {
      render(<EditorView />);
      expect(
        screen.getByRole("navigation", { name: "ファイルツリー" }),
      ).toBeInTheDocument();
    });

    it("テキストエリアにaria-labelを持つ", () => {
      render(<EditorView />);
      expect(
        screen.getByRole("textbox", { name: /readme.mdの編集/ }),
      ).toBeInTheDocument();
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      render(<EditorView className="custom-class" />);
      expect(screen.getByTestId("editor-view")).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(EditorView.displayName).toBe("EditorView");
    });
  });
});
