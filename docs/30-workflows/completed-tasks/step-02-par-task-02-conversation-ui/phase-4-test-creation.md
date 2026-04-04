# Phase 4: テスト作成（TDD: Red）— Conversation UI（質問受信・回答送信UIコンポーネント）

## メタ情報

| 項目      | 値                      |
| --------- | ----------------------- |
| Phase番号 | 4                       |
| 機能名    | conversation-ui         |
| タスクID  | TASK-SDK-SC-02          |
| 作成日    | 2026-04-02              |
| 依存Phase | Phase 3（設計レビュー） |

## 目的

TDD の Red フェーズとして、実装前にテストを作成する。Phase 5 の実装でこれらのテストが全て通ること（Green）を目指す。

## 実行手順

1. 共有型 `SkillCreatorUserInputRequest` / `InterviewUserAnswer` / `SKILL_CREATOR_SESSION_CHANNELS` を前提に、各コンポーネントの期待挙動をテストケースに分解する。
2. `QuestionCard`、`ChoiceButton`、`FreeTextInput`、`ConversationProgress`、`SkillCreatorConversationPanel` の順で Red テストを記述する。
3. `pnpm --filter @repo/desktop vitest run` を実行し、意図した FAIL を確認してから Phase 5 に引き渡す。

## 統合テスト連携

- Phase 5 の実装完了後に同一テスト群を再実行し、Green 化を確認する。
- Phase 10 では、設計レビューで定義した 4 条件の裏取りとして本フェーズのテスト観点を再利用する。

## 多角的チェック観点（AIが判断）

- 論理分析系: 期待値と失敗条件の整合
- 構造分解系: コンポーネントごとのテスト粒度の分離
- システム系: `QuestionCard` から `SkillCreatorConversationPanel` までの依存経路
- 問題解決系: 失敗しやすい境界条件の先回り

## サブタスク管理

- `QuestionCard` と `ChoiceButton` と `FreeTextInput` は独立して並列作成する。
- `ConversationProgress` と `SkillCreatorConversationPanel` は共有型と IPC モックを再利用しながら分担する。
- 共通の `SkillCreatorUserInputRequest` ファクトリは `QuestionCard` 系テストに寄せて重複を避ける。

## タスク100%実行確認【必須】

- [ ] T-01 から T-06 までの各テスト観点を記述した
- [ ] 共有型名を `SkillCreatorUserInputRequest` / `InterviewUserAnswer` / `UserInputQuestion` / `UserInputAnswer` に揃えた
- [ ] Red フェーズとしてテスト実行の FAIL を確認した
- [ ] Phase 5 に引き渡せる最小構成になっていることを確認した

## テストファイル配置

```
apps/desktop/src/renderer/components/skill-creator/__tests__/
├── QuestionCard.test.tsx
├── ChoiceButton.test.tsx
├── FreeTextInput.test.tsx
├── ConversationProgress.test.tsx
└── SkillCreatorConversationPanel.test.tsx
```

## 実行タスク

### Task 4-1: QuestionCard テスト（T-01）

**テストファイル**: `__tests__/QuestionCard.test.tsx`

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { QuestionCard } from "../QuestionCard";
import type {
  InterviewUserAnswer,
  SkillCreatorUserInputRequest,
} from "@repo/shared/src/types/skillCreator";

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
    expect(screen.getByText("スキルの実装言語を指定します")).toBeInTheDocument();
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
    const onAnswer = vi.fn<void, [InterviewUserAnswer]>();
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

  // T-05b: confirm タイプで「はい」クリック時に "yes" が送信される
  it("confirm タイプで「はい」クリック時に confirmed=true が送信される", () => {
    const onAnswer = vi.fn<void, [InterviewUserAnswer]>();
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
```

**期待する結果（Red）**: 実装前は全テスト FAIL

### Task 4-2: ChoiceButton テスト（T-03-detail）

**テストファイル**: `__tests__/ChoiceButton.test.tsx`

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { ChoiceButton } from "../ChoiceButton";

describe("ChoiceButton", () => {
  // 選択済み状態のスタイル確認
  it("isSelected=true のとき選択済みスタイルが適用される", () => {
    render(
      <ChoiceButton label="選択肢A" isSelected={true} onClick={() => {}} />,
    );
    const btn = screen.getByRole("button", { name: "選択肢A" });
    expect(btn).toHaveClass("bg-blue-500");
  });

  // 未選択状態のスタイル確認
  it("isSelected=false のとき未選択スタイルが適用される", () => {
    render(
      <ChoiceButton label="選択肢A" isSelected={false} onClick={() => {}} />,
    );
    const btn = screen.getByRole("button", { name: "選択肢A" });
    expect(btn).not.toHaveClass("bg-blue-500");
  });

  // isFreeText=true のとき破線ボーダースタイル
  it("isFreeText=true のとき破線ボーダースタイルが適用される", () => {
    render(
      <ChoiceButton
        label="その他（自由入力）"
        isSelected={false}
        isFreeText={true}
        onClick={() => {}}
      />,
    );
    const btn = screen.getByRole("button", { name: "その他（自由入力）" });
    expect(btn).toHaveClass("border-dashed");
  });

  // クリック時に onClick が呼ばれる
  it("クリック時に onClick コールバックが呼ばれる", () => {
    const onClick = vi.fn();
    render(
      <ChoiceButton label="選択肢A" isSelected={false} onClick={onClick} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "選択肢A" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // disabled=true のとき onClick が呼ばれない
  it("disabled=true のとき onClick が呼ばれない", () => {
    const onClick = vi.fn();
    render(
      <ChoiceButton
        label="選択肢A"
        isSelected={false}
        onClick={onClick}
        disabled={true}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "選択肢A" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
```

**期待する結果（Red）**: 実装前は全テスト FAIL

### Task 4-3: FreeTextInput テスト（T-04）

**テストファイル**: `__tests__/FreeTextInput.test.tsx`

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { FreeTextInput } from "../FreeTextInput";

describe("FreeTextInput", () => {
  // T-04-1: isVisible=false のとき非表示
  it("isVisible=false のとき非表示になる", () => {
    render(<FreeTextInput onSubmit={() => {}} isVisible={false} />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  // T-04-2: isVisible=true のとき表示
  it("isVisible=true のとき表示される", () => {
    render(<FreeTextInput onSubmit={() => {}} isVisible={true} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  // T-04-3: Enter キーで onSubmit が呼ばれる
  it("Enter キーで onSubmit が呼ばれる", () => {
    const onSubmit = vi.fn();
    render(<FreeTextInput onSubmit={onSubmit} isVisible={true} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "テスト入力" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    expect(onSubmit).toHaveBeenCalledWith("テスト入力");
  });

  // T-04-4: Shift+Enter では onSubmit が呼ばれない
  it("Shift+Enter では onSubmit が呼ばれない（改行のみ）", () => {
    const onSubmit = vi.fn();
    render(<FreeTextInput onSubmit={onSubmit} isVisible={true} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "テスト入力" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // T-04-5: 空文字では onSubmit が呼ばれない
  it("空文字列のとき Enter を押しても onSubmit が呼ばれない", () => {
    const onSubmit = vi.fn();
    render(<FreeTextInput onSubmit={onSubmit} isVisible={true} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // T-04-6: isSecret=true のときパスワード入力フィールドになる
  it("isSecret=true のとき type='password' の入力フィールドが表示される", () => {
    render(<FreeTextInput onSubmit={() => {}} isVisible={true} isSecret={true} />);
    // パスワードフィールドは role="textbox" ではなく type="password" で確認
    const input = document.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
  });
});
```

**期待する結果（Red）**: 実装前は全テスト FAIL

### Task 4-4: ConversationProgress テスト

**テストファイル**: `__tests__/ConversationProgress.test.tsx`

```typescript
import { render, screen } from "@testing-library/react";
import { ConversationProgress } from "../ConversationProgress";

describe("ConversationProgress", () => {
  // 「質問 N / 推定合計」形式で表示される
  it("「質問 3 / 10」形式で表示される", () => {
    render(<ConversationProgress current={3} estimatedTotal={10} />);
    expect(screen.getByText(/質問\s*3\s*\/\s*10/)).toBeInTheDocument();
  });

  // current=1 のとき正しく表示される
  it("current=1 のとき「質問 1 / 10」が表示される", () => {
    render(<ConversationProgress current={1} estimatedTotal={10} />);
    expect(screen.getByText(/質問\s*1\s*\/\s*10/)).toBeInTheDocument();
  });

  // プログレスバーの幅が進捗率に応じて変化する
  it("current=5, estimatedTotal=10 のときバー幅が 50% になる", () => {
    render(<ConversationProgress current={5} estimatedTotal={10} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveStyle("width: 50%");
  });
});
```

**期待する結果（Red）**: 実装前は全テスト FAIL

### Task 4-5: IPCリスナー クリーンアップ テスト（T-06）

**テストファイル**: `__tests__/SkillCreatorConversationPanel.test.tsx`

```typescript
import { render, act } from "@testing-library/react";
import { SkillCreatorConversationPanel } from "../SkillCreatorConversationPanel";

// window.skillCreatorSessionAPI モック
const mockOnQuestion = vi.fn();
const mockOnComplete = vi.fn();
const mockOnError = vi.fn();
const mockSendAnswer = vi.fn();
vi.stubGlobal("window", {
  skillCreatorSessionAPI: {
    onQuestion: mockOnQuestion,
    onComplete: mockOnComplete,
    onError: mockOnError,
    sendAnswer: mockSendAnswer,
  },
});

describe("SkillCreatorConversationPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnQuestion.mockReturnValue(() => {}); // unsubscribe 関数を返す
    mockOnComplete.mockReturnValue(() => {});
    mockOnError.mockReturnValue(() => {});
  });

  // T-06: IPCリスナーが unmount 時にクリーンアップされる
  it("アンマウント時に IPC リスナーが解除される", () => {
    const unsubscribe = vi.fn();
    mockOnQuestion.mockReturnValue(unsubscribe);
    const { unmount } = render(<SkillCreatorConversationPanel />);
    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  // マウント時に skill-creator:question-received リスナーが登録される
  it("マウント時に skill-creator:question-received IPCリスナーが登録される", () => {
    render(<SkillCreatorConversationPanel />);
    expect(mockOnQuestion).toHaveBeenCalledWith(expect.any(Function));
  });
});
```

**期待する結果（Red）**: 実装前は全テスト FAIL

### Task 4-6: テスト実行（Red 確認）

```bash
pnpm --filter @repo/desktop vitest run \
  src/renderer/components/skill-creator/__tests__/
```

期待する結果: 全テスト FAIL（コンポーネントが未実装のため）

## 参照資料

| 資料名           | パス                       |
| ---------------- | -------------------------- |
| Phase 2 設計     | `phase-2-design.md`        |
| Phase 3 レビュー | `phase-3-design-review.md` |

## 成果物

| 成果物                               | パス                                                                                                  | 形式       |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- | ---------- |
| QuestionCard テスト                  | `apps/desktop/src/renderer/components/skill-creator/__tests__/QuestionCard.test.tsx`                  | TypeScript |
| ChoiceButton テスト                  | `apps/desktop/src/renderer/components/skill-creator/__tests__/ChoiceButton.test.tsx`                  | TypeScript |
| FreeTextInput テスト                 | `apps/desktop/src/renderer/components/skill-creator/__tests__/FreeTextInput.test.tsx`                 | TypeScript |
| ConversationProgress テスト          | `apps/desktop/src/renderer/components/skill-creator/__tests__/ConversationProgress.test.tsx`          | TypeScript |
| SkillCreatorConversationPanel テスト | `apps/desktop/src/renderer/components/skill-creator/__tests__/SkillCreatorConversationPanel.test.tsx` | TypeScript |

## 完了条件

- [ ] T-01: QuestionCard が質問テキストとコンテキストを表示するテストを作成した
- [ ] T-02: `single_select` / `multi_select` で「その他（自由入力）」が最後の選択肢として常に表示されるテストを作成した
- [ ] T-03: ChoiceButton クリックで `onAnswer` コールバックが呼ばれるテストを作成した
- [ ] T-04: FreeTextInput の送信で `onAnswer` コールバックが呼ばれるテストを作成した
- [ ] T-05: `confirm` タイプで「はい」「いいえ」ボタンが表示されるテストを作成した
- [ ] T-06: IPCリスナーが unmount 時にクリーンアップされるテストを作成した
- [ ] テスト実行が全件 FAIL であることを確認した（Red）

## 次の Phase: Phase 5 (phase-5-implementation.md)
