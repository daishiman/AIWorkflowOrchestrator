---
name: api-client-patterns
description: |
  外部API統合における構造的パターンと腐敗防止層（Anti-Corruption Layer）の設計を専門とするスキル。
  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/api-client-patterns/resources/adapter-pattern.md`: Adapter Pattern for API Clients
  - `.claude/skills/api-client-patterns/resources/anti-corruption-layer.md`: Anti-Corruption Layer (腐敗防止層)
  - `.claude/skills/api-client-patterns/resources/data-transformer-patterns.md`: Data Transformer Patterns
  - `.claude/skills/api-client-patterns/resources/facade-pattern.md`: Facade Pattern for API Integration
  - `.claude/skills/api-client-patterns/templates/api-client-template.ts`: API Client Template
  - `.claude/skills/api-client-patterns/templates/transformer-template.ts`: Data Transformer Template
  - `.claude/skills/api-client-patterns/scripts/validate-api-client.mjs`: API Client Structure Validator

  専門分野:
  - Adapter Pattern: 外部APIインターフェースを内部で使いやすい形に変換
  - Facade Pattern: 複雑な外部APIを単純なインターフェースで隠蔽
  - Anti-Corruption Layer: 外部ドメインモデルと内部ドメインモデルを分離
  - データ変換: 外部形式から内部型への型安全な変換

  使用タイミング:
  - 外部APIクライアントを設計する時
  - 外部データを内部ドメインモデルに変換する時
  - 腐敗防止層の境界を設計する時
  - 外部API変更の影響を最小限に抑えたい時

  Use proactively when users need to integrate external APIs, design data transformers,
  or establish anti-corruption layers between external and internal systems.
version: 1.0.0
---

# API Client Patterns

## 概要

このスキルは、外部API統合における構造的パターンと腐敗防止層（Anti-Corruption Layer）の設計を提供します。
サム・ニューマンの『Building Microservices』およびエリック・エヴァンスの『Domain-Driven Design』に基づき、
外部システムの変更や障害から内部ドメインを保護する境界設計を支援します。

**主要な価値**:

- 外部APIの詳細を内部レイヤーに漏らさない設計
- 外部API変更時の影響範囲を最小限に抑制
- 型安全なデータ変換による信頼性向上
- 外部ドメイン概念の内部への侵入を防止

**対象ユーザー**:

- 外部API統合を実装するエージェント（@gateway-dev）
- インフラ層の設計者
- マイクロサービスアーキテクト

## リソース構造

```
api-client-patterns/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── adapter-pattern.md                      # Adapterパターンの詳細ガイド
│   ├── facade-pattern.md                       # Facadeパターンの詳細ガイド
│   ├── anti-corruption-layer.md                # 腐敗防止層の設計ガイド
│   └── data-transformer-patterns.md            # データ変換パターン集
├── scripts/
│   └── validate-api-client.mjs                 # APIクライアント構造検証スクリプト
└── templates/
    ├── api-client-template.ts                  # APIクライアントテンプレート
    └── transformer-template.ts                 # データ変換テンプレート
```

## コマンドリファレンス

このスキルで使用可能なリソース、スクリプト、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# Adapterパターンの詳細
cat .claude/skills/api-client-patterns/resources/adapter-pattern.md

# Facadeパターンの詳細
cat .claude/skills/api-client-patterns/resources/facade-pattern.md

# 腐敗防止層設計ガイド
cat .claude/skills/api-client-patterns/resources/anti-corruption-layer.md

# データ変換パターン集
cat .claude/skills/api-client-patterns/resources/data-transformer-patterns.md
```

### スクリプト実行

```bash
# APIクライアントの構造検証
node .claude/skills/api-client-patterns/scripts/validate-api-client.mjs <client-file.ts>
```

### テンプレート参照

```bash
# APIクライアントテンプレート
cat .claude/skills/api-client-patterns/templates/api-client-template.ts

# データ変換テンプレート
cat .claude/skills/api-client-patterns/templates/transformer-template.ts
```

## いつ使うか

### シナリオ1: 新規外部API統合

**状況**: 外部サービス（Discord, Google APIs, Stripe等）との連携を実装する

**適用条件**:

- [ ] 外部APIのレスポンス形式が内部モデルと異なる
- [ ] 外部APIの詳細を内部コードに漏らしたくない
- [ ] 外部API変更時の影響を局所化したい

**期待される成果**: 腐敗防止層を持つAPIクライアントの設計

### シナリオ2: 既存APIクライアントのリファクタリング

**状況**: 外部APIの変更により既存コードの大規模修正が必要になった

**適用条件**:

- [ ] 外部APIの変更が内部コード全体に波及している
- [ ] 変換ロジックが散在している
- [ ] 型安全性が不十分

**期待される成果**: 影響範囲を局所化した腐敗防止層の導入

### シナリオ3: マルチ外部API統合

**状況**: 複数の外部APIを統合的に利用する必要がある

**適用条件**:

- [ ] 複数の外部サービスを組み合わせて使用
- [ ] 各サービスのデータ形式が異なる
- [ ] 統一されたインターフェースが必要

**期待される成果**: Facadeパターンによる統合インターフェース

## 前提条件

### 必要な知識

- [ ] デザインパターンの基本概念（Adapter, Facade, Strategy）
- [ ] TypeScriptの型システム（ジェネリクス、型ガード）
- [ ] HTTP通信の基礎（REST API、JSON）

### 必要なツール

- Read: 外部API仕様の読み込み
- Write: クライアントコードの作成
- Grep: 既存パターンの検索

### 環境要件

- TypeScript環境が設定されている
- 外部API仕様が利用可能

## 核心概念

### 1. Adapter Pattern（アダプターパターン）

**目的**: 外部APIインターフェースを内部で使いやすい形に変換

**原則**:

- 外部APIの詳細を隠蔽
- 内部で期待するインターフェースを提供
- 双方向の変換をサポート

**実装方針**:

```
外部API → Adapter → 内部インターフェース
```

**詳細**: `resources/adapter-pattern.md`

### 2. Facade Pattern（ファサードパターン）

**目的**: 複雑な外部APIを単純なインターフェースで隠蔽

**原則**:

- 複数の外部API呼び出しを1つのメソッドに集約
- 呼び出し順序の管理を内部化
- シンプルなインターフェースを提供

**実装方針**:

```
複数の外部API → Facade → 単一インターフェース
```

**詳細**: `resources/facade-pattern.md`

### 3. Anti-Corruption Layer（腐敗防止層）

**目的**: 外部ドメインモデルと内部ドメインモデルを完全に分離

**原則**:

- 外部の概念を内部に持ち込まない
- 変換層で外部形式を内部形式に変換
- 外部API変更の影響を局所化

**実装方針**:

```
外部ドメインモデル → ACL（変換層） → 内部ドメインモデル
```

**詳細**: `resources/anti-corruption-layer.md`

### 4. Data Transformer（データ変換）

**目的**: 外部データを型安全に内部型へ変換

**原則**:

- Zodなどによる実行時検証
- 欠損フィールドのデフォルト処理
- エラーケースの明示的処理

**実装方針**:

```
外部JSON → バリデーション → 型変換 → 内部型
```

**詳細**: `resources/data-transformer-patterns.md`

## ワークフロー

### Phase 1: 外部API分析

**目的**: 統合対象の外部システムの特性を理解する

**ステップ**:

1. **API仕様の調査**:
   - エンドポイント、メソッド、パラメータ
   - 認証方式
   - レスポンス形式

2. **データモデルの分析**:
   - 外部APIのデータ構造
   - 必須/オプショナルフィールド
   - 型情報

3. **エラーケースの把握**:
   - エラーレスポンス形式
   - ステータスコード
   - リトライ可能なエラー

**判断基準**:

- [ ] API仕様が完全に把握されているか？
- [ ] データモデルの差異が分析されているか？
- [ ] エラーケースがリストアップされているか？

### Phase 2: 境界設計

**目的**: 外部システムと内部ドメインの境界を定義する

**ステップ**:

1. **腐敗防止層の範囲決定**:
   - どの概念を変換するか
   - どのレベルで境界を設けるか

2. **パターン選択**:
   - 単一API → Adapter
   - 複数API統合 → Facade
   - ドメイン保護 → Anti-Corruption Layer

3. **インターフェース設計**:
   - 内部から見たAPI
   - メソッドシグネチャ
   - 戻り値の型

**判断基準**:

- [ ] 境界の位置が明確か？
- [ ] 適切なパターンが選択されているか？
- [ ] インターフェースがドメイン用語で表現されているか？

### Phase 3: 変換ロジック実装

**目的**: 外部データを内部型に変換する処理を実装する

**ステップ**:

1. **型定義**:
   - 外部型（API Response）
   - 内部型（Domain Entity）
   - 変換関数の型

2. **変換関数実装**:
   - フィールドマッピング
   - デフォルト値処理
   - バリデーション

3. **エラー変換**:
   - 外部エラー → 内部エラー型
   - エラーメッセージの適切な処理

**判断基準**:

- [ ] 型安全な変換が実装されているか？
- [ ] エラーケースが適切に処理されているか？
- [ ] テスト可能な構造になっているか？

### Phase 4: 検証とテスト

**目的**: 実装の正確性と堅牢性を確認する

**ステップ**:

1. **ユニットテスト**:
   - 正常系変換
   - エラーケース
   - エッジケース

2. **統合テスト**:
   - 実際のAPIとの通信
   - エンドツーエンドの動作確認

3. **検証スクリプト実行**:
   ```bash
   node .claude/skills/api-client-patterns/scripts/validate-api-client.mjs <file>
   ```

**判断基準**:

- [ ] ユニットテストが作成されているか？
- [ ] エッジケースがカバーされているか？
- [ ] 検証スクリプトがパスしているか？

## ベストプラクティス

### すべきこと

1. **インターフェースはドメイン用語で**:
   - ✅ `getUserProfile(userId: string): Promise<UserProfile>`
   - ❌ `callApi("/users/{id}", "GET"): Promise<any>`

2. **型安全性の確保**:
   - Zodスキーマによる実行時検証
   - 厳格なTypeScript型定義
   - unknown型からの安全な変換

3. **変換ロジックの局所化**:
   - 変換はTransformerクラス/関数に集約
   - ビジネスロジックとの分離

### 避けるべきこと

1. **外部型の直接使用**:
   - ❌ 内部コードで外部APIの型をそのまま使用
   - ✅ 内部ドメイン型に変換して使用

2. **過度な汎用化**:
   - ❌ すべてのAPIに対応する汎用クライアント
   - ✅ 外部サービスごとに特化したクライアント

3. **暗黙の変換**:
   - ❌ 型キャスト（as）による強制変換
   - ✅ 明示的な検証と変換処理

## トラブルシューティング

### 問題1: 外部APIの変更が内部に波及

**症状**: 外部APIの変更で内部コードの大規模修正が必要

**原因**: 腐敗防止層が不十分または不在

**解決策**:

1. 変換層の導入または強化
2. 内部インターフェースの安定化
3. 外部依存の局所化

### 問題2: 型不整合エラー

**症状**: 実行時に型エラーが発生

**原因**: 外部APIの実際のレスポンスと期待が異なる

**解決策**:

1. Zodによる実行時検証の追加
2. オプショナルフィールドの適切な処理
3. デフォルト値の設定

### 問題3: 変換ロジックの複雑化

**症状**: 変換コードが肥大化し、保守困難

**原因**: 一箇所ですべての変換を処理

**解決策**:

1. 変換を小さな関数に分割
2. パイプライン処理の導入
3. ネストされた構造の段階的変換

## 関連スキル

- **retry-strategies** (`.claude/skills/retry-strategies/SKILL.md`): リトライとサーキットブレーカー
- **http-best-practices** (`.claude/skills/http-best-practices/SKILL.md`): HTTP通信のベストプラクティス
- **authentication-flows** (`.claude/skills/authentication-flows/SKILL.md`): 認証フローの実装
- **rate-limiting** (`.claude/skills/rate-limiting/SKILL.md`): レート制限対応

## 参考文献

- **『Building Microservices』** Sam Newman著
  - Chapter 4: Integration - 外部システムとの統合パターン

- **『Domain-Driven Design』** Eric Evans著
  - Chapter 14: Maintaining Model Integrity - 腐敗防止層

- **『Enterprise Integration Patterns』** Gregor Hohpe著
  - Message Translator, Envelope Wrapper

## 変更履歴

| バージョン | 日付       | 変更内容                                                  |
| ---------- | ---------- | --------------------------------------------------------- |
| 1.0.0      | 2025-11-25 | 初版作成 - Adapter, Facade, ACL, Data Transformerパターン |

## 使用上の注意

### このスキルが得意なこと

- 外部API統合の設計パターン提供
- 腐敗防止層の境界設計
- データ変換ロジックの構造化

### このスキルが行わないこと

- 具体的なAPIクライアントの実装（それは@gateway-devエージェントの役割）
- リトライやサーキットブレーカーの実装（retry-strategiesスキル）
- 認証フローの実装（authentication-flowsスキル）
