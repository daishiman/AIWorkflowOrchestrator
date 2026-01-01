# Registry 実装テンプレート

## 概要

このテンプレートは、型安全なレジストリを実装するための基本構造を提供します。

## 基本レジストリ

```typescript
/**
 * {{RegistryName}} - {{説明}}
 *
 * @typeParam TKey - キーの型
 * @typeParam TValue - 値の型
 */
export class {{RegistryName}}<TKey extends string, TValue> {
  private readonly items: Map<TKey, TValue> = new Map();

  /**
   * アイテムを登録する
   * @param key - 一意のキー
   * @param value - 登録する値
   * @throws DuplicateKeyError - キーが既に存在する場合
   */
  register(key: TKey, value: TValue): void {
    if (this.items.has(key)) {
      throw new DuplicateKeyError(key);
    }
    this.items.set(key, value);
  }

  /**
   * アイテムを取得する
   * @param key - 取得するキー
   * @returns 値、または undefined
   */
  get(key: TKey): TValue | undefined {
    return this.items.get(key);
  }

  /**
   * アイテムを取得する（存在しない場合は例外）
   * @param key - 取得するキー
   * @returns 値
   * @throws ItemNotFoundError - キーが存在しない場合
   */
  getOrThrow(key: TKey): TValue {
    const value = this.get(key);
    if (value === undefined) {
      throw new ItemNotFoundError(key, this.list());
    }
    return value;
  }

  /**
   * キーが存在するか確認する
   */
  has(key: TKey): boolean {
    return this.items.has(key);
  }

  /**
   * 登録されているキーの一覧を取得する
   */
  list(): TKey[] {
    return Array.from(this.items.keys());
  }

  /**
   * 登録されている値の一覧を取得する
   */
  values(): TValue[] {
    return Array.from(this.items.values());
  }

  /**
   * アイテムを削除する
   */
  unregister(key: TKey): boolean {
    return this.items.delete(key);
  }

  /**
   * 全てのアイテムを削除する
   */
  clear(): void {
    this.items.clear();
  }

  /**
   * 登録されているアイテム数を取得する
   */
  get size(): number {
    return this.items.size;
  }
}
```

## ワークフローレジストリ

```typescript
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

## エラークラス

```typescript
/**
 * キー重複エラー
 */
export class DuplicateKeyError extends Error {
  constructor(key: string) {
    super(`Item with key '${key}' is already registered`);
    this.name = "DuplicateKeyError";
  }
}

/**
 * アイテム未発見エラー
 */
export class ItemNotFoundError extends Error {
  constructor(key: string, availableKeys: string[]) {
    const available =
      availableKeys.length > 0
        ? `Available: ${availableKeys.join(", ")}`
        : "No items registered";
    super(`Item '${key}' not found. ${available}`);
    this.name = "ItemNotFoundError";
  }
}

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
```

## 登録ファイル例

```typescript
// src/features/registry.ts

import { WorkflowRegistry } from "@/shared/core/registry";
import { AuthenticationExecutor } from "./authentication/executor";
import { NotificationExecutor } from "./notification/executor";
import { AnalyticsExecutor } from "./analytics/executor";

/**
 * 全てのExecutorをレジストリに登録する
 */
export function registerAllExecutors(registry: WorkflowRegistry): void {
  // 組み込みExecutor
  registry.register(new AuthenticationExecutor());
  registry.register(new NotificationExecutor());
  registry.register(new AnalyticsExecutor());

  // === 新機能追加時はここに1行追加 ===
  // registry.register(new NewFeatureExecutor());

  registry.markInitialized();
}

/**
 * デフォルトのレジストリを作成して初期化する
 */
export function createInitializedRegistry(): WorkflowRegistry {
  const registry = new WorkflowRegistry();
  registerAllExecutors(registry);
  return registry;
}
```

## チェックリスト

- [ ] 型安全なマッピングが実装されているか？
- [ ] 重複登録の処理は適切か？
- [ ] 未登録キーへのアクセスは適切にハンドリングされているか？
- [ ] リスト機能が提供されているか？
- [ ] 初期化状態の管理は必要か？
- [ ] エラーメッセージは有用か？
