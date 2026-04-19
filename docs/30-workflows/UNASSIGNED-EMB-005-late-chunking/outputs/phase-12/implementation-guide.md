# Implementation Guide

## Part 1: 中学生向けの説明

大きい文章を小分けにして覚えるとき、前後の話を忘れたまま切り取ると意味がずれやすい。たとえば長い物語を 1 ページずつ別々に読んで感想を書くと、前のページで出た人物や約束を見落としやすい。

Late Chunking は、そのずれを減らすための考え方だ。先に文章全体の流れを見てから、あとで小分けの区切りごとに情報をまとめる。本波では、その考え方に少し近づけるため、区切りごとに「どの文脈セグメントが重なっているか」を見て平均化する処理へ直した。

## Part 2: 技術者向けの説明

### 変更点

- `ChunkingService.applyLateChunking()` を改善し、文字位置ベースのチャンク境界を token 範囲へ変換するようにした
- `getTokenEmbeddings()` の戻り値を `segment embedding + token range` に変更した
- `poolTokenEmbeddings()` で重なりセグメントを `mean` / `cls` / `attention` で集約するようにした
- 重なりがない場合は最も近いセグメントへフォールバックする

### 代表コード

```ts
private determineChunkBoundaries(
  chunks: Chunk[],
  text: string,
): Array<{ startToken: number; endToken: number }>
```

```ts
private poolTokenEmbeddings(
  segmentEmbeddings: Array<{
    startToken: number;
    endToken: number;
    embedding: number[];
  }>,
  boundaries: Array<{ startToken: number; endToken: number }>,
  strategy: "mean" | "cls" | "attention",
): number[][]
```

### エラーハンドリング

- `embeddingClient` 未注入時は `ChunkingError` を継続
- 重なりセグメントがない場合は空配列ではなく nearest segment を使ってゼロ次元化を回避
- 重み付き平均で totalWeight が 0 の場合は先頭の有効 embedding を返す

### エッジケース

- 文字位置から token 位置への変換は tokenizer 接頭辞長で近似している
- token-level hidden state を直接扱っていないため、本実装は full late chunking ではなく改善版 segment pooling
- public API 追加は行っていない

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要

代替証跡:

- `outputs/phase-10/final-review-result.md`
- `outputs/phase-11/UNASSIGNED-EMB-005-manual-test-report.md`
- `outputs/phase-11/manual-test-result.md`
