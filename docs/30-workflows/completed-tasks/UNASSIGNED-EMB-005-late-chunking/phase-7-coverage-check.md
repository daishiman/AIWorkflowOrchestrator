# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 7                  |
| 機能名     | UNASSIGNED-EMB-005 |
| タスク名   | Late Chunking実装  |
| 前提Phase  | Phase 6            |
| 後続Phase  | Phase 8            |
| 作成日     | 2026-04-19         |
| ステータス | pending            |

## 目的

concernとdependency edgeのcoverageを可視化し、カバレッジ不足を定量化して補完計画を固定する。

## 背景

Phase 6で異常系・回帰テストを追加したが、定量的なカバレッジ計測なしには死角が残る可能性がある。特にLate Chunkingはプーリング戦略の分岐（Mean/Max/CLS）、ウィンドウ境界の端数処理、バッチ処理の最終バッチ処理など、条件分岐が多いため分岐カバレッジ（branch coverage）の確認が重要である。

## SubAgentチーム編成

| SubAgent   | 関心ごと                 | 主担当                                          |
| ---------- | ------------------------ | ----------------------------------------------- |
| SubAgent-A | コアロジックカバレッジ   | LateChunkingService / TokenBoundaryCalculator   |
| SubAgent-B | プーリング分岐カバレッジ | HiddenStatePooler（Mean/Max/CLS分岐）           |
| SubAgent-C | 統合カバレッジ           | EmbeddingService統合パス・useLateChunkingフラグ |
| SubAgent-D | 統合監査                 | 矛盾・漏れ・整合・依存判定                      |

## 実行タスク

- カバレッジ計測: 行・分岐・関数の計測値を取得する
- 不足分析: 不足箇所の根因と補完策を記録する
- 受け入れ照合: 受け入れ基準網羅率（目標80%以上）を計測する

## 参照資料

| 参照資料         | パス                                        | 説明           |
| ---------------- | ------------------------------------------- | -------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | Phase 5 成果物 |
| 契約差分         | `outputs/phase-5/contract-diff.md`          | Phase 5 成果物 |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | Phase 6 成果物 |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | Phase 6 成果物 |
| 異常系結果       | `outputs/phase-6/edge-case-result.md`       | Phase 6 成果物 |

## 実行手順

1. 入力成果物を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. 成果物を `outputs/phase-7/` に定義する。
4. 完了条件で矛盾・漏れ・整合・依存を判定する。

## カバレッジ計測詳細

### 計測コマンド

```bash
pnpm --filter @repo/shared test:coverage
```

### 計測対象ファイル

| ファイル                                     | 計測観点                                      |
| -------------------------------------------- | --------------------------------------------- |
| `late-chunking/late-chunking-service.ts`     | 行・分岐・関数                                |
| `late-chunking/token-boundary-calculator.ts` | 行・分岐・関数                                |
| `late-chunking/hidden-state-pooler.ts`       | 分岐（Mean/Max/CLS各戦略）                    |
| `late-chunking/window-splitter.ts`           | 分岐（端数ウィンドウ・オーバーラップ0の場合） |
| `embedding/embedding-service.ts`             | 分岐（useLateChunkingフラグ）                 |

### 目標カバレッジ

| 指標           | 目標値  |
| -------------- | ------- |
| 行カバレッジ   | 80%以上 |
| 分岐カバレッジ | 80%以上 |
| 関数カバレッジ | 90%以上 |

## 不足分析観点

### concernカバレッジ

- `PoolingStrategy` の全3戦略が独立したテストケースで検証されているか
- `ChunkBoundary` の境界値（startChar=0, endChar=text.length-1）がテストされているか
- `batchSize=1` と `batchSize=N` の両方のパスがテストされているか

### dependency edgeカバレッジ

- `LateChunkingService` → `TokenBoundaryCalculator` の依存エッジがテストされているか
- `LateChunkingService` → `HiddenStatePooler` の依存エッジがテストされているか
- `LateChunkingService` → `WindowSplitter` の依存エッジがテストされているか
- `EmbeddingService` → `LateChunkingService` の依存エッジがテストされているか

## 補完計画テンプレート

カバレッジ不足が判明した場合、以下のテーブル形式で補完計画を記録する。

| 不足箇所                 | 現在のカバレッジ | 目標カバレッジ | 補完テストケース | 優先度 |
| ------------------------ | ---------------- | -------------- | ---------------- | ------ |
| （計測結果に基づき記入） | -                | 80%            | -                | -      |

## 統合テスト連携

- SubAgent-A/B/C のカバレッジ計測を並列で実施する。
- SubAgent-D が全体カバレッジサマリーを直列で集計する。
- `pnpm --filter @repo/shared test:coverage` の結果をJSON形式で保存し、レポートに引用する。
- 統合ログは `outputs/phase-7/` に保存する。

## 多角的チェック観点

| 観点     | 確認内容                                                  |
| -------- | --------------------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                        |
| 漏れ     | 要件から成果物への未反映項目がないか確認する              |
| 整合性   | カバレッジ目標（80%以上）と実測値が整合しているか確認する |
| 依存関係 | Phase 5・Phase 6の成果物が全て参照されているか確認する    |

## 成果物

| 成果物                 | パス                                              | 説明           |
| ---------------------- | ------------------------------------------------- | -------------- |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | 計測と目標設定 |
| 未到達分析             | `outputs/phase-7/uncovered-analysis-plan.md`      | 不足箇所分析   |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | 要件網羅率報告 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `pnpm --filter @repo/shared test:coverage` が正常終了する
- [ ] 行カバレッジが80%以上に達する
- [ ] 分岐カバレッジが80%以上に達する
- [ ] 関数カバレッジが90%以上に達する
- [ ] 不足箇所が特定され補完計画が記録されている
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列計測作業
3. SubAgent-D の集計・統合判定
4. 不足分析と補完計画の記録
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

Phase 8: リファクタリング
