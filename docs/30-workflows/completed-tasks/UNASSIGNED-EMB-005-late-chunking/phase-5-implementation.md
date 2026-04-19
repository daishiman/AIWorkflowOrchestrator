# Phase 5: 実装

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 5                  |
| 機能名     | UNASSIGNED-EMB-005 |
| タスク名   | Late Chunking実装  |
| 前提Phase  | Phase 4            |
| 後続Phase  | Phase 6            |
| 作成日     | 2026-04-19         |
| ステータス | pending            |

## 目的

最小実装でRedをGreenへ移行し、Late Chunkingによる検索品質10〜30%向上を実現する。

## 背景

従来の事前チャンキング方式では、チャンク境界でコンテキストが分断されるため埋め込みベクトルの意味精度が低下する。Late Chunkingはトークン列全体を一括エンコードした後に隠れ状態をプールすることで、文脈情報を保持したまま各チャンクのベクトルを生成できる。本Phaseではその核心ロジックを `packages/shared/` 内に実装する。

## 実装計画

> 契約正本は Phase 2。型・API・統合方式・メモリ戦略の定義を本Phaseで再発明しない。Phase 5 は「どの差分を、どの順序で実装するか」に限定する。

### 新規作成ファイル

| ファイルパス                                                                        | 説明                                                                                                        |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/services/embedding/late-chunking/late-chunking-types.ts`       | 型定義（ChunkBoundary, HiddenState, PoolingStrategy, LateChunkingConfig）                                   |
| `packages/shared/src/services/embedding/late-chunking/late-chunking-interfaces.ts`  | インターフェース定義（ITokenBoundaryCalculator, IHiddenStatePooler, IWindowSplitter, ILateChunkingService） |
| `packages/shared/src/services/embedding/late-chunking/token-boundary-calculator.ts` | トークン境界計算の実装クラス                                                                                |
| `packages/shared/src/services/embedding/late-chunking/hidden-state-pooler.ts`       | 隠れ状態プーリング実装（Mean / Max / CLS）                                                                  |
| `packages/shared/src/services/embedding/late-chunking/window-splitter.ts`           | スライディングウィンドウ分割実装                                                                            |
| `packages/shared/src/services/embedding/late-chunking/late-chunking-service.ts`     | Late Chunkingサービス本体                                                                                   |

### 修正ファイル

| ファイルパス                                                  | 変更内容                                                                                              |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `packages/shared/src/services/embedding/embedding-service.ts` | `useLateChunking` フラグを追加し、フラグが有効な場合に `LateChunkingService` へ委譲するロジックを統合 |

## SubAgentチーム編成

| SubAgent   | 関心ごと             | 主担当                                   |
| ---------- | -------------------- | ---------------------------------------- |
| SubAgent-A | 型・インターフェース | late-chunking-types / interfaces         |
| SubAgent-B | コアアルゴリズム     | TokenBoundaryCalculator / WindowSplitter |
| SubAgent-C | プーリング・サービス | HiddenStatePooler / LateChunkingService  |
| SubAgent-D | 統合監査             | EmbeddingService統合・矛盾・漏れ確認     |

## 実行タスク

- 最小実装計画の確定: Green達成に必要な最小差分を定義する
- 型・インターフェース実装: ChunkBoundary / HiddenState / PoolingStrategy / LateChunkingConfig を定義する
- TokenBoundaryCalculator実装: 文字オフセットとトークンインデックスの双方向変換を実装する
- HiddenStatePooler実装: Mean / Max / CLSの3戦略をプラグイン可能な形で実装する
- WindowSplitter実装: maxTokenLength と windowOverlapTokens を考慮したウィンドウ分割を実装する
- LateChunkingService実装: 上記コンポーネントを組み合わせて一貫した処理フローを実装する
- EmbeddingService統合: useLateChunking フラグによる動的切り替えを実装する

## 参照資料

| 参照資料       | パス                                       | 説明           |
| -------------- | ------------------------------------------ | -------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`    | Phase 4 成果物 |
| Red結果        | `outputs/phase-4/red-test-result.md`       | Phase 4 成果物 |
| 統合テスト計画 | `outputs/phase-4/integration-test-plan.md` | Phase 4 成果物 |

## 実行手順

### Step 1: 依存関係確認

```bash
pnpm install
pnpm --filter @repo/shared build
```

### Step 2: 型定義・インターフェース実装

`late-chunking-types.ts` / `late-chunking-interfaces.ts` は [phase-2-design.md](phase-2-design.md) で確定した契約をそのままコード化する。ここで別名・別単位・別既定値を持ち込まない。

### Step 3: TokenBoundaryCalculator実装

- 入力テキストとトークナイザ出力からチャンク境界（`ChunkBoundary[]`）を算出する
- 文字オフセットとトークンインデックスの双方向マッピングを保持する
- オフセット外参照に対して明示的なエラーをスローする

### Step 4: HiddenStatePooler実装（Mean / Max / CLS）

- `mean`: 指定範囲のトークン隠れ状態の要素平均を算出する
- `max`: 指定範囲のトークン隠れ状態の要素最大値を算出する
- `cls`: CLSトークン（インデックス0）の隠れ状態をそのまま返す
- PoolingStrategy を依存注入で切り替え可能にする

### Step 5: WindowSplitter実装

- `maxTokenLength` でウィンドウサイズを制御する
- `windowOverlapTokens` でウィンドウ間の重複トークン数を制御する
- 最終ウィンドウが短い場合もパディングせず末端で打ち切る

### Step 6: LateChunkingService実装・統合

- 入力テキスト → WindowSplitter → バッチエンコード → HiddenStatePooler → 埋め込みベクトル配列 の処理フローを実装する
- `batchSize` に従ってウィンドウをバッチ処理する
- エラーは上位に再スローし、部分失敗時はリトライしない（呼び出し元責務）

### Step 7: EmbeddingServiceへの統合

- 統合方式は [phase-2-design.md](phase-2-design.md) の決定に従う
- 本Phaseでは新しい統合方式を追加提案せず、既存コードへの反映差分だけを記録する
- 既存コードパスへの影響がないことを型レベルで保証する

## 実装コマンド

```bash
# ビルド確認
pnpm --filter @repo/shared build

# 型チェック
pnpm --filter @repo/shared typecheck
```

## 統合テスト連携

- SubAgent-A/B/C の実装を並列で進め、SubAgent-D が整合性を確認する
- `LateChunkingService` と `EmbeddingService（useLateChunking=true）` を統合対象に固定する
- 既存の `EmbeddingService（useLateChunking=false）` の動作が変わらないことを確認する
- 統合ログは `outputs/phase-5/` に保存する

## 多角的チェック観点

| 観点     | 確認内容                                                          |
| -------- | ----------------------------------------------------------------- |
| 矛盾     | 型定義と実装クラスのシグネチャが一致しているか確認する            |
| 漏れ     | 要件の型（ChunkBoundary等）が全てエクスポートされているか確認する |
| 整合性   | Phase 2 の契約正本と実装差分が一致しているか確認する              |
| 依存関係 | Phase 4のテスト仕様が全てGreenになることを確認する                |

## 成果物

| 成果物           | パス                                        | 説明                       |
| ---------------- | ------------------------------------------- | -------------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装計画と差分要約         |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 新規作成・修正ファイル一覧 |
| 契約差分         | `outputs/phase-5/contract-diff.md`          | インターフェース差分記録   |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `pnpm --filter @repo/shared build` がエラーなく完了する
- [ ] `pnpm --filter @repo/shared typecheck` がエラーなく完了する
- [ ] Phase 4のテスト（Red）がGreenに変わる
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列実装作業
3. SubAgent-D の統合判定
4. ビルド・型チェックの通過確認
5. 成果物出力
6. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UNASSIGNED-EMB-005-late-chunking
```

## 次のPhase

Phase 6: テスト拡充
