# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 4                          |
| 機能名 | task-knowledge-graph-store |
| 作成日 | 2026-01-13                 |

## 目的

TDDのRed段階として、期待される動作を検証するテストを実装より先に作成する。各StoreとGraphQueryServiceのユニットテスト・統合テストを作成し、すべてのテストが失敗状態（Red）であることを確認する。

## 実行タスク

- **TDD原則適用**: テストファースト開発の実践
- **EntityStoreテスト**: CRUD + 検索のテスト作成
- **RelationStoreテスト**: CRUD + 証拠管理のテスト作成
- **CommunityStoreテスト**: CRUD + 階層操作のテスト作成
- **GraphQueryServiceテスト**: グラフ探索のテスト作成
- **統合テスト**: Store間連携テストの作成
- **境界値分析**: エッジケースのテスト追加

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                               | パス                                                                                        | 内容                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------- |
| Knowledge Graph Store インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` | Store API仕様・データ構造 |
| データベーススキーマ                   | `.claude/skills/aiworkflow-requirements/references/database-schema.md`                      | テーブル定義              |

### 前Phase成果物

| 資料名           | パス                                         | 説明          |
| ---------------- | -------------------------------------------- | ------------- |
| 要件定義書       | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |
| 設計書           | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| インターフェース | `outputs/phase-2/interface-design.md`        | Phase 2成果物 |
| 設計レビュー     | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |

## 実行手順

### 1. テストディレクトリ構造

```
packages/shared/src/services/graph/
├── __tests__/
│   ├── entity-store.test.ts
│   ├── relation-store.test.ts
│   ├── community-store.test.ts
│   ├── relation-evidence-store.test.ts
│   ├── graph-query-service.test.ts
│   └── integration/
│       ├── store-integration.test.ts
│       └── graph-flow.test.ts
```

### 2. EntityStoreテスト

Phase 1の受け入れ基準に基づいてテストを作成する:

```typescript
describe("EntityStore", () => {
  describe("addEntity", () => {
    it("新規エンティティを正常に永続化する");
    it("既存エンティティの場合はupsert（mentionCount加算、aliases統合）する");
    it("名前が空の場合はエラーを返す");
  });

  describe("getEntity", () => {
    it("指定IDのエンティティを取得できる");
    it("存在しないIDの場合はnullを返す");
  });

  describe("getEntityByName", () => {
    it("正規化名で検索し一致するエンティティを返す");
    it("大文字小文字を無視して検索する");
  });

  describe("updateEntity", () => {
    it("指定フィールドを正しく更新する");
    it("存在しないIDの場合はEntityNotFoundErrorを返す");
  });

  describe("deleteEntity", () => {
    it("エンティティを削除する");
    it("関連するrelationsがCASCADE削除される");
  });

  describe("searchEntities", () => {
    it("typeで絞り込み検索ができる");
    it("nameで部分一致検索ができる");
    it("複合条件で検索ができる");
  });

  describe("bulkUpsertEntities", () => {
    it("複数エンティティを一括で追加する");
    it("既存エンティティはupsertする");
    it("1000件のバッチ処理が1秒以内に完了する");
  });
});
```

### 3. RelationStoreテスト

```typescript
describe("RelationStore", () => {
  describe("addRelation", () => {
    it("証拠情報付きで関係を作成する");
    it("自己ループ（source == target）の場合はSelfLoopErrorを返す");
    it("証拠情報がない場合はEvidenceRequiredErrorを返す");
  });

  describe("getRelation", () => {
    it("指定IDの関係を取得できる");
    it("証拠情報も含めて取得する");
  });

  describe("deleteRelation", () => {
    it("関係を削除する");
    it("関連するevidenceがCASCADE削除される");
  });

  describe("getRelationsByEntity", () => {
    it("エンティティを起点とする関係を取得する");
    it("エンティティを終点とする関係を取得する");
  });

  describe("bulkAddRelations", () => {
    it("複数関係を一括で追加する");
    it("バッチ内で一部失敗した場合はロールバックする");
  });
});
```

### 4. CommunityStoreテスト

```typescript
describe("CommunityStore", () => {
  describe("create", () => {
    it("コミュニティを正常に作成する");
    it("親コミュニティを指定して作成する");
  });

  describe("findByLevel", () => {
    it("指定階層レベルのコミュニティリストを返す");
  });

  describe("findChildren", () => {
    it("子コミュニティリストを返す");
    it("子がない場合は空配列を返す");
  });

  describe("getMembers", () => {
    it("メンバーエンティティリストを返す");
  });

  describe("addMember / removeMember", () => {
    it("エンティティをコミュニティに追加できる");
    it("エンティティをコミュニティから削除できる");
    it("存在しないエンティティの場合はエラーを返す");
  });
});
```

### 5. GraphQueryServiceテスト

```typescript
describe("GraphQueryService", () => {
  describe("traverse", () => {
    it("指定エンティティから指定深度までBFSトラバーサルする");
    it("深度0の場合は開始ノードのみ返す");
    it("循環グラフでも無限ループしない");
  });

  describe("findShortestPath", () => {
    it("2エンティティ間の最短経路を返す");
    it("パスがない場合はnullを返す");
    it("同じエンティティ間の場合は自身のみの配列を返す");
  });

  describe("getNeighbors", () => {
    it("隣接エンティティリストを返す");
    it("depth指定で複数ホップの隣接を取得する");
  });

  describe("getStats", () => {
    it("グラフ統計（エンティティ数、関係数等）を返す");
  });
});
```

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                                              | テストファイル              |
| ------------------ | ----------------------------------------------------- | --------------------------- |
| Store間連携テスト  | EntityStore → RelationStore のデータ連携              | `store-integration.test.ts` |
| データフローテスト | エンティティ作成 → 関係作成 → グラフ探索 の一連フロー | `graph-flow.test.ts`        |
| エラーハンドリング | CASCADE削除時のデータ整合性確認                       | `store-integration.test.ts` |
| バッチ操作テスト   | 大量データのバッチ処理性能                            | `batch-performance.test.ts` |
| トランザクション   | 失敗時のロールバック動作                              | `transaction.test.ts`       |

## 成果物

| 成果物             | パス                                                     | 説明               |
| ------------------ | -------------------------------------------------------- | ------------------ |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                  | テスト設計         |
| テストケース       | `outputs/phase-4/test-cases.md`                          | ケース一覧         |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md`             | 統合テスト設計     |
| テストファイル     | `packages/shared/src/services/graph/__tests__/*.test.ts` | 実際のテストコード |

## 完了条件

- [ ] EntityStoreの全メソッドにテストがある
- [ ] RelationStoreの全メソッドにテストがある
- [ ] CommunityStoreの全メソッドにテストがある
- [ ] GraphQueryServiceの全メソッドにテストがある
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] 境界値テスト（空文字列、null、大量データ等）が含まれている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run src/services/graph/__tests__

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. テストディレクトリ構造の作成
3. EntityStoreテスト作成
4. RelationStoreテスト作成
5. CommunityStoreテスト作成
6. GraphQueryServiceテスト作成
7. 統合テスト作成
8. 境界値テスト追加
9. Red状態の確認
10. 成果物の作成・配置
11. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/task-knowledge-graph-store --phase 4
```

## 次のPhase

Phase 5: 実装（TDD: Green）
