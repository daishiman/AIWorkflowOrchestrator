# describe構造

## 概要

`describe`ブロックを効果的に使用して、テストを論理的に構造化する方法を解説します。

---

## 基本構造

### クラス/モジュール → メソッド → シナリオ

```typescript
describe("UserService", () => {
  // クラス/モジュール名
  describe("getUser", () => {
    // メソッド名
    describe("when user exists", () => {
      // シナリオ
      it("should return user data", () => {});
    });

    describe("when user does not exist", () => {
      it("should throw NotFoundError", () => {});
    });
  });

  describe("createUser", () => {
    describe("with valid data", () => {
      it("should create and return user", () => {});
    });

    describe("with invalid email", () => {
      it("should throw ValidationError", () => {});
    });
  });
});
```

---

## コンテキスト別パターン

### 状態別

```typescript
describe("Order", () => {
  describe("when order is pending", () => {
    it("should allow cancellation", () => {});
    it("should allow modification", () => {});
  });

  describe("when order is shipped", () => {
    it("should not allow cancellation", () => {});
    it("should not allow modification", () => {});
  });

  describe("when order is delivered", () => {
    it("should allow return request", () => {});
  });
});
```

### 入力タイプ別

```typescript
describe("parseInput", () => {
  describe("with string input", () => {
    it("should parse valid JSON string", () => {});
    it("should throw on invalid JSON", () => {});
  });

  describe("with object input", () => {
    it("should return object as is", () => {});
  });

  describe("with null/undefined input", () => {
    it("should return default value", () => {});
  });
});
```

### ユーザーロール別

```typescript
describe("Dashboard", () => {
  describe("for admin users", () => {
    it("should show all sections", () => {});
    it("should enable delete button", () => {});
  });

  describe("for regular users", () => {
    it("should hide admin section", () => {});
    it("should disable delete button", () => {});
  });

  describe("for guest users", () => {
    it("should redirect to login", () => {});
  });
});
```

---

## ネストレベルのガイドライン

### 推奨: 最大3レベル

```typescript
describe("Level 1: Class/Module", () => {
  describe("Level 2: Method", () => {
    describe("Level 3: Scenario", () => {
      it("Test case", () => {});
    });
  });
});
```

### 深すぎる場合の対処

```typescript
// ❌ 悪い例: 深すぎる
describe("UserService", () => {
  describe("createUser", () => {
    describe("with valid data", () => {
      describe("when database is available", () => {
        describe("when email service is up", () => {
          it("should create user", () => {});
        });
      });
    });
  });
});

// ✅ 良い例: ファイル分割またはフラット化
describe("UserService.createUser", () => {
  describe("happy path", () => {
    it("should create user when all services are available", () => {});
  });

  describe("error handling", () => {
    it("should handle database error", () => {});
    it("should handle email service error", () => {});
  });
});
```

---

## セットアップの共有

### スコープ別セットアップ

```typescript
describe("UserService", () => {
  // 全テスト共通
  let service: UserService;

  beforeAll(() => {
    // 一度だけ実行
  });

  beforeEach(() => {
    service = new UserService();
  });

  describe("getUser", () => {
    // このブロック用のセットアップ
    let mockRepository: MockRepository;

    beforeEach(() => {
      mockRepository = createMockRepository();
      service.setRepository(mockRepository);
    });

    it("should return user", () => {});
  });

  describe("createUser", () => {
    // 別のセットアップ
    beforeEach(() => {
      // createUser用のセットアップ
    });

    it("should create user", () => {});
  });
});
```

---

## 命名のベストプラクティス

### describeの命名

```typescript
// クラス/モジュール名
describe("UserService", () => {});
describe("calculateTax", () => {});

// メソッド名
describe("#getUser", () => {}); // インスタンスメソッド
describe(".getInstance", () => {}); // 静的メソッド

// コンテキスト
describe("when user is authenticated", () => {});
describe("with valid input", () => {});
describe("given a new user", () => {});
```

### プレフィックスパターン

```typescript
// #: インスタンスメソッド
describe("UserService", () => {
  describe("#getUser", () => {});
  describe("#createUser", () => {});
});

// .: 静的メソッド
describe("UserService", () => {
  describe(".getInstance", () => {});
});

// when/with/given: コンテキスト
describe("#getUser", () => {
  describe("when user exists", () => {});
  describe("with valid id", () => {});
  describe("given authentication", () => {});
});
```

---

## ファイル構成との対応

### 1ファイル1クラス

```
src/
├── services/
│   └── user.service.ts
tests/
├── unit/
│   └── services/
│       └── user.service.test.ts
```

```typescript
// user.service.test.ts
describe("UserService", () => {
  describe("#getUser", () => {});
  describe("#createUser", () => {});
  describe("#updateUser", () => {});
  describe("#deleteUser", () => {});
});
```

### メソッド別ファイル（大規模）

```
tests/
├── unit/
│   └── services/
│       └── user-service/
│           ├── get-user.test.ts
│           ├── create-user.test.ts
│           └── update-user.test.ts
```

```typescript
// get-user.test.ts
describe("UserService#getUser", () => {
  describe("when user exists", () => {});
  describe("when user does not exist", () => {});
});
```

---

## アンチパターン

### ❌ フラットすぎる構造

```typescript
describe("UserService", () => {
  it("getUser returns user when found", () => {});
  it("getUser throws when not found", () => {});
  it("createUser creates user", () => {});
  it("createUser throws on invalid", () => {});
  // 50個のテストがフラットに並ぶ
});
```

### ❌ 深すぎる構造

```typescript
describe("UserService", () => {
  describe("getUser", () => {
    describe("when authenticated", () => {
      describe("when user exists", () => {
        describe("when cache is available", () => {
          it("should return cached user", () => {});
        });
      });
    });
  });
});
```

### ❌ 意味のない分類

```typescript
describe("UserService", () => {
  describe("positive tests", () => {}); // 何のため？
  describe("negative tests", () => {}); // 意味がない
});
```

---

## チェックリスト

### 構造

- [ ] describe階層は3レベル以内か？
- [ ] 各describeの名前は明確か？
- [ ] 論理的にグループ化されているか？

### セットアップ

- [ ] 適切なスコープでセットアップしているか？
- [ ] beforeAll/beforeEachを適切に使い分けているか？
- [ ] 不要な重複がないか？

### ファイル構成

- [ ] ファイル名とdescribeが対応しているか？
- [ ] ファイルが大きすぎないか？
- [ ] 必要に応じて分割しているか？
