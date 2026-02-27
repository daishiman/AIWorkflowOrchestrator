import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ImportedSkill } from "@repo/shared";
import { SkillEditor } from "../SkillEditor";

const createSkill = (path: string): ImportedSkill => ({
  name: "test-skill",
  description: "test skill",
  path,
  updatedAt: new Date("2026-02-26T00:00:00Z"),
  importedAt: new Date("2026-02-26T00:00:00Z"),
  status: "active",
  agents: [
    {
      filename: "main.md",
      relativePath: "agents/main.md",
      size: 120,
    },
  ],
  references: [
    {
      filename: "guide.md",
      relativePath: "references/guide.md",
      size: 80,
    },
  ],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
});

describe("SkillEditor", () => {
  const mockReadFile = vi.fn();
  const mockWriteFile = vi.fn();
  const mockCreateFile = vi.fn();
  const mockDeleteFile = vi.fn();
  const mockListBackups = vi.fn();
  const mockRestoreBackup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockReadFile.mockImplementation(
      async (_skillName: string, path: string) => {
        switch (path) {
          case "agents/main.md":
            return "# main";
          case "references/guide.md":
            return "# guide";
          default:
            return "# skill";
        }
      },
    );
    mockWriteFile.mockResolvedValue(undefined);
    mockCreateFile.mockResolvedValue(undefined);
    mockDeleteFile.mockResolvedValue(undefined);
    mockListBackups.mockResolvedValue([]);
    mockRestoreBackup.mockResolvedValue(undefined);

    const existingElectronApi =
      (window as unknown as { electronAPI?: Record<string, unknown> })
        .electronAPI ?? {};
    const existingSkillApi =
      (existingElectronApi as { skill?: Record<string, unknown> }).skill ?? {};

    (
      window as unknown as {
        electronAPI: { skill: Record<string, unknown> };
      }
    ).electronAPI = {
      ...(existingElectronApi as Record<string, unknown>),
      skill: {
        ...existingSkillApi,
        readFile: mockReadFile,
        writeFile: mockWriteFile,
        createFile: mockCreateFile,
        deleteFile: mockDeleteFile,
        listBackups: mockListBackups,
        restoreBackup: mockRestoreBackup,
      },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("初期表示時に SKILL.md を読み込む", async () => {
    render(
      <SkillEditor
        skill={createSkill("/Users/test/.aiworkflow/skills/test-skill")}
        onClose={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(mockReadFile).toHaveBeenCalledWith("test-skill", "SKILL.md");
    });

    expect(screen.getByDisplayValue("# skill")).toBeInTheDocument();
  });

  it("ファイル選択で内容を切り替える", async () => {
    render(
      <SkillEditor
        skill={createSkill("/Users/test/.aiworkflow/skills/test-skill")}
        onClose={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(mockReadFile).toHaveBeenCalledWith("test-skill", "SKILL.md");
    });

    fireEvent.click(screen.getByRole("treeitem", { name: "main.md" }));

    await waitFor(() => {
      expect(mockReadFile).toHaveBeenCalledWith("test-skill", "agents/main.md");
    });

    expect(screen.getByDisplayValue("# main")).toBeInTheDocument();
  });

  it("編集後に保存ボタンで writeFile を呼び出す", async () => {
    render(
      <SkillEditor
        skill={createSkill("/Users/test/.aiworkflow/skills/test-skill")}
        onClose={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(mockReadFile).toHaveBeenCalledWith("test-skill", "SKILL.md");
    });

    const editor = screen.getByRole("textbox", { name: "コードエディター" });
    fireEvent.change(editor, { target: { value: "# updated" } });

    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(mockWriteFile).toHaveBeenCalledWith(
        "test-skill",
        "SKILL.md",
        "# updated",
      );
    });
  });

  it("未保存状態でファイル切替時に警告ダイアログを表示する", async () => {
    render(
      <SkillEditor
        skill={createSkill("/Users/test/.aiworkflow/skills/test-skill")}
        onClose={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(mockReadFile).toHaveBeenCalledWith("test-skill", "SKILL.md");
    });

    fireEvent.change(
      screen.getByRole("textbox", { name: "コードエディター" }),
      {
        target: { value: "# changed" },
      },
    );

    fireEvent.click(screen.getByRole("treeitem", { name: "main.md" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("未保存の変更があります")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "保存せずに続行" }));

    await waitFor(() => {
      expect(mockReadFile).toHaveBeenCalledWith("test-skill", "agents/main.md");
    });
  });

  it("読み取り専用スキルでは編集操作を無効化する", async () => {
    render(
      <SkillEditor
        skill={createSkill("/Users/test/.claude/skills/test-skill")}
        onClose={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(mockReadFile).toHaveBeenCalledWith("test-skill", "SKILL.md");
    });

    expect(screen.getByText(/読み取り専用スキルです/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "新規ファイル" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "ファイル削除" })).toBeDisabled();
  });

  it("ファイルツリーで矢印キー移動できる", async () => {
    render(
      <SkillEditor
        skill={createSkill("/Users/test/.aiworkflow/skills/test-skill")}
        onClose={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(mockReadFile).toHaveBeenCalledWith("test-skill", "SKILL.md");
    });

    const skillNode = screen.getByRole("treeitem", { name: "SKILL.md" });
    const mainNode = screen.getByRole("treeitem", { name: "main.md" });

    skillNode.focus();
    fireEvent.keyDown(skillNode, { key: "ArrowDown" });

    expect(mainNode).toHaveFocus();
  });

  it("バックアップ一覧を表示し、復元処理を実行する", async () => {
    mockListBackups.mockResolvedValue([
      {
        filename: "SKILL.md.backup.1700000000000",
        relativePath: "SKILL.md.backup.1700000000000",
        originalPath: "SKILL.md",
        type: "backup",
        timestamp: 1700000000000,
        createdAt: new Date("2026-02-26T00:00:00Z"),
      },
    ]);

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <SkillEditor
        skill={createSkill("/Users/test/.aiworkflow/skills/test-skill")}
        onClose={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(mockReadFile).toHaveBeenCalledWith("test-skill", "SKILL.md");
    });

    fireEvent.click(screen.getByRole("button", { name: "バックアップ一覧" }));

    await waitFor(() => {
      expect(mockListBackups).toHaveBeenCalledWith("test-skill");
    });

    fireEvent.click(
      screen.getByRole("button", { name: "バックアップを復元: SKILL.md" }),
    );

    await waitFor(() => {
      expect(mockRestoreBackup).toHaveBeenCalledWith(
        "test-skill",
        "SKILL.md.backup.1700000000000",
      );
    });

    confirmSpy.mockRestore();
  });
});
