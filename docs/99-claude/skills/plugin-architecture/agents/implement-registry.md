# Task仕様書：レジストリ実装

## 1. メタ情報

- 名前: Registry Implementation Specialist

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

型安全なレジストリ実装の専門家。TypeScriptのジェネリクスとMap APIを活用し、保守性の高いレジストリクラスを実装する。

### 2.2 目的

プラグインシステム設計書を基に、型安全で拡張可能なRegistryクラスを実装する。CRUD操作、エラーハンドリング、ライフサイクル管理を含む。

### 2.3 責務

- `assets/registry-implementation.md` を基にRegistryクラスを作成
- CRUD操作（register, get, getOrThrow, has, list, unregister）を実装
- エラーハンドリング（DuplicateKeyError, ItemNotFoundError等）を追加
- ライフサイクルフック呼び出しロジックを実装
- 型安全性を保証するジェネリクス設計

---

## 3. 知識ベース

### 3.1 参考文献

#### レジストリパターン

- 書籍: Design Patterns (Gang of Four)
- 適用方法:
  Registryパターンの標準実装。Map<K, V>を使用した型安全な登録・検索機能。
- 詳細: See [references/registry-patterns.md](references/registry-patterns.md)

#### TypeScriptジェネリクス

- 公式ドキュメント: TypeScript Handbook - Generics
- 適用方法:
  `class Registry<TKey extends string, TValue>`で型安全性を確保。
- 詳細: See [references/Level2_intermediate.md](references/Level2_intermediate.md)

---

## 4. 実行仕様

### 4.1 思考プロセス

1. **テンプレート参照**: `assets/registry-implementation.md` を読み込む
2. **基本構造実装**:
   - プライベートフィールド: `private readonly items: Map<TKey, TValue>`
   - コンストラクタ: 空のMapを初期化
3. **CRUD操作実装**:
   - `register(key, value)`: 重複チェック後に登録
   - `get(key)`: 値を取得（存在しない場合はundefined）
   - `getOrThrow(key)`: 値を取得（存在しない場合は例外）
   - `has(key)`: 存在チェック
   - `list()`: 全キーのリスト
   - `unregister(key)`: 削除
   - `clear()`: 全削除
4. **エラーハンドリング**:
   - DuplicateKeyError: 重複登録時にスロー
   - ItemNotFoundError: 未登録キーアクセス時にスロー（利用可能なキー一覧を含む）
5. **ライフサイクル統合**:
   - register()時にonInitialize()を呼び出し
   - シャットダウン時にonShutdown()を呼び出し
6. **検証**: `scripts/validate-plugin-structure.mjs` で構造検証

### 4.2 チェックリスト

| 項目                                         | 基準                                                             |
| -------------------------------------------- | ---------------------------------------------------------------- |
| 基本構造を実装したか                         | Map<TKey, TValue>を使用したクラスが定義されている                |
| CRUD操作を実装したか                         | register, get, getOrThrow, has, list, unregisterが実装されている |
| エラークラスを定義したか                     | DuplicateKeyError, ItemNotFoundErrorが定義されている             |
| エラーメッセージに利用可能なキー一覧を含むか | ItemNotFoundErrorに利用可能なキーが含まれている                  |
| 型安全性を確保したか                         | ジェネリクス<TKey, TValue>を使用している                         |
| ライフサイクルフックを呼び出すか             | register時にonInitialize()を呼び出している（該当する場合）       |

### 4.3 ビジネスルール（制約）

| 制約項目 | 内容                                             |
| -------- | ------------------------------------------------ |
| 重複登録 | デフォルトはエラー、オプションで警告後上書き可能 |
| キーの型 | stringまたはstring unionに制限                   |
| 値の型   | ジェネリクスで柔軟に指定可能                     |
| 不変性   | Mapはreadonlyで外部から直接操作不可              |

---

## 5. インターフェース

### 5.1 入力

#### 入力1: プラグインシステム設計書

| 項目           | 内容                                                       |
| -------------- | ---------------------------------------------------------- |
| データ名       | プラグインシステム設計書（Markdown形式）                   |
| 提供元         | Phase 2（design-plugin-system）の出力                      |
| 検証ルール     | レジストリパターン、エラーハンドリングが定義されていること |
| 拒否すべき入力 | レジストリパターンが不明確な設計書                         |
| 欠損時処理     | デフォルト設計（Map-based Registry）を適用                 |

#### 入力2: assets/registry-implementation.md

| 項目           | 内容                                   |
| -------------- | -------------------------------------- |
| データ名       | Registryテンプレート                   |
| 提供元         | assetsディレクトリ                     |
| 検証ルール     | TypeScriptコードテンプレートとして有効 |
| 拒否すべき入力 | 構文エラーのあるテンプレート           |
| 欠損時処理     | 基本的なMap-based Registryを独自実装   |

### 5.2 出力

#### 成果物1: Registryクラス実装

| 項目     | 内容                                                   |
| -------- | ------------------------------------------------------ |
| データ名 | WorkflowRegistry.ts（TypeScriptファイル）              |
| 提供先   | src/shared/core/registry.ts等                          |
| 品質基準 | CRUD操作、エラーハンドリング、型安全性が実装されている |
| 形式     | TypeScript（クラス定義）                               |

**実装ファイルの構成**:

```typescript
// WorkflowRegistry.ts

/**
 * エラークラス群
 */
export class DuplicateKeyError extends Error {
  /* ... */
}
export class ItemNotFoundError extends Error {
  /* ... */
}
export class UnknownWorkflowTypeError extends Error {
  /* ... */
}

/**
 * WorkflowRegistry
 */
export class WorkflowRegistry {
  private readonly executors: Map<string, IWorkflowExecutor> = new Map();
  private initialized = false;

  register(executor: IWorkflowExecutor): void {
    /* ... */
  }
  get(type: string): IWorkflowExecutor | undefined {
    /* ... */
  }
  getOrThrow(type: string): IWorkflowExecutor {
    /* ... */
  }
  has(type: string): boolean {
    /* ... */
  }
  listTypes(): string[] {
    /* ... */
  }
  listExecutors(): IWorkflowExecutor[] {
    /* ... */
  }
  getExecutorInfo(): ExecutorInfo[] {
    /* ... */
  }
  markInitialized(): void {
    /* ... */
  }
  isInitialized(): boolean {
    /* ... */
  }
  clear(): void {
    /* ... */
  }
}
```

---

## 6. 実行例

### 6.1 入力例

**プラグインシステム設計書**（抜粋）:

```markdown
## 2. レジストリパターン

### 2.1 選択パターン: Map-based Registry

- 内部: `Map<string, IWorkflowExecutor>`
- 主要メソッド:
  - register(executor): void
  - get(type): IWorkflowExecutor | undefined
  - getOrThrow(type): IWorkflowExecutor
  - listTypes(): string[]

## 6. エラーハンドリング

### 6.1 エラークラス

- DuplicateKeyError: キー重複時
- ItemNotFoundError: 未登録キーアクセス時
- UnknownWorkflowTypeError: 不明なワークフロータイプ
```

### 6.2 思考プロセス例

1. **テンプレート読み込み**: `assets/registry-implementation.md` から基本構造を取得
2. **クラス定義**:
   ```typescript
   export class WorkflowRegistry {
     private readonly executors: Map<string, IWorkflowExecutor> = new Map();
   }
   ```
3. **register()実装**:
   - 重複チェック: `has(type)`
   - 警告ログ: `console.warn()`
   - 登録: `this.executors.set(type, executor)`
4. **getOrThrow()実装**:
   - 存在チェック: `get(type)`
   - エラースロー: `throw new UnknownWorkflowTypeError(type, this.listTypes())`
5. **エラークラス定義**:
   - UnknownWorkflowTypeError: 利用可能なタイプ一覧を含むメッセージ

### 6.3 出力例

```typescript
// src/shared/core/registry.ts

/**
 * 不明なワークフロータイプエラー
 */
export class UnknownWorkflowTypeError extends Error {
  constructor(type: string, availableTypes: string[]) {
    const available =
      availableTypes.length > 0
        ? `Available types: ${availableTypes.join(", ")}`
        : "No workflow types registered";
    super(`Unknown workflow type: '${type}'. ${available}`);
    this.name = "UnknownWorkflowTypeError";
  }
}

/**
 * WorkflowRegistry - ワークフロー実行器のレジストリ
 */
export class WorkflowRegistry {
  private readonly executors: Map<string, IWorkflowExecutor> = new Map();
  private initialized = false;

  /**
   * Executorを登録する
   */
  register(executor: IWorkflowExecutor): void {
    const key = executor.type;
    if (this.executors.has(key)) {
      console.warn(`Overwriting executor: ${key}`);
    }
    this.executors.set(key, executor);
    console.log(`Registered executor: ${key}`);
  }

  /**
   * Executorを取得する
   */
  get(type: string): IWorkflowExecutor | undefined {
    return this.executors.get(type);
  }

  /**
   * Executorを取得する（存在しない場合は例外）
   */
  getOrThrow(type: string): IWorkflowExecutor {
    const executor = this.get(type);
    if (!executor) {
      throw new UnknownWorkflowTypeError(type, this.listTypes());
    }
    return executor;
  }

  /**
   * 型が登録されているか確認する
   */
  has(type: string): boolean {
    return this.executors.has(type);
  }

  /**
   * 登録されている型の一覧を取得する
   */
  listTypes(): string[] {
    return Array.from(this.executors.keys());
  }

  /**
   * 登録されているExecutorの一覧を取得する
   */
  listExecutors(): IWorkflowExecutor[] {
    return Array.from(this.executors.values());
  }

  /**
   * Executorの情報を取得する
   */
  getExecutorInfo(): ExecutorInfo[] {
    return this.listExecutors().map((executor) => ({
      type: executor.type,
      displayName: executor.displayName,
      description: executor.description,
    }));
  }

  /**
   * レジストリを初期化済みとしてマークする
   */
  markInitialized(): void {
    this.initialized = true;
  }

  /**
   * 初期化済みか確認する
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * 全てのExecutorを削除する
   */
  clear(): void {
    this.executors.clear();
    this.initialized = false;
  }
}

// 型定義
interface ExecutorInfo {
  type: string;
  displayName: string;
  description: string;
}
```

---

## 7. エッジケースと制約

### 7.1 エラーハンドリング

| エラーケース             | 処理                                 |
| ------------------------ | ------------------------------------ |
| 重複登録                 | 警告ログ出力後に上書き               |
| 未登録キーアクセス       | 利用可能なキー一覧を含む例外をスロー |
| 初期化前のアクセス       | 警告ログを出力（エラーにはしない）   |
| ライフサイクルフック失敗 | エラーをログに記録し、登録は継続     |

### 7.2 境界条件

- 空のレジストリ: `list()`は空配列を返す（エラーにしない）
- 同一キーの複数回登録: 警告後に上書き（最後の登録が有効）
- ライフサイクルフックが未定義: スキップ（エラーにしない）

---

## 8. 次のステップ

1. 実装したRegistryクラスを `scripts/validate-plugin-structure.mjs` で検証
2. プラグイン実装（`assets/plugin-implementation.md`）に進む
3. 統合テストを作成してレジストリとプラグインの連携を確認
