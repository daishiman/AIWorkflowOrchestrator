---
name: bounded-context
description: |
  ドメイン駆動設計における境界付けられたコンテキストの設計と実装を専門とするスキル。
  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/bounded-context/resources/context-identification.md`: コンテキストの特定方法
  - `.claude/skills/bounded-context/resources/context-mapping-patterns.md`: コンテキストマッピングパターン
  - `.claude/skills/bounded-context/resources/integration-strategies.md`: 同期統合（REST/gRPC/GraphQL）と非同期統合（イベント駆動・メッセージキュー）の技術的実装パターンとトレードオフ分析
  - `.claude/skills/bounded-context/templates/context-map-template.md`: コンテキストマップテンプレート
  - `.claude/skills/bounded-context/scripts/analyze-context-boundaries.mjs`: コンテキスト境界分析スクリプト

  専門分野:
  - コンテキスト分析: ドメインの境界を特定する手法
  - コンテキストマップ: コンテキスト間の関係を可視化
  - 統合パターン: 共有カーネル、顧客/供給者、公開ホストサービス等
  - 実装戦略: マイクロサービス、モジュラーモノリス

  使用タイミング:
  - システムのドメイン境界を定義する時
  - 複数のコンテキスト間の連携を設計する時
  - マイクロサービスやモジュールの分割を検討する時
  - チーム間の責任範囲を明確にする時

  Use proactively when defining domain boundaries, designing context integration,
  planning microservices architecture, or clarifying team responsibilities.
version: 1.0.0
---

# Bounded Context

## 概要

このスキルは、DDDにおける境界付けられたコンテキスト（Bounded Context）の設計と
コンテキストマッピングパターンを提供します。境界付けられたコンテキストは、
特定のドメインモデルが適用される明示的な境界です。

**主要な価値**:

- ドメインの複雑性の管理
- チーム間の責任の明確化
- システムのモジュール性向上
- 独立した進化の実現

**対象ユーザー**:

- システムアーキテクトを担当するエージェント
- マイクロサービス設計を行う開発者
- チーム編成を検討する技術リーダー

## リソース構造

```
bounded-context/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── context-identification.md              # コンテキストの特定方法
│   ├── context-mapping-patterns.md            # コンテキストマッピングパターン
│   └── integration-strategies.md              # 統合戦略
├── scripts/
│   └── analyze-context-boundaries.mjs         # コンテキスト境界分析スクリプト
└── templates/
    └── context-map-template.md                # コンテキストマップテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# コンテキストの特定方法
cat .claude/skills/bounded-context/resources/context-identification.md

# コンテキストマッピングパターン
cat .claude/skills/bounded-context/resources/context-mapping-patterns.md

# 統合戦略
cat .claude/skills/bounded-context/resources/integration-strategies.md
```

### スクリプト実行

```bash
# コンテキスト境界分析
node .claude/skills/bounded-context/scripts/analyze-context-boundaries.mjs src/
```

### テンプレート参照

```bash
# コンテキストマップテンプレート
cat .claude/skills/bounded-context/templates/context-map-template.md
```

## 核心概念

### 1. 境界付けられたコンテキストとは

**定義**: 特定のドメインモデルが適用される明示的な境界

**特徴**:

- ユビキタス言語の適用範囲
- 一貫したモデルの維持
- 独立した進化が可能
- 明確な責任範囲

### 2. コンテキストの原則

**原則1: 言語の境界**

- 同じ用語が異なる意味を持つ場合は別のコンテキスト
- コンテキスト内では用語の意味が一貫

```
販売コンテキスト           サポートコンテキスト
    「顧客」                    「顧客」
     ├── 購入履歴               ├── チケット履歴
     ├── 支払い方法             ├── 満足度スコア
     └── ポイント               └── 優先度
```

**原則2: モデルの独立性**

- 各コンテキストは独自のモデルを持つ
- 他のコンテキストのモデルに直接依存しない

**原則3: 明示的な境界**

- コンテキストの境界を明確に定義
- 境界を越える場合は変換を行う

### 3. コンテキストマップ

コンテキスト間の関係を可視化するツール。

```
┌─────────────────────────────────────────────────────────────┐
│                        システム全体                          │
│                                                             │
│  ┌───────────────┐      ACL      ┌───────────────┐        │
│  │    販売       │ ─────────────→│    配送       │        │
│  │  コンテキスト  │              │  コンテキスト  │        │
│  └───────────────┘              └───────────────┘        │
│         │                              │                   │
│         │ Shared Kernel                │                   │
│         ↓                              │                   │
│  ┌───────────────┐                    │                   │
│  │   在庫        │←───────────────────┘                   │
│  │  コンテキスト  │     Customer/Supplier                  │
│  └───────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

## ワークフロー

### Phase 1: コンテキストの発見

**目的**: ドメインの境界を特定

**手法**:

1. イベントストーミングでドメインイベントを洗い出す
2. 言語の境界を見つける（同じ用語が異なる意味を持つ箇所）
3. ビジネスプロセスの断絶点を特定
4. チームの責任範囲を確認

**判断基準**:

- [ ] 用語の意味が文脈によって異なるか？
- [ ] 独立して変更できる範囲か？
- [ ] チームの責任範囲と一致するか？
- [ ] 技術的な制約があるか？

### Phase 2: コンテキストマッピング

**目的**: コンテキスト間の関係を定義

**ステップ**:

1. すべてのコンテキストをリストアップ
2. コンテキスト間のデータフローを特定
3. 統合パターンを選択
4. コンテキストマップを作成

**統合パターン**:
| パターン | 説明 | 使用場面 |
|---------|------|---------|
| 共有カーネル | 共通コードを共有 | 緊密に連携するチーム |
| 顧客/供給者 | 上流/下流の関係 | 明確な依存関係 |
| 適合者 | 下流が上流に合わせる | 外部システム連携 |
| 腐敗防止層 | 変換レイヤーを設置 | レガシー統合 |
| 公開ホストサービス | 標準APIを提供 | 多数の利用者 |
| 公開言語 | 共通の言語で通信 | 異なるモデル間 |

### Phase 3: 境界の実装

**目的**: コンテキスト境界をコードに反映

**実装パターン**:

1. **パッケージ/モジュール分離**:

```
src/
├── contexts/
│   ├── sales/           # 販売コンテキスト
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   ├── shipping/        # 配送コンテキスト
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   └── inventory/       # 在庫コンテキスト
│       ├── domain/
│       ├── application/
│       └── infrastructure/
└── shared/              # 共有コード（最小限に）
```

2. **腐敗防止層（ACL）**:

```typescript
// 配送コンテキストから販売コンテキストのデータを取得
class SalesContextAdapter {
  constructor(private readonly salesApi: ISalesApi) {}

  async getOrderForShipping(orderId: string): Promise<ShippingOrder> {
    const salesOrder = await this.salesApi.getOrder(orderId);
    // 販売コンテキストのモデルを配送コンテキストのモデルに変換
    return this.translate(salesOrder);
  }

  private translate(salesOrder: SalesOrder): ShippingOrder {
    return ShippingOrder.create({
      orderId: salesOrder.id,
      destination: this.translateAddress(salesOrder.shippingAddress),
      items: salesOrder.items.map((i) => this.translateItem(i)),
    });
  }
}
```

### Phase 4: 統合テスト

**目的**: コンテキスト間の連携を検証

**テスト観点**:

- コンテキスト間のデータ変換
- APIの互換性
- 障害時の動作
- パフォーマンス

## いつ使うか

### シナリオ1: マイクロサービス分割

**状況**: モノリスをマイクロサービスに分割したい

**適用条件**:

- [ ] ビジネスドメインが複数ある
- [ ] チームが独立して開発したい
- [ ] スケーラビリティ要件が異なる

**期待される成果**: 適切なサービス境界の設計

### シナリオ2: レガシー統合

**状況**: 既存システムと新システムを統合したい

**適用条件**:

- [ ] 異なるモデルを持つシステム
- [ ] 段階的な移行が必要
- [ ] データ整合性の維持が重要

**期待される成果**: 腐敗防止層による安全な統合

### シナリオ3: チーム編成

**状況**: 開発チームの責任範囲を明確にしたい

**適用条件**:

- [ ] 複数チームが並行開発
- [ ] 依存関係を最小化したい
- [ ] 自律的なチーム運営を目指す

**期待される成果**: コンテキストに基づくチーム編成

## ベストプラクティス

### すべきこと

1. **言語の境界を尊重**:
   - 同じ用語でも意味が異なればモデルを分離
   - コンテキスト内でユビキタス言語を維持

2. **明示的な変換**:
   - コンテキスト間でデータを変換
   - 暗黙的な依存を避ける

3. **段階的な発見**:
   - 最初から完璧を目指さない
   - 理解が深まったら境界を調整

### 避けるべきこと

1. **過度な分割**:
   - 小さすぎるコンテキストは避ける
   - 統合コストを考慮

2. **共有の乱用**:
   - 共有カーネルは最小限に
   - 安易な共有は結合を生む

3. **技術駆動の分割**:
   - ビジネス境界で分割
   - 技術的な都合だけで分割しない

## トラブルシューティング

### 問題1: 境界が曖昧

**症状**: どこで分割すべきか分からない

**解決策**:

1. イベントストーミングを実施
2. 言語の違いに注目
3. チームの責任範囲を確認
4. 段階的に発見・調整

### 問題2: 統合が複雑

**症状**: コンテキスト間の連携が困難

**解決策**:

1. 腐敗防止層を導入
2. 非同期統合を検討
3. 公開ホストサービスを定義
4. 契約テストを導入

### 問題3: 重複コードの増加

**症状**: 似たようなコードが複数コンテキストに

**解決策**:

1. 本当に同じ概念か確認
2. 必要な重複は許容
3. 共有カーネルは慎重に
4. 共通ライブラリとして抽出を検討

## 関連スキル

- **domain-driven-design** (`.claude/skills/domain-driven-design/SKILL.md`): DDDの戦術的パターン
- **ubiquitous-language** (`.claude/skills/ubiquitous-language/SKILL.md`): コンテキスト内の用語統一
- **domain-services** (`.claude/skills/domain-services/SKILL.md`): コンテキスト内のサービス設計

## 参考文献

- **『エリック・エヴァンスのドメイン駆動設計』**
  - 第14章: モデルの整合性を維持する

- **『実践ドメイン駆動設計』**
  - 第2章: ドメイン、サブドメイン、境界付けられたコンテキスト
  - 第3章: コンテキストマップ

## 変更履歴

| バージョン | 日付       | 変更内容                                          |
| ---------- | ---------- | ------------------------------------------------- |
| 1.0.0      | 2025-11-25 | 初版作成 - 境界付けられたコンテキストの設計と統合 |
