# Phase 6: テスト拡充 - UT-W3-ANALYTICS-HTTP-PROVIDER-001

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| Phase      | 6                                                       |
| Phase名    | テスト拡充                                              |
| タスクID   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                       |
| タイトル   | Analytics HTTP プロバイダー実装（外部分析基盤への接続） |
| 前提Phase  | Phase 5: 実装                                           |
| 次Phase    | Phase 7: テストカバレッジ確認                           |
| ステータス | pending                                                 |
| 作成日     | 2026-04-14                                              |

## 目的

Phase 5 で実装した `AnalyticsHttpProvider` に対して、
基本的な Happy Path／Unhappy Path を超えた境界条件・エッジケース・
リトライ境界・`analyticsStore` 統合のテストを追加し、
受入基準 AC-1〜AC-6 の網羅率を高める。

## 実行タスク

### Task 6-1: エッジケーステスト追加

Phase 5 では基本送信フローを検証したが、以下の 3 ケースを追加する。

#### TC-10: 同時並行送信（複数イベントの同時送信）

| 項目     | 内容                                                                                        |
| -------- | ------------------------------------------------------------------------------------------- |
| テスト名 | `TC-10: 複数イベントを同時並行で送信した場合、全件が独立してHTTP POSTされる`                |
| 前提     | `ANALYTICS_ENDPOINT_URL` が設定済み                                                         |
| 操作     | `Promise.all([provider.send(event1), provider.send(event2), provider.send(event3)])` を実行 |
| 期待値   | fetch が 3 回呼び出され、各呼び出しが独立した AbortController を持つ                        |
| 検証観点 | 1 件の失敗が他件の成功に影響しないこと                                                      |
| 対応 AC  | AC-1, AC-4                                                                                  |

```typescript
it("TC-10: 複数イベントを同時並行で送信した場合、全件が独立してHTTP POSTされる", async () => {
  mockFetch.mockResolvedValue({ ok: true });
  const events = [
    { eventName: "ev1", payload: {}, timestamp: Date.now() },
    { eventName: "ev2", payload: {}, timestamp: Date.now() },
    { eventName: "ev3", payload: {}, timestamp: Date.now() },
  ];
  const results = await Promise.all(events.map((e) => provider.send(e)));
  expect(mockFetch).toHaveBeenCalledTimes(3);
  results.forEach((r) => expect(r.success).toBe(true));
});
```

#### TC-11: 巨大ペイロードの送信

| 項目     | 内容                                                                       |
| -------- | -------------------------------------------------------------------------- |
| テスト名 | `TC-11: 巨大ペイロード（1MB超）を送信した場合、タイムアウト前に送信される` |
| 前提     | `ANALYTICS_ENDPOINT_URL` が設定済み、fetch は即時 resolve                  |
| 操作     | `payload` に 1 MB 相当の文字列を含む event を送信する                      |
| 期待値   | `success: true` が返る                                                     |
| 検証観点 | ペイロードサイズによるタイムアウト誤検知がないこと                         |
| 対応 AC  | AC-1                                                                       |

```typescript
it("TC-11: 巨大ペイロード（1MB超）を送信した場合、タイムアウト前に送信される", async () => {
  mockFetch.mockResolvedValue({ ok: true });
  const bigPayload = { data: "x".repeat(1024 * 1024) }; // 1MB
  const result = await provider.send({
    eventName: "large-event",
    payload: bigPayload,
    timestamp: Date.now(),
  });
  expect(result.success).toBe(true);
  expect(mockFetch).toHaveBeenCalledTimes(1);
});
```

#### TC-12: 特殊文字を含む eventName

| 項目     | 内容                                                                                    |
| -------- | --------------------------------------------------------------------------------------- |
| テスト名 | `TC-12: 特殊文字（スラッシュ・改行・Unicode）を含むeventNameが正しくシリアライズされる` |
| 前提     | `ANALYTICS_ENDPOINT_URL` が設定済み                                                     |
| 操作     | `eventName: "user/login\n🎉"` で送信する                                                |
| 期待値   | fetch に渡される body に特殊文字がエスケープされた JSON が含まれる                      |
| 検証観点 | JSON.stringify によるエスケープが正しく行われること                                     |
| 対応 AC  | AC-1                                                                                    |

```typescript
it("TC-12: 特殊文字を含むeventNameが正しくシリアライズされる", async () => {
  mockFetch.mockResolvedValue({ ok: true });
  const result = await provider.send({
    eventName: "user/login\n🎉",
    payload: {},
    timestamp: Date.now(),
  });
  expect(result.success).toBe(true);
  const body = JSON.parse(mockFetch.mock.calls[0][1].body);
  expect(body.eventName).toBe("user/login\n🎉");
});
```

---

### Task 6-2: リトライ境界テスト

受入基準 AC-3「リトライが最大 3 回実行される」の境界値を検証する。

#### TC-13: 1 回目成功（リトライなし）

| 項目     | 内容                                                             |
| -------- | ---------------------------------------------------------------- |
| テスト名 | `TC-13: 初回fetch成功時はリトライなしでsuccess:trueが返る`       |
| 前提     | `ANALYTICS_ENDPOINT_URL` が設定済み                              |
| 操作     | `mockFetch.mockResolvedValueOnce({ ok: true })` で初回成功させる |
| 期待値   | `{ success: true }`, fetch 呼び出し回数 = 1                      |
| 検証観点 | 成功時に余分なリトライが発生しないこと                           |
| 対応 AC  | AC-1, AC-3, AC-4                                                 |

```typescript
it("TC-13: 初回fetch成功時はリトライなしでsuccess:trueが返る", async () => {
  mockFetch.mockResolvedValueOnce({ ok: true });
  const result = await provider.send(sampleEvent);
  expect(result.success).toBe(true);
  expect(mockFetch).toHaveBeenCalledTimes(1);
  expect(analyticsStore.sentCount).toBe(1);
  expect(analyticsStore.failedCount).toBe(0);
});
```

#### TC-14: 2 回目成功（1 回リトライ後成功）

| 項目     | 内容                                                                 |
| -------- | -------------------------------------------------------------------- |
| テスト名 | `TC-14: 初回失敗・2回目成功時はリトライ1回でsuccess:trueが返る`      |
| 前提     | `ANALYTICS_ENDPOINT_URL` が設定済み                                  |
| 操作     | `mockFetch` を 1 回目 reject、2 回目 resolve に設定する              |
| 期待値   | `{ success: true }`, fetch 呼び出し回数 = 2                          |
| 検証観点 | リトライ 1 回で成功した場合に `sentCount` がインクリメントされること |
| 対応 AC  | AC-3, AC-4                                                           |

```typescript
it("TC-14: 初回失敗・2回目成功時はリトライ1回でsuccess:trueが返る", async () => {
  mockFetch
    .mockRejectedValueOnce(new Error("network error"))
    .mockResolvedValueOnce({ ok: true });
  const result = await provider.send(sampleEvent);
  expect(result.success).toBe(true);
  expect(mockFetch).toHaveBeenCalledTimes(2);
  expect(analyticsStore.sentCount).toBe(1);
  expect(analyticsStore.failedCount).toBe(0);
});
```

#### TC-15: 3 回全て失敗（最終的に failure）

| 項目     | 内容                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| テスト名 | `TC-15: 3回全て失敗した場合はsuccess:falseが返りfailedCountが1増える`          |
| 前提     | `ANALYTICS_ENDPOINT_URL` が設定済み                                            |
| 操作     | `mockFetch.mockRejectedValue(new Error("always fail"))` で全回失敗させる       |
| 期待値   | `{ success: false, error: ... }`, fetch 呼び出し回数 = 3                       |
| 検証観点 | 最大リトライ回数（3 回）を超えてリトライしないこと、`failedCount` が増えること |
| 対応 AC  | AC-2, AC-3, AC-4                                                               |

```typescript
it("TC-15: 3回全て失敗した場合はsuccess:falseが返りfailedCountが1増える", async () => {
  mockFetch.mockRejectedValue(new Error("always fail"));
  const result = await provider.send(sampleEvent);
  expect(result.success).toBe(false);
  expect(mockFetch).toHaveBeenCalledTimes(3);
  expect(analyticsStore.sentCount).toBe(0);
  expect(analyticsStore.failedCount).toBe(1);
});
```

---

### Task 6-3: analyticsStore 統合テスト

受入基準 AC-4「`analyticsStore.sentCount` / `failedCount` が正確に記録される」を複数回送信でも検証する。

#### TC-16: sentCount と failedCount の積算確認

| 項目     | 内容                                                                 |
| -------- | -------------------------------------------------------------------- |
| テスト名 | `TC-16: 成功2件・失敗1件の送信後にsentCount=2,failedCount=1となる`   |
| 前提     | `ANALYTICS_ENDPOINT_URL` が設定済み                                  |
| 操作     | 成功 × 2 回、失敗 × 1 回の順に送信する                               |
| 期待値   | `analyticsStore.sentCount === 2`, `analyticsStore.failedCount === 1` |
| 検証観点 | カウンターが累積加算されること                                       |
| 対応 AC  | AC-4                                                                 |

```typescript
it("TC-16: 成功2件・失敗1件の送信後にsentCount=2,failedCount=1となる", async () => {
  mockFetch
    .mockResolvedValueOnce({ ok: true })
    .mockResolvedValueOnce({ ok: true })
    .mockRejectedValue(new Error("fail"));
  await provider.send(sampleEvent);
  await provider.send(sampleEvent);
  await provider.send(sampleEvent);
  expect(analyticsStore.sentCount).toBe(2);
  expect(analyticsStore.failedCount).toBe(1);
});
```

#### TC-17: 複数送信後のカウンター整合性

| 項目     | 内容                                                          |
| -------- | ------------------------------------------------------------- |
| テスト名 | `TC-17: sentCountとfailedCountの合計が送信試行回数と一致する` |
| 前提     | `ANALYTICS_ENDPOINT_URL` が設定済み                           |
| 操作     | 成功 × 3 回、失敗 × 2 回の順に送信する                        |
| 期待値   | `sentCount + failedCount === 5`                               |
| 検証観点 | 送信結果が漏れなくカウンターに反映されること                  |
| 対応 AC  | AC-4                                                          |

```typescript
it("TC-17: sentCountとfailedCountの合計が送信試行回数と一致する", async () => {
  mockFetch
    .mockResolvedValueOnce({ ok: true })
    .mockResolvedValueOnce({ ok: true })
    .mockResolvedValueOnce({ ok: true })
    .mockRejectedValue(new Error("fail"));
  for (let i = 0; i < 5; i++) {
    await provider.send(sampleEvent);
  }
  expect(analyticsStore.sentCount + analyticsStore.failedCount).toBe(5);
});
```

---

## 参照資料

| 資料名                | パス                                                                               | 説明               |
| --------------------- | ---------------------------------------------------------------------------------- | ------------------ |
| メインタスク仕様      | `docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001.md`                           | 受入基準・背景     |
| テスト仕様書          | `outputs/phase-4/test-specification.md`                                            | Phase 4 成果物     |
| Red テスト結果        | `outputs/phase-4/red-test-result.md`                                               | Phase 4 成果物     |
| 実装サマリー          | `outputs/phase-5/implementation-summary.md`                                        | Phase 5 成果物     |
| 変更ファイル一覧      | `outputs/phase-5/changed-files.md`                                                 | Phase 5 成果物     |
| AnalyticsHttpProvider | `apps/desktop/src/main/services/analytics/AnalyticsHttpProvider.ts`                | 実装対象ファイル   |
| テストファイル        | `apps/desktop/src/main/services/analytics/__tests__/AnalyticsHttpProvider.test.ts` | テスト対象ファイル |
| TDD Red確認ログ       | `outputs/phase-4/tdd-red-log.txt`                                                  | Phase 4 成果物     |

## 実行手順

1. Phase 5 の実装サマリー（`outputs/phase-5/implementation-summary.md`）を確認する
2. 既存テストファイル `AnalyticsHttpProvider.test.ts` を確認し、TC-01〜TC-09 の実装状況を把握する
3. Task 6-1（TC-10〜TC-12）を追加実装する
4. Task 6-2（TC-13〜TC-15）を追加実装する
5. Task 6-3（TC-16〜TC-17）を追加実装する
6. `pnpm --filter @repo/desktop test` を実行し、全テストが PASS することを確認する
7. テスト実行結果を `outputs/phase-6/expanded-test-result.md` に記録する

## 成果物

| 成果物               | パス                                       | 説明                       |
| -------------------- | ------------------------------------------ | -------------------------- |
| 拡張テストケース一覧 | `outputs/phase-6/expanded-test-cases.md`   | TC-10〜TC-17 の仕様        |
| テスト実行結果       | `outputs/phase-6/expanded-test-result.md`  | 全テストの Pass/Fail 状況  |
| カバレッジ速報       | `outputs/phase-6/coverage-quick-report.md` | Phase 7 インプット用速報値 |

## 完了条件

- [ ] TC-10（同時並行送信）が実装され PASS している
- [ ] TC-11（巨大ペイロード）が実装され PASS している
- [ ] TC-12（特殊文字 eventName）が実装され PASS している
- [ ] TC-13（1 回目成功・リトライなし）が実装され PASS している
- [ ] TC-14（1 回リトライ後成功）が実装され PASS している
- [ ] TC-15（3 回全て失敗）が実装され PASS している
- [ ] TC-16（sentCount / failedCount 積算確認）が実装され PASS している
- [ ] TC-17（カウンター整合性）が実装され PASS している
- [ ] 既存 TC-01〜TC-09 が全て PASS を維持している（回帰なし）
- [ ] 成果物テーブル記載のファイルが全件生成されている

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスク（Task 6-1 / 6-2 / 6-3）を 100% 実行完了
- [ ] 各テストケース（TC-10〜TC-17）の成果物が生成されている
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を `outputs/phase-6/` に残した

```bash
pnpm --filter @repo/desktop test
```

## 次Phase

→ [Phase 7: テストカバレッジ確認](./phase-7-coverage-check.md)
