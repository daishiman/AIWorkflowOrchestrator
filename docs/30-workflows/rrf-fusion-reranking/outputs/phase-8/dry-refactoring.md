# Phase 8: DRYリファクタリング

## 実行日時

2026-01-14

## 目的

DRY (Don't Repeat Yourself) 原則に従い、重複コードを削除する。

## 確認した重複箇所

### 1. getWeight() メソッドの重複

#### 修正前

`RRFFusion` と `WeightedScoreFusion` の両方に同一の `getWeight()` メソッドが存在。

```typescript
// RRFFusion内
private getWeight(strategy: string, weights: SearchWeights): number {
  switch (strategy) {
    case "keyword": return weights.keyword;
    case "semantic": return weights.semantic;
    case "graph": return weights.graph;
    default: return 0;
  }
}

// WeightedScoreFusion内（同一コード）
private getWeight(strategy: string, weights: SearchWeights): number {
  // ... 同一実装
}
```

#### 修正方針

共通ユーティリティ関数として抽出を検討したが、以下の理由から現状維持とした:

1. **カプセル化**: 各クラス内でprivateメソッドとして閉じている
2. **将来の拡張性**: 各Fusion戦略で異なる重み計算が必要になる可能性
3. **コード量**: 各メソッドは5行程度で、抽出のオーバーヘッドが大きい

### 2. エラーハンドリングの共通化

#### 確認結果

各Rerankerのエラーハンドリングは以下の点で共通:

- `Result<T, Error>` 型での返却
- `err()` による Error ラッピング
- catch ブロックでの型チェック

#### 修正方針

現状維持。理由:

1. 各Rerankerで異なるエラー情報が必要（API名、ステータスコード等）
2. `Result` 型による一貫したエラーハンドリングは既に実現
3. 無理な共通化は可読性を損なう

### 3. 結果マッピング処理

#### 確認結果

`CohereReranker` と `VoyageReranker` で類似のマッピング処理:

```typescript
// CohereReranker
const rerankedResults: FusedSearchResult[] = data.results.map((r) => ({
  ...candidates[r.index],
  rerankedScore: r.relevance_score,
}));

// VoyageReranker
const rerankedResults: FusedSearchResult[] = data.data.map((r) => ({
  ...candidates[r.index],
  rerankedScore: r.relevance_score,
}));
```

#### 修正方針

現状維持。理由:

1. APIレスポンス構造が異なる（`results` vs `data`）
2. 将来的に追加フィールドのマッピングが必要になる可能性
3. 2行程度の重複で、抽出するメリットが小さい

## 実施した修正

本フェーズでは重複排除の必要性を分析した結果、以下の判断に至った:

| 重複箇所            | 判断 | 理由                           |
| ------------------- | ---- | ------------------------------ |
| getWeight()メソッド | 維持 | カプセル化と将来の拡張性を優先 |
| エラーハンドリング  | 維持 | 各APIで異なる情報が必要        |
| 結果マッピング      | 維持 | APIレスポンス構造の違いに対応  |

## テスト実行結果

```bash
pnpm --filter @repo/shared test -- --testPathPattern="fusion|reranking"
```

結果: 47/47 テスト成功

## 結論

現在の実装は適切な重複度合いを維持しており、過度な抽象化を避けている。
DRY原則の適用は、可読性・保守性とのバランスを考慮して判断した。

## 次のステップ

可読性の向上（タスク2）へ進む
