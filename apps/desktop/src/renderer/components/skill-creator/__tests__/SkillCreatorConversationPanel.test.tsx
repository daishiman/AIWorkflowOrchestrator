import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SkillCreatorConversationPanel } from "../SkillCreatorConversationPanel";

// window.skillCreatorSessionAPI モック
const mockOnQuestion =
  vi.fn<(callback: (question: unknown) => void) => () => void>();
const mockOnComplete =
  vi.fn<(callback: (event: unknown) => void) => () => void>();
const mockOnError = vi.fn<(callback: (event: unknown) => void) => () => void>();
const mockOnOutputReady =
  vi.fn<(callback: (payload: unknown) => void) => () => void>();
const mockSendAnswer = vi.fn<(answer: unknown) => Promise<void>>();
const mockConfirmOverwrite = vi.fn<(payload: unknown) => Promise<unknown>>();
const mockOpenSkill = vi.fn<(savedPath: string) => Promise<unknown>>();

beforeEach(() => {
  vi.clearAllMocks();
  mockOnQuestion.mockReturnValue(() => {});
  mockOnComplete.mockReturnValue(() => {});
  mockOnError.mockReturnValue(() => {});
  mockOnOutputReady.mockReturnValue(() => {});
  mockSendAnswer.mockResolvedValue(undefined);
  mockConfirmOverwrite.mockResolvedValue({ success: true });
  mockOpenSkill.mockResolvedValue({ success: true });

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

  Object.defineProperty(window, "skillCreatorAPI", {
    value: {
      onOutputReady: mockOnOutputReady,
      confirmOverwrite: mockConfirmOverwrite,
      openSkill: mockOpenSkill,
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

describe("SkillCreatorConversationPanel 結合テスト", () => {
  // T-11-1: IPC 受信で QuestionCard が更新される
  it("question-received 受信で QuestionCard が表示される", async () => {
    let questionCallback: ((question: unknown) => void) | undefined;
    mockOnQuestion.mockImplementation((cb) => {
      questionCallback = cb;
      return () => {};
    });
    mockOnComplete.mockReturnValue(() => {});
    mockOnError.mockReturnValue(() => {});

    render(<SkillCreatorConversationPanel />);

    await act(async () => {
      questionCallback!({
        toolCallId: "tc-1",
        type: "single_select",
        question: "使用言語を選択してください",
        options: [
          { value: "typescript", label: "TypeScript" },
          { value: "javascript", label: "JavaScript" },
        ],
      });
    });

    expect(screen.getByText("使用言語を選択してください")).toBeInTheDocument();
  });

  // T-11-2: 複数回 IPC 受信で questionIndex が更新される
  it("question-received を2回受信すると進捗が更新される", async () => {
    let questionCallback: ((question: unknown) => void) | undefined;
    mockOnQuestion.mockImplementation((cb) => {
      questionCallback = cb;
      return () => {};
    });
    mockOnComplete.mockReturnValue(() => {});
    mockOnError.mockReturnValue(() => {});

    render(<SkillCreatorConversationPanel />);

    await act(async () => {
      questionCallback!({
        toolCallId: "tc-1",
        type: "free_text",
        question: "質問1",
      });
    });
    await act(async () => {
      questionCallback!({
        toolCallId: "tc-2",
        type: "free_text",
        question: "質問2",
      });
    });

    expect(screen.getByText(/質問\s*2\s*\/\s*10/)).toBeInTheDocument();
  });

  // セッション完了時にコールバックが呼ばれる
  it("session-complete 受信で onComplete が呼ばれる", async () => {
    let completeCallback: ((event: unknown) => void) | undefined;
    mockOnQuestion.mockReturnValue(() => {});
    mockOnComplete.mockImplementation((cb) => {
      completeCallback = cb;
      return () => {};
    });
    mockOnError.mockReturnValue(() => {});

    const onComplete = vi.fn();
    render(<SkillCreatorConversationPanel onComplete={onComplete} />);

    await act(async () => {
      completeCallback!({ result: "done" });
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  // セッションエラー時にエラーメッセージが表示される
  it("session-error 受信でエラーメッセージが表示される", async () => {
    let errorCallback: ((event: unknown) => void) | undefined;
    mockOnQuestion.mockReturnValue(() => {});
    mockOnComplete.mockReturnValue(() => {});
    mockOnError.mockImplementation((cb) => {
      errorCallback = cb;
      return () => {};
    });

    render(<SkillCreatorConversationPanel />);

    await act(async () => {
      errorCallback!({ error: "接続が切断されました" });
    });

    expect(screen.getByText("接続が切断されました")).toBeInTheDocument();
  });

  // 質問受信後に回答を送信するとsendAnswerが呼ばれる
  it("回答送信で sendAnswer が呼ばれる", async () => {
    let questionCallback: ((question: unknown) => void) | undefined;
    mockOnQuestion.mockImplementation((cb) => {
      questionCallback = cb;
      return () => {};
    });
    mockOnComplete.mockReturnValue(() => {});
    mockOnError.mockReturnValue(() => {});

    render(<SkillCreatorConversationPanel />);

    await act(async () => {
      questionCallback!({
        toolCallId: "tc-1",
        type: "single_select",
        question: "言語を選んでください",
        options: [{ value: "ts", label: "TypeScript" }],
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByText("TypeScript"));
    });

    expect(mockSendAnswer).toHaveBeenCalledWith({
      toolCallId: "tc-1",
      value: "ts",
    });
  });

  // multi_select のその他入力は selectedValues として送信される
  it("multi_select のその他入力で selectedValues が sendAnswer に渡される", async () => {
    let questionCallback: ((question: unknown) => void) | undefined;
    mockOnQuestion.mockImplementation((cb) => {
      questionCallback = cb;
      return () => {};
    });
    mockOnComplete.mockReturnValue(() => {});
    mockOnError.mockReturnValue(() => {});

    render(<SkillCreatorConversationPanel />);

    await act(async () => {
      questionCallback!({
        toolCallId: "tc-2",
        type: "multi_select",
        question: "機能を選んでください",
        options: [
          { value: "auth", label: "認証" },
          { value: "db", label: "DB連携" },
        ],
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByText("その他（自由入力）"));
    });
    await act(async () => {
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "カスタム入力" },
      });
      fireEvent.keyDown(screen.getByRole("textbox"), {
        key: "Enter",
        shiftKey: false,
      });
    });

    expect(mockSendAnswer).toHaveBeenCalledWith({
      toolCallId: "tc-2",
      value: ["カスタム入力"],
    });
  });

  // 送信後は次の question-received まで再送信されない
  it("回答送信後、次の question-received が来るまで再送信されない", async () => {
    let questionCallback: ((question: unknown) => void) | undefined;
    let resolveSendAnswer: (() => void) | undefined;
    mockOnQuestion.mockImplementation((cb) => {
      questionCallback = cb;
      return () => {};
    });
    mockOnComplete.mockReturnValue(() => {});
    mockOnError.mockReturnValue(() => {});
    mockSendAnswer.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSendAnswer = resolve;
        }),
    );

    render(<SkillCreatorConversationPanel />);

    await act(async () => {
      questionCallback!({
        toolCallId: "tc-3",
        type: "single_select",
        question: "言語を選んでください",
        options: [{ value: "ts", label: "TypeScript" }],
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByText("TypeScript"));
    });

    expect(mockSendAnswer).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSendAnswer?.();
    });

    const button = screen.getByRole("button", { name: "TypeScript" });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(mockSendAnswer).toHaveBeenCalledTimes(1);
  });

  // sendAnswer失敗時にエラー状態に遷移する
  it("sendAnswer 失敗時にエラーメッセージが表示される", async () => {
    let questionCallback: ((question: unknown) => void) | undefined;
    mockOnQuestion.mockImplementation((cb) => {
      questionCallback = cb;
      return () => {};
    });
    mockOnComplete.mockReturnValue(() => {});
    mockOnError.mockReturnValue(() => {});
    mockSendAnswer.mockRejectedValueOnce(new Error("送信失敗"));

    render(<SkillCreatorConversationPanel />);

    await act(async () => {
      questionCallback!({
        toolCallId: "tc-1",
        type: "single_select",
        question: "選択してください",
        options: [{ value: "a", label: "選択肢A" }],
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByText("選択肢A"));
    });

    expect(screen.getByText("送信失敗")).toBeInTheDocument();
  });

  // 質問待機中のメッセージ表示
  it("質問未受信時に待機メッセージが表示される", () => {
    mockOnQuestion.mockReturnValue(() => {});
    mockOnComplete.mockReturnValue(() => {});
    mockOnError.mockReturnValue(() => {});

    render(<SkillCreatorConversationPanel />);
    expect(screen.getByText("質問を待機中...")).toBeInTheDocument();
  });

  // 完了状態のUIメッセージ
  it("session-complete 受信後に完了メッセージが表示される", async () => {
    let completeCallback: ((event: unknown) => void) | undefined;
    mockOnQuestion.mockReturnValue(() => {});
    mockOnComplete.mockImplementation((cb) => {
      completeCallback = cb;
      return () => {};
    });
    mockOnError.mockReturnValue(() => {});

    render(<SkillCreatorConversationPanel />);

    await act(async () => {
      completeCallback!({ result: "done" });
    });

    expect(screen.getByText("インタビューが完了しました")).toBeInTheDocument();
  });

  it("onOutputReady が登録され、アンマウント時に解除される", () => {
    const cleanup = vi.fn();
    mockOnOutputReady.mockReturnValue(cleanup);

    const { unmount } = render(<SkillCreatorConversationPanel />);
    expect(mockOnOutputReady).toHaveBeenCalledWith(expect.any(Function));

    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("session complete 後に output-ready 受信で ResultPanel が表示される", async () => {
    let completeCallback: ((event: unknown) => void) | undefined;
    let outputCallback: ((payload: unknown) => void) | undefined;
    mockOnQuestion.mockReturnValue(() => {});
    mockOnComplete.mockImplementation((cb) => {
      completeCallback = cb;
      return () => {};
    });
    mockOnError.mockReturnValue(() => {});
    mockOnOutputReady.mockImplementation((cb) => {
      outputCallback = cb;
      return () => {};
    });

    render(<SkillCreatorConversationPanel />);

    await act(async () => {
      completeCallback!({ result: "done" });
    });
    await act(async () => {
      outputCallback!({
        skillName: "result-skill",
        savedPath: "/project/.claude/skills/result-skill/SKILL.md",
        content: "name: result-skill\ndescription: result",
        requiresOverwriteConfirm: false,
      });
    });

    expect(
      screen.getByText("スキルを生成しました: result-skill"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "スキルを開く" }),
    ).toBeInTheDocument();
  });

  it("上書き確認付き output-ready の操作で confirmOverwrite が呼ばれる", async () => {
    let completeCallback: ((event: unknown) => void) | undefined;
    let outputCallback: ((payload: unknown) => void) | undefined;
    mockOnQuestion.mockReturnValue(() => {});
    mockOnComplete.mockImplementation((cb) => {
      completeCallback = cb;
      return () => {};
    });
    mockOnError.mockReturnValue(() => {});
    mockOnOutputReady.mockImplementation((cb) => {
      outputCallback = cb;
      return () => {};
    });

    render(<SkillCreatorConversationPanel />);

    await act(async () => {
      completeCallback!({ result: "done" });
    });
    await act(async () => {
      outputCallback!({
        skillName: "existing-skill",
        savedPath: "/project/.claude/skills/existing-skill/SKILL.md",
        content: "name: existing-skill\ndescription: existing",
        requiresOverwriteConfirm: true,
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "上書きして保存" }));
    });

    expect(mockConfirmOverwrite).toHaveBeenCalledWith(
      expect.objectContaining({
        skillName: "existing-skill",
        requiresOverwriteConfirm: true,
      }),
    );
  });

  it("スキルを開くボタンで openSkill が呼ばれる", async () => {
    let completeCallback: ((event: unknown) => void) | undefined;
    let outputCallback: ((payload: unknown) => void) | undefined;
    mockOnQuestion.mockReturnValue(() => {});
    mockOnComplete.mockImplementation((cb) => {
      completeCallback = cb;
      return () => {};
    });
    mockOnError.mockReturnValue(() => {});
    mockOnOutputReady.mockImplementation((cb) => {
      outputCallback = cb;
      return () => {};
    });

    render(<SkillCreatorConversationPanel />);

    await act(async () => {
      completeCallback!({ result: "done" });
    });
    await act(async () => {
      outputCallback!({
        skillName: "open-skill",
        savedPath: "/project/.claude/skills/open-skill/SKILL.md",
        content: "name: open-skill",
        requiresOverwriteConfirm: false,
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "スキルを開く" }));
    });

    expect(mockOpenSkill).toHaveBeenCalledWith(
      "/project/.claude/skills/open-skill/SKILL.md",
    );
  });
});
