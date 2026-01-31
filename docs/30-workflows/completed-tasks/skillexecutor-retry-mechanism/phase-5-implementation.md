# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目      | 内容                          |
| --------- | ----------------------------- |
| Phase     | 5                             |
| Phase名   | 実装                          |
| カテゴリ  | TDD-Green                     |
| 機能名    | skillexecutor-retry-mechanism |
| 作成日    | 2026-01-30                    |
| 前提Phase | Phase 4（テスト作成）         |
| 後続Phase | Phase 6（テスト拡充）         |

## 目的

Phase 4で作成したテストをすべてGreen（パス）にするためのリトライ機構を実装する。

---

## 実行タスク

### Task 1: RetryConfig型とデフォルト定数の追加

**目的**: リトライ設定の型と定数を`packages/shared/src/types/skill.ts`に追加する。

**手順**:

1. `packages/shared/src/types/skill.ts`を開く
2. 以下の型を追加する:

   ```typescript
   /** リトライ可能なエラーの分類 */
   export type RetryableErrorType =
     | "network"
     | "rate_limit"
     | "server_error"
     | "timeout";

   /** リトライ設定 */
   export interface RetryConfig {
     /** 最大リトライ回数（デフォルト: 3） */
     maxRetries: number;
     /** 基本待機時間（ミリ秒）（デフォルト: 1000） */
     baseDelayMs: number;
     /** 最大待機時間（ミリ秒）（デフォルト: 30000） */
     maxDelayMs: number;
     /** Jitter範囲 0-1（デフォルト: 0.2） */
     jitterFactor: number;
     /** バックオフ倍率（デフォルト: 2） */
     backoffMultiplier: number;
   }

   /** リトライ判定結果 */
   export interface RetryableErrorResult {
     retryable: boolean;
     errorType?: RetryableErrorType;
     retryAfterMs?: number;
   }
   ```

3. SkillStreamMessageTypeに`'retry'`を追加する
4. RetryMessageContent型を追加する:
   ```typescript
   export interface RetryMessageContent {
     type: "retry";
     attempt: number;
     maxRetries: number;
     delayMs: number;
     errorType: RetryableErrorType;
     errorMessage: string;
   }
   ```
5. SkillStreamMessage discriminated unionにretryケースを追加する
6. SkillExecutionRequestにoptionalな`retryConfig?: Partial<RetryConfig>`フィールドを追加する

**期待される成果物**:

- 更新された型定義（`packages/shared/src/types/skill.ts`）

### Task 2: リトライ定数の追加

**目的**: SkillExecutor.tsにリトライ関連の定数を追加する。

**手順**:

1. `apps/desktop/src/main/services/skill/SkillExecutor.ts`を開く
2. 既存定数セクション（DEFAULT_TOOLS, DEFAULT_TIMEOUT_MS等）の近くに以下を追加する:

   ```typescript
   /** リトライ対象のネットワークエラーコード */
   const RETRYABLE_NETWORK_ERRORS = [
     "ECONNRESET",
     "ETIMEDOUT",
     "ECONNREFUSED",
     "ENOTFOUND",
     "EAI_AGAIN",
   ] as const;

   /** デフォルトリトライ設定 */
   const DEFAULT_RETRY_CONFIG: RetryConfig = {
     maxRetries: 3,
     baseDelayMs: 1000,
     maxDelayMs: 30000,
     jitterFactor: 0.2,
     backoffMultiplier: 2,
   };
   ```

**期待される成果物**:

- 更新されたSkillExecutor.ts（定数追加部分）

### Task 3: isRetryableError()関数の実装

**目的**: エラーがリトライ対象かどうかを判定する関数を実装する。

**手順**:

1. SkillExecutor.tsに以下の関数を追加する（クラスメソッドまたはモジュールレベル関数）:
   ```typescript
   function isRetryableError(error: unknown): RetryableErrorResult;
   ```
2. 判定ロジック:
   - error が Error でない場合 → `{ retryable: false }`
   - error.code が RETRYABLE_NETWORK_ERRORS に含まれる → `{ retryable: true, errorType: 'network' }`
   - error.status === 429 → `{ retryable: true, errorType: 'rate_limit', retryAfterMs: parseRetryAfter(error) }`
   - error.status >= 500 && < 600 → `{ retryable: true, errorType: 'server_error' }`
   - error.name === 'TimeoutError' || error.code === 'TIMEOUT' → `{ retryable: true, errorType: 'timeout' }`
   - error.name === 'AbortError' → `{ retryable: false }`
   - それ以外 → `{ retryable: false }`
3. Retry-Afterヘッダーのパース（秒数またはHTTP日付形式）

**期待される成果物**:

- 更新されたSkillExecutor.ts（isRetryableError追加）

### Task 4: calculateBackoffDelay()関数の実装

**目的**: リトライ間隔を計算する関数を実装する。

**手順**:

1. SkillExecutor.tsに以下の関数を追加する:
   ```typescript
   function calculateBackoffDelay(
     attempt: number,
     config: RetryConfig,
     retryAfterMs?: number,
   ): number;
   ```
2. 実装:
   ```typescript
   if (retryAfterMs !== undefined) {
     return Math.max(retryAfterMs, config.baseDelayMs);
   }
   const exponentialDelay =
     config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt);
   const cappedDelay = Math.min(config.maxDelayMs, exponentialDelay);
   const jitter = cappedDelay * (Math.random() * 2 - 1) * config.jitterFactor;
   return Math.max(0, cappedDelay + jitter);
   ```

**期待される成果物**:

- 更新されたSkillExecutor.ts（calculateBackoffDelay追加）

### Task 5: sleep()ユーティリティの実装

**目的**: AbortSignal対応のsleep関数を実装する。

**手順**:

1. SkillExecutor.tsに以下のユーティリティ関数を追加する:
   ```typescript
   function sleep(ms: number, signal?: AbortSignal): Promise<void> {
     return new Promise((resolve, reject) => {
       if (signal?.aborted) {
         reject(new DOMException("Aborted", "AbortError"));
         return;
       }
       const timer = setTimeout(resolve, ms);
       signal?.addEventListener(
         "abort",
         () => {
           clearTimeout(timer);
           reject(new DOMException("Aborted", "AbortError"));
         },
         { once: true },
       );
     });
   }
   ```

**期待される成果物**:

- 更新されたSkillExecutor.ts（sleep追加）

### Task 6: executeWithRetry()メソッドの実装

**目的**: execute()メソッド内のquery() API呼び出しをリトライラッパーで包む。

**手順**:

1. 既存のexecute()メソッド内のquery() API呼び出し部分を特定する
2. executeWithRetry()メソッドを追加する:
   ```typescript
   private async executeWithRetry(
     executionId: string,
     request: SkillExecutionRequest,
     abortSignal: AbortSignal
   ): Promise<void>
   ```
3. リトライループの実装:
   - retryConfig の解決: `{ ...DEFAULT_RETRY_CONFIG, ...request.retryConfig }`
   - attempt = 0 から開始
   - try-catchでquery()呼び出し
   - catch内でisRetryableError()判定
   - リトライ対象かつattempt < maxRetriesの場合:
     - sendStreamMessage()でretryイベント送信
     - calculateBackoffDelay()で待機時間算出
     - sleep(delay, abortSignal)で待機
     - attempt++してループ継続
   - リトライ不可または上限到達の場合: throw
4. 既存のexecute()メソッドを修正し、executeWithRetry()を呼び出す

**期待される成果物**:

- 更新されたSkillExecutor.ts（executeWithRetry追加、execute修正）

### Task 7: テスト実行・全テストGreen確認

**目的**: Phase 4で作成した全テストがパスすることを確認する。

**手順**:

1. リトライテストを実行する:
   ```bash
   pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts
   ```
2. 全テストがGreenであることを確認する
3. 既存テストも引き続きパスすることを確認する:
   ```bash
   pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts
   pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/services/skill/__tests__/SkillExecutor.permission.test.ts
   pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/services/skill/__tests__/SkillExecutor.integration.test.ts
   ```
4. Failがある場合は実装を修正する

**期待される成果物**:

- テスト結果レポート（`outputs/phase-5/test-results.md`）

---

## 参照資料

| 参照資料               | パス                                                                         | 用途             |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------- |
| Phase 2設計書          | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-2/`           | 設計参照         |
| Phase 4テスト          | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts` | テスト対象       |
| SkillExecutor実装      | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                      | 実装対象         |
| skill型定義            | `packages/shared/src/types/skill.ts`                                         | 型追加対象       |
| エラーハンドリング仕様 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | リトライ戦略参照 |

---

## TDDフェーズ設定

| 項目           | 値                                                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| TDD状態        | Green                                                                                                                  |
| テストコマンド | `pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts` |

---

## 多角的観点チェック

### Electron固有観点

| 層           | 確認内容                                                                |
| ------------ | ----------------------------------------------------------------------- |
| Main Process | sleep()がイベントループをブロックしないこと                             |
| IPC通信      | retryストリーミングイベントが`skill:stream`チャネル経由で送信されること |
| Preload      | window.skillAPIに変更が不要であること                                   |

---

## 統合テスト連携

既存テストがGreenであることを維持しながら実装:

- SkillExecutor.test.ts: 既存テスト全パス
- SkillExecutor.permission.test.ts: 既存テスト全パス
- SkillExecutor.integration.test.ts: 既存テスト全パス

---

## 成果物

| 成果物             | パス                                                    | 種別     |
| ------------------ | ------------------------------------------------------- | -------- |
| 更新型定義         | `packages/shared/src/types/skill.ts`                    | code     |
| 更新SkillExecutor  | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | code     |
| テスト結果レポート | `outputs/phase-5/test-results.md`                       | document |

---

## 完了条件

- [ ] RetryConfig型、RetryableErrorType型、RetryMessageContent型がskill.tsに追加されている
- [ ] SkillStreamMessageTypeに'retry'が追加されている
- [ ] DEFAULT_RETRY_CONFIGが定義されている
- [ ] isRetryableError()が全エラーパターンを正しく判定する
- [ ] calculateBackoffDelay()がExponential Backoff with Jitterを正しく計算する
- [ ] sleep()がAbortSignal対応である
- [ ] executeWithRetry()がリトライループを正しく実行する
- [ ] Phase 4のリトライテスト全41ケースがGreenである
- [ ] 既存テスト（SkillExecutor.test.ts等）が全パスしている
- [ ] 本Phase内の全タスク（Task 1-7）を100%実行完了

---

## Phase完了時必須アクション

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/skillexecutor-retry-mechanism \
  --phase 5 \
  --artifacts "apps/desktop/src/main/services/skill/SkillExecutor.ts:リトライ機構実装"
```

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skillexecutor-retry-mechanism --phase 5
```

---

## Phase実行記録

| 項目              | 内容 |
| ----------------- | ---- |
| 実行タスク        |      |
| 発見事項          |      |
| 次Phaseへの引継ぎ |      |

---

## 次のPhase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
