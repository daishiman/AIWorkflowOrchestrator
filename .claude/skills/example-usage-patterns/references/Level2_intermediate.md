# Level 2: 実践的なパターンとアンチパターン

## 目的

実務で頻出するパターンとアンチパターンを理解し、実践的な使用例を作成できるようになる。

## 対象者

- Level 1の基礎を理解した開発者
- 実践的な例を作成したい技術ライター
- パターンカタログを構築したいチーム

---

## 1. 例の種類と使い分け

### 1.1 Diátaxisフレームワーク

| 種類               | 目的       | 形式                 | 例                               |
| ------------------ | ---------- | -------------------- | -------------------------------- |
| **チュートリアル** | 学習       | ステップバイステップ | 「初めてのREST APIクライアント」 |
| **ハウツー**       | タスク達成 | 問題解決型           | 「認証トークンの取得方法」       |
| **リファレンス**   | 情報提供   | 簡潔な例示           | 「全APIエンドポイント一覧」      |
| **説明**           | 理解促進   | コンセプト説明       | 「なぜJWTを使うのか」            |

### 1.2 各種類の実装パターン

#### チュートリアル型

````markdown
# はじめてのREST APIクライアント

## ステップ1: 環境準備

\```bash
npm install axios
\```

## ステップ2: 基本的な取得

\```javascript
const axios = require('axios');
const response = await axios.get('https://api.example.com/users/1');
console.log(response.data);
\```

## ステップ3: エラーハンドリング追加

\```javascript
try {
const response = await axios.get('https://api.example.com/users/1');
console.log(response.data);
} catch (error) {
console.error('Error:', error.message);
}
\```

## ステップ4: 実践的な使用

\```javascript
async function getUserProfile(userId) {
  try {
    const response = await axios.get(`https://api.example.com/users/${userId}`);
return {
id: response.data.id,
name: response.data.name,
email: response.data.email
};
} catch (error) {
throw new Error(`Failed to fetch user ${userId}: ${error.message}`);
}
}
\```
````

#### ハウツー型

````markdown
# 認証トークンを使ってAPIにアクセスする方法

## 問題

API呼び出し時に「401 Unauthorized」エラーが発生する。

## 解決策

認証トークンをリクエストヘッダーに含める。

\```javascript
const axios = require('axios');

async function fetchProtectedData() {
const token = process.env.API_TOKEN;

const response = await axios.get('https://api.example.com/protected', {
headers: {
'Authorization': `Bearer ${token}`
}
});

return response.data;
}
\```

## トラブルシューティング

- トークンが無効: 新しいトークンを取得
- トークンの有効期限切れ: リフレッシュトークンで更新
````

---

## 2. エラーハンドリングパターン

### 2.1 基本的なtry-catchパターン

```javascript
async function fetchUser(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);

    // HTTPステータスチェック
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // ネットワークエラーとHTTPエラーを区別
    if (error.name === "TypeError") {
      throw new Error("Network error: Unable to reach the API");
    }
    throw error;
  }
}
```

### 2.2 エラー種類別の処理

```javascript
async function fetchUser(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);

    switch (response.status) {
      case 200:
        return await response.json();
      case 404:
        throw new Error(`User ${userId} not found`);
      case 401:
        throw new Error("Authentication required");
      case 403:
        throw new Error("Permission denied");
      case 500:
        throw new Error("Server error occurred");
      default:
        throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}
```

### 2.3 リトライパターン

```javascript
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return await response.json();
      }

      // 5xx エラーのみリトライ
      if (response.status >= 500 && i < maxRetries - 1) {
        await sleep(1000 * Math.pow(2, i)); // Exponential backoff
        continue;
      }

      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * Math.pow(2, i));
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

---

## 3. 段階的な複雑化パターン

### 3.1 段階1: 最小限の例

```javascript
// GET リクエスト
const response = await fetch("/api/users/123");
const user = await response.json();
console.log(user.name);
```

### 3.2 段階2: エラーハンドリング追加

```javascript
try {
  const response = await fetch("/api/users/123");

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const user = await response.json();
  console.log(user.name);
} catch (error) {
  console.error("Failed to fetch user:", error.message);
}
```

### 3.3 段階3: 設定とヘッダー

```javascript
const response = await fetch("/api/users/123", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 5000,
});
```

### 3.4 段階4: 完全な実装

```javascript
class UserAPIClient {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async getUser(userId) {
    const url = `${this.baseURL}/users/${userId}`;
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      timeout: 5000,
    };

    try {
      const response = await this.fetchWithRetry(url, options);
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch user ${userId}: ${error.message}`);
    }
  }

  async fetchWithRetry(url, options, maxRetries = 3) {
    // リトライロジック（上記参照）
  }
}
```

---

## 4. 実装チェックリスト

### 4.1 コード品質

- [ ] すべての変数と関数に明確な名前がついている
- [ ] マジックナンバーに説明コメントがある
- [ ] エラーハンドリングが適切に実装されている
- [ ] 非推奨のAPIを使用していない
- [ ] ベストプラクティスに従っている

### 4.2 ドキュメント

- [ ] 概要が1-2文で明確に説明されている
- [ ] 前提条件がすべて明記されている
- [ ] インストール手順が提供されている
- [ ] 期待される出力が示されている
- [ ] トラブルシューティングが含まれている

### 4.3 実行可能性

- [ ] すべての依存関係が明記されている
- [ ] コピー&ペーストで動作する
- [ ] 環境変数やAPI keyの取得方法が説明されている
- [ ] 必要な権限やアクセス設定が明記されている

---

## 5. アンチパターン

### 5.1 過度な抽象化

**悪い例：**

```javascript
// 抽象化しすぎて何をしているか不明
const data = await fetcher(endpoint)
  .transform(mapper)
  .validate(schema)
  .execute();
```

**良い例：**

```javascript
// 明確で追跡可能
const response = await fetch(endpoint);
const rawData = await response.json();
const mappedData = mapper(rawData);
const validatedData = schema.validate(mappedData);
```

### 5.2 不完全なエラーハンドリング

**悪い例：**

```javascript
try {
  const user = await getUser(123);
} catch (e) {
  // エラーを無視
}
```

**良い例：**

```javascript
try {
  const user = await getUser(123);
} catch (error) {
  console.error("Failed to fetch user:", error.message);
  // フォールバック処理またはエラーの再送出
  return null; // または throw error;
}
```

### 5.3 ハードコードされた値

**悪い例：**

```javascript
const response = await fetch("https://api.example.com/users/123", {
  headers: {
    Authorization: "Bearer abc123xyz456", // セキュリティリスク！
  },
});
```

**良い例：**

```javascript
const response = await fetch(`${process.env.API_URL}/users/${userId}`, {
  headers: {
    Authorization: `Bearer ${process.env.API_TOKEN}`,
  },
});
```

### 5.4 環境依存の例

**悪い例：**

```javascript
// Windowsでのみ動作
const data = fs.readFileSync("C:\\Users\\Admin\\data.json");
```

**良い例：**

```javascript
// クロスプラットフォーム
const path = require("path");
const dataPath = path.join(process.cwd(), "data", "data.json");
const data = fs.readFileSync(dataPath);
```

---

## 6. テストの追加

### 6.1 例のテスト

```javascript
// example.test.js
const { getUserProfile } = require("./example");

describe("getUserProfile", () => {
  test("should fetch user profile successfully", async () => {
    const user = await getUserProfile(123);
    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("email");
  });

  test("should handle 404 error", async () => {
    await expect(getUserProfile(99999)).rejects.toThrow("User 99999 not found");
  });
});
```

### 6.2 モックの使用

```javascript
// example.test.js
jest.mock("axios");
const axios = require("axios");

test("should handle network error", async () => {
  axios.get.mockRejectedValue(new Error("Network error"));

  await expect(getUserProfile(123)).rejects.toThrow("Network error");
});
```

---

## 7. 次のステップ

Level 2の内容を理解したら、以下に進んでください：

- **Level 3**: 高度なシナリオと複雑性管理（`Level3_advanced.md`）
- **パターンカタログ**: `references/example-types.md` で詳細なパターンを確認
- **レビュー**: `references/review-criteria.md` で品質基準を確認

---

## 参考資料

- 『Test-Driven Development』：段階的な実装
- 『The Pragmatic Programmer』：エラーハンドリング
- 『Refactoring』：コードスメルの検出
