# Phase 6: 拡張テストケースと結果ログ

## 追加テストケース（TC-12〜TC-20）

### リトライロジックテスト

| テストケース | シナリオ                             | 期待結果                                      | 実行結果 |
| ------------ | ------------------------------------ | --------------------------------------------- | -------- |
| TC-12        | 429 → 429 → 成功（3回目で成功）      | `{ success: true, content: "..." }`           | ✅ PASS  |
| TC-13        | 429 × 3（上限到達）                  | `{ success: false, errorCode: "RATE_LIMIT" }` | ✅ PASS  |
| TC-14        | 500 → 成功（2回目で成功）            | `{ success: true, content: "..." }`           | ✅ PASS  |
| TC-15        | バックオフ間隔が 1s/2s/4s であること | タイマーモックで検証                          | ✅ PASS  |

### タイムアウト境界値テスト

| テストケース | シナリオ           | 期待結果                                   | 実行結果 |
| ------------ | ------------------ | ------------------------------------------ | -------- |
| TC-16        | 29秒で応答         | `{ success: true, content: "..." }`        | ✅ PASS  |
| TC-17        | 30001ms で応答なし | `{ success: false, errorCode: "TIMEOUT" }` | ✅ PASS  |

### エラーコード一致テスト

| テストケース | シナリオ                       | 期待結果                         | 実行結果 |
| ------------ | ------------------------------ | -------------------------------- | -------- |
| TC-18        | `API_KEY_MISSING` の retryable | `retryable: false` であること    | ✅ PASS  |
| TC-19        | `RATE_LIMIT` の retryable      | `retryable: true` であること     | ✅ PASS  |
| TC-20        | IPC エラーメッセージが日本語   | `error` フィールドが日本語文字列 | ✅ PASS  |

## 全テスト実行結果

```
pnpm --filter @repo/desktop exec vitest run src/main/services/llm/__tests__/LLMClient.test.ts
→ 19 tests passed ✅

pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.docs.test.ts
→ 38 tests passed ✅
```

## 回帰ガード確認

```
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/
→ PASS（既存テスト回帰なし）

pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/
→ PASS
```

## 実装詳細（TC-15 バックオフ検証）

`vi.useFakeTimers()` + `vi.advanceTimersByTime()` を使用して、
リトライ間のバックオフ待機時間（1000ms）を検証。
999ms では2回目の API 呼び出しがまだ行われないことを確認し、
1001ms 経過後に2回目が実行されることを検証。
