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

## 実行手順

1. `ChoiceButton` と `QuestionCard` の境界条件を洗い出し、既存テストに追記する。
2. `SkillCreatorUserInputRequest` を使った多言語・XSS・空配列ケースを追加する。
3. `SkillCreatorConversationPanel` の IPC 受信と再描画の結合テストを追加する。
4. 追加後に `vitest` を再実行し、Phase 7 の coverage へ接続する。

## 統合テスト連携

- Phase 5 の実装を前提に、`SkillCreatorUserInputRequest` / `InterviewUserAnswer` / `UserInputQuestion` / `UserInputAnswer` の mapping 契約が崩れていないことを確認する。
- Phase 7 のカバレッジ補完に直接つながるケースだけを追加し、重複テストを避ける。
- Phase 9 での型チェック・ESLint・アクセシビリティ確認に向けて、失敗しやすい入力を先に潰しておく。

## 多角的チェック観点（AIが判断）

- 論理分析系: ケース名とアサーションの対応
- 構造分解系: エッジケース、国際化、セキュリティ、結合の分離
- システム系: `QuestionCard` と `SkillCreatorConversationPanel` の IPC 伝播
- 問題解決系: XSS や空入力などの失敗条件の先取り

## サブタスク管理

- `ChoiceButton` の境界値は独立に追加できるため並列で扱う。
- `QuestionCard` の空配列・多言語・XSS ケースは同一ファイル内でまとめて拡張する。
- `SkillCreatorConversationPanel` の IPC 結合テストはモックの競合を避けるため最後にまとめる。

## タスク100%実行確認【必須】

- [ ] T-07 から T-11 までの拡充観点を追加した
- [ ] `SkillCreatorUserInputRequest` / `request.kind` / `request.options` を current model に揃えた
- [ ] `SkillCreatorConversationPanel` の IPC 受信テストが current model に揃っている
- [ ] Phase 7 の coverage 補完に移行できる状態になった

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
  // T-08-1: options が空の場合でも「その他（自由入力）」だけが表示される
  it("options が空配列のとき「その他（自由入力）」のみが表示される", () => {
    const request: SkillCreatorUserInputRequest = {
      requestId: "request-empty",
      reason: "plan_review",
      title: "選択してください",
      prompt: "必要に応じて自由入力してください",
      kind: "single_select",
      options: [],
      requestedAt: "2026-04-02T00:00:00Z",
    };
    render(<QuestionCard request={request} onAnswer={() => {}} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent("その他（自由入力）");
  });

  // T-08-2: 「その他（自由入力）」選択後に通常選択肢をクリックするとFreeTextInputが閉じる
  it("「その他」選択後に通常選択肢をクリックするとFreeTextInputが非表示になる", () => {
    const request: SkillCreatorUserInputRequest = {
      requestId: "request-toggle",
      reason: "plan_review",
      title: "選択してください",
      prompt: "選択後に切り替えを確認します",
      kind: "single_select",
      options: [{ id: "typescript", label: "TypeScript" }],
      requestedAt: "2026-04-02T00:00:00Z",
    };
    render(<QuestionCard request={request} onAnswer={() => {}} />);

    // まず「その他（自由入力）」を選択
    fireEvent.click(screen.getByText("その他（自由入力）"));
    expect(screen.getByRole("textbox")).toBeInTheDocument();

    // 次に通常選択肢をクリック
    fireEvent.click(screen.getByText("TypeScript"));
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  // T-08-3: context が未定義のとき補足説明が表示されない
  it("context が未定義のとき補足説明エリアが表示されない", () => {
    const request: SkillCreatorUserInputRequest = {
      requestId: "request-prompt",
      reason: "plan_review",
      title: "選択してください",
      prompt: "",
      kind: "single_select",
      options: [{ id: "a", label: "選択肢A" }],
      requestedAt: "2026-04-02T00:00:00Z",
    };
    render(<QuestionCard request={request} onAnswer={() => {}} />);
    // prompt が空なので質問テキスト以外の補足説明は表示されない
    expect(screen.queryByText(/補足/)).not.toBeInTheDocument();
  });

  // T-08-4: 新しい質問に切り替わると、前の free text 状態が残らない
  it("question が切り替わったときに FreeTextInput の状態が再初期化される", () => {
    const { rerender } = render(
      <QuestionCard
        request={{
          requestId: "request-first",
          reason: "plan_review",
          title: "最初の質問",
          prompt: "最初の選択肢を選んでください",
          kind: "single_select",
          options: [{ id: "typescript", label: "TypeScript" }],
          requestedAt: "2026-04-02T00:00:00Z",
        }}
        onAnswer={() => {}}
      />,
    );

    fireEvent.click(screen.getByText("その他（自由入力）"));
    expect(screen.getByRole("textbox")).toBeInTheDocument();

    rerender(
      <QuestionCard
        request={{
          requestId: "request-second",
          reason: "plan_review",
          title: "次の質問",
          prompt: "次の選択肢を選んでください",
          kind: "single_select",
          options: [{ id: "javascript", label: "JavaScript" }],
          requestedAt: "2026-04-02T00:00:00Z",
        }}
        onAnswer={() => {}}
      />,
    );

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
```

### Task 6-3: 日本語・英語混在のエッジケース（T-09）

**テストファイル**: `__tests__/QuestionCard.test.tsx`（既存ファイルに追記）

```typescript
describe("QuestionCard 多言語対応", () => {
  // T-09-1: 日本語と英語が混在する選択肢を正しく表示する
  it("日本語・英語混在の選択肢が正しく表示される", () => {
    const request: SkillCreatorUserInputRequest = {
      requestId: "request-multi-lang",
      reason: "plan_review",
      title: "Choose / 選択してください",
      prompt: "日本語と英語が混在するケースを確認します",
      kind: "single_select",
      options: [
        { id: "typescript", label: "TypeScript（タイプスクリプト）" },
        { id: "javascript", label: "JavaScript (JS)" },
        { id: "other", label: "その他" },
      ],
      requestedAt: "2026-04-02T00:00:00Z",
    };
    render(<QuestionCard request={request} onAnswer={() => {}} />);
    expect(
      screen.getByText("TypeScript（タイプスクリプト）"),
    ).toBeInTheDocument();
    expect(screen.getByText("JavaScript (JS)")).toBeInTheDocument();
    expect(screen.getByText("その他")).toBeInTheDocument();
  });

  // T-09-2: 絵文字を含む選択肢でも表示・クリックが正常動作する
  it("絵文字を含む選択肢でも onAnswer が正しく呼ばれる", () => {
    const onAnswer = vi.fn();
    const request: SkillCreatorUserInputRequest = {
      requestId: "request-emoji",
      reason: "plan_review",
      title: "アイコンを選んでください",
      prompt: "絵文字入りのラベルでも動作することを確認します",
      kind: "single_select",
      options: [
        { id: "fast", label: "🚀 高速" },
        { id: "safe", label: "🔒 安全" },
      ],
      requestedAt: "2026-04-02T00:00:00Z",
    };
    render(<QuestionCard request={request} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText("🚀 高速"));
    expect(onAnswer).toHaveBeenCalledWith({
      kind: "single_select",
      selectedOptionId: "fast",
    });
  });
});
```

### Task 6-4: XSS 対策テスト（T-10）

**テストファイル**: `__tests__/QuestionCard.test.tsx`（既存ファイルに追記）

```typescript
describe("QuestionCard XSS対策", () => {
  // T-10-1: 選択肢ラベルにHTMLタグが含まれてもエスケープされる
  it("選択肢ラベルにHTMLタグが含まれてもエスケープされて表示される", () => {
    const request: SkillCreatorUserInputRequest = {
      requestId: "request-xss",
      reason: "plan_review",
      title: "選択してください",
      prompt: "XSS が文字列として扱われることを確認します",
      kind: "single_select",
      options: [
        { id: "xss", label: '<script>alert("xss")</script>' },
        { id: "safe", label: "正常な選択肢" },
      ],
      requestedAt: "2026-04-02T00:00:00Z",
    };
    render(<QuestionCard request={request} onAnswer={() => {}} />);
    // script タグが実行されず、テキストとして表示される
    expect(
      screen.queryByText('<script>alert("xss")</script>'),
    ).toBeInTheDocument();
    // DOM に script 要素が挿入されていないことを確認
    expect(document.querySelector("script[src]")).toBeNull();
  });

  // T-10-2: 質問テキストにHTMLタグが含まれてもエスケープされる
  it("questionテキストにHTMLタグが含まれてもエスケープされる", () => {
    const request: SkillCreatorUserInputRequest = {
      requestId: "request-xss-title",
      reason: "plan_review",
      title: '<img src="x" onerror="alert(1)">質問テキスト',
      prompt: "",
      kind: "free_text",
      options: [],
      requestedAt: "2026-04-02T00:00:00Z",
    };
    render(<QuestionCard request={request} onAnswer={() => {}} />);
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
    let ipcCallback: (payload: SkillCreatorUserInputRequest) => void;
    mockOn.mockImplementation(
      (_channel: string, cb: (payload: SkillCreatorUserInputRequest) => void) => {
        ipcCallback = cb;
        return () => {};
      },
    );

    render(<SkillCreatorConversationPanel />);

    const payload: SkillCreatorUserInputRequest = {
      requestId: "request-1",
      reason: "plan_review",
      title: "使用言語を選択してください",
      prompt: "候補から1つ選んでください",
      kind: "single_select",
      options: [
        { id: "typescript", label: "TypeScript" },
        { id: "javascript", label: "JavaScript" },
      ],
      requestedAt: "2026-04-02T00:00:00Z",
    };

    await act(async () => {
      ipcCallback!(payload);
    });

    expect(screen.getByText("使用言語を選択してください")).toBeInTheDocument();
  });

  // T-11-2: 複数回 IPC 受信で questionIndex が更新される
  it("question-received を2回受信すると questionIndex が 2 になる", async () => {
    let ipcCallback: (payload: SkillCreatorUserInputRequest) => void;
    mockOn.mockImplementation(
      (_channel: string, cb: (payload: SkillCreatorUserInputRequest) => void) => {
        ipcCallback = cb;
        return () => {};
      },
    );

    render(<SkillCreatorConversationPanel />);

    const payload1: SkillCreatorUserInputRequest = {
      requestId: "request-1",
      reason: "plan_review",
      title: "質問1",
      prompt: "",
      kind: "free_text",
      options: [],
      requestedAt: "2026-04-02T00:00:00Z",
    };
    const payload2: SkillCreatorUserInputRequest = {
      requestId: "request-2",
      reason: "plan_review",
      title: "質問2",
      prompt: "",
      kind: "free_text",
      options: [],
      requestedAt: "2026-04-02T00:00:00Z",
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
