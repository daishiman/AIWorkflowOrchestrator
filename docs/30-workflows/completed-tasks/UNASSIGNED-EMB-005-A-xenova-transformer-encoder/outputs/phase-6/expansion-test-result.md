# Phase 6 テスト拡充結果

## 実行日時

2026-04-20 16:53:51

## 追加テストケース

### 統合テスト（XENC-INT-01〜06）

```
 ✓ XENC-INT-01: generateChunkEmbeddings が 1 チャンクで ChunkEmbeddingResult を返す
 ✓ XENC-INT-02: 複数チャンク（3件）で chunkId と tokenCount が正しい
 ✓ XENC-INT-03: mean pooling で embedding が配列を返す
 ✓ XENC-INT-04: DI 互換性 - new LateChunkingService(new XenovaTransformerEncoder()) がコンパイル・実行可能
 ✓ XENC-INT-05: encode が EmbeddingError を投げると generateChunkEmbeddings が伝搬する
 ✓ XENC-INT-06: OutOfMemoryError が LateChunkingService を通り抜けて届く
```

### 追加境界ケース（XENC-BOUNDARY-05〜09）

```
 ✓ XENC-BOUNDARY-05: CJK 文字列で offsetMapping の各ペアが数値ペアである
 ✓ XENC-BOUNDARY-06: 絵文字を含む文字列でも offsetMapping が壊れない
 ✓ XENC-BOUNDARY-07: 大規模テキスト（seqLen=2048）で通常終了する
 ✓ XENC-BOUNDARY-08: 単一トークン（seqLen=1）で長さが 1 になる
 ✓ XENC-BOUNDARY-09: 奇数長 offset_mapping で末尾を破棄して安全に動作する
```

### 回帰テスト（XENC-REG-01〜05）

```
 ✓ XENC-REG-01: XenovaTransformerEncoder が IEncoder 型変数に代入可能
 ✓ XENC-REG-02: EncoderOutput のキーが hiddenStates / offsetMapping の 2 つのみ
 ✓ XENC-REG-03: last_hidden_state が undefined でも hidden_states fallback で動作する
 ✓ XENC-REG-04: デフォルトモデル名が Xenova/all-MiniLM-L6-v2
 ✓ XENC-REG-05: OutOfMemoryError が EmbeddingError を継承している（instanceof）
```

## 全体テスト結果

```
Test Files  8 passed (8)
     Tests  66 passed (66)
  Duration  5.51s
```

## AC-6 達成根拠

XENC-INT-01〜04 により `LateChunkingService` への DI と `generateChunkEmbeddings()` の動作を確認。

## 追加改善

- `XENC-ERROR-09`: tokenizer 呼び出し失敗も `EmbeddingError` に正規化されることを追加確認

## 実モデルアクセス: なし（全テスト vi.mock で完結）
