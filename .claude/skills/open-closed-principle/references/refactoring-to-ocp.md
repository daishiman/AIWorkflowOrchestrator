# OCPへのリファクタリング（Refactoring to OCP）

## 概要

OCP違反のコードを、開放閉鎖原則に準拠したコードにリファクタリングする方法を説明する。
段階的なアプローチで、安全にリファクタリングを進める。

## リファクタリングの原則

1. **小さなステップ**: 一度に大きな変更をしない
2. **テストファースト**: リファクタリング前にテストを書く
3. **継続的な検証**: 各ステップ後にテストを実行
4. **後方互換性**: 既存の機能を壊さない

## パターン1: switch文の排除

### Before（OCP違反）

```
# switch文による分岐
WorkflowEngine:
  execute(workflow: Workflow): Promise<Result>:
    switch (workflow.type):
      case 'AI_ANALYSIS':
        return this.executeAIAnalysis(workflow)
      case 'DATA_TRANSFORM':
        return this.executeDataTransform(workflow)
      case 'NOTIFICATION':
        return this.executeNotification(workflow)
      default:
        throw new UnknownTypeError(workflow.type)

  private executeAIAnalysis(workflow): Promise<Result>:
    # AI分析ロジック

  private executeDataTransform(workflow): Promise<Result>:
    # データ変換ロジック

  private executeNotification(workflow): Promise<Result>:
    # 通知ロジック
```

### Step 1: インターフェースの抽出

```
# 共通インターフェースを定義
interface IWorkflowExecutor:
  readonly type: string
  execute(workflow: Workflow): Promise<Result>
```

### Step 2: 具体クラスの作成

```
# 各ケースを独立したクラスに
AIAnalysisExecutor implements IWorkflowExecutor:
  readonly type = 'AI_ANALYSIS'

  execute(workflow): Promise<Result>:
    # 元のexecuteAIAnalysisのロジック

DataTransformExecutor implements IWorkflowExecutor:
  readonly type = 'DATA_TRANSFORM'

  execute(workflow): Promise<Result>:
    # 元のexecuteDataTransformのロジック

NotificationExecutor implements IWorkflowExecutor:
  readonly type = 'NOTIFICATION'

  execute(workflow): Promise<Result>:
    # 元のexecuteNotificationのロジック
```

### Step 3: レジストリの導入

```
# レジストリを作成
ExecutorRegistry:
  private executors: Map<string, IWorkflowExecutor> = new Map()

  register(executor: IWorkflowExecutor):
    this.executors.set(executor.type, executor)

  get(type: string): IWorkflowExecutor:
    executor = this.executors.get(type)
    if (!executor):
      throw new UnknownTypeError(type)
    return executor
```

### After（OCP準拠）

```
# リファクタリング後のWorkflowEngine
WorkflowEngine:
  constructor(private registry: ExecutorRegistry):
    pass

  execute(workflow: Workflow): Promise<Result>:
    executor = this.registry.get(workflow.type)
    return executor.execute(workflow)

# 登録
registry = new ExecutorRegistry()
registry.register(new AIAnalysisExecutor())
registry.register(new DataTransformExecutor())
registry.register(new NotificationExecutor())

# 新しいタイプの追加（既存コード修正なし）
registry.register(new ScheduledTaskExecutor())
```

## パターン2: 条件分岐の排除

### Before（OCP違反）

```
# 条件分岐による価格計算
PriceCalculator:
  calculate(product: Product): number:
    price = product.basePrice

    # 割引計算
    if (product.category === 'BOOK'):
      price = price * 0.9  # 10%割引
    else if (product.category === 'ELECTRONICS'):
      price = price * 0.95  # 5%割引
    else if (product.category === 'FOOD'):
      # 割引なし
      pass

    # 税金計算
    if (product.category === 'ELECTRONICS'):
      price = price * 1.1  # 10%税
    else if (product.category === 'FOOD'):
      price = price * 1.08  # 8%税
    else:
      price = price * 1.1  # デフォルト10%税

    return price
```

### Step 1: 価格ポリシーの抽出

```
# 価格ポリシーインターフェース
interface IPricingPolicy:
  readonly category: string
  applyDiscount(price: number): number
  applyTax(price: number): number
```

### Step 2: 具体的なポリシーの作成

```
BookPricingPolicy implements IPricingPolicy:
  readonly category = 'BOOK'

  applyDiscount(price):
    return price * 0.9

  applyTax(price):
    return price * 1.1

ElectronicsPricingPolicy implements IPricingPolicy:
  readonly category = 'ELECTRONICS'

  applyDiscount(price):
    return price * 0.95

  applyTax(price):
    return price * 1.1

FoodPricingPolicy implements IPricingPolicy:
  readonly category = 'FOOD'

  applyDiscount(price):
    return price  # 割引なし

  applyTax(price):
    return price * 1.08
```

### After（OCP準拠）

```
# リファクタリング後のPriceCalculator
PriceCalculator:
  private policies: Map<string, IPricingPolicy> = new Map()

  registerPolicy(policy: IPricingPolicy):
    this.policies.set(policy.category, policy)

  calculate(product: Product): number:
    policy = this.policies.get(product.category)
    if (!policy):
      policy = this.defaultPolicy

    price = product.basePrice
    price = policy.applyDiscount(price)
    price = policy.applyTax(price)
    return price

# 新しいカテゴリの追加（既存コード修正なし）
calculator.registerPolicy(new ClothingPricingPolicy())
```

## パターン3: 型チェックの排除

### Before（OCP違反）

```
# instanceofによる分岐
ShapeRenderer:
  render(shape: Shape):
    if (shape instanceof Circle):
      this.renderCircle(shape)
    else if (shape instanceof Rectangle):
      this.renderRectangle(shape)
    else if (shape instanceof Triangle):
      this.renderTriangle(shape)
    else:
      throw new UnknownShapeError(shape)

  private renderCircle(circle: Circle):
    # 円の描画

  private renderRectangle(rect: Rectangle):
    # 矩形の描画

  private renderTriangle(tri: Triangle):
    # 三角形の描画
```

### Step 1: 描画メソッドをShapeに移動

```
# 各Shapeが自身の描画方法を知る
interface IShape:
  render(renderer: IRenderer): void

interface IRenderer:
  drawCircle(x: number, y: number, radius: number): void
  drawRectangle(x: number, y: number, width: number, height: number): void
  drawLine(x1: number, y1: number, x2: number, y2: number): void
```

### After（OCP準拠）

```
# 各Shapeが自身の描画を実装
Circle implements IShape:
  render(renderer):
    renderer.drawCircle(this.x, this.y, this.radius)

Rectangle implements IShape:
  render(renderer):
    renderer.drawRectangle(this.x, this.y, this.width, this.height)

Triangle implements IShape:
  render(renderer):
    renderer.drawLine(this.p1.x, this.p1.y, this.p2.x, this.p2.y)
    renderer.drawLine(this.p2.x, this.p2.y, this.p3.x, this.p3.y)
    renderer.drawLine(this.p3.x, this.p3.y, this.p1.x, this.p1.y)

# ShapeRenderer（OCPに準拠：修正不要）
ShapeRenderer implements IRenderer:
  render(shape: IShape):
    shape.render(this)

  drawCircle(x, y, radius):
    # 円の描画実装

  drawRectangle(x, y, width, height):
    # 矩形の描画実装

  drawLine(x1, y1, x2, y2):
    # 線の描画実装

# 新しい図形の追加（既存コード修正なし）
Polygon implements IShape:
  render(renderer):
    for (i = 0; i < this.points.length - 1; i++):
      renderer.drawLine(
        this.points[i].x, this.points[i].y,
        this.points[i+1].x, this.points[i+1].y
      )
```

## リファクタリングチェックリスト

### 準備

- [ ] 既存のテストがあるか？なければ作成する
- [ ] リファクタリングの範囲を明確にする
- [ ] 後方互換性の要件を確認する

### 実行

- [ ] インターフェースを抽出したか？
- [ ] 具体クラスを作成したか？
- [ ] レジストリ/ファクトリを導入したか？
- [ ] 各ステップ後にテストを実行したか？

### 検証

- [ ] switch/if-elseチェーンは排除されたか？
- [ ] 型チェック（instanceof）は排除されたか？
- [ ] 新しいタイプの追加で既存コードの修正が不要か？
- [ ] 全てのテストがパスするか？

## よくある落とし穴

### 1. 早すぎるリファクタリング

```
# 悪い例: 1つしか実装がないのにリファクタリング
# 2つ目の要件が来るまで待つ

# 良い例: "Rule of Three"
# 3回同じパターンが出たらリファクタリング
```

### 2. 過度な抽象化

```
# 悪い例: すべてを抽象化
interface IPrinter { print(): void }
interface IScanner { scan(): void }
interface ICopier extends IPrinter, IScanner {}
interface IFaxer { fax(): void }
interface IMultiFunctionDevice extends ICopier, IFaxer {}

# 良い例: 実際の要件に基づいた抽象化
interface IDocumentProcessor:
  process(document: Document): void
```

### 3. 不完全なリファクタリング

```
# 悪い例: 一部だけリファクタリング
#   - Executorは分離したが
#   - switch文が別の場所に残っている

# 良い例: 関連するすべての箇所を更新
#   - Executor分離
#   - Registry導入
#   - 既存のswitch文をRegistry使用に更新
```

## 関連ドキュメント

- `ocp-fundamentals.md`: OCP原則の基本
- `extension-mechanisms.md`: 拡張メカニズム
- `ocp-patterns.md`: OCP準拠パターン
