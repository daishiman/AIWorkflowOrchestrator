# テスト戦略書

## テスト分類

| 分類           | ファイル                            | 目的                   |
| -------------- | ----------------------------------- | ---------------------- |
| ユニットテスト | `token-boundary-calculator.test.ts` | オフセット変換の正確性 |
| ユニットテスト | `hidden-state-pooler.test.ts`       | Mean/Max/CLSプーリング |
| ユニットテスト | `window-splitter.test.ts`           | ウィンドウ分割ロジック |
| 統合テスト     | `late-chunking-service.test.ts`     | 全コンポーネント連携   |
| 異常系テスト   | `late-chunking-edge.test.ts`        | エラー・境界条件       |

## モック戦略

- エンコーダー（Transformerモデル）はインターフェース (`IEncoder`) を定義してモック注入
- `createMockHiddenStates(tokenCount, hiddenDim)` ヘルパーで再現性ある Hidden State を生成
- `createTestChunkBoundaries(text, chunkSize)` で境界配列を自動生成

## 品質比較テスト

- Late vs Early Chunking の MRR差分を測定
- 同一クエリ・コーパスで両方式のコサイン類似度ランクを比較
- ベンチマーク結果は `outputs/phase-11/` に記録
