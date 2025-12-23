# チャット履歴エクスポートAPI設計書

---

title: チャット履歴エクスポートAPI設計書
version: 1.0.0
author: @api-doc-writer
created: 2025-12-20
status: draft
parent_task: T-01-3
openapi_spec: openapi-chat-export.yaml
dependencies:

- requirements-functional.md (FR-010, FR-011)
- metadata-specification.md
- component-design.md

---

## 1. 概要

### 1.1 目的

チャット履歴をMarkdown/JSON形式でエクスポートするためのREST APIエンドポイントを定義する。本設計はElectronデスクトップアプリケーション内部での使用を想定し、Next.js App Routerのroute handlersで実装する。

### 1.2 設計原則

| 原則           | 説明                                           |
| -------------- | ---------------------------------------------- |
| RESTful設計    | リソース指向、適切なHTTPメソッドとステータス   |
| バージョニング | URLパスにバージョンプレフィックス（`/api/v1`） |
| 型安全性       | Zod + TypeScriptによる入出力バリデーション     |
| エラー標準化   | RFC 7807準拠のProblem Details形式              |
| セキュリティ   | 認証必須（セッションベース）、入力サニタイズ   |
| 冪等性         | GETリクエストは冪等、副作用なし                |

### 1.3 技術スタック

| 技術        | バージョン | 用途                     |
| ----------- | ---------- | ------------------------ |
| Next.js     | 15.x       | App Router (route.ts)    |
| TypeScript  | 5.x        | 型定義                   |
| Zod         | 3.x        | ランタイムバリデーション |
| Drizzle ORM | 0.38.x     | データベースアクセス     |
| OpenAPI     | 3.1.0      | API仕様書                |

---

## 2. エンドポイント一覧

### 2.1 エクスポートAPI

| メソッド | パス                                   | 説明                             |
| -------- | -------------------------------------- | -------------------------------- |
| GET      | `/api/v1/sessions/{sessionId}/export`  | 単一セッションのエクスポート     |
| POST     | `/api/v1/sessions/export/batch`        | 複数セッションの一括エクスポート |
| GET      | `/api/v1/sessions/{sessionId}/preview` | エクスポートプレビュー（軽量）   |

### 2.2 関連エンドポイント（参照用）

| メソッド | パス                                    | 説明               |
| -------- | --------------------------------------- | ------------------ |
| GET      | `/api/v1/sessions`                      | セッション一覧取得 |
| GET      | `/api/v1/sessions/{sessionId}`          | セッション詳細取得 |
| GET      | `/api/v1/sessions/{sessionId}/messages` | メッセージ一覧取得 |

---

## 3. エンドポイント詳細

### 3.1 単一セッションエクスポート

**`GET /api/v1/sessions/{sessionId}/export`**

セッション内の全メッセージまたは選択したメッセージをエクスポートする。

#### 3.1.1 リクエスト

**パスパラメータ**

| パラメータ | 型     | 必須 | 説明                     |
| ---------- | ------ | ---- | ------------------------ |
| sessionId  | string | Yes  | セッションID（ULID形式） |

**クエリパラメータ**

| パラメータ      | 型                   | 必須 | デフォルト | 説明                                         |
| --------------- | -------------------- | ---- | ---------- | -------------------------------------------- |
| format          | `markdown` \| `json` | No   | `markdown` | エクスポート形式                             |
| range           | `all` \| `selected`  | No   | `all`      | エクスポート範囲                             |
| messageIds      | string[]             | No   | -          | 選択メッセージID（range=selectedの場合必須） |
| includeMetadata | boolean              | No   | `true`     | LLMメタデータを含めるか                      |
| download        | boolean              | No   | `false`    | ファイルダウンロードモード                   |

**リクエスト例**

```http
GET /api/v1/sessions/01HWQV8N4G0PXRJ6K8M2Y3Z5/export?format=markdown&range=all HTTP/1.1
Host: localhost:3000
Authorization: Bearer <token>
Accept: text/markdown
```

```http
GET /api/v1/sessions/01HWQV8N4G0PXRJ6K8M2Y3Z5/export?format=json&range=selected&messageIds=msg1,msg2,msg3 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <token>
Accept: application/json
```

#### 3.1.2 レスポンス

**成功レスポンス (200 OK) - Markdown形式**

```http
HTTP/1.1 200 OK
Content-Type: text/markdown; charset=utf-8
Content-Disposition: attachment; filename="React開発についての質問_20251220_143000.md"
X-Export-Format: markdown
X-Message-Count: 24
X-Total-Tokens: 4520

# React開発についての質問

**作成日**: 2025-12-20 14:30:00
**メッセージ数**: 24件
**総トークン数**: 4,520

---

## ユーザー (2025-12-20 14:30:15)

ReactのuseEffectフックについて教えてください。

---

## アシスタント (2025-12-20 14:30:18)

**モデル**: anthropic/claude-3-5-sonnet-20241022
**トークン**: 入力: 45, 出力: 320

useEffectは副作用を扱うためのReact Hookです...

---
```

**成功レスポンス (200 OK) - JSON形式**

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Disposition: attachment; filename="React開発についての質問_20251220_143000.json"
X-Export-Format: json
X-Message-Count: 24
X-Total-Tokens: 4520

{
  "session": {
    "id": "01HWQV8N4G0PXRJ6K8M2Y3Z5",
    "title": "React開発についての質問",
    "createdAt": "2025-12-20T14:30:00.000Z",
    "updatedAt": "2025-12-20T15:45:00.000Z",
    "messageCount": 24,
    "totalTokens": 4520,
    "tags": ["react", "frontend"]
  },
  "messages": [
    {
      "id": "01HWQV8N4G0PXRJ6K8M2Y3Z6",
      "role": "user",
      "content": "ReactのuseEffectフックについて教えてください。",
      "timestamp": "2025-12-20T14:30:15.000Z",
      "attachments": []
    },
    {
      "id": "01HWQV8N4G0PXRJ6K8M2Y3Z7",
      "role": "assistant",
      "content": "useEffectは副作用を扱うためのReact Hookです...",
      "timestamp": "2025-12-20T14:30:18.000Z",
      "llmMetadata": {
        "provider": "anthropic",
        "model": "claude-3-5-sonnet-20241022",
        "version": "20241022",
        "temperature": 0.7,
        "maxTokens": 4096,
        "tokenUsage": {
          "inputTokens": 45,
          "outputTokens": 320,
          "totalTokens": 365
        },
        "responseTimeMs": 1234
      }
    }
  ],
  "exportMetadata": {
    "exportedAt": "2025-12-20T16:00:00.000Z",
    "format": "json",
    "range": "all",
    "version": "1.0.0"
  }
}
```

#### 3.1.3 エラーレスポンス

**400 Bad Request - 不正なパラメータ**

```json
{
  "type": "https://api.example.com/errors/validation",
  "title": "Validation Error",
  "status": 400,
  "detail": "format must be 'markdown' or 'json'",
  "instance": "/api/v1/sessions/01HWQV8N4G0PXRJ6K8M2Y3Z5/export",
  "errors": [
    {
      "field": "format",
      "message": "Invalid format: 'xml'. Allowed values: markdown, json",
      "code": "INVALID_FORMAT"
    }
  ]
}
```

**404 Not Found - セッションが見つからない**

```json
{
  "type": "https://api.example.com/errors/not-found",
  "title": "Session Not Found",
  "status": 404,
  "detail": "Session with ID '01HWQV8N4G0PXRJ6K8M2Y3Z5' not found",
  "instance": "/api/v1/sessions/01HWQV8N4G0PXRJ6K8M2Y3Z5/export"
}
```

**422 Unprocessable Entity - 選択メッセージが不正**

```json
{
  "type": "https://api.example.com/errors/unprocessable",
  "title": "Invalid Message Selection",
  "status": 422,
  "detail": "One or more message IDs do not belong to the specified session",
  "instance": "/api/v1/sessions/01HWQV8N4G0PXRJ6K8M2Y3Z5/export",
  "invalidMessageIds": ["msg999", "msg888"]
}
```

---

### 3.2 一括エクスポート

**`POST /api/v1/sessions/export/batch`**

複数セッションを一括でエクスポートする。ZIPアーカイブとして返却。

#### 3.2.1 リクエスト

**リクエストボディ**

```json
{
  "sessionIds": [
    "01HWQV8N4G0PXRJ6K8M2Y3Z5",
    "01HWQV8N4G0PXRJ6K8M2Y3Z8",
    "01HWQV8N4G0PXRJ6K8M2Y3Z9"
  ],
  "format": "markdown",
  "includeMetadata": true
}
```

**リクエストスキーマ**

| フィールド      | 型                   | 必須 | 説明                                        |
| --------------- | -------------------- | ---- | ------------------------------------------- |
| sessionIds      | string[]             | Yes  | エクスポート対象のセッションID              |
| format          | `markdown` \| `json` | No   | エクスポート形式（デフォルト: markdown）    |
| includeMetadata | boolean              | No   | LLMメタデータを含めるか（デフォルト: true） |

#### 3.2.2 レスポンス

**成功レスポンス (200 OK)**

```http
HTTP/1.1 200 OK
Content-Type: application/zip
Content-Disposition: attachment; filename="chat_export_20251220_160000.zip"
X-Export-Count: 3
X-Total-Messages: 72

[ZIPバイナリデータ]
```

**ZIP内のファイル構成**

```
chat_export_20251220_160000.zip
├── React開発についての質問.md
├── TypeScript型定義の相談.md
├── データベース設計の質問.md
└── manifest.json
```

**manifest.json**

```json
{
  "exportedAt": "2025-12-20T16:00:00.000Z",
  "format": "markdown",
  "sessions": [
    {
      "id": "01HWQV8N4G0PXRJ6K8M2Y3Z5",
      "filename": "React開発についての質問.md",
      "messageCount": 24
    },
    {
      "id": "01HWQV8N4G0PXRJ6K8M2Y3Z8",
      "filename": "TypeScript型定義の相談.md",
      "messageCount": 18
    },
    {
      "id": "01HWQV8N4G0PXRJ6K8M2Y3Z9",
      "filename": "データベース設計の質問.md",
      "messageCount": 30
    }
  ],
  "totalMessages": 72,
  "version": "1.0.0"
}
```

#### 3.2.3 エラーレスポンス

**400 Bad Request - セッション数超過**

```json
{
  "type": "https://api.example.com/errors/validation",
  "title": "Too Many Sessions",
  "status": 400,
  "detail": "Maximum 50 sessions can be exported at once",
  "instance": "/api/v1/sessions/export/batch",
  "maxAllowed": 50,
  "requested": 75
}
```

**207 Multi-Status - 一部失敗**

```json
{
  "type": "https://api.example.com/responses/partial-success",
  "title": "Partial Export Success",
  "status": 207,
  "detail": "Some sessions could not be exported",
  "instance": "/api/v1/sessions/export/batch",
  "results": [
    {
      "sessionId": "01HWQV8N4G0PXRJ6K8M2Y3Z5",
      "status": "success",
      "filename": "React開発についての質問.md"
    },
    {
      "sessionId": "01HWQV8N4G0PXRJ6K8M2Y3Z8",
      "status": "error",
      "error": {
        "code": "SESSION_NOT_FOUND",
        "message": "Session not found"
      }
    }
  ],
  "successCount": 1,
  "errorCount": 1
}
```

---

### 3.3 エクスポートプレビュー

**`GET /api/v1/sessions/{sessionId}/preview`**

エクスポート前のプレビューデータを取得（ファイルサイズ推定、メッセージ数確認用）。

#### 3.3.1 リクエスト

```http
GET /api/v1/sessions/01HWQV8N4G0PXRJ6K8M2Y3Z5/preview?format=markdown HTTP/1.1
Host: localhost:3000
Authorization: Bearer <token>
```

#### 3.3.2 レスポンス

```json
{
  "sessionId": "01HWQV8N4G0PXRJ6K8M2Y3Z5",
  "title": "React開発についての質問",
  "messageCount": 24,
  "totalTokens": 4520,
  "estimatedFileSize": {
    "markdown": 15234,
    "json": 28456
  },
  "dateRange": {
    "firstMessage": "2025-12-20T14:30:15.000Z",
    "lastMessage": "2025-12-20T15:45:00.000Z"
  },
  "modelUsage": {
    "anthropic/claude-3-5-sonnet-20241022": 12,
    "openai/gpt-4": 0
  }
}
```

---

## 4. 共通仕様

### 4.1 認証

全エンドポイントはセッションベースの認証を必要とする。

**リクエストヘッダー**

```http
Authorization: Bearer <session_token>
```

**認証エラー (401 Unauthorized)**

```json
{
  "type": "https://api.example.com/errors/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Valid authentication token required",
  "instance": "/api/v1/sessions/01HWQV8N4G0PXRJ6K8M2Y3Z5/export"
}
```

### 4.2 レートリミット

| エンドポイント   | 制限          | ウィンドウ |
| ---------------- | ------------- | ---------- |
| 単一エクスポート | 60リクエスト  | 1分        |
| 一括エクスポート | 10リクエスト  | 1分        |
| プレビュー       | 120リクエスト | 1分        |

**レートリミット超過 (429 Too Many Requests)**

```json
{
  "type": "https://api.example.com/errors/rate-limit",
  "title": "Rate Limit Exceeded",
  "status": 429,
  "detail": "Too many export requests. Please wait before trying again.",
  "retryAfter": 45
}
```

**レスポンスヘッダー**

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1734710445
Retry-After: 45
```

### 4.3 エラーコード一覧

| コード                | HTTPステータス | 説明                               |
| --------------------- | -------------- | ---------------------------------- |
| `INVALID_FORMAT`      | 400            | 不正なエクスポート形式             |
| `INVALID_RANGE`       | 400            | 不正なエクスポート範囲             |
| `MISSING_MESSAGE_IDS` | 400            | range=selectedでmessageIds未指定   |
| `SESSION_NOT_FOUND`   | 404            | セッションが見つからない           |
| `MESSAGE_NOT_FOUND`   | 404            | メッセージが見つからない           |
| `SESSION_DELETED`     | 410            | セッションが削除済み               |
| `INVALID_MESSAGE_IDS` | 422            | メッセージIDがセッションに属さない |
| `EXPORT_TOO_LARGE`    | 413            | エクスポートデータが大きすぎる     |
| `TOO_MANY_SESSIONS`   | 400            | 一括エクスポートのセッション数超過 |
| `INTERNAL_ERROR`      | 500            | サーバー内部エラー                 |

---

## 5. TypeScript型定義

### 5.1 リクエスト/レスポンス型

```typescript
import { z } from "zod";

// ============================================================
// エクスポート形式
// ============================================================

export const ExportFormatSchema = z.enum(["markdown", "json"]);
export type ExportFormat = z.infer<typeof ExportFormatSchema>;

export const ExportRangeSchema = z.enum(["all", "selected"]);
export type ExportRange = z.infer<typeof ExportRangeSchema>;

// ============================================================
// 単一エクスポート
// ============================================================

export const ExportQuerySchema = z.object({
  format: ExportFormatSchema.default("markdown"),
  range: ExportRangeSchema.default("all"),
  messageIds: z
    .string()
    .transform((s) => s.split(","))
    .optional(),
  includeMetadata: z.coerce.boolean().default(true),
  download: z.coerce.boolean().default(false),
});

export type ExportQuery = z.infer<typeof ExportQuerySchema>;

// JSON形式エクスポートレスポンス
export type ExportJsonResponse = {
  session: {
    id: string;
    title: string;
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
    messageCount: number;
    totalTokens: number;
    tags: string[];
  };
  messages: ExportMessage[];
  exportMetadata: {
    exportedAt: string; // ISO 8601
    format: "json";
    range: ExportRange;
    version: string;
  };
};

export type ExportMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string; // ISO 8601
  attachments: ExportAttachment[];
  llmMetadata?: ExportLlmMetadata;
};

export type ExportAttachment = {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  // base64データまたはパス（設定による）
  data?: string;
  path?: string;
};

export type ExportLlmMetadata = {
  provider: string;
  model: string;
  version?: string;
  temperature?: number;
  maxTokens?: number;
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  responseTimeMs?: number;
};

// ============================================================
// 一括エクスポート
// ============================================================

export const BatchExportRequestSchema = z.object({
  sessionIds: z.array(z.string()).min(1).max(50),
  format: ExportFormatSchema.default("markdown"),
  includeMetadata: z.boolean().default(true),
});

export type BatchExportRequest = z.infer<typeof BatchExportRequestSchema>;

export type BatchExportResult = {
  sessionId: string;
  status: "success" | "error";
  filename?: string;
  error?: {
    code: string;
    message: string;
  };
};

export type BatchExportResponse = {
  results: BatchExportResult[];
  successCount: number;
  errorCount: number;
};

// ============================================================
// プレビュー
// ============================================================

export type ExportPreviewResponse = {
  sessionId: string;
  title: string;
  messageCount: number;
  totalTokens: number;
  estimatedFileSize: {
    markdown: number;
    json: number;
  };
  dateRange: {
    firstMessage: string; // ISO 8601
    lastMessage: string; // ISO 8601
  };
  modelUsage: Record<string, number>; // "provider/model": count
};

// ============================================================
// エラー（RFC 7807 Problem Details）
// ============================================================

export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: FieldError[];
  [key: string]: unknown;
};

export type FieldError = {
  field: string;
  message: string;
  code: string;
};
```

### 5.2 APIクライアント例

```typescript
import {
  ExportFormat,
  ExportRange,
  ExportJsonResponse,
  BatchExportRequest,
} from "./types";

// 単一セッションエクスポート
export async function exportSession(
  sessionId: string,
  options: {
    format?: ExportFormat;
    range?: ExportRange;
    messageIds?: string[];
    includeMetadata?: boolean;
  } = {},
): Promise<string | ExportJsonResponse> {
  const params = new URLSearchParams({
    format: options.format || "markdown",
    range: options.range || "all",
    includeMetadata: String(options.includeMetadata ?? true),
  });

  if (options.range === "selected" && options.messageIds) {
    params.set("messageIds", options.messageIds.join(","));
  }

  const response = await fetch(
    `/api/v1/sessions/${sessionId}/export?${params}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        Accept:
          options.format === "json" ? "application/json" : "text/markdown",
      },
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new ExportError(error);
  }

  if (options.format === "json") {
    return response.json();
  }
  return response.text();
}

// 一括エクスポート
export async function batchExport(request: BatchExportRequest): Promise<Blob> {
  const response = await fetch("/api/v1/sessions/export/batch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ExportError(error);
  }

  return response.blob();
}

// プレビュー取得
export async function getExportPreview(
  sessionId: string,
  format?: ExportFormat,
): Promise<ExportPreviewResponse> {
  const params = format ? `?format=${format}` : "";
  const response = await fetch(
    `/api/v1/sessions/${sessionId}/preview${params}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new ExportError(error);
  }

  return response.json();
}
```

---

## 6. Next.js App Router 実装ガイド

### 6.1 ディレクトリ構成

```
apps/desktop/src/app/api/v1/sessions/
├── [sessionId]/
│   ├── export/
│   │   └── route.ts       # GET: 単一エクスポート
│   └── preview/
│       └── route.ts       # GET: プレビュー
└── export/
    └── batch/
        └── route.ts       # POST: 一括エクスポート
```

### 6.2 単一エクスポート実装例

```typescript
// apps/desktop/src/app/api/v1/sessions/[sessionId]/export/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ExportQuerySchema } from "@/features/chat-history/types";
import {
  exportSessionToMarkdown,
  exportSessionToJson,
} from "@/features/chat-history/services/exportService";
import { getSession } from "@/features/chat-history/services/sessionRepository";
import { withAuth } from "@/lib/auth/middleware";
import { ProblemDetails } from "@/types/api";

type RouteParams = {
  params: Promise<{ sessionId: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  return withAuth(request, async (user) => {
    const { sessionId } = await params;

    // クエリパラメータのバリデーション
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const parseResult = ExportQuerySchema.safeParse(searchParams);

    if (!parseResult.success) {
      const error: ProblemDetails = {
        type: "https://api.example.com/errors/validation",
        title: "Validation Error",
        status: 400,
        detail: "Invalid query parameters",
        instance: request.nextUrl.pathname,
        errors: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
          code: "VALIDATION_ERROR",
        })),
      };
      return NextResponse.json(error, { status: 400 });
    }

    const query = parseResult.data;

    // セッション取得
    const session = await getSession(sessionId, user.id);
    if (!session) {
      const error: ProblemDetails = {
        type: "https://api.example.com/errors/not-found",
        title: "Session Not Found",
        status: 404,
        detail: `Session with ID '${sessionId}' not found`,
        instance: request.nextUrl.pathname,
      };
      return NextResponse.json(error, { status: 404 });
    }

    // range=selected の場合、messageIds必須チェック
    if (query.range === "selected" && !query.messageIds?.length) {
      const error: ProblemDetails = {
        type: "https://api.example.com/errors/validation",
        title: "Missing Message IDs",
        status: 400,
        detail: 'messageIds parameter is required when range is "selected"',
        instance: request.nextUrl.pathname,
      };
      return NextResponse.json(error, { status: 400 });
    }

    // エクスポート実行
    try {
      if (query.format === "json") {
        const exportData = await exportSessionToJson(sessionId, user.id, {
          range: query.range,
          messageIds: query.messageIds,
          includeMetadata: query.includeMetadata,
        });

        const headers = new Headers({
          "Content-Type": "application/json; charset=utf-8",
          "X-Export-Format": "json",
          "X-Message-Count": String(exportData.messages.length),
          "X-Total-Tokens": String(session.totalTokens),
        });

        if (query.download) {
          const filename = sanitizeFilename(session.title);
          headers.set(
            "Content-Disposition",
            `attachment; filename="${filename}.json"`,
          );
        }

        return NextResponse.json(exportData, { headers });
      } else {
        // Markdown形式
        const markdownContent = await exportSessionToMarkdown(
          sessionId,
          user.id,
          {
            range: query.range,
            messageIds: query.messageIds,
            includeMetadata: query.includeMetadata,
          },
        );

        const headers = new Headers({
          "Content-Type": "text/markdown; charset=utf-8",
          "X-Export-Format": "markdown",
          "X-Message-Count": String(session.messageCount),
          "X-Total-Tokens": String(session.totalTokens),
        });

        if (query.download) {
          const filename = sanitizeFilename(session.title);
          headers.set(
            "Content-Disposition",
            `attachment; filename="${filename}.md"`,
          );
        }

        return new NextResponse(markdownContent, { headers });
      }
    } catch (error) {
      console.error("Export error:", error);
      const problemDetails: ProblemDetails = {
        type: "https://api.example.com/errors/internal",
        title: "Export Failed",
        status: 500,
        detail: "An error occurred while exporting the session",
        instance: request.nextUrl.pathname,
      };
      return NextResponse.json(problemDetails, { status: 500 });
    }
  });
}

function sanitizeFilename(title: string): string {
  // ファイル名として使用できない文字を置換
  return title
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 100);
}
```

---

## 7. Markdownエクスポートテンプレート

### 7.1 標準テンプレート

```markdown
# {session.title}

**作成日**: {session.createdAt | format: 'YYYY-MM-DD HH:mm:ss'}
**最終更新**: {session.updatedAt | format: 'YYYY-MM-DD HH:mm:ss'}
**メッセージ数**: {session.messageCount}件
**総トークン数**: {session.totalTokens | numberFormat}

---

{foreach message in messages}

## {message.role === 'user' ? 'ユーザー' : 'アシスタント'} ({message.timestamp | format: 'YYYY-MM-DD HH:mm:ss'})

{if message.role === 'assistant' && includeMetadata}
**モデル**: {message.llmMetadata.provider}/{message.llmMetadata.model}
**トークン**: 入力: {message.llmMetadata.tokenUsage.inputTokens}, 出力: {message.llmMetadata.tokenUsage.outputTokens}
{endif}

{message.content}

{if message.attachments.length > 0}
**添付ファイル**:
{foreach attachment in message.attachments}

- [{attachment.fileName}]({attachment.path})
  {endforeach}
  {endif}

---

{endforeach}

---

_エクスポート日時: {exportedAt | format: 'YYYY-MM-DD HH:mm:ss'}_
_フォーマットバージョン: 1.0.0_
```

### 7.2 コンパクトテンプレート（メタデータなし）

```markdown
# {session.title}

{foreach message in messages}
**{message.role === 'user' ? 'ユーザー' : 'AI'}**: {message.content}

{endforeach}
```

---

## 8. セキュリティ考慮事項

### 8.1 認可

- ユーザーは自分のセッションのみエクスポート可能
- セッションIDのユーザーID照合を必須化
- 削除済みセッションはエクスポート不可（410 Gone）

### 8.2 入力バリデーション

- セッションIDはULID形式を検証
- メッセージIDは存在確認と所有権確認
- ファイル名サニタイズ（パストラバーサル防止）

### 8.3 出力サニタイズ

#### Markdownコンテンツのサニタイズ

DOMPurifyライブラリを使用してHTMLタグを無効化し、XSS攻撃を防止：

```typescript
import DOMPurify from "isomorphic-dompurify";

function sanitizeMarkdownContent(content: string): string {
  // HTMLタグを含むMarkdownをサニタイズ
  const clean = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [], // 全HTMLタグを除去
    ALLOWED_ATTR: [], // 全属性を除去
    KEEP_CONTENT: true, // テキストコンテンツは保持
  });
  return clean;
}

// エクスポート時に各メッセージをサニタイズ
messages.forEach((msg) => {
  msg.content = sanitizeMarkdownContent(msg.content);
});
```

#### JSONエクスポート時のXSS対策ヘッダー

```http
Content-Security-Policy: default-src 'none'
X-Content-Type-Options: nosniff
```

### 8.4 サイズ制限

| 項目                 | 制限     |
| -------------------- | -------- |
| 単一エクスポート     | 50MB     |
| 一括エクスポートZIP  | 200MB    |
| セッション数（一括） | 50件     |
| メッセージ数（単一） | 10,000件 |

---

## 9. パフォーマンス考慮事項

### 9.1 ストリーミングレスポンス

大きなセッションのエクスポートではストリーミングレスポンスを使用：

```typescript
// ストリーミングエクスポート
export async function GET(request: NextRequest, { params }: RouteParams) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // ヘッダー部分
      controller.enqueue(encoder.encode(`# ${session.title}\n\n`));

      // メッセージを1件ずつストリーム
      for await (const message of getMessagesStream(sessionId)) {
        const markdown = formatMessageToMarkdown(message);
        controller.enqueue(encoder.encode(markdown));
      }

      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
```

### 9.2 キャッシュ戦略

- プレビューエンドポイント: 5分間キャッシュ
- エクスポート結果: キャッシュなし（常に最新データ）

```http
Cache-Control: no-store, max-age=0
```

---

## 10. 変更履歴

| バージョン | 日付       | 変更内容                        | 変更者          |
| ---------- | ---------- | ------------------------------- | --------------- |
| 1.0.0      | 2025-12-20 | 初版作成 - T-01-3タスクの成果物 | @api-doc-writer |

---

## 11. 参照ドキュメント

- [機能要件定義書](./requirements-functional.md) - FR-010, FR-011
- [メタデータ仕様書](./metadata-specification.md)
- [コンポーネント設計書](./component-design.md) - ChatHistoryExport
- [OpenAPI仕様書](./openapi-chat-export.yaml)
- [RFC 7807 - Problem Details for HTTP APIs](https://tools.ietf.org/html/rfc7807)
