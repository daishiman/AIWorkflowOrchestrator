/**
 * @vitest-environment happy-dom
 *
 * SkillManagementPanel Component Tests
 *
 * Tests for TASK-10A-A: SkillManagementPanel component.
 * Covers rendering, search, view transitions, skill operations,
 * loading states, and accessibility.
 *
 * @module @repo/desktop/renderer/components/skill/__tests__/SkillManagementPanel
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  act,
  within,
} from "@testing-library/react";
import type { ImportedSkill } from "@repo/shared";

// --- Mock functions ---
const mockFetchSkills = vi.fn().mockResolvedValue(undefined);
const mockRemoveSkill = vi.fn().mockResolvedValue(undefined);

// --- Test data ---
const defaultStoreState = {
  importedSkills: [
    {
      name: "skill-alpha" as unknown as ImportedSkill["name"],
      description: "Alpha skill for testing",
      path: "/skills/skill-alpha",
      allowedTools: ["Read", "Write"],
      updatedAt: new Date("2026-01-01"),
      importedAt: new Date("2026-02-01"),
      status: "active" as const,
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    },
    {
      name: "skill-beta" as unknown as ImportedSkill["name"],
      description: "Beta skill for search testing",
      path: "/skills/skill-beta",
      allowedTools: [],
      updatedAt: new Date("2026-01-15"),
      importedAt: new Date("2026-02-10"),
      status: "active" as const,
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    },
  ] as ImportedSkill[],
  isLoadingSkills: false,
  skillError: null as string | null,
  fetchSkills: mockFetchSkills,
  removeSkill: mockRemoveSkill,
};

let currentStoreState = { ...defaultStoreState };

// --- Mock store module with individual selectors (P31) ---
vi.mock("../../../store", () => ({
  useImportedSkills: () => currentStoreState.importedSkills,
  useIsLoadingSkills: () => currentStoreState.isLoadingSkills,
  useSkillError: () => currentStoreState.skillError,
  useFetchSkills: () => currentStoreState.fetchSkills,
  useRemoveSkill: () => currentStoreState.removeSkill,
}));

vi.mock("@/renderer/store", () => ({
  useImportedSkills: () => currentStoreState.importedSkills,
  useIsLoadingSkills: () => currentStoreState.isLoadingSkills,
  useSkillError: () => currentStoreState.skillError,
  useFetchSkills: () => currentStoreState.fetchSkills,
  useRemoveSkill: () => currentStoreState.removeSkill,
}));

// --- Mock SkillEditor ---
vi.mock("../SkillEditor", () => ({
  SkillEditor: ({
    skill,
    onClose,
  }: {
    skill: ImportedSkill;
    onClose: () => void;
  }) => (
    <div data-testid="skill-editor">
      <span data-testid="editor-skill-name">{String(skill.name)}</span>
      <button onClick={onClose}>閉じる</button>
    </div>
  ),
}));

// --- Mock SkillAnalysisView ---
vi.mock("../SkillAnalysisView", () => ({
  SkillAnalysisView: ({
    skillName,
    onClose,
  }: {
    skillName: string;
    onClose: () => void;
  }) => (
    <div data-testid="skill-analysis-view">
      <span data-testid="analysis-skill-name">{skillName}</span>
      <button onClick={onClose}>閉じる</button>
    </div>
  ),
}));

// --- Mock SkillCreateWizard ---
vi.mock("../SkillCreateWizard", () => ({
  SkillCreateWizard: React.forwardRef<HTMLDivElement, { onClose: () => void }>(
    ({ onClose }, ref) => (
      <div ref={ref} data-testid="skill-create-wizard">
        <button onClick={onClose}>閉じる</button>
      </div>
    ),
  ),
}));

// --- Import component under test ---
import { SkillManagementPanel } from "../SkillManagementPanel";

// --- Setup / Teardown ---
beforeEach(() => {
  vi.clearAllMocks();
  currentStoreState = {
    ...defaultStoreState,
    fetchSkills: mockFetchSkills,
    removeSkill: mockRemoveSkill,
  };
});

afterEach(() => {
  cleanup();
});

// ============================================================
// TC-001 ~ TC-006: レンダリング
// ============================================================
describe("レンダリング", () => {
  it("TC-001: パネルタイトル「スキル管理」が表示される", () => {
    render(<SkillManagementPanel />);
    expect(screen.getByText("スキル管理")).toBeDefined();
  });

  it("TC-002: 「新規作成」ボタンが表示される", () => {
    render(<SkillManagementPanel />);
    expect(screen.getByText("新規作成")).toBeDefined();
  });

  it("TC-003: 検索入力フィールドが表示される", () => {
    render(<SkillManagementPanel />);
    const searchInput = screen.getByPlaceholderText("スキルを検索...");
    expect(searchInput).toBeDefined();
  });

  it("TC-004: インポート済みスキルがカードとして表示される", () => {
    render(<SkillManagementPanel />);
    expect(screen.getByText("skill-alpha")).toBeDefined();
    expect(screen.getByText("skill-beta")).toBeDefined();
  });

  it("TC-005: スキルの説明文が表示される", () => {
    render(<SkillManagementPanel />);
    expect(screen.getByText("Alpha skill for testing")).toBeDefined();
    expect(screen.getByText("Beta skill for search testing")).toBeDefined();
  });

  it("TC-006: スキルが0件の場合、空状態メッセージが表示される", () => {
    currentStoreState = {
      ...currentStoreState,
      importedSkills: [],
    };
    render(<SkillManagementPanel />);
    expect(
      screen.getByText("インポート済みのスキルはありません"),
    ).toBeDefined();
  });
});

// ============================================================
// TC-007 ~ TC-010: 検索機能
// ============================================================
describe("検索機能", () => {
  it("TC-007: スキル名で検索フィルタリングできる", () => {
    render(<SkillManagementPanel />);
    const searchInput = screen.getByPlaceholderText("スキルを検索...");
    fireEvent.change(searchInput, { target: { value: "alpha" } });

    expect(screen.getByText("skill-alpha")).toBeDefined();
    expect(screen.queryByText("skill-beta")).toBeNull();
  });

  it("TC-008: 説明文で検索フィルタリングできる", () => {
    render(<SkillManagementPanel />);
    const searchInput = screen.getByPlaceholderText("スキルを検索...");
    fireEvent.change(searchInput, { target: { value: "search testing" } });

    expect(screen.queryByText("skill-alpha")).toBeNull();
    expect(screen.getByText("skill-beta")).toBeDefined();
  });

  it("TC-009: 大文字小文字を区別せずに検索できる", () => {
    render(<SkillManagementPanel />);
    const searchInput = screen.getByPlaceholderText("スキルを検索...");
    fireEvent.change(searchInput, { target: { value: "ALPHA" } });

    expect(screen.getByText("skill-alpha")).toBeDefined();
    expect(screen.queryByText("skill-beta")).toBeNull();
  });

  it("TC-010: 一致するスキルがない場合、検索結果なしメッセージが表示される", () => {
    render(<SkillManagementPanel />);
    const searchInput = screen.getByPlaceholderText("スキルを検索...");
    fireEvent.change(searchInput, {
      target: { value: "nonexistent-skill" },
    });

    expect(
      screen.getByText("検索条件に一致するスキルはありません"),
    ).toBeDefined();
  });
});

// ============================================================
// TC-011 ~ TC-015: ビュー遷移
// ============================================================
describe("ビュー遷移", () => {
  it("TC-011: 編集ボタンクリックでエディタービューに遷移する", async () => {
    render(<SkillManagementPanel />);

    const editButton = screen.getByLabelText("skill-alpha を編集");
    await act(async () => {
      fireEvent.click(editButton);
    });

    const editor = screen.getByTestId("skill-editor");
    expect(editor).toBeDefined();
    expect(screen.getByTestId("editor-skill-name").textContent).toBe(
      "skill-alpha",
    );
  });

  it("TC-012: 分析ボタンクリックで分析ビューに遷移する", async () => {
    render(<SkillManagementPanel />);

    const analyzeButton = screen.getByLabelText("skill-alpha を分析");
    await act(async () => {
      fireEvent.click(analyzeButton);
    });

    expect(screen.getByTestId("skill-analysis-view")).toBeDefined();
  });

  it("TC-013: 新規作成ボタンクリックで作成ビューに遷移する", async () => {
    render(<SkillManagementPanel />);

    const createButton = screen.getByText("新規作成");
    await act(async () => {
      fireEvent.click(createButton);
    });

    expect(screen.getByTestId("skill-create-wizard")).toBeDefined();
  });

  it("TC-014: エディターの閉じるボタンでリストビューに戻る", async () => {
    render(<SkillManagementPanel />);

    // エディタービューへ遷移
    const editButton = screen.getByLabelText("skill-alpha を編集");
    await act(async () => {
      fireEvent.click(editButton);
    });
    expect(screen.getByTestId("skill-editor")).toBeDefined();

    // 閉じるボタンでリストに戻る
    const closeButton = screen.getByText("閉じる");
    await act(async () => {
      fireEvent.click(closeButton);
    });

    expect(screen.queryByTestId("skill-editor")).toBeNull();
    expect(screen.getByText("スキル管理")).toBeDefined();
  });

  it("TC-015: 分析/作成ビューの閉じるボタンでリストビューに戻る", async () => {
    render(<SkillManagementPanel />);

    // 分析ビューへ遷移
    const analyzeButton = screen.getByLabelText("skill-alpha を分析");
    await act(async () => {
      fireEvent.click(analyzeButton);
    });
    expect(screen.getByTestId("skill-analysis-view")).toBeDefined();

    // 閉じるボタンでリストに戻る
    const closeButton = screen.getByText("閉じる");
    await act(async () => {
      fireEvent.click(closeButton);
    });

    expect(screen.queryByTestId("skill-analysis-view")).toBeNull();
    expect(screen.getByText("スキル管理")).toBeDefined();
  });
});

// ============================================================
// TC-016 ~ TC-018: スキル操作
// ============================================================
describe("スキル操作", () => {
  it("TC-016: 削除ボタンで確認ダイアログが表示される", async () => {
    render(<SkillManagementPanel />);

    const deleteButton = screen.getByLabelText("skill-alpha を削除");
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(screen.getByText("削除確認")).toBeDefined();
    expect(
      screen.getByText(/skill-alpha を削除してもよろしいですか？/),
    ).toBeDefined();
  });

  it("TC-017: 確認ダイアログで削除を実行するとremoveSkillが呼ばれる", async () => {
    render(<SkillManagementPanel />);

    // 削除ボタンクリック
    const deleteButton = screen.getByLabelText("skill-alpha を削除");
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // 確認ダイアログで「削除」をクリック
    const confirmButton = screen.getByText("削除する");
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(mockRemoveSkill).toHaveBeenCalledWith("skill-alpha");
  });

  it("TC-018: 確認ダイアログでキャンセルすると削除されない", async () => {
    render(<SkillManagementPanel />);

    // 削除ボタンクリック
    const deleteButton = screen.getByLabelText("skill-alpha を削除");
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // キャンセルクリック
    const cancelButton = screen.getByText("キャンセル");
    await act(async () => {
      fireEvent.click(cancelButton);
    });

    expect(mockRemoveSkill).not.toHaveBeenCalled();
    expect(screen.queryByText("削除確認")).toBeNull();
  });
});

// ============================================================
// TC-019 ~ TC-020: ローディング状態
// ============================================================
describe("ローディング状態", () => {
  it("TC-019: ローディング中はローディング表示がされる", () => {
    currentStoreState = {
      ...currentStoreState,
      isLoadingSkills: true,
    };
    render(<SkillManagementPanel />);

    expect(screen.getByText("読み込み中...")).toBeDefined();
  });

  it("TC-020: マウント時にfetchSkillsが呼ばれる", () => {
    render(<SkillManagementPanel />);
    expect(mockFetchSkills).toHaveBeenCalledTimes(1);
  });
});

// ============================================================
// TC-021 ~ TC-023: アクセシビリティ
// ============================================================
describe("アクセシビリティ", () => {
  it("TC-021: スキルリストにrole='list'が設定されている", () => {
    render(<SkillManagementPanel />);
    const list = screen.getByRole("list");
    expect(list).toBeDefined();
  });

  it("TC-022: 各スキルカードにrole='listitem'が設定されている", () => {
    render(<SkillManagementPanel />);
    const listItems = screen.getAllByRole("listitem");
    expect(listItems.length).toBe(2);
  });

  it("TC-023: 各操作ボタンにaria-labelが設定されている", () => {
    render(<SkillManagementPanel />);

    // 編集ボタン
    expect(screen.getByLabelText("skill-alpha を編集")).toBeDefined();
    expect(screen.getByLabelText("skill-beta を編集")).toBeDefined();

    // 分析ボタン
    expect(screen.getByLabelText("skill-alpha を分析")).toBeDefined();
    expect(screen.getByLabelText("skill-beta を分析")).toBeDefined();

    // 削除ボタン
    expect(screen.getByLabelText("skill-alpha を削除")).toBeDefined();
    expect(screen.getByLabelText("skill-beta を削除")).toBeDefined();
  });
});

// ============================================================
// TC-024 ~ TC-028: エッジケース
// ============================================================
describe("エッジケース", () => {
  it("TC-024: スキル0件で空状態メッセージが表示され、リストは非表示", () => {
    currentStoreState = {
      ...currentStoreState,
      importedSkills: [],
    };
    render(<SkillManagementPanel />);

    expect(
      screen.getByText("インポート済みのスキルはありません"),
    ).toBeDefined();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("TC-025: 検索結果0件で「該当なし」メッセージが表示され、リストは非表示", () => {
    render(<SkillManagementPanel />);
    const searchInput = screen.getByPlaceholderText("スキルを検索...");
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    expect(
      screen.getByText("検索条件に一致するスキルはありません"),
    ).toBeDefined();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("TC-026: 100文字の長いスキル名でもレイアウトが崩れない", () => {
    const longName = "a".repeat(100);
    currentStoreState = {
      ...currentStoreState,
      importedSkills: [
        {
          ...currentStoreState.importedSkills[0],
          name: longName as unknown as ImportedSkill["name"],
        },
      ] as ImportedSkill[],
    };
    render(<SkillManagementPanel />);

    expect(screen.getByText(longName)).toBeDefined();
    expect(screen.getByRole("listitem")).toBeDefined();
  });

  it("TC-027: descriptionが空文字列のスキルが正常表示される", () => {
    currentStoreState = {
      ...currentStoreState,
      importedSkills: [
        {
          ...currentStoreState.importedSkills[0],
          description: "",
        },
      ] as ImportedSkill[],
    };
    render(<SkillManagementPanel />);

    expect(screen.getByText("skill-alpha")).toBeDefined();
    expect(screen.getByRole("listitem")).toBeDefined();
  });

  it("TC-028: 検索クエリに特殊文字(.*+?)を含めてもエラーが発生しない", () => {
    render(<SkillManagementPanel />);
    const searchInput = screen.getByPlaceholderText("スキルを検索...");

    // 正規表現の特殊文字を含むクエリ — エラーが発生しないことを確認
    fireEvent.change(searchInput, { target: { value: ".*+?" } });

    expect(
      screen.getByText("検索条件に一致するスキルはありません"),
    ).toBeDefined();
  });
});

// ============================================================
// TC-029 ~ TC-031: エラー状態
// ============================================================
describe("エラー状態", () => {
  it("TC-029: fetchSkillsがrejectしてもクラッシュしない", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const mockFetchReject = vi.fn().mockRejectedValue(new Error("fetch error"));
    currentStoreState = {
      ...currentStoreState,
      fetchSkills: mockFetchReject,
    };

    await act(async () => {
      render(<SkillManagementPanel />);
    });

    expect(screen.getByText("スキル管理")).toBeDefined();
    expect(mockFetchReject).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });

  it("TC-030: removeSkillがrejectしてもクラッシュしない", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      const mockRemoveReject = vi
        .fn()
        .mockRejectedValue(new Error("remove error"));
      currentStoreState = {
        ...currentStoreState,
        removeSkill: mockRemoveReject,
      };

      render(<SkillManagementPanel />);

      // 削除ダイアログを開く
      const deleteButton = screen.getByLabelText("skill-alpha を削除");
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      // 確認ダイアログで削除を実行
      const confirmButton = screen.getByText("削除する");
      await act(async () => {
        fireEvent.click(confirmButton);
        await new Promise((r) => setTimeout(r, 0));
      });

      // コンポーネントがクラッシュしていないことを確認
      expect(screen.getByText("スキル管理")).toBeDefined();
      expect(mockRemoveReject).toHaveBeenCalledTimes(1);
      expect(
        screen.getByText("削除に失敗しました: remove error"),
      ).toBeDefined();
    } finally {
      consoleError.mockRestore();
    }
  });

  it("TC-031: isLoadingSkillsがtrue→falseに変わるとスキル一覧が表示される", () => {
    currentStoreState = {
      ...currentStoreState,
      isLoadingSkills: true,
    };

    const { rerender } = render(<SkillManagementPanel />);
    expect(screen.getByText("読み込み中...")).toBeDefined();
    expect(screen.queryByRole("list")).toBeNull();

    // ローディング完了をシミュレート
    currentStoreState = {
      ...currentStoreState,
      isLoadingSkills: false,
    };

    rerender(<SkillManagementPanel />);
    expect(screen.queryByText("読み込み中...")).toBeNull();
    expect(screen.getByRole("list")).toBeDefined();
    expect(screen.getByText("skill-alpha")).toBeDefined();
  });
});

// ============================================================
// TC-032 ~ TC-034: 統合テスト
// ============================================================
describe("統合テスト", () => {
  it("TC-032: SkillCardのonEditが正しいスキル情報を渡す", async () => {
    render(<SkillManagementPanel />);

    // 2番目のスキル（skill-beta）の編集ボタンをクリック
    const editButton = screen.getByLabelText("skill-beta を編集");
    await act(async () => {
      fireEvent.click(editButton);
    });

    const editor = screen.getByTestId("skill-editor");
    expect(editor).toBeDefined();
    expect(screen.getByTestId("editor-skill-name").textContent).toBe(
      "skill-beta",
    );
  });

  it("TC-033: 削除確認後にリストビューが維持される", async () => {
    render(<SkillManagementPanel />);

    // 削除ダイアログを開く
    const deleteButton = screen.getByLabelText("skill-alpha を削除");
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // 確認ダイアログで削除を実行
    const confirmButton = screen.getByText("削除する");
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    // リストビューが維持されていることを確認
    expect(screen.getByText("スキル管理")).toBeDefined();
    expect(screen.getByPlaceholderText("スキルを検索...")).toBeDefined();
  });

  it("TC-034: 検索後にビュー遷移して戻ると検索クエリが維持される", async () => {
    render(<SkillManagementPanel />);

    // 検索クエリを入力
    const searchInput = screen.getByPlaceholderText("スキルを検索...");
    fireEvent.change(searchInput, { target: { value: "alpha" } });
    expect(screen.getByText("skill-alpha")).toBeDefined();
    expect(screen.queryByText("skill-beta")).toBeNull();

    // 分析ビューへ遷移
    const analyzeButton = screen.getByLabelText("skill-alpha を分析");
    await act(async () => {
      fireEvent.click(analyzeButton);
    });
    expect(screen.getByTestId("skill-analysis-view")).toBeDefined();

    // 閉じるボタンでリストに戻る
    const closeButton = screen.getByText("閉じる");
    await act(async () => {
      fireEvent.click(closeButton);
    });

    // 検索クエリが維持されていることを確認
    const searchInputAfter = screen.getByPlaceholderText("スキルを検索...");
    expect((searchInputAfter as HTMLInputElement).value).toBe("alpha");
    expect(screen.getByText("skill-alpha")).toBeDefined();
    expect(screen.queryByText("skill-beta")).toBeNull();
  });
});

// ============================================================
// TC-035 ~ TC-037: アクセシビリティ拡充
// ============================================================
describe("アクセシビリティ拡充", () => {
  it("TC-035: 各スキルカードのlistitemにスキル情報が含まれる", () => {
    render(<SkillManagementPanel />);
    const listItems = screen.getAllByRole("listitem");
    expect(listItems.length).toBe(2);

    // 各listitemに正しいスキルコンテンツが含まれることを確認
    expect(within(listItems[0]).getByText("skill-alpha")).toBeDefined();
    expect(
      within(listItems[0]).getByText("Alpha skill for testing"),
    ).toBeDefined();
    expect(within(listItems[1]).getByText("skill-beta")).toBeDefined();
    expect(
      within(listItems[1]).getByText("Beta skill for search testing"),
    ).toBeDefined();
  });

  it("TC-036: 削除ボタンのaria-labelにスキル名が含まれる", () => {
    render(<SkillManagementPanel />);

    const deleteAlpha = screen.getByLabelText("skill-alpha を削除");
    const deleteBeta = screen.getByLabelText("skill-beta を削除");

    expect(deleteAlpha.tagName.toLowerCase()).toBe("button");
    expect(deleteBeta.tagName.toLowerCase()).toBe("button");
    expect(deleteAlpha.textContent).toBe("削除");
    expect(deleteBeta.textContent).toBe("削除");
  });

  it("TC-037: 検索入力フィールドにtype=textが設定されている", () => {
    render(<SkillManagementPanel />);
    const searchInput = screen.getByPlaceholderText("スキルを検索...");
    expect((searchInput as HTMLInputElement).type).toBe("text");
  });
});

// ============================================================
// TC-038: パフォーマンス
// ============================================================
describe("パフォーマンス", () => {
  it("TC-038: 100件のスキルでエラーなくレンダリングされる", () => {
    const manySkills = Array.from({ length: 100 }, (_, i) => ({
      name: `skill-${String(i).padStart(3, "0")}` as unknown as ImportedSkill["name"],
      description: `Description for skill ${i}`,
      path: `/skills/skill-${i}`,
      allowedTools: [],
      updatedAt: new Date("2026-01-01"),
      importedAt: new Date("2026-02-01"),
      status: "active" as const,
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    })) as ImportedSkill[];

    currentStoreState = {
      ...currentStoreState,
      importedSkills: manySkills,
    };

    render(<SkillManagementPanel />);
    const listItems = screen.getAllByRole("listitem");
    expect(listItems.length).toBe(100);
  });
});
