# API非推奨化（Deprecation）プロセス

## 非推奨化の原則

### なぜ非推奨化が重要か

1. **クライアントへの配慮**: 突然の廃止はサービス障害を引き起こす
2. **移行時間の確保**: 開発者に十分な移行時間を与える
3. **信頼性の維持**: 安定したAPIプロバイダーとしての評価
4. **法的・契約上の義務**: SLAやサービス契約の遵守

### 非推奨化の基本ルール

| ルール       | 説明                               |
| ------------ | ---------------------------------- |
| 最低告知期間 | 4週間以上（重要なAPIは12週間以上） |
| 並行稼働期間 | 新旧両方を最低4週間提供            |
| 移行サポート | ガイド、ツール、サポートを提供     |
| 段階的廃止   | 急激な変更を避ける                 |

---

## 4段階の非推奨化プロセス

### Stage 1: 告知期間（Announcement）

**期間**: 廃止の2-4週間前

**アクション**:

1. ドキュメント更新
2. ブログ/ニュースレターで告知
3. ダッシュボード通知
4. 開発者メーリングリストへ送信

**ドキュメント更新例**:

```markdown
## ⚠️ 非推奨通知

`GET /api/v1/users` は **2025年6月1日** に廃止予定です。

### 代替エンドポイント

`GET /api/v2/users` をご使用ください。

### 移行ガイド

詳細は [移行ガイド](/docs/migration/v1-to-v2) を参照してください。

### サポート

ご質問は api-support@example.com までお問い合わせください。
```

### Stage 2: 警告期間（Warning）

**期間**: 廃止の4-8週間前

**アクション**:

1. Deprecation HTTPヘッダー追加
2. レスポンスに警告メッセージ追加
3. 使用状況のモニタリング開始
4. 大口利用者への個別連絡

**HTTPヘッダー実装**:

```typescript
function addDeprecationHeaders(
  response: Response,
  sunsetDate: Date,
  successorUrl: string,
): void {
  // RFC 8594 Sunset Header
  response.headers.set("Sunset", sunsetDate.toUTCString());

  // RFC 8594 Deprecation Header
  response.headers.set("Deprecation", "true");
  // または Unix timestamp
  // response.headers.set('Deprecation', `@${Math.floor(sunsetDate.getTime() / 1000)}`);

  // 後継リソースへのリンク
  response.headers.set("Link", `<${successorUrl}>; rel="successor-version"`);

  // カスタム警告
  response.headers.set(
    "X-API-Warn",
    `This endpoint is deprecated and will be removed on ${sunsetDate.toISOString().split("T")[0]}`,
  );
}
```

**レスポンスボディ警告**:

```json
{
  "data": { ... },
  "meta": {
    "deprecation_warning": {
      "message": "This endpoint is deprecated",
      "sunset_date": "2025-06-01",
      "successor": "/api/v2/users",
      "documentation": "https://docs.example.com/migration/v1-to-v2"
    }
  }
}
```

### Stage 3: 移行サポート期間（Migration Support）

**期間**: 廃止の4-12週間前

**アクション**:

1. 新旧両方のエンドポイントを並行稼働
2. 移行ツールやスクリプトの提供
3. 使用量の継続的モニタリング
4. サポートチケットへの優先対応

**並行稼働の実装**:

```typescript
// 両バージョンを同時にサポート
// app/api/v1/users/route.ts
export async function GET(request: Request) {
  // v1ロジック（非推奨だが動作）
  const response = await handleV1Users(request);

  // 非推奨ヘッダーを追加
  addDeprecationHeaders(response, new Date("2025-06-01"), "/api/v2/users");

  return response;
}

// app/api/v2/users/route.ts
export async function GET(request: Request) {
  // v2ロジック（推奨）
  return handleV2Users(request);
}
```

**使用量モニタリング**:

```typescript
// 非推奨エンドポイントの使用を記録
async function trackDeprecatedUsage(
  endpoint: string,
  clientId: string,
  version: string,
): Promise<void> {
  await analytics.track({
    event: "deprecated_api_call",
    properties: {
      endpoint,
      clientId,
      version,
      timestamp: new Date().toISOString(),
    },
  });
}
```

### Stage 4: 廃止実行（Sunset）

**期間**: 廃止日以降

**アクション**:

1. エンドポイント無効化
2. 410 Gone レスポンス返却
3. 代替エンドポイントへの案内
4. 廃止完了の告知

**廃止後のレスポンス**:

```typescript
// 廃止されたエンドポイント
export async function GET(request: Request) {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: "ENDPOINT_REMOVED",
        message: "This endpoint has been permanently removed",
        details: {
          removed_date: "2025-06-01",
          successor: "/api/v2/users",
          documentation: "https://docs.example.com/migration/v1-to-v2",
        },
        retryable: false,
      },
    }),
    {
      status: 410, // Gone
      headers: {
        "Content-Type": "application/json",
        Link: '</api/v2/users>; rel="successor-version"',
      },
    },
  );
}
```

---

## OpenAPI での非推奨マーキング

### エンドポイント非推奨

```yaml
paths:
  /api/v1/users:
    get:
      deprecated: true
      summary: "[非推奨] ユーザー一覧取得"
      description: |
        ⚠️ **このエンドポイントは非推奨です**

        **廃止日**: 2025年6月1日
        **代替**: `GET /api/v2/users`
        **移行ガイド**: [Migration Guide](/docs/migration/v1-to-v2)
      x-sunset-date: "2025-06-01"
      x-successor: "/api/v2/users"
```

### パラメータ非推奨

```yaml
parameters:
  - name: page
    in: query
    deprecated: true
    description: |
      ⚠️ 非推奨: 代わりに `cursor` パラメータを使用してください
    schema:
      type: integer
```

### スキーマプロパティ非推奨

```yaml
components:
  schemas:
    User:
      type: object
      properties:
        firstName:
          type: string
          deprecated: true
          description: "非推奨: fullName を使用してください"
        lastName:
          type: string
          deprecated: true
          description: "非推奨: fullName を使用してください"
        fullName:
          type: string
          description: "ユーザーのフルネーム"
```

---

## 通知テンプレート

### 初回告知メール

```markdown
件名: [重要] API v1 廃止のお知らせ

お客様各位

いつも弊社サービスをご利用いただきありがとうございます。

API v1 のサポート終了についてお知らせいたします。

## 概要

- 対象: API v1 全エンドポイント
- 廃止日: 2025年6月1日
- 代替: API v2

## 影響を受けるエンドポイント

- GET /api/v1/users
- POST /api/v1/users
- ...

## 移行ガイド

https://docs.example.com/migration/v1-to-v2

## サポート

ご不明点は api-support@example.com までお問い合わせください。

何卒よろしくお願いいたします。
```

### 廃止1週間前リマインダー

```markdown
件名: [リマインダー] API v1 廃止まであと1週間

お客様各位

API v1 の廃止まで残り1週間となりました。

現在もAPI v1をご利用中のお客様は、
お早めにAPI v2への移行をお願いいたします。

## 廃止日: 2025年6月1日

## 未移行の場合

廃止日以降、API v1へのリクエストは
410 Gone エラーを返します。

## サポート

移行でお困りの場合は、
api-support@example.com までご連絡ください。
```

---

## チェックリスト

### 非推奨化前

- [ ] 代替エンドポイントが準備されているか
- [ ] 移行ガイドが作成されているか
- [ ] サポート体制が整っているか
- [ ] 告知計画が策定されているか

### 非推奨化中

- [ ] Deprecation/Sunset ヘッダーが設定されているか
- [ ] 使用量モニタリングが有効か
- [ ] 大口利用者に個別連絡したか
- [ ] サポートチケットに対応しているか

### 廃止後

- [ ] 410 Gone レスポンスが返されているか
- [ ] 代替エンドポイントへの誘導が機能しているか
- [ ] 廃止完了の告知を行ったか
- [ ] ドキュメントを更新したか
