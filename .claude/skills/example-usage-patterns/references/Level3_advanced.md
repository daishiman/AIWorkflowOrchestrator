# Level 3: 高度なシナリオと複雑性管理

## 目的

複雑なシナリオに対応する例を設計し、大規模プロジェクトでの例の管理方法を習得する。

## 対象者

- Level 2のパターンを理解した開発者
- 複雑なAPI統合のドキュメント作成者
- 大規模プロジェクトのテクニカルライター

---

## 1. 複雑なシナリオの例示

### 1.1 認証フロー

#### マルチステップ認証

```javascript
/**
 * OAuth 2.0 認証フロー
 * 1. 認可コード取得
 * 2. アクセストークン取得
 * 3. リフレッシュトークン使用
 */

class OAuth2Client {
  constructor(clientId, clientSecret, redirectUri) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
  }

  // ステップ1: 認可URLを生成
  getAuthorizationUrl(state) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: "read write",
      state: state,
    });
    return `https://auth.example.com/authorize?${params}`;
  }

  // ステップ2: 認可コードをトークンに交換
  async exchangeCodeForToken(code) {
    const response = await fetch("https://auth.example.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.tokenExpiry = Date.now() + data.expires_in * 1000;

    return data;
  }

  // ステップ3: トークンのリフレッシュ
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch("https://auth.example.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + data.expires_in * 1000;

    return data;
  }

  // トークンの有効性チェックと自動リフレッシュ
  async ensureValidToken() {
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      await this.refreshAccessToken();
    }
    return this.accessToken;
  }

  // 認証済みリクエスト
  async makeAuthenticatedRequest(url, options = {}) {
    const token = await this.ensureValidToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  }
}
```

### 1.2 ページネーション

#### カーソルベースのページネーション

```javascript
/**
 * カーソルベースのページネーション
 * 大量のデータを効率的に取得
 */

class PaginatedAPIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  /**
   * すべてのページを自動的に取得
   * @param {string} endpoint - APIエンドポイント
   * @param {number} pageSize - ページサイズ
   * @returns {AsyncGenerator} ページごとの結果
   */
  async *fetchAllPages(endpoint, pageSize = 100) {
    let cursor = null;
    let hasMore = true;

    while (hasMore) {
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        ...(cursor && { cursor }),
      });

      const response = await fetch(`${this.baseURL}/${endpoint}?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // 現在のページのデータをyield
      yield data.items;

      // 次のページ情報を更新
      cursor = data.next_cursor;
      hasMore = data.has_more;

      // レート制限対策
      await this.delay(100);
    }
  }

  /**
   * すべてのアイテムを配列に収集
   */
  async fetchAll(endpoint, pageSize = 100) {
    const allItems = [];

    for await (const items of this.fetchAllPages(endpoint, pageSize)) {
      allItems.push(...items);
    }

    return allItems;
  }

  /**
   * ストリーミング処理
   */
  async processAllItems(endpoint, processor, pageSize = 100) {
    for await (const items of this.fetchAllPages(endpoint, pageSize)) {
      for (const item of items) {
        await processor(item);
      }
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// 使用例
const client = new PaginatedAPIClient("https://api.example.com");

// 方法1: すべてのデータを配列に収集
const allUsers = await client.fetchAll("users", 100);
console.log(`Total users: ${allUsers.length}`);

// 方法2: ストリーミング処理（メモリ効率的）
await client.processAllItems(
  "users",
  async (user) => {
    console.log(`Processing user: ${user.id}`);
    // 各ユーザーを処理
  },
  100,
);

// 方法3: ジェネレータで手動制御
for await (const users of client.fetchAllPages("users", 50)) {
  console.log(`Page received: ${users.length} users`);
  // ページごとに処理
}
```

### 1.3 エラーリカバリー戦略

```javascript
/**
 * 高度なエラーリカバリーとリトライ戦略
 */

class ResilientAPIClient {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.timeout = options.timeout || 30000;
    this.circuitBreaker = new CircuitBreaker(options.circuitBreaker);
  }

  async request(endpoint, options = {}) {
    // サーキットブレーカーチェック
    if (this.circuitBreaker.isOpen()) {
      throw new Error("Circuit breaker is open");
    }

    let lastError;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(
          `${this.baseURL}/${endpoint}`,
          options,
          this.timeout,
        );

        // 成功時はサーキットブレーカーをリセット
        this.circuitBreaker.recordSuccess();

        return await response.json();
      } catch (error) {
        lastError = error;

        // リトライ不可能なエラー
        if (this.isNonRetriableError(error)) {
          this.circuitBreaker.recordFailure();
          throw error;
        }

        // 最後の試行でない場合のみリトライ
        if (attempt < this.maxRetries - 1) {
          const delay = this.calculateBackoff(attempt);
          console.warn(
            `Retrying in ${delay}ms (attempt ${attempt + 1}/${this.maxRetries})`,
          );
          await this.delay(delay);
        }
      }
    }

    // すべてのリトライが失敗
    this.circuitBreaker.recordFailure();
    throw new Error(
      `Failed after ${this.maxRetries} attempts: ${lastError.message}`,
    );
  }

  async fetchWithTimeout(url, options, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  isNonRetriableError(error) {
    // 4xxエラー（クライアントエラー）はリトライしない
    if (error.message.includes("HTTP 4")) {
      return true;
    }

    // タイムアウトと5xxエラーはリトライ可能
    return false;
  }

  calculateBackoff(attempt) {
    // Exponential backoff with jitter
    const exponentialDelay = this.retryDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 1000;
    return Math.min(exponentialDelay + jitter, 30000); // 最大30秒
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * サーキットブレーカーパターン
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 60秒
    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  isOpen() {
    if (this.state === "OPEN") {
      // タイムアウト後にHALF_OPENに移行
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = "HALF_OPEN";
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess() {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
      console.warn("Circuit breaker opened");
    }
  }
}
```

---

## 2. サンプルプロジェクトの構築

### 2.1 プロジェクト構造

```
example-project/
├── README.md                   # プロジェクト概要
├── package.json                # 依存関係
├── .env.example                # 環境変数のテンプレート
├── src/
│   ├── index.js                # エントリーポイント
│   ├── config.js               # 設定
│   ├── client.js               # APIクライアント
│   └── utils/
│       ├── auth.js             # 認証ユーティリティ
│       ├── retry.js            # リトライロジック
│       └── pagination.js       # ページネーション
├── examples/
│   ├── basic-usage.js          # 基本的な使用例
│   ├── advanced-usage.js       # 高度な使用例
│   └── error-handling.js       # エラーハンドリング例
└── tests/
    ├── client.test.js          # ユニットテスト
    └── integration.test.js     # 統合テスト
```

### 2.2 README.md のベストプラクティス

````markdown
# Example Project Name

簡潔な1-2文の説明。

## Quick Start

\```bash

# インストール

npm install

# 環境変数の設定

cp .env.example .env

# .env ファイルを編集してAPI keyを設定

# 基本的な使用例を実行

node examples/basic-usage.js
\```

## Installation

\```bash
npm install example-package
\```

## Usage

### Basic Example

\```javascript
const { Client } = require('example-package');

const client = new Client({
apiKey: process.env.API_KEY
});

const data = await client.getData();
console.log(data);
\```

### Advanced Examples

詳細な例は `examples/` ディレクトリを参照してください：

- [`examples/basic-usage.js`](./examples/basic-usage.js) - 基本的な使用方法
- [`examples/advanced-usage.js`](./examples/advanced-usage.js) - 高度な機能
- [`examples/error-handling.js`](./examples/error-handling.js) - エラーハンドリング

## API Reference

詳細は [API documentation](./docs/API.md) を参照してください。

## Testing

\```bash

# すべてのテストを実行

npm test

# カバレッジレポートを生成

npm run coverage
\```

## Contributing

貢献ガイドラインは [CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。

## License

MIT
````

---

## 3. 例のテスト戦略

### 3.1 実行可能性の自動検証

````javascript
// scripts/validate-examples.mjs
import { execSync } from "child_process";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const EXAMPLES_DIR = "./examples";

function extractCodeBlocks(markdown) {
  const codeBlockRegex = /```(?:javascript|js)\n([\s\S]*?)```/g;
  const matches = [];
  let match;

  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}

function validateExample(filePath) {
  try {
    console.log(`Validating: ${filePath}`);

    // JavaScriptファイルとして実行
    if (filePath.endsWith(".js")) {
      execSync(`node ${filePath}`, { stdio: "pipe" });
      return { success: true };
    }

    // Markdownファイルからコードブロックを抽出
    if (filePath.endsWith(".md")) {
      const content = readFileSync(filePath, "utf-8");
      const codeBlocks = extractCodeBlocks(content);

      for (const code of codeBlocks) {
        // 一時ファイルに保存して実行
        // ...実装省略
      }
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// すべての例を検証
const files = readdirSync(EXAMPLES_DIR);
const results = files.map((file) => {
  const filePath = join(EXAMPLES_DIR, file);
  return { file, ...validateExample(filePath) };
});

// レポート出力
console.log("\n=== Validation Results ===");
results.forEach(({ file, success, error }) => {
  console.log(`${success ? "✓" : "✗"} ${file}`);
  if (!success) {
    console.log(`  Error: ${error}`);
  }
});

const failedCount = results.filter((r) => !r.success).length;
process.exit(failedCount > 0 ? 1 : 0);
````

### 3.2 スナップショットテスト

```javascript
// tests/examples.test.js
import { execSync } from "child_process";

describe("Example outputs", () => {
  test("basic-usage.js produces expected output", () => {
    const output = execSync("node examples/basic-usage.js").toString();
    expect(output).toMatchSnapshot();
  });

  test("advanced-usage.js produces expected output", () => {
    const output = execSync("node examples/advanced-usage.js").toString();
    expect(output).toMatchSnapshot();
  });
});
```

---

## 4. ドキュメント統合

### 4.1 APIドキュメントとの連携

````markdown
# API: getUser

## Signature

\```typescript
getUser(userId: string): Promise<User>
\```

## Parameters

- `userId` (string): ユーザーID

## Returns

`Promise<User>` - ユーザー情報

## Example

\```javascript
const user = await client.getUser('123');
console.log(user.name); // "John Doe"
\```

## Related Examples

- [Basic usage](../examples/basic-usage.js)
- [Error handling](../examples/error-handling.js)
````

---

## 5. 次のステップ

Level 3の内容を理解したら、以下に進んでください：

- **Level 4**: 大規模プロジェクトとメンテナンス戦略（`Level4_expert.md`）
- **テスト戦略**: `references/testing-strategies.md` で詳細を確認
- **レビュー**: `references/review-criteria.md` で品質基準を確認

---

## 参考資料

- 『Building Maintainable Software』：複雑性の管理
- 『Release It!』：エラーリカバリーパターン
- 『Designing Data-Intensive Applications』：大規模システムの設計
