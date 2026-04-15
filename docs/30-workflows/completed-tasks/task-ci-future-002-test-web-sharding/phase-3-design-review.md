# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 3                                    |
| 機能名 | task-ci-future-002-test-web-sharding |
| 作成日 | 2026-04-15                           |

## 目的

Phase 2 で確定した設計（シャード数・`ci.yml` 修正内容・`vitest.config.ts` 修正要否）を多角的にレビューし、
PASS / MINOR / MAJOR を判定して Phase 4（実装）への進行可否を決定する。

> **直列実行の原則**: Phase 1・Phase 2 の全完了条件を満たしてから本 Phase に着手すること。
> Phase 3 のレビュー判定が「PASS」または「MINOR のみ」の場合のみ Phase 4 へ進む。

---

## 実行タスク

- **タスク1**: 並列数合計の最終検証（計算式の正確性確認）
- **タスク2**: `test-desktop` シャード数削減による実行時間への影響確認
- **タスク3**: `ci.yml` 修正内容の構文・設計整合性チェック
- **タスク4**: `vitest.config.ts` 修正設計のリスク確認（修正が必要な場合）
- **タスク5**: PASS / MINOR / MAJOR 判定と Phase 4 進行可否の確定

---

## 参照資料

| 資料名                            | パス                                                                                                    | 説明                          |
| --------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Phase 1 受入基準                  | `outputs/phase-1/acceptance-criteria.md`                                                                | AC-1〜AC-6 との照合           |
| Phase 1 並列数計算シート          | `outputs/phase-1/parallel-count-calculation.md`                                                         | 計算根拠の検証元データ        |
| Phase 1 ベースライン計測値        | `outputs/phase-1/baseline-timing.md`                                                                    | AC-4 検証のベースライン       |
| Phase 2 シャード数設計書          | `outputs/phase-2/shard-count-design.md`                                                                 | レビュー対象設計（主要）      |
| Phase 2 test-desktop 削減影響評価 | `outputs/phase-2/desktop-shard-impact.md`                                                               | test-desktop 実行時間への影響 |
| Phase 2 ci.yml 修正差分イメージ   | `outputs/phase-2/ci-yml-diff-preview.md`                                                                | 修正内容の構文確認            |
| Phase 2 vitest.config.ts 判断結果 | `outputs/phase-2/vitest-config-decision.md`                                                             | 修正要否とその理由            |
| CI 設定ファイル                   | `.github/workflows/ci.yml`                                                                              | 現在の設定（比較対象）        |
| TASK-CI-OPT-001 タイミング計測    | `docs/30-workflows/completed-tasks/task-ci-optimization-001/outputs/phase-11/ci-timing-measurements.md` | 7 分 40 秒目標の根拠          |

---

## 実行手順

### ステップ1: 並列数合計の最終検証

Phase 2 で選択した対応案（A/B/C）の計算式を最終確認する。

```bash
# ci.yml の現在のシャード設定を確認
grep -n "shard: \[" .github/workflows/ci.yml

# Phase 2 設計後の並列数合計を計算
# 例: 対応案 A（test-desktop 15 + test-web 2）
echo "test-desktop: 15, test-web: 2, typecheck: 1, test-shared: 1, e2e-desktop: 1"
echo "合計: $((15 + 2 + 1 + 1 + 1)) (上限: 20)"
```

**確認チェックリスト**:

- [ ] `test-desktop(N) + test-web(M) + typecheck(1) + test-shared(1) + e2e-desktop(1) <= 20` が成立すること
- [ ] `N + M = 17`（test-desktop 削減分 = test-web 追加分）の関係式が成立すること
- [ ] `lint`・`build-shared`・`check-module-sync`・`security`・`coverage`・`build` ジョブが並列数計算に含まれていないことを確認（これらは `needs` による直列実行のため同時実行されない）

**並列数最終検証テーブル**:

| ジョブ       | シャード数（設計値） | 備考                          |
| ------------ | -------------------- | ----------------------------- |
| test-desktop | TBD（Phase 2 決定）  | 17 から削減                   |
| test-web     | TBD（Phase 2 決定）  | 新規追加                      |
| typecheck    | 1                    | 変更なし                      |
| test-shared  | 1                    | 変更なし                      |
| e2e-desktop  | 1                    | 変更なし                      |
| **合計**     | **TBD**              | **20 以内であること（AC-3）** |

### ステップ2: test-desktop シャード数削減の実行時間影響確認

```bash
# Phase 2 で決定した削減後のシャード数でローカル実行時間を計測
# 例: 15 シャードの場合
time pnpm --filter @repo/desktop exec vitest run --shard=1/15
time pnpm --filter @repo/desktop exec vitest run --shard=8/15
time pnpm --filter @repo/desktop exec vitest run --shard=15/15
```

**影響評価チェックリスト**:

- [ ] `test-desktop` の最長シャード実行時間が TASK-CI-OPT-001 の目標（7 分 40 秒）以内であること
- [ ] シャード削減によるテストファイル/シャードの分散が均等であること（特定シャードへの偏りがないこと）
- [ ] `test-desktop` の全テストが削減後シャード数でも実行されること（テストの取りこぼしがないこと）

**実行時間比較テーブル（Phase 3 で確定）**:

| 項目                          | 変更前（17 シャード） | 変更後（N シャード） | 合格基準         |
| ----------------------------- | --------------------- | -------------------- | ---------------- |
| test-desktop 最長シャード時間 | Phase 1 計測値        | Phase 3 計測値       | 7 分 40 秒以内   |
| test-desktop テスト合計件数   | Phase 1 計測値        | Phase 3 計測値       | 変更なし（一致） |

### ステップ3: ci.yml 修正内容の構文・設計整合性チェック

Phase 2 の `ci-yml-diff-preview.md` に記載した修正内容を以下の観点でレビューする。

```bash
# 修正設計の構文確認（YAML の構造チェック）
# Phase 2 の設計に従い ci.yml を仮修正した場合の確認コマンド
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "YAML syntax OK"

# test-web ジョブの matrix 設定確認
grep -A 20 "test-web:" .github/workflows/ci.yml

# shard 数と実行コマンドの N が一致しているか確認
grep -n "shard" .github/workflows/ci.yml
```

**構文・設計整合性チェックリスト**:

- [ ] `strategy.fail-fast: false` が設定されていること（一部シャード失敗時も全シャードを完走させるため）
- [ ] `matrix.shard` の配列要素数と実行コマンドの `/N`（総シャード数）が一致していること
- [ ] `test-desktop` の実行コマンド（`--shard=${{ matrix.shard }}/N`）の `N` が削減後のシャード数に更新されていること
- [ ] `test-web` ジョブに `needs: [build-shared]` が含まれていること
- [ ] `test-web` ジョブが `build` ジョブの `needs` に追加されていること（CI 全体のゲートとして機能するため）
- [ ] `timeout-minutes` が適切な値に設定されていること（`test-web` のベースライン実行時間 + 余裕）
- [ ] `NODE_OPTIONS`・`CI` 等の環境変数が `test-desktop` と同様に設定されていること

### ステップ4: vitest.config.ts 修正設計のリスク確認

Phase 2 で `vitest.config.ts` の修正が「不要」と判断された場合はスキップ可。

修正が必要と判断された場合:

```bash
# 現在の vitest.config.ts と修正設計を比較
cat apps/web/vitest.config.ts

# 修正後の動作確認（ローカル）
pnpm --filter @repo/web exec vitest run --shard=1/2 --reporter=verbose
```

**リスク確認チェックリスト（修正が必要な場合）**:

- [ ] `vitest.config.ts` の修正が `test-web` の既存テスト動作に影響しないこと
- [ ] 修正後に単一実行（`--shard` なし）でも正常に動作すること
- [ ] 修正が `apps/web/vitest.config.ts` のみに限定されていること（AC-6 遵守）

### ステップ5: simpler alternative の検討

より単純な代替案を検討し、採用しない理由を記録する。

| 代替案                                                | 検討結果                                               |
| ----------------------------------------------------- | ------------------------------------------------------ |
| `test-web` のタイムアウトを延長するだけで対応する     | 否定: 根本的なスケーラビリティ問題を解決しない         |
| `test-desktop` シャード数を削減せず `test-web` を追加 | 否定: GitHub Free Tier 上限 20 を超過する（AC-3 違反） |
| `test-web` を `test-desktop` に統合する               | 否定: 責務が異なる。スコープ外かつリスクが高い         |
| GitHub 有料プランに移行して上限を引き上げる           | 否定: コスト増加。本タスクのスコープ外                 |

---

## レビュー判定

### PASS / MINOR / MAJOR 判定基準

| 判定  | 条件                                                                                           |
| ----- | ---------------------------------------------------------------------------------------------- |
| PASS  | 全チェック項目が OK。Phase 4（実装）へ進む                                                     |
| MINOR | 軽微な指摘あり（コメント追記・変数名調整等）。Phase 4 継続可。Phase 9/10 で解決予定            |
| MAJOR | 設計の根本的問題（並列上限超過・YAML 構文エラー・test-desktop 目標時間超過等）。Phase 2 へ戻る |

### レビューチェックリスト

**並列数制約（AC-3 対応）**:

- [ ] 選択した対応案の並列数合計が `<= 20` であることが計算式で証明されていること
- [ ] 計算式が `outputs/phase-2/shard-count-design.md` に記録されていること（AC-5 対応）
- [ ] `lint`・`build`・`coverage` 等の非テストジョブが計算に含まれていないことが確認済みであること

**実行時間（AC-4 対応）**:

- [ ] `test-web` のシャード化後の最長シャード実行時間がベースラインを上回らないことが設計上確認されていること
- [ ] `test-desktop` のシャード数削減後の最長シャード実行時間が 7 分 40 秒以内であることが評価済みであること

**構文・設定整合性**:

- [ ] `ci.yml` の YAML 構文が正しいこと
- [ ] matrix.shard の配列数と実行コマンドの総シャード数が一致していること
- [ ] `fail-fast: false` が設定されていること

**スコープ制限（AC-6 対応）**:

- [ ] 変更が `.github/workflows/ci.yml` と `apps/web/vitest.config.ts`（必要な場合のみ）に限定されていること
- [ ] `apps/web/` のアプリケーションコードへの変更がないこと
- [ ] E2E テスト・有料ランナー設定への変更がないこと

### MINOR 追跡テーブル

Phase 3 で MINOR 判定された指摘を追跡する（指摘がある場合のみ記入）:

| MINOR ID | 指摘内容                 | 解決予定 Phase | 解決確認 Phase | 備考 |
| -------- | ------------------------ | -------------- | -------------- | ---- |
| CI-M-01  | （指摘がある場合に記入） | -              | Phase 9/10     | -    |

### MAJOR 問題の分類

Phase 3 で MAJOR 判定が発生した場合の対応方針:

| MAJOR 問題                                          | 戻り先  | 対応方針                                                                 |
| --------------------------------------------------- | ------- | ------------------------------------------------------------------------ |
| 並列数合計が 20 を超過している                      | Phase 2 | シャード数を再計算し、対応案を選び直す                                   |
| `test-desktop` の実行時間が 7 分 40 秒を超過する    | Phase 2 | `test-desktop` シャード数の削減量を最小化する対応案を再検討する          |
| `ci.yml` の YAML 構文エラー                         | Phase 2 | 修正差分イメージを修正してから再レビューする                             |
| `vitest.config.ts` 修正がテスト動作に悪影響を与える | Phase 2 | 修正設計を見直すか、修正不要な方法（CLI オプションのみで対応）を採用する |
| `test-web` の全シャードでテストが取りこぼされる     | Phase 2 | シャード分割の設定に誤りがないか確認する                                 |

---

## 統合テスト連携

- Phase 3 のレビュー判定（PASS/MINOR/MAJOR）を `outputs/phase-3/design-review-result.md` に記録
- PASS または MINOR のみの場合、Phase 4（実装）の着手を承認
- MAJOR が存在する場合、Phase 2 へ戻り設計を修正してから再度 Phase 3 レビューを実施

---

## 多角的チェック観点（AIが判断）

### CI の並列数上限の考え方

- GitHub Free Tier の並列上限は「同時実行中のジョブ数」のカウントによる
- `needs` で待機中のジョブ（例: `build` ジョブが `test-web` の完了を待つ）は並列数にカウントされない
- `strategy.matrix` で展開される各シャードはそれぞれ 1 ジョブとしてカウントされる
- したがって、テストジョブ（`test-desktop` + `test-web` + `typecheck` + `test-shared` + `e2e-desktop`）の同時実行数が最大になるタイミングでの合計が 20 以内であれば良い

### 設計の一貫性

- `test-desktop` の設計（`fail-fast: false`・`NODE_OPTIONS`・`CI=true`）を `test-web` でも踏襲することで、将来の保守性を確保する
- コメント記法（`# TASK-CI-FUTURE-002:` から始まる理由コメント）を `test-desktop` のコメント形式（`# CI Optimization (TASK-CI-OPT-001):` 等）と統一する

### 将来のスケーラビリティ

- `test-web` のテスト数が今後増加した場合に再シャード化が容易であること（設計の拡張性）
- `test-desktop` のシャード数をさらに削減すれば `test-web` のシャード数を増やせる余地が残ること

---

## サブタスク管理

| ID     | タスク名                              | ステータス |
| ------ | ------------------------------------- | ---------- |
| T-03-1 | 並列数合計の最終検証                  | 未実施     |
| T-03-2 | test-desktop 削減影響の実行時間確認   | 未実施     |
| T-03-3 | ci.yml 修正内容の構文・整合性チェック | 未実施     |
| T-03-4 | vitest.config.ts 修正リスク確認       | 未実施     |
| T-03-5 | PASS/MINOR/MAJOR 判定と進行可否確定   | 未実施     |

---

## 成果物

| 成果物                 | 配置先                                    | 形式     |
| ---------------------- | ----------------------------------------- | -------- |
| 設計レビュー結果       | `outputs/phase-3/design-review-result.md` | Markdown |
| 並列数最終検証テーブル | `outputs/phase-3/parallel-count-final.md` | Markdown |
| MINOR 追跡テーブル     | `outputs/phase-3/minor-tracking.md`       | Markdown |

---

## 完了条件

- [ ] 並列数合計が `<= 20` であることが計算式で最終確認済みであること
- [ ] `test-desktop` シャード数削減後の実行時間が 7 分 40 秒以内であることが確認済みであること
- [ ] `ci.yml` 修正内容の YAML 構文が正しいことが確認済みであること
- [ ] matrix.shard 配列数と実行コマンドの総シャード数が一致していることが確認済みであること
- [ ] レビュー判定（PASS/MINOR/MAJOR）が確定し、`outputs/phase-3/design-review-result.md` に記録済みであること
- [ ] Phase 4 開始条件（「PASS」または「MINOR のみ」）が明示的に確定していること
- [ ] `outputs/phase-3/` に全成果物が生成されていること

---

## タスク100%実行確認【必須】

- [ ] T-03-1: 並列数最終検証テーブルを `outputs/phase-3/parallel-count-final.md` に記録済み
- [ ] T-03-2: `test-desktop` 削減影響の実行時間確認を `outputs/phase-3/design-review-result.md` に記録済み
- [ ] T-03-3: `ci.yml` 修正内容の構文・整合性チェック結果を記録済み
- [ ] T-03-4: `vitest.config.ts` 修正リスク確認を記録済み（不要な場合は「スキップ（修正不要と判断）」と記録）
- [ ] T-03-5: レビュー判定（PASS/MINOR/MAJOR）を明示的に記録済み（例: 「PASS: Phase 4 へ進む」等）
- [ ] MINOR 追跡テーブルを `outputs/phase-3/minor-tracking.md` に記録済み（指摘なしの場合は「なし」と記録）

---

## 次Phase

**Phase 4: 実装** — Phase 3 のレビューで PASS（または MINOR のみ）が確認された後、
`.github/workflows/ci.yml` を修正し、`apps/web/vitest.config.ts` は差分が必要な場合のみ修正する。

**Phase 4 開始条件**: 本 Phase のレビュー判定が「PASS」または「MINOR のみ」であること。
**Phase 4 blocked 条件**: MAJOR 判定が 1 件でも残存している場合は実装に着手しないこと。Phase 2 へ戻ること。
