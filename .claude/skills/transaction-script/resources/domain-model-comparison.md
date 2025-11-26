# トランザクションスクリプト vs ドメインモデル

## 概要

両パターンはビジネスロジック組織化のアプローチです。
適切なパターン選択は、ドメインの複雑さとプロジェクト要件に依存します。

## 比較表

| 観点 | トランザクションスクリプト | ドメインモデル |
|------|--------------------------|---------------|
| 構造 | 手続き型 | オブジェクト指向 |
| ロジック配置 | スクリプト内 | エンティティ内 |
| 適合度 | シンプルなドメイン | 複雑なドメイン |
| 学習コスト | 低い | 高い |
| 初期開発速度 | 速い | 遅い |
| 長期保守性 | 複雑化で困難 | 複雑でも管理可能 |

## パターン選択の判断

### トランザクションスクリプトを選ぶ

```
判断基準:
├─ ビジネスルールがシンプル（5つ以下）
├─ CRUD操作が中心
├─ エンティティ間の関係が単純
├─ 同じルールの再利用が少ない
└─ チームがDDDに不慣れ
```

### ドメインモデルを選ぶ

```
判断基準:
├─ ビジネスルールが複雑（10以上）
├─ 同じルールが複数箇所で必要
├─ エンティティ間の関係が複雑
├─ ドメインエキスパートとの協業が重要
└─ 長期的な進化が予想される
```

## 実装比較

### 例: 注文の割引計算

**トランザクションスクリプト**:

```typescript
async function applyDiscount(orderId: string): Promise<Order> {
  const order = await orderRepository.findById(orderId);
  const user = await userRepository.findById(order.userId);

  // ビジネスルールがスクリプト内に
  let discount = 0;
  if (user.tier === 'gold') {
    discount = order.total * 0.15;
  } else if (user.tier === 'silver') {
    discount = order.total * 0.10;
  }

  if (order.total > 10000) {
    discount += order.total * 0.05;
  }

  order.discount = discount;
  order.finalAmount = order.total - discount;

  return await orderRepository.save(order);
}
```

**ドメインモデル**:

```typescript
// ドメインエンティティ
class Order {
  applyDiscount(user: User): void {
    const tierDiscount = user.getTierDiscount();
    const volumeDiscount = this.getVolumeDiscount();

    this.discount = this.total * (tierDiscount + volumeDiscount);
    this.finalAmount = this.total - this.discount;
  }

  private getVolumeDiscount(): number {
    return this.total > 10000 ? 0.05 : 0;
  }
}

class User {
  getTierDiscount(): number {
    const discountMap = { gold: 0.15, silver: 0.10, bronze: 0.05 };
    return discountMap[this.tier] ?? 0;
  }
}

// アプリケーションサービス
async function applyDiscount(orderId: string): Promise<Order> {
  const order = await orderRepository.findById(orderId);
  const user = await userRepository.findById(order.userId);

  order.applyDiscount(user);

  return await orderRepository.save(order);
}
```

## 移行パターン

### トランザクションスクリプト → ドメインモデル

複雑さが増した場合の段階的移行：

```
1. 重複ロジックを特定
   ↓
2. 共通関数に抽出
   ↓
3. 関連する関数をクラスにグループ化
   ↓
4. データとロジックを結合（エンティティ化）
   ↓
5. リッチドメインモデルへ進化
```

### 注意点

- 一度にすべてを移行しない
- 最も複雑な部分から開始
- テストを維持しながら進行
- 段階的なリファクタリング

## ハイブリッドアプローチ

実際のプロジェクトでは、両パターンの併用も有効：

- **シンプルなCRUD**: トランザクションスクリプト
- **複雑なビジネスロジック**: ドメインモデル
- **レポート/集計**: トランザクションスクリプト

## チェックリスト

### パターン選択時

- [ ] ドメインの複雑さを評価したか？
- [ ] ビジネスルールの数を数えたか？
- [ ] ルールの再利用頻度を確認したか？
- [ ] チームのスキルセットを考慮したか？
- [ ] プロジェクトの寿命を考慮したか？

### 移行検討時

- [ ] 重複ロジックが3箇所以上あるか？
- [ ] 変更時に複数箇所を修正しているか？
- [ ] ビジネスルールの理解が困難になっているか？
