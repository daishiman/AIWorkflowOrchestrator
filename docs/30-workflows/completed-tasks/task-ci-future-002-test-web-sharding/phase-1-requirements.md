# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 1                                    |
| 機能名 | task-ci-future-002-test-web-sharding |
| 作成日 | 2026-04-15                           |

## 目的

`test-web` ジョブのシャード化に向けて、現在の CI 並列数・実行時間・設定ファイルの状態を調査し、
受入基準（AC-1〜AC-6）と変更スコープを確定する。

**タスク分類**: docs-only タスク（CI ワークフロー修正に関する要件定義・調査ドキュメントの整備。Phase 1 では実装変更を行わない）

> **直列実行の原則**: Phase 1 が完了してから Phase 2 へ進む。Phase 2 が完了してから Phase 3 へ進む。
> 前の Phase の完了条件を満たさない限り、次の Phase に着手しないこと。

---

## Step 0: P50チェック【必須】

Phase 1 開始前に、対象ファイルの実装状態を確認し、既存設定との重複・齟齬を防止する。

```bash
# ci.yml の現在のジョブ構成とシャード設定を確認
grep -n "strategy:\|shard\|matrix" .github/workflows/ci.yml

# test-web ジョブの現在の設定を確認
grep -A 30 "test-web:" .github/workflows/ci.yml

# test-desktop のシャード数を確認（現在17）
grep -A 5 "shard:" .github/workflows/ci.yml

# 全ジョブの並列数合計を確認
grep -E "^\s+[a-z].*:$" .github/workflows/ci.yml | grep -v "name:\|runs-on:\|needs:\|if:\|env:\|steps:\|uses:\|with:"

# apps/web/vitest.config.ts の存在確認
ls apps/web/vitest.config.ts 2>/dev/null || echo "vitest.config.ts not found"

# apps/web/vitest.config.ts の内容確認
cat apps/web/vitest.config.ts 2>/dev/null || echo "file not found"
```

**確認事項**:

- [ ] `test-desktop` が 17 シャード構成であること（`.github/workflows/ci.yml` の matrix.shard 確認）
- [ ] `test-web` ジョブが単一ジョブ（matrix なし）で実行されていること
- [ ] 現在の並列数合計が `test-desktop(17) + typecheck(1) + test-shared(1) + e2e-desktop(1) = 20` であること
- [ ] `apps/web/vitest.config.ts` の存在と内容が確認できること
- [ ] `test-web` のシャード化に影響する設定（`pool`, `poolOptions` 等）が `vitest.config.ts` に含まれているか確認できること

---

## 実行タスク

- **タスク1**: P50チェック — 対象ファイルの現状実装状態を確認
- **タスク2**: 現在の CI 並列数を計算し、GitHub Free Tier 上限（20）との差分を文書化
- **タスク3**: `test-web` の現在の実行時間ベースラインを計測・記録
- **タスク4**: `apps/web/vitest.config.ts` の設定内容を確認し、シャード化への影響を洗い出す
- **タスク5**: 受入基準（AC-1〜AC-6）の定義と文書化

---

## 参照資料

| 資料名                            | パス                                                                                                       | 説明                                        |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| CI 設定ファイル                   | `.github/workflows/ci.yml`                                                                                 | 現在のジョブ構成・シャード設定確認対象      |
| Web アプリ Vitest 設定            | `apps/web/vitest.config.ts`                                                                                | シャード化影響確認対象                      |
| Desktop Vitest 設定（参考）       | `apps/desktop/vitest.config.ts`                                                                            | シャード化実装の参考（既に対応済み）        |
| TASK-CI-OPT-001 仕様書群          | `docs/30-workflows/completed-tasks/task-ci-optimization-001/`                                              | 前提タスク・ベースライン計測参考            |
| TASK-CI-OPT-001 タイミング計測    | `docs/30-workflows/completed-tasks/task-ci-optimization-001/outputs/phase-11/ci-timing-measurements.md`    | `test-desktop` シャード化のベースライン参考 |
| 発見元ドキュメント                | `docs/30-workflows/completed-tasks/task-ci-optimization-001/outputs/phase-12/unassigned-task-detection.md` | 本タスクの発見元                            |
| タスク指示書                      | `docs/30-workflows/unassigned-task/TASK-CI-FUTURE-002-test-web-sharding.md`                                | 本タスクの元指示書                          |
| Vitest シャーディングドキュメント | https://vitest.dev/guide/cli.html#shard                                                                    | `--shard` オプションの仕様                  |
| GitHub Actions matrix strategy    | https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs                                 | matrix 構文リファレンス                     |

---

## 実行手順

### ステップ1: CI 現状確認

```bash
# 1. ci.yml の全体構成を確認（ジョブ一覧と並列化設定）
grep -n "strategy:\|shard:\|matrix:\|name:" .github/workflows/ci.yml

# 2. test-web ジョブの詳細確認
grep -n -A 40 "test-web:" .github/workflows/ci.yml

# 3. test-desktop のシャード数確認（現在17）
grep -n -B 2 -A 5 "shard: \[" .github/workflows/ci.yml
```

**確認すべき事実**:

- `test-desktop` が `shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]` 構成であること
- `test-web` に `strategy: matrix:` セクションが存在しないこと
- 現在の並列数合計の計算式: `test-desktop(17) + typecheck(1) + test-shared(1) + e2e-desktop(1) = 20`（GitHub Free Tier 上限 20 ちょうど）

### ステップ2: test-web の実行時間ベースライン計測

```bash
# ローカルでの test-web 実行時間計測（ベースライン）
time pnpm --filter @repo/web test

# テスト件数の確認
pnpm --filter @repo/web test -- --reporter=verbose 2>&1 | tail -20
```

**把握すべき情報**:

- `test-web` の現在の合計テスト件数
- `test-web` の現在の実行時間（秒）
- GitHub Actions 上の実際の実行時間（CI ログから確認）

### ステップ3: apps/web/vitest.config.ts の確認

```bash
# vitest.config.ts の全内容確認
cat apps/web/vitest.config.ts

# シャード化と競合する可能性のある設定を確認
grep -n "pool\|poolOptions\|shard\|isolate\|threads\|forks" apps/web/vitest.config.ts
```

**確認観点**:

- `pool` の設定（`threads`, `forks`, `vmForks` 等）がシャードと競合するか
- `poolOptions` でワーカー数の上限が設定されているか
- グローバル状態を持つセットアップファイルが存在するか（`setupFiles`, `globalSetup` 等）

### ステップ4: 受入基準の確定

以下の受入基準を確定し、成果物として `outputs/phase-1/acceptance-criteria.md` に記録する。

**受入基準（AC-1〜AC-6）**:

| AC番号 | 基準                                                                                                                   | 検証方法                        |
| ------ | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| AC-1   | `test-web` ジョブが設定したシャード数（2〜4）に分割されて CI 上で実行される                                            | CI 実行ログ確認                 |
| AC-2   | 全シャードが CI 上で PASS する                                                                                         | CI 実行結果確認                 |
| AC-3   | `test-desktop + test-web + typecheck + test-shared + e2e-desktop` の並列数合計が GitHub Free Tier 上限 20 以内に収まる | 計算式検証 / CI ログ確認        |
| AC-4   | シャード化後の `test-web` 最長シャード実行時間がベースライン（単一ジョブ実行時間）を上回らない                         | 実行時間計測比較                |
| AC-5   | シャード数の計算根拠（`20 - (test-desktop + typecheck + test-shared + e2e-desktop)` の計算式と結果）が文書化されている | `outputs/phase-2/` の設計書確認 |
| AC-6   | 変更が CI 設定ファイル（`.github/workflows/ci.yml`）と `apps/web/vitest.config.ts`（必要な場合のみ）に限定されている   | `git diff` による変更範囲確認   |

### ステップ5: スコープ確定

**変更ファイル（実装）**:

| ファイル                    | 変更種別     | 変更内容                                                                                  |
| --------------------------- | ------------ | ----------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`  | 修正         | `test-web` ジョブに matrix シャード設定追加 / `test-desktop` シャード数削減（必要な場合） |
| `apps/web/vitest.config.ts` | 条件付き修正 | シャード化と競合する設定がある場合のみ修正                                                |

**スコープ外（変更しない）**:

- `apps/web/` 配下のアプリケーションコード
- E2E テスト（Playwright）の設定
- `apps/desktop/` 配下のコード
- GitHub Actions の有料ランナー設定

---

## 統合テスト連携

- `test-web` シャード化後の全シャード PASS 確認を Phase 4（ローカル動作検証）・Phase 5（CI 動作検証）で実施
- 並列数合計の計算結果を Phase 2 設計に引き継ぐ
- `apps/web/vitest.config.ts` の競合設定調査結果を Phase 2 設計に引き継ぐ

---

## 多角的チェック観点（AIが判断）

### システム系

- **因果ループ**: テスト数増加 → `test-web` 単一ジョブの実行時間増大 → CI パイプライン全体のボトルネック → 開発フィードバックサイクルの長期化（強化ループ）
- **並列上限制約**: GitHub Free Tier の 20 並列上限は `test-desktop` のシャード数削減なしには `test-web` のシャード追加ができない。トレードオフの文書化が必要
- **責務境界**: シャード数の計算責務は「Phase 2 設計」に委譲。Phase 1 は「何が必要か」のみを確定する

### 価値・コスト系

- **価値**: `test-web` シャード化により将来のテスト数増加時のスケーラビリティを確保できる
- **コスト**: 変更ファイルは最小限（CI 設定ファイルのみ）。ただし `test-desktop` シャード数削減が必要な場合は TASK-CI-OPT-001 の実績への影響評価が必要
- **トレードオフ**: `test-desktop` シャード数削減 → `test-desktop` の実行時間増加リスク。TASK-CI-OPT-001 の目標時間（7 分 40 秒）を超えないことを Phase 4/5 で確認する

### 問題解決系

- **優先順位**: AC-3（並列上限遵守）と AC-5（計算根拠文書化）が最重要。計算を誤ると CI が全ジョブ待ちになる
- **リスク**: `test-desktop` シャード数削減で `test-desktop` の実行時間が TASK-CI-OPT-001 の目標を超過するリスク

---

## サブタスク管理

| ID     | タスク名                          | 担当 | ステータス |
| ------ | --------------------------------- | ---- | ---------- |
| T-01-1 | P50チェック実行                   | -    | 未実施     |
| T-01-2 | CI 並列数計算・上限差分の文書化   | -    | 未実施     |
| T-01-3 | test-web 実行時間ベースライン計測 | -    | 未実施     |
| T-01-4 | vitest.config.ts の設定内容確認   | -    | 未実施     |
| T-01-5 | 受入基準 AC-1〜AC-6 の定義        | -    | 未実施     |

---

## 成果物

| 成果物                      | 配置先                                          | 形式     |
| --------------------------- | ----------------------------------------------- | -------- |
| 受入基準ドキュメント        | `outputs/phase-1/acceptance-criteria.md`        | Markdown |
| P50チェック結果             | `outputs/phase-1/p50-check-result.md`           | Markdown |
| 並列数計算シート            | `outputs/phase-1/parallel-count-calculation.md` | Markdown |
| test-web ベースライン計測値 | `outputs/phase-1/baseline-timing.md`            | Markdown |
| vitest.config.ts 確認結果   | `outputs/phase-1/vitest-config-review.md`       | Markdown |

---

## 完了条件

- [ ] P50チェックを実行し、`test-web` ジョブが単一ジョブ（matrix なし）で実行されていることを確認済みであること
- [ ] 現在の並列数合計が 20 であることを計算式で確認済みであること（`test-desktop(17) + typecheck(1) + test-shared(1) + e2e-desktop(1) = 20`）
- [ ] `test-web` の実行時間ベースライン（秒）が記録されていること
- [ ] `apps/web/vitest.config.ts` の設定内容が確認済みで、シャード化への影響が評価済みであること
- [ ] 受入基準 AC-1〜AC-6 が全て定義・文書化されていること
- [ ] `outputs/phase-1/` に全成果物が生成されていること

---

## タスク100%実行確認【必須】

Phase 1 完了時に以下を確認して記録すること:

- [ ] T-01-1: P50チェックを実行し `outputs/phase-1/p50-check-result.md` に記録済み
- [ ] T-01-2: 並列数計算結果を `outputs/phase-1/parallel-count-calculation.md` に記録済み
- [ ] T-01-3: test-web ベースライン実行時間を `outputs/phase-1/baseline-timing.md` に記録済み
- [ ] T-01-4: vitest.config.ts 確認結果を `outputs/phase-1/vitest-config-review.md` に記録済み
- [ ] T-01-5: 受入基準 AC-1〜AC-6 を `outputs/phase-1/acceptance-criteria.md` に記録済み

---

## 次Phase

**Phase 2: シャード数設計** — Phase 1 で確認した並列数合計を基に、`test-web` に割り当て可能なシャード数を計算し、`ci.yml` 修正設計を確定する。

**ゲート条件**: Phase 1 の全完了条件を満たさない場合、Phase 2 へ進まないこと。
