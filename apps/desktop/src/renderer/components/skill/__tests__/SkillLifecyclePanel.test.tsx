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
} from "@testing-library/react";

const mockCreateSkill = vi.fn();
const mockAnalyzeSkill = vi.fn();
const mockExecuteSkill = vi.fn();
const mockEvaluateDraft = vi.fn();
const mockEvaluatePostCreate = vi.fn();
const mockEvaluatePostExecute = vi.fn();
const mockSelectSkillByName = vi.fn();
const mockClearSkillError = vi.fn();
const mockClearSkillEvaluation = vi.fn();
const mockClearStreamingMessages = vi.fn();

type MockStoreState = {
  selectedSkillName: string | null;
  isExecuting: boolean;
  streamingMessages: Array<{
    timestamp: number;
    type: string;
    content: unknown;
  }>;
  skillExecutionStatus:
    | "idle"
    | "running"
    | "permission_pending"
    | "completed"
    | "cancelled"
    | "error"
    | null;
  skillError: string | null;
  latestGateDecision: {
    status: string;
    totalScore: number;
    summary: string;
    nextSurface: string;
    stage: string;
    blockingIssues: string[];
    recommended: boolean;
  } | null;
  latestEvaluationSnapshot: {
    stage: string;
    deltaFromPrevious?: number;
  } | null;
  skillEvaluationError: string | null;
  isLifecycleEvaluating: boolean;
  currentAnalysis: {
    overallScore: number;
    categories: [];
    suggestions: [];
    risks: [];
    skillName: string;
  } | null;
  latestPromptRequest: string | null;
};

let mockStoreState: MockStoreState = {
  selectedSkillName: null,
  isExecuting: false,
  streamingMessages: [],
  skillExecutionStatus: null,
  skillError: null,
  latestGateDecision: null,
  latestEvaluationSnapshot: null,
  skillEvaluationError: null,
  isLifecycleEvaluating: false,
  currentAnalysis: {
    overallScore: 72,
    categories: [],
    suggestions: [],
    risks: [],
    skillName: "lifecycle-skill",
  },
  latestPromptRequest: null,
};

vi.mock("../../../store", () => ({
  useAppStore: {
    getState: () => ({
      currentAnalysis: mockStoreState.currentAnalysis,
    }),
  },
  useAnalyzeSkill: () => mockAnalyzeSkill,
  useCreateSkill: () => mockCreateSkill,
  useExecuteSkill: () => mockExecuteSkill,
  useEvaluateDraft: () => mockEvaluateDraft,
  useEvaluatePostCreate: () => mockEvaluatePostCreate,
  useEvaluatePostExecute: () => mockEvaluatePostExecute,
  useSelectSkillByName: () => mockSelectSkillByName,
  useClearSkillError: () => mockClearSkillError,
  useClearSkillEvaluation: () => mockClearSkillEvaluation,
  useClearStreamingMessages: () => mockClearStreamingMessages,
  useIsLifecycleEvaluating: () => mockStoreState.isLifecycleEvaluating,
  useLatestGateDecision: () => mockStoreState.latestGateDecision,
  useLatestEvaluationSnapshot: () => mockStoreState.latestEvaluationSnapshot,
  useLatestPromptRequest: () => mockStoreState.latestPromptRequest,
  useSkillEvaluationError: () => mockStoreState.skillEvaluationError,
  useSelectedSkillName: () => mockStoreState.selectedSkillName,
  useIsSkillExecuting: () => mockStoreState.isExecuting,
  useStreamingMessages: () => mockStoreState.streamingMessages,
  useSkillExecutionStatus: () => mockStoreState.skillExecutionStatus,
  useSkillError: () => mockStoreState.skillError,
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
    skillExecutionStatus: null,
    skillError: null,
    latestGateDecision: null,
    latestEvaluationSnapshot: null,
    skillEvaluationError: null,
    isLifecycleEvaluating: false,
    currentAnalysis: {
      overallScore: 72,
      categories: [],
      suggestions: [],
      risks: [],
      skillName: "lifecycle-skill",
    },
    latestPromptRequest: null,
  };

  (
    window as Window & {
      electronAPI?: {
        skillCreator?: {
          detectMode?: (request: string) => Promise<{
            success: boolean;
            data?: string;
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
      };
    }
  ).electronAPI = {
    skillCreator: {
      detectMode: vi.fn().mockResolvedValue({
        success: true,
        data: "collaborative",
      }),
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
    },
  };

  mockCreateSkill.mockResolvedValue("/skills/lifecycle-skill");
  mockAnalyzeSkill.mockResolvedValue(undefined);
  mockExecuteSkill.mockResolvedValue(undefined);
  mockEvaluateDraft.mockResolvedValue({
    status: "use_ready",
    totalScore: 84,
    summary: "品質ゲートを通過しました。利用に進めます。",
    nextSurface: "workspace",
    stage: "draft",
    blockingIssues: [],
    recommended: false,
  });
  mockEvaluatePostCreate.mockResolvedValue({
    status: "save_with_warning",
    totalScore: 72,
    summary: "保存は可能ですが、改善余地が残っています。",
    nextSurface: "skillCenter",
    stage: "post_create",
    blockingIssues: [],
    recommended: false,
  });
  mockEvaluatePostExecute.mockResolvedValue({
    status: "use_ready",
    totalScore: 88,
    summary: "品質ゲートを通過しました。利用に進めます。",
    nextSurface: "agent",
    stage: "post_execute",
    blockingIssues: [],
    recommended: false,
  });
});

afterEach(() => {
  cleanup();
  delete (
    window as Window & { electronAPI?: unknown; skillCreatorAPI?: unknown }
  ).electronAPI;
});

describe("SkillLifecyclePanel", () => {
  it("依頼文から mode 判定を行い、セッションログに追記する", async () => {
    render(<SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />);

    await act(async () => {
      fireEvent.change(screen.getByTestId("skill-lifecycle-request-input"), {
        target: { value: "レビューを自動化するスキルを作りたい" },
      });
      fireEvent.click(screen.getByTestId("skill-lifecycle-prepare-button"));
    });

    expect(window.electronAPI?.skillCreator?.detectMode).toHaveBeenCalledWith(
      "レビューを自動化するスキルを作りたい",
    );
    expect(mockEvaluateDraft).toHaveBeenCalledWith(
      "レビューを自動化するスキルを作りたい",
    );
    expect(screen.getByTestId("skill-lifecycle-mode-label")).toHaveTextContent(
      "共同設計",
    );
    expect(screen.getByTestId("skill-lifecycle-session-log")).toHaveTextContent(
      "推奨モード: 共同設計",
    );
  });

  it("生成成功時に createSkill と selectSkillByName を呼び、作成済み表示へ進む", async () => {
    render(<SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />);

    await act(async () => {
      fireEvent.change(screen.getByTestId("skill-lifecycle-request-input"), {
        target: { value: "仕様書を要約するスキルを作る" },
      });
      fireEvent.click(screen.getByTestId("skill-lifecycle-create-button"));
    });

    expect(mockCreateSkill).toHaveBeenCalledWith(
      "仕様書を要約するスキルを作る",
      {
        generateTasks: true,
        addAgents: false,
        addReferences: false,
      },
    );
    expect(mockAnalyzeSkill).toHaveBeenCalledWith("lifecycle-skill");
    expect(mockEvaluatePostCreate).toHaveBeenCalled();
    expect(mockSelectSkillByName).toHaveBeenCalledWith("lifecycle-skill");
    expect(
      screen.getByTestId("skill-lifecycle-created-name"),
    ).toHaveTextContent("lifecycle-skill");
    expect(
      screen.getByTestId("skill-lifecycle-created-path"),
    ).toHaveTextContent("/skills/lifecycle-skill");
  });

  it("生成済みスキルに対して execute を呼び出す", async () => {
    render(<SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />);

    await act(async () => {
      fireEvent.change(screen.getByTestId("skill-lifecycle-request-input"), {
        target: { value: "会議メモ整形スキルを作る" },
      });
      fireEvent.click(screen.getByTestId("skill-lifecycle-create-button"));
    });

    await act(async () => {
      fireEvent.change(screen.getByTestId("skill-lifecycle-execution-input"), {
        target: { value: "サンプル入力を処理して" },
      });
      fireEvent.click(screen.getByTestId("skill-lifecycle-execute-button"));
    });

    expect(mockClearStreamingMessages).toHaveBeenCalledTimes(1);
    expect(mockSelectSkillByName).toHaveBeenLastCalledWith("lifecycle-skill");
    expect(mockExecuteSkill).toHaveBeenCalledWith("サンプル入力を処理して");
  });

  it("生成失敗時はエラーを表示して作成済み状態へ進まない", async () => {
    mockCreateSkill.mockRejectedValueOnce(new Error("create failed"));

    render(<SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />);

    await act(async () => {
      fireEvent.change(screen.getByTestId("skill-lifecycle-request-input"), {
        target: { value: "失敗するスキルを作る" },
      });
      fireEvent.click(screen.getByTestId("skill-lifecycle-create-button"));
    });

    expect(screen.getByTestId("skill-lifecycle-error")).toHaveTextContent(
      "create failed",
    );
    expect(
      screen.getByTestId("skill-lifecycle-created-name"),
    ).toHaveTextContent("未生成");
  });

  it("execute が reject した場合はローカルエラーを表示する", async () => {
    mockExecuteSkill.mockRejectedValueOnce(new Error("execute failed"));

    render(<SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />);

    await act(async () => {
      fireEvent.change(screen.getByTestId("skill-lifecycle-request-input"), {
        target: { value: "会議メモ整形スキルを作る" },
      });
      fireEvent.click(screen.getByTestId("skill-lifecycle-create-button"));
    });

    await act(async () => {
      fireEvent.change(screen.getByTestId("skill-lifecycle-execution-input"), {
        target: { value: "サンプル入力を処理して" },
      });
      fireEvent.click(screen.getByTestId("skill-lifecycle-execute-button"));
    });

    expect(screen.getByTestId("skill-lifecycle-error")).toHaveTextContent(
      "execute failed",
    );
  });

  it("改善提案を取得し、詳細分析ビューを開ける", async () => {
    render(<SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />);

    await act(async () => {
      fireEvent.change(screen.getByTestId("skill-lifecycle-request-input"), {
        target: { value: "分析スキルを作る" },
      });
      fireEvent.click(screen.getByTestId("skill-lifecycle-create-button"));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("skill-lifecycle-improve-button"));
    });

    expect(window.electronAPI?.skillCreator?.improveSkill).toHaveBeenCalledWith(
      "lifecycle-skill",
      { autoApply: false },
    );
    expect(
      screen.getByTestId("skill-lifecycle-improve-result"),
    ).toHaveTextContent("ファイル責務を整理する");

    await act(async () => {
      fireEvent.click(screen.getByTestId("skill-lifecycle-analysis-toggle"));
    });

    expect(screen.getByTestId("mock-analysis-view")).toHaveTextContent(
      "lifecycle-skill",
    );
  });

  it("improve API が未接続でも詳細分析へフォールバックできる", async () => {
    (
      window as Window & {
        electronAPI?: {
          skillCreator?: {
            detectMode?: (request: string) => Promise<{
              success: boolean;
              data?: string;
              error?: string;
            }>;
          };
        };
      }
    ).electronAPI = {
      skillCreator: {
        detectMode: vi.fn().mockResolvedValue({
          success: true,
          data: "collaborative",
        }),
      },
    };

    render(<SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />);

    await act(async () => {
      fireEvent.change(screen.getByTestId("skill-lifecycle-request-input"), {
        target: { value: "分析スキルを作る" },
      });
      fireEvent.click(screen.getByTestId("skill-lifecycle-create-button"));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("skill-lifecycle-improve-button"));
    });

    expect(screen.getByTestId("skill-lifecycle-session-log")).toHaveTextContent(
      "改善 API は未接続です",
    );
    expect(screen.getByTestId("mock-analysis-view")).toHaveTextContent(
      "lifecycle-skill",
    );
  });
});
