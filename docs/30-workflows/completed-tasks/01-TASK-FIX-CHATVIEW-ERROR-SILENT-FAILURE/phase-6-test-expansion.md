# Phase 6: テスト拡充

## メタ情報

| 項目      | 値                                      |
| --------- | --------------------------------------- |
| Phase番号 | 6                                       |
| 機能名    | ChatView エラーサイレント握りつぶし修正 |
| タスクID  | TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE  |
| 作成日    | 2026-03-20                              |
| 前Phase   | `phase-5-implementation.md`             |

## 目的

Phase 4 で設計したテストケースと Phase 5 の実装を照らし合わせ、カバレッジ不足箇所や境界値・異常系のテストを追加する。Phase 7 のカバレッジ確認に備える。

## 実行タスク

- Task 1: `chatSlice` の境界値と異常系分岐を補完する。
- Task 2: `ChatView` の未知エラーコードと再レンダリング条件を補完する。
- Task 3: Task 01 の範囲を超える Workspace/LLM runtime テストへ広げない。

### Task 1: カバレッジ計測の実行

```bash
cd apps/desktop && pnpm vitest run --coverage src/renderer/store/slices/chatSlice.ts
cd apps/desktop && pnpm vitest run --coverage src/renderer/views/ChatView/
```

未カバーの行・分岐を特定する。

### Task 2: chatSlice.ts カバレッジ不足箇所の補完

#### 追加すべきテストケース候補

| ID   | テスト名                                                 | 対象コードパス                              |
| ---- | -------------------------------------------------------- | ------------------------------------------- |
| C-10 | response.error が string 以外の場合 UNKNOWN_ERROR になる | `typeof response.error !== "string"` の分岐 |
| C-11 | sendMessage 中に isSending が true になる                | 送信中の状態                                |
| C-12 | 複数回連続エラー後に最後のエラーコードのみ保持           | 上書き挙動の確認                            |
| C-13 | clearChatError が chatError が null の状態で呼ばれる     | null → null の冪等性確認                    |

### Task 3: ChatView エラーバナーカバレッジ不足箇所の補完

#### 追加すべきテストケース候補

| ID   | テスト名                                                    | 対象コードパス                             |
| ---- | ----------------------------------------------------------- | ------------------------------------------ |
| V-10 | 未知のエラーコードで UNKNOWN_ERROR フォールバックメッセージ | `ERROR_MESSAGES[code]` が undefined の分岐 |
| V-11 | chatError が null に戻った時にバナーが消える                | 再レンダリングによる非表示                 |
| V-12 | 複数種のエラーコードで正しいメッセージが表示される          | RATE_LIMIT_EXCEEDED / NETWORK_ERROR 等     |
| V-13 | ×ボタンが keyboard でアクセス可能である                     | `Enter` キーでクリック可能                 |

### Task 4: 境界値テストの追加

```typescript
// C-10: response.error が string 以外の場合
it("C-10: response.error が object の場合 UNKNOWN_ERROR が設定される", async () => {
  // mockCallLLMAPI が { success: false, error: { code: "ERROR" } } を返す場合
  // → chatError === "UNKNOWN_ERROR" になることを確認
});

// V-10: 未知のエラーコードのフォールバック
it("V-10: 未知のエラーコード 'CUSTOM_ERROR' で UNKNOWN_ERROR メッセージが表示される", () => {
  vi.mocked(useChatError).mockReturnValue("CUSTOM_ERROR");
  render(<ChatView />);
  expect(screen.getByText("予期しないエラーが発生しました。")).toBeInTheDocument();
});
```

## 参照資料

| 資料名                  | パス                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| Phase 4 テスト設計      | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-4-test-creation.md`  |
| Phase 5 実装            | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-5-implementation.md` |
| コード品質ルール（TDD） | `.claude/rules/02-code-quality.md`                                                                      |
| chatSlice.ts            | `apps/desktop/src/renderer/store/slices/chatSlice.ts`                                                   |
| ChatView                | `apps/desktop/src/renderer/views/ChatView/index.tsx`                                                    |

## 実行手順

### Step 1: カバレッジ計測

Phase 4-5 のテストでカバーされていない行・分岐を特定する。

### Step 2: 不足テストの追加

Task 2-4 を参考に不足テストを追加する。

### Step 3: カバレッジ再計測

追加後のカバレッジが改善されたことを確認する。

## 統合テスト連携

- `chatSlice.test.ts` では `typeof response.error !== "string"` 分岐と連続失敗上書き挙動を追加する。
- `ChatView.test.tsx` では未知コード fallback と alert 非表示遷移を追加する。
- 補完対象は Task 01 の `chatSlice.ts` / `ChatView/index.tsx` に限定し、`llmSlice.ts` や Workspace 側ローカル state は別 workflow の責務として維持する。

## 成果物

| 成果物                       | パス                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| Phase 6 仕様書（本ファイル） | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-6-test-expansion.md` |
| chatSlice テスト拡充済み     | `apps/desktop/src/renderer/store/slices/chatSlice.test.ts`                                              |
| ChatView テスト拡充済み      | `apps/desktop/src/renderer/views/ChatView/ChatView.test.tsx`                                            |

## 完了条件

- [ ] カバレッジ計測を実行し、不足箇所を特定した
- [ ] `chatSlice.ts` の `callLLMAPI` エラー分岐が全てカバーされている
- [ ] `ChatView` のエラーバナーの全条件分岐がカバーされている
- [ ] 境界値テスト（未知のエラーコード、nullへの復帰）が追加されている
- [ ] 全テストが Green である

## 次Phase

Phase 7: カバレッジ確認（`phase-7-coverage-check.md`）
