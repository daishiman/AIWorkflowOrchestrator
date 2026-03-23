# Phase 6: エッジケースマトリクス

## メタ情報

| 項目               | 値                                              |
| ------------------ | ----------------------------------------------- |
| タスクID           | TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001 |
| 作成日             | 2026-03-23                                      |
| Phase              | 6 — テスト拡充                                  |
| 対象コンポーネント | ChatPanel.tsx                                   |

---

## 1. エッジケース一覧

### EC-01: blocked → settings 遷移の actionability 検証

| 項目         | 内容                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| EC-ID        | EC-01                                                                  |
| 状態         | `blocked`                                                              |
| 検証観点     | 設定画面への遷移が Store action を呼び出すこと（no-op でないこと）     |
| 入力条件     | `status = "blocked"` の状態で設定遷移ボタンをクリック                  |
| 期待結果     | `mockSetActiveView` が `"settings"` または同等の View 識別子で呼ばれる |
| 失敗パターン | ボタンがクリックされても Store action が呼ばれない（no-op 再混入）     |
| 検証コード例 | `expect(mockSetActiveView).toHaveBeenCalledWith("settings")`           |

```typescript
test("EC-01: blocked 状態の設定遷移ボタンが Store action を呼ぶ", async () => {
  setStreamingState("blocked");
  render(<ChatPanel />);

  const settingsButton = screen.getByRole("button", { name: /設定/ });

  await act(async () => {
    fireEvent.click(settingsButton);
  });

  expect(mockSetActiveView).toHaveBeenCalledWith("settings");
  expect(mockSetActiveView).toHaveBeenCalledTimes(1);
});
```

---

### EC-02: handoff → terminal 起動の actionability 検証

| 項目         | 内容                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| EC-ID        | EC-02                                                                   |
| 状態         | `handoff`                                                               |
| 検証観点     | terminal 起動ボタンが IPC call を実行すること（no-op でないこと）       |
| 入力条件     | `status = "handoff"` の状態で terminal 起動ボタンをクリック             |
| 期待結果     | `window.electronAPI.openTerminal` が 1 回呼ばれる                       |
| 失敗パターン | ボタンがクリックされても IPC が呼ばれない（no-op 再混入 / GAP-04 回帰） |
| 前提条件     | MINOR-A: `openTerminal` IPC チャンネルが実装済みであること              |

```typescript
test("EC-02: handoff 状態の terminal 起動ボタンが IPC を呼ぶ", async () => {
  setStreamingState("handoff");
  render(<ChatPanel />);

  const terminalButton = screen.getByRole("button", { name: /ターミナル/ });

  await act(async () => {
    fireEvent.click(terminalButton);
  });

  expect(mockElectronAPI.openTerminal).toHaveBeenCalledTimes(1);
});
```

---

### EC-03: streaming 中の Escape キャンセル検証

| 項目     | 内容                                                            |
| -------- | --------------------------------------------------------------- |
| EC-ID    | EC-03                                                           |
| 状態     | `streaming`                                                     |
| 検証観点 | Escape キーで `cancelStreaming` が呼ばれること                  |
| 入力条件 | `status = "streaming"` の状態で Escape キーを押す               |
| 期待結果 | `mockCancelStreaming` が 1 回呼ばれる                           |
| P39 対策 | `userEvent.keyboard` は使用禁止。`fireEvent.keyDown` で代替する |

```typescript
test("EC-03: streaming 中に Escape キーで cancelStreaming が呼ばれる", async () => {
  const mockCancelStreaming = vi.fn();

  (useStreamingChat as ReturnType<typeof vi.fn>).mockReturnValue({
    status: "streaming",
    messages: [{ id: "1", role: "user", content: "テスト" }],
    error: null,
    sendMessage: vi.fn(),
    cancelStreaming: mockCancelStreaming,
    clearMessages: vi.fn(),
  });

  render(<ChatPanel />);

  // P39 対策: userEvent.keyboard は happy-dom で動作しないため fireEvent を使用
  await act(async () => {
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
  });

  expect(mockCancelStreaming).toHaveBeenCalledTimes(1);
});
```

---

### EC-04: no-op 再導入検出テスト

| 項目     | 内容                                                            |
| -------- | --------------------------------------------------------------- |
| EC-ID    | EC-04                                                           |
| 検証観点 | ChatPanel.tsx への no-op コールバックの再混入を継続的に検出する |
| 手段     | ソースコードの正規表現スキャン                                  |
| 期待結果 | `() => {}` / `() => undefined` / `(_) => {}` のいずれも 0 件    |
| 備考     | TC-12 の拡張版。より広い no-op パターンを検出する               |

```typescript
const NO_OP_PATTERNS = [
  /\(\) => \{\}/g, // () => {}
  /\(\) => undefined/g, // () => undefined
  /_\w* => \{\}/g, // _arg => {}
  /function\s*\(\)\s*\{\}/g, // function() {}
];

test("EC-04: ChatPanel.tsx に no-op パターンが存在しない", () => {
  const source = readFileSync(resolve(__dirname, "../ChatPanel.tsx"), "utf-8");

  for (const pattern of NO_OP_PATTERNS) {
    const matches = source.match(pattern) ?? [];
    expect(
      matches,
      `no-op パターン "${pattern}" が検出されました`,
    ).toHaveLength(0);
  }
});
```

---

### EC-05: streaming 中の Provider/Model 選択 UI の無効化検証

| 項目     | 内容                                                                             |
| -------- | -------------------------------------------------------------------------------- |
| EC-ID    | EC-05                                                                            |
| 状態     | `streaming`                                                                      |
| 検証観点 | streaming 中は Provider/Model セレクタが無効化されること（意図しない変更を防止） |
| 入力条件 | `status = "streaming"`                                                           |
| 期待結果 | Provider セレクタが `aria-disabled=true` / Model セレクタが `aria-disabled=true` |
| 備考     | actionable なコールバックが設定されていても UI 側で guard している場合の動作確認 |

---

### EC-06: 8 状態すべてでクラッシュしないこと（smoke test）

| 項目     | 内容                                                                                         |
| -------- | -------------------------------------------------------------------------------------------- |
| EC-ID    | EC-06                                                                                        |
| 検証観点 | 状態機械の全 8 state で ChatPanel がクラッシュせずレンダーされること                         |
| 対象状態 | `idle` / `ready` / `streaming` / `completed` / `cancelled` / `error` / `blocked` / `handoff` |
| 期待結果 | 全状態で `render()` が例外を投げない                                                         |

```typescript
const ALL_STATES = [
  "idle",
  "ready",
  "streaming",
  "completed",
  "cancelled",
  "error",
  "blocked",
  "handoff",
] as const;

test.each(ALL_STATES)(
  "EC-06: status='%s' でクラッシュせずレンダーされる",
  (status) => {
    (useStreamingChat as ReturnType<typeof vi.fn>).mockReturnValue({
      status,
      messages: [],
      error: status === "error"
        ? { code: "TEST_ERROR", message: "テストエラー" }
        : null,
      sendMessage: vi.fn(),
      cancelStreaming: vi.fn(),
      clearMessages: vi.fn(),
    });

    expect(() => render(<ChatPanel />)).not.toThrow();
  }
);
```

---

## 2. エッジケース優先度マトリクス

| EC-ID | 優先度 | 対応 GAP/Concern        | 自動化         |
| ----- | ------ | ----------------------- | -------------- |
| EC-01 | 高     | GAP-01 + Concern 2      | 可能           |
| EC-02 | 高     | GAP-04 + Concern 2      | MINOR-A 確認後 |
| EC-03 | 中     | 状態機械                | 可能           |
| EC-04 | 高     | Concern 2（no-op 禁止） | 可能           |
| EC-05 | 中     | GAP-02/03 の UI guard   | 可能           |
| EC-06 | 中     | 状態機械全体            | 可能           |

---

## 3. 実行コマンド

```bash
# エッジケーステストを含む全 ChatPanel テストを実行
cd apps/desktop && pnpm vitest run src/renderer/components/chat/

# EC-04（no-op 検出）を単体で確認
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.test.tsx -t "no-op"
```
