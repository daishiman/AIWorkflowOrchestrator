# Phase 4: テスト作成（TDD-Red）

## メタ情報

| 項目      | 内容                          |
| --------- | ----------------------------- |
| Phase     | 4                             |
| 名称      | テスト作成（TDD-Red）         |
| タスクID  | TASK-3-2-A                    |
| Issue番号 | #520                          |
| 前提Phase | Phase 3（設計レビューゲート） |
| 次Phase   | Phase 5（実装）               |

---

## 1. 目的

Phase 2の設計に基づき、R1〜R3の改善機能に対するテストを先に作成する（TDD Red Phase）。

---

## 2. タスク

### Task 4-1: R1 ローディングスピナーテスト作成

**テストファイル**: `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx`

**追加テストケース**:

| TC-ID   | テスト名                                            | 期待結果                 |
| ------- | --------------------------------------------------- | ------------------------ |
| TC-R1-1 | should display spinner when status is running       | スピナー要素が表示される |
| TC-R1-2 | should not display spinner when status is idle      | スピナー要素が非表示     |
| TC-R1-3 | should not display spinner when status is completed | スピナー要素が非表示     |
| TC-R1-4 | spinner should have animate-spin class              | animate-spinクラスが適用 |
| TC-R1-5 | spinner should have accessible aria-label           | aria-label="実行中"      |
| TC-R1-6 | spinner should have role="status"                   | role属性が設定されている |

**テストコード例**:

```typescript
describe("SkillStreamDisplay - Loading Spinner (R1)", () => {
  it("should display spinner when status is running", () => {
    mockUseSkillExecution.status = "running";
    render(<SkillStreamDisplay skillId="test-skill" />);

    const spinner = screen.getByRole("status", { name: /実行中/ });
    expect(spinner).toBeInTheDocument();
  });

  it("spinner should have animate-spin class", () => {
    mockUseSkillExecution.status = "running";
    render(<SkillStreamDisplay skillId="test-skill" />);

    const spinner = screen.getByRole("status", { name: /実行中/ });
    expect(spinner).toHaveClass("animate-spin");
  });
});
```

---

### Task 4-2: R2 タイムスタンプテスト作成

**テストファイル**:

- `apps/desktop/src/renderer/utils/__tests__/formatTime.test.ts`（新規）
- `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx`（追加）

**formatRelativeTime関数テスト**:

| TC-ID   | テスト名                                           | 入力        | 期待結果  |
| ------- | -------------------------------------------------- | ----------- | --------- |
| TC-R2-1 | should return seconds ago for less than 60 seconds | now - 30秒  | "30秒前"  |
| TC-R2-2 | should return minutes ago for less than 60 minutes | now - 5分   | "5分前"   |
| TC-R2-3 | should return hours ago for less than 24 hours     | now - 2時間 | "2時間前" |
| TC-R2-4 | should return days ago for 24 hours or more        | now - 3日   | "3日前"   |
| TC-R2-5 | should return "0秒前" for current timestamp        | now         | "0秒前"   |
| TC-R2-6 | should handle edge case at 60 seconds              | now - 60秒  | "1分前"   |

**コンポーネントテスト**:

| TC-ID   | テスト名                                            | 期待結果             |
| ------- | --------------------------------------------------- | -------------------- |
| TC-R2-7 | should display timestamp on each message            | タイムスタンプが表示 |
| TC-R2-8 | timestamp should have text-xs text-gray-400 classes | 適切なスタイルが適用 |

---

### Task 4-3: R3 クリップボードコピーテスト作成

**テストファイル**: `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx`

**追加テストケース**:

| TC-ID   | テスト名                                          | 期待結果                |
| ------- | ------------------------------------------------- | ----------------------- |
| TC-R3-1 | should display copy button on message hover       | ホバー時にボタン表示    |
| TC-R3-2 | should copy message content to clipboard on click | クリップボードにコピー  |
| TC-R3-3 | should show copy feedback after successful copy   | "コピーしました"表示    |
| TC-R3-4 | copy feedback should disappear after 2000ms       | 2秒後に非表示           |
| TC-R3-5 | copy button should have accessible aria-label     | aria-label設定確認      |
| TC-R3-6 | copy button should be keyboard accessible         | Enter/Spaceで動作       |
| TC-R3-7 | should handle clipboard API error gracefully      | エラー時にconsole.error |

**テストコード例**:

```typescript
describe("SkillStreamDisplay - Clipboard Copy (R3)", () => {
  const mockWriteText = vi.fn();

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: mockWriteText },
    });
  });

  it("should copy message content to clipboard on click", async () => {
    mockUseSkillExecution.messages = [
      { id: "msg-1", type: "text", content: "Test message", timestamp: Date.now() },
    ];
    mockWriteText.mockResolvedValue(undefined);

    render(<SkillStreamDisplay skillId="test-skill" />);

    const copyButton = screen.getByRole("button", { name: /コピー/ });
    await userEvent.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith("Test message");
  });
});
```

---

### Task 4-4: アクセシビリティテスト作成

**追加テストケース**:

| TC-ID  | テスト名                                              | 期待結果            |
| ------ | ----------------------------------------------------- | ------------------- |
| TC-A-1 | spinner should be announced by screen readers         | aria-live通知       |
| TC-A-2 | copy feedback should be announced to screen readers   | aria-live="polite"  |
| TC-A-3 | all interactive elements should be keyboard focusable | tabでフォーカス可能 |

---

## 3. 完了条件

| ID  | 条件                                          | 確認方法           |
| --- | --------------------------------------------- | ------------------ |
| 1   | 全テストケース（TC-R1〜TC-A）が作成されている | テストファイル確認 |
| 2   | テストが全てFAIL（Red Phase）                 | テスト実行         |
| 3   | テストコードがTypeScript型エラーなし          | tsc実行            |
| 4   | テストコードがESLintエラーなし                | lint実行           |

---

## 4. 成果物

| 成果物                       | パス                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| 追加テスト（コンポーネント） | apps/desktop/src/renderer/components/AgentView/**tests**/SkillStreamDisplay.test.tsx |
| 新規テスト（ユーティリティ） | apps/desktop/src/renderer/utils/**tests**/formatTime.test.ts                         |
| テスト設計書                 | outputs/phase-04/test-design.md                                                      |

---

## 5. テストコマンド

```bash
# テスト実行（FAIL確認）
pnpm --filter @repo/desktop test SkillStreamDisplay

# 特定テストのみ実行
pnpm --filter @repo/desktop test -- --testNamePattern="Loading Spinner"

# カバレッジ確認
pnpm --filter @repo/desktop test -- --coverage
```

---

## 6. システム観点チェック

### フロントエンド（Renderer）テスト観点

| 観点             | 確認事項                                       | テストツール          |
| ---------------- | ---------------------------------------------- | --------------------- |
| レンダリング     | コンポーネントが正しくレンダリングされる       | React Testing Library |
| イベント処理     | クリック/ホバー/キーボードイベントが正しく動作 | userEvent             |
| 状態管理         | 状態変更が正しくUIに反映される                 | screen.getByXxx       |
| アクセシビリティ | aria属性、role属性が正しく設定されている       | getByRole             |

---

## 7. 参考資料

| 資料                  | パス/URL                                                                             |
| --------------------- | ------------------------------------------------------------------------------------ |
| 既存テスト            | apps/desktop/src/renderer/components/AgentView/**tests**/SkillStreamDisplay.test.tsx |
| Vitest                | https://vitest.dev/                                                                  |
| React Testing Library | https://testing-library.com/docs/react-testing-library/intro/                        |
| テストカバレッジ基準  | .claude/skills/task-specification-creator/references/coverage-standards.md           |
