# エラーハンドリング ディシジョンテーブル

## エラー分類テーブル

| 発生箇所               | エラー種別                                             | 判定条件                                                               | 投げる例外         | メッセージ例                                            |
| ---------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------ | ------------------------------------------------------- |
| `loadModel()` ネット系 | HTTPエラー / モデル未発見                              | 上記以外の一般 Error                                                   | `EmbeddingError`   | `モデルの読み込みに失敗しました: {model}`               |
| `loadModel()` メモリ系 | OOM                                                    | `cause instanceof RangeError` または `/out of memory\|oom/i.test(msg)` | `OutOfMemoryError` | `モデル読み込み中にメモリ不足が発生しました`            |
| `encode()` 推論系      | tokenizer/model 呼び出し失敗                           | 上記以外の一般 Error                                                   | `EmbeddingError`   | `テキストのエンコードに失敗しました`                    |
| `encode()` メモリ系    | OOM                                                    | `cause instanceof RangeError` または `/out of memory\|oom/i.test(msg)` | `OutOfMemoryError` | `テキストエンコード中にメモリ不足が発生しました`        |
| `encode()` 出力欠落    | `last_hidden_state` / `hidden_states` が共に undefined | 出力オブジェクト検査                                                   | `EmbeddingError`   | `モデルの出力から hidden states を取得できませんでした` |

## `classifyError` 擬似コード

```typescript
function classifyError(
  cause: unknown,
  ctx: "load" | "encode",
  model: string,
): Error {
  // 既に EmbeddingError 系なら再ラップせずそのまま返す（二重ラップ防止）
  if (cause instanceof EmbeddingError) return cause;

  // OOM 判定
  const msg = cause instanceof Error ? cause.message : String(cause);
  if (cause instanceof RangeError || /out of memory|oom/i.test(msg)) {
    return new OutOfMemoryError(
      ctx === "load"
        ? "モデル読み込み中にメモリ不足が発生しました"
        : "テキストエンコード中にメモリ不足が発生しました",
      { cause },
    );
  }

  // 一般エラー
  return new EmbeddingError(
    ctx === "load"
      ? `モデルの読み込みに失敗しました: ${model}`
      : "テキストのエンコードに失敗しました",
    { cause },
  );
}
```

## 設計上のポイント

1. **`cause` 保持必須**: `{ cause }` オプションで元エラーの stack trace を維持
2. **二重ラップ防止**: `instanceof EmbeddingError` を最初にチェックし、既にラップ済みならそのまま再スロー
3. **OOM パターン**: `RangeError` と OOM 文字列マッチの2系統でカバー（`@xenova/transformers` の実装に依存しない）
4. **エラーメッセージのモデル名**: `ctx === "load"` 時のみモデル名を含める（運用デバッグ支援）
5. **中央集約**: `classifyError` に全エラー分類を集約し、Phase 6 でユニットテスト可能

## AC 対応

| AC                       | 対応箇所                                                       |
| ------------------------ | -------------------------------------------------------------- |
| AC-3（EmbeddingError）   | `loadModel()` ネット系, `encode()` 推論系, `encode()` 出力欠落 |
| AC-4（OutOfMemoryError） | `loadModel()` メモリ系, `encode()` メモリ系                    |
