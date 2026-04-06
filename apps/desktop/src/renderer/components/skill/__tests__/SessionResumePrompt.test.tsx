import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  SessionResumePrompt,
  type SessionListItem,
} from "../SessionResumePrompt";

const compatibleSession: SessionListItem = {
  checkpointId: "cp-001-abc",
  sessionId: "session-001-abc",
  planId: "plan-abc-123",
  checkpointType: "review-ready",
  currentPhase: "review",
  startedAt: Date.now() - 3_600_000,
  createdAt: Date.now() - 3_600_000, // 1時間前
  updatedAt: Date.now() - 1_800_000, // 30分前
  compatibility: {
    status: "compatible",
    reasons: [],
    warnings: [],
  },
};

const warningSession: SessionListItem = {
  checkpointId: "cp-002-def",
  sessionId: "session-002-def",
  planId: "plan-def-456",
  checkpointType: "execute-complete",
  currentPhase: "verify",
  startedAt: Date.now() - 7_200_000,
  createdAt: Date.now() - 7_200_000,
  updatedAt: Date.now() - 3_600_000,
  compatibility: {
    status: "compatible_with_warning",
    reasons: [],
    warnings: ["スキルクリエイターのルートが変更されました"],
  },
};

const incompatibleSession: SessionListItem = {
  checkpointId: "cp-003-ghi",
  sessionId: "session-003-ghi",
  planId: "plan-ghi-789",
  checkpointType: "verify-fail",
  currentPhase: "verify",
  startedAt: Date.now() - 86_400_000,
  createdAt: Date.now() - 86_400_000,
  updatedAt: Date.now() - 86_400_000,
  compatibility: {
    status: "incompatible",
    reasons: ["version_mismatch"],
    warnings: [],
  },
};

describe("SessionResumePrompt", () => {
  const defaultProps = {
    sessions: [compatibleSession],
    isLoading: false,
    onResume: vi.fn(),
    onSkip: vi.fn(),
    onDelete: vi.fn(),
  };

  // AC-1: 未完了セッション検出時にプロンプト表示
  it("セッションがある場合に復元プロンプトが表示される", () => {
    render(<SessionResumePrompt {...defaultProps} />);

    expect(screen.getByTestId("session-resume-prompt")).toBeInTheDocument();
    expect(
      screen.getByText("前回のセッションを復元しますか？"),
    ).toBeInTheDocument();
  });

  // AC-1: セッションなしの場合非表示
  it("セッションがない場合は何も表示されない", () => {
    render(<SessionResumePrompt {...defaultProps} sessions={[]} />);

    expect(
      screen.queryByTestId("session-resume-prompt"),
    ).not.toBeInTheDocument();
  });

  // ローディング状態
  it("ローディング中はローディング表示", () => {
    render(<SessionResumePrompt {...defaultProps} isLoading={true} />);

    expect(screen.getByTestId("session-resume-loading")).toBeInTheDocument();
    expect(screen.getByText("セッションを確認中...")).toBeInTheDocument();
  });

  // AC-2: 復元ボタンクリック
  it("復元ボタンをクリックすると onResume が呼ばれる", () => {
    const onResume = vi.fn();
    render(<SessionResumePrompt {...defaultProps} onResume={onResume} />);

    const resumeBtn = screen.getByTestId(
      `session-resume-btn-${compatibleSession.sessionId}`,
    );
    fireEvent.click(resumeBtn);
    expect(onResume).toHaveBeenCalledWith(compatibleSession.checkpointId);
  });

  // AC-3: スキップ選択
  it("スキップをクリックすると onSkip が呼ばれる", () => {
    const onSkip = vi.fn();
    render(<SessionResumePrompt {...defaultProps} onSkip={onSkip} />);

    fireEvent.click(screen.getByTestId("session-skip-btn"));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it("新規開始ボタンをクリックすると onStartNew が呼ばれる", () => {
    const onStartNew = vi.fn();
    render(<SessionResumePrompt {...defaultProps} onStartNew={onStartNew} />);

    fireEvent.click(screen.getByTestId("session-start-new-btn"));
    expect(onStartNew).toHaveBeenCalledTimes(1);
  });

  // AC-7: compatible_with_warning は復元可能（警告付き）
  it("compatible_with_warning セッションは復元ボタンと警告を表示する", () => {
    render(
      <SessionResumePrompt {...defaultProps} sessions={[warningSession]} />,
    );

    expect(
      screen.getByTestId(`session-resume-btn-${warningSession.sessionId}`),
    ).toBeInTheDocument();
    expect(screen.getByText("警告あり")).toBeInTheDocument();
    expect(
      screen.getByText("スキルクリエイターのルートが変更されました"),
    ).toBeInTheDocument();
  });

  // AC-7: incompatible セッションは復元ボタン非表示
  it("incompatible セッションは復元ボタンが表示されない", () => {
    render(
      <SessionResumePrompt
        {...defaultProps}
        sessions={[incompatibleSession]}
      />,
    );

    expect(
      screen.queryByTestId(
        `session-resume-btn-${incompatibleSession.sessionId}`,
      ),
    ).not.toBeInTheDocument();
    expect(screen.getByText("非互換")).toBeInTheDocument();
  });

  // 削除ボタン
  it("削除ボタンをクリックすると onDelete が呼ばれる", () => {
    const onDelete = vi.fn();
    render(<SessionResumePrompt {...defaultProps} onDelete={onDelete} />);

    fireEvent.click(
      screen.getByTestId(`session-delete-btn-${compatibleSession.sessionId}`),
    );
    expect(onDelete).toHaveBeenCalledWith(compatibleSession.checkpointId);
  });

  // 複数セッション表示
  it("複数セッションが一覧表示される", () => {
    render(
      <SessionResumePrompt
        {...defaultProps}
        sessions={[compatibleSession, warningSession, incompatibleSession]}
      />,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByTestId("session-list")).toBeInTheDocument();
  });

  // セッション情報の表示内容
  it("セッション情報（フェーズ、種別、sessionId先頭8文字）が表示される", () => {
    render(<SessionResumePrompt {...defaultProps} />);

    expect(screen.getByText(/レビュー/)).toBeInTheDocument();
    expect(screen.getByText(/レビュー準備完了/)).toBeInTheDocument();
    expect(screen.getByText("session-")).toBeInTheDocument();
  });

  // アクセシビリティ
  it("region ロールとラベルが設定されている", () => {
    render(<SessionResumePrompt {...defaultProps} />);

    expect(
      screen.getByRole("region", { name: "セッション復元" }),
    ).toBeInTheDocument();
  });
});
