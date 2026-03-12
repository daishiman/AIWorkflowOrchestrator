/**
 * @vitest-environment happy-dom
 */

import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type {
  ImportedSkill,
  SkillExecutionStatus,
  SkillMetadata,
  SkillStreamMessage,
} from "@repo/shared";
import type { SkillAnalysis } from "@repo/shared/types/skill-improver";

function buildImportedSkill(
  name: string,
  description: string,
  overrides: Partial<ImportedSkill> = {},
): ImportedSkill {
  return {
    name: name as ImportedSkill["name"],
    description,
    path: `/skills/${name}`,
    allowedTools: [],
    updatedAt: new Date("2026-03-01T00:00:00Z"),
    importedAt: new Date("2026-03-02T00:00:00Z"),
    status: "active",
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
    ...overrides,
  };
}

type MockStoreState = {
  availableSkillsMetadata: SkillMetadata[];
  importedSkills: ImportedSkill[];
  selectedSkillName: string | null;
  isExecuting: boolean;
  skillExecutionStatus: SkillExecutionStatus | null;
  streamingMessages: SkillStreamMessage[];
  currentAnalysis: SkillAnalysis | null;
  isAnalyzing: boolean;
  isImproving: boolean;
  skillError: string | null;
  isLoadingSkills: boolean;
  isImporting: boolean;
  importingSkillName: string | null;
  fetchSkills: ReturnType<typeof vi.fn>;
  removeSkill: ReturnType<typeof vi.fn>;
  clearSkillError: ReturnType<typeof vi.fn>;
  createSkill: ReturnType<typeof vi.fn>;
  selectSkillByName: ReturnType<typeof vi.fn>;
  executeSkill: ReturnType<typeof vi.fn>;
  analyzeSkill: ReturnType<typeof vi.fn>;
  autoImproveSkill: ReturnType<typeof vi.fn>;
};

const mockFetchSkills = vi.fn().mockResolvedValue(undefined);
const mockRemoveSkill = vi.fn().mockResolvedValue(undefined);
const mockClearSkillError = vi.fn(() => {
  currentStoreState = { ...currentStoreState, skillError: null };
});
const mockSelectSkillByName = vi.fn((skillName: string | null) => {
  currentStoreState = { ...currentStoreState, selectedSkillName: skillName };
});

let currentStoreState: MockStoreState;

vi.mock("../../../store", () => ({
  useAvailableSkillsMetadata: () => currentStoreState.availableSkillsMetadata,
  useImportedSkills: () => currentStoreState.importedSkills,
  useSelectedSkillName: () => currentStoreState.selectedSkillName,
  useIsSkillExecuting: () => currentStoreState.isExecuting,
  useSkillExecutionStatus: () => currentStoreState.skillExecutionStatus,
  useStreamingMessages: () => currentStoreState.streamingMessages,
  useCurrentAnalysis: () => currentStoreState.currentAnalysis,
  useIsAnalyzingSkill: () => currentStoreState.isAnalyzing,
  useIsImprovingSkill: () => currentStoreState.isImproving,
  useSkillError: () => currentStoreState.skillError,
  useIsLoadingSkills: () => currentStoreState.isLoadingSkills,
  useIsImportingSkill: () => currentStoreState.isImporting,
  useImportingSkillName: () => currentStoreState.importingSkillName,
  useFetchSkills: () => currentStoreState.fetchSkills,
  useRemoveSkill: () => currentStoreState.removeSkill,
  useClearSkillError: () => currentStoreState.clearSkillError,
  useCreateSkill: () => currentStoreState.createSkill,
  useSelectSkillByName: () => currentStoreState.selectSkillByName,
  useExecuteSkill: () => currentStoreState.executeSkill,
  useAnalyzeSkill: () => currentStoreState.analyzeSkill,
  useAutoImproveSkill: () => currentStoreState.autoImproveSkill,
}));

vi.mock("../SkillEditor", () => ({
  SkillEditor: () => <div data-testid="skill-editor" />,
}));

vi.mock("../SkillAnalysisView", () => ({
  SkillAnalysisView: () => <div data-testid="skill-analysis-view" />,
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

import { SkillManagementPanel } from "../SkillManagementPanel";

function createBaseState(): MockStoreState {
  return {
    availableSkillsMetadata: [],
    importedSkills: [buildImportedSkill("skill-alpha", "Alpha skill")],
    selectedSkillName: null,
    isExecuting: false,
    skillExecutionStatus: null,
    streamingMessages: [],
    currentAnalysis: null,
    isAnalyzing: false,
    isImproving: false,
    skillError: null,
    isLoadingSkills: false,
    isImporting: false,
    importingSkillName: null,
    fetchSkills: mockFetchSkills,
    removeSkill: mockRemoveSkill,
    clearSkillError: mockClearSkillError,
    createSkill: vi.fn(async () => {
      currentStoreState = {
        ...currentStoreState,
        importedSkills: [
          ...currentStoreState.importedSkills,
          buildImportedSkill("new-skill", "新規スキル"),
        ],
      };
      return "/skills/new-skill";
    }),
    selectSkillByName: mockSelectSkillByName,
    executeSkill: vi.fn().mockResolvedValue(undefined),
    analyzeSkill: vi.fn().mockResolvedValue(undefined),
    autoImproveSkill: vi.fn().mockResolvedValue(undefined),
  };
}

describe("SkillManagementPanel lifecycle failure handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentStoreState = createBaseState();
    (
      window as unknown as {
        electronAPI: {
          skillCreator: {
            detectMode: ReturnType<typeof vi.fn>;
            validateSkill: ReturnType<typeof vi.fn>;
          };
        };
      }
    ).electronAPI = {
      skillCreator: {
        detectMode: vi
          .fn()
          .mockResolvedValue({ success: true, data: "create" }),
        validateSkill: vi.fn().mockResolvedValue({ success: true, data: true }),
      },
    };
  });

  afterEach(() => {
    cleanup();
    delete (window as { electronAPI?: unknown }).electronAPI;
  });

  it("detectMode failure 時も create を継続できる", async () => {
    window.electronAPI.skillCreator.detectMode = vi
      .fn()
      .mockRejectedValue(new Error("detect failed"));

    render(<SkillManagementPanel />);

    fireEvent.change(screen.getByLabelText("作成したいスキルを説明"), {
      target: { value: "障害テスト用スキル" },
    });

    await waitFor(() => {
      expect(screen.getByTestId("skill-lifecycle-mode-hint")).toHaveTextContent(
        "判定できませんでした",
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "作成する" }));
    });

    expect(currentStoreState.createSkill).toHaveBeenCalledWith(
      "障害テスト用スキル",
      {
        generateTasks: true,
        addAgents: false,
        addReferences: false,
      },
    );
  });

  it("validateSkill が false を返した場合は validation message を表示する", async () => {
    window.electronAPI.skillCreator.validateSkill = vi
      .fn()
      .mockResolvedValue({ success: true, data: false });

    render(<SkillManagementPanel />);

    fireEvent.change(screen.getByLabelText("作成したいスキルを説明"), {
      target: { value: "検証失敗を確認する" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "作成する" }));
    });

    await waitFor(() => {
      expect(screen.getByText("検証で問題が見つかりました")).toBeDefined();
    });
  });

  it("execute failure 時も作成済み skill を保持したまま error を表示する", async () => {
    currentStoreState.executeSkill = vi.fn(async () => {
      currentStoreState = {
        ...currentStoreState,
        skillError: "実行開始に失敗: ネットワーク",
      };
    });

    const { rerender } = render(<SkillManagementPanel />);

    fireEvent.change(screen.getByLabelText("作成したいスキルを説明"), {
      target: { value: "実行失敗を確認する" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "作成する" }));
    });
    rerender(<SkillManagementPanel />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "実行する" }));
    });
    rerender(<SkillManagementPanel />);

    expect(
      screen.getByTestId("skill-lifecycle-created-skill"),
    ).toHaveTextContent("new-skill");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "実行開始に失敗: ネットワーク",
    );
  });

  it("auto improve failure 時に error を表示する", async () => {
    currentStoreState.autoImproveSkill = vi.fn(async () => {
      currentStoreState = {
        ...currentStoreState,
        skillError: "全自動改善に失敗: timeout",
      };
    });

    const { rerender } = render(<SkillManagementPanel />);

    fireEvent.change(screen.getByLabelText("作成したいスキルを説明"), {
      target: { value: "改善失敗を確認する" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "作成する" }));
    });
    rerender(<SkillManagementPanel />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "全自動改善" }));
    });
    rerender(<SkillManagementPanel />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "全自動改善に失敗: timeout",
    );
  });
});
