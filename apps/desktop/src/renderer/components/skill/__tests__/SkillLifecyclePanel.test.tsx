/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom/vitest";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

const mockCreateSkill = vi.fn();
const mockDetectMode = vi.fn();
const mockPlanSkill = vi.fn();
const mockExecutePlan = vi.fn();
const mockExecuteSkill = vi.fn();
const mockFetchSkills = vi.fn();
const mockReExecuteAfterImprovement = vi.fn();
const mockSelectSkillByName = vi.fn();
const mockClearSkillError = vi.fn();
const mockClearStreamingMessages = vi.fn();
const mockClearGenerationState = vi.fn();
const mockSetWorkflowSnapshot = vi.fn();
const mockSetWorkflowError = vi.fn();
const mockSetHandoffGuidance = vi.fn();
const mockClearHandoffGuidance = vi.fn();
const mockBeginSkillReview = vi.fn();
const mockCompleteSkillReview = vi.fn();
const mockResetSkillExecutionCycle = vi.fn();
const mockGetVerifyDetail = vi.fn();
const mockReverifyWorkflow = vi.fn();

type MockStoreState = {
  selectedSkillName: string | null;
  isExecuting: boolean;
  streamingMessages: Array<{
    timestamp: number;
    type: string;
    content: unknown;
  }>;
  currentPlanId: string | null;
  skillExecutionStatus:
    | "idle"
    | "running"
    | "permission_pending"
    | "completed"
    | "cancelled"
    | "error"
    | "review"
    | "improve_ready"
    | "reuse_ready"
    | null;
  skillError: string | null;
  workflowSnapshot: null;
  workflowError: string | null;
  handoffGuidance: null;
};

let mockStoreState: MockStoreState = {
  selectedSkillName: null,
  isExecuting: false,
  streamingMessages: [],
  currentPlanId: null,
  skillExecutionStatus: null,
  skillError: null,
  workflowSnapshot: null,
  workflowError: null,
  handoffGuidance: null,
};

vi.mock("../../../store", () => ({
  useBeginSkillReview: () => mockBeginSkillReview,
  useCreateSkill: () => mockCreateSkill,
  useCompleteSkillReview: () => mockCompleteSkillReview,
  useExecuteSkill: () => mockExecuteSkill,
  useFetchSkills: () => mockFetchSkills,
  useReExecuteAfterImprovement: () => mockReExecuteAfterImprovement,
  useResetSkillExecutionCycle: () => mockResetSkillExecutionCycle,
  useSelectSkillByName: () => mockSelectSkillByName,
  useClearSkillError: () => mockClearSkillError,
  useClearStreamingMessages: () => mockClearStreamingMessages,
  useClearGenerationState: () => mockClearGenerationState,
  useSelectedSkillName: () => mockStoreState.selectedSkillName,
  useIsSkillExecuting: () => mockStoreState.isExecuting,
  useStreamingMessages: () => mockStoreState.streamingMessages,
  useSkillExecutionStatus: () => mockStoreState.skillExecutionStatus,
  useSkillError: () => mockStoreState.skillError,
  // LLM Generation selectors (defaults for existing tests)
  useIsSkillGenerating: () => false,
  useGenerationProgress: () => null,
  useGenerationError: () => null,
  useCurrentPlanId: () => mockStoreState.currentPlanId,
  useCurrentPlanResult: () => null,
  useSetIsSkillGenerating: () => vi.fn(),
  useSetGenerationProgress: () => vi.fn(),
  useSetGenerationError: () => vi.fn(),
  useSetCurrentPlanId: () => vi.fn(),
  useSetCurrentPlanResult: () => vi.fn(),
  useWorkflowSnapshot: () => mockStoreState.workflowSnapshot,
  useWorkflowError: () => mockStoreState.workflowError,
  useSetWorkflowSnapshot: () => mockSetWorkflowSnapshot,
  useSetWorkflowError: () => mockSetWorkflowError,
  useHandoffGuidance: () => mockStoreState.handoffGuidance,
  useSetHandoffGuidance: () => mockSetHandoffGuidance,
  useClearHandoffGuidance: () => mockClearHandoffGuidance,
}));

vi.mock("../SkillStreamingView", () => ({
  SkillStreamingView: ({ skillName }: { skillName: string }) => (
    <div data-testid="mock-streaming-view">{skillName}</div>
  ),
}));

vi.mock("../SkillAnalysisView", () => ({
  SkillAnalysisView: ({
    skillName,
    onClose,
  }: {
    skillName: string;
    onClose: () => void;
  }) => (
    <div data-testid="mock-analysis-view">
      <span>{skillName}</span>
      <button onClick={onClose}>閉じる</button>
    </div>
  ),
}));

import { SkillLifecyclePanel } from "../SkillLifecyclePanel";

beforeEach(() => {
  vi.clearAllMocks();
  mockStoreState = {
    selectedSkillName: null,
    isExecuting: false,
    streamingMessages: [],
    currentPlanId: null,
    skillExecutionStatus: null,
    skillError: null,
    workflowSnapshot: null,
    workflowError: null,
    handoffGuidance: null,
  };

  (
    window as Window & {
      skillCreatorAPI?: {
        detectMode?: (request: string) => Promise<{
          success: boolean;
          data?: string;
          error?: string;
        }>;
        planSkill?: (
          prompt: string,
          authMode?: string,
          apiKey?: string,
        ) => Promise<{
          success: boolean;
          data?:
            | {
                type: "integrated_api" | "terminal_handoff";
                planId?: string;
                estimatedSteps?: number;
                guidance?: {
                  reason: string;
                  terminalCommand: string;
                  contextSummary: string;
                };
              }
            | undefined;
          error?: string;
        }>;
        executePlan?: (
          planId: string,
          skillSpec?: unknown,
          authMode?: string,
          apiKey?: string,
        ) => Promise<{
          success: boolean;
          data?:
            | {
                executeId: string;
                skillName?: string;
                success: boolean;
                error?: string;
              }
            | undefined;
          error?: string;
        }>;
        improveSkill?: (
          skillName: string,
          options?: { autoApply?: boolean },
        ) => Promise<{
          success: boolean;
          data?: {
            suggestions: Array<{
              category: string;
              description: string;
              severity: "low" | "medium" | "high";
              autoFixable: boolean;
            }>;
            applied: boolean;
          };
          error?: string;
        }>;
      };
    }
  ).skillCreatorAPI = {
    detectMode: mockDetectMode,
    planSkill: mockPlanSkill,
    executePlan: mockExecutePlan,
    improveSkill: vi.fn().mockResolvedValue({
      success: true,
      data: {
        suggestions: [
          {
            category: "structure",
            description: "ファイル責務を整理する",
            severity: "medium",
            autoFixable: true,
          },
        ],
        applied: false,
      },
    }),
    getVerifyDetail: mockGetVerifyDetail,
    reverifyWorkflow: mockReverifyWorkflow,
  };

  mockDetectMode.mockResolvedValue({
    success: true,
    data: "collaborative",
  });
  mockCreateSkill.mockResolvedValue("/skills/lifecycle-skill");
  mockPlanSkill.mockResolvedValue({
    success: true,
    data: {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 5,
    },
  });
  mockExecutePlan.mockResolvedValue({
    success: true,
    data: {
      executeId: "exec-001",
      skillName: "lifecycle-skill",
      success: true,
    },
  });
  mockExecuteSkill.mockResolvedValue(undefined);
  mockReExecuteAfterImprovement.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  delete (window as Window & { skillCreatorAPI?: unknown }).skillCreatorAPI;
});

const defaultProps = {
  onClose: vi.fn(),
  onOpenWizard: vi.fn(),
  onOpenSkillWizard: vi.fn(),
};

const renderPanel = (props?: Partial<typeof defaultProps>) =>
  render(<SkillLifecyclePanel {...defaultProps} {...props} />);

describe("SkillLifecyclePanel", () => {
  describe("ウィザード遷移化 - ウィザードボタンの表示", () => {
    it("ウィザードボタンがdata-testidで取得できる", () => {
      renderPanel();
      expect(
        screen.getByTestId("skill-lifecycle-open-wizard-button"),
      ).toBeInTheDocument();
    });

    it("ウィザードボタンに正しいテキストが表示される", () => {
      renderPanel();
      expect(
        screen.getByTestId("skill-lifecycle-open-wizard-button"),
      ).toHaveTextContent("スキル作成ウィザードを開く →");
    });

    it("ウィザードボタンクリックでonOpenSkillWizardが呼ばれる", async () => {
      const onOpenSkillWizard = vi.fn();
      renderPanel({ onOpenSkillWizard });
      await act(async () => {
        fireEvent.click(
          screen.getByTestId("skill-lifecycle-open-wizard-button"),
        );
      });
      expect(onOpenSkillWizard).toHaveBeenCalledTimes(1);
    });
  });

  describe("ウィザード遷移化 - 削除要素の非存在確認", () => {
    it("テキストエリア（skill-lifecycle-request-input）が存在しない", () => {
      renderPanel();
      expect(screen.queryByTestId("skill-lifecycle-request-input")).toBeNull();
    });

    it("テキストエリア（skill-lifecycle-execution-input）が存在しない", () => {
      renderPanel();
      expect(
        screen.queryByTestId("skill-lifecycle-execution-input"),
      ).toBeNull();
    });

    it("「スキルを生成する」ボタンが存在しない", () => {
      renderPanel();
      expect(screen.queryByTestId("skill-lifecycle-create-button")).toBeNull();
    });

    it("「方針を決める」ボタンが存在しない", () => {
      renderPanel();
      expect(screen.queryByTestId("skill-lifecycle-prepare-button")).toBeNull();
    });
  });

  describe("ウィザード遷移化 - 既存機能の保持確認", () => {
    it("onCloseが正しく渡せる（TypeScript型エラーなし）", () => {
      const onClose = vi.fn();
      renderPanel({ onClose });
      expect(screen.getByTestId("skill-lifecycle-panel")).toBeInTheDocument();
    });

    it("セクション見出し「1. スキルを作成する」が表示される", () => {
      renderPanel();
      expect(screen.getByText("1. スキルを作成する")).toBeInTheDocument();
    });

    it("説明テキストが表示される", () => {
      renderPanel();
      expect(
        screen.getByText(
          /スキルの目的・機能・連携ツールをガイドに沿って設定し/,
        ),
      ).toBeInTheDocument();
    });
  });

  describe("ウィザード遷移化 - エッジケース", () => {
    it("onOpenSkillWizardが複数回クリックされても正常動作する", async () => {
      const onOpenSkillWizard = vi.fn();
      renderPanel({ onOpenSkillWizard });
      const button = screen.getByTestId("skill-lifecycle-open-wizard-button");
      await act(async () => {
        fireEvent.click(button);
        fireEvent.click(button);
        fireEvent.click(button);
      });
      expect(onOpenSkillWizard).toHaveBeenCalledTimes(3);
    });

    it("onCloseとonOpenSkillWizardが同時に渡されても干渉しない", () => {
      const onClose = vi.fn();
      const onOpenSkillWizard = vi.fn();
      renderPanel({ onClose, onOpenSkillWizard });
      expect(
        screen.getByTestId("skill-lifecycle-open-wizard-button"),
      ).toBeInTheDocument();
    });

    it("コンポーネントが再レンダリングされてもウィザードボタンが保持される", () => {
      const { rerender } = renderPanel();
      rerender(
        <SkillLifecyclePanel {...defaultProps} onOpenSkillWizard={vi.fn()} />,
      );
      expect(
        screen.getByTestId("skill-lifecycle-open-wizard-button"),
      ).toBeInTheDocument();
    });
  });

  describe("ウィザード遷移化 - 回帰テスト: 削除要素の永続的非存在", () => {
    it("[回帰] テキストエリア（request-input）が復活していない", () => {
      renderPanel();
      expect(screen.queryByTestId("skill-lifecycle-request-input")).toBeNull();
    });

    it("[回帰] テキストエリア（execution-input）が復活していない", () => {
      renderPanel();
      expect(
        screen.queryByTestId("skill-lifecycle-execution-input"),
      ).toBeNull();
    });

    it("[回帰] 「スキルを生成する」ボタンが復活していない", () => {
      renderPanel();
      expect(screen.queryByTestId("skill-lifecycle-create-button")).toBeNull();
    });

    it("[回帰] 「方針を決める」ボタンが復活していない", () => {
      renderPanel();
      expect(screen.queryByTestId("skill-lifecycle-prepare-button")).toBeNull();
    });
  });

  describe("ウィザード遷移化 - アクセシビリティ", () => {
    it("ウィザードボタンに type='button' が付与されている", () => {
      renderPanel();
      expect(
        screen.getByTestId("skill-lifecycle-open-wizard-button"),
      ).toHaveAttribute("type", "button");
    });

    it("セクション見出しが h3 要素として存在する", () => {
      renderPanel();
      const heading = screen.getByText("1. スキルを作成する");
      expect(heading.tagName).toBe("H3");
    });

    it("説明テキストが text-secondary クラスを持つ", () => {
      renderPanel();
      const desc = screen.getByText(
        /スキルの目的・機能・連携ツールをガイドに沿って設定し/,
      );
      expect(desc.className).toContain("text-[var(--text-secondary)]");
    });
  });

  describe("ウィザード遷移化 - 既存セクションの保持確認", () => {
    it("「2. 生成したスキルを実行する」セクションが存在する（影響なし）", () => {
      renderPanel();
      expect(
        screen.getByText("2. 生成したスキルを実行する"),
      ).toBeInTheDocument();
    });

    it("SkillLifecyclePanelの全体構造が崩れていない", () => {
      renderPanel();
      expect(screen.getByTestId("skill-lifecycle-panel")).toBeInTheDocument();
    });
  });

  describe("verifyDetail Layer別グルーピング表示", () => {
    const buildVerifyDetail = (
      overrides?: Partial<{
        checks: Array<{
          id: string;
          layer: "layer1" | "layer2" | "layer3" | "layer4";
          severity: "info" | "warning" | "error";
          summary: string;
          evidenceSummary?: string;
        }>;
        status: "pending" | "pass" | "fail";
        message?: string;
        reverifyEligible: boolean;
      }>,
    ) => ({
      planId: "plan-001",
      currentPhase: "verify",
      status: "pending",
      message: "verify summary",
      checks: [
        {
          id: "L1-001",
          layer: "layer1",
          severity: "error",
          summary: "SKILL.md が存在しない",
        },
        {
          id: "L2-001",
          layer: "layer2",
          severity: "warning",
          summary: "Triggerセクションが短い",
        },
        {
          id: "L3-001",
          layer: "layer3",
          severity: "warning",
          summary: "$schemaフィールドが欠損",
        },
        {
          id: "L4-001",
          layer: "layer4",
          severity: "info",
          summary: "references/ にH1が存在する",
        },
      ],
      evidenceCount: 3,
      route: {
        type: "integrated_api",
        summary: "integrated_api (default)",
      },
      reverifyEligible: true,
      delegatedGovernanceNote: "Task07 owner",
      delegatedSessionNote: "Task08 owner",
      ...overrides,
    });

    const renderWithVerifyDetail = async (detail = buildVerifyDetail()) => {
      mockStoreState.currentPlanId = "plan-001";
      mockGetVerifyDetail.mockResolvedValueOnce({
        success: true,
        data: detail,
      });
      render(
        <SkillLifecyclePanel
          onClose={vi.fn()}
          onOpenWizard={vi.fn()}
          onOpenSkillWizard={vi.fn()}
        />,
      );
      await screen.findByTestId("skill-lifecycle-verify-detail");
      await waitFor(() => {
        expect(screen.queryByText("verify detail を読み込み中...")).toBeNull();
      });
    };

    it("TC-01: Layer別グループヘッダーが表示される", async () => {
      await renderWithVerifyDetail();

      expect(screen.getByRole("button", { name: /Layer 1/i })).toBeTruthy();
      expect(screen.getByRole("button", { name: /Layer 2/i })).toBeTruthy();
      expect(screen.getByRole("button", { name: /Layer 3/i })).toBeTruthy();
      expect(screen.getByRole("button", { name: /Layer 4/i })).toBeTruthy();
    });

    it("TC-02: layer3のcheckがLayer 3グループ内に表示される", async () => {
      await renderWithVerifyDetail();

      const layer3Panel = screen.getByTestId(
        "skill-lifecycle-verify-layer-panel-layer3",
      );
      expect(
        within(layer3Panel).getByTestId("skill-lifecycle-verify-check-L3-001"),
      ).toBeTruthy();
      expect(
        within(layer3Panel).getByText("$schemaフィールドが欠損"),
      ).toBeTruthy();
    });

    it("TC-03〜05: severityアイコンが正しく表示される", async () => {
      await renderWithVerifyDetail();

      expect(
        screen.getByTestId("skill-lifecycle-verify-check-L1-001"),
      ).toHaveTextContent("✗");
      expect(
        screen.getByTestId("skill-lifecycle-verify-check-L2-001"),
      ).toHaveTextContent("⚠");
      expect(
        screen.getByTestId("skill-lifecycle-verify-check-L3-001"),
      ).toHaveTextContent("⚠");
      expect(
        screen.getByTestId("skill-lifecycle-verify-check-L4-001"),
      ).toHaveTextContent("✓");
    });

    it("TC-06: Layerヘッダーに集計バッジが表示される", async () => {
      await renderWithVerifyDetail(
        buildVerifyDetail({
          checks: [
            {
              id: "L3-001",
              layer: "layer3",
              severity: "warning",
              summary: "warning 1",
            },
            {
              id: "L3-002",
              layer: "layer3",
              severity: "warning",
              summary: "warning 2",
            },
            {
              id: "L3-003",
              layer: "layer3",
              severity: "info",
              summary: "info 1",
            },
          ],
        }),
      );

      expect(screen.getByText(/2 warning/i)).toBeTruthy();
      expect(screen.getByText(/1 info/i)).toBeTruthy();
    });

    it("TC-07: checksが空のLayerグループは表示されない", async () => {
      await renderWithVerifyDetail(
        buildVerifyDetail({
          checks: [
            {
              id: "L1-001",
              layer: "layer1",
              severity: "info",
              summary: "Layer1 only",
            },
          ],
        }),
      );

      expect(screen.getByRole("button", { name: /Layer 1/i })).toBeTruthy();
      expect(screen.queryByRole("button", { name: /Layer 2/i })).toBeNull();
      expect(screen.queryByRole("button", { name: /Layer 3/i })).toBeNull();
      expect(screen.queryByRole("button", { name: /Layer 4/i })).toBeNull();
    });

    it("TC-08: Layer1/2のchecksが後方互換で正しく表示される", async () => {
      await renderWithVerifyDetail(
        buildVerifyDetail({
          checks: [
            {
              id: "L1-002",
              layer: "layer1",
              severity: "error",
              summary: "Layer1 check",
            },
            {
              id: "L2-001",
              layer: "layer2",
              severity: "warning",
              summary: "Layer2 check",
            },
          ],
        }),
      );

      expect(screen.getByText("L1-002")).toBeTruthy();
      expect(screen.getByText("Layer1 check")).toBeTruthy();
      expect(screen.getByText("L2-001")).toBeTruthy();
      expect(screen.getByText("Layer2 check")).toBeTruthy();
    });

    it("TC-09〜10: Layerヘッダークリックで開閉動作する", async () => {
      await renderWithVerifyDetail(
        buildVerifyDetail({
          checks: [
            {
              id: "L3-001",
              layer: "layer3",
              severity: "warning",
              summary: "toggle check",
            },
          ],
        }),
      );

      const layerButton = screen.getByTestId(
        "skill-lifecycle-verify-layer-toggle-layer3",
      );
      expect(
        screen.getByTestId("skill-lifecycle-verify-check-L3-001"),
      ).toHaveTextContent("toggle check");

      await act(async () => {
        fireEvent.click(layerButton);
      });
      expect(
        screen.queryByTestId("skill-lifecycle-verify-check-L3-001"),
      ).toBeNull();

      await act(async () => {
        fireEvent.click(layerButton);
      });
      expect(
        screen.getByTestId("skill-lifecycle-verify-check-L3-001"),
      ).toHaveTextContent("toggle check");
    });

    it("TC-19: reverify後も開閉状態が保持される", async () => {
      const firstDetail = buildVerifyDetail({
        checks: [
          {
            id: "L3-001",
            layer: "layer3",
            severity: "warning",
            summary: "reverify check",
          },
        ],
      });
      mockStoreState.currentPlanId = "plan-001";
      mockGetVerifyDetail.mockResolvedValueOnce({
        success: true,
        data: firstDetail,
      });
      mockReverifyWorkflow.mockResolvedValueOnce({
        success: true,
        data: { accepted: true },
      });

      render(
        <SkillLifecyclePanel
          onClose={vi.fn()}
          onOpenWizard={vi.fn()}
          onOpenSkillWizard={vi.fn()}
        />,
      );
      await screen.findByTestId("skill-lifecycle-verify-detail");

      const layerButton = screen.getByTestId(
        "skill-lifecycle-verify-layer-toggle-layer3",
      );
      await act(async () => {
        fireEvent.click(layerButton);
      });
      expect(
        screen.queryByTestId("skill-lifecycle-verify-check-L3-001"),
      ).toBeNull();

      mockGetVerifyDetail.mockResolvedValueOnce({
        success: true,
        data: {
          ...firstDetail,
          checks: [
            {
              id: "L3-002",
              layer: "layer3",
              severity: "warning",
              summary: "reverify check updated",
            },
          ],
        },
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId("skill-lifecycle-reverify-button"));
      });

      await waitFor(() => expect(mockGetVerifyDetail).toHaveBeenCalledTimes(2));
      expect(
        screen.queryByTestId("skill-lifecycle-verify-check-L3-002"),
      ).toBeNull();
      expect(layerButton).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("severity フィルタ", () => {
    const buildVerifyDetailForFilter = (
      overrides?: Partial<{
        checks: Array<{
          id: string;
          layer: "layer1" | "layer2" | "layer3" | "layer4";
          severity: "info" | "warning" | "error";
          summary: string;
          evidenceSummary?: string;
        }>;
        status: "pending" | "pass" | "fail";
        message?: string;
        reverifyEligible: boolean;
      }>,
    ) => ({
      planId: "plan-001",
      currentPhase: "verify",
      status: "pending",
      message: "verify summary",
      checks: [
        {
          id: "L1-001",
          layer: "layer1" as const,
          severity: "error" as const,
          summary: "SKILL.md が存在しない",
        },
        {
          id: "L2-001",
          layer: "layer2" as const,
          severity: "warning" as const,
          summary: "Triggerセクションが短い",
        },
        {
          id: "L3-001",
          layer: "layer3" as const,
          severity: "warning" as const,
          summary: "$schemaフィールドが欠損",
        },
        {
          id: "L4-001",
          layer: "layer4" as const,
          severity: "info" as const,
          summary: "references/ にH1が存在する",
        },
      ],
      evidenceCount: 3,
      route: {
        type: "integrated_api",
        summary: "integrated_api (default)",
      },
      reverifyEligible: true,
      delegatedGovernanceNote: "Task07 owner",
      delegatedSessionNote: "Task08 owner",
      ...overrides,
    });

    const renderWithFilter = async (detail = buildVerifyDetailForFilter()) => {
      mockStoreState.currentPlanId = "plan-001";
      mockGetVerifyDetail.mockResolvedValueOnce({
        success: true,
        data: detail,
      });
      render(
        <SkillLifecyclePanel
          onClose={vi.fn()}
          onOpenWizard={vi.fn()}
          onOpenSkillWizard={vi.fn()}
        />,
      );
      await screen.findByTestId("skill-lifecycle-verify-detail");
    };

    it("SF-01: デフォルトで severity フィルタが all に設定されている", async () => {
      await renderWithFilter();

      const filterBar = screen.getByRole("group", { name: "Severity filter" });
      expect(filterBar).toBeTruthy();

      const allButton = screen.getByTestId(
        "skill-lifecycle-severity-filter-all",
      );
      expect(allButton).toHaveAttribute("aria-pressed", "true");
    });

    it("SF-02: all 選択時に全 check が表示される", async () => {
      await renderWithFilter();

      expect(
        screen.getByTestId("skill-lifecycle-verify-check-L1-001"),
      ).toBeTruthy();
      expect(
        screen.getByTestId("skill-lifecycle-verify-check-L2-001"),
      ).toBeTruthy();
      expect(
        screen.getByTestId("skill-lifecycle-verify-check-L3-001"),
      ).toBeTruthy();
      expect(
        screen.getByTestId("skill-lifecycle-verify-check-L4-001"),
      ).toBeTruthy();
    });

    it("SF-03: warning+ 選択で info が非表示になる", async () => {
      await renderWithFilter();

      const warningButton = await screen.findByTestId(
        "skill-lifecycle-severity-filter-warning+",
      );
      await act(async () => {
        fireEvent.click(warningButton);
      });

      expect(
        screen.getByTestId("skill-lifecycle-verify-check-L1-001"),
      ).toBeTruthy();
      expect(
        screen.getByTestId("skill-lifecycle-verify-check-L2-001"),
      ).toBeTruthy();
      expect(
        screen.getByTestId("skill-lifecycle-verify-check-L3-001"),
      ).toBeTruthy();
      expect(
        screen.queryByTestId("skill-lifecycle-verify-check-L4-001"),
      ).toBeNull();
    });

    it("SF-04: error 選択で warning/info が非表示になる", async () => {
      await renderWithFilter();

      await act(async () => {
        fireEvent.click(
          screen.getByTestId("skill-lifecycle-severity-filter-error"),
        );
      });

      expect(
        screen.getByTestId("skill-lifecycle-verify-check-L1-001"),
      ).toBeTruthy();
      expect(
        screen.queryByTestId("skill-lifecycle-verify-check-L2-001"),
      ).toBeNull();
      expect(
        screen.queryByTestId("skill-lifecycle-verify-check-L3-001"),
      ).toBeNull();
      expect(
        screen.queryByTestId("skill-lifecycle-verify-check-L4-001"),
      ).toBeNull();
    });

    it("SF-05: フィルタ結果で空になった layer が非表示になる", async () => {
      await renderWithFilter();

      const warningButton = await screen.findByTestId(
        "skill-lifecycle-severity-filter-warning+",
      );
      await act(async () => {
        fireEvent.click(warningButton);
      });

      // layer4 は info のみなので消える
      expect(screen.getByRole("button", { name: /Layer 1/i })).toBeTruthy();
      expect(screen.getByRole("button", { name: /Layer 2/i })).toBeTruthy();
      expect(screen.getByRole("button", { name: /Layer 3/i })).toBeTruthy();
      expect(screen.queryByRole("button", { name: /Layer 4/i })).toBeNull();

      await act(async () => {
        fireEvent.click(
          screen.getByTestId("skill-lifecycle-severity-filter-error"),
        );
      });

      // error は layer1 のみ
      expect(screen.getByRole("button", { name: /Layer 1/i })).toBeTruthy();
      expect(screen.queryByRole("button", { name: /Layer 2/i })).toBeNull();
      expect(screen.queryByRole("button", { name: /Layer 3/i })).toBeNull();
      expect(screen.queryByRole("button", { name: /Layer 4/i })).toBeNull();
    });

    it("SF-06: warning+ 選択時に表示件数サマリが表示される", async () => {
      await renderWithFilter();

      await act(async () => {
        fireEvent.click(
          screen.getByTestId("skill-lifecycle-severity-filter-warning+"),
        );
      });

      expect(
        screen.getByTestId("skill-lifecycle-severity-filter-summary"),
      ).toHaveTextContent("表示中 3 / 全 4 件");
      expect(
        await screen.findByTestId("skill-lifecycle-severity-filter-error"),
      ).toHaveTextContent("✗ Error");
    });

    it("SF-07: reverify 後もフィルタ状態が維持される", async () => {
      const firstDetail = buildVerifyDetailForFilter();
      mockStoreState.currentPlanId = "plan-001";
      mockGetVerifyDetail.mockResolvedValueOnce({
        success: true,
        data: firstDetail,
      });
      mockReverifyWorkflow.mockResolvedValueOnce({
        success: true,
        data: { accepted: true },
      });

      render(
        <SkillLifecyclePanel
          onClose={vi.fn()}
          onOpenWizard={vi.fn()}
          onOpenSkillWizard={vi.fn()}
        />,
      );
      await screen.findByTestId("skill-lifecycle-verify-detail");

      // warning+ に切り替え
      await act(async () => {
        fireEvent.click(
          screen.getByTestId("skill-lifecycle-severity-filter-warning+"),
        );
      });
      expect(
        screen.getByTestId("skill-lifecycle-severity-filter-warning+"),
      ).toHaveAttribute("aria-pressed", "true");

      // reverify
      mockGetVerifyDetail.mockResolvedValueOnce({
        success: true,
        data: {
          ...firstDetail,
          checks: [
            {
              id: "L1-002",
              layer: "layer1",
              severity: "error",
              summary: "新しいerror",
            },
            {
              id: "L4-002",
              layer: "layer4",
              severity: "info",
              summary: "新しいinfo",
            },
          ],
        },
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId("skill-lifecycle-reverify-button"));
      });

      await waitFor(() => expect(mockGetVerifyDetail).toHaveBeenCalledTimes(2));

      // warning+ が維持されている
      expect(
        screen.getByTestId("skill-lifecycle-severity-filter-warning+"),
      ).toHaveAttribute("aria-pressed", "true");
      // warning+ なので info は非表示
      expect(
        screen.queryByTestId("skill-lifecycle-verify-check-L4-002"),
      ).toBeNull();
      // error は表示
      expect(
        screen.getByTestId("skill-lifecycle-verify-check-L1-002"),
      ).toBeTruthy();
    });

    it("SF-08: フィルタ切替後も accordion が操作できる", async () => {
      await renderWithFilter();

      await act(async () => {
        fireEvent.click(
          screen.getByTestId("skill-lifecycle-severity-filter-warning+"),
        );
      });

      // layer1 の accordion を閉じる
      const layerButton = screen.getByTestId(
        "skill-lifecycle-verify-layer-toggle-layer1",
      );
      await act(async () => {
        fireEvent.click(layerButton);
      });
      expect(
        screen.queryByTestId("skill-lifecycle-verify-check-L1-001"),
      ).toBeNull();

      // 再度開く
      await act(async () => {
        fireEvent.click(layerButton);
      });
      expect(
        screen.getByTestId("skill-lifecycle-verify-check-L1-001"),
      ).toBeTruthy();
    });

    it("SF-09: 全 check が info のみの場合、error フィルタで全 layer が消える", async () => {
      await renderWithFilter(
        buildVerifyDetailForFilter({
          checks: [
            {
              id: "L1-010",
              layer: "layer1",
              severity: "info",
              summary: "info only 1",
            },
            {
              id: "L3-010",
              layer: "layer3",
              severity: "info",
              summary: "info only 2",
            },
          ],
        }),
      );

      await act(async () => {
        fireEvent.click(
          screen.getByTestId("skill-lifecycle-severity-filter-error"),
        );
      });

      expect(screen.queryByRole("button", { name: /Layer 1/i })).toBeNull();
      expect(screen.queryByRole("button", { name: /Layer 3/i })).toBeNull();
      expect(
        screen.getByTestId("skill-lifecycle-severity-filter-summary"),
      ).toHaveTextContent("表示中 0 / 全 2 件");
    });
  });
});
