# Phase 2 Task 1: RetryConfig型設計書

## RetryConfig型

```typescript
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
```

## デフォルト値定数

```typescript
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitterFactor: 0.2,
  backoffMultiplier: 2,
};
```

## SkillExecutionRequest への追加

SkillExecutor.ts のローカル SkillExecutionRequest に追加:

```typescript
export interface SkillExecutionRequest {
  prompt: string;
  skillId: string;
  timeout?: number;
  sessionId?: string;
  /** リトライ設定（部分指定可能、未指定フィールドはデフォルト値） */
  retryConfig?: Partial<RetryConfig>;
}
```

## 配置

- **RetryConfig型**: SkillExecutor.ts にローカル定義（既存パターンに合わせる）
- **DEFAULT_RETRY_CONFIG**: SkillExecutor.ts の定数セクション
- **export**: RetryConfig は export してテストからアクセス可能にする
