# 命名規則分析

## ファイル命名規則

| 種別             | パターン              | 例                        |
| ---------------- | --------------------- | ------------------------- |
| サービスクラス   | `kebab-case.ts`       | `embedding-service.ts`    |
| 型定義           | `kebab-case.types.ts` | `embedding.types.ts`      |
| インターフェース | `interfaces.ts`       | `providers/interfaces.ts` |
| テスト           | `*.test.ts`           | `batch-processor.test.ts` |
| エラー           | `errors.ts`           | `types/errors.ts`         |

## クラス・型命名規則

| 種別             | パターン               | 例                                     |
| ---------------- | ---------------------- | -------------------------------------- |
| クラス           | `PascalCase`           | `EmbeddingService`, `MetricsCollector` |
| インターフェース | `I` + `PascalCase`     | `IEmbeddingProvider`                   |
| 型エイリアス     | `PascalCase`           | `EmbeddingModelId`, `PoolingStrategy`  |
| エラークラス     | `PascalCase` + `Error` | `EmbeddingError`, `TokenLimitError`    |

## 後続Phaseで使用する命名規則

| 要素                     | 命名                                       |
| ------------------------ | ------------------------------------------ |
| ディレクトリ             | `late-chunking/`                           |
| 型ファイル               | `late-chunking-types.ts`                   |
| インターフェースファイル | `late-chunking-interfaces.ts`              |
| サービスクラス           | `LateChunkingService`                      |
| 境界計算クラス           | `TokenBoundaryCalculator`                  |
| プーリングクラス         | `HiddenStatePooler`                        |
| 分割クラス               | `WindowSplitter`                           |
| エラークラス             | `InvalidBoundaryError`, `OutOfMemoryError` |
