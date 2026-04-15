# Phase 4: テスト作成（TDD Red） - UT-W3-ANALYTICS-HTTP-PROVIDER-001

## メタ情報

| 項目                 | 内容                              |
| -------------------- | --------------------------------- |
| Phase                | 4                                 |
| タスクID             | UT-W3-ANALYTICS-HTTP-PROVIDER-001 |
| タイトル             | Analytics HTTP プロバイダー実装   |
| 作成日               | 2026-04-14                        |
| 前提Phase            | Phase 3（設計レビューゲート）     |
| 後続Phase            | Phase 5（実装 TDD Green）         |
| テスト種別           | ユニットテスト / 統合テスト       |
| テストフレームワーク | vitest                            |
| 関連Issue            | #2125 (CLOSED)                    |

## 目的

Phase 5（実装）の前に、`AnalyticsHttpProvider` のユニットテストと `analyticsHandler.ts` の統合テストを作成し、実装がない状態でテストが全て FAIL（Red）であることを確認する（TDD Red フェーズ）。テストは受入基準 AC-1〜AC-6 を完全にカバーすること。

---

## 実行タスク

### Task 4-1: AnalyticsHttpProvider ユニットテスト作成

**テストファイルパス**: `apps/desktop/src/main/services/analytics/__tests__/AnalyticsHttpProvider.test.ts`

**モック設定方針**:

```typescript
// vitest を使用したモック設定（コメントのみ）

// 1. global.fetch のモック
//    - vi.stubGlobal('fetch', vi.fn()) を使用
//    - または vi.spyOn(global, 'fetch') を使用
//    - 各テストケースで mockResolvedValueOnce / mockRejectedValueOnce を設定

// 2. AbortController のモック
//    - vi.spyOn(global, 'AbortController') でモック可能
//    - AbortSignal の timeout や abort() の呼び出し確認に使用
//    - または実際の AbortController を使用し、
//      vi.useFakeTimers() でタイムアウトをシミュレート

// 3. タイマーのモック（バックオフ遅延用）
//    - vi.useFakeTimers() と vi.runAllTimersAsync() を組み合わせる
//    - afterEach で vi.useRealTimers() に戻すこと

// 4. 環境変数のモック
//    - process.env.ANALYTICS_ENDPOINT_URL を各テストで設定/削除
//    - afterEach で元の状態に復元すること（beforeEach での保存推奨）
```

---

#### TC-01: ANALYTICS_ENDPOINT_URL未設定時はno-opで動作する

**対応受入基準**: AC-5

**テスト概要**: `ANALYTICS_ENDPOINT_URL` が設定されていない場合、HTTP リクエストを送信せずに `{ success: true, skipped: true }` を返すことを確認する。

```typescript
// describe('AnalyticsHttpProvider', () => {
//   describe('TC-01: ANALYTICS_ENDPOINT_URL 未設定時は no-op', () => {
//     it('should return { success: true, skipped: true } without sending HTTP request', async () => {
//       // Arrange: ANALYTICS_ENDPOINT_URL を undefined にする
//       // Act: provider.send(event) を呼び出す
//       // Assert:
//       //   - result.success === true
//       //   - result.skipped === true
//       //   - global.fetch が呼ばれていないこと（expect(fetch).not.toHaveBeenCalled()）
//     })
//   })
// })
```

**事前条件**: `process.env.ANALYTICS_ENDPOINT_URL` が未設定（`undefined`）
**期待結果**: `{ success: true, skipped: true }`、`fetch` が呼ばれない

---

#### TC-02: HTTP POSTリクエストが送信される

**対応受入基準**: AC-1

**テスト概要**: `ANALYTICS_ENDPOINT_URL` が設定されている環境で、`fetch` が正しい URL・メソッド・ヘッダー・ボディで呼ばれることを確認する。

```typescript
// describe('TC-02: HTTP POST リクエストが送信される', () => {
//   it('should call fetch with correct method, headers, and body', async () => {
//     // Arrange:
//     //   - process.env.ANALYTICS_ENDPOINT_URL = 'https://analytics.example.com/events'
//     //   - fetch mock: mockResolvedValueOnce({ ok: true, status: 200 })
//     //   - event = { eventName: 'test_event', payload: { key: 'value' }, timestamp: 1000 }
//     // Act: provider.send(event)
//     // Assert:
//     //   - fetch が 'https://analytics.example.com/events' で呼ばれた
//     //   - method: 'POST'
//     //   - headers['Content-Type']: 'application/json'
//     //   - body に eventName / payload / timestamp が含まれる
//     //   - result.success === true
//   })
// })
```

**事前条件**: `ANALYTICS_ENDPOINT_URL` 設定済み、`fetch` が 200 OK を返すモック
**期待結果**: `fetch` が正しいパラメータで 1 回呼ばれ、`{ success: true }` が返る

---

#### TC-03: タイムアウト時にAbortControllerでキャンセルされる

**対応受入基準**: AC-2

**テスト概要**: 5秒以内に `fetch` が完了しない場合、`AbortController.abort()` が呼ばれてリクエストがキャンセルされることを確認する。

```typescript
// describe('TC-03: タイムアウト時に AbortController でキャンセルされる', () => {
//   it('should abort fetch after 5000ms timeout', async () => {
//     // Arrange:
//     //   - vi.useFakeTimers()
//     //   - fetch mock: never resolves (new Promise(() => {}))
//     //   - AbortController spy を設定
//     // Act:
//     //   - provider.send(event) を呼び出す（await しない）
//     //   - vi.advanceTimersByTimeAsync(5001) でタイムアウトを発生させる
//     //   - await で結果を受け取る
//     // Assert:
//     //   - result.success === false
//     //   - result.error に 'timeout' または 'AbortError' が含まれる
//     //   - AbortController の abort() が呼ばれたこと
//   })
// })
```

**事前条件**: `fetch` が永久に pending のモック、`vi.useFakeTimers()` 使用
**期待結果**: 5秒後に `abort()` が呼ばれ、`{ success: false, error: "..." }` が返る

---

#### TC-04: ネットワークエラー時にsuccess:falseが返る

**対応受入基準**: AC-2

**テスト概要**: `fetch` がネットワークエラー（`TypeError: Failed to fetch`）をスローした場合、例外を伝播せずに `{ success: false }` を返すことを確認する。

```typescript
// describe('TC-04: ネットワークエラー時に success: false が返る', () => {
//   it('should return { success: false } when fetch throws network error', async () => {
//     // Arrange:
//     //   - fetch mock: mockRejectedValueOnce(new TypeError('Failed to fetch'))
//     //   - MAX_RETRIES 回分の rejection を設定（リトライ分も含む）
//     // Act: provider.send(event) を await する
//     // Assert:
//     //   - result.success === false
//     //   - result.error が存在する（string 型）
//     //   - 例外がスローされないこと（test 自体が reject されない）
//   })
// })
```

**事前条件**: `fetch` がネットワークエラーをスローするモック（3回分）
**期待結果**: `{ success: false, error: string }` が返り、例外は外部へ伝播しない

---

#### TC-05: リトライが最大3回実行される

**対応受入基準**: AC-3

**テスト概要**: `fetch` が連続で失敗した場合に、最大 3 回リトライが実行され、3 回目の失敗後に `{ success: false }` が返ることを確認する。

```typescript
// describe('TC-05: リトライが最大 3 回実行される', () => {
//   it('should retry up to 3 times before returning failure', async () => {
//     // Arrange:
//     //   - vi.useFakeTimers() （バックオフ遅延をスキップ）
//     //   - fetch mock: 4回分 mockRejectedValueOnce（初回 + リトライ3回）
//     // Act:
//     //   - sendPromise = provider.send(event)（await しない）
//     //   - vi.runAllTimersAsync() でバックオフ遅延をスキップ
//     //   - result = await sendPromise
//     // Assert:
//     //   - fetch が合計 4 回呼ばれたこと（expect(fetch).toHaveBeenCalledTimes(4)）
//     //   - result.success === false
//   })
//
//   it('should succeed on retry if fetch recovers', async () => {
//     // Arrange:
//     //   - vi.useFakeTimers()
//     //   - fetch mock:
//     //       1回目: mockRejectedValueOnce(new Error('Network error'))
//     //       2回目: mockResolvedValueOnce({ ok: true, status: 200 })
//     // Act: 上記同様
//     // Assert:
//     //   - fetch が 2 回呼ばれたこと
//     //   - result.success === true
//   })
// })
```

**事前条件**: `vi.useFakeTimers()` 使用、`fetch` が 4 回 reject するモック
**期待結果**: `fetch` が 4 回呼ばれ（初回 + 3 リトライ）、最終的に `{ success: false }` が返る

---

#### TC-06: sentCountが正確にインクリメントされる

**対応受入基準**: AC-4

**テスト概要**: HTTP 送信が成功するたびに `analyticsStore.sentCount` が 1 ずつ増加することを確認する。

```typescript
// describe('TC-06: sentCount が正確にインクリメントされる', () => {
//   it('should increment sentCount on successful send', async () => {
//     // Arrange:
//     //   - analyticsStore（electron-store）をモックする
//     //     vi.mock('electron-store') または DI でモック Store を渡す
//     //   - fetch mock: 成功レスポンス
//     //   - 初期 sentCount = 0
//     // Act: provider.send(event) を 3 回呼ぶ
//     // Assert:
//     //   - store.set が 'sentCount' と 3 で呼ばれたこと
//     //   - または store.get('sentCount') === 3
//   })
// })
```

**事前条件**: `electron-store` モック、`fetch` が 3 回成功するモック
**期待結果**: `sentCount` が 3 になる（各送信成功後にインクリメント）

---

#### TC-07: failedCountが正確にインクリメントされる

**対応受入基準**: AC-4

**テスト概要**: HTTP 送信が最終的に失敗した場合（リトライ全滅後）に `analyticsStore.failedCount` が 1 増加することを確認する。リトライ中の中間失敗ではインクリメントされないこと。

```typescript
// describe('TC-07: failedCount が正確にインクリメントされる', () => {
//   it('should increment failedCount once after all retries exhausted', async () => {
//     // Arrange:
//     //   - vi.useFakeTimers()
//     //   - analyticsStore モック、初期 failedCount = 0
//     //   - fetch: 4 回すべて reject
//     // Act: provider.send(event) + vi.runAllTimersAsync()
//     // Assert:
//     //   - store の failedCount 更新が 1 回だけ呼ばれたこと
//     //   - failedCount の最終値が 1 であること
//   })
//
//   it('should NOT increment failedCount when send succeeds', async () => {
//     // Arrange: fetch 成功モック
//     // Act: provider.send(event)
//     // Assert: failedCount の更新が呼ばれないこと
//   })
// })
```

**事前条件**: `vi.useFakeTimers()`、`fetch` が全リトライ失敗するモック
**期待結果**: `failedCount` が 1 増加（リトライ中間では増加しない）

---

### Task 4-2: analyticsHandler 統合テスト更新

**テストファイルパス**: `apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts`（既存ファイルへの追加）

**モック設定方針**:

```typescript
// 統合テスト用モック設定（コメントのみ）

// 1. AnalyticsHttpProvider のモック
//    - vi.mock('../services/analytics/AnalyticsHttpProvider') を使用
//    - send メソッドを vi.fn().mockResolvedValue({ success: true }) に設定

// 2. electron-store のモック
//    - vi.mock('electron-store') を既存テストと同様に使用

// 3. IPC ハンドラーのテスト
//    - ipcMain.handle をモックするか、
//      registerAnalyticsHandlers() 登録後にハンドラーを直接呼び出す
```

---

#### TC-08: analytics:send IPC経由でHTTP送信が発火する（モック）

**対応受入基準**: AC-1

**テスト概要**: `analytics:send` IPC チャネル経由でイベントが受信された際に、`AnalyticsHttpProvider.send()` が呼ばれることを確認する（統合テスト）。

```typescript
// describe('analyticsHandler 統合テスト', () => {
//   describe('TC-08: analytics:send IPC 経由で HTTP 送信が発火する', () => {
//     it('should call AnalyticsHttpProvider.send when analytics:send is invoked', async () => {
//       // Arrange:
//       //   - AnalyticsHttpProvider をモック（send が success: true を返す）
//       //   - analyticsStore.analyticsOptOut = false（オプトインを模擬）
//       //   - registerAnalyticsHandlers() を呼び出す
//       // Act:
//       //   - ANALYTICS_SEND ハンドラーを直接呼び出す
//       //     handler(null, { eventName: 'test', payload: {}, timestamp: Date.now() })
//       // Assert:
//       //   - AnalyticsHttpProvider.send が正しい引数で呼ばれたこと
//       //   - 戻り値 result.success === true
//     })
//
//     it('should return skipped: true when opted out', async () => {
//       // Arrange: analyticsOptOut = true
//       // Assert: AnalyticsHttpProvider.send が呼ばれないこと
//     })
//   })
// })
```

---

#### TC-09: analytics:get-stats IPCチャネルが統計を返す

**対応受入基準**: AC-4、Dashboard 用

**テスト概要**: `analytics:get-stats` IPC チャネルが `analyticsStore` から `sentCount` / `failedCount` を読み取って返すことを確認する。

```typescript
// describe('TC-09: analytics:get-stats IPC チャネルが統計を返す', () => {
//   it('should return sentCount and failedCount from analyticsStore', async () => {
//     // Arrange:
//     //   - analyticsStore.sentCount = 10
//     //   - analyticsStore.failedCount = 2
//     //   - registerAnalyticsHandlers() を呼び出す
//     // Act:
//     //   - ANALYTICS_GET_STATS ハンドラーを直接呼び出す
//     //     handler(null, undefined)
//     // Assert:
//     //   - result.sentCount === 10
//     //   - result.failedCount === 2
//   })
//
//   it('should return 0 for both counts when store is empty', async () => {
//     // Arrange: store が空（初期値）
//     // Assert: sentCount === 0 && failedCount === 0
//   })
// })
```

---

### Task 4-3: 既存テストのregression確認

**目的**: 新規テストファイル追加・既存テスト更新後に既存テストが壊れていないことを確認する。

**確認対象**:

| 確認対象                                      | 実行コマンド                                                            |
| --------------------------------------------- | ----------------------------------------------------------------------- |
| analyticsHandler 既存テスト                   | `pnpm vitest run apps/desktop/src/main/ipc/__tests__/analyticsHandler*` |
| analytics 関連全テスト                        | `pnpm vitest run --reporter=verbose apps/desktop/src/main/`             |
| shared/channels.ts を参照するテスト（必要時） | `pnpm vitest run packages/shared/`                                      |

**TDD Red 確認手順**:

```bash
# 1. AnalyticsHttpProvider テストを単体実行（実装なし → 全 FAIL が期待値）
pnpm vitest run apps/desktop/src/main/services/analytics/__tests__/AnalyticsHttpProvider.test.ts

# 2. 期待される出力:
#   FAIL  AnalyticsHttpProvider.test.ts
#   ✗ TC-01: ANALYTICS_ENDPOINT_URL 未設定時は no-op
#   ✗ TC-02: HTTP POST リクエストが送信される
#   ... （全テスト FAIL）

# 3. 既存テストが壊れていないことを確認
pnpm vitest run apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts
```

---

## テストファイル配置

| ファイル                                                                           | 操作 | 説明                                    |
| ---------------------------------------------------------------------------------- | ---- | --------------------------------------- |
| `apps/desktop/src/main/services/analytics/__tests__/AnalyticsHttpProvider.test.ts` | 新規 | Provider ユニットテスト（TC-01〜TC-07） |
| `apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts`                     | 更新 | 統合テスト追加（TC-08〜TC-09）          |

**ディレクトリが存在しない場合の作成**:

```bash
# __tests__ ディレクトリが存在しない場合に作成
mkdir -p apps/desktop/src/main/services/analytics/__tests__
```

---

## 参照資料

| 資料名                          | パス                                                                                          |
| ------------------------------- | --------------------------------------------------------------------------------------------- |
| analyticsHandler.ts（変更対象） | `apps/desktop/src/main/ipc/analyticsHandler.ts`                                               |
| Preload チャネル定義            | `apps/desktop/src/preload/channels.ts`                                                        |
| Phase 3 設計レビュー結果        | `docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001/outputs/phase-3/design-review-result.md` |
| Phase 2 設計書                  | `docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001/outputs/phase-2/`                        |
| vitest 公式ドキュメント         | https://vitest.dev/guide/                                                                     |

---

| 要件定義書（FR/NFR/AC/IPC4層整合性） | `outputs/phase-1/requirements-summary.md` | Phase 1 成果物 |
| 設計書（クラス設計/IPC4層/リトライ/DI境界） | `outputs/phase-2/design-summary.md` | Phase 2 成果物 |

## 実行手順

1. Phase 3 設計レビュー結果（`outputs/phase-3/design-review-result.md`）を確認し、MAJOR 指摘が 0 件であることを確認する
2. `apps/desktop/src/main/services/analytics/__tests__/` ディレクトリを作成する
3. `AnalyticsHttpProvider.test.ts` を作成し、TC-01〜TC-07 を実装する
4. `analyticsHandler.test.ts` を更新し、TC-08〜TC-09 を追加する
5. 実装前の状態で全テストを実行し、**全て FAIL であること**を確認する（TDD Red）
6. 既存テストが壊れていないことを確認する
7. テストファイルを `outputs/phase-4/` に成果物として記録する

---

## 成果物

| 成果物                          | パス                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| Provider ユニットテストファイル | `apps/desktop/src/main/services/analytics/__tests__/AnalyticsHttpProvider.test.ts`    |
| analyticsHandler 統合テスト追記 | `apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts`（TC-08〜TC-09 追加分） |
| TDD Red 確認ログ                | `docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001/outputs/phase-4/tdd-red-log.txt` |

---

## 完了条件

- [ ] TC-01: `ANALYTICS_ENDPOINT_URL` 未設定時 no-op テストが作成されている
- [ ] TC-02: HTTP POST リクエスト送信テストが作成されている
- [ ] TC-03: タイムアウト / `AbortController` キャンセルテストが作成されている
- [ ] TC-04: ネットワークエラー時 `success: false` テストが作成されている
- [ ] TC-05: 最大 3 回リトライテストが作成されている（成功ケース・失敗ケース）
- [ ] TC-06: `sentCount` インクリメントテストが作成されている
- [ ] TC-07: `failedCount` インクリメントテスト（リトライ全滅後に 1 回のみ）が作成されている
- [ ] TC-08: `analytics:send` IPC → HTTP 送信の統合テストが追加されている
- [ ] TC-09: `analytics:get-stats` IPC → 統計返却テストが追加されている
- [ ] TDD Red 確認: `AnalyticsHttpProvider.test.ts` の全テストが FAIL であることを実行で確認済み
- [ ] regression 確認: 既存の `analyticsHandler.test.ts` テストが引き続き PASS であることを確認済み
- [ ] テストファイルが所定のパスに配置されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## タスク100%実行確認【必須】

本 Phase の全テスト作成が完了した後、以下を必ず実行して確認すること：

```bash
# TDD Red 確認: AnalyticsHttpProvider テストが全 FAIL であること
pnpm vitest run apps/desktop/src/main/services/analytics/__tests__/AnalyticsHttpProvider.test.ts 2>&1 | grep -E "(PASS|FAIL|✓|✗)"

# regression 確認: 既存テストが壊れていないこと
pnpm vitest run apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts 2>&1 | tail -10
```

上記の「AnalyticsHttpProvider.test.ts が全 FAIL」と「既存テストが全 PASS」を確認してから Phase 5 へ進むこと。

---

## 次Phase

Phase 5: 実装（TDD Green） - `phase-5-implementation.md`
