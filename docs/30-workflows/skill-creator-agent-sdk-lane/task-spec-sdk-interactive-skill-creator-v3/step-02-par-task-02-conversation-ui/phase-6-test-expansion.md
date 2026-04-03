# Phase 6: テスト拡充 — Conversation UI（質問受信・回答送信UIコンポーネント）

## メタ情報

| 項目      | 値              |
| --------- | --------------- |
| Phase番号 | 6               |
| 機能名    | conversation-ui |
| タスクID  | TASK-SDK-SC-02  |
| 作成日    | 2026-04-02      |
| 依存Phase | Phase 5（実装） |

## 目的

Phase 4 で作成した基本テストに加え、エッジケース・結合シナリオ・セキュリティ観点のテストを追加する。

## 実行タスク

### Task 6-1: 長い選択肢テキストのエッジケース（T-07）

**テストファイル**: `__tests__/ChoiceButton.test.tsx`（既存ファイルに追記）

```typescript
describe("ChoiceButton エッジケース", () => {
  // T-07-1: 長いラベルテキストでも表示が崩れない
  it("100文字を超える長いラベルテキストでも表示される", () => {
    const longLabel = "あ".repeat(120);
    render(
      <ChoiceButton label={longLabel} isSelected={false} onClick={() => {}} />,
    );
    expect(screen.getByRole("button", { name: longLabel })).toBeInTheDocument();
  });

  // T-07-2: 空のラベルテキストでもクラッシュしない
  it("空のラベルテキストでもクラッシュせずに表示される", () => {
    render(<ChoiceButton label="" isSelected={false} onClick={() => {}} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
```

### Task 6-2: 空の選択肢リストのエッジケース（T-08）

**テストファイル**: `__tests__/QuestionCard.test.tsx`（既存ファイルに追記）

```typescript
describe("QuestionCard エッジケース", () => {
  // T-08-1: choices が空の場合でも「その他（自由入力）」だけが表示される
  it("choices が空配列のとき「その他（自由入力）」のみが表示される", () => {
    const question: QuestionPayload = {
      type: "single_select",
      question: "選択してください",
      choices: [],
    };
    render(<QuestionCard question={question} onAnswer={() => {}} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent("その他（自由入力）");
  });

  // T-08-2: 「その他（自由入力）」選択後に通常選択肢をクリックするとFreeTextInputが閉じる
  it("「その他」選択後に通常選択肢をクリックするとFreeTextInputが非表示になる", () => {
    const question: QuestionPayload = {
      type: "single_select",
      question: "選択してください",
      choices: ["TypeScript"],
    };
    render(<QuestionCard question={question} onAnswer={() => {}} />);

    // まず「その他（自由入力）」を選択
    fireEvent.click(screen.getByText("その他（自由入力）"));
    expect(screen.getByRole("textbox")).toBeInTheDocument();

    // 次に通常選択肢をクリック
    fireEvent.click(screen.getByText("TypeScript"));
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  // T-08-3: context が未定義のとき補足説明が表示されない
  it("context が未定義のとき補足説明エリアが表示されない", () => {
    const question: QuestionPayload = {
      type: "single_select",
      question: "選択してください",
      choices: ["選択肢A"],
    };
    render(<QuestionCard question={question} onAnswer={() => {}} />);
    // context が存在しないため、質問テキスト以外の説明文がない
    expect(screen.queryByText(/補足/)).not.toBeInTheDocument();
  });
});
```

### Task 6-3: 日本語・英語混在のエッジケース（T-09）

**テストファイル**: `__tests__/QuestionCard.test.tsx`（既存ファイルに追記）

```typescript
describe("QuestionCard 多言語対応", () => {
  // T-09-1: 日本語と英語が混在する選択肢を正しく表示する
  it("日本語・英語混在の選択肢が正しく表示される", () => {
    const question: QuestionPayload = {
      type: "single_select",
      question: "Choose / 選択してください",
      choices: ["TypeScript（タイプスクリプト）", "JavaScript (JS)", "その他"],
    };
    render(<QuestionCard question={question} onAnswer={() => {}} />);
    expect(
      screen.getByText("TypeScript（タイプスクリプト）"),
    ).toBeInTheDocument();
    expect(screen.getByText("JavaScript (JS)")).toBeInTheDocument();
    expect(screen.getByText("その他")).toBeInTheDocument();
  });

  // T-09-2: 絵文字を含む選択肢でも表示・クリックが正常動作する
  it("絵文字を含む選択肢でも onAnswer が正しく呼ばれる", () => {
    const onAnswer = vi.fn();
    const question: QuestionPayload = {
      type: "single_select",
      question: "アイコンを選んでください",
      choices: ["🚀 高速", "🔒 安全"],
    };
    render(<QuestionCard question={question} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText("🚀 高速"));
    expect(onAnswer).toHaveBeenCalledWith("🚀 高速");
  });
});
```

### Task 6-4: XSS 対策テスト（T-10）

**テストファイル**: `__tests__/QuestionCard.test.tsx`（既存ファイルに追記）

```typescript
describe("QuestionCard XSS対策", () => {
  // T-10-1: 選択肢ラベルにHTMLタグが含まれてもエスケープされる
  it("選択肢ラベルにHTMLタグが含まれてもエスケープされて表示される", () => {
    const question: QuestionPayload = {
      type: "single_select",
      question: "選択してください",
      choices: ['<script>alert("xss")</script>', "正常な選択肢"],
    };
    render(<QuestionCard question={question} onAnswer={() => {}} />);
    // script タグが実行されず、テキストとして表示される
    expect(
      screen.queryByText('<script>alert("xss")</script>'),
    ).toBeInTheDocument();
    // DOM に script 要素が挿入されていないことを確認
    expect(document.querySelector("script[src]")).toBeNull();
  });

  // T-10-2: 質問テキストにHTMLタグが含まれてもエスケープされる
  it("questionテキストにHTMLタグが含まれてもエスケープされる", () => {
    const question: QuestionPayload = {
      type: "free_text",
      question: '<img src="x" onerror="alert(1)">質問テキスト',
      choices: [],
    };
    render(<QuestionCard question={question} onAnswer={() => {}} />);
    expect(document.querySelector("img")).toBeNull();
  });
});
```

### Task 6-5: SkillCreatorConversationPanel 結合テスト（T-11）

**テストファイル**: `__tests__/SkillCreatorConversationPanel.test.tsx`（既存ファイルに追記）

```typescript
describe("SkillCreatorConversationPanel 結合テスト", () => {
  // T-11-1: IPC 受信で QuestionCard が更新される
  it("question-received 受信で QuestionCard が表示される", async () => {
    let ipcCallback: (payload: QuestionPayload) => void;
    mockOn.mockImplementation(
      (_channel: string, cb: (payload: QuestionPayload) => void) => {
        ipcCallback = cb;
        return () => {};
      },
    );

    render(<SkillCreatorConversationPanel />);

    const payload: QuestionPayload = {
      type: "single_select",
      question: "使用言語を選択してください",
      choices: ["TypeScript", "JavaScript"],
    };

    await act(async () => {
      ipcCallback!(payload);
    });

    expect(
      screen.getByText("使用言語を選択してください"),
    ).toBeInTheDocument();
  });

  // T-11-2: 複数回 IPC 受信で questionIndex が更新される
  it("question-received を2回受信すると questionIndex が 2 になる", async () => {
    let ipcCallback: (payload: QuestionPayload) => void;
    mockOn.mockImplementation(
      (_channel: string, cb: (payload: QuestionPayload) => void) => {
        ipcCallback = cb;
        return () => {};
      },
    );

    render(<SkillCreatorConversationPanel />);

    const payload1: QuestionPayload = {
      type: "free_text",
      question: "質問1",
      choices: [],
    };
    const payload2: QuestionPayload = {
      type: "free_text",
      question: "質問2",
      choices: [],
    };

    await act(async () => {
      ipcCallback!(payload1);
    });
    await act(async () => {
      ipcCallback!(payload2);
    });

    expect(screen.getByText(/質問\s*2\s*\/\s*10/)).toBeInTheDocument();
  });
});
```

### Task 6-6: テスト実行

```bash
pnpm --filter @repo/desktop vitest run \
  src/renderer/components/skill-creator/__tests__/
```

期待する結果: T-01 から T-11 の全テストが PASS

## 参照資料

| 資料名         | パス                        |
| -------------- | --------------------------- |
| Phase 4 テスト | `phase-4-test-creation.md`  |
| Phase 5 実装   | `phase-5-implementation.md` |

## 成果物

| 成果物                                   | パス                                                                                                  | 形式       |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------- |
| ChoiceButton テスト（エッジケース追記）  | `apps/desktop/src/renderer/components/skill-creator/__tests__/ChoiceButton.test.tsx`                  | TypeScript |
| QuestionCard テスト（エッジケース追記）  | `apps/desktop/src/renderer/components/skill-creator/__tests__/QuestionCard.test.tsx`                  | TypeScript |
| SkillCreatorConversationPanel テスト追記 | `apps/desktop/src/renderer/components/skill-creator/__tests__/SkillCreatorConversationPanel.test.tsx` | TypeScript |

## 完了条件

- [ ] T-07: 長い選択肢テキスト・空ラベルのエッジケーステストを追加した
- [ ] T-08: 空の選択肢リスト・「その他」選択後の通常選択切替テストを追加した
- [ ] T-09: 日本語・英語混在、絵文字含む選択肢のテストを追加した
- [ ] T-10: XSS対策（HTMLタグのエスケープ確認）テストを追加した
- [ ] T-11: IPC 受信による QuestionCard 更新の結合テストを追加した
- [ ] T-01 から T-11 の全テストが PASS した

## 次の Phase: Phase 7 (phase-7-coverage.md)
