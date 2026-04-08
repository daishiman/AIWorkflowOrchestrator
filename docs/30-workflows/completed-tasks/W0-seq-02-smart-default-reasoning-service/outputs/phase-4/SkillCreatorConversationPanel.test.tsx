import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SkillCreatorConversationPanel } from "../SkillCreatorConversationPanel";

// window.skillCreatorSessionAPI モック
const mockOnQuestion =
  vi.fn<(callback: (question: unknown) => void) => () => void>();
const mockOnComplete =
  vi.fn<(callback: (event: unknown) => void) => () => void>();
const mockOnError = vi.fn<(callback: (event: unknown) => void) => () => void>();
const mockSendAnswer = vi.fn<(answer: unknown) => Promise<void>>();

beforeEach(() => {
  vi.clearAllMocks();
  mockOnQuestion.mockReturnValue(() => {});
  mockOnComplete.mockReturnValue(() => {});
  mockOnError.mockReturnValue(() => {});
  mockSendAnswer.mockResolvedValue(undefined);

  Object.defineProperty(window, "skillCreatorSessionAPI", {
    value: {
      onQuestion: mockOnQuestion,
      onComplete: mockOnComplete,
      onError: mockOnError,
      sendAnswer: mockSendAnswer,
      startSession: vi.fn(),
    },
    writable: true,
    configurable: true,
  });
});

describe("SkillCreatorConversationPanel", () => {
  // T-06: IPCリスナーが unmount 時にクリーンアップされる
  it("アンマウント時に IPC リスナーが解除される", () => {
    const unsubQuestion = vi.fn();
    const unsubComplete = vi.fn();
    const unsubError = vi.fn();
    mockOnQuestion.mockReturnValue(unsubQuestion);
    mockOnComplete.mockReturnValue(unsubComplete);
    mockOnError.mockReturnValue(unsubError);

    const { unmount } = render(<SkillCreatorConversationPanel />);
    unmount();

    expect(unsubQuestion).toHaveBeenCalledTimes(1);
    expect(unsubComplete).toHaveBeenCalledTimes(1);
    expect(unsubError).toHaveBeenCalledTimes(1);
  });

  // マウント時に onQuestion リスナーが登録される
  it("マウント時に onQuestion IPCリスナーが登録される", () => {
    render(<SkillCreatorConversationPanel />);
    expect(mockOnQuestion).toHaveBeenCalledWith(expect.any(Function));
  });

  // マウント時に onComplete リスナーが登録される
  it("マウント時に onComplete IPCリスナーが登録される", () => {
    render(<SkillCreatorConversationPanel />);
    expect(mockOnComplete).toHaveBeenCalledWith(expect.any(Function));
  });

  // マウント時に onError リスナーが登録される
  it("マウント時に onError IPCリスナーが登録される", () => {
    render(<SkillCreatorConversationPanel />);
    expect(mockOnError).toHaveBeenCalledWith(expect.any(Function));
  });
});
