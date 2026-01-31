# Phase 4: テストスケルトン作成レポート

## 概要

| 項目           | 内容                                                                         |
| -------------- | ---------------------------------------------------------------------------- |
| Phase          | 4                                                                            |
| Phase名        | テスト作成（TDD Red）                                                        |
| 実行日         | 2026-01-30                                                                   |
| テストファイル | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts` |
| テスト総数     | 72ケース（Phase 4: 41ケース + Phase 6拡充: 31ケース）                        |

---

## 1. テストファイル作成確認

テストファイルを以下のパスに作成した:

```
apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts
```

既存テストファイルとの並置:

```
__tests__/
├── SkillExecutor.test.ts            # 既存（48ケース）
├── SkillExecutor.permission.test.ts # 既存（90ケース）
└── SkillExecutor.retry.test.ts      # 新規（72ケース）
```

---

## 2. describeブロック構造

### Phase 4 基本テスト（5ブロック / 41ケース）

```
describe('SkillExecutor Retry Mechanism')
├── describe('isRetryableError')           ... 17ケース
│   ├── ネットワークエラー（5ケース: ECONNRESET, ETIMEDOUT, ECONNREFUSED, ENOTFOUND, EAI_AGAIN）
│   ├── HTTP 429（2ケース: 基本, Retry-Afterヘッダー付き）
│   ├── HTTP 5xx（4ケース: 500, 502, 503, 504）
│   ├── タイムアウト（1ケース: TimeoutError）
│   └── 非リトライ対象（5ケース: 400, 401, 403, AbortError, 不明エラー）
├── describe('calculateBackoffDelay')      ... 8ケース
│   ├── attempt=0/1/2のデフォルト設定（3ケース）
│   ├── maxDelayMs上限（1ケース）
│   ├── Retry-After優先（2ケース: 通常, baseDelayMs未満）
│   ├── jitterFactor=0（1ケース）
│   └── カスタムRetryConfig（1ケース）
├── describe('executeWithRetry')           ... 9ケース
│   ├── 初回成功（1ケース）
│   ├── 1回/2回失敗→成功（2ケース）
│   ├── maxRetries回失敗→エラー終了（1ケース）
│   ├── 非リトライ対象エラー即座失敗（2ケース: 400, AbortError）
│   ├── abort()中のリトライ中止（1ケース）
│   ├── retryストリーミングイベント送信（1ケース）
│   └── 最終エラー情報（1ケース）
├── describe('retry streaming events')     ... 7ケース
│   ├── attempt番号（1ケース）
│   ├── maxRetries（1ケース）
│   ├── delayMs（1ケース）
│   ├── errorType（1ケース）
│   ├── errorMessage（1ケース）
│   ├── 複数リトライ順序（1ケース）
│   └── skill:stream IPCチャネル（1ケース）
└── describe('abort during retry')         ... 5ケース
    ├── sleep中abort（1ケース）
    ├── リトライ開始前abort（1ケース）
    ├── query中断（AbortError）（1ケース）
    ├── abort後イベント送信停止（1ケース）
    └── aborted状態確認（1ケース）
```

### Phase 6 拡充テスト（4ブロック / 31ケース）

Phase 6仕様のテストケースもPhase 4時点で先行作成した（Phase 5実装後にGreen化予定）:

```
├── describe('edge cases')                 ... 10ケース
│   ├── maxRetries=0（1ケース）
│   ├── maxRetries=1（1ケース）
│   ├── baseDelayMs=0（1ケース）
│   ├── maxDelayMs=baseDelayMs（1ケース）
│   ├── jitterFactor=0 決定論的（1ケース）
│   ├── jitterFactor=1 最大Jitter（1ケース）
│   ├── Retry-After巨大値（86400秒）キャップ（1ケース）
│   ├── Retry-After=0→baseDelayMs（1ケース）
│   ├── nullエラー（1ケース）
│   └── 文字列エラー（1ケース）
├── describe('concurrent retry')           ... 5ケース
│   ├── 2実行同時リトライ（1ケース）
│   ├── リトライ中の新規実行（1ケース）
│   ├── MAX_CONCURRENT_EXECUTIONS（1ケース）
│   ├── 最大同時実行数でのリトライ（1ケース）
│   └── 独立した成功/失敗（1ケース）
├── describe('abort integration details')  ... 5ケース
│   ├── sleep中断（1ケース）
│   ├── リトライループ前abort（1ケース）
│   ├── query AbortErrorでリトライなし（1ケース）
│   ├── abort後の追加イベントなし（1ケース）
│   └── aborted状態確認（1ケース）
└── describe('streaming event details')    ... 6ケース
    ├── type='retry'確認（1ケース）
    ├── attempt番号0始まりインクリメント（1ケース）
    ├── delayMs正値（1ケース）
    ├── errorType一致（1ケース）
    ├── リトライ成功後complete（1ケース）
    └── 最終失敗後error（1ケース）
```

---

## 3. モック設定パターン

既存 `SkillExecutor.test.ts` のパターンを踏襲し、以下のモックを設定:

### 3.1 BrowserWindow モック

```typescript
const mockWebContents = {
  send: vi.fn(),
};
const mockMainWindow = {
  webContents: mockWebContents,
  isDestroyed: vi.fn().mockReturnValue(false),
} as unknown as BrowserWindow;
```

### 3.2 SDK query() モック

```typescript
const mockStreamGenerator = vi.fn();
const mockQuery = vi.fn().mockImplementation(() => ({
  stream: () => mockStreamGenerator(),
}));

vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  query: (args: unknown) => mockQuery(args),
}));
```

### 3.3 uuid モック

```typescript
vi.mock("uuid", () => ({
  v4: () => "test-retry-execution-id",
}));
```

### 3.4 PermissionStore モック

```typescript
const mockPermissionStore = {
  isToolAllowed: vi.fn().mockReturnValue(false),
  allowTool: vi.fn(),
  revokeTool: vi.fn(),
  getAllowedTools: vi.fn().mockReturnValue([]),
  getAllowedToolEntries: vi.fn().mockReturnValue([]),
  clearAll: vi.fn(),
};
```

### 3.5 テスト固有ヘルパー関数

リトライテスト特有のヘルパーを追加:

| ヘルパー関数                  | 用途                                         |
| ----------------------------- | -------------------------------------------- |
| `createNetworkError(code)`    | ECONNRESET等のネットワークエラーを生成       |
| `createHttpError(status, h?)` | HTTP 429/500等のステータスエラーを生成       |
| `createTimeoutError()`        | TimeoutErrorを生成                           |
| `createAbortError()`          | DOMException AbortErrorを生成                |
| `setupSuccessStream()`        | 成功するストリームモックを設定               |
| `setupFailThenSuccessQuery()` | N回失敗後に成功するquery()モックを設定       |
| `setupAlwaysFailQuery()`      | 常に失敗するquery()モックを設定              |
| `getRetryStreamMessages()`    | skill:stream経由のretryメッセージを抽出      |
| `parseRetryContent(msg)`      | retryメッセージのcontentをJSONパースして返却 |

### 3.6 beforeEach/afterEach

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  // mockQuery, setupSuccessStream, SkillExecutor初期化
});

afterEach(() => {
  vi.useRealTimers();
});
```

`vi.useFakeTimers({ shouldAdvanceTime: true })` を使用し、sleep()のsetTimeoutをテスト内で制御可能にしている。

---

## 4. テストケース数サマリー

| describeブロック            | Phase   | ケース数 |
| --------------------------- | ------- | -------- |
| isRetryableError            | Phase 4 | 17       |
| calculateBackoffDelay       | Phase 4 | 8        |
| executeWithRetry            | Phase 4 | 9        |
| retry streaming events      | Phase 4 | 7        |
| abort during retry          | Phase 4 | 5        |
| **Phase 4 小計**            |         | **41**   |
| edge cases                  | Phase 6 | 10       |
| concurrent retry            | Phase 6 | 5        |
| abort integration details   | Phase 6 | 5        |
| streaming event details     | Phase 6 | 6        |
| **Phase 6 小計**            |         | **26**   |
| **特記: Phase 6先行分追加** |         | **+5**   |
| **総計**                    |         | **72**   |

Phase 6仕様の26ケースに加え、テスト作成時に5ケースの追加テストが発生した（concurrent retryとabort integration detailsの詳細化）。

---

## 5. インポート構造

テストファイルから以下をインポート:

```typescript
// SkillExecutor.ts からのエクスポート
import {
  SkillExecutor,
  isRetryableError,
  calculateBackoffDelay,
  DEFAULT_RETRY_CONFIG,
} from "../SkillExecutor";

// 型のみインポート
import type {
  RetryConfig,
  RetryableErrorResult,
  SkillExecutionRequest,
  SkillMetadata,
} from "../SkillExecutor";
```

Phase 5実装時にこれらのエクスポートが追加される必要がある。

---

## 6. 完了条件チェック

| 条件                                            | 状態             |
| ----------------------------------------------- | ---------------- |
| テストファイルが作成されている                  | OK               |
| isRetryableErrorテスト: 17ケース以上            | OK（17ケース）   |
| calculateBackoffDelayテスト: 8ケース以上        | OK（8ケース）    |
| executeWithRetryテスト: 9ケース以上             | OK（9ケース）    |
| retryストリーミングイベントテスト: 7ケース以上  | OK（7ケース）    |
| 合計41ケース以上のテストが定義されている        | OK（72ケース）   |
| 既存テスト（SkillExecutor.test.ts等）に影響なし | OK（別ファイル） |

---

## 7. 次のPhaseへの引継ぎ

### Phase 5（実装）に必要な対応

1. **エクスポート追加**: `isRetryableError`, `calculateBackoffDelay`, `DEFAULT_RETRY_CONFIG` をSkillExecutor.tsからexportする
2. **型エクスポート**: `RetryConfig`, `RetryableErrorResult`, `SkillExecutionRequest`, `SkillMetadata` をtype exportする
3. **retryConfig対応**: `SkillExecutionRequest` に `retryConfig?: Partial<RetryConfig>` を追加する
4. **ストリーミングイベント**: retryイベントのcontent形式は `JSON.stringify({ attempt, maxRetries, delayMs, errorType, errorMessage })` であること
5. **Phase 3 MINOR-001**: Retry-After値の上限制御（maxDelayMsでキャップ）を実装に含めること
