# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目      | 内容                          |
| --------- | ----------------------------- |
| Phase     | 2                             |
| Phase名   | 設計                          |
| カテゴリ  | 設計                          |
| 機能名    | skillexecutor-retry-mechanism |
| 作成日    | 2026-01-30                    |
| 前提Phase | Phase 1（要件定義）           |
| 後続Phase | Phase 3（設計レビューゲート） |

## 目的

Phase 1で確定した要件に基づき、リトライ機構の詳細設計を行う。型定義、アルゴリズム、API、ストリーミングイベントの具体的な設計を作成する。

---

## 実行タスク

### Task 1: RetryConfig型の設計

**目的**: リトライ設定を表現する型を設計する。

**手順**:

1. `packages/shared/src/types/skill.ts`の既存型構造を確認する
2. 以下のRetryConfig型を設計する:
   ```typescript
   /** リトライ設定 */
   interface RetryConfig {
     /** 最大リトライ回数（デフォルト: 3） */
     maxRetries: number;
     /** 基本待機時間（ミリ秒）（デフォルト: 1000） */
     baseDelayMs: number;
     /** 最大待機時間（ミリ秒）（デフォルト: 30000） */
     maxDelayMs: number;
     /** Jitter範囲（0-1、デフォルト: 0.2） */
     jitterFactor: number;
     /** バックオフ倍率（デフォルト: 2） */
     backoffMultiplier: number;
   }
   ```
3. デフォルト値定数を設計する:
   ```typescript
   const DEFAULT_RETRY_CONFIG: RetryConfig = {
     maxRetries: 3,
     baseDelayMs: 1000,
     maxDelayMs: 30000,
     jitterFactor: 0.2,
     backoffMultiplier: 2,
   };
   ```
4. SkillExecutionRequestにoptionalなretryConfig?フィールドを追加する設計

**期待される成果物**:

- RetryConfig型設計書（`outputs/phase-2/retry-config-design.md`）

### Task 2: リトライ対象エラー判定ロジックの設計

**目的**: エラーがリトライ対象かどうかを判定するロジックを設計する。

**手順**:

1. リトライ可能なエラー分類を定義する:
   ```typescript
   type RetryableErrorType =
     | "network"
     | "rate_limit"
     | "server_error"
     | "timeout";
   ```
2. isRetryableError()関数の設計:
   - 入力: Error | unknown
   - 出力: { retryable: boolean; errorType?: RetryableErrorType; retryAfterMs?: number }
   - ネットワークエラー判定: error.code in ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN']
   - HTTP 429判定: status === 429, Retry-AfterヘッダーからretryAfterMsを算出
   - HTTP 5xx判定: status >= 500 && status < 600
   - タイムアウト判定: error.name === 'TimeoutError' || error.code === 'TIMEOUT'
3. リトライ不可エラーの明示的除外:
   - HTTP 4xx (400, 401, 403, 404): クライアントエラー
   - AbortError: ユーザーキャンセル
   - EXECUTION_FAILED with non-retryable cause
4. 既存のcategorizeError()、isRetryable()との関係を整理する

**期待される成果物**:

- エラー判定ロジック設計書（`outputs/phase-2/error-classification-design.md`）

### Task 3: Exponential Backoff with Jitterアルゴリズムの設計

**目的**: リトライ間隔を計算するアルゴリズムを設計する。

**手順**:

1. calculateBackoffDelay()関数を設計する:
   ```typescript
   function calculateBackoffDelay(
     attempt: number,
     config: RetryConfig,
     retryAfterMs?: number,
   ): number;
   ```
2. アルゴリズム:
   - Retry-Afterヘッダーがある場合: `Math.max(retryAfterMs, baseDelayMs)` を返す
   - ない場合: `Math.min(maxDelayMs, baseDelayMs * Math.pow(backoffMultiplier, attempt))`
   - Jitter適用: `delay * (1 + (Math.random() * 2 - 1) * jitterFactor)`
3. 計算例（デフォルト設定）:
   | attempt | 基本delay | Jitter範囲 |
   | ------- | --------- | ------------------|
   | 0 | 1000ms | 800ms - 1200ms |
   | 1 | 2000ms | 1600ms - 2400ms |
   | 2 | 4000ms | 3200ms - 4800ms |
4. sleep()ユーティリティ関数の設計（AbortSignal対応）

**期待される成果物**:

- バックオフアルゴリズム設計書（`outputs/phase-2/backoff-algorithm-design.md`）

### Task 4: executeWithRetry()メソッドの設計

**目的**: SkillExecutorのexecute()をラップするリトライメソッドを設計する。

**手順**:

1. メソッドシグネチャ:
   ```typescript
   private async executeWithRetry(
     executionId: string,
     request: SkillExecutionRequest,
     abortSignal: AbortSignal
   ): Promise<void>
   ```
2. フロー設計:
   ```
   executeWithRetry(request)
   ├── attempt = 0
   ├── while (attempt <= maxRetries)
   │   ├── try: executeCore(request) → 成功なら return
   │   ├── catch(error)
   │   │   ├── isRetryableError(error) → false → throw error
   │   │   ├── attempt >= maxRetries → throw error（リトライ上限）
   │   │   ├── abortSignal.aborted → throw AbortError
   │   │   ├── sendRetryStreamMessage(attempt, delay, error)
   │   │   ├── await sleep(delay, abortSignal)
   │   │   └── attempt++
   └── throw error（到達不能だが型安全のため）
   ```
3. 既存execute()メソッドからの呼び出し方法:
   - execute()内のquery() API呼び出し部分をexecuteCore()として抽出
   - execute()からexecuteWithRetry()を呼び出す
4. abort()との連携:
   - AbortSignalをsleep()に渡し、abort時に即座にsleepを中断
   - リトライループ内でabortSignal.abortedを毎回チェック

**期待される成果物**:

- executeWithRetry設計書（`outputs/phase-2/execute-with-retry-design.md`）

### Task 5: ストリーミングイベント `skill:retry` の設計

**目的**: リトライ状態をUI側に通知するためのストリーミングイベントを設計する。

**手順**:

1. SkillStreamMessageTypeに'retry'を追加:
   ```typescript
   type SkillStreamMessageType =
     | "assistant"
     | "tool_use"
     | "tool_result"
     | "status"
     | "error"
     | "retry";
   ```
2. RetryMessageContent型を設計:
   ```typescript
   interface RetryMessageContent {
     type: "retry";
     attempt: number;
     maxRetries: number;
     delayMs: number;
     errorType: RetryableErrorType;
     errorMessage: string;
   }
   ```
3. SkillStreamMessage discriminated unionにretryケースを追加
4. IPC channel `skill:stream`経由での通知フロー確認
5. useSkillExecution hookでの受信処理の設計（型定義のみ、UI実装はスコープ外）

**期待される成果物**:

- ストリーミングイベント設計書（`outputs/phase-2/streaming-event-design.md`）

---

## 参照資料

| 参照資料               | パス                                                                  | 用途             |
| ---------------------- | --------------------------------------------------------------------- | ---------------- |
| Phase 1成果物          | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-1/`    | 要件参照         |
| SkillExecutor実装      | `apps/desktop/src/main/services/skill/SkillExecutor.ts`               | 既存API確認      |
| skill型定義            | `packages/shared/src/types/skill.ts`                                  | 型構成確認       |
| エラーハンドリング仕様 | `.claude/skills/aiworkflow-requirements/references/error-handling.md` | リトライ戦略     |
| AWSバックオフ記事      | AWS Architecture Blog: Exponential Backoff And Jitter                 | アルゴリズム参考 |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`                          | Phase 1 成果物   |

---

## 多角的観点チェック

### 必須確認観点

| 観点               | 確認内容                                            |
| ------------------ | --------------------------------------------------- |
| エラーハンドリング | 全エラーパスでリトライ/非リトライが正しく分岐するか |
| テスタビリティ     | sleep/random等の副作用を注入可能な設計か            |
| セキュリティ       | リトライログにsensitive情報が含まれないか           |

### Electron固有観点

| 層           | 確認内容                                                           |
| ------------ | ------------------------------------------------------------------ |
| Main Process | リトライのsleep中もイベントループをブロックしないか                |
| IPC通信      | retryストリーミングイベントの型が既存のIPC通信パターンと整合するか |
| Preload      | window.skillAPIに変更が不要であることを確認                        |

---

## 統合テスト連携

SkillExecutor既存テストとの統合設計:

- 既存テスト（SkillExecutor.test.ts、.permission.test.ts、.integration.test.ts）との共存
- モック設計: query() APIのモックでエラー→成功のシーケンスを再現
- AbortController連携テストの統合設計

---

## 成果物

| 成果物                       | パス                                             | 種別     |
| ---------------------------- | ------------------------------------------------ | -------- |
| RetryConfig型設計書          | `outputs/phase-2/retry-config-design.md`         | document |
| エラー判定ロジック設計書     | `outputs/phase-2/error-classification-design.md` | document |
| バックオフアルゴリズム設計書 | `outputs/phase-2/backoff-algorithm-design.md`    | document |
| executeWithRetry設計書       | `outputs/phase-2/execute-with-retry-design.md`   | document |
| ストリーミングイベント設計書 | `outputs/phase-2/streaming-event-design.md`      | document |

---

## 完了条件

- [ ] RetryConfig型が全フィールド・デフォルト値・JSDocコメント付きで定義されている
- [ ] isRetryableError()の判定ロジックが全エラーパターンをカバーしている
- [ ] calculateBackoffDelay()のアルゴリズムが計算例付きで文書化されている
- [ ] executeWithRetry()のフローが分岐条件・エラーパス含めて設計されている
- [ ] skill:retryストリーミングイベントの型がdiscriminated unionに統合されている
- [ ] 本Phase内の全タスク（Task 1-5）を100%実行完了

---

## Phase完了時必須アクション

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/skillexecutor-retry-mechanism \
  --phase 2 \
  --artifacts "outputs/phase-2/retry-config-design.md:RetryConfig型設計書"
```

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skillexecutor-retry-mechanism --phase 2
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

→ [Phase 3: 設計レビューゲート](./phase-3-design-review.md)
