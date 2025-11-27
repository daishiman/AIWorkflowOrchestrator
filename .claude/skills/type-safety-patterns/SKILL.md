---
name: type-safety-patterns
description: |
  TypeScript厳格モードによる型安全性設計を専門とするスキル。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/type-safety-patterns/resources/discriminated-union-patterns.md`: Discriminated Union Patternsリソース
  - `.claude/skills/type-safety-patterns/resources/generics-patterns.md`: Generics Patternsリソース
  - `.claude/skills/type-safety-patterns/resources/strict-mode-guide.md`: Strict Mode Guideリソース
  - `.claude/skills/type-safety-patterns/resources/type-guard-patterns.md`: Type Guard Patternsリソース

  - `.claude/skills/type-safety-patterns/templates/type-safe-patterns.ts`: Type Safe Patternsテンプレート

  - `.claude/skills/type-safety-patterns/scripts/check-type-safety.mjs`: Check Type Safetyスクリプト

version: 1.0.0
---

# Type Safety Patterns

## 概要

このスキルは、TypeScript 厳格モードを活用した堅牢な型システムの構築方法を提供します。
型ガード、Discriminated Unions、ジェネリクスなどの高度な型機能を使いこなし、
コンパイル時のエラー検出を最大化することで、より安全なコードを実現します。

**主要な価値**:

- コンパイル時のエラー検出によるランタイムエラーの防止
- IDE の強力なコード補完と型推論の活用
- 自己文書化されたコードによる保守性の向上

**対象ユーザー**:

- スキーマ定義を行うエージェント（@schema-def）
- 型安全な API を設計する開発者
- TypeScript の型システムを深く活用したいチーム

## リソース構造

```
type-safety-patterns/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── strict-mode-guide.md                   # TypeScript厳格モード設定
│   ├── type-guard-patterns.md                 # 型ガードパターン
│   ├── discriminated-union-patterns.md        # Discriminated Unionsパターン
│   └── generics-patterns.md                   # ジェネリクスパターン
├── scripts/
│   └── check-type-safety.mjs                  # 型安全性チェックスクリプト
└── templates/
    └── type-safe-patterns.ts                  # 型安全パターンテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# TypeScript厳格モード設定ガイド
cat .claude/skills/type-safety-patterns/resources/strict-mode-guide.md

# 型ガードパターン
cat .claude/skills/type-safety-patterns/resources/type-guard-patterns.md

# Discriminated Unionsパターン
cat .claude/skills/type-safety-patterns/resources/discriminated-union-patterns.md

# ジェネリクスパターン
cat .claude/skills/type-safety-patterns/resources/generics-patterns.md
```

### スクリプト実行

```bash
# 型安全性チェック
node .claude/skills/type-safety-patterns/scripts/check-type-safety.mjs <file.ts>
```

### テンプレート参照

```bash
# 型安全パターンテンプレート
cat .claude/skills/type-safety-patterns/templates/type-safe-patterns.ts
```

## いつ使うか

### シナリオ 1: 厳格モードの導入

**状況**: 既存プロジェクトに TypeScript 厳格モードを導入したい

**適用条件**:

- [ ] strict オプションを有効にしたい
- [ ] 型安全性を高めたい
- [ ] IDE の補完機能を最大限活用したい

**期待される成果**: 適切に設定された tsconfig.json と型安全なコード

### シナリオ 2: 型ガードの実装

**状況**: ランタイムで型を判別し、型安全に処理したい

**適用条件**:

- [ ] 外部データの型を確認する必要がある
- [ ] Union 型を安全に絞り込みたい
- [ ] カスタム型ガード関数を作成したい

**期待される成果**: 型安全な型ガード実装

### シナリオ 3: Discriminated Unions の設計

**状況**: 複数の状態を持つデータ構造を型安全に設計したい

**適用条件**:

- [ ] 状態ごとに異なるプロパティを持つ
- [ ] 状態に応じた処理を型安全に行いたい
- [ ] 網羅性チェックを活用したい

**期待される成果**: 型安全な Discriminated Union 設計

## 基本概念

### TypeScript 厳格モード設定

```json
// tsconfig.json
{
  "compilerOptions": {
    // 厳格モード（推奨）
    "strict": true,

    // 追加の厳格オプション
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

### 型ガードの基本

```typescript
// typeof型ガード
function processValue(value: string | number) {
  if (typeof value === "string") {
    // value は string 型として認識
    return value.toUpperCase();
  }
  // value は number 型として認識
  return value.toFixed(2);
}

// instanceof型ガード
function processError(error: Error | string) {
  if (error instanceof Error) {
    return error.message;
  }
  return error;
}

// in型ガード
interface Dog {
  bark(): void;
}
interface Cat {
  meow(): void;
}

function makeSound(animal: Dog | Cat) {
  if ("bark" in animal) {
    animal.bark();
  } else {
    animal.meow();
  }
}

// カスタム型ガード（is キーワード）
function isString(value: unknown): value is string {
  return typeof value === "string";
}
```

### Discriminated Unions

```typescript
// 判別フィールドによるユニオン型
type Result<T> = { success: true; data: T } | { success: false; error: Error };

function handleResult<T>(result: Result<T>) {
  if (result.success) {
    // result.data にアクセス可能
    console.log(result.data);
  } else {
    // result.error にアクセス可能
    console.error(result.error.message);
  }
}

// 状態管理でのDiscriminated Union
type LoadingState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

function renderState<T>(state: LoadingState<T>) {
  switch (state.status) {
    case "idle":
      return "Ready";
    case "loading":
      return "Loading...";
    case "success":
      return `Data: ${state.data}`;
    case "error":
      return `Error: ${state.error.message}`;
  }
}
```

### 網羅性チェック

```typescript
// never型を使用した網羅性チェック
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number }
  | { kind: "rectangle"; width: number; height: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.size ** 2;
    case "rectangle":
      return shape.width * shape.height;
    default:
      // 新しいshapeが追加された場合、コンパイルエラー
      return assertNever(shape);
  }
}
```

## 判断基準チェックリスト

### TypeScript 設定時

- [ ] strict: true が設定されているか？
- [ ] noUncheckedIndexedAccess を有効にすべきか？
- [ ] プロジェクトの要件に合った厳格度か？

### 型ガード実装時

- [ ] 適切な型ガードの種類を選択しているか？
- [ ] 型述語（is）を正しく使用しているか？
- [ ] エッジケースを考慮しているか？

### Discriminated Union 設計時

- [ ] 判別フィールドは明確か？
- [ ] 網羅性チェックが可能な設計か？
- [ ] 将来の拡張に対応できる設計か？

## 関連スキル

- `.claude/skills/zod-validation/SKILL.md` - Zod バリデーション
- `.claude/skills/error-message-design/SKILL.md` - エラーメッセージ設計

## 変更履歴

| バージョン | 日付       | 変更内容                                    |
| ---------- | ---------- | ------------------------------------------- |
| 1.0.0      | 2025-11-25 | 初版リリース - 型安全性パターンの基本を網羅 |
