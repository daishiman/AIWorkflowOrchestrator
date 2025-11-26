#!/usr/bin/env node
/**
 * generate-factory.mjs
 *
 * ファクトリコードを生成するスクリプト
 *
 * 使用方法:
 *   node .claude/skills/factory-patterns/scripts/generate-factory.mjs <pattern> <name>
 *
 * パターン:
 *   - factory-method: Factory Methodパターン
 *   - abstract-factory: Abstract Factoryパターン
 *   - builder: Builderパターン
 *   - registry: Registry Factoryパターン
 */

// ===== テンプレート =====

const templates = {
  'factory-method': (name) => `/**
 * ${name}Factory - Factory Methodパターン
 */

import { IWorkflowExecutor, ExecutionContext } from '@/shared/core/interfaces';

/**
 * Creator（抽象クラス）
 */
export abstract class ${name}Creator {
  /**
   * Factory Method - サブクラスで実装
   */
  abstract createExecutor(): IWorkflowExecutor;

  /**
   * ワークフローを実行（Factory Methodを使用）
   */
  async executeWorkflow<TInput, TOutput>(
    input: TInput,
    context: ExecutionContext
  ): Promise<TOutput> {
    const executor = this.createExecutor();
    return executor.execute(input, context) as Promise<TOutput>;
  }
}

/**
 * Concrete Creator - ${name}
 */
export class ${name}ExecutorCreator extends ${name}Creator {
  constructor(
    // 依存関係を注入
  ) {
    super();
  }

  createExecutor(): IWorkflowExecutor {
    return new ${name}Executor(
      // 依存関係を渡す
    );
  }
}

/**
 * 具体的なExecutor実装
 */
class ${name}Executor implements IWorkflowExecutor {
  readonly type = '${name.toUpperCase()}';
  readonly displayName = '${name}';
  readonly description = '${name}ワークフローを実行';

  constructor(
    // 依存関係
  ) {}

  async execute<TInput, TOutput>(
    input: TInput,
    context: ExecutionContext
  ): Promise<TOutput> {
    context.logger.info(\`Starting \${this.type}\`, { input });

    // 実装

    throw new Error('Not implemented');
  }
}
`,

  'abstract-factory': (name) => `/**
 * ${name}ComponentFactory - Abstract Factoryパターン
 */

import { IWorkflowExecutor } from '@/shared/core/interfaces';

/**
 * Abstract Factory
 */
export interface ${name}ComponentFactory {
  createExecutor(): IWorkflowExecutor;
  createValidator(): I${name}Validator;
  createLogger(): I${name}Logger;
}

/**
 * 製品インターフェース
 */
export interface I${name}Validator {
  validate(input: unknown): ValidationResult;
}

export interface I${name}Logger {
  log(message: string, data?: unknown): void;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Concrete Factory - 本番環境用
 */
export class Production${name}Factory implements ${name}ComponentFactory {
  createExecutor(): IWorkflowExecutor {
    return new Production${name}Executor();
  }

  createValidator(): I${name}Validator {
    return new Strict${name}Validator();
  }

  createLogger(): I${name}Logger {
    return new Structured${name}Logger();
  }
}

/**
 * Concrete Factory - テスト環境用
 */
export class Test${name}Factory implements ${name}ComponentFactory {
  createExecutor(): IWorkflowExecutor {
    return new Mock${name}Executor();
  }

  createValidator(): I${name}Validator {
    return new Lenient${name}Validator();
  }

  createLogger(): I${name}Logger {
    return new Console${name}Logger();
  }
}

// 具体的な製品クラスは別ファイルで実装
`,

  'builder': (name) => `/**
 * ${name}Builder - Builderパターン
 */

import { z } from 'zod';
import { IWorkflowExecutor, ExecutionContext } from '@/shared/core/interfaces';

/**
 * 設定インターフェース
 */
interface ${name}Config {
  type: string;
  displayName: string;
  description: string;
  inputSchema?: z.ZodSchema;
  outputSchema?: z.ZodSchema;
  retryConfig?: RetryConfig;
}

interface RetryConfig {
  maxRetries: number;
  delay: number;
}

/**
 * ${name}Builder
 */
export class ${name}Builder {
  private config: Partial<${name}Config> = {};

  /**
   * タイプを設定
   */
  withType(type: string): this {
    this.config.type = type;
    return this;
  }

  /**
   * 表示名を設定
   */
  withDisplayName(name: string): this {
    this.config.displayName = name;
    return this;
  }

  /**
   * 説明を設定
   */
  withDescription(description: string): this {
    this.config.description = description;
    return this;
  }

  /**
   * 入力スキーマを設定
   */
  withInputSchema(schema: z.ZodSchema): this {
    this.config.inputSchema = schema;
    return this;
  }

  /**
   * 出力スキーマを設定
   */
  withOutputSchema(schema: z.ZodSchema): this {
    this.config.outputSchema = schema;
    return this;
  }

  /**
   * リトライ設定を追加
   */
  withRetry(maxRetries: number, delay: number): this {
    this.config.retryConfig = { maxRetries, delay };
    return this;
  }

  /**
   * 構築
   */
  build(): IWorkflowExecutor {
    this.validate();
    return new ${name}Executor(this.config as ${name}Config);
  }

  /**
   * 必須フィールドの検証
   */
  private validate(): void {
    if (!this.config.type) {
      throw new Error('type is required');
    }
    if (!this.config.displayName) {
      throw new Error('displayName is required');
    }
    if (!this.config.description) {
      throw new Error('description is required');
    }
  }
}

/**
 * Builder Director（オプション）
 */
export class ${name}Director {
  constructor(private builder: ${name}Builder) {}

  /**
   * シンプルなExecutorを構築
   */
  buildSimple(type: string, name: string): IWorkflowExecutor {
    return this.builder
      .withType(type)
      .withDisplayName(name)
      .withDescription(\`\${name}を実行します\`)
      .build();
  }

  /**
   * リトライ付きExecutorを構築
   */
  buildWithRetry(type: string, name: string, maxRetries: number = 3): IWorkflowExecutor {
    return this.builder
      .withType(type)
      .withDisplayName(name)
      .withDescription(\`\${name}を実行します（リトライ付き）\`)
      .withRetry(maxRetries, 1000)
      .build();
  }
}

/**
 * 生成されるExecutor
 */
class ${name}Executor implements IWorkflowExecutor {
  readonly type: string;
  readonly displayName: string;
  readonly description: string;

  constructor(private config: ${name}Config) {
    this.type = config.type;
    this.displayName = config.displayName;
    this.description = config.description;
  }

  async execute<TInput, TOutput>(
    input: TInput,
    context: ExecutionContext
  ): Promise<TOutput> {
    // 実装
    throw new Error('Not implemented');
  }
}
`,

  'registry': (name) => `/**
 * ${name}Registry - Registry Factoryパターン
 */

import { IWorkflowExecutor } from '@/shared/core/interfaces';

/**
 * Executor Factory インターフェース
 */
export interface ${name}ExecutorFactory {
  create(config?: unknown): IWorkflowExecutor;
  getDisplayName(): string;
  getDescription(): string;
}

/**
 * ${name}Registry
 */
export class ${name}Registry {
  private factories: Map<string, ${name}ExecutorFactory> = new Map();

  /**
   * ファクトリを登録
   */
  register(type: string, factory: ${name}ExecutorFactory): void {
    if (this.factories.has(type)) {
      console.warn(\`Overwriting executor for type: \${type}\`);
    }
    this.factories.set(type, factory);
    console.log(\`Registered executor: \${type}\`);
  }

  /**
   * Executorを生成
   */
  create(type: string, config?: unknown): IWorkflowExecutor {
    const factory = this.factories.get(type);
    if (!factory) {
      throw new Unknown${name}TypeError(type, this.listTypes());
    }
    return factory.create(config);
  }

  /**
   * 型が登録されているか確認
   */
  has(type: string): boolean {
    return this.factories.has(type);
  }

  /**
   * 登録されている型の一覧
   */
  listTypes(): string[] {
    return Array.from(this.factories.keys());
  }

  /**
   * Executorの情報を取得
   */
  getExecutorInfo(): ${name}ExecutorInfo[] {
    return Array.from(this.factories.entries()).map(([type, factory]) => ({
      type,
      displayName: factory.getDisplayName(),
      description: factory.getDescription(),
    }));
  }

  /**
   * 登録解除
   */
  unregister(type: string): boolean {
    return this.factories.delete(type);
  }

  /**
   * すべてクリア
   */
  clear(): void {
    this.factories.clear();
  }

  /**
   * 登録数
   */
  get size(): number {
    return this.factories.size;
  }
}

/**
 * Executor情報
 */
export interface ${name}ExecutorInfo {
  type: string;
  displayName: string;
  description: string;
}

/**
 * 不明な型エラー
 */
export class Unknown${name}TypeError extends Error {
  constructor(type: string, availableTypes: string[]) {
    const available = availableTypes.length > 0
      ? \`Available types: \${availableTypes.join(', ')}\`
      : 'No types registered';
    super(\`Unknown ${name.toLowerCase()} type: '\${type}'. \${available}\`);
    this.name = 'Unknown${name}TypeError';
  }
}

/**
 * 登録ヘルパー関数
 */
export function register${name}Executors(
  registry: ${name}Registry,
  // dependencies
): void {
  // 登録例:
  // registry.register('TYPE_A', new TypeAFactory(deps));
  // registry.register('TYPE_B', new TypeBFactory(deps));
}

/**
 * デフォルトのレジストリを作成
 */
export function createDefault${name}Registry(
  // dependencies
): ${name}Registry {
  const registry = new ${name}Registry();
  register${name}Executors(registry);
  return registry;
}
`,
};

// ===== メイン処理 =====

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('使用方法: node generate-factory.mjs <pattern> <name>');
    console.log('');
    console.log('パターン:');
    console.log('  factory-method    Factory Methodパターン');
    console.log('  abstract-factory  Abstract Factoryパターン');
    console.log('  builder           Builderパターン');
    console.log('  registry          Registry Factoryパターン');
    console.log('');
    console.log('例:');
    console.log('  node generate-factory.mjs factory-method Workflow');
    console.log('  node generate-factory.mjs builder Executor');
    console.log('  node generate-factory.mjs registry Workflow');
    process.exit(0);
  }

  const pattern = args[0];
  const name = args[1];

  const template = templates[pattern];
  if (!template) {
    console.error(`❌ 不明なパターン: ${pattern}`);
    console.log('利用可能なパターン: factory-method, abstract-factory, builder, registry');
    process.exit(1);
  }

  // パスカルケースに変換
  const pascalName = name.charAt(0).toUpperCase() + name.slice(1);

  const code = template(pascalName);

  console.log('// ============================================');
  console.log(`// Generated: ${pattern} for ${pascalName}`);
  console.log('// ============================================');
  console.log('');
  console.log(code);
}

main();
