# Phase 1: 要件定義

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 1                          |
| 機能名 | task-knowledge-graph-store |
| 作成日 | 2026-01-13                 |

## 目的

Knowledge Graph Store APIの要件を明文化し、各Store（Entity/Relation/Community/RelationEvidence）とGraphQueryServiceの責務と受け入れ基準を定義する。

## 実行タスク

- **要件抽出**: タスク指示書とシステム仕様から機能要件・非機能要件を抽出
- **受け入れ基準作成**: 各APIメソッドに対して検証可能な受け入れ基準を定義
- **FR/NFR分類**: 機能要件と非機能要件を分類し優先度を設定
- **接続要件定義**: Store間の依存関係とデータフローを明確化

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                               | パス                                                                                        | 内容                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------- |
| Knowledge Graph Store インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` | Store API仕様・データ構造 |
| データベーススキーマ                   | `.claude/skills/aiworkflow-requirements/references/database-schema.md`                      | テーブル定義              |
| RAGインターフェース                    | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`                       | RAG API仕様               |

### その他参照

| 資料名       | パス                                                              | 説明           |
| ------------ | ----------------------------------------------------------------- | -------------- |
| タスク指示書 | `docs/30-workflows/unassigned-task/task-knowledge-graph-store.md` | 元のタスク要求 |

## 実行手順

### 1. 要件抽出

タスク指示書とシステム仕様から以下の要件を抽出する:

#### 機能要件（FR）

| ID     | 要件           | 優先度 | 説明                                   |
| ------ | -------------- | ------ | -------------------------------------- |
| FR-001 | Entity CRUD    | 必須   | エンティティの作成・取得・更新・削除   |
| FR-002 | Relation CRUD  | 必須   | 関係の作成・取得・削除（証拠情報付き） |
| FR-003 | Community CRUD | 必須   | コミュニティの作成・取得・階層操作     |
| FR-004 | グラフ探索     | 必須   | BFSトラバーサル、最短経路探索          |
| FR-005 | バッチ操作     | 必須   | 複数エンティティ・関係の一括操作       |
| FR-006 | 統計情報取得   | 推奨   | エンティティ数、関係数などのグラフ統計 |

#### 非機能要件（NFR）

| 項目           | 要件               | 基準                    |
| -------------- | ------------------ | ----------------------- |
| パフォーマンス | バッチ操作の効率性 | 1000件/秒以上           |
| データ整合性   | 参照整合性の維持   | CASCADE削除対応         |
| 型安全性       | Branded Types使用  | EntityId, RelationId等  |
| エラー処理     | Result型パターン   | ok/err による明示的処理 |

### 2. 受け入れ基準作成

各StoreのAPIメソッドごとに受け入れ基準を定義する:

#### EntityStore 受け入れ基準

| メソッド           | 受け入れ基準                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| addEntity          | 新規エンティティが正常に永続化される。既存エンティティの場合はupsert（mentionCount加算、aliases統合）される |
| getEntity          | 指定IDのエンティティが取得できる。存在しない場合はnullを返す                                                |
| getEntityByName    | 正規化名で検索し、一致するエンティティを返す                                                                |
| updateEntity       | 指定フィールドが正しく更新される。存在しないIDの場合はエラー                                                |
| deleteEntity       | エンティティと関連するrelationsがCASCADE削除される                                                          |
| searchEntities     | 条件（type, name等）に一致するエンティティリストを返す                                                      |
| bulkUpsertEntities | 複数エンティティが一括で追加/更新される                                                                     |

#### RelationStore 受け入れ基準

| メソッド             | 受け入れ基準                                       |
| -------------------- | -------------------------------------------------- |
| addRelation          | 証拠情報付きで関係が作成される。自己ループは禁止   |
| getRelation          | 指定IDの関係が取得できる。存在しない場合はnull     |
| deleteRelation       | 関係と関連するevidenceがCASCADE削除される          |
| getRelationsByEntity | 指定エンティティを起点または終点とする全関係を返す |
| bulkAddRelations     | 複数関係が一括で追加される                         |

#### CommunityStore 受け入れ基準

| メソッド     | 受け入れ基準                                       |
| ------------ | -------------------------------------------------- |
| create       | コミュニティが正常に作成される                     |
| findById     | 指定IDのコミュニティが取得できる                   |
| findByLevel  | 指定階層レベルのコミュニティリストを返す           |
| findChildren | 指定コミュニティの子コミュニティリストを返す       |
| getMembers   | 指定コミュニティのメンバーエンティティリストを返す |
| addMember    | エンティティがコミュニティに追加される             |
| removeMember | エンティティがコミュニティから削除される           |

#### GraphQueryService 受け入れ基準

| メソッド         | 受け入れ基準                                                          |
| ---------------- | --------------------------------------------------------------------- |
| traverse         | 指定エンティティから指定深度までのBFSトラバーサル結果を返す           |
| findShortestPath | 2エンティティ間の最短経路（EntityId配列）を返す。パスがない場合はnull |
| getNeighbors     | 指定エンティティに隣接するエンティティリストを返す                    |
| getStats         | グラフ統計（エンティティ数、関係数、コミュニティ数等）を返す          |

### 3. FR/NFR分類

上記で抽出した要件を優先度別に分類する。

### 4. 接続要件定義

Store間の依存関係とデータフローを定義する。

## 統合テスト連携【必須】

接続要件（Store API/データフロー）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                            |
| ---------------- | --------------------------------------------------- |
| Store間連携      | EntityStore → RelationStore（EntityIdによる参照）   |
| Store間連携      | RelationStore → RelationEvidenceStore（証拠情報）   |
| Store間連携      | EntityStore → CommunityStore（メンバーシップ）      |
| データフロー     | アプリケーション層 → Store層 → Drizzle ORM → SQLite |
| 外部連携         | GraphQueryService → 各Store（グラフ操作の統合）     |

## 成果物

| 成果物       | パス                                         | 説明             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

## 完了条件

- [ ] 全要件が抽出されている（FR-001〜FR-006、NFR全項目）
- [ ] 各StoreのAPIメソッドに受け入れ基準がある
- [ ] FR/NFRが分類・優先度設定されている
- [ ] Store間の接続要件・データフローが明記されている
- [ ] システム仕様との整合性が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（システム仕様3ファイル + タスク指示書）
2. 機能要件の抽出（FR-001〜FR-006）
3. 非機能要件の抽出
4. EntityStore受け入れ基準作成
5. RelationStore受け入れ基準作成
6. CommunityStore受け入れ基準作成
7. GraphQueryService受け入れ基準作成
8. 接続要件・データフローの定義
9. 成果物の作成・配置
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/task-knowledge-graph-store --phase 1
```

## 次のPhase

Phase 2: 設計
