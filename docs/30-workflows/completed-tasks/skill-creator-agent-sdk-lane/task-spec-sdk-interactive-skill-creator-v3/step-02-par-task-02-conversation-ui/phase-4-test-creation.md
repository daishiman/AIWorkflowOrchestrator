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
import type { QuestionPayload } from "@repo/shared/src/types/skillCreator";

describe("QuestionCard", () => {
  // T-01-1: 質問テキストとコンテキストが表示される
  it("payload.question と payload.context が表示される", () => {
    const question: QuestionPayload = {
      type: "single_select",
      question: "使用言語を選択してください",
      context: "スキルの実装言語を指定します",
      choices: ["TypeScript", "JavaScript"],
    };
    render(<QuestionCard question={question} onAnswer={() => {}} />);
    expect(screen.getByText("使用言語を選択してください")).toBeInTheDocument();
    expect(screen.getByText("スキルの実装言語を指定します")).toBeInTheDocument();
  });

  // T-01-2: single_select で選択肢が表示される
  it("single_select タイプで選択肢ボタンが表示される", () => {
    const question: QuestionPayload = {
      type: "single_select",
      question: "フレームワークを選択してください",
      choices: ["React", "Vue", "Angular"],
    };
    render(<QuestionCard question={question} onAnswer={() => {}} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Vue")).toBeInTheDocument();
    expect(screen.getByText("Angular")).toBeInTheDocument();
  });

  // T-02: single_select で「その他（自由入力）」が最後の選択肢として常に表示される
  it("single_select で「その他（自由入力）」が選択肢の最後に常に表示される", () => {
    const question: QuestionPayload = {
      type: "single_select",
      question: "言語を選んでください",
      choices: ["TypeScript", "JavaScript"],
    };
    render(<QuestionCard question={question} onAnswer={() => {}} />);
    const buttons = screen.getAllByRole("button");
    const lastButton = buttons[buttons.length - 1];
    expect(lastButton).toHaveTextContent("その他（自由入力）");
  });

  // T-02b: multi_select でも「その他（自由入力）」が最後の選択肢として常に表示される
  it("multi_select で「その他（自由入力）」が選択肢の最後に常に表示される", () => {
    const question: QuestionPayload = {
      type: "multi_select",
      question: "機能を選んでください",
      choices: ["認証", "DB連携", "API"],
    };
    render(<QuestionCard question={question} onAnswer={() => {}} />);
    const buttons = screen.getAllByRole("button");
    // 送信ボタンを除いた選択肢ボタンの最後が「その他（自由入力）」
    const choiceButtons = buttons.filter(
      (btn) => !btn.textContent?.includes("送信"),
    );
    const lastChoiceButton = choiceButtons[choiceButtons.length - 1];
    expect(lastChoiceButton).toHaveTextContent("その他（自由入力）");
  });

  // T-03: ChoiceButton クリックで skill-creator:answer IPC が呼ばれる
  it("ChoiceButton クリックで onAnswer コールバックが呼ばれる", () => {
    const onAnswer = vi.fn();
    const question: QuestionPayload = {
      type: "single_select",
      question: "選んでください",
      choices: ["選択肢A"],
    };
    render(<QuestionCard question={question} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText("選択肢A"));
    expect(onAnswer).toHaveBeenCalledWith("選択肢A");
  });

  // T-05: confirm タイプで「はい」「いいえ」が表示される
  it("confirm タイプで「はい」「いいえ」ボタンが表示される", () => {
    const question: QuestionPayload = {
      type: "confirm",
      question: "続けますか？",
      choices: [],
    };
    render(<QuestionCard question={question} onAnswer={() => {}} />);
    expect(screen.getByText("はい")).toBeInTheDocument();
    expect(screen.getByText("いいえ")).toBeInTheDocument();
  });

  // T-05b: confirm タイプで「はい」クリック時に "yes" が送信される
  it("confirm タイプで「はい」クリック時に onAnswer('yes') が呼ばれる", () => {
    const onAnswer = vi.fn();
    const question: QuestionPayload = {
      type: "confirm",
      question: "続けますか？",
      choices: [],
    };
    render(<QuestionCard question={question} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText("はい"));
    expect(onAnswer).toHaveBeenCalledWith("yes");
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
import type { QuestionPayload } from "@repo/shared/src/types/skillCreator";

// window.api モック
const mockOn = vi.fn();
const mockInvoke = vi.fn();
vi.stubGlobal("window", {
  api: { on: mockOn, invoke: mockInvoke },
});

describe("SkillCreatorConversationPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOn.mockReturnValue(() => {}); // unsubscribe 関数を返す
  });

  // T-06: IPCリスナーが unmount 時にクリーンアップされる
  it("アンマウント時に IPC リスナーが解除される", () => {
    const unsubscribe = vi.fn();
    mockOn.mockReturnValue(unsubscribe);
    const { unmount } = render(<SkillCreatorConversationPanel />);
    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  // マウント時に skill-creator:question-received リスナーが登録される
  it("マウント時に skill-creator:question-received IPCリスナーが登録される", () => {
    render(<SkillCreatorConversationPanel />);
    expect(mockOn).toHaveBeenCalledWith(
      expect.stringContaining("question-received"),
      expect.any(Function),
    );
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
