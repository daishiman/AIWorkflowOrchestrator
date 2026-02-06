# Phase 4 成果物: テスト仕様書

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 4                             |
| 機能名   | auth-session-refresh          |
| タスクID | TASK-AUTH-SESSION-REFRESH-001 |
| 作成日   | 2026-02-06                    |
| 文書種別 | テスト仕様書                  |

---

## 1. テスト環境

| 項目                 | 値                                                |
| -------------------- | ------------------------------------------------- |
| テストフレームワーク | Vitest                                            |
| DOM環境              | happy-dom                                         |
| タイマー制御         | `vi.useFakeTimers()` / `vi.advanceTimersByTime()` |
| モック手法           | `vi.fn()` / コールバックDIパターン                |
| テストランナー       | forks プール、並列実行有効                        |
| タイムアウト         | 10,000ms（vitest.config.ts設定値）                |

---

## 2. テスト戦略

### 2.1 TDD Red-Green-Refactorサイクル

| フェーズ | Phase | 説明                                                 |
| -------- | ----- | ---------------------------------------------------- |
| Red      | 4     | テストを先に作成し、実装がないため全テストが失敗する |
| Green    | 5     | テストを通すための最小限の実装を行う                 |
| Refactor | 8     | テストを維持しながらコード品質を改善する             |

### 2.2 テスト設計方針

1. **コールバックDIパターン活用**: `TokenRefreshCallbacks`のonRefresh/onFailure/onSuccessをモック関数として注入し、呼び出し回数・引数を検証する
2. **vi.useFakeTimers()**: setTimeoutベースのスケジューリングを`vi.advanceTimersByTime()`で時間を進めて検証する
3. **境界値分析**: expiresAtが過去の値、5分未満、ジャスト5分のケースを網羅する
4. **状態遷移検証**: isRunning()、isRefreshing()の状態遷移を各操作後に検証する

---

## 3. テストファイル

| テストファイル                                                           | 対象                      | Phase |
| ------------------------------------------------------------------------ | ------------------------- | ----- |
| `apps/desktop/src/main/services/__tests__/tokenRefreshScheduler.test.ts` | TokenRefreshScheduler     | 4-5   |
| `apps/desktop/src/renderer/store/slices/__tests__/authSlice.test.ts`     | authSlice連携（既存拡充） | 6     |

---

## 4. テストカテゴリ別設計

### 4.1 基本動作テスト（4件）

`TokenRefreshScheduler`の基本ライフサイクル（start/stop/isRunning）を検証する。

| #   | テストケースID | テスト名                                | 検証内容                                 |
| --- | -------------- | --------------------------------------- | ---------------------------------------- |
| 1   | TC-BASIC-001   | start()でスケジューラーが開始されること | start()呼び出し後にタイマーが設定される  |
| 2   | TC-BASIC-002   | isRunning()が開始後にtrueを返すこと     | start()後のisRunning()戻り値を検証       |
| 3   | TC-BASIC-003   | stop()でスケジューラーが停止されること  | stop()呼び出し後にタイマーがクリアされる |
| 4   | TC-BASIC-004   | stop()後にisRunning()がfalseを返すこと  | stop()後のisRunning()戻り値を検証        |

### 4.2 リフレッシュタイミングテスト（3件）

有効期限に基づくリフレッシュ発火タイミングを検証する。

| #   | テストケースID | テスト名                                                      | 検証内容                                                |
| --- | -------------- | ------------------------------------------------------------- | ------------------------------------------------------- |
| 5   | TC-TIMING-001  | 有効期限5分前にonRefreshコールバックが実行されること          | delay = expiresAt - 300,000ms - Date.now() で発火を確認 |
| 6   | TC-TIMING-002  | 有効期限まで5分未満の場合、即座にリフレッシュが実行されること | delay = 0（即座実行）を確認                             |
| 7   | TC-TIMING-003  | expiresAtが過去の値の場合、即座にリフレッシュが実行されること | expiresAt < Date.now()の場合にdelay=0で実行を確認       |

### 4.3 リフレッシュ成功テスト（2件）

リフレッシュ成功時のコールバック呼び出しとスケジューラーリセットを検証する。

| #   | テストケースID | テスト名                                                    | 検証内容                                                |
| --- | -------------- | ----------------------------------------------------------- | ------------------------------------------------------- |
| 8   | TC-SUCCESS-001 | リフレッシュ成功時にonSuccessコールバックが呼ばれること     | onRefreshがnumber返却 → onSuccessが呼ばれることを検証   |
| 9   | TC-SUCCESS-002 | リフレッシュ成功後にreset()で新しいタイマーが設定されること | 成功後に新しいexpiresAtで再スケジュールされることを検証 |

### 4.4 リトライテスト（4件）

リフレッシュ失敗時の指数バックオフリトライと全失敗時のフォールバックを検証する。

| #   | テストケースID | テスト名                                                   | 検証内容                                                        |
| --- | -------------- | ---------------------------------------------------------- | --------------------------------------------------------------- |
| 10  | TC-RETRY-001   | リフレッシュ失敗時にリトライが実行されること（最大3回）    | onRefresh失敗後にリトライが3回まで実行されることを検証          |
| 11  | TC-RETRY-002   | リトライ間隔が指数バックオフ（1s→2s→4s）であること         | 各リトライの間隔がretryBaseIntervalMs \* 2^retryCountであること |
| 12  | TC-RETRY-003   | 全リトライ失敗後にonFailureコールバックが呼ばれること      | maxRetries回失敗後にonFailureが呼ばれることを検証               |
| 13  | TC-RETRY-004   | リトライ中に成功した場合、以降のリトライは実行されないこと | 2回目のリトライで成功 → 3回目は未実行を検証                     |

### 4.5 reset/disposeテスト（3件）

reset()とdispose()によるタイマー管理とリソース解放を検証する。

| #   | テストケースID   | テスト名                                                    | 検証内容                                                 |
| --- | ---------------- | ----------------------------------------------------------- | -------------------------------------------------------- |
| 14  | TC-LIFECYCLE-001 | reset()で既存タイマーがクリアされ新タイマーが設定されること | reset()呼び出しで古いタイマー破棄 + 新タイマー設定を検証 |
| 15  | TC-LIFECYCLE-002 | dispose()で全タイマーがクリアされること                     | dispose()後にisRunning()がfalseであることを検証          |
| 16  | TC-LIFECYCLE-003 | dispose()後にstart()を呼んでもエラーにならないこと          | dispose済み状態でstart()が安全に無視されることを検証     |

### 4.6 エッジケーステスト（8件）

異常系・境界値・二重呼び出しに対するロバスト性を検証する。

| #   | テストケースID | テスト名                                                                  | 検証内容                                                             |
| --- | -------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 17  | TC-EDGE-001    | start()を二重呼び出しした場合、前のタイマーがクリアされること             | 2回目のstart()で1回目のタイマーが破棄されることを検証                |
| 18  | TC-EDGE-002    | stop()を二重呼び出しした場合、エラーにならないこと                        | stop()→stop()でエラーが発生しないことを検証                          |
| 19  | TC-EDGE-003    | configのデフォルト値が正しく適用されること                                | config未指定時にrefreshBeforeExpiryMs=300000等が適用されることを検証 |
| 20  | TC-EDGE-004    | リフレッシュ中（\_isRefreshing=true）に新たなリフレッシュが無視されること | 排他制御により二重リフレッシュが防止されることを検証                 |
| 21  | TC-EDGE-005    | リフレッシュ中にstop()を呼んだ場合、リトライが中止されること              | stop()呼び出し後に残りのリトライが実行されないことを検証             |
| 22  | TC-EDGE-006    | リフレッシュ中にdispose()を呼んだ場合、全処理が中止されること             | dispose()で進行中のリフレッシュ/リトライが停止されることを検証       |
| 23  | TC-EDGE-007    | onRefreshが非常に長時間かかる場合でも正しく動作すること                   | 非同期onRefreshの長時間実行後も正常に後続処理が行われることを検証    |
| 24  | TC-EDGE-008    | reset()を未start状態で呼んだ場合、エラーにならないこと                    | \_callbacks=null状態でreset()が安全に無視されることを検証            |

### 4.7 カスタム設定テスト（2件）

デフォルト以外のconfig値で正しく動作することを検証する。

| #   | テストケースID | テスト名                                                                   | 検証内容                                                  |
| --- | -------------- | -------------------------------------------------------------------------- | --------------------------------------------------------- |
| 25  | TC-CONFIG-001  | configのrefreshBeforeExpiryMsをカスタム値で設定できること                  | カスタム値（例: 600,000ms）でタイミングが変わることを検証 |
| 26  | TC-CONFIG-002  | configのmaxRetriesを0に設定した場合、リトライなしでonFailureが呼ばれること | maxRetries=0で初回失敗時に即onFailureが呼ばれることを検証 |

---

## 5. テストコード構造

```typescript
// apps/desktop/src/main/services/__tests__/tokenRefreshScheduler.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TokenRefreshScheduler } from "../tokenRefreshScheduler";

describe("TokenRefreshScheduler", () => {
  let scheduler: TokenRefreshScheduler;
  let mockCallbacks: {
    onRefresh: ReturnType<typeof vi.fn>;
    onFailure: ReturnType<typeof vi.fn>;
    onSuccess: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    scheduler = new TokenRefreshScheduler();
    mockCallbacks = {
      onRefresh: vi.fn(),
      onFailure: vi.fn(),
      onSuccess: vi.fn(),
    };
  });

  afterEach(() => {
    scheduler.dispose();
    vi.useRealTimers();
  });

  describe("基本動作", () => {
    // TC-BASIC-001 〜 TC-BASIC-004
  });

  describe("リフレッシュタイミング", () => {
    // TC-TIMING-001 〜 TC-TIMING-003
  });

  describe("リフレッシュ成功", () => {
    // TC-SUCCESS-001 〜 TC-SUCCESS-002
  });

  describe("リフレッシュ失敗・リトライ", () => {
    // TC-RETRY-001 〜 TC-RETRY-004
  });

  describe("reset/dispose", () => {
    // TC-LIFECYCLE-001 〜 TC-LIFECYCLE-003
  });

  describe("エッジケース", () => {
    // TC-EDGE-001 〜 TC-EDGE-008
  });

  describe("カスタム設定", () => {
    // TC-CONFIG-001 〜 TC-CONFIG-002
  });
});
```

---

## 6. テストデータ設計

### 6.1 タイムスタンプ設定

| 変数名             | 値                                  | 説明                              |
| ------------------ | ----------------------------------- | --------------------------------- |
| `now`              | `Date.now()`（FakeTimerの現在時刻） | テスト開始時の基準時刻            |
| `expiresAt_1h`     | `now + 3_600_000`                   | 1時間後に期限切れ（標準ケース）   |
| `expiresAt_3min`   | `now + 180_000`                     | 3分後に期限切れ（5分未満ケース）  |
| `expiresAt_past`   | `now - 60_000`                      | 1分前に期限切れ（過去ケース）     |
| `refreshBeforeMs`  | `300_000`                           | デフォルト: 5分前                 |
| `expectedDelay_1h` | `3_600_000 - 300_000 = 3_300_000`   | 1時間期限の場合のディレイ（55分） |

### 6.2 コールバックモック設定

| パターン   | onRefresh戻り値                              | 説明                            |
| ---------- | -------------------------------------------- | ------------------------------- |
| 成功       | `Promise.resolve(newExpiresAt)`              | 新しいexpiresAt（ミリ秒）を返す |
| 失敗       | `Promise.resolve(null)`                      | nullを返す（リフレッシュ失敗）  |
| 例外       | `Promise.reject(new Error('Network error'))` | ネットワークエラーをスロー      |
| 部分成功   | 1-2回目はnull、3回目は成功値                 | リトライ途中で成功するケース    |
| 長時間処理 | `new Promise(resolve => setTimeout(...))`    | 長時間かかるリフレッシュ処理    |

---

## 7. カバレッジ目標

| 指標              | Phase 4目標 | 最終目標（Phase 7） |
| ----------------- | ----------- | ------------------- |
| Line Coverage     | N/A（Red）  | 80%+（推奨90%+）    |
| Branch Coverage   | N/A（Red）  | 60%+（推奨70%+）    |
| Function Coverage | N/A（Red）  | 80%+（推奨90%+）    |

Phase 4ではテストコードの作成が目的であり、実装が存在しないため全テストは失敗（Red）状態となる。

---

## 8. TDD Red状態の確認

```bash
# テスト実行コマンド（全テスト失敗を確認）
pnpm --filter @repo/desktop test:run tokenRefreshScheduler.test.ts

# 期待結果: 26 failed（Red状態）
```
