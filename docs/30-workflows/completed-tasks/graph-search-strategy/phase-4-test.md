# Phase 4: テスト作成（TDD: Red）- タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 4                     |
| Phase名    | テスト作成            |
| 前提Phase  | Phase 3               |
| 後続Phase  | Phase 5               |
| ステータス | 未実施                |
| 作成日     | 2026-01-12            |
| 機能名     | graph-search-strategy |

---

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。TDD原則に従い、GraphSearchStrategyの全機能をカバーするテストを作成する。

## 背景

TDDアプローチにより、テストを先に書くことで以下のメリットを得る:

- 要件の正確な理解と検証
- 実装前のインターフェース設計の検証
- リグレッション防止

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テストシナリオ設計

**目的**: 受け入れ基準からテストシナリオを導出

**実行手順**:

1. Phase 1の受け入れ基準をテストケースにマッピング
2. 正常系・異常系・境界値のテストシナリオを設計
3. テストカバレッジ目標を設定

**期待される成果物**:

- テスト仕様書（`outputs/phase-4/test-specification.md`）

---

### タスク2: ユニットテスト作成

**目的**: 各メソッドのユニットテストを作成

**実行手順**:

1. GraphSearchStrategy.search()のテストを作成
2. localSearch()のテストを作成
3. globalSearch()のテストを作成
4. relationshipSearch()のテストを作成
5. スコアリング関数のテストを作成

**期待される成果物**:

- テストファイル（`packages/shared/src/services/search/strategies/__tests__/graph-search-strategy.test.ts`）

---

### タスク3: 統合テストシナリオ作成

**目的**: コンポーネント間連携テストを設計

**実行手順**:

1. GraphStore連携テストを設計
2. EmbeddingProvider連携テストを設計
3. CommunitySummarizer連携テストを設計
4. エラーハンドリング連携テストを設計

**期待される成果物**:

- 統合テスト設計書（`outputs/phase-4/integration-test-design.md`）
- 統合テストファイル（`packages/shared/src/services/search/strategies/__tests__/graph-search-strategy.integration.test.ts`）

---

## 参照資料

| 参照資料       | パス                                         | 内容          |
| -------------- | -------------------------------------------- | ------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| アーキテクチャ | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| 設計レビュー   | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料        | パス                                                                         | 内容           |
| --------------- | ---------------------------------------------------------------------------- | -------------- |
| テスト品質基準  | `.claude/skills/task-specification-creator/SKILL.md`                         | カバレッジ基準 |
| ISearchStrategy | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | テスト対象     |

---

## 成果物

| 成果物             | パス                                                                                                 | 説明             |
| ------------------ | ---------------------------------------------------------------------------------------------------- | ---------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                                                              | テスト設計       |
| テストケース       | `outputs/phase-4/test-cases.md`                                                                      | ケース一覧       |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md`                                                         | 統合テスト設計   |
| ユニットテスト     | `packages/shared/src/services/search/strategies/__tests__/graph-search-strategy.test.ts`             | テストコード     |
| 統合テスト         | `packages/shared/src/services/search/strategies/__tests__/graph-search-strategy.integration.test.ts` | 統合テストコード |

---

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                              | テストファイル          |
| ------------------ | ------------------------------------- | ----------------------- |
| GraphStore接続     | findSimilarEntities, traverse呼び出し | `*.integration.test.ts` |
| EmbeddingProvider  | embedSingle呼び出しとベクトル取得     | `*.integration.test.ts` |
| エラーハンドリング | 各サービスエラー時のResult処理        | `*.test.ts`             |
| フォールバック     | CommunitySummarizer未設定時の動作     | `*.test.ts`             |
| スコアリング       | 0-1範囲、ソート順                     | `*.test.ts`             |

---

## 完了条件

- [ ] 受け入れ基準ごとにユニットテストがある
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] 境界値テストが含まれている
- [ ] モックの設計が完了している
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5: 実装（TDD: Green）へ進む

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Phase 1-3成果物の確認
2. テストシナリオ設計
3. search()メソッドのテスト作成
4. localSearch()のテスト作成
5. globalSearch()のテスト作成
6. relationshipSearch()のテスト作成
7. スコアリング・エラーハンドリングテスト作成
8. 統合テストシナリオ作成
9. テストが失敗状態（Red）であることを確認
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/graph-search-strategy --phase 4
```

---

## Phase実行記録

| 項目            | 内容                     |
| --------------- | ------------------------ |
| 実行開始日時    | {{EXECUTION_START}}      |
| 実行完了日時    | {{EXECUTION_END}}        |
| 実行者          | {{EXECUTOR}}             |
| 成果物確認      | [ ] 全て生成済み         |
| artifacts.json  | [ ] 更新済み             |
| 次Phase移行可否 | [ ] 可 / [ ] 否（理由:） |

---

## TDD検証

```bash
# テスト実行コマンド
pnpm test -- --filter="GraphSearchStrategy"

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

---

## テストケース設計

### ユニットテスト

```typescript
describe("GraphSearchStrategy", () => {
  describe("constructor", () => {
    it("依存関係を正しく注入できる");
    it("CommunitySummarizerはオプショナル");
  });

  describe("search", () => {
    it("queryTypeに応じて適切な検索メソッドを呼び出す");
    it("デフォルトはlocalSearch");
    it("結果をスコア順でソートする");
    it("limit件数を守る");
  });

  describe("localSearch", () => {
    it("エンティティベースの検索が動作する");
    it("エンティティメタデータが含まれる");
    it("類似度閾値でフィルタする");
    it("エンティティが見つからない場合は空配列を返す");
  });

  describe("globalSearch", () => {
    it("コミュニティサマリベースの検索が動作する");
    it("コミュニティレベル情報が含まれる");
    it("CommunitySummarizer未設定時は空配列を返す");
  });

  describe("relationshipSearch", () => {
    it("エンティティ間の関係検索が動作する");
    it("パス距離がメタデータに含まれる");
    it("2エンティティ未満の場合はlocalSearchにフォールバック");
    it("最大深度を超えない");
  });

  describe("スコアリング", () => {
    it("スコアが0-1の範囲");
    it("結果がスコア順でソートされる");
    it("localスコア = エンティティ類似度×0.6 + チャンク関連度×0.4");
  });

  describe("エラーハンドリング", () => {
    it("埋め込みプロバイダーエラー時にエラーを返す");
    it("グラフストアエラー時にエラーを返す");
    it("部分的なエラーでも他の結果を返す");
  });

  describe("フィルタ", () => {
    it("fileIdsフィルタが適用される");
    it("entityTypesフィルタが適用される");
  });
});
```

### 統合テスト

```typescript
describe("GraphSearchStrategy Integration", () => {
  describe("GraphStore連携", () => {
    it("findSimilarEntitiesを正しく呼び出す");
    it("traverseを正しく呼び出す");
    it("findShortestPathを正しく呼び出す");
  });

  describe("EmbeddingProvider連携", () => {
    it("embedSingleを正しく呼び出す");
    it("埋め込みベクトルを正しく渡す");
  });

  describe("CommunitySummarizer連携", () => {
    it("searchSummariesを正しく呼び出す");
    it("レベル指定が正しく渡される");
  });

  describe("End-to-End", () => {
    it("localSearchで実際のチャンクが取得できる");
    it("globalSearchでコミュニティサマリが取得できる");
    it("relationshipSearchでパスが取得できる");
  });
});
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/graph-search-strategy/phase-5-implementation.md`
