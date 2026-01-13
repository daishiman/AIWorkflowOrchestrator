# Knowledge Graph Store スコープ定義

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| Phase      | 1                          |
| 機能名     | task-knowledge-graph-store |
| 作成日     | 2026-01-13                 |
| 作成者     | Claude Opus 4.5            |
| バージョン | 1.0.0                      |

---

## 1. 実装スコープ

### 1.1 スコープ内

| カテゴリ  | 機能                   | 説明                                  |
| --------- | ---------------------- | ------------------------------------- |
| Entity    | Entity CRUD            | エンティティの作成・取得・更新・削除  |
| Entity    | バッチエンティティ追加 | 複数エンティティの一括upsert          |
| Entity    | エンティティ検索       | type, name等による条件検索            |
| Relation  | Relation CRUD          | 関係の作成・取得・削除                |
| Relation  | 証拠情報管理           | relation_evidenceの連携               |
| Relation  | バッチ関係追加         | 複数関係の一括追加                    |
| Community | Community CRUD         | コミュニティの作成・取得              |
| Community | 階層管理               | 親子コミュニティの関係管理            |
| Community | メンバー管理           | entity_communitiesの操作              |
| Graph     | BFSトラバーサル        | 幅優先探索によるグラフ探索            |
| Graph     | 最短経路探索           | 2ノード間の最短パス検索               |
| Graph     | 隣接ノード取得         | 1ホップで到達可能なノード取得         |
| Graph     | 統計情報取得           | エンティティ・関係・コミュニティ数    |
| 共通      | Result型エラー処理     | ok/err による明示的エラーハンドリング |
| 共通      | Branded Types          | EntityId, RelationId, CommunityId     |

### 1.2 スコープ外

| カテゴリ | 機能                            | 理由                                  |
| -------- | ------------------------------- | ------------------------------------- |
| 抽出     | エンティティ抽出（NER）         | 上位レイヤー（RAGパイプライン）の責務 |
| 抽出     | 関係抽出（Relation Extraction） | 上位レイヤー（RAGパイプライン）の責務 |
| 検出     | コミュニティ検出                | Leidenアルゴリズム等は別タスク        |
| 検索     | ベクトル類似検索                | DiskANN統合後に別タスクで対応         |
| 検索     | セマンティック検索              | 将来対応                              |
| 可視化   | グラフ可視化                    | フロントエンドの責務                  |

---

## 2. 実装コンポーネント

### 2.1 Store層

| コンポーネント        | ファイルパス                                                    | 責務             |
| --------------------- | --------------------------------------------------------------- | ---------------- |
| EntityStore           | `packages/shared/src/services/graph/entity-store.ts`            | エンティティCRUD |
| RelationStore         | `packages/shared/src/services/graph/relation-store.ts`          | 関係CRUD         |
| CommunityStore        | `packages/shared/src/services/graph/community-store.ts`         | コミュニティCRUD |
| RelationEvidenceStore | `packages/shared/src/services/graph/relation-evidence-store.ts` | 証拠管理         |

### 2.2 サービス層

| コンポーネント      | ファイルパス                                                  | 責務           |
| ------------------- | ------------------------------------------------------------- | -------------- |
| GraphQueryService   | `packages/shared/src/services/graph/graph-query-service.ts`   | グラフ探索     |
| KnowledgeGraphStore | `packages/shared/src/services/graph/knowledge-graph-store.ts` | 統合ファクトリ |

### 2.3 共通

| コンポーネント | ファイルパス                                   | 責務                  |
| -------------- | ---------------------------------------------- | --------------------- |
| 型定義         | `packages/shared/src/services/graph/types.ts`  | Branded Types, 共通型 |
| エラー型       | `packages/shared/src/services/graph/errors.ts` | カスタムエラー        |
| ユーティリティ | `packages/shared/src/services/graph/utils.ts`  | 名前正規化等          |

---

## 3. データベーステーブル

### 3.1 対象テーブル

| テーブル           | 用途                          | 操作 |
| ------------------ | ----------------------------- | ---- |
| entities           | エンティティ（ノード）        | CRUD |
| relations          | 関係（エッジ）                | CRUD |
| relation_evidence  | 関係の証拠                    | CRUD |
| communities        | コミュニティ                  | CRUD |
| entity_communities | エンティティ-コミュニティ中間 | CRUD |

### 3.2 操作対象外テーブル

| テーブル       | 理由                     |
| -------------- | ------------------------ |
| files          | RAGファイル管理は別責務  |
| chunks         | チャンク管理は別責務     |
| chunk_entities | 本タスクでは読み取りのみ |

---

## 4. 技術要件

### 4.1 使用技術

| 項目         | 技術           | バージョン |
| ------------ | -------------- | ---------- |
| 言語         | TypeScript     | 5.x        |
| ORM          | Drizzle ORM    | 最新       |
| データベース | SQLite (Turso) | -          |
| テスト       | Vitest         | 最新       |
| エラー処理   | neverthrow     | 最新       |

### 4.2 依存関係

| 依存先                       | 用途                   |
| ---------------------------- | ---------------------- |
| @repo/shared/db              | Drizzle DBインスタンス |
| @repo/shared/db/schema/graph | グラフ関連スキーマ     |
| neverthrow                   | Result型               |

---

## 5. テスト範囲

### 5.1 テスト種別

| テスト種別           | 対象            | ファイル配置                      |
| -------------------- | --------------- | --------------------------------- |
| 単体テスト           | 各Store/Service | `__tests__/*.test.ts`             |
| 統合テスト           | Store間連携     | `__tests__/integration/*.test.ts` |
| パフォーマンステスト | バッチ操作      | `__tests__/performance/*.test.ts` |

### 5.2 カバレッジ目標

| 指標              | 目標値 |
| ----------------- | ------ |
| Line Coverage     | 80%+   |
| Branch Coverage   | 60%+   |
| Function Coverage | 80%+   |

---

## 6. 制約・前提条件

### 6.1 技術的制約

| 制約             | 説明                                      |
| ---------------- | ----------------------------------------- |
| データベース     | SQLite（Turso統一アーキテクチャ）のみ対応 |
| 同期処理         | 非同期I/Oを使用（async/await）            |
| トランザクション | Drizzleトランザクションを使用             |

### 6.2 ビジネス制約

| 制約           | 説明                                |
| -------------- | ----------------------------------- |
| 証拠必須       | 関係作成時は最低1件の証拠情報が必須 |
| 自己ループ禁止 | source == target の関係は作成不可   |
| ソフトデリート | deleted_atによる論理削除対応        |

### 6.3 前提条件

| 前提         | 説明                                              |
| ------------ | ------------------------------------------------- |
| スキーマ存在 | Knowledge Graph関連テーブルがマイグレーション済み |
| DB接続       | Drizzle DBインスタンスが利用可能                  |
| 型定義       | 共通型定義が利用可能                              |

---

## 7. リスク・考慮事項

### 7.1 技術的リスク

| リスク             | 影響                   | 対策                               |
| ------------------ | ---------------------- | ---------------------------------- |
| パフォーマンス低下 | 大量データ処理時の遅延 | バッチ処理最適化、インデックス活用 |
| メモリ不足         | 大規模グラフ探索時     | 探索深度制限、ページング対応       |
| 循環参照           | グラフ探索無限ループ   | 訪問済みノード管理                 |

### 7.2 考慮事項

| 項目   | 説明                                   |
| ------ | -------------------------------------- |
| 拡張性 | 将来的なベクトル検索対応を考慮した設計 |
| 互換性 | 既存RAGパイプラインとの統合を考慮      |
| 保守性 | Store間の疎結合を維持                  |

---

## 8. 成果物一覧

### 8.1 実装成果物

| 成果物              | パス                                                          |
| ------------------- | ------------------------------------------------------------- |
| EntityStore         | `packages/shared/src/services/graph/entity-store.ts`          |
| RelationStore       | `packages/shared/src/services/graph/relation-store.ts`        |
| CommunityStore      | `packages/shared/src/services/graph/community-store.ts`       |
| GraphQueryService   | `packages/shared/src/services/graph/graph-query-service.ts`   |
| KnowledgeGraphStore | `packages/shared/src/services/graph/knowledge-graph-store.ts` |
| 型定義              | `packages/shared/src/services/graph/types.ts`                 |
| エラー型            | `packages/shared/src/services/graph/errors.ts`                |

### 8.2 テスト成果物

| 成果物                  | パス                                                                       |
| ----------------------- | -------------------------------------------------------------------------- |
| EntityStoreテスト       | `packages/shared/src/services/graph/__tests__/entity-store.test.ts`        |
| RelationStoreテスト     | `packages/shared/src/services/graph/__tests__/relation-store.test.ts`      |
| CommunityStoreテスト    | `packages/shared/src/services/graph/__tests__/community-store.test.ts`     |
| GraphQueryServiceテスト | `packages/shared/src/services/graph/__tests__/graph-query-service.test.ts` |
| 統合テスト              | `packages/shared/src/services/graph/__tests__/integration/*.test.ts`       |

### 8.3 ドキュメント成果物

| 成果物     | パス                                           |
| ---------- | ---------------------------------------------- |
| README     | `packages/shared/src/services/graph/README.md` |
| 実装ガイド | `outputs/phase-12/implementation-guide.md`     |

---

## 9. 参照ドキュメント

| ドキュメント         | パス                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------- |
| システム仕様         | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` |
| データベーススキーマ | `.claude/skills/aiworkflow-requirements/references/database-schema.md`                      |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                                                |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`                                                    |
