# Knowledge Graph Store

Knowledge Graphの永続化と操作を担当するリポジトリ層です。

## ディレクトリ構成

```
graph/
├── knowledge-graph-store.ts  # メイン実装
├── types.ts                  # 型定義
├── errors.ts                 # エラークラス
├── README.md                 # 本ファイル
└── __tests__/
    └── knowledge-graph-store.test.ts
```

## クイックスタート

```typescript
import { createKnowledgeGraphStore } from "@repo/shared/services/graph/knowledge-graph-store";

// ストア作成
const store = createKnowledgeGraphStore(db);

// Entity作成
const result = await store.upsertEntity({
  name: "TypeScript",
  type: "programming_language",
});

if (result.isOk()) {
  console.log("Created:", result.value.id);
}
```

## 主要機能

| 機能         | メソッド                                                         | 説明                   |
| ------------ | ---------------------------------------------------------------- | ---------------------- |
| Entity管理   | `upsertEntity`, `getEntity`, `findEntities`, `deleteEntity`      | エンティティのCRUD     |
| Relation管理 | `addRelation`, `getRelations`, `findRelations`, `deleteRelation` | 関係のCRUD（証拠必須） |
| グラフ探索   | `traverse`, `findShortestPath`, `getNeighbors`                   | BFS探索、最短経路      |
| バッチ操作   | `bulkUpsertEntities`, `bulkAddRelations`                         | 一括操作               |
| 統計         | `getStats`                                                       | グラフ統計情報         |

## 設計原則

- **Result型パターン**: 全APIが `Result<T, Error>` を返却（例外を投げない）
- **Branded Types**: `EntityId`, `RelationId` 等の型安全なID
- **CASCADE削除**: Entity削除時にRelationも自動削除
- **証拠必須**: Relationは最低1つのEvidenceが必要

## 関連ドキュメント

| ドキュメント         | パス                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------- |
| 実装ガイド           | `docs/30-workflows/task-knowledge-graph-store/outputs/phase-12/implementation-guide.md`     |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` |
| テスト仕様           | `docs/30-workflows/task-knowledge-graph-store/outputs/phase-4/test-specification.md`        |

## テスト

```bash
# テスト実行
pnpm --filter @repo/shared test -- knowledge-graph-store --run

# カバレッジ付き
pnpm --filter @repo/shared test -- --coverage --run
```

## 制限事項

- `findSimilarEntities`: DiskANN統合前のため空配列を返却
- Community操作: 将来拡張予定
