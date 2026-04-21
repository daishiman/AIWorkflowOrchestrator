# Phase 5 Green テスト結果

## 実行日時

2026-04-20 16:52:36

## テスト実行結果

```
 ✓ XENC-NORMAL-01: encode() が hiddenStates/offsetMapping の形状を返す
 ✓ XENC-NORMAL-02: hiddenStates.length === offsetMapping.length（seqLen 整合）
 ✓ XENC-NORMAL-03: モデル名未指定で Xenova/all-MiniLM-L6-v2 が from_pretrained に渡る
 ✓ XENC-NORMAL-04: カスタムモデル名が両 API に伝播する
 ✓ XENC-NORMAL-05: encode を 2 回呼んでも from_pretrained は各 1 回のみ
 ✓ XENC-NORMAL-06: IEncoder 互換（encode メソッド存在・Promise<EncoderOutput> 返却）
 ✓ XENC-ERROR-01: AutoModel.from_pretrained が reject → EmbeddingError
 ✓ XENC-ERROR-02: AutoTokenizer.from_pretrained が reject → EmbeddingError
 ✓ XENC-ERROR-03: OOM（loadModel）→ OutOfMemoryError
 ✓ XENC-ERROR-04: OOM（encode推論時）→ OutOfMemoryError
 ✓ XENC-ERROR-05: model(inputs) が reject → EmbeddingError
 ✓ XENC-ERROR-06: hidden_states 欠落 → EmbeddingError
 ✓ XENC-ERROR-07: スロー例外の cause に元エラーが含まれる
 ✓ XENC-ERROR-08: 既に EmbeddingError のとき再ラップせずそのまま再スロー
 ✓ XENC-BOUNDARY-01: encode('') で hiddenStates:[], offsetMapping:[] を返す
 ✓ XENC-BOUNDARY-02: 長文（seqLen=512）で hiddenStates 長が seqLen と一致
 ✓ XENC-BOUNDARY-03: flat offset_mapping → [number,number][] 変換が正確
 ✓ XENC-BOUNDARY-04: 返却 Float32Array が元バッファを共有しない（slice コピー）

Test Files  1 passed (1)
     Tests  18 passed (18)
  Duration  1.08s
```

## AC 達成状況

| AC   | 状態 | 根拠テスト                           |
| ---- | ---- | ------------------------------------ |
| AC-1 | ✅   | XENC-NORMAL-06 + typecheck PASS      |
| AC-2 | ✅   | XENC-NORMAL-01, 02, XENC-BOUNDARY-03 |
| AC-3 | ✅   | XENC-ERROR-01, 02, 05, 06            |
| AC-4 | ✅   | XENC-ERROR-03, 04                    |
| AC-5 | ✅   | XENC-NORMAL-03, 04                   |
| AC-7 | ✅   | index.ts にエクスポート追加済み      |
