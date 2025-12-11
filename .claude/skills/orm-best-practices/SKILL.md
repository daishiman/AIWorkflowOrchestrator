---
name: orm-best-practices
description: |
  Drizzle ORMを活用したデータベース操作のベストプラクティスを提供するスキル。
  型安全なスキーマ定義、クエリビルダーの効果的な使用、
  パフォーマンスを考慮した実装パターンを提供します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/orm-best-practices/resources/performance-patterns.md`: パフォーマンスパターン
  - `.claude/skills/orm-best-practices/resources/query-builder-patterns.md`: クエリビルダーパターン
  - `.claude/skills/orm-best-practices/resources/relation-mapping.md`: リレーション設定とマッピング
  - `.claude/skills/orm-best-practices/resources/schema-definition.md`: スキーマ定義パターン
  - `.claude/skills/orm-best-practices/scripts/validate-schema.mjs`: Drizzle ORMスキーマ定義の型安全性と整合性を検証
  - `.claude/skills/orm-best-practices/templates/schema-template.md`: Drizzle ORMテーブルスキーマ定義のTypeScriptテンプレート（型定義、リレーション、インデックス含む）

  専門分野:
  - スキーマ定義: 型安全なテーブル定義とリレーション設定
  - クエリビルダー: 効率的なクエリ構築とJOIN操作
  - マッピング: データベースレコードとドメインエンティティの変換
  - パフォーマンス: N+1回避、バッチ操作、接続プール管理
  - 型安全性: TypeScript統合と型推論の活用

  使用タイミング:
  - Drizzle ORMでスキーマを定義する時
  - 複雑なクエリを構築する時
  - エンティティマッピングを設計する時
  - パフォーマンスを最適化する時

  Use proactively when designing database schemas,
version: 1.0.0
---

# ORM Best Practices

## 概要

このスキルは、Drizzle ORM を使用したデータベース操作のベストプラクティスを提供します。
型安全性を最大限活用し、パフォーマンスと保守性を両立するための
実践的なパターンとガイドラインを提供します。

**主要な価値**:

- TypeScript との完全な型統合
- SQL に近い直感的なクエリ構文
- コンパイル時の型チェックによるバグ防止
- 効率的なクエリ生成とパフォーマンス

**対象ユーザー**:

- `@repo-dev`エージェント
- Drizzle ORM を使用する開発者
- データアクセス層を設計するアーキテクト

## リソース構造

```
orm-best-practices/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── schema-definition.md                   # スキーマ定義パターン
│   ├── query-builder-patterns.md              # クエリビルダー活用
│   ├── relation-mapping.md                    # リレーション設定
│   └── performance-patterns.md                # パフォーマンスパターン
├── scripts/
│   └── validate-schema.mjs                    # スキーマ検証
└── templates/
    └── schema-template.md                      # スキーマテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# スキーマ定義パターン
cat .claude/skills/orm-best-practices/resources/schema-definition.md

# クエリビルダー活用
cat .claude/skills/orm-best-practices/resources/query-builder-patterns.md

# リレーション設定
cat .claude/skills/orm-best-practices/resources/relation-mapping.md

# パフォーマンスパターン
cat .claude/skills/orm-best-practices/resources/performance-patterns.md
```

### テンプレート参照

```bash
# スキーマテンプレート
cat .claude/skills/orm-best-practices/templates/schema-template.md
```

## いつ使うか

### シナリオ 1: 新規テーブル定義

**状況**: 新しいエンティティのためのテーブルスキーマを定義

**適用条件**:

- [ ] 新しいテーブルを追加する
- [ ] 型安全なスキーマが必要
- [ ] リレーションの設定が必要

**期待される成果**: 型安全で保守性の高いスキーマ定義

### シナリオ 2: 複雑なクエリ実装

**状況**: JOIN や集計を含む複雑なクエリを構築

**適用条件**:

- [ ] 複数テーブルにまたがるクエリ
- [ ] 集計やグループ化が必要
- [ ] サブクエリを使用

**期待される成果**: 効率的で型安全なクエリ実装

### シナリオ 3: パフォーマンス改善

**状況**: データアクセス層のパフォーマンスを最適化

**適用条件**:

- [ ] レスポンスタイムが遅い
- [ ] N+1 問題が発生している
- [ ] 大量データの処理が必要

**期待される成果**: 最適化されたデータアクセスパターン

## ワークフロー

### Phase 1: スキーマ設計

**目的**: 型安全で効率的なスキーマを定義

**ステップ**:

1. **エンティティ分析**:
   - ドメインモデルからテーブル構造を導出
   - カラム型と nullability を決定

2. **リレーション設定**:
   - 外部キー制約の定義
   - リレーションヘルパーの設定

3. **インデックス計画**:
   - クエリパターンに基づくインデックス
   - 複合インデックスの検討

**判断基準**:

- [ ] すべてのカラムに適切な型があるか？
- [ ] nullability は正しく設定されているか？
- [ ] 必要なインデックスが定義されているか？

**リソース**: `resources/schema-definition.md`

### Phase 2: クエリ実装

**目的**: 効率的で保守性の高いクエリを実装

**ステップ**:

1. **基本クエリ構築**:
   - select, insert, update, delete の基本操作
   - where 条件の効果的な使用

2. **JOIN 操作**:
   - 適切な JOIN 種類の選択
   - リレーションを使用した簡潔な記述

3. **高度なクエリ**:
   - サブクエリ、CTE、UNION
   - 集計とグループ化

**判断基準**:

- [ ] 型推論が正しく動作しているか？
- [ ] 不要なカラムを取得していないか？
- [ ] JOIN は効率的か？

**リソース**: `resources/query-builder-patterns.md`

### Phase 3: マッピング実装

**目的**: ドメインエンティティと DB レコードの変換を実装

**ステップ**:

1. **変換関数作成**:
   - toEntity: DB レコード → ドメインエンティティ
   - toRecord: ドメインエンティティ → DB レコード

2. **リレーションマッピング**:
   - 関連エンティティの含め方
   - 遅延ロードの検討

**判断基準**:

- [ ] 変換は双方向で一貫しているか？
- [ ] null の処理は適切か？

**リソース**: `resources/relation-mapping.md`

### Phase 4: パフォーマンス最適化

**目的**: データアクセスのパフォーマンスを最適化

**ステップ**:

1. **N+1 問題対策**:
   - JOIN またはバッチフェッチの適用
   - クエリ数の監視

2. **接続プール最適化**:
   - プールサイズの調整
   - 接続タイムアウトの設定

3. **クエリ最適化**:
   - 実行計画の確認
   - インデックスの活用

**判断基準**:

- [ ] N+1 問題は解消されたか？
- [ ] 接続プールは適切に設定されているか？
- [ ] クエリは効率的か？

**リソース**: `resources/performance-patterns.md`

## 核心概念

### Drizzle ORM の特徴

| 特徴           | 説明                       | メリット               |
| -------------- | -------------------------- | ---------------------- |
| 型安全性       | TypeScript との完全統合    | コンパイル時エラー検出 |
| SQL ライク構文 | 馴染みやすいクエリ構文     | 学習コスト低           |
| スキーマ定義   | コードファーストアプローチ | 一元管理               |
| 軽量           | 最小限の抽象化             | 高パフォーマンス       |

### スキーマ定義の原則

1. **明示的な型定義**: 曖昧さを排除
2. **適切な nullability**: 必須/オプショナルを正確に
3. **リレーション明示**: 外部キーとリレーションヘルパーの両方
4. **インデックス計画**: クエリパターンに基づく

### クエリ構築の原則

1. **必要なカラムのみ選択**: SELECT \*を避ける
2. **適切な JOIN**: 必要な場合のみ使用
3. **条件の効率化**: インデックスを活用
4. **ページネーション**: 大量データは分割取得

## ベストプラクティス

### すべきこと

1. **型を活用**:
   - InferSelectType, InferInsertType を使用
   - カスタム型の定義

2. **prepared statements を使用**:
   - 頻繁なクエリは prepare で最適化
   - SQL インジェクション防止

3. **リレーションを活用**:
   - relations ヘルパーで簡潔な記述
   - 型安全な JOIN

### 避けるべきこと

1. **生 SQL 濫用**:
   - ❌ 型安全性を失う sql``の多用
   - ✅ ビルダーメソッドを優先

2. **SELECT \***:
   - ❌ すべてのカラムを取得
   - ✅ 必要なカラムを明示

3. **N+1 パターン**:
   - ❌ ループ内での個別クエリ
   - ✅ JOIN またはバッチフェッチ

## トラブルシューティング

### 問題 1: 型推論が機能しない

**症状**: クエリ結果の型が any になる

**原因**:

- スキーマの型定義が不完全
- 複雑な JOIN で型が失われる

**解決策**:

1. スキーマで明示的な型定義
2. 結果型の手動指定
3. as const アサーションの使用

### 問題 2: パフォーマンス低下

**症状**: クエリが遅い

**原因**:

- N+1 問題
- インデックス不足
- 大量データの一括取得

**解決策**:

1. JOIN またはバッチフェッチ
2. EXPLAIN ANALYZE でインデックス確認
3. ページネーション実装

### 問題 3: マイグレーション失敗

**症状**: スキーマ変更が適用できない

**原因**:

- データ制約違反
- 外部キー依存
- 型変換の問題

**解決策**:

1. 段階的な変更
2. デフォルト値の設定
3. データマイグレーションの分離

## 関連スキル

- **repository-pattern** (`.claude/skills/repository-pattern/SKILL.md`): Repository パターン
- **query-optimization** (`.claude/skills/query-optimization/SKILL.md`): クエリ最適化
- **transaction-management** (`.claude/skills/transaction-management/SKILL.md`): トランザクション
- **database-migrations** (`.claude/skills/database-migrations/SKILL.md`): マイグレーション

## メトリクス

### データアクセス健全性指標

| 指標             | 目標値 | 警告値  |
| ---------------- | ------ | ------- |
| 平均クエリ時間   | < 50ms | > 200ms |
| N+1 発生率       | 0%     | > 0%    |
| 接続プール使用率 | < 80%  | > 90%   |

## 変更履歴

| バージョン | 日付       | 変更内容                                  |
| ---------- | ---------- | ----------------------------------------- |
| 1.0.0      | 2025-11-26 | 初版作成 - Drizzle ORM ベストプラクティス |

## 参考文献

- **Drizzle ORM Documentation**
  - https://orm.drizzle.team/docs

- **『High-Performance Java Persistence』** Vlad Mihalcea 著
  - ORM 一般のパフォーマンスパターン
