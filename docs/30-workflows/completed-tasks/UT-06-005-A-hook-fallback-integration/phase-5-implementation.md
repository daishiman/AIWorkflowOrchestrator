# Phase 5: 実装

## メタ情報

| 項目             | 内容                                   |
| ---------------- | -------------------------------------- |
| Phase 番号       | 5                                      |
| 機能名           | PreToolUse Hook フォールバック統合実装 |
| タスク ID        | UT-06-005-A-hook-fallback-integration  |
| 作成日           | 2026-03-17                             |
| 依存 Phase       | Phase 4（テスト作成 - Red フェーズ）   |
| 担当エージェント | Phase5Writer                           |

## 目的

Phase 4 で作成した 6 テストケース（TC-A-001〜TC-A-006）を全て Green に転換するプロダクションコードを実装する。

- PreToolUse Hook に Permission チェックを統合する（FR-101）
- `handlePermissionCheck` private メソッドを追加する
- `sendPermissionRequestWithTimeout` private メソッドを追加する
- `PermissionTimeoutError` クラスを追加する
- fail-closed 原則（NFR-1）を徹底する

## 実行タスク

- エラー型追加: `PermissionTimeoutError` クラスを `SkillExecutor.ts` に追加する
- タイムアウトラッパー実装: `sendPermissionRequestWithTimeout` private メソッドを実装する
- Permission 制御実装: `handlePermissionCheck` private メソッドを実装する
- Hook 統合実装: PreToolUse Hook の FR-003 後に `handlePermissionCheck` 呼び出しを挿入する
- Green 検証: TC-A-001〜TC-A-006 全件を Green に転換する

## 参照資料

| 資料名               | パス                                                                                 | 目的              |
| -------------------- | ------------------------------------------------------------------------------------ | ----------------- |
| Phase 4 テスト成果物 | `outputs/phase-4/test-design.md`                                                     | テスト設計        |
| Phase 4 実行レポート | `outputs/phase-4/execution-report.md`                                                | 実装基準前提確認  |
| Phase 2 設計書       | `outputs/phase-2/architecture-design.md`                                             | 統合フロー設計    |
| SkillExecutor 実装   | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                              | 修正対象ファイル  |
| テストファイル       | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts` | Green 確認基準    |
| コード品質ルール     | `.claude/rules/02-code-quality.md`                                                   | TypeScript 型安全 |
| セキュリティルール   | `.claude/rules/04-electron-security.md`                                              | IPC セキュリティ  |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                                                 | P61（DIP 違反）   |

## 事前確認

### IPC ハンドラ register/unregister ペアの確認（P5 対策）

新規ハンドラを作成する場合、unregister ペアの整合性を確認する:

```bash
grep -rn "register.*Handlers\|unregister.*Handlers" apps/desktop/src/main/
```

確認項目:

- `register*Handlers` 関数を作成した場合、対応する `unregister*Handlers` 関数も同時に作成したか
- `unregisterAllIpcHandlers()` に新規ハンドラの解除処理が含まれているか
- macOS `activate` イベント等での再登録パスで二重登録が発生しないか

本タスク（`handlePermissionCheck` / `sendPermissionRequestWithTimeout`）はプライベートメソッドであり IPC ハンドラ登録は行わないため、このチェックは確認のみでスキップ可能。ただし実装時に IPC ハンドラ登録が必要になった場合は上記を遵守すること。

### 既存ユーティリティ重複検出（Phase 4 から継続）

Phase 4 で検出されなかった場合も、実装直前に再確認する:

```bash
grep -rn "export.*function.*sendPermissionRequestWithTimeout" packages/ apps/
grep -rn "export.*function.*handlePermissionCheck" packages/ apps/
grep -rn "class PermissionTimeoutError" packages/ apps/
```

### Phase 5 判断: ファイル分離の先行実施

以下の条件を全て確認し、Phase 8 のファイル分離を Phase 5 で先行実施するか判断する:

1. テスト対象ファイル（`SkillExecutor.ts`）にトップレベル副作用があり、`vi.mock` では対処困難か
2. 新規ロジック（`handlePermissionCheck` + `sendPermissionRequestWithTimeout`）が 50 行以上で、既存ファイルの責務と明確に分離可能か
3. テスト容易性が著しく低下する構造か

→ 判断結果を Phase 5 実行レポートに記録すること。

## 実行手順

### Step 1: 実装前の確認

#### 1-1: 現在の PreToolUse Hook 構造を把握する

`SkillExecutor.ts` の L1127-1185 を読み、既存の FR-001〜FR-003 フローを確認する。

修正対象の構造:

```typescript
PreToolUse: async (input, toolUseId, _context) => {
  // FR-001: 危険コマンドチェック（L1133-1150）
  // FR-002: 保護パスチェック（L1152-1170）
  // FR-003: ツール実行開始通知（L1172-1182）
  return { proceed: true }; // ← ここに FR-101 を挿入
};
```

#### 1-2: 既存の関連メソッドのシグネチャを確認する

確認対象:

- `sendPermissionRequest(executionId, toolName, args, signal)` → `Promise<SkillPermissionResponse>`（L1481-1517）
- `processPermissionFallback(response, context)` → `Promise<PermissionFlowResult>`（L1535-1587）
- `executeAbortFlow(reason, executionId)` → `Promise<void>`（L1599-1656）
- `executeSkipFlow(executionId, toolName)` → `void`（L1664-1681）

#### 1-3: 型定義の確認

`SkillExecutor.ts` 内の以下の型定義を確認する:

- `AbortReason` 型
- `PermissionFlowContext` 型
- `PermissionFlowResult` 型
- `PERMISSION_MAX_RETRIES` 定数
- `SkillPermissionResponse` 型

### Step 2: PermissionTimeoutError クラスの追加

`SkillExecutor.ts` の UT-06-005 セクション（L1519 付近）より前、クラス定義の外側または内側に追加する。

実装要件:

- `Error` を継承する
- `name` フィールドを `"PermissionTimeoutError"` に設定する
- コンストラクタで `executionId` と `toolName` を受け取る
- メッセージは `Permission request timed out: toolName (executionId)` 形式とする

```typescript
/**
 * Permission リクエストタイムアウト専用エラー
 *
 * sendPermissionRequestWithTimeout がタイムアウトした場合にスローされる。
 */
class PermissionTimeoutError extends Error {
  constructor(executionId: string, toolName: string) {
    super(`Permission request timed out: ${toolName} (${executionId})`);
    this.name = "PermissionTimeoutError";
  }
}
```

### Step 3: sendPermissionRequestWithTimeout private メソッドの追加

`sendPermissionRequest` メソッド（L1481-1517）の直後に追加する。

実装要件:

- `sendPermissionRequest` を Promise.race でラップする
- タイムアウト時間は定数 `PERMISSION_REQUEST_TIMEOUT_MS`（デフォルト: 30000ms）を使用する
- タイムアウト時は `executeAbortFlow("timeout", executionId)` を呼び出す
- タイムアウト後は `PermissionTimeoutError` をスローする
- タイムアウト Timer は応答受信後に必ずクリアする（メモリリーク防止）

```typescript
/** Permission リクエストのタイムアウト時間（ミリ秒）*/
private static readonly PERMISSION_REQUEST_TIMEOUT_MS = 30_000;

/**
 * タイムアウト付き Permission リクエスト送信
 *
 * Promise.race で sendPermissionRequest にタイムアウトを付与する。
 * タイムアウト発生時は executeAbortFlow("timeout") を呼び出してから
 * PermissionTimeoutError をスローする。
 */
private async sendPermissionRequestWithTimeout(
  executionId: string,
  toolName: string,
  args: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<SkillPermissionResponse> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(async () => {
      await this.executeAbortFlow("timeout", executionId);
      reject(new PermissionTimeoutError(executionId, toolName));
    }, SkillExecutor.PERMISSION_REQUEST_TIMEOUT_MS);
  });

  try {
    const response = await Promise.race([
      this.sendPermissionRequest(executionId, toolName, args, signal),
      timeoutPromise,
    ]);
    return response;
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}
```

### Step 4: handlePermissionCheck private メソッドの追加

`sendPermissionRequestWithTimeout` の直後に追加する。

実装要件:

- `sendPermissionRequestWithTimeout` を呼び出す
- 応答を `processPermissionFallback` に渡す
- `action: "approved"` → `{ proceed: true }` を返す
- `action: "skip"` → `executeSkipFlow` を呼び出して `{ proceed: false }` を返す
- `action: "retry"` → while ループで最大 `PERMISSION_MAX_RETRIES` 回まで再試行する
- `action: "abort"` → `AbortError` をスローする
- 予期しない例外は catch して `executeAbortFlow("unknown")` を呼び出し、再スローする（fail-closed）

```typescript
/**
 * PreToolUse Hook 内での Permission チェック統合処理
 *
 * 設計フロー:
 * sendPermissionRequestWithTimeout
 *   ├── timeout → executeAbortFlow("timeout") → throw PermissionTimeoutError
 *   └── 応答受信 → processPermissionFallback
 *       ├── approved → { proceed: true }
 *       ├── skip → executeSkipFlow → { proceed: false }
 *       ├── retry → while loop (max PERMISSION_MAX_RETRIES)
 *       └── abort → throw AbortError
 *
 * NFR-1: fail-closed - 例外発生時は必ず abort に遷移する
 */
private async handlePermissionCheck(
  executionId: string,
  toolName: string,
  args: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<{ proceed: boolean; message?: string }> {
  let retryCount = 0;
  const maxRetries = PERMISSION_MAX_RETRIES;

  try {
    while (retryCount < maxRetries) {
      const response = await this.sendPermissionRequestWithTimeout(
        executionId,
        toolName,
        args,
        signal,
      );

      const context: PermissionFlowContext = {
        executionId,
        toolName,
        requestId: response.requestId,
        retryCount,
        maxRetries,
      };

      const result = await this.processPermissionFallback(response, context);

      switch (result.action) {
        case "approved":
          return { proceed: true };

        case "skip":
          this.executeSkipFlow(executionId, toolName);
          return { proceed: false, message: `Tool skipped by user: ${toolName}` };

        case "retry":
          retryCount = result.retryCount ?? retryCount + 1;
          continue;

        case "abort":
          throw new Error(
            `Skill execution aborted: ${result.reason ?? "denied"} (executionId=${executionId})`,
          );
      }
    }

    // maxRetries 到達（while を抜けた場合）
    await this.executeAbortFlow("max_retries", executionId);
    throw new Error(`Skill execution aborted: max_retries (executionId=${executionId})`);
  } catch (error: unknown) {
    // PermissionTimeoutError / AbortError はそのまま再スロー
    if (
      error instanceof PermissionTimeoutError ||
      (error instanceof Error && error.message.includes("Skill execution aborted"))
    ) {
      throw error;
    }
    // 予期しない例外: fail-closed
    console.error(
      "[SkillExecutor] unexpected error in handlePermissionCheck",
      error,
    );
    await this.executeAbortFlow("unknown", executionId);
    throw error;
  }
}
```

### Step 5: PreToolUse Hook への FR-101 統合

`createHooks` メソッド内の PreToolUse Hook（L1184-1185）を修正する。

FR-003 の `sendHooksStream` 呼び出し後、`return { proceed: true }` の前に `handlePermissionCheck` を挿入する。

修正前:

```typescript
      // FR-003: ツール実行開始を通知
      this.sendHooksStream({ ... });

      return { proceed: true };
```

修正後:

```typescript
      // FR-003: ツール実行開始を通知
      this.sendHooksStream({ ... });

      // FR-101: Permission チェック（統合フロー）
      const permissionResult = await this.handlePermissionCheck(
        executionId,
        input.toolName,
        input.args,
        _context.signal,
      );
      if (!permissionResult.proceed) {
        return { proceed: false, message: permissionResult.message };
      }

      return { proceed: true };
```

注意:

- P61 対策: `handlePermissionCheck` は具象クラスに依存しない
- FR-001 / FR-002 のブロック処理は既存のままとし、FR-101 はその後に実行される

### Step 6: Green フェーズ確認

テストを実行して全 6 件が PASS することを確認する:

```bash
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts
```

既存テストへの影響がないことも確認する:

```bash
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/
```

### Step 7: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

型エラーが発生した場合は修正してから次の Step に進む。

## 統合テスト連携

| Phase | 役割               | 成果物                                | 連携先              |
| ----- | ------------------ | ------------------------------------- | ------------------- |
| 4     | Red テスト作成     | `SkillExecutor.hook-fallback.test.ts` | Phase 5（本 Phase） |
| 5     | 実装（Green 転換） | `SkillExecutor.ts` 修正               | Phase 6             |
| 6     | テスト拡充         | 追加テストケース                      | Phase 7             |

## 多角的チェック観点

| 観点               | チェック内容                                                             | 優先度 |
| ------------------ | ------------------------------------------------------------------------ | ------ |
| 型安全             | `any` 型を使用していないこと                                             | 必須   |
| fail-closed        | 予期しない例外が発生した場合に abort に遷移すること（NFR-1）             | 必須   |
| タイマーリーク     | `clearTimeout` が finally ブロックで呼ばれること                         | 必須   |
| DIP 準拠           | `handlePermissionCheck` の引数型が具象クラスではないこと（P61）          | 必須   |
| 冪等性             | 二重 abort でエラーが発生しないこと（既存の `abortedExecutions` ガード） | 高     |
| FR-001/FR-002 共存 | 既存の危険コマンド・保護パスチェックが FR-101 より先に実行されること     | 高     |
| Green 確認         | TC-A-001〜TC-A-006 が全て PASS すること                                  | 必須   |
| 既存テスト維持     | `SkillExecutor.fallback.test.ts` の全 23 テストが引き続き PASS すること  | 必須   |

## 成果物

| 成果物名                | 種別         | 格納先                                                                                        |
| ----------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| SkillExecutor.ts 修正版 | コード       | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                                       |
| Phase 5 実行レポート    | ドキュメント | `docs/30-workflows/UT-06-005-A-hook-fallback-integration/outputs/phase-5/execution-report.md` |

## 完了条件

- [ ] `PermissionTimeoutError` クラスが `SkillExecutor.ts` に追加されていること
- [ ] `PERMISSION_REQUEST_TIMEOUT_MS` 定数が追加されていること（デフォルト: 30000ms）
- [ ] `sendPermissionRequestWithTimeout` private メソッドが実装されていること
- [ ] `handlePermissionCheck` private メソッドが実装されていること
- [ ] PreToolUse Hook に FR-101 が統合されていること（FR-003 後、return 前）
- [ ] TC-A-001〜TC-A-006 の全 6 テストが Green（PASS）に転換していること
- [ ] 既存の `SkillExecutor.fallback.test.ts` の全テストが引き続き PASS すること
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通ること
- [ ] `any` 型を使用していないこと
- [ ] 本 Phase 内の全タスクを 100% 実行完了していること

## サブタスク管理

| サブタスク ID | 内容                                  | ステータス |
| ------------- | ------------------------------------- | ---------- |
| ST-5-1        | 実装前確認（既存メソッド・型定義）    | completed  |
| ST-5-2        | PermissionTimeoutError クラス追加     | completed  |
| ST-5-3        | sendPermissionRequestWithTimeout 実装 | completed  |
| ST-5-4        | handlePermissionCheck 実装            | completed  |
| ST-5-5        | PreToolUse Hook への FR-101 統合      | completed  |
| ST-5-6        | Green フェーズ確認（テスト実行）      | completed  |
| ST-5-7        | TypeScript 型チェック                 | completed  |
| ST-5-8        | Phase 5 実行レポート作成              | completed  |

## タスク 100% 実行確認【必須】

Phase 5 完了検証コマンド:

```bash
# Green フェーズ確認（全 6 件 PASS）
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts 2>&1 | tail -20

# 既存テスト維持確認（全 PASS）
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillExecutor.fallback.test.ts 2>&1 | tail -10

# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck 2>&1 | tail -20

# 実装追加確認
node -e "
const fs = require('fs');
const content = fs.readFileSync('apps/desktop/src/main/services/skill/SkillExecutor.ts', 'utf8');
const checks = [
  ['PermissionTimeoutError', 'PermissionTimeoutError クラス'],
  ['PERMISSION_REQUEST_TIMEOUT_MS', 'タイムアウト定数'],
  ['sendPermissionRequestWithTimeout', 'タイムアウト付きリクエストメソッド'],
  ['handlePermissionCheck', 'Permission チェックメソッド'],
  ['FR-101', 'PreToolUse Hook 統合'],
];
checks.forEach(([key, label]) => {
  const found = content.includes(key);
  console.log((found ? '[OK]' : '[NG]') + ' ' + label);
});
"

# 成果物確認
ls -la docs/30-workflows/UT-06-005-A-hook-fallback-integration/outputs/phase-5/execution-report.md
```

## 次の Phase

Phase 6: テスト拡充（`phase-6-test-expansion.md`）

- 境界値テスト（retryCount=0, 1, 2, 3）の追加
- 異常系テスト（mainWindow.isDestroyed() = true 時）の追加
- 既存 FR-001〜FR-003 との共存テストの追加
- abort 冪等性テスト（二重 abort）の追加
- タイムアウト値のコンフィグテストの追加
