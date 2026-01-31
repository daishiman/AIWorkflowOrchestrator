# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目      | 内容                          |
| --------- | ----------------------------- |
| Phase     | 4                             |
| Phase名   | テスト作成                    |
| カテゴリ  | TDD-Red                       |
| 機能名    | skillexecutor-retry-mechanism |
| 作成日    | 2026-01-30                    |
| 前提Phase | Phase 3（設計レビューゲート） |
| 後続Phase | Phase 5（実装）               |

## 目的

TDD Red状態のテストを先行作成する。全テストがFail状態であることを確認する。

---

## 実行タスク

### Task 1: テストファイル作成・基本構造

**目的**: リトライテストファイルのスケルトンを作成する。

**手順**:

1. `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts`を作成する
2. 以下のdescribeブロックを定義する:
   - `describe('SkillExecutor Retry Mechanism')`
     - `describe('isRetryableError')`
     - `describe('calculateBackoffDelay')`
     - `describe('executeWithRetry')`
     - `describe('retry streaming events')`
     - `describe('abort during retry')`
3. 既存テストファイル（SkillExecutor.test.ts）のモック設定パターンを参考にする
4. Vitest imports (`describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach`)を追加する
5. 共通のモック設定（SkillExecutor初期化、IPC mock、query() API mock）を`beforeEach`に定義する

**期待される成果物**:

- テストファイルスケルトン（`apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts`）

### Task 2: isRetryableError テスト作成

**目的**: エラー分類ロジックのテストを作成する（全テストFail）。

**手順**:

1. 以下のテストケースを作成する:
   - ネットワークエラー（ECONNRESET）→ `{ retryable: true, errorType: 'network' }`
   - ネットワークエラー（ETIMEDOUT）→ `{ retryable: true, errorType: 'network' }`
   - ネットワークエラー（ECONNREFUSED）→ `{ retryable: true, errorType: 'network' }`
   - ネットワークエラー（ENOTFOUND）→ `{ retryable: true, errorType: 'network' }`
   - ネットワークエラー（EAI_AGAIN）→ `{ retryable: true, errorType: 'network' }`
   - HTTP 429 → `{ retryable: true, errorType: 'rate_limit', retryAfterMs: number }`
   - HTTP 429 with Retry-After header → retryAfterMsがヘッダー値を反映
   - HTTP 500 → `{ retryable: true, errorType: 'server_error' }`
   - HTTP 502 → `{ retryable: true, errorType: 'server_error' }`
   - HTTP 503 → `{ retryable: true, errorType: 'server_error' }`
   - HTTP 504 → `{ retryable: true, errorType: 'server_error' }`
   - タイムアウトエラー → `{ retryable: true, errorType: 'timeout' }`
   - HTTP 400 → `{ retryable: false }`
   - HTTP 401 → `{ retryable: false }`
   - HTTP 403 → `{ retryable: false }`
   - AbortError → `{ retryable: false }`
   - 不明なエラー → `{ retryable: false }`

**期待される成果物**:

- isRetryableErrorテスト（17ケース、全Fail）

### Task 3: calculateBackoffDelay テスト作成

**目的**: バックオフ計算ロジックのテストを作成する（全テストFail）。

**手順**:

1. 以下のテストケースを作成する:
   - attempt=0のデフォルト設定 → 800ms-1200ms の範囲内
   - attempt=1のデフォルト設定 → 1600ms-2400ms の範囲内
   - attempt=2のデフォルト設定 → 3200ms-4800ms の範囲内
   - maxDelayMsを超えない → maxDelayMs以下であること
   - Retry-Afterヘッダー優先 → retryAfterMsが返される
   - Retry-AfterがbaseDelayMs未満の場合 → baseDelayMsが使用される
   - jitterFactor=0 → Jitterなし（固定値）
   - カスタムRetryConfig → 設定値に基づく計算

**期待される成果物**:

- calculateBackoffDelayテスト（8ケース、全Fail）

### Task 4: executeWithRetry テスト作成

**目的**: リトライラッパーの統合テストを作成する（全テストFail）。

**手順**:

1. 以下のテストケースを作成する:
   - 初回成功 → リトライなしで完了
   - 1回失敗→2回目成功 → 1回リトライで完了
   - 2回失敗→3回目成功 → 2回リトライで完了
   - maxRetries回失敗 → エラーとして終了
   - 非リトライ対象エラー → 即座にエラー終了
   - abort()呼び出し中のリトライ → 即座に中止
   - リトライ中にabort() → sleep中断して終了
   - リトライごとにskill:retryイベントが送信される
   - 最終エラーに全リトライ試行情報が含まれる
2. query() APIのモックで連続エラー→成功のシーケンスを設定する

**期待される成果物**:

- executeWithRetryテスト（9ケース、全Fail）

### Task 5: retryストリーミングイベントテスト作成

**目的**: リトライ状態通知のテストを作成する（全テストFail）。

**手順**:

1. 以下のテストケースを作成する:
   - retryイベントにattempt番号が含まれる
   - retryイベントにmaxRetriesが含まれる
   - retryイベントにdelayMsが含まれる
   - retryイベントにerrorTypeが含まれる
   - retryイベントにerrorMessageが含まれる
   - 複数リトライ時にイベントが順序通り送信される
   - IPC channel `skill:stream`経由で送信される

**期待される成果物**:

- ストリーミングイベントテスト（7ケース、全Fail）

---

## 参照資料

| 参照資料                | パス                                                                              | 用途           |
| ----------------------- | --------------------------------------------------------------------------------- | -------------- |
| Phase 2成果物           | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-2/`                | 設計参照       |
| 既存SkillExecutorテスト | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts`            | モックパターン |
| 既存Permissionテスト    | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.permission.test.ts` | テスト構造参考 |
| skill型定義             | `packages/shared/src/types/skill.ts`                                              | 型参照         |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| RetryConfig型設計書 | `outputs/phase-2/retry-config-design.md` | Phase 2 成果物 |
| ゲート判定結果 | `outputs/phase-3/gate-judgment.md` | Phase 3 成果物 |

---

## TDDフェーズ設定

| 項目           | 値                                                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| TDD状態        | Red                                                                                                                    |
| テストコマンド | `pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts` |

---

## 統合テスト連携

リトライ→正常完了の統合テストケースを作成:

- query() APIモックで429→200のシーケンスを再現
- query() APIモックでECONNRESET→成功のシーケンスを再現
- ストリーミングメッセージの受信順序を検証

---

## 成果物

| 成果物                 | パス                                                                         | 種別 |
| ---------------------- | ---------------------------------------------------------------------------- | ---- |
| リトライテストファイル | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts` | test |

---

## 完了条件

- [ ] テストファイルが作成されている
- [ ] isRetryableErrorテスト: 17ケース以上
- [ ] calculateBackoffDelayテスト: 8ケース以上
- [ ] executeWithRetryテスト: 9ケース以上
- [ ] retryストリーミングイベントテスト: 7ケース以上
- [ ] 合計41ケース以上のテストが定義されている
- [ ] 全テストがFail状態（Red）である
- [ ] 既存テスト（SkillExecutor.test.ts等）に影響を与えていない
- [ ] 本Phase内の全タスク（Task 1-5）を100%実行完了

---

## Phase完了時必須アクション

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/skillexecutor-retry-mechanism \
  --phase 4 \
  --artifacts "apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts:リトライテストファイル"
```

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skillexecutor-retry-mechanism --phase 4
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

→ [Phase 5: 実装](./phase-5-implementation.md)
