# Phase 2 設計サマリー - Skill Docs Runtime Integration

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| タスクID   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |
| Phase      | 2                                  |
| 作成日     | 2026-03-16                         |
| ステータス | completed                          |

## 設計方針

| 方針               | 内容                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| Runtime 契約の統一 | queryFn 実装は docs 生成専用でも runtime 契約は Task01 に合わせる      |
| Stub 排除          | production 経路では stub を許容しない                                  |
| Main Process 完結  | Renderer 依存を増やさず Main Process だけで解決する                    |
| 既存契約の保全     | 4 チャンネル IPC + 4 層セキュリティを維持する                          |
| Access Matrix 消費 | 各 surface 独自の mode 判定を持たず Task01 の access matrix を消費する |

---

## T-2-1: queryFn Provider Adapter 設計

### LLMDocQueryAdapter インターフェース

```typescript
/**
 * Skill Docs 生成用の LLM クエリアダプター。
 * SkillDocGenerator の queryFn を production LLM クライアントに差し替える。
 *
 * 配置先: packages/shared/src/types/skill-docs.ts（型定義）
 * 実装先: apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts
 */
interface LLMDocQueryAdapter {
  /**
   * LLM に prompt を送信し、生成結果を返す。
   * タイムアウト（30秒）は呼び出し元の Promise.race で制御する。
   *
   * @param prompt - ドキュメント生成用のプロンプト文字列
   * @returns 生成結果を含む DocOperationResult
   */
  query(prompt: string): Promise<DocOperationResult<string>>;

  /**
   * LLM プロバイダが利用可能かを判定する。
   * API key が AuthKeyService に登録済みかつ有効であれば true を返す。
   * API key 未設定の場合は false を返す（silent fallback 禁止）。
   */
  isAvailable(): Promise<boolean>;

  /**
   * 現在のプロバイダ名を返す。
   * ログ出力とエラーメッセージに使用する。
   *
   * @returns "anthropic" | "openai" 等のプロバイダ識別子
   */
  getProviderName(): string;
}
```

### Provider Adapter の責務境界

| 責務                   | 詳細                                                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| API key 検証           | AuthKeyService.getKey(providerName) で取得。未設定時は `await isAvailable()` が `false` を返す              |
| LLM クライアント初期化 | provider 固有の SDK（Anthropic SDK / OpenAI SDK）を初期化する。初期化失敗時は INTERNAL エラー（5001）を返す |
| queryFn 注入           | `adapter.query.bind(adapter)` を SkillDocGenerator の constructor に渡す                                    |
| guidance mode 初期化   | `await adapter.isAvailable() === false` の場合、guidance 用の代替 queryFn を注入する                        |

### SkillDocGenerator の DI 拡張方針

既存の Constructor Injection パターンを維持する。IPC 初期化時に adapter の状態に応じて queryFn を決定する。

```typescript
// 既存: constructor(queryFn: LLMQueryFn) のまま維持
// LLMQueryFn = (prompt: string) => Promise<{ content: string }>

// IPC 初期化時の DI 経路（ipc/index.ts）
const adapter = new LLMDocQueryAdapter(authKeyService, runtimeResolver);

const available = await adapter.isAvailable();

const queryFn: LLMQueryFn = available
  ? async (prompt: string) => {
      const result = await adapter.query(prompt);
      if (!result.success || result.data === undefined) {
        throw new DocGenerationError(result.error);
      }
      return { content: result.data };
    }
  : async (_prompt: string) => {
      throw new DocGenerationError({
        code: 2001,
        category: "BUSINESS",
        message: "API key is not configured",
        retryable: false,
        guidance: {
          reason: "API key が設定されていません",
          action: "Settings 画面で API key を登録してください",
          handoffAvailable: true,
        },
      });
    };

const skillDocGenerator = new SkillDocGenerator(queryFn);
```

### Adapter 生成と DI 経路

```
AuthKeyService (既存) ──┐
                        ├──> LLMDocQueryAdapter ──> adapter.query.bind(adapter)
RuntimeResolver (既存) ─┘                                  │
                                                           ▼
                                              SkillDocGenerator(queryFn)
                                                           │
                                                           ▼
                                              registerSkillDocsHandlers(mainWindow, skillDocGenerator)
```

- AuthKeyService と RuntimeResolver は `ipc/index.ts` に既に生成済み
- LLMDocQueryAdapter は IPC 初期化時に生成する（P34: 遅延初期化パターンは不要、IPC 初期化時点で全依存が利用可能）
- SkillDocGenerator の constructor シグネチャは変更しない（既存テスト 64 件との後方互換を維持）

---

## T-2-2: 失敗ポリシー設計

### タイムアウトポリシー

| 項目         | 値                                                                    |
| ------------ | --------------------------------------------------------------------- |
| タイムアウト | 30 秒（既存 `LLM_TIMEOUT_MS = 30000` の Promise.race を維持）         |
| 発生時の応答 | `DocOperationResult<T>` の error フィールドにコード 3001 を設定する   |
| UI 表示      | timeout-guidance 状態に遷移し、再試行と terminal handoff を同時に表示 |

```typescript
// タイムアウト発生時のレスポンス
{
  success: false,
  error: {
    code: 3001,
    category: 'EXTERNAL_SERVICE',
    message: 'LLM request timed out after 30 seconds',
    retryable: true,
    guidance: {
      reason: 'LLM からの応答が 30 秒以内に得られませんでした',
      action: '再試行するか、terminal で手動作成してください',
      handoffAvailable: true,
    },
  },
}
```

### リトライポリシー

| 項目             | 値                                                                         |
| ---------------- | -------------------------------------------------------------------------- |
| 対象             | retryable エラー（3000-3999: EXTERNAL_SERVICE, 4000-4999: INFRASTRUCTURE） |
| 最大リトライ回数 | 2 回（初回含め最大 3 回実行）                                              |
| バックオフ方式   | exponential backoff: 1 秒 -> 2 秒                                          |
| 429 応答         | Retry-After ヘッダ値を優先する。ヘッダがない場合は backoff に従う          |
| 非 retryable     | Business Error（2000-2999）、Internal Error（5000-5999）はリトライしない   |

```typescript
// リトライ実装の擬似コード
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 1000;

async function queryWithRetry(
  adapter: LLMDocQueryAdapter,
  prompt: string,
): Promise<DocOperationResult<string>> {
  let lastResult: DocOperationResult<string>;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    lastResult = await adapter.query(prompt);

    if (lastResult.success) return lastResult;
    if (!lastResult.error?.retryable) return lastResult;

    if (attempt < MAX_RETRIES) {
      const delay =
        lastResult.error.code === 3002 && lastResult.error.retryAfterMs
          ? lastResult.error.retryAfterMs
          : BASE_DELAY_MS * Math.pow(2, attempt);
      await sleep(delay);
    }
  }

  return lastResult!;
}
```

### 失敗ポリシー分類表（7 種別）

| エラー種別           | コード | カテゴリ         | retryable | UI 表示                                 | Primary CTA       | Secondary CTA   |
| -------------------- | ------ | ---------------- | --------- | --------------------------------------- | ----------------- | --------------- |
| API key 未設定       | 2001   | BUSINESS         | false     | guidance block（設定導線）              | Settings へ遷移   | terminal で作成 |
| API key 無効         | 2002   | BUSINESS         | false     | guidance block（再設定導線）            | Settings へ遷移   | terminal で作成 |
| LLM timeout          | 3001   | EXTERNAL_SERVICE | true      | timeout block + retry + handoff         | 再試行            | terminal で作成 |
| LLM rate limit (429) | 3002   | EXTERNAL_SERVICE | true      | rate limit block + 待機時間表示         | 待機中...（自動） | terminal で作成 |
| LLM server error     | 3003   | EXTERNAL_SERVICE | true      | error block + retry                     | 再試行            | guidance を確認 |
| IPC 通信エラー       | 4001   | INFRASTRUCTURE   | true      | error block                             | 再試行            | -               |
| 内部エラー           | 5001   | INTERNAL         | false     | error block（サニタイズ済みメッセージ） | guidance を確認   | -               |

### エラーサニタイゼーション

- コード 5001（内部エラー）: 詳細メッセージを "Internal error occurred" に正規化する
- パス情報、API key 値、スタックトレースを Renderer に送らない（4 層検証の Layer 4 維持）
- P55 準拠: エラーメッセージ内のパスに正規表現メタ文字が含まれる場合は `escapeRegExp()` でエスケープする

---

## T-2-3: IPC エラー正規化設計

### DocOperationResult<T> 型定義

```typescript
/**
 * Skill Docs IPC レスポンスの統一型。
 * 既存の { success, error } 形式を拡張し、構造化されたエラー情報を含める。
 *
 * 配置先: packages/shared/src/types/skill-docs.ts
 */
interface DocOperationResult<T> {
  success: boolean;
  data?: T;
  error?: DocError;
}

interface DocError {
  /** エラーコード（02-code-quality.md の 5 カテゴリに準拠） */
  code: number;

  /** エラーカテゴリ */
  category:
    | "VALIDATION"
    | "BUSINESS"
    | "EXTERNAL_SERVICE"
    | "INFRASTRUCTURE"
    | "INTERNAL";

  /** ユーザー向けエラーメッセージ（サニタイズ済み） */
  message: string;

  /** リトライ可能か */
  retryable: boolean;

  /** 429 応答時の待機時間（ミリ秒） */
  retryAfterMs?: number;

  /** UI 表示用のガイダンス情報 */
  guidance?: DocErrorGuidance;
}

interface DocErrorGuidance {
  /** エラーが発生した理由（ユーザー向け） */
  reason: string;

  /** ユーザーが取るべきアクション */
  action: string;

  /** terminal handoff が利用可能か */
  handoffAvailable: boolean;
}
```

### ジェネリクス伝播

| IPC チャンネル       | DocOperationResult の T | 備考                       |
| -------------------- | ----------------------- | -------------------------- |
| skill:docs:generate  | `GeneratedDoc`          | 既存 GeneratedDoc 型を使用 |
| skill:docs:preview   | `string`                | プレビュー HTML 文字列     |
| skill:docs:export    | `{ path: string }`      | エクスポート先ファイルパス |
| skill:docs:templates | `DocTemplate[]`         | テンプレート一覧           |

### 既存レスポンスとの後方互換

現状の `{ success: boolean; error?: string }` 形式から `DocOperationResult<T>` への移行は以下の方針で行う:

1. `success` フィールドの意味は変更しない
2. `error` フィールドを `string` から `DocError` オブジェクトに拡張する
3. Renderer 側は `result.error?.message` で従来の文字列メッセージを取得可能
4. 新規フィールド（`code`, `category`, `retryable`, `guidance`）は追加のみ（既存フィールドの削除・変更なし）

### エラーマッピング関数

```typescript
/**
 * LLM SDK のエラーを DocError に正規化する。
 * 配置先: apps/desktop/src/main/services/skill/DocErrorMapper.ts
 */
function mapToDocError(error: unknown): DocError {
  // 429 Rate Limit
  if (isRateLimitError(error)) {
    return {
      code: 3002,
      category: "EXTERNAL_SERVICE",
      message: "Rate limit exceeded",
      retryable: true,
      retryAfterMs: extractRetryAfter(error),
      guidance: {
        reason: "API のレート制限に到達しました",
        action: "しばらく待ってから再試行してください",
        handoffAvailable: true,
      },
    };
  }

  // 5xx Server Error
  if (isServerError(error)) {
    return {
      code: 3003,
      category: "EXTERNAL_SERVICE",
      message: "LLM service temporarily unavailable",
      retryable: true,
      guidance: {
        reason: "LLM サービスが一時的に利用できません",
        action: "再試行してください",
        handoffAvailable: true,
      },
    };
  }

  // Internal Error (catch-all)
  return {
    code: 5001,
    category: "INTERNAL",
    message: "Internal error occurred",
    retryable: false,
    guidance: {
      reason: "予期しないエラーが発生しました",
      action: "問題が続く場合はアプリを再起動してください",
      handoffAvailable: false,
    },
  };
}
```

---

## T-2-4: Capability Resolver 統合設計

### SkillDocsCapabilityResolver

```typescript
/**
 * Skill Docs の capability を判定する Resolver。
 * Task01 の access matrix を消費し、surface 独自の mode 判定を持たない。
 *
 * 配置先: apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts
 */
type SkillDocsCapability =
  | "integrated-api"
  | "guidance-only"
  | "terminal-handoff";

class SkillDocsCapabilityResolver {
  constructor(
    private readonly authKeyService: AuthKeyService,
    private readonly runtimeResolver: RuntimeResolver,
  ) {}

  /**
   * 現在の capability を判定する。
   * Main Process で完結し、Renderer 依存を持たない。
   */
  resolve(): SkillDocsCapability {
    const hasValidApiKey = this.authKeyService.hasValidKey();
    const isLLMReachable = this.runtimeResolver.isLLMReachable();

    if (hasValidApiKey && isLLMReachable) {
      return "integrated-api";
    }
    if (!hasValidApiKey) {
      return "guidance-only";
    }
    // hasValidApiKey && !isLLMReachable
    return "terminal-handoff";
  }
}
```

### 判定ロジック表

| API key 有効 | LLM 到達可能 | capability       | UI 初期状態    | docs 生成  |
| ------------ | ------------ | ---------------- | -------------- | ---------- |
| true         | true         | integrated-api   | ready          | 実行する   |
| false        | -            | guidance-only    | guidance-only  | 実行しない |
| true         | false        | terminal-handoff | error-guidance | 実行しない |

### IPC ハンドラでの capability チェック

```typescript
// skill:docs:generate ハンドラ内
async function handleGenerate(
  event: IpcMainInvokeEvent,
  args: DocGenerationRequest,
): Promise<DocOperationResult<GeneratedDoc>> {
  // 1. capability 判定（生成前に実行）
  const capability = capabilityResolver.resolve();

  if (capability === "guidance-only") {
    return {
      success: false,
      error: {
        code: 2001,
        category: "BUSINESS",
        message: "API key is not configured",
        retryable: false,
        guidance: {
          reason: "API key が設定されていません",
          action: "Settings 画面で API key を登録してください",
          handoffAvailable: true,
        },
      },
    };
  }

  if (capability === "terminal-handoff") {
    return {
      success: false,
      error: {
        code: 3003,
        category: "EXTERNAL_SERVICE",
        message: "LLM service is not reachable",
        retryable: false,
        guidance: {
          reason: "LLM サービスに接続できません",
          action: "terminal で手動作成してください",
          handoffAvailable: true,
        },
      },
    };
  }

  // 2. integrated-api: docs 生成を実行
  return await generateWithRetry(skillDocGenerator, args);
}
```

### Capability Resolver の DI 経路

```
AuthKeyService (既存) ──┐
                        ├──> SkillDocsCapabilityResolver
RuntimeResolver (既存) ─┘              │
                                       ▼
                        registerSkillDocsHandlers(
                          mainWindow,
                          skillDocGenerator,
                          capabilityResolver  // 新規パラメータ
                        )
```

- `registerSkillDocsHandlers` のシグネチャに `capabilityResolver` を追加する
- 既存の 2 引数（mainWindow, skillDocGenerator）は維持する（第 3 引数として追加）

---

## T-2-5: UI 状態遷移設計

### 状態遷移図

```
                               ┌──────────────────────────────────────┐
                               │                                      │
                               ▼                                      │
[guidance-only] ◄── (API key 未設定で初期表示)                        │
      │                                                               │
      │ (Settings で API key 登録後)                                   │
      ▼                                                               │
  [ready] ────(generate click)────> [generating]                      │
                                       │                              │
                                       ├──(success)──> [result]       │
                                       │                              │
                                       ├──(timeout)──> [timeout-guidance] ──(再試行)──┘
                                       │                              │
                                       ├──(rate limit)──> [rate-limit-wait] ──(待機完了)──┘
                                       │                              │
                                       └──(error)──> [error-guidance] ──(再試行)──┘
```

### 各状態の UI 構成

| 状態             | 表示内容                                         | Primary CTA       | Secondary CTA   |
| ---------------- | ------------------------------------------------ | ----------------- | --------------- |
| ready            | 生成可能、プロバイダ名と実行経路の表示           | docs を生成       | -               |
| generating       | 進捗インジケータ（スピナー）、経過時間、中断手段 | キャンセル        | -               |
| result           | 生成結果サマリー、セクション一覧                 | エクスポート      | プレビュー      |
| timeout-guidance | 失敗理由 + 再試行導線 + terminal handoff 導線    | 再試行            | terminal で作成 |
| rate-limit-wait  | 待機時間カウントダウン + handoff 導線            | 待機中...（自動） | terminal で作成 |
| error-guidance   | エラー詳細 + 次のアクション案内                  | 再試行            | guidance を確認 |
| guidance-only    | API key 未設定の説明 + Settings 導線 + handoff   | Settings へ       | terminal で作成 |

### 状態遷移トリガー

| 遷移元           | 遷移先           | トリガー                                           |
| ---------------- | ---------------- | -------------------------------------------------- |
| ready            | generating       | ユーザーが「docs を生成」をクリック                |
| generating       | result           | `DocOperationResult.success === true`              |
| generating       | timeout-guidance | `error.code === 3001`                              |
| generating       | rate-limit-wait  | `error.code === 3002`                              |
| generating       | error-guidance   | `error.code` が 3003, 4001, 5001 のいずれか        |
| timeout-guidance | generating       | ユーザーが「再試行」をクリック                     |
| rate-limit-wait  | generating       | 待機時間経過後に自動再試行                         |
| error-guidance   | generating       | ユーザーが「再試行」をクリック（retryable の場合） |
| guidance-only    | ready            | Settings 画面で API key を登録後に画面復帰         |

### マイクロコピー方針

Task01 UI/UX 正本に準拠し、以下の原則を適用する:

1. **失敗理由の明示**: 「なぜ失敗したか」を一文で説明する
2. **次のアクション**: 「何をすればよいか」を具体的に示す
3. **同一ブロック表示**: timeout では再試行と handoff を同じブロックに表示する
4. **破壊的表現の回避**: 「エラー」「失敗」ではなく「応答待ち」「接続待ち」等の中性的表現を使用する

| エラーコード | guidance.reason                                | guidance.action                               |
| ------------ | ---------------------------------------------- | --------------------------------------------- |
| 2001         | API key が設定されていません                   | Settings 画面で API key を登録してください    |
| 2002         | API key が無効です                             | Settings 画面で API key を再設定してください  |
| 3001         | LLM からの応答が 30 秒以内に得られませんでした | 再試行するか、terminal で手動作成してください |
| 3002         | API のレート制限に到達しました                 | しばらく待ってから再試行してください          |
| 3003         | LLM サービスが一時的に利用できません           | 再試行してください                            |
| 4001         | アプリ内通信でエラーが発生しました             | 再試行してください                            |
| 5001         | 予期しないエラーが発生しました                 | 問題が続く場合はアプリを再起動してください    |

---

## 変更対象ファイル一覧

### 新規作成（3 ファイル）

| ファイル                                                              | 責務                      |
| --------------------------------------------------------------------- | ------------------------- |
| `apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts`          | LLM プロバイダアダプター  |
| `apps/desktop/src/main/services/skill/DocErrorMapper.ts`              | エラー正規化マッパー      |
| `apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts` | capability 判定リゾルバー |

### 変更（3 ファイル）

| ファイル                                              | 変更内容                                                   |
| ----------------------------------------------------- | ---------------------------------------------------------- |
| `packages/shared/src/types/skill-docs.ts`             | DocOperationResult / DocError / DocErrorGuidance 型追加    |
| `apps/desktop/src/main/ipc/index.ts`                  | adapter / resolver 生成、DI 注入経路の更新                 |
| `apps/desktop/src/main/ipc/handlers/skillHandlers.ts` | capability チェック追加、DocOperationResult レスポンス対応 |

### 型定義更新箇所

| 型名                  | ファイル                                  | 変更内容 |
| --------------------- | ----------------------------------------- | -------- |
| DocOperationResult<T> | `packages/shared/src/types/skill-docs.ts` | 新規追加 |
| DocError              | `packages/shared/src/types/skill-docs.ts` | 新規追加 |
| DocErrorGuidance      | `packages/shared/src/types/skill-docs.ts` | 新規追加 |
| LLMDocQueryAdapter    | `packages/shared/src/types/skill-docs.ts` | 新規追加 |
| SkillDocsCapability   | `packages/shared/src/types/skill-docs.ts` | 新規追加 |

---

## 設計判断の根拠

| 判断                                               | 根拠                                                                                   |
| -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Constructor Injection を維持                       | 既存テスト 64 件との後方互換を維持するため。DI シグネチャ変更は P44/P45 のリスクが高い |
| adapter を IPC 初期化時に生成                      | P34（遅延初期化）は不要。authKeyService / runtimeResolver は IPC 初期化時点で利用可能  |
| DocOperationResult を shared パッケージに配置      | Renderer 側でもエラー判定が必要なため。P23/P32 準拠で型定義を一箇所に集約              |
| リトライは adapter 内部ではなく IPC ハンドラで制御 | リトライ状態を IPC レスポンスとして Renderer に伝播する必要があるため                  |
| registerSkillDocsHandlers に第 3 引数を追加        | 既存の 2 引数を維持しつつ capability チェックを追加。既存呼び出し元の修正は 1 箇所のみ |
