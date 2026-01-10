# PostgreSQL pgvector リソースの非推奨化について

## 重要なお知らせ

このディレクトリ内の以下のリソースは、元々PostgreSQL pgvector向けに作成されたものです：

- `resources/vector-basics.md` - pgvectorセットアップと基本スキーマ
- `resources/index-strategies.md` - IVFFlat/HNSWインデックス戦略
- `resources/rag-patterns.md` - RAGアーキテクチャパターン
- `scripts/benchmark-vector-search.mjs` - pgvector用ベンチマーク
- `templates/vector-schema-template.ts` - Drizzle + pgvectorスキーマ

## プロジェクトのデータベース変更

本プロジェクトは **SQLite (Turso)** を使用しているため、
これらのPostgreSQL固有のリソースは直接使用できません。

## 代替アプローチ

SQLiteプロジェクトでベクトル検索を実装する場合は、
メインの`SKILL.md`を参照してください：

### 推奨される代替案

1. **外部ベクトルデータベース** (推奨)
   - Pinecone: フルマネージド、高速
   - Weaviate: オープンソース、セルフホスト可
   - Qdrant: 高性能、Rust実装
   - Milvus: 大規模データセット向け

2. **ハイブリッドアーキテクチャ**
   - SQLite: メタデータとリレーショナルデータ
   - 外部ベクトルDB: Embedding検索
   - Redis: キャッシング

3. **アプリケーションレベル検索**
   - 小規模プロジェクト向け
   - メモリ内でコサイン類似度計算
   - Worker Threadsで並列化

4. **SQLite VSS拡張** (実験的)
   - sqlite-vss: SQLite用ベクトル検索拡張
   - 注意: Tursoで未サポート、本番環境非推奨

## 移行ガイダンス

### pgvectorから外部ベクトルDBへの概念マッピング

| pgvector機能                 | 代替アプローチ      | 実装方法                     |
| ---------------------------- | ------------------- | ---------------------------- |
| `vector(1536)` 型            | Pinecone index      | `pinecone.index('my-index')` |
| `embedding <=> query`        | `index.query()`     | コサイン類似度検索           |
| HNSW/IVFFlat インデックス    | 自動管理            | ベクトルDB側で自動最適化     |
| `ORDER BY distance LIMIT 10` | `topK: 10`          | クエリパラメータで指定       |
| メタデータフィルタ           | `filter` オプション | JSONベースのフィルタ         |

### アーキテクチャ比較

**PostgreSQL + pgvector（従来）**:

```
Application → PostgreSQL (メタデータ + ベクトル)
```

**SQLite + 外部ベクトルDB（推奨）**:

```
Application → SQLite (メタデータ)
            ↓
            → Pinecone/Qdrant (ベクトル)
```

## リソースの保持理由

これらのリソースは以下の理由で保持されています：

1. **教育的価値**: ベクトル検索の概念理解に有用
2. **将来の移行**: プロジェクトがPostgreSQLに移行する可能性
3. **比較資料**: 異なるアプローチの比較に役立つ
4. **パターン参考**: RAG実装パターンは汎用的

## 詳細情報

SQLiteベースプロジェクトでのベクトル検索実装の詳細は、
メインスキルドキュメントを参照してください：

```bash
cat .claude/skills/vector-search-alternatives/SKILL.md
```

## 変更履歴

- 2025-12-04: PostgreSQL pgvectorリソースを非推奨化、SQLite代替案に移行
- 2025-11-27: 初版作成（pgvector向け）
