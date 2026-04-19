# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 4                                       |
| 機能名     | UNASSIGNED-EMB-005                      |
| タスク名   | Late Chunking実装（検索品質10-30%向上） |
| 前提Phase  | Phase 3                                 |
| 後続Phase  | Phase 5                                 |
| 作成日     | 2026-04-19                              |
| ステータス | pending                                 |

## 目的

TDDのRed段階として、実装前に失敗するテストを先行作成し、Late Chunkingの期待挙動を実行可能な形で固定する。テスト実行コマンドは `pnpm --filter @repo/shared test` をターゲット指定で実行する。

## 背景

Phase 3のゲート判定PASSを前提として、Phase 2設計書に基づく失敗テストを設計・作成する。実装が存在しない段階でテストが正しく失敗（Red）することを確認し、後続のPhase 5（実装）でGreenにする基準を固定する。

## SubAgentチーム編成

| SubAgent   | 関心ごと                     | 主担当                                                       |
| ---------- | ---------------------------- | ------------------------------------------------------------ |
| SubAgent-A | 型定義・インターフェース設計 | 型契約テスト・サービスAPIシグネチャのRedテスト設計           |
| SubAgent-B | アルゴリズム・コア実装       | Pooling戦略・TokenBoundary・WindowSplitter のユニットテスト  |
| SubAgent-C | 統合・既存APIとの互換性      | 既存EmbeddingService後方互換テスト・統合テスト設計           |
| SubAgent-D | テスト・品質・ベンチマーク   | 品質比較テスト・メモリ計測テスト・全テストのトレーサビリティ |

## 実行タスク

- Redケース設計: Phase 2サービス層API・受入条件単位で失敗テストを設計する
- テストファイル作成: Vitestで実行可能なテストファイルを作成する
- Red確認: 実装なしでテストが正しく失敗（Red）することを確認する
- 統合テスト設計: LateChunkingServiceと既存EmbeddingServiceの結合テストを設計する
- トレーサビリティ作成: Phase 1受入条件→テストケースの対応表を作成する

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
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md`                     | Phase 2 成果物 |
| サービス層API設計書  | `outputs/phase-2/service-api-design.md`                      | Phase 2 成果物 |
| 既存統合設計書       | `outputs/phase-2/existing-integration-design.md`             | Phase 2 成果物 |
| メモリ設計書         | `outputs/phase-2/memory-design.md`                           | Phase 2 成果物 |
| テスト戦略書         | `outputs/phase-2/test-strategy.md`                           | Phase 2 成果物 |
| 依存整合マトリクス   | `outputs/phase-2/dependency-consistency-matrix.md`           | Phase 2 成果物 |
| 設計レビュー結果     | `outputs/phase-3/design-review-result.md`                    | Phase 3 成果物 |
| ゲート判定書         | `outputs/phase-3/gate-decision.md`                           | Phase 3 成果物 |
| 矛盾チェック表       | `outputs/phase-3/contradiction-checklist.md`                 | Phase 3 成果物 |

## テストケース一覧

### SubAgent-A担当: 型定義・APIシグネチャテスト

| テストID    | テストファイル                                                           | テスト名                                                   | 期待結果（Red）          |
| ----------- | ------------------------------------------------------------------------ | ---------------------------------------------------------- | ------------------------ |
| EMB-005-T01 | `services/embedding/__tests__/late-chunking/types.test.ts`               | ChunkBoundaryが正しい型を持つ                              | 型インポートエラーで失敗 |
| EMB-005-T02 | `services/embedding/__tests__/late-chunking/types.test.ts`               | HiddenStateがFloat32Array/Float16Arrayを保持できる         | 型インポートエラーで失敗 |
| EMB-005-T03 | `services/embedding/__tests__/late-chunking/types.test.ts`               | LateChunkingConfigのデフォルト値が仕様通りである           | 型インポートエラーで失敗 |
| EMB-005-T04 | `services/embedding/__tests__/late-chunking/LateChunkingService.test.ts` | generateChunkEmbeddingsがChunkBoundary数と同数の結果を返す | モジュール未実装でエラー |

### SubAgent-B担当: アルゴリズム・コアコンポーネントテスト

| テストID    | テストファイル                                                               | テスト名                                                                           | 期待結果（Red）          |
| ----------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------ |
| EMB-005-T05 | `services/embedding/__tests__/late-chunking/TokenBoundaryCalculator.test.ts` | ASCII短文: 境界オフセットが正確なトークンインデックスに変換される                  | モジュール未実装でエラー |
| EMB-005-T06 | `services/embedding/__tests__/late-chunking/TokenBoundaryCalculator.test.ts` | CJK文字列: マルチバイト文字のオフセットマッピングが正確に機能する                  | モジュール未実装でエラー |
| EMB-005-T07 | `services/embedding/__tests__/late-chunking/TokenBoundaryCalculator.test.ts` | 絵文字（サロゲートペア）: offset_mappingが正確に機能する                           | モジュール未実装でエラー |
| EMB-005-T08 | `services/embedding/__tests__/late-chunking/HiddenStatePooler.test.ts`       | Mean Pooling: トークン範囲の平均ベクトルが正確に計算される                         | モジュール未実装でエラー |
| EMB-005-T09 | `services/embedding/__tests__/late-chunking/HiddenStatePooler.test.ts`       | Max Pooling: トークン範囲の最大値ベクトルが正確に計算される                        | モジュール未実装でエラー |
| EMB-005-T10 | `services/embedding/__tests__/late-chunking/HiddenStatePooler.test.ts`       | CLS Pooling: 先頭トークンのHidden Stateがそのまま返される                          | モジュール未実装でエラー |
| EMB-005-T11 | `services/embedding/__tests__/late-chunking/WindowSplitter.test.ts`          | トークン長が閾値以下: ウィンドウ分割が発生しない（1ウィンドウ）                    | モジュール未実装でエラー |
| EMB-005-T12 | `services/embedding/__tests__/late-chunking/WindowSplitter.test.ts`          | トークン長が閾値超過: 指定オーバーラップ比率で複数ウィンドウに分割される           | モジュール未実装でエラー |
| EMB-005-T13 | `services/embedding/__tests__/late-chunking/WindowSplitter.test.ts`          | 境界チャンクの加重平均マージ: 複数ウィンドウにまたがるチャンクが正確にマージされる | モジュール未実装でエラー |

### SubAgent-C担当: 統合・後方互換テスト

| テストID    | テストファイル                                                   | テスト名                                                                | 期待結果（Red）                      |
| ----------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------ |
| EMB-005-T14 | `services/embedding/__tests__/late-chunking/integration.test.ts` | 既存EmbeddingService.generate()が変更なしで動作する（後方互換）         | LateChunking未実装でも既存は通ること |
| EMB-005-T15 | `services/embedding/__tests__/late-chunking/integration.test.ts` | EarlyChunkingStrategyがデフォルト動作として維持されている               | Strategyパターン未実装でエラー       |
| EMB-005-T16 | `services/embedding/__tests__/late-chunking/integration.test.ts` | LateChunkingStrategyを注入したEmbeddingServiceがLate Chunkingを実行する | モジュール未実装でエラー             |
| EMB-005-T17 | `services/embedding/__tests__/late-chunking/integration.test.ts` | 短文（< 100トークン）: Late ChunkingがEmbeddingを正常生成する           | モジュール未実装でエラー             |
| EMB-005-T18 | `services/embedding/__tests__/late-chunking/integration.test.ts` | 長文（> maxTokenLength）: WindowSplitterを経由してEmbeddingを生成する   | モジュール未実装でエラー             |

### SubAgent-D担当: 品質比較・メモリ計測テスト

| テストID    | テストファイル                                               | テスト名                                                                     | 期待結果（Red）          |
| ----------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------- | ------------------------ |
| EMB-005-T19 | `services/embedding/__tests__/late-chunking/quality.test.ts` | 品質比較: LateChunkingのMRRがEarlyChunkingより高い（ベンチマーク用テキスト） | モジュール未実装でエラー |
| EMB-005-T20 | `services/embedding/__tests__/late-chunking/quality.test.ts` | 品質比較: CJKテキストでのNDCG@10がEarlyChunkingより高い                      | モジュール未実装でエラー |
| EMB-005-T21 | `services/embedding/__tests__/late-chunking/memory.test.ts`  | メモリ計測: Float16使用時のピークメモリがFloat32の55%以下である              | モジュール未実装でエラー |
| EMB-005-T22 | `services/embedding/__tests__/late-chunking/memory.test.ts`  | メモリ計測: Pooling後にHidden State配列が解放されメモリが回復する            | モジュール未実装でエラー |
| EMB-005-T23 | `services/embedding/__tests__/late-chunking/quality.test.ts` | Float16精度: Float16とFloat32の品質差が1%未満である                          | モジュール未実装でエラー |

## テストファイル配置

```
packages/shared/src/services/embedding/__tests__/late-chunking/
├── types.test.ts                      # EMB-005-T01〜T03: 型定義テスト
├── LateChunkingService.test.ts        # EMB-005-T04: サービスAPIテスト
├── TokenBoundaryCalculator.test.ts    # EMB-005-T05〜T07: 境界計算テスト
├── HiddenStatePooler.test.ts          # EMB-005-T08〜T10: Poolingテスト
├── WindowSplitter.test.ts             # EMB-005-T11〜T13: ウィンドウ分割テスト
├── integration.test.ts               # EMB-005-T14〜T18: 統合テスト
├── quality.test.ts                   # EMB-005-T19〜T20, T23: 品質比較テスト
└── memory.test.ts                    # EMB-005-T21〜T22: メモリ計測テスト
```

## テスト実行コマンド

```bash
# 全テスト実行（Redを確認）
pnpm --filter @repo/shared test

# Late Chunkingテストのみ実行
pnpm --filter @repo/shared test -- --testPathPattern="late-chunking"

# 特定テストファイルのみ実行
pnpm --filter @repo/shared test -- src/services/embedding/__tests__/late-chunking/HiddenStatePooler.test.ts

# カバレッジ計測付き実行（Phase 7向け）
pnpm --filter @repo/shared test -- --coverage --testPathPattern="late-chunking"

# ウォッチモード（実装時）
pnpm --filter @repo/shared test -- --watch --testPathPattern="late-chunking"
```

## テストコード設計例（参考）

```typescript
// packages/shared/src/services/embedding/__tests__/late-chunking/HiddenStatePooler.test.ts
import { describe, it, expect } from "vitest";
import { HiddenStatePooler } from "../../../services/embedding/HiddenStatePooler";
import type { HiddenState } from "../../../types/embedding/HiddenState";

describe("HiddenStatePooler", () => {
  describe("Mean Pooling", () => {
    it("トークン範囲の平均ベクトルを正確に計算する", () => {
      const hiddenStates: HiddenState[] = [
        { tokenIndex: 0, vector: new Float32Array([1.0, 2.0, 3.0]) },
        { tokenIndex: 1, vector: new Float32Array([3.0, 4.0, 5.0]) },
        { tokenIndex: 2, vector: new Float32Array([5.0, 6.0, 7.0]) },
      ];
      const pooler = new HiddenStatePooler({ strategy: "mean" });
      const result = pooler.pool(hiddenStates, { start: 0, end: 2 });
      // 期待値: [(1+3+5)/3, (2+4+6)/3, (3+5+7)/3] = [3.0, 4.0, 5.0]
      expect(result).toBeInstanceOf(Float32Array);
      expect(Array.from(result)).toBeCloseTo([3.0, 4.0, 5.0], 5);
    });
  });

  // CJK文字テスト
  describe("CJK文字対応", () => {
    it("日本語テキストのchunkBoundaryが正確なトークンインデックスに変換される", async () => {
      // "今日は良い天気です" のoffsetが正確にマッピングされること
      const text = "今日は良い天気です。明日も晴れるでしょう。";
      const boundary = { startOffset: 0, endOffset: 9, chunkId: "chunk-0" };
      // TokenBoundaryCalculator実装後にGreenになることを確認
      const calculator = new TokenBoundaryCalculator();
      await expect(
        calculator.calculate(text, [boundary]),
      ).resolves.toBeDefined();
    });
  });
});
```

## 統合テスト計画

### テストシナリオ: 短文（ASCII）

- 入力: `"The quick brown fox jumps over the lazy dog."` （< 100トークン）
- チャンク境界: `[{0, 19, "chunk-0"}, {20, 44, "chunk-1"}]`
- 期待: 2つのEmbeddingが生成され、各EmbeddingのL2ノルムが正規化されている

### テストシナリオ: 長文（ウィンドウ分割）

- 入力: 5000文字の英語技術文書（> 512トークン = maxTokenLength超過）
- 期待: WindowSplitterが2以上のウィンドウに分割し、境界チャンクが加重平均マージされる

### テストシナリオ: CJK文字

- 入力: 日本語・中国語・韓国語の混在テキスト
- 期待: offset_mappingがサロゲートペアを含む全マルチバイト文字で正確に機能する

### テストシナリオ: 絵文字（サロゲートペア）

- 入力: `"Hello 🌍 World 🚀"` のような絵文字を含むテキスト
- 期待: `\uD83C\uDF0D` のサロゲートペアがoffset_mappingで正確に処理される

### テストシナリオ: 品質比較

- 入力: Wikipedia記事100件 + 対応するクエリ300件（ベンチマークデータセット）
- 期待: LateChunkingのMRR@10がEarlyChunkingより10%以上高い

### テストシナリオ: メモリ計測

- 入力: 10000文字ドキュメント × 10件（バッチ処理）
- 計測: `process.memoryUsage().heapUsed` でピーク使用量を記録
- 期待: Float16使用時がFloat32使用時の55%以下

## 実行手順

1. Phase 1・2・3 の全成果物を入力として確認する。
2. SubAgent-A がT01〜T04（型定義・API）の失敗テストを作成する。
3. SubAgent-B がT05〜T13（アルゴリズム）の失敗テストを作成する。
4. SubAgent-C がT14〜T18（統合・後方互換）の失敗テストを作成する。
5. SubAgent-D がT19〜T23（品質・メモリ）の失敗テストを作成する。
6. `pnpm --filter @repo/shared test -- --testPathPattern="late-chunking"` を実行し全テストがRedであることを確認する。
7. T14（後方互換）のみGreenであることを確認する（既存APIは壊れていないこと）。
8. トレーサビリティ行列を作成する。
9. 成果物を `outputs/phase-4/` に保存する。

## 統合テスト連携

- SubAgent-A/B/C の検証ケースを並列で作成する。
- SubAgent-D が統合順序を直列で確定する。
- T14（既存EmbeddingService後方互換）はRedではなくGreenになることを明示する。
- Redテスト数: 22件、Greenテスト数（後方互換のみ）: 1件（T14）を期待する。
- 統合ログは `outputs/phase-4/` に保存する。

## 多角的チェック観点

| 観点     | 確認内容                                                                            |
| -------- | ----------------------------------------------------------------------------------- |
| 矛盾     | テストケースとPhase 2設計のAPIシグネチャが一致しているか確認する                    |
| 漏れ     | Phase 1受入条件（CJK/絵文字/品質10-30%/メモリ計測）が全てテストに含まれるか         |
| 整合性   | テストファイルの命名規則が `packages/shared/` 既存テストと一致しているか確認        |
| 依存関係 | テスト内でimportしている型・サービスのパスがPhase 2設計書のファイル配置と一致するか |

## 成果物

| 成果物               | パス                                          | 説明                               |
| -------------------- | --------------------------------------------- | ---------------------------------- |
| テスト仕様書         | `outputs/phase-4/test-specification.md`       | 全23テストケースの仕様記述         |
| Redテスト実行結果    | `outputs/phase-4/red-test-result.md`          | `pnpm test` 実行時の失敗ログ       |
| 統合テスト計画書     | `outputs/phase-4/integration-test-plan.md`    | 統合テストシナリオ・実行手順       |
| トレーサビリティ行列 | `outputs/phase-4/test-traceability-matrix.md` | Phase 1受入条件→テストケース対応表 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 全23テストファイルが作成された
- [ ] `pnpm --filter @repo/shared test -- --testPathPattern="late-chunking"` を実行しT14以外の全テストがRedであることを確認した
- [ ] T14（後方互換）がGreenであることを確認した
- [ ] Phase 1受入条件の全項目がトレーサビリティ行列でテストにマッピングされている
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列テスト作成
3. SubAgent-D の品質・メモリテスト作成
4. `pnpm --filter @repo/shared test` によるRed確認
5. トレーサビリティ行列作成
6. 成果物出力
7. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UNASSIGNED-EMB-005-late-chunking
```

## 次のPhase

Phase 5: 実装
