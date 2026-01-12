# VectorSearchStrategy トラブルシューティングガイド

## Phase 12 Task 5: トラブルシューティングガイド作成

---

## 1. よくある問題と解決方法

### 1.1 検索結果が空

| 問題      | 考えられる原因               | 解決方法                     |
| --------- | ---------------------------- | ---------------------------- |
| 結果が0件 | minRelevance閾値が厳しすぎる | minRelevanceを0.3〜0.5に緩和 |
| 結果が0件 | チャンクデータが存在しない   | chunksテーブルのデータ確認   |
| 結果が0件 | 埋め込みが未生成             | チャンクの埋め込み生成を実行 |
| 結果が0件 | fileIdsフィルタが不一致      | 正しいファイルIDを指定       |

**デバッグ手順**:

```typescript
// 1. フィルタなしで検索
const result = await strategy.search("test", 10);
console.log("結果数:", result.isOk() ? result.value.length : 0);

// 2. minRelevanceを0にして検索
const result2 = await strategy.search("test", 10, { minRelevance: 0 });

// 3. DBに直接クエリ
const rows = await db.select().from(chunks).limit(10);
console.log("チャンク数:", rows.length);
```

---

### 1.2 埋め込み生成エラー

| 問題                           | 考えられる原因     | 解決方法             |
| ------------------------------ | ------------------ | -------------------- |
| "Failed to generate embedding" | APIキーが無効      | OPENAI_API_KEYを確認 |
| "Failed to generate embedding" | APIレート制限      | リトライまたは待機   |
| "Failed to generate embedding" | ネットワークエラー | 接続を確認           |

**デバッグ手順**:

```typescript
// 1. 埋め込みプロバイダーを直接テスト
try {
  const embedding = await embeddingProvider.embed("test");
  console.log("埋め込み次元:", embedding.embedding.length);
} catch (error) {
  console.error("埋め込みエラー:", error);
}

// 2. APIキー確認
console.log("APIキー設定:", process.env.OPENAI_API_KEY ? "あり" : "なし");
```

---

### 1.3 パフォーマンス低下

| 問題       | 考えられる原因            | 解決方法                       |
| ---------- | ------------------------- | ------------------------------ |
| 検索が遅い | DiskANNインデックス未作成 | インデックスを作成             |
| 検索が遅い | キャッシュミス多発        | CachedVectorSearchStrategy使用 |
| 検索が遅い | APIレイテンシ             | キャッシュ有効期限を延長       |
| 検索が遅い | 結果数が多すぎる          | limitを適切に設定              |

**デバッグ手順**:

```typescript
// 1. メトリクス確認
const result = await strategy.search("test", 10);
const metrics = strategy.getMetrics();
console.log("処理時間:", metrics.processingTime, "ms");

// 2. キャッシュ統計確認
if (strategy instanceof CachedVectorSearchStrategy) {
  const stats = strategy.getCacheStats();
  console.log("ヒット率:", (stats.hitRate * 100).toFixed(1), "%");
}
```

---

### 1.4 スコアが常に低い

| 問題                | 考えられる原因       | 解決方法                           |
| ------------------- | -------------------- | ---------------------------------- |
| スコアが常に0.1以下 | 埋め込みモデル不一致 | 同一モデルでチャンク埋め込み再生成 |
| スコアが常に0.1以下 | チャンクが小さすぎる | チャンク分割戦略を見直し           |
| スコアが常に低い    | クエリがドメイン外   | ドメインに適したクエリを使用       |

**デバッグ手順**:

```typescript
// 1. 様々なクエリでテスト
const queries = ["テスト", "プログラミング", "TypeScript", "関数"];
for (const q of queries) {
  const result = await strategy.search(q, 5);
  if (result.isOk()) {
    console.log(q, "- 最高スコア:", result.value[0]?.score.toFixed(3) ?? "N/A");
  }
}

// 2. 埋め込みモデル確認
console.log("使用モデル:", process.env.OPENAI_EMBEDDING_MODEL);
```

---

### 1.5 入力バリデーションエラー

| エラーメッセージ                                  | 原因             | 解決方法           |
| ------------------------------------------------- | ---------------- | ------------------ |
| "Query cannot be empty"                           | 空文字またはnull | 有効なクエリを入力 |
| "Query exceeds maximum length of 1000 characters" | クエリが長すぎる | 1000文字以内に短縮 |
| "Limit must be between 1 and 100"                 | limit範囲外      | 1〜100の範囲に設定 |

**対策コード**:

```typescript
function validateQuery(query: string): string {
  const trimmed = query?.trim() ?? "";
  if (trimmed.length === 0) {
    throw new Error("クエリが空です");
  }
  if (trimmed.length > 1000) {
    return trimmed.substring(0, 1000);
  }
  return trimmed;
}

function validateLimit(limit: number): number {
  return Math.max(1, Math.min(100, limit));
}
```

---

## 2. デバッグ方法

### 2.1 基本デバッグ

```typescript
// 詳細ログを有効化
const DEBUG = true;

async function debugSearch(query: string, limit: number) {
  if (DEBUG) {
    console.log("=== 検索開始 ===");
    console.log("クエリ:", query);
    console.log("limit:", limit);
  }

  const result = await strategy.search(query, limit);

  if (DEBUG) {
    if (result.isOk()) {
      console.log("結果数:", result.value.length);
      result.value.slice(0, 3).forEach((item, i) => {
        console.log(`[${i}] スコア: ${item.score.toFixed(3)}`);
        console.log(`    ID: ${item.id}`);
        console.log(`    内容: ${item.content.text.substring(0, 50)}...`);
      });
    } else {
      console.error("エラー:", result.error.message);
    }

    const metrics = strategy.getMetrics();
    console.log("処理時間:", metrics.processingTime.toFixed(2), "ms");
  }

  return result;
}
```

### 2.2 キャッシュデバッグ

```typescript
async function debugCache() {
  const cached = strategy as CachedVectorSearchStrategy;

  // 検索前
  console.log("=== キャッシュ状態（検索前）===");
  console.log(cached.getCacheStats());

  // 検索実行
  await cached.search("test", 10);
  await cached.search("test", 10); // 2回目

  // 検索後
  console.log("=== キャッシュ状態（検索後）===");
  const stats = cached.getCacheStats();
  console.log("サイズ:", stats.size);
  console.log("ヒット:", stats.hits);
  console.log("ミス:", stats.misses);
  console.log("ヒット率:", (stats.hitRate * 100).toFixed(1), "%");
}
```

### 2.3 DBクエリデバッグ

```sql
-- チャンク数確認
SELECT COUNT(*) as total FROM chunks;

-- 埋め込み有無確認
SELECT COUNT(*) as with_embedding
FROM chunks
WHERE embedding IS NOT NULL;

-- サンプルベクトル検索
SELECT
  chunk_id,
  content,
  vector_distance_cos(embedding, (SELECT embedding FROM chunks LIMIT 1)) as distance
FROM chunks
WHERE embedding IS NOT NULL
ORDER BY distance
LIMIT 5;
```

---

## 3. ログの読み方

### 3.1 エラーログパターン

| ログパターン                    | 意味            | 対処           |
| ------------------------------- | --------------- | -------------- |
| `Failed to generate embedding:` | 埋め込みAPI失敗 | API設定確認    |
| `Query cannot be empty`         | 空クエリ        | 入力値確認     |
| `Query exceeds maximum length`  | クエリ長超過    | クエリ短縮     |
| `Limit must be between`         | limit範囲外     | 適切な値に修正 |
| `Database connection`           | DB接続エラー    | 接続設定確認   |

### 3.2 メトリクスログの解釈

```
{
  enabled: true,          // 戦略が有効
  resultCount: 5,         // 5件ヒット
  processingTime: 150.23, // 150ms処理時間
  topScore: 0.892         // 最高類似度89.2%
}
```

| メトリクス     | 正常値 | 異常時の対処                     |
| -------------- | ------ | -------------------------------- |
| resultCount    | 1以上  | フィルタ・閾値を緩和             |
| processingTime | <500ms | キャッシュ使用、インデックス確認 |
| topScore       | >0.3   | クエリ・埋め込みモデル確認       |

---

## 4. よくあるエラーコード

### 4.1 Result型エラー

```typescript
const result = await strategy.search(query, limit);

if (result.isErr()) {
  const error = result.error;

  switch (true) {
    case error.message.includes("empty"):
      console.log("クエリが空です");
      break;
    case error.message.includes("maximum length"):
      console.log("クエリが長すぎます");
      break;
    case error.message.includes("between"):
      console.log("limitが範囲外です");
      break;
    case error.message.includes("embedding"):
      console.log("埋め込み生成に失敗しました");
      break;
    default:
      console.log("不明なエラー:", error.message);
  }
}
```

---

## 5. 問題解決チェックリスト

### 5.1 検索が動作しない場合

```
□ データベース接続を確認
□ chunksテーブルにデータが存在するか確認
□ 埋め込みカラムにデータが存在するか確認
□ DiskANNインデックスが作成されているか確認
□ 埋め込みプロバイダーが正しく初期化されているか確認
□ APIキーが有効か確認
```

### 5.2 パフォーマンスが悪い場合

```
□ CachedVectorSearchStrategyを使用しているか確認
□ キャッシュヒット率を確認
□ DiskANNインデックスが有効か確認
□ limitが適切か確認（大きすぎないか）
□ ネットワークレイテンシを確認
```

### 5.3 結果の品質が悪い場合

```
□ 埋め込みモデルがチャンク生成時と同一か確認
□ minRelevance閾値が適切か確認
□ クエリがドメインに適しているか確認
□ チャンクサイズが適切か確認
```

---

## Phase 12 Task 5 完了記録

| 項目     | 内容           |
| -------- | -------------- |
| 完了日時 | 2026-01-12     |
| 成果物   | 本ドキュメント |
| 判定     | 完了           |
