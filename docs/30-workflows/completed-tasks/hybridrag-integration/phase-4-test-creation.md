# Phase 4: テスト作成（TDD: Red） - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 4                     |
| Phase名    | テスト作成            |
| 前提Phase  | Phase 3               |
| 後続Phase  | Phase 5               |
| ステータス | 未実施                |
| 作成日     | 2026-01-17            |
| 機能名     | hybridrag-integration |

---

## 目的

期待される動作を検証するテストを実装より先に作成する（TDD Red状態）。

## 背景

TDDアプローチに従い、HybridRAGEngineとHybridRAGFactoryのテストを先に作成する。テストは失敗状態（Red）で完了し、Phase 5の実装でテストを通過させる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ユニットテスト作成

**目的**: HybridRAGEngine/Factoryの単体テストを作成する

**実行手順**:

1. テストファイルを作成: `packages/shared/src/services/search/__tests__/hybrid-rag-engine.test.ts`
2. HybridRAGEngineのテストを作成:
   ```typescript
   describe("HybridRAGEngine", () => {
     describe("search", () => {
       it("4ステージパイプラインが正常に動作する");
       it("クエリタイプに応じた重みが適用される");
       it("部分的な検索失敗でも結果を返す");
       it("すべての検索が失敗した場合はエラーを返す");
       it("CRAGが有効な場合は補正が適用される");
       it("パイプラインのパフォーマンスメトリクスが記録される");
     });
     describe("検索オプション", () => {
       it("limitが正しく適用される");
       it("フィルタが検索戦略に渡される");
       it("enableCRAGがfalseの場合CRAGをスキップする");
     });
   });
   ```
3. HybridRAGFactoryのテストを作成:
   ```typescript
   describe("HybridRAGFactory", () => {
     it("createFullで全機能エンジンを作成する");
     it("createLiteで軽量エンジンを作成する");
     it("createForTestingでテスト用エンジンを作成する");
     it("Cohere reranker設定時にAPIキーが必要");
   });
   ```
4. モックヘルパー関数を作成:
   - `createMockQueryClassifier()`
   - `createMockKeywordStrategy(resultCount?)`
   - `createMockSemanticStrategy(resultCount?)`
   - `createMockGraphStrategy(resultCount?)`
   - `createMockFusedResults(count)`

**期待される成果物**:

- `packages/shared/src/services/search/__tests__/hybrid-rag-engine.test.ts`

---

### タスク2: 統合テスト設計

**目的**: パイプライン統合テストのシナリオを設計する

**実行手順**:

1. 統合テストシナリオを設計:
   | シナリオカテゴリ | 検証内容 | テストファイル |
   | ------------------ | ------------------------------------------------------ | --------------------------------- |
   | パイプライン連携 | 4ステージの正常フロー検証 | `hybrid-rag-engine.integration.test.ts` |
   | 部分失敗 | 1戦略失敗時のフォールバック動作 | `hybrid-rag-engine.integration.test.ts` |
   | 全失敗 | 全戦略失敗時のエラーハンドリング | `hybrid-rag-engine.integration.test.ts` |
   | CRAG補正 | correct/incorrect/ambiguous時の動作 | `hybrid-rag-engine.integration.test.ts` |
   | パフォーマンス | 並列実行効果・レイテンシ測定 | `hybrid-rag-engine.perf.test.ts` |

2. 統合テストの骨格を作成:
   ```typescript
   describe("HybridRAGEngine Integration", () => {
     describe("パイプライン連携", () => {
       it(
         "QueryClassification → TripleSearch → RRFFusion → Reranking の流れが正常に動作する",
       );
       it(
         "QueryClassification → TripleSearch → RRFFusion → Reranking → CRAG の流れが正常に動作する",
       );
     });
     describe("部分失敗", () => {
       it("KeywordSearchが失敗してもSemantic/Graphの結果で動作する");
       it("SemanticSearchが失敗してもKeyword/Graphの結果で動作する");
       it("GraphSearchが失敗してもKeyword/Semanticの結果で動作する");
       it("Rerankingが失敗してもFusion結果で動作する");
       it("CRAGが失敗してもReranking結果で動作する");
     });
     describe("全失敗", () => {
       it("全検索戦略が失敗した場合はエラーを返す");
     });
   });
   ```

**期待される成果物**:

- `outputs/phase-4/integration-test-design.md`
- `packages/shared/src/services/search/__tests__/hybrid-rag-engine.integration.test.ts`（骨格）

---

### タスク3: 境界値テスト作成

**目的**: エッジケースのテストを追加する

**実行手順**:

1. 境界値テストを作成:
   ```typescript
   describe("境界値テスト", () => {
     it("空のクエリ文字列でエラーを返す");
     it("limitが0の場合は空の結果を返す");
     it("limitが100を超える場合は100に制限される");
     it("searchLimitMultiplierが0以下の場合はデフォルト値を使用");
     it("vectorThresholdが0未満または1超の場合はエラー");
     it("graphDepthが0以下の場合はデフォルト値を使用");
   });
   ```
2. null/undefined入力のテストを作成:
   ```typescript
   describe("null/undefined入力", () => {
     it("filtersがundefinedでも正常動作する");
     it("searchOptionsがundefinedでも正常動作する");
     it("cragがnullの場合はCRAGステージをスキップする");
   });
   ```

**期待される成果物**:

- 境界値テストの追加（hybrid-rag-engine.test.ts内）

---

## 参照資料

| 参照資料                | パス                                                                         | 内容             |
| ----------------------- | ---------------------------------------------------------------------------- | ---------------- |
| Phase 2成果物           | `outputs/phase-2/interface-design.md`                                        | インターフェース |
| 元タスク指示書          | `docs/30-workflows/unassigned-task/task-07-07-hybridrag-integration.md`      | テストケース例   |
| RAG検索インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | 型定義参照       |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                         | 内容                           |
| ----------------------- | ---------------------------------------------------------------------------- | ------------------------------ |
| RAG検索インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | SearchResultItem, CRAGResult等 |

---

## 成果物

| 成果物             | パス                                                                                  | 内容           |
| ------------------ | ------------------------------------------------------------------------------------- | -------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                                               | テスト設計     |
| テストケース       | `outputs/phase-4/test-cases.md`                                                       | ケース一覧     |
| 統合テスト設計     | `outputs/phase-4/integration-test-design.md`                                          | 統合テスト設計 |
| テストファイル     | `packages/shared/src/services/search/__tests__/hybrid-rag-engine.test.ts`             | ユニットテスト |
| 統合テストファイル | `packages/shared/src/services/search/__tests__/hybrid-rag-engine.integration.test.ts` | 統合テスト     |

---

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ       | 検証内容                                | テストファイル          |
| ---------------------- | --------------------------------------- | ----------------------- |
| パイプライン正常系     | 4ステージの正常フロー検証               | `*.integration.test.ts` |
| 部分失敗フォールバック | 1-2戦略失敗時のフォールバック           | `*.integration.test.ts` |
| 全失敗エラー           | 全戦略失敗時のエラーハンドリング        | `*.integration.test.ts` |
| CRAG補正               | correct/incorrect/ambiguous各アクション | `*.integration.test.ts` |
| パフォーマンス         | 並列実行効果・レイテンシ目標達成        | `*.perf.test.ts`        |

---

## 完了条件

- [ ] 受け入れ基準ごとにユニットテストがある
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）である
- [ ] テストカバレッジ目標が設定されている
- [ ] 境界値テストが含まれている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
# - [ ] テストファイルが正しい場所に配置されている
# - [ ] モック関数が正しく定義されている
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3が完了していること（PASS/MINOR判定）
- **後続**: Phase 5（実装）へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

### 実行タスク

- タスク1（ユニットテスト作成）: {{result}}
- タスク2（統合テスト設計）: {{result}}
- タスク3（境界値テスト作成）: {{result}}

### TDD確認

- [ ] 全テストがRed状態であることを確認

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/hybridrag-integration/phase-5-implementation.md`
