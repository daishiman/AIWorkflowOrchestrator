/**
 * SkillManagementPanel route classification テスト
 *
 * TASK-SDK-05: advanced / secondary route の位置づけ検証。
 * SkillManagementPanel は secondary route であり、primary route の代替にならない。
 *
 * RG-04: advanced panel を開いても primary route の説明が揺れない
 * RG-05: lifecycle panel の onOpenWizard は secondary route 内移動
 * RG-09: Task06 の improve surface を Task05 テストへ混在させない
 *
 * P39対策: happy-dom環境のため fireEvent を使用
 * P31対策: 子コンポーネントをモックして個別セレクタの問題を回避
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ImportedSkill, SkillMetadata } from "@repo/shared";

// --- Store モック ---
const mockFetchSkills = vi.fn().mockResolvedValue(undefined);
const mockImportSkill = vi.fn().mockResolvedValue(undefined);
const mockRemoveSkill = vi.fn().mockResolvedValue(undefined);
const mockClearSkillError = vi.fn();

type MockStoreState = {
  availableSkillsMetadata: SkillMetadata[];
  importedSkills: ImportedSkill[];
  skillError: string | null;
  isLoadingSkills: boolean;
  isImporting: boolean;
  importingSkillName: SkillMetadata["name"] | null;
  fetchSkills: ReturnType<typeof vi.fn>;
  importSkill: ReturnType<typeof vi.fn>;
  removeSkill: ReturnType<typeof vi.fn>;
  clearSkillError: ReturnType<typeof vi.fn>;
};

let currentStoreState: MockStoreState = {
  availableSkillsMetadata: [],
  importedSkills: [],
  skillError: null,
  isLoadingSkills: false,
  isImporting: false,
  importingSkillName: null,
  fetchSkills: mockFetchSkills,
  importSkill: mockImportSkill,
  removeSkill: mockRemoveSkill,
  clearSkillError: mockClearSkillError,
};

function selectFromStore<T>(selector: (state: MockStoreState) => T): T {
  return selector(currentStoreState);
}

vi.mock("../../../store", () => {
  const useAppStore = Object.assign(
    <T,>(selector: (state: MockStoreState) => T) => selectFromStore(selector),
    {
      getState: () => currentStoreState,
    },
  );

  return {
    useAvailableSkillsMetadata: () => currentStoreState.availableSkillsMetadata,
    useImportedSkills: () => currentStoreState.importedSkills,
    useSkillError: () => currentStoreState.skillError,
    useIsLoadingSkills: () => currentStoreState.isLoadingSkills,
    useIsImportingSkill: () => currentStoreState.isImporting,
    useImportingSkillName: () => currentStoreState.importingSkillName,
    useFetchSkills: () => currentStoreState.fetchSkills,
    useRemoveSkill: () => currentStoreState.removeSkill,
    useClearSkillError: () => currentStoreState.clearSkillError,
    useAppStore,
  };
});

vi.mock("@/renderer/store", () => {
  const useAppStore = Object.assign(
    <T,>(selector: (state: MockStoreState) => T) => selectFromStore(selector),
    {
      getState: () => currentStoreState,
    },
  );

  return {
    useAvailableSkillsMetadata: () => currentStoreState.availableSkillsMetadata,
    useImportedSkills: () => currentStoreState.importedSkills,
    useSkillError: () => currentStoreState.skillError,
    useIsLoadingSkills: () => currentStoreState.isLoadingSkills,
    useIsImportingSkill: () => currentStoreState.isImporting,
    useImportingSkillName: () => currentStoreState.importingSkillName,
    useFetchSkills: () => currentStoreState.fetchSkills,
    useRemoveSkill: () => currentStoreState.removeSkill,
    useClearSkillError: () => currentStoreState.clearSkillError,
    useAppStore,
  };
});

// --- 子コンポーネント モック ---
vi.mock("../SkillEditor", () => ({
  SkillEditor: ({ onClose }: { skill: ImportedSkill; onClose: () => void }) => (
    <div data-testid="skill-editor">
      <button onClick={onClose}>閉じる</button>
    </div>
  ),
}));

vi.mock("../SkillAnalysisView", () => ({
  SkillAnalysisView: ({
    onClose,
  }: {
    skillName: string;
    onClose: () => void;
  }) => (
    <div data-testid="skill-analysis-view">
      <button onClick={onClose}>閉じる</button>
    </div>
  ),
}));

vi.mock("../SkillCreateWizard", () => ({
  SkillCreateWizard: React.forwardRef<HTMLDivElement, { onClose: () => void }>(
    ({ onClose }, ref) => (
      <div ref={ref} data-testid="skill-create-wizard">
        <button onClick={onClose}>閉じる</button>
      </div>
    ),
  ),
}));

vi.mock("../SkillLifecyclePanel", () => ({
  SkillLifecyclePanel: ({
    onClose,
    onOpenWizard,
  }: {
    onClose: () => void;
    onOpenWizard: () => void;
  }) => (
    <div data-testid="skill-lifecycle-panel">
      <button onClick={onClose} data-testid="lifecycle-close">
        閉じる
      </button>
      <button onClick={onOpenWizard} data-testid="lifecycle-open-wizard">
        詳細ウィザード
      </button>
    </div>
  ),
}));

import { SkillManagementPanel } from "../SkillManagementPanel";

beforeEach(() => {
  vi.clearAllMocks();
  currentStoreState = {
    availableSkillsMetadata: [],
    importedSkills: [],
    skillError: null,
    isLoadingSkills: false,
    isImporting: false,
    importingSkillName: null,
    fetchSkills: mockFetchSkills,
    importSkill: mockImportSkill,
    removeSkill: mockRemoveSkill,
    clearSkillError: mockClearSkillError,
  };
});

afterEach(() => {
  cleanup();
});

describe("SkillManagementPanel route classification (TASK-SDK-05)", () => {
  it("RG-04: list view は skill-management-panel data-testid を持つ（advanced shell）", () => {
    render(<SkillManagementPanel />);

    expect(screen.getByTestId("skill-management-panel")).toBeInTheDocument();
  });

  it("RG-04: create view は data-route-kind='secondary' を持つ", () => {
    render(<SkillManagementPanel />);

    fireEvent.click(screen.getByTestId("skill-management-create-button"));

    const createView = screen.getByTestId("skill-management-panel-create-view");
    expect(createView).toHaveAttribute("data-route-kind", "secondary");
  });

  it("RG-04: lifecycle view は data-route-kind='secondary' を持つ", () => {
    render(<SkillManagementPanel />);

    fireEvent.click(screen.getByTestId("skill-management-lifecycle-button"));

    const lifecycleView = screen.getByTestId(
      "skill-management-panel-lifecycle-view",
    );
    expect(lifecycleView).toHaveAttribute("data-route-kind", "secondary");
  });

  it("RG-05: onOpenWizard は secondary route 内の移動であり create view に切り替わる", () => {
    render(<SkillManagementPanel />);

    // lifecycle view を開く
    fireEvent.click(screen.getByTestId("skill-management-lifecycle-button"));
    expect(
      screen.getByTestId("skill-management-panel-lifecycle-view"),
    ).toBeInTheDocument();

    // onOpenWizard で create view に切り替わる
    fireEvent.click(screen.getByTestId("lifecycle-open-wizard"));
    expect(
      screen.getByTestId("skill-management-panel-create-view"),
    ).toBeInTheDocument();

    // secondary route 内の移動であることを確認
    const createView = screen.getByTestId("skill-management-panel-create-view");
    expect(createView).toHaveAttribute("data-route-kind", "secondary");
  });

  it("RG-05: create view の close は list に戻る（secondary route 内で完結）", () => {
    render(<SkillManagementPanel />);

    // create view を開く
    fireEvent.click(screen.getByTestId("skill-management-create-button"));
    expect(screen.getByTestId("skill-create-wizard")).toBeInTheDocument();

    // close で list に戻る
    fireEvent.click(screen.getByText("閉じる"));
    expect(screen.getByTestId("skill-management-panel")).toBeInTheDocument();
  });

  it("RG-09: SkillManagementPanel は verify / improve CTA を primary entry として持たない", () => {
    render(<SkillManagementPanel />);

    // Task06 管轄の verify / improve ボタンが primary entry として存在しない
    expect(screen.queryByTestId("verify-cta")).toBeNull();
    expect(screen.queryByTestId("improve-cta")).toBeNull();
  });
});

describe("SkillManagementPanel negative cases (TASK-SDK-05)", () => {
  it("SkillLifecyclePanel を primary create entry として扱わない", () => {
    render(<SkillManagementPanel />);

    // lifecycle ボタンのテキストは「ライフサイクルを開始」であり、「新規作成」ではない
    const lifecycleBtn = screen.getByTestId(
      "skill-management-lifecycle-button",
    );
    expect(lifecycleBtn).not.toHaveTextContent("新規作成");
    expect(lifecycleBtn).toHaveTextContent("ライフサイクルを開始");
  });

  it("create ボタンは「詳細ウィザード」であり primary entry ラベルではない", () => {
    render(<SkillManagementPanel />);

    const createBtn = screen.getByTestId("skill-management-create-button");
    expect(createBtn).toHaveTextContent("詳細ウィザード");
    expect(createBtn).not.toHaveTextContent("作成を始める");
  });
});
