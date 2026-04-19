# Late Chunking実装 - タスク指示書

## メタ情報

```yaml
issue_number: 2342
```

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | UNASSIGNED-EMB-005                               |
| タスク名     | Late Chunking実装                                |
| 分類         | 機能追加                                         |
| 対象機能     | embedding-generation-pipeline                    |
| 優先度       | 高                                               |
| 見積もり規模 | 大規模                                           |
| ステータス   | 未実施                                           |
| 発見元       | Embedding Generation Pipeline実装時（Phase 5-9） |
| 発見日       | 2026-04-18                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Embedding Generation Pipelineの実装（Phase 5-9）において、従来の早期チャンキング（Early Chunking）アプローチの限界が明確になった。

現在のパイプラインはドキュメントを先にチャンクに分割し、各チャンクを独立してエンコードする方式を採用している。この方式では、各チャンクが文書全体のコンテキストを失うという根本的な問題がある。

### 1.2 問題点・課題

**早期チャンキング（Early Chunking）の限界**:

1. **コンテキスト喪失**
   - チャンクが文書全体の意味的文脈を失う
   - 文書冒頭で定義された概念が後半チャンクで参照できない
   - 固有名詞・代名詞の解決精度が低下する

2. **検索品質の低下**
   - 関連性の高いチャンクが意味的に孤立した埋め込みになる
   - クロスチャンク参照を含む質問への回答精度が低い
   - 要約型クエリに対するスコアリング精度が不十分

3. **境界部分の品質問題**
   - チャンク境界付近のテキストが文脈なしにエンコードされる
   - 文の途中で切れた場合の埋め込み品質が著しく低下する

### 1.3 Late Chunkingの優位性

Late Chunkingは以下の手順で動作する：

1. ドキュメント全体をモデルの最大トークン長以内でエンコードし、全トークンの隠れ状態を取得する
2. チャンク境界情報に基づき、取得した隠れ状態をプーリングしてチャンク単位の埋め込みを生成する

この方式により、各チャンクの埋め込みが文書全体の意味的コンテキストを保持した状態で生成される。

### 1.4 放置した場合の影響

**短期的影響**:

- 検索品質が最適化されないまま本番運用が継続される
- ユーザーの検索精度に対する不満が蓄積される

**中長期的影響**:

- RAGパイプライン全体の性能ボトルネックになる
- 競合製品との検索品質格差が拡大する
- 後から導入する際のデータ再インデックスコストが増加する

**影響度**: 高（検索品質10-30%向上が見込まれる）

---

## 2. 何を達成するか（What）

### 2.1 目的

Late Chunkingアルゴリズムを実装し、文書全体のコンテキストを保持した高品質な埋め込みベクトルを生成できるようにする。

### 2.2 最終ゴール

- 従来の早期チャンキングと比較して検索品質を10-30%向上させる
- 既存のEmbedding Generation Pipelineに統合し、透過的に利用できる
- メモリ効率と処理速度のトレードオフを最適化する

### 2.3 スコープ

#### 含むもの

- ✅ LateChunkingEncoderインターフェース定義
- ✅ トークンレベルの隠れ状態取得機能
- ✅ チャンク境界計算ロジック（トークン単位）
- ✅ 隠れ状態のプーリング実装（Mean/Max/CLS Pooling対応）
- ✅ 長文ドキュメントのウィンドウ分割処理
- ✅ メモリ効率最適化（バッチ処理・ストリーミング対応）
- ✅ 既存EmbeddingServiceへの統合
- ✅ ユニットテスト・統合テスト
- ✅ パフォーマンスベンチマーク

#### 含まないもの

- ❌ 独自モデルのファインチューニング（将来拡張）
- ❌ マルチモーダルLate Chunking（テキスト以外の対応）
- ❌ 分散処理対応（将来拡張）
- ❌ リアルタイムストリーミングドキュメントへの対応

### 2.4 成果物

1. `packages/shared/src/services/embedding/late-chunking/late-chunking-encoder.ts`
2. `packages/shared/src/services/embedding/late-chunking/token-boundary-calculator.ts`
3. `packages/shared/src/services/embedding/late-chunking/hidden-state-pooler.ts`
4. `packages/shared/src/services/embedding/late-chunking/window-splitter.ts`
5. `packages/shared/src/services/embedding/late-chunking/late-chunking-service.ts`
6. 更新された`packages/shared/src/services/embedding/embedding-service.ts`
7. テストファイル一式
8. パフォーマンスベンチマーク結果

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] 既存のEmbedding Generation Pipelineが動作している
- [ ] トークナイザーへのアクセスが可能（モデルと同一のトークナイザー）
- [ ] モデルのトークン最大長が確認済み（通常8192トークン）
- [ ] テスト用ドキュメントコーパスが準備されている

### 3.2 依存タスク

- UNASSIGNED-EMB-006（埋め込みキャッシュRedis統合）: 独立して実行可能だが、Late Chunking導入後はキャッシュキーの設計変更が必要になるため、EMB-006と調整が望ましい

### 3.3 必要な知識・スキル

- Transformerモデルのアーキテクチャ（隠れ状態の概念）
- トークナイザーの動作原理（BPE/WordPiece）
- プーリング手法（Mean Pooling、Max Pooling、CLS Pooling）
- TypeScript型システム（Generics、型ガード）
- メモリ管理（Float32Array、バッファ最適化）

### 3.4 推奨アプローチ

1. インターフェース定義を先に固め、実装詳細は後から確定する
2. 小規模ドキュメントで動作確認してから長文処理に拡張する
3. メモリプロファイリングを各Phaseで実施しメモリリークを早期検出する
4. 既存のEmbedding APIとの互換性を維持し、既存コードへの影響を最小化する

### 3.5 苦戦が予想される箇所

#### トークン長制約への対応

長文ドキュメントはモデルの最大トークン長（通常8192トークン）を超えることがある。この場合、ウィンドウ分割が必要になるが、ウィンドウ境界をまたぐチャンクの埋め込み生成が複雑になる。

**推奨対策**:

- ウィンドウ間にオーバーラップを設けて境界付近の品質を保つ
- オーバーラップ部分の埋め込みは加重平均でマージする
- チャンク境界がウィンドウ境界と一致するように事前調整を試みる

#### メモリ使用量の増大

Late Chunkingでは全文の隠れ状態を一時的にメモリ上に保持する必要がある。隠れ状態のサイズは `トークン数 × 隠れ層次元数（通常1024-4096）` に比例するため、長文処理時はメモリ消費が急増する。

**推奨対策**:

- Float16（半精度）でのメモリ削減を検討する
- プーリング後に元の隠れ状態を即座に解放するストリーミング処理を採用する
- ドキュメント長に応じてバッチサイズを動的に調整する

#### バイト数とトークン単位のマッピング

チャンク境界はバイト位置またはUnicode文字位置で管理されているが、Late Chunkingではトークン境界での分割が必要になる。バイト数・文字数・トークン数の相互変換は、トークナイザーの種類によって複雑な計算が必要になる。

**推奨対策**:

- `offset_mapping`機能を持つトークナイザーを使用してバイト位置とトークン位置を対応付ける
- 変換テーブルをキャッシュして繰り返し計算を回避する
- 絵文字・CJK文字・特殊文字を含むテストケースを必ず用意する

---

## 4. 実行手順

### Phase構成

```
Phase 1: インターフェース設計・型定義
Phase 2: トークン境界計算器の実装
Phase 3: 隠れ状態プーラーの実装
Phase 4: ウィンドウ分割処理の実装
Phase 5: LateChunkingServiceの実装・統合
Phase 6: テスト作成・品質検証
Phase 7: パフォーマンスベンチマーク・最適化
```

### Phase 1: インターフェース設計・型定義

#### 目的

Late Chunkingの全コンポーネントで使用する型定義とインターフェースを確立する

#### 実行手順

主要な型定義:

```typescript
// チャンク境界情報
interface ChunkBoundary {
  startChar: number; // 開始文字位置（バイトではなくUnicode）
  endChar: number; // 終了文字位置
  startToken: number; // 対応する開始トークンインデックス
  endToken: number; // 対応する終了トークンインデックス
}

// トークンの隠れ状態
interface HiddenState {
  tokenIndex: number;
  vector: Float32Array; // 隠れ層次元数分のベクトル
}

// プーリング設定
type PoolingStrategy = "mean" | "max" | "cls";

// Late Chunking設定
interface LateChunkingConfig {
  maxTokenLength: number; // モデル最大トークン長
  windowOverlapTokens: number; // ウィンドウオーバーラップ数
  poolingStrategy: PoolingStrategy;
  batchSize: number;
}
```

主要インターフェース:

- `ILateChunkingEncoder`: エンコード処理の抽象化
- `ITokenBoundaryCalculator`: バイト・文字・トークン変換
- `IHiddenStatePooler`: プーリング戦略の抽象化
- `IWindowSplitter`: 長文分割処理の抽象化

#### 成果物

- ✅ `late-chunking-types.ts`（型定義ファイル）
- ✅ `late-chunking-interfaces.ts`（インターフェースファイル）

#### 完了条件

- [ ] 全インターフェースが型安全に定義されている
- [ ] TypeScript型チェックがエラーなしで通過する

### Phase 2: トークン境界計算器の実装

#### 目的

文字位置からトークン位置への変換を正確に実行するTokenBoundaryCalculatorを実装する

#### 実行手順

**Step 1**: トークナイザーライブラリの選定・インストール

```bash
pnpm --filter @repo/shared add @xenova/transformers
```

**Step 2**: TokenBoundaryCalculator実装

- offset_mappingを使用したバイト・文字・トークン位置の相互変換
- CJK文字・絵文字・サロゲートペアへの対応
- 変換テーブルのキャッシュ機能

**Step 3**: エッジケースへの対応

- チャンク境界がトークン境界と一致しない場合の処理
- 空文字・空白のみのチャンクへの対応
- モデル固有の特殊トークン（[CLS]、[SEP]等）の除外

#### 成果物

- ✅ `token-boundary-calculator.ts`

#### 完了条件

- [ ] ASCII・CJK・絵文字を含むテキストで正確な変換ができる
- [ ] 境界計算の精度テストが全て通過する

### Phase 3: 隠れ状態プーラーの実装

#### 目的

チャンク境界に対応するトークンの隠れ状態をプーリングして、チャンク単位の埋め込みを生成する

#### 実行手順

**Step 1**: プーリング戦略の実装

- **Mean Pooling**: チャンク内全トークンの隠れ状態の平均（推奨）
- **Max Pooling**: 各次元の最大値を選択
- **CLS Pooling**: [CLS]トークンの隠れ状態を直接使用

**Step 2**: 正規化処理

- L2正規化（コサイン類似度計算の前処理として必須）
- 正規化前後の埋め込み品質比較

**Step 3**: メモリ効率最適化

- プーリング完了後の隠れ状態バッファ解放
- Float16での精度とメモリのトレードオフ評価

#### 成果物

- ✅ `hidden-state-pooler.ts`

#### 完了条件

- [ ] 3種類のプーリング戦略が実装されている
- [ ] L2正規化が正確に動作する
- [ ] メモリ解放が確認できる

### Phase 4: ウィンドウ分割処理の実装

#### 目的

最大トークン長を超える長文ドキュメントを、オーバーラップを考慮して適切に分割する

#### 実行手順

**Step 1**: WindowSplitter実装

- トークン数に基づくウィンドウ境界の決定
- チャンク境界がウィンドウをまたがない場合の調整ロジック
- オーバーラップ領域の管理

**Step 2**: ウィンドウマージ処理

- オーバーラップ領域の埋め込みを加重平均でマージ
- ウィンドウ端付近のチャンクへの重み調整

**Step 3**: 長文テスト

- 10,000トークン超のドキュメントでの動作確認
- 分割前後で意味的類似度が保持されることを検証

#### 成果物

- ✅ `window-splitter.ts`

#### 完了条件

- [ ] 最大トークン長を超えるドキュメントが正しく処理される
- [ ] オーバーラップ部分のマージが正確に動作する
- [ ] チャンク境界がウィンドウをまたぐ場合に適切に処理される

### Phase 5: LateChunkingServiceの実装・統合

#### 目的

全コンポーネントを統合したLateChunkingServiceを実装し、既存のEmbeddingServiceに組み込む

#### 実行手順

**Step 1**: LateChunkingService実装

```typescript
class LateChunkingService implements ILateChunkingEncoder {
  constructor(
    private tokenizer: ITokenizer,
    private model: IEmbeddingModel,
    private boundaryCalculator: ITokenBoundaryCalculator,
    private pooler: IHiddenStatePooler,
    private windowSplitter: IWindowSplitter,
    private config: LateChunkingConfig,
  ) {}

  async encode(
    document: string,
    chunks: TextChunk[],
  ): Promise<EmbeddingResult[]>;
}
```

**Step 2**: EmbeddingServiceへの統合

- `useLateChunking: boolean` フラグで従来方式との切り替えを可能にする
- 設定ファイルでLate Chunking設定を管理する

**Step 3**: エラーハンドリング

- モデルエラー時のフォールバック処理
- タイムアウト処理
- リトライロジック

#### 成果物

- ✅ `late-chunking-service.ts`
- ✅ 更新された`embedding-service.ts`

#### 完了条件

- [ ] LateChunkingServiceが全インターフェースを実装している
- [ ] 既存EmbeddingServiceから透過的に利用できる
- [ ] `useLateChunking`フラグで従来方式に切り替えられる

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Late Chunkingアルゴリズムが正しく実装されている
- [ ] トークン境界の計算が正確に動作する（ASCII・CJK・絵文字対応）
- [ ] Mean/Max/CLS Poolingの3種類が実装されている
- [ ] 最大トークン長を超える長文ドキュメントが正しく処理される
- [ ] 既存のEmbeddingServiceから透過的に利用できる
- [ ] フォールバック機能（従来の早期チャンキングへの切り替え）が動作する

### 品質要件

- [ ] 全ユニットテストが通過する
- [ ] 統合テストが通過する
- [ ] TypeScript型チェックがエラーなしで通過する
- [ ] ESLintエラーが0件である
- [ ] メモリリークが検出されない
- [ ] パフォーマンステストで処理時間が許容範囲内である

### 検索品質要件

- [ ] ベンチマークデータセットで従来比10%以上の品質向上が確認される
- [ ] クロスチャンク参照を含むクエリへの精度が向上している
- [ ] 要約型クエリへのスコアリング精度が向上している

### ドキュメント要件

- [ ] Late Chunkingの設定ガイドが作成されている
- [ ] トレードオフ（品質・メモリ・速度）のドキュメントが作成されている

---

## 6. 検証方法

### テストケース

| No  | テストケース                       | 期待結果                                             |
| --- | ---------------------------------- | ---------------------------------------------------- |
| 1   | 短文ドキュメント（単一ウィンドウ） | 全チャンクが文書コンテキストを保持した埋め込みを生成 |
| 2   | 長文ドキュメント（複数ウィンドウ） | ウィンドウ境界をまたいでも正しく処理される           |
| 3   | CJK文字を含むドキュメント          | トークン境界計算が正確に動作する                     |
| 4   | 絵文字・特殊文字を含むドキュメント | サロゲートペアが正しく処理される                     |
| 5   | 早期チャンキングとの品質比較       | Late Chunkingがより高いコサイン類似度を示す          |
| 6   | メモリ使用量の計測                 | 最大メモリ使用量が設定された閾値以内である           |
| 7   | プーリング戦略切り替え             | Mean/Max/CLS各戦略で異なる埋め込みが生成される       |

### 検証手順

```bash
# ユニットテスト実行
pnpm --filter @repo/shared test late-chunking

# 統合テスト実行
pnpm --filter @repo/shared test late-chunking-integration

# パフォーマンスベンチマーク
pnpm --filter @repo/shared test:bench late-chunking-benchmark

# メモリプロファイリング
node --inspect pnpm --filter @repo/shared test:memory late-chunking
```

### 品質ベンチマーク指標

| 指標                   | 目標値                       |
| ---------------------- | ---------------------------- |
| 検索精度向上率         | 早期チャンキング比 +10%以上  |
| 処理速度低下率         | 早期チャンキング比 -50%以内  |
| メモリ使用量増加率     | 早期チャンキング比 +200%以内 |
| 最大処理ドキュメント長 | 100,000文字以上              |

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                                                                       |
| -------------------------- | ------ | -------- | -------------------------------------------------------------------------- |
| メモリ不足（OOM）          | 高     | 高       | ストリーミング処理・Float16使用・バッチサイズ動的調整を実装する            |
| トークン境界計算の精度不足 | 高     | 中       | offset_mapping対応トークナイザーを使用し、網羅的なエッジケーステストを実施 |
| 処理速度の著しい低下       | 中     | 高       | バッチ処理の最適化・キャッシュ活用で許容範囲内に収める                     |
| ウィンドウ境界での品質低下 | 中     | 中       | オーバーラップとマージ戦略を調整し境界付近の品質を確保する                 |
| 既存APIとの非互換性        | 高     | 低       | 既存インターフェースを維持し、Late Chunkingをオプション機能として追加      |
| モデル差し替え時の動作不定 | 中     | 低       | モデルインターフェースを抽象化し、モデル非依存の設計を維持する             |

---

## 8. 参照情報

### 関連ドキュメント

- [Embedding Generation Pipeline設計書](../embedding-generation-pipeline/design-embedding.md)
- [Phase 5-9 実装記録](../embedding-generation-pipeline/)
- [埋め込みキャッシュRedis統合](./task-embedding-cache-redis-integration.md)

### 参考資料

- Late Chunking論文（jina-ai）: https://arxiv.org/abs/2409.04701
- jina-embeddings-v3実装例: https://huggingface.co/jinaai/jina-embeddings-v3
- Transformers.js（ブラウザ・Node.js対応）: https://github.com/xenova/transformers.js
- Mean Poolingの実装: https://www.sbert.net/docs/pretrained_models.html

---

## 9. 備考

### 補足事項

**プーリング戦略の選択指針**:

| プーリング戦略 | 推奨用途                     | 特徴                                 |
| -------------- | ---------------------------- | ------------------------------------ |
| Mean Pooling   | 一般的な文書検索（推奨）     | 全トークンを均等に考慮、安定した品質 |
| Max Pooling    | キーワード重視の検索         | 際立った特徴を強調する               |
| CLS Pooling    | 分類タスクに特化した埋め込み | モデルが[CLS]を文書全体の要約に使用  |

**メモリ使用量の目安**:

| ドキュメント長 | 隠れ層次元数 | 概算メモリ使用量（Float32） |
| -------------- | ------------ | --------------------------- |
| 1,000トークン  | 1024次元     | 約4MB                       |
| 4,000トークン  | 1024次元     | 約16MB                      |
| 8,192トークン  | 4096次元     | 約128MB                     |

**Late Chunking非推奨ケース**:

- ドキュメントが十分短くウィンドウ分割が不要な場合
- リアルタイム性が最優先でレイテンシ予算が厳しい場合
- メモリ制約が非常に厳しい環境（組み込み等）

**段階的ロールアウト推奨**:

新規インデックスから順番にLate Chunkingを適用し、既存インデックスとの品質比較をA/Bテストで継続的に実施することを推奨する。
