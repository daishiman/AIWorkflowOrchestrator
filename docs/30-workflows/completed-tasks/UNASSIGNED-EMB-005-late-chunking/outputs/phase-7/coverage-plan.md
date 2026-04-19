# カバレッジ計画 - Phase 7

## 計測対象

| ファイル                       | 行   | 分岐 | 関数 |
| ------------------------------ | ---- | ---- | ---- |
| `token-boundary-calculator.ts` | ~90% | ~85% | 100% |
| `hidden-state-pooler.ts`       | ~95% | ~90% | 100% |
| `window-splitter.ts`           | ~90% | ~85% | 100% |
| `late-chunking-service.ts`     | ~85% | ~80% | 100% |

## カバレッジ目標

- 行カバレッジ: ≥ 80%
- 関数カバレッジ: ≥ 80%
- 分岐カバレッジ: ≥ 75%

## 未到達が想定される箇所

| 箇所                           | 理由                       |
| ------------------------------ | -------------------------- |
| `useFloat16` 分岐              | 実際のFloat16Array環境依存 |
| `windowOverlapTokens=0` エッジ | テスト追加推奨             |

## 対応方針

vitest.config.tsのcoverage excludeに `**/late-chunking-types.ts` を含めないよう確認済み（型定義ファイルは除外対象に含まれない）。
