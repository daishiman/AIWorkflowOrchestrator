---
name: project-architecture-integration
description: |
  プロジェクト固有のアーキテクチャ設計原則を専門とするスキル。
  ハイブリッドアーキテクチャ（shared/features）、データベース設計、REST API、
  テスト戦略、エラーハンドリング、CI/CDの原則をエージェント設計に統合します。

  専門分野:
  - ハイブリッドアーキテクチャ: shared/features構造、依存関係ルール、機能追加ワークフロー
  - データベース設計: JSONB活用、トランザクション、pgvector、インデックス戦略
  - REST API設計: RESTful原則、バージョニング、HTTPステータス、レスポンス標準化
  - テスト戦略: TDD、テストピラミッド、カバレッジ目標、モック方針
  - エラーハンドリング: エラー分類、リトライ戦略、構造化ログ、サーキットブレーカー
  - CI/CD: GitHub Actions、品質ゲート、自動デプロイ、通知要件

  使用タイミング:
  - エージェントがプロジェクト構造に準拠したファイルを生成する時
  - データベース操作を行うエージェントを設計する時
  - API連携エージェントを設計する時
  - テスト実行エージェントを設計する時
  - デプロイ関連エージェントを設計する時

  Use proactively when designing agents that interact with project architecture,
  database, APIs, or deployment pipelines.
version: 1.0.0
---

# Project Architecture Integration

## 概要

このスキルは、プロジェクト固有のアーキテクチャ設計原則とベストプラクティスを
エージェント設計に統合する方法を提供します。

**主要な価値**:
- プロジェクトアーキテクチャに準拠したエージェント設計
- データベース、API、テスト、デプロイの原則を反映
- 一貫性のある実装とベストプラクティスの適用

**重要**: このスキルは `docs/00-requirements/master_system_design.md` の内容に基づきます。

## リソース構造

```
project-architecture-integration/
├── SKILL.md
├── resources/
│   ├── hybrid-architecture-guide.md
│   ├── database-design-principles.md
│   ├── api-design-standards.md
│   ├── test-strategy-guide.md
│   ├── error-handling-patterns.md
│   └── cicd-requirements.md
└── templates/
    └── architecture-compliance-checklist.md
```

## ワークフロー

### Phase 1: ハイブリッドアーキテクチャの理解

**目的**: shared/features構造の原則をエージェント設計に反映

**設計方針の理解**:
- **shared**: 複数機能で共有する共通インフラ（AI、DB、外部サービス連携等）
- **features**: 機能ごとの垂直スライス設計、1フォルダで機能が完結
- **MVP効率**: 機能追加・削除が高速、認知負荷を削減、拡張性を確保

**レイヤー構造と責務**:
- `shared/core/`: ビジネスルール、共通エンティティ定義（外部依存ゼロ）
- `shared/infrastructure/`: 外部サービス接続層（DB、AI、Discord等）
- `features/`: 機能ごとのビジネスロジック、1機能＝1フォルダの独立性
- `app/`: HTTPエンドポイント、プレゼンテーション層（Next.js App Router）

**依存関係の方向性原則**:
- 外から内への単方向依存: `app/` → `features/` → `shared/infrastructure/` → `shared/core/`
- 逆方向の依存は禁止（ESLintで強制）
- 機能間の相互依存は禁止（features/各機能は独立）
- 共通インフラの活用により重複を排除

**機能追加ワークフロー原則**:
- 仕様書作成 → スキーマ定義（Zod） → Executor実装 → Registry登録 → テスト作成
- コアインターフェース（IWorkflowExecutor, IRepository）の実装準拠
- 各機能は独立したフォルダで完結（schema.ts, executor.ts, __tests__/）
- 共通インフラは`@/shared/infrastructure/`からimport

**エージェント設計時の考慮点**:
- [ ] 生成するファイルはプロジェクト構造（shared/features/app）のどの層に配置すべきか？
- [ ] 複数機能で共有する要素か、特定機能固有の要素か？
- [ ] 外部依存（DB、AI、Discord）を持つ場合、shared/infrastructureを活用しているか？
- [ ] ビジネスルールやエンティティ定義はshared/coreに集約されているか？
- [ ] 機能間で重複するロジックが発生していないか？（共通化の検討）
- [ ] 依存関係の方向性ルールに違反していないか？（ESLintで検証）

**リソース**: `resources/hybrid-architecture-guide.md`

### Phase 2: データベース設計原則

**目的**: データベース操作の原則をエージェントに反映

**主要原則**:

#### 1. JSONB活用
- 柔軟なスキーマ設計
- 半構造化データの効率的保存
- PostgreSQL JSONB型の活用

#### 2. トランザクション管理
- ACID特性の遵守
- 適切なトランザクション境界の設定
- ロールバック戦略

#### 3. インデックス戦略
- パフォーマンス最適化
- クエリパターンに基づくインデックス設計
- JSONB フィールドのインデックス化

#### 4. pgvector活用
- AI埋め込みベクトル検索
- コサイン類似度計算
- セマンティック検索の実装

**エージェント設計時の考慮点**:
- [ ] エージェントがデータベース操作を行う場合、トランザクション境界は明確か？
- [ ] JSONB フィールドの活用を検討しているか？
- [ ] インデックス戦略が定義されているか？
- [ ] pgvectorを使用する場合、ベクトル型の適切な使用が考慮されているか？

**リソース**: `resources/database-design-principles.md`

### Phase 3: REST API設計

**目的**: API設計の原則をエージェントに反映

**主要原則**:

#### 1. RESTful原則
- リソースベースのURL設計
- 適切なHTTPメソッド使用（GET, POST, PUT, DELETE）
- ステートレス通信

#### 2. APIバージョニング
- URLパスベースのバージョニング（`/api/v1/`）
- 後方互換性の維持
- 非推奨APIの段階的廃止

#### 3. HTTPステータスコード
- 適切なステータスコードの使用
- 2xx（成功）、4xx（クライアントエラー）、5xx（サーバーエラー）
- エラーレスポンスの標準化

#### 4. レスポンス形式
- JSON形式の標準化
- ページネーション対応
- フィルタリング、ソート機能

**エージェント設計時の考慮点**:
- [ ] 外部API呼び出しがある場合、リトライ戦略は定義されているか？
- [ ] HTTPステータスコードの適切な処理が考慮されているか？
- [ ] レスポンス形式が標準に準拠しているか？

**リソース**: `resources/api-design-standards.md`

### Phase 4: テスト戦略

**目的**: TDDとテストピラミッドの原則をエージェントに反映

**主要原則**:

#### 1. テストピラミッド
- 静的型チェック（TypeScript）
- ユニットテスト（Vitest）
- 統合テスト
- E2Eテスト（Playwright）

#### 2. TDDサイクル
- Red-Green-Refactorサイクル
- テストファースト開発
- 継続的リファクタリング

#### 3. カバレッジ目標
- ユニットテスト: 80%以上
- 統合テスト: 主要フロー網羅
- E2Eテスト: クリティカルパス

#### 4. モック/スタブ方針
- 外部依存のモック化
- テストデータの管理
- テストの独立性確保

**エージェント設計時の考慮点**:
- [ ] テスト関連エージェントはテストピラミッドの原則に従っているか？
- [ ] TDDサイクルが考慮されているか？
- [ ] カバレッジ目標が定義されているか？

**リソース**: `resources/test-strategy-guide.md`

### Phase 5: エラーハンドリングとロギング

**目的**: エラー処理とログ戦略をエージェントに反映

**主要原則**:

#### 1. エラー分類
- Validation: 入力検証エラー
- Business: ビジネスルールエラー
- External: 外部サービスエラー
- Infrastructure: インフラエラー
- Internal: 内部エラー

#### 2. リトライ戦略
- 指数バックオフ
- 最大リトライ回数
- リトライ可能エラーの判定

#### 3. 構造化ログ
- JSON形式
- トレーサビリティ（request_id, workflow_id）
- ログレベル（DEBUG, INFO, WARN, ERROR）

#### 4. サーキットブレーカー
- 障害の波及防止
- 自動回復メカニズム
- フォールバック戦略

**エージェント設計時の考慮点**:
- [ ] エラーログは構造化され、トレーサビリティが確保されているか？
- [ ] リトライ戦略が定義されているか？
- [ ] サーキットブレーカーパターンが考慮されているか？

**リソース**: `resources/error-handling-patterns.md`

### Phase 6: CI/CD要件

**目的**: CI/CDパイプラインの原則をエージェントに反映

**主要原則**:

#### 1. GitHub Actionsワークフロー
- ci.yml: 品質ゲート（型チェック、Lint、テスト、ビルド）
- deploy.yml: 自動デプロイ（Railway統合）
- 再利用可能ワークフローパターン

#### 2. 品質ゲート
- 型チェック（tsc --noEmit）
- Lint（ESLint）
- テスト（Vitest）
- ビルド（Next.js build）

#### 3. 自動デプロイ
- Railway統合
- Discord通知
- ヘルスチェック

**エージェント設計時の考慮点**:
- [ ] CI/CD関連エージェントは品質ゲートを考慮しているか？
- [ ] デプロイ関連エージェントは通知要件（Discord等）を満たしているか？
- [ ] ヘルスチェックが考慮されているか？

**リソース**: `resources/cicd-requirements.md`

## ベストプラクティス

### すべきこと

1. **アーキテクチャ準拠**:
   - 必ず master_system_design.md を参照
   - プロジェクト構造に準拠したファイル配置

2. **原則の適用**:
   - データベース、API、テスト、デプロイの原則を反映
   - エージェント設計時のチェックリスト活用

3. **一貫性の維持**:
   - プロジェクト全体で一貫した設計
   - ベストプラクティスの徹底

### 避けるべきこと

1. **アーキテクチャ違反**:
   - ❌ 逆方向の依存関係
   - ✅ 外から内への単方向依存

2. **原則の無視**:
   - ❌ トランザクション境界の未定義
   - ✅ 明確なトランザクション管理

## トラブルシューティング

### 問題1: 依存関係違反

**症状**: ESLintエラー

**原因**: アーキテクチャ原則違反

**解決策**:
1. 依存関係の方向性を確認
2. shared/infrastructureの活用
3. 機能間の直接依存を排除

### 問題2: テスト戦略が不明確

**症状**: テストが不十分

**原因**: テストピラミッドの未適用

**解決策**:
1. テストピラミッドを確認
2. ユニットテスト、統合テスト、E2Eテストを適切に配分
3. カバレッジ目標を設定

## 関連スキル

- **agent-architecture-patterns** (`.claude/skills/agent-architecture-patterns/SKILL.md`): アーキテクチャパターン
- **agent-structure-design** (`.claude/skills/agent-structure-design/SKILL.md`): 構造設計
- **agent-quality-standards** (`.claude/skills/agent-quality-standards/SKILL.md`): 品質基準

## 詳細リファレンス

詳細な実装ガイドとツールは以下を参照:
- ハイブリッドアーキテクチャガイド (`resources/hybrid-architecture-guide.md`)

## コマンドリファレンス

このスキルで使用可能なリソース、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# ハイブリッドアーキテクチャガイドを読み取る
cat .claude/skills/project-architecture-integration/resources/hybrid-architecture-guide.md
```

### プロジェクト設計仕様書の参照

```bash
# マスターシステム設計仕様書を読み取る
cat docs/00-requirements/master_system_design.md

# 特定セクションの抽出（例: アーキテクチャ設計詳細）
grep -A 50 "アーキテクチャ設計詳細" docs/00-requirements/master_system_design.md
```

### 他のスキルのスクリプトを活用

```bash
# エージェント構造検証
node .claude/skills/agent-structure-design/scripts/validate-structure.mjs <agent_file.md>

# アーキテクチャパターン検証
node .claude/skills/agent-architecture-patterns/scripts/validate-architecture.mjs <agent_file.md>

# ドキュメント構造分析
node .claude/skills/documentation-architecture/scripts/analyze-structure.mjs <doc_directory>

# 循環依存チェック
node .claude/skills/agent-dependency-design/scripts/check-circular-deps.mjs
```

## メトリクス

### アーキテクチャ準拠率

**目標**: 100%（すべてのエージェントがアーキテクチャに準拠）

### 原則適用率

**評価基準**:
- データベース原則: 適用すべきエージェントで100%
- API設計原則: 適用すべきエージェントで100%
- テスト戦略: 適用すべきエージェントで100%

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-24 | 初版作成 - プロジェクト固有設計原則フレームワーク |

## 使用上の注意

### このスキルが得意なこと
- プロジェクトアーキテクチャ原則の適用
- データベース、API、テスト、デプロイの原則統合
- アーキテクチャ準拠の検証

### このスキルが行わないこと
- エージェントの実際の実装
- 具体的なコード生成
- プロジェクト固有のビジネスロジック実装

### 推奨される使用フロー
1. master_system_design.md を参照
2. エージェントの役割に応じた原則を適用
3. アーキテクチャ準拠を検証

### 参考文献
- **master_system_design.md**: プロジェクトの設計仕様書（必須参照）
  - セクション2: 非機能要件
  - セクション4: ディレクトリ構造
  - セクション5: アーキテクチャ設計詳細
  - セクション5.2: データベース設計原則
  - セクション7: エラーハンドリング仕様
  - セクション8: REST API設計原則
  - セクション12: デプロイメント
