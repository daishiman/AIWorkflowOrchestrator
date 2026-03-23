# Phase 7: カバレッジ目標

## メタ情報

| 項目               | 値                                              |
| ------------------ | ----------------------------------------------- |
| タスクID           | TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001 |
| 作成日             | 2026-03-23                                      |
| Phase              | 7 — カバレッジ確認                              |
| 対象コンポーネント | ChatPanel.tsx                                   |

---

## 1. カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 根拠                    |
| ----------------- | -------- | -------- | ----------------------- |
| Line Coverage     | 80%      | 90%      | 02-code-quality.md 準拠 |
| Branch Coverage   | 60%      | 70%      | 02-code-quality.md 準拠 |
| Function Coverage | 80%      | 90%      | 02-code-quality.md 準拠 |

---

## 2. カバレッジ計測コマンド

```bash
# ChatPanel.tsx のカバレッジをレポート出力
cd apps/desktop && pnpm vitest run --coverage \
  --coverage.include="src/renderer/components/chat/ChatPanel.tsx" \
  src/renderer/components/chat/

# カバレッジレポートをブラウザで確認（HTML 形式）
cd apps/desktop && pnpm vitest run --coverage \
  --coverage.reporter=html \
  --coverage.include="src/renderer/components/chat/ChatPanel.tsx" \
  src/renderer/components/chat/
# → coverage/index.html を開く
```

---

## 3. P41 対策: インライン arrow function のカバレッジ

### 問題

Vitest の v8 カバレッジプロバイダは、インライン arrow function（例: `onSelectProvider={() => handleSelectProvider()}`）を
独立した関数としてカウントする。
これらが実行されないと Function Coverage が大幅に低下する（44.44% まで低下した事例あり）。

### 本タスクでの影響箇所

GAP-01〜04 の置換後に残存する可能性のあるインライン arrow function:

| 箇所                                       | パターン                                                   | カバレッジ影響                     |
| ------------------------------------------ | ---------------------------------------------------------- | ---------------------------------- |
| `handleTerminalSwitch` の `useCallback` 内 | `() => { setActiveView("terminal"); }`                     | useCallback を実行するテストが必要 |
| `handleOpenTerminal` の `useCallback` 内   | `async () => { await window.electronAPI.openTerminal(); }` | IPC テスト（TC-04）で実行される    |

### 対策

```typescript
// P41 対策: useCallback 内の arrow function はテストで明示的に呼び出す

// NG: コールバックが渡されるだけでテスト内で実行されない
test("NG: handleTerminalSwitch が渡されている", () => {
  render(<ChatPanel />);
  // ボタンをクリックしないと useCallback 内が実行されない
  // → Function Coverage が低下する
});

// OK: fireEvent でボタンを実際にクリックして内部を実行する
test("OK: handleTerminalSwitch の useCallback が実行される", async () => {
  render(<ChatPanel />);
  const button = screen.getByRole("button", { name: /ターミナル切替/ });
  await act(async () => {
    fireEvent.click(button);
  });
  // useCallback 内が実行され Function Coverage にカウントされる
  expect(mockSetActiveView).toHaveBeenCalledWith("terminal");
});
```

### validateIpcSender パターン（P41 適用例）

IPC ハンドラ内で `getAllowedWindows: () => [mainWindow]` 等のインライン関数がある場合:

```typescript
// P41 対策: コールバックの戻り値を明示的に検証する
expect(mockValidateIpcSender.mock.calls[0][2].getAllowedWindows()).toEqual([
  mockMainWindow,
]);
```

---

## 4. 状態機械 8 state のブランチカバレッジ

ChatPanel の状態機械は 8 state あり、各 state で異なる UI 分岐が発生する。
Branch Coverage 60% を達成するために最低限カバーすべき state:

| 優先度 | 状態        | 対応テスト                 |
| ------ | ----------- | -------------------------- |
| 必須   | `idle`      | TC-05（JSDoc 確認）+ EC-06 |
| 必須   | `streaming` | EC-03（Escape キャンセル） |
| 必須   | `error`     | TC-10                      |
| 必須   | `blocked`   | TC-11 + EC-01              |
| 必須   | `handoff`   | TC-07 + EC-02              |
| 推奨   | `ready`     | EC-06                      |
| 推奨   | `completed` | EC-06                      |
| 推奨   | `cancelled` | TC-13 + EC-06              |

必須 5 state をカバーすることで Branch Coverage 62.5%（5/8）を達成できる。
推奨 3 state を追加で全 8 state をカバーすることで Branch Coverage 100% に近づく。

---

## 5. カバレッジ不足時のフォールバック（Phase 6 への戻り条件）

| カバレッジ指標    | 不足判定閾値 | 対応                                             |
| ----------------- | ------------ | ------------------------------------------------ |
| Line Coverage     | < 80%        | Phase 6 に戻り、不足行のテストを追加             |
| Branch Coverage   | < 60%        | Phase 6 に戻り、未テスト分岐を確認               |
| Function Coverage | < 80%        | Phase 6 に戻り、P41 対策（click イベント）を追加 |

### 不足箇所の特定コマンド

```bash
# カバレッジ詳細（テキスト形式）で未カバー行を確認
cd apps/desktop && pnpm vitest run --coverage \
  --coverage.reporter=text \
  --coverage.include="src/renderer/components/chat/ChatPanel.tsx" \
  src/renderer/components/chat/

# Uncovered Lines の例:
# ChatPanel.tsx | 82.5 | 65.0 | 85.0 |
#   Uncovered Lines: 45-52, 78
# → 行 45-52 のブランチが未テスト → Edge Case を追加する
```

---

## 6. カバレッジ達成基準チェックリスト

Phase 7 を PASS とするための確認項目:

- [ ] Line Coverage >= 80%（推奨: >= 90%）
- [ ] Branch Coverage >= 60%（推奨: >= 70%）
- [ ] Function Coverage >= 80%（推奨: >= 90%）
- [ ] P41 対策: `useCallback` 内の arrow function が実行されていること
- [ ] 8 state の必須 5 state（idle/streaming/error/blocked/handoff）がカバーされていること
- [ ] カバレッジ不足の場合は Phase 6 に戻り追加テストを実施していること
