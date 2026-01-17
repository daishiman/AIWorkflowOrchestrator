# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 8                    |
| Phase名    | リファクタリング     |
| 前提Phase  | Phase 7              |
| 後続Phase  | Phase 9              |
| ステータス | 未実施               |
| 作成日     | 2026-01-13           |
| 機能名     | rrf-fusion-reranking |

---

## 目的

TDD Refactor Phase: テストを維持しながらコード品質を改善する。

## 背景

Phase 5でテストを通す最小限の実装を行った。ここでコードの可読性、保守性、パフォーマンスを向上させる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コード重複の排除

**目的**: DRY原則に従い、重複コードを削除する

**実行手順**:

1. 以下の重複箇所を確認・修正:
   - `RRFFusion`と`WeightedScoreFusion`の`getWeight()`メソッド
   - 各Rerankerのエラーハンドリング処理
   - 結果マッピング処理

2. 共通処理を抽出:

   ```typescript
   // 共通ユーティリティ
   function getStrategyWeight(
     strategy: string,
     weights: SearchWeights,
   ): number {
     switch (strategy) {
       case "keyword":
         return weights.keyword;
       case "semantic":
         return weights.semantic;
       case "graph":
         return weights.graph;
       default:
         return 1;
     }
   }
   ```

3. テストが全て通ることを確認

**期待される成果物**:

- リファクタリング済みコード
- `outputs/phase-8/dry-refactoring.md` - 修正箇所の記録

---

### タスク2: 可読性の向上

**目的**: コードの可読性を向上させる

**実行手順**:

1. 変数名・メソッド名の見直し:
   - 略語を避け、意図が明確な名前を使用
   - 一貫した命名規則の適用

2. 複雑なロジックの分割:
   - 長いメソッドを適切に分割
   - 条件分岐の簡素化

3. JSDocコメントの追加:

   ```typescript
   /**
    * Reciprocal Rank Fusion (RRF) による検索結果統合
    *
    * RRFスコア計算式: score(d) = Σ (weight_i / (k + rank_i(d)))
    *
    * @param resultSets - 各検索戦略からの結果セット
    * @param weights - 各戦略の重み（合計1.0）
    * @returns 統合された検索結果
    *
    * @see https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf
    */
   ```

4. テストが全て通ることを確認

**期待される成果物**:

- リファクタリング済みコード
- `outputs/phase-8/readability-refactoring.md` - 修正箇所の記録

---

### タスク3: パフォーマンス最適化

**目的**: 処理効率を向上させる

**実行手順**:

1. 以下の最適化を検討・実施:
   - Mapの効率的な使用
   - 不要な配列コピーの削減
   - 早期リターンの活用

2. バッチ処理の最適化:
   - Rerankerのバッチサイズ調整
   - 並列処理の検討

3. テストが全て通ることを確認

**期待される成果物**:

- リファクタリング済みコード
- `outputs/phase-8/performance-refactoring.md` - 修正箇所の記録

---

### タスク4: 型安全性の強化

**目的**: TypeScriptの型システムを最大限活用する

**実行手順**:

1. 型定義の見直し:
   - 曖昧な型（`any`、`unknown`）の排除
   - 型ガードの追加
   - Branded Typeの活用

2. 型推論の活用:
   - 不要な型アノテーションの削除
   - ジェネリクスの適切な使用

3. テストが全て通ることを確認

**期待される成果物**:

- リファクタリング済みコード
- `outputs/phase-8/type-safety-refactoring.md` - 修正箇所の記録

---

### タスク5: テスト継続成功確認

**目的**: リファクタリング後もテストが全て通ることを確認する

**実行手順**:

1. 全テストを実行:

   ```bash
   pnpm --filter @repo/shared test -- --testPathPattern="fusion|reranking"
   ```

2. カバレッジが維持されていることを確認:

   ```bash
   pnpm --filter @repo/shared test:coverage -- --testPathPattern="fusion|reranking"
   ```

3. 結果を記録

**期待される成果物**:

- `outputs/phase-8/test-after-refactoring.md` - リファクタリング後のテスト結果

---

## 参照資料

| 参照資料      | パス                                   | 内容           |
| ------------- | -------------------------------------- | -------------- |
| Phase 5成果物 | `packages/shared/src/services/search/` | 実装コード     |
| Phase 7成果物 | `outputs/phase-7/`                     | カバレッジ結果 |

---

## 成果物

| 成果物                         | パス                                         | 内容                   |
| ------------------------------ | -------------------------------------------- | ---------------------- |
| DRYリファクタリング            | `outputs/phase-8/dry-refactoring.md`         | 重複排除記録           |
| 可読性リファクタリング         | `outputs/phase-8/readability-refactoring.md` | 可読性向上記録         |
| パフォーマンスリファクタリング | `outputs/phase-8/performance-refactoring.md` | 最適化記録             |
| 型安全性リファクタリング       | `outputs/phase-8/type-safety-refactoring.md` | 型強化記録             |
| テスト結果                     | `outputs/phase-8/test-after-refactoring.md`  | リファクタリング後結果 |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 8のアクション**: リファクタ後の統合テスト継続成功を確認

- リファクタリング後に統合テストを再実行
- 全テストが成功していることを確認
- 新たな問題が発生していないことを検証

---

## 完了条件

- [ ] コード重複が排除されている
- [ ] コードの可読性が向上している
- [ ] パフォーマンス最適化が実施されている
- [ ] 型安全性が強化されている
- [ ] リファクタリング後も全テストが成功している
- [ ] カバレッジが維持されている
- [ ] 本Phase内の全タスクを100%実行完了

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --testPathPattern="fusion|reranking"
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 7 が完了していること
- **後続**: Phase 9 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/rrf-fusion-reranking/phase-9-quality.md`
