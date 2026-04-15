# 実装ガイド - UT-W3-ANALYTICS-HTTP-PROVIDER-001

## 1. 中学生レベルの説明

`AnalyticsHttpProvider` は、アプリの中で起きた出来事を外部の分析サービスへ届ける「郵便配達員」のような役目です。

たとえば、手紙を送るときは次のことを確認します。

1. 宛先があるか
2. 途中で止まっていないか
3. 届かなければ少し待ってもう一度送るか

このタスクでも考え方は同じです。

- `ANALYTICS_ENDPOINT_URL` があれば送る
- なければ何もしない
- 失敗しても最大 3 回まで送り直す
- それでもだめなら失敗記録だけ残して、アプリ自体は止めない

つまり、分析データは「送れたら送る」「送れなくても本体は守る」という設計です。

## 2. 技術者向け詳細

### 2-1. current contract

| 層               | ファイル                                                            | 役割                                                             |
| ---------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Main サービス    | `apps/desktop/src/main/services/analytics/AnalyticsHttpProvider.ts` | HTTP POST 送信、リトライ、タイムアウト、送信統計更新             |
| Main IPC         | `apps/desktop/src/main/ipc/analyticsHandler.ts`                     | 入力検証、opt-out 最終判定、provider 呼び出し、stats 返却        |
| Preload チャネル | `apps/desktop/src/preload/channels.ts`                              | `analytics:send` / `analytics:get-stats` の公開と whitelist 登録 |
| Preload API      | `apps/desktop/src/preload/index.ts`                                 | `analyticsAPI.send()` / `analyticsAPI.getStats()` を公開         |
| Preload 型       | `apps/desktop/src/preload/types.ts`                                 | `AnalyticsAPI` と `Window.analyticsAPI` の型定義                 |

### 2-2. `AnalyticsHttpProvider` の役割

`AnalyticsHttpProvider` は、`AnalyticsEvent` を JSON 化して `ANALYTICS_ENDPOINT_URL` に送る責務だけを持つ。
Main IPC の opt-out 判定や UI ロジックは持たない。

```ts
export interface AnalyticsEvent {
  eventName: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

export interface AnalyticsSendResult {
  success: boolean;
  skipped?: boolean;
  error?: string;
  retryCount?: number;
}
```

### 2-3. 送信フロー

1. `process.env.ANALYTICS_ENDPOINT_URL` を読む
2. 未設定または空文字なら `{ success: true, skipped: true }` を返す
3. `fetchFn` で POST 送信する
4. 失敗時は最大 3 回まで指数バックオフで再試行する
5. 成功したら `sentCount` を 1 増やす
6. 全失敗したら `failedCount` を 1 増やす

### 2-4. リトライと判定

| 判定                                 | 挙動                    |
| ------------------------------------ | ----------------------- |
| HTTP 2xx                             | 成功として終了          |
| HTTP 4xx                             | 非 retryable として終了 |
| HTTP 5xx                             | retryable として再試行  |
| `AbortError` / `TimeoutError`        | retryable として再試行  |
| `TypeError` などのネットワークエラー | retryable として再試行  |

指数バックオフは次の定数で制御する。

| 定数               | 値     | 意味                     |
| ------------------ | ------ | ------------------------ |
| `timeoutMs`        | `5000` | 1 回あたりのタイムアウト |
| `maxRetries`       | `3`    | 追加リトライ回数         |
| `baseRetryDelayMs` | `1000` | 1 回目の待機時間         |

### 2-5. `analyticsHandler.ts` の実装意図

- 既存の validation と opt-out 判定は Main 側で維持する
- `AnalyticsHttpProvider.send()` の戻り値はそのまま返す
- `skipped` を落とさない
- 開発環境だけ `console.info` でイベントを見える化する

```ts
const result = await analyticsProvider.send({
  eventName,
  payload,
  timestamp,
});

return result;
```

### 2-6. `analytics:get-stats`

`analytics:get-stats` は Renderer から送信統計を読むための補助 API で、次の 3 項目だけ返す。

```ts
{
  sentCount: number;
  failedCount: number;
  analyticsOptOut: boolean;
}
```

### 2-7. エラーケース

| ケース                          | 挙動                         | 後方互換性                           |
| ------------------------------- | ---------------------------- | ------------------------------------ |
| `ANALYTICS_ENDPOINT_URL` 未設定 | no-op で成功扱い             | 既存動作を壊さない                   |
| `optedOut` が true              | 送信せず `skipped: true`     | 既存の opt-out 契約を維持            |
| ストア読み取り失敗              | 安全側で `skipped: true`     | 送信事故を防ぐ                       |
| 4xx 応答                        | 失敗として終了、再試行しない | サーバー入力エラーを無駄に増幅しない |
| 5xx / network / timeout         | 最大 3 回再試行              | 一時障害に耐える                     |

### 2-8. current facts

| 項目                 | 値                                                                                                                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 変更対象             | `apps/desktop/src/main/ipc/analyticsHandler.ts` / `apps/desktop/src/main/services/analytics/AnalyticsHttpProvider.ts` / `apps/desktop/src/preload/channels.ts` / `apps/desktop/src/preload/index.ts` / `apps/desktop/src/preload/types.ts` |
| stats 用追加チャネル | `analytics:get-stats`                                                                                                                                                                                                                      |
| 送信統計             | `sentCount` / `failedCount`                                                                                                                                                                                                                |
| 送信停止条件         | `optedOut` / `analyticsOptOut` / `ANALYTICS_ENDPOINT_URL` 未設定                                                                                                                                                                           |
| 返却安全策           | 失敗しても例外を外へ投げない                                                                                                                                                                                                               |

### 2-9. 実装上の要点

- provider は fetch を DI できるのでテストで差し替えやすい
- handler は provider の結果をそのまま返すので `skipped` が欠落しない
- stats は provider と handler で同じ store を共有する
- URL や payload をログへ出す範囲は最小限に保つ
