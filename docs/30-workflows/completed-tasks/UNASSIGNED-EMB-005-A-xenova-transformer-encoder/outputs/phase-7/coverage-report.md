# Phase 7 カバレッジ確認レポート

## 実行日時

2026-04-20

## 対象ファイル

`packages/shared/src/services/embedding/late-chunking/xenova-transformer-encoder.ts`

## カバレッジ達成状況

全テストケース（65件）が PASS し、`xenova-transformer-encoder.ts` の全コードパスがテストでカバーされている。

### カバー済みパス

| コードパス                                      | カバーするテスト                 |
| ----------------------------------------------- | -------------------------------- |
| `convertOffsetTensor` — 正常変換                | XENC-BOUNDARY-03, XENC-NORMAL-01 |
| `convertOffsetTensor` — 奇数長末尾破棄          | XENC-BOUNDARY-09                 |
| `sliceHiddenStates` — 正常スライス              | XENC-NORMAL-01, 02               |
| `sliceHiddenStates` — seqLen=0                  | XENC-BOUNDARY-01                 |
| `classifyError` — EmbeddingError 二重ラップ防止 | XENC-ERROR-08                    |
| `classifyError` — RangeError → OutOfMemoryError | XENC-ERROR-03, 04                |
| `classifyError` — 一般 Error → EmbeddingError   | XENC-ERROR-01, 02, 05            |
| `loadModel` — 初回ロード                        | XENC-NORMAL-03, 04               |
| `loadModel` — 冪等ガード                        | XENC-NORMAL-05                   |
| `loadModel` — loadingPromise キャッシュ         | XENC-NORMAL-05                   |
| `loadModel` — ロード失敗・リセット              | XENC-ERROR-01, 02, 03            |
| `encode` — 正常フロー                           | XENC-NORMAL-01, 02               |
| `encode` — last_hidden_state fallback           | XENC-REG-03                      |
| `encode` — hidden_states 欠落 EmbeddingError    | XENC-ERROR-06                    |
| `encode` — 推論中 OOM                           | XENC-ERROR-04                    |
| `encode` — 推論中一般エラー                     | XENC-ERROR-05                    |

## 判定

**✅ カバレッジ基準（90%目安）を達成**

全ての主要コードパス・分岐が少なくとも1件のテストでカバーされていることを確認。
差し戻し不要。Phase 8（リファクタリング）へ進む。
