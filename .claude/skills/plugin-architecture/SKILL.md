---
name: plugin-architecture
description: |
  動的な機能拡張を可能にするプラグインアーキテクチャの設計を専門とするスキル。
  レジストリパターン、動的ロード、依存性注入を活用し、
  機能追加時の既存コード修正を不要にする拡張性の高いシステム設計を提供します。

  専門分野:
  - Registry Pattern: プラグインの登録と管理、型安全なマッピング
  - Dynamic Loading: 動的なプラグイン読み込みと初期化
  - Dependency Injection: プラグイン間の疎結合な依存関係解決
  - Plugin Lifecycle: プラグインの初期化、実行、破棄の管理
  - Service Locator: サービスの動的検索と取得

  使用タイミング:
  - ワークフローエンジンのプラグインシステムを構築する時
  - 機能の動的追加・削除が必要な時
  - 疎結合なモジュール設計が必要な時
  - 拡張ポイントを提供するフレームワークを設計する時

  Use proactively when designing plugin systems, workflow registries,
  or any architecture requiring dynamic feature extension.
version: 1.0.0
---

# Plugin Architecture

## 概要

このスキルは、動的な機能拡張を可能にするプラグインアーキテクチャの設計と実装に関する知識を提供します。

プラグインアーキテクチャは、コアシステムと拡張機能を分離し、
機能追加時に既存コードの修正を不要にする設計パターンです。

**主要な価値**:
- 機能追加時の既存コード変更不要（OCP準拠）
- プラグインの独立した開発・テスト
- 動的な機能の有効化・無効化
- システムの柔軟性と拡張性の向上

**対象ユーザー**:
- ワークフローエンジンを設計するエージェント
- 拡張可能なフレームワークを構築する開発者
- プラグインシステムを実装するチーム

## リソース構造

```
plugin-architecture/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── registry-pattern.md                     # レジストリパターン詳細
│   ├── dynamic-loading.md                      # 動的ロード詳細
│   ├── dependency-injection.md                 # 依存性注入詳細
│   ├── plugin-lifecycle.md                     # プラグインライフサイクル詳細
│   └── service-locator.md                      # サービスロケーター詳細
├── scripts/
│   └── validate-plugin-structure.mjs           # プラグイン構造検証スクリプト
└── templates/
    ├── registry-implementation.md              # レジストリ実装テンプレート
    └── plugin-implementation.md                # プラグイン実装テンプレート
```

## コマンドリファレンス

このスキルで使用可能なリソース、スクリプト、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# レジストリパターン詳細
cat .claude/skills/plugin-architecture/resources/registry-pattern.md

# 動的ロード詳細
cat .claude/skills/plugin-architecture/resources/dynamic-loading.md

# 依存性注入詳細
cat .claude/skills/plugin-architecture/resources/dependency-injection.md

# プラグインライフサイクル詳細
cat .claude/skills/plugin-architecture/resources/plugin-lifecycle.md

# サービスロケーター詳細
cat .claude/skills/plugin-architecture/resources/service-locator.md
```

### スクリプト実行

```bash
# プラグイン構造検証
node .claude/skills/plugin-architecture/scripts/validate-plugin-structure.mjs <directory>
```

### テンプレート参照

```bash
# レジストリ実装テンプレート
cat .claude/skills/plugin-architecture/templates/registry-implementation.md

# プラグイン実装テンプレート
cat .claude/skills/plugin-architecture/templates/plugin-implementation.md
```

---

## 核心知識

### 1. Registry Pattern（レジストリパターン）

**目的**: プラグインの登録と取得を一元管理する

**構成要素**:
- **Registry**: プラグインのマッピングを管理
- **Plugin Interface**: プラグインが実装すべき契約
- **Plugin Implementation**: 具体的なプラグイン実装

**基本構造**:

```
Registry:
  - plugins: Map<string, Plugin>

  + register(key: string, plugin: Plugin): void
  + get(key: string): Plugin | undefined
  + has(key: string): boolean
  + list(): string[]
  + unregister(key: string): boolean
```

**型安全なレジストリ**:

```
TypeSafeRegistry<TKey extends string, TPlugin>:
  - plugins: Map<TKey, TPlugin>

  + register(key: TKey, plugin: TPlugin): void
  + get(key: TKey): TPlugin | undefined
```

**ワークフローエンジンへの適用**:

```
WorkflowRegistry:
  - executors: Map<string, IWorkflowExecutor>

  + register(executor: IWorkflowExecutor): void
    executors.set(executor.type, executor)

  + get(type: string): IWorkflowExecutor | undefined
    return executors.get(type)

  + listTypes(): string[]
    return Array.from(executors.keys())
```

詳細: `resources/registry-pattern.md`

---

### 2. Dynamic Loading（動的ロード）

**目的**: プラグインを実行時に動的に読み込む

**ロード方式**:

| 方式 | 特徴 | 用途 |
|------|------|------|
| Eager Loading | 起動時に全て読み込み | 必須プラグイン |
| Lazy Loading | 必要時に読み込み | オプションプラグイン |
| On-Demand | 明示的な要求時 | 大規模プラグイン |

**自動登録パターン**:

```
# ディレクトリスキャン方式
loadPlugins(directory):
  files = scanDirectory(directory, '*.ts')
  for file in files:
    module = await import(file)
    if module.default implements IWorkflowExecutor:
      registry.register(module.default)
```

**手動登録パターン**:

```
# 明示的登録方式
registerAllPlugins():
  registry.register(new AuthenticationExecutor())
  registry.register(new NotificationExecutor())
  registry.register(new AnalyticsExecutor())
```

詳細: `resources/dynamic-loading.md`

---

### 3. Dependency Injection（依存性注入）

**目的**: プラグイン間の依存関係を疎結合に管理する

**注入パターン**:

| パターン | 説明 | 推奨度 |
|---------|------|--------|
| Constructor Injection | コンストラクタで注入 | ✅ 推奨 |
| Setter Injection | setterで注入 | 中程度 |
| Interface Injection | インターフェース経由 | 低 |

**DIコンテナの概念**:

```
Container:
  - services: Map<ServiceToken, ServiceFactory>

  + register<T>(token: Token<T>, factory: () => T): void
  + resolve<T>(token: Token<T>): T
  + createScope(): Container
```

**ワークフローエンジンへの適用**:

```
# Executorへの依存注入
ExecutorFactory:
  constructor(
    aiClient: AIClient,
    repositories: RepositoryContainer,
    logger: Logger
  )

  create(type: string): IWorkflowExecutor
    ExecutorClass = registry.get(type)
    return new ExecutorClass(
      this.aiClient,
      this.repositories,
      this.logger
    )
```

詳細: `resources/dependency-injection.md`

---

### 4. Plugin Lifecycle（プラグインライフサイクル）

**目的**: プラグインの状態遷移を管理する

**ライフサイクルフェーズ**:

```
UNLOADED → LOADED → INITIALIZED → ACTIVE → STOPPED → UNLOADED
```

**ライフサイクルフック**:

```
IPluginLifecycle:
  + onLoad(): Promise<void>        # 読み込み時
  + onInitialize(): Promise<void>  # 初期化時
  + onActivate(): Promise<void>    # 有効化時
  + onDeactivate(): Promise<void>  # 無効化時
  + onUnload(): Promise<void>      # アンロード時
```

**ライフサイクルマネージャー**:

```
PluginLifecycleManager:
  + load(plugin: IPlugin): Promise<void>
  + initialize(plugin: IPlugin): Promise<void>
  + activate(plugin: IPlugin): Promise<void>
  + deactivate(plugin: IPlugin): Promise<void>
  + unload(plugin: IPlugin): Promise<void>
```

詳細: `resources/plugin-lifecycle.md`

---

### 5. Service Locator（サービスロケーター）

**目的**: サービスの動的な検索と取得を提供する

**注意**: Service Locatorはアンチパターンとされることもある。
DIコンテナを優先し、必要な場合のみ使用する。

**基本構造**:

```
ServiceLocator:
  - services: Map<ServiceToken, Service>

  + register<T>(token: Token<T>, service: T): void
  + locate<T>(token: Token<T>): T
  + isRegistered(token: Token): boolean
```

**使用場面**:
- レガシーコードとの統合
- フレームワーク内部での使用
- 動的なサービス解決が必要な場合

詳細: `resources/service-locator.md`

---

## 実装ワークフロー

### Phase 1: プラグインインターフェース設計

1. プラグインの共通契約を定義
2. 必須メソッドとオプショナルメソッドを決定
3. 型パラメータの設計

**判断基準**:
- [ ] インターフェースは最小限か？
- [ ] 型安全性が確保されているか？
- [ ] 拡張性が考慮されているか？

### Phase 2: レジストリ実装

1. データ構造の選択（Map推奨）
2. 基本操作（register, get, has, list）の実装
3. エラーハンドリングの設計

**判断基準**:
- [ ] 型安全なマッピングが実装されているか？
- [ ] 重複登録の処理は適切か？
- [ ] 未登録キーへのアクセスは適切にハンドリングされているか？

### Phase 3: 依存性注入の設計

1. 依存関係の特定
2. 注入方式の選択
3. DIコンテナまたはファクトリの実装

**判断基準**:
- [ ] 依存関係は明示的に宣言されているか？
- [ ] 循環依存は検出・防止されているか？
- [ ] テスト時のモック注入は容易か？

### Phase 4: ライフサイクル管理

1. ライフサイクルフェーズの定義
2. フックポイントの設計
3. 状態遷移の実装

**判断基準**:
- [ ] ライフサイクルは明確に定義されているか？
- [ ] リソースのクリーンアップは適切か？
- [ ] エラー時の状態復旧は考慮されているか？

### Phase 5: 検証とテスト

1. プラグイン登録テスト
2. 動的ロードテスト
3. ライフサイクルテスト

**判断基準**:
- [ ] 全操作が正しく動作するか？
- [ ] エッジケースは処理されているか？
- [ ] パフォーマンスは許容範囲内か？

---

## 設計原則

### 1. 疎結合の原則

プラグインはコアシステムと疎結合に設計する。

**達成方法**:
- インターフェースへの依存
- 依存性注入
- イベント駆動通信

### 2. 単一責任の原則

各プラグインは単一の機能に特化する。

**達成方法**:
- 明確な責務定義
- 適切な粒度
- 機能の分割

### 3. 開放閉鎖の原則

新機能追加時に既存コードを修正しない。

**達成方法**:
- レジストリへの登録のみで新機能動作
- 拡張ポイントの提供
- プラグインの独立性

---

## 関連スキル

- `.claude/skills/design-patterns-behavioral/SKILL.md`: Strategyパターン
- `.claude/skills/open-closed-principle/SKILL.md`: OCP準拠設計
- `.claude/skills/interface-segregation/SKILL.md`: インターフェース設計
- `.claude/skills/factory-patterns/SKILL.md`: Factory実装

---

## 参考文献

- **『Design Patterns: Elements of Reusable Object-Oriented Software』** Erich Gamma著
- **『Dependency Injection Principles, Practices, and Patterns』** Mark Seemann著
- **『Clean Architecture』** Robert C. Martin著

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版リリース - レジストリ、動的ロード、DI、ライフサイクル |
