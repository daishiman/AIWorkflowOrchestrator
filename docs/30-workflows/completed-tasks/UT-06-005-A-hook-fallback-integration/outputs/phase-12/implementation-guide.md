# 実装ガイド（Phase12）

## Part 1: なぜ必要か（中学生向け）

この機能は、AI がツールを実行する前に「許可が必要か」を確認する場面で、返答が遅れる、拒否する、または想定外の例外が起きるときに、安全に動作を止めるために導入しました。

### 何をするか

具体的には、Permission 拒否・タイムアウト・例外時に中断（abort）・再試行（retry）・スキップ（skip）を明確に選択して実行する仕組みにします。

たとえば、カフェで注文を受ける店員さんが「お会計お願いします」と言われても返事がないとき、30秒以上返答を待たずに席を空ける判断をすることで混乱を防ぐのに近い状態です。

この実装では、`handlePermissionCheck` と `sendPermissionRequestWithTimeout` を追加して、

- 許可拒否時の fallback ルート（abort / skip / retry）
- 応答がないときの timeout 処理
- 例外発生時の fail-closed
  を明確に分離しています。

## Part 2: 技術詳細

### 追加した API / メソッド

```ts
export class PermissionTimeoutError extends Error {
  readonly timeoutMs: number;
  constructor(timeoutMs: number, toolName: string) {
    super(`Permission request timed out after ${timeoutMs}ms for tool: ${toolName}`);
    this.name = "PermissionTimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

interface PermissionCheckInput {
  executionId: string;
  toolName: string;
  args: Record<string, unknown>;
}

type PermissionRequestResult =
  | { proceed: true }
  | { proceed: false; message: string };

async handlePermissionCheck(
  executionId: string,
  toolName: string,
  args: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<PreToolUseResult> {
  // 省略: approved / skip / retry / abort 分岐
  // timeout 時は catch で executeAbortFlow("timeout") を実行
}

private sendPermissionRequestWithTimeout(
  executionId: string,
  toolName: string,
  args: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<SkillPermissionResponse> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new PermissionTimeoutError(this.defaultTimeout, toolName));
    }, this.defaultTimeout);
    this.sendPermissionRequest(executionId, toolName, args, signal)
      .then((response) => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

```

### API/CLI シグネチャ

- `handlePermissionCheck(executionId: string, toolName: string, args: Record<string, unknown>, signal?: AbortSignal): Promise<PreToolUseResult>`
- `sendPermissionRequestWithTimeout(executionId: string, toolName: string, args: Record<string, unknown>, signal?: AbortSignal): Promise<SkillPermissionResponse>`

### 使用例

```ts
const result = await this.handlePermissionCheck(
  executionId,
  toolName,
  { targetPath: "./README.md" },
  abortSignal,
);
if (!result.proceed) {
  logger.warn("Permission fallback proceeded: %s", result.message);
}
```

### エラーハンドリングと設定

- `PermissionTimeoutError` 発生時は `executeAbortFlow("timeout")` を呼び出し、`fail-closed` へ遷移
- フォールバック内部で例外が出た場合も `executeAbortFlow("unknown")` で安全側に倒す

#### 設定値

| 設定項目                 | 型       | デフォルト | 説明                                |
| ------------------------ | -------- | ---------- | ----------------------------------- |
| `defaultTimeout`         | `number` | `30000`    | Permission 応答の最大待ち時間（ms） |
| `PERMISSION_MAX_RETRIES` | `number` | `3`        | retry 再試行の上限                  |

### エッジケース

- 応答が全くない場合: timeout で abort
- fallback が失敗した場合: fail-closed
- 既存 FR-001〜FR-003 の実行順が変わらないことを確認
