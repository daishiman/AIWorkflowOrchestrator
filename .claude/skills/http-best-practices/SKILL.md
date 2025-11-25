# HTTP Best Practices スキル

## 概要

HTTPプロトコルを正しく効率的に活用するためのベストプラクティス集。
ステータスコード、冪等性、コネクション管理、ヘッダー設計など、
堅牢なAPI通信を実現するための知識を提供します。

## 対象エージェント

- @gateway-dev
- @backend-architect
- @api-doc-writer

## 含まれるリソース

### 1. HTTPステータスコード (resources/status-codes.md)
- 2xx 成功系の適切な使い分け
- 4xx クライアントエラーの設計
- 5xx サーバーエラーのハンドリング
- カスタムエラーレスポンス設計

### 2. 冪等性設計 (resources/idempotency.md)
- HTTPメソッドと冪等性
- 冪等キーの実装
- リトライセーフなAPI設計
- 重複リクエスト防止

### 3. コネクション管理 (resources/connection-management.md)
- Keep-Alive最適化
- コネクションプーリング
- HTTP/2マルチプレキシング
- コネクションタイムアウト設計

### 4. ヘッダー設計 (resources/headers-best-practices.md)
- 標準ヘッダーの活用
- カスタムヘッダー設計
- Content-Type/Accept交渉
- キャッシュ制御ヘッダー

## ワークフロー

```
1. 要件分析
   ├── APIの特性を把握
   ├── 必要なステータスコードを特定
   └── 冪等性要件を確認

2. 設計
   ├── エンドポイント設計
   ├── エラーレスポンス設計
   └── ヘッダー戦略策定

3. 実装
   ├── HTTPクライアント設定
   ├── ステータスコードハンドリング
   └── コネクション管理設定

4. 検証
   ├── エラーシナリオテスト
   ├── 冪等性テスト
   └── パフォーマンステスト
```

## ベストプラクティス

### ステータスコード選択

```typescript
// 成功レスポンス
200 OK           // 取得・更新成功（ボディあり）
201 Created      // リソース作成成功（Locationヘッダー必須）
202 Accepted     // 非同期処理受付
204 No Content   // 削除成功（ボディなし）

// クライアントエラー
400 Bad Request  // リクエスト形式エラー
401 Unauthorized // 認証エラー
403 Forbidden    // 認可エラー
404 Not Found    // リソース未存在
409 Conflict     // 競合（楽観ロック失敗など）
422 Unprocessable Entity // バリデーションエラー
429 Too Many Requests    // レート制限

// サーバーエラー
500 Internal Server Error // 予期しないエラー
502 Bad Gateway           // 上流サービスエラー
503 Service Unavailable   // 一時的利用不可
504 Gateway Timeout       // 上流タイムアウト
```

### 冪等性設計

```typescript
// 冪等キー実装
interface IdempotentRequest {
  headers: {
    'Idempotency-Key': string;  // クライアント生成UUID
  };
}

// サーバー側実装
async function handleIdempotentRequest(
  key: string,
  handler: () => Promise<Response>
): Promise<Response> {
  // 既存レスポンスをチェック
  const cached = await cache.get(`idempotency:${key}`);
  if (cached) return cached;

  // 新規実行
  const response = await handler();

  // キャッシュに保存（24時間）
  await cache.set(`idempotency:${key}`, response, 86400);

  return response;
}
```

### コネクション最適化

```typescript
// Node.js HTTPエージェント設定
import { Agent } from 'http';

const agent = new Agent({
  keepAlive: true,          // コネクション再利用
  keepAliveMsecs: 30000,    // Keep-Alive間隔
  maxSockets: 50,           // 最大同時接続数
  maxFreeSockets: 10,       // 待機コネクション数
  timeout: 30000,           // ソケットタイムアウト
});

// fetch使用時
const response = await fetch(url, {
  agent,
  signal: AbortSignal.timeout(10000),
});
```

## 品質チェックリスト

### 設計時
- [ ] 各エンドポイントに適切なステータスコードが定義されているか？
- [ ] エラーレスポンス形式が統一されているか？
- [ ] 冪等でないエンドポイントに冪等キーが実装されているか？

### 実装時
- [ ] Content-Type/Acceptが正しく設定されているか？
- [ ] タイムアウトが適切に設定されているか？
- [ ] コネクションプールが設定されているか？

### 運用時
- [ ] ステータスコード別のメトリクスが収集されているか？
- [ ] コネクションリークが監視されているか？
- [ ] エラー率にアラートが設定されているか？

## 参考資料

- **RFC 7231**: HTTP/1.1 Semantics and Content
- **RFC 7232**: HTTP/1.1 Conditional Requests
- **RFC 9110**: HTTP Semantics
- **『RESTful Web APIs』** Leonard Richardson著

## 関連スキル

- api-client-patterns: APIクライアント実装パターン
- retry-strategies: リトライ・サーキットブレーカー
- rate-limiting: レート制限実装
