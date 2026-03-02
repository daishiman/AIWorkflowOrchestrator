import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BackupMenu } from "../components/BackupMenu";
import type { BackupInfo } from "../components/BackupMenu";

const createBackup = (overrides: Partial<BackupInfo> = {}): BackupInfo => ({
  filename: "SKILL.md.bak",
  relativePath: "backups/SKILL.md.bak",
  originalPath: "SKILL.md",
  type: "backup",
  timestamp: 1709300000000,
  createdAt: new Date("2026-03-01T12:00:00"),
  ...overrides,
});

describe("BackupMenu", () => {
  const mockOnRestore = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // BM-01
  it("isLoading=true で読み込み中メッセージを表示する", () => {
    render(
      <BackupMenu backups={[]} isLoading={true} onRestore={mockOnRestore} />,
    );
    expect(screen.getByTestId("backup-loading")).toBeInTheDocument();
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  // BM-02
  it("空のバックアップリストで空メッセージを表示する", () => {
    render(
      <BackupMenu backups={[]} isLoading={false} onRestore={mockOnRestore} />,
    );
    expect(screen.getByTestId("backup-empty")).toBeInTheDocument();
    expect(screen.getByText("バックアップはありません")).toBeInTheDocument();
  });

  // BM-03
  it("バックアップリストの各項目を menuitem としてレンダリングする", () => {
    const backups = [
      createBackup({ filename: "backup-1.md", relativePath: "b/1.md" }),
      createBackup({ filename: "backup-2.md", relativePath: "b/2.md" }),
    ];
    render(
      <BackupMenu
        backups={backups}
        isLoading={false}
        onRestore={mockOnRestore}
      />,
    );
    const items = screen.getAllByRole("menuitem");
    expect(items).toHaveLength(2);
    expect(screen.getByText("backup-1.md")).toBeInTheDocument();
    expect(screen.getByText("backup-2.md")).toBeInTheDocument();
  });

  // BM-04
  it("menuitem クリック時に onRestore をバックアップパスで呼び出す", () => {
    const backups = [createBackup({ relativePath: "backups/file.bak" })];
    render(
      <BackupMenu
        backups={backups}
        isLoading={false}
        onRestore={mockOnRestore}
      />,
    );
    fireEvent.click(screen.getByRole("menuitem"));
    expect(mockOnRestore).toHaveBeenCalledWith("backups/file.bak");
  });

  // BM-05
  it("バックアップ一覧に role='menu' を付与する", () => {
    const backups = [createBackup()];
    render(
      <BackupMenu
        backups={backups}
        isLoading={false}
        onRestore={mockOnRestore}
      />,
    );
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  // BM-06
  it("バックアップの日付を日本語フォーマットで表示する", () => {
    const backups = [
      createBackup({ createdAt: new Date("2026-03-01T14:30:00") }),
    ];
    render(
      <BackupMenu
        backups={backups}
        isLoading={false}
        onRestore={mockOnRestore}
      />,
    );
    // 日本語ロケールで "03/01 14:30" のようなフォーマット
    const menuitem = screen.getByRole("menuitem");
    expect(menuitem.textContent).toMatch(/\d{2}\/\d{2}/);
  });
});
