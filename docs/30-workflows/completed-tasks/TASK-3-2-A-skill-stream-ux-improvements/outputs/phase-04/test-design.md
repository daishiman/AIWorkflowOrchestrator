# テスト設計書

## メタ情報

| 項目       | 内容          |
| ---------- | ------------- |
| タスクID   | TASK-3-2-A    |
| Issue番号  | #520          |
| Phase      | 4             |
| 作成日     | 2026-01-27    |
| ステータス | TDD Red Phase |

---

## 1. 概要

R1〜R3の改善機能に対するテストケースを定義し、TDDアプローチでテストを先行作成した。

---

## 2. テストケース一覧

### 2.1 R1 ローディングスピナー (6 cases)

| TC-ID   | テスト名                                            | 期待結果                 |
| ------- | --------------------------------------------------- | ------------------------ |
| TC-R1-1 | should display spinner when status is running       | スピナー要素が表示される |
| TC-R1-2 | should not display spinner when status is idle      | スピナー要素が非表示     |
| TC-R1-3 | should not display spinner when status is completed | スピナー要素が非表示     |
| TC-R1-4 | spinner should have animate-spin class              | animate-spinクラスが適用 |
| TC-R1-5 | spinner should have accessible aria-label           | aria-label="実行中"      |
| TC-R1-6 | spinner container should have role=status           | role属性が設定されている |

### 2.2 R2 タイムスタンプ表示 (11 cases)

#### formatRelativeTime関数テスト (8 cases)

| TC-ID   | テスト名                                           | 入力        | 期待結果   |
| ------- | -------------------------------------------------- | ----------- | ---------- |
| TC-R2-1 | should return seconds ago for less than 60 seconds | now - 30秒  | "30秒前"   |
| TC-R2-2 | should return 0秒前 for current timestamp          | now         | "0秒前"    |
| TC-R2-3 | should return 59秒前 at boundary                   | now - 59秒  | "59秒前"   |
| TC-R2-4 | should return minutes ago for less than 60 minutes | now - 5分   | "5分前"    |
| TC-R2-5 | should return 1分前 at 60 seconds boundary         | now - 60秒  | "1分前"    |
| TC-R2-6 | should return hours ago for less than 24 hours     | now - 2時間 | "2時間前"  |
| TC-R2-7 | should return days ago for 24 hours or more        | now - 3日   | "3日前"    |
| TC-R2-8 | should handle future timestamp gracefully          | now + 1秒   | "たった今" |

#### コンポーネントテスト (3 cases)

| TC-ID    | テスト名                                          | 期待結果              |
| -------- | ------------------------------------------------- | --------------------- |
| TC-R2-9  | should display timestamp on each message          | タイムスタンプが表示  |
| TC-R2-10 | timestamp should have appropriate styling classes | text-xs text-gray-400 |
| TC-R2-11 | should display timestamps for multiple messages   | 複数メッセージに表示  |

### 2.3 R3 クリップボードコピー (7 cases)

| TC-ID   | テスト名                                          | 期待結果                |
| ------- | ------------------------------------------------- | ----------------------- |
| TC-R3-1 | should display copy button on message             | コピーボタンが表示      |
| TC-R3-2 | should copy message content to clipboard on click | クリップボードにコピー  |
| TC-R3-3 | should show copy feedback after successful copy   | "コピーしました"表示    |
| TC-R3-4 | copy feedback should disappear after 2000ms       | 2秒後に非表示           |
| TC-R3-5 | copy button should have accessible aria-label     | aria-label設定確認      |
| TC-R3-6 | copy button should be keyboard accessible         | Enter/Spaceで動作       |
| TC-R3-7 | should handle clipboard API error gracefully      | エラー時にconsole.error |

### 2.4 アクセシビリティ (3 cases)

| TC-ID  | テスト名                                              | 期待結果           |
| ------ | ----------------------------------------------------- | ------------------ |
| TC-A-1 | spinner should be announced by screen readers         | role="status"設定  |
| TC-A-2 | copy feedback should be announced to screen readers   | aria-live="polite" |
| TC-A-3 | all interactive elements should be keyboard focusable | tabIndex正常       |

---

## 3. テストファイル配置

| ファイル                                                                             | 内容                           | 行数        |
| ------------------------------------------------------------------------------------ | ------------------------------ | ----------- |
| apps/desktop/src/renderer/utils/**tests**/formatTime.test.ts                         | formatRelativeTime関数テスト   | 約80行      |
| apps/desktop/src/renderer/components/AgentView/**tests**/SkillStreamDisplay.test.tsx | R1〜R3コンポーネントテスト追加 | 約370行追加 |

---

## 4. モック構成

### 4.1 既存モック

```typescript
const mockUseSkillExecution = {
  messages: [] as SkillStreamMessage[],
  status: "idle" as "idle" | "running" | "completed" | "error" | "aborted",
  executionId: null as string | null,
  error: null as { code: string; message: string } | null,
  isAborting: false,
  execute: vi.fn(),
  abort: vi.fn(),
  reset: vi.fn(),
};
```

### 4.2 追加モック（R3用）

```typescript
// Clipboard API モック
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: { writeText: mockWriteText },
});
mockWriteText.mockResolvedValue(undefined);
```

---

## 5. テストID命名規則

| プレフィックス | 対象             |
| -------------- | ---------------- |
| TC-R1-X        | R1スピナー       |
| TC-R2-X        | R2タイムスタンプ |
| TC-R3-X        | R3コピー         |
| TC-A-X         | アクセシビリティ |

---

## 6. data-testid一覧

| data-testid                   | 対象要素           |
| ----------------------------- | ------------------ |
| loading-spinner               | スピナーSVG要素    |
| loading-spinner-container     | スピナーコンテナ   |
| message-timestamp-{messageId} | タイムスタンプ要素 |
| copy-button-{messageId}       | コピーボタン       |

---

## 7. 完了条件確認

| ID  | 条件                                          | 状況     |
| --- | --------------------------------------------- | -------- |
| 1   | 全テストケース（TC-R1〜TC-A）が作成されている | 完了     |
| 2   | テストが全てFAIL（Red Phase）                 | 予定通り |
| 3   | テストコードがTypeScript型エラーなし          | 確認済み |
| 4   | テストコードがESLintエラーなし                | 確認済み |

---

## 8. 次フェーズへの申し送り

- 全27テストケースがFAIL状態（TDD Red Phase完了）
- Phase 5で実装を行い、テストをPASSさせる
- 実装順序: R1 → R2 → R3
