---
name: query-performance-tuning
description: |
  SQLiteクエリパフォーマンス最適化の専門スキル。
  EXPLAIN QUERY PLAN分析、インデックス戦略、クエリリライト、
  実行計画の読み解きを通じて、データベースパフォーマンスを向上させます。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/query-performance-tuning/resources/explain-analyze-guide.md`: EXPLAIN QUERY PLANガイド
  - `.claude/skills/query-performance-tuning/resources/index-strategies.md`: インデックス戦略ガイド
  - `.claude/skills/query-performance-tuning/resources/monitoring-queries.md`: パフォーマンス監視クエリ集
  - `.claude/skills/query-performance-tuning/resources/query-patterns.md`: クエリパターン最適化ガイド
  - `.claude/skills/query-performance-tuning/scripts/analyze-slow-queries.mjs`: 遅いクエリ分析スクリプト
  - `.claude/skills/query-performance-tuning/templates/performance-report-template.md`: パフォーマンスレポート

  専門分野:
  - EXPLAIN QUERY PLAN: 実行計画の分析と解釈
  - インデックス戦略: 適切なインデックス設計と管理
  - クエリリライト: 非効率なクエリの最適化
  - 統計情報: sqlite_masterとPRAGMAの活用
  - ボトルネック特定: パフォーマンス問題の診断

  使用タイミング:
  - クエリが遅いと報告された時
  - インデックスを追加すべきか判断する時
  - 実行計画を分析する時
  - データベース全体のパフォーマンスを改善する時
  - N+1問題を特定・解決する時

  Use proactively when analyzing slow queries,
  designing indexes, or optimizing database performance.
version: 1.0.0
---

# Query Performance Tuning

## 概要

このスキルは、SQLite のクエリパフォーマンスを最適化するための
知識とツールを提供します。EXPLAIN QUERY PLAN の解釈から、
インデックス設計、クエリリライトまでを網羅します。

**主要な価値**:

- 遅いクエリの根本原因を特定
- データ量増加に対応するスケーラブルな設計
- 本番環境のパフォーマンス問題を迅速に解決

**対象ユーザー**:

- `@dba-mgr`エージェント
- バックエンド開発者
- SRE チーム
- パフォーマンスエンジニア

## リソース構造

```
query-performance-tuning/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── explain-analyze-guide.md               # EXPLAIN ANALYZE解説
│   ├── index-strategies.md                    # インデックス戦略
│   ├── query-patterns.md                      # よくあるクエリパターン
│   └── monitoring-queries.md                  # 監視用クエリ集
├── scripts/
│   └── analyze-slow-queries.mjs               # 遅いクエリ分析スクリプト
└── templates/
    └── performance-report-template.md         # パフォーマンスレポート
```

## コマンドリファレンス

### リソース読み取り

```bash
# EXPLAIN QUERY PLANガイド
cat .claude/skills/query-performance-tuning/resources/explain-analyze-guide.md

# インデックス戦略
cat .claude/skills/query-performance-tuning/resources/index-strategies.md

# クエリパターン
cat .claude/skills/query-performance-tuning/resources/query-patterns.md

# 監視用クエリ
cat .claude/skills/query-performance-tuning/resources/monitoring-queries.md
```

### スクリプト実行

```bash
# 遅いクエリ分析
node .claude/skills/query-performance-tuning/scripts/analyze-slow-queries.mjs
```

## いつ使うか

### シナリオ 1: クエリが遅い

**状況**: 特定の API エンドポイントやクエリが遅いと報告された

**適用条件**:

- [ ] 遅いクエリが特定できている
- [ ] 実行計画を取得できる環境がある
- [ ] 本番データまたは類似データがある

**期待される成果**: 最適化されたクエリまたはインデックス追加

### シナリオ 2: インデックス設計

**状況**: 新しいテーブルやクエリにインデックスを設計する

**適用条件**:

- [ ] クエリパターンが明確
- [ ] データ量の見積もりがある
- [ ] 更新頻度が把握できている

**期待される成果**: 適切なインデックス設計

### シナリオ 3: パフォーマンス監視

**状況**: データベース全体のパフォーマンスを把握したい

**適用条件**:

- [ ] pg_stat_statements が有効
- [ ] 監視対象期間が決まっている

**期待される成果**: パフォーマンスレポートと改善提案

## ワークフロー

### Phase 1: 問題の特定

**目的**: パフォーマンス問題の範囲と影響を把握する

**ステップ**:

1. **症状の確認**:
   - レスポンス時間の増加
   - タイムアウトの発生
   - CPU/メモリ使用率の上昇

2. **遅いクエリの特定**:
   ```sql
   -- アプリケーションログから遅いクエリを抽出
   -- または .timer on で各クエリの実行時間を測定
   .timer on
   SELECT * FROM users WHERE email = 'user@example.com';
   ```

**判断基準**:

- [ ] 遅いクエリが特定できたか？
- [ ] 影響範囲が把握できたか？
- [ ] 優先度が決まったか？

**リソース**: `resources/monitoring-queries.md`

### Phase 2: 実行計画の分析

**目的**: クエリが遅い原因を特定する

**ステップ**:

1. **EXPLAIN QUERY PLAN の実行**:

   ```sql
   EXPLAIN QUERY PLAN
   SELECT * FROM users WHERE email = 'user@example.com';
   ```

2. **実行計画の解釈**:
   - SCAN vs SEARCH (インデックス使用)
   - 行数の見積もり
   - 一時テーブル使用

3. **ボトルネックの特定**:
   - フルテーブルスキャン (SCAN TABLE)
   - 非効率な JOIN
   - 不適切なソート (USE TEMP B-TREE)

**判断基準**:

- [ ] ボトルネックが特定できたか？
- [ ] 改善方法が見えているか？
- [ ] 改善の効果が予測できるか？

**リソース**: `resources/explain-analyze-guide.md`

### Phase 3: 最適化の実施

**目的**: パフォーマンスを改善する

**ステップ**:

1. **インデックス追加**:

   ```sql
   -- 単一カラムインデックス
   CREATE INDEX idx_users_email ON users(email);

   -- 複合インデックス
   CREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC);
   ```

2. **クエリリライト**:
   - サブクエリを JOIN に変換
   - 不要なカラムの除去
   - 適切な LIMIT の追加

3. **設定調整**:
   - cache_size (PRAGMA cache_size)
   - page_size (PRAGMA page_size)
   - temp_store (PRAGMA temp_store)

**判断基準**:

- [ ] 改善が測定可能か？
- [ ] 副作用がないか？
- [ ] ロールバック可能か？

**リソース**: `resources/index-strategies.md`, `resources/query-patterns.md`

### Phase 4: 検証

**目的**: 改善効果を確認する

**ステップ**:

1. **再度 EXPLAIN QUERY PLAN**:
   - 実行時間の比較 (.timer on で測定)
   - 実行計画の変化

2. **本番での確認**:
   - レスポンス時間
   - CPU/メモリ使用率

**判断基準**:

- [ ] 目標の改善が達成できたか？
- [ ] 他のクエリに影響がないか？
- [ ] 継続的に監視する体制があるか？

## 核心概念

### EXPLAIN QUERY PLAN 出力の読み方

```
SCAN TABLE users
  ↑
操作種類

SEARCH TABLE users USING INDEX idx_email (email=?)
  ↑                              ↑
インデックス使用            使用されるインデックス
```

| 指標            | 意味                 | 目安           |
| --------------- | -------------------- | -------------- |
| SCAN TABLE      | フルテーブルスキャン | 避けるべき     |
| SEARCH          | インデックス使用     | 望ましい       |
| USE TEMP B-TREE | 一時インデックス     | 回避可能か検討 |
| AUTOMATIC INDEX | 自動作成インデックス | 永続化を検討   |

### スキャン種類

| 種類              | 説明                         | 適切な場合               |
| ----------------- | ---------------------------- | ------------------------ |
| SCAN TABLE        | 全行スキャン                 | 小テーブル、大部分を返す |
| SEARCH (INDEX)    | インデックス使用             | 選択的なクエリ           |
| SEARCH (COVERING) | カバリングインデックス       | SELECT句がインデックス内 |
| USE TEMP B-TREE   | 一時的なソート用インデックス | インデックス追加を検討   |

### インデックスタイプ

| タイプ | 用途           | 例                                          |
| ------ | -------------- | ------------------------------------------- |
| B-tree | 等値、範囲検索 | `WHERE id = 1`, `WHERE date > '2024-01-01'` |

**注**: SQLiteはB-treeインデックスのみをサポート。PostgreSQLのようなHash、GIN、GiSTはありません。

## ベストプラクティス

### すべきこと

1. **本番データで分析する**:
   - 開発環境とは統計情報が異なる
   - 可能な限り本番に近いデータで検証

2. **EXPLAIN QUERY PLAN を使う**:
   - EXPLAIN QUERY PLAN でインデックス使用を確認
   - .timer on で実際の実行時間を測定

3. **インデックスは最小限に**:
   - 不要なインデックスは削除
   - 書き込みパフォーマンスへの影響を考慮

### 避けるべきこと

1. **カーディナリティの低いカラムへのインデックス**:
   - ❌ `CREATE INDEX idx_users_active ON users(is_active);`
   - ✅ 部分インデックス `CREATE INDEX idx_users_active ON users(email) WHERE is_active = 1;`

2. **推測でのインデックス追加**:
   - ❌ 使われないインデックスの乱立
   - ✅ 実際のクエリパターンに基づく設計

3. **SELECT \* の多用**:
   - ❌ 不要なカラムの取得
   - ✅ 必要なカラムのみ指定

## トラブルシューティング

### 問題 1: インデックスが使われない

**症状**: インデックスがあるのに SCAN TABLE

**原因**:

- 統計情報が古い (ANALYZE未実行)
- データ型の不一致
- 関数の適用
- 小さいテーブル (フルスキャンの方が効率的)

**解決策**:

```sql
-- 統計情報の更新
ANALYZE;

-- データ型の確認
-- WHERE email = 123 ではなく WHERE email = '123'

-- クエリプランナーの選択を確認
EXPLAIN QUERY PLAN SELECT * FROM users WHERE email = 'test@example.com';
```

### 問題 2: N+1 問題

**症状**: 多数の小さなクエリが実行される

**原因**:

- ORM の Lazy Loading
- ループ内でのクエリ

**解決策**:

```sql
-- JOINを使用
SELECT u.*, o.*
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
```

### 問題 3: 実行時間の変動

**症状**: 同じクエリでも時間が大きく変動

**原因**:

- ページキャッシュの有無
- 同時実行ロック
- リソース競合

**解決策**:

```sql
-- キャッシュサイズを増やす
PRAGMA cache_size = 10000;

-- WALモードで同時実行性を向上
PRAGMA journal_mode = WAL;
```

## 関連スキル

- **database-migrations** (`.claude/skills/database-migrations/SKILL.md`): マイグレーション管理
- **connection-pooling** (`.claude/skills/connection-pooling/SKILL.md`): 接続プール設定
- **backup-recovery** (`.claude/skills/backup-recovery/SKILL.md`): バックアップ戦略

## メトリクス

### パフォーマンス指標

| 指標               | 目標値  | 警告値  |
| ------------------ | ------- | ------- |
| 平均クエリ時間     | < 100ms | > 500ms |
| P95 レスポンス     | < 500ms | > 2s    |
| スロークエリ率     | < 1%    | > 5%    |
| インデックス使用率 | > 95%   | < 90%   |

## 変更履歴

| バージョン | 日付       | 変更内容                              |
| ---------- | ---------- | ------------------------------------- |
| 1.0.0      | 2025-11-27 | 初版作成 - クエリパフォーマンス最適化 |

## 参考文献

- **『SQLite Performance Tuning』**
- **SQLite Documentation**: https://www.sqlite.org/optoverview.html
- **SQLite Query Planning**: https://www.sqlite.org/queryplanner.html
- **Use The Index, Luke**: https://use-the-index-luke.com/
