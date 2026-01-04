# 統合テストの基礎

## 統合テストとは

**定義**: 複数のコンポーネント、モジュール、サービスを組み合わせて、それらの相互作用が正しく機能することを検証するテスト。

### 目的

- コンポーネント間のインターフェースの正常動作確認
- データフローの検証
- 外部システム（DB、API、ファイルシステム）との連携確認
- エンドツーエンドのビジネスワークフロー保証

### ユニットテストとの違い

| 観点           | ユニットテスト          | 統合テスト                         |
| -------------- | ----------------------- | ---------------------------------- |
| スコープ       | 単一のクラス/関数       | 複数のコンポーネント               |
| 依存関係       | モック/スタブで置き換え | 実際の依存関係を使用（一部モック） |
| 実行速度       | 高速（ミリ秒単位）      | 中速（秒単位）                     |
| テスト数       | 多数（数百〜数千）      | 中程度（数十〜数百）               |
| 失敗時の特定性 | 問題箇所を特定しやすい  | 複数箇所が原因の可能性             |

## テストピラミッド

```
        /\
       /E2E\        ← 少数（遅い、高コスト、脆い）
      /------\
     /統合テスト\     ← 中程度（適度な速度とコスト）
    /----------\
   /ユニットテスト\  ← 多数（高速、低コスト、安定）
  /--------------\
```

### 推奨比率

1. **ユニットテスト（70%）**: 詳細なロジック検証
2. **統合テスト（20%）**: コンポーネント間の相互作用
3. **E2Eテスト（10%）**: ユーザーシナリオの完全なフロー

## 統合テストの種類

### 1. コンポーネント統合テスト

```typescript
describe("UserService integration", () => {
  it("should create user and save to database", async () => {
    const userService = new UserService(new UserRepository(db));
    const user = await userService.createUser({
      name: "Alice",
      email: "alice@example.com",
    });
    expect(user.id).toBeDefined();
    expect(user.name).toBe("Alice");
  });
});
```

### 2. データベース統合テスト

```typescript
describe("User repository", () => {
  it("should persist user to database", async () => {
    const user = await db.insert(users).values({ name: "Bob" }).returning();
    const retrieved = await db
      .select()
      .from(users)
      .where(eq(users.id, user[0].id));
    expect(retrieved[0].name).toBe("Bob");
  });
});
```

### 3. API統合テスト

```typescript
describe("API integration", () => {
  it("should fetch user data from API", async () => {
    const response = await fetch("/api/users/1");
    const user = await response.json();
    expect(user.id).toBe(1);
    expect(user.name).toBeDefined();
  });
});
```

## 基本パターン

### Arrange-Act-Assert (AAA) パターン

```typescript
it("should complete workflow", async () => {
  // Arrange: テストデータとコンテキストを準備
  const testData = { name: "Test User" };
  await setupTestDatabase();

  // Act: 実際の操作を実行
  const result = await service.processData(testData);

  // Assert: 期待する結果を検証
  expect(result.status).toBe("success");
  expect(result.data).toMatchObject(testData);
});
```

### Setup/Teardown パターン

```typescript
describe("Integration Test Suite", () => {
  beforeEach(async () => {
    await cleanDatabase();
    await seedTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it("test case 1", async () => {
    /* ... */
  });
});
```

## よくある課題と解決策

### 課題1: テストが遅い

**解決策**:

- テストDBをインメモリDBに変更（SQLite、H2）
- 並列実行を導入
- 不要なテストデータを削減

### 課題2: テストが不安定（Flaky）

**解決策**:

- 各テストでトランザクションをロールバック
- テストデータを独立させる
- 並列実行時のデータ競合を回避

### 課題3: テストが複雑で保守が困難

**解決策**:

- テストヘルパー関数を作成
- ファクトリーパターンでテストデータを生成
- アサーションを明確にする
