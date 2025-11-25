---
name: clean-architecture-principles
description: |
  ロバート・C・マーティン（Uncle Bob）の『Clean Architecture』に基づく
  アーキテクチャ原則と依存関係ルールを専門とするスキル。
  ビジネスロジックを技術的詳細から隔離し、保守性とテスト容易性を実現します。

  専門分野:
  - 依存関係ルール: 依存の方向は常に「外側から内側へ」のみ
  - レイヤー分離: Entities → Use Cases → Interface Adapters → Frameworks
  - 境界の明確化: インターフェースによる疎結合設計
  - 技術的詳細の隔離: DB、UI、フレームワークからの独立

  使用タイミング:
  - アーキテクチャの依存関係違反を検出する時
  - レイヤー構造を設計・検証する時
  - インターフェースによる境界設計が必要な時
  - 技術的詳細の漏出をチェックする時

  Use proactively when checking architecture compliance, detecting layer violations,
  or designing interface boundaries for Clean Architecture adherence.
version: 1.0.0
---

# Clean Architecture Principles

## 概要

このスキルは、ロバート・C・マーティンが『Clean Architecture』で提唱した原則に基づき、
ソフトウェアアーキテクチャの依存関係ルールとレイヤー分離を検証・設計するための知識を提供します。

**核心概念**:
ソフトウェアアーキテクチャの目的は「変更コストを最小化すること」である。
依存関係の方向を制御し、ビジネスロジックを技術的詳細から隔離することで、
長期的な保守性とテスト容易性を実現する。

**主要な価値**:
- 依存関係ルールにより、内側のレイヤーが外側の変更から保護される
- ビジネスロジックが技術的詳細（DB、UI、フレームワーク）から独立
- テスト容易性の向上（モック・スタブによる置き換えが容易）
- 技術スタックの変更が容易

**対象ユーザー**:
- アーキテクチャレビューを行う@arch-police
- システム設計者、開発者
- コードレビュー担当者

## リソース構造

```
clean-architecture-principles/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── dependency-rule.md                      # 依存関係ルールの詳細
│   ├── layer-structure.md                      # 4層構造の詳細
│   ├── boundary-interfaces.md                  # 境界インターフェースの設計
│   └── hybrid-architecture-mapping.md          # プロジェクト固有マッピング
├── scripts/
│   └── check-layer-violation.mjs               # レイヤー違反検出スクリプト
└── templates/
    └── architecture-review-checklist.md        # レビューチェックリスト
```

## コマンドリファレンス

### リソース読み取り

```bash
# 依存関係ルールの詳細
cat .claude/skills/clean-architecture-principles/resources/dependency-rule.md

# レイヤー構造の詳細
cat .claude/skills/clean-architecture-principles/resources/layer-structure.md

# 境界インターフェースの設計
cat .claude/skills/clean-architecture-principles/resources/boundary-interfaces.md

# ハイブリッドアーキテクチャへのマッピング
cat .claude/skills/clean-architecture-principles/resources/hybrid-architecture-mapping.md
```

### スクリプト実行

```bash
# レイヤー違反検出スクリプト
node .claude/skills/clean-architecture-principles/scripts/check-layer-violation.mjs src/

# 特定ディレクトリの検証
node .claude/skills/clean-architecture-principles/scripts/check-layer-violation.mjs src/shared/core/
```

### テンプレート参照

```bash
# アーキテクチャレビューチェックリスト
cat .claude/skills/clean-architecture-principles/templates/architecture-review-checklist.md
```

## 依存関係ルール

### 基本原則

**「依存は常に外側から内側へのみ」**

```
外側（不安定）           内側（安定）
     ↓                     ↑
Frameworks & Drivers  →  Entities
     ↓                     ↑
Interface Adapters    →  Use Cases
```

内側のレイヤーは外側のレイヤーについて何も知らない。
名前、関数、クラス、その他いかなるソフトウェアエンティティも、
外側のレイヤーで宣言されたものを内側のレイヤーから参照してはならない。

### レイヤー構造

#### 1. Entities（最内層）
**責務**: ビジネスルール、ドメインモデル
**特徴**:
- 外部依存ゼロ
- 最も安定している
- 変更理由はビジネスルールの変更のみ

**含まれるもの**:
- ドメインエンティティ
- バリューオブジェクト
- ドメインサービス
- ビジネスルール

**禁止事項**:
- フレームワーク依存
- DB依存（ORM、SQL）
- 外部API依存

#### 2. Use Cases（ユースケース層）
**責務**: アプリケーション固有のビジネスロジック
**特徴**:
- Entitiesにのみ依存
- システムの入出力データを定義

**含まれるもの**:
- ユースケース（Interactor）
- 入出力ポート（Input/Output Boundary）
- リクエスト/レスポンスモデル

**依存制約**:
- Entitiesにのみ依存可能
- フレームワーク、DB、UIに依存しない

#### 3. Interface Adapters（インターフェースアダプター層）
**責務**: データ形式変換、外部との橋渡し
**特徴**:
- Use CasesとEntitiesに依存可能
- 外部形式と内部形式の変換

**含まれるもの**:
- Controller
- Presenter
- Gateway
- Repository実装

**依存制約**:
- Use CasesとEntitiesに依存可能
- Frameworks層の詳細に依存しない

#### 4. Frameworks & Drivers（最外層）
**責務**: フレームワーク、DB、UI、外部サービス
**特徴**:
- 最も不安定
- 技術的詳細

**含まれるもの**:
- Webフレームワーク
- DBドライバ
- UIフレームワーク
- 外部サービスSDK

## 境界の明確化

### インターフェースによる依存性逆転

内側のレイヤーは、外側のレイヤーの機能が必要な場合、
インターフェースを定義し、外側がそれを実装する。

```
Use Cases層:
  interface IUserRepository {
    findById(id: string): User
  }

Interface Adapters層:
  class UserRepositoryImpl implements IUserRepository {
    findById(id: string): User { /* DB操作 */ }
  }
```

### 境界設計のチェックリスト

- [ ] インターフェースは内側のレイヤーで定義されているか？
- [ ] 実装は外側のレイヤーに配置されているか？
- [ ] データ形式の変換は境界で行われているか？
- [ ] 内側から外側への直接参照がないか？

## ワークフロー

### Phase 1: レイヤー構造の確認

**目的**: プロジェクトのレイヤー構造を理解する

**ステップ**:
1. ディレクトリ構造の確認
2. 各ディレクトリの責務特定
3. レイヤーへのマッピング

**判断基準**:
- [ ] 4層（または3層）構造が明確か？
- [ ] 各ディレクトリの責務が単一か？
- [ ] レイヤー間の境界が明確か？

### Phase 2: 依存関係の検証

**目的**: 依存関係ルールの違反を検出する

**ステップ**:
1. インポート文の抽出
2. 依存の方向性チェック
3. 違反箇所の特定

**検証パターン**:
```bash
# Entities層の外部依存チェック
grep -r "import.*from.*framework" src/core/entities/

# Use Cases層の不正な依存チェック
grep -r "import.*from.*adapters" src/core/usecases/
```

**判断基準**:
- [ ] 内側から外側への依存がないか？
- [ ] 各レイヤーが適切な依存のみを持つか？
- [ ] 技術的詳細が内側に漏出していないか？

### Phase 3: 境界設計の評価

**目的**: インターフェース境界の適切性を評価する

**ステップ**:
1. インターフェース定義の確認
2. 実装の配置確認
3. 依存性逆転の検証

**判断基準**:
- [ ] インターフェースが内側で定義されているか？
- [ ] 実装が外側に配置されているか？
- [ ] 依存性逆転が正しく適用されているか？

### Phase 4: レポート生成

**目的**: 検出結果を構造化してレポートする

**ステップ**:
1. 違反の分類（Critical/High/Medium/Low）
2. 影響範囲の評価
3. 是正方針の提案

## ベストプラクティス

### すべきこと

1. **依存関係の可視化**:
   - 依存グラフを定期的に生成
   - 自動チェックをCI/CDに組み込み

2. **インターフェースの適切な配置**:
   - 抽象はドメイン層に
   - 実装はインフラ層に

3. **技術的詳細の隔離**:
   - ORM、フレームワーク依存を外側に
   - ビジネスロジックをPure関数で

### 避けるべきこと

1. **レイヤー飛び越し**:
   - ❌ Presentation → Entitiesへの直接参照
   - ✅ 各レイヤーを順番に通過

2. **技術的詳細の漏出**:
   - ❌ Entities層でのORM使用
   - ✅ Entities層は純粋なドメインモデル

3. **暗黙の依存**:
   - ❌ グローバル変数、シングルトン
   - ✅ 明示的な依存性注入

## トラブルシューティング

### 問題1: Entities層に外部依存が存在

**症状**: ドメインモデルがフレームワークに依存している

**原因**: アーキテクチャ理解不足、急ぎの実装

**解決策**:
1. 外部依存を特定
2. インターフェースを定義
3. 実装を外側に移動
4. 依存性注入で接続

### 問題2: 循環依存が発生

**症状**: A→B→C→Aのような循環参照

**原因**: レイヤー境界の曖昧さ、責務の不明確さ

**解決策**:
1. 共通部分を抽出
2. 依存方向を一方向に整理
3. インターフェースで切り離し

### 問題3: テストが困難

**症状**: ユニットテストで多くのモックが必要

**原因**: 依存関係が密結合

**解決策**:
1. インターフェースの導入
2. 依存性注入の適用
3. テスト用スタブの作成

## 関連スキル

- **solid-principles** (`.claude/skills/solid-principles/SKILL.md`): SOLID原則、特にDIP
- **dependency-analysis** (`.claude/skills/dependency-analysis/SKILL.md`): 循環依存検出
- **architectural-patterns** (`.claude/skills/architectural-patterns/SKILL.md`): Hexagonal、Onion等
- **project-architecture-integration** (`.claude/skills/project-architecture-integration/SKILL.md`): プロジェクト固有設計

## メトリクス

### 依存関係健全性スコア

**評価基準**:
- 内→外依存数: 0が理想（違反数）
- 循環依存数: 0が理想
- インターフェース境界率: 高いほど良い

### レイヤー分離スコア

**測定方法**: (正しい方向の依存数 / 総依存数) × 100

**目標**: >95%

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版作成 - Clean Architecture原則の体系化 |

## 参考文献

- **『Clean Architecture』** Robert C. Martin著
  - Part V: Architecture - 依存関係ルールの理論
  - Chapter 22: The Clean Architecture - 4層構造の詳細
