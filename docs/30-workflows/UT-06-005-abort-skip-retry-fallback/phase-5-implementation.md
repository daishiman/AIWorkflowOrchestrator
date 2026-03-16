# Phase 5: 実装

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 5                                   |
| 機能名 | UT-06-005-abort-skip-retry-fallback |
| 作成日 | 2026-03-16                          |

## 目的

Phase 4 で作成した RED 状態のテストを GREEN に転換させるため、SkillExecutor に abort/skip/retry/timeout フォールバックフローを実装する。

## 実行タスク

- タスク1: 型定義の追加（AbortReason, PermissionFlowContext, PermissionFlowResult）
- タスク2: SkillExecutor への retryCounters Map 追加と handlePermissionResponse 実装
- タスク3: executeAbortFlow メソッド実装（4ステップ）
- タスク4: executeSkipFlow メソッド実装
- タスク5: PermissionStore.revokeSessionEntries 実装
- タスク6: IPC 通知実装（EXECUTION_ABORT, EXECUTION_SKIP, PERMISSION_RETRY）
- タスク7: テスト GREEN 確認

## 参照資料

| 資料名             | パス                                                                            | 説明               |
| ------------------ | ------------------------------------------------------------------------------- | ------------------ |
| Phase 1 成果物     | `outputs/phase-1/requirements.md`                                               | 要件定義書         |
| P50チェック        | `outputs/phase-1/p50-check-result.md`                                           | 既実装調査結果     |
| Phase 2 成果物     | `outputs/phase-2/design.md`                                                     | 設計書             |
| Phase 4 成果物     | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.fallback.test.ts` | RED テスト         |
| SkillExecutor      | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                         | 対象実装ファイル   |
| PermissionResolver | `apps/desktop/src/main/services/skill/PermissionResolver.ts`                    | 権限確認リクエスト |
| PermissionStore    | `apps/desktop/src/main/services/skill/PermissionStore.ts`                       | 権限永続化ストア   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                        | パス                                                                                         | 内容                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| セキュリティ（スキル実行）      | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`              | fail-closed原則                                                    |
| Agent SDK Skillインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`            | Permission関連型定義                                               |
| Agent SDK Skill詳細             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-details.md`    | SkillPermissionResponse詳細定義                                    |
| Agent SDK Executor（コア）      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-core.md`    | ExecutionState列挙型、RetryConfig、SkillExecutionErrorCode、DI構成 |
| Agent SDK Executor詳細          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | PermissionResolver完全仕様、DEFAULT_TIMEOUT_MS=300000              |
| 実装パターン                    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`  | DI/状態遷移パターン                                                |
| エラーハンドリング              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                        | エラーコード体系                                                   |
| エラーハンドリング（コア）      | `.claude/skills/aiworkflow-requirements/references/error-handling-core.md`                   | エラーコード範囲（1000-5999）、ERR_2002 PERMISSION_DENIED          |
| エラーハンドリング（詳細）      | `.claude/skills/aiworkflow-requirements/references/error-handling-details.md`                | SkillExecutor実行エラーコード（PERMISSION_DENIED, TIMEOUT, ABORT） |
| セキュリティ（スキルIPC）       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                    | IPC通信セキュリティ                                                |

## 実行手順

### ステップ1: 型定義の追加（タスク1）

**P32注意**: 型定義は `packages/shared/src` と `apps/desktop/src/preload/types.ts` の二箇所同時更新が必要。

#### 1-0: SkillPermissionResponse への skip フィールド追加

既存の `SkillPermissionResponse` 型に `skip?: boolean` フィールドを追加する。定義場所は `interfaces-agent-sdk-skill-details.md` を参照して特定すること。

```typescript
// 既存の SkillPermissionResponse に追加
export interface SkillPermissionResponse {
  approved: boolean;
  skip?: boolean; // 新規追加: true の場合はツール実行をスキップ
  // ... 既存フィールド
}
```

#### 1-1: 共有型定義の追加

**ファイル**: `packages/shared/src/skill/types.ts`（既存ファイルに追加、または新規作成）

```typescript
/** abort 理由の列挙型 */
export type AbortReason = "denied" | "timeout" | "max_retries" | "unknown";

/** Permission フローコンテキスト */
export interface PermissionFlowContext {
  executionId: string;
  requestId: string;
  toolName: string;
  retryCount: number;
  maxRetries: number; // デフォルト: 3
  timeoutMs: number; // デフォルト: 300000
}

/** Permission フロー判定結果 */
export interface PermissionFlowResult {
  action: "approved" | "skip" | "retry" | "abort";
  reason?: AbortReason;
  retryCount?: number;
}
```

#### 1-2: Preload 型定義の更新（必要に応じて）

**ファイル**: `apps/desktop/src/preload/types.ts`

IPC ペイロード型を追加（abort/skip/retry 通知で Renderer が受け取る型）。

### ステップ2: retryCounters と handlePermissionResponse（タスク2）

**ファイル**: `apps/desktop/src/main/services/skill/SkillExecutor.ts`

```typescript
// クラスフィールドに追加
private retryCounters: Map<string, number> = new Map();

/**
 * Permission応答を処理し、適切なフローに分岐する
 */
async handlePermissionResponse(
  response: SkillPermissionResponse,
  context: PermissionFlowContext,
): Promise<PermissionFlowResult> {
  // 1. approved=true → approved
  if (response.approved) {
    return { action: "approved" };
  }

  // 2. approved=false, skip=true → skip
  if (response.skip) {
    await this.executeSkipFlow(context.executionId, context.toolName);
    return { action: "skip" };
  }

  // 3. approved=false, skip=false → retry or abort
  const currentRetry = this.retryCounters.get(context.requestId) ?? 0;
  const nextRetry = currentRetry + 1;
  this.retryCounters.set(context.requestId, nextRetry);

  if (nextRetry >= context.maxRetries) {
    await this.executeAbortFlow("max_retries", context.executionId);
    return { action: "abort", reason: "max_retries", retryCount: nextRetry };
  }

  // IPC retry 通知
  // send(SKILL_CHANNELS.PERMISSION_RETRY, { ... })
  return { action: "retry", retryCount: nextRetry };
}
```

### ステップ3: executeAbortFlow 実装（タスク3）

**ファイル**: `apps/desktop/src/main/services/skill/SkillExecutor.ts`

abort 4ステップを実装する:

```typescript
/**
 * abort フロー4ステップを実行（冪等性保証）
 */
async executeAbortFlow(reason: AbortReason, executionId: string): Promise<void> {
  // 冪等性ガード: 既に aborted なら何もしない
  if (this.getExecutionState() === "aborted") {
    return;
  }

  try {
    // Step 1: cancelAll - 全pending permissionリクエストをキャンセル
    this.permissionResolver.cancelAll(`abort:${reason}`);
  } catch (error) {
    // fail-closed: cancelAll のエラーでも後続ステップは実行する
    log.error("cancelAll failed during abort", { error, executionId });
  }

  try {
    // Step 2: revokeSessionEntries - セッション内の一時許可を取り消し
    const revokedCount = this.permissionStore.revokeSessionEntries(executionId);

    // Step 3: log - abort イベントをログに記録
    log.warn("Skill execution aborted", { reason, executionId, revokedCount });

    // Step 4: IPC - Renderer に abort 通知を送信
    // send(SKILL_CHANNELS.EXECUTION_ABORT, { executionId, reason })
  } catch (error) {
    log.error("abort flow error", { error, executionId });
  }

  // 状態遷移
  this.setState("aborted");

  // retryCounters クリア
  this.retryCounters.clear();
}
```

### ステップ4: executeSkipFlow 実装（タスク4）

**ファイル**: `apps/desktop/src/main/services/skill/SkillExecutor.ts`

```typescript
/**
 * skip フローを実行（ExecutionState は running のまま維持）
 */
async executeSkipFlow(executionId: string, toolName: string): Promise<void> {
  // P42準拠: 文字列引数の .trim() バリデーション
  if (typeof executionId !== "string" || executionId.trim() === "") {
    throw new Error("executionId must be a non-empty string");
  }
  if (typeof toolName !== "string" || toolName.trim() === "") {
    throw new Error("toolName must be a non-empty string");
  }

  // ログ記録
  log.info("Skill tool execution skipped", { executionId, toolName });

  // IPC skip 通知
  // send(SKILL_CHANNELS.EXECUTION_SKIP, { executionId, toolName, message: `Tool ${toolName} skipped` })
}
```

### ステップ5: PermissionStore.revokeSessionEntries 実装（タスク5）

**ファイル**: `apps/desktop/src/main/services/skill/PermissionStore.ts`

```typescript
/**
 * セッション内の一時許可エントリを一括取り消し
 * @param sessionId - セッションID
 * @returns 取り消されたエントリ数
 */
revokeSessionEntries(sessionId: string): number {
  // P42準拠: 文字列引数の .trim() バリデーション
  if (typeof sessionId !== "string" || sessionId.trim() === "") {
    return 0;
  }

  // セッションIDに紐づくエントリを検索・削除
  let revokedCount = 0;
  // 実装は既存のストア構造に依存
  // entries の中から sessionId に一致するものを削除
  return revokedCount;
}
```

### ステップ6: IPC 通知実装（タスク6）

**使用チャンネル**:

| チャンネル                        | 方向            | ペイロード                                           |
| --------------------------------- | --------------- | ---------------------------------------------------- |
| `SKILL_CHANNELS.EXECUTION_ABORT`  | Main → Renderer | `{ executionId, reason: AbortReason }`               |
| `SKILL_CHANNELS.EXECUTION_SKIP`   | Main → Renderer | `{ executionId, toolName, message }`                 |
| `SKILL_CHANNELS.PERMISSION_RETRY` | Main → Renderer | `{ executionId, requestId, retryCount, maxRetries }` |

IPC チャンネル定数が未定義の場合は、既存の `SKILL_CHANNELS` オブジェクトに追加する。

### ステップ7: テスト GREEN 確認（タスク7）

```bash
# 全テストを実行して GREEN を確認
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillExecutor.fallback.test.ts

# 既存テストが破壊されていないことを確認（AC-12）
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillExecutor.permission.test.ts
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillExecutor.retry.test.ts
```

## 統合テスト連携【必須】

Phase 5 実装で SkillExecutor-PermissionResolver-PermissionStore 間の接続を確立し、統合テスト観点での動作を検証する。

| 統合ポイント                    | 実装内容                         | 検証方法                     |
| ------------------------------- | -------------------------------- | ---------------------------- |
| SE → PR: cancelAll              | abort Step 1 で呼び出し          | モック検証 + 引数検証        |
| SE → PS: revokeSessionEntries   | abort Step 2 で呼び出し          | 戻り値（revokedCount）の検証 |
| SE → IPC: abort/skip/retry 通知 | 各フローの最終ステップで送信     | IPC send モック検証          |
| SE → 状態遷移: aborted/running  | abort → aborted, skip → running  | getExecutionState() の検証   |
| retry カウンタ管理              | retryCounters Map の増分・クリア | retryCount の追跡検証        |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                 | 仕様参照先                                                         |
| ------------------ | ---------------------------------------- | ------------------------------------------------------------------ |
| セキュリティ       | fail-closed 原則の実装が必要             | `aiworkflow-requirements: security-skill-execution.md`             |
| エラーハンドリング | abort 各ステップのエラー耐性が必要       | `aiworkflow-requirements: error-handling.md`                       |
| アーキテクチャ     | DI パターンでの依存注入が必要            | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| IPC 契約           | チャンネル名は SKILL_CHANNELS 定数で管理 | `.claude/rules/04-electron-security.md`                            |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                                            | 仕様参照先                                                       |
| -------------------- | --------------------------------------------------- | ---------------------------------------------------------------- |
| バックエンド（Main） | abort/skip/retry/timeout フローの Main Process 実装 | `aiworkflow-requirements: security-skill-execution.md`           |
| IPC通信              | abort/skip/retry 通知の Main → Renderer IPC 実装    | `aiworkflow-requirements: security-skill-ipc.md`                 |
| 型定義               | shared + preload 二箇所同時更新（P32準拠）          | `aiworkflow-requirements: interfaces-agent-sdk-skill-details.md` |

**既知の落とし穴チェック**:

| Pitfall | 内容                                | 対策                                   |
| ------- | ----------------------------------- | -------------------------------------- |
| P32     | 型定義の二箇所同時更新              | shared + preload の両方を更新          |
| P42     | 文字列引数の .trim() バリデーション | 全文字列引数に3段バリデーション適用    |
| P5      | リスナー二重登録                    | IPC ハンドラの登録状態を確認           |
| P34     | 遅延初期化の DI パターン            | PermissionStore の注入タイミングを確認 |

## 成果物

| 成果物               | パス                                                      | 説明                      |
| -------------------- | --------------------------------------------------------- | ------------------------- |
| 型定義               | `packages/shared/src/skill/types.ts`（追加分）            | AbortReason 等の型定義    |
| SkillExecutor 実装   | `apps/desktop/src/main/services/skill/SkillExecutor.ts`   | fallback フロー実装       |
| PermissionStore 実装 | `apps/desktop/src/main/services/skill/PermissionStore.ts` | revokeSessionEntries 追加 |
| IPC チャンネル定義   | 既存の SKILL_CHANNELS 定義ファイル                        | 新規チャンネル追加        |
| GREEN 確認ログ       | `outputs/phase-5/green-state-confirmation.md`             | テスト GREEN 確認結果     |

## 完了条件

- [ ] 型定義（AbortReason, PermissionFlowContext, PermissionFlowResult）が追加されている
- [ ] P32 準拠: shared と preload の両方の型定義が更新されている
- [ ] handlePermissionResponse が実装されている
- [ ] executeAbortFlow が4ステップで実装されている（冪等性保証付き）
- [ ] executeSkipFlow が実装されている
- [ ] PermissionStore.revokeSessionEntries が実装されている
- [ ] IPC 通知（EXECUTION_ABORT, EXECUTION_SKIP, PERMISSION_RETRY）が実装されている
- [ ] P42 準拠: 全文字列引数に .trim() バリデーションが適用されている
- [ ] Phase 4 のテストが全て GREEN（PASS）になっている
- [ ] 既存テスト（permission.test.ts, retry.test.ts）が全て PASS している（AC-12）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 2 設計書 + システム仕様）
2. 型定義の追加（タスク1）
3. handlePermissionResponse 実装（タスク2）
4. executeAbortFlow 実装（タスク3）
5. executeSkipFlow 実装（タスク4）
6. PermissionStore.revokeSessionEntries 実装（タスク5）
7. IPC 通知実装（タスク6）
8. テスト GREEN 確認（タスク7）
9. 成果物の作成・配置
10. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-06-005-abort-skip-retry-fallback --phase 5
```

## 次のPhase

Phase 6: テスト拡充 - カバレッジ不足箇所のテストを追加する。
