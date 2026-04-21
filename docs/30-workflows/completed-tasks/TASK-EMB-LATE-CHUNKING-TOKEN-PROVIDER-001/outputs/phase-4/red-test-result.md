# Phase 4 RED テスト結果

## 状態: RED（実装前）

Phase 5 コード実装前にテストを追加した時点での状態。

## 失敗内容

`applyLateChunking` public メソッドが `ChunkingService` に存在しないため、
TP-01〜TP-05 および長文テスト・グローバルオフセットテストは全件コンパイルエラーまたは実行時エラーとなる。

`MockTokenEmbeddingClient` ファイルが存在しないため TP-03・TP-04 は動的 import エラーとなる。

## 追加したテスト

- TP-01: getTokenEmbeddings を持つクライアントで Late Chunking 適用
- TP-02: getTokenEmbeddings を持たないクライアントはフォールバック
- TP-03: MockTokenEmbeddingClient の型整合性
- TP-04: チャンク境界とトークン隠れ状態の対応確認
- TP-05: TokenEmbeddingsResult の lengths 不一致エラー
- 長文テキスト（maxSequenceLength 超過）での Late Chunking 動作
- セグメント内ローカルトークン位置とグローバルトークン位置の変換

## 対象ファイル

- `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts`
