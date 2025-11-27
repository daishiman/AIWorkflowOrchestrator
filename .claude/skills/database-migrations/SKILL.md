---
name: database-migrations
description: |
    スコット・アンブラーの『Refactoring Databases』に基づく、安全で可逆的なデータベースマイグレーション管理スキル。
    Drizzle Kitを使用したスキーマ変更の計画、マイグレーション生成、本番適用、
    ロールバック戦略、および移行期間（Transition Period）を含む包括的なワークフローを提供します。
    専門分野:
    - 進化的スキーマ設計: 段階的変更による安全なスキーマ進化
    - Up/Downマイグレーション: すべての変更は可逆的であること
    - 移行期間パターン: 新旧スキーマの共存による段階的移行
    - ゼロダウンタイム: オンラインマイグレーション戦略
    - ロールバック設計: 問題発生時の安全な復旧
    使用タイミング:
    - スキーマを変更する時
    - マイグレーションを生成・適用する時
    - 破壊的変更に移行期間を設ける時
    - 本番環境にデプロイする時
    - 問題発生時にロールバックする時
    Use proactively when modifying database schemas,
    generating migrations, designing transition periods,
    or planning production deployments.

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/database-migrations/resources/drizzle-kit-commands.md`: Drizzle Kitコマンドリファレンスと使用方法
  - `.claude/skills/database-migrations/resources/migration-strategies.md`: マイグレーション戦略と安全な実行計画
  - `.claude/skills/database-migrations/resources/rollback-procedures.md`: ロールバック手順と復旧戦略
  - `.claude/skills/database-migrations/resources/schema-change-patterns.md`: スキーマ変更パターンとリスク評価
  - `.claude/skills/database-migrations/resources/transition-period-patterns.md`: 新旧スキーマ共存による段階的移行パターン
  - `.claude/skills/database-migrations/resources/zero-downtime-patterns.md`: ゼロダウンタイムマイグレーション実現手法
  - `.claude/skills/database-migrations/templates/migration-checklist.md`: マイグレーション実行前チェックリスト
  - `.claude/skills/database-migrations/templates/migration-plan-template.md`: マイグレーション計画書作成テンプレート
  - `.claude/skills/database-migrations/scripts/check-migration-safety.mjs`: マイグレーション安全性検証スクリプト
  - `.claude/skills/database-migrations/scripts/generate-rollback.mjs`: ロールバックSQL自動生成スクリプト

version: 1.1.0
---


# Database Migrations

## 概要

このスキルは、Drizzle Kitを使用したデータベースマイグレーション管理のベストプラクティスを提供します。
安全なスキーマ変更、効率的なマイグレーション生成、そして信頼性の高い本番適用のための
実践的なガイドラインを提供します。

**主要な価値**:
- スキーマ変更の追跡と管理
- 安全なマイグレーション適用
- 問題発生時のロールバック
- チーム間でのスキーマ同期

**対象ユーザー**:
- `@repo-dev`エージェント
- データベーススキーマを管理する開発者
- 本番デプロイを担当するDevOps

## リソース構造

```
database-migrations/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── drizzle-kit-commands.md                # Drizzle Kitコマンド
│   ├── migration-strategies.md                 # マイグレーション戦略
│   ├── schema-change-patterns.md              # スキーマ変更パターン
│   ├── rollback-procedures.md                 # ロールバック手順
│   ├── transition-period-patterns.md          # 移行期間パターン（新旧スキーマ共存）
│   └── zero-downtime-patterns.md              # ゼロダウンタイムマイグレーション
├── scripts/
│   ├── check-migration-safety.mjs             # 安全性チェック
│   └── generate-rollback.mjs                  # ロールバックSQL生成
└── templates/
    ├── migration-plan-template.md             # 計画テンプレート
    └── migration-checklist.md                 # マイグレーションチェックリスト
```

## コマンドリファレンス

### リソース読み取り

```bash
# Drizzle Kitコマンド
cat .claude/skills/database-migrations/resources/drizzle-kit-commands.md

# マイグレーション戦略
cat .claude/skills/database-migrations/resources/migration-strategies.md

# スキーマ変更パターン
cat .claude/skills/database-migrations/resources/schema-change-patterns.md

# ロールバック手順
cat .claude/skills/database-migrations/resources/rollback-procedures.md

# 移行期間パターン（新旧スキーマ共存）
cat .claude/skills/database-migrations/resources/transition-period-patterns.md

# ゼロダウンタイムマイグレーション
cat .claude/skills/database-migrations/resources/zero-downtime-patterns.md
```

### スクリプト実行

```bash
# マイグレーション安全性チェック
node .claude/skills/database-migrations/scripts/check-migration-safety.mjs <migration.sql>

# ロールバックSQL自動生成
node .claude/skills/database-migrations/scripts/generate-rollback.mjs <migration.sql>
```

### テンプレート参照

```bash
# 計画テンプレート
cat .claude/skills/database-migrations/templates/migration-plan-template.md

# マイグレーションチェックリスト
cat .claude/skills/database-migrations/templates/migration-checklist.md
```

## いつ使うか

### シナリオ1: 新規カラム追加
**状況**: 既存テーブルに新しいカラムを追加

**適用条件**:
- [ ] 新しい属性をデータベースに追加
- [ ] 既存データへの影響を考慮
- [ ] デフォルト値の設定が必要

**期待される成果**: 安全なカラム追加マイグレーション

### シナリオ2: 型変更
**状況**: 既存カラムの型を変更

**適用条件**:
- [ ] カラムのデータ型を変更
- [ ] 既存データの変換が必要
- [ ] ダウンタイムの考慮

**期待される成果**: データを保持した型変更

### シナリオ3: テーブル作成・削除
**状況**: 新規テーブルの作成または不要テーブルの削除

**適用条件**:
- [ ] 新しいエンティティの追加
- [ ] リレーションの設定
- [ ] インデックスの計画

**期待される成果**: 正しく構成されたテーブル

## ワークフロー

### Phase 1: 変更計画

**目的**: スキーマ変更の影響を分析し計画を立てる

**ステップ**:
1. **変更内容の明確化**:
   - 何を変更するか
   - なぜ変更するか
   - 影響範囲は何か

2. **リスク評価**:
   - データ損失の可能性
   - ダウンタイムの必要性
   - ロールバック可能性

3. **実行計画**:
   - マイグレーション順序
   - 適用タイミング
   - 検証方法

**判断基準**:
- [ ] 変更の目的は明確か？
- [ ] リスクは評価されたか？
- [ ] ロールバック計画はあるか？

**リソース**: `resources/migration-strategies.md`

### Phase 2: マイグレーション生成

**目的**: Drizzle Kitでマイグレーションを生成

**ステップ**:
1. **スキーマ変更**:
   - TypeScriptスキーマファイルを編集
   - 型定義を更新

2. **マイグレーション生成**:
   ```bash
   pnpm drizzle-kit generate
   ```

3. **生成結果の確認**:
   - SQLの内容を確認
   - 意図した変更か検証

**判断基準**:
- [ ] 生成されたSQLは正しいか？
- [ ] 破壊的変更はないか？
- [ ] データ移行が必要か？

**リソース**: `resources/drizzle-kit-commands.md`

### Phase 3: ローカルテスト

**目的**: 本番適用前にローカルで検証

**ステップ**:
1. **マイグレーション適用**:
   ```bash
   pnpm drizzle-kit migrate
   ```

2. **動作確認**:
   - アプリケーションの動作テスト
   - データの整合性確認

3. **ロールバックテスト**:
   - ロールバック手順の確認
   - 復旧可能性の検証

**判断基準**:
- [ ] マイグレーションは成功したか？
- [ ] アプリケーションは正常動作するか？
- [ ] ロールバック可能か？

### Phase 4: 本番適用

**目的**: 本番環境に安全にマイグレーションを適用

**ステップ**:
1. **事前準備**:
   - バックアップの作成
   - メンテナンスウィンドウの確保

2. **適用**:
   - マイグレーション実行
   - 監視とログ確認

3. **検証**:
   - アプリケーション動作確認
   - データ整合性確認

**判断基準**:
- [ ] バックアップは作成されたか？
- [ ] マイグレーションは成功したか？
- [ ] 本番動作は正常か？

**リソース**: `resources/rollback-procedures.md`

## 核心概念

### Drizzle Kitワークフロー

```
1. スキーマ編集 (TypeScript)
      ↓
2. drizzle-kit generate
      ↓
3. マイグレーションファイル生成
      ↓
4. レビュー & テスト
      ↓
5. drizzle-kit migrate
      ↓
6. 本番適用
```

### マイグレーションの種類

| 種類 | リスク | 例 |
|------|--------|-----|
| 追加のみ | 低 | カラム追加、テーブル作成 |
| 制約変更 | 中 | NOT NULL追加、インデックス |
| 型変更 | 高 | カラム型変更、リネーム |
| 削除 | 高 | カラム削除、テーブル削除 |

### 安全な変更パターン

1. **追加 → デプロイ → 移行 → 削除**
   - 新カラム追加（nullable）
   - アプリケーションデプロイ
   - データ移行
   - 旧カラム削除

2. **段階的移行**
   - 複数のマイグレーションに分割
   - 各段階で検証

## ベストプラクティス

### すべきこと

1. **マイグレーションの小分け**:
   - 一度に大きな変更をしない
   - 独立した変更は別々のマイグレーション

2. **本番適用前のテスト**:
   - ローカル/ステージングで検証
   - データ量を考慮したテスト

3. **バックアップの確保**:
   - 適用前に必ずバックアップ
   - ロールバック手順の確認

### 避けるべきこと

1. **破壊的変更の直接適用**:
   - ❌ 直接カラム削除
   - ✅ 段階的な移行

2. **大きなマイグレーション**:
   - ❌ 多数の変更を一度に
   - ✅ 小さく分割

3. **テストなしの本番適用**:
   - ❌ 直接本番に適用
   - ✅ ステージングで検証

## トラブルシューティング

### 問題1: マイグレーション失敗

**症状**: マイグレーション適用時にエラー

**原因**:
- 制約違反
- 既存データとの不整合
- 構文エラー

**解決策**:
1. エラーメッセージを確認
2. ロールバックを実行
3. マイグレーションを修正
4. 再度適用

### 問題2: データ損失

**症状**: マイグレーション後にデータが失われた

**原因**:
- 不適切なカラム削除
- 型変換の失敗
- CASCADE削除

**解決策**:
1. バックアップから復旧
2. マイグレーションを修正
3. データ移行ステップを追加

### 問題3: パフォーマンス低下

**症状**: マイグレーション後にパフォーマンスが低下

**原因**:
- インデックスの欠如
- 不適切なインデックス
- テーブルロック

**解決策**:
1. EXPLAIN ANALYZEで確認
2. 必要なインデックスを追加
3. CONCURRENTLY オプションを使用

## 関連スキル

- **orm-best-practices** (`.claude/skills/orm-best-practices/SKILL.md`): ORM活用
- **repository-pattern** (`.claude/skills/repository-pattern/SKILL.md`): Repositoryパターン
- **query-optimization** (`.claude/skills/query-optimization/SKILL.md`): クエリ最適化
- **transaction-management** (`.claude/skills/transaction-management/SKILL.md`): トランザクション

## メトリクス

### マイグレーション健全性指標

| 指標 | 目標値 | 警告値 |
|------|--------|--------|
| マイグレーション成功率 | 100% | < 95% |
| 平均適用時間 | < 5分 | > 30分 |
| ロールバック発生率 | < 5% | > 10% |

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-26 | 初版作成 - マイグレーション管理フレームワーク |

## 参考文献

- **Drizzle Kit Documentation**
  - https://orm.drizzle.team/kit-docs

- **PostgreSQL ALTER TABLE**
  - https://www.postgresql.org/docs/current/sql-altertable.html
