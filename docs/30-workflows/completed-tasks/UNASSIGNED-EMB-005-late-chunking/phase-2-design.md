# Phase 2: 設計

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 2                                       |
| 機能名     | UNASSIGNED-EMB-005                      |
| タスク名   | Late Chunking実装（検索品質10-30%向上） |
| 前提Phase  | Phase 1                                 |
| 後続Phase  | Phase 3                                 |
| 作成日     | 2026-04-19                              |
| ステータス | pending                                 |

## 目的

Late Chunkingを構成するコンポーネント（LateChunkingService / TokenBoundaryCalculator / HiddenStatePooler / WindowSplitter）の責務境界・サービス層API・データフローを設計し、既存EmbeddingServiceへの統合経路を固定する。

## 背景

Phase 1で固定した要件に基づき、全文エンコード後チャンク化のアーキテクチャを詳細設計する。既存EmbeddingServiceを壊さず、後方互換を保ちながらLate Chunkingを追加実装する。

## SubAgentチーム編成

| SubAgent   | 関心ごと                     | 主担当                                        |
| ---------- | ---------------------------- | --------------------------------------------- |
| SubAgent-A | 型定義・インターフェース設計 | ChunkBoundary/HiddenState型・サービス契約定義 |
| SubAgent-B | アルゴリズム・コア実装       | Late Chunkingアルゴリズム・プーリング戦略     |
| SubAgent-C | 統合・既存APIとの互換性      | 既存EmbeddingServiceとの結合点・後方互換設計  |
| SubAgent-D | テスト・品質・ベンチマーク   | 品質比較基準・メモリ計測・受入条件判定        |

## 実行タスク

- 型定義設計: ChunkBoundary・HiddenState・PoolingStrategy・LateChunkingConfig の型を設計する
- コンポーネント責務設計: 4コンポーネントの責務境界を重複なしで定義する
- サービス層API設計: LateChunkingService の公開メソッドシグネチャ・入出力契約を定義する（IPC契約ではなくサービス層）
- 既存統合設計: EmbeddingServiceへの統合方法（ストラテジーパターン / ファサード / デコレータ）を選定する
- 依存パッケージ選定: `@xenova/transformers` またはその後継パッケージのAPIとoffset_mapping取得方法を確認する
- メモリ設計: Float16採用・ストリーミング処理によるメモリ削減戦略を設計する
- エラーハンドリング設計: トークン長超過・モデル未ロード・プーリング失敗の失敗契約を定義する

## 参照資料

| 参照資料             | パス                                                         | 説明           |
| -------------------- | ------------------------------------------------------------ | -------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                 | Phase 1 成果物 |
| 受入条件             | `outputs/phase-1/acceptance-criteria.md`                     | Phase 1 成果物 |
| P50チェック結果      | `outputs/phase-1/p50-check-result.md`                        | Phase 1 成果物 |
| キャリーオーバー棚卸 | `outputs/phase-1/carryover-inventory.md`                     | Phase 1 成果物 |
| 命名規則分析         | `outputs/phase-1/naming-convention-analysis.md`              | Phase 1 成果物 |
| 仕様抽出結果         | `outputs/phase-1/aiworkflow-requirements-extraction.md`      | Phase 1 成果物 |
| トレーサビリティ行列 | `outputs/phase-1/implementation-spec-traceability-matrix.md` | Phase 1 成果物 |

## アーキテクチャ設計概要

### コンポーネント構成

```
packages/shared/src/services/embedding/
├── LateChunkingService.ts          # メインサービス（統合エントリーポイント）
├── TokenBoundaryCalculator.ts      # チャンク境界→トークンオフセット変換
├── HiddenStatePooler.ts            # Hidden StateのPooling処理
├── WindowSplitter.ts               # 最大トークン長超過時のウィンドウ分割
└── types/
    ├── ChunkBoundary.ts            # チャンク境界型定義
    ├── HiddenState.ts              # Hidden State型定義
    └── LateChunkingConfig.ts       # 設定型定義
```

### データフロー

```
入力テキスト（全文）
  └─→ WindowSplitter（トークン長超過チェック）
        ├─→ [超過なし] TransformerModel（全文→Hidden States + offset_mapping）
        └─→ [超過あり] ウィンドウ分割→各ウィンドウでTransformerModel
  ↓
  Hidden States（全トークン）
  └─→ TokenBoundaryCalculator（テキストオフセット→トークンインデックス変換）
  ↓
  チャンクごとのトークン範囲
  └─→ HiddenStatePooler（Mean / Max / CLS Pooling）
  ↓
  チャンクごとのEmbedding配列（出力）
```

### サービス層API（設計案）

```typescript
interface LateChunkingService {
  // メインAPI: テキストとチャンク境界からEmbeddingを生成
  generateChunkEmbeddings(
    text: string,
    chunkBoundaries: ChunkBoundary[],
    config?: LateChunkingConfig,
  ): Promise<ChunkEmbeddingResult[]>;

  // ベンチマーク用: 既存EarlyChunkingと品質比較
  compareWithEarlyChunking(
    text: string,
    chunkBoundaries: ChunkBoundary[],
    queries: string[],
  ): Promise<QualityComparisonResult>;
}

interface ChunkBoundary {
  startOffset: number; // バイトオフセット（テキスト先頭からの文字数）
  endOffset: number;
  chunkId: string;
}

interface HiddenState {
  tokenIndex: number;
  vector: Float32Array | Float16Array;
}

type PoolingStrategy = "mean" | "max" | "cls";

interface LateChunkingConfig {
  poolingStrategy: PoolingStrategy;
  useFloat16: boolean; // メモリ削減フラグ
  maxTokenLength: number; // ウィンドウ分割の閾値
  windowOverlapRatio: number; // ウィンドウ間オーバーラップ比率（0.0-0.5）
}
```

### 既存EmbeddingServiceへの統合方法

ストラテジーパターンを採用し、`EmbeddingService` に `ChunkingStrategy` インターフェースを追加する。既存の `EarlyChunkingStrategy` は変更せず、新規に `LateChunkingStrategy` を追加する。これにより後方互換を完全に維持する。

### 依存パッケージ

| パッケージ             | 用途                                      | 備考                          |
| ---------------------- | ----------------------------------------- | ----------------------------- |
| `@xenova/transformers` | Transformerモデル実行・offset_mapping取得 | 既存依存の有無をPhase 1で確認 |
| `onnxruntime-node`     | ONNXモデル実行（代替）                    | Xenovaが使用不可の場合の代替  |

### メモリ戦略

| 課題                     | 対策                                                      |
| ------------------------ | --------------------------------------------------------- |
| 全文入力によるメモリ増大 | Float16で Hidden State配列を保持し半分に削減する          |
| 長文ドキュメントの処理   | ストリーミング処理でチャンクごとに順次Poolingして解放する |
| ウィンドウ分割時の重複   | 加重平均マージで境界チャンクのEmbeddingを補正する         |

## 実行手順

1. Phase 1 成果物を入力として確認する。
2. SubAgent-A が型定義・インターフェースを設計する。
3. SubAgent-B がアルゴリズム・Pooling戦略の詳細を設計する。
4. SubAgent-C が既存EmbeddingServiceとの統合点を設計する。
5. SubAgent-D がテスト戦略・品質比較基準を設計する。
6. SubAgent-A/B/C の設計をSubAgent-D が統合判定する。
7. 成果物を `outputs/phase-2/` に保存する。
8. 完了条件で矛盾・漏れ・整合・依存を判定する。

## 統合テスト連携

- SubAgent-A/B/C の検証ケースを並列で設計する。
- SubAgent-D が統合順序を直列で確定する。
- `LateChunkingService.generateChunkEmbeddings` / `TokenBoundaryCalculator.calculate` / `HiddenStatePooler.pool` / `WindowSplitter.split` を統合対象に固定する。
- 既存 `EmbeddingService` の既存APIが破壊されないことを回帰テストで確認する。
- 統合ログは `outputs/phase-2/` に保存する。

## 多角的チェック観点

| 観点     | 確認内容                                                          |
| -------- | ----------------------------------------------------------------- |
| 矛盾     | 型定義とサービスAPIの間に矛盾がないか確認する                     |
| 漏れ     | Phase 1要件から設計への未反映項目（offset_mapping等）がないか確認 |
| 整合性   | 4コンポーネント間のデータフローが一致しているか確認する           |
| 依存関係 | 依存パッケージのAPI（offset_mapping）が利用可能か確認する         |

## 成果物

| 成果物               | パス                                               | 説明                              |
| -------------------- | -------------------------------------------------- | --------------------------------- |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md`           | コンポーネント責務・データフロー  |
| サービス層API設計書  | `outputs/phase-2/service-api-design.md`            | 公開メソッド・型・エラー契約      |
| 既存統合設計書       | `outputs/phase-2/existing-integration-design.md`   | EmbeddingService統合方法          |
| メモリ設計書         | `outputs/phase-2/memory-design.md`                 | Float16・ストリーミング戦略       |
| テスト戦略書         | `outputs/phase-2/test-strategy.md`                 | 品質比較・メモリ計測の検証方針    |
| 依存整合マトリクス   | `outputs/phase-2/dependency-consistency-matrix.md` | 依存パッケージ・Phase間依存関係表 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 4コンポーネントの責務境界が重複なく定義されている
- [ ] サービス層APIの入出力型が完全に定義されている
- [ ] 既存EmbeddingServiceへの統合方法が後方互換を保っている
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
3. SubAgent-D の統合判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UNASSIGNED-EMB-005-late-chunking
```

## 次のPhase

Phase 3: 設計レビューゲート
