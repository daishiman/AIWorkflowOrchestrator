# Phase 11: エラーハンドリング確認 - エンティティ抽出サービス (NER)

## メタ情報

| 項目     | 内容                  |
| -------- | --------------------- |
| タスクID | CONV-06-04            |
| Phase    | 11                    |
| 作成日   | 2026-01-18            |
| 機能名   | entity-extraction-ner |

---

## 1. フォールバック動作確認

### 1.1 LLM接続エラー時のフォールバック

**テストケース**: TC-NER-004

**テスト手順**:

1. LLMプロバイダーをエラーを返すモックに設定
2. extract()メソッドを呼び出し
3. RuleBasedExtractorへのフォールバックを確認

**実行結果**:

```
✅ LLM障害時にRuleBasedExtractorにフォールバックできる
   - LLMEntityExtractor: エラー返却
   - RuleBasedEntityExtractor: 正常処理
   - modelUsed: "rule-based"
```

**判定**: ✅ PASS

### 1.2 フォールバック時の品質

| 項目         | LLM使用時 | フォールバック時 | 判定    |
| ------------ | --------- | ---------------- | ------- |
| 技術用語抽出 | 高精度    | 辞書ベース       | ✅ 許容 |
| 組織名抽出   | 高精度    | 辞書ベース       | ✅ 許容 |
| 日付パターン | 同等      | 同等             | ✅ 同等 |
| 説明文生成   | あり      | なし             | ⚠️ 制限 |

---

## 2. 不正入力のエラーハンドリング

### 2.1 空のチャンク

**テストケース**:

```typescript
const emptyChunk = { id: "test", content: "", ... };
const result = await extractor.extract(emptyChunk);
```

**期待結果**: 空の結果を返却（エラーではない）

**実行結果**:

```
✅ 空のチャンクを処理できる
   - entities: []
   - processingTimeMs: 記録あり
```

**判定**: ✅ PASS

### 2.2 非常に長いテキスト

**テストケース**: 100,000文字のテキスト

**実行結果**:

```
✅ 非常に長いテキストを処理できる
   - 処理完了
   - メモリリークなし
```

**判定**: ✅ PASS

### 2.3 特殊文字を含むテキスト

**テストケース**: Unicode特殊文字、絵文字、制御文字を含むテキスト

**実行結果**:

```
✅ 特殊文字を含むテキストを処理できる
   - 正常に処理完了
   - エンティティ抽出可能
```

**判定**: ✅ PASS

---

## 3. LLMレスポンスエラー

### 3.1 不正なJSON

**テストケース**: LLMが不正なJSONを返却

**実行結果**:

```
✅ 不正なJSONレスポンスをハンドリングする
   - パースエラーを検出
   - Result.errを返却
   - エラーコード: LLM_RESPONSE_PARSE
```

**判定**: ✅ PASS

### 3.2 空のエンティティ配列

**テストケース**: `{"entities": []}`

**実行結果**:

```
✅ 空のエンティティ配列を返すレスポンスを処理する
   - entities: []
   - 正常終了
```

**判定**: ✅ PASS

### 3.3 予期しないレスポンス構造

**テストケース**: スキーマ不一致のJSONレスポンス

**実行結果**:

```
✅ 予期しないレスポンス構造をハンドリングする
   - Zodバリデーションでエラー検出
   - Result.errを返却
```

**判定**: ✅ PASS

---

## 4. バッチ処理エラー

### 4.1 部分失敗

**テストケース**: 10チャンク中2チャンクが失敗するバッチ

**実行結果**:

```
✅ 一部のチャンクが失敗しても他は成功する
   - totalChunks: 10
   - successCount: 8
   - failureCount: 2
   - 成功分のみresultsに含まれる
```

**判定**: ✅ PASS

### 4.2 全失敗

**テストケース**: 全チャンクが処理失敗

**実行結果**:

```
✅ 全チャンクが失敗した場合の挙動
   - results: []
   - エラーログ出力
   - Result.ok（空結果）
```

**判定**: ✅ PASS

---

## 5. リソース制限

### 5.1 maxEntitiesPerChunk

**テストケース**: maxEntitiesPerChunk=5で大量エンティティを含むテキスト

**実行結果**:

```
✅ maxEntitiesPerChunk制限が適用される
   - 入力: 20エンティティ候補
   - 出力: 5エンティティ（上位confidence順）
```

**判定**: ✅ PASS

### 5.2 minConfidence

**テストケース**: minConfidence=0.8で低信頼度エンティティを含むテキスト

**実行結果**:

```
✅ minConfidenceフィルタリングが適用される
   - 信頼度0.8以上のみ出力
   - 低信頼度は除外
```

**判定**: ✅ PASS

---

## 6. エラーメッセージの適切性

### 6.1 エラーメッセージ確認

| エラー種別         | メッセージ                        | 判定    |
| ------------------ | --------------------------------- | ------- |
| INVALID_CHUNK      | "Invalid chunk: empty content"    | ✅ 明確 |
| LLM_TIMEOUT        | "LLM request timed out after Xms" | ✅ 明確 |
| LLM_RESPONSE_PARSE | "Failed to parse LLM response"    | ✅ 明確 |
| LLM_RATE_LIMIT     | "Rate limit exceeded"             | ✅ 明確 |

### 6.2 エラーコンテキスト

| 確認項目         | 結果    |
| ---------------- | ------- |
| エラーコード付与 | ✅ あり |
| 原因チェーン保持 | ✅ あり |
| コンテキスト情報 | ✅ あり |
| スタックトレース | ✅ あり |

---

## 7. エラーハンドリング統合テスト結果

**統合テスト実行結果**:

```
 ✓ Integration: Error Handling Tests > 入力バリデーション > 空のチャンクを処理できる
 ✓ Integration: Error Handling Tests > 入力バリデーション > 非常に長いテキストを処理できる
 ✓ Integration: Error Handling Tests > 入力バリデーション > 特殊文字を含むテキストを処理できる
 ✓ Integration: Error Handling Tests > LLMレスポンスエラー > 不正なJSONレスポンスをハンドリングする
 ✓ Integration: Error Handling Tests > LLMレスポンスエラー > 空のエンティティ配列を返すレスポンスを処理する
 ✓ Integration: Error Handling Tests > LLMレスポンスエラー > 予期しないレスポンス構造をハンドリングする
 ✓ Integration: Error Handling Tests > バッチ処理エラー > 一部のチャンクが失敗しても他は成功する
 ✓ Integration: Error Handling Tests > バッチ処理エラー > 全チャンクが失敗した場合の挙動
 ✓ Integration: Error Handling Tests > リソース制限 > maxEntitiesPerChunk制限が適用される
 ✓ Integration: Error Handling Tests > リソース制限 > minConfidenceフィルタリングが適用される

 Test Files  1 passed
      Tests  10 passed (10)
```

---

## 8. エラーハンドリングサマリー

| カテゴリ             | 結果    |
| -------------------- | ------- |
| フォールバック動作   | ✅ PASS |
| 不正入力ハンドリング | ✅ PASS |
| LLMレスポンスエラー  | ✅ PASS |
| バッチ処理エラー     | ✅ PASS |
| リソース制限         | ✅ PASS |
| エラーメッセージ品質 | ✅ PASS |

**総合判定**: ✅ **エラーハンドリング確認完了**

---

## 更新履歴

| 日付       | 更新内容 | 担当 |
| ---------- | -------- | ---- |
| 2026-01-18 | 初版作成 | AI   |
