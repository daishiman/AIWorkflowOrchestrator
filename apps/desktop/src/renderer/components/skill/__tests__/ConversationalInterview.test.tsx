import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ConversationalInterview } from "../ConversationalInterview";
import type {
  SkillCreatorWorkflowUiSnapshot,
  SkillCreatorUserInputRequest,
} from "@repo/shared/types/skillCreator";

function buildSnapshot(
  overrides?: Partial<SkillCreatorWorkflowUiSnapshot>,
  request?: SkillCreatorUserInputRequest | null,
): SkillCreatorWorkflowUiSnapshot {
  return {
    planId: "plan-1",
    currentPhase: "review",
    awaitingUserInput: request ?? null,
    verifyResult: null,
    resumeTokenEnvelope: {
      version: "task-sdk-02-v1",
      planId: "plan-1",
      currentPhase: "review",
      artifactCount: 0,
      updatedAt: new Date().toISOString(),
    },
    ...overrides,
  };
}

function buildSingleSelectRequest(
  overrides?: Partial<SkillCreatorUserInputRequest>,
): SkillCreatorUserInputRequest {
  return {
    requestId: "req-1",
    reason: "plan_review",
    title: "テスト質問",
    prompt: "選択肢を選んでください",
    kind: "single_select",
    options: [
      { id: "opt-a", label: "選択肢A" },
      { id: "opt-b", label: "選択肢B" },
    ],
    requestedAt: new Date().toISOString(),
    ...overrides,
  };
}

function buildMultiSelectRequest(): SkillCreatorUserInputRequest {
  return {
    requestId: "req-multi",
    reason: "plan_review",
    title: "複数選択",
    prompt: "複数選んでください",
    kind: "multi_select",
    options: [
      { id: "m-a", label: "項目A" },
      { id: "m-b", label: "項目B" },
      { id: "m-c", label: "項目C" },
    ],
    requestedAt: new Date().toISOString(),
  };
}

function buildFreeTextRequest(): SkillCreatorUserInputRequest {
  return {
    requestId: "req-text",
    reason: "plan_review",
    title: "テキスト入力",
    prompt: "説明を入力してください",
    kind: "free_text",
    placeholder: "ここに入力...",
    requestedAt: new Date().toISOString(),
  };
}

function buildConfirmRequest(): SkillCreatorUserInputRequest {
  return {
    requestId: "req-confirm",
    reason: "plan_review",
    title: "確認",
    prompt: "続行しますか？",
    kind: "confirm",
    requestedAt: new Date().toISOString(),
  };
}

function buildSecretRequest(): SkillCreatorUserInputRequest {
  return {
    requestId: "req-secret",
    reason: "plan_review",
    title: "APIキー",
    prompt: "APIキーを入力してください",
    kind: "secret",
    placeholder: "sk-...",
    requestedAt: new Date().toISOString(),
  };
}

describe("ConversationalInterview", () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TC-01: チャットバブル形式でメッセージが表示される
  it("displays assistant message in chat bubble format (TC-01)", () => {
    const request = buildSingleSelectRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByTestId("conversational-interview")).toBeInTheDocument();
    expect(screen.getByTestId("interview-chat-area")).toBeInTheDocument();
    expect(screen.getByText("選択肢を選んでください")).toBeInTheDocument();
  });

  // TC-03: single_selectの選択チップ群が表示される
  it("renders single_select as chips (TC-03)", () => {
    const request = buildSingleSelectRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByTestId("single-select-chips")).toBeInTheDocument();
    expect(screen.getByTestId("chip-opt-a")).toBeInTheDocument();
    expect(screen.getByTestId("chip-opt-b")).toBeInTheDocument();
  });

  // TC-04: multi_selectのチェックボックスリストが表示される
  it("renders multi_select as checkboxes (TC-04)", () => {
    const request = buildMultiSelectRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByTestId("multi-select-checkbox")).toBeInTheDocument();
    expect(screen.getByTestId("checkbox-m-a")).toBeInTheDocument();
  });

  // TC-05: free_textのテキスト入力が表示される
  it("renders free_text input (TC-05)", () => {
    const request = buildFreeTextRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByTestId("free-text-input")).toBeInTheDocument();
  });

  // TC-06: confirmのYes/No CTAが表示される
  it("renders confirm buttons (TC-06)", () => {
    const request = buildConfirmRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByTestId("confirm-buttons")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-yes")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-no")).toBeInTheDocument();
  });

  // TC-07: secretのマスク付き入力が表示される
  it("renders secret input (TC-07)", () => {
    const request = buildSecretRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByTestId("secret-input")).toBeInTheDocument();
  });

  // TC-08: 進捗インジケーターが表示される
  it("displays progress bar (TC-08)", () => {
    const request = buildSingleSelectRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByTestId("interview-progress-bar")).toBeInTheDocument();
    expect(screen.getByTestId("progress-text")).toBeInTheDocument();
  });

  // TC-11/TC-12: 熟練度モード切替
  it("shows beginner hints when proficiency is beginner (TC-11)", () => {
    const request = buildFreeTextRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    // デフォルトはbeginner
    expect(screen.getByTestId("proficiency-beginner")).toBeInTheDocument();
    // placeholder が hint として表示される
    expect(screen.getByText("ここに入力...")).toBeInTheDocument();
  });

  it("hides beginner hints in engineer mode (TC-12)", () => {
    const request = buildFreeTextRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("proficiency-engineer"));

    // engineerモードではplaceholder hintが非表示
    const chatArea = screen.getByTestId("interview-chat-area");
    const italicHints = chatArea.querySelectorAll(".italic");
    expect(italicHints.length).toBe(0);
  });

  // TC-15: single_selectの選択 → submission
  it("submits single_select answer (TC-15)", async () => {
    const request = buildSingleSelectRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          planId: "plan-1",
          requestId: "req-1",
          selectedOptionId: "opt-a",
        }),
      );
    });
  });

  // TC-17: confirmの「はい」をクリック
  it("submits confirm yes immediately (TC-17)", async () => {
    const request = buildConfirmRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("confirm-yes"));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          planId: "plan-1",
          requestId: "req-confirm",
          confirmed: true,
        }),
      );
    });
  });

  // TC-E01: single_selectで未選択のまま送信
  it("shows validation error when submitting single_select without selection (TC-E01)", () => {
    const request = buildSingleSelectRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("interview-submit"));

    expect(screen.getByTestId("validation-error")).toBeInTheDocument();
    expect(screen.getByText("選択肢を1つ選んでください")).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // TC-E02: multi_selectで0件選択のまま送信
  it("shows validation error when submitting multi_select without selection (TC-E02)", () => {
    const request = buildMultiSelectRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("interview-submit"));

    expect(screen.getByTestId("validation-error")).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("restores previous question and answer on undo", async () => {
    const request = buildSingleSelectRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId("interview-undo"));

    expect(screen.getByTestId("chip-opt-a")).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByText("選択肢を選んでください")).toBeInTheDocument();
  });

  it("rolls back optimistic user message when submit fails", async () => {
    const request = buildSingleSelectRequest();
    const snapshot = buildSnapshot({}, request);
    const failingOnSubmit = vi
      .fn()
      .mockRejectedValue(new Error("submit failed"));

    const { container } = render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={failingOnSubmit}
        onError={mockOnError}
      />,
    );

    fireEvent.click(screen.getByTestId("chip-opt-a"));
    fireEvent.click(screen.getByTestId("interview-submit"));

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith("回答の送信に失敗しました");
    });

    expect(
      container.querySelector('[data-testid^="message-user-"]'),
    ).toBeNull();
  });

  // TC-E05: 最初の質問で「戻る」ボタンが無効
  it("disables undo button at first question (TC-E05)", () => {
    const request = buildSingleSelectRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    const undoBtn = screen.getByTestId("interview-undo");
    expect(undoBtn).toBeDisabled();
  });

  // TC-E07: workflowSnapshotがnullの場合
  it("renders nothing when workflowSnapshot is null (TC-E07)", () => {
    const { container } = render(
      <ConversationalInterview
        workflowSnapshot={null}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  // TC-E08: pendingRequestがnullの場合
  it("shows waiting message when no pending request (TC-E08)", () => {
    const snapshot = buildSnapshot({}, null);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByTestId("interview-waiting")).toBeInTheDocument();
    expect(screen.getByText("質問を待っています...")).toBeInTheDocument();
  });

  // TC-21: secret表示/非表示トグル
  it("toggles secret visibility (TC-21)", () => {
    const request = buildSecretRequest();
    const snapshot = buildSnapshot({}, request);

    render(
      <ConversationalInterview
        workflowSnapshot={snapshot}
        onSubmit={mockOnSubmit}
      />,
    );

    const input = screen.getByTestId("secret-input-field") as HTMLInputElement;
    expect(input.type).toBe("password");

    fireEvent.click(screen.getByTestId("secret-toggle"));
    expect(input.type).toBe("text");

    fireEvent.click(screen.getByTestId("secret-toggle"));
    expect(input.type).toBe("password");
  });
});
