# Automated Test Evidence - Phase 11

## 証跡の位置づけ

本ファイルは NON_VISUAL タスクの手動テスト代替証跡。
自動テスト実行ログを「受入確認」の根拠として残す。

## 実行環境

- OS: macOS (Darwin 25.3.0)
- Node 実行: pnpm ワークスペース（@repo/shared）
- Test Runner: Vitest v2.1.9
- 実行日: 2026-04-20

## 証跡 1: Adapter 単体テスト

### コマンド

```bash
pnpm exec vitest run \
  src/services/embedding/late-chunking/__tests__/chunking-late-chunking-adapter.test.ts
```

### 結果

```
✓ src/services/embedding/late-chunking/__tests__/chunking-late-chunking-adapter.test.ts (11 tests) 20ms
  ✓ ChunkingLateChunkingAdapter > applyLateChunking > SEP-01: 単一チャンク・mean pooling で applied=true かつ embeddingDimension > 0 を返す
  ✓ ChunkingLateChunkingAdapter > applyLateChunking > SEP-02: 複数チャンク・cls pooling で各チャンクに applied=true を設定する
  ✓ ChunkingLateChunkingAdapter > applyLateChunking > SEP-02A: チャンク数がセグメント数を上回っても全チャンクで embeddingDimension > 0 を維持する
  ✓ ChunkingLateChunkingAdapter > determineChunkBoundaries > SEP-03: 複数チャンクで position.end の配列を返す
  ✓ ChunkingLateChunkingAdapter > determineChunkBoundaries > SEP-04: 空配列で空配列を返す
  ✓ ChunkingLateChunkingAdapter > poolTokenEmbeddings > SEP-05: strategy=mean で埋め込み配列を返す
  ✓ ChunkingLateChunkingAdapter > poolTokenEmbeddings > SEP-05A: boundaries を使って mean pooling の結果が変化する
  ✓ ChunkingLateChunkingAdapter > poolTokenEmbeddings > SEP-06: strategy=cls で埋め込み配列を返す
  ✓ ChunkingLateChunkingAdapter > poolTokenEmbeddings > SEP-06A: strategy=cls は最初の重複セグメントを返す
  ✓ ChunkingLateChunkingAdapter > poolTokenEmbeddings > SEP-07: strategy=attention で埋め込み配列を返す
  ✓ ChunkingLateChunkingAdapter > poolTokenEmbeddings > SEP-07A: strategy=attention は overlap 重み付き平均を返す

Test Files  1 passed (1)
Tests       11 passed (11)
```

## 証跡 2: ChunkingService 統合テスト（回帰 + 委譲確認）

### コマンド

```bash
pnpm exec vitest run \
  src/services/chunking/__tests__/chunking-service.integration.test.ts
```

### 結果

```
✓ src/services/chunking/__tests__/chunking-service.integration.test.ts (24 tests) 77ms

Test Files  1 passed (1)
Tests       24 passed (24)
```

### 内訳

- Contextual Embeddings 正常系: 7 件（既存・回帰確認）
- Contextual Embeddings 異常系: 2 件（既存・回帰確認）
- Late Chunking 正常系: 3 件（既存・回帰確認）
- Late Chunking 異常系: 1 件（既存・回帰確認）
- **Late Chunking 委譲確認: 2 件（SEP-08 / SEP-09、Phase 6 追加）**
- ChunkingService その他: 7 件（既存）
- chunkStream: 2 件（既存）

合計 24 件。

## 証跡 3: カバレッジ実行結果

```
% Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
chunking-service.ts            | 92.33   | 86.84   | 100     | 92.33   | 286-393,421-424
chunking-late-chunking-adapter.ts | 96.96 | 92.85   | 100     | 96.96   | 119-120
-------------------|---------|----------|---------|---------|-------------------
```

詳細は `outputs/phase-7/coverage-report.md` を参照。

## 証跡 4: SEP ID カバレッジ表

| SEP ID  | 検証対象                                                                 | 実行結果 | 代替確認完了 |
| ------- | ------------------------------------------------------------------------ | -------- | ------------ |
| SEP-01  | Adapter.applyLateChunking 単一・mean                                     | PASS     | ✓            |
| SEP-02  | Adapter.applyLateChunking 複数・cls                                      | PASS     | ✓            |
| SEP-02A | Adapter.applyLateChunking がチャンク数 > セグメント数でも 0 次元化しない | PASS     | ✓            |
| SEP-03  | Adapter.determineChunkBoundaries (複数)                                  | PASS     | ✓            |
| SEP-04  | Adapter.determineChunkBoundaries (空)                                    | PASS     | ✓            |
| SEP-05  | Adapter.poolTokenEmbeddings mean                                         | PASS     | ✓            |
| SEP-05A | Adapter.poolTokenEmbeddings mean が boundaries を反映                    | PASS     | ✓            |
| SEP-06  | Adapter.poolTokenEmbeddings cls                                          | PASS     | ✓            |
| SEP-06A | Adapter.poolTokenEmbeddings cls が先頭重複セグメントを返す               | PASS     | ✓            |
| SEP-07  | Adapter.poolTokenEmbeddings attention                                    | PASS     | ✓            |
| SEP-07A | Adapter.poolTokenEmbeddings attention が overlap 重みを反映              | PASS     | ✓            |
| SEP-08  | ChunkingService → Adapter 委譲（enabled=true）                           | PASS     | ✓            |
| SEP-09  | Adapter 非呼び出し（enabled=false / 未指定）                             | PASS     | ✓            |

**13 観点すべて PASS**。

## 結論

NON_VISUAL タスクの代替検証として、自動テスト 35 件全 PASS を正式な受入確認とする。
これらの証跡は再現可能で、CI 実行時にも同一結果を保証する。
