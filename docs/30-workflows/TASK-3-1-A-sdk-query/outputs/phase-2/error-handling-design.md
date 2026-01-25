# TASK-3-1-A エラーハンドリング設計書

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | TASK-3-1-A |
| Phase      | 2          |
| 作成日     | 2026-01-24 |
| ステータス | 完了       |

---

## エラー分類

### エラーコード一覧

| コード                    | 説明                 | リカバリー可能 |
| ------------------------- | -------------------- | -------------- |
| `EXECUTION_FAILED`        | 実行失敗（一般）     | 再試行可       |
| `TIMEOUT`                 | タイムアウト         | 再試行可       |
| `ABORTED`                 | ユーザーによる中断   | 再試行可       |
| `MAX_CONCURRENT_EXCEEDED` | 同時実行数超過       | 待機後再試行   |
| `SKILL_NOT_FOUND`         | スキルが見つからない | 不可           |
| `VALIDATION_FAILED`       | 入力検証失敗         | 修正後再試行   |
| `SDK_ERROR`               | SDK 内部エラー       | 再試行可       |
| `NETWORK_ERROR`           | ネットワークエラー   | 再試行可       |
| `AUTHENTICATION_ERROR`    | 認証エラー           | 不可           |

---

## エラー発生パターン

### 1. SDK エラー

| パターン       | 原因                | 対処                     |
| -------------- | ------------------- | ------------------------ |
| 接続失敗       | ネットワーク切断    | リトライ（最大3回）      |
| 認証失敗       | API キー無効        | エラー通知、再認証要求   |
| レート制限     | リクエスト過多      | 指数バックオフでリトライ |
| サーバーエラー | Claude サービス障害 | リトライ後エラー通知     |

### 2. 実行時エラー

| パターン     | 原因                   | 対処                         |
| ------------ | ---------------------- | ---------------------------- |
| タイムアウト | 処理時間超過           | AbortController でキャンセル |
| 中断         | ユーザーによる abort() | 正常終了として処理           |
| メモリ不足   | 大量データ処理         | エラー通知、リソース解放     |

### 3. バリデーションエラー

| パターン       | 原因                   | 対処                     |
| -------------- | ---------------------- | ------------------------ |
| 空プロンプト   | 入力が空               | 即座にエラー返却         |
| 無効なスキルID | スキルが存在しない     | SKILL_NOT_FOUND エラー   |
| ツール検証失敗 | 許可されていないツール | VALIDATION_FAILED エラー |

---

## エラーハンドリング実装

### handleExecutionError() メソッド

```typescript
private handleExecutionError(
  executionId: string,
  error: unknown
): SkillExecutionResponse {
  // 状態更新
  this.updateExecutionState(executionId, "error");

  // エラータイプ判定
  const skillError = this.convertToSkillError(error);

  // エラー通知を Renderer に送信
  this.sendStream({
    executionId,
    id: uuidv4(),
    type: "error",
    content: skillError.message,
    timestamp: Date.now(),
    isComplete: true,
  });

  return {
    executionId,
    success: false,
    error: skillError,
  };
}
```

### convertToSkillError() メソッド

```typescript
private convertToSkillError(error: unknown): SkillExecutionError {
  // AbortError（中断）
  if (error instanceof Error && error.name === "AbortError") {
    return {
      code: "ABORTED",
      message: "Execution was aborted",
    };
  }

  // TimeoutError
  if (error instanceof Error && error.name === "TimeoutError") {
    return {
      code: "TIMEOUT",
      message: "Execution timed out",
    };
  }

  // SDK エラー
  if (this.isSDKError(error)) {
    return this.handleSDKError(error);
  }

  // 一般エラー
  if (error instanceof Error) {
    return {
      code: "EXECUTION_FAILED",
      message: error.message,
      details: { stack: error.stack },
    };
  }

  // 不明なエラー
  return {
    code: "EXECUTION_FAILED",
    message: "An unknown error occurred",
    details: error,
  };
}
```

### handleSDKError() メソッド

```typescript
private handleSDKError(error: SDKError): SkillExecutionError {
  switch (error.code) {
    case "rate_limit_exceeded":
      return {
        code: "SDK_ERROR",
        message: "Rate limit exceeded. Please try again later.",
        details: { retryAfter: error.retryAfter },
      };

    case "authentication_error":
      return {
        code: "AUTHENTICATION_ERROR",
        message: "Authentication failed. Please check your API key.",
      };

    case "server_error":
      return {
        code: "SDK_ERROR",
        message: "Claude service is temporarily unavailable.",
      };

    default:
      return {
        code: "SDK_ERROR",
        message: error.message || "SDK error occurred",
        details: error,
      };
  }
}
```

---

## リトライ戦略

### 設計

| 設定               | 値                               |
| ------------------ | -------------------------------- |
| 最大リトライ回数   | 3回                              |
| 初回リトライ待機   | 1000ms                           |
| 最大リトライ待機   | 4000ms                           |
| バックオフ係数     | 2                                |
| リトライ対象エラー | NETWORK_ERROR, SDK_ERROR（一部） |

### 実装

```typescript
private async executeWithRetry(
  executionFn: () => Promise<void>,
  maxRetries: number = 3
): Promise<void> {
  let lastError: unknown;
  let delay = 1000; // 初回待機時間

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await executionFn();
    } catch (error) {
      lastError = error;

      // リトライ対象でないエラーは即座に throw
      if (!this.isRetryableError(error)) {
        throw error;
      }

      // 最後の試行の場合は throw
      if (attempt === maxRetries) {
        throw error;
      }

      // 待機
      await this.sleep(delay);

      // 指数バックオフ
      delay = Math.min(delay * 2, 4000);
    }
  }

  throw lastError;
}

private isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  // 中断は再試行しない
  if (error.name === "AbortError") return false;

  // 認証エラーは再試行しない
  if (this.isAuthenticationError(error)) return false;

  // ネットワーク・サーバーエラーは再試行対象
  return true;
}
```

---

## クリーンアップ処理

### cleanup() メソッド

```typescript
private cleanup(executionId: string): void {
  const context = this.activeExecutions.get(executionId);

  if (!context) {
    return;
  }

  // 完了時刻を記録
  context.completedAt = Date.now();

  // 一定時間後に Map から削除（履歴保持のため即削除しない）
  setTimeout(() => {
    this.activeExecutions.delete(executionId);
  }, 60000); // 1分後に削除
}
```

---

## エラーログ

### ログ出力

```typescript
private logError(
  executionId: string,
  error: SkillExecutionError,
  originalError?: unknown
): void {
  console.error("[SkillExecutor] Execution error:", {
    executionId,
    errorCode: error.code,
    message: error.message,
    timestamp: new Date().toISOString(),
    details: error.details,
    stack: originalError instanceof Error ? originalError.stack : undefined,
  });
}
```

---

## エラー通知フロー

```
エラー発生
    │
    ▼
convertToSkillError()
    │
    ▼
updateExecutionState("error")
    │
    ▼
sendStream({ type: "error", ... })
    │
    ▼
logError()
    │
    ▼
cleanup()
    │
    ▼
return SkillExecutionResponse
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |
