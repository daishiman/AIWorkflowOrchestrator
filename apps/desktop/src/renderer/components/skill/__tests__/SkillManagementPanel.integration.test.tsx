/**
 * @vitest-environment happy-dom
 *
 * SkillManagementPanel Integration Tests
 *
 * Tests for TASK-10A-D: SkillAnalysisView and SkillCreateWizard integration
 * with SkillManagementPanel. Verifies view transitions, prop passing,
 * and onClose callbacks between parent panel and child components.
 *
 * P39 compliance: Uses fireEvent instead of userEvent for happy-dom environment.
 *
 * @module @repo/desktop/renderer/components/skill/__tests__/SkillManagementPanel.integration
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  act,
} from "@testing-library/react";
import type { ImportedSkill } from "@repo/shared";

// --- Mock functions ---
const mockFetchSkills = vi.fn().mockResolvedValue(undefined);
const mockRemoveSkill = vi.fn().mockResolvedValue(undefined);

// --- Test data ---
const mockSkill: ImportedSkill = {
  name: "test-skill" as unknown as ImportedSkill["name"],
  description: "説明",
  path: "/path",
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
} as ImportedSkill;

const defaultStoreState = {
  importedSkills: [mockSkill] as ImportedSkill[],
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

// --- Mock SkillAnalysisView with props capture ---
let capturedAnalysisProps: Record<string, unknown> = {};
vi.mock("../SkillAnalysisView", () => ({
  SkillAnalysisView: (props: Record<string, unknown>) => {
    capturedAnalysisProps = props;
    return (
      <div data-testid="mock-skill-analysis-view">
        <span data-testid="analysis-skill-name">
          {props.skillName as string}
        </span>
        <button
          data-testid="analysis-close"
          onClick={props.onClose as () => void}
        >
          分析を閉じる
        </button>
      </div>
    );
  },
}));

// --- Mock SkillCreateWizard with props capture ---
let capturedCreateWizardProps: Record<string, unknown> = {};
vi.mock("../SkillCreateWizard", () => ({
  SkillCreateWizard: React.forwardRef<HTMLDivElement, Record<string, unknown>>(
    (props, ref) => {
      capturedCreateWizardProps = props;
      return (
        <div ref={ref} data-testid="mock-skill-create-wizard">
          <button
            data-testid="wizard-close"
            onClick={props.onClose as () => void}
          >
            作成を閉じる
          </button>
        </div>
      );
    },
  ),
}));

// --- Import component under test ---
import { SkillManagementPanel } from "../SkillManagementPanel";

// --- Setup / Teardown ---
beforeEach(() => {
  vi.clearAllMocks();
  capturedAnalysisProps = {};
  capturedCreateWizardProps = {};
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
// TC-SMP-INT-01: Analysis view renders SkillAnalysisView
// ============================================================
describe("TC-SMP-INT-01: Analysis view renders SkillAnalysisView", () => {
  it("currentView='analysis'かつselectedSkillがセットされている場合、SkillAnalysisViewが正しいskillName propで描画される", async () => {
    render(<SkillManagementPanel />);

    // 分析ボタンをクリックして analysis ビューに遷移
    const analyzeButton = screen.getByLabelText("test-skill を分析");
    await act(async () => {
      fireEvent.click(analyzeButton);
    });

    // SkillAnalysisView が描画されていることを確認
    expect(screen.getByTestId("mock-skill-analysis-view")).toBeDefined();

    // data-testid="skill-management-panel-analysis-view" が存在することを確認
    expect(
      screen.getByTestId("skill-management-panel-analysis-view"),
    ).toBeDefined();

    // skillName prop が正しく渡されていることを確認
    expect(capturedAnalysisProps.skillName).toBe("test-skill");
    expect(screen.getByTestId("analysis-skill-name").textContent).toBe(
      "test-skill",
    );

    // onClose prop が関数として渡されていることを確認
    expect(typeof capturedAnalysisProps.onClose).toBe("function");
  });
});

// ============================================================
// TC-SMP-INT-02: Analysis view shows null check
// ============================================================
describe("TC-SMP-INT-02: Analysis view shows null check", () => {
  it("currentView='analysis'でもselectedSkillがnullの場合、SkillAnalysisViewは描画されずリストビューにフォールスルーする", () => {
    // selectedSkill が null の状態を再現: スキル0件でレンダリング
    currentStoreState = {
      ...currentStoreState,
      importedSkills: [],
    };
    render(<SkillManagementPanel />);

    // SkillAnalysisView が描画されないことを確認
    expect(screen.queryByTestId("mock-skill-analysis-view")).toBeNull();
    expect(
      screen.queryByTestId("skill-management-panel-analysis-view"),
    ).toBeNull();

    // リストビュー（空状態）にフォールスルーしていることを確認
    expect(screen.getByText("スキル管理")).toBeDefined();
    expect(
      screen.getByText("インポート済みのスキルはありません"),
    ).toBeDefined();
  });
});

// ============================================================
// TC-SMP-INT-03: Create view renders SkillCreateWizard
// ============================================================
describe("TC-SMP-INT-03: Create view renders SkillCreateWizard", () => {
  it("currentView='create'の場合、SkillCreateWizardが描画される", async () => {
    render(<SkillManagementPanel />);

    // 新規作成ボタンをクリックして create ビューに遷移
    const createButton = screen.getByText("新規作成");
    await act(async () => {
      fireEvent.click(createButton);
    });

    // SkillCreateWizard が描画されていることを確認
    expect(screen.getByTestId("mock-skill-create-wizard")).toBeDefined();

    // data-testid="skill-management-panel-create-view" が存在することを確認
    expect(
      screen.getByTestId("skill-management-panel-create-view"),
    ).toBeDefined();

    // onClose prop が関数として渡されていることを確認
    expect(typeof capturedCreateWizardProps.onClose).toBe("function");
  });
});

// ============================================================
// TC-SMP-INT-04: SkillAnalysisView onClose returns to list
// ============================================================
describe("TC-SMP-INT-04: SkillAnalysisView onClose returns to list", () => {
  it("SkillAnalysisViewのonClose呼び出しでリストビューに戻る", async () => {
    render(<SkillManagementPanel />);

    // 分析ビューに遷移
    const analyzeButton = screen.getByLabelText("test-skill を分析");
    await act(async () => {
      fireEvent.click(analyzeButton);
    });

    // 分析ビューが表示されていることを確認
    expect(screen.getByTestId("mock-skill-analysis-view")).toBeDefined();
    expect(
      screen.getByTestId("skill-management-panel-analysis-view"),
    ).toBeDefined();

    // onClose を呼び出す（モックのボタンをクリック）
    const closeButton = screen.getByTestId("analysis-close");
    await act(async () => {
      fireEvent.click(closeButton);
    });

    // 分析ビューが消えていることを確認
    expect(screen.queryByTestId("mock-skill-analysis-view")).toBeNull();
    expect(
      screen.queryByTestId("skill-management-panel-analysis-view"),
    ).toBeNull();

    // リストビューに戻っていることを確認
    expect(screen.getByText("スキル管理")).toBeDefined();
    expect(screen.getByTestId("skill-management-panel")).toBeDefined();
    expect(screen.getByPlaceholderText("スキルを検索...")).toBeDefined();
    expect(screen.getByText("test-skill")).toBeDefined();
  });
});

// ============================================================
// TC-SMP-INT-05: SkillCreateWizard onClose returns to list
// ============================================================
describe("TC-SMP-INT-05: SkillCreateWizard onClose returns to list", () => {
  it("SkillCreateWizardのonClose呼び出しでリストビューに戻る", async () => {
    render(<SkillManagementPanel />);

    // 作成ビューに遷移
    const createButton = screen.getByText("新規作成");
    await act(async () => {
      fireEvent.click(createButton);
    });

    // 作成ビューが表示されていることを確認
    expect(screen.getByTestId("mock-skill-create-wizard")).toBeDefined();
    expect(
      screen.getByTestId("skill-management-panel-create-view"),
    ).toBeDefined();

    // onClose を呼び出す（モックのボタンをクリック）
    const closeButton = screen.getByTestId("wizard-close");
    await act(async () => {
      fireEvent.click(closeButton);
    });

    // 作成ビューが消えていることを確認
    expect(screen.queryByTestId("mock-skill-create-wizard")).toBeNull();
    expect(
      screen.queryByTestId("skill-management-panel-create-view"),
    ).toBeNull();

    // リストビューに戻っていることを確認
    expect(screen.getByText("スキル管理")).toBeDefined();
    expect(screen.getByTestId("skill-management-panel")).toBeDefined();
    expect(screen.getByPlaceholderText("スキルを検索...")).toBeDefined();
    expect(screen.getByText("test-skill")).toBeDefined();
  });
});

// ============================================================
// TC-SMP-INT-06: Clicking analyze button transitions to analysis view
// ============================================================
describe("TC-SMP-INT-06: Clicking analyze button transitions to analysis view", () => {
  it("リストビューで分析ボタンをクリックするとSkillAnalysisViewが表示される", async () => {
    render(<SkillManagementPanel />);

    // 初期状態ではリストビューが表示されている
    expect(screen.getByText("スキル管理")).toBeDefined();
    expect(screen.getByTestId("skill-management-panel")).toBeDefined();
    expect(screen.getByText("test-skill")).toBeDefined();

    // 分析ボタンをクリック
    const analyzeButton = screen.getByLabelText("test-skill を分析");
    await act(async () => {
      fireEvent.click(analyzeButton);
    });

    // 分析ビューが表示されることを確認
    expect(screen.getByTestId("mock-skill-analysis-view")).toBeDefined();
    expect(
      screen.getByTestId("skill-management-panel-analysis-view"),
    ).toBeDefined();

    // 正しいスキル名が渡されていることを確認
    expect(capturedAnalysisProps.skillName).toBe("test-skill");

    // リストビューが表示されていないことを確認
    expect(screen.queryByTestId("skill-management-panel")).toBeNull();
    expect(screen.queryByPlaceholderText("スキルを検索...")).toBeNull();
  });
});

// ============================================================
// TC-SMP-INT-07: Clicking 新規作成 button transitions to create view
// ============================================================
describe("TC-SMP-INT-07: Clicking 新規作成 button transitions to create view", () => {
  it("リストビューで新規作成ボタンをクリックするとSkillCreateWizardが表示される", async () => {
    render(<SkillManagementPanel />);

    // 初期状態ではリストビューが表示されている
    expect(screen.getByText("スキル管理")).toBeDefined();
    expect(screen.getByTestId("skill-management-panel")).toBeDefined();
    expect(screen.getByText("新規作成")).toBeDefined();

    // 新規作成ボタンをクリック
    const createButton = screen.getByText("新規作成");
    await act(async () => {
      fireEvent.click(createButton);
    });

    // 作成ビューが表示されることを確認
    expect(screen.getByTestId("mock-skill-create-wizard")).toBeDefined();
    expect(
      screen.getByTestId("skill-management-panel-create-view"),
    ).toBeDefined();

    // onClose が関数として渡されていることを確認
    expect(typeof capturedCreateWizardProps.onClose).toBe("function");

    // リストビューが表示されていないことを確認
    expect(screen.queryByTestId("skill-management-panel")).toBeNull();
    expect(screen.queryByPlaceholderText("スキルを検索...")).toBeNull();
  });
});
