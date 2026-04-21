# Phase 5 実装ノート

## 実装要約

- `TokenEmbeddingsResult` と `IEmbeddingClient.getTokenEmbeddings?()` を追加し、既存 provider を壊さない optional 契約にした
- `ChunkingService.chunk()` の本流 Late Chunking で `getTokenEmbeddings?()` を優先利用するよう修正した
- provider 未実装時は `embed(text)` 1回の近似フォールバックを維持しつつ、返却件数を常に `chunks.length` に合わせた
- token 文字列を元テキスト上の span に近似マッピングし、チャンク境界と重なる token 埋め込みを平均化する集約処理を追加した

## 実装判断

1. 後方互換性:
   `getTokenEmbeddings` は optional に据え置き、既存 provider 実装の変更を不要にした。

2. 本流接続:
   追加契約を public helper のみで閉じず、`chunk()` から到達する `applyLateChunkingInternal()` に接続した。

3. fallback 意味論:
   token-level provider が無い場合でも「1 chunk = 1 vector」を守るため、単一埋め込みを token 列へ複製し、その後チャンク単位へ再集約する形に統一した。

4. 境界マッピング:
   本 task では最小実装として token 文字列の span 推定を採用し、real provider / encoder の厳密 offset mapping は follow-up とした。
