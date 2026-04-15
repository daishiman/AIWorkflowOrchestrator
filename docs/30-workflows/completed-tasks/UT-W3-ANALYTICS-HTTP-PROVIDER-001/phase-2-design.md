# Phase 2: 設計 - UT-W3-ANALYTICS-HTTP-PROVIDER-001

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| タスクID   | UT-W3-ANALYTICS-HTTP-PROVIDER-001 |
| Phase      | 2                                 |
| Phase 名   | 設計                              |
| カテゴリ   | implementation                    |
| 優先度     | Medium                            |
| ステータス | pending                           |
| 前提 Phase | Phase 1: 要件定義（完了後に着手） |
| 後続 Phase | Phase 3: 設計レビューゲート       |
| 起票日     | 2026-04-14                        |

---

## 目的

Phase 1 で定義した要件（FR-01〜FR-08、NFR-01〜NFR-08、AC-1〜AC-8）を満たすための技術設計を行う。以下の 5 つの設計項目を決定する。

1. `AnalyticsHttpProvider` クラス設計（インターフェース・メソッドシグネチャ）
2. `analytics:get-stats` IPC 4 層整合性設計
3. `analyticsStore` スキーマ拡張設計（sentCount / failedCount）
4. 指数バックオフリトライ・タイムアウト設計
5. DI 境界設計（fetch の注入・テスト容易性）

---

## 実行タスク

### Task 2-1: AnalyticsHttpProvider クラス設計

**目的**: `apps/desktop/src/main/services/analytics/AnalyticsHttpProvider.ts` の詳細設計を決定する。

#### 2-1-1: インターフェース定義

```typescript
// apps/desktop/src/main/services/analytics/AnalyticsHttpProvider.ts

/** HTTP 送信に必要なイベントペイロード */
export interface AnalyticsEvent {
  eventName: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

/** HTTP 送信結果 */
export interface AnalyticsSendResult {
  success: boolean;
  skipped?: boolean; // ANALYTICS_ENDPOINT_URL 未設定時
  error?: string; // 送信失敗時のエラーメッセージ
  retryCount?: number; // 実行したリトライ回数
}

/** AnalyticsHttpProvider の設定オプション */
export interface AnalyticsHttpProviderOptions {
  /** fetch 関数（DI 用: テスト時にモックに差し替える） */
  fetchFn?: typeof fetch;
  /** タイムアウト（ミリ秒）。デフォルト 5000ms */
  timeoutMs?: number;
  /** 最大リトライ回数。デフォルト 3 */
  maxRetries?: number;
  /** 初回リトライ待機時間（ミリ秒）。デフォルト 1000ms */
  baseRetryDelayMs?: number;
}

/** AnalyticsHttpProvider 公開インターフェース */
export interface IAnalyticsHttpProvider {
  send(event: AnalyticsEvent): Promise<AnalyticsSendResult>;
}
```

#### 2-1-2: クラス設計

```typescript
export class AnalyticsHttpProvider implements IAnalyticsHttpProvider {
  private readonly fetchFn: typeof fetch;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly baseRetryDelayMs: number;

  constructor(options: AnalyticsHttpProviderOptions = {}) {
    this.fetchFn = options.fetchFn ?? globalThis.fetch;
    this.timeoutMs = options.timeoutMs ?? 5000;
    this.maxRetries = options.maxRetries ?? 3;
    this.baseRetryDelayMs = options.baseRetryDelayMs ?? 1000;
  }

  async send(event: AnalyticsEvent): Promise<AnalyticsSendResult> {
    const endpoint = process.env.ANALYTICS_ENDPOINT_URL;
    if (!endpoint) {
      return { success: true, skipped: true };
    }
    // リトライループ → 内部実装詳細は Task 2-4 参照
    // エラーは catch で握り潰す → Task 2-5 参照
  }

  private async attemptSend(
    endpoint: string,
    event: AnalyticsEvent,
  ): Promise<void> {
    // AbortController によるタイムアウト → Task 2-4 参照
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

#### 2-1-3: 設計判断テーブル

| 判断項目                        | 決定内容                                    | 理由                                                          |
| ------------------------------- | ------------------------------------------- | ------------------------------------------------------------- |
| クラス配置パス                  | `apps/desktop/src/main/services/analytics/` | Electron サービスアーキテクチャの Main サービス配置規則に準拠 |
| fetch の取得方法                | `options.fetchFn ?? globalThis.fetch`       | DI パターンによりテスト時にモックを注入可能にする（NFR-02）   |
| `ANALYTICS_ENDPOINT_URL` の取得 | `process.env` からのみ取得                  | electron-store への保存禁止（NFR-04）・デプロイ設定で制御可能 |
| エンドポイント未設定時の返却値  | `{ success: true, skipped: true }`          | no-op 設計（AC-5）・success: false を返さない（正常スキップ） |
| エラー発生時の返却値            | `{ success: false, error: string }`         | IPC 全体を壊さない設計（FR-08, AC-2）                         |
| `IAnalyticsHttpProvider` 導入   | インターフェースを分離する                  | 将来の Provider 差し替え（例: BigQuery, Mixpanel）に対応可能  |

---

### Task 2-2: IPC 4 層整合性設計（analytics:get-stats）

**目的**: `analytics:get-stats` チャネルを Electron の IPC 4 層で正しく接続する設計を決定する。

#### 2-2-1: 4 層整合性テーブル

| 層               | 対象ファイル                                    | 変更内容                                                                                          | 実装パターン                        |
| ---------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------- |
| チャネル定義層   | `apps/desktop/src/preload/channels.ts`          | `ANALYTICS_GET_STATS: "analytics:get-stats"` を `IPC_CHANNELS` に追加                             | 既存 `ANALYTICS_SEND` の直下に追記  |
| ホワイトリスト層 | `apps/desktop/src/preload/channels.ts`          | `IPC_CHANNELS.ANALYTICS_GET_STATS` を `ALLOWED_INVOKE_CHANNELS` 配列に追加                        | `ANALYTICS_SEND` の直下に追記       |
| IPC ハンドラー層 | `apps/desktop/src/main/ipc/analyticsHandler.ts` | `ipcMain.handle(IPC_CHANNELS.ANALYTICS_GET_STATS, ...)` を `registerAnalyticsHandlers()` 内に追加 | 既存ハンドラーの後に追記            |
| contextBridge 層 | `apps/desktop/src/preload/index.ts`             | `analyticsApi.getStats: () => safeInvoke(ANALYTICS_GET_STATS)` を追加                             | 既存 `analyticsApi.send` の隣に追記 |

#### 2-2-2: analytics:get-stats レスポンス型設計

```typescript
/** analytics:get-stats レスポンス */
export interface AnalyticsStatsResponse {
  sentCount: number;
  failedCount: number;
  analyticsOptOut: boolean;
}
```

#### 2-2-3: IPC ハンドラー実装設計

```typescript
// analyticsHandler.ts への追加
ipcMain.handle(
  IPC_CHANNELS.ANALYTICS_GET_STATS,
  async (): Promise<AnalyticsStatsResponse> => {
    try {
      return {
        sentCount: analyticsStore.get("sentCount", 0) as number,
        failedCount: analyticsStore.get("failedCount", 0) as number,
        analyticsOptOut: analyticsStore.get("analyticsOptOut", false) === true,
      };
    } catch {
      // ストア読み取りエラー時はデフォルト値を返す
      return { sentCount: 0, failedCount: 0, analyticsOptOut: true };
    }
  },
);
```

#### 2-2-4: セキュリティ設計

| チェック項目                   | 設計決定                                                                                |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| `ALLOWED_INVOKE_CHANNELS` 登録 | 必須登録（未登録の場合、preload サンドボックスがブロックする）                          |
| contextBridge 公開スコープ     | `analyticsApi` オブジェクト内のメソッドとして公開（グローバル汚染防止）                 |
| 返却データの機密性             | `sentCount` / `failedCount` / `analyticsOptOut` のみ返却（エンドポイント URL は非公開） |

---

### Task 2-3: analyticsStore スキーマ拡張設計

**目的**: `analyticsHandler.ts` 内の `electron-store` スキーマに `sentCount` / `failedCount` を追加する設計を決定する。

#### 2-3-1: スキーマ拡張

```typescript
// 変更前
interface AnalyticsStoreSchema {
  analyticsOptOut?: boolean;
  [key: string]: unknown;
}

// 変更後
interface AnalyticsStoreSchema {
  analyticsOptOut?: boolean;
  sentCount?: number; // 送信成功累計カウンター
  failedCount?: number; // 送信失敗累計カウンター
  [key: string]: unknown;
}
```

#### 2-3-2: カウンター更新設計

`analyticsHandler.ts` の `analytics:send` ハンドラー内で、`AnalyticsHttpProvider.send()` の結果を受けてカウンターを更新する。

```typescript
// analyticsHandler.ts の analytics:send ハンドラー内（設計）
const result = await provider.send({ eventName, payload, timestamp });

if (!result.skipped) {
  if (result.success) {
    const current = analyticsStore.get("sentCount", 0) as number;
    analyticsStore.set("sentCount", current + 1);
  } else {
    const current = analyticsStore.get("failedCount", 0) as number;
    analyticsStore.set("failedCount", current + 1);
  }
}

return { success: result.success, error: result.error };
```

#### 2-3-3: カウンター設計判断テーブル

| 判断項目                 | 決定内容                                               | 理由                                                     |
| ------------------------ | ------------------------------------------------------ | -------------------------------------------------------- |
| カウンターの保存先       | `electron-store`（同一 `analyticsStore` インスタンス） | 既存ストアとの一貫性・アプリ再起動をまたいだ累計値の保持 |
| スキップ時のカウント     | スキップ時はカウントしない（`result.skipped` を確認）  | `ANALYTICS_ENDPOINT_URL` 未設定時は送信試行がないため    |
| カウンターの初期値       | `analyticsStore.get("sentCount", 0)` でデフォルト 0    | 既存ストアにキーが存在しない場合のフォールバック         |
| カウンターのリセット機能 | 本タスクではリセット機能を提供しない                   | スコープ外（ダッシュボード UI タスクで対応）             |

---

### Task 2-4: エラーハンドリング・リトライ設計

**目的**: 指数バックオフリトライ・タイムアウト・エラー非伝播の詳細設計を決定する。

#### 2-4-1: リトライ設計（指数バックオフ）

| リトライ回数   | 待機時間（デフォルト）      | 計算式                            |
| -------------- | --------------------------- | --------------------------------- |
| 1 回目試行     | 即時実行（待機なし）        | -                                 |
| 1 回リトライ   | 1000ms（1 秒）              | `baseRetryDelayMs * 2^0 = 1000ms` |
| 2 回リトライ   | 2000ms（2 秒）              | `baseRetryDelayMs * 2^1 = 2000ms` |
| 3 回リトライ   | 4000ms（4 秒）              | `baseRetryDelayMs * 2^2 = 4000ms` |
| 全リトライ失敗 | `{ success: false }` を返す | -                                 |

```typescript
// send() 内のリトライループ設計
async send(event: AnalyticsEvent): Promise<AnalyticsSendResult> {
  const endpoint = process.env.ANALYTICS_ENDPOINT_URL;
  if (!endpoint) {
    return { success: true, skipped: true };
  }

  let lastError: unknown;
  for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
    try {
      await this.attemptSend(endpoint, event);
      return { success: true, retryCount: attempt };
    } catch (err) {
      lastError = err;
      if (attempt < this.maxRetries) {
        await this.delay(this.baseRetryDelayMs * Math.pow(2, attempt));
      }
    }
  }

  const errorMessage =
    lastError instanceof Error ? lastError.message : "Unknown error";
  return {
    success: false,
    error: errorMessage,
    retryCount: this.maxRetries,
  };
}
```

#### 2-4-2: タイムアウト設計（AbortController）

```typescript
// attemptSend() の設計
private async attemptSend(
  endpoint: string,
  event: AnalyticsEvent,
): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    this.timeoutMs,
  );

  try {
    const response = await this.fetchFn(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } finally {
    clearTimeout(timer);
  }
}
```

#### 2-4-3: エラー非伝播設計

| エラー種別                        | 処理方針                                                              |
| --------------------------------- | --------------------------------------------------------------------- |
| ネットワーク接続エラー            | リトライ対象。全リトライ失敗後 `{ success: false }` を返す            |
| HTTP ステータスエラー（4xx, 5xx） | リトライ対象。全リトライ失敗後 `{ success: false }` を返す            |
| AbortError（タイムアウト）        | リトライ対象。全リトライ失敗後 `{ success: false }` を返す            |
| `process.env` 取得エラー          | `if (!endpoint) return { success: true, skipped: true }` で事前ガード |
| electron-store 書き込みエラー     | `analyticsHandler.ts` 側で catch して IPC レスポンスには影響させない  |

**重要**: `AnalyticsHttpProvider.send()` はいかなる例外もスローしない。全てのエラーは `catch` で補足し、`{ success: false, error: string }` として返却する。これにより `analyticsHandler.ts` の IPC ハンドラー全体が壊れることを防ぐ（FR-08、NFR-01 準拠）。

---

### Task 2-5: DI 境界設計

**目的**: `AnalyticsHttpProvider` のテスト容易性を確保するための DI（依存注入）境界を設計する。

#### 2-5-1: DI 境界図

```
analyticsHandler.ts
    │
    │ new AnalyticsHttpProvider({ fetchFn }) で DI
    │
    ▼
AnalyticsHttpProvider
    │
    │ this.fetchFn (デフォルト: globalThis.fetch)
    │       ↑ テスト時は vi.fn() を注入
    ▼
外部エンドポイント（ANALYTICS_ENDPOINT_URL）
```

#### 2-5-2: analyticsHandler.ts への接続設計

`analyticsHandler.ts` の `registerAnalyticsHandlers()` 関数で `AnalyticsHttpProvider` をインスタンス化し、`analytics:send` ハンドラー内で呼び出す。

```typescript
// analyticsHandler.ts の変更設計
import { AnalyticsHttpProvider } from "../services/analytics/AnalyticsHttpProvider";

// 関数スコープで Provider インスタンスを生成（シングルトン）
const analyticsProvider = new AnalyticsHttpProvider();

export function registerAnalyticsHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.ANALYTICS_SEND,
    async (_event, body: unknown): Promise<AnalyticsSendResponse> => {
      // ... 既存のバリデーション・オプトアウト確認 ...

      // TODO 解消: AnalyticsHttpProvider 経由で送信
      const result = await analyticsProvider.send({
        eventName,
        payload,
        timestamp,
      });

      // カウンター更新
      if (!result.skipped) {
        if (result.success) {
          analyticsStore.set(
            "sentCount",
            (analyticsStore.get("sentCount", 0) as number) + 1,
          );
        } else {
          analyticsStore.set(
            "failedCount",
            (analyticsStore.get("failedCount", 0) as number) + 1,
          );
        }
      }

      return { success: result.success, error: result.error };
    },
  );

  // analytics:get-stats ハンドラー追加
  ipcMain.handle(
    IPC_CHANNELS.ANALYTICS_GET_STATS,
    async (): Promise<AnalyticsStatsResponse> => {
      // ... Task 2-2 参照 ...
    },
  );
}
```

#### 2-5-3: テスト時の DI 活用設計

```typescript
// AnalyticsHttpProvider.test.ts でのテスト設計
import { AnalyticsHttpProvider } from "../AnalyticsHttpProvider";

describe("AnalyticsHttpProvider", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    process.env.ANALYTICS_ENDPOINT_URL = "https://example.com/analytics";
    mockFetch.mockReset();
  });

  afterEach(() => {
    delete process.env.ANALYTICS_ENDPOINT_URL;
  });

  it("should call fetch with correct payload (AC-1)", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    const provider = new AnalyticsHttpProvider({
      fetchFn: mockFetch,
      baseRetryDelayMs: 0, // テスト時は待機なし
    });
    const result = await provider.send({
      eventName: "test_event",
      payload: { key: "value" },
      timestamp: 1234567890,
    });
    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
```

#### 2-5-4: 選択肢比較と採用理由

| 比較軸                   | 案 A: fetch を DI で注入（採用） | 案 B: fetch をモジュールレベルでモック |
| ------------------------ | -------------------------------- | -------------------------------------- |
| テスト独立性             | 高い（インスタンスごとに制御）   | 中程度（モジュール副作用に依存）       |
| 型安全性                 | 高い（`typeof fetch` で型付け）  | 低い（`vi.mock()` は型が弱い）         |
| 実装の複雑度             | 低い（コンストラクタ引数のみ）   | 中程度（モック設定が冗長）             |
| 本番環境への影響         | なし（デフォルト値で動作）       | なし                                   |
| 将来の Provider 差し替え | 容易（インターフェース経由）     | 困難                                   |

**採用結論**: 案 A（fetch DI 注入）を採用する。コンストラクタオプションに `fetchFn` を持たせることで、テスト時のみモックを注入でき、本番環境では `globalThis.fetch` が自動的に使用される。

---

## 参照資料

### aiworkflow-requirements 資料

| 参照資料                             | パス                                                                          | 参照理由                                         |
| ------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------ |
| IPC Agent API 契約                   | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`          | analytics チャネル契約・safeInvoke パターン確認  |
| Electron セキュリティ API 設計       | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`  | contextBridge 公開 API 設計・ホワイトリスト管理  |
| Electron IPC セキュリティ            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | ALLOWED_INVOKE_CHANNELS 登録・サンドボックス設計 |
| エラーハンドリング設計               | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | 握り潰しパターン・success: false 返却設計        |
| 品質要件                             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | TDD・カバレッジ要件                              |
| Electron サービスアーキテクチャ      | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md` | サービスクラス配置・DI 境界パターン              |
| 要件定義書（FR/NFR/AC/IPC4層整合性） | `outputs/phase-1/requirements-summary.md`                                     | Phase 1 成果物                                   |

### プロジェクト内資料

| 参照資料                      | パス                                                                                                 | 参照理由                                             |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Phase 1 要件定義書            | `docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001/phase-1-requirements.md`                        | FR/NFR/AC 定義の参照                                 |
| analyticsHandler.ts 実装      | `apps/desktop/src/main/ipc/analyticsHandler.ts`                                                      | 変更対象・既存実装パターン確認                       |
| channels.ts（preload）        | `apps/desktop/src/preload/channels.ts`                                                               | チャネル追加先・ALLOWED_INVOKE_CHANNELS 登録パターン |
| preload/index.ts              | `apps/desktop/src/preload/index.ts`                                                                  | contextBridge 公開パターン確認                       |
| TASK-FIX-AUTHGUARD（Phase 2） | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-2-design.md` | 設計書フォーマット参照                               |

---

## 統合テスト連携

- Phase 4 では本 Phase の設計に基づき `AnalyticsHttpProvider.test.ts` のスケルトンを作成する
- Phase 4 のテストシナリオは AC-1〜AC-6 に対応させる
- Phase 6 では境界値（タイムアウト境界・リトライ回数境界）の拡充テストを追加する
- Phase 10 では AC-1〜AC-8 と Phase 4〜9 の証跡を突合し、未達があれば未タスク化する

---

## 多角的チェック観点

| 観点               | 適用 | チェック内容                                                                            |
| ------------------ | ---- | --------------------------------------------------------------------------------------- |
| セキュリティ       | 該当 | `ANALYTICS_ENDPOINT_URL` が contextBridge 経由で Renderer に漏洩しないことを確認        |
| エラーハンドリング | 該当 | `send()` が例外をスローしないことを設計段階で確認（全エラーを catch で補足）            |
| パフォーマンス     | 該当 | タイムアウト（5 秒）設定により Main プロセスが無限ブロックしないことを確認              |
| テスト容易性       | 該当 | fetch DI により vi.fn() モックが可能なことを設計段階で確認                              |
| 後方互換性         | 該当 | 既存 `analyticsHandler.ts` のバリデーション・オプトアウト設計を一切変更しないことを確認 |
| IPC 4 層整合性     | 該当 | channels.ts → ALLOWED_INVOKE_CHANNELS → ipcMain.handle → contextBridge の 4 層が一致    |
| 型安全性           | 該当 | `AnalyticsEvent`・`AnalyticsSendResult`・`AnalyticsStatsResponse` の型定義を確認        |

---

## 実行手順

### ステップ 1: AnalyticsHttpProvider クラス設計の確定

1. Task 2-1 の設計内容を最終確認する
2. インターフェース `IAnalyticsHttpProvider`・`AnalyticsEvent`・`AnalyticsSendResult` の型定義を確定する
3. コンストラクタオプション `AnalyticsHttpProviderOptions` を確定する

### ステップ 2: IPC 4 層整合性設計の確定

1. Task 2-2 の 4 層整合性テーブルを最終確認する
2. `analytics:get-stats` のチャネル名・レスポンス型・実装パターンを確定する
3. ALLOWED_INVOKE_CHANNELS への登録忘れがないことを確認する

### ステップ 3: analyticsStore スキーマ拡張の確定

1. Task 2-3 のスキーマ拡張内容を確認する
2. `sentCount` / `failedCount` の更新タイミング（送信結果受領後）を確定する
3. `skipped` 時のカウント除外ロジックを確定する

### ステップ 4: リトライ・タイムアウト設計の確定

1. Task 2-4 の指数バックオフパラメータ（最大 3 回、baseRetryDelayMs=1000ms）を確定する
2. AbortController によるタイムアウト（5 秒）設計を確定する
3. エラー非伝播設計（全エラーを catch で補足・success: false 返却）を確定する

### ステップ 5: DI 境界設計の確定

1. Task 2-5 の fetch DI 設計（`options.fetchFn ?? globalThis.fetch`）を確定する
2. `analyticsHandler.ts` への Provider 接続設計（シングルトンインスタンス生成）を確定する
3. テスト時の DI 活用パターン（`vi.fn()` を `fetchFn` に渡す）を確定する

### ステップ 6: 選択肢比較の文書化

1. Task 2-5 の選択肢比較テーブルを最終確認する
2. 案 A（fetch DI 注入）採用の理由が明文化されていることを確認する

---

## 成果物

| 成果物 | パス                                                                    | 説明           |
| ------ | ----------------------------------------------------------------------- | -------------- |
| 設計書 | `docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001/phase-2-design.md` | 本ドキュメント |

---

## 完了条件

- [ ] `AnalyticsHttpProvider` のインターフェース・クラス設計が確定している（Task 2-1）
- [ ] `analytics:get-stats` IPC 4 層整合性テーブル（channels.ts → ALLOWED_INVOKE_CHANNELS → ipcMain.handle → contextBridge）が完成している（Task 2-2）
- [ ] `analyticsStore` スキーマ拡張（sentCount / failedCount）とカウンター更新設計が確定している（Task 2-3）
- [ ] 指数バックオフリトライ（最大 3 回）・タイムアウト（5 秒）の詳細設計が確定している（Task 2-4）
- [ ] エラー非伝播設計（全エラーを catch・success: false 返却）が確定している（Task 2-4）
- [ ] fetch DI 境界設計と analyticsHandler.ts への接続設計が確定している（Task 2-5）
- [ ] 案 A / 案 B の比較と採用理由が明文化されている（Task 2-5）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## タスク 100% 実行確認【必須】

Phase 2 完了を宣言する前に、以下の全項目にチェックを入れること。

- [ ] Task 2-1: AnalyticsHttpProvider クラス設計（インターフェース・メソッドシグネチャ）が確定している
- [ ] Task 2-2: IPC 4 層整合性設計（analytics:get-stats）が確定している
- [ ] Task 2-3: analyticsStore スキーマ拡張設計（sentCount / failedCount）が確定している
- [ ] Task 2-4: エラーハンドリング・リトライ設計（指数バックオフ・タイムアウト・エラー非伝播）が確定している
- [ ] Task 2-5: DI 境界設計（fetch 注入・analyticsHandler.ts 接続・テスト時 DI 活用）が確定している
- [ ] artifacts.json の phase-2 ステータスが `completed` に更新されている

---

## 次 Phase

**Phase 3: 設計レビューゲート** へ進む。

本 Phase で確定した設計内容を MAJOR / MINOR の観点でレビューし、設計の妥当性を検証する。MAJOR 判定が出た場合は Phase 2 に戻り設計を修正する。
