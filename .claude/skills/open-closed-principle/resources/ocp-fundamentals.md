# OCP原則の基本（Open-Closed Principle Fundamentals）

## 定義

**OCP**: ソフトウェアのエンティティ（クラス、モジュール、関数など）は、拡張に対して開いていて、修正に対して閉じているべきである。

Robert C. Martinによる定義:

> "Software entities should be open for extension, but closed for modification."

## 原則の本質

### 「開いている」とは

- 新しい振る舞いを追加できる
- 新しい機能タイプを追加できる
- 新しい要件に対応できる
- **拡張ポイント**が提供されている

### 「閉じている」とは

- 既存のコードを変更しない
- 既存のテストを壊さない
- 既存の機能に影響を与えない
- **安定したインターフェース**が維持される

## なぜOCPが重要か

| 利点                   | 説明                                               |
| ---------------------- | -------------------------------------------------- |
| **リグレッション防止** | 既存コードを変更しないため、新しいバグが入りにくい |
| **テスト維持**         | 既存のテストがそのまま有効                         |
| **独立した開発**       | チームが並行して新機能を開発可能                   |
| **変更の局所化**       | 変更が新しいコードに限定される                     |
| **保守性向上**         | 既存コードの理解なしに拡張可能                     |

## OCP違反の典型例

### 例1: switch文による分岐

```
# 悪い例: 新しいタイプを追加するたびに修正が必要
calculatePrice(product: Product): number:
  switch (product.type):
    case 'BOOK':
      return product.price * 0.9  # 10%割引
    case 'ELECTRONICS':
      return product.price * 1.1  # 10%税
    case 'FOOD':
      return product.price        # 割引なし
    # 新タイプ追加 → ここを修正
    case 'CLOTHING':
      return product.price * 0.85
```

### 例2: 条件分岐の連鎖

```
# 悪い例: 新しい条件を追加するたびに修正が必要
processWorkflow(workflow: Workflow): Result:
  if (workflow.type === 'AI_ANALYSIS'):
    return this.processAI(workflow)
  else if (workflow.type === 'DATA_TRANSFORM'):
    return this.processData(workflow)
  else if (workflow.type === 'NOTIFICATION'):  # 追加
    return this.processNotification(workflow)
  else:
    throw new UnknownTypeError(workflow.type)
```

### 例3: 型チェックによる分岐

```
# 悪い例: instanceofによる分岐
render(shape: Shape):
  if (shape instanceof Circle):
    this.renderCircle(shape)
  else if (shape instanceof Rectangle):
    this.renderRectangle(shape)
  else if (shape instanceof Triangle):  # 追加
    this.renderTriangle(shape)
```

## OCP準拠の解決策

### 解決策1: ポリモーフィズム

```
# 良い例: 各タイプが自身の価格計算を実装
interface IPriceable:
  calculatePrice(): number

Book implements IPriceable:
  calculatePrice(): number:
    return this.basePrice * 0.9

Electronics implements IPriceable:
  calculatePrice(): number:
    return this.basePrice * 1.1

Food implements IPriceable:
  calculatePrice(): number:
    return this.basePrice

# 新タイプ追加（既存コード修正なし）
Clothing implements IPriceable:
  calculatePrice(): number:
    return this.basePrice * 0.85
```

### 解決策2: Strategy パターン

```
# 良い例: 戦略を外部から注入
interface IWorkflowStrategy:
  execute(workflow: Workflow): Result

class WorkflowProcessor:
  private strategies: Map<string, IWorkflowStrategy>

  registerStrategy(type: string, strategy: IWorkflowStrategy):
    this.strategies.set(type, strategy)

  process(workflow: Workflow): Result:
    strategy = this.strategies.get(workflow.type)
    if (!strategy):
      throw new UnknownTypeError(workflow.type)
    return strategy.execute(workflow)

# 新タイプ追加（既存コード修正なし）
processor.registerStrategy('NOTIFICATION', new NotificationStrategy())
```

### 解決策3: Template Method パターン

```
# 良い例: 共通フローを定義し、詳細をサブクラスに委譲
abstract class WorkflowExecutor:
  execute(workflow: Workflow): Result:
    this.validate(workflow)
    result = this.doExecute(workflow)  # サブクラスで実装
    this.postProcess(result)
    return result

  protected abstract doExecute(workflow: Workflow): Result

# 新タイプ追加（既存コード修正なし）
class NotificationExecutor extends WorkflowExecutor:
  protected doExecute(workflow: Workflow): Result:
    # 通知固有の処理
```

## 抽象化のレベル

### レベル1: インターフェースの導入

```
# 最も基本的な抽象化
interface IExecutor:
  execute(): Result

# 実装を追加（既存コード修正なし）
class NewExecutor implements IExecutor:
  execute(): Result { ... }
```

### レベル2: 登録メカニズムの追加

```
# 動的な追加を可能に
Registry:
  register(key: string, impl: IExecutor): void
  get(key: string): IExecutor
```

### レベル3: ファクトリの導入

```
# 生成も抽象化
Factory:
  create(type: string): IExecutor
```

### レベル4: プラグインシステム

```
# 完全な拡張性
PluginSystem:
  loadPlugin(path: string): void
  registerExtensions(): void
```

## 検証チェックリスト

### 設計時

- [ ] 変動する部分と安定する部分を分離したか？
- [ ] 適切な抽象（インターフェース）を定義したか？
- [ ] 拡張ポイントは明確か？

### 実装時

- [ ] 新機能追加で既存ファイルの変更は最小限か？
- [ ] switch/if-elseチェーンを使っていないか？
- [ ] 型チェック（instanceof）を使っていないか？

### レビュー時

- [ ] 新しい要件に対して既存コードの修正なしに対応できるか？
- [ ] 拡張方法は明確にドキュメント化されているか？
- [ ] 過度な抽象化になっていないか？

## 関連原則

| 原則                                | 関係                                                   |
| ----------------------------------- | ------------------------------------------------------ |
| **SRP（単一責任原則）**             | OCPの前提条件。責任が単一なら変更理由も限定される      |
| **LSP（リスコフ置換原則）**         | OCPの基盤。サブタイプが置換可能でないとOCPは機能しない |
| **DIP（依存性逆転原則）**           | OCPの実現手段。抽象に依存することで修正を閉じる        |
| **ISP（インターフェース分離原則）** | OCPを補完。小さなインターフェースは拡張しやすい        |

## 参考文献

- **『アジャイルソフトウェア開発の奥義』** Robert C. Martin著
- **『Clean Architecture』** Robert C. Martin著
- **『Design Patterns』** Erich Gamma他著
