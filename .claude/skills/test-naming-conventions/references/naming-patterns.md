# 命名パターン一覧

## 概要

テストの命名には複数のパターンがあります。
プロジェクトで一貫したパターンを選択し、統一して使用することが重要です。

---

## Should形式

### 基本構文

```
should [動詞] [期待される結果/状態]
should [動詞] [期待される結果] when [条件]
should not [動詞] when [条件]
```

### 例

```typescript
// 基本形
it("should return the sum of two numbers", () => {});
it("should create a new user", () => {});
it("should send welcome email", () => {});

// 条件付き
it("should return user when id is valid", () => {});
it("should throw NotFoundError when user does not exist", () => {});
it("should return empty array when no results match", () => {});

// 否定形
it("should not allow login when password is incorrect", () => {});
it("should not send email when user is unsubscribed", () => {});
```

### 利点

- 英語として自然に読める
- 期待される動作が明確
- 最も広く使われているパターン

---

## Given-When-Then形式（BDDスタイル）

### 基本構文

```
Given [前提条件]
When [アクション]
Then [期待される結果]
```

### describe構造での実装

```typescript
describe("UserService", () => {
  describe("given a valid user id", () => {
    describe("when getUser is called", () => {
      it("then it should return the user data", () => {});
    });
  });

  describe("given an invalid user id", () => {
    describe("when getUser is called", () => {
      it("then it should throw NotFoundError", () => {});
    });
  });
});
```

### 単一のit内での実装

```typescript
it("given valid credentials, when login is called, then it should return auth token", () => {
  // Given
  const credentials = { email: "test@example.com", password: "password" };

  // When
  const result = authService.login(credentials);

  // Then
  expect(result.token).toBeDefined();
});
```

### 利点

- 前提条件が明確
- ビジネス要件との対応が取りやすい
- BDDツール（Cucumber等）との親和性

---

## Arrange-Act-Assert形式

### 基本構文

```
[対象]_[アクション]_[期待結果]
```

### 例

```typescript
// アンダースコア区切り
it("calculateTotal_withValidItems_returnsSum", () => {});
it("validateEmail_withInvalidFormat_returnsFalse", () => {});
it("createUser_withDuplicateEmail_throwsError", () => {});

// キャメルケース（読みにくい）
it("calculateTotalWithValidItemsReturnsSum", () => {});
```

### コード構造

```typescript
it("calculateTotal_withValidItems_returnsSum", () => {
  // Arrange
  const items = [{ price: 100 }, { price: 200 }];
  const calculator = new Calculator();

  // Act
  const result = calculator.calculateTotal(items);

  // Assert
  expect(result).toBe(300);
});
```

### 利点

- テストの構造が名前に反映される
- メソッド名と直接対応
- 自動生成しやすい

---

## 動詞リスト

### 戻り値系

| 動詞      | 使用場面 | 例                        |
| --------- | -------- | ------------------------- |
| return    | 値を返す | should return user data   |
| get       | 取得     | should get user by id     |
| calculate | 計算     | should calculate total    |
| generate  | 生成     | should generate unique id |
| convert   | 変換     | should convert to JSON    |
| format    | 整形     | should format date        |

### 状態変更系

| 動詞   | 使用場面 | 例                           |
| ------ | -------- | ---------------------------- |
| create | 作成     | should create new user       |
| update | 更新     | should update user name      |
| delete | 削除     | should delete user           |
| add    | 追加     | should add item to cart      |
| remove | 除去     | should remove item from list |
| set    | 設定     | should set default value     |

### 検証系

| 動詞     | 使用場面 | 例                           |
| -------- | -------- | ---------------------------- |
| validate | 検証     | should validate email format |
| check    | チェック | should check permission      |
| verify   | 確認     | should verify token          |
| accept   | 受け入れ | should accept valid input    |
| reject   | 拒否     | should reject invalid input  |

### 副作用系

| 動詞   | 使用場面 | 例                        |
| ------ | -------- | ------------------------- |
| send   | 送信     | should send email         |
| save   | 保存     | should save to database   |
| log    | 記録     | should log error message  |
| emit   | 発行     | should emit event         |
| notify | 通知     | should notify subscribers |

### エラー系

| 動詞  | 使用場面   | 例                            |
| ----- | ---------- | ----------------------------- |
| throw | 例外スロー | should throw NotFoundError    |
| fail  | 失敗       | should fail with message      |
| error | エラー     | should error on invalid input |

---

## 条件表現

### when句

```typescript
it("should [動作] when [条件]", () => {});

// 例
it("should return empty array when no results found", () => {});
it("should throw error when input is null", () => {});
it("should redirect when session expires", () => {});
```

### if句

```typescript
it("should [動作] if [条件]", () => {});

// 例
it("should apply discount if user is premium", () => {});
it("should skip validation if flag is set", () => {});
```

### with句

```typescript
it("should [動作] with [入力/状態]", () => {});

// 例
it("should calculate total with valid items", () => {});
it("should format date with custom pattern", () => {});
```

### for句

```typescript
it("should [動作] for [対象]", () => {});

// 例
it("should return discount for premium users", () => {});
it("should generate report for last month", () => {});
```

---

## パターン選択ガイド

### Should形式を選ぶ場面

- 汎用的なテスト
- チームに馴染みがある
- シンプルなテストケース

### Given-When-Then形式を選ぶ場面

- BDDを採用している
- ビジネス要件との対応が重要
- 複雑な前提条件がある

### Arrange-Act-Assert形式を選ぶ場面

- メソッド名との対応を重視
- 自動生成ツールを使用
- 技術的なテスト

---

## チェックリスト

### テスト名の品質

- [ ] 何をテストしているか明確か？
- [ ] 期待結果が含まれているか？
- [ ] 条件が明記されているか？
- [ ] 英語として自然に読めるか？

### 一貫性

- [ ] プロジェクト全体で同じパターンか？
- [ ] 同じファイル内で統一されているか？
- [ ] 略語は使用していないか？
