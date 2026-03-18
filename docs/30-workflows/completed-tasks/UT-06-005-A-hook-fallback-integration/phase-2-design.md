# Phase 2: 設計

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 2                                     |
| 機能名 | UT-06-005-A-hook-fallback-integration |
| 作成日 | 2026-03-17                            |

## 目的

PreToolUse Hook への `processPermissionFallback` 統合と `sendPermissionRequest` のタイムアウト機構の詳細設計を行う。アダプタパターンにより既存の FR-001〜FR-003 に影響を与えない統合設計を策定する。

## 実行タスク

- 統合シーケンス設計: PreToolUse Hook 内での processPermissionFallback 呼び出しシーケンスを設計する
- タイムアウト機構設計: sendPermissionRequest に Promise.race ベースのタイムアウト検知を設計する
- retry ループ設計: retry フォールバック時の再 Permission 要求ループの制御フローを設計する
- fail-closed 設計: フォールバック処理自体の例外時の abort 遷移フローを設計する

## 参照資料

| 資料名               | パス                                         | 説明                       |
| -------------------- | -------------------------------------------- | -------------------------- |
| Phase 1 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件の定義 |
| Phase 1 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 受け入れ条件               |
| Phase 1 スコープ     | `outputs/phase-1/scope-definition.md`        | 実装範囲                   |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                            | パス                                                                                         | 内容                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------- |
| Permission フォールバックフロー詳細 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | abort/skip/retry の分岐ロジックと型定義 |
| fail-closed セキュリティ要件        | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`              | フォールバック失敗時の安全側倒し原則    |

## 実行手順

### ステップ0: DI 境界の型配置判断

本タスクで設計する型（`PermissionTimeoutError`, `PermissionFlowContext`）の配置先を決定する。

| 条件                                 | 配置先                              | 例                                               |
| ------------------------------------ | ----------------------------------- | ------------------------------------------------ |
| DI 依存型を1つの具象クラスのみで使用 | 具象クラスファイル内に定義          | `PermissionFlowContext` → `SkillExecutor.ts`     |
| DI 依存型を複数の具象クラスで共有    | Port インターフェースと同階層に配置 | `PermissionTimeoutError` → `ports/` ディレクトリ |
| DI 依存型がレイヤー境界をまたぐ      | `packages/shared/` に配置           | Main/Renderer 両方で参照する型                   |

**本タスクでの判定:**

| 型                       | 条件                                   | 配置先                                                |
| ------------------------ | -------------------------------------- | ----------------------------------------------------- |
| `PermissionTimeoutError` | `SkillExecutor` 内のみで使用           | `SkillExecutor.ts` 内（または隣接の errors ファイル） |
| `PermissionFlowContext`  | `handlePermissionCheck` 内のローカル型 | `SkillExecutor.ts` 内                                 |

**IPC ハンドラ設計時の確認項目:**

- IPC ハンドラの依存先が Port/Interface であること（P61 DIP 準拠）
- IPC レスポンス形式を設計時点で明示的に決定する（P60 準拠）: `{ proceed: boolean, message?: string }` 形式を `handlePermissionCheck` の戻り値として使用

### concern ごとの target topology

| Concern                          | 担当クラス/メソッド                 | ファイル           |
| -------------------------------- | ----------------------------------- | ------------------ |
| Permission チェック制御フロー    | `handlePermissionCheck`             | `SkillExecutor.ts` |
| タイムアウト付き Permission 要求 | `sendPermissionRequestWithTimeout`  | `SkillExecutor.ts` |
| フォールバック分岐処理           | `processPermissionFallback`（既存） | `SkillExecutor.ts` |
| スキップ処理                     | `executeSkipFlow`（既存）           | `SkillExecutor.ts` |
| 中断処理                         | `executeAbortFlow`（既存）          | `SkillExecutor.ts` |
| タイムアウトエラー型             | `PermissionTimeoutError`            | `SkillExecutor.ts` |

### validation matrix（コマンド単位）

| コマンド                            | 入力バリデーション                                  | 出力バリデーション                       | エラー処理                      |
| ----------------------------------- | --------------------------------------------------- | ---------------------------------------- | ------------------------------- |
| `handlePermissionCheck`             | `executionId: string` 必須, `toolName: string` 必須 | `{ proceed: boolean, message?: string }` | fail-closed: abort              |
| `sendPermissionRequestWithTimeout`  | `timeoutMs > 0`                                     | `SkillPermissionResponse`                | `PermissionTimeoutError` スロー |
| `processPermissionFallback`（既存） | `response.approved === false`                       | `{ action, retryCount?, reason? }`       | fail-closed: abort              |

### ステップ1: PreToolUse Hook 統合シーケンス設計

#### 現在のフロー

```
PreToolUse Hook
  ├── FR-001: 危険コマンドチェック → block or pass
  ├── FR-002: 保護パスチェック → block or pass
  ├── FR-003: ツール実行開始通知
  └── return { proceed: true }
```

#### 統合後のフロー

```
PreToolUse Hook
  ├── FR-001: 危険コマンドチェック → block or pass
  ├── FR-002: 保護パスチェック → block or pass
  ├── FR-003: ツール実行開始通知
  ├── FR-101: Permission チェック（新規追加）
  │   ├── sendPermissionRequest(executionId, toolName, args, signal)
  │   │   ├── タイムアウト検知（Promise.race, FR-102）
  │   │   │   └── timeout → executeAbortFlow("timeout") → throw
  │   │   └── 応答取得
  │   ├── response.approved === true → continue
  │   └── response.approved === false
  │       └── processPermissionFallback(response, context)
  │           ├── action: "approved" → continue
  │           ├── action: "skip" → executeSkipFlow() → return { proceed: false, message: "skipped" }
  │           ├── action: "retry" → retry loop（retryCount < maxRetries, 最大3回）
  │           ├── action: "abort" → throw AbortError
  │           └── [max_retries] retryCount >= maxRetries → executeAbortFlow("max_retries") → throw
  └── return { proceed: true }
```

#### 設計詳細: Permission チェックの挿入位置

```typescript
// FR-003 の後に挿入（既存の FR-001〜FR-003 に影響なし）
// PermissionRequest が必要なツールかどうかの判定は
// permissionStore の存在をチェック（null の場合は Permission 不要）

if (this.permissionStore) {
  const permissionResult = await this.handlePermissionCheck(
    executionId,
    input.toolName,
    input.args,
    _context.signal,
  );
  if (!permissionResult.proceed) {
    return permissionResult;
  }
}

return { proceed: true };
```

### ステップ2: handlePermissionCheck メソッド設計

新規 private メソッド `handlePermissionCheck` を設計する:

```typescript
/**
 * Permission チェックのハンドル
 *
 * FR-101: Permission 拒否時に processPermissionFallback を呼び出す
 * FR-102: タイムアウト時に executeAbortFlow("timeout") を呼び出す
 * FR-103: retry フロー時に Permission 要求を再発行する（最大3回）
 * NFR-101: フォールバック処理の例外は fail-closed で abort に倒す
 */
private async handlePermissionCheck(
  executionId: string,
  toolName: string,
  args: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<PreToolUseResult> {
  let retryCount = 0;
  const maxRetries = PERMISSION_MAX_RETRIES;

  while (retryCount <= maxRetries) {
    try {
      // タイムアウト付き Permission 要求
      const response = await this.sendPermissionRequestWithTimeout(
        executionId, toolName, args, signal,
      );

      // 承認された場合
      if (response.approved) {
        return { proceed: true };
      }

      // 拒否 → processPermissionFallback
      const context: PermissionFlowContext = {
        executionId,
        toolName,
        requestId: response.requestId,
        retryCount,
        maxRetries,
      };

      try {
        const fallbackResult = await this.processPermissionFallback(
          response, context,
        );

        switch (fallbackResult.action) {
          case "approved":
            return { proceed: true };
          case "skip":
            this.executeSkipFlow(executionId, toolName);
            return {
              proceed: false,
              message: `Permission denied - tool skipped: ${toolName}`,
            };
          case "retry":
            retryCount = fallbackResult.retryCount ?? retryCount + 1;
            continue; // while ループの次のイテレーションへ
          case "abort":
            throw new Error(
              `Execution aborted: ${fallbackResult.reason ?? "denied"}`,
            );
        }
      } catch (fallbackError) {
        // NFR-101: fail-closed - フォールバック処理の例外は abort
        await this.executeAbortFlow("unknown", executionId);
        throw fallbackError;
      }
    } catch (error) {
      if (error instanceof PermissionTimeoutError) {
        // FR-102: タイムアウト → abort
        await this.executeAbortFlow("timeout", executionId);
      }
      throw error;
    }
  }

  // ループ終了（通常到達しない）
  return { proceed: false, message: "Permission check exhausted" };
}
```

### ステップ3: sendPermissionRequestWithTimeout 設計

```typescript
/**
 * タイムアウト付き Permission 要求
 *
 * FR-102: Promise.race でタイムアウト検知し、
 *         PermissionTimeoutError をスローする
* NFR-102: タイムアウト値は `this.defaultTimeout` で管理されること（初期値 DEFAULT_TIMEOUT_MS=30000ms）
 */
private async sendPermissionRequestWithTimeout(
  executionId: string,
  toolName: string,
  args: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<SkillPermissionResponse> {
  const timeoutMs = this.defaultTimeout; // DEFAULT_TIMEOUT_MS=30000ms

  const timeoutPromise = new Promise<never>((_, reject) => {
    const timer = setTimeout(
      () => reject(new PermissionTimeoutError(timeoutMs)),
      timeoutMs,
    );
    // AbortSignal でタイマーをクリーンアップ
    signal?.addEventListener("abort", () => clearTimeout(timer));
  });

  return Promise.race([
    this.sendPermissionRequest(executionId, toolName, args, signal),
    timeoutPromise,
  ]);
}
```

### ステップ4: PermissionTimeoutError クラス設計

```typescript
/**
 * Permission 要求のタイムアウトエラー
 */
export class PermissionTimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super(`Permission request timed out after ${timeoutMs}ms`);
    this.name = "PermissionTimeoutError";
  }
}
```

### ステップ5: シーケンス図

```
User          Renderer        Main(PreToolUse)      PermissionResolver
  |               |                |                        |
  |               |   toolUse      |                        |
  |               |<---------------|                        |
  |               |                |                        |
  |               |                |-- sendPermissionRequest -->|
  |               |                |        (with timeout)      |
  |               |<-- IPC ---------|                        |
  |  approve/deny |                |                        |
  |-------------->|                |                        |
  |               |-- IPC -------->|                        |
  |               |                |<-- response -----------|
  |               |                |                        |
  |               |                |-- [if denied] -------->|
  |               |                | processPermissionFallback
  |               |                |   -> abort/skip/retry  |
  |               |                |                        |
```

## 統合テスト連携（Phase 1〜11は必須）

Phase 2 では統合テストの設計観点を定義する:

- `handlePermissionCheck` メソッドの入出力テスト
- `sendPermissionRequestWithTimeout` のタイムアウト動作テスト
- PreToolUse Hook の統合テスト（既存 FR-001〜FR-003 との共存テスト）

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断 | 仕様参照先                                                          |
| -------------- | -------- | ------------------------------------------------------------------- |
| セキュリティ   | 適用     | `aiworkflow-requirements: security-skill-execution.md`              |
| API設計        | 適用     | `aiworkflow-requirements: interfaces-agent-sdk-executor-details.md` |
| アーキテクチャ | 適用     | `aiworkflow-requirements: architecture-overview.md`                 |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断 | 仕様参照先                                                          |
| -------------------- | -------- | ------------------------------------------------------------------- |
| バックエンド（Main） | 適用     | `aiworkflow-requirements: architecture-overview.md`                 |
| IPC通信              | 適用     | `aiworkflow-requirements: interfaces-agent-sdk-executor-details.md` |

## 設計上の注意事項

### P54 準拠: safeRegister パターン不適合

`sendPermissionRequest` は戻り値（Promise）が必要なため、`safeRegister` パターンは使用不可。個別 try-catch で実装する。

### P60 準拠: IPC テスト応答形式確認

テスト設計前に `sendPermissionRequest` の実際の戻り値形式（`SkillPermissionResponse`）を確認し、テストのアサーションと一致させる。

### P13 準拠: タイマーテスト

`sendPermissionRequestWithTimeout` のテストでは `vi.useFakeTimers()` + `vi.advanceTimersByTime()` を使用し、`vi.runAllTimers()` は避ける（無限ループ防止）。

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 1 成果物 + システム仕様）
2. DI境界の型配置判断
3. 統合シーケンス設計
4. handlePermissionCheck メソッド設計
5. sendPermissionRequestWithTimeout 設計
6. PermissionTimeoutError クラス設計
7. retry ループ設計
8. 設計上の注意事項確認
9. 成果物の作成・配置
10. 完了条件の検証

## 成果物

| 成果物             | パス                                     | 説明                               |
| ------------------ | ---------------------------------------- | ---------------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | 統合設計とシーケンス図             |
| API仕様            | `outputs/phase-2/api-specification.md`   | 新規メソッドのインターフェース仕様 |

## 完了条件

- [ ] DI境界の型配置判断が完了している
- [ ] PreToolUse Hook への統合シーケンスが設計されている
- [ ] `handlePermissionCheck` メソッドのインターフェースと処理フローが定義されている
- [ ] `sendPermissionRequestWithTimeout` のタイムアウト機構が設計されている（DEFAULT_TIMEOUT_MS=30000ms）
- [ ] `PermissionTimeoutError` クラスが設計されている
- [ ] retry ループの制御フローが定義されている（最大 PERMISSION_MAX_RETRIES=3 回）
- [ ] max_retries 到達時の `executeAbortFlow("max_retries")` フローが設計に含まれている
- [ ] fail-closed 原則の適用箇所が明確化されている
- [ ] 既存 FR-001〜FR-003 に影響がないことが設計レベルで確認されている
- [ ] P54/P60/P13 の既知の落とし穴への対策が設計に含まれている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-06-005-A-hook-fallback-integration --phase 2
```

## 次のPhase

Phase 3: 設計レビュー
