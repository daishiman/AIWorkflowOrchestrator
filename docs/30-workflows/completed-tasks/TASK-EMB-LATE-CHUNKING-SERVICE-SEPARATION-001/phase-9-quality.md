# Phase 9: 品質保証

## メタ情報

| 項目       | 値                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| Phase      | 9                                                                                                       |
| タスクID   | TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001                                                           |
| タスク種別 | NON_VISUAL code task                                                                                    |
| 目的       | typecheck / lint / full test / targeted test の 4 系統で品質ゲートを判定し、Phase 10 進行可否を決定する |
| 前Phase    | phase-8-refactoring.md                                                                                  |
| 次Phase    | phase-10-final-review.md                                                                                |

> current fact: quality gate の主対象は `ChunkingLateChunkingAdapter` / `chunking-service.ts` / 関連テスト。

## 目的

Phase 5〜8 で実施した 9 メソッド抽出・委譲配線・テスト拡充・リファクタの総合品質を、決定論的に計測可能な 4 系統のコマンド実行で検証する。品質ゲート 4 項目（lint error 0 / type error 0 / test fail 0 / coverage 180%+）をすべて満たした場合のみ Phase 10 に進む。`any` 型の新規使用ゼロを独立ゲートとして設ける。

## 実行タスク

- タスク1: `typecheck` 実行と型エラーゼロ確認
- タスク2: `lint` 実行と lint エラーゼロ確認
- タスク3: `full test` 実行と全件 PASS 確認
- タスク4: `LateChunkingService` targeted test 実行
- タスク5: `chunking-service.integration` targeted test 実行
- タスク6: `any` 型新規使用ゼロチェック
- タスク7: 品質ゲート 4 項目判定と Phase 10 進行可否決定
- タスク8: Canonical Artifacts（`quality-gate-report.md` / `command-execution-log.md`）の出力

## 実行手順

### ステップ1: TypeScript 型チェック

```bash
pnpm --filter @repo/shared typecheck
```

| 確認項目                         | 期待結果                                                                         |
| -------------------------------- | -------------------------------------------------------------------------------- |
| `LateChunkingService.ts` 型整合  | エラーゼロ                                                                       |
| `chunking-service.ts` 委譲型整合 | `lateChunkingService?: LateChunkingService` がオプショナル引数として正しく型付け |
| `chunking/types.ts` からの参照   | 一方向参照（embedding → chunking）で `tsc` がエラーにしない                      |
| 循環参照                         | `tsc` が循環 import を検出しない                                                 |

エラー発生時は、エラーメッセージ・該当ファイル・該当行を `command-execution-log.md` に記録し、Phase 5 または Phase 8 に戻す。

### ステップ2: ESLint

```bash
pnpm --filter @repo/shared lint
```

| 確認項目                                     | 期待結果                                    |
| -------------------------------------------- | ------------------------------------------- |
| `LateChunkingService.ts` lint                | error 0 / warning 0 想定（warning は容認）  |
| `__tests__/LateChunkingService.test.ts` lint | error 0                                     |
| `chunking-service.ts` lint                   | error 0（Phase 8 リファクタ後の状態）       |
| `any` 型新規使用                             | `@typescript-eslint/no-explicit-any` で検知 |

### ステップ3: 全テスト実行

```bash
pnpm --filter @repo/shared test
```

| 確認項目                                         | 期待結果                                                    |
| ------------------------------------------------ | ----------------------------------------------------------- |
| `@repo/shared` 配下の全 vitest テスト PASS       | test fail 0                                                 |
| SEP-01〜SEP-09 PASS                              | 全件 PASS                                                   |
| 委譲確認テスト / フォールバックテスト PASS       | 全件 PASS                                                   |
| 既存 `chunking-service.integration.test.ts` PASS | 全件 PASS（回帰ゼロ）                                       |
| 実行時間                                         | `command-execution-log.md` にタイムスタンプと経過秒数を記録 |

### ステップ4: `LateChunkingService` targeted test

```bash
pnpm --filter @repo/shared test -- LateChunkingService
```

| 確認項目                 | 期待結果 |
| ------------------------ | -------- |
| SEP-01 単一チャンク mean | PASS     |
| SEP-02 複数チャンク cls  | PASS     |
| SEP-03 先頭境界          | PASS     |
| SEP-04 末尾境界          | PASS     |
| SEP-05 mean pooling      | PASS     |
| SEP-06 フォールバック    | PASS     |
| SEP-07 attention pooling | PASS     |

### ステップ5: `chunking-service.integration` targeted test

```bash
pnpm --filter @repo/shared test -- chunking-service.integration
```

| 確認項目                                          | 期待結果          |
| ------------------------------------------------- | ----------------- |
| SEP-08 委譲確認（`lateChunking.enabled=true`）    | PASS              |
| SEP-09 非適用確認（`lateChunking.enabled=false`） | PASS              |
| 既存 Late Chunking 統合テスト                     | 委譲後も全件 PASS |
| 既存 `ChunkingService` 基本チャンキングテスト     | 回帰ゼロ          |

### ステップ6: `any` 型新規使用ゼロチェック

Phase 5 以降に追加された差分範囲で `any` 型を新規使用していないことを確認する。

```bash
# 差分範囲の any 使用検出
git diff main...HEAD -- 'packages/shared/src/services/embedding/late-chunking/**/*.ts' 'packages/shared/src/services/chunking/chunking-service.ts' | grep -nE "^\+.*: any\b|^\+.*as any\b"
```

| 確認項目                                    | 判定基準                                 |
| ------------------------------------------- | ---------------------------------------- |
| 新規追加行での `: any` 使用                 | ゼロ件                                   |
| 新規追加行での `as any` 使用                | ゼロ件                                   |
| `unknown` 型は許容                          | 型安全性を保つための暫定キャストとして可 |
| ESLint `@typescript-eslint/no-explicit-any` | 全差分ファイルで警告ゼロ                 |

検出された場合は Phase 8 に戻し、`unknown` や具体的な型に置き換える。

### ステップ7: 品質ゲート判定

下記 4 ゲート + 独立ゲート 1 の合計 5 項目をすべて満たすことを確認する。

| ゲート   | 基準                                               | 判定方法                                    |
| -------- | -------------------------------------------------- | ------------------------------------------- |
| lint     | error 0                                            | ステップ 2 の出力                           |
| type     | error 0                                            | ステップ 1 の出力                           |
| test     | fail 0                                             | ステップ 3・4・5 の統合                     |
| coverage | 総合カバレッジ指数 180%+（Phase 7 の計測を再利用） | `outputs/phase-7/coverage-report.md` を参照 |
| any 型   | 新規使用ゼロ                                       | ステップ 6 の出力                           |

補足: `coverage 180%+` は本リポジトリの複合指標として扱い、line / branch / function coverage の代替ではなく補助指標として併記する。

いずれかが未達成の場合、戻り先を以下で判定する。

| 未達成ゲート | 戻り先  | 理由                             |
| ------------ | ------- | -------------------------------- |
| lint         | Phase 8 | リファクタで解消可能な軽微な指摘 |
| type         | Phase 5 | 型設計の見直しが必要             |
| test         | Phase 6 | テスト追加・修正が必要           |
| coverage     | Phase 6 | 未カバー分岐のテスト追加         |
| any 型       | Phase 8 | 型リファインで対応可能           |

### ステップ8: 実行ログ記録

各コマンドの実行タイムスタンプ・経過秒数・終了コード・標準出力の末尾 50 行を `command-execution-log.md` に時系列で記録する。

## 品質ゲート基準

### 機能検証

| 項目                                           | 基準                                                        |
| ---------------------------------------------- | ----------------------------------------------------------- |
| `ChunkingService.chunk()` 入出力シグネチャ不変 | 既存統合テスト全件 PASS で担保                              |
| Late Chunking 委譲動作                         | SEP-08（委譲ヒット）/ SEP-09（非適用）で担保                |
| pooling 戦略 3 種                              | SEP-05 / SEP-01 / SEP-07 で mean / cls / attention 全て検証 |
| フォールバック動作                             | SEP-06 で最近傍セグメント戻しを検証                         |

### コード品質

| 項目             | 基準                                                |
| ---------------- | --------------------------------------------------- |
| 型エラー         | 0 件                                                |
| lint エラー      | 0 件                                                |
| `any` 型新規使用 | 0 件（差分範囲）                                    |
| JSDoc カバレッジ | クラス + public 3 メソッドで 100%（Phase 8 で担保） |
| 循環 import      | `tsc` / ESLint 両方で検出ゼロ                       |

### テスト網羅性

| 項目                                   | 基準                     |
| -------------------------------------- | ------------------------ |
| SEP-01〜SEP-09                         | 全件 PASS                |
| `LateChunkingService` Line Coverage    | 各メソッド 100%          |
| `LateChunkingService` Branch Coverage  | public 3 メソッドで 90%+ |
| 総合カバレッジ指数                     | 180%+                    |
| `chunking-service.integration.test.ts` | 回帰ゼロ                 |

### セキュリティ

| 項目                                          | 基準                                                                              |
| --------------------------------------------- | --------------------------------------------------------------------------------- |
| 外部入力の境界                                | `text` / `chunks` に対する境界検証が既存 `ChunkingService` 側で済み、委譲後も同一 |
| `embeddingClient` 未注入時の挙動              | 例外ではなく元の `chunks` を返すフォールバックで安全に劣化                        |
| `LateChunkingOptions` の `poolingStrategy` 値 | `"mean" \| "cls" \| "attention"` のユニオン型で不正値を型で排除                   |
| エラーハンドリング                            | トークナイザー例外時に `ChunkingService` 側で catch されることを確認              |

## 統合テスト連携

- 品質ゲートの `test` には `chunking-service.integration.test.ts` を必ず含める。
- Phase 7 の coverage 結果では、統合テスト由来で到達する委譲分岐を明示的に扱う。
- Phase 10 の最終レビューでは、本 Phase の統合テスト実測値を evidence として再利用する。

## 参照資料

| 参照資料                   | パス                                                                         | 内容                                |
| -------------------------- | ---------------------------------------------------------------------------- | ----------------------------------- |
| Phase 7 カバレッジレポート | `outputs/phase-7/coverage-report.md`                                         | 総合カバレッジ指数 180%+ の計測結果 |
| Phase 8 リファクタ判断ログ | `outputs/phase-8/refactor-decision-log.md`                                   | リファクタ後の状態記録              |
| Phase 8 JSDoc カバレッジ   | `outputs/phase-8/jsdoc-coverage.md`                                          | JSDoc 必達達成状況                  |
| 品質基準                   | `.claude/skills/task-specification-creator/references/quality-standards.md`  | 品質ゲートの正本                    |
| カバレッジ基準             | `.claude/skills/task-specification-creator/references/coverage-standards.md` | カバレッジ閾値の正本                |

## Canonical Artifacts

| 成果物             | パス                                       | 内容                                                       |
| ------------------ | ------------------------------------------ | ---------------------------------------------------------- |
| 品質ゲートレポート | `outputs/phase-9/quality-gate-report.md`   | 5 ゲートの判定結果と Phase 10 進行可否                     |
| コマンド実行ログ   | `outputs/phase-9/command-execution-log.md` | 各コマンドのタイムスタンプ・経過秒数・終了コード・出力末尾 |

## 成果物

| 成果物             | パス                                       | 説明                                              |
| ------------------ | ------------------------------------------ | ------------------------------------------------- |
| 品質ゲートレポート | `outputs/phase-9/quality-gate-report.md`   | lint / type / test / coverage / any 型の 5 ゲート |
| コマンド実行ログ   | `outputs/phase-9/command-execution-log.md` | 決定論的な証跡（実行時刻・終了コード）            |

## 完了条件

- [ ] `pnpm --filter @repo/shared typecheck` が終了コード 0 で完了した
- [ ] `pnpm --filter @repo/shared lint` が error 0 で完了した
- [ ] `pnpm --filter @repo/shared test` が test fail 0 で完了した
- [ ] `pnpm --filter @repo/shared test -- LateChunkingService` で SEP-01〜SEP-07 全件 PASS
- [ ] `pnpm --filter @repo/shared test -- chunking-service.integration` で SEP-08 / SEP-09 および既存統合テスト PASS
- [ ] 差分範囲で `any` 型の新規使用がゼロ件
- [ ] 総合カバレッジ指数 180%+ が Phase 7 時点から維持されている
- [ ] 品質ゲート 5 項目（lint / type / test / coverage / any）すべて PASS
- [ ] `outputs/phase-9/quality-gate-report.md` に 5 ゲートの判定結果が記録されている
- [ ] `outputs/phase-9/command-execution-log.md` に各コマンドのタイムスタンプ・終了コード・出力末尾が記録されている
- [ ] 未達成ゲートがない（検出時は戻り先が明記されている）
- [ ] 機能検証 4 項目（入出力不変 / 委譲 / pooling 3 種 / fallback）が担保されている
- [ ] コード品質 5 項目（型 / lint / any / JSDoc / 循環 import）が担保されている
- [ ] テスト網羅性 5 項目（SEP / Line / Branch / 総合指数 / 統合回帰）が担保されている
- [ ] セキュリティ 4 項目（入力境界 / 未注入時劣化 / strategy 値 / 例外）が担保されている

## タスク100%実行確認【必須】

- [ ] Task 1: typecheck 実行 完了
- [ ] Task 2: lint 実行 完了
- [ ] Task 3: full test / targeted test 実行 完了
- [ ] Task 4: `any` 型新規使用ゼロ確認 完了
- [ ] Task 5: quality gate 判定と成果物出力 完了

## Phase末端アクション【必須】

1. `outputs/phase-9/quality-gate-report.md` に 5 ゲート（lint / type / test / coverage / any）の判定結果・実行コマンド・出力要約を記録する。
2. `outputs/phase-9/command-execution-log.md` に各コマンドのタイムスタンプ・経過秒数・終了コード・標準出力末尾 50 行を時系列で記録する。
3. `artifacts.json` と `outputs/` の parity を確認し、`index.md` の Phase 9 ステータスを `completed` に更新する。
4. 未達成ゲートが発生した場合は、戻り先ルールに従い Phase 5/6/8 のいずれかに差し戻す。戻し内容を `quality-gate-report.md` の「戻し判定」セクションに記録する。
5. 全ゲート PASS の場合のみ Phase 10（最終レビュー）に進む。

## 依存関係

| 前提                                                                 | 理由                                                                    |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Phase 8（リファクタリング）完了                                      | JSDoc 付与・不要 import 削除・`beforeEach` 集約後の状態で品質を計測する |
| Phase 7 の総合カバレッジ指数 180%+                                   | coverage ゲートの判定に使用                                             |
| `pnpm --filter @repo/shared` が `typecheck` / `lint` / `test` を提供 | コマンド実行の前提                                                      |
| 差分ベースライン `main` ブランチへのアクセス                         | `any` 型新規使用検出の比較元                                            |

後続 Phase：Phase 10（最終レビュー）で Phase 2 設計事項 1〜4 の実装反映・SEP-01〜SEP-09 全件 PASS・9 メソッド完全除去・単独テスト可能性の 4 観点を最終確認する。
