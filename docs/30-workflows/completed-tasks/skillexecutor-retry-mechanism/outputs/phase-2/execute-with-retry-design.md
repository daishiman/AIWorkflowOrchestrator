# Phase 2 Task 4: executeWithRetry設計書

## メソッドシグネチャ

```typescript
private async executeWithRetry(
  executionId: string,
  request: SkillExecutionRequest,
  skill: SkillMetadata,
  abortSignal: AbortSignal
): Promise<{ stream: () => AsyncIterable<SDKMessage> }>
```

## フロー設計

```
executeWithRetry(executionId, request, skill, abortSignal)
├── config = { ...DEFAULT_RETRY_CONFIG, ...request.retryConfig }
├── attempt = 0
├── lastError = undefined
├── while (attempt <= config.maxRetries)
│   ├── if (abortSignal.aborted) → throw new DOMException("Aborted", "AbortError")
│   ├── try:
│   │   ├── fullPrompt = buildPrompt(request.prompt, skill)
│   │   ├── response = callSDKQuery(fullPrompt, options)
│   │   └── return response  // 成功
│   ├── catch(error):
│   │   ├── retryResult = isRetryableError(error)
│   │   ├── if (!retryResult.retryable) → throw error  // リトライ不可
│   │   ├── if (attempt >= config.maxRetries) → throw error  // 上限到達
│   │   ├── if (abortSignal.aborted) → throw new DOMException("Aborted", "AbortError")
│   │   ├── delay = calculateBackoffDelay(attempt, config, retryResult.retryAfterMs)
│   │   ├── sendRetryStreamMessage(executionId, attempt, config.maxRetries, delay, retryResult)
│   │   ├── await sleep(delay, abortSignal)
│   │   ├── attempt++
│   │   └── lastError = error
│   └── continue
└── throw lastError  // 到達不能だが型安全のため
```

## execute() メソッドの修正

### 変更前（L329-L350）

```typescript
// プロンプト構築
const fullPrompt = await this.buildPrompt(request.prompt, skill);
// query() API 呼び出し
const response = await this.callSDKQuery(fullPrompt, { ... });
// ストリーミング処理
for await (const message of response.stream()) { ... }
```

### 変更後

```typescript
// query() API 呼び出し（リトライ付き）
const response = await this.executeWithRetry(
  executionId,
  request,
  skill,
  abortController.signal
);
// ストリーミング処理
for await (const message of response.stream()) { ... }
```

## リトライストリームメッセージ送信

```typescript
private sendRetryStreamMessage(
  executionId: string,
  attempt: number,
  maxRetries: number,
  delayMs: number,
  retryResult: RetryableErrorResult,
  errorMessage: string,
): void {
  this.sendStream({
    executionId,
    id: uuidv4(),
    type: "retry",
    content: JSON.stringify({
      attempt,
      maxRetries,
      delayMs,
      errorType: retryResult.errorType,
      errorMessage,
    }),
    timestamp: Date.now(),
    isComplete: false,
  });
}
```

## abort() との連携

1. AbortSignal を sleep() に渡す → abort時に即座にsleep中断
2. リトライループ先頭で abortSignal.aborted チェック → abort済みなら即終了
3. callSDKQuery() にも abortSignal を渡す → SDK呼び出し中のabortも対応
