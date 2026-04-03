# Phase 1: 要件定義 -- External API Support（外部APIサポート）

## メタ情報

| 項目       | 値                                                            |
| ---------- | ------------------------------------------------------------- |
| Phase番号  | 1                                                             |
| 機能名     | external-api-support                                          |
| タスクID   | TASK-SDK-SC-03                                                |
| 作成日     | 2026-04-02                                                    |
| 依存Phase  | なし（起点）                                                  |
| 依存タスク | TASK-SDK-SC-01（SDK Session Bridge完了・IPCチャネル定数確定） |

## 目的

skill-creatorがスキル生成中に外部API（天気/Slack/GitHub等）連携が必要な場合の要件を定義する。
SDK Session中に `external-api-config-required` イベントが発行されたとき、ユーザーがUIで
外部API設定を入力できるようにし、`HttpExternalApiAdapter` で実際の HTTP通信を実装する。

## Task 1-1: 現状調査

### 調査対象

- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
  - 外部API設定受付に関するコードが存在しないことを確認する
- `packages/shared/src/types/skillCreator.ts`
  - `ExternalApiConfig` 型定義が存在しないことを確認する
- `apps/desktop/src/renderer/components/skill-creator/` ディレクトリ
  - `ExternalApiConfigForm` コンポーネントが存在しないことを確認する
- `packages/shared/src/ipc/channels.ts`
  - `skill-creator:configure-api` チャネルが存在しないことを確認する

### 調査結果（予期される内容）

| 対象                      | 現状   | 必要な変更                   |
| ------------------------- | ------ | ---------------------------- |
| ExternalApiConfig型       | 未定義 | 新規作成（shared）           |
| IExternalApiAdapter       | 未定義 | 新規作成（shared）           |
| HttpExternalApiAdapter    | 未実装 | 新規作成（desktop/adapters） |
| ExternalApiConfigForm     | 未実装 | 新規作成（desktop/renderer） |
| configure-api IPCチャネル | 未定義 | channels.ts に追加           |

## Task 1-2: 機能要件定義

### FR-001: 外部API設定入力

ユーザーが以下の項目を入力できること:

| 設定項目         | 型                                           | 説明                                     |
| ---------------- | -------------------------------------------- | ---------------------------------------- |
| URL              | string                                       | 外部APIのエンドポイントURL               |
| メソッド         | `'GET' \| 'POST'`                            | HTTPメソッド                             |
| 認証種別         | `'none' \| 'api-key' \| 'bearer' \| 'basic'` | 認証タイプ                               |
| 認証情報         | string（optional）                           | APIキー / BearerトークンなどのCredential |
| カスタムヘッダー | `Record<string, string>`（optional）         | 追加HTTPヘッダー                         |

### FR-002: GET/POSTリクエスト実行

- `HttpExternalApiAdapter.get<T>()` でGETリクエストを送信できること
- `HttpExternalApiAdapter.post<T>()` でJSONボディ付きPOSTリクエストを送信できること
- レスポンスをT型として返すこと

### FR-003: タイムアウト処理

- 全リクエストにデフォルト**30秒**のタイムアウトを設けること
- `AbortController` を使用してfetchをキャンセルすること
- タイムアウト時は `ExternalApiTimeoutError` をスローすること

### FR-004: エラーハンドリング

| エラー種別           | 発生条件                      | 処理内容                           |
| -------------------- | ----------------------------- | ---------------------------------- |
| 4xx/5xx HTTPエラー   | HTTPステータスコードが400以上 | `ExternalApiHttpError` をスロー    |
| ネットワークエラー   | DNS解決失敗・接続拒否等       | 元のエラーをそのままスロー         |
| タイムアウト（30秒） | AbortError発生                | `ExternalApiTimeoutError` をスロー |

### FR-005: APIキーのセキュア管理

- APIキー・認証情報を `console.log` / `console.info` に出力しないこと
- ログ出力時は認証ヘッダー値を `[REDACTED]` でマスキングすること
- HTTPSでないURLへのリクエスト時に `console.warn` で警告を出力すること

### FR-006: IPC チャネル定数

外部API連携に関わるIPCチャネルは、TASK-SDK-SC-01 の `SKILL_CREATOR_SESSION_CHANNELS` と同じオブジェクト形式で定義すること:

```typescript
export const SKILL_CREATOR_EXTERNAL_API_CHANNELS = {
  /** Renderer → Main: 外部API設定を送信 */
  CONFIGURE_API: "skill-creator:configure-api",
  /** Main → Renderer: API設定確認応答 */
  API_CONFIGURED: "skill-creator:api-configured",
  /** Main → Renderer: API接続テスト結果 */
  API_TEST_RESULT: "skill-creator:api-test-result",
} as const;
```

個別の `export const SKILL_CREATOR_CONFIGURE_API = ...` 形式は使用しないこと。

## Task 1-3: 受入基準

| ID    | 受入基準                                                                                        |
| ----- | ----------------------------------------------------------------------------------------------- |
| AC-01 | URL・メソッド・認証種別を設定するフォームが `external-api-config-required` イベントで表示される |
| AC-02 | `HttpExternalApiAdapter.get()` が200レスポンスをT型で返す                                       |
| AC-03 | `HttpExternalApiAdapter.post()` がJSONボディを送信し200レスポンスをT型で返す                    |
| AC-04 | `api-key` 認証で `X-API-Key` ヘッダーが付与される                                               |
| AC-05 | `bearer` 認証で `Authorization: Bearer {token}` ヘッダーが付与される                            |
| AC-06 | `basic` 認証で `Authorization: Basic {base64}` ヘッダーが付与される                             |
| AC-07 | 30秒タイムアウトで `ExternalApiTimeoutError` がスローされる                                     |
| AC-08 | 404レスポンスで `ExternalApiHttpError` がスローされ `statusCode === 404` である                 |
| AC-09 | HTTPSでないURLに警告ログが出力される                                                            |
| AC-10 | APIキーが `console.log` に出力されない                                                          |
| AC-11 | フォーム送信時に `SKILL_CREATOR_EXTERNAL_API_CHANNELS.CONFIGURE_API` IPCが発火する              |
| AC-12 | 設定情報がSDKセッションに注入され、生成スキルに外部API接続コードが含まれる                      |

## 参照資料

| 資料名                     | パス                                                                   |
| -------------------------- | ---------------------------------------------------------------------- |
| TASK-SDK-SC-01             | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/index.md`    |
| skillCreator型定義         | `packages/shared/src/types/skillCreator.ts`                            |
| SkillCreatorWorkflowEngine | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` |

## 成果物

| 成果物                   | パス                                                                                                                                                         | 形式     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 要件定義書（本ファイル） | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-02-par-task-03-external-api-support/phase-1-requirements.md` | Markdown |

## 完了条件

- [ ] skill-creatorの外部API連携が未実装であることを現状調査で確認した
- [ ] FR-001（外部API設定入力）の要件を定義した
- [ ] FR-002（GET/POSTリクエスト実行）の要件を定義した
- [ ] FR-003（タイムアウト30秒）の要件を定義した
- [ ] FR-004（エラーハンドリング4種）の要件を定義した
- [ ] FR-005（APIキーセキュア管理）の要件を定義した
- [ ] FR-006（IPCチャネル定数オブジェクト形式）の要件を定義した
- [ ] 受入基準 AC-01〜AC-12 を定義した

## 次の Phase: Phase 2（phase-2-design.md）
