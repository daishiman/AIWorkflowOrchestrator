# テスト命名規則

## 概要

テスト名は、テストが何を検証するかを明確に伝える重要な要素です。
良いテスト名は、テストが失敗した時にすぐに問題を理解できるようにします。

## 命名パターン

### パターン1: should + 期待動作 + when + 条件

**構造**: `should{ExpectedBehavior}When{Condition}`

**例**:

- `shouldReturnTrueWhenInputIsValid`
- `shouldThrowErrorWhenUserNotFound`
- `shouldCalculateTotalWithTax`

### パターン2: given + 条件 + when + アクション + then + 結果

**構造**: `given{Context}_when{Action}_then{Outcome}`

**例**:

- `givenValidUser_whenLogin_thenReturnsToken`
- `givenEmptyCart_whenAddItem_thenCartHasOneItem`

### パターン3: メソッド名 + 条件 + 期待結果

**構造**: `{methodName}_{condition}_{expectedResult}`

**例**:

- `calculateTotal_withDiscount_returnsReducedPrice`
- `validateEmail_invalidFormat_throwsValidationError`

## Given-When-Then形式

### 構造

- **Given**: テストの前提条件（コンテキスト）
- **When**: テスト対象のアクション
- **Then**: 期待される結果

### 利点

- テストの構造が明確
- 非技術者にも理解しやすい
- BDD（振る舞い駆動開発）との親和性

### テストコード内での適用

テスト本文でもGiven-When-Then構造を使用する。

```
// Given: 前提条件の準備

// When: アクションの実行

// Then: 結果の検証
```

## Arrange-Act-Assert形式

### 構造

- **Arrange**: テストデータの準備
- **Act**: テスト対象の実行
- **Assert**: 結果の検証

### 利点

- プログラマに馴染みやすい
- コードの構造が明確
- 単体テストに適している

## 良いテスト名の特徴

### 具体的

- ❌ `testCalculate`
- ✅ `shouldCalculateTotalIncludingTaxForMultipleItems`

### 振る舞いを説明

- ❌ `testMethod1`
- ✅ `shouldReturnEmptyListWhenNoMatchingItemsFound`

### 読みやすい

- ❌ `testThatWhenUserWithInvalidEmailTriesToRegisterThenSystemThrowsError`
- ✅ `shouldThrowErrorWhenEmailIsInvalid`

## 避けるべき命名

### 曖昧な名前

- `test1`, `testMethod`, `testIt`
- 何をテストしているか不明

### 実装詳細を含む

- `testCallsRepositoryFindMethod`
- 実装が変わると名前も変える必要がある

### 長すぎる名前

- 80文字を超える名前は避ける
- 重要な情報だけを含める

## テストグループの命名

### describe/contextブロック

テスト対象のクラスやメソッドを示す。

**パターン**:

- `describe('ClassName')` - クラス全体
- `describe('#methodName')` - インスタンスメソッド
- `describe('.staticMethod')` - 静的メソッド

### ネストしたコンテキスト

条件ごとにネストする。

**パターン**:

```
describe('UserService')
  describe('#createUser')
    context('when email is valid')
      it('should create user')
    context('when email is invalid')
      it('should throw error')
```

## チェックリスト

### テスト名を書く前

- [ ] テストする振る舞いを言語化できるか？
- [ ] 条件と期待結果を特定したか？

### テスト名を書いた後

- [ ] 名前だけで何をテストするか分かるか？
- [ ] 失敗した時に問題を特定できるか？
- [ ] 読みやすい長さか？
