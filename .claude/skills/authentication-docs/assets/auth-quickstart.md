# 認証クイックスタートテンプレート

## {{API_NAME}} 認証ガイド

> **所要時間**: 約10分
> **前提条件**: {{PREREQUISITES}}

---

## Step 1: 認証情報の取得

### 開発者ポータルでアプリを登録

1. [{{DEVELOPER_PORTAL_URL}}]({{DEVELOPER_PORTAL_URL}}) にアクセス
2. 「アプリケーション作成」をクリック
3. 以下の情報を入力:
   - **アプリ名**: あなたのアプリ名
   - **リダイレクトURI**: `{{REDIRECT_URI_EXAMPLE}}`
   - **スコープ**: {{DEFAULT_SCOPES}}
4. 「作成」をクリック

### 認証情報をメモ

作成後に表示される以下の情報を安全に保存してください：

| 項目          | 説明                            |
| ------------- | ------------------------------- |
| Client ID     | `{{CLIENT_ID_PLACEHOLDER}}`     |
| Client Secret | `{{CLIENT_SECRET_PLACEHOLDER}}` |

> ⚠️ **注意**: Client Secretは一度しか表示されません。
> 安全な場所に保存してください。

---

## Step 2: 認証方式の選択

### あなたに最適な認証方式

| アプリケーション種別        | 推奨方式                  | リンク                            |
| --------------------------- | ------------------------- | --------------------------------- |
| Webアプリ（サーバーサイド） | Authorization Code        | [詳細](#authorization-code-flow)  |
| SPA / モバイルアプリ        | Authorization Code + PKCE | [詳細](#authorization-code--pkce) |
| サーバー間通信              | Client Credentials        | [詳細](#client-credentials-flow)  |
| CLIツール                   | Device Code               | [詳細](#device-code-flow)         |

---

## Step 3: トークン取得

### Authorization Code Flow

#### 3.1 認可URLにリダイレクト

```
{{AUTHORIZATION_ENDPOINT}}?
  response_type=code
  &client_id={{CLIENT_ID_PLACEHOLDER}}
  &redirect_uri={{REDIRECT_URI_EXAMPLE}}
  &scope={{DEFAULT_SCOPES}}
  &state={{RANDOM_STATE}}
```

#### 3.2 コールバックで認可コードを受け取り

```
{{REDIRECT_URI_EXAMPLE}}?code=AUTH_CODE&state={{RANDOM_STATE}}
```

#### 3.3 認可コードをトークンに交換

```bash
curl -X POST "{{TOKEN_ENDPOINT}}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=AUTH_CODE" \
  -d "redirect_uri={{REDIRECT_URI_EXAMPLE}}" \
  -d "client_id={{CLIENT_ID_PLACEHOLDER}}" \
  -d "client_secret={{CLIENT_SECRET_PLACEHOLDER}}"
```

**レスポンス:**

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "dGhpcyBpcyBh..."
}
```

---

### Authorization Code + PKCE

#### 3.1 code_verifierとcode_challengeを生成

```javascript
// code_verifier: 43-128文字のランダム文字列
const codeVerifier = generateRandomString(64);

// code_challenge: code_verifierのSHA-256ハッシュ（Base64URL）
const codeChallenge = await sha256(codeVerifier);
```

#### 3.2 認可URLにリダイレクト

```
{{AUTHORIZATION_ENDPOINT}}?
  response_type=code
  &client_id={{CLIENT_ID_PLACEHOLDER}}
  &redirect_uri={{REDIRECT_URI_EXAMPLE}}
  &scope={{DEFAULT_SCOPES}}
  &state={{RANDOM_STATE}}
  &code_challenge={{CODE_CHALLENGE}}
  &code_challenge_method=S256
```

#### 3.3 トークン取得（code_verifier付き）

```bash
curl -X POST "{{TOKEN_ENDPOINT}}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=AUTH_CODE" \
  -d "redirect_uri={{REDIRECT_URI_EXAMPLE}}" \
  -d "client_id={{CLIENT_ID_PLACEHOLDER}}" \
  -d "code_verifier={{CODE_VERIFIER}}"
```

---

### Client Credentials Flow

```bash
curl -X POST "{{TOKEN_ENDPOINT}}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -u "{{CLIENT_ID_PLACEHOLDER}}:{{CLIENT_SECRET_PLACEHOLDER}}" \
  -d "grant_type=client_credentials" \
  -d "scope={{DEFAULT_SCOPES}}"
```

---

## Step 4: APIを呼び出す

取得したアクセストークンを使用してAPIを呼び出します：

```bash
curl -X GET "{{API_BASE_URL}}/{{EXAMPLE_ENDPOINT}}" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**レスポンス例:**

```json
{{EXAMPLE_RESPONSE}}
```

---

## Step 5: トークンを更新する

アクセストークンが期限切れになった場合、リフレッシュトークンで更新します：

```bash
curl -X POST "{{TOKEN_ENDPOINT}}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token" \
  -d "refresh_token=YOUR_REFRESH_TOKEN" \
  -d "client_id={{CLIENT_ID_PLACEHOLDER}}" \
  -d "client_secret={{CLIENT_SECRET_PLACEHOLDER}}"
```

---

## コード例

<details>
<summary>JavaScript (Node.js)</summary>

```javascript
const axios = require("axios");

const TOKEN_ENDPOINT = "{{TOKEN_ENDPOINT}}";
const API_BASE_URL = "{{API_BASE_URL}}";

// トークン取得
async function getToken(code) {
  const response = await axios.post(
    TOKEN_ENDPOINT,
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: "{{REDIRECT_URI_EXAMPLE}}",
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    }),
  );
  return response.data;
}

// API呼び出し
async function callApi(accessToken) {
  const response = await axios.get(`${API_BASE_URL}/{{EXAMPLE_ENDPOINT}}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
}
```

</details>

<details>
<summary>Python</summary>

```python
import requests
import os

TOKEN_ENDPOINT = '{{TOKEN_ENDPOINT}}'
API_BASE_URL = '{{API_BASE_URL}}'

def get_token(code):
    response = requests.post(TOKEN_ENDPOINT, data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': '{{REDIRECT_URI_EXAMPLE}}',
        'client_id': os.environ['CLIENT_ID'],
        'client_secret': os.environ['CLIENT_SECRET']
    })
    return response.json()

def call_api(access_token):
    response = requests.get(
        f'{API_BASE_URL}/{{EXAMPLE_ENDPOINT}}',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    return response.json()
```

</details>

---

## トラブルシューティング

### よくあるエラー

| エラー                  | 原因                               | 解決方法                    |
| ----------------------- | ---------------------------------- | --------------------------- |
| `invalid_client`        | Client IDまたはSecretが不正        | 認証情報を確認              |
| `invalid_grant`         | 認可コードが期限切れまたは使用済み | 再度認可フローを実行        |
| `invalid_scope`         | 許可されていないスコープ           | スコープ設定を確認          |
| `redirect_uri_mismatch` | リダイレクトURIが一致しない        | 登録済みURIと完全一致させる |

---

## 次のステップ

- [APIリファレンス]({{API_REFERENCE_URL}})
- [SDKドキュメント]({{SDK_DOCS_URL}})
- [サンプルアプリケーション]({{SAMPLE_APPS_URL}})

---

## サポート

ご不明点は {{SUPPORT_EMAIL}} までお問い合わせください。
