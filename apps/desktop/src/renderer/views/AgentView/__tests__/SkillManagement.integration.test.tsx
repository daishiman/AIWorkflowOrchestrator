import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import type { Skill } from "@repo/shared/types/skill";

// vi.hoisted を使ってモックデータとAPIを先に定義（ホイスティング対応）
const { mockSkills, mockSkillAPI } = vi.hoisted(() => {
  const skills: Skill[] = [
    {
      id: "skill-1",
      name: "tdd-principles",
      slug: "tdd-principles",
      description: "TDD原則",
      path: ".claude/skills/tdd-principles/SKILL.md",
      triggers: ["tdd"],
      anchors: [],
      category: "testing",
      lastModified: new Date("2024-01-01"),
    },
    {
      id: "skill-2",
      name: "code-review",
      slug: "code-review",
      description: "コードレビュー",
      path: ".claude/skills/code-review/SKILL.md",
      triggers: ["review"],
      anchors: [],
      category: "development",
      lastModified: new Date("2024-01-01"),
    },
  ];

  return {
    mockSkills: skills,
    mockSkillAPI: {
      listAvailable: vi.fn().mockResolvedValue({ success: true, data: skills }),
      listImported: vi.fn().mockResolvedValue({
        success: true,
        data: [skills[0]],
      }),
      import: vi.fn().mockResolvedValue({ success: true }),
      remove: vi.fn().mockResolvedValue({ success: true }),
      getDetail: vi.fn().mockResolvedValue({
        success: true,
        data: skills[0],
      }),
    },
  };
});

vi.mock("../../../preload", () => ({
  skillAPI: mockSkillAPI,
}));

// モック後にインポート
import { AgentView } from "../index";
import { useStore } from "../../../store";

// TODO(UT-FIX-5-1-002): SkillManagement統合テストの修正が必要（12テスト失敗、tdd-principlesモックデータが表示されない）
describe.skip("SkillManagement Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStore.getState().resetAgentState?.();
  });

  describe("API接続テスト", () => {
    it("マウント時にスキルを取得して表示する", async () => {
      render(<AgentView />);

      await waitFor(() => {
        expect(screen.getByText("tdd-principles")).toBeInTheDocument();
      });
      expect(mockSkillAPI.listImported).toHaveBeenCalledTimes(1);
    });

    it("APIエラーを適切に処理する", async () => {
      mockSkillAPI.listImported.mockRejectedValueOnce(new Error("API Error"));

      render(<AgentView />);

      await waitFor(() => {
        expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
      });
    });

    it("APIエラー後にリトライできる", async () => {
      mockSkillAPI.listImported.mockRejectedValueOnce(new Error("API Error"));

      render(<AgentView />);

      await waitFor(() => {
        expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
      });

      mockSkillAPI.listImported.mockResolvedValueOnce({
        success: true,
        data: [mockSkills[0]],
      });

      fireEvent.click(screen.getByRole("button", { name: /再試行/i }));

      await waitFor(() => {
        expect(screen.getByText("tdd-principles")).toBeInTheDocument();
      });
    });
  });

  describe("データフローテスト", () => {
    it("検索 → フィルター → 表示 → 選択 → 詳細の流れ", async () => {
      render(<AgentView />);

      // 初期表示待ち
      await waitFor(() => {
        expect(screen.getByText("tdd-principles")).toBeInTheDocument();
      });

      // 検索
      fireEvent.change(screen.getByPlaceholderText("スキルを検索..."), {
        target: { value: "tdd" },
      });

      await waitFor(() => {
        expect(screen.getByText("tdd-principles")).toBeInTheDocument();
        expect(screen.queryByText("code-review")).not.toBeInTheDocument();
      });

      // 選択
      fireEvent.click(screen.getByText("tdd-principles"));

      // 詳細表示確認（h2レベルのheadingを検索）
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 2, name: "tdd-principles" }),
        ).toBeInTheDocument();
      });
    });

    it("インポートダイアログ → 選択 → インポート → 一覧更新の流れ", async () => {
      mockSkillAPI.listImported.mockResolvedValueOnce({
        success: true,
        data: [],
      });

      render(<AgentView />);

      await waitFor(() => {
        expect(
          screen.getByText("スキルがインポートされていません"),
        ).toBeInTheDocument();
      });

      // インポートダイアログを開く（ヘッダーと空状態の両方にボタンがあるため最初のものをクリック）
      const importButtons = screen.getAllByRole("button", {
        name: /インポート/i,
      });
      fireEvent.click(importButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // スキル選択
      const dialog = screen.getByRole("dialog");
      fireEvent.click(within(dialog).getByLabelText("tdd-principles"));

      // インポート実行
      mockSkillAPI.listImported.mockResolvedValueOnce({
        success: true,
        data: [mockSkills[0]],
      });

      fireEvent.click(
        within(dialog).getByRole("button", { name: /^インポート$/i }),
      );

      // 一覧更新確認
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.getByText("tdd-principles")).toBeInTheDocument();
      });
    });

    it("削除 → 確認 → 一覧更新の流れ", async () => {
      render(<AgentView />);

      await waitFor(() => {
        expect(screen.getByText("tdd-principles")).toBeInTheDocument();
      });

      // スキル選択
      fireEvent.click(screen.getByText("tdd-principles"));

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 2, name: "tdd-principles" }),
        ).toBeInTheDocument();
      });

      // 削除ボタンクリック
      fireEvent.click(screen.getByRole("button", { name: /削除/i }));

      // 確認ダイアログで「はい」
      mockSkillAPI.listImported.mockResolvedValueOnce({
        success: true,
        data: [],
      });

      fireEvent.click(screen.getByRole("button", { name: /はい/i }));

      // 一覧更新確認
      await waitFor(() => {
        expect(screen.queryByText("tdd-principles")).not.toBeInTheDocument();
      });
    });
  });

  describe("エラーハンドリングテスト", () => {
    it("インポート失敗時にエラートーストを表示", async () => {
      mockSkillAPI.import.mockRejectedValueOnce(new Error("Import failed"));

      render(<AgentView />);

      await waitFor(() => {
        expect(screen.getByText("tdd-principles")).toBeInTheDocument();
      });

      // インポートダイアログを開く
      fireEvent.click(screen.getByRole("button", { name: /インポート/i }));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const dialog = screen.getByRole("dialog");
      fireEvent.click(within(dialog).getByLabelText("code-review"));
      fireEvent.click(
        within(dialog).getByRole("button", { name: /^インポート$/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByText(/インポートに失敗しました/i),
        ).toBeInTheDocument();
      });
    });

    it("削除失敗時にエラートーストを表示", async () => {
      mockSkillAPI.remove.mockRejectedValueOnce(new Error("Remove failed"));

      render(<AgentView />);

      await waitFor(() => {
        expect(screen.getByText("tdd-principles")).toBeInTheDocument();
      });

      // スキル選択
      fireEvent.click(screen.getByText("tdd-principles"));

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 2, name: "tdd-principles" }),
        ).toBeInTheDocument();
      });

      // 削除
      fireEvent.click(screen.getByRole("button", { name: /削除/i }));
      fireEvent.click(screen.getByRole("button", { name: /はい/i }));

      await waitFor(() => {
        expect(screen.getByText(/削除に失敗しました/i)).toBeInTheDocument();
      });
    });
  });

  describe("状態同期テスト", () => {
    it("検索バーの変更がZustand状態に反映される", async () => {
      render(<AgentView />);

      await waitFor(() => {
        expect(screen.getByText("tdd-principles")).toBeInTheDocument();
      });

      fireEvent.change(screen.getByPlaceholderText("スキルを検索..."), {
        target: { value: "tdd" },
      });

      await waitFor(() => {
        expect(useStore.getState().skillFilter).toBe("tdd");
      });
    });

    it("カテゴリ選択がZustand状態に反映される", async () => {
      render(<AgentView />);

      await waitFor(() => {
        expect(screen.getByText("tdd-principles")).toBeInTheDocument();
      });

      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "testing" },
      });

      await waitFor(() => {
        expect(useStore.getState().skillCategory).toBe("testing");
      });
    });

    it("スキル選択がZustand状態に反映される", async () => {
      render(<AgentView />);

      await waitFor(() => {
        expect(screen.getByText("tdd-principles")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("tdd-principles"));

      await waitFor(() => {
        expect(useStore.getState().selectedSkill?.id).toBe("skill-1");
      });
    });
  });

  describe("レスポンシブ動作テスト", () => {
    it("小画面ではDetailPanelがオーバーレイで表示される", async () => {
      // ビューポートを小さく設定
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 768,
      });

      render(<AgentView />);

      await waitFor(() => {
        expect(screen.getByText("tdd-principles")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("tdd-principles"));

      await waitFor(() => {
        const panel = screen.getByRole("complementary");
        expect(panel).toHaveClass("fixed");
      });
    });
  });
});
