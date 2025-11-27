# ベクトルインデックス戦略

## インデックスタイプの比較

### 概要

| 特性 | インデックスなし | IVFFlat | HNSW |
|------|-----------------|---------|------|
| 精度 | 100% | 中（調整可能） | 高（調整可能） |
| 検索速度 | O(n) | O(√n) | O(log n) |
| 構築速度 | - | 速い | 遅い |
| メモリ使用量 | 低 | 低 | 高 |
| 更新コスト | 低 | 中 | 中 |

### 選択ガイド

```yaml
IVFFlatを選ぶ場合:
  - データ量: 10万〜100万行
  - 構築時間: 短くしたい
  - メモリ: 制約がある
  - 精度: 90%程度で十分

HNSWを選ぶ場合:
  - データ量: 任意（100万行以上でも）
  - 精度: 高精度が必要（95%+）
  - 検索速度: 最速を求める
  - メモリ: 余裕がある

インデックスなしで良い場合:
  - データ量: 1万行以下
  - 更新頻度: 非常に高い
  - 精度: 100%必須
```

## IVFFlat インデックス

### 仕組み

```
データ全体
    │
    ├── クラスタ1（重心1）
    │   ├── ベクトルA
    │   └── ベクトルB
    ├── クラスタ2（重心2）
    │   ├── ベクトルC
    │   └── ベクトルD
    └── クラスタ3（重心3）
        └── ベクトルE

検索時: 近い重心のクラスタのみスキャン
```

### 作成

```sql
-- IVFFlatインデックス作成
CREATE INDEX idx_documents_embedding_ivfflat
ON documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- オペレータクラス
-- vector_cosine_ops: コサイン距離
-- vector_l2_ops: L2距離
-- vector_ip_ops: 内積
```

### パラメータ

```yaml
lists:
  意味: クラスタ数
  推奨値: sqrt(行数)
  例:
    - 10万行 → lists = 316
    - 100万行 → lists = 1000
  トレードオフ:
    - 大きい → 構築遅い、検索速い、精度低い
    - 小さい → 構築速い、検索遅い、精度高い

probes（検索時）:
  意味: 検索するクラスタ数
  デフォルト: 1
  推奨: lists / 10 〜 lists
  設定方法:
    SET ivfflat.probes = 10;
```

### 精度と速度のトレードオフ

```sql
-- 低精度・高速
SET ivfflat.probes = 1;

-- バランス
SET ivfflat.probes = 10;

-- 高精度・低速
SET ivfflat.probes = 50;
```

## HNSW インデックス

### 仕組み

```
Layer 2（最上位）:  A ─────────────── Z
                    │                 │
Layer 1:           A ──── M ──── R ── Z
                   │  ╲   │   ╱  │    │
Layer 0（最下位）: A─B─C─D─E─F─G─H...Z

検索: 上位レイヤーで大まかに探索 → 下位で精密に
```

### 作成

```sql
-- HNSWインデックス作成（推奨設定）
CREATE INDEX idx_documents_embedding_hnsw
ON documents
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 高精度設定
CREATE INDEX idx_documents_embedding_hnsw_accurate
ON documents
USING hnsw (embedding vector_cosine_ops)
WITH (m = 32, ef_construction = 128);

-- 低メモリ設定
CREATE INDEX idx_documents_embedding_hnsw_compact
ON documents
USING hnsw (embedding vector_cosine_ops)
WITH (m = 8, ef_construction = 32);
```

### パラメータ

```yaml
m（構築時）:
  意味: 各ノードの最大接続数
  デフォルト: 16
  範囲: 2-100
  トレードオフ:
    - 大きい → 高精度、高メモリ、構築遅い
    - 小さい → 低精度、低メモリ、構築速い
  推奨: 16（一般）、32（高精度）、8（低メモリ）

ef_construction（構築時）:
  意味: 構築時の探索幅
  デフォルト: 64
  範囲: 4-1000
  推奨: m * 4 程度

ef_search（検索時）:
  意味: 検索時の探索幅
  デフォルト: 40
  設定方法:
    SET hnsw.ef_search = 100;
  トレードオフ:
    - 大きい → 高精度、遅い
    - 小さい → 低精度、速い
```

### 精度と速度の調整

```sql
-- 検索時のef_searchを動的に設定

-- 高速モード（ユーザー向け）
SET hnsw.ef_search = 40;

-- バランスモード
SET hnsw.ef_search = 100;

-- 高精度モード（バッチ処理向け）
SET hnsw.ef_search = 400;
```

## インデックス管理

### 作成状況の確認

```sql
-- インデックス一覧
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'documents';

-- インデックスサイズ
SELECT
  indexrelname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE relname = 'documents';
```

### オンライン作成（CONCURRENTLY）

```sql
-- ロックを最小化して作成
CREATE INDEX CONCURRENTLY idx_documents_embedding
ON documents
USING hnsw (embedding vector_cosine_ops);
```

### インデックスの再構築

```sql
-- 再構築（データ変更が多い場合）
REINDEX INDEX CONCURRENTLY idx_documents_embedding;
```

## パーティショニングとの組み合わせ

### 日付でパーティション

```sql
-- パーティションテーブル
CREATE TABLE documents (
  id SERIAL,
  content TEXT,
  embedding vector(1536),
  created_at DATE NOT NULL
) PARTITION BY RANGE (created_at);

-- パーティション
CREATE TABLE documents_2024_q1 PARTITION OF documents
  FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE documents_2024_q2 PARTITION OF documents
  FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');

-- 各パーティションにインデックス
CREATE INDEX ON documents_2024_q1 USING hnsw (embedding vector_cosine_ops);
CREATE INDEX ON documents_2024_q2 USING hnsw (embedding vector_cosine_ops);
```

### カテゴリでパーティション

```sql
-- カテゴリ別パーティション
CREATE TABLE documents (
  id SERIAL,
  content TEXT,
  embedding vector(1536),
  category TEXT NOT NULL
) PARTITION BY LIST (category);

CREATE TABLE documents_tech PARTITION OF documents
  FOR VALUES IN ('technical', 'engineering');

CREATE TABLE documents_business PARTITION OF documents
  FOR VALUES IN ('business', 'marketing');
```

## ベンチマーク

### インデックスなし vs IVFFlat vs HNSW

```
データ: 100万ベクトル、1536次元

| メトリクス | なし | IVFFlat | HNSW |
|-----------|------|---------|------|
| 構築時間 | 0s | 2分 | 15分 |
| インデックスサイズ | 0 | 200MB | 800MB |
| 検索時間(Top10) | 2000ms | 50ms | 10ms |
| Recall@10 | 100% | 92% | 98% |
```

## チェックリスト

### インデックス作成前
- [ ] データ量を確認したか？
- [ ] 精度要件を確認したか？
- [ ] メモリ制約を確認したか？
- [ ] 構築時間の余裕があるか？

### インデックス作成後
- [ ] インデックスサイズを確認したか？
- [ ] 検索速度を測定したか？
- [ ] 精度（Recall）を測定したか？
- [ ] 本番と同じ設定でテストしたか？

### 運用時
- [ ] 検索パラメータを調整したか？
- [ ] 定期的な再構築を計画しているか？
- [ ] パフォーマンス監視があるか？
