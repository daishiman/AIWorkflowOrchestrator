# Reranking APIリトライ機構 - タスク指示書

## メタ情報

```yaml
issue_number: 360
```

## メタ情報

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| タスクID     | CONV-07-05-RES-01                    |
| タスク名     | Reranking APIリトライ機構            |
| 分類         | 改善                                 |
| 対象機能     | Rerankingサービス（API呼び出し層）   |
| 優先度       | 中                                   |
| 見積もり規模 | 中規模                               |
| ステータス   | 未実施                               |
| 発見元       | Phase 11（手動テスト検証）           |
| 発見日       | 2026-01-14                           |
| 親タスク     | CONV-07-05（RRF Fusion + Reranking） |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

CONV-07-05でRRF Fusion + Reranking機能を実装した。CohereRerankerとVoyageRerankerは外部APIを呼び出すが、現状ではAPI失敗時に即座にエラーを返却している。一時的なネットワーク障害やレート制限（429）に対して、自動リトライ機構があると耐障害性が向上する。

### 1.2 問題点・課題

- API一時障害時に即座にエラー返却
- レート制限（429）時のリトライなし
- ネットワーク断続時の耐障害性が低い

### 1.3 放置した場合の影響

- **影響度**: 中
- 一時的な障害でユーザーにエラーが表示される
- レート制限時に自動回復しない
- ただし、LLMReranker/NoOpRerankerへのフォールバックは可能

---

## 2. 何を達成するか（What）

### 2.1 目的

外部API呼び出し時の一時障害に対して、指数バックオフによる自動リトライを実装し、耐障害性を向上させる。

### 2.2 最終ゴール

- 指数バックオフによる自動リトライ
- レート制限（429）時のRetry-Afterヘッダー対応
- 最大リトライ回数・タイムアウト設定可能
- リトライ状況のロギング

### 2.3 スコープ

#### 含むもの

- CohereRerankerへのリトライ機構追加
- VoyageRerankerへのリトライ機構追加
- 共通リトライユーティリティ
- リトライ設定オプション

#### 含まないもの

- LLMRerankerへのリトライ（LLMクライアント側で対応）
- サーキットブレーカーパターン - 将来対応

### 2.4 成果物

| 成果物                 | 説明                                |
| ---------------------- | ----------------------------------- |
| RetryUtilityクラス     | 指数バックオフリトライ実装          |
| CohereRerankerリトライ | Cohere API呼び出しへの統合          |
| VoyageRerankerリトライ | Voyage API呼び出しへの統合          |
| リトライ設定オプション | maxRetries, baseDelayMs, maxDelayMs |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- CONV-07-05（RRF Fusion + Reranking）が完了していること

### 3.2 依存タスク

| タスクID   | タスク名               | ステータス |
| ---------- | ---------------------- | ---------- |
| CONV-07-05 | RRF Fusion + Reranking | 完了       |

### 3.3 必要な知識

- 指数バックオフアルゴリズム
- HTTPステータスコード（429, 500, 502, 503, 504）
- Retry-Afterヘッダー解析
- TypeScript非同期処理

### 3.4 推奨アプローチ

```typescript
interface RetryOptions {
  maxRetries: number; // 最大リトライ回数（デフォルト: 3）
  baseDelayMs: number; // 基本遅延（デフォルト: 1000ms）
  maxDelayMs: number; // 最大遅延（デフォルト: 30000ms）
  retryableStatuses: number[]; // リトライ対象ステータス
}

async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
): Promise<T>;

// 使用例
const response = await withRetry(() => fetch(endpoint, requestOptions), {
  maxRetries: 3,
  baseDelayMs: 1000,
});
```

**指数バックオフ計算式**:

```
delay = min(baseDelayMs * 2^attempt + jitter, maxDelayMs)
```

---

## 4. 実行手順

### Phase構成

| Phase | 内容                       |
| ----- | -------------------------- |
| 1     | リトライユーティリティ設計 |
| 2     | 指数バックオフ実装         |
| 3     | CohereRerankerへの統合     |
| 4     | VoyageRerankerへの統合     |
| 5     | テスト・検証               |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 5xx エラー時にリトライされる
- [ ] 429 エラー時にRetry-Afterを尊重してリトライ
- [ ] 最大リトライ回数を超えた場合にエラー返却
- [ ] 指数バックオフで遅延が増加する
- [ ] ジッターが適用される（同時リトライ回避）

### 品質要件

- [ ] ユニットテストカバレッジ80%+
- [ ] 一時障害シミュレーションテストがある
- [ ] リトライログが出力される

### ドキュメント要件

- [ ] リトライ設定ガイドがドキュメント化されている
- [ ] エラーハンドリングフローがドキュメント化されている

---

## 6. 検証方法

### テストケース

1. 500エラー後の自動リトライで成功
2. 429エラー後のRetry-After待機で成功
3. 最大リトライ回数超過でエラー返却
4. 指数バックオフで遅延が増加すること

### 検証手順

1. モックサーバーで一時障害をシミュレート
2. リトライ動作を確認（ログ出力）
3. 最終的に成功することを確認
4. リトライ回数超過時のエラーハンドリングを確認

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                          |
| ---------------------------- | ------ | -------- | ----------------------------- |
| リトライによるレスポンス遅延 | 中     | 高       | 適切なタイムアウト設定        |
| 無限リトライ                 | 高     | 低       | 最大リトライ回数の厳格な制限  |
| レート制限の悪化             | 中     | 中       | Retry-After尊重、ジッター適用 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント           | パス                                                                      |
| ---------------------- | ------------------------------------------------------------------------- |
| CohereReranker         | `packages/shared/src/services/search/reranking/cross-encoder-reranker.ts` |
| VoyageReranker         | `packages/shared/src/services/search/reranking/cross-encoder-reranker.ts` |
| RRF Fusionタスク仕様書 | `docs/30-workflows/rrf-fusion-reranking/`                                 |

### 参考資料

- [Exponential Backoff And Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
- Cohere API Rate Limits: https://docs.cohere.com/docs/rate-limits
- Voyage AI API: https://docs.voyageai.com/

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Phase 11 手動テスト検証 - 改善提案:
API失敗時の自動リトライ（指数バックオフ）があると耐障害性が向上する
```

### 補足事項

- 将来的にはサーキットブレーカーパターンの導入を検討
- NoOpRerankerへの自動フォールバックとの連携も考慮
