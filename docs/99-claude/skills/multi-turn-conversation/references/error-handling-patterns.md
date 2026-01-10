# エラーハンドリングと復帰パターン

## 概要

マルチターン対話におけるエラーハンドリングと復帰戦略を整理したガイド。

## エラー分類

### レベル1: 回復可能エラー

ユーザーの再入力や簡単な操作で復帰可能。

**例:**

- 入力形式エラー
- 必須パラメータ不足
- バリデーションエラー

### レベル2: 一時的エラー

リトライで解決する可能性が高い。

**例:**

- ネットワークタイムアウト
- 一時的なサービス停止
- レート制限

### レベル3: 永続的エラー

システム修正が必要。

**例:**

- 認証エラー
- 権限不足
- データ破損

## パターン1: リトライ戦略

### 基本実装

```typescript
class RetryStrategy {
  private readonly MAX_RETRIES = 3;
  private readonly BASE_DELAY = 1000; // 1秒

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    errorType: "temporary" | "permanent",
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (errorType === "permanent") {
          throw error; // 永続的エラーはリトライしない
        }

        if (attempt < this.MAX_RETRIES) {
          const delay = this.calculateBackoff(attempt);
          await this.sleep(delay);
          await this.notifyUser(
            `リトライ中... (${attempt}/${this.MAX_RETRIES})`,
          );
        }
      }
    }

    throw lastError!;
  }

  private calculateBackoff(attempt: number): number {
    // 指数バックオフ
    return this.BASE_DELAY * Math.pow(2, attempt - 1);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

### エクスポネンシャルバックオフ

```typescript
class ExponentialBackoff {
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 5,
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === maxRetries - 1) throw error;

        const delay = Math.min(1000 * Math.pow(2, i), 30000); // 最大30秒
        const jitter = Math.random() * 1000; // ランダムジッター
        await this.sleep(delay + jitter);
      }
    }
    throw new Error("Max retries exceeded");
  }
}
```

## パターン2: サーキットブレーカー

### 実装

```typescript
enum CircuitState {
  CLOSED = "CLOSED", // 正常
  OPEN = "OPEN", // エラー多発、リクエスト拒否
  HALF_OPEN = "HALF_OPEN", // 回復試行中
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private readonly failureThreshold: number = 5;
  private readonly resetTimeout: number = 60000; // 1分
  private lastFailureTime: number = 0;

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}
```

## パターン3: フォールバック

### 実装

```typescript
class FallbackStrategy {
  async executeWithFallback<T>(
    primary: () => Promise<T>,
    fallback: () => Promise<T>,
    fallbackMessage?: string,
  ): Promise<T> {
    try {
      return await primary();
    } catch (error) {
      console.error("Primary operation failed:", error);

      if (fallbackMessage) {
        await this.notifyUser(fallbackMessage);
      }

      return await fallback();
    }
  }
}

// 使用例
const result = await fallbackStrategy.executeWithFallback(
  () => this.getFromCache(),
  () => this.getFromDatabase(),
  "キャッシュからの取得に失敗しました。データベースから取得します。",
);
```

## パターン4: エラーコンテキストの保持

### 実装

```typescript
interface ErrorContext {
  errorType: string;
  message: string;
  timestamp: Date;
  conversationState: any;
  lastSuccessfulTurn: number;
  recoveryAttempts: number;
}

class ErrorContextManager {
  private errorHistory: ErrorContext[] = [];

  recordError(error: Error, conversationState: any): void {
    const context: ErrorContext = {
      errorType: error.constructor.name,
      message: error.message,
      timestamp: new Date(),
      conversationState: { ...conversationState },
      lastSuccessfulTurn: conversationState.currentTurn - 1,
      recoveryAttempts: 0,
    };

    this.errorHistory.push(context);
  }

  async attemptRecovery(errorContext: ErrorContext): Promise<boolean> {
    errorContext.recoveryAttempts++;

    // 最後に成功した状態に戻す
    try {
      await this.restoreState(errorContext.conversationState);
      await this.notifyUser(
        "エラーから復帰しました。前回成功した時点から再開します。",
      );
      return true;
    } catch (recoveryError) {
      console.error("Recovery failed:", recoveryError);
      return false;
    }
  }

  getErrorHistory(): ErrorContext[] {
    return this.errorHistory;
  }
}
```

## パターン5: グレースフルデグラデーション

### 実装

```typescript
class GracefulDegradation {
  async handleDegradation(error: Error, conversationState: any): Promise<void> {
    // 1. エラーの重要度を判定
    const severity = this.assessSeverity(error);

    // 2. 重要度に応じた対応
    switch (severity) {
      case "low":
        // 機能を制限して継続
        await this.reduceFunctionality();
        await this.notifyUser(
          "一部機能が制限されていますが、対話は継続できます。",
        );
        break;

      case "medium":
        // 簡易モードで継続
        await this.switchToSimpleMode();
        await this.notifyUser("簡易モードで対話を継続します。");
        break;

      case "high":
        // 最小限の機能で継続
        await this.switchToMinimalMode();
        await this.notifyUser("最小限の機能のみ利用可能です。");
        break;

      case "critical":
        // 対話を終了
        await this.terminateConversation();
        await this.notifyUser(
          "申し訳ございません。システムエラーが発生しました。",
        );
        break;
    }
  }

  private assessSeverity(error: Error): "low" | "medium" | "high" | "critical" {
    // エラーの種類や状況から重要度を判定
    if (error instanceof NetworkError) return "medium";
    if (error instanceof ValidationError) return "low";
    if (error instanceof AuthenticationError) return "critical";
    return "high";
  }
}
```

## パターン6: ユーザーへの通知戦略

### 実装

```typescript
class ErrorNotificationStrategy {
  async notifyError(error: Error, userFriendly: boolean = true): Promise<void> {
    if (userFriendly) {
      const friendlyMessage = this.convertToFriendlyMessage(error);
      await this.sendMessage(friendlyMessage);
    } else {
      await this.sendMessage(`エラー: ${error.message}`);
    }

    // 回復オプションを提示
    const recoveryOptions = this.getRecoveryOptions(error);
    if (recoveryOptions.length > 0) {
      await this.sendMessage("以下の操作で回復を試みることができます:");
      await this.showOptions(recoveryOptions);
    }
  }

  private convertToFriendlyMessage(error: Error): string {
    const messageMap: Record<string, string> = {
      NetworkError:
        "通信エラーが発生しました。インターネット接続を確認してください。",
      ValidationError: "入力内容に問題があります。もう一度確認してください。",
      TimeoutError: "処理に時間がかかりすぎています。もう一度お試しください。",
      AuthenticationError: "認証に失敗しました。ログインし直してください。",
    };

    return (
      messageMap[error.constructor.name] ||
      "エラーが発生しました。しばらくしてから再度お試しください。"
    );
  }

  private getRecoveryOptions(error: Error): string[] {
    if (error instanceof NetworkError) {
      return ["リトライする", "オフラインモードに切り替える"];
    }
    if (error instanceof ValidationError) {
      return ["入力をやり直す", "前の状態に戻る"];
    }
    return ["リトライする", "会話を最初からやり直す"];
  }
}
```

## 復帰戦略の選択ガイド

| エラータイプ         | 推奨戦略                                | 補足                             |
| -------------------- | --------------------------------------- | -------------------------------- |
| ネットワークエラー   | リトライ + サーキットブレーカー         | エクスポネンシャルバックオフ推奨 |
| バリデーションエラー | ユーザー通知 + 再入力要求               | 具体的なエラー箇所を指摘         |
| 認証エラー           | フォールバック or 終了                  | セキュリティ優先                 |
| タイムアウト         | リトライ + グレースフルデグラデーション | タイムアウト時間を調整           |
| データ破損           | エラーコンテキスト保持 + 復帰           | 最後の成功状態に戻す             |
| サービス停止         | サーキットブレーカー                    | ユーザーに明確な通知             |

## ベストプラクティス

### すべきこと

- エラーを分類し、適切な戦略を選択
- ユーザーにわかりやすいメッセージを提供
- エラーコンテキストを保持
- 復帰オプションを提示
- エラーログを詳細に記録
- テストでエラーケースを網羅

### 避けるべきこと

- エラーメッセージを無視
- スタックトレースをそのまま表示
- 無限リトライ
- ユーザーへの説明なしの状態変更
- エラー発生時の状態破棄
- エラーハンドリングのテスト不足
