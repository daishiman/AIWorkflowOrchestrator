# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 8                  |
| 機能名     | UNASSIGNED-EMB-005 |
| タスク名   | Late Chunking実装  |
| 前提Phase  | Phase 7            |
| 後続Phase  | Phase 9            |
| 作成日     | 2026-04-19         |
| ステータス | pending            |

## 目的

振る舞いを維持したままduplicateとnavigation driftを削除し、メモリ効率を改善する。

## 背景

Phase 5〜7を通じて最小実装・テスト拡充・カバレッジ計測を完了した。この段階では実装速度を優先したため、重複ロジックや命名の揺れが残っている可能性がある。また `Float32Array` の扱いでは不要なコピーやバッファ解放漏れがパフォーマンス劣化の原因になりうる。本PhaseではGreenを維持したままコードを整理する。

## SubAgentチーム編成

| SubAgent   | 関心ごと       | 主担当                                   |
| ---------- | -------------- | ---------------------------------------- |
| SubAgent-A | 重複削減       | 共通ロジックの抽出・統合                 |
| SubAgent-B | 命名整合       | 型・変数・メソッド名のユビキタス言語統一 |
| SubAgent-C | メモリ効率改善 | Float16最適化・バッファ解放確認          |
| SubAgent-D | 統合監査       | 矛盾・漏れ・整合・依存判定・回帰確認     |

## 実行タスク

- 重複削減: 重複ロジックを統合して責務を明確化する
- 命名整合: 型・変数・メソッド名をLate Chunkingドメイン語彙に統一する
- メモリ効率改善: Float16最適化とバッファ解放の確認を実施する
- 再検証計画: リファクタ後の回帰確認計画を作成する

## 参照資料

| 参照資料               | パス                                              | 説明           |
| ---------------------- | ------------------------------------------------- | -------------- |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物 |
| 変更ファイル一覧       | `outputs/phase-5/changed-files.md`                | Phase 5 成果物 |
| 契約差分               | `outputs/phase-5/contract-diff.md`                | Phase 5 成果物 |
| 拡張テストケース       | `outputs/phase-6/expanded-test-cases.md`          | Phase 6 成果物 |
| 回帰テスト結果         | `outputs/phase-6/regression-test-result.md`       | Phase 6 成果物 |
| 異常系結果             | `outputs/phase-6/edge-case-result.md`             | Phase 6 成果物 |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | Phase 7 成果物 |
| 未到達分析             | `outputs/phase-7/uncovered-analysis-plan.md`      | Phase 7 成果物 |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | Phase 7 成果物 |

## 実行手順

1. 入力成果物を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. 成果物を `outputs/phase-8/` に定義する。
4. 完了条件で矛盾・漏れ・整合・依存を判定する。

## リファクタリング記録テーブル

変更内容は以下のテーブル形式で「対象/Before/After/理由」を記録する。

| 対象ファイル     | Before | After | 理由 |
| ---------------- | ------ | ----- | ---- |
| （実施時に記入） | -      | -     | -    |

## 重複削減の観点

- `HiddenStatePooler` と `LateChunkingService` に散在するループ処理を共通ユーティリティ関数に抽出する
- `ChunkBoundary` バリデーションロジックが複数箇所に存在する場合は単一の `validateChunkBoundary()` 関数に統合する
- テストコードの `createMockHiddenStates` / `createTestChunkBoundaries` が重複している場合はテストフィクスチャモジュールに集約する

## 命名整合の観点

- Late Chunkingドメイン用語（`chunk`, `boundary`, `pooling`, `hiddenState`, `window`）をコードベース全体で統一する
- `index` / `idx` / `i` など意味が不明な変数名を `tokenIndex` / `chunkIndex` / `windowIndex` に改名する
- インターフェース名のプレフィックス（`I`）を統一し、実装クラス名との対応関係を明確にする

## メモリ効率改善の観点

### Float16最適化

- `Float32Array` で保持している隠れ状態ベクトルのうち、精度上問題ない箇所を `Float16Array` へ移行する検討を行う
- 移行可否は精度テスト（既存Greenテストの数値誤差確認）で判断し、記録する

### バッファ解放確認

- `LateChunkingService.encode()` 処理後に中間バッファ（ウィンドウトークン配列、隠れ状態配列）が適切に解放されることを確認する
- バッチ処理ループ内でバッファが累積しないことをメモリプロファイリングで確認する
- 確認方法: `--expose-gc` フラグを用いたNode.jsテストスクリプトで検証する

## リファクタ後の再検証計画

```bash
# リファクタ後に全テストがGreenであることを確認
pnpm --filter @repo/shared test

# カバレッジがPhase 7の水準を下回っていないことを確認
pnpm --filter @repo/shared test:coverage

# 型チェックでリファクタによる型エラーがないことを確認
pnpm --filter @repo/shared typecheck
```

## 統合テスト連携

- SubAgent-A/B/C のリファクタ作業を並列で進め、SubAgent-D が統合整合性を確認する。
- リファクタ前後でテスト結果が変わらないことをSubAgent-Dが最終確認する。
- `LateChunkingService` と `EmbeddingService（useLateChunking=true/false）` の振る舞いが変わらないことを統合テストで確認する。
- 統合ログは `outputs/phase-8/` に保存する。

## 多角的チェック観点

| 観点     | 確認内容                                                                   |
| -------- | -------------------------------------------------------------------------- |
| 矛盾     | リファクタ前後でテスト結果が変わらないか確認する                           |
| 漏れ     | リファクタ対象として特定した全箇所が変更されているか確認する               |
| 整合性   | 命名変更がインターフェース・型・テストコード全体に反映されているか確認する |
| 依存関係 | Phase 7のカバレッジ水準がリファクタ後も維持されているか確認する            |

## 成果物

| 成果物           | パス                                            | 説明                              |
| ---------------- | ----------------------------------------------- | --------------------------------- |
| リファクタ計画   | `outputs/phase-8/refactoring-plan.md`           | 対象/Before/After/理由テーブル    |
| 再テスト計画     | `outputs/phase-8/post-refactor-test-plan.md`    | リファクタ後の回帰確認計画        |
| メモリ最適化記録 | `outputs/phase-8/memory-optimization-report.md` | Float16検討結果・バッファ解放確認 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] リファクタ後も全テストがGreenである
- [ ] リファクタ後のカバレッジがPhase 7の水準（80%以上）を維持している
- [ ] `pnpm --filter @repo/shared typecheck` がエラーなく完了する
- [ ] 変更内容が「対象/Before/After/理由」テーブルに全件記録されている
- [ ] Float16移行可否の判断が記録されている
- [ ] バッファ解放の確認結果が記録されている
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列リファクタ作業
3. SubAgent-D の統合判定
4. リファクタ後の全テスト・型チェック実行
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

Phase 9: 品質保証
