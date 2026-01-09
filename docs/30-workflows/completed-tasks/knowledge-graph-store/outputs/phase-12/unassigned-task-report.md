# 未タスク検出レポート

## 検出日時

2026-01-09T06:48:00Z

## 検出方法

- コードベース内の`TODO`, `FIXME`, `HACK`, `XXX`コメント検索
- Phase 3, 9, 11 のMINOR判定事項確認
- テストの`it.todo()`項目確認

## 検出された技術的負債

### 1. Vector Similarity Search 未実装

| 項目         | 内容                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------- |
| **ファイル** | `packages/shared/src/services/graph/knowledge-graph-store.ts:355`                            |
| **種別**     | 機能未実装                                                                                   |
| **優先度**   | Medium                                                                                       |
| **説明**     | `findSimilarEntities()`メソッドが空の配列を返す実装になっている。DiskANN統合後に実装が必要。 |
| **影響**     | 類似エンティティ検索機能が使用不可                                                           |

```typescript
// 現在の実装
async findSimilarEntities(
  _embedding: number[],
  _limit: number,
  _threshold: number = 0.5,
): Promise<Result<StoredEntity[], Error>> {
  // TODO: Implement vector similarity search with DiskANN
  return ok([]);
}
```

**推奨アクション**: DiskANN統合タスク作成

---

### 2. Transaction Rollback 未実装

| 項目         | 内容                                                                                  |
| ------------ | ------------------------------------------------------------------------------------- |
| **ファイル** | `packages/shared/src/services/graph/__tests__/knowledge-graph-store.test.ts:1773`     |
| **種別**     | テスト未実装                                                                          |
| **優先度**   | Low                                                                                   |
| **説明**     | バッチ操作のトランザクションロールバックが未実装。現在は`it.todo()`としてマーク済み。 |
| **影響**     | バッチ操作失敗時にデータ整合性が保証されない可能性                                    |

**推奨アクション**: Drizzleのトランザクション機能を使用した実装

---

## 未タスク指示書

### CONV-08-01-01: Vector Similarity Search 実装

```yaml
taskId: CONV-08-01-01
parentTask: CONV-08-01
title: Knowledge Graph Vector Similarity Search 実装
priority: Medium
dependencies:
  - DiskANN統合 (未作成)
estimatedEffort: Medium
description: |
  Knowledge Graph StoreのfindSimilarEntities()メソッドを
  DiskANNを使用したベクトル類似検索として実装する。
acceptanceCriteria:
  - [ ] DiskANNインデックスとの統合
  - [ ] 類似度閾値によるフィルタリング
  - [ ] パフォーマンステスト（1000エンティティで100ms以下）
```

### CONV-08-01-02: Batch Operation Transaction Support

```yaml
taskId: CONV-08-01-02
parentTask: CONV-08-01
title: バッチ操作のトランザクションサポート
priority: Low
dependencies: []
estimatedEffort: Small
description: |
  bulkUpsertEntities()およびbulkAddRelations()メソッドで
  トランザクションロールバックを実装する。
acceptanceCriteria:
  - [ ] トランザクション内での処理
  - [ ] 失敗時の自動ロールバック
  - [ ] ロールバックテストの追加
```

## 統計

| カテゴリ     | 件数  |
| ------------ | ----- |
| 機能未実装   | 1     |
| テスト未実装 | 1     |
| **合計**     | **2** |

---

## 独立タスク指示書（作成済み）

上記の未タスクに対して、以下の独立タスク指示書を作成済み：

| タスクID      | ファイル                                                                            | ステータス |
| ------------- | ----------------------------------------------------------------------------------- | ---------- |
| CONV-08-01-01 | `docs/30-workflows/unassigned-task/task-CONV-08-01-01-vector-similarity-search.md`  | 作成済み   |
| CONV-08-01-02 | `docs/30-workflows/unassigned-task/task-CONV-08-01-02-batch-transaction-support.md` | 作成済み   |

これらのタスクは親タスク（CONV-08-01）の完了後、別途スケジュールされます。
