---
name: pgvector-optimization
description: |
  pgvectorを使用したベクトル検索最適化の専門スキル。
  Embedding格納、類似度検索、インデックス戦略、
  RAGシステムでのベクトルDB活用を専門とします。

  専門分野:
  - ベクトル格納: Embeddingの効率的な格納と管理
  - 類似度検索: コサイン類似度、L2距離、内積検索
  - インデックス: IVFFlat, HNSWインデックスの選択と最適化
  - RAG統合: LLMアプリケーションでのベクトル検索
  - Drizzle統合: DrizzleでのpgVector操作

  使用タイミング:
  - ベクトル検索機能を実装する時
  - RAGシステムを構築する時
  - 類似度検索のパフォーマンスを改善する時
  - Embeddingの格納戦略を設計する時
  - セマンティック検索を追加する時

  Use proactively when implementing vector search,
  building RAG systems, or optimizing similarity queries.
version: 1.0.0
---

# pgVector Optimization

## 概要

このスキルは、PostgreSQLのpgvector拡張を使用した
ベクトル検索の実装と最適化に関する知識を提供します。
RAGシステムやセマンティック検索の構築に必要な技術を網羅します。

**主要な価値**:
- 高速なベクトル類似度検索
- スケーラブルなEmbedding管理
- LLMアプリケーションとの統合

**対象ユーザー**:
- `@dba-mgr`エージェント
- AIエンジニア
- バックエンド開発者
- MLエンジニア

## リソース構造

```
pgvector-optimization/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── vector-basics.md                       # ベクトル検索の基礎
│   ├── index-strategies.md                    # インデックス戦略
│   └── rag-patterns.md                        # RAG実装パターン
├── scripts/
│   └── benchmark-vector-search.mjs            # ベンチマークスクリプト
└── templates/
    └── vector-schema-template.ts              # スキーマテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# ベクトル検索の基礎
cat .claude/skills/pgvector-optimization/resources/vector-basics.md

# インデックス戦略
cat .claude/skills/pgvector-optimization/resources/index-strategies.md

# RAG実装パターン
cat .claude/skills/pgvector-optimization/resources/rag-patterns.md
```

### スクリプト実行

```bash
# ベンチマーク実行
node .claude/skills/pgvector-optimization/scripts/benchmark-vector-search.mjs
```

## いつ使うか

### シナリオ1: RAGシステム構築
**状況**: ドキュメント検索や質問応答システムを構築する

**適用条件**:
- [ ] Embeddingモデルが選択されている
- [ ] 検索対象ドキュメントがある
- [ ] 検索精度の要件が明確

**期待される成果**: 高速で精度の高いRAG検索

### シナリオ2: セマンティック検索
**状況**: キーワード検索を超えた意味的検索を実装する

**適用条件**:
- [ ] 検索対象データがある
- [ ] Embedding生成のAPIがある
- [ ] 検索UIがある

**期待される成果**: 意味的に類似したコンテンツの検索

### シナリオ3: パフォーマンス最適化
**状況**: ベクトル検索が遅い、または精度が低い

**適用条件**:
- [ ] 現在のパフォーマンス指標がある
- [ ] データ量が把握できている
- [ ] インデックスの状態を確認できる

**期待される成果**: 改善されたレイテンシと精度

## ワークフロー

### Phase 1: セットアップ

**目的**: pgvector環境を準備する

**ステップ**:
1. **拡張のインストール**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. **テーブル作成**:
   ```sql
   CREATE TABLE documents (
     id SERIAL PRIMARY KEY,
     content TEXT,
     embedding vector(1536)  -- OpenAI ada-002の次元数
   );
   ```

**判断基準**:
- [ ] pgvector拡張がインストールされているか？
- [ ] 適切な次元数が選択されているか？
- [ ] ストレージ要件を満たせるか？

**リソース**: `resources/vector-basics.md`

### Phase 2: インデックス設計

**目的**: 検索パフォーマンスを最適化する

**ステップ**:
1. **インデックスタイプの選択**:
   - IVFFlat: 高速構築、中程度の精度
   - HNSW: 高精度、メモリ使用量大

2. **インデックス作成**:
   ```sql
   -- HNSW（推奨）
   CREATE INDEX ON documents
   USING hnsw (embedding vector_cosine_ops)
   WITH (m = 16, ef_construction = 64);
   ```

**判断基準**:
- [ ] データ量に適したインデックスか？
- [ ] 精度要件を満たせるか？
- [ ] 構築時間は許容範囲か？

**リソース**: `resources/index-strategies.md`

### Phase 3: クエリ最適化

**目的**: 類似度検索を高速化する

**ステップ**:
1. **適切な距離関数の選択**:
   - コサイン類似度: 正規化されたベクトル
   - L2距離: ユークリッド距離
   - 内積: 高速だが正規化が必要

2. **検索パラメータの調整**:
   ```sql
   SET hnsw.ef_search = 100;  -- 精度と速度のトレードオフ
   ```

**判断基準**:
- [ ] 適切な距離関数を選んでいるか？
- [ ] 検索パラメータは調整済みか？
- [ ] 精度と速度のバランスは適切か？

**リソース**: `resources/rag-patterns.md`

## 核心概念

### ベクトル次元数

| モデル | 次元数 | 用途 |
|--------|--------|------|
| OpenAI text-embedding-3-small | 1536 | 汎用 |
| OpenAI text-embedding-3-large | 3072 | 高精度 |
| Cohere embed-v3 | 1024 | 多言語 |
| sentence-transformers | 384-768 | オープンソース |

### 距離関数

| 関数 | オペレータ | 用途 |
|------|-----------|------|
| コサイン距離 | `<=>` | 正規化済みベクトル（推奨） |
| L2距離 | `<->` | ユークリッド空間 |
| 内積 | `<#>` | 高速（負の値に注意） |

### インデックスタイプ

| タイプ | 精度 | 速度 | メモリ | 構築時間 |
|--------|------|------|--------|---------|
| なし | 100% | 遅い | 低い | なし |
| IVFFlat | 中 | 中 | 低い | 短い |
| HNSW | 高 | 速い | 高い | 長い |

## ベストプラクティス

### すべきこと

1. **ベクトルを正規化する**:
   ```typescript
   // 保存前に正規化
   function normalize(vector: number[]): number[] {
     const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
     return vector.map(v => v / magnitude);
   }
   ```

2. **HNSWインデックスを使用する**:
   - 大規模データで高精度
   - 検索パラメータで調整可能

3. **バッチ処理でEmbeddingを生成**:
   ```typescript
   // 一括生成
   const embeddings = await openai.embeddings.create({
     input: documents,  // 配列で渡す
     model: 'text-embedding-3-small',
   });
   ```

### 避けるべきこと

1. **インデックスなしの大規模検索**:
   - ❌ 100万行のフルスキャン
   - ✅ 適切なインデックスを作成

2. **次元数の不一致**:
   - ❌ 1536次元と3072次元の混在
   - ✅ 統一された次元数

3. **毎回のEmbedding生成**:
   - ❌ 同じテキストを何度もEmbed
   - ✅ Embeddingをキャッシュ

## トラブルシューティング

### 問題1: 検索が遅い

**症状**: ベクトル検索に数秒かかる

**原因**:
- インデックスがない
- インデックスパラメータが不適切
- データ量に対してef_searchが高すぎる

**解決策**:
```sql
-- インデックスを確認
SELECT indexname, indexdef FROM pg_indexes
WHERE tablename = 'documents';

-- HNSWインデックスを作成
CREATE INDEX CONCURRENTLY idx_documents_embedding
ON documents USING hnsw (embedding vector_cosine_ops);
```

### 問題2: 精度が低い

**症状**: 期待した結果が返ってこない

**原因**:
- ef_searchが低すぎる
- IVFFlatのlistsが多すぎる
- Embeddingモデルの問題

**解決策**:
```sql
-- ef_searchを増やす
SET hnsw.ef_search = 200;

-- または検索時に指定
SELECT * FROM documents
ORDER BY embedding <=> query_embedding
LIMIT 10;
```

### 問題3: メモリ不足

**症状**: インデックス作成時にメモリエラー

**原因**:
- HNSWのmパラメータが高すぎる
- データ量が多すぎる

**解決策**:
```sql
-- mを下げる（デフォルト16）
CREATE INDEX ON documents
USING hnsw (embedding vector_cosine_ops)
WITH (m = 8, ef_construction = 32);

-- またはIVFFlatを使用
CREATE INDEX ON documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

## 関連スキル

- **query-performance-tuning** (`.claude/skills/query-performance-tuning/SKILL.md`): クエリ最適化
- **database-migrations** (`.claude/skills/database-migrations/SKILL.md`): マイグレーション管理

## メトリクス

### ベクトル検索パフォーマンス指標

| 指標 | 目標値 | 警告値 |
|------|--------|--------|
| 検索レイテンシ | < 100ms | > 500ms |
| 精度（Recall@10） | > 95% | < 90% |
| インデックスサイズ | - | データの2倍超 |
| 構築時間 | < 1時間 | > 4時間 |

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-27 | 初版作成 - pgVector最適化 |

## 参考文献

- **pgvector**: https://github.com/pgvector/pgvector
- **Neon pgvector**: https://neon.tech/docs/extensions/pgvector
- **OpenAI Embeddings**: https://platform.openai.com/docs/guides/embeddings
