# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 4                                   |
| 機能名 | UT-06-005-abort-skip-retry-fallback |
| 作成日 | 2026-03-16                          |

## 目的

abort/skip/retry/timeout の各フォールバックフローに対するテストケースをテストファーストで設計・作成する。Phase 5 の実装前にテストが RED 状態であることを確認し、TDD サイクルの起点とする。

## 実行タスク

- タスク1: abort フローテストの作成（AC-01, AC-02, AC-03, AC-11）
- タスク2: skip フローテストの作成（AC-04, AC-05, AC-11）
- タスク3: retry フローテストの作成（AC-06, AC-07, AC-08, AC-11）
- タスク4: timeout フローテストの作成（AC-09, AC-10, AC-11）
- タスク5: fail-closed テストの作成（NFR-1）
- タスク6: 既存テストの PASS 確認（AC-12）

## 参照資料

| 資料名           | パス                                                                              | 説明                 |
| ---------------- | --------------------------------------------------------------------------------- | -------------------- |
| Phase 1 成果物   | `outputs/phase-1/requirements.md`                                                 | 要件定義書           |
| P50チェック      | `outputs/phase-1/p50-check-result.md`                                             | 既実装調査結果       |
| Phase 2 成果物   | `outputs/phase-2/design.md`                                                       | 設計書               |
| Phase 3 レビュー | `outputs/phase-3/design-review-result.md`                                         | 設計レビュー結果     |
| Phase 3 成果物   | `outputs/phase-3/gate-decision.md`                                                | ゲート判定結果       |
| 既存permテスト   | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.permission.test.ts` | 既存permissionテスト |
| 既存retryテスト  | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts`      | 既存retryテスト      |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                        | パス                                                                                         | 内容                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| コンポーネントテスト            | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`            | テスト設計パターン                                                 |
| 品質要件                        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                  | カバレッジ基準・TDD方針                                            |
| セキュリティ（スキル実行）      | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`              | fail-closed原則                                                    |
| 実装パターン                    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`  | DI/状態遷移パターン                                                |
| エラーハンドリング              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                        | エラーコード体系                                                   |
| エラーハンドリング（コア）      | `.claude/skills/aiworkflow-requirements/references/error-handling-core.md`                   | エラーコード範囲（1000-5999）、ERR_2002 PERMISSION_DENIED          |
| エラーハンドリング（詳細）      | `.claude/skills/aiworkflow-requirements/references/error-handling-details.md`                | SkillExecutor実行エラーコード（PERMISSION_DENIED, TIMEOUT, ABORT） |
| Agent SDK Skillインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`            | SkillPermissionResponse型定義                                      |
| Agent SDK Skill詳細             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-details.md`    | SkillPermissionResponse詳細定義                                    |
| Agent SDK Executor（コア）      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-core.md`    | ExecutionState列挙型、RetryConfig、SkillExecutionErrorCode、DI構成 |
| Agent SDK Executor詳細          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | PermissionResolver完全仕様、DEFAULT_TIMEOUT_MS=300000              |

## 実行手順

### ステップ0: テスト環境の確認

```bash
# 既存テストが全て PASS することを確認（P40準拠: 対象パッケージディレクトリから実行）
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillExecutor.permission.test.ts
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillExecutor.retry.test.ts
```

### ステップ1: テストファイルの作成

**テストファイル**: `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.fallback.test.ts`（新規作成）

### ステップ2: モック構造の設計

Phase 2 設計のインターフェースに基づき、以下のモック構造を定義する:

```typescript
// モックオブジェクト
const mockPermissionResolver = {
  waitForResponse: vi.fn(),
  resolveRequest: vi.fn(),
  cancelAll: vi.fn(),
};

const mockPermissionStore = {
  revokeSessionEntries: vi.fn(),
  // 既存メソッドのモック
};

const mockIpcSender = {
  send: vi.fn(),
};

const mockLogger = {
  warn: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
};
```

**P21注意**: 既存テストファイル（permission.test.ts, retry.test.ts）に新しいモックを追加する必要がある場合は、影響範囲を事前に調査する。

```bash
grep -rn "SkillExecutor" apps/desktop/src/main/services/skill/__tests__/*.test.ts | head -20
```

### ステップ3: テストケース実装

#### タスク1: abort フローテスト（AC-01, AC-02, AC-03, AC-11）

| #   | テストケース                                                                              | 期待結果                                                        | 対応AC |
| --- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------ |
| 1-1 | Permission拒否（retryCount >= 3）時に cancelAll が呼ばれる                                | `mockPermissionResolver.cancelAll` が1回呼ばれる                | AC-01  |
| 1-2 | abort フローで cancelAll → revokeSessionEntries → log → IPC の順序で実行される            | 呼び出し順序が厳密に検証される（`vi.fn()` の callOrder で検証） | AC-01  |
| 1-3 | abort 後に ExecutionState が `aborted` に遷移する                                         | `getExecutionState()` が `"aborted"` を返す                     | AC-02  |
| 1-4 | 二重 abort でエラーが発生しない（冪等性）                                                 | 2回目の `executeAbortFlow` がエラーを投げない                   | AC-03  |
| 1-5 | 二重 abort で cancelAll/revokeSessionEntries が2回目は呼ばれない                          | 2回目の呼び出しでモックが追加呼出されない                       | AC-03  |
| 1-6 | abort イベントがログに記録される                                                          | `mockLogger.warn` が abort 情報付きで呼ばれる                   | AC-11  |
| 1-7 | abort 通知が IPC 経由で Renderer に送信される                                             | `SKILL_CHANNELS.EXECUTION_ABORT` で send される                 | AC-01  |
| 1-8 | abort の AbortReason が "denied" / "timeout" / "max_retries" / "unknown" のいずれかである | 各理由で正しくログ・IPC に含まれる                              | AC-01  |

#### タスク2: skip フローテスト（AC-04, AC-05, AC-11）

| #   | テストケース                                                    | 期待結果                                       | 対応AC |
| --- | --------------------------------------------------------------- | ---------------------------------------------- | ------ |
| 2-1 | `{ approved: false, skip: true }` で executeSkipFlow が呼ばれる | `executeSkipFlow` が1回呼ばれる                | AC-04  |
| 2-2 | skip 後に後続のツール実行が継続する                             | 次のツール実行が開始される（モック検証）       | AC-04  |
| 2-3 | skip 後に ExecutionState が `running` のまま維持される          | `getExecutionState()` が `"running"` を返す    | AC-05  |
| 2-4 | skip イベントがログに記録される                                 | `mockLogger.info` が skip 情報付きで呼ばれる   | AC-11  |
| 2-5 | skip 通知が IPC 経由で Renderer に送信される                    | `SKILL_CHANNELS.EXECUTION_SKIP` で send される | AC-04  |

#### タスク3: retry フローテスト（AC-06, AC-07, AC-08, AC-11）

| #   | テストケース                                             | 期待結果                                                   | 対応AC |
| --- | -------------------------------------------------------- | ---------------------------------------------------------- | ------ |
| 3-1 | Permission拒否（skip=false）時にリトライが発生する       | `handlePermissionResponse` が `{ action: "retry" }` を返す | AC-06  |
| 3-2 | リトライ時に retryCount がインクリメントされる           | retryCount が 0 → 1 → 2 と増加する                         | AC-06  |
| 3-3 | リトライは最大3回で打ち切られる（retryCount=3 で abort） | 4回目の呼び出しで `{ action: "abort" }` が返る             | AC-07  |
| 3-4 | 3回目の失敗で abort フロー（executeAbortFlow）に遷移する | `executeAbortFlow("max_retries", ...)` が呼ばれる          | AC-08  |
| 3-5 | retry 通知が IPC 経由で Renderer に送信される            | `SKILL_CHANNELS.PERMISSION_RETRY` で send される           | AC-06  |
| 3-6 | retry 通知に retryCount と maxRetries が含まれる         | ペイロードに `{ retryCount, maxRetries: 3 }` が含まれる    | AC-06  |
| 3-7 | retry イベントがログに記録される                         | `mockLogger.info` が retry 情報付きで呼ばれる              | AC-11  |

#### タスク4: timeout フローテスト（AC-09, AC-10, AC-11）

**P13注意**: タイマーテストでは `advanceTimersByTime` を使用する。`runAllTimers` は無限ループの原因になるため禁止。

| #   | テストケース                                              | 期待結果                                        | 対応AC |
| --- | --------------------------------------------------------- | ----------------------------------------------- | ------ |
| 4-1 | 300000ms 経過後に abort フローに遷移する                  | `executeAbortFlow("timeout", ...)` が呼ばれる   | AC-09  |
| 4-2 | timeout 時に retry を経由しない                           | retryCount が 0 のまま abort に遷移する         | AC-09  |
| 4-3 | timeout abort 後に ExecutionState が `aborted` に遷移する | `getExecutionState()` が `"aborted"` を返す     | AC-10  |
| 4-4 | timeout イベントがログに記録される                        | `mockLogger.warn` が timeout 情報付きで呼ばれる | AC-11  |

```typescript
// P13準拠: タイマーテスト
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it("should abort after 300000ms timeout", async () => {
  // タイムアウトをトリガー
  vi.advanceTimersByTime(300000);
  // abort フローが実行されたことを検証
});
```

#### タスク5: fail-closed テスト（NFR-1）

| #   | テストケース                                        | 期待結果                                      | 対応NFR |
| --- | --------------------------------------------------- | --------------------------------------------- | ------- |
| 5-1 | 不明なエラー発生時に abort に遷移する               | `executeAbortFlow("unknown", ...)` が呼ばれる | NFR-1   |
| 5-2 | cancelAll がエラーを投げた場合でも abort が完了する | 後続ステップ（log, IPC）が実行される          | NFR-1   |

#### タスク6: 既存テスト PASS 確認（AC-12）

```bash
# 新規テストと既存テストの両方を実行
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillExecutor.permission.test.ts
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillExecutor.retry.test.ts
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillExecutor.fallback.test.ts
```

### ステップ4: RED 状態の確認

全テストが RED 状態（FAIL）であることを確認する。Phase 5 の実装により GREEN に転換させる。

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillExecutor.fallback.test.ts 2>&1 | tail -20
```

## 統合テスト連携【必須】

abort/skip/retry/timeout の各フローについて、SkillExecutor-PermissionResolver-PermissionStore 間の統合テストシナリオを設計する。

| 統合テストシナリオ   | テストケース                                      | 検証ポイント                                      |
| -------------------- | ------------------------------------------------- | ------------------------------------------------- |
| abort 統合           | SE → PR.cancelAll → PS.revokeSessionEntries → IPC | 4ステップの順序と各コンポーネント間のデータフロー |
| skip 統合            | SE → SkipFlow → 後続ツール実行継続                | skip 後に次のツールが実行されること               |
| retry → abort 統合   | SE → PR（3回拒否） → SE.executeAbortFlow          | retryCount の管理と abort 遷移の正確性            |
| timeout → abort 統合 | PR.waitForResponse timeout → SE.executeAbortFlow  | タイムアウト検出から abort 完了までのフロー       |
| 冪等性統合           | SE.executeAbortFlow × 2回                         | 二重呼び出しで副作用が1回のみ発生すること         |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                    | 仕様参照先                                             |
| ------------------ | ------------------------------------------- | ------------------------------------------------------ |
| セキュリティ       | fail-closed テスト（タスク5）が必要         | `aiworkflow-requirements: security-skill-execution.md` |
| エラーハンドリング | abort 4ステップの各段階のエラーテストが必要 | `aiworkflow-requirements: error-handling.md`           |
| テスト設計         | P9/P13/P21/P39/P40 準拠が必要               | `.claude/rules/06-known-pitfalls.md`                   |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                                      | 仕様参照先                                                         |
| -------------------- | --------------------------------------------- | ------------------------------------------------------------------ |
| バックエンド（Main） | abort/skip/retry/timeout のユニットテスト設計 | `aiworkflow-requirements: security-skill-execution.md`             |
| IPC通信              | IPC 通知のモック検証パターン設計              | `aiworkflow-requirements: architecture-implementation-patterns.md` |

**テスト環境の注意事項**:

| Pitfall | 内容                                   | 対策                                                            |
| ------- | -------------------------------------- | --------------------------------------------------------------- |
| P9      | モジュールスコープ変数のテスト間リーク | `beforeEach` で全モックをリセット                               |
| P13     | タイマーテストの無限ループ             | `advanceTimersByTime` を使用（runAllTimers禁止）                |
| P21     | DI 追加時のテストモック大規模修正      | 既存テストへの影響を事前調査                                    |
| P39     | happy-dom 環境での userEvent 非互換    | `fireEvent` を使用（Main Process テストでは該当しない場合あり） |
| P40     | テスト実行ディレクトリ依存（モノレポ） | `cd apps/desktop` してから実行                                  |

## 成果物

| 成果物               | パス                                                                            | 説明                     |
| -------------------- | ------------------------------------------------------------------------------- | ------------------------ |
| fallback テスト      | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.fallback.test.ts` | 新規テストファイル       |
| RED 状態確認ログ     | `outputs/phase-4/red-state-confirmation.md`                                     | RED 状態の確認結果       |
| 既存テスト PASS ログ | `outputs/phase-4/existing-tests-pass.md`                                        | 既存テスト PASS 確認結果 |

## 完了条件

- [ ] `SkillExecutor.fallback.test.ts` が作成されている
- [ ] タスク1〜5 の全テストケースが実装されている
- [ ] テスト間で状態を共有していない（P9 準拠: `beforeEach` でリセット）
- [ ] タイマーテストが `advanceTimersByTime` を使用している（P13 準拠）
- [ ] テストが `cd apps/desktop` から実行可能（P40 準拠）
- [ ] 新規テストが RED 状態（FAIL）であることが確認されている
- [ ] 既存テスト（permission.test.ts, retry.test.ts）が全て PASS している（AC-12）
- [ ] 既存テストファイルへのモック追加影響が評価されている（P21）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. テスト環境の確認（既存テスト PASS）
2. モック構造の設計
3. abort フローテスト作成（タスク1）
4. skip フローテスト作成（タスク2）
5. retry フローテスト作成（タスク3）
6. timeout フローテスト作成（タスク4）
7. fail-closed テスト作成（タスク5）
8. 既存テスト PASS 確認（タスク6）
9. RED 状態の確認
10. 成果物の作成・配置
11. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-06-005-abort-skip-retry-fallback --phase 4
```

## 次のPhase

Phase 5: 実装 - RED 状態のテストを GREEN に転換させる実装を行う。
