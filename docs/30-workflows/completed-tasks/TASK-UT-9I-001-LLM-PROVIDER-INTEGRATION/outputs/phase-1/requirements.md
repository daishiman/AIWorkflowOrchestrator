# Phase 1: 要件定義書

## 調査結果（Step 0: P50チェック）

### 現状確認

- `LLMDocQueryAdapter` の stub は `ipc/index.ts` に存在しない（既に移行済み）
- `LLMDocQueryAdapter.ts` が `query()` の stub 実装を保持: `Generated content for: ${prompt.slice(0, 100)}`
- `@anthropic-ai/sdk` は `apps/desktop/package.json` に既にインストール済み（^0.71.2）
- `authKeyService.getKey()` 経由で API キーを取得する設計が確立済み
- `DocOperationResult<string>` 型が `@repo/shared` に定義済み

### 実装対象（実際）

- `apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts` の stub `query()` を実際の Anthropic SDK 呼び出しに置き換える
- `apps/desktop/src/main/services/llm/` ディレクトリに仕様書設計通りの `LLMClient.ts` / `AnthropicProvider.ts` を新規作成

---

## プロバイダ選定

| 項目           | 内容                                              |
| -------------- | ------------------------------------------------- |
| 対象プロバイダ | Anthropic Claude API                              |
| 推奨モデル     | claude-haiku-4-5-20251001（コスト効率・速度重視） |
| 認証スキーム   | API Key（`authKeyService.getKey()` 経由）         |
| SDK            | `@anthropic-ai/sdk`（既インストール済み）         |

---

## エラー分類コードテーブル

既存 `DocError` 型（`@repo/shared`）を活用しつつ、以下のコード体系で実装する：

| コード（文字列）  | DocError.code | カテゴリ         | 原因             | retryable |
| ----------------- | ------------- | ---------------- | ---------------- | --------- |
| `API_KEY_MISSING` | 2001          | BUSINESS         | APIキー未設定    | false     |
| `API_KEY_INVALID` | 2002          | BUSINESS         | APIキー無効      | false     |
| `RATE_LIMIT`      | 3002          | EXTERNAL_SERVICE | レート制限       | true      |
| `SERVER_ERROR`    | 3003          | EXTERNAL_SERVICE | サーバエラー     | true      |
| `TIMEOUT`         | 3001          | EXTERNAL_SERVICE | 30秒超過         | true      |
| `NETWORK_ERROR`   | 3004          | EXTERNAL_SERVICE | ネットワーク断   | true      |
| `INTERNAL_ERROR`  | 5001          | INTERNAL         | 予期しないエラー | false     |

---

## IPC契約拡張要件

既存の `DocOperationResult<string>` を維持（変更なし）：

```typescript
// 成功
{ success: true, data: string }
// 失敗（既存型で retryable は DocError.retryable フィールドに存在）
{ success: false, error: DocError }
```

`ipc/index.ts` の `queryFn` wrapper は変更不要（LLMDocQueryAdapter の内部実装のみ変更）。

---

## LLM呼び出しSLA

| 項目               | 値                                                  |
| ------------------ | --------------------------------------------------- |
| タイムアウト閾値   | 30秒                                                |
| リトライ上限       | 3回（指数バックオフ: 1s/2s/4s）                     |
| 対象リトライエラー | RATE_LIMIT / SERVER_ERROR / TIMEOUT / NETWORK_ERROR |
| 非リトライエラー   | API_KEY_MISSING / API_KEY_INVALID / INTERNAL_ERROR  |
