# Phase 2: 設計 -- External API Support（外部APIサポート）

## メタ情報

| 項目      | 値                   |
| --------- | -------------------- |
| Phase番号 | 2                    |
| 機能名    | external-api-support |
| タスクID  | TASK-SDK-SC-03       |
| 作成日    | 2026-04-02           |
| 依存Phase | Phase 1（要件定義）  |

## 目的

Phase 1 で確定した要件（FR-001〜FR-005）を満たすための具体的なインターフェース設計・クラス設計・UIコンポーネント設計・IPCチャネル設計を定義する。

## Task 2-1: 型定義設計（packages/shared）

### ファイル: `packages/shared/src/types/skillCreatorExternalApi.ts`

```typescript
/** 外部API認証タイプ */
export type ExternalApiAuthType = "none" | "api-key" | "bearer" | "basic";

/** 外部API設定（ユーザー入力値） */
export interface ExternalApiConfig {
  /** API識別名 */
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
  /** API説明（ログ・スキル生成ヒント用） */
  description?: string;
}

/** スキル生成フロー内で使用する外部APIコンテキスト */
export interface SkillExternalApiContext {
  apis: ExternalApiConfig[];
}

/** 外部HTTPAPIアダプターインターフェース */
export interface IExternalApiAdapter {
  get<T>(url: string, headers?: Record<string, string>): Promise<T>;
  post<T>(
    url: string,
    body: unknown,
    headers?: Record<string, string>,
  ): Promise<T>;
  setAuth(type: Exclude<ExternalApiAuthType, "none">, credential: string): void;
}

/** 外部APIリクエストが30秒タイムアウトした場合にスローされるエラー */
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

## Task 2-2: IPCチャネル追加設計

### ファイル: `packages/shared/src/ipc/channels.ts`（追記）

TASK-SDK-SC-01 の `SKILL_CREATOR_SESSION_CHANNELS` と同じオブジェクト形式で定義する。
個別定数（`export const SKILL_CREATOR_CONFIGURE_API = ...`）は使用しないこと。

```typescript
// 既存のチャネル定数の末尾に追加
export const SKILL_CREATOR_EXTERNAL_API_CHANNELS = {
  /** Renderer → Main: 外部API設定を送信 */
  CONFIGURE_API: "skill-creator:configure-api",
  /** Main → Renderer: API設定確認応答 */
  API_CONFIGURED: "skill-creator:api-configured",
  /** Main → Renderer: API接続テスト結果 */
  API_TEST_RESULT: "skill-creator:api-test-result",
} as const;
```

| チャネル名                      | 定数キー          | 方向            | ペイロード                                                     |
| ------------------------------- | ----------------- | --------------- | -------------------------------------------------------------- |
| `skill-creator:configure-api`   | `CONFIGURE_API`   | Renderer → Main | `ExternalApiConfig`                                            |
| `skill-creator:api-configured`  | `API_CONFIGURED`  | Main → Renderer | `{ success: true }` または `{ success: false; error: string }` |
| `skill-creator:api-test-result` | `API_TEST_RESULT` | Main → Renderer | `{ ok: boolean; latencyMs?: number; error?: string }`          |

## Task 2-2b: 外部API連携フロー設計

ExternalApiConfigForm がセッション中の **どのタイミングで表示されるか** を以下のシーケンスで定義する。

### 設計選択: Option A（AskUserQuestion 経由）

`UserInputType` に `"external_api_config"` を追加し、既存の `AskUserQuestion` パターンと同じフローで外部API設定を取得する。
個別のイベント検出（Option B）より実装が単純で、既存の IpcBridge ロジックと一貫性がある。

### シーケンス図

```
skill-creator        IpcBridge (Renderer)      ExternalApiConfigForm    HttpExternalApiAdapter
     |                      |                          |                         |
     | AskUserQuestion       |                          |                         |
     | type: "confirm"       |                          |                         |
     | "外部APIを使いますか？" |                          |                         |
     |──────────────────────>|                          |                         |
     |                       | ChoiceButton 表示        |                         |
     |                       |  「はい」「いいえ」       |                         |
     |                       |                          |                         |
     |                       | ユーザーが「はい」クリック |                        |
     |                       |<─────────────────────────|                         |
     |                       | skill-creator:answer     |                         |
     |<──────────────────────|  payload: "yes"          |                         |
     |                       |                          |                         |
     | AskUserQuestion       |                          |                         |
     | type: "external_api_config"                      |                         |
     | "API設定を入力してください"                        |                         |
     |──────────────────────>|                          |                         |
     |                       | ExternalApiConfigForm 表示                         |
     |                       |─────────────────────────>|                         |
     |                       |                          |                         |
     |                       |                          | ユーザーがフォーム入力  |
     |                       |                          | ・送信ボタンクリック    |
     |                       |                          |                         |
     |                       | CONFIGURE_API IPC        |                         |
     |                       |<─────────────────────────|                         |
     |                       |                          |                         |
     |                       | HttpExternalApiAdapter.接続テスト                  |
     |                       |────────────────────────────────────────────────────>
     |                       |                          |   テスト結果             |
     |                       |<─────────────────────────────────────────────────── |
     |                       |                          |                         |
     |                       | API_CONFIGURED IPC       |                         |
     |                       |─────────────────────────>|                         |
     |                       |                          |                         |
     | skill-creator:answer  |                          |                         |
     |<──────────────────────|  payload: ExternalApiConfig                        |
     |                       |                          |                         |
     | セッション継続          |                          |                         |
```

### UserInputType 拡張

```typescript
// packages/shared/src/types/skillCreator.ts（追記）
export type UserInputType =
  | "single_select"
  | "multi_select"
  | "free_text"
  | "secret"
  | "confirm"
  | "external_api_config"; // 新規追加: ExternalApiConfigForm を表示するトリガー
```

IpcBridge は `payload.type === "external_api_config"` を受け取ったとき、通常の選択肢UIの代わりに `ExternalApiConfigForm` をレンダリングする。

## Task 2-3: HttpExternalApiAdapter クラス設計

### ファイル: `apps/desktop/src/main/services/runtime/adapters/HttpExternalApiAdapter.ts`

```typescript
export class HttpExternalApiAdapter implements IExternalApiAdapter {
  private static readonly TIMEOUT_MS = 30_000;

  private authType: Exclude<ExternalApiAuthType, "none"> | null = null;
  private credential: string | null = null;

  setAuth(type: Exclude<ExternalApiAuthType, "none">, credential: string): void;
  async get<T>(url: string, headers?: Record<string, string>): Promise<T>;
  async post<T>(
    url: string,
    body: unknown,
    headers?: Record<string, string>,
  ): Promise<T>;

  private buildAuthHeader(): Record<string, string>;
  private warnIfNotHttps(url: string): void;
  private async fetchWithTimeout(
    url: string,
    init: RequestInit,
  ): Promise<Response>;
}
```

### 認証ヘッダービルドロジック

| authType  | ヘッダーキー  | 値の形式                   |
| --------- | ------------- | -------------------------- |
| `api-key` | X-API-Key     | `credential`               |
| `bearer`  | Authorization | `Bearer {credential}`      |
| `basic`   | Authorization | `Basic {btoa(credential)}` |
| `null`    | （なし）      | `{}`                       |

### fetchWithTimeout フロー

```
1. AbortController を生成
2. setTimeout(30_000) でコントローラをabort
3. fetch(url, { ...init, signal: controller.signal }) を実行
4. AbortError → ExternalApiTimeoutError に変換
5. response.ok が false → ExternalApiHttpError(url, status) をスロー
6. finally { clearTimeout(timeoutId) } でクリーンアップ
```

## Task 2-4: ExternalApiConfigForm コンポーネント設計

### ファイル: `apps/desktop/src/renderer/components/skill-creator/ExternalApiConfigForm.tsx`

```typescript
interface ExternalApiConfigFormProps {
  /** SDK Session から受け取ったイベントデータ */
  eventData?: { apiName?: string; description?: string };
  /** 送信完了コールバック */
  onSubmit: (config: ExternalApiConfig) => void;
  /** キャンセルコールバック */
  onCancel: () => void;
}

export const ExternalApiConfigForm: React.FC<ExternalApiConfigFormProps>;
```

### フォームフィールド構成

| フィールド       | 入力コンポーネント | バリデーション                      |
| ---------------- | ------------------ | ----------------------------------- |
| API名            | テキスト入力       | 必須                                |
| URL              | テキスト入力       | 必須 / URL形式チェック              |
| メソッド         | セレクト           | GET / POST                          |
| 認証種別         | セレクト           | none / api-key / bearer / basic     |
| 認証情報         | パスワード入力     | authType が none 以外の場合のみ表示 |
| カスタムヘッダー | テキストエリア     | 任意 / JSON形式                     |

### 送信フロー

```
1. フォームバリデーション
2. ExternalApiConfig オブジェクト構築
3. window.electronAPI.invoke(SKILL_CREATOR_EXTERNAL_API_CHANNELS.CONFIGURE_API, config) を呼び出す
4. API_CONFIGURED IPC で成功応答を受け取るまでフォームを disabled 状態にする
5. 成功時: onSubmit(config) コールバック実行
6. 失敗時: エラーメッセージをフォーム内に表示（フォームは再入力可能に戻す）
```

## Task 2-5: クラス図

```
IExternalApiAdapter (interface)
  |
  +-- HttpExternalApiAdapter
        - authType: 'api-key' | 'bearer' | 'basic' | null
        - credential: string | null
        + setAuth(type, credential): void
        + get<T>(url, headers?): Promise<T>
        + post<T>(url, body, headers?): Promise<T>
        - buildAuthHeader(): Record<string, string>
        - warnIfNotHttps(url): void
        - fetchWithTimeout(url, init): Promise<Response>

ExternalApiConfigForm (React Component)
  Props: { eventData?, onSubmit, onCancel }
  State: { name, url, method, authType, credential, headers }
  → IPC: skill-creator:configure-api
```

## Task 2-6: 変更ファイル一覧

| ファイルパス                                                                   | 変更種別 | 変更内容                       |
| ------------------------------------------------------------------------------ | -------- | ------------------------------ |
| `packages/shared/src/types/skillCreatorExternalApi.ts`                         | 新規作成 | 型定義・エラークラス           |
| `packages/shared/src/ipc/channels.ts`                                          | 変更     | configure-api チャネル定数追加 |
| `apps/desktop/src/main/services/runtime/adapters/HttpExternalApiAdapter.ts`    | 新規作成 | fetch実装・タイムアウト・認証  |
| `apps/desktop/src/renderer/components/skill-creator/ExternalApiConfigForm.tsx` | 新規作成 | 外部API設定フォームUI          |

## 参照資料

| 資料名             | パス                                                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase 1 要件定義   | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-02-par-task-03-external-api-support/phase-1-requirements.md` |
| skillCreator型定義 | `packages/shared/src/types/skillCreator.ts`                                                                                                                  |

## 完了条件

- [ ] `IExternalApiAdapter` インターフェースを設計した
- [ ] `ExternalApiConfig` 型（URL / method / authType / credential / headers）を設計した
- [ ] `SkillExternalApiContext` 型を設計した
- [ ] `ExternalApiTimeoutError` / `ExternalApiHttpError` を設計した
- [ ] `HttpExternalApiAdapter` の全メソッド設計を完了した
- [ ] `ExternalApiConfigForm` のフォームフィールド・送信フローを設計した
- [ ] `SKILL_CREATOR_EXTERNAL_API_CHANNELS` オブジェクト形式チャネル定数を設計した
- [ ] `UserInputType` に `"external_api_config"` を追加する設計を定義した
- [ ] 外部API連携フローのシーケンス図（Task 2-2b）を作成した
- [ ] 変更対象が4ファイル（新規3件 + 変更1件）であることを確認した

## 次の Phase: Phase 3（phase-3-design-review.md）
