---
name: test-naming-conventions
description: |
  テストの命名規則とドキュメンテーションを専門とするスキル。
  読みやすく保守しやすいテストコードの作成を支援します。

  専門分野:
  - 命名パターン: Given-When-Then、Arrange-Act-Assert
  - テスト記述: should形式、BDD形式
  - ファイル構成: テストファイルの命名と配置
  - ドキュメンテーション: テストの意図を明確にする

  使用タイミング:
  - テストの命名に迷った時
  - テストの可読性を改善したい時
  - チームでの命名規則を統一したい時
  - テストファイルの構成を整理したい時

  Use proactively when writing test descriptions.
version: 1.0.0
---

# Test Naming Conventions

## 概要

良いテスト名は、テストが失敗した時に何が問題かをすぐに理解できます。
このスキルでは、説明的で一貫性のあるテスト命名規則を提供します。

**核心原則**:
- テスト名は仕様書である
- 失敗時に何が問題か分かる
- 一貫性のある命名パターン

**対象ユーザー**:
- ユニットテスター（@unit-tester）
- 品質エンジニア（@quality-engineer）
- すべての開発者

## リソース構造

```
test-naming-conventions/
├── SKILL.md                              # 本ファイル
├── resources/
│   ├── naming-patterns.md                # 命名パターン一覧
│   ├── describe-structure.md             # describe構造
│   └── file-organization.md              # ファイル構成
├── scripts/
│   └── test-name-linter.mjs              # テスト命名規則チェッカー
└── templates/
    └── naming-guide.md                   # 命名ガイドテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# 命名パターン一覧
cat .claude/skills/test-naming-conventions/resources/naming-patterns.md

# describe構造
cat .claude/skills/test-naming-conventions/resources/describe-structure.md

# ファイル構成
cat .claude/skills/test-naming-conventions/resources/file-organization.md
```

### スクリプト実行

```bash
# テスト命名規則チェック
# テストファイルの命名規則をチェックし、改善提案を出力
node .claude/skills/test-naming-conventions/scripts/test-name-linter.mjs <test-file>

# 例
node .claude/skills/test-naming-conventions/scripts/test-name-linter.mjs src/__tests__/user-service.test.ts
```

## クイックリファレンス

### 推奨パターン

```typescript
// should + 動詞 + 期待される結果
it('should return user when id is valid', () => {});

// should + 動詞 + when + 条件
it('should throw error when user is not found', () => {});

// should + not + 動詞 + when + 条件
it('should not allow login when password is invalid', () => {});
```

**詳細**: `resources/naming-patterns.md`

### describe構造

```typescript
describe('UserService', () => {
  describe('getUser', () => {
    describe('when user exists', () => {
      it('should return user data', () => {});
    });

    describe('when user does not exist', () => {
      it('should throw NotFoundError', () => {});
    });
  });
});
```

**詳細**: `resources/describe-structure.md`

## 命名の黄金ルール

### 1. 何をテストしているか明確に

```typescript
// ❌ 悪い例
it('test1', () => {});
it('works', () => {});
it('user test', () => {});

// ✅ 良い例
it('should return user when valid id is provided', () => {});
it('should throw NotFoundError when user does not exist', () => {});
```

### 2. 入力と期待結果を含める

```typescript
// ❌ 入力が不明確
it('should validate email', () => {});

// ✅ 入力と結果が明確
it('should return true when email has valid format', () => {});
it('should return false when email lacks @ symbol', () => {});
```

### 3. 実装詳細ではなく振る舞いを記述

```typescript
// ❌ 実装詳細
it('should call repository.findById', () => {});

// ✅ 振る舞い
it('should return user data from database', () => {});
```

### 4. 具体的な条件を記述

```typescript
// ❌ 曖昧
it('should handle edge cases', () => {});

// ✅ 具体的
it('should return empty array when no users match criteria', () => {});
it('should throw ValidationError when age is negative', () => {});
```

## パターン別ガイド

### should形式（推奨）

```typescript
// 基本形
it('should [動詞] [期待結果]', () => {});

// 条件付き
it('should [動詞] [期待結果] when [条件]', () => {});

// 例
it('should return sum of two numbers', () => {});
it('should throw error when divisor is zero', () => {});
it('should send email when user registers', () => {});
```

### Given-When-Then形式

```typescript
describe('UserService', () => {
  describe('given a valid user id', () => {
    describe('when getUser is called', () => {
      it('then it should return the user', () => {});
    });
  });

  describe('given an invalid user id', () => {
    describe('when getUser is called', () => {
      it('then it should throw NotFoundError', () => {});
    });
  });
});
```

### BDD形式

```typescript
describe('User Registration', () => {
  context('with valid data', () => {
    it('creates a new user', () => {});
    it('sends welcome email', () => {});
  });

  context('with invalid email', () => {
    it('rejects the registration', () => {});
  });
});
```

## アンチパターン

### ❌ 曖昧な名前

```typescript
it('test', () => {});
it('works', () => {});
it('should work correctly', () => {});
```

### ❌ 重複した情報

```typescript
// describeで既にUserServiceと書いているのに繰り返す
describe('UserService', () => {
  it('UserService should return user', () => {});
});
```

### ❌ 実装詳細の暴露

```typescript
it('should call database.query with SELECT * FROM users', () => {});
```

### ❌ 複数の振る舞いを1つのテストに

```typescript
it('should validate, save, and send email', () => {});
```

## ベストプラクティス

### すべきこと

1. **一貫性を保つ**: プロジェクト全体で同じパターン
2. **具体的に書く**: 何をどうしたらどうなるか
3. **読みやすく**: 英語として自然に読める
4. **ドメイン用語を使用**: ビジネス用語を反映

### 避けるべきこと

1. **略語の使用**: `usr`より`user`
2. **技術用語の濫用**: ビジネス視点で記述
3. **長すぎる名前**: 必要な情報のみ
4. **コピペ**: 各テストに固有の説明

## 関連スキル

- **tdd-principles** (`.claude/skills/tdd-principles/SKILL.md`): TDDの基本原則
- **test-doubles** (`.claude/skills/test-doubles/SKILL.md`): テストダブル
- **vitest-advanced** (`.claude/skills/vitest-advanced/SKILL.md`): Vitest高度な使い方
- **boundary-value-analysis** (`.claude/skills/boundary-value-analysis/SKILL.md`): 境界値分析

## 参考文献

- **『Clean Code』** Robert C. Martin著
  - Chapter 9: Unit Tests
- **『xUnit Test Patterns』** Gerard Meszaros著
- **BDD（Behavior-Driven Development）**: Dan North

---

## 使用上の注意

### このスキルが得意なこと
- Should形式、Given-When-Then、Arrange-Act-Assert形式の選定
- describe階層構造の設計
- テストファイルの命名と配置
- テスト名の自己文書化

### このスキルが行わないこと
- テストコードの具体的な実装（→ vitest-advanced）
- テストケースの設計手法（→ boundary-value-analysis）
- TDDサイクルの原則（→ tdd-principles）

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-26 | 初版作成 - テスト命名規則 |
