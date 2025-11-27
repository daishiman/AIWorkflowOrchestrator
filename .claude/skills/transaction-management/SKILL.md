---
name: transaction-management
description: |
  ACID特性を保証するトランザクション設計と実装を専門とするスキル。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/transaction-management/resources/acid-properties.md`: Acid Propertiesリソース
  - `.claude/skills/transaction-management/resources/isolation-levels-detail.md`: Isolation Levels Detailリソース
  - `.claude/skills/transaction-management/resources/isolation-levels.md`: Isolation Levelsリソース
  - `.claude/skills/transaction-management/resources/locking-strategies.md`: Locking Strategiesリソース
  - `.claude/skills/transaction-management/resources/rollback-patterns.md`: Rollback Patternsリソース

  - `.claude/skills/transaction-management/templates/transaction-design-checklist.md`: Transaction Design Checklistテンプレート
  - `.claude/skills/transaction-management/templates/transaction-design-template.md`: Transaction Designテンプレート

  - `.claude/skills/transaction-management/scripts/analyze-transaction.mjs`: Analyze Transactionスクリプト
  - `.claude/skills/transaction-management/scripts/detect-long-transactions.mjs`: Detect Long Transactionsスクリプト

version: 1.0.0
---

# Transaction Management

## 概要

このスキルは、データベーストランザクションの設計と実装に関する知識を提供します。
ACID 特性（Atomicity, Consistency, Isolation, Durability）を保証し、
データの整合性を維持するためのベストプラクティスを提供します。

**主要な価値**:

- 複数の DB 操作を一つの論理単位として実行
- エラー時の自動ロールバックによるデータ整合性保持
- 並行処理時の競合を適切に管理
- デッドロックリスクの最小化

**対象ユーザー**:

- `@repo-dev`エージェント
- トランザクション処理を実装する開発者
- データ整合性を設計するアーキテクト

## リソース構造

```
transaction-management/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── acid-properties.md                     # ACID特性の詳細
│   ├── isolation-levels.md                    # 分離レベルガイド
│   ├── locking-strategies.md                  # ロック戦略
│   └── rollback-patterns.md                   # ロールバックパターン
├── scripts/
│   └── analyze-transaction.mjs                # トランザクション分析
└── templates/
    └── transaction-design-template.md          # 設計テンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# ACID特性の詳細
cat .claude/skills/transaction-management/resources/acid-properties.md

# 分離レベルガイド
cat .claude/skills/transaction-management/resources/isolation-levels.md

# ロック戦略
cat .claude/skills/transaction-management/resources/locking-strategies.md

# ロールバックパターン
cat .claude/skills/transaction-management/resources/rollback-patterns.md
```

### テンプレート参照

```bash
# 設計テンプレート
cat .claude/skills/transaction-management/templates/transaction-design-template.md
```

## いつ使うか

### シナリオ 1: 複数テーブルの更新

**状況**: 関連する複数のテーブルを同時に更新する必要がある

**適用条件**:

- [ ] 2 つ以上のテーブルを更新
- [ ] 一部の更新が失敗した場合、全体を取り消す必要がある
- [ ] データの整合性が重要

**期待される成果**: アトミックな複数テーブル更新

### シナリオ 2: 残高更新操作

**状況**: 金額やカウンターなど、正確性が重要な値の更新

**適用条件**:

- [ ] 並行アクセスの可能性がある
- [ ] 更新の順序が重要
- [ ] 二重更新を防ぐ必要がある

**期待される成果**: 正確で競合のない更新処理

### シナリオ 3: ワークフロー状態遷移

**状況**: 状態遷移と関連操作を一貫して実行

**適用条件**:

- [ ] 状態遷移と付随操作がある
- [ ] 途中失敗時のロールバックが必要
- [ ] 監査ログの記録が必要

**期待される成果**: 一貫した状態遷移処理

## ワークフロー

### Phase 1: トランザクション境界の設計

**目的**: ビジネス操作に基づいた適切な境界を定義

**ステップ**:

1. **ビジネス操作の特定**:

   - 論理的に一つの単位となる操作を特定
   - 「すべて成功」or「すべて失敗」の範囲を定義

2. **境界の決定**:

   - 最小限の範囲に設定
   - 長時間実行を避ける（目安: 5 秒以内）

3. **例外ハンドリングの設計**:
   - ロールバック条件の定義
   - リトライ戦略の検討

**判断基準**:

- [ ] 境界はビジネス操作と一致しているか？
- [ ] 長時間実行になっていないか？
- [ ] 例外発生時の動作が明確か？

**リソース**: `resources/acid-properties.md`

### Phase 2: 分離レベルの選択

**目的**: 要件に適した分離レベルを選択

**ステップ**:

1. **要件の確認**:

   - 一貫性の要求レベル
   - 並行性の要求
   - パフォーマンス要件

2. **分離レベルの選択**:
   | レベル | 一貫性 | 並行性 | 用途 |
   |--------|--------|--------|------|
   | READ COMMITTED | 中 | 高 | 一般的な CRUD |
   | REPEATABLE READ | 高 | 中 | レポート |
   | SERIALIZABLE | 最高 | 低 | 金融処理 |

**判断基準**:

- [ ] 必要な一貫性レベルを満たすか？
- [ ] パフォーマンス要件を満たすか？

**リソース**: `resources/isolation-levels.md`

### Phase 3: ロック戦略の決定

**目的**: デッドロックを避けながら必要な整合性を確保

**ステップ**:

1. **ロック種類の選択**:

   - **楽観的ロック**: バージョンカラムによる競合検出
   - **悲観的ロック**: SELECT FOR UPDATE による排他制御

2. **デッドロック対策**:
   - ロック取得順序の統一
   - タイムアウトの設定
   - リトライロジック

**判断基準**:

- [ ] 競合頻度に適したロック方式か？
- [ ] デッドロックリスクが考慮されているか？

**リソース**: `resources/locking-strategies.md`

### Phase 4: 実装とテスト

**目的**: 設計に基づいた実装と検証

**ステップ**:

1. **実装**:

   - トランザクション境界の実装
   - エラーハンドリングの実装
   - ロールバック処理の実装

2. **テスト**:
   - 正常系テスト（コミット）
   - 異常系テスト（ロールバック）
   - 並行実行テスト

**判断基準**:

- [ ] 正常系でコミットされるか？
- [ ] 異常時にロールバックされるか？
- [ ] 並行実行で問題がないか？

**リソース**: `resources/rollback-patterns.md`

## 核心概念

### ACID 特性

| 特性                  | 説明               | 実現方法              |
| --------------------- | ------------------ | --------------------- |
| Atomicity（原子性）   | 全て成功か全て失敗 | トランザクション      |
| Consistency（一貫性） | 制約を常に満たす   | 制約、バリデーション  |
| Isolation（分離性）   | 並行実行の独立性   | 分離レベル            |
| Durability（永続性）  | コミット後の永続化 | WAL、レプリケーション |

### トランザクション境界の原則

1. **最小範囲**: 必要最小限の操作のみ含める
2. **短時間**: 5 秒以上の長時間実行を避ける
3. **外部呼び出し回避**: トランザクション内で外部 API を呼ばない
4. **ネスト最小化**: ネストは 2 レベルまで

### 分離レベル選択ガイド

```
一貫性要件を確認
    │
    ├─ 厳格な一貫性が必要
    │   └─ SERIALIZABLE
    │
    ├─ 同一トランザクション内で再読み込みが必要
    │   └─ REPEATABLE READ
    │
    └─ 一般的なCRUD
        └─ READ COMMITTED（デフォルト）
```

## ベストプラクティス

### すべきこと

1. **楽観的ロックを優先**:

   - バージョンカラムで競合検出
   - 競合時にリトライ

2. **トランザクションを短く**:

   - 長時間のロック保持を避ける
   - バッチ処理は分割

3. **エラーハンドリングを明確に**:
   - どの例外でロールバックするか明示
   - リトライ可能なエラーの識別

### 避けるべきこと

1. **トランザクション内での外部呼び出し**:

   - ❌ API 呼び出し、メール送信
   - ✅ トランザクション後に実行

2. **長時間トランザクション**:

   - ❌ 5 秒以上の処理
   - ✅ バッチ分割、非同期処理

3. **過度な悲観的ロック**:
   - ❌ すべてで SELECT FOR UPDATE
   - ✅ 必要な場合のみ使用

## トラブルシューティング

### 問題 1: デッドロック

**症状**: トランザクションが相互にロック待ち

**原因**:

- 異なる順序でのリソースアクセス
- 長時間のロック保持

**解決策**:

1. ロック取得順序を統一
2. トランザクションを短く
3. タイムアウトとリトライを実装

### 問題 2: ロストアップデート

**症状**: 更新が失われる

**原因**:

- 適切なロックがない
- read-modify-write 競合

**解決策**:

1. 楽観的ロック（バージョンチェック）
2. 悲観的ロック（SELECT FOR UPDATE）

### 問題 3: ロールバック漏れ

**症状**: エラー後もデータが部分的に更新

**原因**:

- 例外ハンドリングの漏れ
- 明示的ロールバックの欠如

**解決策**:

1. try-catch でロールバック
2. フレームワークの自動ロールバック活用

## 関連スキル

- **repository-pattern** (`.claude/skills/repository-pattern/SKILL.md`): Repository パターン
- **query-optimization** (`.claude/skills/query-optimization/SKILL.md`): クエリ最適化
- **orm-best-practices** (`.claude/skills/orm-best-practices/SKILL.md`): ORM 活用
- **database-migrations** (`.claude/skills/database-migrations/SKILL.md`): マイグレーション

## メトリクス

### トランザクション健全性指標

| 指標                     | 目標値 | 警告値 |
| ------------------------ | ------ | ------ |
| 平均トランザクション時間 | < 1 秒 | > 5 秒 |
| デッドロック発生率       | 0%     | > 0.1% |
| ロールバック率           | < 5%   | > 10%  |

## 変更履歴

| バージョン | 日付       | 変更内容                                      |
| ---------- | ---------- | --------------------------------------------- |
| 1.0.0      | 2025-11-25 | 初版作成 - トランザクション管理フレームワーク |

## 参考文献

- **『High-Performance Java Persistence』** Vlad Mihalcea 著

  - Chapter 8: Transactions and Concurrency Control
  - Chapter 10: Database Locking

- **PostgreSQL Documentation**
  - Chapter 13: Concurrency Control
