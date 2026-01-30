/**
 * SkillImportDialog テスト
 *
 * @module @repo/desktop/renderer/components/skill/__tests__/SkillImportDialog
 * @see Phase 4: テスト作成（TDD: Red → Green）
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SkillImportDialog } from "../SkillImportDialog";
import type { SkillMetadata } from "@repo/shared";
import { useAppStore } from "../../../store";

// useAppStore モック
vi.mock("../../../store", () => ({
  useAppStore: vi.fn(),
}));

// テスト用スキルデータ
const mockSkill: SkillMetadata = {
  name: "test-skill",
  description: "テスト用スキルの説明文です",
  allowedTools: ["Bash", "Read", "Write"],
  path: "/path/to/test-skill",
  updatedAt: new Date("2026-01-30"),
  agents: [
    {
      filename: "agent-1.md",
      relativePath: "agents/agent-1.md",
      description: "エージェント1の説明",
      size: 100,
    },
  ],
  references: [
    {
      filename: "ref-1.md",
      relativePath: "references/ref-1.md",
      description: "参照1の説明",
      size: 200,
    },
  ],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
};

// 全サブリソースを持つスキルデータ
const mockSkillAllResources: SkillMetadata = {
  ...mockSkill,
  name: "full-skill",
  scripts: [
    {
      filename: "setup.sh",
      relativePath: "scripts/setup.sh",
      description: "セットアップスクリプト",
      size: 50,
    },
  ],
  assets: [
    {
      filename: "icon.png",
      relativePath: "assets/icon.png",
      size: 300,
    },
  ],
  schemas: [
    {
      filename: "schema.json",
      relativePath: "schemas/schema.json",
      description: "スキーマ定義",
      size: 150,
    },
  ],
  indexes: [
    {
      filename: "index.md",
      relativePath: "indexes/index.md",
      description: "インデックス",
      size: 80,
    },
  ],
};

// 空のスキルデータ
const mockSkillEmpty: SkillMetadata = {
  name: "empty-skill",
  description: "空のスキル",
  path: "/path/to/empty-skill",
  updatedAt: new Date("2026-01-30"),
  agents: [],
  references: [],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
};

// モック状態のデフォルト値
const defaultMockState = {
  importSkill: vi.fn().mockResolvedValue(undefined),
  isImporting: false,
  importingSkillName: null,
};

describe("SkillImportDialog", () => {
  let mockImportSkill: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockImportSkill = vi.fn().mockResolvedValue(undefined);
    const mockState = {
      ...defaultMockState,
      importSkill: mockImportSkill,
    };
    vi.mocked(useAppStore).mockImplementation(
      (selector: any) => selector(mockState) as unknown,
    );
  });

  describe("表示制御", () => {
    it("TC-401: isOpen=falseのときDOMに存在しない", () => {
      const { container } = render(
        <SkillImportDialog
          skill={mockSkill}
          isOpen={false}
          onClose={vi.fn()}
        />,
      );
      expect(container.innerHTML).toBe("");
    });

    it("TC-402: isOpen=trueのときダイアログが表示される", () => {
      render(
        <SkillImportDialog skill={mockSkill} isOpen={true} onClose={vi.fn()} />,
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("スキル情報表示", () => {
    it("TC-403: スキル名が表示される", () => {
      render(
        <SkillImportDialog skill={mockSkill} isOpen={true} onClose={vi.fn()} />,
      );
      expect(screen.getByText("test-skill")).toBeInTheDocument();
    });

    it("TC-404: スキル説明が表示される", () => {
      render(
        <SkillImportDialog skill={mockSkill} isOpen={true} onClose={vi.fn()} />,
      );
      expect(
        screen.getByText("テスト用スキルの説明文です"),
      ).toBeInTheDocument();
    });

    it("TC-405: 許可ツールが表示される", () => {
      render(
        <SkillImportDialog skill={mockSkill} isOpen={true} onClose={vi.fn()} />,
      );
      expect(screen.getByText("Bash")).toBeInTheDocument();
      expect(screen.getByText("Read")).toBeInTheDocument();
      expect(screen.getByText("Write")).toBeInTheDocument();
    });

    it("TC-406: agents一覧が表示される", () => {
      render(
        <SkillImportDialog skill={mockSkill} isOpen={true} onClose={vi.fn()} />,
      );
      expect(screen.getByText("agent-1.md")).toBeInTheDocument();
      expect(screen.getByText(/エージェント1の説明/)).toBeInTheDocument();
    });

    it("TC-407: references一覧が表示される", () => {
      render(
        <SkillImportDialog skill={mockSkill} isOpen={true} onClose={vi.fn()} />,
      );
      expect(screen.getByText("ref-1.md")).toBeInTheDocument();
      expect(screen.getByText(/参照1の説明/)).toBeInTheDocument();
    });

    it("TC-413: 空配列のセクションが非表示", () => {
      render(
        <SkillImportDialog
          skill={mockSkillEmpty}
          isOpen={true}
          onClose={vi.fn()}
        />,
      );
      expect(screen.queryByText(/サブエージェント/)).not.toBeInTheDocument();
      expect(screen.queryByText(/参照資料/)).not.toBeInTheDocument();
      expect(screen.queryByText(/スクリプト/)).not.toBeInTheDocument();
      expect(screen.queryByText(/アセット/)).not.toBeInTheDocument();
      expect(screen.queryByText(/スキーマ/)).not.toBeInTheDocument();
      expect(screen.queryByText(/インデックス/)).not.toBeInTheDocument();
    });
  });

  describe("インポート操作", () => {
    it("TC-408: インポートボタンクリックでimportSkillが呼ばれる", async () => {
      const user = userEvent.setup();
      render(
        <SkillImportDialog skill={mockSkill} isOpen={true} onClose={vi.fn()} />,
      );

      const importButton = screen.getByRole("button", {
        name: /インポート/,
      });
      await user.click(importButton);

      await waitFor(() => {
        expect(mockImportSkill).toHaveBeenCalledWith("test-skill");
      });
    });

    it("TC-409: インポート中にローディング状態が表示される", () => {
      const mockState = {
        importSkill: vi.fn(),
        isImporting: true,
        importingSkillName: "test-skill",
      };
      vi.mocked(useAppStore).mockImplementation(
        (selector: any) => selector(mockState) as unknown,
      );

      render(
        <SkillImportDialog skill={mockSkill} isOpen={true} onClose={vi.fn()} />,
      );

      expect(screen.getByText(/インポート中/)).toBeInTheDocument();
    });

    it("TC-414: インポート中はボタンがdisabled", () => {
      const mockState = {
        importSkill: vi.fn(),
        isImporting: true,
        importingSkillName: "test-skill",
      };
      vi.mocked(useAppStore).mockImplementation(
        (selector: any) => selector(mockState) as unknown,
      );

      render(
        <SkillImportDialog skill={mockSkill} isOpen={true} onClose={vi.fn()} />,
      );

      const buttons = screen.getAllByRole("button");
      const importButton = buttons.find((btn) =>
        btn.textContent?.includes("インポート中"),
      );
      expect(importButton).toBeDisabled();
    });
  });

  describe("ダイアログ操作", () => {
    it("TC-410: キャンセルボタンでonCloseが呼ばれる", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <SkillImportDialog skill={mockSkill} isOpen={true} onClose={onClose} />,
      );

      const cancelButton = screen.getByRole("button", {
        name: "キャンセル",
      });
      await user.click(cancelButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("TC-411: ×ボタンでonCloseが呼ばれる", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <SkillImportDialog skill={mockSkill} isOpen={true} onClose={onClose} />,
      );

      const closeButton = screen.getByRole("button", {
        name: "閉じる",
      });
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("TC-412: ESCキーでonCloseが呼ばれる", () => {
      const onClose = vi.fn();
      render(
        <SkillImportDialog skill={mockSkill} isOpen={true} onClose={onClose} />,
      );

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("アクセシビリティ", () => {
    it('TC-421: role="dialog"が設定されている', () => {
      render(
        <SkillImportDialog skill={mockSkill} isOpen={true} onClose={vi.fn()} />,
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it('TC-422: aria-modal="true"が設定されている', () => {
      render(
        <SkillImportDialog skill={mockSkill} isOpen={true} onClose={vi.fn()} />,
      );
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    });

    it("TC-423: aria-labelledbyでタイトルと関連付けられている", () => {
      render(
        <SkillImportDialog skill={mockSkill} isOpen={true} onClose={vi.fn()} />,
      );
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-labelledby");
      const labelledById = dialog.getAttribute("aria-labelledby");
      expect(document.getElementById(labelledById!)).toBeInTheDocument();
    });

    it('TC-424: 閉じるボタンにaria-label="閉じる"がある', () => {
      render(
        <SkillImportDialog skill={mockSkill} isOpen={true} onClose={vi.fn()} />,
      );
      const closeButton = screen.getByRole("button", { name: "閉じる" });
      expect(closeButton).toHaveAttribute("aria-label", "閉じる");
    });
  });

  describe("境界値テスト", () => {
    it("TC-601: allowedToolsが空配列の場合セクション非表示", () => {
      const skillNoTools: SkillMetadata = {
        ...mockSkill,
        allowedTools: [],
      };
      render(
        <SkillImportDialog
          skill={skillNoTools}
          isOpen={true}
          onClose={vi.fn()}
        />,
      );
      expect(screen.queryByText(/許可ツール/)).not.toBeInTheDocument();
    });

    it("TC-602: 全サブリソースが空の場合、該当セクションが全て非表示", () => {
      render(
        <SkillImportDialog
          skill={mockSkillEmpty}
          isOpen={true}
          onClose={vi.fn()}
        />,
      );
      // ダイアログ自体は表示される
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      // サブリソースセクションは非表示
      expect(screen.queryByText(/サブエージェント/)).not.toBeInTheDocument();
      expect(screen.queryByText(/参照資料/)).not.toBeInTheDocument();
    });

    it("TC-603: 全サブリソースが存在する場合、全セクションが表示される", () => {
      render(
        <SkillImportDialog
          skill={mockSkillAllResources}
          isOpen={true}
          onClose={vi.fn()}
        />,
      );
      expect(
        screen.getByText(/サブエージェント \(agents\/\)/),
      ).toBeInTheDocument();
      expect(screen.getByText(/参照資料 \(references\/\)/)).toBeInTheDocument();
      expect(screen.getByText(/スクリプト \(scripts\/\)/)).toBeInTheDocument();
      expect(screen.getByText(/アセット \(assets\/\)/)).toBeInTheDocument();
      expect(screen.getByText(/スキーマ \(schemas\/\)/)).toBeInTheDocument();
      expect(
        screen.getByText(/インデックス \(indexes\/\)/),
      ).toBeInTheDocument();
    });

    it("TC-604: descriptionがないResourceListアイテム", () => {
      const skillNoDesc: SkillMetadata = {
        ...mockSkillEmpty,
        assets: [
          {
            filename: "no-desc.png",
            relativePath: "assets/no-desc.png",
            size: 100,
          },
        ],
      };
      render(
        <SkillImportDialog
          skill={skillNoDesc}
          isOpen={true}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByText("no-desc.png")).toBeInTheDocument();
    });

    it("TC-605: descriptionがあるResourceListアイテム", () => {
      render(
        <SkillImportDialog
          skill={mockSkillAllResources}
          isOpen={true}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByText("setup.sh")).toBeInTheDocument();
      expect(screen.getByText(/セットアップスクリプト/)).toBeInTheDocument();
    });

    it("TC-606: allowedToolsがundefinedの場合セクション非表示", () => {
      const skillUndefinedTools: SkillMetadata = {
        ...mockSkill,
        allowedTools: undefined,
      };
      render(
        <SkillImportDialog
          skill={skillUndefinedTools}
          isOpen={true}
          onClose={vi.fn()}
        />,
      );
      expect(screen.queryByText(/許可ツール/)).not.toBeInTheDocument();
    });
  });

  describe("エラーハンドリングテスト", () => {
    it("TC-611: importSkillがエラーをスローした場合、ダイアログが開いたまま維持", async () => {
      const user = userEvent.setup();
      const failingImport = vi
        .fn()
        .mockRejectedValue(new Error("import failed"));
      const mockState = {
        importSkill: failingImport,
        isImporting: false,
        importingSkillName: null,
      };
      vi.mocked(useAppStore).mockImplementation(
        (selector: any) => selector(mockState) as unknown,
      );

      const onClose = vi.fn();
      render(
        <SkillImportDialog skill={mockSkill} isOpen={true} onClose={onClose} />,
      );

      const importButton = screen.getByRole("button", {
        name: /インポート/,
      });
      await user.click(importButton);

      await waitFor(() => {
        expect(failingImport).toHaveBeenCalled();
      });
      // ダイアログは閉じない（onCloseは呼ばれない）
      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("TC-612: インポート中はESCキーでcloseされない", () => {
      const mockState = {
        importSkill: vi.fn(),
        isImporting: true,
        importingSkillName: "test-skill",
      };
      vi.mocked(useAppStore).mockImplementation(
        (selector: any) => selector(mockState) as unknown,
      );

      const onClose = vi.fn();
      render(
        <SkillImportDialog skill={mockSkill} isOpen={true} onClose={onClose} />,
      );

      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("インタラクションテスト", () => {
    it("TC-621: インポート成功後にダイアログが閉じる", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <SkillImportDialog skill={mockSkill} isOpen={true} onClose={onClose} />,
      );

      const importButton = screen.getByRole("button", {
        name: /インポート/,
      });
      await user.click(importButton);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    it("TC-622: 複数回キャンセルボタンをクリック", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <SkillImportDialog skill={mockSkill} isOpen={true} onClose={onClose} />,
      );

      const cancelButton = screen.getByRole("button", {
        name: "キャンセル",
      });
      await user.click(cancelButton);
      await user.click(cancelButton);
      await user.click(cancelButton);

      expect(onClose).toHaveBeenCalledTimes(3);
    });
  });

  describe("フォーカストラップテスト", () => {
    it("TC-631: Tabキーでフォーカスがダイアログ内の最後の要素から最初に戻る", () => {
      render(
        <SkillImportDialog skill={mockSkill} isOpen={true} onClose={vi.fn()} />,
      );

      const dialog = screen.getByRole("dialog");
      const buttons = dialog.querySelectorAll("button");
      const lastButton = buttons[buttons.length - 1];

      // 最後のボタンにフォーカス
      (lastButton as HTMLElement).focus();
      expect(document.activeElement).toBe(lastButton);

      // Tabキーでフォーカスが最初に戻る
      fireEvent.keyDown(dialog, { key: "Tab" });
      expect(document.activeElement).toBe(buttons[0]);
    });

    it("TC-632: Shift+Tabで最初の要素から最後に移動する", () => {
      render(
        <SkillImportDialog skill={mockSkill} isOpen={true} onClose={vi.fn()} />,
      );

      const dialog = screen.getByRole("dialog");
      const buttons = dialog.querySelectorAll("button");
      const firstButton = buttons[0];
      const lastButton = buttons[buttons.length - 1];

      // 最初のボタンにフォーカス
      (firstButton as HTMLElement).focus();
      expect(document.activeElement).toBe(firstButton);

      // Shift+Tabで最後に移動
      fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
      expect(document.activeElement).toBe(lastButton);
    });

    it("TC-633: Tab以外のキーではフォーカストラップが動作しない", () => {
      render(
        <SkillImportDialog skill={mockSkill} isOpen={true} onClose={vi.fn()} />,
      );

      const dialog = screen.getByRole("dialog");
      const buttons = dialog.querySelectorAll("button");
      const lastButton = buttons[buttons.length - 1];

      (lastButton as HTMLElement).focus();
      expect(document.activeElement).toBe(lastButton);

      // Enter キーではフォーカス移動しない
      fireEvent.keyDown(dialog, { key: "Enter" });
      expect(document.activeElement).toBe(lastButton);
    });
  });
});
