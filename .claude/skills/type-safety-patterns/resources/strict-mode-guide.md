# TypeScript厳格モード設定ガイド

## 概要

TypeScriptの厳格モード設定により、より安全なコードを書くための設定と
各オプションの効果を解説します。

## 推奨設定

```json
{
  "compilerOptions": {
    // === 厳格モード ===
    "strict": true,

    // === 追加の厳格オプション ===
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true,
    "forceConsistentCasingInFileNames": true,

    // === 型チェック強化 ===
    "skipLibCheck": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
```

## 各オプションの詳細

### strict: true

`strict: true` は以下のオプションをすべて有効化します：

#### strictNullChecks

null と undefined を明示的に処理することを強制。

```typescript
// ❌ strictNullChecks: false（危険）
function getLength(str: string) {
  return str.length; // str が null の場合、ランタイムエラー
}

// ✅ strictNullChecks: true（安全）
function getLength(str: string | null): number {
  if (str === null) {
    return 0;
  }
  return str.length;
}
```

#### strictBindCallApply

bind, call, apply の引数を厳密にチェック。

```typescript
function greet(name: string, age: number) {
  console.log(`${name} is ${age}`);
}

// ❌ 型エラー
greet.call(undefined, 'John'); // age が不足
greet.apply(undefined, ['John', 'thirty']); // age が string

// ✅ 正しい使用
greet.call(undefined, 'John', 30);
greet.apply(undefined, ['John', 30]);
```

#### strictFunctionTypes

関数の引数の型を厳密にチェック（反変性）。

```typescript
interface Animal { name: string }
interface Dog extends Animal { breed: string }

type Handler<T> = (value: T) => void;

declare let animalHandler: Handler<Animal>;
declare let dogHandler: Handler<Dog>;

// ❌ strictFunctionTypes: true では型エラー
// animalHandler = dogHandler;

// ✅ 正しい代入
dogHandler = animalHandler;
```

#### strictPropertyInitialization

クラスプロパティの初期化を強制。

```typescript
// ❌ 初期化されていないプロパティ
class User {
  name: string; // エラー
  email: string; // エラー
}

// ✅ 正しい初期化
class User {
  name: string;
  email: string;

  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
  }
}

// または definite assignment assertion
class User {
  name!: string; // 後で初期化されることを明示
  email!: string;
}
```

#### noImplicitAny

暗黙の any を禁止。

```typescript
// ❌ 暗黙の any
function process(data) {
  // data は any 型として推論される
  return data.value;
}

// ✅ 明示的な型
function process(data: { value: string }): string {
  return data.value;
}
```

#### noImplicitThis

暗黙の this を禁止。

```typescript
// ❌ 暗黙の this
const obj = {
  value: 42,
  getValue() {
    return function() {
      return this.value; // this は any
    };
  }
};

// ✅ 明示的な this または アロー関数
const obj = {
  value: 42,
  getValue() {
    return () => {
      return this.value; // this は obj を参照
    };
  }
};
```

#### useUnknownInCatchVariables

catch の引数を unknown 型に。

```typescript
// ✅ useUnknownInCatchVariables: true
try {
  throw new Error('Something went wrong');
} catch (error) {
  // error は unknown 型
  if (error instanceof Error) {
    console.log(error.message);
  }
}
```

### 追加の厳格オプション

#### noUncheckedIndexedAccess

配列やオブジェクトのインデックスアクセスに undefined を含める。

```typescript
const arr = [1, 2, 3];
const obj: Record<string, number> = { a: 1, b: 2 };

// noUncheckedIndexedAccess: true
const value1 = arr[0]; // number | undefined
const value2 = obj['a']; // number | undefined

// 安全なアクセス
if (value1 !== undefined) {
  console.log(value1.toFixed(2));
}

// または Non-null assertion（確信がある場合のみ）
const value3 = arr[0]!; // number
```

#### exactOptionalPropertyTypes

オプショナルプロパティに undefined を明示的に代入することを禁止。

```typescript
interface Config {
  name: string;
  timeout?: number;
}

// ❌ exactOptionalPropertyTypes: true ではエラー
const config: Config = {
  name: 'app',
  timeout: undefined, // エラー
};

// ✅ 正しい使用
const config: Config = {
  name: 'app',
  // timeout を省略
};

// または
interface Config {
  name: string;
  timeout?: number | undefined; // undefined を許可
}
```

#### noImplicitReturns

すべてのコードパスで戻り値を返すことを強制。

```typescript
// ❌ 暗黙の undefined 返却
function getValue(condition: boolean): string {
  if (condition) {
    return 'value';
  }
  // return がない
}

// ✅ すべてのパスで return
function getValue(condition: boolean): string {
  if (condition) {
    return 'value';
  }
  return 'default';
}
```

#### noFallthroughCasesInSwitch

switch の case に break/return がないことを警告。

```typescript
// ❌ フォールスルー
switch (value) {
  case 1:
    console.log('one');
    // break がない
  case 2:
    console.log('two');
    break;
}

// ✅ 明示的なフォールスルー
switch (value) {
  case 1:
  case 2: // 意図的なフォールスルー
    console.log('one or two');
    break;
}
```

#### noPropertyAccessFromIndexSignature

インデックスシグネチャへのドットアクセスを禁止。

```typescript
interface StringMap {
  [key: string]: string;
}

const map: StringMap = { foo: 'bar' };

// ❌ ドットアクセス
const value1 = map.foo; // エラー

// ✅ ブラケットアクセス
const value2 = map['foo']; // OK
```

## 段階的な導入

### Phase 1: 基本的な厳格性

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

### Phase 2: 追加の安全性

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Phase 3: 最高レベルの厳格性

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版リリース |
