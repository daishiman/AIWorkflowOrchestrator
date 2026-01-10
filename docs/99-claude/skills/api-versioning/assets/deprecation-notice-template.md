# 非推奨通知テンプレート

## OpenAPI 非推奨マーキング

```yaml
# エンドポイント非推奨
paths:
  /api/v1/{{endpoint}}:
    { { method } }:
      deprecated: true
      summary: "[非推奨] {{summary}}"
      description: |
        ⚠️ **このエンドポイントは非推奨です**

        | 項目 | 内容 |
        |------|------|
        | 廃止日 | {{sunset_date}} |
        | 代替 | `{{http_method}} {{successor_endpoint}}` |
        | 移行ガイド | [Migration Guide]({{migration_guide_url}}) |

        ## 変更理由
        {{deprecation_reason}}

        ## 移行手順
        1. {{migration_step_1}}
        2. {{migration_step_2}}
        3. {{migration_step_3}}
      x-sunset-date: "{{sunset_date}}"
      x-successor: "{{successor_endpoint}}"
      x-migration-guide: "{{migration_guide_url}}"
```

---

## HTTPヘッダー実装

```typescript
// lib/api/deprecation.ts

export interface DeprecationConfig {
  sunsetDate: Date;
  successorUrl: string;
  migrationGuideUrl?: string;
}

export function addDeprecationHeaders(
  headers: Headers,
  config: DeprecationConfig,
): void {
  // RFC 8594 Sunset Header
  headers.set("Sunset", config.sunsetDate.toUTCString());

  // Deprecation Header
  headers.set("Deprecation", "true");

  // Link to successor
  headers.set("Link", `<${config.successorUrl}>; rel="successor-version"`);

  // Custom warning header
  const formattedDate = config.sunsetDate.toISOString().split("T")[0];
  headers.set(
    "X-API-Warn",
    `This endpoint is deprecated. Sunset: ${formattedDate}. ` +
      `Use ${config.successorUrl} instead.`,
  );

  // Migration guide link (if provided)
  if (config.migrationGuideUrl) {
    headers.append(
      "Link",
      `<${config.migrationGuideUrl}>; rel="deprecation"; type="text/html"`,
    );
  }
}

// 使用例
// addDeprecationHeaders(response.headers, {
//   sunsetDate: new Date('2025-06-01'),
//   successorUrl: '/api/v2/users',
//   migrationGuideUrl: 'https://docs.example.com/migration/v1-to-v2'
// });
```

---

## レスポンスボディ警告

```typescript
// lib/api/deprecation-response.ts

export interface DeprecationWarning {
  message: string;
  sunset_date: string;
  successor: string;
  documentation?: string;
}

export function createDeprecationWarning(
  sunsetDate: Date,
  successorEndpoint: string,
  migrationGuideUrl?: string,
): DeprecationWarning {
  return {
    message: "This endpoint is deprecated and will be removed soon",
    sunset_date: sunsetDate.toISOString().split("T")[0],
    successor: successorEndpoint,
    ...(migrationGuideUrl && { documentation: migrationGuideUrl }),
  };
}

// レスポンスに含める
// {
//   "data": { ... },
//   "meta": {
//     "deprecation_warning": createDeprecationWarning(...)
//   }
// }
```

---

## 通知メールテンプレート

### 初回告知

```markdown
件名: [重要] API非推奨のお知らせ - {{endpoint_name}}

{{user_name}} 様

いつも弊社サービスをご利用いただきありがとうございます。

以下のAPIエンドポイントが非推奨となりましたのでお知らせいたします。

## 対象エンドポイント

- `{{http_method}} {{endpoint_path}}`

## 廃止予定日

**{{sunset_date}}**

## 代替エンドポイント

`{{http_method}} {{successor_endpoint}}`

## 移行ガイド

{{migration_guide_url}}

## 影響

廃止日以降、対象エンドポイントへのリクエストは
`410 Gone` エラーを返します。

## サポート

移行でお困りの場合は、{{support_email}}までお問い合わせください。

ご理解とご協力をお願いいたします。

---

{{company_name}}
API Support Team
```

### リマインダー（廃止2週間前）

```markdown
件名: [リマインダー] API廃止まであと2週間 - {{endpoint_name}}

{{user_name}} 様

先日ご案内いたしました以下のAPIエンドポイントの廃止まで
残り2週間となりました。

## 対象

`{{http_method}} {{endpoint_path}}`

## 廃止日

**{{sunset_date}}**（あと2週間）

## ご利用状況

過去30日間の該当エンドポイントへのリクエスト数: **{{request_count}}件**

まだ移行がお済みでない場合は、お早めにご対応ください。

## 移行ガイド

{{migration_guide_url}}

## サポート

{{support_email}}

よろしくお願いいたします。
```

### 最終通知（廃止1日前）

```markdown
件名: [最終通知] 明日API廃止 - {{endpoint_name}}

{{user_name}} 様

**重要**: 以下のAPIエンドポイントは明日廃止されます。

## 対象

`{{http_method}} {{endpoint_path}}`

## 廃止日

**{{sunset_date}}**（明日）

## 廃止後の動作

- 該当エンドポイントへのリクエストは `410 Gone` を返します
- レスポンスボディに代替エンドポイント情報が含まれます

## 緊急サポート

移行が間に合わない場合は、至急 {{support_email}} までご連絡ください。

よろしくお願いいたします。
```

---

## Slack/Discord通知テンプレート

```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "⚠️ API非推奨通知"
      }
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*エンドポイント:*\n`{{http_method}} {{endpoint_path}}`"
        },
        {
          "type": "mrkdwn",
          "text": "*廃止日:*\n{{sunset_date}}"
        },
        {
          "type": "mrkdwn",
          "text": "*代替:*\n`{{http_method}} {{successor_endpoint}}`"
        },
        {
          "type": "mrkdwn",
          "text": "*移行ガイド:*\n<{{migration_guide_url}}|ドキュメント>"
        }
      ]
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "サポート: {{support_email}}"
        }
      ]
    }
  ]
}
```

---

## ドキュメント非推奨バナー

```html
<!-- docs/api/v1/users.md のトップに挿入 -->
<div class="deprecation-banner">
  <h3>⚠️ 非推奨通知</h3>
  <p>このエンドポイントは <strong>{{sunset_date}}</strong> に廃止されます。</p>
  <p>代替: <code>{{http_method}} {{successor_endpoint}}</code></p>
  <p>
    <a href="{{migration_guide_url}}">移行ガイドを見る →</a>
  </p>
</div>

<style>
  .deprecation-banner {
    background-color: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 24px;
  }
  .deprecation-banner h3 {
    color: #856404;
    margin-top: 0;
  }
  .deprecation-banner p {
    color: #856404;
    margin-bottom: 8px;
  }
  .deprecation-banner a {
    color: #856404;
    font-weight: bold;
  }
</style>
```
