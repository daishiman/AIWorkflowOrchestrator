# テスト命名ガイドテンプレート

## プロジェクト情報

- **プロジェクト名**: {{PROJECT_NAME}}
- **テストフレームワーク**: Vitest / Jest
- **採用パターン**: Should形式 / Given-When-Then / BDD

---

## 命名規則

### テストファイル

```
[source-name].test.ts

例:
user.service.ts → user.service.test.ts
formatDate.ts → formatDate.test.ts
```

### describe

```typescript
// レベル1: クラス/モジュール名
describe('UserService', () => {

  // レベル2: メソッド名
  describe('getUser', () => {

    // レベル3: シナリオ
    describe('when user exists', () => {
      // テストケース
    });
  });
});
```

### it/test

```typescript
// 基本形
it('should [動詞] [期待結果]', () => {});

// 条件付き
it('should [動詞] [期待結果] when [条件]', () => {});

// 否定形
it('should not [動詞] when [条件]', () => {});
```

---

## 例

### ユーザーサービスのテスト

```typescript
describe('UserService', () => {
  describe('getUser', () => {
    describe('when user exists', () => {
      it('should return user data', () => {});
      it('should include user preferences', () => {});
    });

    describe('when user does not exist', () => {
      it('should throw NotFoundError', () => {});
    });

    describe('when id is invalid', () => {
      it('should throw ValidationError', () => {});
    });
  });

  describe('createUser', () => {
    describe('with valid data', () => {
      it('should create and return new user', () => {});
      it('should send welcome email', () => {});
    });

    describe('with invalid email', () => {
      it('should throw ValidationError with message', () => {});
    });

    describe('with duplicate email', () => {
      it('should throw DuplicateError', () => {});
    });
  });
});
```

---

## 動詞リファレンス

### よく使う動詞

| 動詞 | 使用場面 |
|------|---------|
| return | 値を返す |
| throw | 例外をスロー |
| create | 新規作成 |
| update | 更新 |
| delete | 削除 |
| send | 送信 |
| validate | 検証 |
| allow | 許可 |
| reject | 拒否 |

### 例文テンプレート

```
should return [結果] when [条件]
should throw [エラー] when [条件]
should create [対象] with [データ]
should not allow [アクション] when [条件]
```

---

## コンテキスト表現

### whenを使用

```typescript
describe('when user is authenticated', () => {});
describe('when input is invalid', () => {});
describe('when database is unavailable', () => {});
```

### withを使用

```typescript
describe('with valid credentials', () => {});
describe('with empty input', () => {});
describe('with special characters', () => {});
```

### givenを使用（BDD）

```typescript
describe('given a premium user', () => {});
describe('given no existing data', () => {});
```

---

## アンチパターン

### 避けるべき名前

```typescript
// ❌ 曖昧
it('test', () => {});
it('works', () => {});
it('should work', () => {});

// ❌ 重複した情報
describe('UserService', () => {
  it('UserService should return user', () => {}); // UserServiceが重複
});

// ❌ 実装詳細
it('should call repository.findById', () => {});

// ❌ 複数の振る舞い
it('should validate and save and send email', () => {});
```

### 推奨される名前

```typescript
// ✅ 明確
it('should return user data when valid id is provided', () => {});
it('should throw NotFoundError when user does not exist', () => {});
it('should apply 10% discount for premium users', () => {});
```

---

## チェックリスト

### テスト名作成時

- [ ] 何をテストしているか明確か？
- [ ] 期待結果が含まれているか？
- [ ] 条件が明記されているか？
- [ ] 英語として自然に読めるか？
- [ ] 実装詳細に言及していないか？

### describe作成時

- [ ] 階層は3レベル以内か？
- [ ] 各レベルの名前は明確か？
- [ ] 論理的にグループ化されているか？

### ファイル作成時

- [ ] 命名規則に従っているか？
- [ ] ソースファイルとの対応が明確か？
- [ ] 適切なディレクトリに配置されているか？

---

## 参考

- Should形式: 最も一般的、英語として自然
- Given-When-Then形式: BDD、前提条件が明確
- Arrange-Act-Assert形式: メソッド名との対応

プロジェクトでは**一貫して同じパターン**を使用すること。
