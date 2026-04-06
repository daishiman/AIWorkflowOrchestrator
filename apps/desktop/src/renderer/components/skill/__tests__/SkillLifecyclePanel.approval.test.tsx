/**
 * @vitest-environment happy-dom
 *
 * UT-SDK-07-APPROVAL-REQUEST-SURFACE-001: SkillLifecyclePanel approval 統合テスト
 *
 * AC-2: Renderer に approval 確認 UI が表示される
 * AC-3: approve/reject 操作が respondToApproval() と接続されている
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
} from "@testing-library/react";
import type { ApprovalRequestPayload } from "@repo/shared/types";

// --- Store モック ---
const mockBeginSkillReview = vi.fn();
const mockCompleteSkillReview = vi.fn();
const mockCreateSkill = vi.fn();
const mockExecuteSkill = vi.fn();
const mockFetchSkills = vi.fn();
const mockReExecuteAfterImprovement = vi.fn();
const mockResetSkillExecutionCycle = vi.fn();
const mockSelectSkillByName = vi.fn();
const mockClearSkillError = vi.fn();
const mockClearStreamingMessages = vi.fn();
const mockClearGenerationState = vi.fn();
const mockSetWorkflowSnapshot = vi.fn();
const mockSetWorkflowError = vi.fn();
const mockSetHandoffGuidance = vi.fn();
const mockClearHandoffGuidance = vi.fn();

vi.mock("../../../store", () => ({
  useBeginSkillReview: () => mockBeginSkillReview,
  useCompleteSkillReview: () => mockCompleteSkillReview,
  useCreateSkill: () => mockCreateSkill,
  useExecuteSkill: () => mockExecuteSkill,
  useFetchSkills: () => mockFetchSkills,
  useReExecuteAfterImprovement: () => mockReExecuteAfterImprovement,
  useResetSkillExecutionCycle: () => mockResetSkillExecutionCycle,
  useSelectSkillByName: () => mockSelectSkillByName,
  useClearSkillError: () => mockClearSkillError,
  useClearStreamingMessages: () => mockClearStreamingMessages,
  useClearGenerationState: () => mockClearGenerationState,
  useSelectedSkillName: () => null,
  useIsSkillExecuting: () => false,
  useStreamingMessages: () => [],
  useSkillExecutionStatus: () => null,
  useSkillError: () => null,
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
  useWorkflowSnapshot: () => null,
  useWorkflowError: () => null,
  useSetWorkflowSnapshot: () => mockSetWorkflowSnapshot,
  useSetWorkflowError: () => mockSetWorkflowError,
  useHandoffGuidance: () => null,
  useSetHandoffGuidance: () => mockSetHandoffGuidance,
  useClearHandoffGuidance: () => mockClearHandoffGuidance,
}));

vi.mock("../SkillStreamingView", () => ({
  SkillStreamingView: () => <div data-testid="mock-streaming-view" />,
}));

vi.mock("../SkillAnalysisView", () => ({
  SkillAnalysisView: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="mock-analysis-view">
      <button onClick={onClose}>閉じる</button>
    </div>
  ),
}));

vi.mock("../ApprovalRequestPanel", () => ({
  ApprovalRequestPanel: ({
    request,
    onApprove,
    onReject,
  }: {
    request: ApprovalRequestPayload | null;
    onApprove: (sessionId: string, operationId: string) => Promise<void>;
    onReject: (sessionId: string, operationId: string) => Promise<void>;
  }) => {
    if (!request) return null;
    return (
      <div data-testid="approval-request-panel">
        <span data-testid="approval-operation-type">
          {request.operationType}
        </span>
        <button
          data-testid="approval-approve-button"
          onClick={() =>
            void onApprove(request.sessionId, request.operationId).catch(
              () => undefined,
            )
          }
        >
          承認
        </button>
        <button
          data-testid="approval-reject-button"
          onClick={() =>
            void onReject(request.sessionId, request.operationId).catch(
              () => undefined,
            )
          }
        >
          拒否
        </button>
      </div>
    );
  },
}));

import { SkillLifecyclePanel } from "../SkillLifecyclePanel";

const sampleRequest: ApprovalRequestPayload = {
  sessionId: "session-lifecycle-1",
  operationId: "op-lifecycle-1",
  operationType: "file_write",
  description: "危険なファイル書き込みを実行しようとしています",
};

// onApprovalRequest コールバックを手動発火するためのキャプチャ
let capturedOnApprovalRequestCallback:
  | ((request: ApprovalRequestPayload) => void)
  | null = null;

const mockOnApprovalRequest = vi.fn(
  (callback: (request: ApprovalRequestPayload) => void) => {
    capturedOnApprovalRequestCallback = callback;
    return () => {
      capturedOnApprovalRequestCallback = null;
    };
  },
);
const mockRespondToApproval = vi.fn().mockResolvedValue({ success: true });
const mockOnWorkflowStateChanged = vi.fn(() => () => {});
const mockListSessions = vi.fn().mockResolvedValue({ success: true, data: [] });
const mockCleanupExpiredSessions = vi.fn().mockResolvedValue(0);

beforeEach(() => {
  vi.clearAllMocks();
  capturedOnApprovalRequestCallback = null;

  // window.skillCreatorAPI をモック設定
  (
    window as Window & {
      skillCreatorAPI?: {
        onApprovalRequest?: typeof mockOnApprovalRequest;
        respondToApproval?: typeof mockRespondToApproval;
        onWorkflowStateChanged?: typeof mockOnWorkflowStateChanged;
        listSessions?: typeof mockListSessions;
        cleanupExpiredSessions?: typeof mockCleanupExpiredSessions;
      };
    }
  ).skillCreatorAPI = {
    onApprovalRequest: mockOnApprovalRequest,
    respondToApproval: mockRespondToApproval,
    onWorkflowStateChanged: mockOnWorkflowStateChanged,
    listSessions: mockListSessions,
    cleanupExpiredSessions: mockCleanupExpiredSessions,
  };
});

afterEach(() => {
  (window as Window & { skillCreatorAPI?: unknown }).skillCreatorAPI =
    undefined;
  cleanup();
});

describe("UT-SDK-07-APPROVAL-REQUEST-SURFACE-001: SkillLifecyclePanel approval 統合", () => {
  // --- TC-012: approval 受信時に UI 表示 ---

  describe("TC-012: onApprovalRequest イベント受信時に ApprovalRequestPanel が表示される", () => {
    it("approval request 受信前は ApprovalRequestPanel が非表示", async () => {
      await act(async () => {
        render(
          <SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />,
        );
      });

      expect(
        screen.queryByTestId("approval-request-panel"),
      ).not.toBeInTheDocument();
    });

    it("onApprovalRequest コールバック発火後に ApprovalRequestPanel が表示される", async () => {
      await act(async () => {
        render(
          <SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />,
        );
      });

      // onApprovalRequest が登録されたことを確認
      expect(mockOnApprovalRequest).toHaveBeenCalled();

      // コールバックを手動発火
      await act(async () => {
        capturedOnApprovalRequestCallback?.(sampleRequest);
      });

      expect(screen.getByTestId("approval-request-panel")).toBeInTheDocument();
    });
  });

  // --- TC-013: approve 操作 ---

  describe("TC-013: approve 操作で respondToApproval('approve') が呼ばれる", () => {
    it("承認ボタンクリックで respondToApproval(sessionId, operationId, 'approve') が呼ばれる", async () => {
      await act(async () => {
        render(
          <SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />,
        );
      });

      await act(async () => {
        capturedOnApprovalRequestCallback?.(sampleRequest);
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId("approval-approve-button"));
      });

      expect(mockRespondToApproval).toHaveBeenCalledWith(
        sampleRequest.sessionId,
        sampleRequest.operationId,
        "approve",
      );
    });
  });

  // --- TC-014: reject 操作 ---

  describe("TC-014: reject 操作で respondToApproval('reject') が呼ばれる", () => {
    it("拒否ボタンクリックで respondToApproval(sessionId, operationId, 'reject') が呼ばれる", async () => {
      await act(async () => {
        render(
          <SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />,
        );
      });

      await act(async () => {
        capturedOnApprovalRequestCallback?.(sampleRequest);
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId("approval-reject-button"));
      });

      expect(mockRespondToApproval).toHaveBeenCalledWith(
        sampleRequest.sessionId,
        sampleRequest.operationId,
        "reject",
      );
    });
  });

  // --- TC-015: approval 解決後に非表示 ---

  describe("TC-015: approval 解決後に ApprovalRequestPanel が非表示になる", () => {
    it("承認操作後に ApprovalRequestPanel が消える", async () => {
      await act(async () => {
        render(
          <SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />,
        );
      });

      await act(async () => {
        capturedOnApprovalRequestCallback?.(sampleRequest);
      });

      expect(screen.getByTestId("approval-request-panel")).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(screen.getByTestId("approval-approve-button"));
      });

      expect(
        screen.queryByTestId("approval-request-panel"),
      ).not.toBeInTheDocument();
    });

    it("拒否操作後に ApprovalRequestPanel が消える", async () => {
      await act(async () => {
        render(
          <SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />,
        );
      });

      await act(async () => {
        capturedOnApprovalRequestCallback?.(sampleRequest);
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId("approval-reject-button"));
      });

      expect(
        screen.queryByTestId("approval-request-panel"),
      ).not.toBeInTheDocument();
    });
  });

  // --- TC-016: approval failure path ---

  describe("TC-016: respondToApproval が失敗した場合にエラーが表示される", () => {
    it("success:false の応答で error banner が表示され、panel は残る", async () => {
      mockRespondToApproval.mockResolvedValueOnce({
        success: false,
        error: "approval response failed",
      });

      await act(async () => {
        render(
          <SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />,
        );
      });

      await act(async () => {
        capturedOnApprovalRequestCallback?.(sampleRequest);
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId("approval-approve-button"));
      });

      expect(mockRespondToApproval).toHaveBeenCalledWith(
        sampleRequest.sessionId,
        sampleRequest.operationId,
        "approve",
      );
      expect(screen.getByTestId("skill-lifecycle-error")).toHaveTextContent(
        "approval response failed",
      );
      expect(screen.getByTestId("approval-request-panel")).toBeInTheDocument();
    });
  });
});
