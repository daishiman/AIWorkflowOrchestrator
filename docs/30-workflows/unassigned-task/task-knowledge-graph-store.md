# Knowledge Graph Store 実装 - タスク指示書

## メタ情報

| 項目         | 内容                             |
| ------------ | -------------------------------- |
| タスクID     | CONV-08-01                       |
| タスク名     | Knowledge Graph Store 実装       |
| 分類         | 要件                             |
| 対象機能     | Knowledge Graph データアクセス層 |
| 優先度       | 高                               |
| 見積もり規模 | 大規模                           |
| ステータス   | 未実施                           |
| 発見元       | Phase 9 手動テスト               |
| 発見日       | 2026-01-04                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

CONV-04-05でKnowledge Graphテーブル群のスキーマ定義が完了した。
GraphRAG機能を実現するためには、これらのテーブルに対するCRUD操作を提供するデータアクセス層（Store）が必要。

### 1.2 問題点・課題

- スキーマ定義は完了しているが、データ操作を行うAPIが存在しない
- アプリケーション層からKnowledge Graphデータにアクセスする手段がない
- GraphRAGのEntity Extraction、Relation Extraction、Community Detectionの結果を永続化できない

### 1.3 放置した場合の影響

- GraphRAG機能が実装できない
- Knowledge Graph可視化機能が実装できない
- 文書からの知識抽出結果を活用できない

---

## 2. 何を達成するか（What）

### 2.1 目的

Knowledge Graphテーブル群に対するデータアクセス層を実装し、CRUD操作とグラフクエリをサポートする。

### 2.2 最終ゴール

- EntityStore: エンティティのCRUD + 検索
- RelationStore: 関係のCRUD + グラフトラバーサル
- CommunityStore: コミュニティのCRUD + 階層操作
- Knowledge Graphクエリ: パス検索、サブグラフ取得

### 2.3 スコープ

#### 含むもの

- EntityStore実装（CRUD + 検索）
- RelationStore実装（CRUD + トラバーサル）
- CommunityStore実装（CRUD + 階層）
- RelationEvidenceStore実装
- 中間テーブル操作
- グラフクエリ（隣接ノード、最短パス、サブグラフ）
- トランザクション対応
- バッチ操作

#### 含まないもの

- Entity Extraction（LLMによる抽出）
- Relation Extraction（LLMによる抽出）
- Community Detection（Leiden Algorithm）
- ベクトル検索（embeddingsは別Store）

### 2.4 成果物

| 成果物                | パス                                                       |
| --------------------- | ---------------------------------------------------------- |
| EntityStore           | `packages/shared/src/db/stores/entity-store.ts`            |
| RelationStore         | `packages/shared/src/db/stores/relation-store.ts`          |
| CommunityStore        | `packages/shared/src/db/stores/community-store.ts`         |
| RelationEvidenceStore | `packages/shared/src/db/stores/relation-evidence-store.ts` |
| GraphQueryService     | `packages/shared/src/services/graph-query-service.ts`      |
| テストファイル        | `packages/shared/src/db/stores/__tests__/*.test.ts`        |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- CONV-04-05（Knowledge Graphテーブル群実装）が完了していること
- CONV-04-06（マイグレーション適用）が完了していること
- Drizzle ORMの基本操作を理解していること

### 3.2 依存タスク

| タスクID   | タスク名                        | ステータス |
| ---------- | ------------------------------- | ---------- |
| CONV-04-05 | Knowledge Graphテーブル群実装   | 完了       |
| CONV-04-06 | Knowledge Graphマイグレーション | 未実施     |

### 3.3 必要な知識・スキル

- Drizzle ORM（クエリビルダー、リレーショナルクエリ）
- TypeScript（ジェネリクス、型推論）
- グラフアルゴリズム（トラバーサル、パス検索）
- TDD（テスト駆動開発）

### 3.4 推奨アプローチ

1. EntityStoreから実装開始（最もシンプル）
2. TDDで各Store実装
3. RelationStoreで外部キー連携を実装
4. CommunityStoreで階層構造を実装
5. GraphQueryServiceでグラフクエリを統合

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 目的                       |
| ----- | ---------------- | -------------------------- |
| 1     | 要件定義         | Store API設計              |
| 2     | 設計             | インターフェース設計       |
| 3     | 設計レビュー     | 設計の妥当性検証           |
| 4     | テスト作成       | TDD: Red                   |
| 5     | 実装             | TDD: Green                 |
| 6     | リファクタリング | TDD: Refactor              |
| 7     | 品質保証         | 静的解析・テストカバレッジ |
| 8     | 最終レビュー     | 全体品質検証               |
| 9     | 手動テスト       | 統合テスト                 |
| 10    | ドキュメント更新 | API仕様書作成              |
| 11    | PR作成           | コミット・PR               |

### Phase 1: 要件定義

#### Claude Code スラッシュコマンド

```
task-specification-creatorを使用して要件定義を実施
```

#### 目的

各StoreのAPI仕様と責務を定義する。

#### 成果物

- 要件定義書（outputs/phase-1/requirements.md）

#### 完了条件

- [ ] EntityStoreのAPI一覧が定義されている
- [ ] RelationStoreのAPI一覧が定義されている
- [ ] CommunityStoreのAPI一覧が定義されている
- [ ] GraphQueryServiceのAPI一覧が定義されている

### Phase 2-11: 設計〜PR作成

task-specification-creatorの標準Phase構成に従って実施。

---

## 5. 完了条件チェックリスト

### 機能要件

#### EntityStore

- [ ] create: エンティティ作成
- [ ] findById: ID検索
- [ ] findByName: 名前検索（正規化名）
- [ ] findByType: タイプ別検索
- [ ] update: エンティティ更新
- [ ] delete: エンティティ削除
- [ ] incrementMentionCount: 出現回数インクリメント
- [ ] batchCreate: バッチ作成

#### RelationStore

- [ ] create: 関係作成
- [ ] findById: ID検索
- [ ] findBySourceId: 始点エンティティの関係取得
- [ ] findByTargetId: 終点エンティティの関係取得
- [ ] findByEntityPair: エンティティペアの関係取得
- [ ] update: 関係更新
- [ ] delete: 関係削除
- [ ] getAdjacentEntities: 隣接エンティティ取得

#### CommunityStore

- [ ] create: コミュニティ作成
- [ ] findById: ID検索
- [ ] findByLevel: レベル別検索
- [ ] findChildren: 子コミュニティ取得
- [ ] getMembers: メンバーエンティティ取得
- [ ] addMember: メンバー追加
- [ ] removeMember: メンバー削除

#### GraphQueryService

- [ ] getSubgraph: 指定エンティティを中心としたサブグラフ取得
- [ ] findPath: 2エンティティ間のパス検索
- [ ] getConnectedComponents: 連結成分取得

### 品質要件

- [ ] 全Storeのテストカバレッジ80%以上
- [ ] TypeScript型エラーなし
- [ ] ESLintエラーなし
- [ ] トランザクション対応

### ドキュメント要件

- [ ] API仕様書が作成されている
- [ ] 使用例が記載されている

---

## 6. 検証方法

### テストケース

| テスト                       | 期待結果                             |
| ---------------------------- | ------------------------------------ |
| EntityStore CRUD             | 作成・読取・更新・削除が正常動作     |
| RelationStore CASCADE削除    | エンティティ削除時に関係も削除される |
| CommunityStore 階層操作      | 親子関係が正しく管理される           |
| GraphQueryService サブグラフ | 指定範囲のグラフが取得できる         |

### 検証手順

```bash
# テスト実行
pnpm --filter @repo/shared test:run src/db/stores/__tests__/*.test.ts

# カバレッジ確認
pnpm --filter @repo/shared test:coverage
```

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                         |
| ---------------------------- | ------ | -------- | ---------------------------- |
| パフォーマンス問題           | 高     | 中       | バッチ処理、インデックス活用 |
| 循環参照によるN+1問題        | 中     | 中       | リレーショナルクエリ活用     |
| トランザクションデッドロック | 中     | 低       | アクセス順序の統一           |
| グラフクエリの複雑化         | 中     | 中       | 深度制限、ページネーション   |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/conv-04-05-knowledge-graph-tables/` - テーブル実装
- `.claude/skills/aiworkflow-requirements/references/database-implementation.md` - DB仕様
- `.claude/skills/drizzle-orm/references/query-patterns.md` - クエリパターン

### 参考資料

- [Drizzle ORM Relational Queries](https://orm.drizzle.team/docs/rqb)
- [Microsoft GraphRAG](https://github.com/microsoft/graphrag)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Phase 9 手動テスト結果より:
### 4.1 次のステップ

1. マイグレーション生成（別タスク: CONV-04-06）
2. マイグレーション適用
3. Knowledge Graphストア実装（CONV-08-01）
```

### 補足事項

- 既存のembedding-storeの実装パターンを参考にする
- トランザクション境界は呼び出し側で制御できるようにする
- バッチ操作は1000件単位でチャンク処理
