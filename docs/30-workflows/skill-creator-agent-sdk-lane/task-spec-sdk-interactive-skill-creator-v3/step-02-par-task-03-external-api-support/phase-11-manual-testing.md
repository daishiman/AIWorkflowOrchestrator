# Phase 11: 手動テスト -- External API Support（外部APIサポート）

## メタ情報

| 項目      | 値                       |
| --------- | ------------------------ |
| Phase番号 | 11                       |
| 機能名    | external-api-support     |
| タスクID  | TASK-SDK-SC-03           |
| 作成日    | 2026-04-02               |
| 依存Phase | Phase 10（最終レビュー） |

## 目的

自動テストでカバーできない実環境での動作（Electron UI・実ネットワーク・フォーム操作）を手動で検証する。

## 前提条件

- Electronアプリが起動できる状態であること
- TASK-SDK-SC-01（SDK Session Bridge）が完了していること
- モックAPIサーバー（localhost:3000）が起動可能であること
- `ExternalApiConfigForm` が `external-api-config-required` イベントで表示可能であること

## Task 11-1: モックAPIサーバーの準備

```bash
# シンプルなモックサーバーをローカルで起動する
npx json-server --port 3000 --watch mock-db.json
```

`mock-db.json` の内容:

```json
{
  "items": [{ "id": 1, "name": "テストアイテム" }],
  "echo": [{ "id": 1, "message": "Hello from mock API" }]
}
```

## Task 11-2: MT-01 — モックサーバー（localhost:3000）でGET/POST動作確認

### 手順

1. Electronアプリを起動する
2. skill-creatorのフローを開始し、`ExternalApiConfigForm` を表示する
3. 以下の設定を入力する:
   - API名: `test-mock-api`
   - URL: `http://localhost:3000/items`（意図的にHTTPを使用）
   - メソッド: `GET`
   - 認証種別: `なし`
4. 「設定を送信」ボタンをクリックする

### 期待する結果

- [ ] GETリクエストが `http://localhost:3000/items` に送信され、レスポンスが返る
- [ ] Electronの開発者ツール（Console）に `non-HTTPS URL detected: http://localhost:3000/items` の警告が表示される
- [ ] POSTテスト: メソッドを `POST`、URL を `http://localhost:3000/items` に変更して送信でき、モックサーバーにデータが登録される

## Task 11-3: MT-02 — 認証エラー時のエラー表示確認

### 手順

1. `ExternalApiConfigForm` を開く
2. 以下の設定を入力する:
   - API名: `auth-error-test`
   - URL: `https://httpbin.org/status/401`
   - メソッド: `GET`
   - 認証種別: `api-key`
   - 認証情報: `invalid-key`
3. 「設定を送信」ボタンをクリックする

### 期待する結果

- [ ] HTTP 401レスポンスが `ExternalApiHttpError`（statusCode=401）として処理される
- [ ] UIにエラーメッセージが表示される（「External API returned HTTP 401」またはそれに相当するメッセージ）
- [ ] コンソールに `invalid-key` という認証情報が出力されていない

## Task 11-4: MT-03 — タイムアウト時のメッセージ確認

### 手順

1. レスポンスに35秒かかるエンドポイントを用意する:

   ```bash
   # json-serverの遅延設定（35秒 = 35000ms）
   npx json-server --port 3001 --watch mock-db.json --delay 35000
   ```

2. `ExternalApiConfigForm` に以下を設定する:
   - API名: `slow-api`
   - URL: `http://localhost:3001/items`
   - メソッド: `GET`
   - 認証種別: `なし`

3. 「設定を送信」ボタンをクリックし、30秒以上待つ

### 期待する結果

- [ ] 30秒後にタイムアウトし、`ExternalApiTimeoutError` がスローされる
- [ ] UIに「External API request timed out after 30s」またはそれに相当するエラーメッセージが表示される
- [ ] エラーメッセージが画面上でユーザーに通知される（アラートまたはエラー表示エリア）

## Task 11-5: MT-04 — bearer認証でAuthorizationヘッダー確認

### 手順

1. `ExternalApiConfigForm` に以下を設定する:
   - API名: `bearer-test`
   - URL: `https://httpbin.org/headers`
   - メソッド: `GET`
   - 認証種別: `bearer`
   - 認証情報: `my-test-bearer-token`

2. 「設定を送信」ボタンをクリックする

### 期待する結果

- [ ] `https://httpbin.org/headers` へのリクエストが成功する
- [ ] レスポンスボディの `headers['Authorization']` が `Bearer my-test-bearer-token` であることを確認できる
- [ ] `my-test-bearer-token` がElectronのConsoleログに出力されていない

## 手動テスト結果サマリー

| テストID | 内容                                      | 結果 | 備考 |
| -------- | ----------------------------------------- | ---- | ---- |
| MT-01    | モックサーバーGET/POST + HTTP警告ログ確認 | -    |      |
| MT-02    | 認証エラー（401）時のUI表示確認           | -    |      |
| MT-03    | タイムアウト（30秒超）時のメッセージ確認  | -    |      |
| MT-04    | bearer認証でAuthorizationヘッダー確認     | -    |      |

## 参照資料

| 資料名                | パス                                                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 10 最終レビュー | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-02-par-task-03-external-api-support/phase-10-final-review.md` |

## 完了条件

- [ ] MT-01: モックAPIサーバーへのGET/POST動作を確認した
- [ ] MT-01: HTTPSでないURL（localhost）で警告ログが表示されることを確認した
- [ ] MT-02: 認証エラー（401）時にUIにエラーメッセージが表示されることを確認した
- [ ] MT-02: 認証情報がコンソールに出力されていないことを確認した
- [ ] MT-03: タイムアウト（30秒超）でエラーメッセージが表示されることを確認した
- [ ] MT-04: bearer認証でリクエストヘッダーに `Authorization: Bearer` が含まれることを確認した

## 次の Phase: Phase 12（phase-12-documentation.md）
