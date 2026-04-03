# Phase 12: ドキュメント -- External API Support（外部APIサポート）

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase番号 | 12                     |
| 機能名    | external-api-support   |
| タスクID  | TASK-SDK-SC-03         |
| 作成日    | 2026-04-02             |
| 依存Phase | Phase 11（手動テスト） |

## 目的

外部API設定機能について、中学生レベルの概念説明・技術者向けリファレンス・セキュリティ上の注意点の3層でドキュメントを整備する。

---

## Task 12-1: 中学生レベル説明

### 外部APIとは何か

「API」とは「アプリケーション・プログラミング・インターフェース」の略で、**ソフトウェア同士が会話するための窓口**のことです。

たとえば、AIにスキルを作ってもらうとき、「天気情報を調べるスキルが欲しい」と頼んだとします。天気情報は外部の天気サービスが持っています。そのサービスに「東京の天気を教えて！」と問い合わせる方法を「外部API連携」といいます。

このアプリでは、スキル生成中にAIが「外部APIの設定が必要です」と伝えてきたとき、ユーザーが設定フォームでAPI情報を入力します。入力した情報をもとに、生成されるスキルのコードに「そのAPIを呼び出す部分」が自動的に含まれるようになります。

### なぜAPIキーを安全に管理しないといけないのか

外部APIを使うときは、「あなたは誰ですか？」という確認のために「APIキー」という**秘密の合言葉**が必要になることがあります。

APIキーはパスワードと同じくらい大切なものです。もし誰かに知られてしまうと、その人があなたのかわりにAPIを使い放題になり、料金が請求されたりサービスを悪用されたりする可能性があります。

そのため、このアプリでは以下のようにAPIキーを安全に扱います：

1. **ログに書かない**: アプリの動作記録にAPIキーを書き出しません
2. **入力フィールドを隠す**: APIキーの入力欄は `●●●●` で隠れるパスワード形式です
3. **HTTPS接続を推奨**: 暗号化された通信（HTTPS）でAPIを呼び出すよう警告します

---

## Task 12-2: 技術者向けリファレンス

### IExternalApiAdapter インターフェース

| メソッド  | シグネチャ                                                                     | 説明                                             |
| --------- | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| `get<T>`  | `(url: string, headers?: Record<string, string>) => Promise<T>`                | GETリクエストを送信してT型で返す                 |
| `post<T>` | `(url: string, body: unknown, headers?: Record<string, string>) => Promise<T>` | POSTリクエストをJSONボディで送信してT型で返す    |
| `setAuth` | `(type: 'api-key' \| 'bearer' \| 'basic', credential: string) => void`         | 認証情報を設定する（以降のリクエストに自動付与） |

**定義ファイル**: `packages/shared/src/types/skillCreatorExternalApi.ts`

### HttpExternalApiAdapter クラス

`IExternalApiAdapter` の具体実装。`fetch` + `AbortController` を使用。

| 項目         | 値                                                                                                                            |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| タイムアウト | 30秒（`TIMEOUT_MS = 30_000`）                                                                                                 |
| 実装ファイル | `apps/desktop/src/main/services/runtime/adapters/HttpExternalApiAdapter.ts`                                                   |
| 認証ヘッダー | `buildAuthHeader()` で生成（api-key: `X-API-Key` / bearer: `Authorization: Bearer` / basic: `Authorization: Basic {base64}`） |
| HTTPS検証    | `warnIfNotHttps()` でHTTP URLに `console.warn` を出力（リクエストはブロックしない）                                           |

### ExternalApiConfig 型

| フィールド    | 型                       | 必須 | 説明                                    |
| ------------- | ------------------------ | ---- | --------------------------------------- |
| `name`        | `string`                 | 必須 | API識別名                               |
| `url`         | `string`                 | 必須 | エンドポイントURL                       |
| `method`      | `'GET' \| 'POST'`        | 必須 | HTTPメソッド                            |
| `authType`    | `ExternalApiAuthType`    | 必須 | 認証タイプ（none/api-key/bearer/basic） |
| `credential`  | `string`                 | 任意 | 認証情報（authType が none 以外で必要） |
| `headers`     | `Record<string, string>` | 任意 | 追加カスタムヘッダー                    |
| `description` | `string`                 | 任意 | API説明（スキル生成コンテキストに使用） |

**定義ファイル**: `packages/shared/src/types/skillCreatorExternalApi.ts`

### エラークラス一覧

| クラス名                  | スロー条件             | プロパティ                          |
| ------------------------- | ---------------------- | ----------------------------------- |
| `ExternalApiTimeoutError` | 30秒タイムアウト       | `url: string`                       |
| `ExternalApiHttpError`    | HTTPステータス 4xx/5xx | `url: string`, `statusCode: number` |

**定義ファイル**: `packages/shared/src/types/skillCreatorExternalApi.ts`

### ExternalApiConfigForm コンポーネント

| Props       | 型                                           | 説明                                  |
| ----------- | -------------------------------------------- | ------------------------------------- |
| `eventData` | `{ apiName?: string; description?: string }` | SDKイベントから受け取るデータ（任意） |
| `onSubmit`  | `(config: ExternalApiConfig) => void`        | 送信成功時のコールバック              |
| `onCancel`  | `() => void`                                 | キャンセル時のコールバック            |

**表示トリガー**: SDK Session中の `external-api-config-required` イベント受信時

**実装ファイル**: `apps/desktop/src/renderer/components/skill-creator/ExternalApiConfigForm.tsx`

### IPCチャネル

| チャネル定数                                        | チャネル名                    | 方向            |
| --------------------------------------------------- | ----------------------------- | --------------- |
| `SKILL_CREATOR_EXTERNAL_API_CHANNELS.CONFIGURE_API` | `skill-creator:configure-api` | Renderer → Main |

**定義ファイル**: `packages/shared/src/ipc/channels.ts`

---

## Task 12-3: セキュリティ上の注意点

### APIキーの取り扱い

外部APIの認証情報（APIキー・Bearerトークン・Basic認証パスワード）を扱う際は、以下を厳守すること。

#### 禁止事項

- `console.log` / `console.info` / `console.debug` に認証情報を出力しない
- エラーメッセージのテキストに認証情報を含めない
- ソースコードに認証情報をハードコードしない
- ローカルファイル（JSON・.env等）に平文で認証情報を保存しない

#### 推奨事項

| 推奨事項                          | 理由                                         |
| --------------------------------- | -------------------------------------------- |
| HTTPSエンドポイントを使用する     | 通信経路での盗聴防止                         |
| APIキーをKeytarで管理する（将来） | OSのキーチェーン活用でディスク平文保存を防ぐ |
| APIキーのローテーションを定期実施 | 漏洩時の被害最小化                           |
| 最小権限のAPIキーを使用する       | スコープを絞り悪用リスクを低減               |

### HTTP URLへのアクセス警告

HTTPSでないURL（`http://` で始まるURL）を使用すると、以下の警告がコンソールに出力される:

```
[HttpExternalApiAdapter] Warning: non-HTTPS URL detected: http://...
```

この警告はリクエストをブロックしない。開発環境（localhost等）での使用は許容されるが、
本番環境では必ずHTTPSを使用すること。

---

## 参照資料

| 資料名              | パス                                                                                                                                                            |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 11 手動テスト | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-02-par-task-03-external-api-support/phase-11-manual-testing.md` |
| Phase 1 要件定義    | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-02-par-task-03-external-api-support/phase-1-requirements.md`    |

## 完了条件

- [ ] 中学生レベル説明（「外部APIとは」「なぜAPIキーを安全に管理するか」）を記述した
- [ ] 技術者向けリファレンス（IExternalApiAdapter・HttpExternalApiAdapter・ExternalApiConfig・ExternalApiConfigForm・IPC）を記述した
- [ ] セキュリティ上の注意点（禁止事項・推奨事項・HTTPS警告）を記述した

## 次の Phase: Phase 13（phase-13-completion.md）
