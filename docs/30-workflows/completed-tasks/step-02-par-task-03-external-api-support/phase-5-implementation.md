# Phase 5: 実装（TDD: Green） -- External API Support（外部APIサポート）

## メタ情報

| 項目      | 値                    |
| --------- | --------------------- |
| Phase番号 | 5                     |
| 機能名    | external-api-support  |
| タスクID  | TASK-SDK-SC-03        |
| 作成日    | 2026-04-02            |
| 依存Phase | Phase 4（テスト作成） |

## 目的

Phase 4 で作成したテスト（T-01〜T-08）が全てPASS（Green）するよう、4つのファイルを新規実装する。

## Task 5-1: 型定義実装（packages/shared）

### ファイル: `packages/shared/src/types/skillCreatorExternalApi.ts`

```typescript
/**
 * 外部API認証タイプ
 * - none: 認証なし
 * - api-key: X-API-Keyヘッダー
 * - bearer: Authorization: Bearer
 * - basic: Authorization: Basic (base64)
 */
export type ExternalApiAuthType = "none" | "api-key" | "bearer" | "basic";

/**
 * 外部API接続設定（ユーザーがUIで入力する値）
 * skill-creator フロー内で外部HTTPAPIを呼び出す際に使用する
 */
export interface ExternalApiConnectionConfig {
  /** API識別名（ログ・スキル生成ヒント用） */
  name: string;
  /** エンドポイントURL */
  url: string;
  /** HTTPメソッド */
  method: "GET" | "POST";
  /** 認証タイプ */
  authType: ExternalApiAuthType;
  /** 認証情報（APIキー / Bearerトークン / user:password） */
  credential?: string;
  /** 追加カスタムヘッダー */
  headers?: Record<string, string>;
  /** API説明（スキル生成時のコンテキストとして注入） */
  description?: string;
}

/**
 * スキル生成フロー内で使用する外部APIコンテキスト
 * SDK Sessionに注入され、生成スキルに外部API接続コードが含まれるようにする
 */
export interface SkillExternalApiContext {
  apis: ExternalApiConnectionConfig[];
}

/**
 * 外部HTTP APIアダプターインターフェース
 * skill-creator フロー内でサードパーティAPIを呼び出す際に使用する
 */
export interface IExternalApiAdapter {
  /** GETリクエストを送信し、レスポンスをT型で返す */
  get<T>(url: string, headers?: Record<string, string>): Promise<T>;
  /** POSTリクエストをJSONボディで送信し、レスポンスをT型で返す */
  post<T>(
    url: string,
    body: unknown,
    headers?: Record<string, string>,
  ): Promise<T>;
  /** 認証情報を設定する（以降のリクエストに自動付与される） */
  setAuth(type: Exclude<ExternalApiAuthType, "none">, credential: string): void;
}

/** 外部APIリクエストが30秒を超えてタイムアウトした場合にスローされるエラー */
export class ExternalApiTimeoutError extends Error {
  readonly url: string;

  constructor(url: string) {
    super(`External API request timed out after 30s: ${url}`);
    this.name = "ExternalApiTimeoutError";
    this.url = url;
    Object.setPrototypeOf(this, ExternalApiTimeoutError.prototype);
  }
}

/** 外部APIがHTTPエラーステータス（4xx/5xx）を返した場合にスローされるエラー */
export class ExternalApiHttpError extends Error {
  readonly statusCode: number;
  readonly url: string;

  constructor(url: string, statusCode: number) {
    super(`External API returned HTTP ${statusCode}: ${url}`);
    this.name = "ExternalApiHttpError";
    this.statusCode = statusCode;
    this.url = url;
    Object.setPrototypeOf(this, ExternalApiHttpError.prototype);
  }
}
```

## Task 5-2: IPCチャネル追加

### ファイル: `packages/shared/src/ipc/channels.ts`（追記）

既存のチャネル定数の末尾に以下を追加する:

```typescript
// External API Support (TASK-SDK-SC-03)
export const SKILL_CREATOR_EXTERNAL_API_CHANNELS = {
  CONFIGURE_API: "skill-creator:configure-api",
  API_CONFIGURED: "skill-creator:api-configured",
  API_TEST_RESULT: "skill-creator:api-test-result",
} as const;
```

## Task 5-3: HttpExternalApiAdapter 実装

### ファイル: `apps/desktop/src/main/services/runtime/adapters/HttpExternalApiAdapter.ts`

```typescript
import {
  ExternalApiAuthType,
  ExternalApiHttpError,
  ExternalApiTimeoutError,
  IExternalApiAdapter,
} from "@repo/shared/src/types/skillCreatorExternalApi";

export class HttpExternalApiAdapter implements IExternalApiAdapter {
  private static readonly TIMEOUT_MS = 30_000;

  private authType: Exclude<ExternalApiAuthType, "none"> | null = null;
  private credential: string | null = null;

  setAuth(
    type: Exclude<ExternalApiAuthType, "none">,
    credential: string,
  ): void {
    // SEC-02: 認証情報をログに出力しない
    this.authType = type;
    this.credential = credential;
  }

  async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
    this.warnIfNotHttps(url);
    const mergedHeaders = { ...this.buildAuthHeader(), ...(headers ?? {}) };
    const response = await this.fetchWithTimeout(url, {
      method: "GET",
      headers: mergedHeaders,
    });
    return response.json() as Promise<T>;
  }

  async post<T>(
    url: string,
    body: unknown,
    headers?: Record<string, string>,
  ): Promise<T> {
    this.warnIfNotHttps(url);
    const mergedHeaders = {
      "Content-Type": "application/json",
      ...this.buildAuthHeader(),
      ...(headers ?? {}),
    };
    const response = await this.fetchWithTimeout(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: mergedHeaders,
    });
    return response.json() as Promise<T>;
  }

  private buildAuthHeader(): Record<string, string> {
    if (!this.authType || !this.credential) return {};

    switch (this.authType) {
      case "api-key":
        return { "X-API-Key": this.credential };
      case "bearer":
        return { Authorization: `Bearer ${this.credential}` };
      case "basic":
        return {
          Authorization: `Basic ${Buffer.from(this.credential, "utf8").toString("base64")}`,
        };
    }
  }

  private warnIfNotHttps(url: string): void {
    // SEC-01: HTTPSでないURLに警告ログを出力する（リクエストはブロックしない）
    if (!url.startsWith("https://")) {
      console.warn(
        `[HttpExternalApiAdapter] Warning: non-HTTPS URL detected: ${url}`,
      );
    }
  }

  private async fetchWithTimeout(
    url: string,
    init: RequestInit,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      HttpExternalApiAdapter.TIMEOUT_MS,
    );

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new ExternalApiHttpError(url, response.status);
      }

      return response;
    } catch (error) {
      if (error instanceof ExternalApiHttpError) throw error;

      if (error instanceof Error && error.name === "AbortError") {
        throw new ExternalApiTimeoutError(url);
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
```

## Task 5-4: ExternalApiConfigForm 実装

### ファイル: `apps/desktop/src/renderer/components/skill/ExternalApiConfigForm.tsx`

```typescript
import React, { useState } from "react";
import {
  ExternalApiAuthType,
  ExternalApiConnectionConfig,
} from "@repo/shared/src/types/skillCreatorExternalApi";

interface ExternalApiConfigFormProps {
  /** SDK Session から受け取ったイベントデータ */
  eventData?: { apiName?: string; description?: string };
  /** 送信完了コールバック */
  onSubmit: (config: ExternalApiConnectionConfig) => void;
  /** キャンセルコールバック */
  onCancel: () => void;
}

export const ExternalApiConfigForm: React.FC<ExternalApiConfigFormProps> = ({
  eventData,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(eventData?.apiName ?? "");
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState<"GET" | "POST">("GET");
  const [authType, setAuthType] = useState<ExternalApiAuthType>("none");
  const [credential, setCredential] = useState("");
  const [customHeaders, setCustomHeaders] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // バリデーション
    if (!name.trim()) {
      setError("API名を入力してください");
      return;
    }
    if (!url.trim()) {
      setError("URLを入力してください");
      return;
    }

    // カスタムヘッダーのパース
    let parsedHeaders: Record<string, string> | undefined;
    if (customHeaders.trim()) {
      try {
        parsedHeaders = JSON.parse(customHeaders) as Record<string, string>;
      } catch {
        setError("カスタムヘッダーはJSON形式で入力してください");
        return;
      }
    }

    const config: ExternalApiConnectionConfig = {
      name: name.trim(),
      url: url.trim(),
      method,
      authType,
      credential: authType !== "none" ? credential : undefined,
      headers: parsedHeaders,
      description: eventData?.description,
    };

    try {
      await window.electronAPI.skillCreator.configureExternalApi(config);
      onSubmit(config);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "API設定の送信に失敗しました",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="external-api-config-form">
      <h2>外部API設定</h2>
      {eventData?.description && <p>{eventData.description}</p>}

      {error && <div className="error-message">{error}</div>}

      <div className="form-field">
        <label htmlFor="api-name">API名 *</label>
        <input
          id="api-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="api-url">URL *</label>
        <input
          id="api-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/endpoint"
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="api-method">メソッド</label>
        <select
          id="api-method"
          value={method}
          onChange={(e) => setMethod(e.target.value as "GET" | "POST")}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="auth-type">認証種別</label>
        <select
          id="auth-type"
          value={authType}
          onChange={(e) => setAuthType(e.target.value as ExternalApiAuthType)}
        >
          <option value="none">なし</option>
          <option value="api-key">APIキー</option>
          <option value="bearer">Bearer トークン</option>
          <option value="basic">Basic認証</option>
        </select>
      </div>

      {authType !== "none" && (
        <div className="form-field">
          <label htmlFor="credential">
            {authType === "basic" ? "ユーザー名:パスワード" : "認証情報"}
          </label>
          <input
            id="credential"
            type="password"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            placeholder={
              authType === "basic"
                ? "username:password"
                : authType === "api-key"
                  ? "APIキーを入力"
                  : "Bearerトークンを入力"
            }
          />
        </div>
      )}

      <div className="form-field">
        <label htmlFor="custom-headers">カスタムヘッダー（JSON形式・任意）</label>
        <textarea
          id="custom-headers"
          value={customHeaders}
          onChange={(e) => setCustomHeaders(e.target.value)}
          placeholder='{"X-Custom-Header": "value"}'
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button type="submit">設定を送信</button>
        <button type="button" onClick={onCancel}>
          キャンセル
        </button>
      </div>
    </form>
  );
};
```

## Task 5-5: テスト実行（Green確認）

```bash
pnpm --filter @repo/desktop vitest run \
  src/main/services/runtime/adapters/__tests__/HttpExternalApiAdapter.test.ts
```

期待する結果: **T-01〜T-08 全件 PASS（Green）**

```bash
# TypeScriptコンパイル確認
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck
```

期待する結果: エラー0件

## 参照資料

| 資料名         | パス                                                                                  |
| -------------- | ------------------------------------------------------------------------------------- |
| Phase 4 テスト | `docs/30-workflows/step-02-par-task-03-external-api-support/phase-4-test-creation.md` |
| Phase 2 設計   | `docs/30-workflows/step-02-par-task-03-external-api-support/phase-2-design.md`        |

## 完了条件

- [ ] `packages/shared/src/types/skillCreatorExternalApi.ts` を実装した
- [ ] `packages/shared/src/ipc/channels.ts` に `SKILL_CREATOR_EXTERNAL_API_CHANNELS` を追加した
- [ ] `HttpExternalApiAdapter.ts` を実装した（fetch + AbortController + setAuth + HTTPS警告）
- [ ] `ExternalApiConfigForm.tsx` を実装した（URL/メソッド/認証種別/認証情報/カスタムヘッダー）
- [ ] T-01〜T-08 全件PASSを確認した（Green）
- [ ] TypeScriptコンパイルエラー0件を確認した

## 次の Phase: Phase 6（phase-6-test-expansion.md）
