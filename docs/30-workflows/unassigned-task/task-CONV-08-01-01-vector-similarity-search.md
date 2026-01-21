# Knowledge Graph Vector Similarity Search 実装 - タスク指示書

## メタ情報

```yaml
issue_number: 267
```

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | CONV-08-01-01                            |
| タスク名     | Knowledge Graph Vector Similarity Search |
| 分類         | 改善                                     |
| 対象機能     | Knowledge Graph Store                    |
| 優先度       | 中                                       |
| 見積もり規模 | 中規模                                   |
| ステータス   | 未実施                                   |
| 発見元       | Phase 12（CONV-08-01タスク）             |
| 発見日       | 2026-01-09                               |
| 親タスク     | CONV-08-01 Knowledge Graph ストア実装    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Knowledge Graph Store実装（CONV-08-01）において、`findSimilarEntities()`メソッドがスタブ実装（空配列を返す）のまま完了した。これはDiskANN（ベクトル検索エンジン）の統合が前提となるため、単独タスクとして切り出された。

### 1.2 問題点・課題

- `findSimilarEntities()`メソッドが機能しない状態
- ベクトル埋め込みによる類似エンティティ検索ができない
- RAGパイプラインでのセマンティック検索機能が制限される

### 1.3 放置した場合の影響

- エンティティの意味的類似度に基づく検索ができない
- 重複エンティティの検出精度が低下
- ナレッジグラフの品質向上機能が利用不可

---

## 2. 何を達成するか（What）

### 2.1 目的

DiskANNを使用したベクトル類似検索を`findSimilarEntities()`メソッドに実装し、エンティティの埋め込みベクトルに基づく類似検索を可能にする。

### 2.2 最終ゴール

```typescript
const similar = await store.findSimilarEntities(embedding, 10, 0.8);
// 類似度0.8以上のエンティティを最大10件取得
```

### 2.3 スコープ

#### 含むもの

- DiskANNインデックスとの統合
- 類似度閾値によるフィルタリング
- パフォーマンステスト

#### 含まないもの

- DiskANN自体の実装（別タスク: task-07-03-vector-search-diskann.md）
- 埋め込み生成ロジック

### 2.4 成果物

| 成果物             | 説明                          |
| ------------------ | ----------------------------- |
| 実装コード         | findSimilarEntities()の本実装 |
| テストコード       | ベクトル類似検索のテスト      |
| パフォーマンス結果 | ベンチマーク結果              |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- DiskANN統合タスク（task-07-03-vector-search-diskann.md）が完了していること
- エンティティのembeddingフィールドにベクトルが格納されていること

### 3.2 依存タスク

| タスクID | タスク名                         | ステータス |
| -------- | -------------------------------- | ---------- |
| -        | task-07-03-vector-search-diskann | 未実施     |

### 3.3 必要な知識・スキル

- ベクトル検索の基礎知識
- DiskANN API
- TypeScript
- SQLite + Drizzle ORM

### 3.4 推奨アプローチ

1. DiskANNインデックスの初期化
2. エンティティembeddingをインデックスに登録
3. クエリベクトルで近傍検索
4. 閾値でフィルタリングして返却

---

## 4. 実行手順

### Phase構成

標準のPhase 1-13フローに従う。

### 使用スキル

| スキル名            | パス                                          | 選定理由                 |
| ------------------- | --------------------------------------------- | ------------------------ |
| domain-modeling     | `.claude/skills/domain-modeling/SKILL.md`     | 検索結果の型設計         |
| indexing-strategies | `.claude/skills/indexing-strategies/SKILL.md` | ベクトルインデックス設計 |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] findSimilarEntities()が実際の類似検索を実行する
- [ ] 類似度閾値によるフィルタリングが機能する
- [ ] limit制限が正しく機能する

### 品質要件

- [ ] 1000エンティティで100ms以下のレスポンス
- [ ] テストカバレッジ80%以上

### ドキュメント要件

- [ ] API仕様の更新
- [ ] パフォーマンス結果の記録

---

## 6. 検証方法

### テストケース

1. 類似エンティティが正しく返される
2. 閾値以下のエンティティは除外される
3. limit制限が守られる
4. 空結果の場合のハンドリング

### 検証手順

```bash
pnpm vitest run packages/shared/src/services/graph/__tests__/ --grep "findSimilarEntities"
```

---

## 7. リスクと対策

| リスク             | 影響度 | 発生確率 | 対策                     |
| ------------------ | ------ | -------- | ------------------------ |
| DiskANN統合の遅延  | 高     | 中       | フォールバック実装を検討 |
| パフォーマンス未達 | 中     | 低       | インデックス最適化       |

---

## 8. 参照情報

### 関連ドキュメント

- `packages/shared/src/services/graph/knowledge-graph-store.ts:355` - 現在のスタブ実装
- `docs/30-workflows/unassigned-task/task-07-03-vector-search-diskann.md` - DiskANN統合タスク
- `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` - Knowledge Graph Store仕様

---

## 9. 備考

### 現在の実装

```typescript
async findSimilarEntities(
  _embedding: number[],
  _limit: number,
  _threshold: number = 0.5,
): Promise<Result<StoredEntity[], Error>> {
  // TODO: Implement vector similarity search with DiskANN
  return ok([]);
}
```

### 補足事項

- このタスクはDiskANN統合後に実施可能
- 埋め込みベクトルは384次元（Sentence Transformers）を想定
