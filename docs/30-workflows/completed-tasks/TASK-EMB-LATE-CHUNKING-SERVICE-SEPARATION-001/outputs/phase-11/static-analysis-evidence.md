# Static Analysis Evidence - Phase 11

## 証跡の位置づけ

NON_VISUAL タスクの手動テスト代替証跡。静的解析（typecheck / lint / 依存方向）による品質保証記録。

## 証跡 1: TypeScript 型チェック

### コマンド

```bash
pnpm exec tsc --noEmit
```

### 結果

```
(exit 0, stdout 空)
```

型エラー 0 件。

### 検証内容

- `ChunkingLateChunkingAdapter` のコンストラクタ・public メソッドシグネチャ
- `ChunkingService` の新規コンストラクタ第 4 引数型
- `Chunk` / `LateChunkingOptions` / `ITokenizer` / `IEmbeddingClient` の型整合
- `type` import と値 import の分離
- Optional chaining (`?.`) / nullish coalescing (`??`) の適切な利用

## 証跡 2: ESLint 静的解析

### コマンド

```bash
pnpm exec eslint \
  src/services/embedding/late-chunking/chunking-late-chunking-adapter.ts \
  src/services/embedding/late-chunking/__tests__/chunking-late-chunking-adapter.test.ts \
  src/services/embedding/late-chunking/index.ts \
  src/services/chunking/chunking-service.ts \
  src/services/chunking/__tests__/chunking-service.integration.test.ts
```

### 結果

```
(エラー 0 件・警告 0 件)
```

※ `.eslintignore` 非推奨警告は ESLint フレームワーク側の既知通知であり、本タスクコードとは無関係。

### 検証内容

- 未使用 import なし
- `any` 型の使用なし（既存 `invalid` as any は本タスク範囲外）
- Promise 戻り値の適切な処理
- テンプレートリテラルと文字列連結の一貫性
- async/await / Promise チェーンの適切な利用

## 証跡 3: 依存方向チェック

### 対象

本タスクで変更された 5 ファイルの import 分析。

### 結果

```
chunking-service.ts (chunking/)
  ├─ import ChunkingLateChunkingAdapter from "../embedding/late-chunking/chunking-late-chunking-adapter"
  ├─ import { ... } from "./strategies/*"
  ├─ import { ... } from "./errors"
  ├─ type import from "./interfaces"
  └─ type import from "./types"

chunking-late-chunking-adapter.ts (embedding/late-chunking/)
  ├─ type import from "../../chunking/interfaces"
  ├─ type import from "../../chunking/types"
  └─ import { ChunkingError } from "../../chunking/errors"

index.ts (embedding/late-chunking/)
  └─ re-export ChunkingLateChunkingAdapter（既存 exports 維持）
```

### 循環依存チェック

```
chunking → embedding/late-chunking  （順方向）
embedding/late-chunking → chunking  （型・エラーのみ、値依存なし）
```

`ChunkingError` のみ値インポートだが、chunking/errors は独立した静的ファイルのため循環なし。
**循環依存 0 件**。

## 証跡 4: 既存 API シグネチャ維持

### `ChunkingService` public API

| メソッド/プロパティ        | Before                         | After                          | 差分                              |
| -------------------------- | ------------------------------ | ------------------------------ | --------------------------------- |
| `constructor`              | `(tok, emb?, llm?)`            | `(tok, emb?, llm?, adapter?)`  | **第 4 引数追加（オプショナル）** |
| `chunk(input)`             | `Promise<ChunkingOutput>`      | `Promise<ChunkingOutput>`      | 同一                              |
| `chunkStream(input)`       | `AsyncIterableIterator<Chunk>` | `AsyncIterableIterator<Chunk>` | 同一                              |
| `getAvailableStrategies()` | `ChunkingStrategy[]`           | `ChunkingStrategy[]`           | 同一                              |
| `getDefaultOptions(name)`  | 同上                           | 同上                           | 同一                              |

第 4 引数追加は非破壊変更（既存呼び出しはそのまま動作）。

### `ChunkingLateChunkingAdapter` 新規 API

```typescript
new ChunkingLateChunkingAdapter(tokenizer: ITokenizer, embeddingClient: IEmbeddingClient)

public async applyLateChunking(text, chunks, options): Promise<Chunk[]>
public determineChunkBoundaries(chunks): number[]
public poolTokenEmbeddings(tokenEmbeddings, boundaries, strategy): number[][]
```

## 証跡 5: ファイル変更サマリ

| ファイル                                                                 | 変更種別 | 行数                                                           |
| ------------------------------------------------------------------------ | -------- | -------------------------------------------------------------- |
| embedding/late-chunking/chunking-late-chunking-adapter.ts                | 新規     | 134 行                                                         |
| embedding/late-chunking/**tests**/chunking-late-chunking-adapter.test.ts | 新規     | 140 行                                                         |
| embedding/late-chunking/index.ts                                         | 変更     | +1 行                                                          |
| chunking/chunking-service.ts                                             | 変更     | -約 60 行（4 メソッドのうち 3 削除、applyLateChunking 委譲化） |
| chunking/**tests**/chunking-service.integration.test.ts                  | 変更     | +約 80 行（SEP-08 / SEP-09 追加）                              |

## 結論

全静的解析ゲート PASS。
Before と比較して型安全性・依存構造・lint 規約すべて維持または改善。
