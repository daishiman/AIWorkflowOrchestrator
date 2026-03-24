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
const mockExecuteSkill = vi.fn();
const mockFetchSkills = vi.fn();
const mockReExecuteAfterImprovement = vi.fn();
const mockSelectSkillByName = vi.fn();
const mockClearSkillError = vi.fn();
const mockClearStreamingMessages = vi.fn();
const mockClearGenerationState = vi.fn();
const mockBeginSkillReview = vi.fn();
const mockCompleteSkillReview = vi.fn();
const mockResetSkillExecutionCycle = vi.fn();

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
    | "review"
    | "improve_ready"
    | "reuse_ready"
    | null;
  skillError: string | null;
};

let mockStoreState: MockStoreState = {
  selectedSkillName: null,
  isExecuting: false,
  streamingMessages: [],
  skillExecutionStatus: null,
  skillError: null,
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
  useCurrentPlanId: () => null,
  useCurrentPlanResult: () => null,
  useSetIsSkillGenerating: () => vi.fn(),
  useSetGenerationProgress: () => vi.fn(),
  useSetGenerationError: () => vi.fn(),
  useSetCurrentPlanId: () => vi.fn(),
  useSetCurrentPlanResult: () => vi.fn(),
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
  mockExecuteSkill.mockResolvedValue(undefined);
  mockReExecuteAfterImprovement.mockResolvedValue(undefined);
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
    const view = render(
      <SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />,
    );

    await act(async () => {
      fireEvent.change(screen.getByTestId("skill-lifecycle-request-input"), {
        target: { value: "分析スキルを作る" },
      });
      fireEvent.click(screen.getByTestId("skill-lifecycle-create-button"));
    });

    mockStoreState.skillExecutionStatus = "completed";
    view.rerender(
      <SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("skill-lifecycle-improve-button"));
    });

    expect(mockBeginSkillReview).toHaveBeenCalledTimes(1);
    expect(window.electronAPI?.skillCreator?.improveSkill).toHaveBeenCalledWith(
      "lifecycle-skill",
      { autoApply: false },
    );
    expect(mockCompleteSkillReview).toHaveBeenCalledWith("improve_ready");
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

    const view = render(
      <SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />,
    );

    await act(async () => {
      fireEvent.change(screen.getByTestId("skill-lifecycle-request-input"), {
        target: { value: "分析スキルを作る" },
      });
      fireEvent.click(screen.getByTestId("skill-lifecycle-create-button"));
    });

    mockStoreState.skillExecutionStatus = "completed";
    view.rerender(
      <SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("skill-lifecycle-improve-button"));
    });

    expect(mockBeginSkillReview).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("skill-lifecycle-session-log")).toHaveTextContent(
      "改善 API は未接続です",
    );
    expect(screen.getByTestId("mock-analysis-view")).toHaveTextContent(
      "lifecycle-skill",
    );
  });

  it("実行完了前は改善提案ボタンと詳細分析ボタンが無効", async () => {
    render(<SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />);

    await act(async () => {
      fireEvent.change(screen.getByTestId("skill-lifecycle-request-input"), {
        target: { value: "分析スキルを作る" },
      });
      fireEvent.click(screen.getByTestId("skill-lifecycle-create-button"));
    });

    expect(screen.getByTestId("skill-lifecycle-improve-button")).toBeDisabled();
    expect(
      screen.getByTestId("skill-lifecycle-analysis-toggle"),
    ).toBeDisabled();
  });

  it("改善準備完了後の実行では reExecuteAfterImprovement を呼ぶ", async () => {
    const view = render(
      <SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />,
    );

    await act(async () => {
      fireEvent.change(screen.getByTestId("skill-lifecycle-request-input"), {
        target: { value: "会議メモ整形スキルを作る" },
      });
      fireEvent.click(screen.getByTestId("skill-lifecycle-create-button"));
    });

    mockStoreState.skillExecutionStatus = "improve_ready";
    view.rerender(
      <SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />,
    );

    await act(async () => {
      fireEvent.change(screen.getByTestId("skill-lifecycle-execution-input"), {
        target: { value: "改善後のプロンプトで再実行" },
      });
      fireEvent.click(screen.getByTestId("skill-lifecycle-execute-button"));
    });

    expect(mockReExecuteAfterImprovement).toHaveBeenCalledWith(
      "改善後のプロンプトで再実行",
    );
    expect(mockExecuteSkill).not.toHaveBeenCalled();
  });

  it("改善候補が0件なら reuse_ready を確定する", async () => {
    (
      window as Window & {
        electronAPI?: {
          skillCreator?: {
            detectMode?: (request: string) => Promise<{
              success: boolean;
              data?: string;
              error?: string;
            }>;
            improveSkill?: () => Promise<{
              success: boolean;
              data?: {
                suggestions: [];
                applied: boolean;
              };
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
            suggestions: [],
            applied: false,
          },
        }),
      },
    };

    const view = render(
      <SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />,
    );

    await act(async () => {
      fireEvent.change(screen.getByTestId("skill-lifecycle-request-input"), {
        target: { value: "分析スキルを作る" },
      });
      fireEvent.click(screen.getByTestId("skill-lifecycle-create-button"));
    });

    mockStoreState.skillExecutionStatus = "completed";
    view.rerender(
      <SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("skill-lifecycle-improve-button"));
    });

    expect(mockCompleteSkillReview).toHaveBeenCalledWith("reuse_ready");
  });
});
