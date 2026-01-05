# 埋め込みキャッシュRedis統合 - タスク指示書

## メタ情報

| 項目         | 内容                          |
| ------------ | ----------------------------- |
| タスクID     | UNASSIGNED-EMB-006            |
| タスク名     | 埋め込みキャッシュRedis統合   |
| 分類         | 改善                          |
| 対象機能     | embedding-generation-pipeline |
| 優先度       | 中                            |
| 見積もり規模 | 中規模                        |
| ステータス   | 未実施                        |
| 発見元       | Phase 8: 手動テスト検証       |
| 発見日       | 2025-12-26                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 8のパフォーマンステスト時に、キャッシュの効果が確認された（処理時間90%削減）。

現在のインメモリキャッシュは有効だが、スケーラビリティに制限がある。

### 1.2 問題点・課題

**現在のインメモリキャッシュの制限**:

1. **永続性の欠如**
   - アプリケーション再起動でキャッシュ消失
   - 毎回の再計算が必要

2. **分散環境での制限**
   - 複数インスタンス間でキャッシュを共有できない
   - 各インスタンスが独自にキャッシュを保持（非効率）

3. **スケーラビリティ**
   - キャッシュサイズがプロセスメモリに制限
   - 大規模運用で制約となる

### 1.3 放置した場合の影響

**短期的影響**:

- アプリケーション再起動のたびに再計算
- 複数インスタンスでの非効率

**中長期的影響**:

- スケールアウトが困難
- パフォーマンス最適化の限界
- 運用コストの増加

**影響度**: 中（スケーラビリティに影響）

---

## 2. 何を達成するか（What）

### 2.1 目的

埋め込みキャッシュをRedisに対応させ、永続化と分散キャッシュを実現する。

### 2.2 最終ゴール

- アプリケーション再起動後もキャッシュ維持
- 複数インスタンス間でキャッシュ共有
- キャッシュヒット率70%以上を目標

### 2.3 スコープ

#### 含むもの

- ✅ IEmbeddingCacheインターフェース定義
- ✅ RedisEmbeddingCache実装
- ✅ キャッシュキー生成ユーティリティ
- ✅ docker-compose.ymlにRedis追加
- ✅ TTL（自動期限切れ）機能
- ✅ バッチ操作（mget/mset）
- ✅ テスト

#### 含まないもの

- ❌ Redis Cluster対応（将来拡張）
- ❌ Redis Sentinel対応（将来拡張）
- ❌ Prometheus metrics連携

### 2.4 成果物

1. `packages/shared/src/services/embedding/cache/cache-interface.ts`
2. `packages/shared/src/services/embedding/cache/cache-key-generator.ts`
3. `packages/shared/src/services/embedding/cache/redis-embedding-cache.ts`
4. 更新された`docker-compose.yml`
5. テストファイル
6. 更新された`embedding-service.ts`

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] 現在のインメモリキャッシュが動作
- [ ] Redisサーバーがアクセス可能（Dockerで起動可能）
- [ ] ioredisパッケージがインストール可能

### 3.2 依存タスク

なし（独立して実行可能）

### 3.3 必要な知識・スキル

- Redis基本操作
- ioredisライブラリ
- TTL（Time To Live）の概念
- Docker Compose

### 3.4 推奨アプローチ

1. インターフェースで抽象化（メモリ/Redis切り替え可能に）
2. キャッシュキー設計を慎重に
3. TTLで自動期限切れ
4. テストはローカルRedisで実施

---

## 4. 実行手順

### Phase構成

```
Phase 1: キャッシュインターフェース定義
Phase 2: Redisキャッシュ実装
Phase 3: Docker環境構築
Phase 4: EmbeddingServiceへの統合
Phase 5: テスト作成
```

### Phase 1: キャッシュインターフェース定義

#### 目的

IEmbeddingCacheインターフェースを定義

#### 実行手順

主要メソッド:

- `get(key: string): Promise<CacheEntry | null>`
- `set(key: string, entry: CacheEntry): Promise<void>`
- `mget(keys: string[]): Promise<Map<string, CacheEntry>>`
- `mset(entries: Map<string, CacheEntry>): Promise<void>`
- `delete(key: string): Promise<boolean>`
- `deleteByPattern(pattern: string): Promise<number>`
- `stats(): Promise<CacheStats>`

#### 成果物

- ✅ `cache-interface.ts`

#### 完了条件

- [ ] インターフェースが定義されている

### Phase 2: Redisキャッシュ実装

#### 目的

RedisEmbeddingCacheクラスを実装

#### 実行手順

**Step 1**: ioredisインストール

```bash
pnpm --filter @repo/shared add ioredis
```

**Step 2**: RedisEmbeddingCache実装

- 接続管理
- TTL対応
- バッチ操作
- パターンマッチング削除

#### 成果物

- ✅ `redis-embedding-cache.ts`

#### 完了条件

- [ ] 全メソッドが実装されている
- [ ] TTLが機能する

### Phase 3: Docker環境構築

#### 目的

Redisコンテナをdocker-composeに追加

#### 実行手順

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: >
      redis-server
      --appendonly yes
      --maxmemory 512mb
      --maxmemory-policy volatile-lru

volumes:
  redis-data:
```

#### 成果物

- ✅ 更新された`docker-compose.yml`

#### 完了条件

- [ ] Redisが起動する
- [ ] 接続できる

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] IEmbeddingCacheインターフェースが定義されている
- [ ] RedisEmbeddingCacheが実装されている
- [ ] TTLによる自動期限切れが機能する
- [ ] バッチ操作（mget/mset）が機能する
- [ ] パターンマッチング削除が機能する

### 品質要件

- [ ] ユニットテストが実装されている
- [ ] Redisとの接続テストが実装されている
- [ ] TTLのテストが実装されている
- [ ] 全テストが通過する

### ドキュメント要件

- [ ] Redis設定ガイドが作成されている
- [ ] キャッシュヒット率の目標値が文書化されている

---

## 6. 検証方法

### テストケース

| No  | テストケース    | 期待結果                   |
| --- | --------------- | -------------------------- |
| 1   | set/get         | データが保存・取得できる   |
| 2   | TTL             | 期限切れで自動削除される   |
| 3   | mget/mset       | バッチ操作が機能する       |
| 4   | deleteByPattern | パターンマッチで削除できる |

### 検証手順

```bash
docker-compose up -d redis
pnpm test redis-embedding-cache
```

---

## 7. リスクと対策

| リスク           | 影響度 | 発生確率 | 対策                               |
| ---------------- | ------ | -------- | ---------------------------------- |
| Redis接続エラー  | 高     | 中       | フォールバックをメモリキャッシュに |
| キャッシュ不整合 | 中     | 低       | TTL設定で古いデータを自動削除      |
| メモリ不足       | 中     | 低       | maxmemory-policy設定               |

---

## 8. 参照情報

### 関連ドキュメント

- [Phase 8 パフォーマンステスト結果](../embedding-generation-pipeline/performance-test-manual.md)
- [キャッシング戦略設計](../embedding-generation-pipeline/design-embedding.md)

### 参考資料

- Redis Documentation: https://redis.io/docs/
- ioredis: https://github.com/redis/ioredis

---

## 9. 備考

### 補足事項

**キャッシュヒット率の目標**:

| 環境 | 目標ヒット率 |
| ---- | ------------ |
| 開発 | 50%以上      |
| 本番 | 70%以上      |

**Redis設定の推奨値**:

開発環境:

```bash
REDIS_URL=localhost:6379
REDIS_MAX_MEMORY=512mb
```

本番環境:

```bash
REDIS_URL=redis://prod-redis:6379
REDIS_MAX_MEMORY=2gb
REDIS_CLUSTER_MODE=enabled
```
