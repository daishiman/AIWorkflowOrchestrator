# Phase 4: テスト作成

## メタ情報

| 項目      | 値                                      |
| --------- | --------------------------------------- |
| Phase番号 | 4                                       |
| 機能名    | ChatView エラーサイレント握りつぶし修正 |
| タスクID  | TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE  |
| 作成日    | 2026-03-20                              |
| 前Phase   | `phase-3-design-review.md`              |

## 目的

Phase 2 の設計に基づき、実装前にテストケースを設計・作成する（TDD: Red → Green → Refactor）。`chatSlice.ts` のエラーハンドリングと `ChatView` のエラーバナーUIの両方を網羅するテストを作成する。

## 実行タスク

- Task 1: `chatSlice.test.ts` に silent failure 修正用の Red ケースを追加する。
- Task 2: `ChatView.test.tsx` にエラーバナーの Red ケースを追加する。
- Task 3: Task 2〜4 の既存 LLM/Workspace テストと混線しないことを確認する。

### Task 1: 既存テストファイルの調査

実装前に既存テストの構造を把握し、テスト追加箇所を特定する。

```bash
# chatSlice のテストファイル確認
find apps/desktop/src -name "chatSlice*.test.*" -o -name "chatSlice*.spec.*"

# ChatView のテストファイル確認
find apps/desktop/src -name "ChatView*.test.*" -o -name "ChatView*.spec.*"

# 既存テストのインポートパス確認（P63対策）
grep -n "^import" apps/desktop/src/renderer/store/slices/__tests__/chatSlice.test.ts 2>/dev/null || \
grep -n "^import" apps/desktop/src/renderer/store/slices/chatSlice.test.ts 2>/dev/null
```

### Task 2: chatSlice テストケース設計

#### テスト対象

- `chatSlice.ts` の `sendMessage` アクションにおけるエラーハンドリング
- `chatSlice.ts` の `clearChatError` アクション
- `chatError` の初期state

#### テストケース一覧

| ID  | テスト名                                        | 期待値                                  |
| --- | ----------------------------------------------- | --------------------------------------- |
| C-1 | chatError の初期値が null であること            | `state.chatError === null`              |
| C-2 | sendMessage 成功時に chatError が null のまま   | `state.chatError === null`              |
| C-3 | window.electronAPI 未定義時に AI_UNAVAILABLE    | `state.chatError === "AI_UNAVAILABLE"`  |
| C-4 | response.success=false かつ error あり          | `state.chatError === response.error`    |
| C-5 | response.success=false かつ error なし          | `state.chatError === "UNKNOWN_ERROR"`   |
| C-6 | catch ブロック例外時に API_CALL_FAILED          | `state.chatError === "API_CALL_FAILED"` |
| C-7 | sendMessage 呼び出し時に前回の chatError クリア | `state.chatError === null` (送信開始時) |
| C-8 | clearChatError でエラーが null になる           | `state.chatError === null`              |
| C-9 | エラー時も isSending が false に戻る            | `state.isSending === false`             |

#### 追加先ファイル

既存の `chatSlice.test.ts` に `describe("chatError")` ブロックを追加する。

### Task 3: ChatView エラーバナー テストケース設計

#### テスト対象

- `ChatView` コンポーネントのエラーバナー表示/非表示
- 5秒タイマーによる自動消去
- ×ボタンによる手動消去
- エラーコードから日本語メッセージへの変換

#### テストケース一覧

| ID  | テスト名                                           | 期待値                                               |
| --- | -------------------------------------------------- | ---------------------------------------------------- |
| V-1 | chatError が null の場合バナーが表示されない       | エラーバナー要素が DOM に存在しない                  |
| V-2 | chatError が設定された場合バナーが表示される       | エラーバナー要素が DOM に存在する                    |
| V-3 | AI_UNAVAILABLE コードで正しい日本語メッセージ表示  | 「AI機能が利用できません」テキストが含まれる         |
| V-4 | API_CALL_FAILED コードで正しい日本語メッセージ表示 | 「メッセージの送信に失敗しました」テキストが含まれる |
| V-5 | UNKNOWN_ERROR コードでフォールバックメッセージ表示 | 「予期しないエラーが発生しました」テキストが含まれる |
| V-6 | ×ボタンクリックで clearChatError が呼ばれる        | `mockClearChatError` が1回呼ばれる                   |
| V-7 | 5秒後に clearChatError が自動呼び出しされる        | `vi.advanceTimersByTime(5000)` で自動消去            |
| V-8 | chatError 変化時にタイマーがリセットされる         | 新しいエラー設定後5秒でのみ消去される                |
| V-9 | エラーバナーに aria-label が設定されている         | `aria-label="エラーを閉じる"` が存在する             |

#### テスト環境の注意

- P39: `happy-dom` 環境では `userEvent` ではなく `fireEvent` を使用する
- P40: テスト実行は `apps/desktop/` ディレクトリから実行する
- P13: タイマーテストは `vi.useFakeTimers()` + `vi.advanceTimersByTime()` を使用する

#### 追加先ファイル

既存の `ChatView.test.tsx` に `describe("エラーバナー")` ブロックを追加する。新規作成の場合は既存テストのインポートパスを参照すること（P63対策）。

### Task 4: テストコードの作成

#### chatSlice テスト追加例

```typescript
describe("chatError", () => {
  it("C-1: chatError の初期値が null であること", () => {
    const state = useAppStore.getState();
    expect(state.chatError).toBeNull();
  });

  it("C-8: clearChatError でエラーが null になること", () => {
    useAppStore.setState({ chatError: "API_CALL_FAILED" });
    useAppStore.getState().clearChatError();
    expect(useAppStore.getState().chatError).toBeNull();
  });

  it("C-7: sendMessage 呼び出し時に前回の chatError がクリアされること", async () => {
    useAppStore.setState({ chatError: "API_CALL_FAILED" });
    // sendMessage の開始直後に chatError が null になることを確認
    // （実装では set({ chatError: null }) が sendMessage の冒頭で呼ばれる）
    const sendMessagePromise = useAppStore.getState().sendMessage("test");
    // 非同期処理の最初のticksでchatErrorがクリアされることを確認
    await Promise.resolve();
    expect(useAppStore.getState().chatError).toBeNull();
    await sendMessagePromise;
  });
});
```

#### ChatView エラーバナー テスト追加例

```typescript
describe("エラーバナー", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("V-1: chatError が null の場合バナーが表示されない", () => {
    // useChatError を null を返すようにモック
    vi.mocked(useChatError).mockReturnValue(null);
    render(<ChatView />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("V-2: chatError が設定された場合バナーが表示される", () => {
    vi.mocked(useChatError).mockReturnValue("API_CALL_FAILED");
    render(<ChatView />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("V-7: 5秒後に clearChatError が自動呼び出しされる", async () => {
    const mockClear = vi.fn();
    vi.mocked(useChatError).mockReturnValue("API_CALL_FAILED");
    vi.mocked(useClearChatError).mockReturnValue(mockClear);
    render(<ChatView />);
    vi.advanceTimersByTime(5000);
    expect(mockClear).toHaveBeenCalledTimes(1);
  });
});
```

## 参照資料

| 資料名               | パス                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| Phase 1 要件定義     | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-1-requirements.md`  |
| Phase 2 設計書       | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-2-design.md`        |
| Phase 3 設計レビュー | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-3-design-review.md` |
| コード品質ルール     | `.claude/rules/02-code-quality.md`                                                                     |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                                                                   |
| chatSlice 実装       | `apps/desktop/src/renderer/store/slices/chatSlice.ts`                                                  |
| ChatView 実装        | `apps/desktop/src/renderer/views/ChatView/index.tsx`                                                   |

## 実行手順

### Step 1: 既存テストファイルの場所・構造確認

```bash
find apps/desktop/src -name "*.test.*" | grep -i "chat" | sort
```

### Step 2: chatSlice テスト追加

既存の chatSlice テストファイルに `describe("chatError")` ブロックを追加する。

### Step 3: ChatView エラーバナーテスト追加

既存の ChatView テストファイルに `describe("エラーバナー")` ブロックを追加する。新規作成の場合は既存テストのインポートパターンを参照する（P63対策）。

### Step 4: テストが Red になることを確認（TDD）

```bash
cd apps/desktop && pnpm vitest run src/renderer/store/slices/chatSlice.test.ts
cd apps/desktop && pnpm vitest run src/renderer/views/ChatView/ChatView.test.tsx
```

実装前なので全テストが失敗することを確認する。

## 統合テスト連携

- `apps/desktop/src/renderer/store/slices/chatSlice.test.ts` で `chatError` 初期値、失敗時設定、`isSending` 復帰を Red にする。
- `apps/desktop/src/renderer/views/ChatView/ChatView.test.tsx` で alert 表示、close button、5秒タイマーを Red にする。
- `WorkspaceChatPanel` / `useWorkspaceChatController` の既存テストは Task 4 の既存保護線として扱い、本 Task の Red/Green 対象へ混ぜない。

## 成果物

| 成果物                          | パス                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Phase 4 仕様書（本ファイル）    | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-4-test-creation.md` |
| chatSlice テスト追加            | `apps/desktop/src/renderer/store/slices/chatSlice.test.ts`（またはテストファイルパス）                 |
| ChatView エラーバナーテスト追加 | `apps/desktop/src/renderer/views/ChatView/ChatView.test.tsx`（またはテストファイルパス）               |

## 完了条件

- [ ] 既存テストファイルの場所を確認した（P63対策）
- [ ] C-1〜C-9 の chatSlice テストケースを作成した
- [ ] V-1〜V-9 の ChatView エラーバナーテストケースを作成した
- [ ] タイマーテストで `vi.useFakeTimers()` を使用している（P13対策）
- [ ] `fireEvent` を使用している（P39対策: happy-dom環境）
- [ ] 実装前にテストが Red になることを確認した

## 次Phase

Phase 5: 実装（`phase-5-implementation.md`）
