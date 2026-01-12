# Phase 1: 受け入れ基準定義書

## 目的

Phase完了時に検証する受け入れ基準を明確化し、品質ゲートを定義する。

---

## 1. 機能受け入れ基準

### AC-01: ISearchStrategy実装

**基準**: VectorSearchStrategyがISearchStrategyインターフェースを正しく実装している

**検証方法**:

```typescript
// TypeScript型チェックでコンパイルエラーがないこと
const strategy: ISearchStrategy = new VectorSearchStrategy(deps);
```

**判定**:

- [ ] ISearchStrategyのすべてのメソッドを実装
- [ ] 型定義に準拠（strictモード）
- [ ] コンパイルエラーなし

---

### AC-02: search()メソッド動作

**基準**: search()メソッドが正常に動作し、SearchResultを返す

**検証方法**:

```typescript
const result = await strategy.search(query, filters, options);
expect(result.isOk()).toBe(true);
expect(result.value.results).toBeInstanceOf(Array);
```

**判定**:

- [ ] 正常なクエリでResult.ok()を返す
- [ ] SearchResult型に準拠した結果を返す
- [ ] results配列が空の場合も正常に動作

---

### AC-03: コサイン類似度範囲

**基準**: コサイン類似度スコアが0-1の範囲で返される

**検証方法**:

```typescript
const result = await strategy.search(query);
for (const item of result.value.results) {
  expect(item.score).toBeGreaterThanOrEqual(0);
  expect(item.score).toBeLessThanOrEqual(1);
  expect(item.relevance.semantic).toBeGreaterThanOrEqual(0);
  expect(item.relevance.semantic).toBeLessThanOrEqual(1);
}
```

**判定**:

- [ ] score: 0.0-1.0の範囲
- [ ] relevance.semantic: 0.0-1.0の範囲
- [ ] 距離0.0 → 類似度1.0（完全一致）
- [ ] 距離2.0 → 類似度0.0（正反対）

---

### AC-04: フィルター適用

**基準**: SearchFiltersのフィルター条件が正しく適用される

**検証方法**:

```typescript
// fileIdsフィルター
const filters = { fileIds: ["file-1", "file-2"], minRelevance: 0.5 };
const result = await strategy.search(query, filters);
for (const item of result.value.results) {
  expect(["file-1", "file-2"]).toContain(item.sources.fileId);
  expect(item.score).toBeGreaterThanOrEqual(0.5);
}
```

**判定**:

- [ ] fileIdsフィルターが正しく適用される
- [ ] minRelevance閾値が正しく適用される
- [ ] フィルター外の結果が含まれない

---

### AC-05: エラーハンドリング

**基準**: エラー時にResult.err()が返される

**検証方法**:

```typescript
// 埋め込み生成失敗時
const mockProvider = {
  embed: vi.fn().mockRejectedValue(new Error("API Error")),
};
const strategy = new VectorSearchStrategy({
  embeddingProvider: mockProvider,
  db,
});
const result = await strategy.search(query);
expect(result.isErr()).toBe(true);
expect(result.error).toBeInstanceOf(Error);
```

**エラーケース**:

- [ ] 埋め込み生成失敗 → EmbeddingError
- [ ] データベースエラー → DatabaseError
- [ ] バリデーションエラー → ValidationError
- [ ] タイムアウト → TimeoutError

---

### AC-06: パフォーマンス目標

**基準**: パフォーマンス目標を達成する

**検証方法**:

```typescript
const start = performance.now();
const result = await strategy.search(query);
const elapsed = performance.now() - start;
expect(elapsed).toBeLessThan(100); // 100ms以下
```

**判定**（埋め込み生成時間を除く）:

- [ ] < 10,000件: 50ms以下
- [ ] 10,000-100,000件: 100ms以下
- [ ] > 100,000件: 200ms以下

---

## 2. テストカバレッジ基準

### 最終目標（Phase 7で検証）

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

## 3. コード品質基準

### Lintチェック

- [ ] ESLintエラー: 0件
- [ ] ESLint警告: 0件（または許容リスト内）

### 型チェック

- [ ] TypeScriptコンパイルエラー: 0件
- [ ] strictモード準拠
- [ ] any型使用: 0件

### セキュリティ

- [ ] SQLインジェクション対策（パラメータ化クエリ）
- [ ] 入力バリデーション実装

---

## 4. 統合テスト基準

### IEmbeddingProvider連携

**基準**: IEmbeddingProviderとの連携が正常に動作する

**検証シナリオ**:

1. 正常な埋め込み生成 → 検索成功
2. 埋め込み生成タイムアウト → エラー返却
3. API障害 → リトライ後エラー返却

---

### データベース連携

**基準**: libSQLデータベースとの連携が正常に動作する

**検証シナリオ**:

1. ベクトル検索 → 類似チャンク取得
2. フィルター適用 → 正しい結果セット
3. 空の結果 → 空配列返却
4. データベースエラー → エラー返却

---

## 5. ドキュメント基準

### Phase 12で検証

- [ ] 実装ガイドが完成している
- [ ] APIドキュメントが完成している
- [ ] 使用例が含まれている

---

## 6. 受け入れテストマトリクス

| ID    | テスト項目           | 検証Phase | 必須/任意 |
| ----- | -------------------- | --------- | --------- |
| AC-01 | ISearchStrategy実装  | Phase 5   | 必須      |
| AC-02 | search()メソッド動作 | Phase 5   | 必須      |
| AC-03 | 類似度範囲           | Phase 5   | 必須      |
| AC-04 | フィルター適用       | Phase 5   | 必須      |
| AC-05 | エラーハンドリング   | Phase 5   | 必須      |
| AC-06 | パフォーマンス       | Phase 7   | 必須      |
| TC-01 | Lineカバレッジ80%    | Phase 7   | 必須      |
| TC-02 | Branchカバレッジ60%  | Phase 7   | 必須      |
| CQ-01 | Lintチェック         | Phase 9   | 必須      |
| CQ-02 | 型チェック           | Phase 9   | 必須      |
| IT-01 | 埋め込みプロバイダー | Phase 6   | 必須      |
| IT-02 | データベース連携     | Phase 6   | 必須      |

---

## 7. ゲート判定基準

### Phase 3（設計レビューゲート）

| 判定     | 条件                              |
| -------- | --------------------------------- |
| PASS     | 設計に問題なし、実装可能          |
| MINOR    | 軽微な修正後に実装可能            |
| MAJOR    | 設計見直し必要（Phase 2へ戻る）   |
| CRITICAL | 根本的な問題あり（Phase 1へ戻る） |

### Phase 7（カバレッジゲート）

| 判定 | 条件                            |
| ---- | ------------------------------- |
| PASS | 全カバレッジ目標達成            |
| FAIL | カバレッジ未達（Phase 6へ戻る） |

### Phase 10（最終レビューゲート）

| 判定     | 条件                       |
| -------- | -------------------------- |
| PASS     | 全品質基準達成、マージ可能 |
| MINOR    | 軽微な修正後にマージ可能   |
| MAJOR    | 実装/テスト見直し必要      |
| CRITICAL | 根本的な問題あり           |

---

## まとめ

本受け入れ基準は、VectorSearchStrategyの品質を保証するための検証ポイントを定義しています。各Phaseで該当する基準を検証し、品質ゲートを通過することで高品質な実装を実現します。
