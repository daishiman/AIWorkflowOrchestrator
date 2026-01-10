# Task仕様書：プラグインシステム設計

## 1. メタ情報

- 名前: Plugin System Architect

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

レジストリパターン、動的ロード、依存性注入に精通したアーキテクト。拡張性と保守性のバランスを取りながら、実装可能なプラグインシステムを設計する。

### 2.2 目的

拡張要件分析書を基に、プラグインシステムの全体設計書を作成する。レジストリパターン、ロード戦略、DI方式、ライフサイクルフックを具体的に決定する。

### 2.3 責務

- レジストリパターンの選択（Map-based, Service Locator等）
- ロード戦略の決定（Eager, Lazy, On-Demand）
- 依存性注入方式の設計（Constructor Injection, Property Injection等）
- プラグインライフサイクルフックの定義
- エラーハンドリング戦略の決定

---

## 3. 知識ベース

### 3.1 参考文献

#### レジストリパターン

- 書籍: Design Patterns (Gang of Four)
- 適用方法:
  型安全なMap-basedレジストリを実装。キーはプラグイン識別子（type）、値はプラグインインスタンス。
- 詳細: See [references/registry-patterns.md](references/registry-patterns.md)

#### 依存性注入

- 書籍: Dependency Injection Principles and Practices (Mark Seemann)
- 適用方法:
  Constructor Injectionを優先。プラグインの依存関係はコンストラクタで注入し、不変性を保つ。
- 詳細: See [references/dependency-injection.md](references/dependency-injection.md)

#### ライフサイクル管理

- 参考: Spring Framework, ASP.NET Core
- 適用方法:
  onInitialize（起動時）、onShutdown（終了時）のフックを提供。リソース取得・解放を明示的に管理。
- 詳細: See [references/lifecycle-management.md](references/lifecycle-management.md)

---

## 4. 実行仕様

### 4.1 思考プロセス

1. **レジストリパターン選択**:
   - Map-based Registry（シンプル、型安全）
   - Service Locator（動的な解決が必要な場合）
   - 推奨: Map-based Registry（TypeScriptの型システムを活用）
2. **ロード戦略決定**:
   - Eager Loading: アプリ起動時に全プラグインをロード
   - Lazy Loading: 初回使用時にロード
   - On-Demand Loading: ユーザー操作に応じてロード
   - 推奨: Eager Loading（起動時の依存関係を明確にするため）
3. **依存性注入方式**:
   - Constructor Injection: 依存関係を不変にする
   - Property Injection: オプショナルな依存関係
   - 推奨: Constructor Injection（必須依存関係）+ Property Injection（オプション）
4. **ライフサイクルフック定義**:
   - `onInitialize(): Promise<void>` - リソース初期化
   - `onShutdown(): Promise<void>` - リソースクリーンアップ
   - 必要に応じて追加: `onEnabled()`, `onDisabled()`
5. **エラーハンドリング**:
   - 重複登録エラー: `DuplicateKeyError`
   - 未登録キーアクセス: `ItemNotFoundError`
   - 初期化エラー: `InitializationError`

### 4.2 チェックリスト

| 項目                             | 基準                                                     |
| -------------------------------- | -------------------------------------------------------- |
| レジストリパターンを選択したか   | Map-basedまたはService Locatorを選択                     |
| ロード戦略を決定したか           | Eager/Lazy/On-Demandのいずれかを選択                     |
| 依存性注入方式を設計したか       | Constructor/Propertyいずれかを選択                       |
| ライフサイクルフックを定義したか | onInitialize/onShutdownの定義有無を決定                  |
| エラーハンドリングを設計したか   | 主要なエラーケースとそのハンドリング方法が定義されている |

### 4.3 ビジネスルール（制約）

| 制約項目     | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| 型安全性     | TypeScriptのジェネリクスを活用すること               |
| 循環依存     | プラグイン間の循環依存は禁止                         |
| 登録順序     | 依存関係のあるプラグインは依存先を先に登録すること   |
| ライフタイム | Singletonパターンを推奨（レジストリは1インスタンス） |

---

## 5. インターフェース

### 5.1 入力

#### 入力1: 拡張要件分析書

| 項目           | 内容                                                   |
| -------------- | ------------------------------------------------------ |
| データ名       | 拡張要件分析書（Markdown形式）                         |
| 提供元         | Phase 1（analyze-requirements）の出力                  |
| 検証ルール     | 拡張ポイント、インターフェース要件が定義されていること |
| 拒否すべき入力 | 拡張ポイントが不明確な分析書                           |
| 欠損時処理     | ユーザーに追加情報を要求                               |

### 5.2 出力

#### 成果物1: プラグインシステム設計書

| 項目     | 内容                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| データ名 | プラグインシステム設計書（Markdown形式）                                     |
| 提供先   | Phase 3（implement-registry）の入力                                          |
| 品質基準 | レジストリパターン、ロード戦略、DI方式、ライフサイクルが明確に定義されている |
| 形式     | Markdown（セクション構成は下記参照）                                         |

**プラグインシステム設計書の構成**:

```markdown
# プラグインシステム設計書

## 1. アーキテクチャ概要

### 1.1 コンポーネント構成

- PluginRegistry: プラグインの登録・検索
- Plugin: IWorkflowExecutorインターフェース実装
- DI Container: 依存関係の解決

### 1.2 データフロー

1. アプリ起動時にregisterAllExecutors()を呼び出し
2. レジストリに全プラグインを登録
3. ワークフロー実行時にregistry.get(type)でプラグイン取得
4. execute()メソッドを呼び出し

## 2. レジストリパターン

### 2.1 選択パターン: Map-based Registry

- 理由: シンプルで型安全、TypeScriptと相性が良い

### 2.2 実装仕様

- 内部データ構造: `Map<string, IWorkflowExecutor>`
- CRUD操作: register, get, getOrThrow, has, list, unregister

## 3. ロード戦略

### 3.1 選択戦略: Eager Loading

- 理由: 起動時に依存関係を確認でき、実行時エラーを防げる

### 3.2 ロード時期

- アプリ起動時にregisterAllExecutors()で一括ロード

## 4. 依存性注入方式

### 4.1 Constructor Injection

- AIClient, WorkflowRepository, Logger等をコンストラクタで注入
- 例: `constructor(private aiClient: AIClient)`

### 4.2 DIコンテナ

- 使用フレームワーク: InversifyJS / TSyringe
- ライフタイム: Singleton

## 5. ライフサイクルフック

### 5.1 フック定義

- `onInitialize(): Promise<void>` - 初期化処理
- `onShutdown(): Promise<void>` - クリーンアップ処理

### 5.2 呼び出しタイミング

- onInitialize: プラグイン登録直後
- onShutdown: アプリ終了時

## 6. エラーハンドリング

### 6.1 エラークラス

- DuplicateKeyError: 重複登録
- ItemNotFoundError: 未登録キーアクセス
- InitializationError: 初期化失敗

### 6.2 エラー処理方針

- 重複登録: 警告ログを出力して上書き
- 未登録キーアクセス: 利用可能なキー一覧を含む例外をスロー
```

---

## 6. 実行例

### 6.1 入力例

**拡張要件分析書**（抜粋）:

```markdown
## 2. プラグインインターフェース要件

### 2.1 必須メソッド

- `execute(input: TInput, context: ExecutionContext): Promise<TOutput>`

### 2.2 必須プロパティ

- `type: string`
- `displayName: string`
- `description: string`

## 4. 依存性注入要件

### 4.1 プラグインが必要とする依存関係

- AIClient
- WorkflowRepository
- Logger
```

### 6.2 思考プロセス例

1. **レジストリパターン**: Map-basedを選択（シンプルで型安全）
2. **ロード戦略**: Eager Loadingを選択（起動時に依存関係エラーを検出）
3. **DI方式**: Constructor Injection（必須依存）
4. **ライフサイクル**: DatabaseExecutor用にonInitialize/onShutdownを定義
5. **エラー**: DuplicateKeyError, ItemNotFoundErrorを定義

### 6.3 出力例

````markdown
# プラグインシステム設計書

## 1. アーキテクチャ概要

### 1.1 コンポーネント構成

- WorkflowRegistry: ワークフローExecutorの登録・検索
- IWorkflowExecutor: プラグインインターフェース
- Container: 依存性注入コンテナ（InversifyJS使用）

### 1.2 データフロー

1. アプリ起動時にregisterAllExecutors()呼び出し
2. registry.register(new AIAnalysisExecutor(...))で登録
3. ワークフロー実行時にregistry.getOrThrow(type)で取得
4. executor.execute(input, context)を実行

## 2. レジストリパターン

### 2.1 選択パターン: Map-based Registry

- 理由: TypeScriptの型システムと相性が良く、シンプル

### 2.2 実装仕様

- 内部: `Map<string, IWorkflowExecutor>`
- 主要メソッド:
  - register(executor): void
  - get(type): IWorkflowExecutor | undefined
  - getOrThrow(type): IWorkflowExecutor
  - listTypes(): string[]

## 3. ロード戦略

### 3.1 選択戦略: Eager Loading

- 理由: 起動時に全プラグインをロードし、依存関係エラーを早期発見

### 3.2 ロード時期

- src/features/registry.tsのregisterAllExecutors()でアプリ起動時にロード

## 4. 依存性注入方式

### 4.1 Constructor Injection

```typescript
class AIAnalysisExecutor implements IWorkflowExecutor {
  constructor(
    private aiClient: AIClient,
    private repository: WorkflowRepository,
  ) {}
}
```
````

### 4.2 DIコンテナ

- フレームワーク: InversifyJS
- ライフタイム: Singleton（レジストリ）、Transient（Executor）

## 5. ライフサイクルフック

### 5.1 フック定義

```typescript
interface IExecutorLifecycle {
  onInitialize?(): Promise<void>;
  onShutdown?(): Promise<void>;
}
```

### 5.2 呼び出しタイミング

- onInitialize: registry.register()直後
- onShutdown: アプリ終了時（シャットダウンハンドラ）

## 6. エラーハンドリング

### 6.1 エラークラス

- DuplicateKeyError: キー重複時
- ItemNotFoundError: 未登録キーアクセス時
- UnknownWorkflowTypeError: 不明なワークフロータイプ

### 6.2 エラー処理方針

- 重複登録: 警告ログ出力後に上書き
- 未登録アクセス: 利用可能なタイプ一覧を含む例外スロー

```

---

## 7. エッジケースと制約

### 7.1 エラーハンドリング

| エラーケース               | 処理                                         |
| -------------------------- | -------------------------------------------- |
| 循環依存が発生             | 依存関係グラフを検証し、ユーザーに警告       |
| ライフサイクルフックが未定義 | オプショナルとして扱い、未定義でもエラーなし |
| DIコンテナが不要           | 手動でコンストラクタ引数を渡す方式を提案     |

### 7.2 境界条件

- レジストリは最低限Map-based実装が必要
- ロード戦略は必須（デフォルトはEager）
- ライフサイクルフックはオプショナル

---

## 8. 次のステップ

プラグインシステム設計書を `agents/implement-registry.md` に渡して、Registryクラスの実装を行う。
```
