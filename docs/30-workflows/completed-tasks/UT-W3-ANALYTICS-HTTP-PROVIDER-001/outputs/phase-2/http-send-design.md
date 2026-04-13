# sendToAnalyticsProvider 設計

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 2                                                    |
| 機能名     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                    |
| タスク名   | 本番 analytics HTTP 送信実装（外部分析基盤への接続） |
| 作成日     | 2026-04-13                                           |
| ステータス | 完了                                                 |

---

## 関数シグネチャ

```typescript
interface SendToAnalyticsProviderInput {
  eventName: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

async function sendToAnalyticsProvider(
  event: SendToAnalyticsProviderInput,
): Promise<void>;
```

### 型の設計根拠

| フィールド  | 型                        | 根拠                                                            |
| ----------- | ------------------------- | --------------------------------------------------------------- |
| `eventName` | `string`                  | `AnalyticsSendRequest.eventName` と一致した                     |
| `payload`   | `Record<string, unknown>` | `AnalyticsSendRequest.payload` と一致した                       |
| `timestamp` | `number`                  | `AnalyticsSendRequest.timestamp` と一致した                     |
| 戻り値      | `Promise<void>`           | HTTP 送信結果を呼び出し元に返す必要がなかった。失敗は握り潰した |

`optedOut` フィールドは含めなかった。オプトアウトチェックは呼び出し元 (`analyticsHandler.ts`) が担当したため、`sendToAnalyticsProvider` が知る必要がなかった。

---

## 処理フロー設計

```
sendToAnalyticsProvider(event)
  │
  ├─ 1. URL ガード
  │    const url = process.env.ANALYTICS_ENDPOINT_URL;
  │    if (!url) return;
  │       └─ undefined / 空文字 → 即時 return（void）
  │
  ├─ 2. 環境ガード
  │    if (process.env.NODE_ENV !== "production") return;
  │       └─ development / test / undefined → 即時 return（void）
  │
  ├─ 3. タイムアウト設定
  │    const controller = new AbortController();
  │    const timeoutId = setTimeout(() => controller.abort(), 5000);
  │
  ├─ 4. try ブロック
  │    await fetch(url, {
  │      method: "POST",
  │      headers: { "Content-Type": "application/json" },
  │      body: JSON.stringify(event),
  │      signal: controller.signal,
  │    });
  │
  ├─ 5. catch ブロック
  │    catch {
  │      // 全例外を握り潰す
  │      // AbortError（タイムアウト）/ NetworkError / その他すべて
  │    }
  │
  └─ 6. finally ブロック
       finally {
         clearTimeout(timeoutId);
       }
```

---

## 実装コード設計

```typescript
interface SendToAnalyticsProviderInput {
  eventName: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

async function sendToAnalyticsProvider(
  event: SendToAnalyticsProviderInput,
): Promise<void> {
  const url = process.env.ANALYTICS_ENDPOINT_URL;
  if (!url) return;
  if (process.env.NODE_ENV !== "production") return;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      signal: controller.signal,
    });
  } catch {
    // HTTP 送信失敗は握り潰す（呼び出し元を壊さない設計）
  } finally {
    clearTimeout(timeoutId);
  }
}
```

---

## 呼び出し元の変更設計

`analyticsHandler.ts` の既存 TODO コメントを以下のように置き換えた。

**変更前**:

```typescript
// TODO: 本番環境での HTTP 送信実装（外部分析基盤への接続）
// await sendToAnalyticsProvider({ eventName, payload, timestamp });

return { success: true };
```

**変更後**:

```typescript
await sendToAnalyticsProvider({ eventName, payload, timestamp });

return { success: true };
```

`sendToAnalyticsProvider` は例外をスローしないため、`try-catch` での囲みは不要だった。ただし、防衛的に `await` を付けて非同期処理の完了を待つ設計とした。

---

## HTTP リクエスト仕様

| 項目         | 値                                                  |
| ------------ | --------------------------------------------------- |
| メソッド     | `POST`                                              |
| URL          | `process.env.ANALYTICS_ENDPOINT_URL`                |
| Content-Type | `application/json`                                  |
| ボディ       | `JSON.stringify({ eventName, payload, timestamp })` |
| タイムアウト | 5000ms（AbortController）                           |
| 認証ヘッダー | なし（本タスクのスコープ外）                        |

---

## ガード条件の設計根拠

### URL ガード（FR-05 対応）

```typescript
const url = process.env.ANALYTICS_ENDPOINT_URL;
if (!url) return;
```

- `undefined` と空文字列 `""` の両方を falsy 判定でまとめて処理した
- エラーをスローしなかった（サイレントスキップ）
- FR-05「静かにスキップ」の要件を満たした

### 環境ガード（FR-01 対応）

```typescript
if (process.env.NODE_ENV !== "production") return;
```

- `development`、`test`、`undefined` など production 以外を全てスキップした
- FR-01「`NODE_ENV === "production"` 時のみ送信」の要件を満たした
- 開発時の意図しない外部送信を防いだ

### URL ガードを環境ガードより先に置いた理由

URL が未設定であれば環境に関わらず送信する必要がなかった。早期 return でコードの分岐を最小化した。

---

## タイムアウト設計（FR-03 対応）

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);
try {
  await fetch(url, { ..., signal: controller.signal });
} catch {
  // AbortError を含む全例外を握り潰す
} finally {
  clearTimeout(timeoutId);  // タイムアウトタイマーをクリア
}
```

- 5000ms 後に `controller.abort()` が呼ばれ、fetch が `AbortError` をスローした
- `catch` ブロックが `AbortError` を握り潰した（FR-04 対応）
- `finally` の `clearTimeout` でタイマーリークを防いだ
- fetch が 5000ms より早く完了した場合もタイマーをクリアした

---

## エラー処理設計（FR-04、NFR-01 対応）

`catch` ブロックは以下の全例外を握り潰した。

| 例外の種類               | 発生状況                        | 処理                               |
| ------------------------ | ------------------------------- | ---------------------------------- |
| `AbortError`             | 5000ms タイムアウト             | 握り潰し                           |
| `TypeError`              | ネットワーク断・URL 不正        | 握り潰し                           |
| `SyntaxError`            | `JSON.stringify` 失敗（理論上） | 握り潰し                           |
| HTTP エラー（4xx / 5xx） | サーバーエラー応答              | 握り潰し（fetch は reject しない） |

HTTP 4xx/5xx はデフォルトで `fetch` が reject しないため、`catch` には到達しなかった。必要であれば `response.ok` チェックを追加できるが、本タスクではスコープ外とした。

---

## 型安全性確認（NFR-03 対応）

- `any` 型を使用しなかった
- `SendToAnalyticsProviderInput` の全フィールドに明示的な型を付けた
- `catch` ブロックの引数は省略した（TypeScript 4.0 以降の `catch (e)` 省略記法）
- `process.env` へのアクセスは `string | undefined` 型として扱った
