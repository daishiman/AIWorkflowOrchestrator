# テスト仕様書 - Phase 4

## テストファイル一覧

| ファイル                            | テスト数 | 対象            |
| ----------------------------------- | -------- | --------------- |
| `token-boundary-calculator.test.ts` | 5        | FR-002          |
| `hidden-state-pooler.test.ts`       | 5        | FR-003          |
| `window-splitter.test.ts`           | 5        | FR-004          |
| `late-chunking-service.test.ts`     | 5        | FR-001          |
| `late-chunking-edge.test.ts`        | 5        | AC-004, NFR-002 |

## 主要テストケース

- 正常系: 文字オフセット→トークンインデックス変換
- 正常系: Mean/Max/CLSプーリング
- 正常系: ウィンドウ分割（超過時・非超過時）
- 正常系: LateChunkingService E2Eフロー
- 異常系: InvalidBoundaryError, RangeError, エンコーダ失敗
