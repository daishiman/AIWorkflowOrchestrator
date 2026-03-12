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
const mockClearSkillError = vi.fn();
const mockSelectSkillByName = vi.fn();
const mockExecuteSkill = vi.fn().mockResolvedValue(undefined);
const mockAnalyzeSkill = vi.fn().mockResolvedValue(undefined);
const mockAutoImproveSkill = vi.fn().mockResolvedValue(undefined);

const mockCreateSkill = vi.fn(
  async (
    _description: string,
    _options: {
      generateTasks: boolean;
      addAgents: boolean;
      addReferences: boolean;
    },
  ) => {
    currentStoreState = {
      ...currentStoreState,
      importedSkills: [
        ...currentStoreState.importedSkills,
        buildImportedSkill("new-skill", "新規スキル"),
      ],
    };
    return "/skills/new-skill";
  },
);

const defaultStoreState: MockStoreState = {
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
  createSkill: mockCreateSkill,
  selectSkillByName: mockSelectSkillByName,
  executeSkill: mockExecuteSkill,
  analyzeSkill: mockAnalyzeSkill,
  autoImproveSkill: mockAutoImproveSkill,
};

let currentStoreState: MockStoreState = { ...defaultStoreState };

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

describe("SkillManagementPanel lifecycle session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentStoreState = {
      ...defaultStoreState,
      availableSkillsMetadata: [],
      importedSkills: [buildImportedSkill("skill-alpha", "Alpha skill")],
      createSkill: mockCreateSkill,
      selectSkillByName: mockSelectSkillByName,
      executeSkill: mockExecuteSkill,
      analyzeSkill: mockAnalyzeSkill,
      autoImproveSkill: mockAutoImproveSkill,
      fetchSkills: mockFetchSkills,
      removeSkill: mockRemoveSkill,
      clearSkillError: mockClearSkillError,
    };
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

  it("自然言語入力から mode hint を表示する", async () => {
    render(<SkillManagementPanel />);

    fireEvent.change(screen.getByLabelText("作成したいスキルを説明"), {
      target: { value: "テスト用スキルを作成したい" },
    });

    await waitFor(() => {
      expect(window.electronAPI.skillCreator.detectMode).toHaveBeenCalledWith(
        "テスト用スキルを作成したい",
      );
    });
    expect(screen.getByTestId("skill-lifecycle-mode-hint")).toHaveTextContent(
      "create",
    );
  });

  it("create 成功後に作成済み skill を選択状態へ handoff する", async () => {
    const { rerender } = render(<SkillManagementPanel />);

    fireEvent.change(screen.getByLabelText("作成したいスキルを説明"), {
      target: { value: "新しい skill を作る" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "作成する" }));
    });

    rerender(<SkillManagementPanel />);

    await waitFor(() => {
      expect(mockCreateSkill).toHaveBeenCalledWith("新しい skill を作る", {
        generateTasks: true,
        addAgents: false,
        addReferences: false,
      });
      expect(mockSelectSkillByName).toHaveBeenCalledWith("new-skill");
    });

    expect(
      screen.getByTestId("skill-lifecycle-created-skill"),
    ).toHaveTextContent("new-skill");
  });

  it("作成済み skill から execute と auto improve を起動できる", async () => {
    const { rerender } = render(<SkillManagementPanel />);

    fireEvent.change(screen.getByLabelText("作成したいスキルを説明"), {
      target: { value: "新しい skill を作る" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "作成する" }));
    });

    currentStoreState = {
      ...currentStoreState,
      currentAnalysis: {
        skillName: "new-skill",
        overallScore: 88,
        categories: [],
        suggestions: [],
        risks: [],
      },
    };
    rerender(<SkillManagementPanel />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "実行する" }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "全自動改善" }));
    });

    expect(mockExecuteSkill).toHaveBeenCalledWith("新しい skill を作る");
    expect(mockAutoImproveSkill).toHaveBeenCalledWith("new-skill");
  });

  it("prompt が空のときは execute を無効化する", async () => {
    const { rerender } = render(<SkillManagementPanel />);

    fireEvent.change(screen.getByLabelText("作成したいスキルを説明"), {
      target: { value: "新しい skill を作る" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "作成する" }));
    });

    rerender(<SkillManagementPanel />);

    const prompt = screen.getByLabelText("作成したいスキルを説明");
    fireEvent.change(prompt, { target: { value: "   " } });

    const executeButton = screen.getByRole("button", { name: "実行する" });
    expect(executeButton).toBeDisabled();

    await act(async () => {
      fireEvent.click(executeButton);
    });

    expect(mockExecuteSkill).not.toHaveBeenCalled();
  });
});
