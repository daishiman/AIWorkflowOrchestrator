/**
 * @vitest-environment happy-dom
 *
 * UT-SDK-07-APPROVAL-REQUEST-SURFACE-001: ApprovalRequestPanel コンポーネントテスト
 *
 * AC-2: Renderer に approval 確認 UI が表示される
 * AC-3: approve/reject 操作が respondToApproval() と接続されている
 */
import "@testing-library/jest-dom/vitest";
import React from "react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  act,
} from "@testing-library/react";
import { ApprovalRequestPanel } from "../ApprovalRequestPanel";
import type { ApprovalRequestPayload } from "@repo/shared/types";

const sampleRequest: ApprovalRequestPayload = {
  sessionId: "session-test-1",
  operationId: "op-test-1",
  operationType: "file_write",
  description: "危険なファイル書き込みを実行しようとしています",
  destination: "/etc/hosts",
};

describe("ApprovalRequestPanel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  // --- TC-007: null の場合は何も表示しない ---

  describe("TC-007: null request の場合は何も表示しない", () => {
    it("request=null のとき何もレンダリングされない", () => {
      const { container } = render(
        <ApprovalRequestPanel
          request={null}
          onApprove={vi.fn()}
          onReject={vi.fn()}
        />,
      );
      expect(container.firstChild).toBeNull();
    });
  });

  // --- TC-004: pending 状態の描画 ---

  describe("TC-004: pending 状態でツール名・説明が表示される", () => {
    it("operationType と description が画面に表示される", () => {
      render(
        <ApprovalRequestPanel
          request={sampleRequest}
          onApprove={vi.fn()}
          onReject={vi.fn()}
        />,
      );

      expect(screen.getByText("file_write")).toBeInTheDocument();
      expect(
        screen.getByText("危険なファイル書き込みを実行しようとしています"),
      ).toBeInTheDocument();
    });

    it("destination がある場合は送信先を表示する（TC-011）", () => {
      render(
        <ApprovalRequestPanel
          request={sampleRequest}
          onApprove={vi.fn()}
          onReject={vi.fn()}
        />,
      );

      expect(screen.getByText("/etc/hosts")).toBeInTheDocument();
    });

    it("destination がない場合は送信先セクションを表示しない", () => {
      const requestWithoutDest: ApprovalRequestPayload = {
        ...sampleRequest,
        destination: undefined,
      };
      render(
        <ApprovalRequestPanel
          request={requestWithoutDest}
          onApprove={vi.fn()}
          onReject={vi.fn()}
        />,
      );

      expect(
        screen.queryByTestId("approval-destination"),
      ).not.toBeInTheDocument();
    });
  });

  // --- TC-005: ボタンが有効な状態 ---

  describe("TC-005: pending 状態で承認・拒否ボタンが有効", () => {
    it("承認ボタンが disabled=false", () => {
      render(
        <ApprovalRequestPanel
          request={sampleRequest}
          onApprove={vi.fn()}
          onReject={vi.fn()}
        />,
      );

      const approveButton = screen.getByTestId("approval-approve-button");
      expect(approveButton).not.toBeDisabled();
    });

    it("拒否ボタンが disabled=false", () => {
      render(
        <ApprovalRequestPanel
          request={sampleRequest}
          onApprove={vi.fn()}
          onReject={vi.fn()}
        />,
      );

      const rejectButton = screen.getByTestId("approval-reject-button");
      expect(rejectButton).not.toBeDisabled();
    });
  });

  // --- TC-008: approve 操作 ---

  describe("TC-008: 承認ボタンクリックで onApprove が呼ばれる", () => {
    it("onApprove(sessionId, operationId) が呼ばれる", async () => {
      const mockApprove = vi.fn().mockResolvedValue(undefined);
      render(
        <ApprovalRequestPanel
          request={sampleRequest}
          onApprove={mockApprove}
          onReject={vi.fn()}
        />,
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId("approval-approve-button"));
      });

      expect(mockApprove).toHaveBeenCalledWith(
        sampleRequest.sessionId,
        sampleRequest.operationId,
      );
    });
  });

  // --- TC-009: reject 操作 ---

  describe("TC-009: 拒否ボタンクリックで onReject が呼ばれる", () => {
    it("onReject(sessionId, operationId) が呼ばれる", async () => {
      const mockReject = vi.fn().mockResolvedValue(undefined);
      render(
        <ApprovalRequestPanel
          request={sampleRequest}
          onApprove={vi.fn()}
          onReject={mockReject}
        />,
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId("approval-reject-button"));
      });

      expect(mockReject).toHaveBeenCalledWith(
        sampleRequest.sessionId,
        sampleRequest.operationId,
      );
    });
  });

  // --- TC-010: resolving 中の二重送信防止 ---

  describe("TC-010: resolving 中はボタンが無効化される", () => {
    it("onApprove 実行中はボタンが disabled になる", async () => {
      let resolveApprove!: () => void;
      const mockApprove = vi.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveApprove = resolve;
          }),
      );

      render(
        <ApprovalRequestPanel
          request={sampleRequest}
          onApprove={mockApprove}
          onReject={vi.fn()}
        />,
      );

      // ボタンをクリック（Promise は未解決）
      act(() => {
        fireEvent.click(screen.getByTestId("approval-approve-button"));
      });

      // resolving 中はボタンが disabled
      expect(screen.getByTestId("approval-approve-button")).toBeDisabled();
      expect(screen.getByTestId("approval-reject-button")).toBeDisabled();

      // Promise を解決
      await act(async () => {
        resolveApprove();
      });
    });

    it("onApprove が reject しても pending に戻る", async () => {
      const mockApprove = vi
        .fn()
        .mockRejectedValue(new Error("approval failed"));

      render(
        <ApprovalRequestPanel
          request={sampleRequest}
          onApprove={mockApprove}
          onReject={vi.fn()}
        />,
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId("approval-approve-button"));
      });

      expect(screen.getByTestId("approval-approve-button")).not.toBeDisabled();
      expect(screen.getByTestId("approval-reject-button")).not.toBeDisabled();
    });
  });

  // --- TC-006: expired 状態 ---

  describe("TC-006: expired 状態で承認・拒否ボタンが無効化される", () => {
    it("TTL 超過後にボタンが disabled になり期限切れメッセージが表示される", () => {
      render(
        <ApprovalRequestPanel
          request={sampleRequest}
          onApprove={vi.fn()}
          onReject={vi.fn()}
        />,
      );

      // 初期状態はボタンが有効
      expect(screen.getByTestId("approval-approve-button")).not.toBeDisabled();

      // 300s + 1ms 経過させる
      act(() => {
        vi.advanceTimersByTime(300 * 1000 + 1);
      });

      // expired 状態でボタンが無効化
      expect(screen.getByTestId("approval-approve-button")).toBeDisabled();
      expect(screen.getByTestId("approval-reject-button")).toBeDisabled();

      // 期限切れメッセージが表示される
      expect(
        screen.getByTestId("approval-expired-message"),
      ).toBeInTheDocument();
    });
  });
});
