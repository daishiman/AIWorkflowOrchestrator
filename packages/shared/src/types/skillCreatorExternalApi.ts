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
 *
 * NOTE: 既存の skillCreator.ts にある ExternalApiConfig（InterviewResult.externalApis）とは
 * 別の目的で使用する接続設定型。命名衝突を避けるため ExternalApiConnectionConfig とした。
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
