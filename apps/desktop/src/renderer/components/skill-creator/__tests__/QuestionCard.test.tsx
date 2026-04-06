import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QuestionCard } from "../QuestionCard";
import type {
  InterviewUserAnswer,
  SkillCreatorUserInputRequest,
} from "@repo/shared/types/skillCreator";

const baseRequest = (
  overrides: Partial<SkillCreatorUserInputRequest>,
): SkillCreatorUserInputRequest => ({
  requestId: "request-1",
  reason: "plan_review",
  title: "使用言語を選択してください",
  prompt: "スキルの実装言語を指定します",
  kind: "single_select",
  options: [
    { id: "typescript", label: "TypeScript", description: "推奨" },
    { id: "javascript", label: "JavaScript" },
  ],
  requestedAt: "2026-04-02T00:00:00Z",
  ...overrides,
});

describe("QuestionCard", () => {
  // T-01-1: 質問テキストとコンテキストが表示される
  it("request.title と request.prompt が表示される", () => {
    const request = baseRequest({});
    render(<QuestionCard request={request} onAnswer={() => {}} />);
    expect(screen.getByText("使用言語を選択してください")).toBeInTheDocument();
    expect(
      screen.getByText("スキルの実装言語を指定します"),
    ).toBeInTheDocument();
  });

  // T-01-2: single_select で選択肢が表示される
  it("single_select タイプで選択肢ボタンが表示される", () => {
    const request = baseRequest({
      title: "フレームワークを選択してください",
      prompt: "好みの UI フレームワークを選んでください",
      options: [
        { id: "react", label: "React" },
        { id: "vue", label: "Vue" },
        { id: "angular", label: "Angular" },
      ],
    });
    render(<QuestionCard request={request} onAnswer={() => {}} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Vue")).toBeInTheDocument();
    expect(screen.getByText("Angular")).toBeInTheDocument();
  });

  // T-02: single_select で「その他（自由入力）」が最後の選択肢として常に表示される
  it("single_select で「その他（自由入力）」が選択肢の最後に常に表示される", () => {
    const request = baseRequest({
      options: [
        { id: "typescript", label: "TypeScript" },
        { id: "javascript", label: "JavaScript" },
      ],
    });
    render(<QuestionCard request={request} onAnswer={() => {}} />);
    const buttons = screen.getAllByRole("button");
    const lastButton = buttons[buttons.length - 1];
    expect(lastButton).toHaveTextContent("その他（自由入力）");
  });

  // T-02b: multi_select でも「その他（自由入力）」が最後の選択肢として常に表示される
  it("multi_select で「その他（自由入力）」が選択肢の最後に常に表示される", () => {
    const request = baseRequest({
      kind: "multi_select",
      title: "機能を選んでください",
      prompt: "使いたい機能を複数選択してください",
      options: [
        { id: "auth", label: "認証" },
        { id: "db", label: "DB連携" },
        { id: "api", label: "API" },
      ],
    });
    render(<QuestionCard request={request} onAnswer={() => {}} />);
    const buttons = screen.getAllByRole("button");
    // 送信ボタンを除いた選択肢ボタンの最後が「その他（自由入力）」
    const choiceButtons = buttons.filter(
      (btn) => !btn.textContent?.includes("送信"),
    );
    const lastChoiceButton = choiceButtons[choiceButtons.length - 1];
    expect(lastChoiceButton).toHaveTextContent("その他（自由入力）");
  });

  // T-03: ChoiceButton クリックで onAnswer コールバックが呼ばれる
  it("ChoiceButton クリックで onAnswer コールバックが呼ばれる", () => {
    const onAnswer = vi.fn<(answer: InterviewUserAnswer) => void>();
    const request = baseRequest({
      title: "選んでください",
      options: [{ id: "choice-a", label: "選択肢A" }],
    });
    render(<QuestionCard request={request} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText("選択肢A"));
    expect(onAnswer).toHaveBeenCalledWith({
      kind: "single_select",
      selectedOptionId: "choice-a",
    });
  });

  // T-05: confirm タイプで「はい」「いいえ」が表示される
  it("confirm タイプで「はい」「いいえ」ボタンが表示される", () => {
    const request = baseRequest({
      kind: "confirm",
      title: "続けますか？",
      prompt: "この内容で進めてよいか確認してください。",
      options: [],
    });
    render(<QuestionCard request={request} onAnswer={() => {}} />);
    expect(screen.getByText("はい")).toBeInTheDocument();
    expect(screen.getByText("いいえ")).toBeInTheDocument();
  });

  // T-05b: confirm タイプで「はい」クリック時に confirmed=true が送信される
  it("confirm タイプで「はい」クリック時に confirmed=true が送信される", () => {
    const onAnswer = vi.fn<(answer: InterviewUserAnswer) => void>();
    const request = baseRequest({
      kind: "confirm",
      title: "続けますか？",
      prompt: "この内容で進めてよいか確認してください。",
      options: [],
    });
    render(<QuestionCard request={request} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText("はい"));
    expect(onAnswer).toHaveBeenCalledWith({
      kind: "confirm",
      confirmed: true,
    });
  });
});

describe("QuestionCard エッジケース", () => {
  // T-08-1: options が空の場合でも「その他（自由入力）」だけが表示される
  it("options が空配列のとき「その他（自由入力）」のみが表示される", () => {
    const request = baseRequest({
      kind: "single_select",
      title: "選択してください",
      options: [],
    });
    render(<QuestionCard request={request} onAnswer={() => {}} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent("その他（自由入力）");
  });

  // T-08-2: 「その他（自由入力）」選択後に通常選択肢をクリックするとFreeTextInputが閉じる
  it("「その他」選択後に通常選択肢をクリックするとFreeTextInputが非表示になる", () => {
    const request = baseRequest({
      kind: "single_select",
      title: "選択してください",
      options: [{ id: "typescript", label: "TypeScript" }],
    });
    render(<QuestionCard request={request} onAnswer={() => {}} />);

    // まず「その他（自由入力）」を選択
    fireEvent.click(screen.getByText("その他（自由入力）"));
    expect(screen.getByRole("textbox")).toBeInTheDocument();

    // 次に通常選択肢をクリック（single_select は即送信で消えるので、FreeTextInput も消える）
    fireEvent.click(screen.getByText("TypeScript"));
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  // T-08-3: prompt が空のとき補足説明が表示されない
  it("prompt が空のとき補足説明エリアが表示されない", () => {
    const request = baseRequest({
      title: "選択してください",
      prompt: "",
      options: [{ id: "a", label: "選択肢A" }],
    });
    const { container } = render(
      <QuestionCard request={request} onAnswer={() => {}} />,
    );
    // prompt 表示用の p.text-gray-500 が存在しないことを確認
    const promptEl = container.querySelector("p.text-gray-500");
    expect(promptEl).toBeNull();
  });

  // secret タイプのテスト
  it("kind=secret で FreeTextInput が isSecret=true で表示される", () => {
    const request = baseRequest({
      kind: "secret",
      title: "APIキーを入力してください",
      prompt: "秘密情報を入力します",
      options: [],
    });
    render(<QuestionCard request={request} onAnswer={() => {}} />);
    const input = document.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
  });
});

describe("QuestionCard 多言語対応", () => {
  // T-09-1: 日本語と英語が混在する選択肢を正しく表示する
  it("日本語・英語混在の選択肢が正しく表示される", () => {
    const request = baseRequest({
      title: "Choose / 選択してください",
      options: [
        { id: "typescript", label: "TypeScript（タイプスクリプト）" },
        { id: "javascript", label: "JavaScript (JS)" },
      ],
    });
    render(<QuestionCard request={request} onAnswer={() => {}} />);
    expect(
      screen.getByText("TypeScript（タイプスクリプト）"),
    ).toBeInTheDocument();
    expect(screen.getByText("JavaScript (JS)")).toBeInTheDocument();
  });

  // T-09-2: 絵文字を含む選択肢でも表示・クリックが正常動作する
  it("絵文字を含む選択肢でも onAnswer が正しく呼ばれる", () => {
    const onAnswer = vi.fn();
    const request = baseRequest({
      title: "アイコンを選んでください",
      options: [
        { id: "fast", label: "🚀 高速" },
        { id: "safe", label: "🔒 安全" },
      ],
    });
    render(<QuestionCard request={request} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText("🚀 高速"));
    expect(onAnswer).toHaveBeenCalledWith({
      kind: "single_select",
      selectedOptionId: "fast",
    });
  });
});

describe("QuestionCard 回答送信", () => {
  // multi_select: 選択してから送信ボタン押下
  it("multi_select で選択後に送信ボタンで selectedOptionIds が送信される", () => {
    const onAnswer = vi.fn();
    const request = baseRequest({
      kind: "multi_select",
      title: "機能を選んでください",
      options: [
        { id: "auth", label: "認証" },
        { id: "db", label: "DB連携" },
      ],
    });
    render(<QuestionCard request={request} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText("認証"));
    fireEvent.click(screen.getByText("DB連携"));
    fireEvent.click(screen.getByText("送信"));
    expect(onAnswer).toHaveBeenCalledWith({
      kind: "multi_select",
      selectedOptionIds: ["auth", "db"],
      selectedValues: ["auth", "db"],
    });
  });

  // multi_select: 「その他」を選択すると通常選択がクリアされFreeTextInputが展開
  it("multi_select で「その他」を選択するとFreeTextInputが展開される", () => {
    const request = baseRequest({
      kind: "multi_select",
      title: "機能を選んでください",
      options: [{ id: "auth", label: "認証" }],
    });
    render(<QuestionCard request={request} onAnswer={() => {}} />);
    fireEvent.click(screen.getByText("認証"));
    fireEvent.click(screen.getByText("その他（自由入力）"));
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  // multi_select: 「その他」から自由入力を送信
  it("multi_select で「その他」から自由入力を送信すると selectedValues が送信される", () => {
    const onAnswer = vi.fn();
    const request = baseRequest({
      kind: "multi_select",
      title: "機能を選んでください",
      options: [{ id: "auth", label: "認証" }],
    });
    render(<QuestionCard request={request} onAnswer={onAnswer} />);

    fireEvent.click(screen.getByText("その他（自由入力）"));
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "カスタム機能" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    expect(onAnswer).toHaveBeenCalledWith({
      kind: "multi_select",
      selectedValues: ["カスタム機能"],
    });
  });

  // free_text タイプでテキスト送信
  it("free_text タイプで Enter キーにより textValue が送信される", () => {
    const onAnswer = vi.fn();
    const request = baseRequest({
      kind: "free_text",
      title: "名前を入力してください",
      options: [],
    });
    render(<QuestionCard request={request} onAnswer={onAnswer} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "テスト名" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    expect(onAnswer).toHaveBeenCalledWith({
      kind: "free_text",
      textValue: "テスト名",
    });
  });

  // secret タイプでテキスト送信
  it("secret タイプで Enter キーにより secretValue が送信される", () => {
    const onAnswer = vi.fn();
    const request = baseRequest({
      kind: "secret",
      title: "APIキーを入力",
      options: [],
    });
    render(<QuestionCard request={request} onAnswer={onAnswer} />);
    const input = document.querySelector(
      'input[type="password"]',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "my-secret" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: false });
    expect(onAnswer).toHaveBeenCalledWith({
      kind: "secret",
      secretValue: "my-secret",
    });
  });

  // confirm で「いいえ」をクリック
  it("confirm タイプで「いいえ」クリック時に confirmed=false が送信される", () => {
    const onAnswer = vi.fn();
    const request = baseRequest({
      kind: "confirm",
      title: "続けますか？",
      options: [],
    });
    render(<QuestionCard request={request} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText("いいえ"));
    expect(onAnswer).toHaveBeenCalledWith({
      kind: "confirm",
      confirmed: false,
    });
  });

  // multi_select の「その他」からFreeText送信
  it("multi_select で「その他」選択後にFreeText入力で selectedValues が送信される", () => {
    const onAnswer = vi.fn();
    const request = baseRequest({
      kind: "multi_select",
      title: "選んでください",
      options: [{ id: "a", label: "選択肢A" }],
    });
    render(<QuestionCard request={request} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText("その他（自由入力）"));
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "カスタム入力" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    expect(onAnswer).toHaveBeenCalledWith({
      kind: "multi_select",
      selectedValues: ["カスタム入力"],
    });
  });

  // multi_select: トグル動作（選択→解除）
  it("multi_select で同じ選択肢を2回クリックすると選択が解除される", () => {
    const onAnswer = vi.fn();
    const request = baseRequest({
      kind: "multi_select",
      title: "機能を選んでください",
      options: [
        { id: "auth", label: "認証" },
        { id: "db", label: "DB連携" },
      ],
    });
    render(<QuestionCard request={request} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText("認証"));
    fireEvent.click(screen.getByText("認証")); // 解除
    fireEvent.click(screen.getByText("DB連携"));
    fireEvent.click(screen.getByText("送信"));
    expect(onAnswer).toHaveBeenCalledWith({
      kind: "multi_select",
      selectedOptionIds: ["db"],
      selectedValues: ["db"],
    });
  });
});

describe("QuestionCard XSS対策", () => {
  // T-10-1: 選択肢ラベルにHTMLタグが含まれてもエスケープされる
  it("選択肢ラベルにHTMLタグが含まれてもエスケープされて表示される", () => {
    const request = baseRequest({
      title: "選択してください",
      options: [
        { id: "xss", label: '<script>alert("xss")</script>' },
        { id: "safe", label: "正常な選択肢" },
      ],
    });
    render(<QuestionCard request={request} onAnswer={() => {}} />);
    expect(
      screen.queryByText('<script>alert("xss")</script>'),
    ).toBeInTheDocument();
    expect(document.querySelector("script[src]")).toBeNull();
  });

  // T-10-2: 質問テキストにHTMLタグが含まれてもエスケープされる
  it("questionテキストにHTMLタグが含まれてもエスケープされる", () => {
    const request = baseRequest({
      title: '<img src="x" onerror="alert(1)">質問テキスト',
      prompt: "",
      kind: "free_text",
      options: [],
    });
    render(<QuestionCard request={request} onAnswer={() => {}} />);
    expect(document.querySelector("img")).toBeNull();
  });
});
