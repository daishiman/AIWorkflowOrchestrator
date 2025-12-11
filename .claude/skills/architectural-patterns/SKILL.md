---
name: architectural-patterns
description: |
  エンタープライズアーキテクチャパターン（Hexagonal、Onion、Ports and Adapters等）の
  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/architectural-patterns/resources/hexagonal-architecture.md`: ヘキサゴナルアーキテクチャ（Ports and Adapters）
  - `.claude/skills/architectural-patterns/resources/onion-architecture.md`: オニオンアーキテクチャ（Onion Architecture）
  - `.claude/skills/architectural-patterns/resources/vertical-slice.md`: 垂直スライスアーキテクチャ（Vertical Slice Architecture）
  - `.claude/skills/architectural-patterns/templates/pattern-comparison.md`: アーキテクチャパターン比較レポート
  - `.claude/skills/architectural-patterns/scripts/evaluate-pattern-compliance.mjs`: アーキテクチャパターン準拠評価スクリプト

  専門分野:
  - Hexagonal Architecture: ポートとアダプターによる疎結合設計
  - Onion Architecture: 同心円状のレイヤー構造
  - Ports and Adapters: 外部システムとの境界設計
  - Vertical Slice Architecture: 機能単位の垂直分割

  使用タイミング:
  - アーキテクチャパターンを選択・評価する時
  - 外部システムとの境界を設計する時
  - ドメイン中心の設計を実現する時
  - 既存アーキテクチャのパターン準拠を確認する時

  Use proactively when selecting architecture patterns, designing system boundaries,
  or evaluating pattern compliance in existing systems.
version: 1.0.0
---

# Architectural Patterns

## 概要

このスキルは、エンタープライズアプリケーション開発で広く採用されている
アーキテクチャパターンの知識を提供し、適切なパターン選択と評価を支援します。

**核心概念**:
これらのパターンはすべて「ドメインロジックを技術的詳細から隔離する」という
共通の目標を持つ。フレームワーク、DB、UIへの依存を外側に追いやり、
ビジネスロジックを純粋に保つことで、保守性とテスト容易性を実現する。

**主要な価値**:

- 技術的詳細からのドメイン保護
- テスト容易性の向上（モック・スタブによる置き換え）
- 技術スタックの変更容易性
- 関心の分離による保守性向上

**対象ユーザー**:

- アーキテクチャレビューを行う@arch-police
- システム設計者
- 新規プロジェクトの技術選定担当者

## リソース構造

```
architectural-patterns/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── hexagonal-architecture.md               # Hexagonal詳細
│   ├── onion-architecture.md                   # Onion詳細
│   ├── ports-and-adapters.md                   # Ports and Adapters詳細
│   ├── vertical-slice.md                       # Vertical Slice詳細
│   └── pattern-comparison.md                   # パターン比較
├── scripts/
│   └── evaluate-pattern-compliance.mjs         # パターン準拠評価
└── templates/
    └── architecture-decision-record.md         # ADRテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# Hexagonal Architecture詳細
cat .claude/skills/architectural-patterns/resources/hexagonal-architecture.md

# Onion Architecture詳細
cat .claude/skills/architectural-patterns/resources/onion-architecture.md

# Ports and Adapters詳細
cat .claude/skills/architectural-patterns/resources/ports-and-adapters.md

# Vertical Slice詳細
cat .claude/skills/architectural-patterns/resources/vertical-slice.md

# パターン比較
cat .claude/skills/architectural-patterns/resources/pattern-comparison.md
```

### スクリプト実行

```bash
# パターン準拠評価
node .claude/skills/architectural-patterns/scripts/evaluate-pattern-compliance.mjs src/

# 特定パターンでの評価
node .claude/skills/architectural-patterns/scripts/evaluate-pattern-compliance.mjs src/ --pattern=hexagonal
```

## 主要パターン

### 1. Hexagonal Architecture（六角形アーキテクチャ）

**別名**: Ports and Adapters Architecture

**提唱者**: Alistair Cockburn

**核心概念**:
アプリケーションをポート（インターフェース）とアダプター（実装）で
外部世界から隔離する。アプリケーションは「六角形」の内側に存在し、
各辺がポートとなって外部と接続する。

**構造**:

```
          [Web UI Adapter]
                ↓
        ┌──────────────────┐
        │    Web Port      │
        │                  │
[DB]←──Port    Domain    Port──→[External API]
        │                  │
        │    Test Port     │
        └──────────────────┘
                ↑
          [Test Adapter]
```

**Port（ポート）**:

- ドメインが定義するインターフェース
- 入力ポート（ユースケース）、出力ポート（リポジトリ等）
- 技術に依存しない抽象

**Adapter（アダプター）**:

- ポートの具体的な実装
- 外部技術とポートの橋渡し
- 複数のアダプターが同じポートを実装可能

**利点**:

- 外部技術の変更が容易（アダプターの差し替え）
- テストが容易（モックアダプターの使用）
- ドメインロジックが純粋

**適用条件**:

- 外部システムとの連携が多い
- 技術スタックの変更可能性がある
- テスト容易性が重要

### 2. Onion Architecture（オニオンアーキテクチャ）

**提唱者**: Jeffrey Palermo

**核心概念**:
同心円状のレイヤー構造で、内側ほど安定・抽象的。
すべての依存は外側から内側へのみ。

**構造**:

```
┌─────────────────────────────────────┐
│         Infrastructure              │
│  ┌───────────────────────────────┐  │
│  │      Application Services     │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │    Domain Services      │  │  │
│  │  │  ┌───────────────────┐  │  │  │
│  │  │  │   Domain Model    │  │  │  │
│  │  │  └───────────────────┘  │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**レイヤー**:

1. **Domain Model（最内層）**: エンティティ、バリューオブジェクト
2. **Domain Services**: ドメインロジック、リポジトリインターフェース
3. **Application Services**: ユースケース、アプリケーションロジック
4. **Infrastructure（最外層）**: DB、UI、外部サービス

**利点**:

- 依存方向が明確
- ドメインが最も安定
- レイヤーごとのテストが容易

**適用条件**:

- ドメインが複雑
- 長期的な保守性が重要
- チームがDDDに習熟

### 3. Ports and Adapters（詳細版）

**Hexagonalとの関係**:
Hexagonal Architectureの別名であり、同じ概念を異なる視点で説明。

**Primary（Driving）Adapters**:

- アプリケーションを駆動する側
- 例: Web Controller、CLI、テストハーネス

**Secondary（Driven）Adapters**:

- アプリケーションに駆動される側
- 例: DBアダプター、外部APIクライアント、メッセージキュー

**依存の方向**:

```
Primary Adapter → Port (Interface) ← Application → Port (Interface) ← Secondary Adapter
```

### 4. Vertical Slice Architecture（垂直スライスアーキテクチャ）

**提唱者**: Jimmy Bogard

**核心概念**:
機能（フィーチャー）単位で垂直に分割。
各スライスは独立しており、水平レイヤーを横断する。

**構造**:

```
Feature A        Feature B        Feature C
┌──────────┐    ┌──────────┐    ┌──────────┐
│   UI     │    │   UI     │    │   UI     │
│  Logic   │    │  Logic   │    │  Logic   │
│   DB     │    │   DB     │    │   DB     │
└──────────┘    └──────────┘    └──────────┘
```

**利点**:

- 機能ごとの独立性が高い
- 変更の影響範囲が限定
- 機能ごとに異なるアプローチが可能

**適用条件**:

- 機能が明確に分離できる
- 機能間の共有コードが少ない
- マイクロサービス移行を視野

## パターン比較

| 特性         | Hexagonal    | Onion        | Vertical Slice     |
| ------------ | ------------ | ------------ | ------------------ |
| 構造         | ポート中心   | レイヤー中心 | 機能中心           |
| 依存方向     | 外→内        | 外→内        | 各スライス内で完結 |
| 適用規模     | 中〜大規模   | 中〜大規模   | 小〜中規模         |
| 学習曲線     | 中程度       | 中程度       | 低い               |
| テスト容易性 | 高           | 高           | 高                 |
| 共通点       | ドメイン保護 | ドメイン保護 | 関心の分離         |

## ワークフロー

### Phase 1: 要件の分析

**目的**: プロジェクト特性に基づくパターン選択

**評価基準**:

- [ ] 外部システムとの連携数は？
- [ ] ドメインの複雑さは？
- [ ] チームの経験は？
- [ ] 将来の変更可能性は？

**パターン選択ガイド**:

```
外部連携が多い + 技術変更可能性 → Hexagonal
ドメイン複雑 + 長期保守 → Onion
機能が独立 + 迅速な開発 → Vertical Slice
```

### Phase 2: 構造設計

**目的**: 選択したパターンに基づく構造設計

**ステップ**:

1. レイヤー/コンポーネントの定義
2. 境界の明確化
3. 依存方向の決定
4. インターフェースの設計

### Phase 3: 実装の評価

**目的**: パターン準拠の確認

**チェックリスト**:

- [ ] 依存方向が正しいか？
- [ ] ドメインが技術から隔離されているか？
- [ ] 境界が明確に定義されているか？
- [ ] テスト容易性が確保されているか？

### Phase 4: 継続的な監視

**目的**: パターンの腐敗を防止

**監視項目**:

- 依存関係違反の検出
- レイヤー境界の侵食
- 技術詳細のドメイン漏出

## ベストプラクティス

### すべきこと

1. **パターンの理解を深める**:
   - チーム全体でパターンを理解
   - ADR（Architecture Decision Record）で記録

2. **段階的な適用**:
   - 最初から完璧を目指さない
   - 段階的にパターンを適用

3. **自動チェックの導入**:
   - ESLint/TSLintで依存チェック
   - CIで継続的に検証

### 避けるべきこと

1. **過度な抽象化**:
   - ❌ 小規模プロジェクトに複雑なパターン
   - ✅ プロジェクト規模に適したパターン

2. **パターンの混在**:
   - ❌ 複数パターンを無秩序に混在
   - ✅ 明確な境界と理由を持った組み合わせ

## トラブルシューティング

### 問題1: ドメインに技術詳細が漏出

**症状**: ドメインモデルがフレームワークに依存

**解決策**:

1. 依存を特定
2. インターフェースを導入
3. 実装をインフラ層に移動

### 問題2: 層間の境界が曖昧

**症状**: どのレイヤーに配置すべきか不明

**解決策**:

1. 責務を明確化
2. 依存方向を確認
3. チーム内でルールを共有

### 問題3: テストが困難

**症状**: モックが多数必要

**解決策**:

1. 依存性注入の適用
2. ポート/アダプターの見直し
3. テスト用アダプターの作成

## 関連スキル

- **clean-architecture-principles** (`.claude/skills/clean-architecture-principles/SKILL.md`): 依存関係ルール
- **solid-principles** (`.claude/skills/solid-principles/SKILL.md`): 設計原則
- **dependency-analysis** (`.claude/skills/dependency-analysis/SKILL.md`): 依存関係分析

## メトリクス

### パターン準拠スコア

**評価基準**:

- 依存方向の正しさ: 0-40点
- ドメイン隔離度: 0-30点
- 境界の明確性: 0-30点

**目標**: 80点以上

## 変更履歴

| バージョン | 日付       | 変更内容                                  |
| ---------- | ---------- | ----------------------------------------- |
| 1.0.0      | 2025-11-25 | 初版作成 - アーキテクチャパターンの体系化 |

## 参考文献

- **『Clean Architecture』** Robert C. Martin著
- **『Implementing Domain-Driven Design』** Vaughn Vernon著
- **「Hexagonal Architecture」** Alistair Cockburn
- **「The Onion Architecture」** Jeffrey Palermo
