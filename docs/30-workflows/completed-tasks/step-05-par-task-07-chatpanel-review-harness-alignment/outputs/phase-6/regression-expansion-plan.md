# Phase 6: 回帰テスト拡充計画

## メタ情報

| 項目               | 値                                              |
| ------------------ | ----------------------------------------------- |
| タスクID           | TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001 |
| 作成日             | 2026-03-23                                      |
| Phase              | 6 — テスト拡充                                  |
| 対象コンポーネント | ChatPanel.tsx                                   |

---

## 1. 拡充方針

Phase 4 で定義した TC-01〜TC-09 に加え、以下の領域でテストを追加する:

1. **error / blocked / fallback 境界**のテスト — 状態機械の境界遷移を網羅する
2. **P31 回帰テスト** — 再レンダー無限ループが再発しないことを保証する
3. **P5 回帰テスト** — IPC リスナー二重登録が発生しないことを保証する

---

## 2. error / blocked / fallback 境界テスト

### TC-10: error 状態の UI 表示検証

| 項目         | 内容                                                                                   |
| ------------ | -------------------------------------------------------------------------------------- |
| TC-ID        | TC-10                                                                                  |
| テストタイプ | unit                                                                                   |
| 対象状態     | `error`                                                                                |
| 検証対象     | error 状態でエラーメッセージが表示され、リトライボタンが利用可能であること             |
| 入力条件     | `status = "error"`, `error = { code: "NETWORK_ERROR", message: "接続に失敗しました" }` |
| 期待結果     | エラーメッセージのテキストが画面に表示される / リトライボタンが `aria-disabled=false`  |
| 境界条件     | `error` が `null` の場合はエラーメッセージが表示されないこと                           |

```typescript
test("TC-10: error 状態でエラーメッセージとリトライボタンが表示される", () => {
  (useStreamingChat as ReturnType<typeof vi.fn>).mockReturnValue({
    status: "error",
    messages: [],
    error: { code: "NETWORK_ERROR", message: "接続に失敗しました" },
    sendMessage: vi.fn(),
    cancelStreaming: vi.fn(),
    clearMessages: vi.fn(),
  });

  render(<ChatPanel />);

  expect(screen.getByText("接続に失敗しました")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /リトライ/ })).not.toBeDisabled();
});
```

### TC-11: blocked 状態の UI 表示検証

| 項目         | 内容                                                                             |
| ------------ | -------------------------------------------------------------------------------- |
| TC-ID        | TC-11                                                                            |
| テストタイプ | unit                                                                             |
| 対象状態     | `blocked`                                                                        |
| 検証対象     | blocked 状態で設定画面への遷移ボタンが表示され、送信ボタンが無効化されていること |
| 入力条件     | `status = "blocked"`                                                             |
| 期待結果     | 設定遷移ボタンが存在する / 送信ボタンが `aria-disabled=true`                     |

### TC-12: fallback — no-op 禁止の境界検証

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| TC-ID        | TC-12                                                          |
| テストタイプ | unit（静的解析）                                               |
| 検証対象     | ChatPanel.tsx 内に `() => {}` パターンが 0 件であること        |
| 手段         | ソースコードの文字列マッチ（grep assertion）                   |
| 期待結果     | マッチ件数が 0                                                 |
| 備考         | Phase 5 実装後に GAP-01〜04 が全て置換済みであることの継続保証 |

```typescript
import { readFileSync } from "fs";
import { resolve } from "path";

test("TC-12: ChatPanel.tsx に no-op コールバック () => {} が残っていない", () => {
  const source = readFileSync(resolve(__dirname, "../ChatPanel.tsx"), "utf-8");
  const noOpMatches = source.match(/\(\) => \{\}/g) ?? [];
  expect(noOpMatches).toHaveLength(0);
});
```

### TC-13: cancelled 状態からの再送信可能性検証

| 項目         | 内容                                              |
| ------------ | ------------------------------------------------- |
| TC-ID        | TC-13                                             |
| テストタイプ | unit                                              |
| 対象状態     | `cancelled`                                       |
| 検証対象     | cancelled 後に送信ボタンが再度 enabled になること |
| 入力条件     | `status = "cancelled"`                            |
| 期待結果     | 送信ボタンが `aria-disabled=false`                |

---

## 3. P31 回帰テスト（無限ループ防止）

### TC-14: Store セレクタの安定参照検証

| 項目         | 内容                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| TC-ID        | TC-14                                                                                |
| テストタイプ | unit                                                                                 |
| 検証対象     | ChatPanel が個別セレクタを使用しており、合成 Store Hook から関数を取得していないこと |
| 手段         | ソースコードの静的解析                                                               |
| 期待結果     | `useAppStore()` の呼び出しが 0 件、個別セレクタ（`useSetActiveView()` 等）が存在する |

```typescript
test("TC-14: ChatPanel.tsx は合成 Store Hook を useEffect 依存配列に混入しない", () => {
  const source = readFileSync(resolve(__dirname, "../ChatPanel.tsx"), "utf-8");

  // 合成 Store Hook の直接呼び出しがないことを確認
  // 個別セレクタ以外の useXxxStore() パターンを検出
  const compositeHookPattern = /use\w+Store\(\)/g;
  const compositeHookMatches = source.match(compositeHookPattern) ?? [];
  expect(compositeHookMatches).toHaveLength(0);
});
```

### TC-15: レンダー回数の上限検証

| 項目         | 内容                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| TC-ID        | TC-15                                                                                                |
| テストタイプ | unit                                                                                                 |
| 検証対象     | ChatPanel の初期マウント時のレンダー回数が 3 回以内であること（React StrictMode の 2 回 + 1 回以内） |
| 手段         | `renderCount` カウンタを用いたカスタムレンダリング                                                   |
| 期待結果     | レンダー回数 <= 3                                                                                    |
| 備考         | 無限ループが発生した場合はテストがタイムアウトする（P48 症状と同一）                                 |

```typescript
test("TC-15: ChatPanel の初期レンダー回数が上限以内", () => {
  let renderCount = 0;

  const CountingWrapper = () => {
    renderCount++;
    return <ChatPanel />;
  };

  render(<CountingWrapper />);

  // レンダー回数が 3 を超えていない（無限ループでない）
  expect(renderCount).toBeLessThanOrEqualTo(3);
});
```

---

## 4. P5 回帰テスト（IPC リスナー二重登録防止）

### TC-16: マウント・アンマウント後の再マウントで IPC 登録が重複しないこと

| 項目         | 内容                                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| TC-ID        | TC-16                                                                                                           |
| テストタイプ | unit                                                                                                            |
| 検証対象     | ChatPanel をアンマウント後に再マウントしても IPC リスナーが重複登録されないこと                                 |
| 入力条件     | mount → unmount → remount のサイクル                                                                            |
| 期待結果     | `window.electronAPI` の任意のリスナー登録メソッドが重複呼び出しされない                                         |
| 備考         | `ipcRenderer.on()` を直接使用している場合に発生しやすい（本タスクでは IPC call のみなので低リスクだが確認する） |

```typescript
test("TC-16: ChatPanel の re-mount で IPC リスナーが重複しない", () => {
  const mockOnMessage = vi.fn();
  Object.defineProperty(window, "electronAPI", {
    value: {
      ...mockElectronAPI,
      onMessage: mockOnMessage,
    },
    writable: true,
    configurable: true,
  });

  const { unmount, rerender } = render(<ChatPanel />);
  unmount();
  render(<ChatPanel />);

  // onMessage が 1 回のみ呼ばれること（再マウントで重複しない）
  // ChatPanel が onMessage を subscribe しない場合は 0 回
  expect(mockOnMessage.mock.calls.length).toBeLessThanOrEqualTo(1);
});
```

---

## 5. 拡充テストの実行順序

```
Phase 4 テスト（TC-01〜TC-09）
  ↓ PASS 確認後
Phase 6 回帰テスト（TC-10〜TC-16）
  ↓
Phase 7 カバレッジ確認
```

### 実行コマンド

```bash
# Phase 6 拡充テストを含む全 ChatPanel テストを実行
cd apps/desktop && pnpm vitest run src/renderer/components/chat/

# カバレッジレポートを出力
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/chat/ChatPanel.tsx
```
