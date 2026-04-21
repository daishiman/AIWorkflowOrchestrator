# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 値                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------- |
| Phase      | 7                                                                                            |
| タスクID   | TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001                                                |
| タスク種別 | NON_VISUAL code task                                                                         |
| 目的       | `LateChunkingService` の 9 メソッドと `ChunkingService` 委譲ロジックのカバレッジを可視化する |
| 前Phase    | phase-6-test-expansion.md                                                                    |
| 次Phase    | phase-8-refactoring.md                                                                       |

> current fact: coverage 主対象は `chunking-late-chunking-adapter.ts` と `chunking-service.ts` の委譲経路。

## 目的

Phase 5 で移動した 9 メソッドおよび Phase 6 で拡充した SEP-01〜SEP-09・委譲確認テスト・フォールバックテストが、`LateChunkingService` の全 public / private メソッドと `ChunkingService.applyLateChunking()` の委譲パスを網羅していることを計測し、未カバー行ゼロを証明する。総合カバレッジ指数 180%+ 達成を必達目標とする。

## 実行タスク

- タスク1: `LateChunkingService` のカバレッジ計測
- タスク2: `ChunkingService` 委譲ロジックのカバレッジ計測
- タスク3: 9 メソッドごとのカバレッジチェックリスト消化
- タスク4: 未カバー行の特定と Phase 6 への戻し判定
- タスク5: 総合カバレッジ指数 180%+ の達成確認
- タスク6: Canonical Artifacts（`coverage-report.md` / `uncovered-lines.md`）の出力

## 実行手順

### ステップ1: `LateChunkingService` の単体カバレッジ計測

```bash
pnpm --filter @repo/shared test --coverage -- LateChunkingService
```

- 計測対象: `packages/shared/src/services/embedding/late-chunking/LateChunkingService.ts`
- 出力形式: `--reporter=verbose` と `--coverage.reporter=text` で取得し `outputs/phase-7/coverage-report.md` に貼り付ける
- 集計指標: Line Coverage / Branch Coverage / Function Coverage / Statement Coverage

### ステップ2: `ChunkingService` 委譲パスのカバレッジ計測

```bash
pnpm --filter @repo/shared test --coverage -- chunking-service
```

- 計測対象: `packages/shared/src/services/chunking/chunking-service.ts`
- 重点観測行: `applyLateChunking()` の委譲呼び出し（`this.lateChunkingService?.applyLateChunking(...)`）とコンストラクタ第 4 引数受け入れ部
- `chunking-service.integration.test.ts` 経由の Late Chunking 関連テストが委譲行をヒットしていることを確認する

### ステップ3: 9 メソッドごとのカバレッジチェックリスト消化

下表の 9 メソッドについて、計測結果から Line / Branch Coverage を抽出し、`coverage-report.md` に記録する。

| No  | メソッド名                 | 可視性  | 必達 Line Cov | 必達 Branch Cov | 検証観点                                                           |
| --- | -------------------------- | ------- | ------------- | --------------- | ------------------------------------------------------------------ |
| 1   | `applyLateChunking`        | public  | 100%          | 90%+            | 単一チャンク `mean` / 複数チャンク `cls` / フォールバック分岐      |
| 2   | `getTokenEmbeddings`       | private | 100%          | 85%+            | `embeddingClient.getTokenEmbeddings?` 有無両分岐                   |
| 3   | `determineChunkBoundaries` | public  | 100%          | 90%+            | 先頭（`start=0`）/ 末尾（`end=text.length`）/ 中間チャンク         |
| 4   | `charPositionToTokenIndex` | private | 100%          | 80%+            | `charPosition=0` / `charPosition=text.length` / 中間位置           |
| 5   | `poolTokenEmbeddings`      | public  | 100%          | 95%+            | `mean` / `cls` / `attention` の 3 戦略 × 重なりあり・なしの 2 条件 |
| 6   | `hasTokenOverlap`          | private | 100%          | 100%            | 重なりあり / 完全分離 / 境界一致                                   |
| 7   | `calculateOverlapTokens`   | private | 100%          | 90%+            | 部分重なり / 完全包含 / 重なりゼロ                                 |
| 8   | `findNearestSegment`       | private | 100%          | 90%+            | 前方セグメント最近傍 / 後方セグメント最近傍 / 等距離タイブレーク   |
| 9   | `averageEmbeddings`        | private | 100%          | 85%+            | 単一ベクトル / 複数ベクトル / 空配列ガード                         |

### ステップ4: 未カバー行の特定

`pnpm --filter @repo/shared test --coverage -- LateChunkingService` 出力の `Uncovered Line #s` 列から、カバーされていない行を抽出し `outputs/phase-7/uncovered-lines.md` に一覧化する。

| 記録項目         | 内容                                             |
| ---------------- | ------------------------------------------------ |
| ファイルパス     | `LateChunkingService.ts` / `chunking-service.ts` |
| 未カバー行番号   | 計測結果から直接転記                             |
| 該当メソッド名   | 上表 9 メソッドの該当項目                        |
| 原因分類         | 異常系未テスト / 到達不能 / テスト不足           |
| Phase 6 戻し要否 | Yes / No                                         |

### ステップ5: 総合カバレッジ指数の算出

以下の式で総合カバレッジ指数を算出する。目標値は **180%+**。

```
総合カバレッジ指数 =
  Line Coverage(%)
  + Branch Coverage(%)
  × Function Coverage(%) / 100
```

- 180% 未達成の場合は Phase 6 に戻り、未カバー分岐に対するテストを追加する。
- 180% 達成の場合は Phase 8（リファクタリング）に進む。

### ステップ6: 既存 `chunking-service.integration.test.ts` 回帰カバレッジ確認

```bash
pnpm --filter @repo/shared test -- chunking-service.integration
```

- 既存 Late Chunking 関連テスト（`lateChunking.enabled=true` のシナリオ）が委譲経路で PASS することを確認する。
- Phase 5 以前と比較してテスト件数が減っていないことを記録する。

## 統合テスト連携

- coverage 計測には `LateChunkingService` 単体テストと `chunking-service.integration.test.ts` を両方含める。
- 委譲確認の統合テストでしか到達しない分岐は coverage 判定から外さず追跡する。
- Phase 9 の品質ゲートでは本 Phase の coverage 結果を再利用する。

## 参照資料

| 参照資料                 | パス                                                                                   | 内容                           |
| ------------------------ | -------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 1 要件定義         | `phase-1-requirements.md`                                                              | 9 メソッド inventory と AC     |
| Phase 2 設計             | `phase-2-design.md`                                                                    | public/private 分類と SEP 設計 |
| Phase 6 テスト拡充成果物 | `outputs/phase-6/regression-expansion-plan.md`                                         | 委譲確認・フォールバックテスト |
| カバレッジ基準           | `.claude/skills/task-specification-creator/references/coverage-standards.md`           | Line/Branch/Function 目標値    |
| 実装対象                 | `packages/shared/src/services/embedding/late-chunking/LateChunkingService.ts`          | 計測対象本体                   |
| 委譲元                   | `packages/shared/src/services/chunking/chunking-service.ts`                            | 委譲パス計測対象               |
| 既存統合テスト           | `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts` | 回帰カバレッジ                 |

## Canonical Artifacts

| 成果物             | パス                                 | 内容                                      |
| ------------------ | ------------------------------------ | ----------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | Line/Branch/Function/Statement の計測結果 |
| 未カバー行一覧     | `outputs/phase-7/uncovered-lines.md` | ファイル × 行番号 × 原因分類 × 戻し判定   |

## 成果物

| 成果物             | パス                                 | 説明                                    |
| ------------------ | ------------------------------------ | --------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 9 メソッド別 Line/Branch Cov と総合指数 |
| 未カバー行一覧     | `outputs/phase-7/uncovered-lines.md` | 未カバー行の特定と Phase 6 戻し要否判定 |

## 完了条件

- [ ] `pnpm --filter @repo/shared test --coverage -- LateChunkingService` を実行し、結果を `coverage-report.md` に記録した
- [ ] `pnpm --filter @repo/shared test --coverage -- chunking-service` を実行し、委譲パスのカバレッジを記録した
- [ ] 9 メソッドそれぞれの Line Coverage 100%、Branch Coverage 目標値達成を記録した
- [ ] `applyLateChunking` / `determineChunkBoundaries` / `poolTokenEmbeddings`（public 3 メソッド）の全分岐がテストで到達されている
- [ ] `getTokenEmbeddings` / `charPositionToTokenIndex` / `hasTokenOverlap` / `calculateOverlapTokens` / `findNearestSegment` / `averageEmbeddings`（private 6 メソッド）が public メソッド経由で間接カバーされている
- [ ] `ChunkingService.applyLateChunking()` の委譲呼び出し行がカバーされている
- [ ] `ChunkingService` コンストラクタ第 4 引数（`lateChunkingService?`）の注入パスと自動生成パスの両方がカバーされている
- [ ] 未カバー行を `uncovered-lines.md` に列挙し、原因分類と Phase 6 戻し要否を判定した
- [ ] 総合カバレッジ指数 180%+ を達成した
- [ ] `chunking-service.integration.test.ts` の Late Chunking 関連テストが PASS で回帰ゼロ
- [ ] カバレッジ未達成の場合の戻り先（Phase 6）を明記した

## タスク100%実行確認【必須】

- [ ] Task 1: coverage コマンド実行 完了
- [ ] Task 2: line / branch coverage 記録 完了
- [ ] Task 3: 統合テスト由来の coverage 寄与確認 完了
- [ ] Task 4: canonical artifacts 出力 完了

## Phase末端アクション【必須】

1. `outputs/phase-7/coverage-report.md` と `outputs/phase-7/uncovered-lines.md` の 2 成果物を作成し、`artifacts.json` の parity を確認する。
2. 総合カバレッジ指数 180%+ が未達成の場合は Phase 6 に戻り、未カバー分岐のテストを追加してから本 Phase を再実行する。
3. カバレッジ達成時は `index.md` の Phase 7 ステータスを `completed` に更新し、Phase 8（リファクタリング）に進む。
4. `LateChunkingService` / `ChunkingService` のいずれかにコード変更が発生した場合は、Phase 5 に戻らず Phase 7 を再実行する（テストのみの追加は Phase 6 扱い）。

## 依存関係

| 前提                                                   | 理由                                                       |
| ------------------------------------------------------ | ---------------------------------------------------------- |
| Phase 5（実装）完了                                    | 9 メソッドが `LateChunkingService.ts` に移動済みである必要 |
| Phase 6（テスト拡充）完了                              | SEP-01〜SEP-09 と委譲確認・フォールバックテストが全件 PASS |
| `pnpm --filter @repo/shared test` がエラーなく実行可能 | カバレッジ計測の前提                                       |
| `chunking-service.integration.test.ts` が PASS         | 回帰ゼロの前提                                             |

後続 Phase：Phase 8（リファクタリング）で JSDoc 付与と不要 import 削除、Phase 9（品質保証）で typecheck / lint / full test を実施する。
