# Phase 6: 現在のカバレッジ（拡充前）

## 実行日時

2026-01-14

## 実行コマンド

```bash
pnpm --filter @repo/shared test:coverage -- --testPathPattern="fusion|reranking"
```

## カバレッジ結果（拡充前）

### サマリー

| ファイル                            | Lines  | Branch | Functions | Uncovered Lines |
| ----------------------------------- | ------ | ------ | --------- | --------------- |
| fusion/rrf-fusion.ts                | 92.31% | 85.71% | 100%      | 127             |
| fusion/types.ts                     | 100%   | 100%   | 100%      | -               |
| reranking/cross-encoder-reranker.ts | 87.50% | 75.00% | 100%      | 153, 224-228    |
| reranking/types.ts                  | 100%   | 100%   | 100%      | -               |

### 全体カバレッジ

| 指標               | 値     |
| ------------------ | ------ |
| Line Coverage      | 89.90% |
| Branch Coverage    | 80.36% |
| Function Coverage  | 100%   |
| Statement Coverage | 89.90% |

## 不足箇所の特定

### fusion/rrf-fusion.ts

- Line 127: `default`ケースのreturn文（未知の戦略名の場合）

### reranking/cross-encoder-reranker.ts

- Line 153: `parseScores`のcatchブロック内エラーハンドリング
- Lines 224-228: `VoyageReranker`のネットワークエラーハンドリング

## 追加テストが必要な箇所

### RRFFusion

1. 境界値テスト
   - 結果数が1件のみの場合
   - 結果数が100件を超える場合
   - 重みが0の戦略がある場合
   - 重みが1の戦略のみの場合

2. エッジケース
   - 全戦略が同じチャンクを返す場合
   - 各戦略が完全に異なるチャンクを返す場合
   - スコアが0のチャンクがある場合

3. 正規化テスト
   - kパラメータ変更時のスコア変化
   - 大量の結果でもスコアが0-1範囲に収まる

### Reranker

1. バッチ処理テスト
   - バッチサイズより多い候補を処理
   - バッチサイズと同数の候補を処理
   - バッチサイズより少ない候補を処理

2. エラーハンドリングテスト
   - ネットワークエラー時
   - レート制限エラー時
   - 認証エラー時
   - 不正なレスポンス形式時

### 統合テスト

1. 異常系シナリオ
   - Fusion入力が空の場合
   - Reranker入力が空の場合
   - 複数Rerankerが連続で失敗した場合

2. パフォーマンステスト
   - 1000件の結果を処理できる
   - 大量の重複チャンクを処理できる

## 次のステップ

上記の不足箇所に対してテストを追加し、カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）の達成を確認する。
