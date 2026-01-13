# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 6                     |
| Phase名    | テスト拡充            |
| 前提Phase  | Phase 5               |
| 後続Phase  | Phase 7               |
| ステータス | 未実施                |
| 作成日     | 2026-01-12            |
| 機能名     | graph-search-strategy |

---

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標を達成する。ユニットテストと統合テストの両方を拡充する。

## 背景

Phase 4で作成した基本テストに加え、エッジケース、異常系、境界値のテストを追加してカバレッジ目標を達成する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジ分析

**目的**: テストカバレッジの測定と不足領域の特定

**実行手順**:

1. 現在のカバレッジを測定
2. 未カバーの行/分岐/関数を特定
3. カバレッジギャップ分析レポートを作成

**期待される成果物**:

- カバレッジ分析結果

---

### タスク2: ユニットテスト拡充

**目的**: ユニットテストカバレッジ基準を達成

**実行手順**:

1. 境界値テストを追加（limit=0, limit=100, 空クエリ等）
2. エラーケーステストを追加
3. フィルタ組み合わせテストを追加
4. スコアリング計算の精度テストを追加

**期待される成果物**:

- 拡充されたユニットテスト

---

### タスク3: 統合テスト拡充

**目的**: 統合テストカバレッジ基準を達成

**実行手順**:

1. GraphStore連携の詳細テストを追加
2. EmbeddingProvider連携テストを追加
3. CommunitySummarizer連携テストを追加
4. エラー伝播テストを追加

**期待される成果物**:

- 拡充された統合テスト

---

## 参照資料

| 参照資料       | パス                                                                                                 | 内容          |
| -------------- | ---------------------------------------------------------------------------------------------------- | ------------- |
| 実装コード     | `packages/shared/src/services/search/strategies/graph-search-strategy.ts`                            | Phase 5成果物 |
| ユニットテスト | `packages/shared/src/services/search/strategies/__tests__/graph-search-strategy.test.ts`             | Phase 4成果物 |
| 統合テスト     | `packages/shared/src/services/search/strategies/__tests__/graph-search-strategy.integration.test.ts` | Phase 4成果物 |

---

## 成果物

| 成果物             | パス                                                                                                 | 説明               |
| ------------------ | ---------------------------------------------------------------------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                                                                 | カバレッジ分析結果 |
| 統合テスト結果     | `outputs/phase-6/integration-test.md`                                                                | 統合テスト実行結果 |
| ユニットテスト     | `packages/shared/src/services/search/strategies/__tests__/graph-search-strategy.test.ts`             | 追加テストコード   |
| 統合テスト         | `packages/shared/src/services/search/strategies/__tests__/graph-search-strategy.integration.test.ts` | 追加テストコード   |

---

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）:

| テストカテゴリ      | 検証項目                                      | 目標 |
| ------------------- | --------------------------------------------- | ---- |
| GraphStore連携      | findSimilarEntities/traverse/findShortestPath | 100% |
| EmbeddingProvider   | embedSingle呼び出し・エラー処理               | 100% |
| CommunitySummarizer | searchSummaries・フォールバック               | 100% |
| エラーハンドリング  | 各サービスエラー時のResult処理                | 80%+ |
| 境界値              | 空クエリ、limit境界、閾値境界                 | 100% |

---

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

## 結合テストカバレッジ基準

| 指標                    | 目標 |
| ----------------------- | ---- |
| GraphStore API          | 100% |
| EmbeddingProvider API   | 100% |
| CommunitySummarizer API | 100% |
| 正常系シナリオ          | 100% |
| 異常系シナリオ          | 80%+ |

---

## 実行コマンド

```bash
# ユニットテストカバレッジ確認
pnpm test:coverage -- --filter="GraphSearchStrategy"

# 統合テスト実行
pnpm test:integration -- --filter="GraphSearchStrategy"
```

---

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成
- [ ] 統合テストの追加が完了している
- [ ] 境界値テストが追加されている
- [ ] エラーケーステストが追加されている
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5 が完了していること
- **後続**: Phase 7: テストカバレッジ確認 へ進む

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 現在のカバレッジ測定
2. カバレッジギャップ分析
3. 境界値テスト追加
4. エラーケーステスト追加
5. フィルタ組み合わせテスト追加
6. GraphStore連携テスト追加
7. EmbeddingProvider連携テスト追加
8. CommunitySummarizer連携テスト追加
9. カバレッジ再測定・レポート作成
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/graph-search-strategy --phase 6
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

## 追加テストケース例

```typescript
describe("GraphSearchStrategy - 拡充テスト", () => {
  describe("境界値テスト", () => {
    it("limit=0の場合は空配列を返す");
    it("limit=100の場合は最大100件を返す");
    it("空クエリの場合はエラーを返す");
    it("entityThreshold=0の場合はすべてのエンティティを返す");
    it("entityThreshold=1の場合は完全一致のみ返す");
    it("traversalDepth=0の場合は直接関連のみ返す");
  });

  describe("エラーケーステスト", () => {
    it("GraphStoreが例外を投げた場合はエラーを返す");
    it("EmbeddingProviderがタイムアウトした場合はエラーを返す");
    it("部分的にエンティティ取得に失敗した場合も他の結果を返す");
  });

  describe("フィルタテスト", () => {
    it("fileIdsフィルタで結果が絞り込まれる");
    it("entityTypesフィルタで結果が絞り込まれる");
    it("複数フィルタの組み合わせが動作する");
  });

  describe("パフォーマンステスト", () => {
    it("1000エンティティでも500ms以内に応答する");
    it("深度3のトラバーサルが完了する");
  });
});
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/graph-search-strategy/phase-7-coverage-check.md`
